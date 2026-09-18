import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/turf/revenue - Get revenue breakdown and payment logs
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [payments] = await pool.query("SELECT * FROM payments ORDER BY id DESC LIMIT 20");
    const [[totalSum]] = await pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'Success'");
    const [[bookingSum]] = await pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM bookings WHERE status = 'Confirmed'");

    const totalRevenue = Number(totalSum.total) + Number(bookingSum.total);

    return res.json({
      success: true,
      data: {
        totalRevenue,
        monthlyEarnings: Math.round(totalRevenue * 0.4),
        pendingSettlement: Math.round(totalRevenue * 0.15),
        recentTransactions: payments,
      }
    });
  } catch (err) {
    console.error("Fetch Revenue Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
