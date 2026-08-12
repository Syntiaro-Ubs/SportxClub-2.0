import crypto from "crypto";

export const PHONEPE_CONFIG = {
  CLIENT_ID: process.env.PHONEPE_CLIENT_ID || "M22W57IMFZ6JF_2512041158",
  CLIENT_SECRET: process.env.PHONEPE_CLIENT_SECRET || "NzQ5Mzc5MDYtNjJmOC00NTYzLWFkODAtMzJlOTc4MjU2Yjk1",
  CLIENT_VERSION: process.env.PHONEPE_CLIENT_VERSION || "1",
  ENV: process.env.PHONEPE_ENV || "SANDBOX",
  HOST: process.env.PHONEPE_ENV === "PRODUCTION"
    ? "https://api.phonepe.com/apis/hermes"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox",
};

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
