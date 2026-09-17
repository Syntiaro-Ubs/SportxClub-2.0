import { getAuthHeaders } from "./admin-api";

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
    const res = await fetch(`${API_BASE}/sections`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  },

  createSection: async (sectionData) => {
    const res = await fetch(`${API_BASE}/sections`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(sectionData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to create section");
    return data.data;
  },

  updateSection: async (id, sectionData) => {
    const res = await fetch(`${API_BASE}/sections/${id}`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(sectionData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to update section");
    return data.data;
  },

  toggleSection: async (id) => {
    const res = await fetch(`${API_BASE}/sections/${id}/toggle`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to toggle section");
    return data.data;
  },

  deleteSection: async (id) => {
    const res = await fetch(`${API_BASE}/sections/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete section");
    return data;
  },

  // Banners
  getBanners: async () => {
    const res = await fetch(`${API_BASE}/banners`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  },

  createBanner: async (bannerData) => {
    const res = await fetch(`${API_BASE}/banners`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(bannerData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to create banner");
    return data.data;
  },

  createBanners: async (bannersData) => {
    const res = await fetch(`${API_BASE}/banners`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(bannersData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to create banners");
    return data.data;
  },

  updateBanner: async (id, bannerData) => {
    const res = await fetch(`${API_BASE}/banners/${id}`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(bannerData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to update banner");
    return data.data;
  },

  deleteBanner: async (id) => {
    const res = await fetch(`${API_BASE}/banners/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete banner");
    return data;
  },

  // Sports
  getSports: async () => {
    const res = await fetch(`${API_BASE}/sports`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  },

  createSport: async (sportData) => {
    const res = await fetch(`${API_BASE}/sports`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(sportData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to create sport");
    return data.data;
  },

  deleteSport: async (id) => {
    const res = await fetch(`${API_BASE}/sports/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete sport");
    return data;
  },

  // FAQs
  getFaqs: async () => {
    const res = await fetch(`${API_BASE}/faqs`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  },

  createFaq: async (faqData) => {
    const res = await fetch(`${API_BASE}/faqs`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(faqData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to create FAQ");
    return data.data;
  },

  deleteFaq: async (id) => {
    const res = await fetch(`${API_BASE}/faqs/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete FAQ");
    return data;
  },

  // Facilities & Equipment
  getFacilities: async () => {
    const res = await fetch(`${API_BASE}/facilities`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  },

  createFacility: async (facilityData) => {
    const res = await fetch(`${API_BASE}/facilities`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(facilityData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to create facility card");
    return data.data;
  },

  deleteFacility: async (id) => {
    const res = await fetch(`${API_BASE}/facilities/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete facility card");
    return data;
  },

  // Offers
  getOffers: async () => {
    const res = await fetch(`${API_BASE}/offers`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  },

  createOffer: async (offerData) => {
    const res = await fetch(`${API_BASE}/offers`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(offerData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to create offer");
    return data.data;
  },

  updateOffer: async (id, offerData) => {
    const res = await fetch(`${API_BASE}/offers/${id}`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(offerData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to update offer");
    return data.data;
  },

  deleteOffer: async (id) => {
    const res = await fetch(`${API_BASE}/offers/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete offer");
    return data;
  },

  // Gallery
  getGallery: async () => {
    const res = await fetch(`${API_BASE}/gallery`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  },

  createGallery: async (galleryData) => {
    const res = await fetch(`${API_BASE}/gallery`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(galleryData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to create gallery item");
    return data.data;
  },

  updateGallery: async (id, galleryData) => {
    const res = await fetch(`${API_BASE}/gallery/${id}`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(galleryData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to update gallery item");
    return data.data;
  },

  deleteGallery: async (id) => {
    const res = await fetch(`${API_BASE}/gallery/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete gallery item");
    return data;
  },

  // Why Cards
  getWhyCards: async () => {
    const res = await fetch(`${API_BASE}/why-cards`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  },

  createWhyCard: async (whyData) => {
    const res = await fetch(`${API_BASE}/why-cards`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(whyData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to create feature card");
    return data.data;
  },

  updateWhyCard: async (id, whyData) => {
    const res = await fetch(`${API_BASE}/why-cards/${id}`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(whyData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to update feature card");
    return data.data;
  },

  deleteWhyCard: async (id) => {
    const res = await fetch(`${API_BASE}/why-cards/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete feature card");
    return data;
  },

  // Testimonials
  getTestimonials: async () => {
    const res = await fetch(`${API_BASE}/testimonials`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  },

  createTestimonial: async (testimonialData) => {
    const res = await fetch(`${API_BASE}/testimonials`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(testimonialData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to create testimonial");
    return data.data;
  },

  deleteTestimonial: async (id) => {
    const res = await fetch(`${API_BASE}/testimonials/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete testimonial");
    return data;
  },

  // Events
  getEvents: async () => {
    const res = await fetch(`${API_BASE}/events`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  },

  createEvent: async (eventData) => {
    const res = await fetch(`${API_BASE}/events`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(eventData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to create tournament event");
    return data.data;
  },

  updateEvent: async (id, eventData) => {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(eventData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to update tournament event");
    return data.data;
  },

  deleteEvent: async (id) => {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete tournament event");
    return data;
  },

  // Community Feed Posts
  getPosts: async (user) => {
    const params = new URLSearchParams();
    if (user?.id !== undefined && user?.id !== null) params.set("userId", user.id);
    if (user?.email) params.set("email", user.email);
    const query = params.toString();
    const res = await fetch(`${API_BASE}/posts${query ? `?${query}` : ""}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  },

  createPost: async (postData) => {
    const res = await fetch(`${API_BASE}/posts`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(postData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to create community post");
    return data.data;
  },

  togglePostLike: async (id, user) => {
    const res = await fetch(`${API_BASE}/posts/${id}/like`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ userId: user?.id, email: user?.email }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to update like");
    return data.data;
  },

  getPostComments: async (id) => {
    const res = await fetch(`${API_BASE}/posts/${id}/comments`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to load comments");
    return data.data || [];
  },

  addPostComment: async (id, user, text) => {
    const res = await fetch(`${API_BASE}/posts/${id}/comments`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ userId: user?.id, email: user?.email, text }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to add comment");
    return data.data;
  },

  recordPostShare: async (id, user, platform) => {
    const res = await fetch(`${API_BASE}/posts/${id}/share`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ userId: user?.id, email: user?.email, platform }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to record share");
    return data.data;
  },

  updatePost: async (id, postData) => {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(postData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to update community post");
    return data.data;
  },

  deletePost: async (id) => {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete community post");
    return data;
  },

  // Team & Console User Management
  getTeamMembers: async () => {
    const res = await fetch(`${API_BASE}/team`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to load team members");
    return data.data;
  },

  createTeamMember: async (userData) => {
    const res = await fetch(`${API_BASE}/team`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to create console user");
    return data.data;
  },

  updateTeamMember: async (id, userData) => {
    const res = await fetch(`${API_BASE}/team/${id}`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to update console user");
    return data.data;
  },

  deleteTeamMember: async (id) => {
    const res = await fetch(`${API_BASE}/team/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete console user");
    return data;
  },

  toggleTeamMemberStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/team/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Failed to update user status");
    return data;
  },
};
