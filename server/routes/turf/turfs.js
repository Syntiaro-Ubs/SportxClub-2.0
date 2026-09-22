import express from "express";
import { getPool } from "../../db.js";
import { authenticateToken, requireRole, optionalAuth } from "../../middleware/auth.js";

const router = express.Router();

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

// GET /api/turf/turfs/cities - Get all unique onboarded turf cities (Public)
router.get("/cities", async (req, res) => {
  try {
    const pool = getPool();
    const citySet = new Set();

    // 1. Fetch cities from turf_owners
    const [ownerRows] = await pool.query(
      "SELECT city, setup_data FROM turf_owners"
    );
    for (const row of ownerRows) {
      if (row.city && String(row.city).trim()) {
        citySet.add(String(row.city).trim());
      }
      if (row.setup_data) {
        try {
          const parsed = typeof row.setup_data === 'string' ? JSON.parse(row.setup_data) : row.setup_data;
          const locCity = parsed?.location?.city || parsed?.business?.city || parsed?.personal?.city;
          if (locCity && String(locCity).trim()) {
            citySet.add(String(locCity).trim());
          }
        } catch (e) {
          // ignore parse error
        }
      }
    }

    // 2. Fetch locations from turfs
    const [turfRows] = await pool.query(
      "SELECT location FROM turfs WHERE location IS NOT NULL AND location != ''"
    );
    for (const row of turfRows) {
      if (row.location) {
        // If location is like "Tumsar" or "Station Road, Tumsar"
        const parts = String(row.location).split(",").map(s => s.trim()).filter(Boolean);
        if (parts.length === 1) {
          citySet.add(parts[0]);
        } else if (parts.length > 1) {
          // Add the city part (typically the last or second-to-last part)
          const cityCandidate = parts[parts.length - 1];
          citySet.add(cityCandidate);
        }
      }
    }

    // Clean, format in Title Case, filter out invalid names, and remove duplicates
    const ignoreWords = ["unknown location", "location not specified", "test", "null", "undefined", "n/a", "none", "string"];
    const formattedCities = Array.from(citySet)
      .map(c => c.trim())
      .filter(c => c.length > 1 && !/^\d+$/.test(c) && !ignoreWords.includes(c.toLowerCase()))
      .map(c => c.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" "))
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => a.localeCompare(b));

    return res.json({ success: true, cities: formattedCities });
  } catch (err) {
    console.error("Fetch Turf Cities Error:", err);
    return res.status(500).json({ success: false, error: err.message, cities: [] });
  }
});

// GET /api/turf/turfs - Get all turfs (Public) with dynamic reviews & rating
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT t.*, 
        COALESCE(r.review_count, t.reviews, 0) AS reviews,
        CASE 
          WHEN r.review_count > 0 THEN ROUND(r.avg_rating, 2)
          WHEN t.reviews > 0 AND t.rating > 0 THEN t.rating
          ELSE 0.00
        END AS rating
      FROM turfs t
      LEFT JOIN (
        SELECT turf_name, COUNT(*) AS review_count, AVG(rating) AS avg_rating 
        FROM reviews 
        GROUP BY turf_name
      ) r ON LOWER(TRIM(r.turf_name)) = LOWER(TRIM(t.name))
      ORDER BY t.id DESC
    `);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Fetch Turfs Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/turf/turfs/:id - Get turf by ID (Public) with dynamic reviews & rating
router.get("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT t.*, 
        COALESCE(r.review_count, t.reviews, 0) AS reviews,
        CASE 
          WHEN r.review_count > 0 THEN ROUND(r.avg_rating, 2)
          WHEN t.reviews > 0 AND t.rating > 0 THEN t.rating
          ELSE 0.00
        END AS rating
      FROM turfs t
      LEFT JOIN (
        SELECT turf_name, COUNT(*) AS review_count, AVG(rating) AS avg_rating 
        FROM reviews 
        GROUP BY turf_name
      ) r ON LOWER(TRIM(r.turf_name)) = LOWER(TRIM(t.name))
      WHERE t.id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Turf not found" });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Fetch Turf Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/turf/turfs - Add a new turf (Protected: Owner / Admin)
router.post("/", authenticateToken, requireRole(["admin", "super admin", "cms-admin", "turf-owner", "owner"]), async (req, res) => {
  try {
    const pool = getPool();
    const body = await filterTurfColumns(pool, req.body);
    if (body.rating === undefined || body.rating === null) body.rating = 0;
    if (body.reviews === undefined || body.reviews === null) body.reviews = 0;
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

// PUT /api/turf/turfs/:id - Update turf details (Protected: Owner / Admin)
router.put("/:id", authenticateToken, requireRole(["admin", "super admin", "cms-admin", "turf-owner", "owner"]), async (req, res) => {
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

// DELETE /api/turf/turfs/:id - Delete a turf (Protected: Admin / Owner)
router.delete("/:id", authenticateToken, requireRole(["admin", "super admin", "cms-admin", "turf-owner", "owner"]), async (req, res) => {
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
