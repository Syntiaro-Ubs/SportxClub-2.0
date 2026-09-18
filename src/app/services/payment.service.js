import { adminApi } from "./admin-api";

export const paymentService = {
  getAll: async (ownerId, params = {}) => {
    try {
      const result = await adminApi.getAll("payments", params);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Error fetching payment:", error);
      return [];
    }
  },
  getById: async (ownerId, id) => {
    try {
      return await adminApi.getById("payments", id);
    } catch (error) {
      console.error("Error fetching payment details:", error);
      return null;
    }
  },
  create: async (ownerId, data) => {
    return await adminApi.create("payments", data);
  },
  update: async (ownerId, id, data) => {
    return await adminApi.update("payments", id, data);
  },
  delete: async (ownerId, id) => {
    return await adminApi.delete("payments", id);
  },
};
