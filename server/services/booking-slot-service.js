import cron from "node-cron";
import { getPool } from "../db.js";

/**
 * Booking Slot Service
 * Handles accurate parsing of date & time slots, determining match lifecycle states
 * (upcoming, in-progress, completed), auto-completing concluded bookings in the database,
 * and enforcing strict cancellation cutoffs.
 */

/**
 * Parses individual time string like "11:00 PM", "12:00 AM", "6:30 AM", "23:00"
 * @param {string} timeStr 
 * @returns {{ hours: number, minutes: number } | null}
 */
export function parseTimePart(timeStr) {
  if (!timeStr) return null;
  const cleaned = String(timeStr).trim();
  const match = cleaned.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3] ? match[3].toUpperCase() : null;

  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  return { hours, minutes };
}

/**
 * Parses date string in various formats:
 * - YYYY-MM-DD / YYYY/MM/DD
 * - DD-MM-YYYY / DD/MM/YYYY
 * - Human-readable: "Oct 3, 2026", "3 October 2026"
 * @param {string} dateStr 
 * @returns {{ year: number, month: number, day: number } | null}
 */
export function parseDatePart(dateStr) {
  if (!dateStr) return null;
  const cleanStr = String(dateStr).trim();

  // 1. Try ISO YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = cleanStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    return {
      year: parseInt(isoMatch[1], 10),
      month: parseInt(isoMatch[2], 10) - 1, // 0-indexed for JS Date
      day: parseInt(isoMatch[3], 10),
    };
  }

  // 2. Try DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = cleanStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    return {
      day: parseInt(dmyMatch[1], 10),
      month: parseInt(dmyMatch[2], 10) - 1,
      year: parseInt(dmyMatch[3], 10),
    };
  }

  // 3. Fallback to native Date parser (e.g. "Oct 3, 2026")
  const parsed = new Date(cleanStr);
  if (!isNaN(parsed.getTime())) {
    return {
      year: parsed.getFullYear(),
      month: parsed.getMonth(),
      day: parsed.getDate(),
    };
  }

  return null;
}

/**
 * Combines dateStr and timeSlotStr into concrete JavaScript Date timestamps.
 * Handles overnight slots where slot end time crosses midnight into the next day
 * (e.g., "11:00 PM - 12:00 AM" or "11:00 PM - 01:00 AM").
 * 
 * @param {string} dateStr 
 * @param {string} timeSlotStr 
 * @param {Date} [currentTime] Optional reference date (defaults to new Date())
 * @returns {{
 *   slotStart: Date | null,
 *   slotEnd: Date | null,
 *   isStarted: boolean,
 *   isPast: boolean,
 *   formattedRange: string
 * }}
 */
export function parseBookingSlotTimes(dateStr, timeSlotStr, currentTime = new Date()) {
  const dateInfo = parseDatePart(dateStr);
  if (!dateInfo) {
    return {
      slotStart: null,
      slotEnd: null,
      isStarted: false,
      isPast: false,
      formattedRange: `${dateStr} (${timeSlotStr || ""})`,
    };
  }

  const parts = String(timeSlotStr || "").split(/[-–—]|(?:\s+to\s+)/i);
  const startPart = parseTimePart(parts[0]);
  const endPart = parseTimePart(parts[1]);

  let slotStart = null;
  let slotEnd = null;

  if (startPart) {
    slotStart = new Date(
      dateInfo.year,
      dateInfo.month,
      dateInfo.day,
      startPart.hours,
      startPart.minutes,
      0,
      0
    );
  } else {
    // If no start time found, assume beginning of the date (00:00:00)
    slotStart = new Date(dateInfo.year, dateInfo.month, dateInfo.day, 0, 0, 0, 0);
  }

  if (endPart) {
    slotEnd = new Date(
      dateInfo.year,
      dateInfo.month,
      dateInfo.day,
      endPart.hours,
      endPart.minutes,
      0,
      0
    );

    // If slotEnd is before or equal to slotStart (e.g. 11:00 PM to 12:00 AM),
    // it crossed midnight into the next day!
    if (slotEnd <= slotStart) {
      slotEnd.setDate(slotEnd.getDate() + 1);
    }
  } else if (startPart) {
    // Default slot duration: 1 hour if end time isn't explicitly separated
    slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
  } else {
    // Default to end of day if no time specified
    slotEnd = new Date(dateInfo.year, dateInfo.month, dateInfo.day, 23, 59, 59, 999);
  }

  const now = currentTime;
  const isStarted = now >= slotStart;
  const isPast = now >= slotEnd;

  return {
    slotStart,
    slotEnd,
    isStarted,
    isPast,
    formattedRange: `${dateStr} · ${timeSlotStr || ""}`,
  };
}

/**
 * Validates whether a booking can be cancelled by the user.
 * Blocks cancellation if the match has already started, ended, or is completed.
 * 
 * @param {object} booking 
 * @param {Date} [now]
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function validateBookingCancellation(booking, now = new Date()) {
  if (!booking) {
    return { allowed: false, reason: "Booking record was not found." };
  }

  const status = String(booking.status || "").toLowerCase();
  if (status === "cancelled" || status === "canceled") {
    return { allowed: false, reason: "This booking is already cancelled." };
  }

  if (status === "completed") {
    return {
      allowed: false,
      reason: "This match slot has already been completed. Completed bookings cannot be cancelled or refunded.",
    };
  }

  const { slotStart, isStarted, isPast } = parseBookingSlotTimes(
    booking.date,
    booking.time_slot || booking.slot_time,
    now
  );

  if (isPast) {
    return {
      allowed: false,
      reason: "This match slot has already concluded. Concluded matches are not eligible for cancellation or refund.",
    };
  }

  if (isStarted) {
    return {
      allowed: false,
      reason: "This match slot is already in progress. In-progress bookings cannot be cancelled or refunded.",
    };
  }

  return { allowed: true };
}

/**
 * Auto-completes any concluded bookings in the database for the given list of bookings,
 * or queries and transitions all expired Confirmed/Paid bookings across the database.
 * 
 * @param {object} pool - MySQL connection pool
 * @param {Array<object>} [bookingsList] Optional specific list of bookings to evaluate
 * @returns {Promise<number>} Number of bookings updated to 'Completed'
 */
export async function syncCompletedBookings(pool, bookingsList = null) {
  try {
    let toEvaluate = bookingsList;

    if (!toEvaluate) {
      // Query recent confirmed/paid bookings that might have concluded
      const [rows] = await pool.query(
        `SELECT id, date, time_slot, slot_time, status 
           FROM bookings 
          WHERE status IN ('Confirmed', 'Paid')
          ORDER BY id DESC
          LIMIT 200`
      );
      toEvaluate = rows;
    }

    if (!toEvaluate || toEvaluate.length === 0) return 0;

    const now = new Date();
    const completedIds = [];

    for (const b of toEvaluate) {
      if (b.status === "Cancelled" || b.status === "Canceled" || b.status === "Completed") {
        continue;
      }

      const { isPast } = parseBookingSlotTimes(b.date, b.time_slot || b.slot_time, now);
      if (isPast) {
        completedIds.push(b.id);
        b.status = "Completed";
      }
    }

    if (completedIds.length > 0) {
      await pool.query(
        `UPDATE bookings SET status = 'Completed' WHERE id IN (?)`,
        [completedIds]
      );
      console.log(`[Auto-Complete Engine] Successfully updated ${completedIds.length} concluded booking(s) to 'Completed' (IDs: ${completedIds.join(", ")})`);
    }

    return completedIds.length;
  } catch (err) {
    console.error("[Auto-Complete Engine Error]:", err.message);
    return 0;
  }
}

/**
 * Initializes a background cron job that periodically (every 15 minutes)
 * transitions concluded bookings from 'Confirmed'/'Paid' to 'Completed'.
 */
export function startBookingStatusScheduler() {
  try {
    cron.schedule("*/15 * * * *", async () => {
      try {
        const pool = getPool();
        await syncCompletedBookings(pool);
      } catch (err) {
        console.warn("[Booking Status Cron Notice]:", err.message);
      }
    });
    console.log("[Booking Status Scheduler] ⏱ Concluded booking lifecycle monitor active (running every 15 minutes).");
  } catch (e) {
    console.warn("Failed to initialize booking status scheduler:", e.message);
  }
}

