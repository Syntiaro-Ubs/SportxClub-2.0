import { adminApi } from "./admin-api";

/**
 * Service for booking
 * All requests seamlessly integrate with adminApi and MySQL database.
 */
export const bookingService = {
  getAll: async (ownerId, params = {}) => {
    try {
      const result = await adminApi.getAll("bookings", params);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Error fetching booking:", error);
      return [];
    }
  },
  getById: async (ownerId, id) => {
    try {
      return await adminApi.getById("bookings", id);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      return null;
    }
  },
  create: async (ownerId, data) => {
    try {
      return await adminApi.create("bookings", data);
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  },
  update: async (ownerId, id, data) => {
    try {
      return await adminApi.update("bookings", id, data);
    } catch (error) {
      console.error("Error updating booking:", error);
      throw error;
    }
  },
  delete: async (ownerId, id) => {
    try {
      return await adminApi.delete("bookings", id);
    } catch (error) {
      console.error("Error deleting booking:", error);
      throw error;
    }
  },
};
