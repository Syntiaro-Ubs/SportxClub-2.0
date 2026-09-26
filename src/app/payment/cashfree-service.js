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
   * Creates live order and launches Cashfree Checkout modal directly
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

      // Helper to record confirmed booking in localStorage immediately
      const recordConfirmedLocally = (orderId, statusData = {}) => {
        try {
          const saved = sessionStorage.getItem("sportxclub_last_booking") || sessionStorage.getItem("sportxclub_pending_booking") || sessionStorage.getItem("sportxclub_booking");
          const bData = saved ? JSON.parse(saved) : bookingPayload;
          const confirmedList = JSON.parse(localStorage.getItem("sportxclub_confirmed_bookings") || "[]");
          const newBooking = {
            booking_code: statusData.booking?.booking_code || orderId,
            turf_name: bData?.venue?.name || bData?.venue || "SportX Turf",
            venue: bData?.venue?.name || bData?.venue || "SportX Turf",
            turf_id: bData?.venueId,
            date: bData?.date || bData?.selectedDate || new Date().toISOString().split("T")[0],
            time_slot: bData?.time || bData?.timeSlot || "6:00 PM - 7:00 PM",
            slot_time: bData?.time || bData?.timeSlot || "6:00 PM - 7:00 PM",
            time: bData?.time || bData?.timeSlot || "6:00 PM - 7:00 PM",
            sport: bData?.sport || "Football",
            amount: bData?.price || bData?.amount || 1200,
            user_name: bData?.userName || localStorage.getItem("userName") || "SportX Player",
            user_email: bData?.userEmail || localStorage.getItem("userEmail") || "user@sportxclub.com",
            status: "Confirmed",
            timestamp: Date.now(),
          };
          const exists = confirmedList.some((b) => b.booking_code === newBooking.booking_code || (b.turf_name === newBooking.turf_name && b.date === newBooking.date && b.time_slot === newBooking.time_slot));
          if (!exists) {
            confirmedList.unshift(newBooking);
            localStorage.setItem("sportxclub_confirmed_bookings", JSON.stringify(confirmedList.slice(0, 50)));
          }
          sessionStorage.setItem("sportxclub_last_booking_status", "Confirmed");
        } catch (e) {}
      };

      // 2. Load official Cashfree SDK v3 in production live mode
      const Cashfree = await loadCashfreeSDK();
      const cashfree = new Cashfree({
        mode: "production",
      });

      // Start automatic live polling in background
      let isCompleted = false;
      const pollInterval = setInterval(async () => {
        if (isCompleted) return;
        try {
          const statusRes = await cashfreeService.getOrderStatus(order_id);
          if (statusRes && (statusRes.isPaid || statusRes.status === "Success")) {
            isCompleted = true;
            clearInterval(pollInterval);
            recordConfirmedLocally(order_id, statusRes);
            window.location.href = `/payment-status?order_id=${encodeURIComponent(order_id)}`;
          }
        } catch (e) {}
      }, 2500);

      // Stop polling after 10 minutes
      setTimeout(() => clearInterval(pollInterval), 600000);

      // 3. Launch Checkout in modal
      const checkoutOptions = {
        paymentSessionId: payment_session_id,
        redirectTarget: "_modal",
      };

      const result = await cashfree.checkout(checkoutOptions);

      setTimeout(async () => {
        if (isCompleted) return;
        try {
          const statusRes = await cashfreeService.getOrderStatus(order_id);
          if (statusRes && (statusRes.isPaid || statusRes.status === "Success")) {
            isCompleted = true;
            clearInterval(pollInterval);
            recordConfirmedLocally(order_id, statusRes);
            window.location.href = `/payment-status?order_id=${encodeURIComponent(order_id)}`;
            return;
          }
        } catch (e) {}
      }, 1000);

      if (result && result.error) {
        console.warn("Cashfree checkout notice:", result.error);
        if (result.error.message && !result.error.message.toLowerCase().includes("closed")) {
          clearInterval(pollInterval);
          return { success: false, message: result.error.message };
        }
      }

      if (result && (result.paymentDetails || result.redirect)) {
        isCompleted = true;
        clearInterval(pollInterval);
        recordConfirmedLocally(order_id);
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
