/**
 * CMS Service for interacting with Express + MySQL CMS API (/api/cms/*)
 */
const API_BASE = "/api/cms";

export const cmsService = {
  // Auth
  login: async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "CMS Login failed");
    }
    return data;
  },

  // Sections
  getSections: async () => {
    const res = await fetch(`${API_BASE}/sections`);
    const data = await res.json();
    return data.data || [];
  },

  createSection: async (sectionData) => {
    const res = await fetch(`${API_BASE}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sectionData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to create section");
    return data.data;
  },

  updateSection: async (id, sectionData) => {
    const res = await fetch(`${API_BASE}/sections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sectionData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to update section");
    return data.data;
  },

  toggleSection: async (id) => {
    const res = await fetch(`${API_BASE}/sections/${id}/toggle`, {
      method: "PUT",
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to toggle section");
    return data.data;
  },

  deleteSection: async (id) => {
    const res = await fetch(`${API_BASE}/sections/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to delete section");
    return data;
  },

  // Banners
  getBanners: async () => {
    const res = await fetch(`${API_BASE}/banners`);
    const data = await res.json();
    return data.data || [];
  },

  createBanner: async (bannerData) => {
    const res = await fetch(`${API_BASE}/banners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bannerData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to create banner");
    return data.data;
  },

  deleteBanner: async (id) => {
    const res = await fetch(`${API_BASE}/banners/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return data;
  },

  // Sports
  getSports: async () => {
    const res = await fetch(`${API_BASE}/sports`);
    const data = await res.json();
    return data.data || [];
  },

  createSport: async (sportData) => {
    const res = await fetch(`${API_BASE}/sports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sportData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to create sport");
    return data.data;
  },

  deleteSport: async (id) => {
    const res = await fetch(`${API_BASE}/sports/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return data;
  },

  // FAQs
  getFaqs: async () => {
    const res = await fetch(`${API_BASE}/faqs`);
    const data = await res.json();
    return data.data || [];
  },

  createFaq: async (faqData) => {
    const res = await fetch(`${API_BASE}/faqs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(faqData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to create FAQ");
    return data.data;
  },

  deleteFaq: async (id) => {
    const res = await fetch(`${API_BASE}/faqs/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return data;
  },

  // Facilities & Equipment
  getFacilities: async () => {
    const res = await fetch(`${API_BASE}/facilities`);
    const data = await res.json();
    return data.data || [];
  },

  createFacility: async (facilityData) => {
    const res = await fetch(`${API_BASE}/facilities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(facilityData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to create facility card");
    return data.data;
  },

  deleteFacility: async (id) => {
    const res = await fetch(`${API_BASE}/facilities/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return data;
  },

  // Offers
  getOffers: async () => {
    const res = await fetch(`${API_BASE}/offers`);
    const data = await res.json();
    return data.data || [];
  },

  createOffer: async (offerData) => {
    const res = await fetch(`${API_BASE}/offers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(offerData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to create offer");
    return data.data;
  },

  updateOffer: async (id, offerData) => {
    const res = await fetch(`${API_BASE}/offers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(offerData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to update offer");
    return data.data;
  },

  deleteOffer: async (id) => {
    const res = await fetch(`${API_BASE}/offers/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return data;
  },

  // Gallery
  getGallery: async () => {
    const res = await fetch(`${API_BASE}/gallery`);
    const data = await res.json();
    return data.data || [];
  },

  createGallery: async (galleryData) => {
    const res = await fetch(`${API_BASE}/gallery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(galleryData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to create gallery item");
    return data.data;
  },

  updateGallery: async (id, galleryData) => {
    const res = await fetch(`${API_BASE}/gallery/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(galleryData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to update gallery item");
    return data.data;
  },

  deleteGallery: async (id) => {
    const res = await fetch(`${API_BASE}/gallery/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return data;
  },

  // Why Cards
  getWhyCards: async () => {
    const res = await fetch(`${API_BASE}/why-cards`);
    const data = await res.json();
    return data.data || [];
  },

  createWhyCard: async (whyData) => {
    const res = await fetch(`${API_BASE}/why-cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(whyData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to create feature card");
    return data.data;
  },

  updateWhyCard: async (id, whyData) => {
    const res = await fetch(`${API_BASE}/why-cards/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(whyData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to update feature card");
    return data.data;
  },

  deleteWhyCard: async (id) => {
    const res = await fetch(`${API_BASE}/why-cards/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return data;
  },

  // Events
  getEvents: async () => {
    const res = await fetch(`${API_BASE}/events`);
    const data = await res.json();
    return data.data || [];
  },

  createEvent: async (eventData) => {
    const res = await fetch(`${API_BASE}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to create tournament event");
    return data.data;
  },

  updateEvent: async (id, eventData) => {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to update tournament event");
    return data.data;
  },

  deleteEvent: async (id) => {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return data;
  },

  // Community Feed Posts
  getPosts: async () => {
    const res = await fetch(`${API_BASE}/posts`);
    const data = await res.json();
    return data.data || [];
  },

  createPost: async (postData) => {
    const res = await fetch(`${API_BASE}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to create community post");
    return data.data;
  },

  updatePost: async (id, postData) => {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to update community post");
    return data.data;
  },

  deletePost: async (id) => {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return data;
  },
};
