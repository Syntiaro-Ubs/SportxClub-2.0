import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
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
 * Generates the responsive HTML email for the Player / Customer
 */
function getPlayerEmailTemplate({
  bookingCode,
  userName,
  userPhone,
  turfName,
  sport,
  date,
  timeSlot,
  amount,
  paymentMethod,
  turfLocation,
  turfCity,
  googleMapsUrl,
  rules,
}) {
  const formattedAmount = Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed - ${turfName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #111827; border: 1px solid #1f2937; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 30px 35px 25px; text-align: center; background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%); border-bottom: 2px solid #10b981;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                SPORT<span style="color: #a7f3d0;">X</span>CLUB
              </h1>
              <p style="margin: 6px 0 0; font-size: 11px; font-weight: 700; letter-spacing: 2.5px; color: #d1fae5; text-transform: uppercase;">
                Your Ultimate Arena Booking Portal
              </p>
            </td>
          </tr>

          <!-- Confirmation Badge & Title -->
          <tr>
            <td style="padding: 30px 35px 20px; text-align: center;">
              <div style="display: inline-block; padding: 8px 18px; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 9999px; color: #10b981; font-size: 13px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px;">
                ✓ Booking Confirmed & Paid
              </div>
              <h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #f9fafb;">
                Get Ready To Play, ${userName || "Athlete"}!
              </h2>
              <p style="margin: 0; font-size: 14px; color: #9ca3af; line-height: 1.6;">
                Your slot at <strong style="color: #ffffff;">${turfName}</strong> has been successfully locked and reserved.
              </p>
            </td>
          </tr>

          <!-- Booking Summary Box -->
          <tr>
            <td style="padding: 0 35px 20px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1f2937; border: 1px solid #374151; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; background-color: #1e293b; border-bottom: 1px solid #334155;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="left">
                          <span style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Booking Reference</span>
                        </td>
                        <td align="right">
                          <span style="font-family: 'Courier New', Courier, monospace; font-size: 14px; font-weight: 800; color: #10b981; background-color: rgba(16, 185, 129, 0.12); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.3);">
                            ${bookingCode}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50%" style="padding-bottom: 14px; vertical-align: top;">
                          <div style="font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase;">Sport</div>
                          <div style="font-size: 15px; color: #f3f4f6; font-weight: 700; margin-top: 2px;">⚡ ${sport || "Sports"}</div>
                        </td>
                        <td width="50%" style="padding-bottom: 14px; vertical-align: top;">
                          <div style="font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase;">Amount Paid</div>
                          <div style="font-size: 16px; color: #10b981; font-weight: 800; margin-top: 2px;">₹${formattedAmount}</div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="vertical-align: top;">
                          <div style="font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase;">Date</div>
                          <div style="font-size: 14px; color: #f3f4f6; font-weight: 700; margin-top: 2px;">📅 ${date}</div>
                        </td>
                        <td width="50%" style="vertical-align: top;">
                          <div style="font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase;">Time Slot</div>
                          <div style="font-size: 14px; color: #f3f4f6; font-weight: 700; margin-top: 2px;">⏰ ${timeSlot}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Location & Navigation Box -->
          <tr>
            <td style="padding: 0 35px 25px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(180deg, #182234 0%, #131b2a 100%); border: 1px solid #1e3a5f; border-radius: 16px; padding: 22px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 800; color: #60a5fa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
                      📍 Turf Location & Venue
                    </div>
                    <div style="font-size: 17px; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
                      ${turfName}
                    </div>
                    <div style="font-size: 13px; color: #cbd5e1; line-height: 1.5; margin-bottom: 18px;">
                      ${turfLocation}${turfCity ? `, ${turfCity}` : ""}
                    </div>

                    <!-- Google Maps Button -->
                    <table border="0" cellspacing="0" cellpadding="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${googleMapsUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 24px; border-radius: 12px; text-align: center; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                            🗺️ Open Location in Google Maps
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Venue Guidelines / Important Instructions -->
          <tr>
            <td style="padding: 0 35px 25px;">
              <div style="background-color: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 14px; padding: 16px 18px;">
                <div style="font-size: 12px; font-weight: 800; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                  ⚠️ Important Match-Day Guidelines
                </div>
                <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #d1d5db; line-height: 1.6;">
                  <li>Please arrive <strong>10–15 minutes</strong> prior to your scheduled slot.</li>
                  <li>Show this confirmation email or Booking Code (<strong>${bookingCode}</strong>) at the reception desk.</li>
                  <li>Wear appropriate sports shoes (rubber studs / non-marking shoes as per turf surface).</li>
                  ${rules ? `<li>Venue Rules: ${rules}</li>` : ""}
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 35px; background-color: #0b1120; border-top: 1px solid #1f2937; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; color: #9ca3af;">
                Need help or wish to modify your booking?
              </p>
              <p style="margin: 0 0 16px; font-size: 12px; color: #6b7280;">
                Email us at <a href="mailto:support@sportxclub.com" style="color: #10b981; text-decoration: none;">support@sportxclub.com</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #4b5563;">
                © 2026 SportXClub Technologies Pvt. Ltd. All rights reserved.
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
 * Generates the responsive HTML email for the Turf Owner
 */
function getOwnerEmailTemplate({
  bookingCode,
  userName,
  userEmail,
  userPhone,
  turfName,
  sport,
  date,
  timeSlot,
  amount,
  ownerName,
}) {
  const formattedAmount = Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Alert - ${turfName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #111827; border: 1px solid #1f2937; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 35px 22px; text-align: center; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); border-bottom: 2px solid #6366f1;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                SPORT<span style="color: #a5b4fc;">X</span>CLUB
              </h1>
              <p style="margin: 5px 0 0; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #e0e7ff; text-transform: uppercase;">
                Turf Partner Management Portal
              </p>
            </td>
          </tr>

          <!-- Alert Badge & Title -->
          <tr>
            <td style="padding: 28px 35px 18px; text-align: center;">
              <div style="display: inline-block; padding: 7px 16px; background-color: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 9999px; color: #818cf8; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 14px;">
                ⚡ New Booking Received
              </div>
              <h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #f9fafb;">
                Hello ${ownerName || "Turf Owner"},
              </h2>
              <p style="margin: 0; font-size: 14px; color: #9ca3af; line-height: 1.6;">
                A new customer booking has been confirmed for <strong style="color: #ffffff;">${turfName}</strong>.
              </p>
            </td>
          </tr>

          <!-- Customer Details Card -->
          <tr>
            <td style="padding: 0 35px 18px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1f2937; border: 1px solid #374151; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 20px; background-color: #1e293b; border-bottom: 1px solid #334155;">
                    <span style="font-size: 12px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px;">
                      👤 Customer Information
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50%" style="padding-bottom: 12px; vertical-align: top;">
                          <div style="font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase;">Customer Name</div>
                          <div style="font-size: 15px; color: #ffffff; font-weight: 700; margin-top: 2px;">${userName || "SportX Player"}</div>
                        </td>
                        <td width="50%" style="padding-bottom: 12px; vertical-align: top;">
                          <div style="font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase;">Contact Number</div>
                          <div style="font-size: 15px; color: #ffffff; font-weight: 700; margin-top: 2px;">
                            ${userPhone ? `<a href="tel:${userPhone}" style="color: #38bdf8; text-decoration: none;">📞 ${userPhone}</a>` : "Not provided"}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="vertical-align: top;">
                          <div style="font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase;">Customer Email</div>
                          <div style="font-size: 14px; color: #cbd5e1; margin-top: 2px;">
                            <a href="mailto:${userEmail}" style="color: #38bdf8; text-decoration: none;">✉️ ${userEmail}</a>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Slot & Booking Details Box -->
          <tr>
            <td style="padding: 0 35px 22px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1f2937; border: 1px solid #374151; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 20px; background-color: #1e293b; border-bottom: 1px solid #334155;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="left">
                          <span style="font-size: 12px; font-weight: 800; color: #34d399; text-transform: uppercase; letter-spacing: 0.5px;">
                            🏟️ Booking & Slot Summary
                          </span>
                        </td>
                        <td align="right">
                          <span style="font-family: 'Courier New', Courier, monospace; font-size: 13px; font-weight: 800; color: #34d399; background-color: rgba(52, 211, 153, 0.12); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(52, 211, 153, 0.3);">
                            ${bookingCode}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50%" style="padding-bottom: 12px; vertical-align: top;">
                          <div style="font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase;">Turf / Court</div>
                          <div style="font-size: 14px; color: #ffffff; font-weight: 700; margin-top: 2px;">${turfName}</div>
                        </td>
                        <td width="50%" style="padding-bottom: 12px; vertical-align: top;">
                          <div style="font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase;">Sport</div>
                          <div style="font-size: 14px; color: #ffffff; font-weight: 700; margin-top: 2px;">${sport || "Sports"}</div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="vertical-align: top;">
                          <div style="font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase;">Scheduled Date</div>
                          <div style="font-size: 14px; color: #ffffff; font-weight: 700; margin-top: 2px;">📅 ${date}</div>
                        </td>
                        <td width="50%" style="vertical-align: top;">
                          <div style="font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase;">Time Slot</div>
                          <div style="font-size: 14px; color: #ffffff; font-weight: 700; margin-top: 2px;">⏰ ${timeSlot}</div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 14px; border-top: 1px dashed #374151; margin-top: 12px;">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td align="left">
                                <span style="font-size: 13px; color: #9ca3af; font-weight: 600;">Total Revenue Collected:</span>
                              </td>
                              <td align="right">
                                <span style="font-size: 16px; color: #10b981; font-weight: 800;">₹${formattedAmount}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Facility Preparation Notice -->
          <tr>
            <td style="padding: 0 35px 25px;">
              <div style="background-color: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 14px; padding: 16px 18px;">
                <p style="margin: 0; font-size: 13px; color: #e0e7ff; line-height: 1.5;">
                  📌 <strong>Action Reminder:</strong> Please ensure the ground/court is reserved and prepared for the customer prior to <strong>${timeSlot}</strong> on <strong>${date}</strong>.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 35px; background-color: #0b1120; border-top: 1px solid #1f2937; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; color: #9ca3af;">
                Manage this booking & view live analytics in your Partner Dashboard
              </p>
              <p style="margin: 0; font-size: 11px; color: #4b5563;">
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
 *
 * @param {string|number} bookingIdentifier - Booking ID or Booking Code
 * @param {Object} [overrideData] - Optional manual booking fields
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

    // Merge with override data if any
    const finalBooking = {
      ...(booking || {}),
      ...overrideData,
    };

    const bookingId = finalBooking.id;
    const bookingCode = finalBooking.booking_code || finalBooking.bookingCode || `SPXBK${Date.now()}`;
    const userName = finalBooking.user_name || finalBooking.userName || "SportX Athlete";
    const userEmail = (finalBooking.user_email || finalBooking.userEmail || "").trim();
    const userPhone = finalBooking.user_phone || finalBooking.userPhone || "";
    const turfName = finalBooking.turf_name || finalBooking.turfName || "SportX Arena";
    const turfId = finalBooking.turf_id || finalBooking.turfId || null;
    const sport = finalBooking.sport || "Sports";
    const date = finalBooking.date || finalBooking.selectedDate || new Date().toISOString().split("T")[0];
    const timeSlot = finalBooking.time_slot || finalBooking.slot_time || finalBooking.time || "Scheduled Slot";
    const amount = finalBooking.amount || finalBooking.price || 0;
    const paymentMethod = finalBooking.payment_method || finalBooking.payment_type || "Cashfree UPI";

    // 2. Prevent duplicate emails if already sent
    if (booking && booking.email_sent === 1) {
      console.log(`[BOOKING EMAIL] Emails already sent for Booking [${bookingCode}]. Skipping duplicate send.`);
      return { success: true, message: "Emails already sent previously." };
    }

    // 3. Resolve Turf & Turf Owner Details
    let turfLocation = "Sports Complex, Main Road";
    let turfCity = "India";
    let turfRules = "";
    let ownerEmail = "";
    let ownerName = "";
    let ownerPhone = "";

    try {
      // Find Turf by turf_id or turf_name
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
        turfRules = turfRow.rules || "";
        ownerName = turfRow.owner_name || "";
        ownerPhone = turfRow.owner_phone || "";
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
          ownerPhone = ownerPhone || o.phone;
          turfCity = o.city || turfCity;
          if (o.setup_data) {
            try {
              const setup = JSON.parse(o.setup_data);
              if (setup?.location?.address) {
                turfLocation = setup.location.address;
              }
              if (setup?.location?.city) {
                turfCity = setup.location.city;
              }
            } catch (e) {}
          }
        }
      }
    } catch (dbFetchErr) {
      console.warn("[BOOKING EMAIL] Error querying turf/owner info:", dbFetchErr.message);
    }

    // Construct Google Maps URL
    const mapsQuery = encodeURIComponent(`${turfName}, ${turfLocation}${turfCity ? `, ${turfCity}` : ""}`);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

    const transporter = getTransporter();
    const smtpFrom = `SportXClub <${process.env.SMTP_USER || "waghmareshrinivas99@gmail.com"}>`;

    const emailPromises = [];

    // 4. Send Email to Player / Customer
    if (userEmail && userEmail.includes("@")) {
      const playerHtml = getPlayerEmailTemplate({
        bookingCode,
        userName,
        userPhone,
        turfName,
        sport,
        date,
        timeSlot,
        amount,
        paymentMethod,
        turfLocation,
        turfCity,
        googleMapsUrl,
        rules: turfRules,
      });

      emailPromises.push(
        transporter
          .sendMail({
            from: smtpFrom,
            to: userEmail,
            subject: `🏆 Booking Confirmed! [${bookingCode}] at ${turfName}`,
            text: `Hi ${userName},\n\nYour booking [${bookingCode}] for ${sport} at ${turfName} on ${date} (${timeSlot}) is confirmed!\n\nLocation: ${turfLocation}\nGoogle Maps: ${googleMapsUrl}\nAmount Paid: ₹${amount}\n\nSee you on the field!\nSportXClub Team`,
            html: playerHtml,
          })
          .then((info) => {
            console.log(`[BOOKING EMAIL] ✓ Confirmation email sent to Player: ${userEmail} (MsgId: ${info.messageId})`);
            return { type: "player", success: true, email: userEmail };
          })
          .catch((err) => {
            console.error(`[BOOKING EMAIL] ✗ Failed to send email to Player (${userEmail}):`, err.message);
            return { type: "player", success: false, error: err.message };
          })
      );
    } else {
      console.warn(`[BOOKING EMAIL] Skipping player email: invalid or missing email (${userEmail})`);
    }

    // 5. Send Email to Turf Owner
    if (ownerEmail && ownerEmail.includes("@")) {
      const ownerHtml = getOwnerEmailTemplate({
        bookingCode,
        userName,
        userEmail,
        userPhone,
        turfName,
        sport,
        date,
        timeSlot,
        amount,
        ownerName,
      });

      emailPromises.push(
        transporter
          .sendMail({
            from: smtpFrom,
            to: ownerEmail,
            subject: `⚡ New Booking Alert! [${bookingCode}] - ${turfName}`,
            text: `Hello ${ownerName || "Turf Owner"},\n\nA new booking has been placed for ${turfName}!\n\nCustomer: ${userName} (${userPhone}, ${userEmail})\nSport: ${sport}\nDate & Time: ${date} (${timeSlot})\nAmount: ₹${amount}\nBooking Code: ${bookingCode}\n\nPlease keep the court ready.`,
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
    } else {
      console.log(`[BOOKING EMAIL] Notice: No valid owner email found for turf "${turfName}" (ownerName: ${ownerName})`);
    }

    // Await all dispatches
    const results = await Promise.all(emailPromises);

    // 6. Mark booking as email_sent = 1 in database
    if (bookingId) {
      try {
        await pool.query("UPDATE bookings SET email_sent = 1 WHERE id = ?", [bookingId]);
      } catch (updateErr) {
        console.warn("[BOOKING EMAIL] Could not update email_sent flag:", updateErr.message);
      }
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
 * Sends booking cancellation email to Player and Turf Owner
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

    const bookingCode = details.bookingCode || booking?.booking_code || `SX-${String(bookingIdOrCode).slice(-6)}`;
    const userName = details.userName || booking?.user_name || "Athlete";
    const userEmail = (details.userEmail || booking?.user_email || "").trim();
    const turfName = details.turfName || booking?.turf_name || "Turf Arena";
    const sport = details.sport || booking?.sport || "Sports";
    const date = details.date || booking?.date || "Selected Date";
    const timeSlot = details.timeSlot || booking?.time_slot || booking?.slot_time || "Selected Time";
    const amount = details.amount || booking?.amount || 0;
    const reason = details.reason || booking?.cancellation_reason || "User requested cancellation";

    const formattedAmount = Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const transporter = getTransporter();
    const smtpFrom = `SportXClub <${process.env.SMTP_USER || "waghmareshrinivas99@gmail.com"}>`;

    if (userEmail && userEmail.includes("@")) {
      const playerHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Booking Cancelled - ${turfName}</title></head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #111827; border: 1px solid #1f2937; border-radius: 20px; overflow: hidden;">
          <tr>
            <td style="padding: 25px 30px; text-align: center; background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); border-bottom: 2px solid #ef4444;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff;">SPORT<span style="color: #fca5a5;">X</span>CLUB</h1>
              <p style="margin: 4px 0 0; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #fee2e2; text-transform: uppercase;">Booking Cancellation Notice</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; text-align: center;">
              <div style="display: inline-block; padding: 6px 16px; background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 9999px; color: #f87171; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 15px;">
                ✓ Slot Cancelled & Refunded
              </div>
              <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 800; color: #f9fafb;">Hi ${userName}, your booking has been cancelled</h2>
              <p style="margin: 0 0 20px; font-size: 14px; color: #9ca3af; line-height: 1.5;">Your slot at <strong style="color: #fff;">${turfName}</strong> on <strong style="color: #fff;">${date} (${timeSlot})</strong> has been cancelled.</p>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1f2937; border: 1px solid #374151; border-radius: 12px; text-align: left; margin-bottom: 20px;">
                <tr><td style="padding: 12px 16px; border-bottom: 1px solid #374151; color: #9ca3af; font-size: 13px;">Booking Reference:</td><td style="padding: 12px 16px; border-bottom: 1px solid #374151; color: #fff; font-weight: bold; font-size: 13px;">${bookingCode}</td></tr>
                <tr><td style="padding: 12px 16px; border-bottom: 1px solid #374151; color: #9ca3af; font-size: 13px;">Cancellation Reason:</td><td style="padding: 12px 16px; border-bottom: 1px solid #374151; color: #fca5a5; font-size: 13px;">${reason}</td></tr>
                <tr><td style="padding: 12px 16px; color: #9ca3af; font-size: 13px;">Wallet Refund Amount:</td><td style="padding: 12px 16px; color: #34d399; font-weight: 900; font-size: 14px;">₹${formattedAmount}</td></tr>
              </table>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">The refund amount has been credited to your SportXClub wallet balance and can be used for future bookings.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      transporter.sendMail({
        from: smtpFrom,
        to: userEmail,
        subject: `❌ Booking Cancelled: [${bookingCode}] at ${turfName}`,
        html: playerHtml,
      }).catch((e) => console.warn("[CANCELLATION EMAIL] Failed player mail:", e.message));
    }
  } catch (err) {
    console.error("[CANCELLATION EMAIL] Error:", err.message);
  }
}

