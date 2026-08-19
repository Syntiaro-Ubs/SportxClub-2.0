const API_BASE = "/api/profile";

const identityParams = (user) => {
  const params = new URLSearchParams();
  if (user?.id !== undefined && user?.id !== null) params.set("userId", user.id);
  if (user?.email) params.set("email", user.email);
  return params;
};

async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }
    if (!response.ok || !data?.success) {
      throw new Error(data?.error || `Server error (${response.status}: ${response.statusText || "Request failed"})`);
    }
    return data;
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error("Unable to connect to backend server. Please make sure the server is running.");
    }
    throw err;
  }
}

export const profileService = {
  get: async (user) => {
    const data = await request(`?${identityParams(user).toString()}`);
    return data.data;
  },

  topUp: async (user, amount) => {
    const data = await request("/wallet/top-up", {
      method: "POST",
      body: JSON.stringify({ userId: user?.id, email: user?.email, amount }),
    });
    return data.data;
  },

  purchase: async (user, productId) => {
    const data = await request("/shop/purchase", {
      method: "POST",
      body: JSON.stringify({ userId: user?.id, email: user?.email, productId }),
    });
    return data.data;
  },

  cancelBooking: async (user, bookingId) => {
    const data = await request(`/bookings/${bookingId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ userId: user?.id, email: user?.email }),
    });
    return data.data;
  },
};
