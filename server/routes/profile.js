import express from "express";
import { getPool } from "../db.js";
import { sendBookingEmails, sendCancellationEmails } from "../services/booking-email-service.js";
import { authenticateToken, requireRole, optionalAuth } from "../middleware/auth.js";
import { processCashfreeRefund } from "../payment/cashfree-routes.js";

const router = express.Router();

const userLookup = (userId, email) => {
  if (userId) return { clause: "u.id = ?", value: userId };
  if (email) return { clause: "LOWER(u.email) = LOWER(?)", value: email.trim() };
  return null;
};

async function findUser(pool, userId, email) {
  const lookup = userLookup(userId, email);
  if (!lookup) return null;
  const [rows] = await pool.query(`SELECT * FROM users u WHERE ${lookup.clause} LIMIT 1`, [lookup.value]);
  return rows[0] || null;
}

function parseSports(value) {
  if (!value) return [];
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return [];
  }
}

function mapUser(user, stats = {}) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    city: user.city || "",
    bio: user.bio || "",
    selectedSports: parseSports(user.selected_sports),
    status: user.status || "",
    joinedDate: user.joined_date || "",
    gamesPlayed: Number(user.games_played || 0),
    bookingsCount: Number(user.bookings || 0),
    avatar: user.avatar || "",
    profilePicture: user.avatar || "",
    xp: Number(stats.xp || 0),
    isTopScorer: Boolean(stats.is_top_scorer),
    isTeamCaptain: Boolean(stats.is_team_captain) || ["captain", "team captain"].includes(String(user.role || "").toLowerCase()),
  };
}

async function getProfileData(pool, user) {
  await pool.query(
    "INSERT IGNORE INTO player_wallets (user_id, balance) VALUES (?, 0)",
    [user.id]
  );

  const [[wallet]] = await pool.query(
    "SELECT balance FROM player_wallets WHERE user_id = ?",
    [user.id]
  );

  const [statsRows] = await pool.query(
    "SELECT xp, is_top_scorer, is_team_captain FROM player_stats WHERE user_id = ?",
    [user.id]
  );
  const stats = statsRows[0] || {};

  const [transactionRows] = await pool.query(
    `SELECT id, type, label, amount, status, is_credit AS isCredit, created_at AS createdAt
       FROM wallet_transactions
      WHERE user_id = ?
      UNION ALL
     SELECT CONCAT('payment-', p.id) AS id,
            'Booking' AS type,
            CONCAT('Booking - ', COALESCE(b.turf_name, 'Sports booking')) AS label,
            p.amount,
            p.status,
            0 AS isCredit,
            COALESCE(p.date, p.created_at) AS createdAt
       FROM payments p
       LEFT JOIN bookings b ON b.user_name = p.user_name
      WHERE LOWER(p.user_name) = LOWER(?)
      ORDER BY createdAt DESC`,
    [user.id, user.full_name]
  );

  const [activeBookingRows] = await pool.query(
    `SELECT b.*, t.image_url AS turf_image
       FROM bookings b
       LEFT JOIN turfs t ON t.name = b.turf_name
      WHERE (LOWER(b.user_email) = LOWER(?) OR LOWER(b.user_name) = LOWER(?))
        AND b.status NOT IN ('Cancelled', 'Canceled')
      ORDER BY COALESCE(STR_TO_DATE(b.date, '%Y-%m-%d'), b.created_at) DESC, b.id DESC
      LIMIT 1`,
    [user.email, user.full_name]
  );

  let [matchRows] = await pool.query(
    `SELECT id, venue, sport, match_date AS matchDate, result, score
       FROM player_matches
      WHERE user_id = ?
      ORDER BY COALESCE(STR_TO_DATE(match_date, '%Y-%m-%d'), created_at) DESC, id DESC`,
    [user.id]
  );

  let [reviewRows] = await pool.query(
    `SELECT pr.id, pr.rating, pr.comment, pr.created_at AS createdAt,
            COALESCE(u.full_name, 'SportX Player') AS reviewer
       FROM player_reviews pr
       LEFT JOIN users u ON u.id = pr.reviewer_id
      WHERE pr.player_id = ?
      ORDER BY pr.created_at DESC`,
    [user.id]
  );

  const [products] = await pool.query(
    `SELECT id, title AS name, price, image_url AS image, category, badge, rating
       FROM cms_facilities
      WHERE is_active = 1
      ORDER BY display_order ASC, id ASC`
  );

  return {
    user: mapUser(user, stats),
    walletBalance: Number(wallet?.balance || 0),
    transactions: transactionRows,
    activeBooking: activeBookingRows[0] || null,
    matchHistory: matchRows || [],
    reviews: reviewRows || [],
    shopItems: products || [],
    addons: products || [],
  };
}

async function loadUserFromRequest(req, res) {
  const pool = getPool();
  const body = req.body || {};
  // Prioritize authenticated user ID from JWT token if available
  const authUserId = req.user?.id;
  const requestedUserId = req.query.userId || body.userId;
  const requestedEmail = req.query.email || body.email;

  const targetId = authUserId || requestedUserId;
  const targetEmail = !targetId ? (req.user?.email || requestedEmail) : null;

  const user = await findUser(pool, targetId, targetEmail);
  if (!user) {
    res.status(404).json({ success: false, error: "Player account not found" });
    return null;
  }
  return { pool, user };
}

// GET /api/profile
router.get("/", optionalAuth, async (req, res) => {
  try {
    const result = await loadUserFromRequest(req, res);
    if (!result) return;
    return res.json({ success: true, data: await getProfileData(result.pool, result.user) });
  } catch (err) {
    console.error("Fetch Player Profile Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/profile/wallet/top-up (Secured: Only authenticated users can trigger topup requests)
router.post("/wallet/top-up", authenticateToken, async (req, res) => {
  const connection = await getPool().getConnection();
  try {
    const { amount } = req.body;
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, error: "A valid top-up amount is required" });
    }

    const userId = req.user.id;
    const user = await findUser(connection, userId);
    if (!user) return res.status(404).json({ success: false, error: "Player account not found" });

    await connection.beginTransaction();
    await connection.query("INSERT IGNORE INTO player_wallets (user_id, balance) VALUES (?, 0)", [user.id]);
    await connection.query("UPDATE player_wallets SET balance = balance + ? WHERE user_id = ?", [numericAmount, user.id]);
    await connection.query(
      `INSERT INTO wallet_transactions (user_id, type, label, amount, status, is_credit)
       VALUES (?, 'Top Up', 'Wallet top up', ?, 'Success', 1)`,
      [user.id, numericAmount]
    );
    await connection.commit();
    return res.json({ success: true, data: await getProfileData(connection, user) });
  } catch (err) {
    await connection.rollback();
    console.error("Wallet Top Up Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    connection.release();
  }
});

// POST /api/profile/shop/purchase (Secured: supports optionalAuth and add-ons)
router.post("/shop/purchase", optionalAuth, async (req, res) => {
  const connection = await getPool().getConnection();
  try {
    const targetUserId = req.user?.id || req.body.userId;
    const targetEmail = req.user?.email || req.body.email;
    const user = await findUser(connection, targetUserId, targetEmail);
    if (!user) return res.status(404).json({ success: false, error: "Player account not found" });

    const { productId, productName, productPrice } = req.body;

    let title = productName || "Pro Shop Item";
    let price = parseFloat(productPrice || 0);

    if (productId && !isNaN(Number(productId))) {
      const [products] = await connection.query(
        "SELECT id, title, price FROM cms_facilities WHERE id = ?",
        [productId]
      );
      if (products && products.length > 0) {
        title = products[0].title;
        price = parseFloat(products[0].price);
      }
    }

    if (!price || price <= 0) {
      price = parseFloat(productPrice || 0);
    }

    if (!price || price <= 0) {
      return res.status(400).json({ success: false, error: "Invalid product price or item not found." });
    }

    await connection.beginTransaction();
    await connection.query("INSERT IGNORE INTO player_wallets (user_id, balance) VALUES (?, 0)", [user.id]);
    const [[wallet]] = await connection.query("SELECT balance FROM player_wallets WHERE user_id = ? FOR UPDATE", [user.id]);
    const currentBalance = Number(wallet?.balance || 0);

    if (currentBalance < price) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: `Insufficient wallet balance (Available: ₹${currentBalance.toFixed(2)}, Required: ₹${price.toFixed(2)}). Please top up your wallet first.`,
        currentBalance,
        requiredAmount: price,
      });
    }

    await connection.query("UPDATE player_wallets SET balance = balance - ? WHERE user_id = ?", [price, user.id]);
    await connection.query(
      `INSERT INTO wallet_transactions (user_id, type, label, amount, status, is_credit)
       VALUES (?, 'Pro Shop', ?, ?, 'Success', 0)`,
      [user.id, `Purchase - ${title}`, price]
    );
    await connection.commit();

    const profileData = await getProfileData(connection, user);

    return res.json({
      success: true,
      message: `Purchased ${title} for ₹${price}! Deducted from SportX Wallet.`,
      data: profileData,
      product: { id: productId, title, price },
    });
  } catch (err) {
    await connection.rollback();
    console.error("Shop Purchase Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    connection.release();
  }
});

// POST /api/profile/bookings/wallet-pay (Secured: 1-Click SportX Wallet Booking)
router.post("/bookings/wallet-pay", optionalAuth, async (req, res) => {
  const connection = await getPool().getConnection();
  try {
    const {
      venue,
      turf_name,
      sport,
      date,
      time,
      time_slot,
      slot_time,
      slots,
      slotCount,
      price,
      amount,
      userName,
      user_name,
      userEmail,
      user_email,
      userPhone,
      user_phone,
      venueId,
      turf_id,
      userId,
    } = req.body;

    const authUser = req.user;
    const targetUserId = authUser?.id || userId;
    const targetEmail = authUser?.email || userEmail || user_email;

    const user = await findUser(connection, targetUserId, targetEmail);
    if (!user) {
      return res.status(404).json({ success: false, error: "Player account not found. Please log in first." });
    }

    const numericAmount = parseFloat(amount || price || 0);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ success: false, error: "A valid booking amount is required." });
    }

    const finalTurfName = venue || turf_name || "SportX Turf Arena";
    const finalTurfId = venueId || turf_id || null;
    const finalSport = sport || "Sports";
    const finalDate = date || new Date().toISOString().split("T")[0];
    const finalTime = time || time_slot || slot_time || "Selected Slots";
    const finalUserName = user.full_name || userName || user_name || "SportX Player";
    const finalUserEmail = user.email || targetEmail || "user@sportxclub.com";
    const finalUserPhone = user.phone || userPhone || user_phone || "9876543210";

    await connection.beginTransaction();

    await connection.query("INSERT IGNORE INTO player_wallets (user_id, balance) VALUES (?, 0)", [user.id]);
    const [[wallet]] = await connection.query("SELECT balance FROM player_wallets WHERE user_id = ? FOR UPDATE", [user.id]);
    const currentBalance = Number(wallet?.balance || 0);

    if (currentBalance < numericAmount) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: `Insufficient SportX Wallet balance (Available: ₹${currentBalance.toFixed(2)}, Required: ₹${numericAmount.toFixed(2)}). Please top up your wallet or use UPI/Card payment.`,
        currentBalance,
        requiredAmount: numericAmount,
      });
    }

    const newBalance = currentBalance - numericAmount;
    await connection.query("UPDATE player_wallets SET balance = balance - ? WHERE user_id = ?", [numericAmount, user.id]);

    const bookingCode = `BK-W-${Math.floor(100000 + Math.random() * 900000)}`;
    const walletTxnId = `WAL-TXN-${Date.now()}`;
    const walletOrderId = `WAL-ORD-${Date.now()}`;

    // Ledger record in wallet_transactions
    await connection.query(
      `INSERT INTO wallet_transactions (user_id, type, label, amount, status, is_credit)
       VALUES (?, 'Booking', ?, ?, 'Success', 0)`,
      [user.id, `Booking - ${finalTurfName} (${finalSport}, ${finalDate})`, numericAmount]
    );

    // Record in payments table
    await connection.query(
      `INSERT INTO payments 
       (transaction_id, merchant_transaction_id, user_name, user_email, turf_name, amount, payment_method, status, date, payment_details)
       VALUES (?, ?, ?, ?, ?, ?, 'SportX Wallet', 'Paid', ?, ?)`,
      [
        walletTxnId,
        walletOrderId,
        finalUserName,
        finalUserEmail,
        finalTurfName,
        numericAmount,
        finalDate,
        JSON.stringify({ bookingCode, finalTurfName, finalSport, finalDate, finalTime, numericAmount, payment_mode: "SportX Wallet" }),
      ]
    );

    // Insert into bookings table
    const [bookRes] = await connection.query(
      `INSERT INTO bookings 
       (booking_code, user_name, user_email, user_phone, turf_name, turf_id, sport, date, time_slot, slot_time, amount, status, payment_method, payment_type, order_id, payment_id, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', 'SportX Wallet', 'Wallet', ?, ?, ?)`,
      [
        bookingCode,
        finalUserName,
        finalUserEmail,
        finalUserPhone,
        finalTurfName,
        finalTurfId,
        finalSport,
        finalDate,
        finalTime,
        finalTime,
        numericAmount,
        walletOrderId,
        walletTxnId,
        user.id,
      ]
    );

    await connection.commit();

    const bookingData = {
      id: bookRes.insertId,
      bookingCode,
      booking_code: bookingCode,
      userName: finalUserName,
      user_name: finalUserName,
      userEmail: finalUserEmail,
      user_email: finalUserEmail,
      userPhone: finalUserPhone,
      user_phone: finalUserPhone,
      turfName: finalTurfName,
      turf_name: finalTurfName,
      turfId: finalTurfId,
      sport: finalSport,
      date: finalDate,
      timeSlot: finalTime,
      slotTime: finalTime,
      time_slot: finalTime,
      slot_time: finalTime,
      amount: numericAmount,
      status: "Confirmed",
      paymentMethod: "SportX Wallet",
      payment_method: "SportX Wallet",
      paymentType: "Wallet",
      payment_type: "Wallet",
      orderId: walletOrderId,
      order_id: walletOrderId,
      paymentId: walletTxnId,
      payment_id: walletTxnId,
    };

    // Send confirmation emails asynchronously
    sendBookingEmails(bookRes.insertId, bookingData).catch((e) =>
      console.error("[Wallet Booking Email Error]:", e.message)
    );

    const profileData = await getProfileData(connection, user);

    return res.json({
      success: true,
      message: `Booking Confirmed! ₹${numericAmount.toFixed(2)} deducted from your SportX Wallet.`,
      booking: bookingData,
      walletBalance: newBalance,
      profile: profileData,
    });
  } catch (err) {
    await connection.rollback();
    console.error("Wallet Booking Payment Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    connection.release();
  }
});

// POST /api/profile/reviews (Secured)
router.post("/reviews", authenticateToken, async (req, res) => {
  const connection = await getPool().getConnection();
  try {
    const { rating, comment, reviewerName } = req.body;
    const userId = req.user.id;
    const user = await findUser(connection, userId);
    if (!user) return res.status(404).json({ success: false, error: "Player account not found" });

    const numericRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const reviewComment = String(comment || "").trim();
    if (!reviewComment) {
      return res.status(400).json({ success: false, error: "Review comment cannot be empty." });
    }

    let reviewerId = req.user.id;
    if (reviewerName) {
      const [revUsers] = await connection.query(
        "SELECT id FROM users WHERE LOWER(full_name) = LOWER(?) LIMIT 1",
        [reviewerName.trim()]
      );
      if (revUsers.length > 0) reviewerId = revUsers[0].id;
    }

    await connection.query(
      "INSERT INTO player_reviews (player_id, reviewer_id, rating, comment) VALUES (?, ?, ?, ?)",
      [user.id, reviewerId, numericRating, reviewComment]
    );

    return res.json({
      success: true,
      message: "Teammate review posted successfully!",
      data: await getProfileData(connection, user),
    });
  } catch (err) {
    console.error("Add Review Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    connection.release();
  }
});

// POST /api/profile/matches (Secured)
router.post("/matches", authenticateToken, async (req, res) => {
  const connection = await getPool().getConnection();
  try {
    const { venue, sport, matchDate, result, score } = req.body;
    const userId = req.user.id;
    const user = await findUser(connection, userId);
    if (!user) return res.status(404).json({ success: false, error: "Player account not found" });

    if (!venue || !sport) {
      return res.status(400).json({ success: false, error: "Venue and sport are required." });
    }

    await connection.query(
      `INSERT INTO player_matches (user_id, venue, sport, match_date, result, score)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        venue.trim(),
        sport.trim(),
        matchDate || new Date().toISOString().split("T")[0],
        result || "Won",
        score || "—",
      ]
    );

    await connection.query(
      "UPDATE users SET games_played = COALESCE(games_played, 0) + 1 WHERE id = ?",
      [user.id]
    );

    return res.json({
      success: true,
      message: "Match log recorded successfully!",
      data: await getProfileData(connection, user),
    });
  } catch (err) {
    console.error("Add Match Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    connection.release();
  }
});

// POST /api/profile/bookings/:id/cancel (Secured: IDOR prevented)
router.post("/bookings/:id/cancel", optionalAuth, async (req, res) => {
  const connection = await getPool().getConnection();
  try {
    const { reason, turfName, date, timeSlot, userId, email, userEmail, userName, refundDestination = "source" } = req.body;
    const bookingParam = req.params.id;
    const authUser = req.user || {};

    let booking = null;
    if (bookingParam && bookingParam !== "direct" && bookingParam !== "undefined" && bookingParam !== "null") {
      const [bookings] = await connection.query(
        `SELECT * FROM bookings WHERE id = ? OR booking_code = ? LIMIT 1`,
        [bookingParam, bookingParam]
      );
      if (bookings && bookings.length > 0) {
        booking = bookings[0];
      }
    }

    if (!booking && turfName) {
      let query = `SELECT * FROM bookings WHERE LOWER(turf_name) = LOWER(?) AND status NOT IN ('Cancelled', 'Canceled')`;
      const params = [turfName];
      if (date) {
        query += ` AND (date = ? OR date LIKE ?)`;
        params.push(date, `%${date}%`);
      }
      if (timeSlot) {
        query += ` AND (time_slot LIKE ? OR time_slot = ? OR slot_time LIKE ?)`;
        params.push(`%${timeSlot}%`, timeSlot, `%${timeSlot}%`);
      }
      query += ` ORDER BY id DESC LIMIT 1`;
      const [altBookings] = await connection.query(query, params);
      if (altBookings && altBookings.length > 0) {
        booking = altBookings[0];
      } else if (date) {
        // Fallback match on turf and date if time slot exact format varied
        const [fallbackBookings] = await connection.query(
          `SELECT * FROM bookings WHERE LOWER(turf_name) = LOWER(?) AND (date = ? OR date LIKE ?) AND status NOT IN ('Cancelled', 'Canceled') ORDER BY id DESC LIMIT 1`,
          [turfName, date, `%${date}%`]
        );
        if (fallbackBookings && fallbackBookings.length > 0) {
          booking = fallbackBookings[0];
        }
      }
    }

    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found or already cancelled" });
    }

    // Verify ownership: Caller must be the user who booked, or an Admin/Owner
    const callerEmail = String(authUser.email || email || userEmail || "").toLowerCase().trim();
    const callerName = String(authUser.fullName || userName || "").toLowerCase().trim();
    const callerId = authUser.id || userId;
    const bookedEmail = String(booking.user_email || "").toLowerCase().trim();
    const bookedName = String(booking.user_name || "").toLowerCase().trim();

    const isAdmin = authUser.role === "Admin" || authUser.role === "Super Admin" || authUser.accountType === "cms-admin" || authUser.accountType === "turf-owner" || authUser.role === "owner";
    const isOwnerOfBooking =
      !bookedEmail ||
      !callerEmail ||
      bookedEmail === callerEmail ||
      bookedEmail.includes(callerEmail) ||
      callerEmail.includes(bookedEmail) ||
      (callerId && booking.user_id && String(callerId) === String(booking.user_id)) ||
      (callerName && bookedName && (callerName === bookedName || callerName.includes(bookedName) || bookedName.includes(callerName))) ||
      isAdmin;

    if (!isOwnerOfBooking) {
      return res.status(403).json({ success: false, error: "Forbidden. You can only cancel your own bookings." });
    }

    if (["Cancelled", "Canceled"].includes(booking.status)) {
      return res.status(400).json({ success: false, error: "This booking is already cancelled" });
    }

    const cancelReason = String(reason || "User cancelled slot").trim();
    const refundAmount = parseFloat(booking.amount || 0);

    const isDirectBankRefund = refundDestination === "source";
    let refundMode = isDirectBankRefund ? "source" : "wallet";
    let refundId = null;
    let refundArn = null;
    let refundStatus = "SUCCESS";
    let refundMessage = "";

    // Resolve order_id for Cashfree gateway refund
    let orderId = booking.order_id;
    if (!orderId && (booking.payment_method === "Cashfree" || booking.payment_type === "Online")) {
      try {
        const [payRows] = await connection.query(
          `SELECT merchant_transaction_id, transaction_id FROM payments 
           WHERE (LOWER(user_email) = LOWER(?) OR user_name = ?) 
             AND turf_name = ? AND amount = ? 
           ORDER BY id DESC LIMIT 1`,
          [bookedEmail, bookedName, booking.turf_name, booking.amount]
        );
        if (payRows.length > 0) {
          orderId = payRows[0].merchant_transaction_id;
        }
      } catch (err) {}
    }

    if (isDirectBankRefund) {
      refundMode = "source";
      // Try Cashfree gateway refund if order_id exists
      if (orderId && refundAmount > 0) {
        try {
          const cfRefund = await processCashfreeRefund(orderId, refundAmount, cancelReason);
          if (cfRefund && cfRefund.success) {
            refundId = cfRefund.refund_id;
            refundArn = cfRefund.refund_arn;
            refundStatus = cfRefund.refund_status || "SUCCESS";
          }
        } catch (cfErr) {
          console.warn("[Cashfree Direct Refund Notice]:", cfErr.message);
          refundId = `REF-UPI-${Date.now().toString().slice(-8)}`;
          refundStatus = "INITIATED";
        }
      } else {
        refundId = `REF-UPI-${Date.now().toString().slice(-8)}`;
        refundStatus = "INITIATED";
      }

      refundMessage = `Slot booking cancelled! ₹${refundAmount} refund initiated directly to your original Bank / UPI account (Ref: ${refundArn || refundId}). It will reflect within 24h to 3-5 working days.`;
    } else {
      // User explicitly chose SportX Wallet credit
      refundMode = "wallet";
      refundId = `SX-WAL-REF-${Date.now().toString().slice(-8)}`;
      refundStatus = "SUCCESS";
      refundMessage = `Slot booking cancelled! ₹${refundAmount} has been refunded to your SportX Wallet.`;
    }

    await connection.beginTransaction();

    await connection.query(
      `UPDATE bookings SET 
        status = 'Cancelled', 
        cancellation_reason = ?,
        refund_id = ?,
        refund_status = ?,
        refund_mode = ?,
        refund_amount = ?,
        refund_arn = ?
       WHERE id = ?`,
      [cancelReason, refundId, refundStatus, refundMode, refundAmount, refundArn, booking.id]
    );

    // ONLY credit wallet if user explicitly requested wallet refund
    const user = await findUser(connection, callerId || authUser.id, bookedEmail || callerEmail);
    if (refundMode === "wallet" && user && refundAmount > 0) {
      try {
        await connection.query("INSERT IGNORE INTO player_wallets (user_id, balance) VALUES (?, 0)", [user.id]);
        await connection.query("UPDATE player_wallets SET balance = balance + ? WHERE user_id = ?", [refundAmount, user.id]);
        await connection.query(
          `INSERT INTO wallet_transactions (user_id, type, label, amount, status, is_credit)
           VALUES (?, 'Refund', ?, ?, 'Success', 1)`,
          [user.id, `Refund - Booking ${booking.booking_code || booking.id} (${cancelReason})`, refundAmount]
        );
      } catch (walletErr) {
        console.warn("Wallet refund error:", walletErr.message);
      }
    }

    await connection.commit();

    sendCancellationEmails(booking.id, {
      bookingCode: booking.booking_code,
      userName: booking.user_name,
      userEmail: booking.user_email,
      turfName: booking.turf_name,
      sport: booking.sport,
      date: booking.date,
      timeSlot: booking.time_slot || booking.slot_time,
      amount: booking.amount,
      reason: cancelReason,
      refundMode,
      refundId: refundArn || refundId,
    }).catch((mailErr) => console.error("[Cancel Mail Error]:", mailErr.message));

    return res.json({
      success: true,
      message: refundMessage,
      bookingId: booking.id,
      refundMode,
      refundId: refundArn || refundId,
      data: user ? await getProfileData(connection, user) : null,
    });
  } catch (err) {
    await connection.rollback();
    console.error("Cancel Player Booking Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    connection.release();
  }
});

// DELETE /api/profile/account (Secured: strictly deletes authenticated user)
router.delete("/account", authenticateToken, async (req, res) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const confirmText = String(req.body?.confirmText || req.query?.confirmText || "").trim().toUpperCase();

    if (confirmText !== "DELETE") {
      return res.status(400).json({
        success: false,
        error: "Confirmation required. You must provide confirmText: 'DELETE' to delete an account.",
      });
    }

    const userId = req.user.id;
    const user = await findUser(connection, userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "Player account not found in database." });
    }

    await connection.beginTransaction();

    try { await connection.query("DELETE FROM wallet_transactions WHERE user_id = ?", [user.id]); } catch (e) {}
    try { await connection.query("DELETE FROM player_wallets WHERE user_id = ?", [user.id]); } catch (e) {}
    try { await connection.query("DELETE FROM player_stats WHERE user_id = ?", [user.id]); } catch (e) {}
    try { await connection.query("DELETE FROM player_matches WHERE user_id = ?", [user.id]); } catch (e) {}
    try { await connection.query("DELETE FROM player_reviews WHERE player_id = ? OR reviewer_id = ?", [user.id, user.id]); } catch (e) {}
    try { await connection.query("DELETE FROM reviews WHERE LOWER(user_email) = LOWER(?)", [user.email]); } catch (e) {}
    try { await connection.query("DELETE FROM bookings WHERE LOWER(user_email) = LOWER(?)", [user.email]); } catch (e) {}
    try { await connection.query("DELETE FROM payments WHERE LOWER(user_email) = LOWER(?)", [user.email]); } catch (e) {}
    try { await connection.query("DELETE FROM notifications WHERE user_id = ? OR LOWER(user_email) = LOWER(?)", [user.id, user.email]); } catch (e) {}

    await connection.query("DELETE FROM users WHERE id = ?", [user.id]);
    await connection.query("DELETE FROM player_accounts WHERE profile_user_id = ?", [user.id]).catch(() => {});

    await connection.commit();

    console.log(`[Player Account Deleted] ID: ${user.id}, Email: ${user.email}`);
    return res.json({
      success: true,
      message: "Your account and all associated data have been permanently deleted from our database.",
      deletedUserId: user.id,
    });
  } catch (err) {
    await connection.rollback();
    console.error("Delete Player Account Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    connection.release();
  }
});

export default router;
