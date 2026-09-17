import { adminApi } from "./admin-api";

export const notificationService = {
  getAll: async (ownerId, params = {}) => {
    try {
      const result = await adminApi.getAll("notifications", params);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },
  getById: async (ownerId, id) => {
    try {
      return await adminApi.getById("notifications", id);
    } catch (error) {
      console.error("Error fetching notification details:", error);
      return null;
    }
  },
  create: async (ownerId, data) => {
    return await adminApi.create("notifications", data);
  },
  update: async (ownerId, id, data) => {
    return await adminApi.update("notifications", id, data);
  },
  delete: async (ownerId, id) => {
    return await adminApi.delete("notifications", id);
  },
};
