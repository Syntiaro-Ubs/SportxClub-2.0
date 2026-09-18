import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/cms/testimonials - Get all customer reviews
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM cms_testimonials ORDER BY id DESC");
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Fetch CMS Testimonials Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cms/testimonials - Add testimonial
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const { name, role = "Verified Player", avatar, rating = 5, comment, is_active = 1 } = req.body;

    if (!name || !comment) {
      return res.status(400).json({ success: false, error: "Name and comment are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO cms_testimonials (name, role, avatar, rating, comment, is_active) VALUES (?, ?, ?, ?, ?, ?)",
      [name, role, avatar || "", rating, comment, is_active ? 1 : 0]
    );

    const [inserted] = await pool.query("SELECT * FROM cms_testimonials WHERE id = ?", [result.insertId]);
    return res.json({ success: true, data: inserted[0] });
  } catch (err) {
    console.error("Create CMS Testimonial Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/cms/testimonials/:id - Delete testimonial
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query("DELETE FROM cms_testimonials WHERE id = ?", [id]);
    return res.json({ success: true, id: Number(id) });
  } catch (err) {
    console.error("Delete CMS Testimonial Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
