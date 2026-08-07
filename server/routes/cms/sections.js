import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/cms/sections - Get all sections
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM cms_sections ORDER BY display_order ASC, id ASC");
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Fetch CMS Sections Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cms/sections - Add new section
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const { section_key, title, subtitle, badge, is_active = 1, display_order = 1, content_json } = req.body;

    if (!section_key || !title) {
      return res.status(400).json({ success: false, error: "Section key and title are required" });
    }

    const jsonStr = typeof content_json === "object" ? JSON.stringify(content_json) : content_json;

    const [result] = await pool.query(
      `INSERT INTO cms_sections (section_key, title, subtitle, badge, is_active, display_order, content_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [section_key.toLowerCase().replace(/\s+/g, "_"), title, subtitle || "", badge || "", is_active ? 1 : 0, display_order, jsonStr || null]
    );

    const [inserted] = await pool.query("SELECT * FROM cms_sections WHERE id = ?", [result.insertId]);
    return res.json({ success: true, data: inserted[0] });
  } catch (err) {
    console.error("Create CMS Section Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/cms/sections/:id - Update section details
router.put("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { title, subtitle, badge, is_active, display_order, content_json } = req.body;

    const jsonStr = typeof content_json === "object" ? JSON.stringify(content_json) : content_json;

    await pool.query(
      `UPDATE cms_sections SET
       title = COALESCE(?, title),
       subtitle = COALESCE(?, subtitle),
       badge = COALESCE(?, badge),
       is_active = COALESCE(?, is_active),
       display_order = COALESCE(?, display_order),
       content_json = COALESCE(?, content_json)
       WHERE id = ?`,
      [title, subtitle, badge, is_active, display_order, jsonStr, id]
    );

    const [updated] = await pool.query("SELECT * FROM cms_sections WHERE id = ?", [id]);
    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error("Update CMS Section Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/cms/sections/:id/toggle - Toggle active status
router.put("/:id/toggle", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;

    const [rows] = await pool.query("SELECT is_active FROM cms_sections WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Section not found" });
    }

    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query("UPDATE cms_sections SET is_active = ? WHERE id = ?", [newStatus, id]);

    const [updated] = await pool.query("SELECT * FROM cms_sections WHERE id = ?", [id]);
    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error("Toggle CMS Section Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/cms/sections/:id - Delete section
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query("DELETE FROM cms_sections WHERE id = ?", [id]);
    return res.json({ success: true, id: Number(id) });
  } catch (err) {
    console.error("Delete CMS Section Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
