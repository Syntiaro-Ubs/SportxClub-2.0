import { useState, useEffect, useMemo, useCallback } from "react";
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
  Shield,
  Clock,
  Key,
  Mail,
  Phone,
  UserPlus,
  Check,
  X,
  ShieldCheck,
  ShieldAlert,
  Lock,
  RefreshCw,
  Sliders,
  Filter,
  CheckSquare,
  Square,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { cmsService } from "../../services/cms-service";
import { adminApi } from "../../services/admin-api";
import { turfService } from "../../services/turf.service";

export const CONSOLE_MODULES = [
  {
    key: "home-page",
    label: "Home Page CMS",
    description: "Manage Hero Banners, Sports, Facilities, FAQs, Offers, Why Cards, & Gallery.",
    icon: Home,
    tag: "CMS Content",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    key: "turfs",
    label: "Turfs Management",
    description: "Add venues, update hourly rates, manage status, and rearrange display order.",
    icon: MapPin,
    tag: "Venues",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    key: "tournaments",
    label: "Tournaments & Leagues",
    description: "Organize tournaments, generate fixtures, and review team applications.",
    icon: Trophy,
    tag: "Competitions",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    key: "community",
    label: "Community Feed",
    description: "Moderate community posts, manage player interactions, and filter content.",
    icon: MessageSquare,
    tag: "Moderation",
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    key: "team",
    label: "Team & Admin Management",
    description: "Create console accounts, assign custom permissions, and control dashboard logins.",
    icon: Users,
    tag: "Administration",
    color: "text-rose-600 bg-rose-50 border-rose-200",
  },
];

export const ROLE_PRESETS = {
  "Super Admin": {
    label: "Super Admin",
    description: "Full unrestricted access to all 5 console modules and user management.",
    permissions: ["home-page", "turfs", "tournaments", "community", "team"],
    badgeClass: "bg-purple-100 text-purple-700 border-purple-200",
  },
  "Manager": {
    label: "Console Manager",
    description: "Access to manage home page, turfs, tournaments, and community feed.",
    permissions: ["home-page", "turfs", "tournaments", "community"],
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
  },
  "Editor": {
    label: "Content Editor",
    description: "Access to edit home page sections and moderate community discussions.",
    permissions: ["home-page", "community"],
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  "Turf Manager": {
    label: "Turf Manager",
    description: "Access to manage venue listings, pricing, and home page featured turfs.",
    permissions: ["turfs", "home-page"],
    badgeClass: "bg-teal-100 text-teal-700 border-teal-200",
  },
  "Tournament Coordinator": {
    label: "Tournament Coordinator",
    description: "Access to create and run tournament brackets, fixtures, and team rosters.",
    permissions: ["tournaments"],
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
  },
  "Community Moderator": {
    label: "Community Moderator",
    description: "Access to review, moderate, and manage community player feed posts.",
    permissions: ["community"],
    badgeClass: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  "Custom": {
    label: "Custom Access",
    description: "Select individual module permissions tailored for this console account.",
    permissions: [],
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

export function CMSDashboard() {
  const navigate = useNavigate();
  const params = useParams();

  // Current Logged-in Console User & Permissions
  const [currentCmsUser, setCurrentCmsUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem("sportx_cms_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const userPermissions = useMemo(() => {
    if (!currentCmsUser) return ["home-page", "turfs", "tournaments", "community", "team"];
    if (currentCmsUser.role === "Super Admin" || currentCmsUser.role === "Admin") {
      return ["home-page", "turfs", "tournaments", "community", "team"];
    }
    return Array.isArray(currentCmsUser.permissions) && currentCmsUser.permissions.length > 0
      ? currentCmsUser.permissions
      : ["home-page"];
  }, [currentCmsUser]);

  // Active view tab ('home-page', 'turfs', 'tournaments', 'community', 'team')
  const currentView = params.view || (userPermissions[0] || "home-page");
  const validViews = ["home-page", "turfs", "tournaments", "community", "team"];
  const [activeView, setActiveView] = useState(validViews.includes(currentView) ? currentView : (userPermissions[0] || "home-page"));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (params.view && validViews.includes(params.view)) {
      setActiveView(params.view);
    }
  }, [params.view]);

  // Permission guard: If user navigates to an unauthorized view, redirect to first allowed view
  useEffect(() => {
    if (currentCmsUser && userPermissions.length > 0) {
      if (!userPermissions.includes(activeView)) {
        const fallback = userPermissions[0] || "home-page";
        setActiveView(fallback);
        navigate(`/dashboard/${fallback}`, { replace: true });
        toast.error(`Access restricted: You do not have permission for '${activeView}'.`);
      }
    }
  }, [activeView, userPermissions, currentCmsUser, navigate]);

  const handleNavClick = (viewKey) => {
    if (!userPermissions.includes(viewKey)) {
      toast.error("You do not have permission to access this module.");
      return;
    }
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

  // Team Management Data States
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [teamRoleFilter, setTeamRoleFilter] = useState("all");
  const [teamStatusFilter, setTeamStatusFilter] = useState("all");
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const [isSavingTeam, setIsSavingTeam] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [teamForm, setTeamForm] = useState({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "Editor",
    status: "Active",
    permissions: ["home-page", "community"],
  });

  // Tournaments & Fixtures Data States
  const [cmsTournaments, setCmsTournaments] = useState([]);
  const [cmsFixtures, setCmsFixtures] = useState([]);
  const [cmsTeams, setCmsTeams] = useState([]);
  const [tournSearchQuery, setTournSearchQuery] = useState("");
  const [fixtureSearchQuery, setFixtureSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  // Tournament Modal States
  const [isCmsTournamentModalOpen, setIsCmsTournamentModalOpen] = useState(false);
  const [editingCmsTournament, setEditingCmsTournament] = useState(null);
  const [cmsTournamentForm, setCmsTournamentForm] = useState({
    name: "",
    sport: "Cricket",
    teams: 16,
    matches: 24,
    start_date: "",
    prize: "₹50,000",
    location: "Mumbai",
    turf_name: "",
    status: "Registration Open",
    organizer_name: "Admin Organizer",
    organizer_email: "cms@sportxclub.com",
    image_url: "https://images.unsplash.com/photo-1594470117722-de4b9a02ebed?w=1080",
    description: "",
  });

  // Match Day Fixture Modal States
  const [isFixtureModalOpen, setIsFixtureModalOpen] = useState(false);
  const [editingFixture, setEditingFixture] = useState(null);
  const [fixtureForm, setFixtureForm] = useState({
    team1: "",
    team2: "",
    match_date: "Jun 20, 2026",
    time: "6:00 PM",
    venue: "Elite Sports Arena",
    status: "Upcoming",
  });

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
      const [sec, ban, spo, fac, faq, trfs, off, gal, why, evts, psts, tourns, fixs, tms, team] = await Promise.all([
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
        adminApi.getAll("tournaments").catch(() => []),
        adminApi.getAll("tournament-fixtures").catch(() => []),
        adminApi.getAll("tournament-teams").catch(() => []),
        cmsService.getTeamMembers().catch(() => []),
      ]);
      setSections(sec);
      setBanners(ban);
      setSports(spo);
      setFacilities(fac);
      setFaqs(faq);
      setTeamMembers(team || []);

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
      setCmsTournaments(tourns || []);
      setCmsFixtures(fixs || []);
      setCmsTeams(tms || []);
    } catch (err) {
      console.error("Failed loading CMS Console data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const members = await cmsService.getTeamMembers();
      setTeamMembers(members || []);
    } catch (err) {
      console.error("Failed loading console team members:", err);
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

  // Team Management Handlers
  const handleOpenAddTeamMember = () => {
    setEditingTeamMember(null);
    setTeamForm({
      full_name: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      role: "Editor",
      status: "Active",
      permissions: ["home-page", "community"],
    });
    setShowModalPassword(false);
    setIsTeamModalOpen(true);
  };

  const handleOpenEditTeamMember = (member) => {
    setEditingTeamMember(member);
    setTeamForm({
      full_name: member.full_name || "",
      username: member.username || "",
      email: member.email || "",
      phone: member.phone || "",
      password: member.password || "",
      role: member.role || "Editor",
      status: member.status || "Active",
      permissions: Array.isArray(member.permissions) ? member.permissions : [],
    });
    setShowModalPassword(false);
    setIsTeamModalOpen(true);
  };

  const handleRoleChange = (newRole) => {
    const preset = ROLE_PRESETS[newRole];
    setTeamForm((prev) => ({
      ...prev,
      role: newRole,
      permissions: preset && newRole !== "Custom" ? preset.permissions : prev.permissions,
    }));
  };

  const handleTogglePermission = (permKey) => {
    setTeamForm((prev) => {
      const exists = prev.permissions.includes(permKey);
      const nextPerms = exists
        ? prev.permissions.filter((k) => k !== permKey)
        : [...prev.permissions, permKey];
      return {
        ...prev,
        permissions: nextPerms,
        role: prev.role === "Super Admin" && nextPerms.length < 5 ? "Custom" : prev.role,
      };
    });
  };

  const handleSelectAllPermissions = () => {
    setTeamForm((prev) => ({
      ...prev,
      permissions: CONSOLE_MODULES.map((m) => m.key),
      role: prev.role === "Custom" ? "Super Admin" : prev.role,
    }));
  };

  const handleClearAllPermissions = () => {
    setTeamForm((prev) => ({
      ...prev,
      permissions: [],
      role: "Custom",
    }));
  };

  const handleSaveTeamMember = async (e) => {
    e.preventDefault();
    if (!teamForm.full_name?.trim() || !teamForm.username?.trim() || !teamForm.email?.trim()) {
      toast.error("Please fill in full name, username, and email.");
      return;
    }
    if (!editingTeamMember && !teamForm.password?.trim()) {
      toast.error("A secure password is required for new console accounts.");
      return;
    }
    if (teamForm.permissions.length === 0) {
      toast.error("Please assign at least one console module permission.");
      return;
    }

    try {
      setIsSavingTeam(true);
      if (editingTeamMember) {
        const updated = await cmsService.updateTeamMember(editingTeamMember.id, teamForm);
        toast.success("Console account updated successfully!");
        if (currentCmsUser && currentCmsUser.id === editingTeamMember.id) {
          const updatedUser = {
            ...currentCmsUser,
            fullName: updated.full_name || updated.fullName,
            username: updated.username,
            email: updated.email,
            role: updated.role,
            status: updated.status,
            permissions: updated.permissions,
            phone: updated.phone,
          };
          sessionStorage.setItem("sportx_cms_user", JSON.stringify(updatedUser));
          setCurrentCmsUser(updatedUser);
        }
      } else {
        await cmsService.createTeamMember(teamForm);
        toast.success("New console user account created successfully!");
      }
      setIsTeamModalOpen(false);
      setEditingTeamMember(null);
      loadTeamMembers();
    } catch (err) {
      toast.error(err.message || "Failed saving console account.");
    } finally {
      setIsSavingTeam(false);
    }
  };

  const handleToggleMemberStatus = async (member) => {
    if (member.username?.toLowerCase() === "admin" && member.status === "Active") {
      toast.error("The primary 'admin' account cannot be deactivated.");
      return;
    }
    const nextStatus = member.status === "Active" ? "Inactive" : "Active";
    try {
      await cmsService.toggleTeamMemberStatus(member.id, nextStatus);
      toast.success(`Account for ${member.full_name} is now ${nextStatus}.`);
      loadTeamMembers();
    } catch (err) {
      toast.error(err.message || "Failed to update account status.");
    }
  };

  const handleDeleteTeamMember = async (member) => {
    if (member.username?.toLowerCase() === "admin") {
      toast.error("The primary 'admin' account cannot be deleted.");
      return;
    }
    if (!window.confirm(`Delete console account "${member.full_name} (@${member.username})"? They will no longer be able to log in to this dashboard.`)) {
      return;
    }
    try {
      await cmsService.deleteTeamMember(member.id);
      toast.success("Console account deleted successfully.");
      loadTeamMembers();
    } catch (err) {
      toast.error(err.message || "Failed deleting account.");
    }
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

  // Tournament Handlers for CMS
  const handleOpenAddCmsTournament = () => {
    setEditingCmsTournament(null);
    setCmsTournamentForm({
      name: "",
      sport: "Cricket",
      teams: 16,
      matches: 24,
      start_date: "Jun 20, 2026",
      prize: "₹50,000",
      location: "Mumbai",
      turf_name: "",
      status: "Registration Open",
      organizer_name: "Admin Organizer",
      organizer_email: "cms@sportxclub.com",
      image_url: "https://images.unsplash.com/photo-1594470117722-de4b9a02ebed?w=1080",
      description: "",
    });
    setIsCmsTournamentModalOpen(true);
  };

  const handleOpenEditCmsTournament = (t) => {
    setEditingCmsTournament(t);
    setCmsTournamentForm({
      name: t.name || t.title || "",
      sport: t.sport || "Cricket",
      teams: t.teams || 16,
      matches: t.matches || 24,
      start_date: t.start_date || t.startDate || "",
      prize: t.prize || "₹50,000",
      location: t.location || "Mumbai",
      turf_name: t.turf_name || "",
      status: t.status || "Registration Open",
      organizer_name: t.organizer_name || "Admin",
      organizer_email: t.organizer_email || "",
      image_url: t.image_url || t.image || "",
      description: t.description || "",
    });
    setIsCmsTournamentModalOpen(true);
  };

  const handleSaveCmsTournament = async (e) => {
    e.preventDefault();
    try {
      if (!cmsTournamentForm.name || !cmsTournamentForm.start_date) {
        toast.error("Tournament title and start date are required");
        return;
      }
      if (editingCmsTournament) {
        await adminApi.update("tournaments", editingCmsTournament.id, cmsTournamentForm);
        toast.success(`Tournament "${cmsTournamentForm.name}" updated successfully!`);
      } else {
        await adminApi.create("tournaments", cmsTournamentForm);
        toast.success(`New Tournament "${cmsTournamentForm.name}" published!`);
      }
      setIsCmsTournamentModalOpen(false);
      setEditingCmsTournament(null);
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || "Failed saving tournament");
    }
  };

  const handleDeleteCmsTournament = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete tournament "${name}"?`)) return;
    try {
      await adminApi.delete("tournaments", id);
      toast.success("Tournament deleted successfully");
      loadDashboardData();
    } catch (err) {
      toast.error("Failed deleting tournament");
    }
  };

  const handleQuickStatusChange = async (t, newStatus) => {
    try {
      await adminApi.update("tournaments", t.id, { ...t, status: newStatus });
      toast.success(`Status updated to "${newStatus}" for ${t.name || t.title}`);
      loadDashboardData();
    } catch (err) {
      toast.error("Failed updating status");
    }
  };

  // Match Day Fixture Handlers
  const handleOpenAddFixture = () => {
    setEditingFixture(null);
    setFixtureForm({
      team1: "",
      team2: "",
      match_date: "Jun 20, 2026",
      time: "6:00 PM",
      venue: "Elite Sports Arena",
      status: "Upcoming",
    });
    setIsFixtureModalOpen(true);
  };

  const handleOpenEditFixture = (f) => {
    setEditingFixture(f);
    setFixtureForm({
      team1: f.team1 || "",
      team2: f.team2 || "",
      match_date: f.match_date || f.date || "",
      time: f.time || "6:00 PM",
      venue: f.venue || "",
      status: f.status || "Upcoming",
    });
    setIsFixtureModalOpen(true);
  };

  const handleSaveFixture = async (e) => {
    e.preventDefault();
    try {
      if (!fixtureForm.team1 || !fixtureForm.team2 || !fixtureForm.venue) {
        toast.error("Team names and venue location are required");
        return;
      }
      if (editingFixture) {
        await adminApi.update("tournament-fixtures", editingFixture.id, fixtureForm);
        toast.success("Match Day Fixture updated!");
      } else {
        await adminApi.create("tournament-fixtures", fixtureForm);
        toast.success("New Match Day Fixture added!");
      }
      setIsFixtureModalOpen(false);
      setEditingFixture(null);
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || "Failed saving match fixture");
    }
  };

  const handleDeleteFixture = async (id) => {
    if (!window.confirm("Delete this match fixture?")) return;
    try {
      await adminApi.delete("tournament-fixtures", id);
      toast.success("Match fixture deleted!");
      loadDashboardData();
    } catch (err) {
      toast.error("Failed deleting fixture");
    }
  };

  const handleUpdateTeamStatus = async (teamId, status) => {
    try {
      await adminApi.update("tournament-teams", teamId, { status });
      toast.success(`Team registration marked as ${status}`);
      loadDashboardData();
    } catch (err) {
      toast.error("Failed updating team application");
    }
  };

  // Dynamic Dashboard Sidebar Navigation Options (Filtered by granted permissions)
  const menuItems = useMemo(() => {
    const allItems = [
      { key: "home-page", label: "Home Page", icon: Home },
      { key: "turfs", label: "Turfs", icon: MapPin },
      { key: "tournaments", label: "Tournaments Page", icon: Trophy },
      { key: "community", label: "Community Feed", icon: MessageSquare },
      { key: "team", label: "Team Management", icon: Users },
    ];
    if (!currentCmsUser) return allItems;
    if (currentCmsUser.role === "Super Admin" || currentCmsUser.role === "Admin") return allItems;
    return allItems.filter((item) => userPermissions.includes(item.key));
  }, [currentCmsUser, userPermissions]);

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

        {/* Sidebar Nav (Filtered by Permissions) */}
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
              : activeView === "tournaments"
              ? "Leagues & Tournaments Page Management"
              : activeView === "turfs"
              ? "Turfs Management & Rearrange"
              : "Home Page Management"}
          </h1>

          <div className="flex items-center gap-5">
            <Button
              onClick={() => window.open("/", "_blank")}
              variant="outline"
              className="border-[#cbd5e1] hover:border-[#0f172a] text-[#334155] text-xs font-bold h-9 rounded-xl shadow-xs cursor-pointer"
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
                <div className="text-xs font-extrabold text-[#0f172a] leading-none">
                  {currentCmsUser?.fullName || currentCmsUser?.username || "Admin"}
                </div>
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">
                  {currentCmsUser?.role || "SYSTEM ADMIN"}
                </div>
              </div>
              <div className="h-9 w-9 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-black text-xs shadow-xs">
                {(currentCmsUser?.fullName || currentCmsUser?.username || "A").charAt(0).toUpperCase()}
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

          {/* TOURNAMENTS MANAGEMENT VIEW */}
          {activeView === "tournaments" && (
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* Page Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-1 border border-emerald-200">
                    <Trophy className="w-3.5 h-3.5" />
                    Public Tournaments Page Customizer
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-[#0f172a]">
                    Leagues & Tournaments Management
                  </h2>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Create, edit, publish tournaments, manage match day fixtures, and approve team roster applications live on <code className="bg-[#f1f5f9] px-1 py-0.5 rounded">/tournaments</code>.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => window.open("/tournaments", "_blank")}
                    variant="outline"
                    className="border-[#cbd5e1] text-[#334155] text-xs font-bold h-10 rounded-xl"
                  >
                    <Eye className="w-4 h-4 mr-1.5 text-emerald-600" />
                    View Live /tournaments
                  </Button>
                  <Button
                    onClick={handleOpenAddCmsTournament}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10 px-4 rounded-xl shadow-md gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Create Tournament
                  </Button>
                </div>
              </div>

              {/* Metric Overview Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">Total Tournaments</p>
                      <h3 className="text-2xl font-black text-[#0f172a] mt-0.5">{cmsTournaments.length}</h3>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Trophy className="w-5 h-5" />
                    </div>
                  </div>
                </Card>

                <Card className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">Active / Open</p>
                      <h3 className="text-2xl font-black text-emerald-600 mt-0.5">
                        {cmsTournaments.filter(t => (t.status || "").toLowerCase().includes("open") || (t.status || "").toLowerCase().includes("active")).length}
                      </h3>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                  </div>
                </Card>

                <Card className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">Match Day Fixtures</p>
                      <h3 className="text-2xl font-black text-blue-600 mt-0.5">{cmsFixtures.length}</h3>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>
                </Card>

                <Card className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">Applied Teams</p>
                      <h3 className="text-2xl font-black text-purple-600 mt-0.5">{cmsTeams.length}</h3>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* SECTION 1: TOURNAMENTS DIRECTORY MANAGER */}
              <section className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f1f5f9] pb-4">
                  <div>
                    <h3 className="text-lg font-black text-[#0f172a] flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      Live Tournaments & Leagues Catalog
                    </h3>
                    <p className="text-xs text-[#64748b]">
                      Manage all tournament cards displayed on the public page. Edit prize pools, start dates, locations, max teams & status.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                      <Input
                        value={tournSearchQuery}
                        onChange={(e) => setTournSearchQuery(e.target.value)}
                        placeholder="Search by title, sport or location..."
                        className="pl-9 h-9 w-64 text-xs bg-[#f8fafc] border-[#cbd5e1] rounded-xl"
                      />
                    </div>
                    <Button
                      onClick={handleOpenAddCmsTournament}
                      className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-extrabold text-xs h-9 rounded-xl px-4 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Tournament
                    </Button>
                  </div>
                </div>

                {cmsTournaments.filter(t => 
                  (t.name || t.title || "").toLowerCase().includes(tournSearchQuery.toLowerCase()) ||
                  (t.sport || "").toLowerCase().includes(tournSearchQuery.toLowerCase()) ||
                  (t.location || "").toLowerCase().includes(tournSearchQuery.toLowerCase())
                ).length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-[#e2e8f0] rounded-2xl bg-[#f8fafc]">
                    <Trophy className="w-10 h-10 mx-auto text-[#cbd5e1] mb-2" />
                    <p className="font-extrabold text-sm text-[#334155]">No tournaments found</p>
                    <p className="text-xs text-[#64748b] mt-0.5">Click "Add Tournament" above to create one!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {cmsTournaments
                      .filter(t => 
                        (t.name || t.title || "").toLowerCase().includes(tournSearchQuery.toLowerCase()) ||
                        (t.sport || "").toLowerCase().includes(tournSearchQuery.toLowerCase()) ||
                        (t.location || "").toLowerCase().includes(tournSearchQuery.toLowerCase())
                      )
                      .map((t) => (
                        <div
                          key={t.id}
                          className="border border-[#e2e8f0] rounded-2xl overflow-hidden bg-white hover:border-emerald-500/50 transition-all shadow-xs flex flex-col justify-between"
                        >
                          <div className="p-5 space-y-4">
                            <div className="flex items-start gap-4">
                              <img
                                src={t.image_url || t.image || "https://images.unsplash.com/photo-1594470117722-de4b9a02ebed?w=600"}
                                alt={t.name || t.title}
                                className="w-24 h-24 rounded-xl object-cover shrink-0 border border-[#e2e8f0]"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">
                                    {t.sport || "Cricket"}
                                  </Badge>
                                  <select
                                    value={t.status || "Registration Open"}
                                    onChange={(e) => handleQuickStatusChange(t, e.target.value)}
                                    className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg border border-[#cbd5e1] bg-[#f8fafc] text-[#0f172a] cursor-pointer"
                                  >
                                    <option value="Registration Open">Registration Open</option>
                                    <option value="Active">Active / Ongoing</option>
                                    <option value="Upcoming">Upcoming</option>
                                    <option value="Completed">Completed</option>
                                  </select>
                                </div>
                                <h4 className="font-extrabold text-base text-[#0f172a] truncate">
                                  {t.name || t.title}
                                </h4>
                                <p className="text-xs text-[#64748b] truncate mt-0.5 flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  {t.turf_name ? `${t.turf_name}, ${t.location}` : (t.location || "Mumbai")}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-[#334155] font-semibold mt-2">
                                  <span>📅 {t.start_date || t.startDate || "TBD"}</span>
                                  <span>🏆 {t.prize || t.prize_pool || "₹50,000"}</span>
                                  <span>👥 Max {t.teams || 16} Teams</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#f8fafc] border-t border-[#e2e8f0] px-5 py-3 flex items-center justify-between text-xs">
                            <span className="text-[#64748b] font-medium">
                              Organizer: <strong className="text-[#0f172a]">{t.organizer_name || "Admin"}</strong>
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEditCmsTournament(t)}
                                className="h-8 text-xs font-bold border-[#cbd5e1] hover:border-[#0f172a] px-3 rounded-lg cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 mr-1 text-[#0f172a]" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteCmsTournament(t.id, t.name || t.title)}
                                className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Delete Tournament"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </section>

              {/* SECTION 2: MATCH DAY FIXTURES MANAGER */}
              <section className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f1f5f9] pb-4">
                  <div>
                    <h3 className="text-lg font-black text-[#0f172a] flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-600" />
                      Match Day Fixtures Manager (Next Fixtures Sidebar)
                    </h3>
                    <p className="text-xs text-[#64748b]">
                      Manage scheduled matches displayed in the "Match Day" sidebar on <code className="bg-[#f1f5f9] px-1 py-0.5 rounded">/tournaments</code>.
                    </p>
                  </div>

                  <Button
                    onClick={handleOpenAddFixture}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-9 rounded-xl px-4 gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Match Fixture
                  </Button>
                </div>

                {cmsFixtures.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-[#e2e8f0] rounded-2xl bg-[#f8fafc]">
                    <Clock className="w-9 h-9 mx-auto text-[#cbd5e1] mb-2" />
                    <p className="font-extrabold text-sm text-[#334155]">No match fixtures configured</p>
                    <p className="text-xs text-[#64748b]">Add team matchups to show up on the public Match Day sidebar.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cmsFixtures.map((fix) => (
                      <div
                        key={fix.id}
                        className="border border-[#e2e8f0] rounded-2xl p-4 bg-white shadow-xs space-y-3 relative hover:border-emerald-500/50 transition-all"
                      >
                        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2">
                          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">
                            {fix.status || "Upcoming"}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditFixture(fix)}
                              className="p-1 text-[#64748b] hover:text-[#0f172a] rounded-lg transition-colors cursor-pointer"
                              title="Edit Fixture"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFixture(fix.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Fixture"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-center gap-2 py-1">
                          <div className="flex-1">
                            <p className="text-xs font-black text-[#0f172a] leading-tight">{fix.team1}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                            VS
                          </span>
                          <div className="flex-1">
                            <p className="text-xs font-black text-[#0f172a] leading-tight">{fix.team2}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#f1f5f9] text-[11px] text-[#64748b] flex items-center justify-between font-medium">
                          <span>🕒 {fix.time || "6:00 PM"} ({fix.match_date || fix.date || "Today"})</span>
                          <span className="truncate max-w-[120px] font-bold text-[#334155]" title={fix.venue}>
                            📍 {fix.venue}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* SECTION 3: REGISTERED TEAMS & APPLICATIONS */}
              <section className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-xs space-y-6">
                <div className="border-b border-[#f1f5f9] pb-4">
                  <h3 className="text-lg font-black text-[#0f172a] flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Enrolled Teams & Tournament Rosters
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    Review and approve team applications submitted by player captains for all tournaments.
                  </p>
                </div>

                {cmsTeams.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-[#e2e8f0] rounded-2xl bg-[#f8fafc]">
                    <Users className="w-9 h-9 mx-auto text-[#cbd5e1] mb-2" />
                    <p className="font-extrabold text-sm text-[#334155]">No registered teams yet</p>
                    <p className="text-xs text-[#64748b]">Team applications submitted by players will appear here for admin review.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-[#e2e8f0] rounded-2xl">
                    <table className="w-full text-left text-xs text-[#334155]">
                      <thead className="bg-[#f8fafc] text-[#0f172a] font-extrabold uppercase text-[10px] tracking-wider border-b border-[#e2e8f0]">
                        <tr>
                          <th className="p-3.5">Team Name</th>
                          <th className="p-3.5">Tournament</th>
                          <th className="p-3.5">Captain Details</th>
                          <th className="p-3.5">Roster Size</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f1f5f9]">
                        {cmsTeams.map((team) => (
                          <tr key={team.id} className="hover:bg-[#f8fafc] transition-colors">
                            <td className="p-3.5 font-extrabold text-[#0f172a]">{team.team_name}</td>
                            <td className="p-3.5 font-bold text-emerald-600">{team.tournament_name || `Tournament #${team.tournament_id}`}</td>
                            <td className="p-3.5">
                              <div className="font-semibold text-[#0f172a]">{team.captain_name || "N/A"}</div>
                              <div className="text-[10px] text-[#64748b]">{team.captain_email || ""}</div>
                            </td>
                            <td className="p-3.5 font-semibold">{team.members_count || 11} Players</td>
                            <td className="p-3.5">
                              <Badge
                                className={`text-[10px] font-extrabold px-2.5 py-0.5 ${
                                  (team.status || "").toLowerCase() === "approved"
                                    ? "bg-emerald-100 text-emerald-800 border-none"
                                    : (team.status || "").toLowerCase() === "rejected"
                                    ? "bg-red-100 text-red-800 border-none"
                                    : "bg-amber-100 text-amber-800 border-none"
                                }`}
                              >
                                {team.status || "Pending"}
                              </Badge>
                            </td>
                            <td className="p-3.5 text-right space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateTeamStatus(team.id, "Approved")}
                                className="h-7 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 px-2 rounded-lg cursor-pointer"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateTeamStatus(team.id, "Rejected")}
                                className="h-7 text-[10px] font-extrabold text-red-600 border-red-200 hover:bg-red-50 px-2 rounded-lg cursor-pointer"
                              >
                                Reject
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TEAM MANAGEMENT VIEW */}
          {activeView === "team" && (
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* Header & Primary CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
                      Access Control & Permissions
                    </span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-[#0f172a] mt-1">
                    Console User Accounts & Permissions
                  </h2>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Create console user accounts with custom module permissions. Data is stored in the dedicated <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold">dashboard_users</code> table for console dashboard logins only.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={loadTeamMembers}
                    variant="outline"
                    className="h-10 border-[#cbd5e1] text-[#334155] font-bold text-xs rounded-xl hover:border-[#0f172a] cursor-pointer"
                    title="Reload Team List"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Refresh
                  </Button>

                  <Button
                    onClick={handleOpenAddTeamMember}
                    className="h-10 bg-[#0f172a] hover:bg-[#1e293b] text-white font-extrabold text-xs px-5 rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <UserPlus className="w-4 h-4 mr-2 text-emerald-400" />
                    Add Console User
                  </Button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold text-[#94a3b8] uppercase tracking-wider">Total Console Users</div>
                    <div className="text-2xl font-black text-[#0f172a]">{teamMembers.length}</div>
                    <div className="text-[10px] font-bold text-[#64748b] mt-0.5">Dedicated console logins</div>
                  </div>
                </Card>

                <Card className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold text-[#94a3b8] uppercase tracking-wider">Active Staff Accounts</div>
                    <div className="text-2xl font-black text-emerald-600">
                      {teamMembers.filter((m) => m.status === "Active").length}
                    </div>
                    <div className="text-[10px] font-bold text-[#64748b] mt-0.5">Authorized for login</div>
                  </div>
                </Card>

                <Card className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold text-[#94a3b8] uppercase tracking-wider">Super Administrators</div>
                    <div className="text-2xl font-black text-blue-600">
                      {teamMembers.filter((m) => m.role === "Super Admin" || m.role === "Admin").length}
                    </div>
                    <div className="text-[10px] font-bold text-[#64748b] mt-0.5">Full 5-module control</div>
                  </div>
                </Card>

                <Card className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold text-[#94a3b8] uppercase tracking-wider">Permission Modules</div>
                    <div className="text-2xl font-black text-amber-600">5 Modules</div>
                    <div className="text-[10px] font-bold text-[#64748b] mt-0.5">Granular access control</div>
                  </div>
                </Card>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-3" />
                  <Input
                    type="text"
                    value={teamSearchQuery}
                    onChange={(e) => setTeamSearchQuery(e.target.value)}
                    placeholder="Search by full name, username, email, phone..."
                    className="pl-10 h-10 bg-[#f8fafc] border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] font-medium"
                  />
                  {teamSearchQuery && (
                    <button
                      onClick={() => setTeamSearchQuery("")}
                      className="absolute right-3 top-3 text-[#94a3b8] hover:text-[#0f172a] text-xs cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-[#64748b]" />
                    <span className="text-xs font-bold text-[#475569]">Role:</span>
                    <select
                      value={teamRoleFilter}
                      onChange={(e) => setTeamRoleFilter(e.target.value)}
                      className="bg-[#f8fafc] border border-[#cbd5e1] text-xs font-bold text-[#0f172a] rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-[#0f172a]"
                    >
                      <option value="all">All Roles ({teamMembers.length})</option>
                      <option value="Super Admin">Super Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Editor">Editor</option>
                      <option value="Turf Manager">Turf Manager</option>
                      <option value="Tournament Coordinator">Tournament Coordinator</option>
                      <option value="Community Moderator">Community Moderator</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#475569]">Status:</span>
                    <select
                      value={teamStatusFilter}
                      onChange={(e) => setTeamStatusFilter(e.target.value)}
                      className="bg-[#f8fafc] border border-[#cbd5e1] text-xs font-bold text-[#0f172a] rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-[#0f172a]"
                    >
                      <option value="all">All Status</option>
                      <option value="Active">Active Only</option>
                      <option value="Inactive">Inactive Only</option>
                    </select>
                  </div>

                  {(teamSearchQuery || teamRoleFilter !== "all" || teamStatusFilter !== "all") && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setTeamSearchQuery("");
                        setTeamRoleFilter("all");
                        setTeamStatusFilter("all");
                      }}
                      className="text-xs text-red-600 hover:bg-red-50 font-bold h-9 px-2.5 rounded-xl cursor-pointer"
                    >
                      Reset Filters
                    </Button>
                  )}
                </div>
              </div>

              {/* Console Users List / Cards */}
              <div className="space-y-4">
                {teamMembers
                  .filter((m) => {
                    const q = teamSearchQuery.trim().toLowerCase();
                    const matchQuery =
                      !q ||
                      (m.full_name && m.full_name.toLowerCase().includes(q)) ||
                      (m.username && m.username.toLowerCase().includes(q)) ||
                      (m.email && m.email.toLowerCase().includes(q)) ||
                      (m.phone && m.phone.toLowerCase().includes(q));
                    const matchRole = teamRoleFilter === "all" || m.role === teamRoleFilter;
                    const matchStatus = teamStatusFilter === "all" || m.status === teamStatusFilter;
                    return matchQuery && matchRole && matchStatus;
                  })
                  .map((member) => {
                    const perms = Array.isArray(member.permissions) ? member.permissions : [];
                    const isFullAdmin = member.role === "Super Admin" || perms.length === 5;
                    const isSelf = currentCmsUser && currentCmsUser.id === member.id;
                    const isPrimaryAdmin = member.username?.toLowerCase() === "admin";

                    return (
                      <Card
                        key={member.id}
                        className={`bg-white border transition-all duration-200 rounded-2xl shadow-xs overflow-hidden ${
                          member.status === "Active"
                            ? "border-[#e2e8f0] hover:border-[#cbd5e1]"
                            : "border-red-200/60 bg-slate-50/50 opacity-80"
                        }`}
                      >
                        <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          {/* Left: User Identity & Avatar */}
                          <div className="flex items-start gap-4 min-w-0 lg:w-1/3">
                            <div className="relative shrink-0">
                              <div className="h-12 w-12 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center font-black text-lg shadow-sm">
                                {(member.full_name || member.username || "U").charAt(0).toUpperCase()}
                              </div>
                              <span
                                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                                  member.status === "Active" ? "bg-emerald-500" : "bg-red-500"
                                }`}
                                title={member.status === "Active" ? "Active Account" : "Inactive Account"}
                              />
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-extrabold text-sm text-[#0f172a] truncate">
                                  {member.full_name}
                                </h3>
                                {isSelf && (
                                  <Badge className="bg-emerald-100 text-emerald-700 text-[10px] font-black border-none px-1.5 py-0">
                                    You
                                  </Badge>
                                )}
                                <span
                                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                    ROLE_PRESETS[member.role]?.badgeClass || "bg-slate-100 text-slate-700 border-slate-200"
                                  }`}
                                >
                                  {member.role || "Editor"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs font-semibold text-[#64748b]">
                                <span className="font-mono text-[#0f172a] bg-[#f1f5f9] px-1.5 py-0.5 rounded text-[11px]">
                                  @{member.username}
                                </span>
                                <span>•</span>
                                <span className="truncate">{member.email}</span>
                              </div>

                              {member.phone && (
                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#64748b]">
                                  <Phone className="w-3 h-3 text-[#94a3b8]" />
                                  <span>{member.phone}</span>
                                </div>
                              )}

                              {/* Password Display with Eye Toggle */}
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#64748b] pt-0.5">
                                <Key className="w-3 h-3 text-[#94a3b8]" />
                                <span className="text-[11px] font-bold text-[#64748b]">Password:</span>
                                <span className="font-mono text-[#0f172a] bg-[#f1f5f9] px-2 py-0.5 rounded text-[11px] font-bold">
                                  {revealedPasswords[member.id] ? member.password : "••••••••"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRevealedPasswords((prev) => ({
                                      ...prev,
                                      [member.id]: !prev[member.id],
                                    }))
                                  }
                                  className="text-[#94a3b8] hover:text-[#0f172a] p-0.5 rounded transition-colors cursor-pointer"
                                  title={revealedPasswords[member.id] ? "Hide password" : "Show password"}
                                >
                                  {revealedPasswords[member.id] ? (
                                    <EyeOff className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Middle: Granted Permissions Badges */}
                          <div className="flex-1 lg:border-x lg:border-[#f1f5f9] lg:px-6 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#94a3b8]">
                                Granted Console Permissions ({perms.length}/5)
                              </span>
                              {isFullAdmin && (
                                <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-extrabold text-[10px]">
                                  <ShieldCheck className="w-3 h-3 mr-1" />
                                  Full Console Access
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {CONSOLE_MODULES.map((mod) => {
                                const hasPerm = isFullAdmin || perms.includes(mod.key);
                                const Icon = mod.icon;
                                return (
                                  <div
                                    key={mod.key}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
                                      hasPerm
                                        ? mod.color
                                        : "bg-slate-50 text-slate-400 border-slate-200 opacity-40 line-through"
                                    }`}
                                    title={mod.description}
                                  >
                                    <Icon className="w-3 h-3" />
                                    <span>{mod.label}</span>
                                    {hasPerm ? (
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    ) : (
                                      <X className="w-3 h-3" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Right: Status Toggle & Actions */}
                          <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                            {/* Status Switch */}
                            <Button
                              onClick={() => handleToggleMemberStatus(member)}
                              variant="outline"
                              disabled={isPrimaryAdmin}
                              className={`h-9 px-3 text-xs font-extrabold rounded-xl border transition-all cursor-pointer ${
                                member.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              }`}
                              title={isPrimaryAdmin ? "Primary admin cannot be deactivated" : "Toggle account active status"}
                            >
                              <span
                                className={`h-2 w-2 rounded-full mr-1.5 ${
                                  member.status === "Active" ? "bg-emerald-500" : "bg-red-500"
                                }`}
                              />
                              {member.status === "Active" ? "Active" : "Inactive"}
                            </Button>

                            {/* Edit Button */}
                            <Button
                              onClick={() => handleOpenEditTeamMember(member)}
                              variant="outline"
                              className="h-9 px-3 text-xs font-bold text-[#0f172a] border-[#cbd5e1] hover:border-[#0f172a] rounded-xl cursor-pointer"
                              title="Edit user & permissions"
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                              Edit Permissions
                            </Button>

                            {/* Delete Button */}
                            <Button
                              onClick={() => handleDeleteTeamMember(member)}
                              variant="ghost"
                              disabled={isPrimaryAdmin}
                              className={`h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl cursor-pointer ${
                                isPrimaryAdmin ? "opacity-30 cursor-not-allowed" : ""
                              }`}
                              title={isPrimaryAdmin ? "Primary admin cannot be deleted" : "Delete console account"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}

                {/* Empty State */}
                {teamMembers.filter((m) => {
                  const q = teamSearchQuery.trim().toLowerCase();
                  const matchQuery =
                    !q ||
                    (m.full_name && m.full_name.toLowerCase().includes(q)) ||
                    (m.username && m.username.toLowerCase().includes(q)) ||
                    (m.email && m.email.toLowerCase().includes(q)) ||
                    (m.phone && m.phone.toLowerCase().includes(q));
                  const matchRole = teamRoleFilter === "all" || m.role === teamRoleFilter;
                  const matchStatus = teamStatusFilter === "all" || m.status === teamStatusFilter;
                  return matchQuery && matchRole && matchStatus;
                }).length === 0 && (
                  <Card className="bg-white border border-dashed border-[#cbd5e1] rounded-3xl p-12 text-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-slate-100 text-[#64748b] flex items-center justify-center mx-auto">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-base text-[#0f172a]">No Console Accounts Found</h3>
                    <p className="text-xs text-[#64748b] max-w-sm mx-auto">
                      No team members matched your search or active filters. Try adjusting your query or click below to add a new account.
                    </p>
                    <Button
                      onClick={handleOpenAddTeamMember}
                      className="bg-[#0f172a] text-white text-xs font-extrabold h-9 px-4 rounded-xl cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                      Add New Console User
                    </Button>
                  </Card>
                )}
              </div>
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

      {/* 12. CMS Tournament Add / Edit Modal */}
      <Dialog open={isCmsTournamentModalOpen} onOpenChange={setIsCmsTournamentModalOpen}>
        <DialogContent className="bg-white border-[#e2e8f0] text-[#0f172a] rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              {editingCmsTournament ? "Edit Tournament Details" : "Create New Tournament"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCmsTournament} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Tournament Title</Label>
              <Input
                required
                value={cmsTournamentForm.name}
                onChange={(e) => setCmsTournamentForm({ ...cmsTournamentForm, name: e.target.value })}
                placeholder="e.g. Summer Futsal Championship 2026"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#334155]">Sport Type</Label>
                <select
                  value={cmsTournamentForm.sport}
                  onChange={(e) => setCmsTournamentForm({ ...cmsTournamentForm, sport: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] text-xs text-[#0f172a] rounded-xl p-2.5 font-semibold"
                >
                  <option value="Cricket">Cricket</option>
                  <option value="Football">Football</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Badminton">Badminton</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#334155]">Status</Label>
                <select
                  value={cmsTournamentForm.status}
                  onChange={(e) => setCmsTournamentForm({ ...cmsTournamentForm, status: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] text-xs text-[#0f172a] rounded-xl p-2.5 font-semibold"
                >
                  <option value="Registration Open">Registration Open</option>
                  <option value="Active">Active / Ongoing</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#334155]">Start Date</Label>
                <Input
                  required
                  value={cmsTournamentForm.start_date}
                  onChange={(e) => setCmsTournamentForm({ ...cmsTournamentForm, start_date: e.target.value })}
                  placeholder="Jun 20, 2026"
                  className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#334155]">Prize Pool</Label>
                <Input
                  value={cmsTournamentForm.prize}
                  onChange={(e) => setCmsTournamentForm({ ...cmsTournamentForm, prize: e.target.value })}
                  placeholder="₹50,000"
                  className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#334155]">Max Teams</Label>
                <Input
                  type="number"
                  value={cmsTournamentForm.teams}
                  onChange={(e) => setCmsTournamentForm({ ...cmsTournamentForm, teams: Number(e.target.value) })}
                  placeholder="16"
                  className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#334155]">Location / City</Label>
                <Input
                  value={cmsTournamentForm.location}
                  onChange={(e) => setCmsTournamentForm({ ...cmsTournamentForm, location: e.target.value })}
                  placeholder="e.g. Mumbai"
                  className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Nearby Turf Arena (Optional)</Label>
              <select
                value={cmsTournamentForm.turf_name}
                onChange={(e) => setCmsTournamentForm({ ...cmsTournamentForm, turf_name: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] text-xs text-[#0f172a] rounded-xl p-2.5 font-semibold"
              >
                <option value="">-- Choose Turf Arena --</option>
                {recommendedTurfs.map((t) => (
                  <option key={t.id} value={t.name}>
                    📍 {t.name} ({t.location || "Mumbai"})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Cover Image URL</Label>
              <Input
                value={cmsTournamentForm.image_url}
                onChange={(e) => setCmsTournamentForm({ ...cmsTournamentForm, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10 rounded-xl w-full sm:w-auto">
                {editingCmsTournament ? "Update Tournament" : "Publish Tournament"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 13. Match Day Fixture Add / Edit Modal */}
      <Dialog open={isFixtureModalOpen} onOpenChange={setIsFixtureModalOpen}>
        <DialogContent className="bg-white border-[#e2e8f0] text-[#0f172a] rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              {editingFixture ? "Edit Match Day Fixture" : "Add Match Day Fixture"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveFixture} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#334155]">Team 1 Name</Label>
                <Input
                  required
                  value={fixtureForm.team1}
                  onChange={(e) => setFixtureForm({ ...fixtureForm, team1: e.target.value })}
                  placeholder="e.g. Mumbai Warriors"
                  className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#334155]">Team 2 Name</Label>
                <Input
                  required
                  value={fixtureForm.team2}
                  onChange={(e) => setFixtureForm({ ...fixtureForm, team2: e.target.value })}
                  placeholder="e.g. Delhi Strikers"
                  className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#334155]">Match Date</Label>
                <Input
                  required
                  value={fixtureForm.match_date}
                  onChange={(e) => setFixtureForm({ ...fixtureForm, match_date: e.target.value })}
                  placeholder="Jun 20, 2026"
                  className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#334155]">Match Time</Label>
                <Input
                  required
                  value={fixtureForm.time}
                  onChange={(e) => setFixtureForm({ ...fixtureForm, time: e.target.value })}
                  placeholder="6:00 PM"
                  className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Venue Arena</Label>
              <Input
                required
                value={fixtureForm.venue}
                onChange={(e) => setFixtureForm({ ...fixtureForm, venue: e.target.value })}
                placeholder="e.g. Elite Sports Arena"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a]"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#334155]">Status</Label>
              <select
                value={fixtureForm.status}
                onChange={(e) => setFixtureForm({ ...fixtureForm, status: e.target.value })}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] text-xs text-[#0f172a] rounded-xl p-2.5 font-semibold"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Live">Live / Playing</option>
                <option value="Finished">Finished</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10 rounded-xl w-full sm:w-auto">
                {editingFixture ? "Update Match Fixture" : "Save Match Fixture"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 9. Console Team Member & Permissions Add / Edit Modal */}
      <Dialog open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
        <DialogContent className="bg-white border-[#e2e8f0] text-[#0f172a] rounded-3xl max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <DialogHeader className="border-b border-[#f1f5f9] pb-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest">
                SPORTX Console Access Control
              </span>
            </div>
            <DialogTitle className="text-lg font-black text-[#0f172a]">
              {editingTeamMember ? "Edit Console Account & Permissions" : "Create New Console User Account"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#64748b]">
              Console user credentials are stored in the dedicated <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-bold">dashboard_users</code> table and can only be used to log into this dashboard.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveTeamMember} className="space-y-6 pt-3">
            {/* Account Credentials */}
            <div className="space-y-4">
              <div className="text-xs font-black uppercase tracking-wider text-[#94a3b8] flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#64748b]" />
                1. Account Credentials & Contact
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-extrabold text-[#334155]">Full Name *</Label>
                  <Input
                    required
                    value={teamForm.full_name}
                    onChange={(e) => setTeamForm({ ...teamForm, full_name: e.target.value })}
                    placeholder="e.g. Vikram Sharma"
                    className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a] font-semibold h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-extrabold text-[#334155]">Username *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-[#94a3b8]">@</span>
                    <Input
                      required
                      value={teamForm.username}
                      onChange={(e) => setTeamForm({ ...teamForm, username: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                      placeholder="vikram_turf"
                      className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a] font-semibold pl-7 h-10 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-extrabold text-[#334155]">Email Address *</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#94a3b8] absolute left-3 top-3" />
                    <Input
                      type="email"
                      required
                      value={teamForm.email}
                      onChange={(e) => setTeamForm({ ...teamForm, email: e.target.value })}
                      placeholder="vikram@sportxclub.com"
                      className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a] font-semibold pl-9 h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-extrabold text-[#334155]">Phone Number</Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#94a3b8] absolute left-3 top-3" />
                    <Input
                      value={teamForm.phone}
                      onChange={(e) => setTeamForm({ ...teamForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a] font-semibold pl-9 h-10 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-extrabold text-[#334155]">
                      {editingTeamMember ? "User Password" : "Login Password *"}
                    </Label>
                    {editingTeamMember && (
                      <span className="text-[10px] font-bold text-emerald-600">
                        Current password loaded
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3 top-3" />
                    <Input
                      type={showModalPassword ? "text" : "password"}
                      required={!editingTeamMember}
                      value={teamForm.password}
                      onChange={(e) => setTeamForm({ ...teamForm, password: e.target.value })}
                      placeholder={editingTeamMember ? "User password" : "Create a password"}
                      className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a] font-semibold pl-9 pr-10 h-10 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="absolute right-3 top-2.5 text-[#94a3b8] hover:text-[#0f172a] p-1 rounded-md transition-colors cursor-pointer"
                      title={showModalPassword ? "Hide password" : "Show password"}
                    >
                      {showModalPassword ? (
                        <EyeOff className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-extrabold text-[#334155]">Account Status</Label>
                  <select
                    value={teamForm.status}
                    onChange={(e) => setTeamForm({ ...teamForm, status: e.target.value })}
                    disabled={editingTeamMember?.username?.toLowerCase() === "admin"}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] text-xs text-[#0f172a] font-bold rounded-xl h-10 px-3 cursor-pointer"
                  >
                    <option value="Active">Active (Can Sign In)</option>
                    <option value="Inactive">Inactive (Sign In Blocked)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Role & Preset Selection */}
            <div className="space-y-3 pt-2 border-t border-[#f1f5f9]">
              <div className="text-xs font-black uppercase tracking-wider text-[#94a3b8] flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[#64748b]" />
                2. Select Staff Role & Permission Preset
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-extrabold text-[#334155]">Console Role</Label>
                <select
                  value={teamForm.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] text-xs font-extrabold text-[#0f172a] rounded-xl h-10 px-3 cursor-pointer focus:border-[#0f172a]"
                >
                  <option value="Super Admin">Super Admin — Full 5-Module Control</option>
                  <option value="Manager">Manager — Home Page, Turfs, Tournaments, Community</option>
                  <option value="Editor">Content Editor — Home Page & Community</option>
                  <option value="Turf Manager">Turf Manager — Turfs & Home Page</option>
                  <option value="Tournament Coordinator">Tournament Coordinator — Tournaments & Fixtures</option>
                  <option value="Community Moderator">Community Moderator — Community Feed Only</option>
                  <option value="Custom">Custom — Manually Toggle Permissions</option>
                </select>
                <p className="text-[11px] text-[#64748b] font-medium">
                  {ROLE_PRESETS[teamForm.role]?.description || "Choose tailored module permissions below."}
                </p>
              </div>
            </div>

            {/* Granular Module Permissions Checklist */}
            <div className="space-y-3 pt-2 border-t border-[#f1f5f9]">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-wider text-[#94a3b8] flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-[#64748b]" />
                  3. Granular Console Module Permissions ({teamForm.permissions.length}/5)
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllPermissions}
                    className="text-[11px] font-extrabold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-[#cbd5e1]">|</span>
                  <button
                    type="button"
                    onClick={handleClearAllPermissions}
                    className="text-[11px] font-extrabold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {CONSOLE_MODULES.map((mod) => {
                  const isChecked = teamForm.permissions.includes(mod.key);
                  const Icon = mod.icon;

                  return (
                    <div
                      key={mod.key}
                      onClick={() => handleTogglePermission(mod.key)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? "bg-slate-50 border-[#0f172a] shadow-xs"
                          : "bg-white border-[#e2e8f0] hover:border-[#cbd5e1] opacity-75"
                      }`}
                    >
                      <div className="pt-0.5">
                        {isChecked ? (
                          <div className="h-5 w-5 rounded-md bg-[#0f172a] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-md border-2 border-[#cbd5e1] bg-white" />
                        )}
                      </div>

                      <div className="h-9 w-9 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center shrink-0 shadow-xs">
                        <Icon className="w-4 h-4 text-[#0f172a]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-[#0f172a]">{mod.label}</span>
                          <span className="text-[10px] font-bold text-[#64748b] bg-slate-100 px-1.5 py-0.2 rounded">
                            {mod.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748b] font-medium mt-0.5">{mod.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <DialogFooter className="border-t border-[#f1f5f9] pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTeamModalOpen(false)}
                className="h-10 text-xs font-bold border-[#cbd5e1] text-[#334155] rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSavingTeam}
                className="h-10 bg-[#0f172a] hover:bg-[#1e293b] text-white font-extrabold text-xs px-6 rounded-xl cursor-pointer shadow-md"
              >
                {isSavingTeam ? "Saving Account..." : editingTeamMember ? "Update Console Account" : "Create Console User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
