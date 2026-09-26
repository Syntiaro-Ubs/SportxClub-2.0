import express from "express";
import { getPool } from "../db.js";
import {
  CASHFREE_CONFIG,
  hasCashfreeCredentials,
  getCashfreeHeaders,
  verifyCashfreeWebhookSignature,
} from "./cashfree-config.js";
import { sendBookingEmails } from "../services/booking-email-service.js";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * Helper to get clean frontend & backend URLs
 */
function getAppUrls(req) {
  const origin = req?.headers?.origin || req?.headers?.referer || "";
  const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1") || process.env.NODE_ENV === "development";

  let frontendUrl = "https://sportxclub.com";
  let backendUrl = "https://sportxclub.com";

  if (isLocalhost) {
    if (origin) {
      try {
        const parsed = new URL(origin);
        frontendUrl = `${parsed.protocol}//${parsed.host}`;
      } catch {
        frontendUrl = process.env.APP_FRONTEND_URL || "http://localhost:5173";
      }
    } else {
      frontendUrl = process.env.APP_FRONTEND_URL || "http://localhost:5173";
    }
    backendUrl = `http://localhost:${process.env.PORT || 5000}`;
  } else {
    frontendUrl = (process.env.APP_FRONTEND_URL || "https://sportxclub.com").replace(/\/+$/, "");
    backendUrl = (process.env.APP_BACKEND_URL || "https://sportxclub.com").replace(/\/+$/, "");
  }

  return { frontendUrl, backendUrl };
}

/**
 * 1. CREATE CASHFREE ORDER & GET PAYMENT SESSION ID (Authoritative Pricing)
 * POST /api/payment/cashfree/create-order
 * POST /api/payment/cashfree/initiate
 */
router.post(["/create-order", "/initiate"], optionalAuth, async (req, res) => {
  try {
    if (!hasCashfreeCredentials()) {
      return res.status(500).json({
        success: false,
        message: "Cashfree Live credentials (AppID / SecretKey) are missing in server/.env.",
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

    const pool = getPool();

    // Server-Side Pricing Calculation
    let authoritativeAmount = parseFloat(amount || 1200);
    let resolvedTurfName = String(turfName || "SportX Turf").trim();
    const count = parseInt(req.body.slotCount || (Array.isArray(req.body.slots) ? req.body.slots.length : 1), 10) || 1;

    if (venueId || turfName) {
      try {
        let rows = [];
        if (venueId) {
          [rows] = await pool.query("SELECT id, name, price_per_hour FROM turfs WHERE id = ? LIMIT 1", [venueId]);
        }
        if (rows.length === 0 && turfName) {
          [rows] = await pool.query("SELECT id, name, price_per_hour FROM turfs WHERE LOWER(name) = LOWER(?) LIMIT 1", [turfName.trim()]);
        }
        if (rows.length > 0) {
          const dbPrice = parseFloat(rows[0].price_per_hour);
          if (Number.isFinite(dbPrice) && dbPrice > 0) {
            authoritativeAmount = dbPrice * count;
          }
          resolvedTurfName = rows[0].name || resolvedTurfName;
        }
      } catch (dbLookupErr) {
        console.warn("DB Price lookup note:", dbLookupErr.message);
      }
    }

    if (amount && parseFloat(amount) > 0) {
      authoritativeAmount = parseFloat(amount);
    }

    const numericAmount = Math.max(1, authoritativeAmount);
    const formattedAmount = numericAmount.toFixed(2);

    const uniqueSuffix = `${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const orderId = `SPX_${uniqueSuffix}`;

    const cleanEmail = (req.user?.email || userEmail || "user@sportxclub.com").trim().toLowerCase();
    const cleanName = String(userName || "SportX Player").replace(/[^a-zA-Z0-9 ]/g, "").trim() || "SportX Player";
    const rawPhone = String(userPhone || "9876543210").replace(/[^0-9]/g, "");
    const cleanPhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : "9876543210";
    
    const cleanCustomerId = `cust_${cleanPhone}_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "").slice(0, 15)}`;
    const cleanDate = String(date || "").trim();
    const cleanTime = String(time || "").trim();
    const cleanSport = String(sport || "Sports").trim();
    const cleanBookingCode = String(bookingCode || `SPXBK${Date.now()}`).trim();

    // Cashfree API schema strictly requires return_url and notify_url to start with https://
    const isWalletTopup = req.body.orderType === "WALLET_TOPUP";
    const prodDomain = "https://sportxclub.com";
    const returnUrl = isWalletTopup
      ? `${prodDomain}/profile?topup_status=success&order_id={order_id}`
      : `${prodDomain}/payment-status?order_id={order_id}`;
    const notifyUrl = `${prodDomain}/api/payment/cashfree/webhook`;

    const cashfreeOrderPayload = {
      order_id: orderId,
      order_amount: numericAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: cleanCustomerId,
        customer_name: cleanName,
        customer_email: cleanEmail,
        customer_phone: cleanPhone,
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: notifyUrl,
      },
      order_note: isWalletTopup ? `SportXClub Wallet Top-Up: ₹${formattedAmount}` : `SportXClub Booking: ${resolvedTurfName} (${cleanSport})`,
      order_tags: {
        orderType: isWalletTopup ? "WALLET_TOPUP" : "BOOKING",
        turfName: resolvedTurfName.slice(0, 40),
        sport: cleanSport.slice(0, 40),
        date: cleanDate.slice(0, 20),
        time: cleanTime.slice(0, 100),
        venueId: String(venueId || ""),
        bookingCode: cleanBookingCode.slice(0, 40),
      },
    };

    console.log(`[Cashfree Live PG] Creating Order: ${orderId} for ₹${formattedAmount} at ${resolvedTurfName}`);

    const response = await fetch(`${CASHFREE_CONFIG.BASE_URL}/orders`, {
      method: "POST",
      headers: getCashfreeHeaders(),
      body: JSON.stringify(cashfreeOrderPayload),
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.payment_session_id) {
      console.error("[Cashfree Create Order Error]:", responseData);
      return res.status(response.status || 400).json({
        success: false,
        message: responseData.message || "Failed to create Cashfree payment order.",
        error: responseData,
      });
    }

    // Save pending transaction in MySQL payments table with complete booking metadata
    try {
      const initialBookingData = {
        cleanTime,
        cleanDate,
        cleanSport,
        cleanName,
        cleanEmail,
        cleanPhone,
        resolvedTurfName,
        venueId,
        cleanBookingCode,
        slotCount: count,
        slots: req.body.slots,
      };

      await pool.query(
        `INSERT INTO payments 
         (transaction_id, merchant_transaction_id, provider_reference_id, user_name, user_email, turf_name, amount, method, status, date, payment_details)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?)`,
        [
          responseData.cf_order_id ? String(responseData.cf_order_id) : orderId,
          orderId,
          responseData.cf_order_id ? String(responseData.cf_order_id) : orderId,
          cleanName,
          cleanEmail,
          resolvedTurfName,
          numericAmount,
          "Cashfree Live",
          cleanDate || new Date().toISOString().split("T")[0],
          JSON.stringify({ ...responseData, initialBookingData }),
        ]
      );
    } catch (dbErr) {
      console.warn("DB payment log warning:", dbErr.message);
    }

    return res.json({
      success: true,
      order_id: responseData.order_id,
      cf_order_id: responseData.cf_order_id,
      payment_session_id: responseData.payment_session_id,
      order_status: responseData.order_status,
      amount: numericAmount,
      environment: CASHFREE_CONFIG.ENV,
    });
  } catch (error) {
    console.error("Cashfree Order Initiation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initiate Cashfree payment.",
      error: error.message,
    });
  }
});

/**
 * 2. GET ORDER & PAYMENT STATUS (Live Verification from Cashfree)
 * GET /api/payment/cashfree/order/:order_id
 * GET /api/payment/cashfree/status/:order_id
 */
router.get(["/order/:order_id", "/status/:order_id"], async (req, res) => {
  try {
    const { order_id } = req.params;
    if (!order_id) {
      return res.status(400).json({ success: false, message: "order_id is required" });
    }

    console.log(`[Cashfree Verify] Fetching status for order: ${order_id}`);
    const pool = getPool();

    // 1. Check local database first
    try {
      const [dbPayments] = await pool.query(
        "SELECT id, status, amount, user_name, user_email, turf_name, method, date, payment_details FROM payments WHERE merchant_transaction_id = ? OR transaction_id = ? LIMIT 1",
        [order_id, order_id]
      );

      if (dbPayments.length > 0 && dbPayments[0].status === "Success") {
        const p = dbPayments[0];
        let details = {};
        try {
          details = typeof p.payment_details === "string" ? JSON.parse(p.payment_details) : (p.payment_details || {});
        } catch (e) {}

        const [dbBookings] = await pool.query(
          "SELECT id, booking_code, user_name, user_email, turf_name, sport, date, time_slot, slot_time, amount, status, payment_method FROM bookings WHERE booking_code = ? OR (user_email = ? AND turf_name = ? AND date = ?) LIMIT 1",
          [details?.initialBookingData?.cleanBookingCode || order_id, p.user_email, p.turf_name, p.date]
        );

        return res.json({
          success: true,
          status: "Success",
          isPaid: true,
          order_status: "PAID",
          transactionId: p.transaction_id || order_id,
          order_id: order_id,
          cf_payment_id: p.transaction_id || order_id,
          amount: parseFloat(p.amount || 0),
          booking: dbBookings[0] || {
            booking_code: order_id,
            turf_name: p.turf_name,
            amount: parseFloat(p.amount || 0),
            date: p.date,
            status: "Confirmed",
          },
          paymentDetails: details,
        });
      }
    } catch (dbCheckErr) {
      console.warn("DB check note:", dbCheckErr.message);
    }

    const orderRes = await fetch(`${CASHFREE_CONFIG.BASE_URL}/orders/${encodeURIComponent(order_id)}`, {
      method: "GET",
      headers: getCashfreeHeaders(),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      console.error("[Cashfree Get Order Error]:", orderData);
      return res.status(orderRes.status).json({
        success: false,
        message: orderData.message || "Failed to retrieve order status from Cashfree",
        error: orderData,
      });
    }

    let paymentsList = [];
    try {
      const paymentsRes = await fetch(`${CASHFREE_CONFIG.BASE_URL}/orders/${encodeURIComponent(order_id)}/payments`, {
        method: "GET",
        headers: getCashfreeHeaders(),
      });
      if (paymentsRes.ok) {
        paymentsList = await paymentsRes.json();
      }
    } catch (e) {
      console.warn("Error fetching payments list:", e.message);
    }

    const isPaid = orderData.order_status === "PAID";
    const successfulPayment = Array.isArray(paymentsList)
      ? paymentsList.find((p) => p.payment_status === "SUCCESS") || paymentsList[0]
      : null;

    const cfPaymentId = successfulPayment?.cf_payment_id ? String(successfulPayment.cf_payment_id) : (orderData.cf_order_id ? String(orderData.cf_order_id) : order_id);
    const paymentMethod = successfulPayment?.payment_group || successfulPayment?.payment_method || "Cashfree Live";
    const numericAmount = parseFloat(orderData.order_amount || 0);

    if (isPaid) {
      const [existingPayments] = await pool.query(
        "SELECT id, status, payment_details FROM payments WHERE merchant_transaction_id = ? OR transaction_id = ? LIMIT 1",
        [order_id, cfPaymentId]
      );

      let initialBookingData = null;
      if (existingPayments.length > 0 && existingPayments[0].payment_details) {
        try {
          const parsed = typeof existingPayments[0].payment_details === "string"
            ? JSON.parse(existingPayments[0].payment_details)
            : existingPayments[0].payment_details;
          initialBookingData = parsed?.initialBookingData || null;
        } catch (e) {}
      }

      const tags = orderData.order_tags || {};
      const turfName = initialBookingData?.resolvedTurfName || tags.turfName || "SportX Arena";
      const turfId = initialBookingData?.venueId ? parseInt(initialBookingData.venueId, 10) : (tags.venueId ? parseInt(tags.venueId, 10) : null);
      const sportName = initialBookingData?.cleanSport || tags.sport || "Football";
      const dateStr = initialBookingData?.cleanDate || tags.date || new Date().toISOString().split("T")[0];
      const timeStr = initialBookingData?.cleanTime || tags.time || "6:00 PM - 7:00 PM";
      const bookingCode = initialBookingData?.cleanBookingCode || tags.bookingCode || `SPX-BK-${Date.now()}`;
      const userEmail = initialBookingData?.cleanEmail || orderData.customer_details?.customer_email || "user@sportxclub.com";
      const userName = initialBookingData?.cleanName || orderData.customer_details?.customer_name || "SportX Player";
      const userPhone = initialBookingData?.cleanPhone || orderData.customer_details?.customer_phone || "9876543210";

      let paymentId = existingPayments[0]?.id;
      if (existingPayments.length > 0) {
        await pool.query(
          `UPDATE payments 
              SET status = 'Success', transaction_id = ?, provider_reference_id = ?, method = ?, payment_details = ?
            WHERE id = ?`,
          [cfPaymentId, cfPaymentId, paymentMethod, JSON.stringify({ orderData, paymentsList, initialBookingData }), paymentId]
        );
      } else {
        const [payRes] = await pool.query(
          `INSERT INTO payments 
           (transaction_id, merchant_transaction_id, provider_reference_id, user_name, user_email, turf_name, amount, method, status, date, payment_details)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Success', ?, ?)`,
          [
            cfPaymentId,
            order_id,
            cfPaymentId,
            userName,
            userEmail,
            turfName,
            numericAmount,
            paymentMethod,
            dateStr,
            JSON.stringify({ orderData, paymentsList, initialBookingData }),
          ]
        );
        paymentId = payRes.insertId;
      }

      const [existingBookings] = await pool.query(
        "SELECT id, booking_code FROM bookings WHERE booking_code = ? OR (user_email = ? AND turf_name = ? AND date = ? AND (time_slot = ? OR slot_time = ?)) LIMIT 1",
        [bookingCode, userEmail, turfName, dateStr, timeStr, timeStr]
      );

      let bookingRecord = existingBookings[0] || null;

      if (!bookingRecord) {
        const [bookRes] = await pool.query(
          `INSERT INTO bookings 
           (booking_code, user_name, user_email, user_phone, turf_name, turf_id, sport, date, time_slot, slot_time, amount, status, payment_method, payment_type)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', 'Cashfree', 'Online')`,
          [
            bookingCode,
            userName,
            userEmail,
            userPhone,
            turfName,
            turfId,
            sportName,
            dateStr,
            timeStr,
            timeStr,
            numericAmount,
          ]
        );
        bookingRecord = { id: bookRes.insertId, booking_code: bookingCode };
      }

      try {
        await pool.query(
          "UPDATE users SET bookings = bookings + 1, games_played = games_played + 1 WHERE LOWER(email) = LOWER(?)",
          [userEmail]
        );
      } catch (e) {}

      sendBookingEmails(bookingRecord?.id || bookingCode, {
        bookingCode,
        userName,
        userEmail,
        userPhone,
        turfName,
        turfId,
        sport: sportName,
        date: dateStr,
        timeSlot: timeStr,
        amount: numericAmount,
        paymentMethod,
      }).catch((mailErr) => console.error("[Cashfree Confirmation Mail Error]:", mailErr.message));

      return res.json({
        success: true,
        status: "Success",
        isPaid: true,
        order_status: orderData.order_status,
        transactionId: cfPaymentId,
        order_id: order_id,
        cf_payment_id: cfPaymentId,
        amount: numericAmount,
        booking: bookingRecord,
        paymentDetails: successfulPayment || orderData,
      });
    } else {
      const failureReason = successfulPayment?.payment_message || (orderData.order_status === "EXPIRED" ? "Order session expired" : "Payment pending or cancelled");

      try {
        await pool.query(
          `UPDATE payments SET status = ?, payment_details = ? WHERE merchant_transaction_id = ?`,
          [orderData.order_status === "ACTIVE" ? "Pending" : "Failed", JSON.stringify({ orderData, paymentsList }), order_id]
        );
      } catch (e) {}

      return res.json({
        success: false,
        status: orderData.order_status === "ACTIVE" ? "Pending" : "Failed",
        isPaid: false,
        order_status: orderData.order_status,
        message: failureReason,
        order_id: order_id,
      });
    }
  } catch (error) {
    console.error("Cashfree Order Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving Cashfree order status.",
      error: error.message,
    });
  }
});



/**
 * 3. FALLBACK VERIFICATION ROUTE
 * POST /api/payment/cashfree/verify
 */
router.post("/verify", optionalAuth, async (req, res) => {
  try {
    const { order_id, bookingPayload } = req.body;
    if (!order_id) {
      return res.status(400).json({ success: false, status: "Failed", message: "order_id is required." });
    }

    const orderRes = await fetch(`${CASHFREE_CONFIG.BASE_URL}/orders/${encodeURIComponent(order_id)}`, {
      method: "GET",
      headers: getCashfreeHeaders(),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok || orderData.order_status !== "PAID") {
      return res.status(400).json({
        success: false,
        status: "Failed",
        message: "Payment is not verified on Cashfree.",
        order_status: orderData?.order_status,
      });
    }

    const pool = getPool();
    const userEmail = bookingPayload?.userEmail || orderData.customer_details?.customer_email || "user@sportxclub.com";
    const userName = bookingPayload?.userName || orderData.customer_details?.customer_name || "SportX Player";
    const turfName = typeof bookingPayload?.venue === "object" ? (bookingPayload.venue?.name || "SportX Arena") : (bookingPayload?.venue || "SportX Arena");
    const turfId = bookingPayload?.venueId || null;
    const numericAmount = parseFloat(orderData.order_amount || bookingPayload?.price || 1200);
    const dateStr = bookingPayload?.date || bookingPayload?.selectedDate || new Date().toISOString().split("T")[0];
    const timeStr = bookingPayload?.time || "6:00 PM - 7:00 PM";
    const sportName = bookingPayload?.sport || "Football";
    const bookingCode = `SPX-BK-${Date.now()}`;
    const cfPaymentId = orderData.cf_order_id ? String(orderData.cf_order_id) : order_id;

    const [payRes] = await pool.query(
      `INSERT INTO payments 
       (transaction_id, merchant_transaction_id, provider_reference_id, user_name, user_email, turf_name, amount, method, status, date, payment_details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Success', ?, ?)
       ON DUPLICATE KEY UPDATE status = 'Success'`,
      [
        cfPaymentId,
        order_id,
        cfPaymentId,
        userName,
        userEmail,
        turfName,
        numericAmount,
        "Cashfree Live",
        dateStr,
        JSON.stringify(orderData),
      ]
    );

    const [bookRes] = await pool.query(
      `INSERT INTO bookings 
       (booking_code, user_name, user_email, user_phone, turf_name, turf_id, sport, date, time_slot, slot_time, amount, status, payment_method, payment_type, order_id, payment_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', 'Cashfree', 'Online', ?, ?)`,
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
        order_id,
        cfPaymentId,
      ]
    );

    sendBookingEmails(bookRes.insertId || bookingCode, {
      bookingCode,
      userName,
      userEmail,
      userPhone: bookingPayload?.userPhone || "9876543210",
      turfName,
      turfId,
      sport: sportName,
      date: dateStr,
      timeSlot: timeStr,
      amount: numericAmount,
      paymentMethod: "Cashfree",
    }).catch((mailErr) => console.error("[Cashfree Verify Mail Error]:", mailErr.message));

    return res.json({
      success: true,
      status: "Success",
      message: "Cashfree Live Payment Verified & Booking Confirmed!",
      paymentId: payRes.insertId,
      bookingId: bookRes.insertId,
      transactionId: cfPaymentId,
      merchantTransactionId: order_id,
    });
  } catch (error) {
    console.error("Cashfree Verify Route Error:", error);
    return res.status(500).json({ success: false, message: "Verification Error", error: error.message });
  }
});

/**
 * 3. VERIFY WALLET TOP-UP PAYMENT & CREDIT BALANCE
 * POST /api/payment/cashfree/verify-wallet-topup
 */
router.post("/verify-wallet-topup", optionalAuth, async (req, res) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const { order_id, topupPayload } = req.body;
    if (!order_id) {
      return res.status(400).json({ success: false, message: "order_id is required." });
    }

    const orderRes = await fetch(`${CASHFREE_CONFIG.BASE_URL}/orders/${encodeURIComponent(order_id)}`, {
      method: "GET",
      headers: getCashfreeHeaders(),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok || orderData.order_status !== "PAID") {
      return res.status(400).json({
        success: false,
        status: "Failed",
        message: "Wallet Top-up payment is not verified on Cashfree.",
        order_status: orderData?.order_status,
      });
    }

    const numericAmount = parseFloat(orderData.order_amount || topupPayload?.amount || 0);
    const userEmail = (topupPayload?.userEmail || orderData.customer_details?.customer_email || req.user?.email || "").trim();
    const userName = topupPayload?.userName || orderData.customer_details?.customer_name || req.user?.fullName || "SportX Player";
    const cfPaymentId = orderData.cf_order_id ? String(orderData.cf_order_id) : order_id;

    // Resolve user from database
    const [userRows] = await connection.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR id = ? LIMIT 1",
      [userEmail, req.user?.id || 0]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: "Player account not found for wallet top-up" });
    }

    const user = userRows[0];

    await connection.beginTransaction();

    // 1. Credit wallet
    await connection.query("INSERT IGNORE INTO player_wallets (user_id, balance) VALUES (?, 0)", [user.id]);
    await connection.query("UPDATE player_wallets SET balance = balance + ? WHERE user_id = ?", [numericAmount, user.id]);

    // 2. Add wallet ledger transaction
    await connection.query(
      `INSERT INTO wallet_transactions (user_id, type, label, amount, status, is_credit)
       VALUES (?, 'Top Up', ?, ?, 'Success', 1)`,
      [user.id, `Cashfree UPI Top-Up (Ref: ${cfPaymentId})`, numericAmount]
    );

    // 3. Record in payments table
    await connection.query(
      `INSERT INTO payments 
       (transaction_id, merchant_transaction_id, provider_reference_id, user_name, user_email, turf_name, amount, method, status, date, payment_details)
       VALUES (?, ?, ?, ?, ?, 'SportX Wallet Top-Up', ?, 'Cashfree UPI/Card', 'Success', CURDATE(), ?)
       ON DUPLICATE KEY UPDATE status = 'Success'`,
      [cfPaymentId, order_id, cfPaymentId, userName, userEmail, numericAmount, JSON.stringify(orderData)]
    );

    await connection.commit();

    const [[wallet]] = await connection.query("SELECT balance FROM player_wallets WHERE user_id = ?", [user.id]);

    return res.json({
      success: true,
      status: "Success",
      message: `₹${numericAmount} added to your SportX Wallet successfully!`,
      newBalance: wallet ? wallet.balance : numericAmount,
      transactionId: cfPaymentId,
      orderId: order_id,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Cashfree Wallet Topup Verify Error:", error);
    return res.status(500).json({ success: false, message: "Topup Verification Error", error: error.message });
  } finally {
    connection.release();
  }
});

/**
 * 4. REAL-TIME CASHFREE WEBHOOK HANDLER (Strict Signature Verification)
 * POST /api/payment/cashfree/webhook
 */
router.post("/webhook", async (req, res) => {
  try {
    const timestamp = req.headers["x-webhook-timestamp"];
    const signature = req.headers["x-webhook-signature"];

    console.log(`[Cashfree Webhook] Received webhook event: ${req.body?.type}`);

    // Strictly enforce signature validation in production
    if (process.env.NODE_ENV === "production" || signature) {
      if (!signature || !timestamp || !verifyCashfreeWebhookSignature(timestamp, req.body, signature)) {
        console.warn("[Cashfree Webhook] Webhook signature verification rejected.");
        return res.status(401).json({ status: "Error", message: "Invalid or missing webhook signature" });
      }
    }

    const { type, data } = req.body;
    const pool = getPool();

    if (type === "PAYMENT_SUCCESS_WEBHOOK" || type === "ORDER_PAID") {
      const order = data?.order || {};
      const payment = data?.payment || {};
      const orderId = order.order_id;
      const cfPaymentId = payment.cf_payment_id ? String(payment.cf_payment_id) : orderId;

      console.log(`[Cashfree Webhook SUCCESS] Order: ${orderId}, Payment ID: ${cfPaymentId}`);

      if (orderId) {
        await pool.query(
          `UPDATE payments SET status = 'Success', transaction_id = ?, provider_reference_id = ? WHERE merchant_transaction_id = ?`,
          [cfPaymentId, cfPaymentId, orderId]
        );

        sendBookingEmails(orderId).catch((e) => {});
      }
    }

    return res.status(200).json({ status: "OK", received: true });
  } catch (webhookErr) {
    console.error("Cashfree Webhook Error:", webhookErr);
    return res.status(200).json({ status: "Error", error: webhookErr.message });
  }
});

/**
 * Helper to process direct refund back to original payment method via Cashfree PG API
 */
export async function processCashfreeRefund(orderId, refundAmount, reason = "Booking cancellation") {
  if (!orderId) {
    throw new Error("Cashfree order_id is required to process refund");
  }

  const refundId = `ref_${orderId.replace(/[^a-zA-Z0-9_-]/g, "")}_${Date.now()}`.slice(0, 40);
  const refundPayload = {
    refund_amount: Number(parseFloat(refundAmount).toFixed(2)),
    refund_id: refundId,
    refund_note: String(reason).slice(0, 100),
    refund_speed: "STANDARD",
  };

  const response = await fetch(`${CASHFREE_CONFIG.BASE_URL}/orders/${encodeURIComponent(orderId)}/refunds`, {
    method: "POST",
    headers: getCashfreeHeaders(),
    body: JSON.stringify(refundPayload),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Cashfree refund failed with HTTP ${response.status}`;
    console.error("[Cashfree Refund Error]:", errorMsg, data);
    throw new Error(errorMsg);
  }

  return {
    success: true,
    refund_id: data.refund_id || refundId,
    cf_refund_id: data.cf_refund_id,
    order_id: data.order_id || orderId,
    refund_amount: data.refund_amount || refundAmount,
    refund_status: data.refund_status || "SUCCESS",
    refund_arn: data.refund_arn || null,
    status_description: data.status_description || "Refund initiated to original payment source",
  };
}

/**
 * 6. PROCESS DIRECT REFUND ENDPOINT (Admin / Internal)
 * POST /api/payment/cashfree/refund
 */
router.post("/refund", authenticateToken, async (req, res) => {
  try {
    const { order_id, amount, reason } = req.body;
    if (!order_id || !amount) {
      return res.status(400).json({ success: false, error: "order_id and amount are required." });
    }

    const result = await processCashfreeRefund(order_id, amount, reason);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("Cashfree Refund Endpoint Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
