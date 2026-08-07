import express from "express";
import { getPool } from "../db.js";
import nodemailer from "nodemailer";

const router = express.Router();

// In-memory OTP Store for password/email recovery (key: identifier -> { otp, expiresAt, user })
const otpStore = new Map();

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

    const info = await transporter.sendMail({
      from: `"SportXClub Verification" <${smtpUser}>`,
      to: toEmail,
      subject: `[SportXClub] Your Verification Code is ${otpCode}`,
      html: htmlContent,
    });

    console.log(`[NODEMAILER] Live Email OTP dispatched to ${toEmail} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`[NODEMAILER DISPATCH] Email OTP notice for ${toEmail}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Helper function to send Live SMS OTP via Fast2SMS / Twilio Gateway
async function sendLiveSmsOtp(phoneNumber, otpCode) {
  try {
    const fast2smsApiKey = process.env.FAST2SMS_API_KEY;
    if (fast2smsApiKey && fast2smsApiKey.trim().length > 10) {
      // Call Fast2SMS Bulk SMS API for Indian mobile numbers
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2smsApiKey.trim(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variables_values: otpCode,
          route: "otp",
          numbers: phoneNumber,
        }),
      });
      const data = await response.json();
      console.log(`[FAST2SMS DISPATCH] Real SMS sent to ${phoneNumber}:`, data);
      return { success: data.return === true };
    }

    console.log(`================================================================`);
    console.log(`[MOBILE SMS OTP LOG] Mobile: ${phoneNumber} | OTP CODE: ${otpCode}`);
    console.log(`(Add FAST2SMS_API_KEY in server/.env to send real SMS directly to phones)`);
    console.log(`================================================================`);
    return { success: true };
  } catch (err) {
    console.warn(`[SMS DISPATCH NOTICE] ${err.message}`);
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// 1. User Registration
// ----------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const pool = getPool();
    const { fullName, email, password, role = "Player", phone = "", city = "" } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: "Email is already registered" });
    }

    const joinedDate = new Date().toISOString().split("T")[0];
    const avatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`;

    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password, role, phone, city, status, joined_date, avatar)
       VALUES (?, ?, ?, ?, ?, ?, 'Active', ?, ?)`,
      [fullName, email, password, role, phone, city, joinedDate, avatar]
    );

    const newUser = {
      id: result.insertId,
      fullName,
      email,
      role,
      phone,
      city,
      status: "Active",
      avatar,
    };

    return res.json({ success: true, user: newUser });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 2. User & Staff Login
// ----------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const pool = getPool();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email/Username and password are required" });
    }

    let [rows] = await pool.query(
      "SELECT id, full_name, email, role, phone, city, status, avatar FROM users WHERE LOWER(email) = LOWER(?) AND password = ?",
      [email.trim(), password.trim()]
    );

    let staffRecord = null;
    const [staffRows] = await pool.query(
      "SELECT * FROM staff WHERE LOWER(email) = LOWER(?) AND password = ?",
      [email.trim(), password.trim()]
    );

    if (staffRows.length > 0) {
      staffRecord = staffRows[0];
    }

    if (rows.length === 0 && !staffRecord) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    let permissions = null;
    let assignedTurf = null;

    if (staffRecord) {
      assignedTurf = staffRecord.turf || (staffRecord.turfs ? JSON.parse(staffRecord.turfs)[0] : null);
      try {
        permissions = typeof staffRecord.permissions === "string" ? JSON.parse(staffRecord.permissions) : staffRecord.permissions;
      } catch (e) {
        permissions = staffRecord.permissions;
      }
    }

    const userObj = rows[0] || {};

    const user = {
      id: userObj.id || staffRecord.id,
      fullName: userObj.full_name || `${staffRecord.first_name || ''} ${staffRecord.last_name || ''}`.trim(),
      email: userObj.email || staffRecord.email,
      role: staffRecord ? staffRecord.role : (userObj.role || "User"),
      userRole: staffRecord ? "Staff" : (userObj.role || "Player"),
      phone: userObj.phone || staffRecord.phone,
      city: userObj.city || "Mumbai",
      status: staffRecord ? (staffRecord.is_active ? "Active" : "Inactive") : (userObj.status || "Active"),
      avatar: userObj.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
      permissions: permissions,
      assignedTurf: assignedTurf,
      isStaff: !!staffRecord,
    };

    return res.json({ success: true, user });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// Check if Email or Phone already exists in Database
// ----------------------------------------------------
router.post("/check-exists", async (req, res) => {
  try {
    const pool = getPool();
    const { email, phone } = req.body;

    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const [existingUsers] = await pool.query(
        "SELECT id FROM users WHERE LOWER(email) = ?",
        [cleanEmail]
      );
      if (existingUsers.length > 0) {
        return res.json({
          exists: true,
          field: "email",
          message: "An account with this email address already exists. Please log in instead.",
        });
      }
    }

    if (phone && phone.trim()) {
      const cleanPhone = phone.trim();
      const [existingPhones] = await pool.query(
        "SELECT id FROM users WHERE phone = ? AND phone != ''",
        [cleanPhone]
      );
      if (existingPhones.length > 0) {
        return res.json({
          exists: true,
          field: "phone",
          message: "This mobile number is already registered. Please log in instead.",
        });
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

    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(cleanInput, {
      otp: generatedOtp,
      expiresAt,
      user: foundUser || { email: cleanInput, fullName: "New User" },
    });

    console.log(`[LIVE OTP DISPATCH] (${mode}) For ${cleanInput} -> Code: ${generatedOtp}`);

    // Dispatch Email or Mobile SMS OTP
    if (cleanInput.includes("@")) {
      await sendLiveEmailOtp(cleanInput, generatedOtp, foundUser?.full_name || "Athlete");
    } else {
      await sendLiveSmsOtp(cleanInput, generatedOtp);
    }

    return res.json({
      success: true,
      message: cleanInput.includes("@")
        ? `Verification code sent to your Gmail inbox!`
        : `SMS verification code dispatched to your mobile number!`,
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
    const record = otpStore.get(cleanInput);

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
    const record = otpStore.get(cleanInput);

    if (!record || record.otp !== otp.trim() || Date.now() > record.expiresAt) {
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

    otpStore.delete(cleanInput);

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
      "SELECT id, full_name, email, role, phone, city, status, avatar FROM users WHERE LOWER(email) = ?",
      [cleanEmail]
    );

    if (existingUsers.length > 0) {
      // User already exists in database -> Open account
      const existingUser = existingUsers[0];
      const user = {
        id: existingUser.id,
        fullName: existingUser.full_name,
        email: existingUser.email,
        role: existingUser.role || role,
        phone: existingUser.phone || "",
        city: existingUser.city || "Mumbai",
        status: existingUser.status || "Active",
        avatar: existingUser.avatar || cleanAvatar,
      };

      console.log(`[GOOGLE AUTH] Account exists in MySQL database for ${cleanEmail}. Logging in.`);
      return res.json({ success: true, isNewUser: false, user });
    }

    // 2. Account does NOT exist in database -> Auto-create account in MySQL users table
    const joinedDate = new Date().toISOString().split("T")[0];
    const defaultPassword = "google_auth_user";

    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password, role, phone, city, status, joined_date, avatar)
       VALUES (?, ?, ?, ?, '', 'Mumbai', 'Active', ?, ?)`,
      [cleanName, cleanEmail, defaultPassword, role, joinedDate, cleanAvatar]
    );

    const newUser = {
      id: result.insertId,
      fullName: cleanName,
      email: cleanEmail,
      role: role,
      phone: "",
      city: "Mumbai",
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

// ----------------------------------------------------
// 7. Get Accounts List for Google Account Selector
// ----------------------------------------------------
router.get("/accounts", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, full_name as name, email, avatar, role FROM users ORDER BY id DESC LIMIT 8"
    );
    return res.json({ success: true, accounts: rows });
  } catch (err) {
    console.error("Fetch Google Accounts Error:", err);
    return res.status(500).json({ success: false, accounts: [] });
  }
});

export default router;
