import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { CASHFREE_CONFIG, getCashfreeHeaders, hasCashfreeCredentials } from "./cashfree-config.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
dotenv.config({ path: path.resolve(currentDir, "../.env"), override: true });
dotenv.config({ override: true });

const PAYOUT_BASE_URL = (
  process.env.CASHFREE_PAYOUT_URL ||
  (CASHFREE_CONFIG.IS_TEST
    ? "https://payout-gamma.cashfree.com/payout/v1"
    : "https://payout-api.cashfree.com/payout/v1")
).trim();

const PAYOUT_CLIENT_ID = (process.env.CASHFREE_PAYOUT_CLIENT_ID || CASHFREE_CONFIG.APP_ID || "").trim();
const PAYOUT_CLIENT_SECRET = (process.env.CASHFREE_PAYOUT_CLIENT_SECRET || CASHFREE_CONFIG.SECRET_KEY || "").trim();

/**
 * Returns Cashfree Payout specific authentication headers
 */
function getPayoutHeaders(bearerToken = null) {
  if (bearerToken) {
    return {
      "Authorization": `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
  }

  return {
    "X-Client-Id": PAYOUT_CLIENT_ID,
    "X-Client-Secret": PAYOUT_CLIENT_SECRET,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
}

let cachedPayoutToken = null;
let tokenExpiresAt = 0;

/**
 * Authenticates with Cashfree Payouts API and obtains a Bearer Token if required by API version
 */
async function getPayoutAuthToken() {
  if (cachedPayoutToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedPayoutToken;
  }

  if (!PAYOUT_CLIENT_ID || !PAYOUT_CLIENT_SECRET) {
    return null;
  }

  try {
    const response = await fetch(`${PAYOUT_BASE_URL}/authorize`, {
      method: "POST",
      headers: {
        "X-Client-Id": PAYOUT_CLIENT_ID,
        "X-Client-Secret": PAYOUT_CLIENT_SECRET,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (response.ok && data.status === "SUCCESS" && data.data?.token) {
      cachedPayoutToken = data.data.token;
      tokenExpiresAt = Date.now() + (data.data.expiry || 86400) * 1000;
      return cachedPayoutToken;
    }
  } catch (err) {
    console.warn("[Cashfree Payout Auth] Token auth not supported or failed, using client headers:", err.message);
  }

  return null;
}

/**
 * Initiates an automated direct payout transfer to a turf owner's bank account or UPI
 * 
 * @param {Object} params
 * @param {string} params.settlementId Unique settlement tracking ID
 * @param {Object} params.owner Turf Owner details
 * @param {string} params.turfName Turf name
 * @param {number} params.amount Net payout amount in INR
 * @param {string} params.transferMode 'banktransfer' | 'upi' | 'IMPS'
 */
export async function initiateTurfOwnerPayout({
  settlementId,
  owner,
  turfName = "SportXClub Turf",
  amount,
  transferMode = "banktransfer",
}) {
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    return {
      success: false,
      status: "FAILED",
      message: "Settlement amount must be greater than 0.",
    };
  }

  const bank = owner.bank || {};
  const accountNumber = (bank.accountNumber || owner.account_number || "").trim();
  const ifsc = (bank.ifscCode || owner.ifsc_code || "").trim().toUpperCase();
  const upiId = (bank.upiId || owner.upi_id || "").trim();
  const accountHolder = (bank.accountHolder || owner.account_holder || owner.name || owner.full_name || "Turf Owner").trim();
  const phone = (owner.phone || owner.owner_phone || "9999999999").replace(/\D/g, "").slice(-10);
  const email = (owner.email || owner.owner_email || "").trim();

  // Validate payment credentials
  const isUpiPayout = (transferMode.toLowerCase() === "upi" || (!accountNumber && upiId)) && Boolean(upiId);
  if (!isUpiPayout && (!accountNumber || !ifsc)) {
    return {
      success: false,
      status: "FAILED",
      message: `Turf owner (${owner.email || owner.name}) has incomplete bank details (Account: ${accountNumber || "Missing"}, IFSC: ${ifsc || "Missing"}).`,
    };
  }

  const cleanTransferId = `SX_PAY_${settlementId.replace(/[^a-zA-Z0-9_-]/g, "_")}`.slice(0, 40);

  // If live Cashfree Payout API credentials are configured, execute live transfer
  if (PAYOUT_CLIENT_ID && PAYOUT_CLIENT_SECRET) {
    try {
      const authToken = await getPayoutAuthToken();
      const headers = getPayoutHeaders(authToken);

      const payload = {
        transferId: cleanTransferId,
        amount: numericAmount.toFixed(2),
        transferMode: isUpiPayout ? "upi" : "banktransfer",
        remarks: `SportXClub Turf Settlement - ${turfName}`.slice(0, 70),
        beneficiaryDetails: isUpiPayout
          ? {
              beneficiaryId: `BENE_${owner.owner_id || owner.id || "OWNER"}`.slice(0, 40),
              beneficiaryName: accountHolder,
              beneficiaryEmail: email || "accounts@sportxclub.com",
              beneficiaryPhone: phone,
              vpa: upiId,
            }
          : {
              beneficiaryId: `BENE_${owner.owner_id || owner.id || "OWNER"}`.slice(0, 40),
              beneficiaryName: accountHolder,
              beneficiaryEmail: email || "accounts@sportxclub.com",
              beneficiaryPhone: phone,
              bankAccount: accountNumber,
              ifsc: ifsc,
            },
      };

      console.log(`[Cashfree Payout] Dispatching Payout of ₹${numericAmount} for ${turfName} (TransferID: ${cleanTransferId})`);

      const response = await fetch(`${PAYOUT_BASE_URL}/directTransfer`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && (data.status === "SUCCESS" || data.subCode === "200")) {
        const transferData = data.data || {};
        return {
          success: true,
          status: "SUCCESS",
          transferId: transferData.transferId || cleanTransferId,
          utrNumber: transferData.utr || `CF${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`,
          referenceId: transferData.referenceId || String(data.data?.referenceId || ""),
          message: data.message || "Payout transferred successfully via Cashfree.",
          raw: data,
        };
      }

      if (data.status === "PENDING" || data.subCode === "201") {
        return {
          success: true,
          status: "PENDING",
          transferId: cleanTransferId,
          utrNumber: data.data?.utr || `CF_PENDING_${Date.now()}`,
          referenceId: String(data.data?.referenceId || ""),
          message: data.message || "Payout is processing with bank.",
          raw: data,
        };
      }

      console.error("[Cashfree Payout Error]:", data);
      return {
        success: false,
        status: "FAILED",
        transferId: cleanTransferId,
        message: data.message || "Cashfree Payout transfer failed.",
        raw: data,
      };
    } catch (apiError) {
      console.error("[Cashfree Payout Exception]:", apiError.message);
      return {
        success: false,
        status: "FAILED",
        transferId: cleanTransferId,
        message: `Payout API connection error: ${apiError.message}`,
      };
    }
  }

  // SIMULATION / SAFE LOCAL DEMO MODE (When Cashfree Payouts API credentials are not yet entered)
  console.log(`[Cashfree Payout Demo] Simulated Transfer of ₹${numericAmount} to Account: ${accountNumber || upiId} (${accountHolder})`);
  const simulatedUtr = `CF${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    success: true,
    status: "SUCCESS",
    isSimulated: true,
    transferId: cleanTransferId,
    utrNumber: simulatedUtr,
    referenceId: `REF_${Date.now()}`,
    message: `Automated transfer processed successfully (Simulated UTR: ${simulatedUtr})`,
  };
}

/**
 * Checks transfer status from Cashfree Payouts API
 */
export async function checkPayoutStatus(transferId) {
  if (!PAYOUT_CLIENT_ID || !PAYOUT_CLIENT_SECRET) {
    return { success: true, status: "SUCCESS", transferId };
  }

  try {
    const authToken = await getPayoutAuthToken();
    const headers = getPayoutHeaders(authToken);

    const response = await fetch(`${PAYOUT_BASE_URL}/getTransferStatus?transferId=${encodeURIComponent(transferId)}`, {
      method: "GET",
      headers,
    });

    const data = await response.json();
    return {
      success: response.ok && data.status === "SUCCESS",
      status: data.data?.status || data.status || "UNKNOWN",
      utr: data.data?.utr || null,
      data,
    };
  } catch (error) {
    console.error("[Cashfree Payout Status Check Error]:", error.message);
    return { success: false, error: error.message };
  }
}
