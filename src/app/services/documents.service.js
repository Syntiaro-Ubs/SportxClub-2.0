import { adminApi } from "./admin-api";

export const documentsService = {
  getAll: async (ownerId, params = {}) => {
    try {
      const result = await adminApi.getAll("documents", params);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Error fetching documents:", error);
      return [];
    }
  },
  getById: async (ownerId, id) => {
    try {
      return await adminApi.getById("documents", id);
    } catch (error) {
      console.error("Error fetching documents details:", error);
      return null;
    }
  },
  create: async (ownerId, data) => {
    return await adminApi.create("documents", data);
  },
  update: async (ownerId, id, data) => {
    return await adminApi.update("documents", id, data);
  },
  delete: async (ownerId, id) => {
    return await adminApi.delete("documents", id);
  },
};
