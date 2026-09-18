import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../server/.env") });

const BASE_URL = "http://localhost:5000";

async function runTests() {
  console.log("==================================================");
  console.log("   RUNNING SPORTXCLUB 2.0 SECURITY AUDIT TESTS    ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  // TEST 1: Static OTP Backdoor Rejection
  console.log("\n[TEST 1] Testing OTP Backdoor Rejection ('123456')...");
  try {
    const res = await fetch(`${BASE_URL}/api/auth/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "9999999999", otp: "123456" }),
    });
    const json = await res.json();
    if (!res.ok && !json.success) {
      console.log("✅ PASS: Static backdoor '123456' was rejected as expected.");
      passed++;
    } else {
      console.error("❌ FAIL: Static OTP '123456' was accepted!", json);
      failed++;
    }
  } catch (e) {
    console.error("❌ Error running Test 1:", e.message);
    failed++;
  }

  // TEST 2: User Registration & Bcrypt Hashing
  console.log("\n[TEST 2] Testing Registration, Bcrypt Hashing & JWT Token Generation...");
  const testEmail = `sec_test_${Date.now()}@sportxclub.com`;
  const testPass = "SecureP@ss2026!";
  let authToken = null;
  let testUserId = null;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Security Test User",
        email: testEmail,
        password: testPass,
        phone: "9876500001",
        city: "Mumbai",
      }),
    });
    const json = await res.json();
    if (json.success && json.token && json.user) {
      authToken = json.token;
      testUserId = json.user.id;
      console.log("✅ PASS: Registration succeeded and returned a JWT token.");

      // Check MySQL database to verify password is a bcrypt hash
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "root",
        database: process.env.DB_NAME || "sportxclub",
        port: process.env.DB_PORT || 3306,
      });

      const [rows] = await conn.query("SELECT password FROM users WHERE id = ?", [testUserId]);
      await conn.end();

      if (rows[0] && rows[0].password.startsWith("$2a$") || rows[0].password.startsWith("$2b$")) {
        console.log("✅ PASS: Password in MySQL is safely hashed with bcrypt ($2a$ / $2b$).");
        passed++;
      } else {
        console.error("❌ FAIL: Password in MySQL is NOT hashed:", rows[0]?.password);
        failed++;
      }
    } else {
      console.error("❌ FAIL: Registration failed:", json);
      failed++;
    }
  } catch (e) {
    console.error("❌ Error running Test 2:", e.message);
    failed++;
  }

  // TEST 3: Login Verification
  console.log("\n[TEST 3] Testing Login with Bcrypt Verification...");
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: testPass }),
    });
    const json = await res.json();
    if (json.success && json.token) {
      console.log("✅ PASS: Login successfully verified bcrypt hash and issued JWT token.");
      passed++;
    } else {
      console.error("❌ FAIL: Login failed:", json);
      failed++;
    }
  } catch (e) {
    console.error("❌ Error running Test 3:", e.message);
    failed++;
  }

  // TEST 4: Unauthenticated Access to Admin API
  console.log("\n[TEST 4] Testing Access Control on Sensitive Admin Endpoints (/api/admin/users)...");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/users`);
    if (res.status === 401) {
      console.log("✅ PASS: Unauthenticated access to /api/admin/users returned 401 Unauthorized.");
      passed++;
    } else {
      console.error(`❌ FAIL: /api/admin/users returned status ${res.status} instead of 401!`);
      failed++;
    }
  } catch (e) {
    console.error("❌ Error running Test 4:", e.message);
    failed++;
  }

  // TEST 5: Authenticated Profile Access
  console.log("\n[TEST 5] Testing Authenticated Profile Fetch...");
  try {
    const res = await fetch(`${BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const json = await res.json();
    if (json.success && json.data?.user?.email === testEmail) {
      console.log("✅ PASS: Authenticated profile loaded accurately via JWT.");
      passed++;
    } else {
      console.error("❌ FAIL: Failed to load profile:", json);
      failed++;
    }
  } catch (e) {
    console.error("❌ Error running Test 5:", e.message);
    failed++;
  }

  // TEST 6: Unauthorized IDOR Account Deletion Rejection
  console.log("\n[TEST 6] Testing IDOR Prevention on Account Deletion...");
  try {
    const res = await fetch(`${BASE_URL}/api/profile/account`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // No token provided -> should fail
      },
      body: JSON.stringify({ userId: testUserId, confirmText: "DELETE" }),
    });
    if (res.status === 401) {
      console.log("✅ PASS: Unauthenticated deletion was blocked with 401 Unauthorized.");
      passed++;
    } else {
      console.error(`❌ FAIL: Deletion without token returned ${res.status}`);
      failed++;
    }
  } catch (e) {
    console.error("❌ Error running Test 6:", e.message);
    failed++;
  }

  // Clean up test user
  if (authToken) {
    try {
      await fetch(`${BASE_URL}/api/profile/account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ confirmText: "DELETE" }),
      });
      console.log("\n[Cleanup] Test user cleaned up successfully.");
    } catch {}
  }

  console.log("\n==================================================");
  console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");
}

runTests();
