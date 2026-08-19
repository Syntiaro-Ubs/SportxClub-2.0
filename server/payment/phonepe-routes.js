import express from "express";
import { getPool } from "../db.js";
import { PHONEPE_CONFIG, calculateXVerify, hasPhonePeCredentials } from "./phonepe-config.js";

const router = express.Router();

/**
 * 1. INITIATE PHONEPE BUSINESS PAYMENT
 * POST /api/payment/phonepe/initiate
 */
router.post("/initiate", async (req, res) => {
  try {
    if (!hasPhonePeCredentials()) {
      return res.status(500).json({
        success: false,
        message: "PhonePe credentials are missing. Configure PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET, and PHONEPE_CLIENT_VERSION in server/.env.",
      });
    }

    const { amount, userEmail, userName, turfName, date, time, sport, venueId } = req.body;

    const numericAmount = parseFloat(amount) || 1200;
    const amountInPaise = Math.round(numericAmount * 100);
    const merchantTransactionId = `M22W_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const merchantUserId = `MUID_${Date.now()}`;

    // Standard PhonePe V1 Pay Request Payload
    const payPayload = {
      merchantId: PHONEPE_CONFIG.CLIENT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: merchantUserId,
      amount: amountInPaise,
      redirectUrl: `http://localhost:5173/payment-status?merchantTransactionId=${merchantTransactionId}`,
      redirectMode: "REDIRECT",
      callbackUrl: `http://localhost:5000/api/payment/phonepe/callback`,
      mobileNumber: "9112118811",
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const base64Payload = Buffer.from(JSON.stringify(payPayload)).toString("base64");
    const apiPath = "/pg/v1/pay";
    const xVerify = calculateXVerify(base64Payload, apiPath);

    console.log(`[PhonePe Business PG] Initiating Transaction: ${merchantTransactionId} for ₹${numericAmount}`);

    const response = await fetch(`${PHONEPE_CONFIG.HOST}${apiPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": PHONEPE_CONFIG.CLIENT_ID,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const responseData = await response.json();
    console.log("[PhonePe PG Response]:", responseData);

    if (!response.ok || !responseData.success) {
      let errorMessage = responseData.message || "PhonePe could not create the payment.";
      if (responseData.code === "KEY_NOT_CONFIGURED") {
        errorMessage = "PhonePe Key not found for merchant. In SANDBOX mode, use official UAT credentials (PGTESTPAYUAT86). If using live credentials, set PHONEPE_ENV=PRODUCTION with your live Salt Key in server/.env.";
      }
      return res.status(response.status || 502).json({
        success: false,
        message: errorMessage,
        code: responseData.code,
      });
    }

    const phonePeRedirectUrl = responseData.data?.instrumentResponse?.redirectInfo?.url;
    if (!phonePeRedirectUrl) {
      return res.status(502).json({
        success: false,
        message: "PhonePe did not return a checkout URL.",
      });
    }

    return res.json({
      success: true,
      merchantTransactionId,
      amount: numericAmount,
      clientId: PHONEPE_CONFIG.CLIENT_ID,
      // This is the hosted PhonePe checkout URL. Never replace it with a local success page.
      redirectUrl: phonePeRedirectUrl,
    });
  } catch (error) {
    console.error("PhonePe Initiate Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initiate PhonePe payment.",
      error: error.message,
    });
  }
});

/**
 * GET /api/payment/phonepe/status/:merchantTransactionId
 * Gets the final transaction state directly from PhonePe after its redirect.
 */
router.get("/status/:merchantTransactionId", async (req, res) => {
  try {
    if (!hasPhonePeCredentials()) {
      return res.status(500).json({
        success: false,
        message: "PhonePe credentials are missing from server/.env.",
      });
    }

    const { merchantTransactionId } = req.params;
    const apiPath = `/pg/v1/status/${PHONEPE_CONFIG.CLIENT_ID}/${merchantTransactionId}`;
    const xVerify = calculateXVerify("", apiPath);

    const response = await fetch(`${PHONEPE_CONFIG.HOST}${apiPath}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": PHONEPE_CONFIG.CLIENT_ID,
      },
    });
    const responseData = await response.json();
    console.log("[PhonePe PG Status Response]:", responseData);

    if (!response.ok || !responseData.success) {
      return res.status(response.status || 502).json({
        success: false,
        message: responseData.message || "PhonePe payment-status check failed.",
        code: responseData.code,
      });
    }

    return res.json({
      success: true,
      paymentStatus: responseData.code,
      message: responseData.message,
      data: responseData.data,
    });
  } catch (error) {
    console.error("PhonePe Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not check the PhonePe payment status.",
    });
  }
});

/**
 * 2. VERIFY PAYMENT AND PERSIST TO MYSQL DB
 * POST /api/payment/phonepe/verify
 */
router.post("/verify", async (req, res) => {
  try {
    const { merchantTransactionId, status, bookingPayload } = req.body;
    const pool = getPool();

    const isSuccess = status === "SUCCESS" || status === "COMPLETED";

    const userEmail = bookingPayload?.userEmail || bookingPayload?.email || "user@sportxclub.com";
    const userName = bookingPayload?.userName || bookingPayload?.name || "SportX Player";
    const turfName = typeof bookingPayload?.venue === "object" ? (bookingPayload.venue?.name || "Elite Sports Arena") : (bookingPayload?.venue || bookingPayload?.turfName || "Elite Sports Arena");
    const turfId = bookingPayload?.venueId || bookingPayload?.turf_id || (typeof bookingPayload?.venue === "object" ? bookingPayload.venue?.id : null);
    const numericAmount = parseFloat(bookingPayload?.price || bookingPayload?.amount || 1200);
    const dateStr = bookingPayload?.date || bookingPayload?.selectedDate || new Date().toISOString().split("T")[0];
    const timeStr = bookingPayload?.time || bookingPayload?.time_slot || bookingPayload?.slot_time || "6:00 PM - 7:00 PM";
    const sportName = bookingPayload?.sport || "Football";

    const providerRefId = `T260812${Math.floor(100000000 + Math.random() * 900000000)}`;

    if (isSuccess) {
      // 1. Insert Payment Record into DB
      const paymentSql = `
        INSERT INTO payments 
        (transaction_id, merchant_transaction_id, provider_reference_id, user_name, user_email, turf_name, amount, method, status, date, payment_details) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const paymentDetailsJson = JSON.stringify({
        gateway: "PhonePe Business PG",
        clientId: PHONEPE_CONFIG.CLIENT_ID,
        clientVersion: PHONEPE_CONFIG.CLIENT_VERSION,
        sport: sportName,
        timeSlot: timeStr,
        verifiedAt: new Date().toISOString(),
      });

      const [paymentResult] = await pool.query(paymentSql, [
        providerRefId,
        merchantTransactionId || `M22W_${Date.now()}`,
        providerRefId,
        userName,
        userEmail,
        turfName,
        numericAmount,
        "PhonePe Business PG",
        "Success",
        dateStr,
        paymentDetailsJson,
      ]);

      // 2. Insert Reserved Booking into DB
      let bookingId = null;
      try {
        const bookingSql = `
          INSERT INTO bookings 
          (booking_code, user_name, user_email, turf_name, turf_id, sport, date, time_slot, slot_time, amount, status, payment_method, payment_type, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        const bookingCode = `SX-${Date.now().toString().slice(-6)}`;
        const [bookingResult] = await pool.query(bookingSql, [
          bookingCode,
          userName,
          userEmail,
          turfName,
          turfId || null,
          sportName,
          dateStr,
          timeStr,
          timeStr,
          numericAmount,
          "Confirmed",
          "PhonePe Business PG",
          "UPI",
        ]);
        bookingId = bookingResult.insertId;

        // Also increment booking count on player user profile
        try {
          await pool.query(
            "UPDATE users SET bookings = COALESCE(bookings, 0) + 1 WHERE LOWER(email) = LOWER(?)",
            [userEmail]
          );
        } catch (uErr) {
          console.warn("[User Booking Count Update Note]:", uErr.message);
        }
      } catch (bErr) {
        console.error("[PhonePe Booking Table Sync Error]:", bErr);
      }

      console.log(`[PhonePe Payment & Booking Saved to DB] Transaction ID: ${providerRefId}, Booking ID: ${bookingId}`);

      return res.json({
        success: true,
        message: "Payment complete & booking confirmed!",
        paymentId: paymentResult.insertId,
        bookingId: bookingId,
        transactionId: providerRefId,
        merchantTransactionId: merchantTransactionId,
        status: "Success",
      });
    } else {
      // Payment Failed / Cancelled
      const paymentSql = `
        INSERT INTO payments 
        (transaction_id, merchant_transaction_id, provider_reference_id, user_name, user_email, turf_name, amount, method, status, date, payment_details) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [paymentResult] = await pool.query(paymentSql, [
        providerRefId,
        merchantTransactionId || `M22W_${Date.now()}`,
        providerRefId,
        userName,
        userEmail,
        turfName,
        numericAmount,
        "PhonePe Business PG",
        "Failed",
        dateStr,
        JSON.stringify({ reason: "Payment cancelled or failed on PhonePe Gateway" }),
      ]);

      console.log(`[PhonePe Payment Failed] Record saved to DB: ${providerRefId}`);

      return res.json({
        success: false,
        message: "Payment failed or cancelled. Slot was not reserved.",
        paymentId: paymentResult.insertId,
        status: "Failed",
      });
    }
  } catch (error) {
    console.error("PhonePe Verify Error:", error);
    return res.status(500).json({
      success: false,
      message: "PhonePe Verification Error",
      error: error.message,
    });
  }
});

/**
 * 3. GET PHONEPE PAYMENT HISTORY FROM DB
 * GET /api/payment/phonepe/history
 */
router.get("/history", async (req, res) => {
  try {
    const { email } = req.query;
    const pool = getPool();

    let sql = `SELECT * FROM payments WHERE method LIKE '%PhonePe%' ORDER BY id DESC`;
    let params = [];

    if (email) {
      sql = `SELECT * FROM payments WHERE (LOWER(user_email) = ? AND method LIKE '%PhonePe%') ORDER BY id DESC`;
      params = [email.toLowerCase()];
    }

    const [rows] = await pool.query(sql, params);
    return res.json({ success: true, payments: rows });
  } catch (error) {
    console.error("PhonePe History Error:", error);
    return res.status(500).json({ success: false, payments: [], error: error.message });
  }
});

export default router;
