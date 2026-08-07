import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/turf/promotions - Get active coupons and offers
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM coupons ORDER BY id DESC");
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Fetch Promotions Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/turf/promotions - Create a new promo coupon
router.post("/", async (req, res) => {
  try {
    const pool = getPool();
    const { code, discount, max_uses = 100, expiry, status = "Active" } = req.body;

    if (!code || !discount) {
      return res.status(400).json({ success: false, error: "Coupon code and discount are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO coupons (code, discount, max_uses, expiry, status) VALUES (?, ?, ?, ?, ?)",
      [code.toUpperCase(), discount, max_uses, expiry || "2026-12-31", status]
    );

    const [inserted] = await pool.query("SELECT * FROM coupons WHERE id = ?", [result.insertId]);
    return res.json({ success: true, data: inserted[0] });
  } catch (err) {
    console.error("Create Promotion Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/turf/promotions/:id - Delete a promo coupon
router.delete("/:id", async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query("DELETE FROM coupons WHERE id = ?", [id]);
    return res.json({ success: true, id: Number(id) });
  } catch (err) {
    console.error("Delete Promotion Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
