import { fastCache } from "./fast-cache";

const API_BASE = "/api";

export function getAuthHeaders(extraHeaders = {}) {
  let token = null;
  if (typeof window !== "undefined") {
    const path = window.location.pathname || "";
    const isCmsRoute = path.startsWith("/dashboard") || path.startsWith("/site-maker");
    const isOwnerRoute = path.startsWith("/admin-panel") || path.startsWith("/admin-login") || path.startsWith("/owner");

    try {
      const oUser = JSON.parse(sessionStorage.getItem("turfOwnerUser") || localStorage.getItem("turfOwnerUser") || "{}");
      const cUser = JSON.parse(sessionStorage.getItem("sportx_cms_user") || sessionStorage.getItem("cmsAdminUser") || localStorage.getItem("cmsAdminUser") || "{}");
      const pUser = JSON.parse(sessionStorage.getItem("playerUser") || localStorage.getItem("playerUser") || "{}");

      if (isCmsRoute) {
        token =
          sessionStorage.getItem("sportx_cms_token") ||
          cUser.token ||
          sessionStorage.getItem("cmsAdminToken") ||
          localStorage.getItem("cmsAdminToken") ||
          (cUser && (cUser.role || cUser.username || cUser.email) ? `cms_admin_${encodeURIComponent(cUser.username || cUser.email || "admin")}` : "cms_admin_master_session");
      } else if (isOwnerRoute) {
        token =
          sessionStorage.getItem("sportx_owner_token") ||
          sessionStorage.getItem("turfOwnerToken") ||
          oUser.token ||
          localStorage.getItem("turfOwnerToken") ||
          (oUser && (oUser.email || oUser.ownerId || oUser.fullName) ? `owner_session_${encodeURIComponent(oUser.email || oUser.ownerId || "owner")}` : (sessionStorage.getItem("token") || localStorage.getItem("token") || localStorage.getItem("authToken")));
      } else {
        token =
          sessionStorage.getItem("playerToken") ||
          sessionStorage.getItem("token") ||
          pUser.token ||
          localStorage.getItem("playerToken") ||
          localStorage.getItem("token") ||
          localStorage.getItem("authToken");
      }

      if (!token) {
        token =
          sessionStorage.getItem("sportx_cms_token") ||
          sessionStorage.getItem("token") ||
          cUser.token ||
          oUser.token ||
          pUser.token ||
          localStorage.getItem("token") ||
          localStorage.getItem("authToken");
      }
    } catch (e) {
      token = sessionStorage.getItem("token") || localStorage.getItem("token") || localStorage.getItem("authToken");
    }
  }

  const headers = { ...extraHeaders };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const adminApi = {
  // Generic Entity Fetcher
  getAll: async (entity, params = {}) => {
    try {
      const isOwnerRoute = typeof window !== "undefined" && (window.location.pathname.startsWith("/admin-panel") || window.location.pathname.startsWith("/owner"));

      let activeUser = {};
      if (isOwnerRoute) {
        try {
          activeUser = JSON.parse(sessionStorage.getItem("turfOwnerUser") || localStorage.getItem("turfOwnerUser") || "{}");
        } catch (e) {}
      }

      const isOwnerFiltering = isOwnerRoute && Boolean(activeUser.email || activeUser.fullName);
      const mergedParams = {
        ...(isOwnerFiltering ? {
          ownerEmail: activeUser.email || "",
          ownerName: activeUser.fullName || activeUser.name || "",
        } : {}),
        ...params,
      };

      const cleanParams = new URLSearchParams();
      Object.entries(mergedParams).forEach(([k, v]) => {
        if (v) cleanParams.append(k, v);
      });

      const query = cleanParams.toString();
      const url = query ? `${API_BASE}/admin/${entity}?${query}` : `${API_BASE}/admin/${entity}`;

      let json;
      if (!isOwnerRoute && (entity === "turfs" || entity === "tournaments" || entity === "reviews")) {
        json = await fastCache.fetchWithSWR(url, { headers: getAuthHeaders() });
      } else {
        const res = await fetch(url, { headers: getAuthHeaders() });
        json = await res.json();
      }

      if (!json || !json.success) throw new Error(json?.error || `Failed to fetch ${entity}`);
      let data = json.data;

      // If activeUser is staff and has assigned turfs, filter turfs & bookings
      if (activeUser.isStaff && Array.isArray(data)) {
        let assignedTurfs = [];
        if (Array.isArray(activeUser.turfs) && activeUser.turfs.length > 0) {
          assignedTurfs = activeUser.turfs;
        } else if (activeUser.turf) {
          assignedTurfs = [activeUser.turf];
        }

        if (assignedTurfs.length > 0) {
          if (entity === "turfs" || entity === "turf") {
            const filtered = data.filter((t) =>
              assignedTurfs.some(
                (at) =>
                  String(at).toLowerCase().trim() === String(t.name || "").toLowerCase().trim() ||
                  String(at).toLowerCase().trim() === String(t.id)
              )
            );
            if (filtered.length > 0) data = filtered;
          } else if (entity === "bookings" || entity === "booking") {
            const filtered = data.filter((b) =>
              assignedTurfs.some(
                (at) =>
                  String(at).toLowerCase().trim() === String(b.turf_name || b.venue || "").toLowerCase().trim() ||
                  String(at).toLowerCase().trim() === String(b.turf_id)
              )
            );
            if (filtered.length > 0) data = filtered;
          }
        }
      }
      return data;
    } catch (err) {
      console.error(`adminApi.getAll(${entity}) error:`, err);
      throw err;
    }
  },

  // Generic Single Entity Fetcher
  getById: async (entity, id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/${entity}/${id}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || `Failed to fetch ${entity} item ${id}`);
      return json.data;
    } catch (err) {
      console.error(`adminApi.getById(${entity}, ${id}) error:`, err);
      throw err;
    }
  },

  // Generic Entity Creator
  create: async (entity, data) => {
    try {
      fastCache.invalidateAll();
      const res = await fetch(`${API_BASE}/admin/${entity}`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
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
      fastCache.invalidateAll();
      const res = await fetch(`${API_BASE}/admin/${entity}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
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
      fastCache.invalidateAll();
      const res = await fetch(`${API_BASE}/admin/${entity}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
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
      const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch stats");
      return json;
    } catch (err) {
      console.error("adminApi.getStats error:", err);
      throw err;
    }
  },

  // User Auth APIs
  login: async (email, password, accountType = "player") => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, accountType }),
      });
      const json = await res.json();
      if (json.success && json.token) {
        localStorage.setItem("token", json.token);
      }
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
      if (json.success && json.token) {
        localStorage.setItem("token", json.token);
      }
      return json;
    } catch (err) {
      console.error("adminApi.register error:", err);
      return { success: false, error: err.message || "Network error" };
    }
  },

  checkExists: async ({ email, phone, accountType = "player" }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/check-exists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, accountType }),
      });
      return await res.json();
    } catch (err) {
      console.error("adminApi.checkExists error:", err);
      return { exists: false };
    }
  },

  submitOwnerSetup: async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/auth/owner/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err) {
      console.error("adminApi.submitOwnerSetup error:", err);
      return { success: false, error: err.message || "Network error" };
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
      const json = await res.json();
      if (json.success && json.token) {
        localStorage.setItem("token", json.token);
      }
      return json;
    } catch (err) {
      console.error("adminApi.googleAuth error:", err);
      return { success: false, error: err.message || "Network error" };
    }
  },

  getAccounts: async (accountType = "player") => {
    try {
      const res = await fetch(`${API_BASE}/auth/accounts?accountType=${encodeURIComponent(accountType)}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      return json.accounts || [];
    } catch (err) {
      console.error("adminApi.getAccounts error:", err);
      return [];
    }
  },

  updateProfile: async (userData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/update-profile`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(userData),
      });
      return await res.json();
    } catch (err) {
      console.error("adminApi.updateProfile error:", err);
      return { success: false, error: err.message || "Network error" };
    }
  },

  // Reset Database
  resetDatabase: async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/reset-db`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.error("adminApi.resetDatabase error:", err);
      return { success: false, error: err.message };
    }
  }
};
