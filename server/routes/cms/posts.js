import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/cms/posts - Get all community feed posts
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM cms_posts ORDER BY id DESC");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/cms/posts - Create new post
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const { author, author_avatar, time, content, image_url, likes, comments, shares, type, badge, is_active } = req.body;

    if (!author || !content) {
      return res.status(400).json({ success: false, error: "Author and Content are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO cms_posts (author, author_avatar, time, content, image_url, likes, comments, shares, type, badge, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        author,
        author_avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(author)}`,
        time || "Just now",
        content,
        image_url || null,
        likes || 0,
        comments || 0,
        shares || 0,
        type || "general",
        badge || "Community",
        is_active ?? 1,
      ]
    );

    const [inserted] = await pool.query("SELECT * FROM cms_posts WHERE id = ?", [result.insertId]);
    res.json({ success: true, data: inserted[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/cms/posts/:id - Update post
router.put("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { author, author_avatar, time, content, image_url, likes, comments, shares, type, badge, is_active } = req.body;

    await pool.query(
      `UPDATE cms_posts SET
        author = COALESCE(?, author),
        author_avatar = COALESCE(?, author_avatar),
        time = COALESCE(?, time),
        content = COALESCE(?, content),
        image_url = COALESCE(?, image_url),
        likes = COALESCE(?, likes),
        comments = COALESCE(?, comments),
        shares = COALESCE(?, shares),
        type = COALESCE(?, type),
        badge = COALESCE(?, badge),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [author, author_avatar, time, content, image_url, likes, comments, shares, type, badge, is_active, id]
    );

    const [updated] = await pool.query("SELECT * FROM cms_posts WHERE id = ?", [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/cms/posts/:id - Delete post
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query("DELETE FROM cms_posts WHERE id = ?", [id]);
    res.json({ success: true, message: "Community post deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
