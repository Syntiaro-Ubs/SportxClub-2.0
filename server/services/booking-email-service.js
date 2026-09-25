import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { jsPDF } from "jspdf";
import { getPool } from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

/**
 * Creates and returns the configured Nodemailer transporter
 */
function getTransporter() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || "waghmareshrinivas99@gmail.com").trim();
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || "").replace(/\s+/g, "");

  if (host && host !== "smtp.gmail.com") {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Helper to parse slot times into startTime, endTime, duration, slotCount, and displaySlotText
 */
function parseSlotDetails(timeSlot = "") {
  let startTime = "Scheduled Time";
  let endTime = "Scheduled End";
  let duration = "1 Hour";
  let slotCount = 1;
  let slotList = [];
  let displaySlotText = String(timeSlot || "Scheduled Time").trim();

  if (!timeSlot) {
    return { startTime, endTime, duration, slotCount, slotList, displaySlotText };
  }

  const str = String(timeSlot).trim();

  // 1. Multiple slots separated by comma or semicolon e.g. "05:00 PM - 06:00 PM, 06:00 PM - 07:00 PM"
  if (str.includes(",") || str.includes(";")) {
    const slots = str.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
    slotList = slots;
    slotCount = slots.length;

    const parseSingle = (singleStr) => {
      const match = singleStr.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*[-–to]+\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i);
      if (match) return { start: match[1].trim(), end: match[2].trim() };
      return { start: singleStr, end: singleStr };
    };

    const firstParsed = parseSingle(slots[0]);
    const lastParsed = parseSingle(slots[slots.length - 1]);

    startTime = firstParsed.start;
    endTime = lastParsed.end;
    duration = `${slotCount} ${slotCount === 1 ? "Hour" : "Hours"}`;
    displaySlotText = slots.join(", ");

    return { startTime, endTime, duration, slotCount, slotList, displaySlotText };
  }

  // 2. Single range e.g. "06:00 PM - 07:00 PM" or "06:00 PM – 08:00 PM"
  if (str.includes("-") || str.includes("–") || str.includes("to")) {
    const parts = str.split(/[-–]|to/).map((p) => p.trim());
    if (parts.length >= 2) {
      startTime = parts[0];
      endTime = parts[1];
      
      const parseHour = (t) => {
        const match = t.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
        if (!match) return null;
        let h = parseInt(match[1], 10);
        const m = match[2] ? parseInt(match[2], 10) : 0;
        const meridian = match[3] ? match[3].toUpperCase() : null;
        if (meridian === "PM" && h < 12) h += 12;
        if (meridian === "AM" && h === 12) h = 0;
        return h + m / 60;
      };

      const startH = parseHour(startTime);
      const endH = parseHour(endTime);
      if (startH !== null && endH !== null) {
        let diff = endH - startH;
        if (diff < 0) diff += 24;
        if (diff > 0) {
          slotCount = Math.round(diff);
          duration = diff === 1 ? "1 Hour" : `${diff} Hours`;
        }
      }
    }
  } else {
    startTime = str;
    endTime = "End of Slot";
    duration = "1 Hour";
    slotCount = 1;
  }

  displaySlotText = `${startTime} – ${endTime}`;
  return { startTime, endTime, duration, slotCount, slotList, displaySlotText };
}

/**
 * Format timestamp into readable Indian Standard Time
 */
function formatDateTime(dateInput) {
  try {
    const date = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(date.getTime())) return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  }
}

/**
 * Fetches QR Code as Base64 for PDF embedding
 */
async function getQrCodeBase64(bookingId) {
  try {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bookingId || "SportXClub-Pass")}`;
    const res = await fetch(qrUrl);
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      return `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
    }
  } catch (err) {
    console.warn("[BOOKING EMAIL] QR fetch warning:", err.message);
  }
  return null;
}

/**
 * Generates exact Website Match Pass (Image 1) in PDF format
 */
async function generatePassPdfBuffer({
  bookingId,
  userName,
  userEmail,
  userPhone,
  turfName,
  sport,
  bookingDate,
  startTime,
  endTime,
  duration,
  amountPaid,
  turfLocation,
  bookingCreatedAt,
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Soft page background
  doc.setFillColor(248, 250, 252); // #f8fafc
  doc.rect(0, 0, 210, 297, "F");

  // Center Ticket Card Container
  const cardX = 25;
  const cardY = 30;
  const cardW = 160;
  const cardH = 215;

  // Outer Card Box (White with rounded corners & clean border)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240); // #e2e8f0
  doc.roundedRect(cardX, cardY, cardW, cardH, 8, 8, "FD");

  // 1. Header Section
  doc.setTextColor(148, 163, 184); // #94a3b8
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("SPORTX ENTRY PASS", cardX + 10, cardY + 14);

  // Status Badge (Paid / Active) - Right Top Capsule
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.setDrawColor(167, 243, 208); // Emerald-200
  doc.roundedRect(cardX + cardW - 38, cardY + 7, 28, 8, 4, 4, "FD");

  doc.setTextColor(5, 150, 105); // Emerald-600
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("PAID / ACTIVE", cardX + cardW - 24, cardY + 12.5, { align: "center" });

  // Divider Line below Header
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.3);
  doc.line(cardX + 10, cardY + 20, cardX + cardW - 10, cardY + 20);

  // 2. Details 2-Column Grid
  const col1X = cardX + 10;
  const col2X = cardX + 85;

  // Row 1: Venue & Sport
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("VENUE", col1X, cardY + 30);
  doc.text("SPORT", col2X, cardY + 30);

  doc.setTextColor(15, 23, 42); // Slate-900
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(String(turfName || "SportX Arena"), col1X, cardY + 37);
  doc.text(String(sport || "Football"), col2X, cardY + 37);

  // Row 2: Date & Time Slot
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("DATE", col1X, cardY + 49);
  doc.text("TIME SLOT", col2X, cardY + 49);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(String(bookingDate || ""), col1X, cardY + 56);
  doc.text(`${startTime} – ${endTime}`, col2X, cardY + 56);

  // Row 3: Cashfree Order / Booking ID
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("CASHFREE ORDER ID", col1X, cardY + 68);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont("courier", "bold");
  doc.text(String(bookingId || "SPX-BK"), col1X, cardY + 75);

  // Dashed Separator Line
  doc.setLineDashPattern([2, 2], 0);
  doc.setDrawColor(226, 232, 240);
  doc.line(cardX + 10, cardY + 86, cardX + cardW - 10, cardY + 86);
  doc.setLineDashPattern([], 0); // reset dash

  // 3. QR Code Box (Rounded Center Card)
  const qrBoxX = cardX + 35;
  const qrBoxY = cardY + 95;
  const qrBoxW = 90;
  const qrBoxH = 88;

  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(241, 245, 249);
  doc.roundedRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 6, 6, "FD");

  // Fetch and Embed Live QR Code Image
  const qrDataUrl = await getQrCodeBase64(bookingId);
  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, "PNG", qrBoxX + 15, qrBoxY + 8, 60, 60);
    } catch (qrErr) {
      console.warn("[PDF QR Add Error]:", qrErr.message);
    }
  }

  // QR Code Subtitle
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("SCAN AT RECEPTION", cardX + (cardW / 2), qrBoxY + 78, { align: "center" });

  // 4. Subtle Card Footer Information
  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(
    `SportXClub Verified Match Pass • Player: ${userName || "Athlete"} • Paid: INR ${Number(amountPaid || 0).toLocaleString("en-IN")}`,
    cardX + (cardW / 2),
    cardY + cardH - 10,
    { align: "center" }
  );

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

/**
 * 1. Template: User Booking Confirmation Email
 */
function getPlayerBookingConfirmationHtml({
  userName,
  bookingId,
  bookingCreatedAt,
  amountPaid,
  turfName,
  sportName,
  turfLocation,
  bookingDate,
  startTime,
  endTime,
  duration,
  slotCount,
  displaySlotText,
}) {
  const formattedAmount = Number(amountPaid || 0).toLocaleString("en-IN");

  return `
<div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #202124;">
  <p style="margin: 0 0 16px 0;">Welcome to <strong>SportXClub</strong>! 🎉<br>
  We're happy to confirm your turf slot booking with us.</p>

  <p style="margin: 0 0 16px 0;">Your turf slot booking has been successfully confirmed on the SportXClub platform.</p>

  <p style="margin: 0 0 16px 0;">
    <strong>Booking Details:</strong><br>
    <strong>Turf Name :-</strong> ${turfName}<br>
    <strong>Location :-</strong> ${turfLocation || "Registered Arena"}<br>
    <strong>Sport :-</strong> ${sportName}<br>
    <strong>Player Name :-</strong> ${userName || "Player"}<br>
    <strong>Booking ID :-</strong> ${bookingId}<br>
    <strong>Date :-</strong> ${bookingDate}<br>
    <strong>Time Slot :-</strong> ${displaySlotText || `${startTime} – ${endTime}`}<br>
    <strong>Duration :-</strong> ${duration} (${slotCount || 1} ${Number(slotCount || 1) === 1 ? "Slot" : "Slots"})<br>
    <strong>Total Paid :-</strong> ₹${formattedAmount}
  </p>

  <p style="margin: 0 0 16px 0;">If you need any assistance with your booking, feel free to contact our support team.</p>

  <p style="margin: 0 0 16px 0;">Thank you for choosing SportXClub. We look forward to seeing you on the ground!</p>

  <p style="margin: 0; line-height: 1.5;">
    Best Regards,<br>
    <strong>SportXClub Team</strong>
  </p>
</div>
  `.trim();
}

/**
 * 2. Template: Turf Owner New Booking Notification Email
 */
function getOwnerNewBookingHtml({
  ownerName,
  bookingId,
  turfName,
  sportName,
  turfLocation,
  bookingDate,
  startTime,
  endTime,
  duration,
  slotCount,
  displaySlotText,
  userName,
  userEmail,
  userPhone,
  amountPaid,
  paymentDateTime,
}) {
  const formattedAmount = Number(amountPaid || 0).toLocaleString("en-IN");

  return `
<div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #202124;">
  <p style="margin: 0 0 16px 0;">Dear <strong>${ownerName || "Turf Owner"}</strong>,</p>

  <p style="margin: 0 0 16px 0;">You have received a new booking for your turf <strong>${turfName}</strong> on the SportXClub platform.</p>

  <p style="margin: 0 0 16px 0;">
    <strong>Booking Details:</strong><br>
    <strong>Turf Name :-</strong> ${turfName}<br>
    <strong>Location :-</strong> ${turfLocation || "Registered Arena"}<br>
    <strong>Sport :-</strong> ${sportName}<br>
    <strong>Booking ID :-</strong> ${bookingId}<br>
    <strong>Date :-</strong> ${bookingDate}<br>
    <strong>Time Slot :-</strong> ${displaySlotText || `${startTime} – ${endTime}`}<br>
    <strong>Duration :-</strong> ${duration} (${slotCount || 1} ${Number(slotCount || 1) === 1 ? "Slot" : "Slots"})<br>
    <strong>Amount :-</strong> ₹${formattedAmount}
  </p>

  <p style="margin: 0 0 16px 0;">
    <strong>Customer Details:</strong><br>
    <strong>Player Name :-</strong> ${userName || "Customer"}<br>
    <strong>Email :-</strong> ${userEmail || "N/A"}<br>
    <strong>Phone :-</strong> ${userPhone || "N/A"}<br>
    <strong>Payment Date & Time :-</strong> ${paymentDateTime}
  </p>

  <p style="margin: 0 0 16px 0;">
    <strong>Owner Dashboard:</strong> <a href="https://sportxclub.com/admin-login" target="_blank" style="color: #059669; text-decoration: underline;">https://sportxclub.com/admin-login</a>
  </p>

  <p style="margin: 0 0 16px 0;">If you need any assistance with your turf or owner account, feel free to contact our support team.</p>

  <p style="margin: 0 0 16px 0;">Thank you for choosing SportXClub.</p>

  <p style="margin: 0; line-height: 1.5;">
    Best Regards,<br>
    <strong>SportXClub Team</strong>
  </p>
</div>
  `.trim();
}

/**
 * 3. Template: User Booking Cancellation Email
 */
function getPlayerCancellationHtml({
  userName,
  bookingId,
  turfName,
  sportName,
  turfLocation,
  bookingDate,
  startTime,
  endTime,
  duration,
  cancellationDateTime,
  refundMode,
  refundId,
  amount,
}) {
  const isDirectBank = refundMode === "source";
  const refundText = isDirectBank
    ? `Refund of ₹${amount || 0} initiated directly to your original payment method (Bank/UPI via Cashfree). Expected settlement: 24 hours to 5 working days.`
    : `Refund of ₹${amount || 0} credited instantly to your SportX Wallet.`;

  return `
<div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #202124;">
  <p style="margin: 0 0 16px 0;">Dear <strong>${userName || "Player"}</strong>,</p>

  <p style="margin: 0 0 16px 0;">Your turf booking has been successfully cancelled as requested.</p>

  <p style="margin: 0 0 16px 0;">
    <strong>Booking Details:</strong><br>
    <strong>Turf Name :-</strong> ${turfName}<br>
    <strong>Location :-</strong> ${turfLocation || "Registered Arena"}<br>
    <strong>Sport :-</strong> ${sportName}<br>
    <strong>Booking ID :-</strong> ${bookingId}<br>
    <strong>Date :-</strong> ${bookingDate}<br>
    <strong>Time Slot :-</strong> ${startTime} – ${endTime}<br>
    <strong>Duration :-</strong> ${duration}<br>
    <strong>Status :-</strong> Cancelled<br>
    <strong>Cancelled On :-</strong> ${cancellationDateTime}
  </p>

  <div style="margin: 0 0 16px 0; padding: 12px; background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 4px;">
    <strong>Refund Status:</strong><br>
    ${refundText}<br>
    ${refundId ? `<strong>Refund Ref ID:</strong> ${refundId}` : ""}
  </div>

  <p style="margin: 0 0 16px 0;">The selected slot is no longer reserved under your account.</p>

  <p style="margin: 0 0 16px 0;">If you have any questions regarding your cancellation or refund, feel free to contact our support team.</p>

  <p style="margin: 0 0 16px 0;">We hope to see you back on the field soon!</p>

  <p style="margin: 0; line-height: 1.5;">
    Best Regards,<br>
    <strong>SportXClub Team</strong>
  </p>
</div>
  `.trim();
}

/**
 * 4. Template: Turf Owner Booking Cancellation Notification Email
 */
function getOwnerCancellationHtml({
  ownerName,
  bookingId,
  turfName,
  sportName,
  turfLocation,
  bookingDate,
  startTime,
  endTime,
  duration,
  cancellationDateTime,
}) {
  return `
<div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #202124;">
  <p style="margin: 0 0 16px 0;">Dear <strong>${ownerName || "Turf Owner"}</strong>,</p>

  <p style="margin: 0 0 16px 0;">A booking for your turf <strong>${turfName}</strong> has been cancelled by the customer. The slot is now available again for other players.</p>

  <p style="margin: 0 0 16px 0;">
    <strong>Booking Details:</strong><br>
    <strong>Turf Name :-</strong> ${turfName}<br>
    <strong>Location :-</strong> ${turfLocation || "Registered Arena"}<br>
    <strong>Sport :-</strong> ${sportName}<br>
    <strong>Booking ID :-</strong> ${bookingId}<br>
    <strong>Date :-</strong> ${bookingDate}<br>
    <strong>Time Slot :-</strong> ${startTime} – ${endTime}<br>
    <strong>Duration :-</strong> ${duration}<br>
    <strong>Status :-</strong> Cancelled<br>
    <strong>Cancelled On :-</strong> ${cancellationDateTime}
  </p>

  <p style="margin: 0 0 16px 0;">
    <strong>Owner Dashboard:</strong> <a href="https://sportxclub.com/admin-login" target="_blank" style="color: #059669; text-decoration: underline;">https://sportxclub.com/admin-login</a>
  </p>

  <p style="margin: 0 0 16px 0;">If you need any assistance with your turf or owner account, feel free to contact our support team.</p>

  <p style="margin: 0 0 16px 0;">Thank you for partnering with SportXClub.</p>

  <p style="margin: 0; line-height: 1.5;">
    Best Regards,<br>
    <strong>SportXClub Team</strong>
  </p>
</div>
  `.trim();
}

// In-Memory Concurrency & Deduplication Locks (Prevents duplicate email delivery on rapid parallel API requests)
const inFlightBookingEmails = new Set();
const sentBookingEmailsCache = new Set();

const inFlightCancelEmails = new Set();
const sentCancelEmailsCache = new Set();

/**
 * Main function: Resolves booking, turf & owner data, and sends confirmation emails to both user & turf owner.
 */
export async function sendBookingEmails(bookingIdentifier, overrideData = {}) {
  const pool = getPool();
  let bookingId = null;
  let bookingCode = null;
  const keysToLock = [];

  try {
    if (!bookingIdentifier && !overrideData?.bookingCode && !overrideData?.booking_code) {
      console.warn("[BOOKING EMAIL] No booking identifier provided.");
      return { success: false, message: "No booking identifier provided" };
    }

    // 1. Fetch booking from MySQL
    let booking = null;
    if (bookingIdentifier) {
      const [rows] = await pool.query(
        "SELECT * FROM bookings WHERE id = ? OR booking_code = ? LIMIT 1",
        [bookingIdentifier, bookingIdentifier]
      );
      booking = rows[0] || null;
    }

    const finalBooking = {
      ...(booking || {}),
      ...overrideData,
    };

    bookingId = finalBooking.id || null;
    bookingCode = finalBooking.booking_code || finalBooking.bookingCode || (bookingIdentifier ? String(bookingIdentifier) : `SPXBK${Date.now()}`);
    const orderId = finalBooking.order_id || null;

    // Collect all identifying keys for this unique booking
    if (bookingCode) keysToLock.push(String(bookingCode));
    if (bookingId) keysToLock.push(`id_${bookingId}`);
    if (orderId) keysToLock.push(`order_${orderId}`);
    if (bookingIdentifier && typeof bookingIdentifier === "string" && !keysToLock.includes(bookingIdentifier)) {
      keysToLock.push(bookingIdentifier);
    }

    // Deduplication Check 1: In-Memory Lock / Sent Cache
    for (const key of keysToLock) {
      if (inFlightBookingEmails.has(key) || sentBookingEmailsCache.has(key)) {
        console.log(`[BOOKING EMAIL] 🛡️ Duplicate booking email SUPPRESSED for [${key}] (already sending or sent).`);
        return { success: true, message: "Duplicate email suppressed" };
      }
    }

    // Deduplication Check 2: Database `email_sent` flag
    if (booking && booking.email_sent === 1) {
      keysToLock.forEach((k) => sentBookingEmailsCache.add(k));
      console.log(`[BOOKING EMAIL] 🛡️ Emails already recorded as sent in DB for Booking [${bookingCode}]. Skipping.`);
      return { success: true, message: "Emails already sent previously." };
    }

    // Acquire In-Memory Lock IMMEDIATELY
    keysToLock.forEach((k) => inFlightBookingEmails.add(k));

    // Mark DB flag to 1 IMMEDIATELY so parallel database reads see email_sent = 1
    if (bookingId) {
      pool.query("UPDATE bookings SET email_sent = 1 WHERE id = ?", [bookingId]).catch(() => {});
    }
    if (bookingCode) {
      pool.query("UPDATE bookings SET email_sent = 1 WHERE booking_code = ?", [bookingCode]).catch(() => {});
    }

    const userName = finalBooking.user_name || finalBooking.userName || "SportX Athlete";
    const userEmail = (finalBooking.user_email || finalBooking.userEmail || "").trim();
    const userPhone = finalBooking.user_phone || finalBooking.userPhone || "";
    const turfName = finalBooking.turf_name || finalBooking.turfName || "SportX Arena";
    const turfId = finalBooking.turf_id || finalBooking.turfId || null;
    const sportName = finalBooking.sport || "Sports";
    const bookingDate = finalBooking.date || finalBooking.selectedDate || new Date().toISOString().split("T")[0];
    const rawTimeSlot = finalBooking.time_slot || finalBooking.slot_time || finalBooking.time || "06:00 PM - 07:00 PM";
    const amountPaid = finalBooking.amount || finalBooking.price || 0;
    const bookingCreatedAt = formatDateTime(finalBooking.created_at || new Date());
    const paymentDateTime = bookingCreatedAt;

    // Slot parse
    const { startTime, endTime, duration, slotCount, displaySlotText } = parseSlotDetails(rawTimeSlot);

    // 3. Resolve Turf & Turf Owner Details
    let turfLocation = "Sports Complex, Main Road";
    let ownerEmail = "";
    let ownerName = "";

    try {
      let turfRow = null;
      if (turfId) {
        const [turfRows] = await pool.query("SELECT * FROM turfs WHERE id = ? LIMIT 1", [turfId]);
        turfRow = turfRows[0];
      }
      if (!turfRow && turfName) {
        const [turfRows] = await pool.query("SELECT * FROM turfs WHERE LOWER(name) = LOWER(?) LIMIT 1", [turfName.trim()]);
        turfRow = turfRows[0];
      }

      if (turfRow) {
        turfLocation = turfRow.location || turfLocation;
        ownerName = turfRow.owner_name || "";
        ownerEmail = (turfRow.owner_email || "").trim();
      }

      // If owner email not directly on turf row, resolve from turf_owners table
      if (!ownerEmail && (ownerName || turfName)) {
        const [ownerRows] = await pool.query(
          "SELECT * FROM turf_owners WHERE LOWER(name) = LOWER(?) OR (setup_data IS NOT NULL AND setup_data LIKE ?) LIMIT 1",
          [ownerName.trim(), `%${turfName}%`]
        );
        if (ownerRows.length > 0) {
          const o = ownerRows[0];
          ownerEmail = (o.email || "").trim();
          ownerName = ownerName || o.name;
          if (o.setup_data) {
            try {
              const setup = JSON.parse(o.setup_data);
              if (setup?.location?.address) turfLocation = setup.location.address;
            } catch (e) {}
          }
        }
      }
    } catch (dbFetchErr) {
      console.warn("[BOOKING EMAIL] Error querying turf/owner info:", dbFetchErr.message);
    }

    const transporter = getTransporter();
    const smtpFrom = `SportXClub <${process.env.SMTP_USER || "waghmareshrinivas99@gmail.com"}>`;

    const emailPromises = [];

    // 4. Send Email to Player / Customer with PDF Match Pass Attachment
    if (userEmail && userEmail.includes("@")) {
      const playerHtml = getPlayerBookingConfirmationHtml({
        userName,
        bookingId: bookingCode,
        bookingCreatedAt,
        amountPaid,
        turfName,
        sportName,
        turfLocation,
        bookingDate,
        startTime,
        endTime,
        duration,
        slotCount,
        displaySlotText,
      });

      // Generate PDF Match Pass
      let passPdfBuffer = null;
      try {
        passPdfBuffer = await generatePassPdfBuffer({
          bookingId: bookingCode,
          userName,
          userEmail,
          userPhone,
          turfName,
          sport: sportName,
          bookingDate,
          startTime,
          endTime,
          duration,
          amountPaid,
          turfLocation,
          bookingCreatedAt,
        });
      } catch (pdfErr) {
        console.error("[BOOKING EMAIL] Error generating PDF pass:", pdfErr);
      }

      const mailOptions = {
        from: smtpFrom,
        to: userEmail,
        subject: `Booking Confirmed: ${turfName} - Booking ID: ${bookingCode}`,
        html: playerHtml,
      };

      if (passPdfBuffer) {
        mailOptions.attachments = [
          {
            filename: `SportXClub_Pass_${bookingCode}.pdf`,
            content: passPdfBuffer,
            contentType: "application/pdf",
          },
        ];
      }

      emailPromises.push(
        transporter
          .sendMail(mailOptions)
          .then((info) => {
            console.log(`[BOOKING EMAIL] ✓ Confirmation email sent to Player: ${userEmail} (MsgId: ${info.messageId})`);
            return { type: "player", success: true, email: userEmail };
          })
          .catch((err) => {
            console.error(`[BOOKING EMAIL] ✗ Failed to send email to Player (${userEmail}):`, err.message);
            return { type: "player", success: false, error: err.message };
          })
      );
    }

    // 5. Send Email to Turf Owner
    if (ownerEmail && ownerEmail.includes("@")) {
      const ownerHtml = getOwnerNewBookingHtml({
        ownerName,
        bookingId: bookingCode,
        turfName,
        sportName,
        turfLocation,
        bookingDate,
        startTime,
        endTime,
        duration,
        slotCount,
        displaySlotText,
        userName,
        userEmail,
        userPhone,
        amountPaid,
        paymentDateTime,
      });

      emailPromises.push(
        transporter
          .sendMail({
            from: smtpFrom,
            to: ownerEmail,
            subject: `New Booking Alert: ${turfName} - Slot: ${bookingDate} (${startTime} – ${endTime})`,
            html: ownerHtml,
          })
          .then((info) => {
            console.log(`[BOOKING EMAIL] ✓ Alert email sent to Turf Owner: ${ownerEmail} (MsgId: ${info.messageId})`);
            return { type: "owner", success: true, email: ownerEmail };
          })
          .catch((err) => {
            console.error(`[BOOKING EMAIL] ✗ Failed to send alert to Turf Owner (${ownerEmail}):`, err.message);
            return { type: "owner", success: false, error: err.message };
          })
      );
    }

    const results = await Promise.all(emailPromises);

    // Release in-flight lock and add to sent cache
    keysToLock.forEach((k) => {
      inFlightBookingEmails.delete(k);
      sentBookingEmailsCache.add(k);
    });

    // Clean cache after 1 hour
    setTimeout(() => {
      keysToLock.forEach((k) => sentBookingEmailsCache.delete(k));
    }, 3600000);

    return {
      success: true,
      bookingCode,
      results,
    };
  } catch (error) {
    console.error("[BOOKING EMAIL] Unexpected error in sendBookingEmails:", error);
    // Release locks on unexpected crash
    keysToLock.forEach((k) => inFlightBookingEmails.delete(k));
    return { success: false, error: error.message };
  }
}

/**
 * Sends booking cancellation email to both Player and Turf Owner (with concurrency deduplication guard)
 */
export async function sendCancellationEmails(bookingIdOrCode, details = {}) {
  const pool = getPool();
  const keysToLock = [];

  try {
    let booking = null;
    if (bookingIdOrCode) {
      const [rows] = await pool.query(
        "SELECT * FROM bookings WHERE id = ? OR booking_code = ? LIMIT 1",
        [bookingIdOrCode, bookingIdOrCode]
      );
      if (rows.length > 0) booking = rows[0];
    }

    const bookingCode = details.bookingCode || booking?.booking_code || `SPX-${String(bookingIdOrCode).slice(-6)}`;
    const bookingId = booking?.id || null;

    if (bookingCode) keysToLock.push(String(bookingCode));
    if (bookingId) keysToLock.push(`id_${bookingId}`);
    if (bookingIdOrCode && !keysToLock.includes(String(bookingIdOrCode))) {
      keysToLock.push(String(bookingIdOrCode));
    }

    // Deduplication Check
    for (const key of keysToLock) {
      if (inFlightCancelEmails.has(key) || sentCancelEmailsCache.has(key)) {
        console.log(`[CANCELLATION EMAIL] 🛡️ Duplicate cancellation email SUPPRESSED for [${key}].`);
        return { success: true, message: "Duplicate cancellation email suppressed." };
      }
    }

    // Acquire lock
    keysToLock.forEach((k) => inFlightCancelEmails.add(k));

    const userName = details.userName || booking?.user_name || "SportX Athlete";
    const userEmail = (details.userEmail || booking?.user_email || "").trim();
    const turfName = details.turfName || booking?.turf_name || "SportX Arena";
    const turfId = details.turfId || booking?.turf_id || null;
    const sportName = details.sport || booking?.sport || "Sports";
    const bookingDate = details.date || booking?.date || new Date().toISOString().split("T")[0];
    const rawTimeSlot = details.timeSlot || booking?.time_slot || booking?.slot_time || "06:00 PM - 07:00 PM";
    const cancellationDateTime = formatDateTime(new Date());

    const { startTime, endTime, duration } = parseSlotDetails(rawTimeSlot);

    // Resolve owner details
    let ownerEmail = "";
    let ownerName = "";
    let turfLocation = details.location || details.turfLocation || "";

    try {
      let turfRow = null;
      if (turfId) {
        const [turfRows] = await pool.query("SELECT * FROM turfs WHERE id = ? LIMIT 1", [turfId]);
        turfRow = turfRows[0];
      }
      if (!turfRow && turfName) {
        const [turfRows] = await pool.query("SELECT * FROM turfs WHERE LOWER(name) = LOWER(?) LIMIT 1", [turfName.trim()]);
        turfRow = turfRows[0];
      }
      if (turfRow) {
        ownerName = turfRow.owner_name || "";
        ownerEmail = (turfRow.owner_email || "").trim();
        turfLocation = turfLocation || turfRow.location || "";
      }
      if (!ownerEmail && (ownerName || turfName)) {
        const [ownerRows] = await pool.query(
          "SELECT * FROM turf_owners WHERE LOWER(name) = LOWER(?) OR (setup_data IS NOT NULL AND setup_data LIKE ?) LIMIT 1",
          [ownerName.trim(), `%${turfName}%`]
        );
        if (ownerRows.length > 0) {
          ownerEmail = (ownerRows[0].email || "").trim();
          ownerName = ownerName || ownerRows[0].name;
          turfLocation = turfLocation || ownerRows[0].city || "";
        }
      }
    } catch (dbFetchErr) {
      console.warn("[CANCELLATION EMAIL] Error querying turf/owner info:", dbFetchErr.message);
    }

    const transporter = getTransporter();
    const smtpFrom = `SportXClub <${process.env.SMTP_USER || "waghmareshrinivas99@gmail.com"}>`;

    const cancelPromises = [];

    // 1. Send Cancellation Email to User
    if (userEmail && userEmail.includes("@")) {
      const playerCancelHtml = getPlayerCancellationHtml({
        userName,
        bookingId: bookingCode,
        turfName,
        sportName,
        turfLocation,
        bookingDate,
        startTime,
        endTime,
        duration,
        cancellationDateTime,
        refundMode: details.refundMode || booking?.refund_mode || "wallet",
        refundId: details.refundId || booking?.refund_arn || booking?.refund_id,
        amount: details.amount || booking?.amount || 0,
      });

      cancelPromises.push(
        transporter
          .sendMail({
            from: smtpFrom,
            to: userEmail,
            subject: `Booking Cancelled: ${turfName} - Booking ID: ${bookingCode}`,
            html: playerCancelHtml,
          })
          .then((info) => {
            console.log(`[CANCELLATION EMAIL] ✓ Cancellation email sent to Player: ${userEmail} (MsgId: ${info.messageId})`);
            return { type: "player", success: true, email: userEmail };
          })
          .catch((err) => {
            console.error(`[CANCELLATION EMAIL] ✗ Failed player cancellation email (${userEmail}):`, err.message);
            return { type: "player", success: false, error: err.message };
          })
      );
    }

    // 2. Send Cancellation Email to Turf Owner
    if (ownerEmail && ownerEmail.includes("@")) {
      const ownerCancelHtml = getOwnerCancellationHtml({
        ownerName,
        bookingId: bookingCode,
        turfName,
        sportName,
        turfLocation,
        bookingDate,
        startTime,
        endTime,
        duration,
        cancellationDateTime,
      });

      cancelPromises.push(
        transporter
          .sendMail({
            from: smtpFrom,
            to: ownerEmail,
            subject: `Booking Cancelled Alert: ${turfName} - Booking ID: ${bookingCode}`,
            html: ownerCancelHtml,
          })
          .then((info) => {
            console.log(`[CANCELLATION EMAIL] ✓ Cancellation email sent to Turf Owner: ${ownerEmail} (MsgId: ${info.messageId})`);
            return { type: "owner", success: true, email: ownerEmail };
          })
          .catch((err) => {
            console.error(`[CANCELLATION EMAIL] ✗ Failed owner cancellation email (${ownerEmail}):`, err.message);
            return { type: "owner", success: false, error: err.message };
          })
      );
    }

    const results = await Promise.all(cancelPromises);

    keysToLock.forEach((k) => {
      inFlightCancelEmails.delete(k);
      sentCancelEmailsCache.add(k);
    });

    setTimeout(() => {
      keysToLock.forEach((k) => sentCancelEmailsCache.delete(k));
    }, 3600000);

    return { success: true, results };
  } catch (err) {
    console.error("[CANCELLATION EMAIL] Error:", err.message);
    keysToLock.forEach((k) => inFlightCancelEmails.delete(k));
    return { success: false, error: err.message };
  }
}
