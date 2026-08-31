import express from "express";
import { getPool } from "../db.js";

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

  const [matchRows] = await pool.query(
    `SELECT id, venue, sport, match_date AS matchDate, result, score
       FROM player_matches
      WHERE user_id = ?
      ORDER BY COALESCE(STR_TO_DATE(match_date, '%Y-%m-%d'), created_at) DESC, id DESC`,
    [user.id]
  );

  const [reviewRows] = await pool.query(
    `SELECT pr.id, pr.rating, pr.comment, pr.created_at AS createdAt,
            COALESCE(u.full_name, 'SportXClub player') AS reviewer
       FROM player_reviews pr
       LEFT JOIN users u ON u.id = pr.reviewer_id
      WHERE pr.player_id = ?
      ORDER BY pr.created_at DESC`,
    [user.id]
  );

  const [products] = await pool.query(
    `SELECT id, title AS name, price, image_url AS image, category, badge
       FROM cms_facilities
      WHERE is_active = 1
      ORDER BY display_order ASC, id ASC`
  );

  return {
    user: mapUser(user, stats),
    walletBalance: Number(wallet?.balance || 0),
    transactions: transactionRows,
    activeBooking: activeBookingRows[0] || null,
    matchHistory: matchRows,
    reviews: reviewRows,
    shopItems: products,
    addons: products,
  };
}

async function loadUserFromRequest(req, res) {
  const pool = getPool();
  const body = req.body || {};
  const user = await findUser(pool, req.query.userId || body.userId, req.query.email || body.email);
  if (!user) {
    res.status(404).json({ success: false, error: "Player account not found" });
    return null;
  }
  return { pool, user };
}

router.get("/", async (req, res) => {
  try {
    const result = await loadUserFromRequest(req, res);
    if (!result) return;
    return res.json({ success: true, data: await getProfileData(result.pool, result.user) });
  } catch (err) {
    console.error("Fetch Player Profile Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/wallet/top-up", async (req, res) => {
  const connection = await getPool().getConnection();
  try {
    const { amount } = req.body;
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, error: "A valid top-up amount is required" });
    }

    const user = await findUser(connection, req.body.userId, req.body.email);
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

router.post("/shop/purchase", async (req, res) => {
  const connection = await getPool().getConnection();
  try {
    const user = await findUser(connection, req.body.userId, req.body.email);
    if (!user) return res.status(404).json({ success: false, error: "Player account not found" });

    const [products] = await connection.query(
      "SELECT id, title, price FROM cms_facilities WHERE id = ? AND is_active = 1",
      [req.body.productId]
    );
    const product = products[0];
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });

    await connection.beginTransaction();
    await connection.query("INSERT IGNORE INTO player_wallets (user_id, balance) VALUES (?, 0)", [user.id]);
    const [[wallet]] = await connection.query("SELECT balance FROM player_wallets WHERE user_id = ? FOR UPDATE", [user.id]);
    if (Number(wallet.balance) < Number(product.price)) {
      await connection.rollback();
      return res.status(400).json({ success: false, error: "Insufficient wallet balance" });
    }

    await connection.query("UPDATE player_wallets SET balance = balance - ? WHERE user_id = ?", [product.price, user.id]);
    await connection.query(
      `INSERT INTO wallet_transactions (user_id, type, label, amount, status, is_credit)
       VALUES (?, 'Pro Shop', ?, ?, 'Success', 0)`,
      [user.id, `Purchase - ${product.title}`, product.price]
    );
    await connection.commit();
    return res.json({ success: true, data: await getProfileData(connection, user), product });
  } catch (err) {
    await connection.rollback();
    console.error("Shop Purchase Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    connection.release();
  }
});

router.post("/bookings/:id/cancel", async (req, res) => {
  const connection = await getPool().getConnection();
  try {
    const user = await findUser(connection, req.body.userId, req.body.email);
    if (!user) return res.status(404).json({ success: false, error: "Player account not found" });

    const [bookings] = await connection.query(
      `SELECT * FROM bookings
        WHERE id = ? AND (LOWER(user_email) = LOWER(?) OR LOWER(user_name) = LOWER(?))
        LIMIT 1`,
      [req.params.id, user.email, user.full_name]
    );
    const booking = bookings[0];
    if (!booking) return res.status(404).json({ success: false, error: "Booking not found" });
    if (["Cancelled", "Canceled"].includes(booking.status)) {
      return res.status(400).json({ success: false, error: "Booking is already cancelled" });
    }

    await connection.beginTransaction();
    await connection.query("UPDATE bookings SET status = 'Cancelled' WHERE id = ?", [booking.id]);
    await connection.query("INSERT IGNORE INTO player_wallets (user_id, balance) VALUES (?, 0)", [user.id]);
    await connection.query("UPDATE player_wallets SET balance = balance + ? WHERE user_id = ?", [booking.amount || 0, user.id]);
    await connection.query(
      `INSERT INTO wallet_transactions (user_id, type, label, amount, status, is_credit)
       VALUES (?, 'Refund', ?, ?, 'Success', 1)`,
      [user.id, `Refund - Booking ${booking.booking_code || booking.id}`, booking.amount || 0]
    );
    await connection.commit();
    return res.json({ success: true, data: await getProfileData(connection, user) });
  } catch (err) {
    await connection.rollback();
    console.error("Cancel Player Booking Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    connection.release();
  }
});

// DELETE PLAYER ACCOUNT PERMANENTLY FROM DATABASE
router.delete("/account", async (req, res) => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const userId = req.body?.userId || req.query?.userId;
    const email = req.body?.email || req.query?.email;
    const user = await findUser(connection, userId, email);
    if (!user) {
      return res.status(404).json({ success: false, error: "Player account not found in database." });
    }

    await connection.beginTransaction();

    // 1. Delete player wallets and transactions
    try { await connection.query("DELETE FROM wallet_transactions WHERE user_id = ?", [user.id]); } catch (e) {}
    try { await connection.query("DELETE FROM player_wallets WHERE user_id = ?", [user.id]); } catch (e) {}

    // 2. Delete player stats & matches & teammate reviews
    try { await connection.query("DELETE FROM player_stats WHERE user_id = ?", [user.id]); } catch (e) {}
    try { await connection.query("DELETE FROM player_matches WHERE user_id = ?", [user.id]); } catch (e) {}
    try { await connection.query("DELETE FROM player_teammate_reviews WHERE user_id = ? OR LOWER(reviewer) = LOWER(?)", [user.id, user.full_name]); } catch (e) {}

    // 3. Delete user reviews
    try { await connection.query("DELETE FROM reviews WHERE LOWER(user_name) = LOWER(?) OR LOWER(user_email) = LOWER(?)", [user.full_name, user.email]); } catch (e) {}

    // 4. Delete bookings / payments associated with user
    try { await connection.query("DELETE FROM bookings WHERE LOWER(user_email) = LOWER(?) OR LOWER(user_name) = LOWER(?)", [user.email, user.full_name]); } catch (e) {}
    try { await connection.query("DELETE FROM payments WHERE LOWER(user_email) = LOWER(?) OR LOWER(user_name) = LOWER(?)", [user.email, user.full_name]); } catch (e) {}

    // 5. Delete tournament team registrations / notifications
    try { await connection.query("DELETE FROM notifications WHERE user_id = ? OR LOWER(user_email) = LOWER(?)", [user.id, user.email]); } catch (e) {}

    // 6. Delete user record from users table
    await connection.query("DELETE FROM users WHERE id = ?", [user.id]);

    await connection.commit();

    console.log(`[Player Account Permanently Deleted from DB] ID: ${user.id}, Email: ${user.email}, Name: ${user.full_name}`);
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
