/**
  API Service for communicating with Node.js Express + MySQL Backend
*/

const API_BASE = "/api";

export const adminApi = {
  // Generic Entity Fetcher
  getAll: async (entity) => {
    try {
      const res = await fetch(`${API_BASE}/admin/${entity}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || `Failed to fetch ${entity}`);
      return json.data;
    } catch (err) {
      console.error(`adminApi.getAll(${entity}) error:`, err);
      throw err;
    }
  },

  // Generic Entity Creator
  create: async (entity, data) => {
    try {
      const res = await fetch(`${API_BASE}/admin/${entity}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || `Failed to create item in ${entity}`);
      return json.data;
    } catch (err) {
      console.error(`adminApi.create(${entity}) error:`, err);
      throw err;
    }
  },

  // Generic Entity Updater
  update: async (entity, id, data) => {
    try {
      const res = await fetch(`${API_BASE}/admin/${entity}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || `Failed to update item ${id} in ${entity}`);
      return json.data;
    } catch (err) {
      console.error(`adminApi.update(${entity}, ${id}) error:`, err);
      throw err;
    }
  },

  // Generic Entity Deleter
  delete: async (entity, id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/${entity}/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || `Failed to delete item ${id} from ${entity}`);
      return json.id;
    } catch (err) {
      console.error(`adminApi.delete(${entity}, ${id}) error:`, err);
      throw err;
    }
  },

  // Dashboard Live Stats
  getStats: async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard/stats`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch stats");
      return json;
    } catch (err) {
      console.error("adminApi.getStats error:", err);
      throw err;
    }
  },

  // User Auth APIs
  login: async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.error("adminApi.login error:", err);
      return { success: false, error: err.message || "Network error" };
    }
  },

  register: async (userData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.error("adminApi.register error:", err);
      return { success: false, error: err.message || "Network error" };
    }
  },

  checkExists: async ({ email, phone }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/check-exists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });
      return await res.json();
    } catch (err) {
      console.error("adminApi.checkExists error:", err);
      return { exists: false };
    }
  },

  // OTP & Recovery APIs
  requestOtp: async (identifier, mode = "recovery") => {
    try {
      const res = await fetch(`${API_BASE}/auth/otp/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, mode }),
      });
      return await res.json();
    } catch (err) {
      console.error("adminApi.requestOtp error:", err);
      return { success: false, error: err.message || "Network error" };
    }
  },

  verifyOtp: async (identifier, otp) => {
    try {
      const res = await fetch(`${API_BASE}/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp }),
      });
      return await res.json();
    } catch (err) {
      console.error("adminApi.verifyOtp error:", err);
      return { success: false, error: err.message || "Network error" };
    }
  },

  resetPassword: async (identifier, otp, newPassword) => {
    try {
      const res = await fetch(`${API_BASE}/auth/otp/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp, newPassword }),
      });
      return await res.json();
    } catch (err) {
      console.error("adminApi.resetPassword error:", err);
      return { success: false, error: err.message || "Network error" };
    }
  },

  // Google Auth Endpoint
  googleAuth: async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err) {
      console.error("adminApi.googleAuth error:", err);
      return { success: false, error: err.message || "Network error" };
    }
  },

  getAccounts: async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/accounts`);
      const json = await res.json();
      return json.accounts || [];
    } catch (err) {
      console.error("adminApi.getAccounts error:", err);
      return [];
    }
  },

  // Reset Database
  resetDatabase: async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/reset-db`, {
        method: "POST",
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.error("adminApi.resetDatabase error:", err);
      return { success: false, error: err.message };
    }
  }
};
