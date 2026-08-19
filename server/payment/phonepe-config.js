import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ES modules evaluate imported files before server.js runs dotenv.config().
// Load this module's environment file here so payment credentials are available
// when PHONEPE_CONFIG is created.
const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
dotenv.config({ path: path.resolve(currentDir, "../.env") });

export const PHONEPE_CONFIG = {
  // Both names are supported: SportXClub's CLIENT_* names and PhonePe's
  // standard MERCHANT_ID / SALT_KEY / SALT_INDEX names used by AmeyaNewYork.
  CLIENT_ID: (process.env.PHONEPE_CLIENT_ID || process.env.PHONEPE_MERCHANT_ID || "").trim(),
  CLIENT_SECRET: (process.env.PHONEPE_CLIENT_SECRET || process.env.PHONEPE_SALT_KEY || "").trim(),
  CLIENT_VERSION: (process.env.PHONEPE_CLIENT_VERSION || process.env.PHONEPE_SALT_INDEX || "").trim(),
  ENV: process.env.PHONEPE_ENV || "SANDBOX",
  HOST: process.env.PHONEPE_ENV === "PRODUCTION"
    ? "https://api.phonepe.com/apis/hermes"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox",
};

export function hasPhonePeCredentials() {
  return Boolean(
    PHONEPE_CONFIG.CLIENT_ID &&
    PHONEPE_CONFIG.CLIENT_SECRET &&
    PHONEPE_CONFIG.CLIENT_VERSION
  );
}

/**
 * Utility to calculate X-VERIFY header for PhonePe PG API
 * Format: SHA256(base64Payload + apiPath + saltKey) + "###" + saltIndex
 */
export function calculateXVerify(base64Payload, apiPath) {
  const saltKey = PHONEPE_CONFIG.CLIENT_SECRET;
  const saltIndex = PHONEPE_CONFIG.CLIENT_VERSION;
  const stringToHash = base64Payload + apiPath + saltKey;
  const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
  return `${sha256}###${saltIndex}`;
}
