import express from "express";
import { getPool } from "../db.js";

const router = express.Router();

const ALLOWED_ENTITIES = {
  users: "users",
  "turf-owners": "turf_owners",
  turfs: "turfs",
  bookings: "bookings",
  games: "games",
  payments: "payments",
  passes: "game_passes",
  coupons: "coupons",
  banners: "banners",
  reviews: "reviews",
  reports: "reports",
  notifications: "notifications",
  staff: "staff",
};

// Auth endpoints extracted to server/routes/auth.js

// ----------------------------------------------------
// DASHBOARD STATS
// ----------------------------------------------------
router.get("/admin/dashboard/stats", async (req, res) => {
  try {
    const pool = getPool();
    const [[usersCount]] = await pool.query("SELECT COUNT(*) as count FROM users");
    const [[turfsCount]] = await pool.query("SELECT COUNT(*) as count FROM turfs");
    const [[gamesCount]] = await pool.query("SELECT COUNT(*) as count FROM games WHERE status = 'Open'");
    const [[revenueSum]] = await pool.query("SELECT COALESCE(SUM(amount), 0) as sum FROM payments WHERE status = 'Success'");
    
    const [recentUsers] = await pool.query("SELECT full_name, created_at FROM users ORDER BY id DESC LIMIT 3");
    const [recentTurfs] = await pool.query("SELECT name, created_at FROM turfs ORDER BY id DESC LIMIT 3");
    const [recentGames] = await pool.query("SELECT title, created_at FROM games ORDER BY id DESC LIMIT 3");

    return res.json({
      success: true,
      stats: {
        totalUsers: usersCount.count,
        totalTurfs: turfsCount.count,
        activeGames: gamesCount.count,
        totalRevenue: `₹${(revenueSum.sum / 100000).toFixed(1)}L`,
      },
      recentActivity: [
        ...recentUsers.map(u => ({ type: "User Registered", text: u.full_name, color: "emerald" })),
        ...recentTurfs.map(t => ({ type: "Turf Added", text: t.name, color: "blue" })),
        ...recentGames.map(g => ({ type: "Game Created", text: g.title, color: "purple" })),
      ]
    });
  } catch (err) {
    console.error("Stats Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// GENERIC DYNAMIC CRUD FOR ALL ADMIN ENTITIES
// ----------------------------------------------------

// Get All Items for an entity
router.get("/admin/:entity", async (req, res) => {
  const entity = req.params.entity;
  const tableName = ALLOWED_ENTITIES[entity];
  if (!tableName) {
    return res.status(400).json({ success: false, error: `Invalid entity '${entity}'` });
  }

  try {
    const pool = getPool();
    const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` ORDER BY id DESC`);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error(`Fetch ${entity} Error:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Helper to filter object keys by table columns
async function filterValidColumns(pool, tableName, rawBody) {
  const [columns] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\``);
  const validColNames = new Set(columns.map(c => c.Field));
  const filtered = {};
  for (const key of Object.keys(rawBody)) {
    if (key === 'id' || key === 'created_at') continue;
    if (validColNames.has(key)) {
      let val = rawBody[key];
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      }
      filtered[key] = val;
    }
  }
  return filtered;
}

// Create Item in an entity
router.post("/admin/:entity", async (req, res) => {
  const entity = req.params.entity;
  const tableName = ALLOWED_ENTITIES[entity];
  if (!tableName) {
    return res.status(400).json({ success: false, error: `Invalid entity '${entity}'` });
  }

  try {
    const pool = getPool();
    const body = await filterValidColumns(pool, tableName, req.body);

    const keys = Object.keys(body);
    if (keys.length === 0) {
      return res.status(400).json({ success: false, error: "No valid fields provided to insert" });
    }

    const values = Object.values(body);
    const placeholders = keys.map(() => "?").join(", ");
    const columns = keys.map(k => `\`${k}\``).join(", ");

    const sql = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, values);

    const [inserted] = await pool.query(`SELECT * FROM \`${tableName}\` WHERE id = ?`, [result.insertId]);

    return res.json({ success: true, data: inserted[0] });
  } catch (err) {
    console.error(`Create ${entity} Error:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Update Item in an entity
router.put("/admin/:entity/:id", async (req, res) => {
  const { entity, id } = req.params;
  const tableName = ALLOWED_ENTITIES[entity];
  if (!tableName) {
    return res.status(400).json({ success: false, error: `Invalid entity '${entity}'` });
  }

  try {
    const pool = getPool();
    const body = await filterValidColumns(pool, tableName, req.body);

    const keys = Object.keys(body);
    if (keys.length === 0) {
      return res.status(400).json({ success: false, error: "No valid fields provided to update" });
    }

    const setClause = keys.map(k => `\`${k}\` = ?`).join(", ");
    const values = [...Object.values(body), id];

    const sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE id = ?`;
    await pool.query(sql, values);

    const [updated] = await pool.query(`SELECT * FROM \`${tableName}\` WHERE id = ?`, [id]);

    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error(`Update ${entity} Error:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Delete Item from an entity
router.delete("/admin/:entity/:id", async (req, res) => {
  const { entity, id } = req.params;
  const tableName = ALLOWED_ENTITIES[entity];
  if (!tableName) {
    return res.status(400).json({ success: false, error: `Invalid entity '${entity}'` });
  }

  try {
    const pool = getPool();
    await pool.query(`DELETE FROM \`${tableName}\` WHERE id = ?`, [id]);
    return res.json({ success: true, id: Number(id) });
  } catch (err) {
    console.error(`Delete ${entity} Error:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Reset/Reseed database endpoint
router.post("/admin/reset-db", async (req, res) => {
  try {
    const pool = getPool();
    // Drop all tables & re-initialize
    const tables = Object.values(ALLOWED_ENTITIES);
    for (const t of tables) {
      await pool.query(`DROP TABLE IF EXISTS \`${t}\``);
    }
    // Re-initialize DB
    const { initDatabase } = await import("../db.js");
    await initDatabase();
    return res.json({ success: true, message: "Database re-seeded successfully!" });
  } catch (err) {
    console.error("Reset DB Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
