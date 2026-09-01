import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
dotenv.config({ path: path.resolve(currentDir, "../.env"), override: true });
dotenv.config({ override: true });

export const PAYU_CONFIG = {
  KEY: (process.env.PAYU_MERCHANT_KEY || "5Yv8ir").trim(),
  SALT: (process.env.PAYU_MERCHANT_SALT || "2UuDvHBKqoDIQtFzU2etvFUuVutsB2R5").trim(),
  MERCHANT_ID: (process.env.PAYU_MERCHANT_ID || "13745277").trim(),
  CLIENT_ID: (process.env.PAYU_CLIENT_ID || "80a73f5ef57910f32ca368e19fbf88f80d2a8fbab01bae3813ac110f733ecf2d").trim(),
  CLIENT_SECRET: (process.env.PAYU_CLIENT_SECRET || "e612356f21496de5e68ee8f27f993874b4913f08beb32ddec58521843838cdbf").trim(),
  ENV: (process.env.PAYU_ENV || "PRODUCTION").trim(),
  PAYMENT_URL: (process.env.PAYU_PAYMENT_URL || "https://secure.payu.in/_payment").trim(),
  SERVICE_URL: (process.env.PAYU_SERVICE_URL || "https://info.payu.in/merchant/postservice?form=2").trim(),
};

export function hasPayUCredentials() {
  return Boolean(PAYU_CONFIG.KEY && PAYU_CONFIG.SALT);
}

/**
 * Generates PayU Request SHA-512 Hash
 * Format: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|SALT)
 */
export function generatePayUHash(params) {
  const key = (params.key || PAYU_CONFIG.KEY).trim();
  const txnid = String(params.txnid || "").trim();
  const amount = parseFloat(params.amount || 0).toFixed(2);
  const productinfo = String(params.productinfo || "SportXClub Turf Booking").replace(/[^a-zA-Z0-9 ]/g, " ").trim();
  const firstname = String(params.firstname || "SportX Player").replace(/[^a-zA-Z0-9 ]/g, " ").trim();
  const email = String(params.email || "user@sportxclub.com").trim().toLowerCase();
  const udf1 = String(params.udf1 || "").trim();
  const udf2 = String(params.udf2 || "").trim();
  const udf3 = String(params.udf3 || "").trim();
  const udf4 = String(params.udf4 || "").trim();
  const udf5 = String(params.udf5 || "").trim();
  const udf6 = String(params.udf6 || "").trim();
  const udf7 = String(params.udf7 || "").trim();
  const udf8 = String(params.udf8 || "").trim();
  const udf9 = String(params.udf9 || "").trim();
  const udf10 = String(params.udf10 || "").trim();
  const salt = (params.salt || PAYU_CONFIG.SALT).trim();

  // Exactly 17 items joined by 16 pipe separators '|'
  const hashSequence = [
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
    udf6,
    udf7,
    udf8,
    udf9,
    udf10,
    salt,
  ];

  const hashString = hashSequence.join("|");
  console.log(`[PayU Hash String]: ${hashString}`);
  return crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();
}

/**
 * Validates PayU Callback Response Hash
 * Format: sha512(SALT|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 * Or with additionalCharges: sha512(additionalCharges|SALT|status|...|key)
 */
export function verifyPayUResponseHash(body) {
  const salt = PAYU_CONFIG.SALT.trim();
  const status = String(body.status || "").trim();
  const udf10 = String(body.udf10 || "").trim();
  const udf9 = String(body.udf9 || "").trim();
  const udf8 = String(body.udf8 || "").trim();
  const udf7 = String(body.udf7 || "").trim();
  const udf6 = String(body.udf6 || "").trim();
  const udf5 = String(body.udf5 || "").trim();
  const udf4 = String(body.udf4 || "").trim();
  const udf3 = String(body.udf3 || "").trim();
  const udf2 = String(body.udf2 || "").trim();
  const udf1 = String(body.udf1 || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const firstname = String(body.firstname || "").trim();
  const productinfo = String(body.productinfo || "").trim();
  const amount = parseFloat(body.amount || 0).toFixed(2);
  const txnid = String(body.txnid || "").trim();
  const key = String(body.key || PAYU_CONFIG.KEY).trim();
  const additionalCharges = body.additionalCharges ? String(body.additionalCharges).trim() : null;

  const hashElements = [
    salt,
    status,
    udf10,
    udf9,
    udf8,
    udf7,
    udf6,
    udf5,
    udf4,
    udf3,
    udf2,
    udf1,
    email,
    firstname,
    productinfo,
    amount,
    txnid,
    key,
  ];

  if (additionalCharges) {
    hashElements.unshift(additionalCharges);
  }

  const hashString = hashElements.join("|");
  const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();
  const receivedHash = String(body.hash || "").trim().toLowerCase();

  return {
    isValid: calculatedHash === receivedHash,
    calculatedHash,
    receivedHash,
  };
}

/**
 * Generates PayU WebService API hash
 * Format: sha512(key|command|var1|salt)
 */
export function generateWebServiceHash(command, var1) {
  const hashString = `${PAYU_CONFIG.KEY}|${command}|${var1}|${PAYU_CONFIG.SALT}`;
  return crypto.createHash("sha512").update(hashString).digest("hex").toLowerCase();
}
