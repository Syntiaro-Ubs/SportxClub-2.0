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

    const ALL_MODULES = ["home-page", "turfs", "tournaments", "community", "team"];

    // 1. Query dashboard_users table (Primary Console Administrators & Staff)
    const [dashRows] = await pool.query(
      "SELECT id, full_name, username, email, role, status, permissions, phone, avatar FROM dashboard_users WHERE (LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)) AND password = ?",
      [cleanUser, cleanUser, cleanPass]
    );

    if (dashRows.length > 0) {
      const user = dashRows[0];
      if (user.status && user.status.toLowerCase() !== "active") {
        return res.status(403).json({
          success: false,
          error: "Your console account has been deactivated. Please contact your system administrator.",
        });
      }

      let parsedPerms = [];
      try {
        parsedPerms = user.permissions ? (typeof user.permissions === "string" ? JSON.parse(user.permissions) : user.permissions) : [];
      } catch {
        parsedPerms = [];
      }

      if (user.role === "Super Admin" || user.role === "Admin" || (Array.isArray(parsedPerms) && parsedPerms.length === 0)) {
        if (user.role === "Super Admin" || user.role === "Admin") {
          parsedPerms = ALL_MODULES;
        }
      }

      // Update last_login
      await pool.query("UPDATE dashboard_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [user.id]).catch(() => {});

      return res.json({
        success: true,
        user: {
          id: user.id,
          fullName: user.full_name,
          username: user.username,
          email: user.email,
          role: user.role || "Admin",
          status: user.status || "Active",
          permissions: parsedPerms,
          phone: user.phone || "",
          avatar: user.avatar || "",
          accountType: "cms-admin",
        },
        token: `cms_admin_${user.id}_${Date.now()}`,
      });
    }

    // 2. Query cms_users table (Fallback)
    const [cmsRows] = await pool.query(
      "SELECT id, username, email, role FROM cms_users WHERE (LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)) AND password = ?",
      [cleanUser, cleanUser, cleanPass]
    );

    if (cmsRows.length > 0) {
      return res.json({
        success: true,
        user: {
          id: cmsRows[0].id,
          fullName: cmsRows[0].username,
          username: cmsRows[0].username,
          email: cmsRows[0].email,
          role: cmsRows[0].role || "Admin",
          status: "Active",
          permissions: ALL_MODULES,
          accountType: "cms-admin",
        },
        token: `cms_admin_${cmsRows[0].id}_${Date.now()}`,
      });
    }

    // 3. Query admin_accounts table
    const [adminRows] = await pool.query(
      "SELECT id, username, email, role FROM admin_accounts WHERE (LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)) AND password = ? AND LOWER(status) = 'active'",
      [cleanUser, cleanUser, cleanPass]
    );

    if (adminRows.length > 0) {
      return res.json({
        success: true,
        user: {
          id: adminRows[0].id,
          fullName: adminRows[0].username,
          username: adminRows[0].username,
          email: adminRows[0].email,
          role: adminRows[0].role || "Admin",
          status: "Active",
          permissions: ALL_MODULES,
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
