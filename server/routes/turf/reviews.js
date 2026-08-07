import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/turf/reviews - Get reviews for turf dashboard
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM reviews ORDER BY id DESC");
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Fetch Reviews Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/turf/reviews - Submit review
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const { user_name, turf_name, rating = 5, comment, date } = req.body;
    const reviewDate = date || new Date().toISOString().split("T")[0];

    const [result] = await pool.query(
      "INSERT INTO reviews (user_name, turf_name, rating, comment, status, date) VALUES (?, ?, ?, ?, 'Approved', ?)",
      [user_name, turf_name, rating, comment, reviewDate]
    );

    const [inserted] = await pool.query("SELECT * FROM reviews WHERE id = ?", [result.insertId]);
    return res.json({ success: true, data: inserted[0] });
  } catch (err) {
    console.error("Create Review Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/turf/reviews/:id/status - Update status (Approved / Pending / Hidden)
router.put("/:id/status", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { status } = req.body;

    await pool.query("UPDATE reviews SET status = ? WHERE id = ?", [status, id]);
    const [updated] = await pool.query("SELECT * FROM reviews WHERE id = ?", [id]);
    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error("Update Review Status Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
