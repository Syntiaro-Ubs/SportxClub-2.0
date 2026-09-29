const API_BASE = "/api/payment/cashfree";

let cashfreeSdkPromise = null;

/**
 * Loads the official Cashfree JS SDK v3 dynamically
 */
export function loadCashfreeSDK() {
  if (typeof window === "undefined") return Promise.reject(new Error("Window not defined"));
  if (window.Cashfree) return Promise.resolve(window.Cashfree);

  if (!cashfreeSdkPromise) {
    cashfreeSdkPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById("cashfree-js-sdk");
      if (existingScript) {
        if (window.Cashfree) {
          return resolve(window.Cashfree);
        }
        existingScript.addEventListener("load", () => resolve(window.Cashfree));
        existingScript.addEventListener("error", (e) => reject(new Error("Failed loading Cashfree SDK")));
        return;
      }

      const script = document.createElement("script");
      script.id = "cashfree-js-sdk";
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.onload = () => {
        if (window.Cashfree) {
          resolve(window.Cashfree);
        } else {
          reject(new Error("Cashfree SDK failed to initialize on window object."));
        }
      };
      script.onerror = () => {
        cashfreeSdkPromise = null;
        reject(new Error("Failed to load Cashfree checkout SDK."));
      };
      document.head.appendChild(script);
    });
  }

  return cashfreeSdkPromise;
}

/**
 * Detects whether the current client is a mobile device / mobile browser
 */
export function isMobileDevice() {
  if (typeof window === "undefined") return false;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera || "";
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  const isSmallScreen = window.innerWidth <= 768;
  const hasTouchScreen = Boolean(navigator.maxTouchPoints && navigator.maxTouchPoints > 1);

  return mobileRegex.test(userAgent) || (isSmallScreen && hasTouchScreen);
}

export const cashfreeService = {
  /**
   * 1. Create Order and Get Cashfree payment_session_id
   */
  createOrder: async (bookingPayload) => {
    try {
      const response = await fetch(`${API_BASE}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: bookingPayload.price || bookingPayload.amount || 1200,
          slotCount: bookingPayload.slotCount || (Array.isArray(bookingPayload.slots) ? bookingPayload.slots.length : 1),
          slots: bookingPayload.slots,
          userEmail: bookingPayload.userEmail || "user@sportxclub.com",
          userName: bookingPayload.userName || "SportX Player",
          userPhone: bookingPayload.userPhone || "9876543210",
          turfName: typeof bookingPayload.venue === "object" ? bookingPayload.venue.name : (bookingPayload.venue || bookingPayload.turfName || "SportX Turf"),
          date: bookingPayload.date || bookingPayload.selectedDate,
          time: bookingPayload.time,
          sport: bookingPayload.sport,
          venueId: bookingPayload.venueId || (typeof bookingPayload.venue === "object" ? bookingPayload.venue.id : null),
          bookingCode: bookingPayload.bookingCode,
          orderType: bookingPayload.orderType,
        }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonErr) {
        throw new Error(`Server returned HTML instead of JSON (${response.status}). Check backend server connection.`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create Cashfree payment order.");
      }

      return data;
    } catch (err) {
      console.error("cashfreeService.createOrder error:", err);
      throw err;
    }
  },

  /**
   * 2. Initiate Cashfree Live Payment
   * Creates live order and launches Cashfree Checkout.
   * On Mobile: Uses redirectTarget: "_self" so the browser can directly open UPI apps (PhonePe, GPay, BHIM, Paytm).
   * On Desktop: Uses redirectTarget: "_modal" for a clean popup checkout experience.
   */
  initiatePayment: async (bookingPayload, customOptions = {}) => {
    try {
      // 1. Create order on backend
      const orderData = await cashfreeService.createOrder(bookingPayload);
      const { payment_session_id, order_id } = orderData;

      if (!payment_session_id) {
        throw new Error("No payment session ID returned from Cashfree.");
      }

      // Save order_id & booking details to both session & local storage for 100% recovery across external UPI app switches
      try {
        sessionStorage.setItem("sportxclub_cashfree_order_id", order_id);
        sessionStorage.setItem("sportxclub_pending_booking", JSON.stringify(bookingPayload));
        sessionStorage.setItem("sportxclub_last_booking", JSON.stringify(bookingPayload));

        localStorage.setItem("sportxclub_cashfree_order_id", order_id);
        localStorage.setItem("sportxclub_pending_booking", JSON.stringify(bookingPayload));
        localStorage.setItem("sportxclub_last_booking", JSON.stringify(bookingPayload));
      } catch (e) {}

      // 2. Load official Cashfree SDK v3 in production live mode
      const Cashfree = await loadCashfreeSDK();
      const cashfree = new Cashfree({
        mode: "production",
      });

      const isMobile = isMobileDevice();
      // On mobile devices, redirect to Cashfree checkout page directly using "_self".
      // This allows mobile browsers (Chrome, Safari, etc.) to trigger native UPI Intent apps
      // (PhonePe, Google Pay, Paytm, BHIM) without being blocked by iframe security restrictions.
      // On desktop, retain "_modal" for smooth popup UX.
      const redirectTarget = customOptions.redirectTarget || (isMobile ? "_self" : "_modal");

      console.log(`[Cashfree Checkout] Launching mode: ${redirectTarget} (isMobile: ${isMobile}) for order ${order_id}`);

      // 3. Launch Checkout
      const checkoutOptions = {
        paymentSessionId: payment_session_id,
        redirectTarget,
      };

      if (redirectTarget === "_self") {
        // ON MOBILE: Let Cashfree SDK navigate to Cashfree hosted checkout page.
        // DO NOT hijack navigation to /payment-status!
        // Cashfree will redirect back to return_url (payment-status) once the user pays or cancels.
        await cashfree.checkout(checkoutOptions);
        return { success: true, order_id, redirecting: true };
      }

      // ON DESKTOP (_modal):
      // Modal opens as an overlay on the current page.
      let isCompleted = false;
      const pollInterval = setInterval(async () => {
        if (isCompleted) return;
        try {
          const statusRes = await cashfreeService.getOrderStatus(order_id);
          if (statusRes && (statusRes.isPaid || statusRes.status === "Success")) {
            isCompleted = true;
            clearInterval(pollInterval);
            window.location.href = `/payment-status?order_id=${encodeURIComponent(order_id)}`;
          }
        } catch (e) {}
      }, 2500);

      // Stop polling after 10 minutes
      setTimeout(() => clearInterval(pollInterval), 600000);

      const result = await cashfree.checkout(checkoutOptions);

      if (result && result.error) {
        console.warn("Cashfree checkout notice:", result.error);
        clearInterval(pollInterval);
        return { success: false, message: result.error.message };
      }

      if (result && result.paymentDetails) {
        isCompleted = true;
        clearInterval(pollInterval);
        window.location.href = `/payment-status?order_id=${encodeURIComponent(order_id)}`;
      }

      return { success: true, order_id };
    } catch (err) {
      console.error("cashfreeService.initiatePayment error:", err);
      return { success: false, message: err.message };
    }
  },

  /**
   * 3. Get Cashfree Order & Payment Status
   */
  getOrderStatus: async (orderId) => {
    try {
      const response = await fetch(`${API_BASE}/order/${encodeURIComponent(orderId)}`);
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        return { success: false, message: "Invalid JSON received from server" };
      }
      return data;
    } catch (err) {
      console.error("cashfreeService.getOrderStatus error:", err);
      return { success: false, message: err.message };
    }
  },

  /**
   * 4. Fallback Verification Route
   */
  verifyPayment: async (orderId, bookingPayload) => {
    try {
      const response = await fetch(`${API_BASE}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          bookingPayload,
        }),
      });
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        return { success: false, message: "Invalid JSON response" };
      }
      return data;
    } catch (err) {
      console.error("cashfreeService.verifyPayment error:", err);
      return { success: false, message: err.message };
    }
  },

  /**
   * 4.5 Verify Wallet Top-Up Payment
   */
  verifyWalletTopup: async (orderId, topupPayload) => {
    try {
      let token = null;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
        if (!token) {
          try {
            const pUser = JSON.parse(localStorage.getItem("playerUser") || "{}");
            token = pUser.token;
          } catch {}
        }
      }
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const response = await fetch(`${API_BASE}/verify-wallet-topup`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          order_id: orderId,
          topupPayload,
        }),
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("cashfreeService.verifyWalletTopup error:", err);
      return { success: false, message: err.message };
    }
  },

  /**
   * 5. Fetch Payment History
   */
  getHistory: async (email) => {
    try {
      const query = email ? `?email=${encodeURIComponent(email)}` : "";
      let token = null;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
        if (!token) {
          try {
            const pUser = JSON.parse(localStorage.getItem("playerUser") || "{}");
            token = pUser.token;
          } catch {}
        }
      }
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE}/history${query}`, { headers });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("cashfreeService.getHistory error:", err);
      return { success: false, payments: [] };
    }
  },
};
