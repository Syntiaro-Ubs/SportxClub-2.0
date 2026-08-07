import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/cms/faqs - Get all FAQs
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM cms_faqs ORDER BY display_order ASC, id ASC");
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Fetch CMS FAQs Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cms/faqs - Add FAQ
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const { question, answer, category = "General", is_active = 1, display_order = 1 } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ success: false, error: "Question and answer are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO cms_faqs (question, answer, category, is_active, display_order) VALUES (?, ?, ?, ?, ?)",
      [question, answer, category, is_active ? 1 : 0, display_order]
    );

    const [inserted] = await pool.query("SELECT * FROM cms_faqs WHERE id = ?", [result.insertId]);
    return res.json({ success: true, data: inserted[0] });
  } catch (err) {
    console.error("Create CMS FAQ Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/cms/faqs/:id - Delete FAQ
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query("DELETE FROM cms_faqs WHERE id = ?", [id]);
    return res.json({ success: true, id: Number(id) });
  } catch (err) {
    console.error("Delete CMS FAQ Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
