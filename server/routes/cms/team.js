import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

const ALL_MODULES = ["home-page", "turfs", "tournaments", "community", "team"];

function parsePermissions(rawPerms, role) {
  if (role === "Super Admin" || role === "Admin") {
    // Super Admin gets all permissions by default
    if (!rawPerms) return ALL_MODULES;
  }
  if (!rawPerms) return [];
  try {
    const parsed = typeof rawPerms === "string" ? JSON.parse(rawPerms) : rawPerms;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// GET /api/cms/team - List all console dashboard users
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, full_name, username, email, password, role, status, permissions, phone, avatar, last_login, created_at, updated_at 
       FROM dashboard_users 
       ORDER BY id ASC`
    );

    const members = rows.map((u) => ({
      ...u,
      permissions: parsePermissions(u.permissions, u.role),
    }));

    return res.json({ success: true, data: members });
  } catch (err) {
    console.error("Fetch CMS Team Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cms/team - Create a new console dashboard user account
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const {
      full_name,
      username,
      email,
      password,
      role = "Editor",
      status = "Active",
      permissions = [],
      phone = "",
      avatar = "",
    } = req.body;

    if (!full_name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Full name, username, email, and password are required.",
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanEmail = String(email).trim().toLowerCase();

    // Check unique username or email
    const [existing] = await pool.query(
      "SELECT id, username, email FROM dashboard_users WHERE LOWER(username) = ? OR LOWER(email) = ?",
      [cleanUsername, cleanEmail]
    );

    if (existing.length > 0) {
      if (existing[0].username.toLowerCase() === cleanUsername) {
        return res.status(400).json({ success: false, error: "Username is already in use by another console account." });
      }
      return res.status(400).json({ success: false, error: "Email is already registered for another console account." });
    }

    // Process permissions
    let permsArray = Array.isArray(permissions) ? permissions : [];
    if (role === "Super Admin" && permsArray.length === 0) {
      permsArray = ALL_MODULES;
    }
    const permsJson = JSON.stringify(permsArray);

    const [result] = await pool.query(
      `INSERT INTO dashboard_users (full_name, username, password, email, role, status, permissions, phone, avatar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name.trim(), cleanUsername, password.trim(), cleanEmail, role, status, permsJson, phone.trim(), avatar]
    );

    const [created] = await pool.query(
      `SELECT id, full_name, username, email, password, role, status, permissions, phone, avatar, last_login, created_at 
       FROM dashboard_users WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Console user account created successfully.",
      data: {
        ...created[0],
        permissions: parsePermissions(created[0].permissions, created[0].role),
      },
    });
  } catch (err) {
    console.error("Create CMS Team Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/cms/team/:id - Update console user account details & permissions
router.put("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const {
      full_name,
      username,
      email,
      password,
      role,
      status,
      permissions,
      phone,
      avatar,
    } = req.body;

    const [targetUsers] = await pool.query("SELECT * FROM dashboard_users WHERE id = ?", [id]);
    if (targetUsers.length === 0) {
      return res.status(404).json({ success: false, error: "Console user account not found." });
    }
    const targetUser = targetUsers[0];

    // Protect primary admin from losing super admin / full permissions or deactivation
    if (targetUser.username.toLowerCase() === "admin") {
      if (status && status !== "Active") {
        return res.status(400).json({ success: false, error: "The primary 'admin' account cannot be deactivated." });
      }
    }

    const cleanUsername = username ? String(username).trim().toLowerCase() : targetUser.username;
    const cleanEmail = email ? String(email).trim().toLowerCase() : targetUser.email;

    // Check duplicate username or email with other users
    const [duplicates] = await pool.query(
      "SELECT id FROM dashboard_users WHERE (LOWER(username) = ? OR LOWER(email) = ?) AND id != ?",
      [cleanUsername, cleanEmail, id]
    );
    if (duplicates.length > 0) {
      return res.status(400).json({ success: false, error: "Username or email is already in use by another account." });
    }

    let permsArray = permissions !== undefined ? (Array.isArray(permissions) ? permissions : []) : parsePermissions(targetUser.permissions, targetUser.role);
    if (role === "Super Admin" && permsArray.length === 0) {
      permsArray = ALL_MODULES;
    }
    const permsJson = JSON.stringify(permsArray);

    let query = `
      UPDATE dashboard_users 
      SET full_name = COALESCE(?, full_name),
          username = COALESCE(?, username),
          email = COALESCE(?, email),
          role = COALESCE(?, role),
          status = COALESCE(?, status),
          permissions = ?,
          phone = COALESCE(?, phone),
          avatar = COALESCE(?, avatar)
    `;
    const params = [
      full_name ? full_name.trim() : null,
      cleanUsername,
      cleanEmail,
      role || null,
      status || null,
      permsJson,
      phone !== undefined ? phone.trim() : null,
      avatar !== undefined ? avatar : null,
    ];

    // Optional password update
    if (password && String(password).trim().length > 0) {
      query += ", password = ?";
      params.push(String(password).trim());
    }

    query += " WHERE id = ?";
    params.push(id);

    await pool.query(query, params);

    const [updated] = await pool.query(
      `SELECT id, full_name, username, email, password, role, status, permissions, phone, avatar, last_login, created_at, updated_at 
       FROM dashboard_users WHERE id = ?`,
      [id]
    );

    return res.json({
      success: true,
      message: "Console user updated successfully.",
      data: {
        ...updated[0],
        permissions: parsePermissions(updated[0].permissions, updated[0].role),
      },
    });
  } catch (err) {
    console.error("Update CMS Team Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/cms/team/:id/status - Toggle user status
router.patch("/:id/status", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { status } = req.body;

    const [targetUsers] = await pool.query("SELECT * FROM dashboard_users WHERE id = ?", [id]);
    if (targetUsers.length === 0) {
      return res.status(404).json({ success: false, error: "Console user not found." });
    }

    if (targetUsers[0].username.toLowerCase() === "admin" && status !== "Active") {
      return res.status(400).json({ success: false, error: "The primary 'admin' account cannot be deactivated." });
    }

    const nextStatus = status || (targetUsers[0].status === "Active" ? "Inactive" : "Active");

    await pool.query("UPDATE dashboard_users SET status = ? WHERE id = ?", [nextStatus, id]);

    return res.json({
      success: true,
      message: `User status changed to ${nextStatus}`,
      status: nextStatus,
    });
  } catch (err) {
    console.error("Toggle CMS User Status Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/cms/team/:id - Delete console dashboard user
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;

    const [targetUsers] = await pool.query("SELECT * FROM dashboard_users WHERE id = ?", [id]);
    if (targetUsers.length === 0) {
      return res.status(404).json({ success: false, error: "Console user not found." });
    }

    if (targetUsers[0].username.toLowerCase() === "admin") {
      return res.status(400).json({ success: false, error: "The primary 'admin' account cannot be deleted." });
    }

    await pool.query("DELETE FROM dashboard_users WHERE id = ?", [id]);

    return res.json({ success: true, message: "Console user account deleted successfully." });
  } catch (err) {
    console.error("Delete CMS Team Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
