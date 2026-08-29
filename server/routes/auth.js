import express from "express";
import { getPool } from "../db.js";
import nodemailer from "nodemailer";

const router = express.Router();

// In-memory OTP Store for password/email recovery (key: identifier -> { otp, expiresAt, user })
const otpStore = new Map();

function normalizeAccountType(value) {
  return String(value || "player").toLowerCase() === "owner" || String(value || "").toLowerCase() === "turf-owner"
    ? "turf-owner"
    : "player";
}

async function accountEmailExists(pool, email, targetAccountType = "player") {
  const cleanEmail = email.trim().toLowerCase();
  const accType = normalizeAccountType(targetAccountType);
  if (accType === "turf-owner") {
    const [ownerRows] = await pool.query(
      "SELECT id FROM turf_owners WHERE LOWER(email) = ? UNION SELECT id FROM turf_owner_accounts WHERE LOWER(email) = ? LIMIT 1",
      [cleanEmail, cleanEmail]
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
async function sendLiveEmailOtp(toEmail, otpCode, userName = "Athlete") {
  try {
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; background-color: #0d1117; border-radius: 20px; color: #ffffff; border: 1px solid #21262d;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #21262d;">
          <h1 style="color: #10b981; font-size: 30px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">SportXClub</h1>
          <p style="color: #8b949e; font-size: 11px; margin-top: 4px; font-weight: 700; letter-spacing: 2px;">YOUR ULTIMATE SPORTS ARENA PORTAL</p>
        </div>
        
        <div style="padding: 24px 0;">
          <h2 style="font-size: 18px; color: #f0f6fc; margin-bottom: 12px;">Hello ${userName},</h2>
          <p style="color: #c9d1d9; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            Your verification code for SportXClub account security is:
          </p>
          
          <div style="background-color: #161b22; border: 1px solid #30363d; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #10b981;">
              ${otpCode}
            </span>
          </div>
          
          <p style="color: #8b949e; font-size: 12px; line-height: 1.5;">
            This code will expire in <strong>10 minutes</strong>. If you did not request this verification code, please ignore this email.
          </p>
        </div>
        
        <div style="border-top: 1px solid #21262d; pt: 16px; text-align: center; color: #8b949e; font-size: 11px;">
          <p>© 2026 SportXClub. All rights reserved.</p>
        </div>
      </div>
    `;

    transporter.sendMail({
      from: `"SportXClub Verification" <${smtpUser}>`,
      to: toEmail,
      subject: `[SportXClub] Your Verification Code is ${otpCode}`,
      html: htmlContent,
    }).then((info) => {
      console.log(`[NODEMAILER] Live Email OTP dispatched to ${toEmail} (MessageId: ${info.messageId})`);
    }).catch((error) => {
      console.warn(`[NODEMAILER DISPATCH] Email OTP notice for ${toEmail}: ${error.message}`);
    });

    return { success: true };
  } catch (error) {
    console.warn(`[NODEMAILER SETUP] ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Helper function for static Mobile SMS OTP (FAST2SMS API integration removed)
async function sendStaticSmsOtp(phoneNumber, otpCode = "123456") {
  console.log(`================================================================`);
  console.log(`[MOBILE SMS OTP - STATIC MODE] Mobile: ${phoneNumber} | Static OTP Code: ${otpCode}`);
  console.log(`================================================================`);
  return { success: true };
}

// Account-type-specific registration.
router.post("/register", async (req, res) => {
  try {
    const pool = getPool();
    const { fullName, email, password, role = "Player", phone = "", city = "", bio = "", selectedSports = [], profilePicture, avatar } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const accountType = String(role).toLowerCase() === "owner" ? "turf-owner" : "player";

    if (await accountEmailExists(pool, email, accountType)) {
      return res.status(400).json({ success: false, error: "Email is already registered for this account type" });
    }

    const joinedDate = new Date().toISOString().split("T")[0];
    const avatarUrl = profilePicture || avatar || null;

    if (accountType === "turf-owner") {
      const yy = joinedDate.substring(2, 4);
      const mm = joinedDate.substring(5, 7);
      const prefix = `${yy}${mm}`;

      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        const [latest] = await connection.query(
          `SELECT owner_id FROM turf_owners WHERE owner_id LIKE ? ORDER BY owner_id DESC LIMIT 1 FOR UPDATE`,
          [`${prefix}%`]
        );

        let seq = 1;
        if (latest.length > 0 && latest[0].owner_id) {
          const lastSeq = parseInt(latest[0].owner_id.slice(-4), 10);
          if (!isNaN(lastSeq)) {
            seq = lastSeq + 1;
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
          [ownerResult.insertId, ownerIdStr, fullName, email.trim().toLowerCase(), password]
        );

        await connection.commit();
        connection.release();

        return res.json({
          success: true,
          user: {
            id: ownerResult.insertId,
            accountId: ownerResult.insertId,
            ownerId: ownerIdStr,
            fullName,
            email: email.trim().toLowerCase(),
            role: "owner",
            accountType,
            phone,
            city,
            status: "Pending",
          },
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
      [fullName, email.trim().toLowerCase(), password, phone, city, bio, sportsStr, joinedDate, avatarUrl]
    );
    await pool.query(
      `INSERT INTO player_accounts (profile_user_id, full_name, email, password, status)
       VALUES (?, ?, ?, ?, 'Active')`,
      [profileResult.insertId, fullName, email.trim().toLowerCase(), password]
    );
    return res.json({
      success: true,
      user: {
        id: profileResult.insertId,
        accountId: profileResult.insertId,
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
      },
    });
  } catch (err) {
    console.error("Account registration error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const pool = getPool();
    const { email, password } = req.body;
    const accountType = normalizeAccountType(req.body?.accountType);
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email/Username and password are required" });
    }

    if (accountType === "turf-owner") {
      const [rows] = await pool.query(
        `SELECT oa.id AS account_id, oa.owner_profile_id, oa.email, oa.full_name, oa.status AS account_status,
                o.owner_id, o.phone, o.city, o.status, o.total_turfs, o.earnings
         FROM turf_owner_accounts oa
         LEFT JOIN turf_owners o ON o.id = oa.owner_profile_id
         WHERE (LOWER(oa.email) = LOWER(?) OR o.owner_id = ?) AND oa.password = ? AND LOWER(oa.status) = 'active'
         LIMIT 1`,
        [email.trim(), email.trim(), password.trim()]
      );
      if (!rows[0]) return res.status(401).json({ success: false, error: "Invalid turf-owner credentials" });
      const owner = rows[0];
      return res.json({
        success: true,
        user: {
          id: owner.owner_profile_id,
          accountId: owner.account_id,
          ownerId: owner.owner_id,
          fullName: owner.full_name,
          email: owner.email,
          role: "owner",
          accountType,
          phone: owner.phone || "",
          city: owner.city || "",
          status: owner.status || owner.account_status,
          totalTurfs: owner.total_turfs || 0,
          earnings: owner.earnings || "₹0",
        },
      });
    }

    // Normal Player / User Login (Strictly queries `users` table)
    let player = null;
    const [userRows] = await pool.query(
      `SELECT * FROM users WHERE (LOWER(email) = LOWER(?) OR LOWER(phone) = LOWER(?)) AND password = ? LIMIT 1`,
      [email.trim(), email.trim(), password.trim()]
    );

    if (userRows.length > 0) {
      player = userRows[0];
    } else {
      const [paRows] = await pool.query(
        `SELECT pa.id AS account_id, pa.email, pa.full_name, pa.status AS account_status,
                u.id AS profile_user_id, u.phone, u.city, u.bio, u.selected_sports, u.status, u.avatar,
                u.games_played, u.bookings
         FROM player_accounts pa
         INNER JOIN users u ON u.id = pa.profile_user_id
         WHERE (LOWER(pa.email) = LOWER(?) OR LOWER(u.phone) = LOWER(?)) AND pa.password = ? AND LOWER(pa.status) = 'active'
         LIMIT 1`,
        [email.trim(), email.trim(), password.trim()]
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
      }
    }

    if (!player) {
      return res.status(401).json({ success: false, error: "Invalid player email or password" });
    }

    const avatarUrl = player.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(player.email)}`;
    return res.json({
      success: true,
      user: {
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
      },
    });
  } catch (err) {
    console.error("Account login error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// Update User Profile Endpoint (Save to MySQL Database)
// ----------------------------------------------------
router.put("/update-profile", async (req, res) => {
  try {
    const pool = getPool();
    const { id, email, fullName, phone, city, bio, selectedSports, profilePicture, avatar } = req.body;

    if (!id && !email) {
      return res.status(400).json({ success: false, error: "User ID or Email is required" });
    }

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

    if (id) {
      updateQuery += ` WHERE id = ?`;
      updateParams.push(id);
    } else {
      updateQuery += ` WHERE LOWER(email) = LOWER(?)`;
      updateParams.push(email.trim());
    }

    await pool.query(updateQuery, updateParams);

    // Fetch updated user row from MySQL
    const selectQuery = id ? "SELECT * FROM users WHERE id = ?" : "SELECT * FROM users WHERE LOWER(email) = LOWER(?)";
    const selectParam = id || email.trim();
    const [rows] = await pool.query(selectQuery, [selectParam]);

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

    const finalAvatar = updatedRow.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(updatedRow.email)}`;

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

    console.log(`[PROFILE UPDATE] MySQL User #${updatedRow.id} (${updatedRow.email}) updated successfully.`);

    return res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Update Profile Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// Check if Email or Phone already exists in Database
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
// 3. Request OTP for Password / Email Recovery & Registration
// ----------------------------------------------------
router.post("/otp/request", async (req, res) => {
  try {
    const pool = getPool();
    const { identifier, mode = "recovery" } = req.body; // email or phone

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

    // If not found in users, check staff table
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

    // Generate 6-digit OTP (Random 6-digit for Email, Static "123456" for Mobile Number)
    const isEmail = cleanInput.includes("@");
    const generatedOtp = isEmail
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : "123456";
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(cleanInput, {
      otp: generatedOtp,
      expiresAt,
      user: foundUser || { email: cleanInput, fullName: "New User" },
    });

    console.log(`[OTP DISPATCH] (${mode}) For ${cleanInput} -> Code: ${generatedOtp}`);

    // Dispatch Email or Static Mobile SMS OTP
    if (isEmail) {
      await sendLiveEmailOtp(cleanInput, generatedOtp, foundUser?.full_name || "Athlete");
    } else {
      await sendStaticSmsOtp(cleanInput, generatedOtp);
    }

    return res.json({
      success: true,
      otp: generatedOtp,
      message: isEmail
        ? `Verification code sent to your Gmail inbox!`
        : `Static OTP code (123456) generated for mobile number!`,
      user: foundUser ? {
        id: foundUser.id,
        fullName: foundUser.full_name,
        email: foundUser.email,
        phone: foundUser.phone,
      } : null,
    });
  } catch (err) {
    console.error("Request OTP Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 4. Verify OTP Code
// ----------------------------------------------------
router.post("/otp/verify", async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({ success: false, error: "Identifier and OTP code are required" });
    }

    const cleanInput = identifier.trim().toLowerCase();
    const isEmail = cleanInput.includes("@");
    const record = otpStore.get(cleanInput);

    // Static OTP check for mobile numbers: "123456" is always accepted for mobile numbers
    if (!isEmail && otp.trim() === "123456") {
      const userObj = record?.user || { phone: cleanInput, fullName: "User" };
      if (record) otpStore.delete(cleanInput);
      return res.json({
        success: true,
        message: "Mobile static OTP verified successfully!",
        user: userObj,
      });
    }

    if (!record) {
      return res.status(400).json({ success: false, error: "No active OTP request found for this account" });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanInput);
      return res.status(400).json({ success: false, error: "OTP code has expired. Please request a new OTP." });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, error: "Incorrect OTP code. Please check and try again." });
    }

    otpStore.delete(cleanInput);

    return res.json({
      success: true,
      message: "OTP verified successfully!",
      user: record.user,
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 5. Reset Password using Verified OTP
// ----------------------------------------------------
router.post("/otp/reset-password", async (req, res) => {
  try {
    const pool = getPool();
    const { identifier, otp, newPassword } = req.body;

    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: "Missing required parameters" });
    }

    const cleanInput = identifier.trim().toLowerCase();
    const isEmail = cleanInput.includes("@");
    const record = otpStore.get(cleanInput);

    const isStaticMobile = !isEmail && otp.trim() === "123456";
    const isValidRecord = record && record.otp === otp.trim() && Date.now() <= record.expiresAt;

    if (!isStaticMobile && !isValidRecord) {
      return res.status(400).json({ success: false, error: "Invalid or expired OTP session" });
    }

    // Update password in MySQL users table
    await pool.query(
      "UPDATE users SET password = ? WHERE LOWER(email) = ? OR phone = ?",
      [newPassword.trim(), cleanInput, identifier.trim()]
    );

    // Update staff table if applicable
    await pool.query(
      "UPDATE staff SET password = ? WHERE LOWER(email) = ? OR phone = ?",
      [newPassword.trim(), cleanInput, identifier.trim()]
    );

    if (record) otpStore.delete(cleanInput);

    return res.json({
      success: true,
      message: "Password updated successfully in database! You can now login.",
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/google", async (req, res) => {
  try {
    const pool = getPool();
    const { email, fullName, avatar, role = "Player" } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Google email address is required" });

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName?.trim() || cleanEmail.split("@")[0];
    const cleanAvatar = avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(cleanEmail)}`;
    const accountType = String(role).toLowerCase() === "owner" ? "turf-owner" : "player";

    if (accountType === "turf-owner") {
      const [existing] = await pool.query(
        `SELECT oa.id AS account_id, oa.owner_profile_id, oa.email, oa.full_name, o.phone, o.city, o.status
         FROM turf_owner_accounts oa LEFT JOIN turf_owners o ON o.id = oa.owner_profile_id
         WHERE LOWER(oa.email) = ? LIMIT 1`,
        [cleanEmail]
      );
      if (existing[0]) {
        const owner = existing[0];
        return res.json({
          success: true, isNewUser: false, user: {
            id: owner.owner_profile_id, accountId: owner.account_id, fullName: owner.full_name,
            email: owner.email, role: "owner", accountType, phone: owner.phone || "", city: owner.city || "",
            status: owner.status || "Active",
          }
        });
      }
      if (await accountEmailExists(pool, cleanEmail)) {
        return res.status(409).json({ success: false, error: "This email belongs to a different account type." });
      }
      const [ownerResult] = await pool.query(
        `INSERT INTO turf_owners (name, email, phone, city, status, total_turfs, earnings, joined_date)
         VALUES (?, ?, '', '', 'Active', 0, '₹0', ?)`,
        [cleanName, cleanEmail, new Date().toISOString().split("T")[0]]
      );
      await pool.query(
        `INSERT INTO turf_owner_accounts (owner_profile_id, full_name, email, password, status)
         VALUES (?, ?, ?, 'google_auth_user', 'Active')`,
        [ownerResult.insertId, cleanName, cleanEmail]
      );
      return res.json({
        success: true, isNewUser: true, user: {
          id: ownerResult.insertId, accountId: ownerResult.insertId, fullName: cleanName, email: cleanEmail,
          role: "owner", accountType, phone: "", city: "", status: "Active", avatar: cleanAvatar,
        }
      });
    }

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
      return res.json({
        success: true, isNewUser: false, user: {
          id: player.profile_user_id, accountId: player.account_id, fullName: player.full_name,
          email: player.email, role: "Player", accountType, phone: player.phone || "", city: player.city || "",
          bio: player.bio || "", selectedSports: parseSelectedSports(player.selected_sports),
          status: player.status || "Active", avatar: avatarUrl, profilePicture: avatarUrl,
        }
      });
    }
    if (await accountEmailExists(pool, cleanEmail)) {
      return res.status(409).json({ success: false, error: "This email belongs to a different account type." });
    }
    const [profileResult] = await pool.query(
      `INSERT INTO users (full_name, email, password, role, phone, city, status, joined_date, avatar)
       VALUES (?, ?, 'google_auth_user', 'Player', '', '', 'Active', ?, ?)`,
      [cleanName, cleanEmail, new Date().toISOString().split("T")[0], cleanAvatar]
    );
    await pool.query(
      `INSERT INTO player_accounts (profile_user_id, full_name, email, password, status)
       VALUES (?, ?, ?, 'google_auth_user', 'Active')`,
      [profileResult.insertId, cleanName, cleanEmail]
    );
    return res.json({
      success: true, isNewUser: true, user: {
        id: profileResult.insertId, accountId: profileResult.insertId, fullName: cleanName, email: cleanEmail,
        role: "Player", accountType, phone: "", city: "", status: "Active", avatar: cleanAvatar,
        profilePicture: cleanAvatar,
      }
    });
  } catch (err) {
    console.error("Account Google auth error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 6. Google Auth (Verify Email in DB & Auto-Register if non-existent)
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
    const cleanAvatar = avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(cleanEmail)}`;

    // 1. Check if email already exists in MySQL users table
    const [existingUsers] = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = ?",
      [cleanEmail]
    );

    if (existingUsers.length > 0) {
      // User already exists in database -> Open account
      const existingUser = existingUsers[0];
      let selectedSports = [];
      try {
        if (existingUser.selected_sports) {
          selectedSports = typeof existingUser.selected_sports === "string" ? JSON.parse(existingUser.selected_sports) : (existingUser.selected_sports || []);
        }
      } catch (e) { }

      const user = {
        id: existingUser.id,
        fullName: existingUser.full_name,
        email: existingUser.email,
        role: existingUser.role || role,
        phone: existingUser.phone || "",
        city: existingUser.city || "",
        bio: existingUser.bio || "",
        selectedSports: selectedSports,
        status: existingUser.status || "Active",
        avatar: existingUser.avatar || cleanAvatar,
        profilePicture: existingUser.avatar || cleanAvatar,
      };

      console.log(`[GOOGLE AUTH] Account exists in MySQL database for ${cleanEmail}. Logging in.`);
      return res.json({ success: true, isNewUser: false, user });
    }

    // 2. Account does NOT exist in database -> Auto-create account in MySQL users table
    const joinedDate = new Date().toISOString().split("T")[0];
    const defaultPassword = "google_auth_user";

    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password, role, phone, city, status, joined_date, avatar)
       VALUES (?, ?, ?, ?, '', '', 'Active', ?, ?)`,
      [cleanName, cleanEmail, defaultPassword, role, joinedDate, cleanAvatar]
    );

    const newUser = {
      id: result.insertId,
      fullName: cleanName,
      email: cleanEmail,
      role: role,
      phone: "",
      city: "",
      status: "Active",
      avatar: cleanAvatar,
    };

    console.log(`[GOOGLE AUTH] Created NEW account in MySQL database for ${cleanEmail} (ID #${result.insertId})`);
    return res.json({ success: true, isNewUser: true, user: newUser });
  } catch (err) {
    console.error("Google Auth Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/accounts", async (req, res) => {
  try {
    const pool = getPool();
    const accountType = normalizeAccountType(req.query?.accountType);
    if (accountType === "turf-owner") {
      const [rows] = await pool.query(
        `SELECT oa.id AS account_id, oa.full_name AS name, oa.email, o.city, o.status, 'turf-owner' AS account_type
         FROM turf_owner_accounts oa LEFT JOIN turf_owners o ON o.id = oa.owner_profile_id
         WHERE LOWER(oa.status) = 'active' ORDER BY oa.id DESC LIMIT 8`
      );
      return res.json({ success: true, accounts: rows });
    }
    const [rows] = await pool.query(
      `SELECT id AS account_id, full_name AS name, email, avatar, city, role, 'player' AS account_type
       FROM users
       WHERE LOWER(status) = 'active' ORDER BY id DESC LIMIT 8`
    );
    return res.json({ success: true, accounts: rows });
  } catch (err) {
    console.error("Fetch account list error:", err);
    return res.status(500).json({ success: false, accounts: [] });
  }
});
router.post("/owner/setup", async (req, res) => {
  try {
    const pool = getPool();
    console.log("OWNER SETUP REQUEST", {
      bodyKeys: Object.keys(req.body || {}),
      ownerId: req.body?.ownerId,
      setupDataType: typeof req.body?.setupData,
      setupDataKeys:
        req.body?.setupData &&
        typeof req.body.setupData === "object"
          ? Object.keys(req.body.setupData)
          : []
    });

    const ownerId = req.body.ownerId || req.body.owner_id || req.body.id;
    const setupData = req.body.setupData || req.body.formData || req.body.form_data || req.body.data;

    if (!ownerId || !setupData) {
      return res.status(400).json({
        success: false,
        message: "Missing ownerId or setupData",
        received: {
          hasOwnerId: Boolean(ownerId),
          hasSetupData: Boolean(setupData)
        }
      });
    }

    // Save setup_data to turf_owners
    await pool.query(
      `UPDATE turf_owners SET setup_data = ? WHERE owner_id = ? OR id = ?`,
      [JSON.stringify(setupData), ownerId, ownerId]
    );

    // Save to turf_onboarding_requests
    const [owners] = await pool.query(
      `SELECT email FROM turf_owners WHERE owner_id = ? OR id = ?`,
      [ownerId, ownerId]
    );

    if (owners.length > 0) {
      const ownerEmail = owners[0].email;
      
      const requestId = `ONB-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      await pool.query(
        `INSERT INTO turf_onboarding_requests (id, owner_id, owner_email, form_data, status)
         VALUES (?, ?, ?, ?, 'pending')`,
        [requestId, ownerId, ownerEmail, JSON.stringify(setupData)]
      );
    }

    return res.json({ success: true, message: "Profile submitted successfully" });
  } catch (err) {
    console.error("Owner Setup Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
