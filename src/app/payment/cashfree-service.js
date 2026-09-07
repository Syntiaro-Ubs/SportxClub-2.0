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
          userEmail: bookingPayload.userEmail || "user@sportxclub.com",
          userName: bookingPayload.userName || "SportX Player",
          userPhone: bookingPayload.userPhone || "9876543210",
          turfName: typeof bookingPayload.venue === "object" ? bookingPayload.venue.name : (bookingPayload.venue || bookingPayload.turfName || "SportX Turf"),
          date: bookingPayload.date || bookingPayload.selectedDate,
          time: bookingPayload.time,
          sport: bookingPayload.sport,
          venueId: bookingPayload.venueId || (typeof bookingPayload.venue === "object" ? bookingPayload.venue.id : null),
          bookingCode: bookingPayload.bookingCode,
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
   * Creates order and opens Cashfree Checkout
   */
  initiatePayment: async (bookingPayload) => {
    try {
      // 1. Create order on backend
      const orderData = await cashfreeService.createOrder(bookingPayload);
      const { payment_session_id, order_id } = orderData;

      if (!payment_session_id) {
        throw new Error("No payment session ID returned from Cashfree.");
      }

      // Save order_id to session storage for recovery
      try {
        sessionStorage.setItem("sportxclub_cashfree_order_id", order_id);
      } catch (e) {}

      // 2. Load Cashfree SDK v3
      const Cashfree = await loadCashfreeSDK();
      const cashfree = new Cashfree({
        mode: (orderData.environment === "TEST" || orderData.environment === "SANDBOX") ? "sandbox" : "production",
      });

      // 3. Launch Checkout in modal (with automatic fallback)
      const checkoutOptions = {
        paymentSessionId: payment_session_id,
        redirectTarget: "_modal",
      };

      const result = await cashfree.checkout(checkoutOptions);

      if (result && result.error) {
        console.warn("Cashfree checkout notice:", result.error);
        if (result.error.message && !result.error.message.toLowerCase().includes("closed")) {
          return { success: false, message: result.error.message };
        }
      }

      // If completed via modal on current page, navigate to payment-status
      if (result && (result.paymentDetails || result.redirect)) {
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
   * 5. Fetch Payment History
   */
  getHistory: async (email) => {
    try {
      const query = email ? `?email=${encodeURIComponent(email)}` : "";
      const response = await fetch(`${API_BASE}/history${query}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("cashfreeService.getHistory error:", err);
      return { success: false, payments: [] };
    }
  },
};
