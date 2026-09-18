import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/cms/why-cards - Get all why cards
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM cms_why_cards ORDER BY display_order ASC, id ASC");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/cms/why-cards - Create new why card
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const { title, description, icon, is_active, display_order } = req.body;

    const [result] = await pool.query(
      "INSERT INTO cms_why_cards (title, description, icon, is_active, display_order) VALUES (?, ?, ?, ?, ?)",
      [title, description, icon || "ShieldCheck", is_active ?? 1, display_order || 1]
    );

    const [inserted] = await pool.query("SELECT * FROM cms_why_cards WHERE id = ?", [result.insertId]);
    res.json({ success: true, data: inserted[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/cms/why-cards/:id - Update why card
router.put("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { title, description, icon, is_active, display_order } = req.body;

    await pool.query(
      `UPDATE cms_why_cards SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        icon = COALESCE(?, icon),
        is_active = COALESCE(?, is_active),
        display_order = COALESCE(?, display_order)
       WHERE id = ?`,
      [title, description, icon, is_active, display_order, id]
    );

    const [updated] = await pool.query("SELECT * FROM cms_why_cards WHERE id = ?", [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/cms/why-cards/:id - Delete why card
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query("DELETE FROM cms_why_cards WHERE id = ?", [id]);
    res.json({ success: true, message: "Why card deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
