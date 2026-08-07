/**
 * Turf Service connecting to Express + MySQL Backend
 */
const API_BASE = "/api/admin";

export const turfService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/turfs`);
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
      const response = await fetch(`${API_BASE}/turfs`);
      if (!response.ok) throw new Error("Network response was not ok");
      const json = await response.json();
      const item = (json.data || []).find((t) => String(t.id) === String(id));
      return item || null;
    } catch (error) {
      console.error("Error fetching turf details:", error);
      throw error;
    }
  },

  create: async (ownerId, data) => {
    try {
      const payload = {
        name: data.name || "New Turf",
        location: data.location || "Location",
        sport_type: data.sportType || data.sport_type || "Football",
        price_per_hour: Number(data.price || data.price_per_hour || 1200),
        rating: Number(data.rating || 4.8),
        reviews: Number(data.reviews || data.reviews_count || 25),
        status: data.status || "Active",
        owner_name: data.owner_name || "Owner",
        owner_phone: data.contactNumber || data.owner_phone || "",
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
