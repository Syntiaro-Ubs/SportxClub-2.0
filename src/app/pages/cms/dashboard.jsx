import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Globe,
  ExternalLink,
  ImageIcon,
  Trophy,
  Dumbbell,
  Building,
  HelpCircle,
  Sparkles,
  Layers,
  CheckCircle2,
  Zap,
  MapPin,
  ArrowUp,
  ArrowDown,
  Star,
  MessageSquare,
  RotateCcw,
  Save,
  Search,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { cmsService } from "../../services/cms-service";
import { adminApi } from "../../services/admin-api";
import { turfService } from "../../services/turf.service";

export function CMSDashboard() {
  const navigate = useNavigate();
  const params = useParams();

  // Active view tab ('home-page', 'turfs', 'community', 'team')
  const currentView = params.view || "home-page";
  const validViews = ["home-page", "turfs", "community", "team"];
  const [activeView, setActiveView] = useState(validViews.includes(currentView) ? currentView : "home-page");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (params.view && validViews.includes(params.view)) {
      setActiveView(params.view);
    }
  }, [params.view]);

  const handleNavClick = (viewKey) => {
    setActiveView(viewKey);
    navigate(`/dashboard/${viewKey}`);
  };

  // Data States
  const [sections, setSections] = useState([]);
  const [banners, setBanners] = useState([]);
  const [sports, setSports] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [turfs, setTurfs] = useState([]);
  const [offers, setOffers] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [whyCards, setWhyCards] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [postsList, setPostsList] = useState([]);
  const [postSearchQuery, setPostSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Community Post Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [postForm, setPostForm] = useState({
    author: "",
    time: "Just now",
    content: "",
    image_url: "",
    badge: "Community",
    type: "general",
    likes: 0,
    comments: 0,
    shares: 0,
  });

  // Modal States
  const [isSportModalOpen, setIsSportModalOpen] = useState(false);
  const [editingSport, setEditingSport] = useState(null);
  const [sportForm, setSportForm] = useState({
    name: "",
    icon: "⚽",
    image_url: "",
    badge: "Popular",
    description: "1,200+ venues available"
  });

  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [facilityForm, setFacilityForm] = useState({
    title: "",
    category: "EQUIPMENT",
    image_url: "",
    price: 999.00,
    rating: "4.8",
    badge: "PRO STORE"
  });

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link: "/turfs",
    cta_text: "Book Now"
  });

  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    category: "General"
  });

  const [isTurfModalOpen, setIsTurfModalOpen] = useState(false);
  const [editingTurf, setEditingTurf] = useState(null);
  
  // Section 1: Recommended Venues States
  const [recommendedTurfs, setRecommendedTurfs] = useState([]);
  const [recSearchQuery, setRecSearchQuery] = useState("");
  const [recSortMode, setRecSortMode] = useState("reviews"); // 'reviews' | 'custom'
  const [isSavingRecOrder, setIsSavingRecOrder] = useState(false);

  // Section 2: All Venues States
  const [allVenuesTurfs, setAllVenuesTurfs] = useState([]);
  const [allSearchQuery, setAllSearchQuery] = useState("");
  const [allSortMode, setAllSortMode] = useState("reviews"); // 'reviews' | 'custom'
  const [isSavingAllOrder, setIsSavingAllOrder] = useState(false);

  const [turfForm, setTurfForm] = useState({
    name: "",
    location: "",
    sport_type: "Football, Cricket",
    price_per_hour: 1500,
    rating: "4.8",
    reviews: 50,
    status: "Active",
    owner_name: "Admin Owner",
    owner_phone: "+91 9876543210",
    image_url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600"
  });

  // Helper to sort turfs by highest reviews count (default requirement)
  const sortTurfsByReviews = (items) => {
    return [...items].sort((a, b) => {
      const revA = Number(a.reviews ?? a.reviews_count ?? 0);
      const revB = Number(b.reviews ?? b.reviews_count ?? 0);
      return revB - revA;
    });
  };

  // Offers Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerForm, setOfferForm] = useState({
    tag: "Limited time",
    title: "",
    value: "",
    description: ""
  });

  // Gallery Modal State
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState(null);
  const [galleryForm, setGalleryForm] = useState({
    name: "",
    location: "",
    rating: "4.9",
    reviews: 100,
    image_url: "",
    className: "md:col-span-1 md:row-span-1"
  });

  // Why Cards Modal State
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [editingWhy, setEditingWhy] = useState(null);
  const [whyForm, setWhyForm] = useState({
    title: "",
    description: "",
    icon: "ShieldCheck"
  });

  // Events Modal State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    location: "",
    image_url: ""
  });

  // Load all dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [sec, ban, spo, fac, faq, trfs, off, gal, why, evts, psts] = await Promise.all([
        cmsService.getSections().catch(() => []),
        cmsService.getBanners().catch(() => []),
        cmsService.getSports().catch(() => []),
        cmsService.getFacilities().catch(() => []),
        cmsService.getFaqs().catch(() => []),
        turfService.getAll().catch(() => []),
        cmsService.getOffers().catch(() => []),
        cmsService.getGallery().catch(() => []),
        cmsService.getWhyCards().catch(() => []),
        cmsService.getEvents().catch(() => []),
        cmsService.getPosts().catch(() => []),
      ]);
      setSections(sec);
      setBanners(ban);
      setSports(spo);
      setFacilities(fac);
      setFaqs(faq);

      // Process turfs: Initialize both Recommended Venues and All Venues lists
      let processedTurfs = trfs || [];

      const recList = [...processedTurfs];
      const hasRecCustomOrder = recList.some(t => Number(t.display_order) > 0);
      if (hasRecCustomOrder) {
        recList.sort((a, b) => (Number(a.display_order) || 999) - (Number(b.display_order) || 999));
        setRecSortMode("custom");
      } else {
        recList.sort((a, b) => Number(b.reviews ?? b.reviews_count ?? 0) - Number(a.reviews ?? a.reviews_count ?? 0));
        setRecSortMode("reviews");
      }
      setRecommendedTurfs(recList);

      const allList = [...processedTurfs];
      const hasAllCustomOrder = allList.some(t => Number(t.all_display_order) > 0);
      if (hasAllCustomOrder) {
        allList.sort((a, b) => (Number(a.all_display_order) || 999) - (Number(b.all_display_order) || 999));
        setAllSortMode("custom");
      } else {
        allList.sort((a, b) => Number(b.reviews ?? b.reviews_count ?? 0) - Number(a.reviews ?? a.reviews_count ?? 0));
        setAllSortMode("reviews");
      }
      setAllVenuesTurfs(allList);

      setOffers(off);
      setGallery(gal);
      setWhyCards(why);
      setEventsList(evts);
      setPostsList(psts);
    } catch (err) {
      console.error("Failed loading CMS Console data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("sportx_cms_token");
    if (!token) {
      navigate("/dashboard/login");
      return;
    }
    loadDashboardData();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("sportx_cms_token");
    sessionStorage.removeItem("sportx_cms_user");
    toast.info("Signed out from SportX Console");
    navigate("/dashboard/login");
  };

  // Popular Sports Cards Handlers
  const handleSaveSportCard = async (e) => {
    e.preventDefault();
    try {
      if (!sportForm.name) {
        toast.error("Sport name is required");
        return;
      }
      await cmsService.createSport(sportForm);
      toast.success(editingSport ? "Sport Card updated!" : "New Sport Card added!");
      setIsSportModalOpen(false);
      setEditingSport(null);
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || "Failed saving sport card");
    }
  };

  const handleDeleteSportCard = async (id) => {
    if (!window.confirm("Delete this sport card from Popular Sports?")) return;
    try {
      await cmsService.deleteSport(id);
      toast.success("Sport Card deleted!");
      loadDashboardData();
    } catch (err) {
      toast.error("Failed deleting sport card");
    }
  };

  // Facilities & Equipment Handlers
  const handleSaveFacilityCard = async (e) => {
    e.preventDefault();
    try {
      if (!facilityForm.title || !facilityForm.image_url) {
        toast.error("Title and Image URL are required");
        return;
      }
      await cmsService.createFacility(facilityForm);
      toast.success(editingFacility ? "Facility Card updated!" : "New Equipment/Facility Card added!");
      setIsFacilityModalOpen(false);
      setEditingFacility(null);
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || "Failed saving facility card");
    }
  };

  const handleDeleteFacilityCard = async (id) => {
    if (!window.confirm("Delete this facility/equipment card?")) return;
    try {
      await cmsService.deleteFacility(id);
      toast.success("Facility Card deleted!");
      loadDashboardData();
    } catch (err) {
      toast.error("Failed deleting facility card");
    }
  };

  // Banner Handlers
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    try {
      await cmsService.createBanner(bannerForm);
      toast.success("Hero Banner slide added!");
      setIsBannerModalOpen(false);
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || "Failed adding banner");
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm("Delete banner slide?")) return;
    try {
      await cmsService.deleteBanner(id);
      toast.success("Banner slide deleted!");
      loadDashboardData();
    } catch (err) {
      toast.error("Failed deleting banner");
    }
  };

  // FAQ Handlers
  const handleSaveFaq = async (e) => {
    e.preventDefault();
    try {
      await cmsService.createFaq(faqForm);
      toast.success("FAQ Card added!");
      setIsFaqModalOpen(false);
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || "Failed adding FAQ");
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm("Delete FAQ?")) return;
    try {
      await cmsService.deleteFaq(id);
      toast.success("FAQ deleted!");
      loadDashboardData();
    } catch (err) {
      toast.error("Failed deleting FAQ");
    }
  };

  // Offers Handlers
  const handleSaveOffer = async (e) => {
    e.preventDefault();
    try {
      if (!offerForm.title || !offerForm.value || !offerForm.description) {
        toast.error("Title, Value, and Description are required");
        return;
      }
      if (editingOffer) {
        await cmsService.updateOffer(editingOffer.id, offerForm);
        toast.success("Offer updated!");
      } else {
        await cmsService.createOffer(offerForm);
        toast.success("New Offer added!");
      }
      setIsOfferModalOpen(false);
      setEditingOffer(null);
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || "Failed saving offer");
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm("Delete this offer card?")) return;
    try {
      await cmsService.deleteOffer(id);
      toast.success("Offer deleted!");
      loadDashboardData();
    } catch (err) {
      toast.error("Failed deleting offer");
    }
  };

  // Gallery Handlers
  const handleSaveGalleryItem = async (e) => {
    e.preventDefault();
    try {
      if (!galleryForm.name || !galleryForm.location || !galleryForm.image_url) {
        toast.error("Name, Location, and Image URL are required");
        return;
      }
      if (editingGallery) {
        await cmsService.updateGallery(editingGallery.id, galleryForm);
        toast.success("Gallery item updated!");
      } else {
        await cmsService.createGallery(galleryForm);
        toast.success("New Gallery item added!");
      }
      setIsGalleryModalOpen(false);
      setEditingGallery(null);
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || "Failed saving gallery item");
    }
  };

  const handleDeleteGalleryItem = async (id) => {
    if (!window.confirm("Delete this gallery item?")) return;
    try {
      await cmsService.deleteGallery(id);
      toast.success("Gallery item deleted!");
      loadDashboardData();
    } catch (err) {
      toast.error("Failed deleting gallery item");
    }
  };

  // Why Cards Handlers
  const handleSaveWhyCard = async (e) => {
    e.preventDefault();
    try {
      if (!whyForm.title || !whyForm.description) {
        toast.error("Title and Description are required");
        return;
      }
      if (editingWhy) {
        await cmsService.updateWhyCard(editingWhy.id, whyForm);
        toast.success("Feature card updated!");
      } else {
        await cmsService.createWhyCard(whyForm);
        toast.success("New Feature card added!");
      }
      setIsWhyModalOpen(false);
      setEditingWhy(null);
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || "Failed saving feature card");
    }
  };

  const handleDeleteWhyCard = async (id) => {
    if (!window.confirm("Delete this feature card?")) return;
    try {
      await cmsService.deleteWhyCard(id);
      toast.success("Feature card deleted!");
      loadDashboardData();
    } catch (err) {
      toast.error("Failed deleting feature card");
    }
  };

  // Events Handlers
  const handleSaveEventCard = async (e) => {
    e.preventDefault();
    try {
      if (!eventForm.title || !eventForm.date || !eventForm.location || !eventForm.image_url) {
        toast.error("Title, Date, Location, and Image URL are required");
        return;
      }
      if (editingEvent) {
        await cmsService.updateEvent(editingEvent.id, eventForm);
        toast.success("Tournament event updated!");
      } else {
        await cmsService.createEvent(eventForm);
        toast.success("New Tournament event added!");
      }
      setIsEventModalOpen(false);
      setEditingEvent(null);
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || "Failed saving tournament event");
    }
  };

  const handleDeleteEventCard = async (id) => {
    if (!window.confirm("Delete this tournament event card?")) return;
    try {
      await cmsService.deleteEvent(id);
      toast.success("Tournament event deleted!");
      loadDashboardData();
    } catch (err) {
      toast.error("Failed deleting tournament event");
    }
  };

  // ----------------------------------------------------
  // SECTION 1: Recommended Venues Handlers & Reordering
  // ----------------------------------------------------
  const handleSortRecByDefaultReviews = () => {
    const sorted = sortTurfsByReviews(recommendedTurfs);
    setRecommendedTurfs(sorted);
    setRecSortMode("reviews");
    toast.success("Recommended Venues sorted by most reviews (Default order)");
  };

  const handleMoveRecTurf = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= recommendedTurfs.length) return;
    const list = [...recommendedTurfs];
    const [moved] = list.splice(index, 1);
    list.splice(newIndex, 0, moved);
    setRecommendedTurfs(list);
    setRecSortMode("custom");
    toast.info(`[Recommended] Moved "${moved.name}" to position #${newIndex + 1}. Click 'Save Sequence' to sync.`);
  };

  const handleSetRecTurfPosition = (currentIndex, targetPosStr) => {
    const targetPos = parseInt(targetPosStr, 10);
    if (isNaN(targetPos) || targetPos < 1 || targetPos > recommendedTurfs.length) return;
    const targetIndex = targetPos - 1;
    if (targetIndex === currentIndex) return;
    const list = [...recommendedTurfs];
    const [moved] = list.splice(currentIndex, 1);
    list.splice(targetIndex, 0, moved);
    setRecommendedTurfs(list);
    setRecSortMode("custom");
    toast.info(`[Recommended] Set "${moved.name}" to position #${targetPos}. Click 'Save Sequence' to sync.`);
  };

  const handleSaveRecTurfOrder = async () => {
    try {
      setIsSavingRecOrder(true);
      await turfService.reorder(recommendedTurfs);
      toast.success("Recommended Venues display sequence saved successfully!");
      loadDashboardData();
    } catch (err) {
      toast.error("Failed saving Recommended Venues sequence");
    } finally {
      setIsSavingRecOrder(false);
    }
  };

  // ----------------------------------------------------
  // SECTION 2: All Venues Handlers & Reordering
  // ----------------------------------------------------
  const handleSortAllByDefaultReviews = () => {
    const sorted = sortTurfsByReviews(allVenuesTurfs);
    setAllVenuesTurfs(sorted);
    setAllSortMode("reviews");
    toast.success("All Venues sorted by most reviews (Default order)");
  };

  const handleMoveAllTurf = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= allVenuesTurfs.length) return;
    const list = [...allVenuesTurfs];
    const [moved] = list.splice(index, 1);
    list.splice(newIndex, 0, moved);
    setAllVenuesTurfs(list);
    setAllSortMode("custom");
    toast.info(`[All Venues] Moved "${moved.name}" to position #${newIndex + 1}. Click 'Save Sequence' to sync.`);
  };

  const handleSetAllTurfPosition = (currentIndex, targetPosStr) => {
    const targetPos = parseInt(targetPosStr, 10);
    if (isNaN(targetPos) || targetPos < 1 || targetPos > allVenuesTurfs.length) return;
    const targetIndex = targetPos - 1;
    if (targetIndex === currentIndex) return;
    const list = [...allVenuesTurfs];
    const [moved] = list.splice(currentIndex, 1);
    list.splice(targetIndex, 0, moved);
    setAllVenuesTurfs(list);
    setAllSortMode("custom");
    toast.info(`[All Venues] Set "${moved.name}" to position #${targetPos}. Click 'Save Sequence' to sync.`);
  };

  const handleSaveAllTurfOrder = async () => {
    try {
      setIsSavingAllOrder(true);
      await turfService.reorderAll(allVenuesTurfs);
      toast.success("All Venues display sequence saved successfully!");
      loadDashboardData();
    } catch (err) {
      toast.error("Failed saving All Venues sequence");
    } finally {
      setIsSavingAllOrder(false);
    }
  };

  const handleOpenAddTurf = () => {
    setEditingTurf(null);
    setTurfForm({
      name: "",
      location: "",
      sport_type: "Football, Cricket",
      price_per_hour: 1500,
      rating: "4.8",
      reviews: 50,
      status: "Active",
      owner_name: "System Admin",
      owner_phone: "+91 9876543210",
      image_url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600"
    });
    setIsTurfModalOpen(true);
  };

  const handleOpenEditTurf = (turf) => {
    setEditingTurf(turf);
    setTurfForm({
      name: turf.name || "",
      location: turf.location || "",
      sport_type: turf.sport_type || "Football",
      price_per_hour: turf.price_per_hour || 1200,
      rating: turf.rating || "4.8",
      reviews: turf.reviews ?? turf.reviews_count ?? 50,
      status: turf.status || "Active",
      owner_name: turf.owner_name || "",
      owner_phone: turf.owner_phone || "",
      image_url: turf.image_url || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600"
    });
    setIsTurfModalOpen(true);
  };

  const handleSaveTurf = async (e) => {
    e.preventDefault();
    try {
      if (!turfForm.name || !turfForm.location) {
        toast.error("Turf Name and Location are required");
        return;
      }
      if (editingTurf) {
        await turfService.update("admin", editingTurf.id, turfForm);
        toast.success("Turf updated successfully!");
      } else {
        await turfService.create("admin", turfForm);
        toast.success("New Turf registered successfully!");
      }
      setIsTurfModalOpen(false);
      setEditingTurf(null);
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || "Failed saving turf");
    }
  };

  const handleDeleteTurf = async (id) => {
    if (!window.confirm("Delete this turf venue?")) return;
    try {
      await turfService.delete("admin", id);
      toast.success("Turf deleted successfully!");
      loadDashboardData();
    } catch (err) {
      toast.error("Failed deleting turf");
    }
  };

  // Community Post Handlers
  const handleOpenAddPost = () => {
    setEditingPost(null);
    setPostForm({
      author: "System Admin",
      time: "Just now",
      content: "",
      image_url: "",
      badge: "Community",
      type: "general",
      likes: 0,
      comments: 0,
      shares: 0,
    });
    setIsPostModalOpen(true);
  };

  const handleOpenEditPost = (post) => {
    setEditingPost(post);
    setPostForm({
      author: post.author || "",
      time: post.time || "Just now",
      content: post.content || "",
      image_url: post.image || post.image_url || "",
      badge: post.badge || "Community",
      type: post.type || "general",
      likes: post.likes || 0,
      comments: post.comments || 0,
      shares: post.shares || 0,
    });
    setIsPostModalOpen(true);
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    try {
      if (!postForm.author || !postForm.content) {
        toast.error("Author Name and Post Content are required");
        return;
      }
      if (editingPost) {
        await cmsService.updatePost(editingPost.id, postForm);
        toast.success("Community post updated successfully!");
      } else {
        await cmsService.createPost(postForm);
        toast.success("New Community post created!");
      }
      setIsPostModalOpen(false);
      setEditingPost(null);
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || "Failed saving post");
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Delete this community post?")) return;
    try {
      await cmsService.deletePost(id);
      toast.success("Community post deleted successfully!");
      loadDashboardData();
    } catch (err) {
      toast.error("Failed deleting post");
    }
  };

  // Dashboard Sidebar Navigation Options
  const menuItems = [
    { key: "home-page", label: "Home Page", icon: Home },
    { key: "turfs", label: "Turfs", icon: MapPin },
    { key: "community", label: "Community Feed", icon: MessageSquare },
    { key: "team", label: "Team Management", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex font-sans antialiased">
      {/* 1. Left Fixed Sidebar */}
      <aside
        className={`bg-white border-r border-[#e2e8f0] flex flex-col transition-all duration-300 z-30 sticky top-0 h-screen ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-[#e2e8f0] flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
            S
          </div>
          {!isSidebarCollapsed && (
            <span className="font-extrabold text-sm tracking-widest text-[#0f172a] uppercase">
              SPORTX CONSOLE
            </span>
          )}
        </div>

        {/* Sidebar Nav (Home Page, Turfs, Team Management) */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#e2e8f0]/60 text-[#0f172a] font-extrabold shadow-xs"
                    : "text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9]"
                }`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#0f172a]" : "text-[#64748b]"}`} />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer Controls */}
        <div className="p-3 border-t border-[#e2e8f0] space-y-1">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] rounded-xl cursor-pointer transition-colors"
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl cursor-pointer transition-colors ${
              isSidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header */}
        <header className="h-16 bg-white border-b border-[#e2e8f0] px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <h1 className="text-xl font-extrabold tracking-tight text-[#0f172a]">
            {activeView === "team"
              ? "Team & Admin Management"
              : activeView === "community"
              ? "Community Feed Management"
              : activeView === "turfs"
              ? "Turfs Management & Rearrange"
              : "Home Page Management"}
          </h1>

          <div className="flex items-center gap-5">
            <Button
              onClick={() => window.open("/", "_blank")}
              variant="outline"
              className="border-[#cbd5e1] hover:border-[#0f172a] text-[#334155] text-xs font-bold h-9 rounded-xl shadow-xs"
            >
              <Globe className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Live Website
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>

            <div className="relative">
              <button className="h-9 w-9 rounded-full hover:bg-[#f1f5f9] flex items-center justify-center text-[#64748b] cursor-pointer transition-colors">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </button>
            </div>

            <div className="h-6 w-px bg-[#e2e8f0]" />

            <div className="flex items-center gap-3 select-none">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-extrabold text-[#0f172a] leading-none">admin</div>
                <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mt-0.5">SYSTEM ADMIN</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-[#f1f5f9] border border-[#cbd5e1] flex items-center justify-center text-[#475569]">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>
        </header>

        {/* 3. Main Content Container (Chronological Vertical Scrolling Homepage Sections) */}
        <main className="flex-1 p-8 space-y-12 overflow-y-auto">
          {activeView === "home-page" && (
            <div className="space-y-12 max-w-7xl mx-auto">
              <div className="border-b border-[#e2e8f0] pb-4">
                <h2 className="text-2xl font-black tracking-tight text-[#0f172a]">
                  Live Home Page Preview & Section Cards Manager
                </h2>
                <p className="text-xs text-[#64748b]">
                  Scroll down to view and manage cards for every section of the home page in chronological order.
                </p>
              </div>

              {/* SECTION 1: HERO CAROUSEL BANNERS */}
              <section className="space-y-4 bg-white border border-[#e2e8f0] p-6 rounded-3xl shadow-xs">
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                      HOMEPAGE SECTION #1
                    </div>
                    <h3 className="text-lg font-black text-[#0f172a] flex items-center gap-2 mt-0.5">
                      <ImageIcon className="w-5 h-5 text-emerald-600" />
                      Hero Carousel Banners ({banners.length} slides)
                    </h3>
                  </div>

                  <Button
                    onClick={() => setIsBannerModalOpen(true)}
                    className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs h-9 rounded-xl shadow-xs"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Hero Banner Slide
                  </Button>
                </div>

                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  {banners.map((ban) => (
                    <Card key={ban.id} className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-xs">
                      <div className="h-44 relative">
                        <img src={ban.image_url} alt={ban.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
                          <div>
                            <h4 className="font-extrabold text-base">{ban.title}</h4>
                            <p className="text-xs opacity-80">{ban.subtitle}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleDeleteBanner(ban.id)}
                            className="bg-red-600 text-white h-8 px-3 text-xs rounded-xl cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

              {/* SECTION 2: POPULAR SPORTS CAROUSEL CARDS */}
              <section className="space-y-4 bg-white border border-[#e2e8f0] p-6 rounded-3xl shadow-xs">
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                      HOMEPAGE SECTION #2
                    </div>
                    <h3 className="text-lg font-black text-[#0f172a] flex items-center gap-2 mt-0.5">
                      <Trophy className="w-5 h-5 text-emerald-600" />
                      Popular Sports Carousel Cards ({sports.length} cards)
                    </h3>
                  </div>

                  <Button
                    onClick={() => {
                      setEditingSport(null);
                      setSportForm({ name: "", icon: "⚽", image_url: "", badge: "Popular", description: "1,200+ venues available" });
                      setIsSportModalOpen(true);
                    }}
                    className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs h-9 rounded-xl shadow-xs"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Card to Popular Sports
                  </Button>
                </div>

                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {sports.map((sport) => (
                    <Card key={sport.id} className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow relative">
                      <div className="h-44 relative bg-slate-900">
                        {sport.image_url ? (
                          <img src={sport.image_url} alt={sport.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl bg-[#f1f5f9]">
                            {sport.icon || "⚽"}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="text-2xl drop-shadow">{sport.icon || "⚽"}</span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h4 className="font-extrabold text-base drop-shadow-md">{sport.name}</h4>
                          <p className="text-xs text-white/80 font-medium">{sport.description || "1,200+ venues"}</p>
                        </div>
                      </div>

                      <CardContent className="p-3.5 flex items-center justify-between bg-white border-t border-[#f1f5f9]">
                        <Badge className="bg-[#f1f5f9] text-[#475569] border-none text-[10px] font-bold">
                          {sport.badge || "Popular"}
                        </Badge>

                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingSport(sport);
                              setSportForm({
                                name: sport.name,
                                icon: sport.icon || "⚽",
                                image_url: sport.image_url || "",
                                badge: sport.badge || "Popular",
                                description: sport.description || ""
                              });
                              setIsSportModalOpen(true);
                            }}
                            className="h-8 text-xs font-bold border-[#cbd5e1] hover:border-[#0f172a] px-2.5"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSportCard(sport.id)}
                            className="h-8 w-8 p-0 text-red-600 border-[#fecaca] hover:bg-red-50"
                            title="Delete Card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* SECTION 3: SPORT RELATED FACILITIES & EQUIPMENT (PRO STORE) */}
              <section className="space-y-4 bg-white border border-[#e2e8f0] p-6 rounded-3xl shadow-xs">
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                      HOMEPAGE SECTION #3
                    </div>
                    <h3 className="text-lg font-black text-[#0f172a] flex items-center gap-2 mt-0.5">
                      <Dumbbell className="w-5 h-5 text-emerald-600" />
                      Sport Related Facilities & Equipment ({facilities.length} cards)
                    </h3>
                  </div>

                  <Button
                    onClick={() => {
                      setEditingFacility(null);
                      setFacilityForm({ title: "", category: "EQUIPMENT", image_url: "", price: 999.00, rating: "4.8", badge: "PRO STORE" });
                      setIsFacilityModalOpen(true);
                    }}
                    className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs h-9 rounded-xl shadow-xs"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Equipment Card
                  </Button>
                </div>

                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {facilities.map((fac) => (
                    <Card key={fac.id} className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow relative">
                      <div className="h-44 relative bg-slate-900">
                        <img src={fac.image_url} alt={fac.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-bold text-white flex items-center gap-1">
                          ★ {fac.rating || "4.8"}
                        </div>
                      </div>

                      <CardContent className="p-4 space-y-3">
                        <div>
                          <span className="text-[10px] font-extrabold text-[#94a3b8] uppercase tracking-wider block">
                            {fac.category || "EQUIPMENT"}
                          </span>
                          <h4 className="font-extrabold text-sm text-[#0f172a] mt-0.5 line-clamp-1">
                            {fac.title}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9]">
                          <div className="text-base font-black text-[#0f172a]">
                            ₹{fac.price}
                          </div>

                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingFacility(fac);
                                setFacilityForm({
                                  title: fac.title,
                                  category: fac.category || "EQUIPMENT",
                                  image_url: fac.image_url,
                                  price: Number(fac.price),
                                  rating: fac.rating || "4.8",
                                  badge: fac.badge || "PRO STORE"
                                });
                                setIsFacilityModalOpen(true);
                              }}
                              className="h-8 text-xs font-bold border-[#cbd5e1] hover:border-[#0f172a] px-2.5"
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteFacilityCard(fac.id)}
                              className="h-8 w-8 p-0 text-red-600 border-[#fecaca] hover:bg-red-50"
                              title="Delete Card"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* SECTION 4: OFFERS & TOURNAMENTS RAIL (Offers & Right Side Tournaments Rail) */}
              <section className="space-y-6 bg-white border border-[#e2e8f0] p-6 rounded-3xl shadow-xs">
                {/* 4A: Offers Left Side */}
                <div>
                  <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4 mb-4">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                        HOMEPAGE SECTION #4 (LEFT SIDE OFFERS)
                      </div>
                      <h3 className="text-lg font-black text-[#0f172a] flex items-center gap-2 mt-0.5">
                        <Zap className="w-5 h-5 text-emerald-600" />
                        Offers that feel clear, useful, and safe ({offers.length} cards)
                      </h3>
                    </div>

                    <Button
                      onClick={() => {
                        setEditingOffer(null);
                        setOfferForm({ tag: "Limited time", title: "", value: "", description: "" });
                        setIsOfferModalOpen(true);
                      }}
                      className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs h-9 rounded-xl shadow-xs"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Add Offer Card
                    </Button>
                  </div>

                  <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                    {offers.map((off) => (
                      <Card key={off.id} className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs flex flex-col justify-between relative">
                        <div>
                          <Badge className="bg-[#f1f5f9] text-[#475569] border-none text-[10px] font-bold uppercase tracking-wider">
                            {off.tag}
                          </Badge>
                          <h4 className="font-extrabold text-base text-[#0f172a] mt-3">{off.title}</h4>
                          <p className="text-sm font-bold text-emerald-600 mt-1">{off.value}</p>
                          <p className="text-xs text-[#64748b] mt-2 leading-relaxed">{off.description}</p>
                        </div>

                        <div className="flex gap-2 pt-4 mt-4 border-t border-[#f1f5f9] justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingOffer(off);
                              setOfferForm({
                                tag: off.tag || "Limited time",
                                title: off.title,
                                value: off.value,
                                description: off.description
                              });
                              setIsOfferModalOpen(true);
                            }}
                            className="h-8 text-xs font-bold border-[#cbd5e1] hover:border-[#0f172a] px-2.5"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteOffer(off.id)}
                            className="h-8 w-8 p-0 text-red-600 border-[#fecaca] hover:bg-red-50"
                            title="Delete Offer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* 4B: Tournaments & Events Right Side */}
                <div className="pt-6 border-t border-[#e2e8f0]">
                  <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4 mb-4">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                        HOMEPAGE SECTION #4 (RIGHT SIDE TOURNAMENTS RAIL)
                      </div>
                      <h3 className="text-lg font-black text-[#0f172a] flex items-center gap-2 mt-0.5">
                        <Trophy className="w-5 h-5 text-emerald-600" />
                        Tournaments & Events Rail ({eventsList.length} cards)
                      </h3>
                    </div>

                    <Button
                      onClick={() => {
                        setEditingEvent(null);
                        setEventForm({ title: "", date: "", location: "", image_url: "" });
                        setIsEventModalOpen(true);
                      }}
                      className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs h-9 rounded-xl shadow-xs"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Add Tournament Card
                    </Button>
                  </div>

                  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    {eventsList.map((evt) => (
                      <Card key={evt.id} className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-xs relative">
                        <div className="h-36 relative bg-slate-900">
                          <img src={evt.image_url} alt={evt.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-2.5 left-3 right-3 text-white">
                            <h4 className="font-extrabold text-sm line-clamp-1">{evt.title}</h4>
                            <p className="text-[11px] text-white/80">📍 {evt.location}</p>
                          </div>
                        </div>

                        <CardContent className="p-3.5 flex items-center justify-between bg-white border-t border-[#f1f5f9]">
                          <span className="text-xs font-bold text-[#64748b]">📅 {evt.date}</span>
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingEvent(evt);
                                setEventForm({
                                  title: evt.title,
                                  date: evt.date,
                                  location: evt.location,
                                  image_url: evt.image_url
                                });
                                setIsEventModalOpen(true);
                              }}
                              className="h-8 text-xs font-bold border-[#cbd5e1] hover:border-[#0f172a] px-2.5"
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteEventCard(evt.id)}
                              className="h-8 w-8 p-0 text-red-600 border-[#fecaca] hover:bg-red-50"
                              title="Delete Tournament Event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </section>

              {/* SECTION 5: IMMERSIVE TURF EXPERIENCES (GALLERY) */}
              <section className="space-y-4 bg-white border border-[#e2e8f0] p-6 rounded-3xl shadow-xs">
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                      HOMEPAGE SECTION #5
                    </div>
                    <h3 className="text-lg font-black text-[#0f172a] flex items-center gap-2 mt-0.5">
                      <ImageIcon className="w-5 h-5 text-emerald-600" />
                      Immersive Turf Experiences ({gallery.length} items)
                    </h3>
                  </div>

                  <Button
                    onClick={() => {
                      setEditingGallery(null);
                      setGalleryForm({ name: "", location: "", rating: "4.9", reviews: 100, image_url: "", className: "md:col-span-1 md:row-span-1" });
                      setIsGalleryModalOpen(true);
                    }}
                    className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs h-9 rounded-xl shadow-xs"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Gallery Item
                  </Button>
                </div>

                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                  {gallery.map((item) => (
                    <Card key={item.id} className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-xs relative">
                      <div className="h-40 relative bg-slate-900">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-bold text-white">
                          ★ {item.rating || "4.9"} ({item.reviews} rev)
                        </div>
                      </div>
                      <CardContent className="p-4 space-y-2">
                        <span className="text-[10px] font-extrabold text-[#94a3b8] uppercase tracking-wider block">
                          📍 {item.location}
                        </span>
                        <h4 className="font-extrabold text-sm text-[#0f172a] line-clamp-1">{item.name}</h4>
                        <div className="flex gap-2 pt-2 border-t border-[#f1f5f9] justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingGallery(item);
                              setGalleryForm({
                                name: item.name,
                                location: item.location,
                                rating: item.rating || "4.9",
                                reviews: item.reviews || 100,
                                image_url: item.image_url,
                                className: item.className || "md:col-span-1 md:row-span-1"
                              });
                              setIsGalleryModalOpen(true);
                            }}
                            className="h-8 text-xs font-bold border-[#cbd5e1] hover:border-[#0f172a] px-2.5"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteGalleryItem(item.id)}
                            className="h-8 w-8 p-0 text-red-600 border-[#fecaca] hover:bg-red-50"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* SECTION 6: WHY SPORTXCLUB (Built for booking speed, tournament control, and trust) */}
              <section className="space-y-4 bg-white border border-[#e2e8f0] p-6 rounded-3xl shadow-xs">
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                      HOMEPAGE SECTION #6
                    </div>
                    <h3 className="text-lg font-black text-[#0f172a] flex items-center gap-2 mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Built for booking speed, tournament control, and trust ({whyCards.length} cards)
                    </h3>
                  </div>

                  <Button
                    onClick={() => {
                      setEditingWhy(null);
                      setWhyForm({ title: "", description: "", icon: "ShieldCheck" });
                      setIsWhyModalOpen(true);
                    }}
                    className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs h-9 rounded-xl shadow-xs"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Feature Card
                  </Button>
                </div>

                <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
                  {whyCards.map((card) => (
                    <Card key={card.id} className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs flex flex-col justify-between relative">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-3">
                          {card.icon === "CreditCard" ? "💳" : card.icon === "Zap" ? "⚡" : card.icon === "Headset" ? "🎧" : "🛡️"}
                        </div>
                        <h4 className="font-extrabold text-base text-[#0f172a]">{card.title}</h4>
                        <p className="text-xs text-[#64748b] mt-2 leading-relaxed">{card.description}</p>
                      </div>

                      <div className="flex gap-2 pt-4 mt-4 border-t border-[#f1f5f9] justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingWhy(card);
                            setWhyForm({
                              title: card.title,
                              description: card.description,
                              icon: card.icon || "ShieldCheck"
                            });
                            setIsWhyModalOpen(true);
                          }}
                          className="h-8 text-xs font-bold border-[#cbd5e1] hover:border-[#0f172a] px-2.5"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteWhyCard(card.id)}
                          className="h-8 w-8 p-0 text-red-600 border-[#fecaca] hover:bg-red-50"
                          title="Delete Feature Card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* TURFS MANAGEMENT & REORDER VIEW */}
          {activeView === "turfs" && (
            <div className="space-y-12 max-w-7xl mx-auto">
              {/* Main Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      TURF MANAGEMENT
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      2 SECTIONS
                    </span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-[#0f172a] mt-2 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-emerald-600" /> Registered Turfs & Venues Manager
                  </h2>
                  <p className="text-xs text-[#64748b] mt-1 max-w-2xl leading-relaxed">
                    Manage and reorder venues for both <strong>Recommended Venues</strong> (Section #1) and <strong>All Venues</strong> (Section #2). By default, venues with the <strong>most reviews</strong> start in 1st position (#1) for both sections.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={handleOpenAddTurf}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10 px-4 rounded-xl shadow-xs"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Register New Turf
                  </Button>
                </div>
              </div>

              {/* SECTION 1: RECOMMENDED VENUES */}
              <section className="space-y-6 bg-white border border-[#e2e8f0] p-6 rounded-3xl shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f1f5f9] pb-4">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                      HOMEPAGE & TURFS SECTION #1
                    </div>
                    <h3 className="text-lg font-black text-[#0f172a] flex items-center gap-2 mt-0.5">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                      Recommended Venues ({recommendedTurfs.length} venues)
                    </h3>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Manage venue sequence displayed in the Recommended Venues section.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      onClick={handleSortRecByDefaultReviews}
                      variant="outline"
                      className={`text-xs font-bold h-9 rounded-xl border-[#cbd5e1] ${
                        recSortMode === "reviews" ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "text-[#334155]"
                      }`}
                      title="Sort Recommended list by highest reviews count (Default)"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                      Default (Most Reviewed)
                    </Button>

                    <Button
                      onClick={handleSaveRecTurfOrder}
                      disabled={isSavingRecOrder}
                      className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs h-9 rounded-xl shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      {isSavingRecOrder ? "Saving..." : "Save Recommended Order"}
                    </Button>

                    <Button
                      onClick={handleOpenAddTurf}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Turf
                    </Button>
                  </div>
                </div>

                {/* Recommended Search Filter */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-3" />
                  <Input
                    value={recSearchQuery}
                    onChange={(e) => setRecSearchQuery(e.target.value)}
                    placeholder="Filter recommended venues..."
                    className="pl-9 bg-[#f8fafc] border-[#cbd5e1] text-xs h-9 text-[#0f172a] rounded-xl"
                  />
                </div>

                {/* Recommended Turfs Reorderable List */}
                <div className="space-y-3">
                  {recommendedTurfs
                    .filter(
                      (turf) =>
                        !recSearchQuery ||
                        turf.name?.toLowerCase().includes(recSearchQuery.toLowerCase()) ||
                        turf.location?.toLowerCase().includes(recSearchQuery.toLowerCase()) ||
                        turf.sport_type?.toLowerCase().includes(recSearchQuery.toLowerCase())
                    )
                    .map((turf, index, filteredArray) => {
                      const isFirst = index === 0;
                      const isLast = index === filteredArray.length - 1;
                      const reviewCount = Number(turf.reviews ?? turf.reviews_count ?? 0);

                      return (
                        <motion.div
                          key={turf.id || `rec-turf-${index}`}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`bg-[#f8fafc] border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:border-[#0f172a]/30 ${
                            isFirst ? "border-amber-300 bg-amber-50/30" : "border-[#e2e8f0]"
                          }`}
                        >
                          {/* Position Indicator & Controls */}
                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                                isFirst
                                  ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white"
                                  : index === 1
                                  ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white"
                                  : index === 2
                                  ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white"
                                  : "bg-white text-[#475569] border border-[#cbd5e1]"
                              }`}
                              title={`Position #${index + 1}`}
                            >
                              {isFirst ? <Star className="w-5 h-5 fill-white text-white" /> : `#${index + 1}`}
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleMoveRecTurf(index, -1)}
                                  disabled={isFirst}
                                  className="w-7 h-7 rounded-lg border border-[#cbd5e1] hover:bg-[#0f172a] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit flex items-center justify-center cursor-pointer transition-colors"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleMoveRecTurf(index, 1)}
                                  disabled={isLast}
                                  className="w-7 h-7 rounded-lg border border-[#cbd5e1] hover:bg-[#0f172a] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit flex items-center justify-center cursor-pointer transition-colors"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {!isFirst && (
                                <button
                                  onClick={() => handleSetRecTurfPosition(index, "1")}
                                  className="text-[10px] font-bold text-amber-600 hover:underline cursor-pointer text-left"
                                >
                                  Make #1 First
                                </button>
                              )}
                            </div>

                            {/* Position Selector */}
                            <div className="hidden sm:block ml-2">
                              <label className="text-[10px] font-bold text-[#64748b] block">Pos:</label>
                              <select
                                value={index + 1}
                                onChange={(e) => handleSetRecTurfPosition(index, e.target.value)}
                                className="bg-white border border-[#cbd5e1] text-xs font-bold text-[#0f172a] rounded-lg px-2 py-1 cursor-pointer"
                              >
                                {recommendedTurfs.map((_, pIdx) => (
                                  <option key={pIdx} value={pIdx + 1}>
                                    #{pIdx + 1}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Turf Information */}
                          <div className="flex items-center gap-4 flex-1 min-w-0 w-full md:w-auto">
                            <img
                              src={turf.image_url || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600"}
                              alt={turf.name}
                              className="w-20 h-16 rounded-xl object-cover border border-[#e2e8f0] shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-black text-base text-[#0f172a] truncate">{turf.name}</h3>
                                {isFirst && (
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-extrabold text-[10px]">
                                    🏆 1st Position
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-[10px] font-bold text-[#475569]">
                                  {turf.sport_type || "Football"}
                                </Badge>
                              </div>
                              <p className="text-xs text-[#64748b] mt-0.5 flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                                {turf.location || "Location"}
                              </p>
                              <div className="text-xs font-extrabold text-[#0f172a] mt-1">
                                ₹{turf.price_per_hour}/hr
                              </div>
                            </div>
                          </div>

                          {/* Reviews & Rating Section */}
                          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#e2e8f0]">
                            <div className="bg-white border border-[#e2e8f0] px-3.5 py-2 rounded-xl text-center">
                              <div className="flex items-center gap-1 justify-center text-amber-500 font-black text-sm">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                {turf.rating || "4.8"}
                              </div>
                              <div className="text-[11px] font-extrabold text-emerald-600 mt-0.5 flex items-center gap-1 justify-center">
                                <MessageSquare className="w-3 h-3" />
                                {reviewCount} Reviews
                              </div>
                            </div>

                            <Badge
                              className={`font-extrabold text-xs px-2.5 py-1 ${
                                turf.status === "Active"
                                  ? "bg-emerald-100 text-emerald-800 border-none"
                                  : "bg-amber-100 text-amber-800 border-none"
                              }`}
                            >
                              {turf.status || "Active"}
                            </Badge>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEditTurf(turf)}
                                className="h-8 text-xs font-bold border-[#cbd5e1] hover:border-[#0f172a] px-2.5"
                              >
                                <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteTurf(turf.id)}
                                className="h-8 w-8 p-0 text-red-600 border-[#fecaca] hover:bg-red-50"
                                title="Delete Turf"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </section>

              {/* SECTION 2: ALL VENUES */}
              <section className="space-y-6 bg-white border border-[#e2e8f0] p-6 rounded-3xl shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f1f5f9] pb-4">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">
                      HOMEPAGE & TURFS SECTION #2
                    </div>
                    <h3 className="text-lg font-black text-[#0f172a] flex items-center gap-2 mt-0.5">
                      <Building className="w-5 h-5 text-blue-600" />
                      All Venues ({allVenuesTurfs.length} venues)
                    </h3>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Manage venue sequence displayed in the All Venues section.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      onClick={handleSortAllByDefaultReviews}
                      variant="outline"
                      className={`text-xs font-bold h-9 rounded-xl border-[#cbd5e1] ${
                        allSortMode === "reviews" ? "bg-blue-50 text-blue-700 border-blue-300" : "text-[#334155]"
                      }`}
                      title="Sort All Venues list by highest reviews count (Default)"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                      Default (Most Reviewed)
                    </Button>

                    <Button
                      onClick={handleSaveAllTurfOrder}
                      disabled={isSavingAllOrder}
                      className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs h-9 rounded-xl shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      {isSavingAllOrder ? "Saving..." : "Save All Venues Order"}
                    </Button>

                    <Button
                      onClick={handleOpenAddTurf}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 rounded-xl shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Turf
                    </Button>
                  </div>
                </div>

                {/* All Venues Search Filter */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-3" />
                  <Input
                    value={allSearchQuery}
                    onChange={(e) => setAllSearchQuery(e.target.value)}
                    placeholder="Filter all venues..."
                    className="pl-9 bg-[#f8fafc] border-[#cbd5e1] text-xs h-9 text-[#0f172a] rounded-xl"
                  />
                </div>

                {/* All Venues Reorderable List */}
                <div className="space-y-3">
                  {allVenuesTurfs
                    .filter(
                      (turf) =>
                        !allSearchQuery ||
                        turf.name?.toLowerCase().includes(allSearchQuery.toLowerCase()) ||
                        turf.location?.toLowerCase().includes(allSearchQuery.toLowerCase()) ||
                        turf.sport_type?.toLowerCase().includes(allSearchQuery.toLowerCase())
                    )
                    .map((turf, index, filteredArray) => {
                      const isFirst = index === 0;
                      const isLast = index === filteredArray.length - 1;
                      const reviewCount = Number(turf.reviews ?? turf.reviews_count ?? 0);

                      return (
                        <motion.div
                          key={turf.id || `all-turf-${index}`}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`bg-[#f8fafc] border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:border-[#0f172a]/30 ${
                            isFirst ? "border-blue-300 bg-blue-50/30" : "border-[#e2e8f0]"
                          }`}
                        >
                          {/* Position Indicator & Controls */}
                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                                isFirst
                                  ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white"
                                  : index === 1
                                  ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white"
                                  : index === 2
                                  ? "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white"
                                  : "bg-white text-[#475569] border border-[#cbd5e1]"
                              }`}
                              title={`Position #${index + 1}`}
                            >
                              {isFirst ? <Star className="w-5 h-5 fill-white text-white" /> : `#${index + 1}`}
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleMoveAllTurf(index, -1)}
                                  disabled={isFirst}
                                  className="w-7 h-7 rounded-lg border border-[#cbd5e1] hover:bg-[#0f172a] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit flex items-center justify-center cursor-pointer transition-colors"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleMoveAllTurf(index, 1)}
                                  disabled={isLast}
                                  className="w-7 h-7 rounded-lg border border-[#cbd5e1] hover:bg-[#0f172a] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit flex items-center justify-center cursor-pointer transition-colors"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {!isFirst && (
                                <button
                                  onClick={() => handleSetAllTurfPosition(index, "1")}
                                  className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer text-left"
                                >
                                  Make #1 First
                                </button>
                              )}
                            </div>

                            {/* Position Selector */}
                            <div className="hidden sm:block ml-2">
                              <label className="text-[10px] font-bold text-[#64748b] block">Pos:</label>
                              <select
                                value={index + 1}
                                onChange={(e) => handleSetAllTurfPosition(index, e.target.value)}
                                className="bg-white border border-[#cbd5e1] text-xs font-bold text-[#0f172a] rounded-lg px-2 py-1 cursor-pointer"
                              >
                                {allVenuesTurfs.map((_, pIdx) => (
                                  <option key={pIdx} value={pIdx + 1}>
                                    #{pIdx + 1}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Turf Information */}
                          <div className="flex items-center gap-4 flex-1 min-w-0 w-full md:w-auto">
                            <img
                              src={turf.image_url || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600"}
                              alt={turf.name}
                              className="w-20 h-16 rounded-xl object-cover border border-[#e2e8f0] shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-black text-base text-[#0f172a] truncate">{turf.name}</h3>
                                {isFirst && (
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-extrabold text-[10px]">
                                    🏆 1st Position
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-[10px] font-bold text-[#475569]">
                                  {turf.sport_type || "Football"}
                                </Badge>
                              </div>
                              <p className="text-xs text-[#64748b] mt-0.5 flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                                {turf.location || "Location"}
                              </p>
                              <div className="text-xs font-extrabold text-[#0f172a] mt-1">
                                ₹{turf.price_per_hour}/hr
                              </div>
                            </div>
                          </div>

                          {/* Reviews & Rating Section */}
                          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#e2e8f0]">
                            <div className="bg-white border border-[#e2e8f0] px-3.5 py-2 rounded-xl text-center">
                              <div className="flex items-center gap-1 justify-center text-amber-500 font-black text-sm">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                {turf.rating || "4.8"}
                              </div>
                              <div className="text-[11px] font-extrabold text-blue-600 mt-0.5 flex items-center gap-1 justify-center">
                                <MessageSquare className="w-3 h-3" />
                                {reviewCount} Reviews
                              </div>
                            </div>

                            <Badge
                              className={`font-extrabold text-xs px-2.5 py-1 ${
                                turf.status === "Active"
                                  ? "bg-emerald-100 text-emerald-800 border-none"
                                  : "bg-amber-100 text-amber-800 border-none"
                              }`}
                            >
                              {turf.status || "Active"}
                            </Badge>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEditTurf(turf)}
                                className="h-8 text-xs font-bold border-[#cbd5e1] hover:border-[#0f172a] px-2.5"
                              >
                                <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteTurf(turf.id)}
                                className="h-8 w-8 p-0 text-red-600 border-[#fecaca] hover:bg-red-50"
                                title="Delete Turf"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </section>
            </div>
          )}

          {/* COMMUNITY FEED MANAGEMENT VIEW */}
          {activeView === "community" && (
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* Header & Description */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      COMMUNITY MANAGEMENT
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      LIVE POSTS FEED
                    </span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-[#0f172a] mt-2 flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-purple-600" /> Community Posts & Social Feed
                  </h2>
                  <p className="text-xs text-[#64748b] mt-1 max-w-2xl leading-relaxed">
                    View, edit, add, or delete community posts displayed on the live <strong>Community Feed</strong> (`/community`). Manage announcements, match win highlights, or user moments.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={handleOpenAddPost}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs h-10 px-4 rounded-xl shadow-xs"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> + Create New Post
                  </Button>
                </div>
              </div>

              {/* Quick Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white border border-[#e2e8f0] p-4 rounded-2xl shadow-xs">
                  <div className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Total Feed Posts</div>
                  <div className="text-2xl font-black text-[#0f172a] mt-1">{postsList.length}</div>
                </Card>
                <Card className="bg-white border border-[#e2e8f0] p-4 rounded-2xl shadow-xs">
                  <div className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Total Likes</div>
                  <div className="text-2xl font-black text-rose-600 mt-1">
                    {postsList.reduce((acc, p) => acc + Number(p.likes || 0), 0)}
                  </div>
                </Card>
                <Card className="bg-white border border-[#e2e8f0] p-4 rounded-2xl shadow-xs">
                  <div className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Total Comments</div>
                  <div className="text-2xl font-black text-blue-600 mt-1">
                    {postsList.reduce((acc, p) => acc + Number(p.comments || 0), 0)}
                  </div>
                </Card>
                <Card className="bg-white border border-[#e2e8f0] p-4 rounded-2xl shadow-xs">
                  <div className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Active Posts</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {postsList.filter((p) => p.is_active !== 0).length}
                  </div>
                </Card>
              </div>

              {/* Action Toolbar */}
              <div className="bg-white border border-[#e2e8f0] p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-3" />
                  <Input
                    value={postSearchQuery}
                    onChange={(e) => setPostSearchQuery(e.target.value)}
                    placeholder="Search posts by author or content..."
                    className="pl-9 bg-[#f8fafc] border-[#cbd5e1] text-xs h-9 text-[#0f172a] rounded-xl"
                  />
                </div>
              </div>

              {/* Community Posts Cards List */}
              <div className="space-y-4">
                {postsList
                  .filter(
                    (post) =>
                      !postSearchQuery ||
                      post.author?.toLowerCase().includes(postSearchQuery.toLowerCase()) ||
                      post.content?.toLowerCase().includes(postSearchQuery.toLowerCase())
                  )
                  .map((post, index) => {
                    const imageUrl = post.image || post.image_url;
                    return (
                      <motion.div
                        key={post.id || `post-${index}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs transition-all hover:border-[#0f172a]/30 space-y-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/10 border-2 border-purple-500 text-purple-600 font-bold flex items-center justify-center text-sm shrink-0">
                              {(post.author || "User")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-black text-sm text-[#0f172a]">{post.author}</h3>
                                <Badge className="bg-purple-100 text-purple-800 border-purple-300 font-bold text-[10px]">
                                  {post.badge || "Community"}
                                </Badge>
                              </div>
                              <p className="text-xs text-[#64748b] mt-0.5">{post.time || "Just now"}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEditPost(post)}
                              className="h-8 text-xs font-bold border-[#cbd5e1] hover:border-[#0f172a] px-2.5"
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Post
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeletePost(post.id)}
                              className="h-8 w-8 p-0 text-red-600 border-[#fecaca] hover:bg-red-50"
                              title="Delete Post"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-xs text-[#334155] leading-relaxed font-medium">{post.content}</p>

                        {imageUrl && (
                          <div className="rounded-xl overflow-hidden max-h-64 border border-[#e2e8f0]">
                            <img src={imageUrl} alt="Post Attachment" className="w-full h-full object-cover" />
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-[#f1f5f9] pt-3 text-xs text-[#64748b]">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1 font-bold text-rose-500">
                              ❤️ {post.likes || 0} Likes
                            </span>
                            <span className="flex items-center gap-1 font-bold text-blue-500">
                              💬 {post.comments || 0} Comments
                            </span>
                            <span className="flex items-center gap-1 font-bold text-purple-500">
                              🔄 {post.shares || 0} Shares
                            </span>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold text-[#475569]">
                            ID #{post.id}
                          </Badge>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TEAM MANAGEMENT VIEW */}
          {activeView === "team" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#0f172a]">Team & Admin Management</h2>
                  <p className="text-xs text-[#64748b]">Manage administrator accounts and platform roles.</p>
                </div>
              </div>

              <Card className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs p-6">
                <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold">
                      A
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0f172a]">admin (System Administrator)</h3>
                      <p className="text-xs text-[#64748b]">cms@sportxclub.com • Full Access Control</p>
                    </div>
                  </div>
                  <Badge className="bg-[#dcfce7] text-[#16a34a] border-none font-bold">Active Admin</Badge>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}

      {/* 1. Sport Card Add / Edit Modal */}
      <Dialog open={isSportModalOpen} onOpenChange={setIsSportModalOpen}>
        <DialogContent className="bg-white border-[#e2e8f0] text-[#0f172a] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold">{editingSport ? "Edit Sport Card" : "Add Card to Popular Sports"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveSportCard} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Sport Name</Label>
              <Input
                value={sportForm.name}
                onChange={(e) => setSportForm({ ...sportForm, name: e.target.value })}
                placeholder="e.g. Football, Cricket, Badminton"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Icon Emoji</Label>
              <Input
                value={sportForm.icon}
                onChange={(e) => setSportForm({ ...sportForm, icon: e.target.value })}
                placeholder="⚽"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Image URL</Label>
              <Input
                value={sportForm.image_url}
                onChange={(e) => setSportForm({ ...sportForm, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Venue Count / Subtext</Label>
              <Input
                value={sportForm.description}
                onChange={(e) => setSportForm({ ...sportForm, description: e.target.value })}
                placeholder="e.g. 1,248 venues"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-[#0f172a] text-white font-bold text-xs h-9 rounded-xl">
                Save Sport Card
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Facility & Equipment Card Add / Edit Modal */}
      <Dialog open={isFacilityModalOpen} onOpenChange={setIsFacilityModalOpen}>
        <DialogContent className="bg-white border-[#e2e8f0] text-[#0f172a] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold">{editingFacility ? "Edit Equipment Card" : "Add Card to Sport Facilities & Equipment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveFacilityCard} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Title</Label>
              <Input
                value={facilityForm.title}
                onChange={(e) => setFacilityForm({ ...facilityForm, title: e.target.value })}
                placeholder="e.g. Elite Series Pickleball Paddle"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Category</Label>
              <Input
                value={facilityForm.category}
                onChange={(e) => setFacilityForm({ ...facilityForm, category: e.target.value })}
                placeholder="EQUIPMENT, ACCESSORIES, APPAREL"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Price (₹)</Label>
              <Input
                type="number"
                value={facilityForm.price}
                onChange={(e) => setFacilityForm({ ...facilityForm, price: Number(e.target.value) })}
                placeholder="2499"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Image URL</Label>
              <Input
                value={facilityForm.image_url}
                onChange={(e) => setFacilityForm({ ...facilityForm, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-[#0f172a] text-white font-bold text-xs h-9 rounded-xl">
                Save Facility Card
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Banner Modal */}
      <Dialog open={isBannerModalOpen} onOpenChange={setIsBannerModalOpen}>
        <DialogContent className="bg-white border-[#e2e8f0] text-[#0f172a] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold">Add Hero Banner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveBanner} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Banner Title</Label>
              <Input
                value={bannerForm.title}
                onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                placeholder="Banner Title"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Image URL</Label>
              <Input
                value={bannerForm.image_url}
                onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-[#0f172a] text-white font-bold text-xs h-9 rounded-xl">
                Add Banner
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. FAQ Modal */}
      <Dialog open={isFaqModalOpen} onOpenChange={setIsFaqModalOpen}>
        <DialogContent className="bg-white border-[#e2e8f0] text-[#0f172a] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold">Add FAQ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveFaq} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Question</Label>
              <Input
                value={faqForm.question}
                onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                placeholder="Question"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Answer</Label>
              <Input
                value={faqForm.answer}
                onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                placeholder="Answer"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-[#0f172a] text-white font-bold text-xs h-9 rounded-xl">
                Add FAQ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. Turf Modal */}
      <Dialog open={isTurfModalOpen} onOpenChange={setIsTurfModalOpen}>
        <DialogContent className="bg-white border-[#e2e8f0] text-[#0f172a] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold">Add Turf Venue</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveTurf} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Turf Name</Label>
              <Input
                value={turfForm.name}
                onChange={(e) => setTurfForm({ ...turfForm, name: e.target.value })}
                placeholder="e.g. Skyline Sports Arena"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Location / City</Label>
              <Input
                value={turfForm.location}
                onChange={(e) => setTurfForm({ ...turfForm, location: e.target.value })}
                placeholder="e.g. Powai, Mumbai"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Price Per Hour (₹)</Label>
              <Input
                type="number"
                value={turfForm.price_per_hour}
                onChange={(e) => setTurfForm({ ...turfForm, price_per_hour: Number(e.target.value) })}
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-[#0f172a] text-white font-bold text-xs h-9 rounded-xl">
                Add Turf Venue
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Offer Card Modal */}
      <Dialog open={isOfferModalOpen} onOpenChange={setIsOfferModalOpen}>
        <DialogContent className="bg-white border-[#e2e8f0] text-[#0f172a] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold">{editingOffer ? "Edit Offer Card" : "Add Offer Card"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveOffer} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Tag / Badge</Label>
              <Input
                value={offerForm.tag}
                onChange={(e) => setOfferForm({ ...offerForm, tag: e.target.value })}
                placeholder="e.g. Limited time, Organizer offer, Trusted"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Offer Title</Label>
              <Input
                value={offerForm.title}
                onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                placeholder="e.g. Early bird cashback"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Value / Highlight</Label>
              <Input
                value={offerForm.value}
                onChange={(e) => setOfferForm({ ...offerForm, value: e.target.value })}
                placeholder="e.g. Flat 15% off, Free listing"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Description</Label>
              <Input
                value={offerForm.description}
                onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                placeholder="e.g. Use BOOKFIRST before 11 AM..."
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-[#0f172a] text-white font-bold text-xs h-9 rounded-xl">
                {editingOffer ? "Update Offer Card" : "Save Offer Card"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 7. Gallery Item Modal */}
      <Dialog open={isGalleryModalOpen} onOpenChange={setIsGalleryModalOpen}>
        <DialogContent className="bg-white border-[#e2e8f0] text-[#0f172a] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold">{editingGallery ? "Edit Gallery Item" : "Add Immersive Turf Item"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveGalleryItem} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Turf Name</Label>
              <Input
                value={galleryForm.name}
                onChange={(e) => setGalleryForm({ ...galleryForm, name: e.target.value })}
                placeholder="e.g. Smash & Drive Badminton"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Location</Label>
              <Input
                value={galleryForm.location}
                onChange={(e) => setGalleryForm({ ...galleryForm, location: e.target.value })}
                placeholder="e.g. Andheri West"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Rating</Label>
              <Input
                value={galleryForm.rating}
                onChange={(e) => setGalleryForm({ ...galleryForm, rating: e.target.value })}
                placeholder="e.g. 4.9"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Review Count</Label>
              <Input
                type="number"
                value={galleryForm.reviews}
                onChange={(e) => setGalleryForm({ ...galleryForm, reviews: Number(e.target.value) })}
                placeholder="e.g. 124"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Image URL</Label>
              <Input
                value={galleryForm.image_url}
                onChange={(e) => setGalleryForm({ ...galleryForm, image_url: e.target.value })}
                placeholder="https://..."
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-[#0f172a] text-white font-bold text-xs h-9 rounded-xl">
                {editingGallery ? "Update Gallery Item" : "Save Gallery Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 8. Why Card Modal */}
      <Dialog open={isWhyModalOpen} onOpenChange={setIsWhyModalOpen}>
        <DialogContent className="bg-white border-[#e2e8f0] text-[#0f172a] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold">{editingWhy ? "Edit Feature Card" : "Add Feature Card"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveWhyCard} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Title</Label>
              <Input
                value={whyForm.title}
                onChange={(e) => setWhyForm({ ...whyForm, title: e.target.value })}
                placeholder="e.g. Verified Venues"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Description</Label>
              <Input
                value={whyForm.description}
                onChange={(e) => setWhyForm({ ...whyForm, description: e.target.value })}
                placeholder="e.g. Show only trusted venues..."
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Icon Key</Label>
              <Input
                value={whyForm.icon}
                onChange={(e) => setWhyForm({ ...whyForm, icon: e.target.value })}
                placeholder="ShieldCheck, CreditCard, Zap, Headset"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-[#0f172a] text-white font-bold text-xs h-9 rounded-xl">
                {editingWhy ? "Update Feature Card" : "Save Feature Card"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 9. Tournament Event Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="bg-white border-[#e2e8f0] text-[#0f172a] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold">{editingEvent ? "Edit Tournament Event" : "Add Tournament Event Card"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEventCard} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Tournament Title</Label>
              <Input
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="e.g. Weekend Turf League"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Date Range / Day</Label>
              <Input
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                placeholder="e.g. 24 Jun - 26 Jun"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Location / Area</Label>
              <Input
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                placeholder="e.g. Powai, Mumbai"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Cover Image URL</Label>
              <Input
                value={eventForm.image_url}
                onChange={(e) => setEventForm({ ...eventForm, image_url: e.target.value })}
                placeholder="https://..."
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-[#0f172a] text-white font-bold text-xs h-9 rounded-xl">
                {editingEvent ? "Update Tournament Card" : "Save Tournament Card"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 10. Turf Venue Register & Edit Modal */}
      <Dialog open={isTurfModalOpen} onOpenChange={setIsTurfModalOpen}>
        <DialogContent className="bg-white border-[#e2e8f0] text-[#0f172a] rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              {editingTurf ? "Edit Turf Venue Details" : "Register New Turf Venue"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveTurf} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-bold text-[#334155]">Turf Venue Name</Label>
                <Input
                  value={turfForm.name}
                  onChange={(e) => setTurfForm({ ...turfForm, name: e.target.value })}
                  placeholder="e.g. Green Turf Arena"
                  className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-bold text-[#334155]">Location / Address</Label>
                <Input
                  value={turfForm.location}
                  onChange={(e) => setTurfForm({ ...turfForm, location: e.target.value })}
                  placeholder="e.g. Andheri West, Mumbai"
                  className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#334155]">Sport Types</Label>
                <Input
                  value={turfForm.sport_type}
                  onChange={(e) => setTurfForm({ ...turfForm, sport_type: e.target.value })}
                  placeholder="e.g. Football, Cricket"
                  className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#334155]">Price Per Hour (₹)</Label>
                <Input
                  type="number"
                  value={turfForm.price_per_hour}
                  onChange={(e) => setTurfForm({ ...turfForm, price_per_hour: e.target.value })}
                  placeholder="1500"
                  className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#334155]">Rating (1.0 to 5.0)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={turfForm.rating}
                  onChange={(e) => setTurfForm({ ...turfForm, rating: e.target.value })}
                  placeholder="4.8"
                  className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#334155]">Total User Reviews</Label>
                <Input
                  type="number"
                  value={turfForm.reviews}
                  onChange={(e) => setTurfForm({ ...turfForm, reviews: e.target.value })}
                  placeholder="340"
                  className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-bold text-[#334155]">Status</Label>
                <select
                  value={turfForm.status}
                  onChange={(e) => setTurfForm({ ...turfForm, status: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] text-xs text-[#0f172a] rounded-xl p-2.5 font-semibold"
                >
                  <option value="Active">Active</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-bold text-[#334155]">Image URL</Label>
                <Input
                  value={turfForm.image_url}
                  onChange={(e) => setTurfForm({ ...turfForm, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-extrabold text-xs h-10 rounded-xl w-full sm:w-auto">
                {editingTurf ? "Update Turf Venue" : "Save Turf Venue"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 11. Community Post Modal */}
      <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
        <DialogContent className="bg-white border-[#e2e8f0] text-[#0f172a] rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              {editingPost ? "Edit Community Feed Post" : "Create New Community Post"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePost} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Author Name</Label>
              <Input
                value={postForm.author}
                onChange={(e) => setPostForm({ ...postForm, author: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#334155]">Badge Tag</Label>
                <Input
                  value={postForm.badge}
                  onChange={(e) => setPostForm({ ...postForm, badge: e.target.value })}
                  placeholder="e.g. Match Win / Announcement"
                  className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#334155]">Time Label</Label>
                <Input
                  value={postForm.time}
                  onChange={(e) => setPostForm({ ...postForm, time: e.target.value })}
                  placeholder="e.g. 2 hours ago"
                  className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Post Content / Message</Label>
              <textarea
                rows={4}
                value={postForm.content}
                onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                placeholder="Write community post update..."
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] text-xs text-[#0f172a] rounded-xl p-3"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Image Attachment URL (Optional)</Label>
              <Input
                value={postForm.image_url}
                onChange={(e) => setPostForm({ ...postForm, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs h-10 rounded-xl w-full sm:w-auto">
                {editingPost ? "Update Community Post" : "Publish Post"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
