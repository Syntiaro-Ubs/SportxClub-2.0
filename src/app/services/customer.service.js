import { adminApi } from "./admin-api";

export const customerService = {
  getAll: async (ownerId, params = {}) => {
    try {
      const result = await adminApi.getAll("users", params);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Error fetching customer:", error);
      return [];
    }
  },
  getById: async (ownerId, id) => {
    try {
      return await adminApi.getById("users", id);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      return null;
    }
  },
  create: async (ownerId, data) => {
    return await adminApi.create("users", data);
  },
  update: async (ownerId, id, data) => {
    return await adminApi.update("users", id, data);
  },
  delete: async (ownerId, id) => {
    return await adminApi.delete("users", id);
  },
};
