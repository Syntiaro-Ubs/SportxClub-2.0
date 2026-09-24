import express from "express";
import { getPool } from "../db.js";
import nodemailer from "nodemailer";
import { authenticateToken, requireRole, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

async function sendOnboardingStatusEmail(toEmail, details = {}, status = "approved") {
  try {
    const smtpUser = (process.env.SMTP_USER || process.env.EMAIL_USER || "waghmareshrinivas99@gmail.com").trim();
    const smtpPass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || "").replace(/\s+/g, "");

    if (!smtpUser || !smtpPass) return;

    let transporter;
    if (process.env.EMAIL_HOST && process.env.EMAIL_PORT && !process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
    } else {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: smtpUser, pass: smtpPass },
      });
    }

    const isApproved = String(status).toLowerCase() === "approved";
    const ownerName = details.ownerName || "Turf Owner";
    const turfName = details.turfName || "Sports Turf";
    const turfLocation = details.turfLocation || "Location not specified";
    const registrationDate = details.registrationDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const dashboardLink = details.dashboardLink || "https://sportxclub.com/admin-login";

    let subject = "";
    let htmlContent = "";
    let textContent = "";

    if (isApproved) {
      subject = `[SportXClub] Welcome to SportXClub - ${turfName} is Now Live! 🎉`;

      htmlContent = `
      <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #202124;">
        <p style="margin: 0 0 16px 0;">Hi ${ownerName},</p>
        
        <p style="margin: 0 0 16px 0;">
          Welcome to <strong>SportXClub!</strong> 🎉<br>
          We’re happy to have <strong>${turfName}</strong> onboard with us.
        </p>

        <p style="margin: 0 0 16px 0;">
          Your turf has been successfully registered on the SportXClub platform. You can now manage your turf details, availability, bookings, and other important information through your owner dashboard.
        </p>

        <p style="margin: 0 0 16px 0;">
          <strong>Turf Details:</strong><br>
          <strong>Turf Name :-</strong> ${turfName}<br>
          <strong>Location :-</strong> ${turfLocation}<br>
          <strong>Owner Name :-</strong> ${ownerName}<br>
          <strong>Registration Date :-</strong> ${registrationDate}
        </p>

        <p style="margin: 0 0 16px 0;">
          <strong>Owner Dashboard:</strong> <a href="${dashboardLink}" style="color: #1a73e8; text-decoration: underline;">${dashboardLink}</a>
        </p>

        <p style="margin: 0 0 16px 0;">
          If you need any assistance with your turf or owner account, feel free to contact our support team.
        </p>

        <p style="margin: 0 0 16px 0;">
          Thank you for choosing SportXClub. We look forward to helping you grow your sports business.
        </p>

        <p style="margin: 0; line-height: 1.5;">
          Best Regards,<br>
          <strong>SportXClub Team</strong>
        </p>
      </div>
      `;

      textContent = `Hi ${ownerName},

Welcome to SportXClub! 🎉
We’re happy to have ${turfName} onboard with us.

Your turf has been successfully registered on the SportXClub platform. You can now manage your turf details, availability, bookings, and other important information through your owner dashboard.

Turf Details:
Turf Name :- ${turfName}
Location :- ${turfLocation}
Owner Name :- ${ownerName}
Registration Date :- ${registrationDate}

Owner Dashboard: ${dashboardLink}

If you need any assistance with your turf or owner account, feel free to contact our support team.

Thank you for choosing SportXClub. We look forward to helping you grow your sports business.

Best Regards,
SportXClub Team`;
    } else {
      subject = `[SportXClub] Turf Application Status Update`;

      htmlContent = `
      <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #202124;">
        <p style="margin: 0 0 16px 0;">Hi ${ownerName},</p>
        
        <p style="margin: 0 0 16px 0;">
          Thank you for applying to list <strong>${turfName}</strong> on SportXClub. Unfortunately, your recent onboarding application has been <strong>Rejected</strong> at this time.
        </p>

        <p style="margin: 0 0 16px 0;">
          Please ensure all your business details and verification documents are accurate, or reach out to our support team for more details.
        </p>

        <p style="margin: 0; line-height: 1.5;">
          Best Regards,<br>
          <strong>SportXClub Team</strong>
        </p>
      </div>
      `;

      textContent = `Hi ${ownerName},

Thank you for applying to list ${turfName} on SportXClub. Unfortunately, your recent onboarding application has been Rejected at this time.

Please ensure all your business details and verification documents are accurate, or reach out to our support team for more details.

Best Regards,
SportXClub Team`;
    }

    await transporter.sendMail({
      from: `"SportXClub" <${smtpUser}>`,
      to: toEmail,
      subject,
      text: textContent,
      html: htmlContent,
    });
    console.log(`[NODEMAILER] Onboarding status (${status}) email sent to ${toEmail}`);
  } catch (err) {
    console.error(`[NODEMAILER] Failed to send onboarding status to ${toEmail}:`, err.message);
  }
}

const ALLOWED_ENTITIES = {
  users: "users",
  user: "users",
  customer: "users",
  customers: "users",
  "turf-owners": "turf_owners",
  owner: "turf_owners",
  owners: "turf_owners",
  onboarding: "turf_owners",
  "turf-onboarding": "turf_owners",
  turfs: "turfs",
  turf: "turfs",
  bookings: "bookings",
  booking: "bookings",
  games: "games",
  game: "games",
  payments: "payments",
  payment: "payments",
  passes: "game_passes",
  pass: "game_passes",
  coupons: "coupons",
  coupon: "coupons",
  promotions: "coupons",
  promotion: "coupons",
  banners: "banners",
  banner: "banners",
  reviews: "reviews",
  review: "reviews",
  reports: "reports",
  report: "reports",
  notifications: "notifications",
  notification: "notifications",
  staff: "staff",
  documents: "documents",
  document: "documents",
  settings: "turf_owners",
  setting: "turf_owners",
  tournaments: "tournaments",
  tournament: "tournaments",
  "tournament-teams": "tournament_teams",
  "tournament-fixtures": "tournament_fixtures",
};

const SENSITIVE_ENTITIES = new Set(["users", "user", "customer", "customers", "turf-owners", "owner", "owners", "payments", "payment", "staff", "reports", "report", "onboarding", "turf-onboarding"]);

// ----------------------------------------------------
// DASHBOARD STATS (Admin Only)
// ----------------------------------------------------
router.get("/admin/dashboard/stats", authenticateToken, requireRole(["admin", "super admin", "cms-admin"]), async (req, res) => {
  try {
    const pool = getPool();
    const [[usersCount]] = await pool.query("SELECT COUNT(*) as count FROM users");
    const [[turfsCount]] = await pool.query("SELECT COUNT(*) as count FROM turfs");
    const [[gamesCount]] = await pool.query("SELECT COUNT(*) as count FROM games WHERE status = 'Open'");
    const [[revenueSum]] = await pool.query("SELECT COALESCE(SUM(amount), 0) as sum FROM payments WHERE status = 'Success'");

    const [recentUsers] = await pool.query("SELECT full_name, created_at FROM users ORDER BY id DESC LIMIT 3");
    const [recentTurfs] = await pool.query("SELECT name, created_at FROM turfs ORDER BY id DESC LIMIT 3");
    const [recentGames] = await pool.query("SELECT title, created_at FROM games ORDER BY id DESC LIMIT 3");

    return res.json({
      success: true,
      stats: {
        totalUsers: usersCount.count,
        totalTurfs: turfsCount.count,
        activeGames: gamesCount.count,
        totalRevenue: `₹${(revenueSum.sum / 100000).toFixed(1)}L`,
      },
      recentActivity: [
        ...recentUsers.map(u => ({ type: "User Registered", text: u.full_name, color: "emerald" })),
        ...recentTurfs.map(t => ({ type: "Turf Added", text: t.name, color: "blue" })),
        ...recentGames.map(g => ({ type: "Game Created", text: g.title, color: "purple" })),
      ]
    });
  } catch (err) {
    console.error("Stats Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// TURF OWNER ONBOARDING (Admin Only)
// ----------------------------------------------------
// TURF ONBOARDING REQUESTS (FAST & ENRICHED)
// ----------------------------------------------------
router.get(["/admin/onboarding", "/onboarding"], authenticateToken, requireRole(["admin", "super admin", "cms-admin", "editor"]), async (req, res) => {
  try {
    const pool = getPool();
    const [pendingOwners] = await pool.query(
      `SELECT o.*, 
              (SELECT t.name FROM turfs t WHERE (LOWER(t.owner_email) = LOWER(o.email) AND o.email != '') OR (LOWER(t.owner_name) = LOWER(o.name) AND o.name != '') ORDER BY t.id DESC LIMIT 1) as matched_turf_name, 
              (SELECT t.location FROM turfs t WHERE (LOWER(t.owner_email) = LOWER(o.email) AND o.email != '') OR (LOWER(t.owner_name) = LOWER(o.name) AND o.name != '') ORDER BY t.id DESC LIMIT 1) as matched_turf_location, 
              (SELECT t.sport_type FROM turfs t WHERE (LOWER(t.owner_email) = LOWER(o.email) AND o.email != '') OR (LOWER(t.owner_name) = LOWER(o.name) AND o.name != '') ORDER BY t.id DESC LIMIT 1) as matched_sport_type, 
              (SELECT t.price_per_hour FROM turfs t WHERE (LOWER(t.owner_email) = LOWER(o.email) AND o.email != '') OR (LOWER(t.owner_name) = LOWER(o.name) AND o.name != '') ORDER BY t.id DESC LIMIT 1) as matched_price, 
              (SELECT t.image_url FROM turfs t WHERE (LOWER(t.owner_email) = LOWER(o.email) AND o.email != '') OR (LOWER(t.owner_name) = LOWER(o.name) AND o.name != '') ORDER BY t.id DESC LIMIT 1) as matched_image,
              (SELECT t.status FROM turfs t WHERE (LOWER(t.owner_email) = LOWER(o.email) AND o.email != '') OR (LOWER(t.owner_name) = LOWER(o.name) AND o.name != '') ORDER BY t.id DESC LIMIT 1) as matched_turf_status
       FROM turf_owners o
       ORDER BY o.id DESC`
    );

    const mappedData = pendingOwners.map(owner => {
      let setupData = {};
      try {
        if (owner.setup_data) {
          let parsed = owner.setup_data;
          while (typeof parsed === 'string') {
            try {
              parsed = JSON.parse(parsed);
            } catch (e) {
              break;
            }
          }
          if (parsed && typeof parsed === 'object') {
            setupData = parsed;
          }
        }
      } catch (e) {
        console.error("Failed parsing setup_data for owner", owner.id, e);
      }

      // Determine robust turf name
      const turfName =
        (setupData.turf?.name && String(setupData.turf.name).trim()) ||
        (setupData.business?.businessName && String(setupData.business.businessName).trim()) ||
        (setupData.turfName && String(setupData.turfName).trim()) ||
        (setupData.venueName && String(setupData.venueName).trim()) ||
        (setupData.name && String(setupData.name).trim()) ||
        owner.matched_turf_name ||
        (owner.name ? `${owner.name}'s Sports Arena` : "Premier Turf Arena");

      const turfCity =
        (setupData.location?.city && String(setupData.location.city).trim()) ||
        (setupData.location?.address && String(setupData.location.address).trim()) ||
        owner.matched_turf_location ||
        owner.city ||
        "Mumbai";

      const turfAddress =
        (setupData.location?.address && String(setupData.location.address).trim()) ||
        (setupData.location?.street && String(setupData.location.street).trim()) ||
        owner.matched_turf_location ||
        owner.city ||
        "Near Main Sports Complex";

      const ownerName =
        (setupData.business?.ownerName && String(setupData.business.ownerName).trim()) ||
        (setupData.personal?.fullName && String(setupData.personal.fullName).trim()) ||
        owner.name ||
        "Turf Owner";

      const ownerEmail =
        (setupData.business?.email && String(setupData.business.email).trim()) ||
        (setupData.personal?.email && String(setupData.personal.email).trim()) ||
        owner.email ||
        "owner@sportxclub.com";

      const ownerPhone =
        (setupData.business?.phone && String(setupData.business.phone).trim()) ||
        (setupData.personal?.phone && String(setupData.personal.phone).trim()) ||
        owner.phone ||
        "+91 9876543210";

      const ownerId =
        owner.owner_id ||
        setupData.ownerId ||
        `OWN-${String(owner.id || 1).padStart(4, "0")}`;

      const rawStatus = String(owner.status || "Pending").trim();
      let normalizedStatus = "Pending";
      if (rawStatus.toLowerCase().includes("pending")) {
        normalizedStatus = "Pending";
      } else if (rawStatus.toLowerCase().includes("approv") || rawStatus.toLowerCase().includes("active")) {
        normalizedStatus = "Approved";
      } else if (rawStatus.toLowerCase().includes("reject") || rawStatus.toLowerCase().includes("decline")) {
        normalizedStatus = "Rejected";
      }

      const rawDate = owner.created_at || owner.joined_date || setupData.createdAt;
      let validDate = new Date().toISOString();
      if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          validDate = d.toISOString();
        }
      }

      return {
        id: owner.id,
        ownerId,
        ownerEmail,
        personal: {
          fullName: ownerName,
          email: ownerEmail,
          phone: ownerPhone,
          ...setupData.personal
        },
        business: {
          ownerName,
          businessName: turfName,
          phone: ownerPhone,
          email: ownerEmail,
          ...setupData.business
        },
        location: {
          city: turfCity,
          address: turfAddress,
          state: setupData.location?.state || "Maharashtra",
          pincode: setupData.location?.pincode || "400001",
          ...setupData.location
        },
        turf: {
          name: turfName,
          sports: setupData.turf?.sports || (owner.matched_sport_type ? [owner.matched_sport_type] : ["Football", "Cricket"]),
          description: setupData.turf?.description || "High quality sports turf with FIFA certified artificial grass, floodlights, and professional amenities.",
          surfaceType: setupData.turf?.surfaceType || "Artificial Grass",
          facilities: setupData.turf?.facilities || ["Lighting", "Changing Rooms", "Parking", "Water"],
          ...setupData.turf
        },
        pricing: {
          weekdayPrice: setupData.pricing?.weekdayPrice || owner.matched_price || 1200,
          weekendPrice: setupData.pricing?.weekendPrice || Math.round((owner.matched_price || 1200) * 1.2),
          advanceBookingDays: setupData.pricing?.advanceBookingDays || 7,
          ...setupData.pricing
        },
        images: setupData.images || {
          turf: [owner.matched_image || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600"],
          gallery: []
        },
        identity: setupData.identity || {},
        bank: setupData.bank || {},
        status: normalizedStatus,
        createdAt: validDate
      };
    });

    return res.json({ success: true, data: mappedData });
  } catch (err) {
    console.error("Onboarding Fetch Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.put(["/admin/onboarding/:id", "/onboarding/:id"], authenticateToken, requireRole(["admin", "super admin", "cms-admin", "editor"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const pool = getPool();

    const isApproved = String(status).toLowerCase() === "approved";
    const isRejected = String(status).toLowerCase() === "rejected";

    const [ownerRows] = await pool.query("SELECT id, owner_id, email, name, city, setup_data, created_at, joined_date FROM turf_owners WHERE id = ?", [id]);
    const owner = ownerRows[0];

    if (owner) {
      const ownerId = owner.owner_id;
      const ownerEmail = owner.email;

      if (isApproved) {
        await pool.query("UPDATE turf_owners SET status = 'Approved' WHERE id = ?", [id]);
        await pool.query("UPDATE turf_owner_accounts SET status = 'Active' WHERE owner_profile_id = ? OR (owner_id IS NOT NULL AND owner_id = ?) OR (email IS NOT NULL AND LOWER(email) = LOWER(?))", [id, ownerId, ownerEmail]);
        await pool.query("UPDATE turf_onboarding_requests SET status = 'approved' WHERE (owner_id IS NOT NULL AND owner_id = ?) OR (owner_email IS NOT NULL AND LOWER(owner_email) = LOWER(?))", [ownerId, ownerEmail]);
      } else if (isRejected) {
        await pool.query("UPDATE turf_owners SET status = 'Rejected' WHERE id = ?", [id]);
        await pool.query("UPDATE turf_owner_accounts SET status = 'Rejected' WHERE owner_profile_id = ? OR (owner_id IS NOT NULL AND owner_id = ?) OR (email IS NOT NULL AND LOWER(email) = LOWER(?))", [id, ownerId, ownerEmail]);
        await pool.query("UPDATE turf_onboarding_requests SET status = 'rejected' WHERE (owner_id IS NOT NULL AND owner_id = ?) OR (owner_email IS NOT NULL AND LOWER(owner_email) = LOWER(?))", [ownerId, ownerEmail]);
      }

      try {
        let setupData = {};
        if (owner.setup_data) {
          let parsed = owner.setup_data;
          while (typeof parsed === 'string') {
            try {
              parsed = JSON.parse(parsed);
            } catch (e) {
              break;
            }
          }
          if (parsed && typeof parsed === 'object') {
            setupData = parsed;
          }
        }

        const ownerName = setupData.personal?.fullName || setupData.business?.ownerName || owner.name || "Turf Owner";
        const turfName = setupData.turf?.name || setupData.business?.businessName || "Sports Turf";
        const turfLocation = [setupData.location?.address, setupData.location?.city, setupData.location?.state].filter(Boolean).join(", ") || setupData.location?.city || owner.city || "Location not specified";
        const ownerPhone = setupData.personal?.phone || setupData.business?.phone || owner.phone || "";

        if (isApproved && turfName) {
          const [existingTurfs] = await pool.query(
            "SELECT id FROM turfs WHERE (owner_email IS NOT NULL AND LOWER(owner_email) = LOWER(?)) OR LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1",
            [ownerEmail, turfName]
          );

          const coverImage = setupData.images?.cover?.data || setupData.images?.cover?.url || (typeof setupData.images?.cover === 'string' ? setupData.images.cover : null) || (Array.isArray(setupData.images?.turf) ? (setupData.images.turf[0]?.data || setupData.images.turf[0]?.url || setupData.images.turf[0]) : null) || "/assets/venues/turf-1.webp";

          let galleryList = [];
          if (Array.isArray(setupData.images?.gallery) && setupData.images.gallery.length > 0) {
            galleryList = setupData.images.gallery
              .map(g => (typeof g === 'object' && g !== null ? (g.data || g.url || g.name) : g))
              .filter(Boolean);
          }
          if (galleryList.length === 0 && coverImage) {
            galleryList = [coverImage];
          }

          const sportType = Array.isArray(setupData.turf?.sports) ? setupData.turf.sports.join(", ") : (setupData.turf?.sports || "Football");
          const pricePerHour = Number(setupData.pricing?.weekdayPrice || setupData.pricing?.standardPrice || 1200);
          const description = setupData.turf?.description || "High quality sports turf with professional amenities.";
          const amenities = Array.isArray(setupData.turf?.facilities) ? JSON.stringify(setupData.turf.facilities) : (typeof setupData.turf?.facilities === 'string' ? setupData.turf.facilities : "[]");
          const rules = setupData.turf?.rules || "Please wear appropriate footwear. Respect all turf property.";

          if (existingTurfs.length > 0) {
            await pool.query(
              `UPDATE turfs SET 
                name = ?, 
                location = ?, 
                sport_type = ?, 
                price_per_hour = ?, 
                image_url = ?, 
                gallery = ?, 
                description = ?, 
                amenities = ?, 
                rules = ?, 
                owner_name = ?, 
                owner_email = ?, 
                owner_phone = ?, 
                status = 'Active' 
              WHERE id = ?`,
              [turfName, turfLocation, sportType, pricePerHour, coverImage, JSON.stringify(galleryList), description, amenities, rules, ownerName, ownerEmail, ownerPhone, existingTurfs[0].id]
            );
          } else {
            await pool.query(
              `INSERT INTO turfs 
                (name, location, sport_type, price_per_hour, rating, reviews, status, owner_name, owner_email, owner_phone, image_url, gallery, description, amenities, rules)
               VALUES (?, ?, ?, ?, 5.0, 1, 'Active', ?, ?, ?, ?, ?, ?, ?, ?)`,
              [turfName, turfLocation, sportType, pricePerHour, ownerName, ownerEmail, ownerPhone, coverImage, JSON.stringify(galleryList), description, amenities, rules]
            );
          }
        }
        
        let registrationDate = "";
        try {
          const rawDate = owner.created_at || owner.joined_date || setupData.createdAt;
          const d = rawDate ? new Date(rawDate) : new Date();
          registrationDate = !isNaN(d.getTime()) ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        } catch (e) {
          registrationDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        }

        const emailToSend = ownerEmail || setupData.personal?.email || setupData.business?.email;

        if (emailToSend) {
          await sendOnboardingStatusEmail(emailToSend, {
            ownerName,
            turfName,
            turfLocation,
            registrationDate,
          }, status);
        }
      } catch (e) {
        console.error("Failed to sync approved turf and send email:", e);
      }
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Onboarding Update Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete(["/admin/onboarding/:id", "/onboarding/:id"], authenticateToken, requireRole(["admin", "super admin", "cms-admin", "editor"]), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [owners] = await pool.query("SELECT * FROM turf_owners WHERE id = ?", [id]);
    const owner = owners[0];

    if (owner) {
      let turfName = null;
      try {
        if (owner.setup_data) {
          let parsed = owner.setup_data;
          while (typeof parsed === 'string') {
            try {
              parsed = JSON.parse(parsed);
            } catch (e) {
              break;
            }
          }
          if (parsed && typeof parsed === 'object') {
            turfName = parsed.turf?.name || parsed.business?.businessName;
          }
        }
      } catch (e) {}

      if (turfName) {
        await pool.query("DELETE FROM turfs WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))", [turfName]).catch(() => {});
      }
      if (owner.name) {
        await pool.query("DELETE FROM turfs WHERE LOWER(TRIM(owner_name)) = LOWER(TRIM(?))", [owner.name]).catch(() => {});
      }
      if (owner.owner_id) {
        await pool.query("DELETE FROM turf_onboarding_requests WHERE owner_id = ?", [owner.owner_id]).catch(() => {});
      }
    }

    await pool.query("DELETE FROM turf_owner_accounts WHERE owner_profile_id = ?", [id]).catch(() => {});
    await pool.query("DELETE FROM turf_onboarding_requests WHERE id = ?", [id]).catch(() => {});
    await pool.query("DELETE FROM turf_owners WHERE id = ?", [id]);

    return res.json({ success: true, message: "Turf onboarding request deleted successfully" });
  } catch (err) {
    console.error("Onboarding Delete Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// TURF REORDERING & DISPLAY SEQUENCE
// ----------------------------------------------------
router.post("/admin/turfs/reorder", authenticateToken, requireRole(["admin", "super admin", "cms-admin", "turf-owner", "owner"]), async (req, res) => {
  try {
    const pool = getPool();
    const { items, type = "recommended" } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, error: "Items must be an array" });
    }

    const orderCol = type === "all" ? "all_display_order" : "display_order";
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const targetId = item.id;
      const orderVal = item[orderCol] !== undefined && item[orderCol] !== null ? Number(item[orderCol]) : i + 1;
      if (targetId) {
        await pool.query(`UPDATE turfs SET \`${orderCol}\` = ? WHERE id = ?`, [orderVal, targetId]);
      }
    }

    return res.json({ success: true, message: "Turfs reordered successfully" });
  } catch (err) {
    console.error("Turfs Reorder Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/admin/turfs/reset-order", authenticateToken, requireRole(["admin", "super admin", "cms-admin", "turf-owner", "owner"]), async (req, res) => {
  try {
    const pool = getPool();
    const { type = "recommended" } = req.body;
    const orderCol = type === "all" ? "all_display_order" : "display_order";
    await pool.query(`UPDATE turfs SET \`${orderCol}\` = 0`);
    return res.json({ success: true, message: "Turf order reset to default successfully" });
  } catch (err) {
    console.error("Turfs Reset Order Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// DYNAMIC TURF OWNER SETTINGS (GET & PUT)
// ----------------------------------------------------
router.get(["/admin/owner/settings", "/owner/settings", "/settings/owner"], optionalAuth, async (req, res) => {
  try {
    const pool = getPool();
    const queryEmail = req.query.ownerEmail || req.query.email;
    const queryName = req.query.ownerName || req.query.name;
    const userEmail = req.user?.email || queryEmail;
    const userId = req.user?.id;

    let ownerRows = [];
    if (userEmail) {
      const [rows] = await pool.query(
        "SELECT * FROM turf_owners WHERE LOWER(email) = LOWER(?) LIMIT 1",
        [String(userEmail).trim()]
      );
      ownerRows = rows;
    }

    if (ownerRows.length === 0 && userId) {
      const [rows] = await pool.query(
        "SELECT * FROM turf_owners WHERE id = ? LIMIT 1",
        [userId]
      );
      ownerRows = rows;
    }

    if (ownerRows.length === 0 && queryName) {
      const [rows] = await pool.query(
        "SELECT * FROM turf_owners WHERE LOWER(name) = LOWER(?) LIMIT 1",
        [String(queryName).trim()]
      );
      ownerRows = rows;
    }

    if (ownerRows.length === 0) {
      const [rows] = await pool.query(
        "SELECT * FROM turf_owners ORDER BY id DESC LIMIT 1"
      );
      ownerRows = rows;
    }

    const owner = ownerRows[0] || {};
    let setupData = {};
    if (owner.setup_data) {
      try {
        let parsed = owner.setup_data;
        while (typeof parsed === "string") {
          try {
            parsed = JSON.parse(parsed);
          } catch (e) {
            break;
          }
        }
        if (parsed && typeof parsed === "object") {
          setupData = parsed;
        }
      } catch (e) {
        console.error("Error parsing setup_data:", e);
      }
    }

    const result = {
      id: owner.id || 1,
      ownerId: owner.owner_id || `OWN-${String(owner.id || 1).padStart(4, "0")}`,
      businessName:
        setupData.business?.businessName ||
        setupData.businessName ||
        setupData.turf?.name ||
        owner.name ||
        "Elite Sports Management",
      contactEmail:
        setupData.business?.email ||
        setupData.personal?.email ||
        owner.email ||
        "owner@elitesports.com",
      contactPhone:
        setupData.business?.phone ||
        setupData.personal?.phone ||
        owner.phone ||
        "+91 9800000000",
      city: setupData.location?.city || owner.city || "Mumbai",
      website: setupData.business?.website || setupData.website || "",
      gstin:
        setupData.business?.gstin ||
        setupData.identity?.gstin ||
        setupData.gstin ||
        "",
      timezone:
        setupData.settings?.timezone ||
        setupData.timezone ||
        "Asia/Kolkata (GMT+5:30)",
      notifications: setupData.notifications?.notifications ?? true,
      emailAlerts: setupData.notifications?.emailAlerts ?? true,
      smsAlerts: setupData.notifications?.smsAlerts ?? false,
      dailySummary: setupData.notifications?.dailySummary ?? true,
      theme: setupData.settings?.theme || setupData.theme || "system",
      currency: setupData.bank?.currency || setupData.currency || "INR",
      bankName: setupData.bank?.bankName || setupData.bankName || "",
      accountNumber: setupData.bank?.accountNumber || setupData.accountNumber || "",
      ifscCode: setupData.bank?.ifscCode || setupData.ifscCode || "",
      upiId: setupData.bank?.upiId || setupData.upiId || "",
      payoutCycle: setupData.bank?.payoutCycle || setupData.payoutCycle || "daily",
      logo: setupData.business?.logo || setupData.logo || "",
    };

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("Fetch Owner Settings Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.put(["/admin/owner/settings", "/owner/settings", "/settings/owner"], optionalAuth, async (req, res) => {
  try {
    const pool = getPool();
    const data = req.body || {};
    const queryEmail = req.query.ownerEmail || req.query.email || data.contactEmail;
    const userEmail = req.user?.email || queryEmail;
    const ownerIdParam = data.id || req.user?.id;

    let ownerRows = [];
    if (userEmail) {
      const [rows] = await pool.query(
        "SELECT * FROM turf_owners WHERE LOWER(email) = LOWER(?) LIMIT 1",
        [String(userEmail).trim()]
      );
      ownerRows = rows;
    }

    if (ownerRows.length === 0 && ownerIdParam) {
      const [rows] = await pool.query(
        "SELECT * FROM turf_owners WHERE id = ? LIMIT 1",
        [ownerIdParam]
      );
      ownerRows = rows;
    }

    if (ownerRows.length === 0) {
      const [rows] = await pool.query(
        "SELECT * FROM turf_owners ORDER BY id DESC LIMIT 1"
      );
      ownerRows = rows;
    }

    const owner = ownerRows[0];
    if (!owner) {
      return res.status(404).json({ success: false, error: "Turf owner account not found to update" });
    }

    let setupData = {};
    if (owner.setup_data) {
      try {
        let parsed = owner.setup_data;
        while (typeof parsed === "string") {
          try {
            parsed = JSON.parse(parsed);
          } catch (e) {
            break;
          }
        }
        if (parsed && typeof parsed === "object") {
          setupData = parsed;
        }
      } catch (e) {
        console.error("Error parsing setup_data:", e);
      }
    }

    // Merge incoming data into setup_data JSON
    setupData.business = {
      ...setupData.business,
      businessName: data.businessName || setupData.business?.businessName || owner.name,
      email: data.contactEmail || setupData.business?.email || owner.email,
      phone: data.contactPhone || setupData.business?.phone || owner.phone,
      website: data.website !== undefined ? data.website : (setupData.business?.website || ""),
      gstin: data.gstin !== undefined ? data.gstin : (setupData.business?.gstin || ""),
      logo: data.logo !== undefined ? data.logo : (setupData.business?.logo || ""),
    };

    setupData.location = {
      ...setupData.location,
      city: data.city || setupData.location?.city || owner.city,
    };

    setupData.notifications = {
      ...setupData.notifications,
      notifications: data.notifications !== undefined ? Boolean(data.notifications) : true,
      emailAlerts: data.emailAlerts !== undefined ? Boolean(data.emailAlerts) : true,
      smsAlerts: data.smsAlerts !== undefined ? Boolean(data.smsAlerts) : false,
      dailySummary: data.dailySummary !== undefined ? Boolean(data.dailySummary) : true,
    };

    setupData.settings = {
      ...setupData.settings,
      timezone: data.timezone || setupData.settings?.timezone || "Asia/Kolkata (GMT+5:30)",
      theme: data.theme || setupData.settings?.theme || "system",
    };

    setupData.bank = {
      ...setupData.bank,
      bankName: data.bankName !== undefined ? data.bankName : (setupData.bank?.bankName || ""),
      accountNumber: data.accountNumber !== undefined ? data.accountNumber : (setupData.bank?.accountNumber || ""),
      ifscCode: data.ifscCode !== undefined ? data.ifscCode : (setupData.bank?.ifscCode || ""),
      upiId: data.upiId !== undefined ? data.upiId : (setupData.bank?.upiId || ""),
      currency: data.currency || setupData.bank?.currency || "INR",
      payoutCycle: data.payoutCycle || setupData.bank?.payoutCycle || "daily",
    };

    const newSetupDataStr = JSON.stringify(setupData);
    const newName = data.businessName || owner.name;
    const newPhone = data.contactPhone || owner.phone;
    const newCity = data.city || owner.city;

    await pool.query(
      `UPDATE turf_owners 
       SET name = ?, phone = ?, city = ?, setup_data = ?
       WHERE id = ?`,
      [newName, newPhone, newCity, newSetupDataStr, owner.id]
    );

    await pool.query(
      `UPDATE turf_owner_accounts 
       SET full_name = ?
       WHERE owner_profile_id = ? OR email = ?`,
      [newName, owner.id, owner.email]
    ).catch(() => {});

    const updatedResult = {
      id: owner.id,
      ownerId: owner.owner_id || `OWN-${String(owner.id).padStart(4, "0")}`,
      businessName: setupData.business.businessName,
      contactEmail: setupData.business.email,
      contactPhone: setupData.business.phone,
      city: setupData.location.city,
      website: setupData.business.website,
      gstin: setupData.business.gstin,
      timezone: setupData.settings.timezone,
      notifications: setupData.notifications.notifications,
      emailAlerts: setupData.notifications.emailAlerts,
      smsAlerts: setupData.notifications.smsAlerts,
      dailySummary: setupData.notifications.dailySummary,
      theme: setupData.settings.theme,
      currency: setupData.bank.currency,
      bankName: setupData.bank.bankName,
      accountNumber: setupData.bank.accountNumber,
      ifscCode: setupData.bank.ifscCode,
      upiId: setupData.bank.upiId,
      payoutCycle: setupData.bank.payoutCycle,
      logo: setupData.business.logo,
    };

    return res.json({
      success: true,
      data: updatedResult,
      message: "Owner settings updated successfully in database",
    });
  } catch (err) {
    console.error("Update Owner Settings Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// OWNER DISABLED DATES ENDPOINTS
// ----------------------------------------------------
router.get(["/admin/owner/disabled-dates", "/owner/disabled-dates", "/disabled-dates"], optionalAuth, async (req, res) => {
  try {
    const pool = getPool();
    const queryEmail = req.query.ownerEmail || req.query.email;
    const userEmail = req.user?.email || queryEmail;
    const ownerId = req.query.ownerId || req.user?.id;

    let rows = [];
    if (userEmail) {
      const [results] = await pool.query(
        "SELECT * FROM owner_disabled_dates WHERE LOWER(owner_email) = LOWER(?) ORDER BY date ASC",
        [String(userEmail).trim()]
      );
      rows = results;
    } else if (ownerId && ownerId !== "guest" && ownerId !== "owner-123") {
      const [results] = await pool.query(
        "SELECT * FROM owner_disabled_dates WHERE owner_id = ? ORDER BY date ASC",
        [ownerId]
      );
      rows = results;
    } else {
      const [results] = await pool.query("SELECT * FROM owner_disabled_dates ORDER BY date ASC");
      rows = results;
    }

    return res.json(rows);
  } catch (err) {
    console.error("Fetch Disabled Dates Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post(["/admin/owner/disabled-dates", "/owner/disabled-dates", "/disabled-dates"], optionalAuth, async (req, res) => {
  try {
    const pool = getPool();
    const { date, reason, turfId, turfName, ownerId: bodyOwnerId, ownerEmail: bodyOwnerEmail } = req.body || {};
    if (!date) {
      return res.status(400).json({ success: false, error: "Date is required" });
    }

    const ownerEmail = req.user?.email || bodyOwnerEmail || req.query.ownerEmail || "";
    const ownerId = req.user?.id || bodyOwnerId || req.query.ownerId || "owner-1";

    await pool.query(
      "DELETE FROM owner_disabled_dates WHERE (LOWER(owner_email) = LOWER(?) OR owner_id = ?) AND date = ?",
      [ownerEmail, ownerId, date]
    ).catch(() => {});

    const [result] = await pool.query(
      `INSERT INTO owner_disabled_dates (owner_id, owner_email, turf_id, turf_name, date, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ownerId, ownerEmail, turfId || null, turfName || null, date, reason || "Maintenance / Blocked"]
    );

    return res.json({ success: true, message: "Date blocked successfully", id: result.insertId });
  } catch (err) {
    console.error("Save Disabled Date Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete(["/admin/owner/disabled-dates", "/owner/disabled-dates", "/disabled-dates"], optionalAuth, async (req, res) => {
  try {
    const pool = getPool();
    const date = req.query.date || req.body?.date;
    const ownerEmail = req.user?.email || req.query.ownerEmail || req.body?.ownerEmail || "";
    const ownerId = req.user?.id || req.query.ownerId || req.body?.ownerId;

    if (!date) {
      return res.status(400).json({ success: false, error: "Date parameter is required" });
    }

    if (ownerEmail) {
      await pool.query(
        "DELETE FROM owner_disabled_dates WHERE LOWER(owner_email) = LOWER(?) AND date = ?",
        [ownerEmail, date]
      );
    } else if (ownerId && ownerId !== "guest" && ownerId !== "owner-123") {
      await pool.query(
        "DELETE FROM owner_disabled_dates WHERE owner_id = ? AND date = ?",
        [ownerId, date]
      );
    } else {
      await pool.query(
        "DELETE FROM owner_disabled_dates WHERE date = ?",
        [date]
      );
    }

    return res.json({ success: true, message: "Date unblocked successfully" });
  } catch (err) {
    console.error("Delete Disabled Date Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// OWNER CUSTOMERS AGGREGATION ENDPOINT
// ----------------------------------------------------
router.get(["/admin/owner/customers", "/owner/customers", "/customers", "/customers/owner"], optionalAuth, async (req, res) => {
  try {
    const pool = getPool();
    const queryEmail = req.query.ownerEmail || req.query.email;
    const userEmail = req.user?.email || queryEmail;

    let ownerTurfNames = [];
    if (userEmail) {
      const [turfRows] = await pool.query(
        "SELECT name FROM turfs WHERE LOWER(owner_email) = LOWER(?)",
        [String(userEmail).trim()]
      );
      ownerTurfNames = turfRows.map(t => String(t.name).trim().toLowerCase());
    }

    const [allBookings] = await pool.query(
      "SELECT * FROM bookings ORDER BY id DESC"
    );

    const [allUsers] = await pool.query(
      "SELECT id, full_name, email, phone, city, avatar, status, joined_date, selected_sports FROM users"
    );

    const userMap = new Map();
    allUsers.forEach(u => {
      if (u.email) userMap.set(String(u.email).toLowerCase().trim(), u);
      if (u.full_name) userMap.set(String(u.full_name).toLowerCase().trim(), u);
    });

    const filteredBookings = ownerTurfNames.length > 0
      ? allBookings.filter(b => ownerTurfNames.includes(String(b.turf_name).trim().toLowerCase()))
      : allBookings;

    const customerAgg = new Map();

    filteredBookings.forEach(b => {
      const key = String(b.user_email || b.user_name || "Unknown Player").trim().toLowerCase();
      if (!customerAgg.has(key)) {
        const matchedUser = userMap.get(key) || userMap.get(String(b.user_name || "").toLowerCase().trim());
        customerAgg.set(key, {
          id: matchedUser?.id || `cust-${Math.abs(key.split('').reduce((a,b)=>(((a<<5)-a)+b.charCodeAt(0))|0,0))}`,
          name: b.user_name || matchedUser?.full_name || "Sports Player",
          email: b.user_email || matchedUser?.email || "customer@example.com",
          phone: b.user_phone || matchedUser?.phone || "+91 98765 43210",
          city: matchedUser?.city || "Mumbai",
          avatar: matchedUser?.avatar || "",
          totalBookings: 0,
          totalSpent: 0,
          sports: {},
          turfs: {},
          lastBookingDate: b.date || "",
          lastBookingVenue: b.turf_name || "",
          status: matchedUser?.status || "Active",
          bookingHistory: [],
        });
      }

      const c = customerAgg.get(key);
      c.totalBookings += 1;
      c.totalSpent += Number(b.amount) || 0;

      const sp = b.sport || "Football";
      c.sports[sp] = (c.sports[sp] || 0) + 1;

      const tn = b.turf_name || "Turf Arena";
      c.turfs[tn] = (c.turfs[tn] || 0) + 1;

      if (!c.lastBookingDate || new Date(b.date) > new Date(c.lastBookingDate)) {
        c.lastBookingDate = b.date;
        c.lastBookingVenue = b.turf_name;
      }

      c.bookingHistory.push({
        id: b.id,
        bookingCode: b.booking_code || `BK-${b.id}`,
        turfName: b.turf_name,
        sport: b.sport,
        date: b.date,
        timeSlot: b.time_slot || b.slot_time,
        amount: b.amount,
        status: b.status || "Confirmed",
        paymentMethod: b.payment_method || "UPI",
      });
    });

    // If no bookings exist yet, include users as potential customers
    if (customerAgg.size === 0) {
      allUsers.slice(0, 10).forEach(u => {
        customerAgg.set(String(u.email || u.full_name).toLowerCase(), {
          id: u.id,
          name: u.full_name,
          email: u.email,
          phone: u.phone || "+91 98765 43210",
          city: u.city || "Mumbai",
          avatar: u.avatar || "",
          totalBookings: u.bookings || 1,
          totalSpent: (u.bookings || 1) * 1200,
          sports: { Football: 1 },
          turfs: { "Main Turf": 1 },
          lastBookingDate: "2026-08-01",
          lastBookingVenue: "Main Turf",
          status: u.status || "Active",
          bookingHistory: [],
        });
      });
    }

    const customerList = Array.from(customerAgg.values()).map(c => {
      let favoriteSport = "Football";
      let maxSportCount = 0;
      Object.entries(c.sports).forEach(([s, count]) => {
        if (count > maxSportCount) {
          maxSportCount = count;
          favoriteSport = s;
        }
      });

      return {
        ...c,
        favoriteSport,
        tier: c.totalBookings >= 5 ? "VIP Regular" : (c.totalBookings >= 2 ? "Returning" : "New Player"),
      };
    });

    return res.json({ success: true, data: customerList });
  } catch (err) {
    console.error("Fetch Owner Customers Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// OWNER KYC ENDPOINTS
// ----------------------------------------------------
router.get(["/admin/owner/kyc", "/owner/kyc", "/kyc", "/kyc/owner"], optionalAuth, async (req, res) => {
  try {
    const pool = getPool();
    const queryEmail = req.query.ownerEmail || req.query.email;
    const userEmail = req.user?.email || queryEmail;

    let ownerRows = [];
    if (userEmail) {
      const [rows] = await pool.query(
        "SELECT * FROM turf_owners WHERE LOWER(email) = LOWER(?) LIMIT 1",
        [String(userEmail).trim()]
      );
      ownerRows = rows;
    }
    if (ownerRows.length === 0) {
      const [rows] = await pool.query(
        "SELECT * FROM turf_owners ORDER BY id DESC LIMIT 1"
      );
      ownerRows = rows;
    }

    const owner = ownerRows[0];
    if (!owner) {
      return res.status(404).json({ success: false, error: "Owner profile not found" });
    }

    let setupData = {};
    if (owner.setup_data) {
      try {
        let parsed = owner.setup_data;
        while (typeof parsed === "string") {
          parsed = JSON.parse(parsed);
        }
        if (parsed && typeof parsed === "object") setupData = parsed;
      } catch (e) {}
    }

    const kyc = setupData.kyc || {
      isKycCompleted: true,
      aadhaarVerified: true,
      panVerified: true,
      panNumber: "ABCDE1234F",
      gstin: setupData.business?.gstin || "27ABCDE1234F1Z5",
      status: "Verified",
      verifiedAt: "2026-06-15",
    };

    const bank = setupData.bank || {
      bankName: "HDFC Bank",
      accountHolder: owner.name,
      accountNumber: "50100293847581",
      ifscCode: "HDFC0001234",
    };

    return res.json({
      success: true,
      data: {
        kyc,
        bank,
      }
    });
  } catch (err) {
    console.error("Fetch Owner KYC Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post(["/admin/owner/kyc", "/owner/kyc", "/kyc", "/kyc/owner"], optionalAuth, async (req, res) => {
  try {
    const pool = getPool();
    const data = req.body || {};
    const queryEmail = req.query.ownerEmail || req.query.email || data.email;
    const userEmail = req.user?.email || queryEmail;

    let ownerRows = [];
    if (userEmail) {
      const [rows] = await pool.query(
        "SELECT * FROM turf_owners WHERE LOWER(email) = LOWER(?) LIMIT 1",
        [String(userEmail).trim()]
      );
      ownerRows = rows;
    }
    if (ownerRows.length === 0) {
      const [rows] = await pool.query(
        "SELECT * FROM turf_owners ORDER BY id DESC LIMIT 1"
      );
      ownerRows = rows;
    }

    const owner = ownerRows[0];
    if (!owner) {
      return res.status(404).json({ success: false, error: "Owner profile not found" });
    }

    let setupData = {};
    if (owner.setup_data) {
      try {
        let parsed = owner.setup_data;
        while (typeof parsed === "string") {
          parsed = JSON.parse(parsed);
        }
        if (parsed && typeof parsed === "object") setupData = parsed;
      } catch (e) {}
    }

    setupData.kyc = {
      isKycCompleted: true,
      aadhaarVerified: data.aadhaarVerified !== undefined ? Boolean(data.aadhaarVerified) : true,
      panVerified: data.panVerified !== undefined ? Boolean(data.panVerified) : true,
      panNumber: data.panNumber || setupData.kyc?.panNumber || "ABCDE1234F",
      gstin: data.gstin || setupData.kyc?.gstin || setupData.business?.gstin || "",
      status: "Verified",
      verifiedAt: new Date().toISOString().split("T")[0],
    };

    setupData.bank = {
      ...setupData.bank,
      bankName: data.bankName || setupData.bank?.bankName || "HDFC Bank",
      accountHolder: data.accountHolder || setupData.bank?.accountHolder || owner.name,
      accountNumber: data.accountNumber || setupData.bank?.accountNumber || "",
      ifscCode: data.ifscCode || setupData.bank?.ifscCode || "",
    };

    await pool.query(
      "UPDATE turf_owners SET setup_data = ? WHERE id = ?",
      [JSON.stringify(setupData), owner.id]
    );

    return res.json({
      success: true,
      message: "Owner Bank & KYC details verified and saved to database",
      data: {
        kyc: setupData.kyc,
        bank: setupData.bank,
      }
    });
  } catch (err) {
    console.error("Save Owner KYC Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// GENERIC CRUD FOR ALL ADMIN ENTITIES
// ----------------------------------------------------

// Get All Items for an entity (Protected for sensitive entities)
router.get(["/admin/:entity", "/owner/:entity", "/:entity"], optionalAuth, async (req, res, next) => {
  const entity = req.params.entity;
  const tableName = ALLOWED_ENTITIES[entity];
  if (!tableName) {
    return next();
  }

  // Enforce authentication on sensitive entities (allow owner-scoped queries)
  if (SENSITIVE_ENTITIES.has(entity)) {
    const isOwnerScoped = Boolean(req.query.ownerEmail || req.query.ownerName || req.query.ownerId);
    if (!req.user && !isOwnerScoped) {
      return res.status(401).json({ success: false, error: `Authentication required to view ${entity}.` });
    }
  }

  try {
    const pool = getPool();
    const { ownerEmail, ownerName } = req.query;

    if (ownerEmail || ownerName) {
      const cleanEmail = String(ownerEmail || "").trim().toLowerCase();
      const cleanName = String(ownerName || "").trim().toLowerCase();

      // 1. Check if the requesting email or name belongs to a staff member
      let staffRows = [];
      if (cleanEmail) {
        const [rows] = await pool.query(
          "SELECT * FROM staff WHERE LOWER(email) = ? LIMIT 1",
          [cleanEmail]
        );
        staffRows = rows;
      }
      if (staffRows.length === 0 && cleanName) {
        const [rows] = await pool.query(
          "SELECT * FROM staff WHERE CONCAT(LOWER(first_name), ' ', LOWER(last_name)) = ? LIMIT 1",
          [cleanName]
        );
        staffRows = rows;
      }

      if (staffRows.length > 0) {
        const staff = staffRows[0];
        let assignedTurfs = [];
        try {
          if (staff.turfs) {
            assignedTurfs = typeof staff.turfs === 'string' ? JSON.parse(staff.turfs) : staff.turfs;
          }
        } catch (e) {}
        if (!Array.isArray(assignedTurfs) || assignedTurfs.length === 0) {
          if (staff.turf) assignedTurfs = [staff.turf];
        }
        assignedTurfs = (Array.isArray(assignedTurfs) ? assignedTurfs : [assignedTurfs])
          .map(t => String(t).trim())
          .filter(Boolean);

        if (entity === "turfs" || entity === "turf") {
          if (assignedTurfs.length > 0) {
            const placeholders = assignedTurfs.map(() => "?").join(", ");
            const [rows] = await pool.query(
              `SELECT * FROM turfs WHERE name IN (${placeholders}) OR id IN (${placeholders}) ORDER BY id DESC`,
              [...assignedTurfs, ...assignedTurfs]
            );
            if (rows.length > 0) {
              return res.json({ success: true, data: rows });
            }
          }
          const [allRows] = await pool.query("SELECT * FROM turfs ORDER BY id DESC");
          return res.json({ success: true, data: allRows });
        }

        if (entity === "bookings" || entity === "booking") {
          if (assignedTurfs.length > 0) {
            const placeholders = assignedTurfs.map(() => "?").join(", ");
            const [rows] = await pool.query(
              `SELECT * FROM bookings WHERE turf_name IN (${placeholders}) OR turf_id IN (${placeholders}) ORDER BY id DESC`,
              [...assignedTurfs, ...assignedTurfs]
            );
            return res.json({ success: true, data: rows });
          } else {
            const [rows] = await pool.query("SELECT * FROM bookings ORDER BY id DESC");
            return res.json({ success: true, data: rows });
          }
        }

        if (entity === "payments" || entity === "payment") {
          if (assignedTurfs.length > 0) {
            const placeholders = assignedTurfs.map(() => "?").join(", ");
            const [rows] = await pool.query(
              `SELECT * FROM payments WHERE turf_name IN (${placeholders}) ORDER BY id DESC`,
              assignedTurfs
            );
            return res.json({ success: true, data: rows });
          } else {
            const [rows] = await pool.query("SELECT * FROM payments ORDER BY id DESC");
            return res.json({ success: true, data: rows });
          }
        }

        if (entity === "reviews" || entity === "review") {
          if (assignedTurfs.length > 0) {
            const placeholders = assignedTurfs.map(() => "?").join(", ");
            const [rows] = await pool.query(
              `SELECT * FROM reviews WHERE turf_name IN (${placeholders}) ORDER BY id DESC`,
              assignedTurfs
            );
            return res.json({ success: true, data: rows });
          } else {
            const [rows] = await pool.query("SELECT * FROM reviews ORDER BY id DESC");
            return res.json({ success: true, data: rows });
          }
        }

        if (entity === "staff") {
          return res.json({ success: true, data: [staff] });
        }
      }

      // 2. Turf Owner Queries
      if (entity === "turfs" || entity === "turf") {
        const [rows] = await pool.query(
          `SELECT * FROM turfs 
           WHERE (LOWER(owner_email) = ? AND ? != '') 
              OR (LOWER(owner_name) = ? AND ? != '')
           ORDER BY id DESC`,
          [cleanEmail, cleanEmail, cleanName, cleanName]
        );
        if (rows.length > 0) {
          return res.json({ success: true, data: rows });
        }
        const [allRows] = await pool.query("SELECT * FROM turfs ORDER BY id DESC");
        return res.json({ success: true, data: allRows });
      }

      if (entity === "bookings" || entity === "booking") {
        const [rows] = await pool.query(
          `SELECT b.* FROM bookings b
           INNER JOIN turfs t ON LOWER(t.name) = LOWER(b.turf_name)
           WHERE (LOWER(t.owner_email) = ? AND ? != '') 
              OR (LOWER(t.owner_name) = ? AND ? != '')
           ORDER BY b.id DESC`,
          [cleanEmail, cleanEmail, cleanName, cleanName]
        );
        if (rows.length > 0) {
          return res.json({ success: true, data: rows });
        }
        const [allRows] = await pool.query("SELECT * FROM bookings ORDER BY id DESC");
        return res.json({ success: true, data: allRows });
      }

      if (entity === "payments" || entity === "payment") {
        const [rows] = await pool.query(
          `SELECT p.* FROM payments p
           INNER JOIN turfs t ON LOWER(t.name) = LOWER(p.turf_name)
           WHERE (LOWER(t.owner_email) = ? AND ? != '') 
              OR (LOWER(t.owner_name) = ? AND ? != '')
           ORDER BY p.id DESC`,
          [cleanEmail, cleanEmail, cleanName, cleanName]
        );
        if (rows.length > 0) {
          return res.json({ success: true, data: rows });
        }
        const [allRows] = await pool.query("SELECT * FROM payments ORDER BY id DESC");
        return res.json({ success: true, data: allRows });
      }

      if (entity === "reviews" || entity === "review") {
        const [rows] = await pool.query(
          `SELECT r.* FROM reviews r
           INNER JOIN turfs t ON LOWER(t.name) = LOWER(r.turf_name)
           WHERE (LOWER(t.owner_email) = ? AND ? != '') 
              OR (LOWER(t.owner_name) = ? AND ? != '')
           ORDER BY r.id DESC`,
          [cleanEmail, cleanEmail, cleanName, cleanName]
        );
        if (rows.length > 0) {
          return res.json({ success: true, data: rows });
        }
        const [allRows] = await pool.query("SELECT * FROM reviews ORDER BY id DESC");
        return res.json({ success: true, data: allRows });
      }

      if (entity === "staff") {
        const [rows] = await pool.query(
          `SELECT s.* FROM staff s
           INNER JOIN turfs t ON LOWER(t.name) = LOWER(s.turf)
           WHERE (LOWER(t.owner_email) = ? AND ? != '') 
              OR (LOWER(t.owner_name) = ? AND ? != '')
           ORDER BY s.id DESC`,
          [cleanEmail, cleanEmail, cleanName, cleanName]
        );
        if (rows.length > 0) {
          return res.json({ success: true, data: rows });
        }
        const [allRows] = await pool.query("SELECT * FROM staff ORDER BY id DESC");
        return res.json({ success: true, data: allRows });
      }

      if (entity === "turf-owners" || entity === "owner" || entity === "owners") {
        const [rows] = await pool.query(
          `SELECT * FROM turf_owners 
           WHERE (LOWER(email) = ? AND ? != '') 
              OR (LOWER(name) = ? AND ? != '')
           ORDER BY id DESC`,
          [cleanEmail, cleanEmail, cleanName, cleanName]
        );
        return res.json({ success: true, data: rows });
      }

      if (entity === "tournaments" || entity === "tournament") {
        const [rows] = await pool.query(
          `SELECT * FROM tournaments 
           WHERE (LOWER(organizer_email) = ? AND ? != '') 
              OR (LOWER(organizer_name) = ? AND ? != '')
           ORDER BY id DESC`,
          [cleanEmail, cleanEmail, cleanName, cleanName]
        );
        return res.json({ success: true, data: rows });
      }

      if (entity === "tournament-teams") {
        const [rows] = await pool.query(
          `SELECT * FROM tournament_teams 
           WHERE (LOWER(organizer_email) = ? AND ? != '') 
           ORDER BY id DESC`,
          [cleanEmail, cleanEmail]
        );
        return res.json({ success: true, data: rows });
      }
    }

    const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` ORDER BY id DESC`);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error(`Fetch ${entity} Error:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get Single Item for an entity (Protected for sensitive entities)
router.get(["/admin/:entity/:id", "/owner/:entity/:id", "/:entity/:id"], optionalAuth, async (req, res, next) => {
  const { entity, id } = req.params;
  const tableName = ALLOWED_ENTITIES[entity];
  if (!tableName) {
    return next();
  }

  try {
    const pool = getPool();
    const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` WHERE id = ? LIMIT 1`, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: `${entity} with id ${id} not found` });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(`Fetch ${entity}/${id} Error:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

async function filterValidColumns(pool, tableName, rawBody) {
  const [columns] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\``);
  const validColNames = new Set(columns.map(c => c.Field));
  const filtered = {};
  for (const key of Object.keys(rawBody)) {
    if (key === 'id' || key === 'created_at') continue;
    let targetKey = key;
    if (validColNames.has(key)) {
      targetKey = key;
    } else {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      if (validColNames.has(snakeKey)) {
        targetKey = snakeKey;
      } else {
        continue;
      }
    }
    let val = rawBody[key];
    if (typeof val === 'object' && val !== null) {
      val = JSON.stringify(val);
    }
    filtered[targetKey] = val;
  }
  return filtered;
}

// Create Item in an entity (Protected)
router.post(["/admin/:entity", "/owner/:entity", "/:entity"], authenticateToken, requireRole(["admin", "super admin", "cms-admin", "turf-owner", "owner", "player", "user", "editor", "moderator"]), async (req, res, next) => {
  const entity = req.params.entity;
  const tableName = ALLOWED_ENTITIES[entity];
  if (!tableName) {
    return next();
  }

  try {
    const pool = getPool();
    const body = await filterValidColumns(pool, tableName, req.body);

    const keys = Object.keys(body);
    if (keys.length === 0) {
      return res.status(400).json({ success: false, error: "No valid fields provided to insert" });
    }

    const values = Object.values(body);
    const placeholders = keys.map(() => "?").join(", ");
    const columns = keys.map(k => `\`${k}\``).join(", ");

    const sql = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, values);

    const [inserted] = await pool.query(`SELECT * FROM \`${tableName}\` WHERE id = ?`, [result.insertId]);

    return res.json({ success: true, data: inserted[0] });
  } catch (err) {
    console.error(`Create ${entity} Error:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Update Item in an entity (Protected)
router.put(["/admin/:entity/:id", "/owner/:entity/:id", "/:entity/:id"], authenticateToken, requireRole(["admin", "super admin", "cms-admin", "turf-owner", "owner", "player", "user", "editor", "moderator"]), async (req, res, next) => {
  const { entity, id } = req.params;
  const tableName = ALLOWED_ENTITIES[entity];
  if (!tableName) {
    return next();
  }

  try {
    const pool = getPool();
    const body = await filterValidColumns(pool, tableName, req.body);

    const keys = Object.keys(body);
    if (keys.length === 0) {
      return res.status(400).json({ success: false, error: "No valid fields provided to update" });
    }

    const setClause = keys.map(k => `\`${k}\` = ?`).join(", ");
    const values = [...Object.values(body), id];

    const sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE id = ?`;
    await pool.query(sql, values);

    const [updated] = await pool.query(`SELECT * FROM \`${tableName}\` WHERE id = ?`, [id]);

    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error(`Update ${entity} Error:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Delete Item from an entity (Protected)
router.delete(["/admin/:entity/:id", "/owner/:entity/:id", "/:entity/:id"], authenticateToken, requireRole(["admin", "super admin", "cms-admin", "turf-owner", "owner"]), async (req, res, next) => {
  const { entity, id } = req.params;
  const tableName = ALLOWED_ENTITIES[entity];
  if (!tableName) {
    return next();
  }

  try {
    const pool = getPool();
    await pool.query(`DELETE FROM \`${tableName}\` WHERE id = ?`, [id]);
    return res.json({ success: true, id: Number(id) });
  } catch (err) {
    console.error(`Delete ${entity} Error:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Reset database endpoint (Protected)
router.post("/admin/reset-db", authenticateToken, requireRole(["super admin", "admin"]), async (req, res) => {
  try {
    const adminSecret = req.headers["x-admin-secret"] || req.body?.adminSecret;
    const configuredSecret = process.env.ADMIN_API_SECRET;

    if (!configuredSecret || adminSecret !== configuredSecret) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: Database reset is unauthorized.",
      });
    }

    const pool = getPool();
    const tables = Object.values(ALLOWED_ENTITIES);
    for (const t of tables) {
      await pool.query(`DROP TABLE IF EXISTS \`${t}\``);
    }
    const { initDatabase } = await import("../db.js");
    await initDatabase();
    return res.json({ success: true, message: "Database re-seeded successfully!" });
  } catch (err) {
    console.error("Reset DB Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
