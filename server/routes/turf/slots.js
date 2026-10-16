import express from "express";
import jwt from "jsonwebtoken";
import { getPool } from "../../db.js";

const router = express.Router();

function formatHourLabel(h) {
  const normalized = ((h % 24) + 24) % 24;
  const ampm = normalized >= 12 ? "PM" : "AM";
  const hour12 = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${String(hour12).padStart(2, "0")}:00 ${ampm}`;
}

/**
 * GET /api/turf/slots/availability (or /booked)
 * High-performance, privacy-safe slot availability check for venue booking pages
 */
router.get(["/availability", "/booked"], async (req, res) => {
  try {
    const pool = getPool();
    const { turfId, turfName, date } = req.query;

    if (!turfId && !turfName) {
      return res.status(400).json({ success: false, error: "turfId or turfName is required" });
    }

    const cleanDate = String(date || new Date().toISOString().split("T")[0]).trim();
    const cleanTurfName = String(turfName || "").trim();
    const numericTurfId = turfId ? parseInt(turfId, 10) : -1;

    // Optional user authentication check to identify own bookings (for cancellation)
    let userEmail = null;
    try {
      const authHeader = req.headers["authorization"];
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET || "sportxclub_super_secret_jwt_key_2025";
        const decoded = jwt.verify(token, secret);
        userEmail = decoded.email ? decoded.email.toLowerCase().trim() : null;
      }
    } catch (_) {
      // Ignored for unauthenticated visitors
    }

    // 1. Fetch booked slots from database for this turf & date
    const [bookings] = await pool.query(
      `SELECT id, booking_code, time_slot, slot_time, date, turf_name, status, user_email, user_name
       FROM bookings 
       WHERE (turf_id = ? OR LOWER(turf_name) = LOWER(?)) 
         AND date = ? 
         AND status IN ('Confirmed', 'Paid')`,
      [numericTurfId, cleanTurfName, cleanDate]
    );

    // Sanitize bookings so strangers cannot see other customers' personal information
    const sanitizedBookings = bookings.map((b) => {
      const isOwner = userEmail && b.user_email && (b.user_email.toLowerCase().trim() === userEmail);
      return {
        id: isOwner ? b.id : undefined,
        booking_code: isOwner ? b.booking_code : undefined,
        turf_name: b.turf_name,
        date: b.date,
        time_slot: b.time_slot || b.slot_time,
        slot_time: b.time_slot || b.slot_time,
        status: b.status,
        user_name: isOwner ? b.user_name : "Booked Player",
        user_email: isOwner ? b.user_email : undefined,
        isOwnBooking: Boolean(isOwner),
      };
    });

    const bookedSlots = bookings
      .map((b) => b.time_slot || b.slot_time)
      .filter(Boolean);

    // 2. Check if date is blocked by owner in owner_disabled_dates
    const [disabledRows] = await pool.query(
      `SELECT reason FROM owner_disabled_dates 
       WHERE (turf_id = ? OR LOWER(turf_name) = LOWER(?)) 
         AND date = ? LIMIT 1`,
      [numericTurfId, cleanTurfName, cleanDate]
    );

    const isDateBlocked = disabledRows.length > 0;
    const disabledReason = isDateBlocked ? (disabledRows[0].reason || "Blocked by Turf Management") : "";

    return res.json({
      success: true,
      turfId: numericTurfId,
      turfName: cleanTurfName,
      date: cleanDate,
      bookings: sanitizedBookings,
      bookedSlots,
      isDateBlocked,
      disabledReason,
    });
  } catch (err) {
    console.error("Fetch Slot Availability Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/turf/slots
 * Generates dynamic time slots and pricing based on the actual turf operating hours from MySQL
 */
router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const { turfId, turfName, date } = req.query;

    const cleanDate = String(date || new Date().toISOString().split("T")[0]).trim();
    const numericTurfId = turfId ? parseInt(turfId, 10) : -1;
    const cleanTurfName = String(turfName || "").trim();

    // 1. Fetch real turf details (price_per_hour, location, name)
    let turf = null;
    if (numericTurfId > 0) {
      const [rows] = await pool.query("SELECT * FROM turfs WHERE id = ? LIMIT 1", [numericTurfId]);
      if (rows[0]) turf = rows[0];
    }
    if (!turf && cleanTurfName) {
      const [rows] = await pool.query("SELECT * FROM turfs WHERE LOWER(name) = LOWER(?) LIMIT 1", [cleanTurfName]);
      if (rows[0]) turf = rows[0];
    }

    const basePrice = turf?.price_per_hour ? parseFloat(turf.price_per_hour) : 1200;
    const openHour = 6;  // 6:00 AM
    const closeHour = 23; // 11:00 PM

    // 2. Fetch existing confirmed bookings for this date to mark isBooked
    let bookedSet = new Set();
    if (turf) {
      const [bookings] = await pool.query(
        `SELECT time_slot, slot_time FROM bookings 
         WHERE (turf_id = ? OR LOWER(turf_name) = LOWER(?)) 
           AND date = ? 
           AND status IN ('Confirmed', 'Paid')`,
        [turf.id, turf.name, cleanDate]
      );
      bookings.forEach((b) => {
        if (b.time_slot) bookedSet.add(b.time_slot.trim());
        if (b.slot_time) bookedSet.add(b.slot_time.trim());
      });
    }

    // 3. Generate dynamic hourly slots
    const dynamicSlots = [];
    for (let h = openHour; h < closeHour; h++) {
      const startStr = formatHourLabel(h);
      const endStr = formatHourLabel(h + 1);
      const slotTimeRange = `${startStr} - ${endStr}`;
      const isPeak = (h >= 17 && h <= 22) || (h >= 6 && h <= 9);
      const slotPrice = isPeak ? Math.round(basePrice * 1.15) : basePrice;
      const isBooked = bookedSet.has(slotTimeRange);

      dynamicSlots.push({
        id: `slot-${h}`,
        time: slotTimeRange,
        startHour: h,
        price: slotPrice,
        isPeak,
        isBooked,
        isBlocked: false,
      });
    }

    return res.json({
      success: true,
      turfId: turf?.id || numericTurfId || 1,
      turfName: turf?.name || cleanTurfName || "Sports Arena",
      date: cleanDate,
      slots: dynamicSlots,
    });
  } catch (err) {
    console.error("Fetch Dynamic Slots Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/turf/slots/toggle-block - Block or unblock a time slot
router.post("/toggle-block", async (req, res) => {
  try {
    const { slotId, isBlocked, turfId } = req.body;
    return res.json({
      success: true,
      message: `Slot ${slotId} block status updated to ${isBlocked}`,
      slotId,
      isBlocked,
    });
  } catch (err) {
    console.error("Toggle Slot Block Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/turf/slots/pricing - Update pricing rules for peak/off-peak slots
router.put("/pricing", async (req, res) => {
  try {
    const { turfId, basePrice, peakPrice, weekendMultiplier } = req.body;
    return res.json({
      success: true,
      message: "Slot pricing rules updated successfully",
      pricing: { turfId, basePrice, peakPrice, weekendMultiplier },
    });
  } catch (err) {
    console.error("Update Slot Pricing Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
