import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/cms/facilities - Get all facilities & equipment cards
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM cms_facilities ORDER BY display_order ASC, id ASC");
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Fetch CMS Facilities Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cms/facilities - Add new equipment/facility card
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const { title, category = "EQUIPMENT", image_url, price = 999.00, rating = "4.8", badge = "PRO STORE", is_active = 1, display_order = 1 } = req.body;

    if (!title || !image_url) {
      return res.status(400).json({ success: false, error: "Title and Image URL are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO cms_facilities (title, category, image_url, price, rating, badge, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [title, category, image_url, price, rating, badge, is_active ? 1 : 0, display_order]
    );

    const [inserted] = await pool.query("SELECT * FROM cms_facilities WHERE id = ?", [result.insertId]);
    return res.json({ success: true, data: inserted[0] });
  } catch (err) {
    console.error("Create CMS Facility Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/cms/facilities/:id - Update facility card
router.put("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { title, category, image_url, price, rating, badge, is_active, display_order } = req.body;

    await pool.query(
      `UPDATE cms_facilities SET
       title = COALESCE(?, title),
       category = COALESCE(?, category),
       image_url = COALESCE(?, image_url),
       price = COALESCE(?, price),
       rating = COALESCE(?, rating),
       badge = COALESCE(?, badge),
       is_active = COALESCE(?, is_active),
       display_order = COALESCE(?, display_order)
       WHERE id = ?`,
      [title, category, image_url, price, rating, badge, is_active, display_order, id]
    );

    const [updated] = await pool.query("SELECT * FROM cms_facilities WHERE id = ?", [id]);
    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error("Update CMS Facility Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/cms/facilities/:id - Delete facility card
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query("DELETE FROM cms_facilities WHERE id = ?", [id]);
    return res.json({ success: true, id: Number(id) });
  } catch (err) {
    console.error("Delete CMS Facility Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
