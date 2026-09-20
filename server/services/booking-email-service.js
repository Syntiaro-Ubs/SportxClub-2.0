import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { jsPDF } from "jspdf";
import { getPool } from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

/**
 * Creates and returns the configured Nodemailer transporter
 */
function getTransporter() {
  const smtpUser = (process.env.SMTP_USER || "waghmareshrinivas99@gmail.com").trim();
  const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass,
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
 * Generates high quality PDF Match Pass Buffer using jsPDF
 */
function generatePassPdfBuffer({
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

  // Background Header
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, 210, 48, "F");

  // Emerald Top Accent Bar
  doc.setFillColor(5, 150, 105); // #059669
  doc.rect(0, 0, 210, 4, "F");

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("SPORTXCLUB", 20, 22);

  doc.setTextColor(52, 211, 153); // Emerald-400
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("OFFICIAL MATCH & VENUE PASS", 20, 30);

  // Pass Reference Badge (Right Top)
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(125, 14, 65, 24, 3, 3, "F");
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("BOOKING ID", 132, 22);
  doc.setTextColor(52, 211, 153);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(String(bookingId || "SPX-BK"), 132, 31);

  // Status Banner
  doc.setFillColor(240, 253, 244); // light green
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(20, 56, 170, 14, 3, 3, "FD");
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("✓ BOOKING CONFIRMED & PAYMENT SUCCESSFUL", 25, 65);

  // Section 1: Venue & Match Details Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 76, 170, 68, 4, 4, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TURF & SLOT RESERVATION", 26, 86);

  doc.setDrawColor(226, 232, 240);
  doc.line(26, 90, 184, 90);

  // Details Grid
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Turf Name:", 26, 98);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(String(turfName || "SportX Arena"), 60, 98);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Sport Category:", 26, 106);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(String(sport || "General Sports"), 60, 106);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Booking Date:", 26, 114);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(String(bookingDate || ""), 60, 114);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Time Slot:", 26, 122);
  doc.setTextColor(5, 150, 105); // Green
  doc.setFont("helvetica", "bold");
  doc.text(`${startTime} – ${endTime} (${duration})`, 60, 122);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Location / Address:", 26, 130);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  const locLines = doc.splitTextToSize(String(turfLocation || "Registered Arena Address"), 120);
  doc.text(locLines, 60, 130);

  // Section 2: Player & Payment Info Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 150, 170, 56, 4, 4, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER & PAYMENT SUMMARY", 26, 160);
  doc.line(26, 164, 184, 164);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Player Name:", 26, 172);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(String(userName || "Athlete"), 60, 172);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Contact Email:", 26, 180);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "normal");
  doc.text(String(userEmail || "Registered Player"), 60, 180);

  doc.setTextColor(100, 116, 139);
  doc.text("Mobile Number:", 26, 188);
  doc.setTextColor(15, 23, 42);
  doc.text(String(userPhone || "Provided on booking"), 60, 188);

  doc.setTextColor(100, 116, 139);
  doc.text("Total Paid:", 26, 196);
  doc.setTextColor(5, 150, 105);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`INR ${Number(amountPaid || 0).toLocaleString("en-IN")}`, 60, 196);

  // Guidelines & Check-in instructions Box
  doc.setFillColor(238, 242, 255); // Indigo light
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(20, 212, 170, 36, 3, 3, "FD");

  doc.setTextColor(67, 56, 202);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("IMPORTANT CHECK-IN GUIDELINES", 26, 220);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text("• Please carry this digital/printed Match Pass or Booking ID when arriving at the turf.", 26, 227);
  doc.text("• Arrive 10-15 minutes prior to your scheduled slot for hassle-free check-in.", 26, 233);
  doc.text("• Respect turf rules and wear sport-appropriate footwear (non-marking soles if required).", 26, 239);

  // Footer Branding
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on ${bookingCreatedAt || formatDateTime(new Date())} | SportXClub Verified Pass`, 20, 260);
  doc.text("For assistance, contact SportXClub Support • https://sportxclub.com", 20, 265);

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
}) {
  const formattedAmount = Number(amountPaid || 0).toLocaleString("en-IN");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Confirmation - SportXClub</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #065f46 0%, #059669 100%); padding: 26px 30px; text-align: left; border-bottom: 3px solid #10b981;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px;">
                SPORT<span style="color: #6ee7b7;">X</span>CLUB
              </h1>
              <p style="margin: 4px 0 0; font-size: 11px; font-weight: 700; color: #d1fae5; text-transform: uppercase; letter-spacing: 1.5px;">
                Booking Confirmation
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <p style="margin: 0 0 16px; font-size: 15px; font-weight: 700; color: #0f172a;">
                Dear ${userName || "Player"},
              </p>
              
              <p style="margin: 0 0 16px; font-size: 14px; color: #334155;">
                Greetings from the <strong>SportXClub Team</strong>!
              </p>

              <p style="margin: 0 0 22px; font-size: 14px; color: #334155;">
                We are pleased to confirm your turf booking. Your payment has been successfully received.
              </p>

              <!-- Booking Confirmation Summary Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 22px; padding: 18px 20px;">
                <tr>
                  <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                      Booking Confirmation
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px; font-size: 13px; color: #64748b; width: 45%;">Booking ID:</td>
                  <td style="padding-top: 12px; font-size: 13px; font-weight: 700; color: #059669;">${bookingId}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Booking Date & Time:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${bookingCreatedAt}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Payment Status:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 700; color: #059669;">Successful</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Amount Paid:</td>
                  <td style="padding-top: 8px; font-size: 14px; font-weight: 800; color: #0f172a;">₹${formattedAmount}</td>
                </tr>
              </table>

              <!-- Turf Details Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 22px; padding: 18px 20px;">
                <tr>
                  <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                      📍 Turf Details
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px; font-size: 13px; color: #64748b; width: 45%;">Turf Name:</td>
                  <td style="padding-top: 12px; font-size: 13px; font-weight: 700; color: #0f172a;">${turfName}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Sport:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${sportName}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Location:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${turfLocation}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Booking Date:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${bookingDate}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Booked Slots:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 700; color: #059669;">${slotCount || 1} ${Number(slotCount || 1) === 1 ? "Slot" : "Slots"}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Time Slot(s):</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 700; color: #059669;">${displaySlotText || `${startTime} – ${endTime}`}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Duration:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${duration}</td>
                </tr>
              </table>

              <p style="margin: 0 0 14px; font-size: 13.5px; color: #334155; line-height: 1.6;">
                Your slot has been successfully reserved for you. Please carry your <strong>SportXClub Booking Confirmation / Booking ID</strong> when visiting the turf.
              </p>

              <p style="margin: 0 0 14px; font-size: 13.5px; color: #334155; line-height: 1.6;">
                We recommend arriving <strong>10–15 minutes</strong> before your scheduled slot to complete the check-in process smoothly.
              </p>

              <!-- PDF Attachment Notice -->
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 12.5px; color: #065f46; font-weight: 600;">
                  📎 <strong>Match Pass Attached:</strong> Your digital PDF Match Pass is attached with this email for quick offline access.
                </p>
              </div>

              <p style="margin: 0 0 24px; font-size: 13.5px; color: #334155;">
                If you need any assistance regarding your booking, please contact the SportXClub support team.
              </p>

              <p style="margin: 0; font-size: 14px; color: #334155;">
                Best Regards,<br>
                <strong style="color: #059669;">SportXClub Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                © 2026 SportXClub Technologies Pvt. Ltd. • All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
  bookingDate,
  startTime,
  endTime,
  duration,
  userName,
  userEmail,
  userPhone,
  amountPaid,
  paymentDateTime,
}) {
  const formattedAmount = Number(amountPaid || 0).toLocaleString("en-IN");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Booking Alert - SportXClub</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 26px 30px; text-align: left; border-bottom: 3px solid #10b981;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px;">
                SPORT<span style="color: #34d399;">X</span>CLUB
              </h1>
              <p style="margin: 4px 0 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">
                Turf Partner Network • New Booking Alert
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <p style="margin: 0 0 16px; font-size: 15px; font-weight: 700; color: #0f172a;">
                Dear ${ownerName || "Turf Owner"},
              </p>
              
              <p style="margin: 0 0 16px; font-size: 14px; color: #334155;">
                Greetings from the <strong>SportXClub Team</strong>!
              </p>

              <p style="margin: 0 0 22px; font-size: 14px; color: #334155;">
                You have received a new booking for your turf. The selected slot has been successfully reserved.
              </p>

              <!-- Booking Details -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px; padding: 18px 20px;">
                <tr>
                  <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                      Booking Details :-
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px; font-size: 13px; color: #64748b; width: 45%;">Booking ID:</td>
                  <td style="padding-top: 12px; font-size: 13px; font-weight: 700; color: #059669;">${bookingId}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Turf Name:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 700; color: #0f172a;">${turfName}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Sport:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${sportName}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Booking Date:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${bookingDate}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Booked Slots:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 700; color: #059669;">${slotCount || 1} ${Number(slotCount || 1) === 1 ? "Slot" : "Slots"}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Time Slot(s):</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 700; color: #059669;">${displaySlotText || `${startTime} – ${endTime}`}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Duration:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${duration}</td>
                </tr>
              </table>

              <!-- Customer Details -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px; padding: 18px 20px;">
                <tr>
                  <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                      👤 Customer Details
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px; font-size: 13px; color: #64748b; width: 45%;">Player Name:</td>
                  <td style="padding-top: 12px; font-size: 13px; font-weight: 700; color: #0f172a;">${userName || "Athlete"}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Email:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${userEmail || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Mobile Number:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${userPhone || "N/A"}</td>
                </tr>
              </table>

              <!-- Payment Details -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 22px; padding: 18px 20px;">
                <tr>
                  <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                      Payment Details :-
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px; font-size: 13px; color: #64748b; width: 45%;">Amount Paid:</td>
                  <td style="padding-top: 12px; font-size: 14px; font-weight: 800; color: #059669;">₹${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Payment Status:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 700; color: #059669;">✅ Successful</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Payment Date & Time:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${paymentDateTime}</td>
                </tr>
              </table>

              <p style="margin: 0 0 14px; font-size: 13.5px; color: #334155; line-height: 1.6;">
                The above slot has been successfully reserved for the customer.
              </p>

              <p style="margin: 0 0 20px; font-size: 13.5px; color: #334155; line-height: 1.6;">
                Please make sure the turf is available and ready at the scheduled time.
              </p>

              <p style="margin: 0 0 24px; font-size: 13.5px; color: #334155;">
                Thank you for being a part of SportXClub.
              </p>

              <p style="margin: 0; font-size: 14px; color: #334155;">
                Best Regards,<br>
                <strong style="color: #059669;">SportXClub Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Manage this booking via your SportXClub Turf Owner Dashboard.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
  bookingDate,
  startTime,
  endTime,
  duration,
  cancellationDateTime,
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Cancelled - SportXClub</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #991b1b 0%, #dc2626 100%); padding: 26px 30px; text-align: left; border-bottom: 3px solid #ef4444;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px;">
                SPORT<span style="color: #fca5a5;">X</span>CLUB
              </h1>
              <p style="margin: 4px 0 0; font-size: 11px; font-weight: 700; color: #fee2e2; text-transform: uppercase; letter-spacing: 1.5px;">
                Booking Cancellation Notice
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <p style="margin: 0 0 16px; font-size: 15px; font-weight: 700; color: #0f172a;">
                Dear ${userName || "Player"},
              </p>
              
              <p style="margin: 0 0 22px; font-size: 14px; color: #334155;">
                Your turf booking has been successfully cancelled as requested.
              </p>

              <!-- Booking Details -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 22px; padding: 18px 20px;">
                <tr>
                  <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                      Booking Details
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px; font-size: 13px; color: #64748b; width: 45%;">Booking ID:</td>
                  <td style="padding-top: 12px; font-size: 13px; font-weight: 700; color: #0f172a;">${bookingId}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Turf Name:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 700; color: #0f172a;">${turfName}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Sport:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${sportName}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Booking Date:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${bookingDate}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Time Slot:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 700; color: #0f172a;">${startTime} – ${endTime}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Duration:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${duration}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Booking Status:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 700; color: #dc2626;">❌ Cancelled</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Cancelled On:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${cancellationDateTime}</td>
                </tr>
              </table>

              <p style="margin: 0 0 14px; font-size: 13.5px; color: #334155; line-height: 1.6;">
                Your selected slot is no longer reserved under this booking.
              </p>

              <p style="margin: 0 0 14px; font-size: 13.5px; color: #334155; line-height: 1.6;">
                If you have any questions regarding your cancellation, please contact our support team.
              </p>

              <p style="margin: 0 0 24px; font-size: 13.5px; color: #334155; line-height: 1.6;">
                We hope to see you back on the field soon!
              </p>

              <p style="margin: 0; font-size: 14px; color: #334155;">
                Best Regards,<br>
                <strong style="color: #059669;">SportXClub Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                © 2026 SportXClub Technologies Pvt. Ltd. • All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
  bookingDate,
  startTime,
  endTime,
  duration,
  cancellationDateTime,
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Cancelled Alert - SportXClub</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 26px 30px; text-align: left; border-bottom: 3px solid #ef4444;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px;">
                SPORT<span style="color: #f87171;">X</span>CLUB
              </h1>
              <p style="margin: 4px 0 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">
                Turf Partner Network • Cancellation Alert
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <p style="margin: 0 0 16px; font-size: 15px; font-weight: 700; color: #0f172a;">
                Dear ${ownerName || "Turf Owner"},
              </p>
              
              <p style="margin: 0 0 16px; font-size: 14px; color: #334155;">
                Greetings from the <strong>SportXClub Team</strong>!
              </p>

              <p style="margin: 0 0 22px; font-size: 14px; color: #334155;">
                A booking for your turf has been cancelled by the customer. The previously reserved slot is now available again.
              </p>

              <!-- Booking Details -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 22px; padding: 18px 20px;">
                <tr>
                  <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                      Booking Details
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px; font-size: 13px; color: #64748b; width: 45%;">Booking ID:</td>
                  <td style="padding-top: 12px; font-size: 13px; font-weight: 700; color: #0f172a;">${bookingId}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Turf Name:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 700; color: #0f172a;">${turfName}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Sport:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${sportName}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Booking Date:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${bookingDate}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Time Slot:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 700; color: #0f172a;">${startTime} – ${endTime}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Duration:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${duration}</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Booking Status:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 700; color: #dc2626;">❌ Cancelled</td>
                </tr>
                <tr>
                  <td style="padding-top: 8px; font-size: 13px; color: #64748b;">Cancelled On:</td>
                  <td style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${cancellationDateTime}</td>
                </tr>
              </table>

              <p style="margin: 0 0 20px; font-size: 13.5px; color: #334155; line-height: 1.6;">
                The selected slot is now available for other bookings.
              </p>

              <p style="margin: 0 0 24px; font-size: 13.5px; color: #334155;">
                Thank you for being a part of SportXClub.
              </p>

              <p style="margin: 0; font-size: 14px; color: #334155;">
                Best Regards,<br>
                <strong style="color: #059669;">SportXClub Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                © 2026 SportXClub Technologies Pvt. Ltd. • Turf Partner Network
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Main function: Resolves booking, turf & owner data, and sends confirmation emails to both user & turf owner.
 */
export async function sendBookingEmails(bookingIdentifier, overrideData = {}) {
  try {
    if (!bookingIdentifier && !overrideData?.bookingCode && !overrideData?.booking_code) {
      console.warn("[BOOKING EMAIL] No booking identifier provided.");
      return { success: false, message: "No booking identifier provided" };
    }

    const pool = getPool();

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

    const bookingId = finalBooking.id || null;
    const bookingCode = finalBooking.booking_code || finalBooking.bookingCode || `SPXBK${Date.now()}`;
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

    // 2. Prevent duplicate emails if already sent
    if (booking && booking.email_sent === 1) {
      console.log(`[BOOKING EMAIL] Emails already sent for Booking [${bookingCode}]. Skipping duplicate send.`);
      return { success: true, message: "Emails already sent previously." };
    }

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
        passPdfBuffer = generatePassPdfBuffer({
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

    // 6. Mark booking as email_sent = 1 in database
    if (bookingId) {
      try {
        await pool.query("UPDATE bookings SET email_sent = 1 WHERE id = ?", [bookingId]);
      } catch (updateErr) {}
    } else if (bookingCode) {
      try {
        await pool.query("UPDATE bookings SET email_sent = 1 WHERE booking_code = ?", [bookingCode]);
      } catch (updateErr) {}
    }

    return {
      success: true,
      bookingCode,
      results,
    };
  } catch (error) {
    console.error("[BOOKING EMAIL] Unexpected error in sendBookingEmails:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Sends booking cancellation email to both Player and Turf Owner
 */
export async function sendCancellationEmails(bookingIdOrCode, details = {}) {
  try {
    const pool = getPool();
    let booking = null;

    if (bookingIdOrCode) {
      const [rows] = await pool.query(
        "SELECT * FROM bookings WHERE id = ? OR booking_code = ? LIMIT 1",
        [bookingIdOrCode, bookingIdOrCode]
      );
      if (rows.length > 0) booking = rows[0];
    }

    const bookingCode = details.bookingCode || booking?.booking_code || `SPX-${String(bookingIdOrCode).slice(-6)}`;
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
      }
      if (!ownerEmail && (ownerName || turfName)) {
        const [ownerRows] = await pool.query(
          "SELECT * FROM turf_owners WHERE LOWER(name) = LOWER(?) OR (setup_data IS NOT NULL AND setup_data LIKE ?) LIMIT 1",
          [ownerName.trim(), `%${turfName}%`]
        );
        if (ownerRows.length > 0) {
          ownerEmail = (ownerRows[0].email || "").trim();
          ownerName = ownerName || ownerRows[0].name;
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
    return { success: true, results };
  } catch (err) {
    console.error("[CANCELLATION EMAIL] Error:", err.message);
    return { success: false, error: err.message };
  }
}
