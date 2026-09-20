import express from "express";
import { getPool } from "../../db.js";
import { authenticateToken, requireRole } from "../../middleware/auth.js";

const router = express.Router();

// GET /api/turf/dashboard/stats - Overview stats for Turf Dashboard (Isolated per Turf Owner)
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const authUser = req.user;
    const isAdmin = authUser.role === "Admin" || authUser.role === "Super Admin" || authUser.accountType === "cms-admin";

    // Non-admins only see their own turfs
    let cleanEmail = authUser.email ? authUser.email.trim().toLowerCase() : "";
    let cleanName = authUser.fullName ? authUser.fullName.trim().toLowerCase() : "";

    if (isAdmin && (req.query.ownerEmail || req.query.ownerName)) {
      cleanEmail = String(req.query.ownerEmail || "").trim().toLowerCase();
      cleanName = String(req.query.ownerName || "").trim().toLowerCase();
    }

    let turfs = [];
    if (cleanEmail || cleanName) {
      const [rows] = await pool.query(
        `SELECT * FROM turfs 
         WHERE (LOWER(owner_email) = ? AND ? != '') 
            OR (LOWER(owner_name) = ? AND ? != '')`,
        [cleanEmail, cleanEmail, cleanName, cleanName]
      );
      turfs = rows;
    } else if (isAdmin) {
      const [rows] = await pool.query("SELECT * FROM turfs ORDER BY id DESC");
      turfs = rows;
    }

    if (turfs.length === 0) {
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
    }

    const confirmedBookings = bookings.filter((b) => String(b.status).toLowerCase() === "confirmed");
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

    let totalReviews = 0;
    let avgRating = 0;
    if (turfNames.length > 0) {
      const [reviewRows] = await pool.query(
        `SELECT COUNT(*) as count, AVG(rating) as avg_rating FROM reviews WHERE turf_name IN (${turfNames.map(() => "?").join(",")})`,
        turfNames
      );
      totalReviews = reviewRows[0]?.count || 0;
      avgRating = totalReviews > 0 && reviewRows[0]?.avg_rating ? Number(Number(reviewRows[0].avg_rating).toFixed(1)) : 0;
    }

    return res.json({
      success: true,
      stats: {
        totalTurfs: turfs.length,
        totalBookings: bookings.length,
        totalRevenue: totalRevenue,
        totalStaff: 0,
        avgRating: Number(avgRating),
        totalReviews: totalReviews,
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
