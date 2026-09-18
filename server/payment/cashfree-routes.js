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
  let frontendUrl = (process.env.APP_FRONTEND_URL || "https://sportxclub.com").replace(/\/+$/, "");
  if (!frontendUrl.startsWith("https://") && process.env.NODE_ENV === "production") {
    frontendUrl = "https://sportxclub.com";
  }

  let backendUrl = (process.env.APP_BACKEND_URL || "https://sportxclub.com").replace(/\/+$/, "");
  if (!backendUrl.startsWith("https://") && process.env.NODE_ENV === "production") {
    backendUrl = "https://sportxclub.com";
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

    // Authoritative Server-Side Pricing: Fetch true price from MySQL database
    let authoritativeAmount = parseFloat(amount || 1200);
    let resolvedTurfName = String(turfName || "SportX Turf").trim();

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
            authoritativeAmount = dbPrice;
          }
          resolvedTurfName = rows[0].name || resolvedTurfName;
        }
      } catch (dbLookupErr) {
        console.warn("DB Price lookup note:", dbLookupErr.message);
      }
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

    const { frontendUrl, backendUrl } = getAppUrls(req);
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
      order_note: `SportXClub Booking: ${resolvedTurfName} (${cleanSport})`,
      order_tags: {
        turfName: resolvedTurfName.slice(0, 40),
        sport: cleanSport.slice(0, 40),
        date: cleanDate.slice(0, 20),
        time: cleanTime.slice(0, 30),
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

    // Save pending transaction in MySQL payments table
    try {
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

    const pool = getPool();

    if (isPaid) {
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
 * 5. PAYMENT HISTORY (Secured: User can only access their own history)
 * GET /api/payment/cashfree/history
 */
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const authUser = req.user;
    const isAdmin = authUser.role === "Admin" || authUser.role === "Super Admin" || authUser.accountType === "cms-admin";

    let sql = "SELECT * FROM payments";
    const params = [];

    if (!isAdmin) {
      sql += " WHERE LOWER(user_email) = LOWER(?)";
      params.push(authUser.email);
    } else if (req.query.email) {
      sql += " WHERE LOWER(user_email) = LOWER(?)";
      params.push(req.query.email.trim());
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
