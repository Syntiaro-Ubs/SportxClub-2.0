import { adminApi } from "./admin-api";

export const promotionsService = {
  getAll: async (ownerId, params = {}) => {
    try {
      const result = await adminApi.getAll("coupons", params);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Error fetching promotions:", error);
      return [];
    }
  },
  getById: async (ownerId, id) => {
    try {
      return await adminApi.getById("coupons", id);
    } catch (error) {
      console.error("Error fetching promotions details:", error);
      return null;
    }
  },
  create: async (ownerId, data) => {
    return await adminApi.create("coupons", data);
  },
  update: async (ownerId, id, data) => {
    return await adminApi.update("coupons", id, data);
  },
  delete: async (ownerId, id) => {
    return await adminApi.delete("coupons", id);
  },
};
