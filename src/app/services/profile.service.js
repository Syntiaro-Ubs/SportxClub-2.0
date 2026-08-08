const API_BASE = "/api/profile";

const identityParams = (user) => {
  const params = new URLSearchParams();
  if (user?.id !== undefined && user?.id !== null) params.set("userId", user.id);
  if (user?.email) params.set("email", user.email);
  return params;
};

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || "Profile request failed");
  return data;
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
