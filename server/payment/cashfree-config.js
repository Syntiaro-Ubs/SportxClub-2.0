import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
dotenv.config({ path: path.resolve(currentDir, "../.env"), override: true });
dotenv.config({ override: true });

export const CASHFREE_CONFIG = {
  APP_ID: (process.env.CASHFREE_APP_ID || "").trim(),
  SECRET_KEY: (process.env.CASHFREE_SECRET_KEY || "").trim(),
  ENV: (process.env.CASHFREE_ENV || "PRODUCTION").trim().toUpperCase(),
  API_VERSION: (process.env.CASHFREE_API_VERSION || "2023-08-01").trim(),
  BASE_URL: (process.env.CASHFREE_BASE_URL || (process.env.CASHFREE_ENV === "TEST" ? "https://sandbox.cashfree.com/pg" : "https://api.cashfree.com/pg")).trim(),
};

export function hasCashfreeCredentials() {
  return Boolean(CASHFREE_CONFIG.APP_ID && CASHFREE_CONFIG.SECRET_KEY);
}

/**
 * Returns the standard Cashfree API headers for API calls
 */
export function getCashfreeHeaders() {
  return {
    "x-client-id": CASHFREE_CONFIG.APP_ID,
    "x-client-secret": CASHFREE_CONFIG.SECRET_KEY,
    "x-api-version": CASHFREE_CONFIG.API_VERSION,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
}

/**
 * Verifies Cashfree Webhook signature using HMAC-SHA256
 * Format: HMAC-SHA256(timestamp + rawBody, secretKey)
 */
export function verifyCashfreeWebhookSignature(timestamp, rawBody, signature) {
  try {
    if (!timestamp || !rawBody || !signature) return false;
    const bodyString = typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody);
    const dataToSign = `${timestamp}${bodyString}`;
    const generatedSignature = crypto
      .createHmac("sha256", CASHFREE_CONFIG.SECRET_KEY)
      .update(dataToSign)
      .digest("base64");

    return generatedSignature === signature;
  } catch (error) {
    console.error("Cashfree Webhook Signature Verification Error:", error);
    return false;
  }
}
