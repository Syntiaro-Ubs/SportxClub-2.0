import { adminApi, getAuthHeaders } from "./admin-api";

const API_BASE = "/api";

export const settingsService = {
  getSettings: async (params = {}) => {
    try {
      const isOwnerRoute = typeof window !== "undefined" && (window.location.pathname.startsWith("/admin-panel") || window.location.pathname.startsWith("/owner"));
      let activeUser = {};
      if (isOwnerRoute) {
        try {
          activeUser = JSON.parse(
            sessionStorage.getItem("turfOwnerUser") ||
            localStorage.getItem("turfOwnerUser") ||
            "{}"
          );
        } catch (e) {}
      }

      const mergedParams = {
        ...(activeUser.email ? { ownerEmail: activeUser.email } : {}),
        ...(activeUser.id ? { id: activeUser.id } : {}),
        ...(activeUser.fullName ? { ownerName: activeUser.fullName } : {}),
        ...params,
      };

      const cleanParams = new URLSearchParams();
      Object.entries(mergedParams).forEach(([k, v]) => {
        if (v) cleanParams.append(k, v);
      });

      const query = cleanParams.toString();
      const url = query ? `${API_BASE}/owner/settings?${query}` : `${API_BASE}/owner/settings`;
      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch owner settings");
      return json.data;
    } catch (err) {
      console.error("settingsService.getSettings error:", err);
      throw err;
    }
  },

  updateSettings: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/owner/settings`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update owner settings");
      return json.data;
    } catch (err) {
      console.error("settingsService.updateSettings error:", err);
      throw err;
    }
  },

  getAll: async (ownerId, params = {}) => {
    try {
      return await settingsService.getSettings(params);
    } catch (error) {
      console.error("Error fetching settings:", error);
      return null;
    }
  },
  getById: async (ownerId, id) => {
    try {
      return await adminApi.getById("turf-owners", id);
    } catch (error) {
      console.error("Error fetching settings details:", error);
      return null;
    }
  },
  create: async (ownerId, data) => {
    return await adminApi.create("turf-owners", data);
  },
  update: async (ownerId, id, data) => {
    return await settingsService.updateSettings(data);
  },
  delete: async (ownerId, id) => {
    return await adminApi.delete("turf-owners", id);
  },
};
