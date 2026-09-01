import express from "express";
import { getPool } from "../db.js";
import nodemailer from "nodemailer";

const router = express.Router();

async function sendOnboardingStatusEmail(toEmail, ownerName, status) {
  try {
    const smtpUser = (process.env.SMTP_USER || "").trim();
    const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");

    if (!smtpUser || !smtpPass) return; // Skip if no email config

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: smtpUser, pass: smtpPass },
    });

    const isApproved = status.toLowerCase() === "approved";
    const title = isApproved ? "Application Approved!" : "Application Status Update";
    const message = isApproved
      ? "Congratulations! Your Turf Owner application has been reviewed and <strong>Approved</strong>. You can now log into the SportXClub Turf Owner Dashboard to manage your turfs."
      : "Thank you for applying to be a Turf Owner on SportXClub. Unfortunately, your recent application has been <strong>Rejected</strong> at this time. Please contact our support team for more details.";

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; background-color: #0d1117; border-radius: 20px; color: #ffffff; border: 1px solid #21262d;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #21262d;">
          <h1 style="color: ${isApproved ? '#10b981' : '#f43f5e'}; font-size: 30px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">SportXClub</h1>
          <p style="color: #8b949e; font-size: 11px; margin-top: 4px; font-weight: 700; letter-spacing: 2px;">TURF OWNER ONBOARDING</p>
        </div>
        
        <div style="padding: 24px 0;">
          <h2 style="font-size: 18px; color: #f0f6fc; margin-bottom: 12px;">Hello ${ownerName},</h2>
          <p style="color: #c9d1d9; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            ${message}
          </p>
        </div>
        
        <div style="border-top: 1px solid #21262d; pt: 16px; text-align: center; color: #8b949e; font-size: 11px;">
          <p>© 2026 SportXClub. All rights reserved.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"SportXClub Admin" <${smtpUser}>`,
      to: toEmail,
      subject: `[SportXClub] Turf Application ${isApproved ? 'Approved' : 'Rejected'}`,
      html: htmlContent,
    });
    console.log(`[NODEMAILER] Onboarding status (${status}) email sent to ${toEmail}`);
  } catch (err) {
    console.error(`[NODEMAILER] Failed to send onboarding status to ${toEmail}:`, err.message);
  }
}

const ALLOWED_ENTITIES = {
  users: "users",
  "turf-owners": "turf_owners",
  turfs: "turfs",
  bookings: "bookings",
  games: "games",
  payments: "payments",
  passes: "game_passes",
  coupons: "coupons",
  banners: "banners",
  reviews: "reviews",
  reports: "reports",
  notifications: "notifications",
  staff: "staff",
  tournaments: "tournaments",
  "tournament-teams": "tournament_teams",
  "tournament-fixtures": "tournament_fixtures",
};

// Auth endpoints extracted to server/routes/auth.js

// ----------------------------------------------------
// DASHBOARD STATS
// ----------------------------------------------------
router.get("/admin/dashboard/stats", async (req, res) => {
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
// TURF OWNER ONBOARDING
// ----------------------------------------------------
router.get("/admin/onboarding", async (req, res) => {
  try {
    const pool = getPool();
    const [pendingOwners] = await pool.query(
      "SELECT * FROM turf_owners ORDER BY id DESC"
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
              break; // Stop parsing if it's not valid JSON anymore
            }
          }
          if (parsed && typeof parsed === 'object') {
            setupData = parsed;
          }
        }
      } catch (e) {
        console.error("Failed parsing setup_data for owner", owner.id, e);
      }

      return {
        id: owner.id,
        ownerId: owner.owner_id,
        personal: {
          fullName: owner.name,
          email: owner.email,
          ...setupData.personal
        },
        business: {
          ownerName: owner.name,
          phone: owner.phone,
          email: owner.email,
          ...setupData.business
        },
        location: {
          city: owner.city,
          address: owner.city,
          ...setupData.location
        },
        turf: setupData.turf || {},
        pricing: setupData.pricing || {},
        images: setupData.images || {},
        identity: setupData.identity || {},
        bank: setupData.bank || {},
        status: owner.status,
        createdAt: owner.created_at || owner.joined_date
      };
    });

    return res.json({ success: true, data: mappedData });
  } catch (err) {
    console.error("Onboarding Fetch Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/admin/onboarding/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const pool = getPool();

    if (String(status).toLowerCase() === "approved") {
      await pool.query("UPDATE turf_owners SET status = 'Approved' WHERE id = ?", [id]);
      await pool.query("UPDATE turf_owner_accounts SET status = 'Active' WHERE owner_profile_id = ?", [id]);
    } else if (String(status).toLowerCase() === "rejected") {
      await pool.query("UPDATE turf_owners SET status = 'Rejected' WHERE id = ?", [id]);
      await pool.query("UPDATE turf_owner_accounts SET status = 'Rejected' WHERE owner_profile_id = ?", [id]);
    }

    // Send email notification to turf owner
    try {
      const [ownerRows] = await pool.query("SELECT email, name FROM turf_owners WHERE id = ?", [id]);
      if (ownerRows.length > 0 && ownerRows[0].email) {
        await sendOnboardingStatusEmail(ownerRows[0].email, ownerRows[0].name || "Turf Owner", status);
      }
    } catch (e) {
      console.error("Failed to send onboarding status email", e);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Onboarding Update Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// GENERIC DYNAMIC CRUD FOR ALL ADMIN ENTITIES
// ----------------------------------------------------

// Get All Items for an entity
router.get("/admin/:entity", async (req, res) => {
  const entity = req.params.entity;
  const tableName = ALLOWED_ENTITIES[entity];
  if (!tableName) {
    return res.status(400).json({ success: false, error: `Invalid entity '${entity}'` });
  }

  try {
    const pool = getPool();
    const { ownerEmail, ownerName } = req.query;

    if (ownerEmail || ownerName) {
      const cleanEmail = String(ownerEmail || "").trim().toLowerCase();
      const cleanName = String(ownerName || "").trim().toLowerCase();

      if (entity === "turfs") {
        const [rows] = await pool.query(
          `SELECT * FROM turfs 
           WHERE (LOWER(owner_email) = ? AND ? != '') 
              OR (LOWER(owner_name) = ? AND ? != '')
           ORDER BY id DESC`,
          [cleanEmail, cleanEmail, cleanName, cleanName]
        );
        return res.json({ success: true, data: rows });
      }

      if (entity === "bookings") {
        const [rows] = await pool.query(
          `SELECT b.* FROM bookings b
           INNER JOIN turfs t ON LOWER(t.name) = LOWER(b.turf_name)
           WHERE (LOWER(t.owner_email) = ? AND ? != '') 
              OR (LOWER(t.owner_name) = ? AND ? != '')
           ORDER BY b.id DESC`,
          [cleanEmail, cleanEmail, cleanName, cleanName]
        );
        return res.json({ success: true, data: rows });
      }

      if (entity === "payments") {
        const [rows] = await pool.query(
          `SELECT p.* FROM payments p
           INNER JOIN turfs t ON LOWER(t.name) = LOWER(p.turf_name)
           WHERE (LOWER(t.owner_email) = ? AND ? != '') 
              OR (LOWER(t.owner_name) = ? AND ? != '')
           ORDER BY p.id DESC`,
          [cleanEmail, cleanEmail, cleanName, cleanName]
        );
        return res.json({ success: true, data: rows });
      }

      if (entity === "reviews") {
        const [rows] = await pool.query(
          `SELECT r.* FROM reviews r
           INNER JOIN turfs t ON LOWER(t.name) = LOWER(r.turf_name)
           WHERE (LOWER(t.owner_email) = ? AND ? != '') 
              OR (LOWER(t.owner_name) = ? AND ? != '')
           ORDER BY r.id DESC`,
          [cleanEmail, cleanEmail, cleanName, cleanName]
        );
        return res.json({ success: true, data: rows });
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
        return res.json({ success: true, data: rows });
      }

      if (entity === "turf-owners") {
        const [rows] = await pool.query(
          `SELECT * FROM turf_owners 
           WHERE (LOWER(email) = ? AND ? != '') 
              OR (LOWER(name) = ? AND ? != '')
           ORDER BY id DESC`,
          [cleanEmail, cleanEmail, cleanName, cleanName]
        );
        return res.json({ success: true, data: rows });
      }

      if (entity === "tournaments") {
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

// Helper to filter object keys by table columns
async function filterValidColumns(pool, tableName, rawBody) {
  const [columns] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\``);
  const validColNames = new Set(columns.map(c => c.Field));
  const filtered = {};
  for (const key of Object.keys(rawBody)) {
    if (key === 'id' || key === 'created_at') continue;
    if (validColNames.has(key)) {
      let val = rawBody[key];
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      }
      filtered[key] = val;
    }
  }
  return filtered;
}

// Create Item in an entity
router.post("/admin/:entity", async (req, res) => {
  const entity = req.params.entity;
  const tableName = ALLOWED_ENTITIES[entity];
  if (!tableName) {
    return res.status(400).json({ success: false, error: `Invalid entity '${entity}'` });
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

// Update Item in an entity
router.put("/admin/:entity/:id", async (req, res) => {
  const { entity, id } = req.params;
  const tableName = ALLOWED_ENTITIES[entity];
  if (!tableName) {
    return res.status(400).json({ success: false, error: `Invalid entity '${entity}'` });
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

// Delete Item from an entity
router.delete("/admin/:entity/:id", async (req, res) => {
  const { entity, id } = req.params;
  const tableName = ALLOWED_ENTITIES[entity];
  if (!tableName) {
    return res.status(400).json({ success: false, error: `Invalid entity '${entity}'` });
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

// Reset/Reseed database endpoint (Protected)
router.post("/admin/reset-db", async (req, res) => {
  try {
    const adminSecret = req.headers["x-admin-secret"] || req.body?.adminSecret;
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction || !adminSecret || adminSecret !== (process.env.ADMIN_API_SECRET || "sportxclub_admin_sec_2026_x89")) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: Database reset is disabled or unauthorized.",
      });
    }

    const pool = getPool();
    // Drop all tables & re-initialize
    const tables = Object.values(ALLOWED_ENTITIES);
    for (const t of tables) {
      await pool.query(`DROP TABLE IF EXISTS \`${t}\``);
    }
    // Re-initialize DB
    const { initDatabase } = await import("../db.js");
    await initDatabase();
    return res.json({ success: true, message: "Database re-seeded successfully!" });
  } catch (err) {
    console.error("Reset DB Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
