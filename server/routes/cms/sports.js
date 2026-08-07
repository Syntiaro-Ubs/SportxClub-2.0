import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/cms/sports - Get all sports categories
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM cms_sports ORDER BY display_order ASC, id ASC");
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Fetch CMS Sports Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cms/sports - Add sports category
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const { name, icon = "⚽", image_url, badge = "Popular", description, is_active = 1, display_order = 1 } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: "Sport name is required" });
    }

    const [result] = await pool.query(
      "INSERT INTO cms_sports (name, icon, image_url, badge, description, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, icon, image_url || "", badge, description || "", is_active ? 1 : 0, display_order]
    );

    const [inserted] = await pool.query("SELECT * FROM cms_sports WHERE id = ?", [result.insertId]);
    return res.json({ success: true, data: inserted[0] });
  } catch (err) {
    console.error("Create CMS Sport Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/cms/sports/:id - Update sport
router.put("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { name, icon, image_url, badge, description, is_active, display_order } = req.body;

    await pool.query(
      `UPDATE cms_sports SET
       name = COALESCE(?, name),
       icon = COALESCE(?, icon),
       image_url = COALESCE(?, image_url),
       badge = COALESCE(?, badge),
       description = COALESCE(?, description),
       is_active = COALESCE(?, is_active),
       display_order = COALESCE(?, display_order)
       WHERE id = ?`,
      [name, icon, image_url, badge, description, is_active, display_order, id]
    );

    const [updated] = await pool.query("SELECT * FROM cms_sports WHERE id = ?", [id]);
    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error("Update CMS Sport Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/cms/sports/:id - Delete sport
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query("DELETE FROM cms_sports WHERE id = ?", [id]);
    return res.json({ success: true, id: Number(id) });
  } catch (err) {
    console.error("Delete CMS Sport Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
