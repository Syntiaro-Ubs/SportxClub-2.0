import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../providers/auth-provider";
import { useTheme } from "next-themes";
import { cashfreeService } from "../payment/cashfree-service";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Heart,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Share2,
  Star,
  Wifi,
  Car,
  Coffee,
  Droplets,
  Shirt,
  Users,
  Trophy,
  Clock,
  Lock,
  Sparkles,
  Navigation,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  MessageSquare,
  MessageSquarePlus,
  Send,
  Flag,
  AlertTriangle,
  XCircle,
  Ban,
  Loader2,
  Wallet,
  CalendarDays,
  Trash2,
} from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { adminApi } from "../services/admin-api";
import { profileService } from "../services/profile.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { cn } from "../components/ui/utils";
import { GlobalFooter } from "../components/layout/GlobalFooter";

const asset = (path) => `/assets${path}`;

const defaultVenue = {
  name: "Elite Turf Arena",
  location: "Powai, Mumbai",
  address: "123 Sports Complex, Hiranandani Gardens, Powai, Mumbai - 400076",
  rating: 0,
  reviews: 0,
  price: 1200,
  sport: "Football",
  area: "8,500 Sq. Ft. (120ft × 70ft)",
  description:
    "Elite Turf Arena is built for fast discovery and confident booking. The venue combines reliable lighting, verified access, and clear refund terms so players can decide quickly.",
};

const marqueeVerticalStyle = `
  @keyframes marqueeVertical {
    0% { transform: translateY(0); }
    100% { transform: translateY(-50%); }
  }
  .animate-marquee-vertical {
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: marqueeVertical 22s linear infinite;
  }
  .animate-marquee-vertical:hover {
    animation-play-state: paused;
  }
`;

const marqueeHorizontalStyle = `
  @keyframes marqueeHorizontal {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee-horizontal {
    display: flex;
    gap: 12px;
    animation: marqueeHorizontal 20s linear infinite;
    width: max-content;
  }
  .animate-marquee-horizontal:hover {
    animation-play-state: paused;
  }
`;

const amenities = [
  { icon: Maximize2, label: "Turf Area", desc: "8,500 Sq. Ft. (120ft × 70ft)" },
  { icon: Car, label: "Free parking", desc: "Spacious parking slot" },
  { icon: Shirt, label: "Changing rooms", desc: "Clean & sanitized" },
  { icon: Droplets, label: "Showers", desc: "Hot & cold water" },
  { icon: Wifi, label: "Free Wi-Fi", desc: "High-speed network" },
  { icon: Coffee, label: "Cafe Lounge", desc: "Energy drinks & snacks" },
  { icon: Users, label: "Coaching Pro", desc: "Certified trainers" },
];

const CANCEL_REASONS = [
  { id: "schedule", label: "Change of plans / Schedule conflict", icon: "🕒" },
  { id: "wrong_time", label: "Booked wrong date, time or venue", icon: "📍" },
  { id: "weather", label: "Bad weather / Unfavorable turf conditions", icon: "🌧️" },
  { id: "emergency", label: "Personal or medical emergency", icon: "🏥" },
  { id: "teammates", label: "Teammates or players unavailable", icon: "👥" },
  { id: "other", label: "Other reason (specify below)", icon: "✏️" },
];

const SPORT_EMOJIS = {
  Football: "⚽",
  Cricket: "🏏",
  "Box Cricket": "🏏",
  Badminton: "🏸",
  Tennis: "🎾",
  "Lawn Tennis": "🎾",
  Basketball: "🏀",
  Swimming: "🏊",
  Volleyball: "🏐",
  "Table Tennis": "🏓",
  Pickleball: "🏓",
  Padel: "🎾",
  Squash: "🎾",
  "Box MMA": "🥊",
  Boxing: "🥊",
  Kabaddi: "🤼",
  Hockey: "🏑",
  Golf: "⛳",
  Rugby: "🏉",
  Baseball: "⚾",
  Bowling: "🎳",
  Archery: "🏹",
  Skating: "⛸️",
  Pool: "🎱",
  Billiards: "🎱",
  Snooker: "🎱",
  Gym: "🏋️",
  Yoga: "🧘",
  "Multi-sport": "🏆",
  Multisport: "🏆",
  Athletics: "🏃",
};

const getSportEmoji = (sportName) => {
  if (!sportName) return "🏅";
  const clean = String(sportName).trim();
  if (SPORT_EMOJIS[clean]) return SPORT_EMOJIS[clean];
  const lower = clean.toLowerCase();
  for (const [key, emoji] of Object.entries(SPORT_EMOJIS)) {
    if (lower === key.toLowerCase() || lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return emoji;
    }
  }
  return "🏅";
};

export function VenueDetails() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const { currentUser, playerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const activePlayer = useMemo(() => {
    if (currentUser) return currentUser;
    if (playerUser) return playerUser;
    try {
      const p = JSON.parse(localStorage.getItem("playerUser") || "{}");
      if (p && (p.email || p.fullName || p.name || p.id)) return p;
    } catch {}
    return null;
  }, [currentUser, playerUser]);

  const passedVenue = location.state?.venue;
  const [fetchedTurf, setFetchedTurf] = useState(null);
  const [cmsSports, setCmsSports] = useState([]);
  const [walletBalance, setWalletBalance] = useState(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [isWalletPaying, setIsWalletPaying] = useState(false);

  useEffect(() => {
    if (activePlayer?.email || activePlayer?.id) {
      setIsLoadingWallet(true);
      profileService.get(activePlayer)
        .then((res) => {
          if (res?.walletBalance !== undefined) {
            setWalletBalance(Number(res.walletBalance) || 0);
          }
        })
        .catch((err) => console.warn("Could not load wallet balance:", err.message))
        .finally(() => setIsLoadingWallet(false));
    }
  }, [activePlayer]);

  useEffect(() => {
    async function loadCmsSports() {
      try {
        const res = await fetch("/api/cms/sports");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setCmsSports(json.data.filter((s) => s.is_active !== 0));
          }
        }
      } catch (e) {
        console.warn("Could not load CMS sports:", e);
      }
    }
    loadCmsSports();
  }, []);

  useEffect(() => {
    if (id) {
      adminApi.getAll("turfs").then((turfs) => {
        const found = (turfs || []).find((t) => String(t.id) === String(id));
        if (found) setFetchedTurf(found);
      }).catch(console.error);
    }
  }, [id]);

  const activeVenueData = fetchedTurf || passedVenue;
  const venue = activeVenueData
    ? {
      name: activeVenueData.name,
      location: activeVenueData.location,
      address: `${typeof activeVenueData.location === 'object' ? (activeVenueData.location?.address || activeVenueData.location?.city || '') : (activeVenueData.location || '')}, Mumbai, Maharashtra`,
      rating:
        typeof activeVenueData.rating === "number"
          ? activeVenueData.rating
          : parseFloat(activeVenueData.rating) || 0,
      reviews: activeVenueData.reviews !== undefined && activeVenueData.reviews !== null ? Number(activeVenueData.reviews) : 0,
      price: (() => {
        const raw = activeVenueData.price_per_hour ?? activeVenueData.price;
        if (typeof raw === "number") return raw;
        if (typeof raw === "string") {
          const parsed = parseFloat(raw.replace(/[^0-9.]/g, ""));
          return !isNaN(parsed) ? parsed : 1200;
        }
        return 1200;
      })(),
      sport: (activeVenueData.sport || activeVenueData.sport_type || activeVenueData.sportType || "Football").split("•")[0]?.trim(),
      description: activeVenueData.description || `${activeVenueData.name} is built for fast discovery and confident booking.`,
      image: (() => {
        const raw = activeVenueData.image_url || activeVenueData.image;
        if (!raw) return "/assets/venues/turf-1.webp";
        if (typeof raw === "string") {
          const trimmed = raw.trim();
          if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            try {
              const p = JSON.parse(trimmed);
              return p.data || p.url || p.preview || "/assets/venues/turf-1.webp";
            } catch (e) {}
          }
          return trimmed;
        }
        if (typeof raw === "object" && raw !== null) {
          return raw.data || raw.url || raw.preview || "/assets/venues/turf-1.webp";
        }
        return "/assets/venues/turf-1.webp";
      })(),
      gallery: (() => {
        const extractSrc = (val) => {
          if (!val) return "";
          if (typeof val === "string") {
            const trimmed = val.trim();
            if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
              try {
                const parsed = JSON.parse(trimmed);
                return parsed.data || parsed.url || parsed.preview || "";
              } catch (e) {}
            }
            return trimmed;
          }
          if (typeof val === "object" && val !== null) {
            return val.data || val.url || val.preview || "";
          }
          return "";
        };

        let list = [];
        if (activeVenueData.gallery) {
          try {
            let parsed = activeVenueData.gallery;
            while (typeof parsed === "string") {
              try {
                parsed = JSON.parse(parsed);
              } catch {
                break;
              }
            }
            if (Array.isArray(parsed)) {
              list = parsed
                .map((img) => extractSrc(img))
                .filter(Boolean);
            }
          } catch (e) {
            console.error("Gallery parse error:", e);
          }
        }
        if (list.length === 0 && activeVenueData.images && Array.isArray(activeVenueData.images)) {
          list = activeVenueData.images
            .map((img) => extractSrc(img))
            .filter(Boolean);
        }
        const main = extractSrc(activeVenueData.image_url || activeVenueData.image);
        if (main && !list.includes(main)) {
          list = [main, ...list];
        }
        return list.length > 0 ? list : (main ? [main] : ["/assets/venues/turf-1.webp"]);
      })(),
      area: activeVenueData.area || "8,500 Sq. Ft. (120ft × 70ft)",
      id: activeVenueData.id || id,
      opening_time: activeVenueData.opening_time || "06:00 AM",
      closing_time: activeVenueData.closing_time || "11:00 PM",
      slot_duration: activeVenueData.slot_duration ? Number(activeVenueData.slot_duration) : 60,
      operational_days: activeVenueData.operational_days || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      openingHour: (() => {
        if (activeVenueData.opening_time) {
          const match = activeVenueData.opening_time.match(/(\d{1,2})/);
          if (match) {
            let h = parseInt(match[1], 10);
            if (activeVenueData.opening_time.toLowerCase().includes("pm") && h < 12) h += 12;
            if (activeVenueData.opening_time.toLowerCase().includes("am") && h === 12) h = 0;
            return h;
          }
        }
        return activeVenueData.openingHour || 6;
      })(),
      closingHour: (() => {
        let openH = 6;
        if (activeVenueData.opening_time) {
          const mOpen = activeVenueData.opening_time.match(/(\d{1,2})/);
          if (mOpen) {
            openH = parseInt(mOpen[1], 10);
            if (activeVenueData.opening_time.toLowerCase().includes("pm") && openH < 12) openH += 12;
            if (activeVenueData.opening_time.toLowerCase().includes("am") && openH === 12) openH = 0;
          }
        }
        if (activeVenueData.closing_time) {
          const match = activeVenueData.closing_time.match(/(\d{1,2})/);
          if (match) {
            let h = parseInt(match[1], 10);
            if (activeVenueData.closing_time.toLowerCase().includes("pm") && h < 12) h += 12;
            if (activeVenueData.closing_time.toLowerCase().includes("am") && h === 12) h = 0;
            if (h <= openH) h += 24; // Handle late-night closing e.g. 03:00 AM (= 27)
            return h;
          }
        }
        return activeVenueData.closingHour || 23;
      })(),
    }
    : { ...defaultVenue, id };

  const venueSportsList = useMemo(() => {
    if (!activeVenueData) return [];
    const raw = activeVenueData.sports || activeVenueData.sport_type || activeVenueData.sportType || activeVenueData.sport || "";
    let list = [];
    if (Array.isArray(raw)) {
      list = raw;
    } else if (typeof raw === "string" && raw.trim()) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed;
      } catch {
        list = raw.split(/[,•;/]+/).map((s) => s.trim()).filter(Boolean);
      }
    }
    return list.map((s) => (typeof s === "object" && s !== null ? (s.name || s.label || "") : String(s)).trim()).filter(Boolean);
  }, [activeVenueData]);

  const availableSports = useMemo(() => {
    const result = [];
    const seen = new Set();

    const addSport = (name, icon = null) => {
      if (!name) return;
      const cleanName = String(name).trim();
      if (!cleanName) return;
      const key = cleanName.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      result.push({
        name: cleanName,
        icon: icon || getSportEmoji(cleanName),
      });
    };

    // 1. Venue specific sports first
    venueSportsList.forEach((s) => {
      if (s.toLowerCase() === "multi-sport" || s.toLowerCase() === "multisport") {
        ["Football", "Cricket", "Badminton", "Basketball", "Tennis", "Volleyball", "Table Tennis"].forEach((m) => addSport(m));
      } else {
        addSport(s);
      }
    });

    // 2. CMS sports from database
    cmsSports.forEach((s) => addSport(s.name, s.icon));

    // 3. Platform default sports to ensure full dynamic coverage
    const defaultSports = [
      "Football",
      "Cricket",
      "Box Cricket",
      "Badminton",
      "Tennis",
      "Basketball",
      "Swimming",
      "Volleyball",
      "Table Tennis",
      "Pickleball",
      "Padel",
      "Squash",
      "Box MMA",
      "Kabaddi",
      "Hockey",
    ];
    defaultSports.forEach((s) => addSport(s));

    return result;
  }, [venueSportsList, cmsSports]);

  const [selectedSport, setSelectedSport] = useState(
    venue.sport || "Football",
  );

  useEffect(() => {
    if (venueSportsList.length > 0) {
      const firstSport = venueSportsList[0];
      const initial = (firstSport.toLowerCase() === "multi-sport" || firstSport.toLowerCase() === "multisport")
        ? "Football"
        : firstSport;
      setSelectedSport(initial);
    } else if (venue.sport && venue.sport !== "Multi-sport") {
      setSelectedSport(venue.sport);
    }
  }, [venueSportsList, venue.sport]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedSlots, setSelectedSlots] = useState([]); // Array of startHour numbers, e.g. [17, 18]
  const [playHours, setPlayHours] = useState(1);
  const [tempDuration, setTempDuration] = useState("1");

  useEffect(() => {
    setTempDuration(String(playHours));
  }, [playHours]);

  const commitDuration = () => {
    const parsed = parseInt(tempDuration, 10);
    if (isNaN(parsed) || parsed < 1) {
      setPlayHours(1);
      setTempDuration("1");
    } else if (parsed > 12) {
      setPlayHours(12);
      setTempDuration("12");
    } else {
      setPlayHours(parsed);
      setTempDuration(String(parsed));
    }
  };
  const [showCustomHours, setShowCustomHours] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [cancelledSlots, setCancelledSlots] = useState([]);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [slotToCancel, setSlotToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("Change of plans / Schedule conflict");
  const [customReason, setCustomReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewAuthor, setReviewAuthor] = useState(() => {
    try {
      const p = JSON.parse(localStorage.getItem("playerUser") || "{}");
      return p.name || p.fullName || localStorage.getItem("userName") || "";
    } catch {
      return "";
    }
  });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Dynamic reviews metrics for this venue
  const totalVenueReviews = reviewsList.length;
  const averageVenueRating = useMemo(() => {
    if (reviewsList.length === 0) return 0;
    const sum = reviewsList.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return Number((sum / reviewsList.length).toFixed(1));
  }, [reviewsList]);

  // Load purely dynamic reviews from DB for this venue
  useEffect(() => {
    let isMounted = true;
    async function loadDbReviews() {
      if (!venue.name) return;
      setIsLoadingReviews(true);
      try {
        const res = await fetch(`/api/turf/reviews?turf_name=${encodeURIComponent(venue.name)}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data)) {
            const currentVenueName = String(venue.name || "").toLowerCase().trim();
            const dbFormatted = json.data
              .filter((r) => {
                if (!currentVenueName) return true;
                const turfName = String(r.turf_name || "").toLowerCase().trim();
                return !turfName || turfName.includes(currentVenueName) || currentVenueName.includes(turfName);
              })
              .map((r) => ({
                id: r.id,
                name: r.user_name || "Anonymous Player",
                rating: Number(r.rating) || 5,
                date: r.date || "Recently",
                daysAgo: 0,
                comment: r.comment || "",
              }));

            setReviewsList(dbFormatted);
          }
        }
      } catch (err) {
        console.warn("Could not load DB reviews:", err);
      } finally {
        if (isMounted) setIsLoadingReviews(false);
      }
    }
    loadDbReviews();
    return () => {
      isMounted = false;
    };
  }, [venue.name]);

  const handleSubmitReview = async (e) => {
    e?.preventDefault();
    if (!reviewComment.trim()) {
      toast.error("Please enter your review comment before submitting.");
      return;
    }

    const authorName = reviewAuthor.trim() || "Anonymous Player";
    setIsSubmittingReview(true);

    try {
      const payload = {
        user_name: authorName,
        turf_name: venue.name || "Sports Arena",
        rating: reviewRating,
        comment: reviewComment.trim(),
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      };

      const res = await fetch("/api/turf/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      const created = json?.data;

      const newReviewItem = {
        id: created?.id || Date.now(),
        name: created?.user_name || authorName,
        rating: Number(created?.rating) || reviewRating,
        date: created?.date || "Just now",
        daysAgo: 0,
        comment: created?.comment || reviewComment.trim(),
      };

      setReviewsList((prev) => [newReviewItem, ...prev]);
      setReviewComment("");
      setIsSubmittingReview(false);
      toast.success("Thank you! Your review has been posted successfully.");
    } catch (err) {
      console.error("Error submitting review:", err);
      const newReviewItem = {
        id: Date.now(),
        name: authorName,
        rating: reviewRating,
        date: "Just now",
        daysAgo: 0,
        comment: reviewComment.trim(),
      };
      setReviewsList((prev) => [newReviewItem, ...prev]);
      setReviewComment("");
      setIsSubmittingReview(false);
      toast.success("Review posted successfully!");
    }
  };

  const [sortBy, setSortBy] = useState("recent");
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(3);
  const [likedReviews, setLikedReviews] = useState(new Set());

  const handleLikeReview = (idKey) => {
    setLikedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idKey)) {
        newSet.delete(idKey);
      } else {
        newSet.add(idKey);
      }
      return newSet;
    });
  };

  const handleReplyReview = (idKey) => {
    toast.success("Reply dialog opened!");
  };

  const handleReportReview = (idKey) => {
    toast.info("Review reported to admins.");
  };

  const isMyReview = (rev) => {
    if (!rev) return false;
    const revAuthor = String(rev.name || rev.user_name || "").trim().toLowerCase();
    if (!revAuthor) return false;

    // Check all possible identifiers of the current logged-in user
    const names = [
      activePlayer?.name,
      activePlayer?.fullName,
      activePlayer?.full_name,
      reviewAuthor,
      (() => {
        try {
          const p = JSON.parse(localStorage.getItem("playerUser") || "{}");
          return p.name || p.fullName || p.full_name;
        } catch { return null; }
      })(),
      (() => {
        try {
          const u = JSON.parse(localStorage.getItem("user") || "{}");
          return u.name || u.full_name;
        } catch { return null; }
      })(),
      localStorage.getItem("userName"),
    ]
      .filter(Boolean)
      .map((n) => String(n).trim().toLowerCase());

    return names.some((n) => n === revAuthor);
  };

  const handleDeleteReview = async (rev) => {
    if (!rev) return;
    const confirmDelete = window.confirm("Are you sure you want to delete your review?");
    if (!confirmDelete) return;

    try {
      if (rev.id) {
        await fetch(`/api/turf/reviews/${rev.id}`, { method: "DELETE" });
      }
      setReviewsList((prev) => prev.filter((r) => (rev.id ? r.id !== rev.id : r !== rev)));
      toast.success("Your review has been deleted.");
    } catch (err) {
      console.error("Error deleting review:", err);
      setReviewsList((prev) => prev.filter((r) => (rev.id ? r.id !== rev.id : r !== rev)));
      toast.success("Review removed.");
    }
  };
  const [showAllSlots, setShowAllSlots] = useState(false);
  const [dbBookings, setDbBookings] = useState([]);

  const loadBookings = async () => {
    try {
      const data = await adminApi.getAll("bookings");
      setDbBookings(data || []);
    } catch (err) {
      console.error("Error loading bookings in venue-details:", err);
    }
  };

  useEffect(() => {
    loadBookings();

    const handlePageShow = () => {
      loadBookings();
    };
    const handlePopState = () => {
      loadBookings();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadBookings();
      }
    };
    const handleFocus = () => {
      loadBookings();
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const interval = setInterval(loadBookings, 3000);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [id, selectedDate]);

  const handleOpenCancelModal = (slot) => {
    setSlotToCancel(slot);
    setCancelReason("Change of plans / Schedule conflict");
    setCustomReason("");
    setCancelModalOpen(true);
  };

  const handleConfirmCancelSlot = async () => {
    if (!slotToCancel) return;
    setIsCancelling(true);

    const slotHour = slotToCancel.startHour;
    const bookingId = slotToCancel.bookingId || slotToCancel.booking?.id || slotToCancel.booking?.booking_code;
    const formattedTimeSlot = formatSlotRange(slotHour, 1);
    const refundAmount = slotToCancel.booking?.amount || getSlotPrice(slotHour, 1) || venue.price || 0;

    const finalReason = cancelReason === "Other reason (specify below)"
      ? (customReason.trim() || "User requested cancellation")
      : (customReason.trim() ? `${cancelReason} - ${customReason.trim()}` : cancelReason);

    // 1. Immediately mark slot as cancelled in local UI state so it instantly turns Available
    setCancelledSlots((prev) => [...new Set([...prev, slotHour])]);

    // 2. Optimistically update dbBookings state locally
    setDbBookings((prev) =>
      prev.map((b) => {
        const isTarget = (
          (bookingId && (String(b.id) === String(bookingId) || String(b.booking_code) === String(bookingId))) ||
          (String(b.turf_name || "").toLowerCase().trim() === String(venue.name || "").toLowerCase().trim() &&
           String(b.date || "").trim() === String(selectedDate || "").trim() &&
           (String(b.time_slot || "").includes(formattedTimeSlot) || String(b.time || "").includes(formattedTimeSlot)))
        );
        return isTarget ? { ...b, status: "Cancelled" } : b;
      })
    );

    // 3. Remove from localStorage sportxclub_confirmed_bookings
    try {
      const confirmedList = JSON.parse(localStorage.getItem("sportxclub_confirmed_bookings") || "[]");
      const filtered = confirmedList.filter((b) => {
        const isMatch = (
          (b.booking_code && bookingId && String(b.booking_code) === String(bookingId)) ||
          (b.id && bookingId && String(b.id) === String(bookingId)) ||
          (String(b.turf_name || "").toLowerCase().trim() === String(venue.name || "").toLowerCase().trim() &&
           String(b.date || "").trim() === String(selectedDate || "").trim() &&
           (String(b.time_slot || "").includes(formattedTimeSlot) || String(b.time || "").includes(formattedTimeSlot)))
        );
        return !isMatch;
      });
      localStorage.setItem("sportxclub_confirmed_bookings", JSON.stringify(filtered));
    } catch (e) {}

    // 4. Clear sessionStorage last booking if it matched
    try {
      const lb = JSON.parse(sessionStorage.getItem("sportxclub_last_booking") || "{}");
      if (
        (lb.venue === venue.name || !lb.venue) &&
        (lb.date === selectedDate || !lb.date) &&
        (lb.time === formattedTimeSlot || lb.time?.includes(formatHour(slotHour)))
      ) {
        sessionStorage.removeItem("sportxclub_last_booking");
        sessionStorage.removeItem("sportxclub_booking");
        sessionStorage.removeItem("sportxclub_pending_booking");
      }
    } catch (e) {}

    try {
      const user = activePlayer || currentUser;
      const res = await profileService.cancelBooking(user, bookingId || "direct", finalReason, {
        turfName: venue.name,
        date: selectedDate,
        timeSlot: formattedTimeSlot,
        userName: user?.fullName || user?.name || user?.full_name || slotToCancel.bookedBy,
        userEmail: user?.email || slotToCancel.bookedByEmail || slotToCancel.booking?.user_email,
        phone: user?.phone || user?.phoneNumber,
      });

      if (res?.success !== false) {
        toast.success(`Slot booking cancelled! ₹${refundAmount} refunded to your wallet.`);
      } else {
        toast.info(res?.error || "Slot cancelled from current view.");
      }
    } catch (err) {
      console.warn("Cancel slot API call:", err.message);
      toast.success(`Slot booking cancelled! ₹${refundAmount} refunded.`);
    } finally {
      await loadBookings();
      setIsCancelling(false);
      setCancelModalOpen(false);
      setSlotToCancel(null);
    }
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];
  const venueOpeningHour = venue.openingHour || 6;
  const venueClosingHour = venue.closingHour || 23;

  const localConfirmedBookings = useMemo(() => {
    try {
      const list = JSON.parse(localStorage.getItem("sportxclub_confirmed_bookings") || "[]");
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }, [dbBookings]);

  const allBookings = useMemo(() => {
    const combined = [...dbBookings];
    localConfirmedBookings.forEach((localB) => {
      const isAlreadyPresent = combined.some((b) =>
        (b.id && localB.id && String(b.id) === String(localB.id)) ||
        (b.booking_code && localB.booking_code && String(b.booking_code) === String(localB.booking_code)) ||
        (String(b.turf_name || "").toLowerCase().trim() === String(localB.turf_name || "").toLowerCase().trim() &&
         String(b.date || "").trim() === String(localB.date || "").trim() &&
         String(b.time_slot || b.slot_time || "").trim() === String(localB.time_slot || localB.time || "").trim() &&
         String(b.status || "").toLowerCase() !== "cancelled")
      );
      if (!isAlreadyPresent && localB.status !== "Cancelled") {
        combined.push(localB);
      }
    });
    return combined;
  }, [dbBookings, localConfirmedBookings]);

  const baseTimeSlots = useMemo(() => {
    const slots = [];
    const targetVenueName = String(venue.name || "").toLowerCase().trim();

    // Filter active bookings for this venue & selectedDate
    const venueBookings = allBookings.filter((b) => {
      const bVenueName = String(b.turf_name || b.venue || "").toLowerCase().trim();
      const isSameVenue = !targetVenueName ||
        bVenueName.includes(targetVenueName) ||
        targetVenueName.includes(bVenueName) ||
        (b.turf_id && venue.id && String(b.turf_id) === String(venue.id)) ||
        (b.venueId && venue.id && String(b.venueId) === String(venue.id));

      const isNotCancelled = String(b.status || "").toLowerCase() !== "cancelled";

      const bDate = String(b.date || "").toLowerCase().trim();
      const sDate = String(selectedDate || "").toLowerCase().trim();

      // Timezone-safe Date Comparison
      let matchesDate = false;
      if (bDate === sDate || (bDate && sDate && (bDate.includes(sDate) || sDate.includes(bDate)))) {
        matchesDate = true;
      } else {
        const parseYMD = (str) => {
          if (!str) return null;
          const m = str.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
          if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
          const d = new Date(str);
          if (!isNaN(d.getTime())) {
            const y = d.getFullYear();
            const mo = String(d.getMonth() + 1).padStart(2, '0');
            const da = String(d.getDate()).padStart(2, '0');
            return `${y}-${mo}-${da}`;
          }
          return null;
        };
        const y1 = parseYMD(bDate);
        const y2 = parseYMD(sDate);
        if (y1 && y2 && y1 === y2) {
          matchesDate = true;
        }
      }

      return isSameVenue && isNotCancelled && matchesDate;
    });

    const isHourInTimeSlotString = (h, timeStr) => {
      if (!timeStr) return false;
      const segments = String(timeStr).split(/[,;]+/);
      for (const seg of segments) {
        const s = seg.trim();
        if (!s) continue;
        const rangeMatch = s.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
        if (rangeMatch) {
          let startH = parseInt(rangeMatch[1], 10);
          let startPeriod = rangeMatch[3] ? rangeMatch[3].toLowerCase() : null;
          let endH = parseInt(rangeMatch[4], 10);
          let endPeriod = rangeMatch[6] ? rangeMatch[6].toLowerCase() : null;

          if (!endPeriod) {
            if (startPeriod) endPeriod = startPeriod;
            else endPeriod = (s.toLowerCase().includes("pm") && !s.toLowerCase().includes("am")) ? "pm" : "am";
          }
          if (!startPeriod) {
            if (endPeriod === "pm" && startH <= endH) startPeriod = "pm";
            else if (endPeriod === "pm" && startH > endH) startPeriod = "am";
            else startPeriod = "am";
          }

          if (startPeriod === "pm" && startH < 12) startH += 12;
          if (startPeriod === "am" && startH === 12) startH = 0;

          if (endPeriod === "pm" && endH < 12) endH += 12;
          if (endPeriod === "am" && endH === 12) endH = 0;

          if (endH <= startH) endH += 24;

          if (h >= startH && h < endH) return true;
        }

        const singleMatch = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
        if (singleMatch) {
          let startH = parseInt(singleMatch[1], 10);
          const period = singleMatch[3] ? singleMatch[3].toLowerCase() : (s.toLowerCase().includes("pm") ? "pm" : "am");
          if (period === "pm" && startH < 12) startH += 12;
          if (period === "am" && startH === 12) startH = 0;
          if (h === startH) return true;
        }
      }
      return false;
    };

    for (let h = venueOpeningHour; h < venueClosingHour; h++) {
      const formatHour = (hourNum) => {
        const h24 = hourNum % 24;
        let h12 = h24 % 12;
        if (h12 === 0) h12 = 12;
        const ampm = (h24 >= 12 && h24 < 24) ? "PM" : "AM";
        return `${String(h12).padStart(2, "0")}:00 ${ampm}`;
      };

      let matchingBkg = venueBookings.find((b) => {
        const bTime = String(b.time_slot || b.slot_time || b.slotTime || b.time || "").toLowerCase().trim();
        return isHourInTimeSlotString(h, bTime);
      });

      if (cancelledSlots.includes(h)) {
        matchingBkg = null;
      }

      let bookedBy = matchingBkg ? (matchingBkg.user_name || "Booked Player") : undefined;
      let bookedByEmail = matchingBkg ? (matchingBkg.user_email || "") : undefined;
      let bookingId = matchingBkg ? matchingBkg.id : undefined;

      slots.push({
        startHour: h,
        label: formatHour(h),
        endLabel: formatHour(h + 1),
        bookedBy,
        bookedByEmail,
        bookingId,
        booking: matchingBkg,
      });
    }
    return slots;
  }, [venueOpeningHour, venueClosingHour, allBookings, cancelledSlots, venue.name, venue.id, selectedDate]);

  const currentDate = new Date();
  const currentLiveHour = currentDate.getHours();
  // If current minutes > 0 (e.g. 9:08 AM), the 9 AM slot is in progress, so next full hour slot starts at 10 AM
  const nextFullHour = currentDate.getMinutes() > 0 ? currentLiveHour + 1 : currentLiveHour;
  const effectiveStartHour = isToday
    ? Math.max(nextFullHour, venueOpeningHour)
    : venueOpeningHour;

  const timeSlots = useMemo(() => {
    return baseTimeSlots.filter((slot) => slot.startHour >= effectiveStartHour);
  }, [baseTimeSlots, isToday, effectiveStartHour]);

  const formatSlotRange = (startHour, hours) => {
    const formatHour = (h) => {
      const h24 = h % 24;
      let hourNum = h24 % 12;
      if (hourNum === 0) hourNum = 12;
      const amPm = (h24 >= 12 && h24 < 24) ? "PM" : "AM";
      return `${String(hourNum).padStart(2, "0")}:00 ${amPm}`;
    };
    return `${formatHour(startHour)} - ${formatHour(startHour + hours)}`;
  };

  const getSlotPrice = (startHour, hours) => {
    if (startHour === null || startHour === undefined || isNaN(startHour)) return 0;
    let total = 0;
    for (let i = 0; i < hours; i++) {
      const checkHour = startHour + i;
      const basePrice = venue.price || 1200;
      if (checkHour >= 18 && checkHour <= 19) {
        total += Math.round(basePrice * 1.15);
      } else if (checkHour >= 20 && checkHour <= 22) {
        total += Math.round(basePrice * 1.0);
      } else {
        total += Math.round(basePrice * 0.85);
      }
    }
    return total;
  };

  const getStartHour = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return null;
    const parsed = parseInt(timeStr.split(":")[0], 10);
    return isNaN(parsed) ? null : parsed;
  };
  const hourToTimeStr = (hour) => `${hour.toString().padStart(2, "0")}:00`;

  const isOverlapping = (startHour) => {
    for (let i = 0; i < playHours; i++) {
      const checkHour = startHour + i;
      const slot = timeSlots.find((s) => s.startHour === checkHour);
      if (slot && slot.bookedBy) return true;
    }
    return false;
  };

  const isOutOfBounds = (startHour) => startHour + playHours > venueClosingHour;

  const handleToggleSlot = (slotHour) => {
    setSelectedSlots((prev) => {
      if (prev.includes(slotHour)) {
        return prev.filter((h) => h !== slotHour);
      } else {
        if (playHours > 1) {
          const filtered = prev.filter((h) => !((slotHour < h + playHours) && (slotHour + playHours > h)));
          return [...filtered, slotHour].sort((a, b) => a - b);
        }
        return [...prev, slotHour].sort((a, b) => a - b);
      }
    });
  };

  const totalSlotPrice = useMemo(() => {
    if (selectedSlots.length === 0) return 0;
    return selectedSlots.reduce((sum, h) => sum + getSlotPrice(h, playHours), 0);
  }, [selectedSlots, playHours, venue.price]);

  const hasSelectedSlots = selectedSlots.length > 0;

  useEffect(() => {
    setSelectedSlots((prev) =>
      prev.filter((h) =>
        timeSlots.some((s) => s.startHour === h && (!s.bookedBy || cancelledSlots.includes(h)))
      )
    );
  }, [selectedDate, playHours, timeSlots, cancelledSlots]);

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    if (!isFavorite) {
      toast.success("Added to favorites!");
    } else {
      toast.info("Removed from favorites.");
    }
  };

  const handleShareClick = async () => {
    const shareData = {
      title: venue.name,
      text: `Check out ${venue.name} on SportXClub!`,
      url: window.location.href,
    };
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)
    ) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } catch (err) {
        if (err.name !== "AbortError") toast.error("Could not share.");
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link.");
      }
    }
  };

  // Date Quick Select Options
  const today = new Date();
  const dateOptions = Array.from({ length: 2 }).map((_, idx) => {
    const d = new Date();
    d.setDate(today.getDate() + idx);
    const iso = d.toISOString().split("T")[0];
    const label =
      idx === 0
        ? "Today"
        : "Tomorrow";
    return { iso, label };
  });

  const todayIso = today.toISOString().split("T")[0];
  const isCustomDate = !dateOptions.some((opt) => opt.iso === selectedDate);
  const getCustomDateLabel = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch (e) {
      return "Date";
    }
  };

  const formatDateLabel = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
    } catch (e) {
      return dateStr;
    }
  };

  const handlePrevMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1));
  };

  const getCalendarCells = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const cells = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthTotalDays - i);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localIso = new Date(d.getTime() - tzOffset).toISOString().split("T")[0];
      cells.push({
        day: prevMonthTotalDays - i,
        isCurrentMonth: false,
        date: d,
        iso: localIso
      });
    }

    // Current month
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localIso = new Date(d.getTime() - tzOffset).toISOString().split("T")[0];
      cells.push({
        day: i,
        isCurrentMonth: true,
        date: d,
        iso: localIso
      });
    }

    // Next month padding
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localIso = new Date(d.getTime() - tzOffset).toISOString().split("T")[0];
      cells.push({
        day: i,
        isCurrentMonth: false,
        date: d,
        iso: localIso
      });
    }

    return cells;
  };

  const isDateDisabled = (dateObj) => {
    const todayZero = new Date();
    todayZero.setHours(0, 0, 0, 0);

    const compareDate = new Date(dateObj);
    compareDate.setHours(0, 0, 0, 0);

    return compareDate < todayZero;
  };

  return (
    <div
      className={cn(
        "min-h-screen isolate transition-colors duration-300",
        isDark ? "bg-[#060813] text-white" : "bg-slate-50 text-slate-900",
      )}
    >


      <style>{marqueeHorizontalStyle}</style>

      <div className="mx-auto max-w-[1440px] px-4 pt-0 pb-2 sm:px-6 lg:px-8 lg:pt-4 lg:pb-0">
        <div className="mb-4 pt-2">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer text-slate-900 dark:text-white border-none bg-transparent w-fit">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
        {/* Main 12-Column Layout Section */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Hero Photo, Venue Overview, Amenities, Map, Reviews */}
          <div className="contents lg:block lg:col-span-6 xl:col-span-7 lg:space-y-8 lg:pr-2 lg:pb-6">
            {/* Unified Photo Gallery Container */}
            <div className="flex flex-col gap-3 w-full order-1 lg:order-none">
              {/* Main Hero Photo (Spans 1 column on desktop) */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-auto md:h-[280px] rounded-2xl overflow-hidden group">
                <ImageWithFallback
                  src={venue.image || (venue.gallery && venue.gallery[0]) || "/assets/venues/turf-1.webp"}
                  alt={venue.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-black/30 to-transparent" />

                {/* Bottom Venue Details Overlay */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-10">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <Badge
                      className={cn(
                        "rounded-full font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5",
                        isDark
                          ? "bg-transparent text-white"
                          : "bg-transparent text-white",
                      )}
                    >
                      FIFA Standard
                    </Badge>
                    <Badge
                      className={cn(
                        "rounded-full font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5",
                        isDark
                          ? "bg-transparent text-white"
                          : "bg-transparent text-white",
                      )}
                    >
                      Pro Lighting
                    </Badge>
                    <Badge
                      className={cn(
                        "rounded-full font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5",
                        isDark
                          ? "bg-transparent text-white"
                          : "bg-transparent text-white",
                      )}
                    >
                      📐 {venue.area}
                    </Badge>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black !text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                    {venue.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-2 text-xs sm:text-sm font-semibold !text-white/90">
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        isDark ? "text-white" : "text-white"
                      )}
                    >
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{typeof venue.location === 'object' ? (venue.location?.city || venue.location?.address || 'Location unavailable') : venue.location}</span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-1 rounded-full",
                        isDark ? "text-white" : "text-white"
                      )}
                    >
                      {totalVenueReviews > 0 ? (
                        <>
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-white">
                            {averageVenueRating.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-white/80">
                            ({totalVenueReviews})
                          </span>
                        </>
                      ) : (
                        <>
                          <Star className="h-3.5 w-3.5 text-white/40" />
                          <span className="text-xs font-semibold text-white/80">
                            New (0 reviews)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Automatic Scrolling Marquee for Secondary Photos */}
              <div className="overflow-hidden relative w-full rounded-xl">
                <div className="animate-marquee-horizontal">
                  {(() => {
                    let photos = [];
                    if (venue.gallery && Array.isArray(venue.gallery)) {
                      photos = Array.from(new Set(venue.gallery.filter(Boolean)));
                    }
                    if (photos.length > 1) {
                      photos = photos.slice(1);
                    } else {
                      photos = [
                        "/assets/venues/turf-2.webp",
                        "/assets/venues/turf-3.webp",
                        "/assets/venues/new_football_turf_2.png",
                      ];
                    }
                    const marqueeList = photos.length >= 3
                      ? [...photos, ...photos]
                      : photos.length === 2
                      ? [photos[0], photos[1], photos[0], photos[1], photos[0], photos[1]]
                      : [photos[0], "/assets/venues/turf-2.webp", "/assets/venues/turf-3.webp"];
                    return marqueeList.map((img, idx) => (
                      <div key={idx} className="relative aspect-video sm:aspect-[21/9] md:aspect-video rounded-xl overflow-hidden group border border-slate-200 dark:border-white/5 w-[150px] sm:w-[220px] md:w-[280px] shrink-0">
                        <ImageWithFallback
                          src={img}
                          alt={`Venue Photo ${idx + 1}`}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div className="space-y-4 w-full order-3 lg:order-none">
              <h3
                className={cn(
                  "text-xl font-extrabold tracking-tight",
                  isDark ? "text-white" : "text-slate-900",
                )}
              >
                Venue Amenities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenities.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border p-3.5 transition-all shadow-sm",
                        isDark
                          ? "border-white/5 bg-white/[0.03] hover:bg-white/[0.05] hover:border-emerald-600/30"
                          : "border-slate-200 bg-white hover:bg-slate-50/50 hover:border-emerald-300",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl border shrink-0",
                          isDark
                            ? "bg-emerald-600/10 border-emerald-600/20 text-emerald-600"
                            : "bg-emerald-50 border-emerald-150 text-emerald-600",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p
                          className={cn(
                            "text-xs font-bold",
                            isDark ? "text-white" : "text-slate-800",
                          )}
                        >
                          {item.label}
                        </p>
                        <p
                          className={cn(
                            "text-[10px]",
                            isDark ? "text-white/50" : "text-slate-500",
                          )}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Map & Directions */}
            <div className="space-y-4 w-full order-4 lg:order-none">
              <div className="flex items-center justify-between">
                <h3
                  className={cn(
                    "text-xl font-extrabold tracking-tight",
                    isDark ? "text-white" : "text-slate-900",
                  )}
                >
                  Location & Directions
                </h3>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(venue.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-bold transition-colors",
                    isDark
                      ? "text-emerald-600 hover:underline"
                      : "text-emerald-600 hover:underline",
                  )}
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Get Directions</span>
                </a>
              </div>

              <div
                className={cn(
                  "rounded-2xl border overflow-hidden h-[280px] relative transition-colors duration-300",
                  isDark
                    ? "border-white/10 bg-[#050505]"
                    : "border-slate-200 bg-slate-100",
                )}
              >
                <iframe
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(venue.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                  title="Venue Google Map"
                  className="absolute -top-14 -left-14 w-[calc(100%+112px)] h-[calc(100%+112px)] border-0 transition-opacity duration-300"
                />
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 text-xs",
                  isDark ? "text-white/70" : "text-slate-600",
                )}
              >
                <MapPin
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isDark ? "text-emerald-600" : "text-emerald-600",
                  )}
                >
                </MapPin>
                <span>{venue.address}</span>
              </div>
            </div>

            {/* Verified Player Reviews */}
            <div className="space-y-5 w-full order-5 lg:order-none">
              <div
                className={cn(
                  "flex items-center justify-between border-b pb-4",
                  isDark ? "border-white/10" : "border-slate-200",
                )}
              >
                <div>
                  <h3
                    className={cn(
                      "text-xl font-extrabold tracking-tight",
                      isDark ? "text-white" : "text-slate-900",
                    )}
                  >
                    Player Reviews
                  </h3>
                  <p
                    className={cn(
                      "text-xs mt-0.5",
                      isDark ? "text-white/50" : "text-slate-500",
                    )}
                  >
                    Verified players who booked this venue
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700 bg-transparent">
                  <Star
                    className={cn(
                      "h-3.5 w-3.5",
                      totalVenueReviews > 0 ? "fill-amber-400 text-amber-400" : "text-slate-400 dark:text-white/30",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-black",
                      totalVenueReviews > 0
                        ? (isDark ? "text-emerald-400" : "text-emerald-700")
                        : (isDark ? "text-white/60" : "text-slate-500"),
                    )}
                  >
                    {totalVenueReviews > 0 ? averageVenueRating.toFixed(1) : "0.0"}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isDark ? "text-white/60" : "text-slate-500",
                    )}
                  >
                    ({totalVenueReviews} {totalVenueReviews === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>

              {/* Interactive "Write a Review" Box */}
              <div
                className={cn(
                  "p-4 sm:p-5 rounded-2xl border transition-all duration-300 shadow-sm space-y-3",
                  isDark
                    ? "bg-white/[0.03] border-white/10"
                    : "bg-gradient-to-br from-slate-50 to-emerald-50/20 border-slate-200"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">
                      <MessageSquarePlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={cn("text-sm font-extrabold", isDark ? "text-white" : "text-slate-900")}>
                        Leave a Review
                      </h4>
                      <p className={cn("text-[11px]", isDark ? "text-white/50" : "text-slate-500")}>
                        Share your playing experience with other athletes
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars Selector */}
                  <div className="flex items-center gap-1 bg-white dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-white/10 w-fit">
                    <span className={cn("text-[11px] font-semibold mr-1", isDark ? "text-white/60" : "text-slate-500")}>
                      Rating:
                    </span>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = (reviewHoverRating || reviewRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setReviewHoverRating(star)}
                          onMouseLeave={() => setReviewHoverRating(0)}
                          onClick={() => setReviewRating(star)}
                          className="p-0.5 transition-transform hover:scale-125 cursor-pointer"
                          title={`${star} Star${star > 1 ? "s" : ""}`}
                        >
                          <Star
                            className={cn(
                              "h-4 w-4 transition-colors",
                              active
                                ? "fill-amber-400 text-amber-400"
                                : isDark ? "text-white/20" : "text-slate-300"
                            )}
                          />
                        </button>
                      );
                    })}
                    <span className="text-xs font-black ml-1 text-amber-500">
                      {(reviewHoverRating || reviewRating).toFixed(1)}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-1">
                      <input
                        type="text"
                        value={reviewAuthor}
                        onChange={(e) => setReviewAuthor(e.target.value)}
                        placeholder="Enter your name"
                        className={cn(
                          "w-full h-10 px-3 rounded-xl border text-xs font-medium outline-none transition-all",
                          isDark
                            ? "bg-black/30 border-white/10 text-white placeholder:text-white/40 focus:border-emerald-500"
                            : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        )}
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {["⚽ Great Turf Quality", "💡 Excellent Floodlights", "🚗 Easy Parking", "⚡ Smooth Booking"].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setReviewComment((prev) => prev ? `${prev} • ${tag.replace(/^[^\s]+\s/, "")}` : tag.replace(/^[^\s]+\s/, ""))}
                            className={cn(
                              "text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer",
                              isDark
                                ? "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Write your review here... (e.g. Clean synthetic grass, well-maintained dugout, punctual slot management)"
                      rows={3}
                      className={cn(
                        "w-full p-3 rounded-xl border text-xs leading-relaxed outline-none transition-all resize-none",
                        isDark
                          ? "bg-black/30 border-white/10 text-white placeholder:text-white/40 focus:border-emerald-500"
                          : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      )}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <p className={cn("text-[11px]", isDark ? "text-white/40" : "text-slate-400")}>
                      Your review will appear immediately for other players.
                    </p>

                    <Button
                      type="submit"
                      disabled={isSubmittingReview || !reviewComment.trim()}
                      className={cn(
                        "h-9 px-5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5",
                        isDark
                          ? "bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      )}
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isSubmittingReview ? "Posting..." : "Post Review"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Review Sorting Controls - UI/UX Premium Redesign */}
              {reviewsList.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 pb-1">
                  <div className="flex items-center gap-1.5 shrink-0 select-none">
                    <Sparkles className={cn(
                      "h-3.5 w-3.5",
                      isDark ? "text-emerald-600" : "text-emerald-600"
                    )} />
                    <span className={cn(
                      "text-xs font-extrabold tracking-wide leading-none",
                      isDark ? "text-slate-200" : "text-slate-800"
                    )}>
                      Sort Reviews
                    </span>
                  </div>

                  <div className={cn(
                    "flex p-1 rounded-full border w-full sm:w-fit select-none transition-all duration-300",
                    isDark
                      ? "bg-white/[0.03] border-white/5"
                      : "bg-[#f1f5f9] border-slate-200/80"
                  )}>
                    {[
                      { key: "recent", label: "Recent" },
                      { key: "highest", label: "Highest Rating" },
                      { key: "lowest", label: "Lowest Rating" }
                    ].map((opt) => {
                      const isActive = sortBy === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setSortBy(opt.key)}
                          className={cn(
                            "flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap text-center active:scale-95",
                            isActive
                              ? isDark
                                ? "bg-emerald-600 text-black shadow-md shadow-emerald-600/10 scale-100 font-extrabold"
                                : "bg-white text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/40 scale-100 font-bold"
                              : isDark
                                ? "text-white/60 hover:text-white bg-transparent border-transparent"
                                : "text-slate-500 hover:text-slate-800 bg-transparent border-transparent"
                          )}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {reviewsList.length === 0 ? (
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center p-8 sm:p-10 rounded-2xl border text-center space-y-3 transition-colors duration-300",
                      isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200/80 shadow-sm"
                    )}
                  >
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className={cn("text-base font-bold", isDark ? "text-white" : "text-slate-900")}>
                        No reviews yet for this venue
                      </h4>
                      <p className={cn("text-xs max-w-sm", isDark ? "text-white/50" : "text-slate-500")}>
                        Be the first athlete to write a review above and share your experience with the community!
                      </p>
                    </div>
                  </div>
                ) : (
                  [...reviewsList]
                    .sort((a, b) => {
                      if (sortBy === "highest") {
                        if (b.rating !== a.rating) return b.rating - a.rating;
                        return (b.id || 0) - (a.id || 0);
                      }
                      if (sortBy === "lowest") {
                        if (a.rating !== b.rating) return a.rating - b.rating;
                        return (b.id || 0) - (a.id || 0);
                      }
                      // Default: recent
                      return (b.id || 0) - (a.id || 0);
                    })
                    .slice(0, visibleReviewsCount)
                    .map((rev, idx) => (
                      <div
                        key={rev.id || idx}
                        className={cn(
                          "rounded-xl border p-3.5 space-y-2 transition-colors shadow-sm",
                          isDark
                            ? "border-white/5 bg-white/[0.03]"
                            : "border-slate-200 bg-white hover:bg-slate-50/30",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={cn(
                                "h-8 w-8 rounded-full border font-bold text-xs flex items-center justify-center uppercase",
                                isDark
                                  ? "bg-emerald-600/20 border-emerald-600/40 text-emerald-600"
                                  : "bg-emerald-100 border-emerald-300 text-emerald-800",
                              )}
                            >
                              {rev.name?.[0] || "P"}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p
                                  className={cn(
                                    "text-xs font-bold",
                                    isDark ? "text-white" : "text-slate-800",
                                  )}
                                >
                                  {rev.name}
                                </p>
                                {isMyReview(rev) && (
                                  <span
                                    className={cn(
                                      "text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider",
                                      isDark
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    )}
                                  >
                                    You
                                  </span>
                                )}
                              </div>
                              <p
                                className={cn(
                                  "text-[10px]",
                                  isDark ? "text-white/40" : "text-slate-400",
                                )}
                              >
                                {rev.date}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 shrink-0">
                            <span className={cn("text-[11px] font-extrabold", isDark ? "text-white" : "text-slate-800")}>
                              {Number(rev.rating).toFixed(1)}
                            </span>
                            <Star
                              className="h-3 w-3 fill-emerald-500 text-emerald-500"
                            />
                          </div>
                        </div>
                        <p
                          className={cn(
                            "text-xs leading-relaxed",
                            isDark ? "text-white/70" : "text-slate-600",
                          )}
                        >
                          "{rev.comment}"
                        </p>

                        {/* Review Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-1">
                          <button
                            onClick={() => handleLikeReview(rev.id || idx)}
                            className={cn(
                              "flex items-center gap-1.5 text-[11px] font-semibold transition-colors cursor-pointer",
                              likedReviews.has(rev.id || idx)
                                ? "text-emerald-600"
                                : isDark ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-700"
                            )}
                          >
                            <ThumbsUp className={cn("h-3.5 w-3.5", likedReviews.has(rev.id || idx) ? "fill-emerald-600" : "")} />
                            Like
                          </button>
                          <button
                            onClick={() => handleReplyReview(rev.id || idx)}
                            className={cn(
                              "flex items-center gap-1.5 text-[11px] font-semibold transition-colors cursor-pointer",
                              isDark ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-700"
                            )}
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Reply
                          </button>
                          <button
                            onClick={() => handleReportReview(rev.id || idx)}
                            className={cn(
                              "flex items-center gap-1.5 text-[11px] font-semibold transition-colors cursor-pointer",
                              isDark ? "text-white/30 hover:text-rose-400" : "text-slate-300 hover:text-rose-500"
                            )}
                          >
                            <Flag className="h-3 w-3" />
                            Report
                          </button>

                          {/* Delete Button - ONLY rendered if this review was written by the current logged in user */}
                          {isMyReview(rev) && (
                            <button
                              onClick={() => handleDeleteReview(rev)}
                              className={cn(
                                "flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 pl-2.5 border-l",
                                isDark ? "border-white/10" : "border-slate-200"
                              )}
                              title="Delete this review"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                )}

                {reviewsList.length > 3 && (
                  <div className="flex justify-center pt-2">
                    {visibleReviewsCount < reviewsList.length ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setVisibleReviewsCount((prev) => prev + 3)}
                        className={cn(
                          "rounded-xl font-bold text-xs h-9 px-4 cursor-pointer transition-all border shadow-xs active:scale-95",
                          isDark
                            ? "border-emerald-600/30 hover:bg-emerald-600/10 text-emerald-600 bg-emerald-600/5"
                            : "border-slate-200 hover:bg-slate-100 text-slate-700 bg-white"
                        )}
                      >
                        Show More Reviews
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setVisibleReviewsCount(3)}
                        className={cn(
                          "rounded-xl font-bold text-xs h-9 px-4 cursor-pointer transition-all border shadow-xs active:scale-95",
                          isDark
                            ? "border-emerald-600/30 hover:bg-emerald-600/10 text-emerald-600 bg-emerald-600/5"
                            : "border-slate-200 hover:bg-slate-100 text-slate-700 bg-white"
                        )}
                      >
                        Show Less Reviews
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: High-Converting Interactive Slot Booking Widget */}
          <div className="w-full order-2 lg:order-none lg:col-span-6 xl:col-span-5 lg:sticky lg:top-24 lg:pl-1 lg:pb-6 space-y-6">
            <Card
              className={cn(
                "rounded-xl border shadow-2xl relative z-20 transition-colors duration-300",
                isDark
                  ? "border-emerald-600/30 bg-[#0d0f15] text-white"
                  : "border-slate-200 bg-white text-slate-900",
              )}
            >
              <CardContent className="pt-2 sm:pt-2.5 pb-4 px-4 sm:px-5 space-y-3 relative z-10">
                {/* Header & Controls */}
                <div
                  className={cn(
                    "flex flex-col xl:flex-row xl:items-center justify-between border-b pb-1.5 gap-4 -mt-1",
                    isDark ? "border-white/10" : "border-slate-200",
                  )}
                >
                  <div className="xl:pb-0">
                    <h3
                      className={cn(
                        "text-xl font-extrabold tracking-tight whitespace-nowrap",
                        isDark ? "text-white" : "text-slate-900",
                      )}
                    >
                      Reserve Slot
                    </h3>
                  </div>

                  {/* Single Row 3 Dropdown Controls (Sport, Date, Duration) */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full xl:w-auto xl:flex-1 xl:max-w-[620px]">
                    {/* 1. Sport Select */}
                    <div className="space-y-1 min-w-0">
                      <Select value={selectedSport} onValueChange={setSelectedSport}>
                        <SelectTrigger
                          className={cn(
                            "h-10 rounded-lg border text-xs sm:text-sm font-semibold w-full transition-all cursor-pointer shadow-xs px-2 sm:px-3",
                            isDark
                              ? "bg-slate-900/60 border-slate-700 text-white focus:border-emerald-500"
                              : "bg-white border-slate-300 text-slate-900 focus:border-emerald-500"
                          )}
                        >
                          <SelectValue placeholder="Select Sport">
                            <span className="truncate flex items-center gap-1.5 font-bold">
                              <span className="shrink-0">{getSportEmoji(selectedSport)}</span>
                              <span className="truncate">{selectedSport}</span>
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-slate-300 dark:border-slate-700 max-h-60 overflow-y-auto z-50 p-1 shadow-2xl bg-white dark:bg-slate-900">
                          {availableSports.map((sportItem) => (
                            <SelectItem
                              key={sportItem.name}
                              value={sportItem.name}
                              className="text-xs sm:text-sm font-semibold py-2 px-2.5 rounded-lg cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/40 focus:bg-emerald-50 dark:focus:bg-emerald-950/40"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base shrink-0">{sportItem.icon}</span>
                                <span className="truncate">{sportItem.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 2. Date Select + Interactive Calendar Trigger */}
                    <div className="space-y-1 relative min-w-0">
                      <div className="relative flex items-center">
                        <Select
                          value={selectedDate}
                          onValueChange={(val) => {
                            setSelectedDate(val);
                            setShowCalendar(false);
                          }}
                        >
                          <SelectTrigger
                            className={cn(
                              "h-10 rounded-lg border text-xs sm:text-sm font-semibold w-full transition-all cursor-pointer shadow-xs pl-8 pr-2 sm:pr-3",
                              isDark
                                ? "bg-slate-900/60 border-slate-700 text-white focus:border-emerald-500"
                                : "bg-white border-slate-300 text-slate-900 focus:border-emerald-500"
                            )}
                          >
                            <SelectValue placeholder="Select Date">
                              <span className="truncate block">
                                {
                                  selectedDate === dateOptions[0]?.iso
                                    ? "Today"
                                    : selectedDate === dateOptions[1]?.iso
                                      ? "Tomorrow"
                                      : formatDateLabel(selectedDate)
                                }
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="rounded-lg border border-slate-300 dark:border-slate-700 z-50">
                            {dateOptions.map((opt) => (
                              <SelectItem key={opt.iso} value={opt.iso} className="text-sm font-medium py-2 cursor-pointer">
                                📅 {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowCalendar((prev) => !prev);
                          }}
                          className="absolute left-2 z-20 hover:scale-125 transition-transform cursor-pointer text-base bg-transparent border-0 p-0.5 focus:outline-none"
                          title="Click to open full calendar"
                        >
                          📅
                        </button>
                      </div>

                      {/* Dropdown Popover Monthly Calendar */}
                      {showCalendar && (
                        <>
                          {/* Click away backdrop */}
                          <div
                            className="fixed inset-0 z-40 cursor-default"
                            onClick={() => setShowCalendar(false)}
                          />
                          <div
                            className={cn(
                              "absolute left-1/2 -translate-x-1/2 sm:left-[-35px] sm:translate-x-0 top-12 z-[100] w-76 sm:w-80 max-w-[90vw] rounded-2xl border-2 p-4 sm:p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in zoom-in-95",
                              isDark
                                ? "bg-[#0d0f15]/98 border-slate-700 text-white shadow-emerald-500/10"
                                : "bg-white border-slate-300 text-slate-800 shadow-emerald-500/15"
                            )}
                          >
                            {/* Calendar Header */}
                            <div className="flex items-center justify-between mb-3">
                              <button
                                type="button"
                                onClick={handlePrevMonth}
                                className={cn(
                                  "p-1.5 rounded-lg border transition-all cursor-pointer",
                                  isDark
                                    ? "border-white/10 hover:bg-white/5 text-white/70 hover:text-white"
                                    : "border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                                )}
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </button>
                              <span className="text-xs font-black uppercase tracking-wider">
                                {currentCalendarDate.toLocaleDateString("en-US", {
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                              <button
                                type="button"
                                onClick={handleNextMonth}
                                className={cn(
                                  "p-1.5 rounded-lg border transition-all cursor-pointer",
                                  isDark
                                    ? "border-white/10 hover:bg-white/5 text-white/70 hover:text-white"
                                    : "border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                                )}
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Days Header */}
                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                                <span
                                  key={day}
                                  className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider",
                                    isDark ? "text-white/40" : "text-slate-400"
                                  )}
                                >
                                  {day}
                                </span>
                              ))}
                            </div>

                            {/* Calendar Cells */}
                            <div className="grid grid-cols-7 gap-1.5 text-center">
                              {getCalendarCells().map((cell, idx) => {
                                const isSelected = selectedDate === cell.iso;
                                const isDisabled = isDateDisabled(cell.date);
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => {
                                      setSelectedDate(cell.iso);
                                      setShowCalendar(false);
                                    }}
                                    className={cn(
                                      "h-8 w-8 text-[11px] font-bold rounded-lg flex items-center justify-center transition-all cursor-pointer",
                                      isSelected
                                        ? "bg-emerald-600 text-white font-extrabold shadow-sm"
                                        : isDisabled
                                          ? "text-slate-300 dark:text-white/10 cursor-not-allowed line-through opacity-40"
                                          : cell.isCurrentMonth
                                            ? isDark
                                              ? "text-white hover:bg-white/10"
                                              : "text-slate-800 hover:bg-slate-100"
                                            : isDark
                                              ? "text-white/30 hover:bg-white/5"
                                              : "text-slate-400 hover:bg-slate-100"
                                    )}
                                  >
                                    {cell.day}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* 3. Duration Select & Direct Manual Input */}
                    <div className="space-y-1 min-w-0">
                      <div
                        className={cn(
                          "h-10 rounded-lg border text-xs sm:text-sm font-semibold w-full transition-all flex items-center justify-between px-2 sm:px-3 shadow-xs relative",
                          isDark
                            ? "bg-slate-900/60 border-slate-700 text-white focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500"
                            : "bg-white border-slate-300 text-slate-900 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500"
                        )}
                      >
                        <div className="flex items-center gap-0.5 sm:gap-1 min-w-0 flex-1">
                          <span className="shrink-0 text-sm">⏱️</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={tempDuration}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || /^[0-9]+$/.test(val)) {
                                setTempDuration(val);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                commitDuration();
                                e.target.blur();
                              }
                            }}
                            onBlur={commitDuration}
                            className="w-5 sm:w-6 bg-transparent text-center font-semibold focus:outline-none text-sm p-0 m-0 border-0 focus:ring-0 text-foreground cursor-text"
                            aria-label="Custom Duration in Hours"
                          />
                          <span className="text-xs sm:text-sm font-semibold shrink-0">{playHours === 1 ? "Hr" : "Hrs"}</span>
                        </div>

                        {/* Dropdown for quick presets */}
                        <Select
                          value={String(playHours)}
                          onValueChange={(val) => setPlayHours(Number(val))}
                        >
                          <SelectTrigger
                            className="h-full w-5 p-0 border-0 shadow-none bg-transparent hover:bg-transparent focus:ring-0 focus:outline-none cursor-pointer flex items-center justify-center shrink-0"
                            aria-label="Preset Duration Options"
                          >
                            <SelectValue placeholder="" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg border border-slate-300 dark:border-slate-700 z-50">
                            <SelectItem value="1" className="text-sm font-medium py-2">⏱️ 1 Hr</SelectItem>
                            <SelectItem value="2" className="text-sm font-medium py-2">⏱️ 2 Hrs</SelectItem>
                            <SelectItem value="3" className="text-sm font-medium py-2">⏱️ 3 Hrs</SelectItem>
                            <SelectItem value="4" className="text-sm font-medium py-2">⏱️ 4 Hrs</SelectItem>
                            <SelectItem value="5" className="text-sm font-medium py-2">⏱️ 5 Hrs</SelectItem>
                            <SelectItem value="6" className="text-sm font-medium py-2">⏱️ 6 Hrs</SelectItem>
                            <SelectItem value="8" className="text-sm font-medium py-2">⏱️ 8 Hrs</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4: Time Slot Matrix */}
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center justify-between">
                    <label
                      className={cn(
                        "text-xs font-bold tracking-wider",
                        isDark ? "text-white/70" : "text-slate-700",
                      )}
                    >
                      4. Choose Time Slot ({playHours} Hr{playHours > 1 ? "s" : ""})
                    </label>
                    <span
                      className={cn(
                        "text-[10px] font-bold",
                        isDark ? "text-emerald-600" : "text-emerald-600",
                      )}
                    >
                      🟢 Available
                    </span>
                  </div>

                  {timeSlots.length === 0 ? (
                    <div className="py-8 text-center px-4 rounded-2xl border border-dashed border-border bg-muted/20">
                      <p className="text-xs font-bold text-muted-foreground">
                        ⏰ All time slots for today have passed. Please select Tomorrow or pick a custom date.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Same Day / Today Slots */}
                      {timeSlots.filter(s => s.startHour < 24).length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-1.5 lg:gap-2">
                          {timeSlots.filter(s => s.startHour < 24).map((slot) => {
                            const slotHour = slot.startHour;
                            const isBooked = !!slot.bookedBy && !cancelledSlots.includes(slotHour);
                            const overlaps = isOverlapping(slotHour);
                            const outOfBounds = isOutOfBounds(slotHour);
                            const cannotSelect = isBooked || overlaps || outOfBounds;
                            const isSelected = selectedSlots.includes(slotHour);
                            const slotPrice = getSlotPrice(slotHour, playHours);

                            // Only the user who booked this slot can cancel it
                            const currentEmail = String(activePlayer?.email || localStorage.getItem("userEmail") || "").toLowerCase().trim();
                            const currentName = String(activePlayer?.fullName || activePlayer?.name || localStorage.getItem("userName") || "").toLowerCase().trim();
                            const currentPhone = String(activePlayer?.phone || activePlayer?.phoneNumber || localStorage.getItem("userPhone") || "").replace(/\D/g, "");
                            const currentUserId = activePlayer?.id;

                            const bookedEmail = String(slot.bookedByEmail || slot.booking?.user_email || "").toLowerCase().trim();
                            const bookedName = String(slot.bookedBy || slot.booking?.user_name || "").toLowerCase().trim();
                            const bookedPhone = String(slot.booking?.user_phone || slot.booking?.phone || "").replace(/\D/g, "");
                            const bookedUserId = slot.booking?.user_id;

                            const isMyBooking = isBooked && Boolean(
                              (currentUserId && bookedUserId && String(currentUserId) === String(bookedUserId)) ||
                              (currentEmail && bookedEmail && (currentEmail === bookedEmail || currentEmail.includes(bookedEmail) || bookedEmail.includes(currentEmail))) ||
                              (currentPhone && bookedPhone && currentPhone.length >= 10 && currentPhone === bookedPhone) ||
                              (currentName && bookedName && (currentName === bookedName || currentName.includes(bookedName) || bookedName.includes(currentName))) ||
                              (sessionStorage.getItem("sportxclub_last_booking") && (() => {
                                try {
                                  const lb = JSON.parse(sessionStorage.getItem("sportxclub_last_booking") || "{}");
                                  return (
                                    lb.venue === venue.name &&
                                    lb.date === selectedDate &&
                                    (lb.time === formatSlotRange(slotHour, playHours) || lb.time?.includes(formatHour(slotHour)))
                                  );
                                } catch { return false; }
                              })())
                            );

                            return (
                              <div
                                key={slotHour}
                                role="button"
                                tabIndex={!cannotSelect ? 0 : -1}
                                onClick={() => {
                                  if (cannotSelect) return;
                                  handleToggleSlot(slotHour);
                                }}
                                onKeyDown={(e) => {
                                  if (!cannotSelect && (e.key === "Enter" || e.key === " ")) {
                                    e.preventDefault();
                                    handleToggleSlot(slotHour);
                                  }
                                }}
                                className={cn(
                                  "py-1.5 px-2 rounded-xl border flex flex-col items-center justify-center transition-all min-h-[48px] text-center relative select-none",
                                  !cannotSelect ? "cursor-pointer" : "cursor-default",
                                  isSelected
                                    ? isDark
                                      ? "bg-emerald-600/10 border-2 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                                      : "bg-emerald-50/70 border-2 border-emerald-700 text-slate-900 shadow-sm"
                                    : cannotSelect
                                      ? isDark
                                        ? "border-red-500/60 bg-red-500/10 opacity-70"
                                        : "border-red-200 bg-red-50 text-red-700 opacity-70"
                                      : isDark
                                        ? "border-emerald-500/60 bg-white/[0.03] text-white hover:border-emerald-400 hover:bg-white/[0.08]"
                                        : "border-slate-200 bg-slate-50 text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50",
                                )}
                              >
                                <span
                                  className={cn(
                                    "text-xs font-bold",
                                    cannotSelect
                                      ? isDark
                                        ? "text-white"
                                        : "text-red-400"
                                      : isDark
                                        ? "text-white"
                                        : "text-slate-800",
                                  )}
                                >
                                  {formatSlotRange(slotHour, playHours).replace(/ PM -| AM -/g, " -")}
                                </span>

                                {!cannotSelect && (
                                  <span
                                    className={cn(
                                      "text-[11px] font-black mt-0.5",
                                      isDark
                                        ? "text-white"
                                        : "text-emerald-700",
                                    )}
                                  >
                                    <span className="rupee-symbol">₹</span>{slotPrice}
                                  </span>
                                )}

                                <span
                                  className={cn(
                                    "text-[9px] font-extrabold uppercase mt-0.5 tracking-wider leading-tight",
                                    isSelected
                                      ? isDark
                                        ? "text-white"
                                        : "text-emerald-600"
                                      : cannotSelect
                                        ? isDark ? "text-white" : "text-red-500"
                                        : isDark
                                          ? "text-white"
                                          : "text-emerald-600/70",
                                  )}
                                >
                                  {cannotSelect ? (
                                    <div className="flex flex-col items-center w-full">
                                      <span className="block leading-tight">{isBooked ? "Booked" : "Unavailable"}</span>
                                      {isBooked && isMyBooking && (
                                        <div className="flex flex-col items-center mt-1 w-full gap-0.5">
                                          <span className="block text-[7.5px] font-semibold opacity-90 normal-case tracking-normal text-slate-500 dark:text-white leading-none">
                                            Cancel by {formatSlotRange(slotHour - 2, 0).split(' - ')[0]}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              handleOpenCancelModal(slot);
                                            }}
                                            className="px-2.5 py-0.5 bg-red-500/20 hover:bg-red-500/35 text-red-600 dark:text-red-400 rounded-md text-[8.5px] font-extrabold tracking-wider transition-all cursor-pointer shadow-xs border border-red-500/30 active:scale-95 mt-0.5 z-20"
                                          >
                                            CANCEL
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ) : isSelected ? (
                                    "Selected ✓"
                                  ) : (
                                    "Available"
                                  )}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Tomorrow (Post-Midnight Slots) Horizontal Line & Section */}
                      {timeSlots.filter(s => s.startHour >= 24).length > 0 && (
                        <div className="space-y-2 pt-1.5">
                          <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                            <span
                              className={cn(
                                "flex-shrink mx-3 text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider shadow-2xs",
                                isDark
                                  ? "bg-indigo-950/70 text-indigo-300 border border-indigo-500/40"
                                  : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              )}
                            >
                              <span>🌙</span> Tomorrow (Post-Midnight Slots)
                            </span>
                            <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-1.5 lg:gap-2">
                            {timeSlots.filter(s => s.startHour >= 24).map((slot) => {
                              const slotHour = slot.startHour;
                              const isBooked = !!slot.bookedBy && !cancelledSlots.includes(slotHour);
                              const overlaps = isOverlapping(slotHour);
                              const outOfBounds = isOutOfBounds(slotHour);
                              const cannotSelect = isBooked || overlaps || outOfBounds;
                              const isSelected = selectedSlots.includes(slotHour);
                              const slotPrice = getSlotPrice(slotHour, playHours);

                              // Only the user who booked this slot can cancel it
                              const currentEmail = String(activePlayer?.email || localStorage.getItem("userEmail") || "").toLowerCase().trim();
                              const currentName = String(activePlayer?.fullName || activePlayer?.name || localStorage.getItem("userName") || "").toLowerCase().trim();
                              const currentPhone = String(activePlayer?.phone || activePlayer?.phoneNumber || localStorage.getItem("userPhone") || "").replace(/\D/g, "");
                              const currentUserId = activePlayer?.id;

                              const bookedEmail = String(slot.bookedByEmail || slot.booking?.user_email || "").toLowerCase().trim();
                              const bookedName = String(slot.bookedBy || slot.booking?.user_name || "").toLowerCase().trim();
                              const bookedPhone = String(slot.booking?.user_phone || slot.booking?.phone || "").replace(/\D/g, "");
                              const bookedUserId = slot.booking?.user_id;

                              const isMyBooking = isBooked && Boolean(
                                (currentUserId && bookedUserId && String(currentUserId) === String(bookedUserId)) ||
                                (currentEmail && bookedEmail && (currentEmail === bookedEmail || currentEmail.includes(bookedEmail) || bookedEmail.includes(currentEmail))) ||
                                (currentPhone && bookedPhone && currentPhone.length >= 10 && currentPhone === bookedPhone) ||
                                (currentName && bookedName && (currentName === bookedName || currentName.includes(bookedName) || bookedName.includes(currentName))) ||
                                (sessionStorage.getItem("sportxclub_last_booking") && (() => {
                                  try {
                                    const lb = JSON.parse(sessionStorage.getItem("sportxclub_last_booking") || "{}");
                                    return (
                                      lb.venue === venue.name &&
                                      lb.date === selectedDate &&
                                      (lb.time === formatSlotRange(slotHour, playHours) || lb.time?.includes(formatHour(slotHour)))
                                    );
                                  } catch { return false; }
                                })())
                              );

                              return (
                                <div
                                  key={slotHour}
                                  role="button"
                                  tabIndex={!cannotSelect ? 0 : -1}
                                  onClick={() => {
                                    if (cannotSelect) return;
                                    handleToggleSlot(slotHour);
                                  }}
                                  onKeyDown={(e) => {
                                    if (!cannotSelect && (e.key === "Enter" || e.key === " ")) {
                                      e.preventDefault();
                                      handleToggleSlot(slotHour);
                                    }
                                  }}
                                  className={cn(
                                    "py-1.5 px-2 rounded-xl border flex flex-col items-center justify-center transition-all min-h-[48px] text-center relative select-none",
                                    !cannotSelect ? "cursor-pointer" : "cursor-default",
                                    isSelected
                                      ? isDark
                                        ? "bg-emerald-600/10 border-2 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                                        : "bg-emerald-50/70 border-2 border-emerald-700 text-slate-900 shadow-sm"
                                      : cannotSelect
                                        ? isDark
                                          ? "border-red-500/60 bg-red-500/10 opacity-70"
                                          : "border-red-200 bg-red-50 text-red-700 opacity-70"
                                        : isDark
                                          ? "border-emerald-500/60 bg-white/[0.03] text-white hover:border-emerald-400 hover:bg-white/[0.08]"
                                          : "border-slate-200 bg-slate-50 text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "text-xs font-bold",
                                      cannotSelect
                                        ? isDark
                                          ? "text-white"
                                          : "text-red-400"
                                        : isDark
                                          ? "text-white"
                                          : "text-slate-800",
                                    )}
                                  >
                                    {formatSlotRange(slotHour, playHours).replace(/ PM -| AM -/g, " -")}
                                  </span>

                                  {!cannotSelect && (
                                    <span
                                      className={cn(
                                        "text-[11px] font-black mt-0.5",
                                        isDark
                                          ? "text-white"
                                          : "text-emerald-700",
                                      )}
                                    >
                                      <span className="rupee-symbol">₹</span>{slotPrice}
                                    </span>
                                  )}

                                  <span
                                    className={cn(
                                      "text-[9px] font-extrabold uppercase mt-0.5 tracking-wider leading-tight",
                                      isSelected
                                        ? isDark
                                          ? "text-white"
                                          : "text-emerald-600"
                                        : cannotSelect
                                          ? isDark ? "text-white" : "text-red-500"
                                          : isDark
                                            ? "text-white"
                                            : "text-emerald-600/70",
                                    )}
                                  >
                                    {cannotSelect ? (
                                      <div className="flex flex-col items-center w-full">
                                        <span className="block leading-tight">{isBooked ? "Booked" : "Unavailable"}</span>
                                        {isBooked && isMyBooking && (
                                          <div className="flex flex-col items-center mt-1 w-full gap-0.5">
                                            <span className="block text-[7.5px] font-semibold opacity-90 normal-case tracking-normal text-slate-500 dark:text-white leading-none">
                                              Cancel by {formatSlotRange(slotHour - 2, 0).split(' - ')[0]}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                handleOpenCancelModal(slot);
                                              }}
                                              className="px-2.5 py-0.5 bg-red-500/20 hover:bg-red-500/35 text-red-600 dark:text-red-400 rounded-md text-[8.5px] font-extrabold tracking-wider transition-all cursor-pointer shadow-xs border border-red-500/30 active:scale-95 mt-0.5 z-20"
                                            >
                                              CANCEL
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    ) : isSelected ? (
                                      "Selected ✓"
                                    ) : (
                                      "Available"
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {timeSlots.length > 16 && (
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => setShowAllSlots(!showAllSlots)}
                        className={cn(
                          "text-xs font-bold hover:underline transition-colors",
                          isDark ? "text-white/90 hover:text-white" : "text-emerald-700 hover:text-emerald-600"
                        )}
                      >
                        {showAllSlots ? "Show Less Slot" : "Show More Slot"}
                      </button>
                    </div>
                  )}
                </div>

                {/* SportX Wallet Status Box */}
                {activePlayer && (
                  <div
                    className={cn(
                      "rounded-xl border p-2.5 flex items-center justify-between text-xs transition-all",
                      walletBalance !== null && walletBalance >= totalSlotPrice && totalSlotPrice > 0
                        ? isDark
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : isDark
                          ? "bg-white/[0.02] border-white/10 text-slate-300"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                        <Wallet className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">SportX Wallet</span>
                        <span className="font-extrabold text-xs text-foreground flex items-center gap-1">
                          ₹{isLoadingWallet ? "..." : (walletBalance !== null ? walletBalance.toFixed(2) : "0.00")}
                          {walletBalance !== null && walletBalance >= totalSlotPrice && totalSlotPrice > 0 && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold ml-1 bg-emerald-500/20 px-1.5 py-0.5 rounded-full">
                              ✓ Sufficient Balance
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/profile?tab=wallet"
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-1 rounded-lg hover:bg-emerald-500/10 transition-colors"
                    >
                      + Top Up
                    </Link>
                  </div>
                )}

                {/* Booking Order Summary Box */}
                <div
                  className={cn(
                    "rounded-xl border p-3 space-y-1.5 transition-colors",
                    isDark
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-slate-200 bg-slate-50/90",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-between",
                      isDark ? "border-white/10" : "border-slate-200",
                    )}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span
                        className={cn(
                          "text-sm font-bold tracking-wider",
                          isDark ? "text-white" : "text-slate-900",
                        )}
                      >
                        Total payable:
                      </span>
                      {selectedSlots.length > 0 && (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                          {selectedSlots.length} {selectedSlots.length === 1 ? "Slot" : "Slots"} Selected
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xl font-black shrink-0",
                        hasSelectedSlots
                          ? isDark ? "text-white" : "text-emerald-600"
                          : isDark ? "text-white/40" : "text-slate-400",
                      )}
                    >
                      {hasSelectedSlots ? (
                        <>
                          <span className="rupee-symbol">₹</span>{totalSlotPrice}
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground">
                          <span className="rupee-symbol">₹</span>0
                        </span>
                      )}
                    </span>
                  </div>
                  {!hasSelectedSlots && (
                    <p className="text-[11px] font-medium text-amber-500/90 dark:text-amber-400/90 flex items-center gap-1">
                      <span>⚠️</span> Please select one or more available time slots
                    </p>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2 justify-end pt-1">
                  {/* 1-Click SportX Wallet Pay (Rendered when balance is sufficient) */}
                  {hasSelectedSlots && walletBalance !== null && walletBalance >= totalSlotPrice && totalSlotPrice > 0 && (
                    <Button
                      disabled={isWalletPaying}
                      onClick={async () => {
                        if (!hasSelectedSlots) {
                          toast.error("Please select at least one available time slot first.");
                          return;
                        }
                        if (!activePlayer && !currentUser) {
                          toast.error("Please sign in first to pay with SportX Wallet.");
                          navigate("/login");
                          return;
                        }

                        const formattedSlotTimes = selectedSlots.map((h) => formatSlotRange(h, playHours)).join(", ");
                        const safeImage = (venue.image && typeof venue.image === 'string' && venue.image.length < 500)
                          ? venue.image
                          : asset("/venues/turf-1.webp");

                        const bookingPayload = {
                          venue: venue.name,
                          turf_name: venue.name,
                          image: safeImage,
                          location: typeof venue.location === 'object' ? (venue.location?.city || venue.location?.address || 'Mumbai') : (venue.location || 'Mumbai'),
                          sport: selectedSport,
                          date: selectedDate,
                          time: formattedSlotTimes,
                          time_slot: formattedSlotTimes,
                          slot_time: formattedSlotTimes,
                          slots: selectedSlots.map((h) => ({
                            startHour: h,
                            time: formatSlotRange(h, playHours),
                            price: getSlotPrice(h, playHours),
                          })),
                          slotCount: selectedSlots.length,
                          price: totalSlotPrice,
                          amount: totalSlotPrice,
                          userName: activePlayer?.fullName || activePlayer?.name || currentUser?.full_name || currentUser?.email?.split('@')[0] || 'SportX Player',
                          userEmail: activePlayer?.email || currentUser?.email || 'user@sportxclub.com',
                          userPhone: activePlayer?.phone || activePlayer?.phoneNumber || currentUser?.phone || '9876543210',
                          venueId: venue.id,
                          turf_id: venue.id,
                          userId: activePlayer?.id,
                        };

                        setIsWalletPaying(true);
                        toast.loading("⚡ Processing 1-Click SportX Wallet Payment...", { id: "wallet-pay" });

                        try {
                          const res = await profileService.payWithWallet(bookingPayload);
                          toast.dismiss("wallet-pay");

                          if (res?.success) {
                            setWalletBalance(res.walletBalance);
                            toast.success(res.message || "🎉 Booking Confirmed via SportX Wallet!");

                            try {
                              sessionStorage.setItem("sportxclub_booking", JSON.stringify(bookingPayload));
                              sessionStorage.setItem("sportxclub_pending_booking", JSON.stringify(bookingPayload));
                              sessionStorage.setItem("sportxclub_last_booking", JSON.stringify(bookingPayload));
                              sessionStorage.setItem("sportxclub_cashfree_order_id", res.booking?.orderId || res.booking?.order_id);
                            } catch (e) {}

                            const b = res.booking || {};
                            navigate(`/payment-status?order_id=${b.orderId || b.order_id}&payment_id=${b.paymentId || b.payment_id}&booking_code=${b.bookingCode || b.booking_code}&method=wallet&status=SUCCESS`);
                          } else {
                            toast.error(res?.error || "Failed to process wallet payment.");
                          }
                        } catch (err) {
                          toast.dismiss("wallet-pay");
                          console.error("Wallet payment failed:", err);
                          toast.error(err.message || "Error completing wallet booking.");
                        } finally {
                          setIsWalletPaying(false);
                        }
                      }}
                      className="group h-11 w-full sm:w-auto px-5 rounded-xl font-bold text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 select-none bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white shadow-lg shadow-emerald-500/25 active:scale-[0.97] cursor-pointer border-0"
                    >
                      {isWalletPaying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Deducting ₹{totalSlotPrice}...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-emerald-200 animate-pulse" />
                          <span>⚡ 1-Click Pay with Wallet (₹{totalSlotPrice})</span>
                        </>
                      )}
                    </Button>
                  )}

                  {/* Standard Gateway Button (UPI / Card / Netbanking) */}
                  <Button
                    variant="outline"
                    disabled={!hasSelectedSlots || isWalletPaying}
                    onClick={() => {
                      if (!hasSelectedSlots) {
                        toast.error("Please select at least one available time slot first.");
                        return;
                      }
                      if (!activePlayer && !currentUser) {
                        toast.error("Please sign in first to continue booking.");
                        navigate("/login");
                        return;
                      }
                      const formattedSlotTimes = selectedSlots.map((h) => formatSlotRange(h, playHours)).join(", ");
                      const safeImage = (venue.image && typeof venue.image === 'string' && venue.image.length < 500)
                        ? venue.image
                        : asset("/venues/turf-1.webp");

                      const bookingPayload = {
                        venue: venue.name,
                        image: safeImage,
                        location: typeof venue.location === 'object' ? (venue.location?.city || venue.location?.address || 'Mumbai') : (venue.location || 'Mumbai'),
                        sport: selectedSport,
                        date: selectedDate,
                        time: formattedSlotTimes,
                        slots: selectedSlots.map((h) => ({
                          startHour: h,
                          time: formatSlotRange(h, playHours),
                          price: getSlotPrice(h, playHours),
                        })),
                        slotCount: selectedSlots.length,
                        price: totalSlotPrice,
                        amount: totalSlotPrice,
                        userName: activePlayer?.fullName || activePlayer?.name || currentUser?.full_name || currentUser?.email?.split('@')[0] || 'SportX Player',
                        userEmail: activePlayer?.email || currentUser?.email || 'user@sportxclub.com',
                        userPhone: activePlayer?.phone || activePlayer?.phoneNumber || currentUser?.phone || '9876543210',
                        venueId: venue.id,
                      };

                      try {
                        sessionStorage.setItem("sportxclub_booking", JSON.stringify(bookingPayload));
                        sessionStorage.setItem("sportxclub_pending_booking", JSON.stringify(bookingPayload));
                        sessionStorage.setItem("sportxclub_last_booking", JSON.stringify(bookingPayload));
                      } catch (e) {
                        console.warn("Storage note:", e.message);
                      }

                      toast.loading("Connecting to Cashfree Live Gateway...", { id: "cashfree-init" });
                      cashfreeService.initiatePayment(bookingPayload).then((res) => {
                        toast.dismiss("cashfree-init");
                        if (!res.success) {
                          toast.error(res.message || "Cashfree could not start the payment. Please try again.");
                        }
                      }).catch((err) => {
                        toast.dismiss("cashfree-init");
                        console.error("Cashfree initialization error:", err);
                        toast.error("Failed initiating Cashfree payment.");
                      });
                    }}
                    className={cn(
                      "group h-11 w-full sm:w-auto px-5 rounded-xl font-bold text-xs tracking-wider transition-all duration-300 flex items-center justify-center select-none border-2",
                      hasSelectedSlots
                        ? isDark
                          ? "border-emerald-600 text-emerald-600 hover:border-green-400 hover:text-green-400 hover:bg-green-400/5 active:scale-[0.97] cursor-pointer"
                          : "border-emerald-600 text-emerald-600 hover:border-emerald-800 hover:text-emerald-800 hover:bg-emerald-50/50 active:scale-[0.97] cursor-pointer"
                        : isDark
                          ? "border-white/10 text-white/30 bg-white/[0.02] cursor-not-allowed opacity-50 pointer-events-none"
                          : "border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed opacity-60 pointer-events-none",
                    )}
                  >
                    <span>
                      {hasSelectedSlots && walletBalance !== null && walletBalance >= totalSlotPrice && totalSlotPrice > 0
                        ? "Pay via UPI / Cards (Cashfree)"
                        : "Proceed to payment"}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancellation Reason Modal Dialog */}
      <Dialog open={cancelModalOpen} onOpenChange={(open) => { if (!isCancelling) setCancelModalOpen(open); }}>
        <DialogContent className={cn(
          "max-w-md w-full rounded-3xl p-0 border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col",
          isDark ? "bg-[#0f172a] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
        )}>
          <DialogHeader className="p-5 sm:p-6 pb-3 border-b border-border/50 shrink-0 text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black tracking-tight">
                  Cancel Slot Booking
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to cancel this reservation?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {slotToCancel && (
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
              {/* Slot Details Summary Box */}
              <div className={cn(
                "rounded-2xl p-3.5 border space-y-2",
                isDark ? "bg-slate-900/80 border-slate-800" : "bg-slate-50 border-slate-200"
              )}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">Turf Venue:</span>
                  <span className="text-xs font-black text-foreground">{venue.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">Sport & Date:</span>
                  <span className="text-xs font-black text-foreground">
                    {venue.sport} • {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", weekday: "short" })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">Reserved Slot:</span>
                  <span className="text-xs font-black text-emerald-500">
                    {formatSlotRange(slotToCancel.startHour, 1)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-dashed border-border/60">
                  <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5 text-emerald-500" /> Wallet Refund:
                  </span>
                  <span className="text-sm font-black text-emerald-500">
                    ₹{slotToCancel.booking?.amount || getSlotPrice(slotToCancel.startHour, 1) || venue.price || 0}
                  </span>
                </div>
              </div>

              {/* Reason Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Please select a reason for cancellation <span className="text-red-500">*</span>
                </label>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {CANCEL_REASONS.map((r) => {
                    const isSelected = cancelReason === r.label;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setCancelReason(r.label)}
                        className={cn(
                          "flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all",
                          isSelected
                            ? isDark
                              ? "bg-red-500/10 border-red-500/50 text-white font-bold"
                              : "bg-red-50/80 border-red-400 text-red-950 font-bold shadow-xs"
                            : isDark
                              ? "bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70"
                        )}
                      >
                        <span className="text-base leading-none">{r.icon}</span>
                        <span className="flex-1 leading-tight">{r.label}</span>
                        <div className={cn(
                          "h-4 w-4 rounded-full border flex items-center justify-center transition-colors",
                          isSelected ? "border-red-500 bg-red-500 text-white" : "border-slate-400/50"
                        )}>
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Reason / Optional Feedback input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground flex items-center justify-between">
                  <span>Additional Details / Notes</span>
                  <span className="text-[10px] font-normal text-muted-foreground/80">Optional</span>
                </label>
                <textarea
                  rows={2}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Help us improve by telling us why you're cancelling..."
                  className={cn(
                    "w-full px-3 py-2 text-xs rounded-xl border outline-none transition-all resize-none",
                    isDark
                      ? "bg-slate-900/90 border-slate-800 text-white focus:border-red-500/50 placeholder:text-slate-600"
                      : "bg-white border-slate-200 text-slate-900 focus:border-red-400 placeholder:text-slate-400"
                  )}
                />
              </div>

              {/* Refund Policy Alert */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-2">
                <span className="text-xs shrink-0 mt-0.5">ℹ️</span>
                <span>
                  Upon cancellation, this slot will be released for other players immediately and the amount will be credited to your <strong>SportXClub Wallet</strong>.
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border/50 bg-muted/20 shrink-0 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isCancelling}
              onClick={() => setCancelModalOpen(false)}
              className="rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 h-10 px-4 cursor-pointer"
            >
              Keep My Booking
            </Button>
            <Button
              type="button"
              disabled={isCancelling}
              onClick={handleConfirmCancelSlot}
              className={cn(
                "rounded-xl text-xs font-black h-10 px-5 transition-all text-white flex items-center gap-2 cursor-pointer",
                "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50"
              )}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4" />
                  <span>Confirm Cancellation</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GlobalFooter />
    </div>
  );
}
