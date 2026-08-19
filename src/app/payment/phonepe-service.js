const API_BASE = "http://localhost:5000/api/payment/phonepe";

export const phonepeService = {
  /**
   * Initiate PhonePe Payment Request
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
          turfName: bookingPayload.venue || bookingPayload.turfName || "Elite Sports Arena",
          date: bookingPayload.date || bookingPayload.selectedDate,
          time: bookingPayload.time,
          sport: bookingPayload.sport,
          venueId: bookingPayload.venueId,
        }),
      });

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("phonepeService.initiatePayment error:", err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Verify PhonePe Payment & Save Record/Booking to Database
   */
  verifyPayment: async (merchantTransactionId, status, bookingPayload) => {
    try {
      const response = await fetch(`${API_BASE}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantTransactionId,
          status,
          bookingPayload,
        }),
      });

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("phonepeService.verifyPayment error:", err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Get the actual payment state from PhonePe. Do not trust URL query parameters.
   */
  getPaymentStatus: async (merchantTransactionId) => {
    const response = await fetch(`${API_BASE}/status/${encodeURIComponent(merchantTransactionId)}`);
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not verify the PhonePe payment.");
    }
    return data;
  },

  /**
   * Fetch PhonePe Payment History from MySQL Database
   */
  getHistory: async (email) => {
    try {
      const query = email ? `?email=${encodeURIComponent(email)}` : "";
      const response = await fetch(`${API_BASE}/history${query}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("phonepeService.getHistory error:", err);
      return { success: false, payments: [] };
    }
  },
};
