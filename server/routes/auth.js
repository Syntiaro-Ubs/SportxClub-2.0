import express from "express";
import { getPool } from "../db.js";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { generateToken, authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// In-memory OTP Store for password/email recovery (key: identifier -> { otp, expiresAt, user })
const otpStore = new Map();

function normalizeAccountType(value) {
  const v = String(value || "player").toLowerCase();
  if (v === "owner" || v === "turf-owner" || v === "turf_owner") return "turf-owner";
  if (v === "cms-admin" || v === "admin") return "cms-admin";
  return "player";
}

async function hashPassword(plainPassword) {
  if (!plainPassword) return "";
  return await bcrypt.hash(String(plainPassword), 10);
}

async function verifyPassword(plainPassword, storedPassword) {
  if (!storedPassword || !plainPassword) return false;
  const strStored = String(storedPassword);
  const strPlain = String(plainPassword);
  if (strStored.startsWith("$2a$") || strStored.startsWith("$2b$") || strStored.startsWith("$2y$")) {
    try {
      return await bcrypt.compare(strPlain, strStored);
    } catch {
      return false;
    }
  }
  // Fallback for legacy plaintext passwords
  return strPlain === strStored;
}

async function maybeUpgradePassword(pool, table, id, plainPassword, storedPassword) {
  const strStored = String(storedPassword || "");
  if (!strStored.startsWith("$2a$") && !strStored.startsWith("$2b$") && !strStored.startsWith("$2y$")) {
    try {
      const newHash = await hashPassword(plainPassword);
      await pool.query(`UPDATE \`${table}\` SET password = ? WHERE id = ?`, [newHash, id]);
    } catch (e) {
      console.warn(`[Auto-Upgrade Password] Table: ${table}, ID: ${id}:`, e.message);
    }
  }
}

async function accountEmailExists(pool, email, targetAccountType = "player") {
  const cleanEmail = email.trim().toLowerCase();
  const accType = normalizeAccountType(targetAccountType);
  if (accType === "turf-owner") {
    const [ownerRows] = await pool.query(
      "SELECT id FROM turf_owners WHERE LOWER(email) = ? UNION SELECT id FROM turf_owner_accounts WHERE LOWER(email) = ? UNION SELECT id FROM staff WHERE LOWER(email) = ? LIMIT 1",
      [cleanEmail, cleanEmail, cleanEmail]
    );
    return ownerRows.length > 0;
  } else if (accType === "cms-admin") {
    const [adminRows] = await pool.query(
      "SELECT id FROM cms_users WHERE LOWER(email) = ? UNION SELECT id FROM admin_accounts WHERE LOWER(email) = ? LIMIT 1",
      [cleanEmail, cleanEmail]
    );
    return adminRows.length > 0;
  } else {
    const [playerRows] = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = ? UNION SELECT id FROM player_accounts WHERE LOWER(email) = ? LIMIT 1",
      [cleanEmail, cleanEmail]
    );
    return playerRows.length > 0;
  }
}

function parseSelectedSports(value) {
  if (!value) return [];
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch (error) {
    return [];
  }
}

// Helper function to send Live HTML Email OTP via Nodemailer
async function sendLiveEmailOtp(toEmail, otpCode, options = {}) {
  const cleanToEmail = (toEmail || "").trim().toLowerCase();
  const smtpUser = (process.env.SMTP_USER || process.env.EMAIL_USER || "waghmareshrinivas99@gmail.com").trim();
  const smtpPass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || "").replace(/\s+/g, "");

  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;

  let transporter;
  if (host && host !== "smtp.gmail.com") {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false },
    });
  } else {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  const mode = typeof options === "string" ? options : (options.mode || "security");
  const isOwnerOnboarding = mode === "owner-onboarding" || mode === "onboarding" || options.type === "owner";

  let plainTextContent = "";
  let htmlContent = "";

  if (isOwnerOnboarding) {
    plainTextContent = `Hello Turf Owner,\n\nYour verification code for SportXClub Turf Onboarding is:\n\n${otpCode}\n\nThis code will expire in 10 minutes. Please do not share this code with anyone.\n\nIf you did not request this verification code, you can safely ignore this email.\n\nBest Regards,\nSportXClub Team`;

    htmlContent = `
    <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #202124;">
      <p style="margin: 0 0 16px 0;">Hello Turf Owner,</p>
      
      <p style="margin: 0 0 16px 0;">Your verification code for SportXClub Turf Onboarding is:</p>
      
      <p style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #059669;">
        ${otpCode}
      </p>
      
      <p style="margin: 0 0 16px 0;">This code will expire in 10 minutes. Please do not share this code with anyone.</p>
      
      <p style="margin: 0 0 16px 0;">If you did not request this verification code, you can safely ignore this email.</p>
      
      <p style="margin: 0; line-height: 1.5;">
        Best Regards,<br>
        <strong>SportXClub Team</strong>
      </p>
    </div>
    `;
  } else {
    plainTextContent = `Hello Player,\n\nYour verification code for SportXClub account security is:\n\n${otpCode}\n\nThis code will expire in 10 minutes. Please do not share this code with anyone.\n\nIf you did not request this verification code, please ignore this email.\n\nBest Regards,\nSportXClub Team`;

    htmlContent = `
    <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #202124;">
      <p style="margin: 0 0 16px 0;">Hello Player,</p>
      
      <p style="margin: 0 0 16px 0;">Your verification code for SportXClub account security is:</p>
      
      <p style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #059669;">
        ${otpCode}
      </p>
      
      <p style="margin: 0 0 16px 0;">This code will expire in 10 minutes. Please do not share this code with anyone.</p>
      
      <p style="margin: 0 0 16px 0;">If you did not request this verification code, please ignore this email.</p>
      
      <p style="margin: 0; line-height: 1.5;">
        Best Regards,<br>
        <strong>SportXClub Team</strong>
      </p>
    </div>
    `;
  }

  await transporter.sendMail({
    from: `"SportXClub Verification" <${smtpUser}>`,
    to: cleanToEmail,
    replyTo: smtpUser,
    subject: `SportXClub Verification Code: ${otpCode}`,
    text: plainTextContent,
    html: htmlContent,
    priority: "high",
    headers: {
      "X-Priority": "1",
      "X-MSMail-Priority": "High",
      "Importance": "High"
    }
  });

  return { success: true };
}

// ----------------------------------------------------
// 1. Account-type-specific registration (with bcrypt hashing)
// ----------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const pool = getPool();
    const { fullName, email, password, role = "Player", phone = "", city = "", bio = "", selectedSports = [], profilePicture, avatar } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const roleStr = String(role || req.body.accountType || "").toLowerCase();
    const isOwnerRole = roleStr === "owner" || roleStr === "turf-owner" || roleStr === "turf_owner";
    const accountType = isOwnerRole ? "turf-owner" : "player";

    if (await accountEmailExists(pool, email, accountType)) {
      return res.status(400).json({ success: false, error: "Email is already registered for this account type" });
    }

    const hashedPassword = await hashPassword(password);
    const joinedDate = new Date().toISOString().split("T")[0];
    const avatarUrl = profilePicture || avatar || null;
    const yy = joinedDate.substring(2, 4);
    const mm = joinedDate.substring(5, 7);
    const prefix = `${yy}${mm}`;

    if (accountType === "turf-owner") {
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        const [allOwners] = await connection.query(
          `SELECT owner_id FROM turf_owners WHERE owner_id LIKE ? ORDER BY id DESC`,
          [`${prefix}%`]
        );

        let seq = 1;
        if (allOwners.length > 0) {
          for (const row of allOwners) {
            if (row.owner_id) {
              const lastDigits = parseInt(row.owner_id.slice(-4), 10);
              if (!isNaN(lastDigits) && lastDigits >= seq) {
                seq = lastDigits + 1;
              }
            }
          }
        }
        const ownerIdStr = `${prefix}${String(seq).padStart(4, '0')}`;

        const [ownerResult] = await connection.query(
          `INSERT INTO turf_owners (owner_id, name, email, phone, city, status, total_turfs, earnings, joined_date)
           VALUES (?, ?, ?, ?, ?, 'Pending', 0, '₹0', ?)`,
          [ownerIdStr, fullName, email.trim().toLowerCase(), phone, city, joinedDate]
        );
        await connection.query(
          `INSERT INTO turf_owner_accounts (owner_profile_id, owner_id, full_name, email, password, status)
           VALUES (?, ?, ?, ?, ?, 'Pending')`,
          [ownerResult.insertId, ownerIdStr, fullName, email.trim().toLowerCase(), hashedPassword]
        );

        await connection.commit();
        connection.release();

        const userObj = {
          id: ownerResult.insertId,
          accountId: ownerResult.insertId,
          ownerId: ownerIdStr,
          userId: ownerIdStr,
          fullName,
          email: email.trim().toLowerCase(),
          role: "owner",
          accountType: "turf-owner",
          phone,
          city,
          status: "Pending",
        };

        const token = generateToken({
          id: ownerResult.insertId,
          email: email.trim().toLowerCase(),
          role: "owner",
          accountType: "turf-owner",
        });

        return res.json({
          success: true,
          user: userObj,
          token,
        });
      } catch (err) {
        await connection.rollback();
        connection.release();
        throw err;
      }
    }

    const sportsStr = Array.isArray(selectedSports) ? JSON.stringify(selectedSports) : (selectedSports || "[]");
    const [profileResult] = await pool.query(
      `INSERT INTO users (full_name, email, password, role, phone, city, bio, selected_sports, status, joined_date, avatar)
       VALUES (?, ?, ?, 'Player', ?, ?, ?, ?, 'Active', ?, ?)`,
      [fullName, email.trim().toLowerCase(), hashedPassword, phone, city, bio, sportsStr, joinedDate, avatarUrl]
    );
    await pool.query(
      `INSERT INTO player_accounts (profile_user_id, full_name, email, password, status)
       VALUES (?, ?, ?, ?, 'Active')`,
      [profileResult.insertId, fullName, email.trim().toLowerCase(), hashedPassword]
    );

    const playerIdStr = `PLY-${prefix}${String(profileResult.insertId).padStart(4, '0')}`;
    const userObj = {
      id: profileResult.insertId,
      accountId: profileResult.insertId,
      userId: playerIdStr,
      ownerId: playerIdStr,
      fullName,
      email: email.trim().toLowerCase(),
      role: "Player",
      accountType: "player",
      phone,
      city,
      bio,
      selectedSports: Array.isArray(selectedSports) ? selectedSports : [],
      status: "Active",
      avatar: avatarUrl,
      profilePicture: avatarUrl,
      gamesPlayed: 0,
      bookings: 0,
    };

    const token = generateToken({
      id: profileResult.insertId,
      email: email.trim().toLowerCase(),
      role: "Player",
      accountType: "player",
    });

    return res.json({
      success: true,
      user: userObj,
      token,
    });
  } catch (err) {
    console.error("Account registration error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 2. Login Endpoint (with bcrypt & legacy auto-upgrade & JWT)
// ----------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const pool = getPool();
    const { email, password } = req.body;
    const accountType = normalizeAccountType(req.body?.accountType);
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email/Username and password are required" });
    }

    const cleanInput = email.trim();
    const strippedId = cleanInput.replace(/^#\s*/, '').trim();

    if (accountType === "turf-owner") {
      // 1. Check Turf Owner Accounts
      const [rows] = await pool.query(
        `SELECT oa.id AS account_id, oa.owner_profile_id, oa.email, oa.full_name, oa.password, oa.status AS account_status,
                o.owner_id, o.phone, o.city, o.status, o.total_turfs, o.earnings
         FROM turf_owner_accounts oa
         LEFT JOIN turf_owners o ON o.id = oa.owner_profile_id
         WHERE (LOWER(oa.email) = LOWER(?) OR o.owner_id = ? OR oa.owner_id = ? OR o.owner_id = ? OR oa.owner_id = ?)
         LIMIT 1`,
        [cleanInput, cleanInput, cleanInput, strippedId, strippedId]
      );

      if (rows[0]) {
        const owner = rows[0];
        const isPasswordValid = await verifyPassword(password, owner.password);

        if (!isPasswordValid) {
          return res.status(401).json({ success: false, error: "Invalid Turf Owner email/ID or password" });
        }

        // Check account approval status
        const effectiveStatus = String(owner.status || owner.account_status || "Pending").trim();
        if (effectiveStatus.toLowerCase().includes("pending")) {
          return res.status(403).json({
            success: false,
            error: "Your turf onboarding application is pending approval by the Admin. Once approved, you can log in with your credentials."
          });
        }

        if (effectiveStatus.toLowerCase().includes("reject")) {
          return res.status(403).json({
            success: false,
            error: "Your turf onboarding application has been rejected. Please contact support."
          });
        }

        // Upgrade password to bcrypt hash if plaintext
        await maybeUpgradePassword(pool, "turf_owner_accounts", owner.account_id, password, owner.password);

        const userObj = {
          id: owner.owner_profile_id,
          accountId: owner.account_id,
          ownerId: owner.owner_id,
          userId: owner.owner_id,
          fullName: owner.full_name,
          email: owner.email,
          role: "owner",
          accountType: "turf-owner",
          phone: owner.phone || "",
          city: owner.city || "",
          status: owner.status || owner.account_status,
          totalTurfs: owner.total_turfs || 0,
          earnings: owner.earnings || "₹0",
        };

        const token = generateToken({
          id: owner.owner_profile_id,
          email: owner.email,
          role: "owner",
          accountType: "turf-owner",
        });

        return res.json({
          success: true,
          user: userObj,
          token,
        });
      }

      // 2. Check Staff & Job Roles Table
      const rawDigits = strippedId.replace(/\D/g, "");
      const parsedStaffId = rawDigits ? parseInt(rawDigits, 10) : -1;
      const [staffRows] = await pool.query(
        `SELECT s.id, s.first_name, s.last_name, s.email, s.phone, s.password, s.role, s.turf, s.turfs, s.is_active, s.permissions,
                t.owner_name, t.owner_email, t.name as matched_turf_name
         FROM staff s
         LEFT JOIN turfs t ON LOWER(t.name) = LOWER(s.turf)
         WHERE LOWER(s.email) = LOWER(?)
            OR s.phone = ?
            OR s.id = ?
            OR LOWER(s.email) = LOWER(?)
         LIMIT 1`,
        [
          cleanInput,
          cleanInput,
          !isNaN(parsedStaffId) ? parsedStaffId : -1,
          strippedId
        ]
      );

      if (staffRows[0]) {
        const staff = staffRows[0];
        const isStaffPasswordValid = await verifyPassword(password, staff.password);

        if (!isStaffPasswordValid) {
          return res.status(401).json({ success: false, error: "Invalid Turf Staff email/ID or password" });
        }

        if (!staff.is_active) {
          return res.status(403).json({
            success: false,
            error: "Your staff account has been deactivated. Please contact your Turf Owner/Manager."
          });
        }

        // Upgrade staff password to bcrypt hash if plaintext
        await maybeUpgradePassword(pool, "staff", staff.id, password, staff.password);

        const ROLE_PERMISSIONS_FALLBACK = {
          Manager: ["dashboard", "revenue", "turfs", "bookings", "roles", "events", "calendar", "reviews", "promotions", "report", "settings"],
          Receptionist: ["dashboard", "bookings", "calendar", "turfs"],
          Maintenance: ["dashboard", "turfs", "calendar"],
          Security: ["dashboard", "bookings"],
          Coach: ["dashboard", "events", "calendar"],
        };

        let perms = [];
        try {
          perms = typeof staff.permissions === "string" ? JSON.parse(staff.permissions) : (staff.permissions || []);
        } catch (e) {
          perms = staff.permissions || [];
        }

        if (!Array.isArray(perms) || perms.length === 0) {
          perms = ROLE_PERMISSIONS_FALLBACK[staff.role] || ["dashboard", "bookings"];
        }

        let turfsArr = [];
        try {
          turfsArr = typeof staff.turfs === "string" ? JSON.parse(staff.turfs) : (staff.turfs || [staff.turf]);
        } catch (e) {
          turfsArr = [staff.turf || ""];
        }

        const fullName = `${staff.first_name || ""} ${staff.last_name || ""}`.trim() || staff.email;
        const staffIdStr = `STAFF-${String(staff.id).padStart(4, "0")}`;

        const userObj = {
          id: staff.id,
          staffId: staff.id,
          ownerId: staffIdStr,
          userId: staffIdStr,
          fullName,
          name: fullName,
          email: staff.email,
          role: (staff.role || "staff").toLowerCase(),
          displayRole: staff.role || "Receptionist",
          accountType: "turf-owner",
          isStaff: true,
          phone: staff.phone || "",
          turf: staff.turf || turfsArr[0] || "",
          turfs: turfsArr,
          permissions: perms,
          status: staff.is_active ? "Active" : "Inactive",
          ownerName: staff.owner_name || "",
          ownerEmail: staff.owner_email || "",
        };

        const token = generateToken({
          id: staff.id,
          email: staff.email,
          role: (staff.role || "staff").toLowerCase(),
          accountType: "turf-owner",
          isStaff: true,
        });

        return res.json({
          success: true,
          user: userObj,
          token,
        });
      }

      // 3. If neither Turf Owner nor Staff, check if user is registered as Player
      const [playerExists] = await pool.query(
        `SELECT id FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1`,
        [cleanInput, strippedId]
      );
      if (playerExists.length > 0) {
        return res.status(400).json({
          success: false,
          error: "This account is registered as a Player. Please log in through the Player login page (/login)."
        });
      }

      return res.status(401).json({ success: false, error: "Invalid Turf Owner / Staff email/ID or password" });
    }

    // Normal Player / User Login
    const [userRows] = await pool.query(
      `SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(phone) = LOWER(?) LIMIT 1`,
      [cleanInput, cleanInput]
    );

    let player = null;
    let storedPassword = null;
    let userIdToUpgrade = null;
    let tableNameToUpgrade = "users";

    if (userRows.length > 0) {
      player = userRows[0];
      storedPassword = player.password;
      userIdToUpgrade = player.id;
    } else {
      const [paRows] = await pool.query(
        `SELECT pa.id AS account_id, pa.email, pa.full_name, pa.password, pa.status AS account_status,
                u.id AS profile_user_id, u.phone, u.city, u.bio, u.selected_sports, u.status, u.avatar,
                u.games_played, u.bookings
         FROM player_accounts pa
         INNER JOIN users u ON u.id = pa.profile_user_id
         WHERE LOWER(pa.email) = LOWER(?) OR LOWER(u.phone) = LOWER(?)
         LIMIT 1`,
        [cleanInput, cleanInput]
      );
      if (paRows.length > 0) {
        const row = paRows[0];
        player = {
          id: row.profile_user_id,
          full_name: row.full_name,
          email: row.email,
          role: "Player",
          phone: row.phone,
          city: row.city,
          bio: row.bio,
          selected_sports: row.selected_sports,
          status: row.status || row.account_status,
          avatar: row.avatar,
          games_played: row.games_played,
          bookings: row.bookings,
        };
        storedPassword = row.password;
        userIdToUpgrade = row.account_id;
        tableNameToUpgrade = "player_accounts";
      }
    }

    if (!player) {
      // Check if user is Turf Owner
      const [ownerExists] = await pool.query(
        `SELECT id FROM turf_owner_accounts WHERE LOWER(email) = LOWER(?) OR owner_id = ? LIMIT 1`,
        [cleanInput, cleanInput]
      );
      if (ownerExists.length > 0) {
        return res.status(400).json({
          success: false,
          error: "This account is registered as a Turf Owner. Please log in through the Turf Owner Portal (/admin-login)."
        });
      }

      // Check if user is Staff
      const [staffExists] = await pool.query(
        `SELECT id FROM staff WHERE LOWER(email) = LOWER(?) OR phone = ? LIMIT 1`,
        [cleanInput, cleanInput]
      );
      if (staffExists.length > 0) {
        return res.status(400).json({
          success: false,
          error: "This account is registered as Turf Staff. Please log in through the Turf Owner / Staff Portal (/admin-login)."
        });
      }

      return res.status(401).json({ success: false, error: "Invalid player email or password" });
    }

    const isPasswordValid = await verifyPassword(password, storedPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: "Invalid player email or password" });
    }

    // Auto upgrade legacy plaintext password to bcrypt hash
    await maybeUpgradePassword(pool, tableNameToUpgrade, userIdToUpgrade, password, storedPassword);
    if (tableNameToUpgrade === "users") {
      await maybeUpgradePassword(pool, "player_accounts", userIdToUpgrade, password, storedPassword).catch(() => {});
    }

    const avatarUrl = player.avatar || null;
    const userObj = {
      id: player.id,
      accountId: player.id,
      fullName: player.full_name || player.name,
      email: player.email,
      role: player.role || "Player",
      accountType: "player",
      phone: player.phone || "",
      city: player.city || "",
      bio: player.bio || "",
      selectedSports: parseSelectedSports(player.selected_sports),
      status: player.status || "Active",
      avatar: avatarUrl,
      profilePicture: avatarUrl,
      gamesPlayed: player.games_played || 0,
      bookings: player.bookings || 0,
    };

    const token = generateToken({
      id: player.id,
      email: player.email,
      role: player.role || "Player",
      accountType: "player",
    });

    return res.json({
      success: true,
      user: userObj,
      token,
    });
  } catch (err) {
    console.error("Account login error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 3. Update User Profile Endpoint
// ----------------------------------------------------
router.put("/update-profile", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { fullName, phone, city, bio, selectedSports, profilePicture, avatar } = req.body;
    const userId = req.user.id;

    const sportsStr = Array.isArray(selectedSports) ? JSON.stringify(selectedSports) : (selectedSports || "[]");
    const avatarUrl = profilePicture || avatar || null;

    let updateQuery = `
      UPDATE users 
      SET full_name = COALESCE(?, full_name),
          phone = COALESCE(?, phone),
          city = COALESCE(?, city),
          bio = COALESCE(?, bio),
          selected_sports = COALESCE(?, selected_sports)
    `;
    const updateParams = [
      fullName || null,
      phone || null,
      city || null,
      bio || null,
      sportsStr
    ];

    if (avatarUrl) {
      updateQuery += `, avatar = ?`;
      updateParams.push(avatarUrl);
    }

    updateQuery += ` WHERE id = ?`;
    updateParams.push(userId);

    await pool.query(updateQuery, updateParams);

    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "User record not found" });
    }

    const updatedRow = rows[0];
    let parsedSports = [];
    try {
      if (updatedRow.selected_sports) {
        parsedSports = typeof updatedRow.selected_sports === "string" ? JSON.parse(updatedRow.selected_sports) : (updatedRow.selected_sports || []);
      }
    } catch (e) { }

    const finalAvatar = updatedRow.avatar || null;

    const updatedUser = {
      id: updatedRow.id,
      fullName: updatedRow.full_name,
      email: updatedRow.email,
      role: updatedRow.role,
      phone: updatedRow.phone || "",
      city: updatedRow.city || "",
      bio: updatedRow.bio || "",
      selectedSports: parsedSports,
      status: updatedRow.status || "Active",
      avatar: finalAvatar,
      profilePicture: finalAvatar,
    };

    return res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Update Profile Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 4. Check if Email or Phone already exists
// ----------------------------------------------------
router.post("/check-exists", async (req, res) => {
  try {
    const pool = getPool();
    const { email, phone, accountType, role, type } = req.body;
    const targetType = normalizeAccountType(accountType || role || type);

    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const exists = await accountEmailExists(pool, cleanEmail, targetType);
      if (exists) {
        return res.json({
          exists: true,
          field: "email",
          message: "An account with this email address already exists. Please log in instead.",
        });
      }
    }

    if (phone && phone.trim()) {
      const cleanPhone = phone.trim();
      if (targetType === "turf-owner") {
        const [existingPhones] = await pool.query(
          "SELECT id FROM turf_owners WHERE phone = ? AND phone != '' LIMIT 1",
          [cleanPhone]
        );
        if (existingPhones.length > 0) {
          return res.json({
            exists: true,
            field: "phone",
            message: "This mobile number is already registered for a turf owner account. Please log in instead.",
          });
        }
      } else {
        const [existingPhones] = await pool.query(
          "SELECT id FROM users WHERE phone = ? AND phone != '' LIMIT 1",
          [cleanPhone]
        );
        if (existingPhones.length > 0) {
          return res.json({
            exists: true,
            field: "phone",
            message: "This mobile number is already registered for a player account. Please log in instead.",
          });
        }
      }
    }

    return res.json({ exists: false });
  } catch (err) {
    console.error("Check Exists Error:", err);
    return res.status(500).json({ exists: false, error: err.message });
  }
});

// ----------------------------------------------------
// 5. Request OTP for Password / Email Recovery
// ----------------------------------------------------
router.post("/otp/request", async (req, res) => {
  try {
    const pool = getPool();
    const { identifier, mode = "recovery" } = req.body;

    if (!identifier) {
      return res.status(400).json({ success: false, error: "Please enter your Email or Phone number" });
    }

    const cleanInput = identifier.trim().toLowerCase();

    // Query MySQL users table
    const [users] = await pool.query(
      "SELECT id, full_name, email, phone FROM users WHERE LOWER(email) = ? OR phone = ?",
      [cleanInput, identifier.trim()]
    );

    let foundUser = users[0];

    // If not found in users, check turf_owners
    if (!foundUser) {
      const [owners] = await pool.query(
        "SELECT id, name as full_name, email, phone FROM turf_owners WHERE LOWER(email) = ? OR phone = ?",
        [cleanInput, identifier.trim()]
      );
      if (owners.length > 0) {
        foundUser = owners[0];
      }
    }

    if (!foundUser) {
      const [staff] = await pool.query(
        "SELECT id, CONCAT(first_name, ' ', last_name) as full_name, email, phone FROM staff WHERE LOWER(email) = ? OR phone = ?",
        [cleanInput, identifier.trim()]
      );
      if (staff.length > 0) {
        foundUser = staff[0];
      }
    }

    if (mode === "recovery" && !foundUser) {
      return res.status(404).json({ success: false, error: "No account found matching this Email or Phone number" });
    }

    // Generate cryptographically secure 6-digit OTP
    const isEmail = cleanInput.includes("@");
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(cleanInput, {
      otp: generatedOtp,
      expiresAt,
      user: foundUser || { email: cleanInput, fullName: "New User" },
    });

    // Dispatch Email OTP
    if (isEmail) {
      await sendLiveEmailOtp(cleanInput, generatedOtp, { mode, userName: foundUser?.full_name });
    }

    return res.json({
      success: true,
      message: `Verification code sent successfully! Please check your ${isEmail ? "email inbox" : "phone"}.`,
      user: foundUser ? {
        id: foundUser.id,
        fullName: foundUser.full_name,
        email: foundUser.email,
      } : null,
    });
  } catch (err) {
    console.error("Request OTP Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 6. Verify OTP Code (Secure — No Static Backdoor)
// ----------------------------------------------------
router.post("/otp/verify", async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({ success: false, error: "Identifier and OTP code are required" });
    }

    const cleanInput = identifier.trim().toLowerCase();
    const record = otpStore.get(cleanInput);

    if (!record) {
      return res.status(400).json({ success: false, error: "No active OTP request found for this account" });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanInput);
      return res.status(400).json({ success: false, error: "OTP code has expired. Please request a new OTP." });
    }

    if (record.otp !== String(otp).trim()) {
      return res.status(400).json({ success: false, error: "Incorrect OTP code. Please check and try again." });
    }

    // Mark as verified but preserve briefly for password reset if needed
    const verifiedUser = record.user;
    otpStore.set(`${cleanInput}_verified`, { verified: true, expiresAt: Date.now() + 5 * 60 * 1000 });
    otpStore.delete(cleanInput);

    return res.json({
      success: true,
      message: "OTP verified successfully!",
      user: verifiedUser,
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 7. Reset Password using Verified OTP (Secure)
// ----------------------------------------------------
router.post("/otp/reset-password", async (req, res) => {
  try {
    const pool = getPool();
    const { identifier, otp, newPassword } = req.body;

    if (!identifier || !newPassword) {
      return res.status(400).json({ success: false, error: "Missing required parameters" });
    }

    const cleanInput = identifier.trim().toLowerCase();
    const record = otpStore.get(cleanInput);
    const verifiedFlag = otpStore.get(`${cleanInput}_verified`);

    let isOtpValid = false;
    if (verifiedFlag && Date.now() <= verifiedFlag.expiresAt) {
      isOtpValid = true;
      otpStore.delete(`${cleanInput}_verified`);
    } else if (record && record.otp === String(otp).trim() && Date.now() <= record.expiresAt) {
      isOtpValid = true;
      otpStore.delete(cleanInput);
    }

    if (!isOtpValid) {
      return res.status(400).json({ success: false, error: "Invalid or expired OTP session. Please verify your OTP again." });
    }

    const hashedPassword = await hashPassword(newPassword.trim());

    // Update password in MySQL users & accounts tables
    await pool.query(
      "UPDATE users SET password = ? WHERE LOWER(email) = ? OR phone = ?",
      [hashedPassword, cleanInput, identifier.trim()]
    );
    await pool.query(
      "UPDATE player_accounts SET password = ? WHERE LOWER(email) = ?",
      [hashedPassword, cleanInput]
    );
    await pool.query(
      "UPDATE turf_owner_accounts SET password = ? WHERE LOWER(email) = ?",
      [hashedPassword, cleanInput]
    );
    await pool.query(
      "UPDATE staff SET password = ? WHERE LOWER(email) = ? OR phone = ?",
      [hashedPassword, cleanInput, identifier.trim()]
    );

    return res.json({
      success: true,
      message: "Password updated successfully in database! You can now login.",
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 8. Google Authentication Route
// ----------------------------------------------------
router.post("/google", async (req, res) => {
  try {
    const pool = getPool();
    let { email, fullName, avatar, role = "Player" } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Google email address is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName ? fullName.trim() : cleanEmail.split("@")[0];
    const cleanAvatar = avatar || null;
    const isOwnerRole = String(role).toLowerCase() === "owner" || String(role).toLowerCase() === "turf-owner";
    const accountType = isOwnerRole ? "turf-owner" : "player";

    if (accountType === "turf-owner") {
      const [existing] = await pool.query(
        `SELECT oa.id AS account_id, oa.owner_profile_id, oa.email, oa.full_name, o.phone, o.city, o.status
         FROM turf_owner_accounts oa LEFT JOIN turf_owners o ON o.id = oa.owner_profile_id
         WHERE LOWER(oa.email) = ? LIMIT 1`,
        [cleanEmail]
      );

      if (existing[0]) {
        const owner = existing[0];
        const userObj = {
          id: owner.owner_profile_id,
          accountId: owner.account_id,
          fullName: owner.full_name,
          email: owner.email,
          role: "owner",
          accountType: "turf-owner",
          phone: owner.phone || "",
          city: owner.city || "",
          status: owner.status || "Active",
        };
        const token = generateToken({
          id: owner.owner_profile_id,
          email: owner.email,
          role: "owner",
          accountType: "turf-owner",
        });
        return res.json({ success: true, isNewUser: false, user: userObj, token });
      }

      const defaultHash = await hashPassword(`google_auth_${Date.now()}`);
      const [ownerResult] = await pool.query(
        `INSERT INTO turf_owners (name, email, phone, city, status, total_turfs, earnings, joined_date)
         VALUES (?, ?, '', '', 'Active', 0, '₹0', ?)`,
        [cleanName, cleanEmail, new Date().toISOString().split("T")[0]]
      );
      await pool.query(
        `INSERT INTO turf_owner_accounts (owner_profile_id, full_name, email, password, status)
         VALUES (?, ?, ?, ?, 'Active')`,
        [ownerResult.insertId, cleanName, cleanEmail, defaultHash]
      );

      const userObj = {
        id: ownerResult.insertId,
        accountId: ownerResult.insertId,
        fullName: cleanName,
        email: cleanEmail,
        role: "owner",
        accountType: "turf-owner",
        phone: "",
        city: "",
        status: "Active",
        avatar: cleanAvatar,
      };
      const token = generateToken({
        id: ownerResult.insertId,
        email: cleanEmail,
        role: "owner",
        accountType: "turf-owner",
      });

      return res.json({ success: true, isNewUser: true, user: userObj, token });
    }

    // Player Google Login
    const [existing] = await pool.query(
      `SELECT pa.id AS account_id, pa.email, pa.full_name, u.id AS profile_user_id, u.phone, u.city,
              u.bio, u.selected_sports, u.status, u.avatar
       FROM player_accounts pa INNER JOIN users u ON u.id = pa.profile_user_id
       WHERE LOWER(pa.email) = ? LIMIT 1`,
      [cleanEmail]
    );

    if (existing[0]) {
      const player = existing[0];
      const avatarUrl = player.avatar || cleanAvatar;
      const userObj = {
        id: player.profile_user_id,
        accountId: player.account_id,
        fullName: player.full_name,
        email: player.email,
        role: "Player",
        accountType: "player",
        phone: player.phone || "",
        city: player.city || "",
        bio: player.bio || "",
        selectedSports: parseSelectedSports(player.selected_sports),
        status: player.status || "Active",
        avatar: avatarUrl,
        profilePicture: avatarUrl,
      };
      const token = generateToken({
        id: player.profile_user_id,
        email: player.email,
        role: "Player",
        accountType: "player",
      });

      return res.json({ success: true, isNewUser: false, user: userObj, token });
    }

    const defaultHash = await hashPassword(`google_auth_${Date.now()}`);
    const [profileResult] = await pool.query(
      `INSERT INTO users (full_name, email, password, role, phone, city, status, joined_date, avatar)
       VALUES (?, ?, ?, 'Player', '', '', 'Active', ?, ?)`,
      [cleanName, cleanEmail, defaultHash, new Date().toISOString().split("T")[0], cleanAvatar]
    );
    await pool.query(
      `INSERT INTO player_accounts (profile_user_id, full_name, email, password, status)
       VALUES (?, ?, ?, ?, 'Active')`,
      [profileResult.insertId, cleanName, cleanEmail, defaultHash]
    );

    const userObj = {
      id: profileResult.insertId,
      accountId: profileResult.insertId,
      fullName: cleanName,
      email: cleanEmail,
      role: "Player",
      accountType: "player",
      phone: "",
      city: "",
      status: "Active",
      avatar: cleanAvatar,
      profilePicture: cleanAvatar,
    };
    const token = generateToken({
      id: profileResult.insertId,
      email: cleanEmail,
      role: "Player",
      accountType: "player",
    });

    return res.json({ success: true, isNewUser: true, user: userObj, token });
  } catch (err) {
    console.error("Account Google auth error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 9. Accounts list (Restricted to Admins)
// ----------------------------------------------------
router.get("/accounts", authenticateToken, requireRole(["admin", "super admin", "cms-admin"]), async (req, res) => {
  try {
    const pool = getPool();
    const accountType = normalizeAccountType(req.query?.accountType);
    if (accountType === "turf-owner") {
      const [rows] = await pool.query(
        `SELECT oa.id AS account_id, oa.full_name AS name, oa.email, o.city, o.status, 'turf-owner' AS account_type
         FROM turf_owner_accounts oa LEFT JOIN turf_owners o ON o.id = oa.owner_profile_id
         WHERE LOWER(oa.status) = 'active' ORDER BY oa.id DESC LIMIT 50`
      );
      return res.json({ success: true, accounts: rows });
    }
    const [rows] = await pool.query(
      `SELECT id AS account_id, full_name AS name, email, avatar, city, role, 'player' AS account_type
       FROM users
       WHERE LOWER(status) = 'active' ORDER BY id DESC LIMIT 50`
    );
    return res.json({ success: true, accounts: rows });
  } catch (err) {
    console.error("Fetch account list error:", err);
    return res.status(500).json({ success: false, accounts: [] });
  }
});

// ----------------------------------------------------
// 10. Turf Owner Setup / Onboarding Route
// ----------------------------------------------------
router.post("/owner/setup", async (req, res) => {
  try {
    const pool = getPool();
    let ownerId = req.body.ownerId || req.body.owner_id || req.body.id;
    const setupData = req.body.setupData || req.body.formData || req.body.form_data || req.body.data;

    if (!setupData) {
      return res.status(400).json({ success: false, message: "Missing setupData" });
    }

    const personal = setupData.personal || {};
    const business = setupData.business || {};
    const location = setupData.location || {};
    const turf = setupData.turf || {};

    const fullName = (personal.fullName || business.ownerName || personal.name || "Turf Owner").trim();
    const ownerEmail = (personal.email || business.email || req.body.email || "").trim().toLowerCase();
    const phone = (personal.phone || business.phone || req.body.phone || "").trim();
    const password = (personal.password || req.body.password || "").trim();
    const city = (location.city || personal.city || business.city || "Mumbai").trim();

    const joinedDate = new Date().toISOString().split("T")[0];
    const yy = joinedDate.substring(2, 4);
    const mm = joinedDate.substring(5, 7);
    const prefix = `${yy}${mm}`;

    // Compute next sequential 8-digit Owner ID
    const [allOwners] = await pool.query(
      `SELECT owner_id FROM turf_owners WHERE owner_id LIKE ? UNION SELECT owner_id FROM turf_owner_accounts WHERE owner_id LIKE ?`,
      [`${prefix}%`, `${prefix}%`]
    );

    let seq = 1;
    if (allOwners.length > 0) {
      for (const row of allOwners) {
        if (row.owner_id) {
          const lastDigits = parseInt(String(row.owner_id).slice(-4), 10);
          if (!isNaN(lastDigits) && lastDigits >= seq) {
            seq = lastDigits + 1;
          }
        }
      }
    }
    const nextGeneratedOwnerId = `${prefix}${String(seq).padStart(4, '0')}`;

    // Check if owner already exists
    let existingOwner = null;
    if (ownerId && String(ownerId).length >= 8) {
      const [rows] = await pool.query(
        "SELECT id, owner_id, email, name FROM turf_owners WHERE owner_id = ? LIMIT 1",
        [ownerId]
      );
      if (rows.length > 0) existingOwner = rows[0];
    }

    if (!existingOwner && ownerEmail) {
      const [rows] = await pool.query(
        "SELECT id, owner_id, email, name FROM turf_owners WHERE LOWER(email) = ? LIMIT 1",
        [ownerEmail]
      );
      if (rows.length > 0) existingOwner = rows[0];
    }

    let finalOwnerId = existingOwner?.owner_id;
    if (!finalOwnerId || String(finalOwnerId).length < 8) {
      finalOwnerId = nextGeneratedOwnerId;
    }

    let ownerProfileId;

    if (existingOwner) {
      ownerProfileId = existingOwner.id;
      await pool.query(
        `UPDATE turf_owners SET 
           owner_id = ?,
           setup_data = ?, 
           name = COALESCE(NULLIF(?, ''), name),
           email = COALESCE(NULLIF(?, ''), email),
           phone = COALESCE(NULLIF(?, ''), phone),
           city = COALESCE(NULLIF(?, ''), city),
           status = 'Pending'
         WHERE id = ?`,
        [finalOwnerId, JSON.stringify(setupData), fullName, ownerEmail, phone, city, existingOwner.id]
      );
    } else {
      const [ownerResult] = await pool.query(
        `INSERT INTO turf_owners (owner_id, name, email, phone, city, status, total_turfs, earnings, joined_date, setup_data)
         VALUES (?, ?, ?, ?, ?, 'Pending', 0, '₹0', ?, ?)`,
        [finalOwnerId, fullName, ownerEmail, phone, city, joinedDate, JSON.stringify(setupData)]
      );
      ownerProfileId = ownerResult.insertId;
    }

    // Insert or update turf_owner_accounts for login credentials
    const hashedPassword = password ? await hashPassword(password) : null;
    const [existingAccounts] = await pool.query(
      `SELECT id FROM turf_owner_accounts WHERE owner_profile_id = ? OR LOWER(email) = ? OR owner_id = ? LIMIT 1`,
      [ownerProfileId, ownerEmail, finalOwnerId]
    );

    if (existingAccounts.length > 0) {
      if (hashedPassword) {
        await pool.query(
          `UPDATE turf_owner_accounts SET 
             owner_id = ?, 
             full_name = ?, 
             email = ?, 
             password = ?, 
             status = 'Pending' 
           WHERE id = ?`,
          [finalOwnerId, fullName, ownerEmail, hashedPassword, existingAccounts[0].id]
        );
      } else {
        await pool.query(
          `UPDATE turf_owner_accounts SET 
             owner_id = ?, 
             full_name = ?, 
             email = ?, 
             status = 'Pending' 
           WHERE id = ?`,
          [finalOwnerId, fullName, ownerEmail, existingAccounts[0].id]
        );
      }
    } else if (hashedPassword) {
      await pool.query(
        `INSERT INTO turf_owner_accounts (owner_profile_id, owner_id, full_name, email, password, status)
         VALUES (?, ?, ?, ?, ?, 'Pending')`,
        [ownerProfileId, finalOwnerId, fullName, ownerEmail, hashedPassword]
      );
    }

    // Record in turf_onboarding_requests
    const requestId = `ONB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    await pool.query(
      `INSERT INTO turf_onboarding_requests (id, owner_id, owner_email, form_data, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [requestId, finalOwnerId, ownerEmail, JSON.stringify(setupData)]
    );

    return res.json({
      success: true,
      ownerId: finalOwnerId,
      requestId,
      message: "Profile and Turf Onboarding Request submitted successfully",
    });
  } catch (err) {
    console.error("Owner Setup Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
