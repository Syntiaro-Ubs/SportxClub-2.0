import cron from "node-cron";
import { getPool } from "../db.js";
import { initiateTurfOwnerPayout } from "../payment/cashfree-payout-service.js";
import {
  sendDailyOwnerSettlementReport,
  sendDailyAdminSettlementSummary,
} from "./booking-email-service.js";

/**
 * Normalizes date into YYYY-MM-DD for consistent database querying
 */
export function getTodayDateString(dateObj = new Date()) {
  // Use Indian Standard Time (Asia/Kolkata)
  const istDateStr = dateObj.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  return istDateStr; // Returns YYYY-MM-DD
}

/**
 * Returns the date of the day that just concluded (Yesterday for midnight runs)
 */
export function getCompletedDayDateString(dateObj = new Date()) {
  const d = new Date(dateObj);
  d.setDate(d.getDate() - 1);
  const istDateStr = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  return istDateStr; // Returns YYYY-MM-DD of the concluded match day
}

/**
 * Main settlement processor: Groups confirmed slot bookings for a completed date,
 * executes automated bank transfers via Cashfree Payouts, and sends daily reports.
 * 
 * @param {string} targetDate - Date in 'YYYY-MM-DD' format.
 */
export async function processDailyTurfSettlements(targetDate = null) {
  const processDate = targetDate || getTodayDateString();
  console.log(`\n========================================================================`);
  console.log(`[MIDNIGHT PAYOUT ENGINE] 🚀 Starting automated settlements for date: ${processDate}`);
  console.log(`========================================================================\n`);

  const conn = getPool();
  const results = {
    date: processDate,
    processedCount: 0,
    successCount: 0,
    failedCount: 0,
    totalGross: 0,
    totalPlatformFee: 0,
    totalNetPayout: 0,
    settlements: [],
    errors: [],
  };

  try {
    // 1. Query all confirmed bookings for this slot date that are pending payout
    // Handles multiple potential date string formats: "YYYY-MM-DD", "YYYY/MM/DD", etc.
    const [bookings] = await conn.query(
      `SELECT b.*, t.name as resolved_turf_name, t.owner_email as turf_owner_email, t.owner_name as turf_owner_name
       FROM bookings b
       LEFT JOIN turfs t ON b.turf_id = t.id OR b.turf_name = t.name
       WHERE (b.date = ? OR b.date LIKE ?)
         AND (b.status = 'Confirmed' OR b.status = 'Paid' OR b.status = 'Completed')
         AND (b.payout_status IS NULL OR b.payout_status = 'PENDING' OR b.payout_status = 'FAILED')`,
      [processDate, `${processDate}%`]
    );

    if (!bookings || bookings.length === 0) {
      console.log(`[MIDNIGHT PAYOUT ENGINE] ℹ No pending bookings found for slot date: ${processDate}`);
      return {
        success: true,
        message: `No pending bookings for ${processDate}.`,
        data: results,
      };
    }

    console.log(`[MIDNIGHT PAYOUT ENGINE] Found ${bookings.length} eligible bookings for ${processDate}.`);

    // 2. Fetch all turf owners from database for bank info lookup
    const [allOwners] = await conn.query(`SELECT * FROM turf_owners`);
    const ownerMap = new Map();
    allOwners.forEach((owner) => {
      let setupData = {};
      try {
        setupData = typeof owner.setup_data === "string" ? JSON.parse(owner.setup_data) : (owner.setup_data || {});
      } catch (e) {}

      const bank = setupData.bank || {};
      const ownerRecord = {
        ...owner,
        bank: {
          bankName: bank.bankName || "",
          accountHolder: bank.accountHolder || owner.name,
          accountNumber: bank.accountNumber || "",
          ifscCode: bank.ifscCode || "",
          upiId: bank.upiId || "",
          currency: bank.currency || "INR",
          commissionRate: setupData.commissionRate !== undefined ? Number(setupData.commissionRate) : null,
        },
      };

      if (owner.email) ownerMap.set(owner.email.toLowerCase().trim(), ownerRecord);
      if (owner.owner_id) ownerMap.set(owner.owner_id.toLowerCase().trim(), ownerRecord);
    });

    // 3. Group bookings by Turf / Turf Owner
    const groupedBookings = new Map();

    for (const booking of bookings) {
      const ownerEmail = (booking.turf_owner_email || "").toLowerCase().trim();
      const turfKey = booking.turf_id ? `TURF_${booking.turf_id}` : (booking.turf_name || "TURF_GENERAL");
      const groupKey = ownerEmail ? `OWNER_${ownerEmail}` : turfKey;

      if (!groupedBookings.has(groupKey)) {
        groupedBookings.set(groupKey, {
          ownerEmail: ownerEmail || null,
          turfName: booking.turf_name || booking.resolved_turf_name || "SportXClub Arena",
          turfId: booking.turf_id || null,
          bookings: [],
        });
      }

      groupedBookings.get(groupKey).bookings.push(booking);
    }

    const defaultCommissionPercent = Number(process.env.PLATFORM_COMMISSION_PERCENT || 5); // Default 5% platform fee

    // 4. Process Payout for each group
    for (const [groupKey, group] of groupedBookings.entries()) {
      results.processedCount++;
      const groupBookings = group.bookings;
      const turfName = group.turfName;
      const ownerEmail = group.ownerEmail;

      // Find owner details
      let owner = ownerMap.get(ownerEmail) || {
        name: groupBookings[0]?.turf_owner_name || `${turfName} Owner`,
        email: ownerEmail || "owner@sportxclub.com",
        phone: groupBookings[0]?.owner_phone || "9999999999",
        bank: {},
      };

      // Calculate totals
      let grossAmount = 0;
      groupBookings.forEach((b) => {
        grossAmount += Number(b.amount || 0);
      });

      const commissionPercent = owner.bank?.commissionRate !== null && owner.bank?.commissionRate !== undefined
        ? owner.bank.commissionRate
        : defaultCommissionPercent;

      const platformFee = Number(((grossAmount * commissionPercent) / 100).toFixed(2));
      const netPayoutAmount = Number((grossAmount - platformFee).toFixed(2));

      // Calculate itemized payout per booking
      const itemizedBookings = groupBookings.map((b) => {
        const itemGross = Number(b.amount || 0);
        const itemFee = Number(((itemGross * commissionPercent) / 100).toFixed(2));
        const itemNet = Number((itemGross - itemFee).toFixed(2));
        return {
          ...b,
          platform_fee: itemFee,
          owner_payout_amount: itemNet,
        };
      });

      const settlementId = `ST-${processDate.replace(/-/g, "")}-${(owner.owner_id || owner.id || "OWNER").toString().slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;

      console.log(`\n[MIDNIGHT PAYOUT] Processing Turf: "${turfName}" | Owner: ${owner.email} | Gross: ₹${grossAmount} | Net: ₹${netPayoutAmount}`);

      // Initiate Cashfree Payout transfer
      const payoutResult = await initiateTurfOwnerPayout({
        settlementId,
        owner,
        turfName,
        amount: netPayoutAmount,
        transferMode: owner.bank?.upiId && !owner.bank?.accountNumber ? "upi" : "banktransfer",
      });

      const isSuccess = payoutResult.success && (payoutResult.status === "SUCCESS" || payoutResult.status === "PENDING");
      const transferStatus = isSuccess ? (payoutResult.status === "PENDING" ? "PROCESSING" : "SUCCESS") : "FAILED";
      const utrNumber = payoutResult.utrNumber || null;
      const transferId = payoutResult.transferId || null;

      // Insert record into owner_settlements
      try {
        await conn.query(
          `INSERT INTO owner_settlements (
            settlement_id, owner_id, owner_email, turf_id, turf_name,
            settlement_date, total_bookings, gross_amount, platform_fee,
            net_payout_amount, bank_name, account_holder, account_number,
            ifsc_code, upi_id, cashfree_transfer_id, utr_number,
            transfer_mode, status, failure_reason
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            settlementId,
            String(owner.owner_id || owner.id || "N/A"),
            owner.email || ownerEmail || "unknown@sportxclub.com",
            group.turfId,
            turfName,
            processDate,
            groupBookings.length,
            grossAmount,
            platformFee,
            netPayoutAmount,
            owner.bank?.bankName || "Bank Transfer",
            owner.bank?.accountHolder || owner.name || "Turf Owner",
            owner.bank?.accountNumber || "",
            owner.bank?.ifscCode || "",
            owner.bank?.upiId || "",
            transferId,
            utrNumber,
            owner.bank?.upiId && !owner.bank?.accountNumber ? "UPI" : "IMPS",
            transferStatus,
            isSuccess ? null : (payoutResult.message || "Payout transfer rejected"),
          ]
        );
      } catch (insertErr) {
        console.error(`[MIDNIGHT PAYOUT] Failed inserting settlement record for ${settlementId}:`, insertErr.message);
      }

      // Update associated bookings to 'PAID' or update status
      const bookingIds = groupBookings.map((b) => b.id);
      if (bookingIds.length > 0) {
        try {
          await conn.query(
            `UPDATE bookings 
             SET payout_status = ?,
                 payout_id = ?,
                 payout_utr = ?,
                 payout_date = ?
             WHERE id IN (?)`,
            [
              isSuccess ? "PAID" : "FAILED",
              settlementId,
              utrNumber,
              processDate,
              bookingIds,
            ]
          );

          // Update individual platform fees if needed
          for (const item of itemizedBookings) {
            await conn.query(
              `UPDATE bookings SET platform_fee = ?, owner_payout_amount = ? WHERE id = ?`,
              [item.platform_fee, item.owner_payout_amount, item.id]
            ).catch(() => {});
          }
        } catch (updateErr) {
          console.error(`[MIDNIGHT PAYOUT] Failed updating booking status for ${settlementId}:`, updateErr.message);
        }
      }

      // Send automated daily settlement email report to turf owner
      let emailSuccess = false;
      if (owner.email && owner.email.includes("@")) {
        const emailRes = await sendDailyOwnerSettlementReport({
          owner,
          turfName,
          settlementDate: processDate,
          settlementId,
          totalBookings: groupBookings.length,
          grossAmount,
          platformFee,
          netPayoutAmount,
          bankName: owner.bank?.bankName || "Registered Bank Account",
          accountNumber: owner.bank?.accountNumber || "",
          ifscCode: owner.bank?.ifscCode || "",
          upiId: owner.bank?.upiId || "",
          utrNumber: utrNumber || "PROCESSING",
          transferId,
          transferStatus,
          transferredOn: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }),
          bookings: itemizedBookings,
        });

        emailSuccess = emailRes.success;
        if (emailSuccess) {
          await conn.query(
            `UPDATE owner_settlements SET email_sent = 1, email_sent_at = NOW() WHERE settlement_id = ?`,
            [settlementId]
          ).catch(() => {});
        }
      }

      // Accumulate summary stats
      if (isSuccess) {
        results.successCount++;
        results.totalGross += grossAmount;
        results.totalPlatformFee += platformFee;
        results.totalNetPayout += netPayoutAmount;
      } else {
        results.failedCount++;
        results.errors.push({
          turf: turfName,
          owner: owner.email,
          reason: payoutResult.message,
        });
      }

      results.settlements.push({
        settlement_id: settlementId,
        turf_name: turfName,
        owner_name: owner.name,
        owner_email: owner.email,
        total_bookings: groupBookings.length,
        gross_amount: grossAmount,
        platform_fee: platformFee,
        net_payout_amount: netPayoutAmount,
        status: transferStatus,
        utr: utrNumber,
        email_sent: emailSuccess,
      });
    }

    // 5. Send Admin Consolidated Daily Summary Report
    if (results.settlements.length > 0) {
      await sendDailyAdminSettlementSummary({
        settlementDate: processDate,
        totalTurfs: results.settlements.length,
        totalBookings: bookings.length,
        totalGross: results.totalGross,
        totalPlatformFee: results.totalPlatformFee,
        totalNetPayout: results.totalNetPayout,
        settlements: results.settlements,
      }).catch((e) => console.error("[Admin Settlement Email Error]:", e.message));
    }

    console.log(`\n========================================================================`);
    console.log(`[MIDNIGHT PAYOUT ENGINE] ✓ Batch Complete for ${processDate}`);
    console.log(`Settled: ${results.successCount} turfs | Total Payout: ₹${results.totalNetPayout.toLocaleString("en-IN")}`);
    console.log(`========================================================================\n`);

    return {
      success: true,
      message: `Daily settlements completed for ${processDate}.`,
      data: results,
    };
  } catch (err) {
    console.error(`[MIDNIGHT PAYOUT CRITICAL ERROR]:`, err);
    return {
      success: false,
      error: err.message,
      data: results,
    };
  }
}

/**
 * Starts the Node-Cron scheduler for 12:00 AM Midnight daily automatic payouts
 */
export function startMidnightPayoutScheduler() {
  // Cron expression: '0 0 * * *' = 12:00:00 AM every night
  const CRON_SCHEDULE = process.env.PAYOUT_CRON_SCHEDULE || "0 0 * * *";

  console.log(`[PAYOUT SCHEDULER] ⏰ Scheduled Midnight Auto-Payout job initialized (Pattern: "${CRON_SCHEDULE}" Asia/Kolkata)`);

  cron.schedule(
    CRON_SCHEDULE,
    async () => {
      // At 12:00:00 AM Midnight, settle all confirmed matches that took place on the concluded day
      const concludedDayStr = getCompletedDayDateString();
      console.log(`\n[CRON TRIGGER 12:00 AM] 🏁 Day Concluded! Processing automated settlements for completed matches on: ${concludedDayStr}...`);
      try {
        await processDailyTurfSettlements(concludedDayStr);
      } catch (err) {
        console.error(`[CRON ERROR] Payout scheduler failed:`, err);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );
}
