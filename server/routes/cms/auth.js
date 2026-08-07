import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// POST /api/cms/auth/login - CMS Admin Login
router.post("/login", async (req, res) => {
  try {
    const pool = getPool();
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Username and password are required" });
    }

    const [rows] = await pool.query(
      "SELECT id, username, email, role FROM cms_users WHERE (LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)) AND password = ?",
      [username.trim(), username.trim(), password.trim()]
    );

    // Fallback default admin check
    if (rows.length === 0 && (username === "admin" || username === "admin@sportxclub.com") && password === "admin123") {
      return res.json({
        success: true,
        user: { id: 1, username: "admin", email: "admin@sportxclub.com", role: "Admin" },
        token: "cms_token_demo_admin_secret",
      });
    }

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: "Invalid CMS admin credentials" });
    }

    return res.json({
      success: true,
      user: rows[0],
      token: `cms_token_${rows[0].id}_${Date.now()}`,
    });
  } catch (err) {
    console.error("CMS Login Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
