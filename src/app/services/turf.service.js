import { getAuthHeaders } from "./admin-api";

/**
 * Turf Service connecting to Express + MySQL Backend
 */
const API_BASE = "/api/admin";

export const turfService = {
  getAll: async (params = {}) => {
    try {
      const isOwnerRoute = typeof window !== "undefined" && (window.location.pathname.startsWith("/admin-panel") || window.location.pathname.startsWith("/owner"));

      let activeUser = {};
      if (isOwnerRoute) {
        try {
          activeUser = JSON.parse(localStorage.getItem("turfOwnerUser") || "{}");
        } catch (e) {}
      }

      const isOwnerFiltering = isOwnerRoute && Boolean(activeUser.email || activeUser.fullName);
      const mergedParams = {
        ...(isOwnerFiltering ? {
          ownerEmail: activeUser.email || "",
          ownerName: activeUser.fullName || activeUser.name || "",
        } : {}),
        ...params,
      };

      const cleanParams = new URLSearchParams();
      Object.entries(mergedParams).forEach(([k, v]) => {
        if (v) cleanParams.append(k, v);
      });

      const query = cleanParams.toString();
      const url = query ? `${API_BASE}/turfs?${query}` : `${API_BASE}/turfs`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.error("Error fetching turfs from MySQL:", error);
      throw error;
    }
  },

  getById: async (ownerId, id) => {
    try {
      const turfs = await turfService.getAll();
      const item = (turfs || []).find((t) => String(t.id) === String(id));
      return item || null;
    } catch (error) {
      console.error("Error fetching turf details:", error);
      throw error;
    }
  },

  create: async (ownerId, data) => {
    try {
      let activeUser = {};
      try {
        activeUser = JSON.parse(localStorage.getItem("turfOwnerUser") || "{}");
      } catch (e) {}

      const payload = {
        name: data.name || "New Turf",
        location: data.location || "Location",
        sport_type: data.sportType || data.sport_type || "Football",
        price_per_hour: Number(data.price || data.price_per_hour || 1200),
        rating: Number(data.rating !== undefined && data.rating !== null ? data.rating : 0),
        reviews: Number(data.reviews !== undefined && data.reviews !== null ? data.reviews : 0),
        status: data.status || "Active",
        owner_name: data.owner_name || activeUser.fullName || activeUser.name || "Owner",
        owner_email: data.owner_email || data.email || activeUser.email || "",
        owner_phone: data.contactNumber || data.owner_phone || activeUser.phone || "",
        image_url: data.image || data.image_url || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600",
        gallery: Array.isArray(data.gallery) ? JSON.stringify(data.gallery) : (data.gallery || JSON.stringify([data.image || data.image_url || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600"])),
        description: data.description || "",
        amenities: Array.isArray(data.amenities) ? JSON.stringify(data.amenities) : (data.amenities || "[]"),
        rules: data.rules || "",
        display_order: Number(data.display_order || 0),
      };

      const response = await fetch(`${API_BASE}/turfs`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error("Error creating turf in MySQL:", error);
      throw error;
    }
  },

  update: async (ownerId, id, data) => {
    try {
      const payload = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.location !== undefined) payload.location = data.location;
      if (data.sportType || data.sport_type) payload.sport_type = data.sportType || data.sport_type;
      if (data.price_per_hour !== undefined || data.price !== undefined) {
        payload.price_per_hour = Number(data.price_per_hour !== undefined ? data.price_per_hour : data.price);
      }
      if (data.rating !== undefined) payload.rating = Number(data.rating);
      if (data.reviews !== undefined || data.reviews_count !== undefined) payload.reviews = Number(data.reviews ?? data.reviews_count);
      if (data.status !== undefined) payload.status = data.status;
      if (data.owner_name !== undefined) payload.owner_name = data.owner_name;
      if (data.owner_email !== undefined || data.email !== undefined) payload.owner_email = data.owner_email || data.email;
      if (data.contactNumber || data.owner_phone) payload.owner_phone = data.contactNumber || data.owner_phone;
      if (data.image || data.image_url) payload.image_url = data.image || data.image_url;
      if (data.gallery !== undefined) {
        payload.gallery = Array.isArray(data.gallery) ? JSON.stringify(data.gallery) : data.gallery;
      }
      if (data.description !== undefined) payload.description = data.description;
      if (data.amenities !== undefined) {
        payload.amenities = Array.isArray(data.amenities) ? JSON.stringify(data.amenities) : data.amenities;
      }
      if (data.rules !== undefined) payload.rules = data.rules;
      if (data.opening_time !== undefined || data.openingTime !== undefined) payload.opening_time = data.opening_time || data.openingTime;
      if (data.closing_time !== undefined || data.closingTime !== undefined) payload.closing_time = data.closing_time || data.closingTime;
      if (data.slot_duration !== undefined || data.slotDuration !== undefined) payload.slot_duration = Number(data.slot_duration || data.slotDuration || 60);
      if (data.peak_start_time !== undefined || data.peakStartTime !== undefined) payload.peak_start_time = data.peak_start_time || data.peakStartTime;
      if (data.peak_end_time !== undefined || data.peakEndTime !== undefined) payload.peak_end_time = data.peak_end_time || data.peakEndTime;
      if (data.peak_price !== undefined || data.peakPrice !== undefined) {
        payload.peak_price = (data.peak_price || data.peakPrice) ? Number(data.peak_price || data.peakPrice) : null;
      }
      if (data.operational_days !== undefined || data.operationalDays !== undefined) {
        const days = data.operational_days || data.operationalDays;
        payload.operational_days = Array.isArray(days) ? days.join(",") : days;
      }
      if (data.display_order !== undefined) payload.display_order = Number(data.display_order);
      if (data.all_display_order !== undefined) payload.all_display_order = Number(data.all_display_order);

      const response = await fetch(`${API_BASE}/turfs/${id}`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error("Error updating turf in MySQL:", error);
      throw error;
    }
  },

  reorder: async (items) => {
    try {
      const payload = items.map((item, index) => ({
        id: item.id,
        display_order: index + 1,
      }));
      const res = await fetch(`${API_BASE}/turfs/reorder`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ items: payload, type: "recommended" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed reordering turfs");
      return true;
    } catch (error) {
      console.error("Error reordering turfs:", error);
      throw error;
    }
  },

  reorderAll: async (items) => {
    try {
      const payload = items.map((item, index) => ({
        id: item.id,
        all_display_order: index + 1,
      }));
      const res = await fetch(`${API_BASE}/turfs/reorder`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ items: payload, type: "all" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed reordering all turfs");
      return true;
    } catch (error) {
      console.error("Error reordering all turfs:", error);
      throw error;
    }
  },

  resetOrder: async (type = "recommended") => {
    try {
      const res = await fetch(`${API_BASE}/turfs/reset-order`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ type }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed resetting turf sequence");
      return true;
    } catch (error) {
      console.error("Error resetting turf sequence:", error);
      throw error;
    }
  },

  delete: async (ownerId, id) => {
    try {
      const response = await fetch(`${API_BASE}/turfs/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const json = await response.json();
      return json.id;
    } catch (error) {
      console.error("Error deleting turf in MySQL:", error);
      throw error;
    }
  },
};
