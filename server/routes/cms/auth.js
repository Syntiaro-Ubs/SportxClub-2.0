import express from "express";
import bcrypt from "bcryptjs";
import { getPool } from "../../db.js";
import { generateToken } from "../../middleware/auth.js";

const router = express.Router();

/**
 * Verify password with bcrypt (supports legacy plaintext with auto-upgrade to bcrypt hash)
 */
async function verifyAndUpgradePassword(pool, table, id, plainPassword, storedPassword) {
  if (!storedPassword || !plainPassword) return false;
  const strStored = String(storedPassword);
  const strPlain = String(plainPassword);

  let isValid = false;
  if (strStored.startsWith("$2a$") || strStored.startsWith("$2b$") || strStored.startsWith("$2y$")) {
    try {
      isValid = await bcrypt.compare(strPlain, strStored);
    } catch {
      isValid = false;
    }
  } else {
    // Legacy plaintext verification
    isValid = strPlain === strStored;
    if (isValid) {
      // Auto-upgrade to bcrypt hash in database
      try {
        const hashed = await bcrypt.hash(strPlain, 10);
        await pool.query(`UPDATE \`${table}\` SET password = ? WHERE id = ?`, [hashed, id]);
      } catch (err) {
        console.warn(`[Auto-upgrade password] Failed for ${table} #${id}:`, err.message);
      }
    }
  }
  return isValid;
}

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
      "SELECT id, full_name, username, email, password, role, status, permissions, phone, avatar FROM dashboard_users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)",
      [cleanUser, cleanUser]
    );

    if (dashRows.length > 0) {
      const user = dashRows[0];
      const isValid = await verifyAndUpgradePassword(pool, "dashboard_users", user.id, cleanPass, user.password);
      if (!isValid) {
        return res.status(401).json({ success: false, error: "Invalid console administrator credentials" });
      }

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

      const tokenPayload = {
        id: user.id,
        fullName: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role || "Super Admin",
        accountType: "cms-admin",
        isAdmin: true,
      };

      const token = generateToken(tokenPayload);

      return res.json({
        success: true,
        user: {
          id: user.id,
          fullName: user.full_name,
          username: user.username,
          email: user.email,
          role: user.role || "Super Admin",
          status: user.status || "Active",
          permissions: parsedPerms,
          phone: user.phone || "",
          avatar: user.avatar || "",
          accountType: "cms-admin",
        },
        token,
      });
    }

    // 2. Query cms_users table (Fallback)
    const [cmsRows] = await pool.query(
      "SELECT id, username, email, password, role FROM cms_users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)",
      [cleanUser, cleanUser]
    );

    if (cmsRows.length > 0) {
      const user = cmsRows[0];
      const isValid = await verifyAndUpgradePassword(pool, "cms_users", user.id, cleanPass, user.password);
      if (!isValid) {
        return res.status(401).json({ success: false, error: "Invalid console administrator credentials" });
      }

      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || "Admin",
        accountType: "cms-admin",
        isAdmin: true,
      });

      return res.json({
        success: true,
        user: {
          id: user.id,
          fullName: user.username,
          username: user.username,
          email: user.email,
          role: user.role || "Admin",
          status: "Active",
          permissions: ALL_MODULES,
          accountType: "cms-admin",
        },
        token,
      });
    }

    // 3. Query admin_accounts table
    const [adminRows] = await pool.query(
      "SELECT id, username, email, password, role FROM admin_accounts WHERE (LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)) AND LOWER(status) = 'active'",
      [cleanUser, cleanUser]
    );

    if (adminRows.length > 0) {
      const user = adminRows[0];
      const isValid = await verifyAndUpgradePassword(pool, "admin_accounts", user.id, cleanPass, user.password);
      if (!isValid) {
        return res.status(401).json({ success: false, error: "Invalid console administrator credentials" });
      }

      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || "Admin",
        accountType: "cms-admin",
        isAdmin: true,
      });

      return res.json({
        success: true,
        user: {
          id: user.id,
          fullName: user.username,
          username: user.username,
          email: user.email,
          role: user.role || "Admin",
          status: "Active",
          permissions: ALL_MODULES,
          accountType: "cms-admin",
        },
        token,
      });
    }

    return res.status(401).json({ success: false, error: "Invalid console administrator credentials" });
  } catch (err) {
    console.error("CMS Login Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
