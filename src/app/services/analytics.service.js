import { adminApi } from "./admin-api";

export const analyticsService = {
  getAll: async (ownerId, params = {}) => {
    try {
      const result = await adminApi.getAll("reports", params);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return [];
    }
  },
  getById: async (ownerId, id) => {
    try {
      return await adminApi.getById("reports", id);
    } catch (error) {
      console.error("Error fetching analytics details:", error);
      return null;
    }
  },
  create: async (ownerId, data) => {
    return await adminApi.create("reports", data);
  },
  update: async (ownerId, id, data) => {
    return await adminApi.update("reports", id, data);
  },
  delete: async (ownerId, id) => {
    return await adminApi.delete("reports", id);
  },
};
