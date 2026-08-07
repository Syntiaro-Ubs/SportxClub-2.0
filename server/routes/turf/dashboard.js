import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/turf/dashboard/stats - Overview stats for Turf Dashboard
router.get("/stats", async (req, res) => {
  try {
    const pool = getPool();
    const turfOwnerId = req.query.ownerId;
    
    // Fetch counts and metrics
    const [[turfsCount]] = await pool.query("SELECT COUNT(*) as count FROM turfs");
    const [[bookingsCount]] = await pool.query("SELECT COUNT(*) as count FROM bookings");
    const [[revenueSum]] = await pool.query("SELECT COALESCE(SUM(amount), 0) as sum FROM bookings WHERE status = 'Confirmed'");
    const [[staffCount]] = await pool.query("SELECT COUNT(*) as count FROM staff");

    // Fetch recent bookings
    const [recentBookings] = await pool.query(
      "SELECT * FROM bookings ORDER BY id DESC LIMIT 5"
    );

    // Fetch recent turfs
    const [recentTurfs] = await pool.query(
      "SELECT id, name, location, sport_type, price_per_hour, rating, status FROM turfs ORDER BY id DESC LIMIT 5"
    );

    return res.json({
      success: true,
      stats: {
        totalTurfs: turfsCount.count,
        totalBookings: bookingsCount.count,
        totalRevenue: Number(revenueSum.sum),
        totalStaff: staffCount.count,
        avgRating: 4.8,
      },
      recentBookings,
      recentTurfs,
    });
  } catch (err) {
    console.error("Turf Dashboard Stats Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
