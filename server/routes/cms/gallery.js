import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/cms/gallery - Get all gallery items
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM cms_gallery ORDER BY display_order ASC, id ASC");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/cms/gallery - Add gallery item
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const { name, location, rating, reviews, image_url, className, is_active, display_order } = req.body;

    const [result] = await pool.query(
      "INSERT INTO cms_gallery (name, location, rating, reviews, image_url, className, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, location, rating || "4.9", reviews || 100, image_url, className || "md:col-span-1 md:row-span-1", is_active ?? 1, display_order || 1]
    );

    const [inserted] = await pool.query("SELECT * FROM cms_gallery WHERE id = ?", [result.insertId]);
    res.json({ success: true, data: inserted[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/cms/gallery/:id - Update gallery item
router.put("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { name, location, rating, reviews, image_url, className, is_active, display_order } = req.body;

    await pool.query(
      `UPDATE cms_gallery SET
        name = COALESCE(?, name),
        location = COALESCE(?, location),
        rating = COALESCE(?, rating),
        reviews = COALESCE(?, reviews),
        image_url = COALESCE(?, image_url),
        className = COALESCE(?, className),
        is_active = COALESCE(?, is_active),
        display_order = COALESCE(?, display_order)
       WHERE id = ?`,
      [name, location, rating, reviews, image_url, className, is_active, display_order, id]
    );

    const [updated] = await pool.query("SELECT * FROM cms_gallery WHERE id = ?", [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/cms/gallery/:id - Delete gallery item
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query("DELETE FROM cms_gallery WHERE id = ?", [id]);
    res.json({ success: true, message: "Gallery item deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
