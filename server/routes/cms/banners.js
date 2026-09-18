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

// POST /api/cms/banners - Create a banner or multiple banners
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const items = Array.isArray(req.body)
      ? req.body
      : Array.isArray(req.body.banners)
      ? req.body.banners
      : [req.body];

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: "No banner data provided" });
    }

    const insertedList = [];
    for (const item of items) {
      const {
        title = "SportX Hero Banner",
        subtitle = "",
        image_url,
        link = "/venues",
        cta_text = "Book Now",
        secondary_cta_text = "Explore",
        secondary_link = "/venues",
        is_active = 1,
        display_order = 1,
      } = item;

      if (!image_url) {
        continue;
      }

      const [result] = await pool.query(
        "INSERT INTO cms_banners (title, subtitle, image_url, link, cta_text, secondary_cta_text, secondary_link, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [title || "SportX Hero Banner", subtitle || "", image_url, link || "/venues", cta_text || "Book Now", secondary_cta_text || "Explore", secondary_link || "/venues", is_active ? 1 : 0, display_order || 1]
      );

      const [inserted] = await pool.query("SELECT * FROM cms_banners WHERE id = ?", [result.insertId]);
      if (inserted && inserted[0]) {
        insertedList.push(inserted[0]);
      }
    }

    if (insertedList.length === 0) {
      return res.status(400).json({ success: false, error: "Image URL or banner image data is required" });
    }

    return res.json({
      success: true,
      data: Array.isArray(req.body) || Array.isArray(req.body.banners) ? insertedList : insertedList[0],
    });
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
    const { title, subtitle, image_url, link, cta_text, secondary_cta_text, secondary_link, is_active, display_order } = req.body;

    await pool.query(
      `UPDATE cms_banners SET
       title = COALESCE(?, title),
       subtitle = COALESCE(?, subtitle),
       image_url = COALESCE(?, image_url),
       link = COALESCE(?, link),
       cta_text = COALESCE(?, cta_text),
       secondary_cta_text = COALESCE(?, secondary_cta_text),
       secondary_link = COALESCE(?, secondary_link),
       is_active = COALESCE(?, is_active),
       display_order = COALESCE(?, display_order)
       WHERE id = ?`,
      [title, subtitle, image_url, link, cta_text, secondary_cta_text, secondary_link, is_active, display_order, id]
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
