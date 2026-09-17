const API_BASE = "/api/profile";

const identityParams = (user) => {
  const params = new URLSearchParams();
  if (user?.id !== undefined && user?.id !== null) params.set("userId", user.id);
  if (user?.email) params.set("email", user.email);
  return params;
};

function getAuthHeaders(extraHeaders = {}) {
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token") || localStorage.getItem("authToken");
    if (!token) {
      try {
        const pUser = JSON.parse(localStorage.getItem("playerUser") || "{}");
        const oUser = JSON.parse(localStorage.getItem("turfOwnerUser") || "{}");
        const cUser = JSON.parse(localStorage.getItem("cmsAdminUser") || "{}");
        token = pUser.token || oUser.token || cUser.token;
      } catch (e) {}
    }
  }
  const headers = { "Content-Type": "application/json", ...extraHeaders };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: getAuthHeaders(options.headers || {}),
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

  addReview: async (user, { rating, comment, reviewerName }) => {
    const data = await request("/reviews", {
      method: "POST",
      body: JSON.stringify({
        userId: user?.id,
        email: user?.email,
        rating,
        comment,
        reviewerName,
      }),
    });
    return data.data;
  },

  addMatch: async (user, { venue, sport, matchDate, result, score }) => {
    const data = await request("/matches", {
      method: "POST",
      body: JSON.stringify({
        userId: user?.id,
        email: user?.email,
        venue,
        sport,
        matchDate,
        result,
        score,
      }),
    });
    return data.data;
  },

  cancelBooking: async (user, bookingId, reason, extraDetails = {}) => {
    const data = await request(`/bookings/${bookingId}/cancel`, {
      method: "POST",
      body: JSON.stringify({
        userId: user?.id,
        email: user?.email,
        reason,
        ...extraDetails,
      }),
    });
    return data.data;
  },

  deleteAccount: async (user) => {
    const data = await request("/account", {
      method: "DELETE",
      body: JSON.stringify({ userId: user?.id, email: user?.email }),
    });
    return data;
  },
};

