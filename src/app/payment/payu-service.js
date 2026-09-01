const BACKEND_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const API_BASE = `${BACKEND_BASE}/api/payment/payu`;

export const payuService = {
  /**
   * 1. Initiate PayU Live Payment
   * Generates signed hash and auto-submits form to PayU Live Gateway (https://secure.payu.in/_payment)
   */
  initiatePayment: async (bookingPayload) => {
    try {
      const response = await fetch(`${API_BASE}/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: bookingPayload.price || bookingPayload.amount || 1200,
          userEmail: bookingPayload.userEmail || "user@sportxclub.com",
          userName: bookingPayload.userName || "SportX Player",
          userPhone: bookingPayload.userPhone || "9876543210",
          turfName: bookingPayload.venue || bookingPayload.turfName || "Elite Sports Arena",
          date: bookingPayload.date || bookingPayload.selectedDate,
          time: bookingPayload.time,
          sport: bookingPayload.sport,
          venueId: bookingPayload.venueId,
          bookingCode: bookingPayload.bookingCode,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to initiate PayU payment.");
      }

      const { action, paymentPayload } = data;

      // Create and submit hidden form to redirect directly to PayU Live Checkout
      const form = document.createElement("form");
      form.method = "POST";
      form.action = action || "https://secure.payu.in/_payment";
      form.style.display = "none";

      Object.entries(paymentPayload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        }
      });

      document.body.appendChild(form);
      form.submit();

      return { success: true, txnid: data.txnid };
    } catch (err) {
      console.error("payuService.initiatePayment error:", err);
      return { success: false, message: err.message };
    }
  },

  /**
   * 2. Get PayU Payment and Booking Status
   */
  getPaymentStatus: async (txnid) => {
    try {
      const response = await fetch(`${API_BASE}/status/${encodeURIComponent(txnid)}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("payuService.getPaymentStatus error:", err);
      return { success: false, message: err.message };
    }
  },

  /**
   * 3. Fallback verification route
   */
  verifyPayment: async (txnid, status, bookingPayload) => {
    try {
      const response = await fetch(`${API_BASE}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txnid,
          status,
          bookingPayload,
        }),
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("payuService.verifyPayment error:", err);
      return { success: false, message: err.message };
    }
  },

  /**
   * 4. Fetch Payment History
   */
  getHistory: async (email) => {
    try {
      const query = email ? `?email=${encodeURIComponent(email)}` : "";
      const response = await fetch(`${API_BASE}/history${query}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("payuService.getHistory error:", err);
      return { success: false, payments: [] };
    }
  },
};
