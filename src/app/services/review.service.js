import { adminApi } from "./admin-api";

export const reviewService = {
  getAll: async (ownerId, params = {}) => {
    try {
      const result = await adminApi.getAll("reviews", params);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  },
  getById: async (ownerId, id) => {
    try {
      return await adminApi.getById("reviews", id);
    } catch (error) {
      console.error("Error fetching review details:", error);
      return null;
    }
  },
  create: async (ownerId, data) => {
    return await adminApi.create("reviews", data);
  },
  update: async (ownerId, id, data) => {
    return await adminApi.update("reviews", id, data);
  },
  delete: async (ownerId, id) => {
    return await adminApi.delete("reviews", id);
  },
};
