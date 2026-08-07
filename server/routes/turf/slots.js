import express from "express";
import { getPool } from "../../db.js";

const router = express.Router();

// Simulated slot schedule configuration store or query table
// GET /api/turf/slots - Fetch available slots and slot settings
router.get("/", async (req, res) => {
  try {
    const { turfId, date } = req.query;
    
    // Default standard operating slot layout (6:00 AM to 11:00 PM)
    const timeSlots = [
      { id: "slot-1", time: "06:00 AM - 07:00 AM", price: 1200, isPeak: false, isBooked: false, isBlocked: false },
      { id: "slot-2", time: "07:00 AM - 08:00 AM", price: 1200, isPeak: false, isBooked: false, isBlocked: false },
      { id: "slot-3", time: "08:00 AM - 09:00 AM", price: 1500, isPeak: true, isBooked: false, isBlocked: false },
      { id: "slot-4", time: "09:00 AM - 10:00 AM", price: 1500, isPeak: true, isBooked: false, isBlocked: false },
      { id: "slot-5", time: "04:00 PM - 05:00 PM", price: 1500, isPeak: false, isBooked: false, isBlocked: false },
      { id: "slot-6", time: "05:00 PM - 06:00 PM", price: 1800, isPeak: true, isBooked: false, isBlocked: false },
      { id: "slot-7", time: "06:00 PM - 07:00 PM", price: 1800, isPeak: true, isBooked: true, isBlocked: false },
      { id: "slot-8", time: "07:00 PM - 08:00 PM", price: 2000, isPeak: true, isBooked: true, isBlocked: false },
      { id: "slot-9", time: "08:00 PM - 09:00 PM", price: 2000, isPeak: true, isBooked: false, isBlocked: false },
      { id: "slot-10", time: "09:00 PM - 10:00 PM", price: 1800, isPeak: false, isBooked: false, isBlocked: false },
    ];

    return res.json({
      success: true,
      turfId: turfId || 1,
      date: date || new Date().toISOString().split("T")[0],
      slots: timeSlots,
    });
  } catch (err) {
    console.error("Fetch Slots Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/turf/slots/toggle-block - Block or unblock a time slot
router.post("/toggle-block", async (req, res) => {
  try {
    const { slotId, isBlocked, turfId } = req.body;
    return res.json({
      success: true,
      message: `Slot ${slotId} block status set to ${isBlocked}`,
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
