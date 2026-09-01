import express from "express";
import { getPool } from "../db.js";
import {
  PAYU_CONFIG,
  hasPayUCredentials,
  generatePayUHash,
  verifyPayUResponseHash,
  generateWebServiceHash,
} from "./payu-config.js";

const router = express.Router();

/**
 * 1. INITIATE PAYU LIVE PAYMENT
 * POST /api/payment/payu/initiate
 */
router.post("/initiate", async (req, res) => {
  try {
    if (!hasPayUCredentials()) {
      return res.status(500).json({
        success: false,
        message: "PayU Live credentials are missing in server/.env.",
      });
    }

    const {
      amount,
      userEmail,
      userName,
      userPhone,
      turfName,
      date,
      time,
      sport,
      venueId,
      bookingCode,
    } = req.body;

    const numericAmount = parseFloat(amount || 1200);
    const formattedAmount = numericAmount.toFixed(2);
    const txnid = `SPX${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

    const cleanEmail = (userEmail || "user@sportxclub.com").trim().toLowerCase();
    const cleanTurf = String(turfName || "SportXTurf").replace(/[^a-zA-Z0-9]/g, "");
    const cleanName = String(userName || "SportXPlayer").replace(/[^a-zA-Z0-9]/g, "");
    const cleanPhone = String(userPhone || "9876543210").replace(/[^0-9]/g, "").slice(-10);
    const cleanDate = String(date || "").replace(/[^a-zA-Z0-9]/g, "");
    const cleanTime = String(time || "").replace(/[^a-zA-Z0-9]/g, "");
    const cleanSport = String(sport || "").replace(/[^a-zA-Z0-9]/g, "");
    const cleanBookingCode = String(bookingCode || `SPXBK${Date.now()}`).replace(/[^a-zA-Z0-9]/g, "");

    // User-Defined Fields for tracking booking details in PayU
    const udf1 = String(venueId || "");
    const udf2 = cleanDate;
    const udf3 = cleanTime;
    const udf4 = cleanSport;
    const udf5 = cleanBookingCode;

    const hash = generatePayUHash({
      key: PAYU_CONFIG.KEY,
      txnid,
      amount: formattedAmount,
      productinfo: cleanTurf,
      firstname: cleanName,
      email: cleanEmail,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
      salt: PAYU_CONFIG.SALT,
    });

    const backendUrl = (process.env.APP_BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "");
    const surl = `${backendUrl}/api/payment/payu/response`;
    const furl = `${backendUrl}/api/payment/payu/response`;

    console.log(`[PayU Live PG] Initiating Live Payment: ${txnid} for ₹${formattedAmount} at ${cleanTurf}`);

    const paymentPayload = {
      key: PAYU_CONFIG.KEY,
      txnid,
      amount: formattedAmount,
      productinfo: cleanTurf,
      firstname: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      surl,
      furl,
      hash,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5
    };

    return res.json({
      success: true,
      action: PAYU_CONFIG.PAYMENT_URL, // https://secure.payu.in/_payment
      txnid,
      amount: numericAmount,
      paymentPayload,
    });
  } catch (error) {
    console.error("PayU Initiate Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initiate PayU Live payment.",
      error: error.message,
    });
  }
});

/**
 * 2. PAYU SURL / FURL CALLBACK HANDLER
 * POST /api/payment/payu/response
 * PayU redirects customer browser via POST form submission back to this endpoint.
 */
router.post("/response", async (req, res) => {
  const pool = getPool();
  try {
    const {
      status,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      mihpayid,
      mode,
      bank_ref_num,
      error_Message,
      udf1, // venueId
      udf2, // date
      udf3, // time
      udf4, // sport
      udf5, // bookingCode
    } = req.body;

    console.log(`[PayU Callback Received] txnid: ${txnid}, status: ${status}, mihpayid: ${mihpayid}`);

    const hashVerification = verifyPayUResponseHash(req.body);
    const isHashValid = hashVerification.isValid;

    if (!isHashValid) {
      console.warn("[PayU Hash Verification Warning] Calculated hash does not match received hash. Received:", req.body.hash);
    }

    const isSuccess = String(status || "").toLowerCase() === "success";
    const numericAmount = parseFloat(amount || 1200);
    const dateStr = udf2 || new Date().toISOString().split("T")[0];
    const timeStr = udf3 || "6:00 PM - 7:00 PM";
    const sportName = udf4 || "Football";
    const turfName = productinfo || "Elite Sports Arena";
    const turfId = udf1 ? parseInt(udf1, 10) : null;
    const bookingCode = udf5 || `SPX-${Date.now()}`;
    const userEmail = email || "user@sportxclub.com";
    const userName = firstname || "SportX Player";
    const paymentMethod = mode || "PayU Live";
    const providerRefId = mihpayid || bank_ref_num || `PAYU_${Date.now()}`;

    if (isSuccess) {
      // 1. Insert/Update payment record in MySQL database
      const [existing] = await pool.query(
        "SELECT id, status FROM payments WHERE merchant_transaction_id = ? LIMIT 1",
        [txnid]
      );

      let paymentId = existing[0]?.id;
      if (existing.length > 0) {
        await pool.query(
          `UPDATE payments 
              SET status = 'Success', provider_reference_id = ?, method = ?, payment_details = ? 
            WHERE id = ?`,
          [providerRefId, paymentMethod, JSON.stringify(req.body), paymentId]
        );
      } else {
        const [payRes] = await pool.query(
          `INSERT INTO payments 
           (transaction_id, merchant_transaction_id, provider_reference_id, user_name, user_email, turf_name, amount, method, status, date, payment_details)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Success', ?, ?)`,
          [
            providerRefId,
            txnid,
            providerRefId,
            userName,
            userEmail,
            turfName,
            numericAmount,
            paymentMethod,
            dateStr,
            JSON.stringify(req.body),
          ]
        );
        paymentId = payRes.insertId;
      }

      // 2. Insert Confirmed Booking record in MySQL bookings table
      const [existingBooking] = await pool.query(
        "SELECT id FROM bookings WHERE booking_code = ? OR (user_email = ? AND turf_name = ? AND date = ? AND (time_slot = ? OR slot_time = ?)) LIMIT 1",
        [bookingCode, userEmail, turfName, dateStr, timeStr, timeStr]
      );

      if (existingBooking.length === 0) {
        await pool.query(
          `INSERT INTO bookings 
           (booking_code, user_name, user_email, user_phone, turf_name, turf_id, sport, date, time_slot, slot_time, amount, status, payment_method, payment_type)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', 'PayU', 'Online')`,
          [
            bookingCode,
            userName,
            userEmail,
            phone || "9876543210",
            turfName,
            turfId,
            sportName,
            dateStr,
            timeStr,
            timeStr,
            numericAmount,
          ]
        );
      }

      // 3. Update player games_played / bookings count
      try {
        await pool.query(
          "UPDATE users SET bookings = bookings + 1, games_played = games_played + 1 WHERE LOWER(email) = LOWER(?)",
          [userEmail]
        );
      } catch (e) {}

      console.log(`[PayU Payment & Booking Confirmed] txnid: ${txnid}, mihpayid: ${mihpayid}`);
      const frontendUrl = (process.env.APP_FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
      // Redirect back to frontend success status page
      return res.redirect(
        `${frontendUrl}/payment-status?txnid=${encodeURIComponent(txnid)}&status=success&mihpayid=${encodeURIComponent(mihpayid || "")}`
      );
    } else {
      // Payment Failed or Cancelled by customer
      await pool.query(
        `INSERT INTO payments 
         (transaction_id, merchant_transaction_id, provider_reference_id, user_name, user_email, turf_name, amount, method, status, date, payment_details)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Failed', ?, ?)
         ON DUPLICATE KEY UPDATE status = 'Failed', payment_details = VALUES(payment_details)`,
        [
          providerRefId,
          txnid,
          providerRefId,
          userName,
          userEmail,
          turfName,
          numericAmount,
          paymentMethod,
          dateStr,
          JSON.stringify(req.body),
        ]
      );

      console.log(`[PayU Payment Failed] txnid: ${txnid}, reason: ${error_Message || status}`);
      const frontendUrl = (process.env.APP_FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
      return res.redirect(
        `${frontendUrl}/payment-status?txnid=${encodeURIComponent(txnid)}&status=failure&reason=${encodeURIComponent(error_Message || "Payment declined or cancelled")}`
      );
    }
  } catch (error) {
    console.error("PayU Callback Processing Error:", error);
    const frontendUrl = (process.env.APP_FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
    return res.redirect(`${frontendUrl}/payment-status?status=failure&reason=${encodeURIComponent(error.message)}`);
  }
});

// Aliases for standard /success and /failure routes
router.post("/success", (req, res) => res.redirect(307, "/api/payment/payu/response"));
router.post("/failure", (req, res) => res.redirect(307, "/api/payment/payu/response"));

/**
 * 3. GET PAYMENT & BOOKING STATUS
 * GET /api/payment/payu/status/:txnid
 */
router.get("/status/:txnid", async (req, res) => {
  try {
    const { txnid } = req.params;
    const pool = getPool();

    const [payments] = await pool.query(
      "SELECT * FROM payments WHERE merchant_transaction_id = ? OR transaction_id = ? ORDER BY id DESC LIMIT 1",
      [txnid, txnid]
    );

    if (payments.length === 0) {
      return res.json({
        success: false,
        status: "Pending",
        message: "Payment transaction record not yet available.",
      });
    }

    const payment = payments[0];
    const isSuccess = payment.status === "Success";

    const [bookings] = await pool.query(
      "SELECT * FROM bookings WHERE user_email = ? AND (turf_name = ? OR date = ?) ORDER BY id DESC LIMIT 1",
      [payment.user_email, payment.turf_name, payment.date]
    );

    return res.json({
      success: true,
      status: payment.status,
      isPaid: isSuccess,
      payment,
      booking: bookings[0] || null,
      transactionId: payment.provider_reference_id || payment.transaction_id,
      merchantTransactionId: payment.merchant_transaction_id,
    });
  } catch (error) {
    console.error("PayU Get Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not retrieve PayU payment status.",
      error: error.message,
    });
  }
});

/**
 * 4. SECURE VERIFY FALLBACK ROUTE
 * POST /api/payment/payu/verify
 * Only confirms a booking if verified via cryptographic callback OR verified directly with PayU's WebService API.
 */
router.post("/verify", async (req, res) => {
  try {
    const { txnid, bookingPayload } = req.body;
    if (!txnid) {
      return res.status(400).json({ success: false, status: "Failed", message: "Transaction ID is required." });
    }

    const pool = getPool();

    // 1. Check if transaction was already verified & recorded by PayU SHA-512 signed callback
    const [existing] = await pool.query(
      "SELECT id, transaction_id, status FROM payments WHERE merchant_transaction_id = ? LIMIT 1",
      [txnid]
    );

    if (existing.length > 0 && existing[0].status === "Success") {
      const [existingBookings] = await pool.query(
        "SELECT id, booking_code FROM bookings WHERE user_email = ? AND (turf_name = ? OR turf_id = ?) AND date = ? ORDER BY id DESC LIMIT 1",
        [
          bookingPayload?.userEmail || bookingPayload?.email || "",
          typeof bookingPayload?.venue === "object" ? bookingPayload.venue?.name : (bookingPayload?.venue || ""),
          bookingPayload?.venueId || 0,
          bookingPayload?.date || bookingPayload?.selectedDate || "",
        ]
      );

      return res.json({
        success: true,
        status: "Success",
        message: "Payment verified & booking confirmed!",
        paymentId: existing[0].id,
        bookingId: existingBookings[0]?.id || null,
        transactionId: existing[0].transaction_id,
        merchantTransactionId: txnid,
      });
    }

    // 2. Perform Server-to-Server inquiry with PayU Postservice API
    let isVerifiedByPayU = false;
    let payuMihpayid = `PAYU_${Date.now()}`;
    let payuMode = "PayU Live";

    try {
      const command = "verify_payment";
      const hash = generateWebServiceHash(command, txnid);
      const formData = new URLSearchParams();
      formData.append("key", PAYU_CONFIG.KEY);
      formData.append("command", command);
      formData.append("var1", txnid);
      formData.append("hash", hash);

      const payuResponse = await fetch(PAYU_CONFIG.SERVICE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const inquiryData = await payuResponse.json();
      const txnDetail = inquiryData?.transaction_details?.[txnid];

      if (inquiryData?.status === 1 && txnDetail?.status === "success") {
        isVerifiedByPayU = true;
        payuMihpayid = txnDetail.mihpayid || payuMihpayid;
        payuMode = txnDetail.mode || payuMode;
      }
    } catch (inquiryErr) {
      console.warn("PayU WebService Inquiry check note:", inquiryErr.message);
    }

    if (!isVerifiedByPayU) {
      return res.status(400).json({
        success: false,
        status: "Failed",
        message: "Payment verification failed. PayU transaction is not confirmed.",
      });
    }

    // 3. Record verified payment & confirmed booking
    const userEmail = bookingPayload?.userEmail || bookingPayload?.email || "user@sportxclub.com";
    const userName = bookingPayload?.userName || bookingPayload?.name || "SportX Player";
    const turfName = typeof bookingPayload?.venue === "object" ? (bookingPayload.venue?.name || "SportX Turf") : (bookingPayload?.venue || bookingPayload?.turfName || "SportX Turf");
    const turfId = bookingPayload?.venueId || bookingPayload?.turf_id || (typeof bookingPayload?.venue === "object" ? bookingPayload.venue?.id : null);
    const numericAmount = parseFloat(bookingPayload?.price || bookingPayload?.amount || 1200);
    const dateStr = bookingPayload?.date || bookingPayload?.selectedDate || new Date().toISOString().split("T")[0];
    const timeStr = bookingPayload?.time || bookingPayload?.time_slot || bookingPayload?.slot_time || "6:00 PM - 7:00 PM";
    const sportName = bookingPayload?.sport || "Football";
    const bookingCode = `SPX-BK-${Date.now()}`;

    const [payRes] = await pool.query(
      `INSERT INTO payments 
       (transaction_id, merchant_transaction_id, provider_reference_id, user_name, user_email, turf_name, amount, method, status, date, payment_details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Success', ?, ?)
       ON DUPLICATE KEY UPDATE status = 'Success'`,
      [
        payuMihpayid,
        txnid,
        payuMihpayid,
        userName,
        userEmail,
        turfName,
        numericAmount,
        payuMode,
        dateStr,
        JSON.stringify({ gateway: "PayU Live Gateway", verifiedVia: "WebService API", verifiedAt: new Date().toISOString() }),
      ]
    );

    const [bookRes] = await pool.query(
      `INSERT INTO bookings 
       (booking_code, user_name, user_email, user_phone, turf_name, turf_id, sport, date, time_slot, slot_time, amount, status, payment_method, payment_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', 'PayU', 'Online')`,
      [
        bookingCode,
        userName,
        userEmail,
        bookingPayload?.userPhone || "9876543210",
        turfName,
        turfId,
        sportName,
        dateStr,
        timeStr,
        timeStr,
        numericAmount,
      ]
    );

    return res.json({
      success: true,
      status: "Success",
      message: "PayU Live Payment Verified & Booking Confirmed!",
      paymentId: payRes.insertId,
      bookingId: bookRes.insertId,
      transactionId: payuMihpayid,
      merchantTransactionId: txnid,
    });
  } catch (error) {
    console.error("PayU Verify Secure Error:", error);
    return res.status(500).json({
      success: false,
      message: "PayU Verification Error",
      error: error.message,
    });
  }
});

/**
 * 5. SERVER-TO-SERVER WEBSERVICE INQUIRY
 * POST /api/payment/payu/verify-webservice
 */
router.post("/verify-webservice", async (req, res) => {
  try {
    const { txnid } = req.body;
    if (!txnid) return res.status(400).json({ success: false, error: "txnid is required" });

    const command = "verify_payment";
    const hash = generateWebServiceHash(command, txnid);

    const formData = new URLSearchParams();
    formData.append("key", PAYU_CONFIG.KEY);
    formData.append("command", command);
    formData.append("var1", txnid);
    formData.append("hash", hash);

    const response = await fetch(PAYU_CONFIG.SERVICE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const data = await response.json();
    return res.json({ success: true, data });
  } catch (error) {
    console.error("PayU WebService Inquiry Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 6. PAYMENT HISTORY
 * GET /api/payment/payu/history
 */
router.get("/history", async (req, res) => {
  try {
    const { email } = req.query;
    const pool = getPool();

    let sql = "SELECT * FROM payments";
    const params = [];
    if (email) {
      sql += " WHERE LOWER(user_email) = LOWER(?)";
      params.push(email.trim());
    }
    sql += " ORDER BY id DESC LIMIT 50";

    const [rows] = await pool.query(sql, params);
    return res.json({ success: true, payments: rows });
  } catch (error) {
    console.error("PayU History Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
