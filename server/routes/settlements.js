import express from "express";
import { getPool } from "../db.js";
import { processDailyTurfSettlements, getTodayDateString } from "../services/payout-cron-service.js";

const router = express.Router();

/**
 * GET /api/settlements
 * Fetch all settlements (with optional filters: date, owner_email, status)
 */
router.get("/", async (req, res) => {
  try {
    const conn = getPool();
    const { date, owner_email, status, limit = 50, offset = 0 } = req.query;

    let query = "SELECT * FROM owner_settlements WHERE 1=1";
    const params = [];

    if (date) {
      query += " AND (settlement_date = ? OR settlement_date LIKE ?)";
      params.push(date, `${date}%`);
    }

    if (owner_email) {
      query += " AND owner_email = ?";
      params.push(owner_email.toLowerCase().trim());
    }

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const [settlements] = await conn.query(query, params);

    // Get total metrics
    const [stats] = await conn.query(`
      SELECT 
        COUNT(*) as total_settlements,
        COALESCE(SUM(gross_amount), 0) as total_gross,
        COALESCE(SUM(platform_fee), 0) as total_platform_fee,
        COALESCE(SUM(net_payout_amount), 0) as total_net_payout
      FROM owner_settlements
    `);

    res.json({
      success: true,
      stats: stats[0] || {},
      settlements,
    });
  } catch (err) {
    console.error("[Settlements API Error]:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/settlements/owner/:ownerEmail
 * Fetch settlement history for a specific turf owner
 */
router.get("/owner/:ownerEmail", async (req, res) => {
  try {
    const conn = getPool();
    const ownerEmail = (req.params.ownerEmail || "").toLowerCase().trim();

    const [settlements] = await conn.query(
      `SELECT * FROM owner_settlements 
       WHERE LOWER(owner_email) = ? 
       ORDER BY settlement_date DESC, created_at DESC`,
      [ownerEmail]
    );

    const [stats] = await conn.query(
      `SELECT 
        COUNT(*) as total_payouts,
        COALESCE(SUM(net_payout_amount), 0) as total_earned,
        COALESCE(SUM(total_bookings), 0) as total_slots_settled
       FROM owner_settlements 
       WHERE LOWER(owner_email) = ? AND status = 'SUCCESS'`,
      [ownerEmail]
    );

    res.json({
      success: true,
      ownerEmail,
      stats: stats[0] || {},
      settlements,
    });
  } catch (err) {
    console.error("[Owner Settlements API Error]:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/settlements/:settlementId
 * Get detailed view of a single settlement including its itemized bookings
 */
router.get("/:settlementId", async (req, res) => {
  try {
    const conn = getPool();
    const { settlementId } = req.params;

    const [settlements] = await conn.query(
      `SELECT * FROM owner_settlements WHERE settlement_id = ?`,
      [settlementId]
    );

    if (!settlements || settlements.length === 0) {
      return res.status(404).json({ success: false, message: "Settlement record not found." });
    }

    const settlement = settlements[0];

    // Fetch the bookings linked to this settlement
    const [bookings] = await conn.query(
      `SELECT * FROM bookings 
       WHERE payout_id = ? OR (date = ? AND payout_date = ?)
       ORDER BY id ASC`,
      [settlementId, settlement.settlement_date, settlement.settlement_date]
    );

    res.json({
      success: true,
      settlement,
      bookings,
    });
  } catch (err) {
    console.error("[Settlement Details API Error]:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/settlements/process-manual
 * Manually triggers the automated settlement batch for a given date (or today)
 * Useful for Admin dashboard to test or run instant settlements on demand.
 */
router.post("/process-manual", async (req, res) => {
  try {
    const { targetDate } = req.body;
    const processDate = targetDate || getTodayDateString();

    console.log(`[Manual Trigger] Admin triggered settlement process for date: ${processDate}`);
    const result = await processDailyTurfSettlements(processDate);

    res.json({
      success: result.success,
      message: result.message || "Manual settlement processing triggered.",
      data: result.data || {},
    });
  } catch (err) {
    console.error("[Manual Settlement Trigger Error]:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
