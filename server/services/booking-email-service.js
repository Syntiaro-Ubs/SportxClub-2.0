import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { jsPDF } from "jspdf";
import { getPool } from "../db.js";
import { generatePassPdfBuffer } from "./match-pass-pdf.js";

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
 * Generates exact Website Match Pass in PDF format for Email Attachment
 */
async function _old_generatePassPdfBuffer({
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
  slotCount = 1,
  slotList = [],
  amountPaid,
  turfLocation,
  bookingCreatedAt,
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Soft Background
  doc.setFillColor(248, 250, 252); // #F8FAFC
  doc.rect(0, 0, 210, 297, "F");

  // Center Ticket Card Container
  const cardW = 140;
  const cardH = 186;
  const cardX = (210 - cardW) / 2; // 35mm
  const cardY = (297 - cardH) / 2; // 55.5mm

  // Outer Emerald Accent Frame / Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(5, 150, 105); // #059669
  doc.setLineWidth(0.9);
  doc.roundedRect(cardX, cardY, cardW, cardH, 8, 8, "FD");

  // 1. Header: Green Checkmark Circle Badge
  const badgeCx = cardX + cardW / 2;
  const badgeCy = cardY + 16;
  const badgeR = 6.5;

  doc.setFillColor(236, 253, 245); // #ECFDF5
  doc.setDrawColor(16, 185, 129); // #10B981
  doc.setLineWidth(0.6);
  doc.circle(badgeCx, badgeCy, badgeR, "FD");

  // Crisp Vector Checkmark
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.85);
  doc.line(badgeCx - 2.8, badgeCy - 0.2, badgeCx - 0.8, badgeCy + 2.0);
  doc.line(badgeCx - 0.8, badgeCy + 2.0, badgeCx + 3.2, badgeCy - 2.2);

  // Payment Successful Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13.5);
  doc.setTextColor(5, 150, 105);
  doc.text("Payment Successful!", badgeCx, cardY + 29, { align: "center" });

  // SPORTX PASS
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(15, 23, 42); // #0F172A
  doc.text("SPORTX PASS", badgeCx, cardY + 36, { align: "center" });

  // Official Entry Ticket
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // #94A3B8
  doc.text("Official Entry Ticket", badgeCx, cardY + 41, { align: "center" });

  // 2. Venue & Sport Header Row
  const venueY = cardY + 51;
  const colLeft = cardX + 10;
  const colRight = cardX + cardW - 10;

  // Vector Location Pin Icon
  const pinX = colLeft + 2.5;
  const pinY = venueY - 1.2;
  doc.setFillColor(100, 116, 139); // #64748B
  doc.setDrawColor(100, 116, 139);
  doc.circle(pinX, pinY - 1.2, 1.4, "F");
  doc.triangle(pinX - 1.2, pinY - 0.8, pinX + 1.2, pinY - 0.8, pinX, pinY + 1.4, "F");
  doc.setFillColor(255, 255, 255);
  doc.circle(pinX, pinY - 1.2, 0.6, "F");

  // Venue Name
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  const displayVenue = String(turfName || "SportX Arena");
  doc.text(displayVenue.length > 26 ? displayVenue.slice(0, 24) + "..." : displayVenue, colLeft + 7, venueY);

  // Sport Badge Pill
  const sportName = String(sport || "Cricket").toUpperCase();
  const sportPillW = Math.max(26, sportName.length * 2.4 + 10);
  const sportPillH = 6.5;
  const sportPillX = colRight - sportPillW;
  const sportPillY = venueY - 4.8;
  doc.setFillColor(241, 245, 249); // #F1F5F9
  doc.setDrawColor(226, 232, 240); // #E2E8F0
  doc.setLineWidth(0.4);
  doc.roundedRect(sportPillX, sportPillY, sportPillW, sportPillH, 3.25, 3.25, "FD");

  doc.setTextColor(51, 65, 85); // #334155
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text(sportName, sportPillX + sportPillW / 2, sportPillY + 4.3, { align: "center" });

  // 3. 2×2 Detail Cards Grid
  const gridY = cardY + 58;
  const boxW = 57;
  const boxH = 16;
  const col1X = cardX + 10;
  const col2X = cardX + cardW - 10 - boxW;

  const drawDetailCard = (bx, by, iconType, label, value) => {
    // Card Box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(bx, by, boxW, boxH, 3, 3, "FD");

    // Icon Container
    const ix = bx + 2.5;
    const iy = by + 2.5;
    const isz = 11;
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(167, 243, 208);
    doc.setLineWidth(0.3);
    doc.roundedRect(ix, iy, isz, isz, 2.2, 2.2, "FD");

    // Vector Icon
    doc.setDrawColor(5, 150, 105);
    doc.setFillColor(5, 150, 105);

    if (iconType === "calendar") {
      doc.setLineWidth(0.5);
      doc.roundedRect(ix + 2.5, iy + 3.0, 6.0, 5.5, 0.6, 0.6, "D");
      doc.line(ix + 2.5, iy + 4.8, ix + 8.5, iy + 4.8);
      doc.line(ix + 4.0, iy + 2.0, ix + 4.0, iy + 3.0);
      doc.line(ix + 7.0, iy + 2.0, ix + 7.0, iy + 3.0);
      doc.circle(ix + 4.2, iy + 6.3, 0.35, "F");
      doc.circle(ix + 6.8, iy + 6.3, 0.35, "F");
    } else if (iconType === "clock") {
      doc.setLineWidth(0.5);
      doc.circle(ix + 5.5, iy + 5.5, 3.2, "D");
      doc.line(ix + 5.5, iy + 5.5, ix + 5.5, iy + 3.6);
      doc.line(ix + 5.5, iy + 5.5, ix + 7.2, iy + 5.5);
    } else if (iconType === "user") {
      doc.circle(ix + 5.5, iy + 4.2, 1.6, "FD");
      doc.setLineWidth(0.6);
      doc.line(ix + 3.0, iy + 8.6, ix + 4.3, iy + 6.9);
      doc.line(ix + 4.3, iy + 6.9, ix + 6.7, iy + 6.9);
      doc.line(ix + 6.7, iy + 6.9, ix + 8.0, iy + 8.6);
    } else if (iconType === "rupee") {
      doc.setLineWidth(0.65);
      doc.line(ix + 3.6, iy + 3.4, ix + 7.4, iy + 3.4);
      doc.line(ix + 3.6, iy + 4.8, ix + 6.8, iy + 4.8);
      doc.line(ix + 4.8, iy + 3.4, ix + 4.8, iy + 6.2);
      doc.line(ix + 4.8, iy + 6.2, ix + 6.6, iy + 6.2);
      doc.line(ix + 5.0, iy + 6.2, ix + 7.4, iy + 8.6);
    }

    // Label
    doc.setTextColor(148, 163, 184); // #94A3B8
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(label, bx + 16, by + 5.8);

    // Value with dynamic auto-fit font size to prevent any truncation
    doc.setTextColor(15, 23, 42); // #0F172A
    doc.setFont("helvetica", "bold");
    const valStr = String(value || "");
    if (valStr.length > 25) {
      doc.setFontSize(6.5);
    } else if (valStr.length > 18) {
      doc.setFontSize(7.5);
    } else {
      doc.setFontSize(8.5);
    }
    doc.text(valStr, bx + 16, by + 11.6);
  };

  const formattedAmount = `INR ${Number(amountPaid || 0).toLocaleString("en-IN")}`;
  const displaySlot = slotCount > 1 ? `${startTime} – ${endTime} (${slotCount} Slots)` : (startTime && endTime ? `${startTime} – ${endTime}` : "Scheduled Slot");

  // Row 1
  drawDetailCard(col1X, gridY, "calendar", "Date:", String(bookingDate || ""));
  drawDetailCard(col2X, gridY, "clock", "Time Slot:", displaySlot);

  // Row 2
  const row2Y = gridY + 19;
  drawDetailCard(col1X, row2Y, "user", "Pass Holder:", String(userName || "SportX Player"));
  drawDetailCard(col2X, row2Y, "rupee", "Amount Paid:", formattedAmount);

  // If multiple slots, add slot breakdown note below details
  if (slotCount > 1 && slotList.length > 1) {
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    const slotsLine = `Booked Slots: ${slotList.join(", ")}`;
    doc.text(slotsLine.length > 60 ? slotsLine.slice(0, 58) + "..." : slotsLine, badgeCx, gridY + 38.5, { align: "center" });
  }

  // 4. Perforated Notch Tear Line
  const tearY = cardY + 102;
  const notchR = 4.5;

  // Inward Semicircular Cutouts (filled with background slate)
  doc.setFillColor(248, 250, 252);
  doc.circle(cardX, tearY, notchR, "F");
  doc.circle(cardX + cardW, tearY, notchR, "F");

  // Emerald Notch Arcs (Matching outer frame)
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.9);
  doc.ellipse(cardX, tearY, notchR, notchR, "S", 270, 90);
  doc.ellipse(cardX + cardW, tearY, notchR, notchR, "S", 90, 270);

  // Dashed Perforation Line
  doc.setDrawColor(203, 213, 225); // #CBD5E1
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(cardX + notchR + 2, tearY, cardX + cardW - notchR - 2, tearY);
  doc.setLineDashPattern([], 0);

  // 5. Bottom Stub: Left Order ID + Right Bracketed QR Code
  const stubY = tearY + 10;

  // Credit Card Mini Icon
  const ccX = col1X;
  const ccY = stubY;
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.4);
  doc.roundedRect(ccX, ccY, 4.5, 3.2, 0.4, 0.4, "D");
  doc.line(ccX, ccY + 1.1, ccX + 4.5, ccY + 1.1);

  // Cashfree Order ID Label
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Cashfree Order ID:", ccX + 6, stubY + 2.5);

  // Cashfree Order ID Value
  doc.setTextColor(15, 23, 42);
  doc.setFont("courier", "bold");
  doc.setFontSize(8.5);
  const orderIdText = String(bookingId || "SPX-PASS");
  doc.text(orderIdText, ccX, stubY + 9.5);

  // QR Code Container on Right
  const qrW = 38;
  const qrH = 38;
  const qrX = colRight - qrW;
  const qrY = stubY - 2;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(qrX, qrY, qrW, qrH, 3.5, 3.5, "FD");

  // 4 Emerald Corner Scan Brackets
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.75);
  const brkLen = 4.5;
  const brkPad = 1.6;
  // Top-Left
  doc.line(qrX + brkPad, qrY + brkPad, qrX + brkPad + brkLen, qrY + brkPad);
  doc.line(qrX + brkPad, qrY + brkPad, qrX + brkPad, qrY + brkPad + brkLen);
  // Top-Right
  doc.line(qrX + qrW - brkPad, qrY + brkPad, qrX + qrW - brkPad - brkLen, qrY + brkPad);
  doc.line(qrX + qrW - brkPad, qrY + brkPad, qrX + qrW - brkPad, qrY + brkPad + brkLen);
  // Bottom-Left
  doc.line(qrX + brkPad, qrY + qrH - brkPad, qrX + brkPad + brkLen, qrY + qrH - brkPad);
  doc.line(qrX + brkPad, qrY + qrH - brkPad, qrX + brkPad, qrY + qrH - brkPad - brkLen);
  // Bottom-Right
  doc.line(qrX + qrW - brkPad, qrY + qrH - brkPad, qrX + qrW - brkPad - brkLen, qrY + qrH - brkPad);
  doc.line(qrX + qrW - brkPad, qrY + qrH - brkPad, qrX + qrW - brkPad, qrY + qrH - brkPad - brkLen);

  const qrDataUrl = await getQrCodeBase64(bookingId);
  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, "PNG", qrX + 3.5, qrY + 3.5, qrW - 7, qrH - 7);
    } catch (qrErr) {
      console.warn("[PDF QR Add Error]:", qrErr.message);
    }
  }

  // 6. Realistic Multi-Weight Vector Barcode Strip
  const barY = cardY + 154;
  const barH = 8.5;
  const barTotalW = 60;
  const barStartX = cardX + (cardW - barTotalW) / 2;

  const pattern = [
    2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 1, 2, 2, 1, 3, 1, 2, 1, 4, 1, 2, 1, 3, 2, 1, 1, 4, 1, 2, 1, 3, 1, 2,
  ];
  let curX = barStartX;
  doc.setFillColor(15, 23, 42); // #0F172A

  for (let i = 0; i < pattern.length; i++) {
    const w = pattern[i] * 0.38;
    if (i % 2 === 0) {
      doc.rect(curX, barY, w, barH, "F");
    }
    curX += w + 0.35;
    if (curX > barStartX + barTotalW) break;
  }

  // Scan text below barcode
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("SCAN AT RECEPTION / GATE FOR ENTRY", badgeCx, cardY + 168.5, { align: "center" });

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
        "SELECT * FROM bookings WHERE id = ? OR booking_code = ? OR order_id = ? OR payment_id = ? LIMIT 1",
        [bookingIdentifier, bookingIdentifier, bookingIdentifier, bookingIdentifier]
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
    const { startTime, endTime, duration, slotCount, slotList, displaySlotText } = parseSlotDetails(rawTimeSlot);

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
          slotCount,
          slotList,
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
