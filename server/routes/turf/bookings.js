import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/turf/bookings - List all bookings for turf dashboard
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM bookings ORDER BY id DESC");
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Fetch Bookings Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/turf/bookings/:id - Get booking details
router.get("/:id", async (req, res) => {
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

// POST /api/turf/bookings - Create booking
router.post("/", async (req, res) => {
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

    const [result] = await pool.query(
      `INSERT INTO bookings 
      (booking_code, user_name, user_email, user_phone, turf_name, turf_id, sport, date, time_slot, slot_time, amount, status, payment_method, payment_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, user_name, user_email, user_phone, turf_name, turf_id, sport, date, time_slot, slot_time, amount, status, payment_method, payment_type]
    );

    const [inserted] = await pool.query("SELECT * FROM bookings WHERE id = ?", [result.insertId]);
    return res.json({ success: true, data: inserted[0] });
  } catch (err) {
    console.error("Create Booking Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/turf/bookings/:id/status - Update booking status
router.put("/:id/status", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: "Status field is required" });
    }

    await pool.query("UPDATE bookings SET status = ? WHERE id = ?", [status, id]);
    const [updated] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error("Update Booking Status Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/turf/bookings/:id - Delete booking
router.delete("/:id", async (req, res) => {
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
