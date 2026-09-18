import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

async function resolveUser(pool, userId, email) {
  if (userId !== undefined && userId !== null && userId !== "") {
    const [rows] = await pool.query("SELECT id, full_name, avatar FROM users WHERE id = ? LIMIT 1", [userId]);
    return rows[0] || null;
  }
  if (email) {
    const [rows] = await pool.query("SELECT id, full_name, avatar FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1", [email.trim()]);
    return rows[0] || null;
  }
  return null;
}

function requestIdentity(req) {
  const body = req.body || {};
  return {
    userId: req.query.userId ?? body.userId,
    email: req.query.email ?? body.email,
  };
}

async function getPost(pool, id, userId) {
  const [rows] = await pool.query(
    `SELECT p.*, IF(l.id IS NULL, 0, 1) AS liked_by_user
       FROM cms_posts p
       LEFT JOIN community_post_likes l ON l.post_id = p.id AND l.user_id = ?
      WHERE p.id = ?
      LIMIT 1`,
    [userId || 0, id]
  );
  return rows[0] || null;
}

// GET /api/cms/posts - Get all community feed posts
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const user = await resolveUser(pool, req.query.userId, req.query.email);
    const [rows] = await pool.query(
      `SELECT p.*, IF(l.id IS NULL, 0, 1) AS liked_by_user
         FROM cms_posts p
         LEFT JOIN community_post_likes l ON l.post_id = p.id AND l.user_id = ?
        WHERE p.is_active = 1
        ORDER BY p.id DESC`,
      [user?.id || 0]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/cms/posts - Create new post
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const { author_user_id, author, author_avatar, time, content, image_url, likes, comments, shares, type, badge, is_active } = req.body;

    if (!author || !content) {
      return res.status(400).json({ success: false, error: "Author and Content are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO cms_posts (author_user_id, author, author_avatar, time, content, image_url, likes, comments, shares, type, badge, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        author_user_id || null,
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
    const { author_user_id, author, author_avatar, time, content, image_url, likes, comments, shares, type, badge, is_active } = req.body;

    await pool.query(
      `UPDATE cms_posts SET
        author_user_id = COALESCE(?, author_user_id),
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
      [author_user_id, author, author_avatar, time, content, image_url, likes, comments, shares, type, badge, is_active, id]
    );

    const [updated] = await pool.query("SELECT * FROM cms_posts WHERE id = ?", [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Toggle the current user's like and persist the aggregate count.
router.post("/:id/like", async (req, res) => {
  const connection = await getPool().getConnection();
  try {
    const { userId, email } = requestIdentity(req);
    const user = await resolveUser(connection, userId, email);
    if (!user) return res.status(401).json({ success: false, error: "A database user account is required" });

    await connection.beginTransaction();
    const [posts] = await connection.query("SELECT id FROM cms_posts WHERE id = ? FOR UPDATE", [req.params.id]);
    if (!posts[0]) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    const [likes] = await connection.query("SELECT id FROM community_post_likes WHERE post_id = ? AND user_id = ? LIMIT 1", [req.params.id, user.id]);
    let liked;
    if (likes[0]) {
      await connection.query("DELETE FROM community_post_likes WHERE id = ?", [likes[0].id]);
      await connection.query("UPDATE cms_posts SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = ?", [req.params.id]);
      liked = false;
    } else {
      await connection.query("INSERT INTO community_post_likes (post_id, user_id) VALUES (?, ?)", [req.params.id, user.id]);
      await connection.query("UPDATE cms_posts SET likes = COALESCE(likes, 0) + 1 WHERE id = ?", [req.params.id]);
      liked = true;
    }

    const post = await getPost(connection, req.params.id, user.id);
    await connection.commit();
    return res.json({ success: true, data: { liked, post } });
  } catch (error) {
    await connection.rollback();
    console.error("Toggle Community Like Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

router.get("/:id/comments", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, author_name AS author, author_avatar AS avatar, comment_text AS text, created_at AS createdAt
         FROM community_comments
        WHERE post_id = ?
        ORDER BY created_at ASC, id ASC`,
      [req.params.id]
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Fetch Community Comments Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/:id/comments", async (req, res) => {
  try {
    const pool = getPool();
    const { userId, email } = requestIdentity(req);
    const user = await resolveUser(pool, userId, email);
    const text = String(req.body?.text || "").trim();
    if (!user) return res.status(401).json({ success: false, error: "A database user account is required" });
    if (!text) return res.status(400).json({ success: false, error: "Comment text is required" });

    const [result] = await pool.query(
      `INSERT INTO community_comments (post_id, user_id, author_name, author_avatar, comment_text)
       VALUES (?, ?, ?, ?, ?)`,
      [req.params.id, user.id, user.full_name, user.avatar || null, text]
    );
    await pool.query("UPDATE cms_posts SET comments = COALESCE(comments, 0) + 1 WHERE id = ?", [req.params.id]);
    const [rows] = await pool.query(
      `SELECT id, author_name AS author, author_avatar AS avatar, comment_text AS text, created_at AS createdAt
         FROM community_comments WHERE id = ?`,
      [result.insertId]
    );
    const post = await getPost(pool, req.params.id, user.id);
    return res.json({ success: true, data: { comment: rows[0], post } });
  } catch (error) {
    console.error("Create Community Comment Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/:id/share", async (req, res) => {
  try {
    const pool = getPool();
    const { userId, email } = requestIdentity(req);
    const user = await resolveUser(pool, userId, email);
    const platform = String(req.body?.platform || "copy").trim().toLowerCase();
    if (!user) return res.status(401).json({ success: false, error: "A database user account is required" });

    await pool.query("INSERT INTO community_post_shares (post_id, user_id, platform) VALUES (?, ?, ?)", [req.params.id, user.id, platform]);
    await pool.query("UPDATE cms_posts SET shares = COALESCE(shares, 0) + 1 WHERE id = ?", [req.params.id]);
    const post = await getPost(pool, req.params.id, user.id);
    return res.json({ success: true, data: { platform, post } });
  } catch (error) {
    console.error("Create Community Share Error:", error);
    return res.status(500).json({ success: false, error: error.message });
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
