import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// GET /api/turf/dashboard/stats - Overview stats for Turf Dashboard (Isolated per Turf Owner)
router.get("/stats", async (req, res) => {
  try {
    const pool = getPool();
    const { ownerEmail, ownerName } = req.query;
    const cleanEmail = String(ownerEmail || "").trim().toLowerCase();
    const cleanName = String(ownerName || "").trim().toLowerCase();

    let turfs = [];
    if (cleanEmail || cleanName) {
      const [rows] = await pool.query(
        `SELECT * FROM turfs 
         WHERE (LOWER(owner_email) = ? AND ? != '') 
            OR (LOWER(owner_name) = ? AND ? != '')`,
        [cleanEmail, cleanEmail, cleanName, cleanName]
      );
      turfs = rows;
    } else {
      const [rows] = await pool.query("SELECT * FROM turfs ORDER BY id DESC");
      turfs = rows;
    }

    if ((cleanEmail || cleanName) && turfs.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalTurfs: 0,
          totalBookings: 0,
          totalRevenue: 0,
          totalStaff: 0,
          avgRating: 0,
        },
        recentBookings: [],
        recentTurfs: [],
      });
    }

    const turfNames = turfs.map((t) => t.name);
    let bookings = [];
    if (turfNames.length > 0) {
      const [rows] = await pool.query(
        `SELECT * FROM bookings WHERE turf_name IN (${turfNames.map(() => "?").join(",")}) ORDER BY id DESC`,
        turfNames
      );
      bookings = rows;
    } else if (!cleanEmail && !cleanName) {
      const [rows] = await pool.query("SELECT * FROM bookings ORDER BY id DESC");
      bookings = rows;
    }

    const confirmedBookings = bookings.filter((b) => String(b.status).toLowerCase() === "confirmed");
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const avgRating = turfs.length
      ? (turfs.reduce((sum, t) => sum + (Number(t.rating) || 0), 0) / turfs.length).toFixed(1)
      : 0;

    return res.json({
      success: true,
      stats: {
        totalTurfs: turfs.length,
        totalBookings: bookings.length,
        totalRevenue: totalRevenue,
        totalStaff: 0,
        avgRating: Number(avgRating),
      },
      recentBookings: bookings.slice(0, 5),
      recentTurfs: turfs.slice(0, 5),
    });
  } catch (err) {
    console.error("Turf Dashboard Stats Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
