import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/turf/reviews - Get reviews for turf dashboard or specific turf
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const { turf_name } = req.query;
    let query = "SELECT * FROM reviews";
    const params = [];

    if (turf_name) {
      const cleanName = turf_name.trim();
      query += " WHERE (LOWER(turf_name) = LOWER(?) OR LOWER(turf_name) LIKE LOWER(?) OR LOWER(?) LIKE CONCAT('%', LOWER(turf_name), '%'))";
      params.push(cleanName, `%${cleanName}%`, cleanName);
    }
    query += " ORDER BY id DESC";

    const [rows] = await pool.query(query, params);
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
    const reviewDate = date && date !== "Just now" ? date : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    const [result] = await pool.query(
      "INSERT INTO reviews (user_name, turf_name, rating, comment, status, date) VALUES (?, ?, ?, ?, 'Approved', ?)",
      [user_name, turf_name, rating, comment, reviewDate]
    );

    // Sync turf reviews count and average rating in turfs table
    try {
      if (turf_name) {
        const [turfRows] = await pool.query("SELECT id FROM turfs WHERE LOWER(name) = LOWER(?)", [turf_name]);
        if (turfRows.length > 0) {
          const [avgRows] = await pool.query(
            "SELECT COUNT(*) as count, AVG(rating) as avg_rating FROM reviews WHERE LOWER(turf_name) = LOWER(?)",
            [turf_name]
          );
          const count = avgRows[0]?.count || 0;
          const avgRating = avgRows[0]?.avg_rating ? Number(avgRows[0].avg_rating).toFixed(2) : 0.0;
          await pool.query(
            "UPDATE turfs SET reviews = ?, rating = ? WHERE LOWER(name) = LOWER(?)",
            [count, avgRating, turf_name]
          );
        }
      }
    } catch (syncErr) {
      console.error("Failed syncing turf reviews count & rating:", syncErr);
    }

    const [inserted] = await pool.query("SELECT * FROM reviews WHERE id = ?", [result.insertId]);
    return res.json({ success: true, data: inserted[0] });
  } catch (err) {
    console.error("Create Review Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/turf/reviews/:id - Full update of review
router.put("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { user_name, turf_name, rating, comment, owner_reply, ownerReply, status, date } = req.body;

    const fields = [];
    const params = [];

    if (user_name !== undefined) { fields.push("user_name = ?"); params.push(user_name); }
    if (turf_name !== undefined) { fields.push("turf_name = ?"); params.push(turf_name); }
    if (rating !== undefined) { fields.push("rating = ?"); params.push(Number(rating) || 5); }
    if (comment !== undefined) { fields.push("comment = ?"); params.push(comment); }
    if (owner_reply !== undefined || ownerReply !== undefined) {
      fields.push("owner_reply = ?");
      params.push(owner_reply !== undefined ? owner_reply : ownerReply);
    }
    if (status !== undefined) { fields.push("status = ?"); params.push(status); }
    if (date !== undefined) { fields.push("date = ?"); params.push(date); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: "No fields to update" });
    }

    params.push(id);
    await pool.query(`UPDATE reviews SET ${fields.join(", ")} WHERE id = ?`, params);

    const [updatedRows] = await pool.query("SELECT * FROM reviews WHERE id = ?", [id]);
    const updatedReview = updatedRows[0];
    const targetTurf = updatedReview?.turf_name;

    if (targetTurf) {
      try {
        const [avgRows] = await pool.query(
          "SELECT COUNT(*) as count, AVG(rating) as avg_rating FROM reviews WHERE LOWER(turf_name) = LOWER(?)",
          [targetTurf]
        );
        const count = avgRows[0]?.count || 0;
        const avgRating = avgRows[0]?.avg_rating ? Number(avgRows[0].avg_rating).toFixed(2) : 0.0;
        await pool.query(
          "UPDATE turfs SET reviews = ?, rating = ? WHERE LOWER(name) = LOWER(?)",
          [count, avgRating, targetTurf]
        );
      } catch (syncErr) {
        console.error("Failed syncing turf rating after edit:", syncErr);
      }
    }

    return res.json({ success: true, data: updatedReview });
  } catch (err) {
    console.error("Update Review Error:", err);
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

// DELETE /api/turf/reviews/:id - Delete review
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;

    // Fetch review before deleting to know turf_name
    const [existing] = await pool.query("SELECT turf_name FROM reviews WHERE id = ?", [id]);
    const turf_name = existing[0]?.turf_name;

    await pool.query("DELETE FROM reviews WHERE id = ?", [id]);

    // Sync turf reviews count and average rating in turfs table
    if (turf_name) {
      try {
        const [avgRows] = await pool.query(
          "SELECT COUNT(*) as count, AVG(rating) as avg_rating FROM reviews WHERE LOWER(turf_name) = LOWER(?)",
          [turf_name]
        );
        const count = avgRows[0]?.count || 0;
        const avgRating = avgRows[0]?.avg_rating ? Number(avgRows[0].avg_rating).toFixed(2) : 0.0;
        await pool.query(
          "UPDATE turfs SET reviews = ?, rating = ? WHERE LOWER(name) = LOWER(?)",
          [count, avgRating, turf_name]
        );
      } catch (syncErr) {
        console.error("Failed syncing turf after delete:", syncErr);
      }
    }

    return res.json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    console.error("Delete Review Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
