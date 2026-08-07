import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// Helper to filter valid columns for turfs table
async function filterTurfColumns(pool, rawBody) {
  const [columns] = await pool.query("SHOW COLUMNS FROM `turfs`");
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

// GET /api/turf/turfs - Get all turfs
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM turfs ORDER BY id DESC");
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Fetch Turfs Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/turf/turfs/:id - Get turf by ID
router.get("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM turfs WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Turf not found" });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Fetch Turf Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/turf/turfs - Add a new turf
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const body = await filterTurfColumns(pool, req.body);
    const keys = Object.keys(body);
    if (keys.length === 0) {
      return res.status(400).json({ success: false, error: "No valid turf fields provided" });
    }

    const values = Object.values(body);
    const placeholders = keys.map(() => "?").join(", ");
    const columns = keys.map(k => `\`${k}\``).join(", ");

    const sql = `INSERT INTO turfs (${columns}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, values);

    const [inserted] = await pool.query("SELECT * FROM turfs WHERE id = ?", [result.insertId]);
    return res.json({ success: true, data: inserted[0] });
  } catch (err) {
    console.error("Create Turf Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/turf/turfs/:id - Update turf details
router.put("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const body = await filterTurfColumns(pool, req.body);
    const keys = Object.keys(body);
    if (keys.length === 0) {
      return res.status(400).json({ success: false, error: "No valid fields to update" });
    }

    const setClause = keys.map(k => `\`${k}\` = ?`).join(", ");
    const values = [...Object.values(body), id];

    await pool.query(`UPDATE turfs SET ${setClause} WHERE id = ?`, values);
    const [updated] = await pool.query("SELECT * FROM turfs WHERE id = ?", [id]);
    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error("Update Turf Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/turf/turfs/:id - Delete a turf
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query("DELETE FROM turfs WHERE id = ?", [id]);
    return res.json({ success: true, id: Number(id) });
  } catch (err) {
    console.error("Delete Turf Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
