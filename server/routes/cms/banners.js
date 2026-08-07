import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/cms/banners - Get all hero & promo banners
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM cms_banners ORDER BY display_order ASC, id DESC");
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Fetch CMS Banners Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cms/banners - Create a banner
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const { title, subtitle, image_url, link = "/turfs", cta_text = "Book Now", is_active = 1, display_order = 1 } = req.body;

    if (!title || !image_url) {
      return res.status(400).json({ success: false, error: "Title and Image URL are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO cms_banners (title, subtitle, image_url, link, cta_text, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, subtitle || "", image_url, link, cta_text, is_active ? 1 : 0, display_order]
    );

    const [inserted] = await pool.query("SELECT * FROM cms_banners WHERE id = ?", [result.insertId]);
    return res.json({ success: true, data: inserted[0] });
  } catch (err) {
    console.error("Create CMS Banner Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/cms/banners/:id - Update banner
router.put("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { title, subtitle, image_url, link, cta_text, is_active, display_order } = req.body;

    await pool.query(
      `UPDATE cms_banners SET
       title = COALESCE(?, title),
       subtitle = COALESCE(?, subtitle),
       image_url = COALESCE(?, image_url),
       link = COALESCE(?, link),
       cta_text = COALESCE(?, cta_text),
       is_active = COALESCE(?, is_active),
       display_order = COALESCE(?, display_order)
       WHERE id = ?`,
      [title, subtitle, image_url, link, cta_text, is_active, display_order, id]
    );

    const [updated] = await pool.query("SELECT * FROM cms_banners WHERE id = ?", [id]);
    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error("Update CMS Banner Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/cms/banners/:id - Delete banner
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query("DELETE FROM cms_banners WHERE id = ?", [id]);
    return res.json({ success: true, id: Number(id) });
  } catch (err) {
    console.error("Delete CMS Banner Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
