import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/turf/staff - Get all turf staff members
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT id, first_name, last_name, email, phone, role, turf, is_active, permissions, created_at FROM staff ORDER BY id DESC");
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Fetch Staff Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/turf/staff - Add a new staff member
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const { first_name, last_name, email, phone, password, role = "Receptionist", turf, permissions } = req.body;

    if (!email || !password || !first_name) {
      return res.status(400).json({ success: false, error: "First name, email, and password are required" });
    }

    const permString = typeof permissions === "object" ? JSON.stringify(permissions) : permissions;

    const [result] = await pool.query(
      `INSERT INTO staff (first_name, last_name, email, phone, password, role, turf, is_active, permissions)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [first_name, last_name || "", email, phone || "", password, role, turf || "", permString || "[]"]
    );

    const [inserted] = await pool.query("SELECT id, first_name, last_name, email, phone, role, turf, is_active, permissions FROM staff WHERE id = ?", [result.insertId]);
    return res.json({ success: true, data: inserted[0] });
  } catch (err) {
    console.error("Create Staff Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/turf/staff/:id - Update staff details
router.put("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { first_name, last_name, email, phone, role, turf, is_active, permissions } = req.body;

    const permString = typeof permissions === "object" ? JSON.stringify(permissions) : permissions;

    await pool.query(
      `UPDATE staff SET 
       first_name = COALESCE(?, first_name),
       last_name = COALESCE(?, last_name),
       email = COALESCE(?, email),
       phone = COALESCE(?, phone),
       role = COALESCE(?, role),
       turf = COALESCE(?, turf),
       is_active = COALESCE(?, is_active),
       permissions = COALESCE(?, permissions)
       WHERE id = ?`,
      [first_name, last_name, email, phone, role, turf, is_active, permString, id]
    );

    const [updated] = await pool.query("SELECT id, first_name, last_name, email, phone, role, turf, is_active, permissions FROM staff WHERE id = ?", [id]);
    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error("Update Staff Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/turf/staff/:id - Remove staff member
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query("DELETE FROM staff WHERE id = ?", [id]);
    return res.json({ success: true, id: Number(id) });
  } catch (err) {
    console.error("Delete Staff Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
