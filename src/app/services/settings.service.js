// TODO: Implement actual endpoint when ready
const API_BASE = "/api/owner";

/**
 * Service for settings
 * All requests must include ownerId to ensure data isolation.
 */
export const settingsService = {
  getAll: async (ownerId, params) => {
    try {
      const queryParams = new URLSearchParams({
        ownerId,
        ...params,
      }).toString();
      const response = await fetch(`${API_BASE}/settings?${queryParams}`);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw error;
    }
  },
  getById: async (ownerId, id) => {
    try {
      const response = await fetch(
        `${API_BASE}/settings/${id}?ownerId=${ownerId}`,
      );
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error fetching settings details:", error);
      throw error;
    }
  },
  create: async (ownerId, data) => {
    try {
      const response = await fetch(`${API_BASE}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ownerId }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error creating settings:", error);
      throw error;
    }
  },
  update: async (ownerId, id, data) => {
    try {
      const response = await fetch(`${API_BASE}/settings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ownerId }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  },
  delete: async (ownerId, id) => {
    try {
      const response = await fetch(
        `${API_BASE}/settings/${id}?ownerId=${ownerId}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error deleting settings:", error);
      throw error;
    }
  },
};
