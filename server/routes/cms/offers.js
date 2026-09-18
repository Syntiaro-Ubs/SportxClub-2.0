import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/cms/offers - Get all offers
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM cms_offers ORDER BY display_order ASC, id ASC");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/cms/offers - Create new offer
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const { tag, title, value, description, is_active, display_order } = req.body;

    const [result] = await pool.query(
      "INSERT INTO cms_offers (tag, title, value, description, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?)",
      [tag || "Limited time", title, value, description, is_active ?? 1, display_order || 1]
    );

    const [inserted] = await pool.query("SELECT * FROM cms_offers WHERE id = ?", [result.insertId]);
    res.json({ success: true, data: inserted[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/cms/offers/:id - Update offer
router.put("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { tag, title, value, description, is_active, display_order } = req.body;

    await pool.query(
      `UPDATE cms_offers SET
        tag = COALESCE(?, tag),
        title = COALESCE(?, title),
        value = COALESCE(?, value),
        description = COALESCE(?, description),
        is_active = COALESCE(?, is_active),
        display_order = COALESCE(?, display_order)
       WHERE id = ?`,
      [tag, title, value, description, is_active, display_order, id]
    );

    const [updated] = await pool.query("SELECT * FROM cms_offers WHERE id = ?", [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/cms/offers/:id - Delete offer
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query("DELETE FROM cms_offers WHERE id = ?", [id]);
    res.json({ success: true, message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
