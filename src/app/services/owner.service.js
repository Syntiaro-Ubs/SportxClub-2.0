import { adminApi } from "./admin-api";

export const ownerService = {
  getAll: async (ownerId, params = {}) => {
    try {
      const result = await adminApi.getAll("turf-owners", params);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Error fetching owner:", error);
      return [];
    }
  },
  getById: async (ownerId, id) => {
    try {
      return await adminApi.getById("turf-owners", id);
    } catch (error) {
      console.error("Error fetching owner details:", error);
      return null;
    }
  },
  create: async (ownerId, data) => {
    return await adminApi.create("turf-owners", data);
  },
  update: async (ownerId, id, data) => {
    return await adminApi.update("turf-owners", id, data);
  },
  delete: async (ownerId, id) => {
    return await adminApi.delete("turf-owners", id);
  },
};
