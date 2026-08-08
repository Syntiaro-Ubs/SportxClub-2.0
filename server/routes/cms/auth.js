import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// POST /api/cms/auth/login - Console Administrator Login (Strictly separate from Players & Turf Owners)
router.post("/login", async (req, res) => {
  try {
    const pool = getPool();
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Username and password are required" });
    }

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    // 1. Query cms_users table (Console Administrators)
    const [cmsRows] = await pool.query(
      "SELECT id, username, email, role FROM cms_users WHERE (LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)) AND password = ?",
      [cleanUser, cleanUser, cleanPass]
    );

    if (cmsRows.length > 0) {
      return res.json({
        success: true,
        user: {
          id: cmsRows[0].id,
          username: cmsRows[0].username,
          email: cmsRows[0].email,
          role: cmsRows[0].role || "Admin",
          accountType: "cms-admin",
        },
        token: `cms_admin_${cmsRows[0].id}_${Date.now()}`,
      });
    }

    // 2. Query admin_accounts table
    const [adminRows] = await pool.query(
      "SELECT id, username, email, role FROM admin_accounts WHERE (LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)) AND password = ? AND LOWER(status) = 'active'",
      [cleanUser, cleanUser, cleanPass]
    );

    if (adminRows.length > 0) {
      return res.json({
        success: true,
        user: {
          id: adminRows[0].id,
          username: adminRows[0].username,
          email: adminRows[0].email,
          role: adminRows[0].role || "Admin",
          accountType: "cms-admin",
        },
        token: `cms_admin_${adminRows[0].id}_${Date.now()}`,
      });
    }

    return res.status(401).json({ success: false, error: "Invalid console administrator credentials" });
  } catch (err) {
    console.error("CMS Login Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
