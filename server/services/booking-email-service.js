import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { jsPDF } from "jspdf";
import { getPool } from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

/**
 * Creates and returns the configured Nodemailer transporter
 */
function getTransporter() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || "waghmareshrinivas99@gmail.com").trim();
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || "").replace(/\s+/g, "");

  if (host && host !== "smtp.gmail.com") {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Helper to parse slot times into startTime, endTime, duration, slotCount, and displaySlotText
 */
function parseSlotDetails(timeSlot = "") {
  let startTime = "Scheduled Time";
  let endTime = "Scheduled End";
  let duration = "1 Hour";
  let slotCount = 1;
  let slotList = [];
  let displaySlotText = String(timeSlot || "Scheduled Time").trim();

  if (!timeSlot) {
    return { startTime, endTime, duration, slotCount, slotList, displaySlotText };
  }

  const str = String(timeSlot).trim();

  // 1. Multiple slots separated by comma or semicolon e.g. "05:00 PM - 06:00 PM, 06:00 PM - 07:00 PM"
  if (str.includes(",") || str.includes(";")) {
    const slots = str.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
    slotList = slots;
    slotCount = slots.length;

    const parseSingle = (singleStr) => {
      const match = singleStr.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*[-–to]+\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i);
      if (match) return { start: match[1].trim(), end: match[2].trim() };
      return { start: singleStr, end: singleStr };
    };

    const firstParsed = parseSingle(slots[0]);
    const lastParsed = parseSingle(slots[slots.length - 1]);

    startTime = firstParsed.start;
    endTime = lastParsed.end;
    duration = `${slotCount} ${slotCount === 1 ? "Hour" : "Hours"}`;
    displaySlotText = slots.join(", ");

    return { startTime, endTime, duration, slotCount, slotList, displaySlotText };
  }

  // 2. Single range e.g. "06:00 PM - 07:00 PM" or "06:00 PM – 08:00 PM"
  if (str.includes("-") || str.includes("–") || str.includes("to")) {
    const parts = str.split(/[-–]|to/).map((p) => p.trim());
    if (parts.length >= 2) {
      startTime = parts[0];
      endTime = parts[1];
      
      const parseHour = (t) => {
        const match = t.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
        if (!match) return null;
        let h = parseInt(match[1], 10);
        const m = match[2] ? parseInt(match[2], 10) : 0;
        const meridian = match[3] ? match[3].toUpperCase() : null;
        if (meridian === "PM" && h < 12) h += 12;
        if (meridian === "AM" && h === 12) h = 0;
        return h + m / 60;
      };

      const startH = parseHour(startTime);
      const endH = parseHour(endTime);
      if (startH !== null && endH !== null) {
        let diff = endH - startH;
        if (diff < 0) diff += 24;
        if (diff > 0) {
          slotCount = Math.round(diff);
          duration = diff === 1 ? "1 Hour" : `${diff} Hours`;
        }
      }
    }
  } else {
    startTime = str;
    endTime = "End of Slot";
    duration = "1 Hour";
    slotCount = 1;
  }

  displaySlotText = `${startTime} – ${endTime}`;
  return { startTime, endTime, duration, slotCount, slotList, displaySlotText };
}

/**
 * Format timestamp into readable Indian Standard Time
 */
function formatDateTime(dateInput) {
  try {
    const date = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(date.getTime())) return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  }
}

/**
 * Generates high quality PDF Match Pass Buffer using jsPDF
 */
function generatePassPdfBuffer({
  bookingId,
  userName,
  userEmail,
  userPhone,
  turfName,
  sport,
  bookingDate,
  startTime,
  endTime,
  duration,
  amountPaid,
  turfLocation,
  bookingCreatedAt,
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Background Header
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, 210, 48, "F");

  // Emerald Top Accent Bar
  doc.setFillColor(5, 150, 105); // #059669
  doc.rect(0, 0, 210, 4, "F");

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("SPORTXCLUB", 20, 22);

  doc.setTextColor(52, 211, 153); // Emerald-400
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("OFFICIAL MATCH & VENUE PASS", 20, 30);

  // Pass Reference Badge (Right Top)
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(125, 14, 65, 24, 3, 3, "F");
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("BOOKING ID", 132, 22);
  doc.setTextColor(52, 211, 153);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(String(bookingId || "SPX-BK"), 132, 31);

  // Status Banner
  doc.setFillColor(240, 253, 244); // light green
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(20, 56, 170, 14, 3, 3, "FD");
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("✓ BOOKING CONFIRMED & PAYMENT SUCCESSFUL", 25, 65);

  // Section 1: Venue & Match Details Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 76, 170, 68, 4, 4, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TURF & SLOT RESERVATION", 26, 86);

  doc.setDrawColor(226, 232, 240);
  doc.line(26, 90, 184, 90);

  // Details Grid
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Turf Name:", 26, 98);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(String(turfName || "SportX Arena"), 60, 98);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Sport Category:", 26, 106);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(String(sport || "General Sports"), 60, 106);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Booking Date:", 26, 114);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(String(bookingDate || ""), 60, 114);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Time Slot:", 26, 122);
  doc.setTextColor(5, 150, 105); // Green
  doc.setFont("helvetica", "bold");
  doc.text(`${startTime} – ${endTime} (${duration})`, 60, 122);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Location / Address:", 26, 130);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  const locLines = doc.splitTextToSize(String(turfLocation || "Registered Arena Address"), 120);
  doc.text(locLines, 60, 130);

  // Section 2: Player & Payment Info Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 150, 170, 56, 4, 4, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER & PAYMENT SUMMARY", 26, 160);
  doc.line(26, 164, 184, 164);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Player Name:", 26, 172);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(String(userName || "Athlete"), 60, 172);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Contact Email:", 26, 180);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "normal");
  doc.text(String(userEmail || "Registered Player"), 60, 180);

  doc.setTextColor(100, 116, 139);
  doc.text("Mobile Number:", 26, 188);
  doc.setTextColor(15, 23, 42);
  doc.text(String(userPhone || "Provided on booking"), 60, 188);

  doc.setTextColor(100, 116, 139);
  doc.text("Total Paid:", 26, 196);
  doc.setTextColor(5, 150, 105);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`INR ${Number(amountPaid || 0).toLocaleString("en-IN")}`, 60, 196);

  // Guidelines & Check-in instructions Box
  doc.setFillColor(238, 242, 255); // Indigo light
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(20, 212, 170, 36, 3, 3, "FD");

  doc.setTextColor(67, 56, 202);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("IMPORTANT CHECK-IN GUIDELINES", 26, 220);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text("• Please carry this digital/printed Match Pass or Booking ID when arriving at the turf.", 26, 227);
  doc.text("• Arrive 10-15 minutes prior to your scheduled slot for hassle-free check-in.", 26, 233);
  doc.text("• Respect turf rules and wear sport-appropriate footwear (non-marking soles if required).", 26, 239);

  // Footer Branding
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on ${bookingCreatedAt || formatDateTime(new Date())} | SportXClub Verified Pass`, 20, 260);
  doc.text("For assistance, contact SportXClub Support • https://sportxclub.com", 20, 265);

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

/**
 * 1. Template: User Booking Confirmation Email
 */
function getPlayerBookingConfirmationHtml({
  userName,
  bookingId,
  bookingCreatedAt,
  amountPaid,
  turfName,
  sportName,
  turfLocation,
  bookingDate,
  startTime,
  endTime,
  duration,
  slotCount,
  displaySlotText,
}) {
  const formattedAmount = Number(amountPaid || 0).toLocaleString("en-IN");

  return `
<div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #202124;">
  <p style="margin: 0 0 16px 0;">Welcome to <strong>SportXClub</strong>! 🎉<br>
  We're happy to confirm your turf slot booking with us.</p>

  <p style="margin: 0 0 16px 0;">Your turf slot booking has been successfully confirmed on the SportXClub platform.</p>

  <p style="margin: 0 0 16px 0;">
    <strong>Booking Details:</strong><br>
    <strong>Turf Name :-</strong> ${turfName}<br>
    <strong>Location :-</strong> ${turfLocation || "Registered Arena"}<br>
    <strong>Sport :-</strong> ${sportName}<br>
    <strong>Player Name :-</strong> ${userName || "Player"}<br>
    <strong>Booking ID :-</strong> ${bookingId}<br>
    <strong>Date :-</strong> ${bookingDate}<br>
    <strong>Time Slot :-</strong> ${displaySlotText || `${startTime} – ${endTime}`}<br>
    <strong>Duration :-</strong> ${duration} (${slotCount || 1} ${Number(slotCount || 1) === 1 ? "Slot" : "Slots"})<br>
    <strong>Total Paid :-</strong> ₹${formattedAmount}
  </p>

  <p style="margin: 0 0 16px 0;">If you need any assistance with your booking, feel free to contact our support team.</p>

  <p style="margin: 0 0 16px 0;">Thank you for choosing SportXClub. We look forward to seeing you on the ground!</p>

  <p style="margin: 0; line-height: 1.5;">
    Best Regards,<br>
    <strong>SportXClub Team</strong>
  </p>
</div>
  `.trim();
}

/**
 * 2. Template: Turf Owner New Booking Notification Email
 */
function getOwnerNewBookingHtml({
  ownerName,
  bookingId,
  turfName,
  sportName,
  turfLocation,
  bookingDate,
  startTime,
  endTime,
  duration,
  slotCount,
  displaySlotText,
  userName,
  userEmail,
  userPhone,
  amountPaid,
  paymentDateTime,
}) {
  const formattedAmount = Number(amountPaid || 0).toLocaleString("en-IN");

  return `
<div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #202124;">
  <p style="margin: 0 0 16px 0;">Dear <strong>${ownerName || "Turf Owner"}</strong>,</p>

  <p style="margin: 0 0 16px 0;">You have received a new booking for your turf <strong>${turfName}</strong> on the SportXClub platform.</p>

  <p style="margin: 0 0 16px 0;">
    <strong>Booking Details:</strong><br>
    <strong>Turf Name :-</strong> ${turfName}<br>
    <strong>Location :-</strong> ${turfLocation || "Registered Arena"}<br>
    <strong>Sport :-</strong> ${sportName}<br>
    <strong>Booking ID :-</strong> ${bookingId}<br>
    <strong>Date :-</strong> ${bookingDate}<br>
    <strong>Time Slot :-</strong> ${displaySlotText || `${startTime} – ${endTime}`}<br>
    <strong>Duration :-</strong> ${duration} (${slotCount || 1} ${Number(slotCount || 1) === 1 ? "Slot" : "Slots"})<br>
    <strong>Amount :-</strong> ₹${formattedAmount}
  </p>

  <p style="margin: 0 0 16px 0;">
    <strong>Customer Details:</strong><br>
    <strong>Player Name :-</strong> ${userName || "Customer"}<br>
    <strong>Email :-</strong> ${userEmail || "N/A"}<br>
    <strong>Phone :-</strong> ${userPhone || "N/A"}<br>
    <strong>Payment Date & Time :-</strong> ${paymentDateTime}
  </p>

  <p style="margin: 0 0 16px 0;">
    <strong>Owner Dashboard:</strong> <a href="https://sportxclub.com/admin-login" target="_blank" style="color: #059669; text-decoration: underline;">https://sportxclub.com/admin-login</a>
  </p>

  <p style="margin: 0 0 16px 0;">If you need any assistance with your turf or owner account, feel free to contact our support team.</p>

  <p style="margin: 0 0 16px 0;">Thank you for choosing SportXClub.</p>

  <p style="margin: 0; line-height: 1.5;">
    Best Regards,<br>
    <strong>SportXClub Team</strong>
  </p>
</div>
  `.trim();
}

/**
 * 3. Template: User Booking Cancellation Email
 */
function getPlayerCancellationHtml({
  userName,
  bookingId,
  turfName,
  sportName,
  turfLocation,
  bookingDate,
  startTime,
  endTime,
  duration,
  cancellationDateTime,
  refundMode,
  refundId,
  amount,
}) {
  const isDirectBank = refundMode === "source";
  const refundText = isDirectBank
    ? `Refund of ₹${amount || 0} initiated directly to your original payment method (Bank/UPI via Cashfree). Expected settlement: 24 hours to 5 working days.`
    : `Refund of ₹${amount || 0} credited instantly to your SportX Wallet.`;

  return `
<div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #202124;">
  <p style="margin: 0 0 16px 0;">Dear <strong>${userName || "Player"}</strong>,</p>

  <p style="margin: 0 0 16px 0;">Your turf booking has been successfully cancelled as requested.</p>

  <p style="margin: 0 0 16px 0;">
    <strong>Booking Details:</strong><br>
    <strong>Turf Name :-</strong> ${turfName}<br>
    <strong>Location :-</strong> ${turfLocation || "Registered Arena"}<br>
    <strong>Sport :-</strong> ${sportName}<br>
    <strong>Booking ID :-</strong> ${bookingId}<br>
    <strong>Date :-</strong> ${bookingDate}<br>
    <strong>Time Slot :-</strong> ${startTime} – ${endTime}<br>
    <strong>Duration :-</strong> ${duration}<br>
    <strong>Status :-</strong> Cancelled<br>
    <strong>Cancelled On :-</strong> ${cancellationDateTime}
  </p>

  <div style="margin: 0 0 16px 0; padding: 12px; background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 4px;">
    <strong>Refund Status:</strong><br>
    ${refundText}<br>
    ${refundId ? `<strong>Refund Ref ID:</strong> ${refundId}` : ""}
  </div>

  <p style="margin: 0 0 16px 0;">The selected slot is no longer reserved under your account.</p>

  <p style="margin: 0 0 16px 0;">If you have any questions regarding your cancellation or refund, feel free to contact our support team.</p>

  <p style="margin: 0 0 16px 0;">We hope to see you back on the field soon!</p>

  <p style="margin: 0; line-height: 1.5;">
    Best Regards,<br>
    <strong>SportXClub Team</strong>
  </p>
</div>
  `.trim();
}

/**
 * 4. Template: Turf Owner Booking Cancellation Notification Email
 */
function getOwnerCancellationHtml({
  ownerName,
  bookingId,
  turfName,
  sportName,
  turfLocation,
  bookingDate,
  startTime,
  endTime,
  duration,
  cancellationDateTime,
}) {
  return `
<div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #202124;">
  <p style="margin: 0 0 16px 0;">Dear <strong>${ownerName || "Turf Owner"}</strong>,</p>

  <p style="margin: 0 0 16px 0;">A booking for your turf <strong>${turfName}</strong> has been cancelled by the customer. The slot is now available again for other players.</p>

  <p style="margin: 0 0 16px 0;">
    <strong>Booking Details:</strong><br>
    <strong>Turf Name :-</strong> ${turfName}<br>
    <strong>Location :-</strong> ${turfLocation || "Registered Arena"}<br>
    <strong>Sport :-</strong> ${sportName}<br>
    <strong>Booking ID :-</strong> ${bookingId}<br>
    <strong>Date :-</strong> ${bookingDate}<br>
    <strong>Time Slot :-</strong> ${startTime} – ${endTime}<br>
    <strong>Duration :-</strong> ${duration}<br>
    <strong>Status :-</strong> Cancelled<br>
    <strong>Cancelled On :-</strong> ${cancellationDateTime}
  </p>

  <p style="margin: 0 0 16px 0;">
    <strong>Owner Dashboard:</strong> <a href="https://sportxclub.com/admin-login" target="_blank" style="color: #059669; text-decoration: underline;">https://sportxclub.com/admin-login</a>
  </p>

  <p style="margin: 0 0 16px 0;">If you need any assistance with your turf or owner account, feel free to contact our support team.</p>

  <p style="margin: 0 0 16px 0;">Thank you for partnering with SportXClub.</p>

  <p style="margin: 0; line-height: 1.5;">
    Best Regards,<br>
    <strong>SportXClub Team</strong>
  </p>
</div>
  `.trim();
}

/**
 * Main function: Resolves booking, turf & owner data, and sends confirmation emails to both user & turf owner.
 */
export async function sendBookingEmails(bookingIdentifier, overrideData = {}) {
  try {
    if (!bookingIdentifier && !overrideData?.bookingCode && !overrideData?.booking_code) {
      console.warn("[BOOKING EMAIL] No booking identifier provided.");
      return { success: false, message: "No booking identifier provided" };
    }

    const pool = getPool();

    // 1. Fetch booking from MySQL
    let booking = null;
    if (bookingIdentifier) {
      const [rows] = await pool.query(
        "SELECT * FROM bookings WHERE id = ? OR booking_code = ? LIMIT 1",
        [bookingIdentifier, bookingIdentifier]
      );
      booking = rows[0] || null;
    }

    const finalBooking = {
      ...(booking || {}),
      ...overrideData,
    };

    const bookingId = finalBooking.id || null;
    const bookingCode = finalBooking.booking_code || finalBooking.bookingCode || `SPXBK${Date.now()}`;
    const userName = finalBooking.user_name || finalBooking.userName || "SportX Athlete";
    const userEmail = (finalBooking.user_email || finalBooking.userEmail || "").trim();
    const userPhone = finalBooking.user_phone || finalBooking.userPhone || "";
    const turfName = finalBooking.turf_name || finalBooking.turfName || "SportX Arena";
    const turfId = finalBooking.turf_id || finalBooking.turfId || null;
    const sportName = finalBooking.sport || "Sports";
    const bookingDate = finalBooking.date || finalBooking.selectedDate || new Date().toISOString().split("T")[0];
    const rawTimeSlot = finalBooking.time_slot || finalBooking.slot_time || finalBooking.time || "06:00 PM - 07:00 PM";
    const amountPaid = finalBooking.amount || finalBooking.price || 0;
    const bookingCreatedAt = formatDateTime(finalBooking.created_at || new Date());
    const paymentDateTime = bookingCreatedAt;

    // Slot parse
    const { startTime, endTime, duration, slotCount, displaySlotText } = parseSlotDetails(rawTimeSlot);

    // 2. Prevent duplicate emails if already sent
    if (booking && booking.email_sent === 1) {
      console.log(`[BOOKING EMAIL] Emails already sent for Booking [${bookingCode}]. Skipping duplicate send.`);
      return { success: true, message: "Emails already sent previously." };
    }

    // 3. Resolve Turf & Turf Owner Details
    let turfLocation = "Sports Complex, Main Road";
    let ownerEmail = "";
    let ownerName = "";

    try {
      let turfRow = null;
      if (turfId) {
        const [turfRows] = await pool.query("SELECT * FROM turfs WHERE id = ? LIMIT 1", [turfId]);
        turfRow = turfRows[0];
      }
      if (!turfRow && turfName) {
        const [turfRows] = await pool.query("SELECT * FROM turfs WHERE LOWER(name) = LOWER(?) LIMIT 1", [turfName.trim()]);
        turfRow = turfRows[0];
      }

      if (turfRow) {
        turfLocation = turfRow.location || turfLocation;
        ownerName = turfRow.owner_name || "";
        ownerEmail = (turfRow.owner_email || "").trim();
      }

      // If owner email not directly on turf row, resolve from turf_owners table
      if (!ownerEmail && (ownerName || turfName)) {
        const [ownerRows] = await pool.query(
          "SELECT * FROM turf_owners WHERE LOWER(name) = LOWER(?) OR (setup_data IS NOT NULL AND setup_data LIKE ?) LIMIT 1",
          [ownerName.trim(), `%${turfName}%`]
        );
        if (ownerRows.length > 0) {
          const o = ownerRows[0];
          ownerEmail = (o.email || "").trim();
          ownerName = ownerName || o.name;
          if (o.setup_data) {
            try {
              const setup = JSON.parse(o.setup_data);
              if (setup?.location?.address) turfLocation = setup.location.address;
            } catch (e) {}
          }
        }
      }
    } catch (dbFetchErr) {
      console.warn("[BOOKING EMAIL] Error querying turf/owner info:", dbFetchErr.message);
    }

    const transporter = getTransporter();
    const smtpFrom = `SportXClub <${process.env.SMTP_USER || "waghmareshrinivas99@gmail.com"}>`;

    const emailPromises = [];

    // 4. Send Email to Player / Customer with PDF Match Pass Attachment
    if (userEmail && userEmail.includes("@")) {
      const playerHtml = getPlayerBookingConfirmationHtml({
        userName,
        bookingId: bookingCode,
        bookingCreatedAt,
        amountPaid,
        turfName,
        sportName,
        turfLocation,
        bookingDate,
        startTime,
        endTime,
        duration,
        slotCount,
        displaySlotText,
      });

      // Generate PDF Match Pass
      let passPdfBuffer = null;
      try {
        passPdfBuffer = generatePassPdfBuffer({
          bookingId: bookingCode,
          userName,
          userEmail,
          userPhone,
          turfName,
          sport: sportName,
          bookingDate,
          startTime,
          endTime,
          duration,
          amountPaid,
          turfLocation,
          bookingCreatedAt,
        });
      } catch (pdfErr) {
        console.error("[BOOKING EMAIL] Error generating PDF pass:", pdfErr);
      }

      const mailOptions = {
        from: smtpFrom,
        to: userEmail,
        subject: `Booking Confirmed: ${turfName} - Booking ID: ${bookingCode}`,
        html: playerHtml,
      };

      if (passPdfBuffer) {
        mailOptions.attachments = [
          {
            filename: `SportXClub_Pass_${bookingCode}.pdf`,
            content: passPdfBuffer,
            contentType: "application/pdf",
          },
        ];
      }

      emailPromises.push(
        transporter
          .sendMail(mailOptions)
          .then((info) => {
            console.log(`[BOOKING EMAIL] ✓ Confirmation email sent to Player: ${userEmail} (MsgId: ${info.messageId})`);
            return { type: "player", success: true, email: userEmail };
          })
          .catch((err) => {
            console.error(`[BOOKING EMAIL] ✗ Failed to send email to Player (${userEmail}):`, err.message);
            return { type: "player", success: false, error: err.message };
          })
      );
    }

    // 5. Send Email to Turf Owner
    if (ownerEmail && ownerEmail.includes("@")) {
      const ownerHtml = getOwnerNewBookingHtml({
        ownerName,
        bookingId: bookingCode,
        turfName,
        sportName,
        turfLocation,
        bookingDate,
        startTime,
        endTime,
        duration,
        slotCount,
        displaySlotText,
        userName,
        userEmail,
        userPhone,
        amountPaid,
        paymentDateTime,
      });

      emailPromises.push(
        transporter
          .sendMail({
            from: smtpFrom,
            to: ownerEmail,
            subject: `New Booking Alert: ${turfName} - Slot: ${bookingDate} (${startTime} – ${endTime})`,
            html: ownerHtml,
          })
          .then((info) => {
            console.log(`[BOOKING EMAIL] ✓ Alert email sent to Turf Owner: ${ownerEmail} (MsgId: ${info.messageId})`);
            return { type: "owner", success: true, email: ownerEmail };
          })
          .catch((err) => {
            console.error(`[BOOKING EMAIL] ✗ Failed to send alert to Turf Owner (${ownerEmail}):`, err.message);
            return { type: "owner", success: false, error: err.message };
          })
      );
    }

    const results = await Promise.all(emailPromises);

    // 6. Mark booking as email_sent = 1 in database
    if (bookingId) {
      try {
        await pool.query("UPDATE bookings SET email_sent = 1 WHERE id = ?", [bookingId]);
      } catch (updateErr) {}
    } else if (bookingCode) {
      try {
        await pool.query("UPDATE bookings SET email_sent = 1 WHERE booking_code = ?", [bookingCode]);
      } catch (updateErr) {}
    }

    return {
      success: true,
      bookingCode,
      results,
    };
  } catch (error) {
    console.error("[BOOKING EMAIL] Unexpected error in sendBookingEmails:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Sends booking cancellation email to both Player and Turf Owner
 */
export async function sendCancellationEmails(bookingIdOrCode, details = {}) {
  try {
    const pool = getPool();
    let booking = null;

    if (bookingIdOrCode) {
      const [rows] = await pool.query(
        "SELECT * FROM bookings WHERE id = ? OR booking_code = ? LIMIT 1",
        [bookingIdOrCode, bookingIdOrCode]
      );
      if (rows.length > 0) booking = rows[0];
    }

    const bookingCode = details.bookingCode || booking?.booking_code || `SPX-${String(bookingIdOrCode).slice(-6)}`;
    const userName = details.userName || booking?.user_name || "SportX Athlete";
    const userEmail = (details.userEmail || booking?.user_email || "").trim();
    const turfName = details.turfName || booking?.turf_name || "SportX Arena";
    const turfId = details.turfId || booking?.turf_id || null;
    const sportName = details.sport || booking?.sport || "Sports";
    const bookingDate = details.date || booking?.date || new Date().toISOString().split("T")[0];
    const rawTimeSlot = details.timeSlot || booking?.time_slot || booking?.slot_time || "06:00 PM - 07:00 PM";
    const cancellationDateTime = formatDateTime(new Date());

    const { startTime, endTime, duration } = parseSlotDetails(rawTimeSlot);

    // Resolve owner details
    let ownerEmail = "";
    let ownerName = "";

    let turfLocation = details.location || details.turfLocation || "";

    try {
      let turfRow = null;
      if (turfId) {
        const [turfRows] = await pool.query("SELECT * FROM turfs WHERE id = ? LIMIT 1", [turfId]);
        turfRow = turfRows[0];
      }
      if (!turfRow && turfName) {
        const [turfRows] = await pool.query("SELECT * FROM turfs WHERE LOWER(name) = LOWER(?) LIMIT 1", [turfName.trim()]);
        turfRow = turfRows[0];
      }
      if (turfRow) {
        ownerName = turfRow.owner_name || "";
        ownerEmail = (turfRow.owner_email || "").trim();
        turfLocation = turfLocation || turfRow.location || "";
      }
      if (!ownerEmail && (ownerName || turfName)) {
        const [ownerRows] = await pool.query(
          "SELECT * FROM turf_owners WHERE LOWER(name) = LOWER(?) OR (setup_data IS NOT NULL AND setup_data LIKE ?) LIMIT 1",
          [ownerName.trim(), `%${turfName}%`]
        );
        if (ownerRows.length > 0) {
          ownerEmail = (ownerRows[0].email || "").trim();
          ownerName = ownerName || ownerRows[0].name;
          turfLocation = turfLocation || ownerRows[0].city || "";
        }
      }
    } catch (dbFetchErr) {
      console.warn("[CANCELLATION EMAIL] Error querying turf/owner info:", dbFetchErr.message);
    }

    const transporter = getTransporter();
    const smtpFrom = `SportXClub <${process.env.SMTP_USER || "waghmareshrinivas99@gmail.com"}>`;

    const cancelPromises = [];

    // 1. Send Cancellation Email to User
    if (userEmail && userEmail.includes("@")) {
      const playerCancelHtml = getPlayerCancellationHtml({
        userName,
        bookingId: bookingCode,
        turfName,
        sportName,
        turfLocation,
        bookingDate,
        startTime,
        endTime,
        duration,
        cancellationDateTime,
        refundMode: details.refundMode || booking?.refund_mode || "wallet",
        refundId: details.refundId || booking?.refund_arn || booking?.refund_id,
        amount: details.amount || booking?.amount || 0,
      });

      cancelPromises.push(
        transporter
          .sendMail({
            from: smtpFrom,
            to: userEmail,
            subject: `Booking Cancelled: ${turfName} - Booking ID: ${bookingCode}`,
            html: playerCancelHtml,
          })
          .then((info) => {
            console.log(`[CANCELLATION EMAIL] ✓ Cancellation email sent to Player: ${userEmail} (MsgId: ${info.messageId})`);
            return { type: "player", success: true, email: userEmail };
          })
          .catch((err) => {
            console.error(`[CANCELLATION EMAIL] ✗ Failed player cancellation email (${userEmail}):`, err.message);
            return { type: "player", success: false, error: err.message };
          })
      );
    }

    // 2. Send Cancellation Email to Turf Owner
    if (ownerEmail && ownerEmail.includes("@")) {
      const ownerCancelHtml = getOwnerCancellationHtml({
        ownerName,
        bookingId: bookingCode,
        turfName,
        sportName,
        turfLocation,
        bookingDate,
        startTime,
        endTime,
        duration,
        cancellationDateTime,
      });

      cancelPromises.push(
        transporter
          .sendMail({
            from: smtpFrom,
            to: ownerEmail,
            subject: `Booking Cancelled Alert: ${turfName} - Booking ID: ${bookingCode}`,
            html: ownerCancelHtml,
          })
          .then((info) => {
            console.log(`[CANCELLATION EMAIL] ✓ Cancellation email sent to Turf Owner: ${ownerEmail} (MsgId: ${info.messageId})`);
            return { type: "owner", success: true, email: ownerEmail };
          })
          .catch((err) => {
            console.error(`[CANCELLATION EMAIL] ✗ Failed owner cancellation email (${ownerEmail}):`, err.message);
            return { type: "owner", success: false, error: err.message };
          })
      );
    }

    const results = await Promise.all(cancelPromises);
    return { success: true, results };
  } catch (err) {
    console.error("[CANCELLATION EMAIL] Error:", err.message);
    return { success: false, error: err.message };
  }
}
