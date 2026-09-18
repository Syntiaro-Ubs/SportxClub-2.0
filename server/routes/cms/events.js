import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/cms/events - Get all tournament events
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM cms_events ORDER BY display_order ASC, id ASC");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/cms/events - Create new event
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const { title, date, location, image_url, is_active, display_order } = req.body;

    const [result] = await pool.query(
      "INSERT INTO cms_events (title, date, location, image_url, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?)",
      [title, date, location, image_url, is_active ?? 1, display_order || 1]
    );

    const [inserted] = await pool.query("SELECT * FROM cms_events WHERE id = ?", [result.insertId]);
    res.json({ success: true, data: inserted[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/cms/events/:id - Update event
router.put("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { title, date, location, image_url, is_active, display_order } = req.body;

    await pool.query(
      `UPDATE cms_events SET
        title = COALESCE(?, title),
        date = COALESCE(?, date),
        location = COALESCE(?, location),
        image_url = COALESCE(?, image_url),
        is_active = COALESCE(?, is_active),
        display_order = COALESCE(?, display_order)
       WHERE id = ?`,
      [title, date, location, image_url, is_active, display_order, id]
    );

    const [updated] = await pool.query("SELECT * FROM cms_events WHERE id = ?", [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/cms/events/:id - Delete event
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query("DELETE FROM cms_events WHERE id = ?", [id]);
    res.json({ success: true, message: "Tournament event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
