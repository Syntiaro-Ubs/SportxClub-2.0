import express from "express";
import { getPool } from "../db.js";
import {
  CASHFREE_CONFIG,
  hasCashfreeCredentials,
  getCashfreeHeaders,
  verifyCashfreeWebhookSignature,
} from "./cashfree-config.js";

const router = express.Router();

/**
 * Helper to get clean frontend & backend URLs
 * Note: Cashfree Live (Production) strictly requires HTTPS for return_url
 */
function getAppUrls(req) {
  let frontendUrl = (process.env.APP_FRONTEND_URL || "https://sportxclub.com").replace(/\/+$/, "");
  if (!frontendUrl.startsWith("https://")) {
    frontendUrl = "https://sportxclub.com";
  }

  let backendUrl = (process.env.APP_BACKEND_URL || "https://sportxclub.com").replace(/\/+$/, "");
  if (!backendUrl.startsWith("https://")) {
    backendUrl = "https://sportxclub.com";
  }

  return { frontendUrl, backendUrl };
}

/**
 * 1. CREATE CASHFREE ORDER & GET PAYMENT SESSION ID
 * POST /api/payment/cashfree/create-order
 * POST /api/payment/cashfree/initiate
 */
router.post(["/create-order", "/initiate"], async (req, res) => {
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

    const numericAmount = parseFloat(amount || 1200);
    const formattedAmount = numericAmount.toFixed(2);
    
    // Generate clean unique Cashfree Order ID (alphanumeric and underscore, max 45 chars)
    const uniqueSuffix = `${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const orderId = `SPX_${uniqueSuffix}`;

    const cleanEmail = (userEmail || "user@sportxclub.com").trim().toLowerCase();
    const cleanName = String(userName || "SportX Player").replace(/[^a-zA-Z0-9 ]/g, "").trim() || "SportX Player";
    const rawPhone = String(userPhone || "9876543210").replace(/[^0-9]/g, "");
    const cleanPhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : "9876543210";
    
    const cleanCustomerId = `cust_${cleanPhone}_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "").slice(0, 15)}`;
    const cleanTurf = String(turfName || "SportX Turf").trim();
    const cleanDate = String(date || "").trim();
    const cleanTime = String(time || "").trim();
    const cleanSport = String(sport || "Sports").trim();
    const cleanBookingCode = String(bookingCode || `SPXBK${Date.now()}`).trim();

    const { frontendUrl, backendUrl } = getAppUrls(req);
    // Return URL where Cashfree redirects the customer after checkout
    const returnUrl = `${frontendUrl}/payment-status?order_id={order_id}`;
    const notifyUrl = `${backendUrl}/api/payment/cashfree/webhook`;

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
      order_note: `SportXClub Booking: ${cleanTurf} (${cleanSport})`,
      order_tags: {
        turfName: cleanTurf.slice(0, 40),
        sport: cleanSport.slice(0, 40),
        date: cleanDate.slice(0, 20),
        time: cleanTime.slice(0, 30),
        venueId: String(venueId || ""),
        bookingCode: cleanBookingCode.slice(0, 40),
      },
    };

    console.log(`[Cashfree Live PG] Creating Order: ${orderId} for ₹${formattedAmount} at ${cleanTurf}`);

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

    // Save pending transaction in MySQL payments table
    try {
      const pool = getPool();
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
          cleanTurf,
          numericAmount,
          "Cashfree Live",
          cleanDate || new Date().toISOString().split("T")[0],
          JSON.stringify(responseData),
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

    // 1. Fetch Order status from Cashfree API
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

    // 2. Fetch Payments attempt list for this order
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

    const pool = getPool();

    if (isPaid) {
      // Tags / Metadata stored during order creation
      const tags = orderData.order_tags || {};
      const turfName = tags.turfName || "SportX Arena";
      const turfId = tags.venueId ? parseInt(tags.venueId, 10) : null;
      const sportName = tags.sport || "Football";
      const dateStr = tags.date || new Date().toISOString().split("T")[0];
      const timeStr = tags.time || "6:00 PM - 7:00 PM";
      const bookingCode = tags.bookingCode || `SPX-BK-${Date.now()}`;
      const userEmail = orderData.customer_details?.customer_email || "user@sportxclub.com";
      const userName = orderData.customer_details?.customer_name || "SportX Player";
      const userPhone = orderData.customer_details?.customer_phone || "9876543210";

      // 1. Update/Insert into payments table
      const [existingPayments] = await pool.query(
        "SELECT id, status FROM payments WHERE merchant_transaction_id = ? OR transaction_id = ? LIMIT 1",
        [order_id, cfPaymentId]
      );

      let paymentId = existingPayments[0]?.id;
      if (existingPayments.length > 0) {
        await pool.query(
          `UPDATE payments 
              SET status = 'Success', transaction_id = ?, provider_reference_id = ?, method = ?, payment_details = ?
            WHERE id = ?`,
          [cfPaymentId, cfPaymentId, paymentMethod, JSON.stringify({ orderData, paymentsList }), paymentId]
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
            JSON.stringify({ orderData, paymentsList }),
          ]
        );
        paymentId = payRes.insertId;
      }

      // 2. Insert Confirmed Booking into bookings table if not already present
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

      // 3. Update user statistics
      try {
        await pool.query(
          "UPDATE users SET bookings = bookings + 1, games_played = games_played + 1 WHERE LOWER(email) = LOWER(?)",
          [userEmail]
        );
      } catch (e) {}

      console.log(`[Cashfree Confirmed] Order: ${order_id}, Payment ID: ${cfPaymentId}, Status: PAID`);

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
      // Order not yet paid or failed
      const failureReason = successfulPayment?.payment_message || (orderData.order_status === "EXPIRED" ? "Order session expired" : "Payment pending or cancelled");

      // Update payment record if exists
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
router.post("/verify", async (req, res) => {
  try {
    const { order_id, bookingPayload } = req.body;
    if (!order_id) {
      return res.status(400).json({ success: false, status: "Failed", message: "order_id is required." });
    }

    // Call internal verification logic
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

    // Save payment
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

    // Save booking
    const [bookRes] = await pool.query(
      `INSERT INTO bookings 
       (booking_code, user_name, user_email, user_phone, turf_name, turf_id, sport, date, time_slot, slot_time, amount, status, payment_method, payment_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', 'Cashfree', 'Online')`,
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
 * 4. REAL-TIME CASHFREE WEBHOOK HANDLER
 * POST /api/payment/cashfree/webhook
 */
router.post("/webhook", async (req, res) => {
  try {
    const timestamp = req.headers["x-webhook-timestamp"];
    const signature = req.headers["x-webhook-signature"];

    console.log(`[Cashfree Webhook] Received webhook event: ${req.body?.type}`);

    // Verify webhook signature if present
    if (signature && timestamp) {
      const isValid = verifyCashfreeWebhookSignature(timestamp, req.body, signature);
      if (!isValid) {
        console.warn("[Cashfree Webhook] Invalid signature received.");
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
      }
    }

    return res.status(200).json({ status: "OK", received: true });
  } catch (webhookErr) {
    console.error("Cashfree Webhook Error:", webhookErr);
    return res.status(200).json({ status: "Error", error: webhookErr.message });
  }
});

/**
 * 5. PAYMENT HISTORY
 * GET /api/payment/cashfree/history
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
    console.error("Cashfree History Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
