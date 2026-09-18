import express from "express";
import { getPool } from "../../db.js";
import { sendBookingEmails, sendCancellationEmails } from "../../services/booking-email-service.js";
import { authenticateToken, requireRole, optionalAuth } from "../../middleware/auth.js";

const router = express.Router();

// GET /api/turf/bookings - List bookings (Protected)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const authUser = req.user;
    const isAdmin = authUser.role === "Admin" || authUser.role === "Super Admin" || authUser.accountType === "cms-admin";
    const isOwner = authUser.role === "owner" || authUser.accountType === "turf-owner";

    let sql = "SELECT * FROM bookings";
    const params = [];

    if (isOwner && !isAdmin) {
      sql = `SELECT b.* FROM bookings b
             INNER JOIN turfs t ON LOWER(t.name) = LOWER(b.turf_name)
             WHERE LOWER(t.owner_email) = LOWER(?)
             ORDER BY b.id DESC`;
      params.push(authUser.email);
    } else if (!isAdmin) {
      sql = "SELECT * FROM bookings WHERE LOWER(user_email) = LOWER(?) ORDER BY id DESC";
      params.push(authUser.email);
    } else {
      sql = "SELECT * FROM bookings ORDER BY id DESC";
    }

    const [rows] = await pool.query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Fetch Bookings Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/turf/bookings/:id - Get booking details
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Fetch Booking Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/turf/bookings - Create booking (Protected)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const {
      booking_code,
      user_name,
      user_email,
      user_phone,
      turf_name,
      turf_id,
      sport,
      date,
      time_slot,
      slot_time,
      amount,
      status = "Confirmed",
      payment_method = "UPI",
      payment_type = "UPI"
    } = req.body;

    const code = booking_code || `BK-${Math.floor(100000 + Math.random() * 900000)}`;
    const callerEmail = req.user?.email || user_email;
    const callerName = req.user?.fullName || user_name;

    const [result] = await pool.query(
      `INSERT INTO bookings 
      (booking_code, user_name, user_email, user_phone, turf_name, turf_id, sport, date, time_slot, slot_time, amount, status, payment_method, payment_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, callerName, callerEmail, user_phone, turf_name, turf_id, sport, date, time_slot, slot_time, amount, status, payment_method, payment_type]
    );

    const [inserted] = await pool.query("SELECT * FROM bookings WHERE id = ?", [result.insertId]);
    
    if (status === "Confirmed") {
      sendBookingEmails(result.insertId, inserted[0]).catch((e) => console.error("[Turf Booking Mail Error]:", e.message));
    }

    return res.json({ success: true, data: inserted[0] });
  } catch (err) {
    console.error("Create Booking Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/turf/bookings/:id/status - Update booking status (Protected: Owner / Admin)
router.put("/:id/status", authenticateToken, requireRole(["admin", "super admin", "cms-admin", "turf-owner", "owner"]), async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: "Status field is required" });
    }

    await pool.query("UPDATE bookings SET status = ? WHERE id = ?", [status, id]);
    const [updated] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);

    if (String(status).toLowerCase() === "cancelled" && updated.length > 0) {
      sendCancellationEmails(id, updated[0]).catch((e) => console.error("[Booking Cancel Mail Error]:", e.message));
    }

    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error("Update Booking Status Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/turf/bookings/:id - Delete booking (Protected: Admin only)
router.delete("/:id", authenticateToken, requireRole(["admin", "super admin", "cms-admin"]), async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query("DELETE FROM bookings WHERE id = ?", [id]);
    return res.json({ success: true, id: Number(id) });
  } catch (err) {
    console.error("Delete Booking Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
