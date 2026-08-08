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
      const response = await fetch(url);
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
        rating: Number(data.rating || 4.8),
        reviews: Number(data.reviews || data.reviews_count || 25),
        status: data.status || "Active",
        owner_name: data.owner_name || activeUser.fullName || activeUser.name || "Owner",
        owner_email: data.owner_email || activeUser.email || "",
        owner_phone: data.contactNumber || data.owner_phone || activeUser.phone || "",
        image_url: data.image || data.image_url || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600",
        display_order: Number(data.display_order || 0),
      };

      const response = await fetch(`${API_BASE}/turfs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (data.price || data.price_per_hour) payload.price_per_hour = Number(data.price || data.price_per_hour);
      if (data.rating !== undefined) payload.rating = Number(data.rating);
      if (data.reviews !== undefined || data.reviews_count !== undefined) payload.reviews = Number(data.reviews ?? data.reviews_count);
      if (data.status !== undefined) payload.status = data.status;
      if (data.owner_name !== undefined) payload.owner_name = data.owner_name;
      if (data.contactNumber || data.owner_phone) payload.owner_phone = data.contactNumber || data.owner_phone;
      if (data.image || data.image_url) payload.image_url = data.image || data.image_url;
      if (data.display_order !== undefined) payload.display_order = Number(data.display_order);
      if (data.all_display_order !== undefined) payload.all_display_order = Number(data.all_display_order);

      const response = await fetch(`${API_BASE}/turfs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
      const updatePromises = items.map((item, index) =>
        fetch(`${API_BASE}/turfs/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_order: index + 1 }),
        })
      );
      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error("Error reordering turfs:", error);
      throw error;
    }
  },

  reorderAll: async (items) => {
    try {
      const updatePromises = items.map((item, index) =>
        fetch(`${API_BASE}/turfs/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ all_display_order: index + 1 }),
        })
      );
      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error("Error reordering all turfs:", error);
      throw error;
    }
  },

  delete: async (ownerId, id) => {
    try {
      const response = await fetch(`${API_BASE}/turfs/${id}`, {
        method: "DELETE",
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
