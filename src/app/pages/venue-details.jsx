import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../providers/auth-provider";
import { useTheme } from "next-themes";
import { phonepeService } from "../payment/phonepe-service";
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
  Flag,
} from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { adminApi } from "../services/admin-api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { cn } from "../components/ui/utils";
import { GlobalFooter } from "../components/layout/GlobalFooter";

const asset = (path) => `/assets${path}`;

const defaultVenue = {
  name: "Elite Turf Arena",
  location: "Powai, Mumbai",
  address: "123 Sports Complex, Hiranandani Gardens, Powai, Mumbai - 400076",
  rating: 4.9,
  reviews: 234,
  price: 1200,
  sport: "Football",
  area: "8,500 Sq. Ft. (120ft × 70ft)",
  description:
    "Elite Turf Arena is built for fast discovery and confident booking. The venue combines reliable lighting, verified access, and clear refund terms so players can decide quickly.",
};

const gallery = [
  asset("/venues/turf-1.webp"),
  asset("/venues/new_football_turf.png"),
  asset("/venues/elite_turf_football.png"),
  asset("/venues/champions_sports_arena_football.jpg"),
  asset("/venues/new_football_turf_2.png"),
  asset("/venues/turf-6.webp"),
];

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

const reviewsList = [
  {
    name: "Rahul Sharma",
    rating: 5,
    date: "2 days ago",
    daysAgo: 2,
    comment:
      "Excellent facility with clean turf and fast booking. The lighting is top-notch for night matches!",
  },
  {
    name: "Priya Patel",
    rating: 5,
    date: "1 week ago",
    daysAgo: 7,
    comment:
      "Very professional experience. The slot selection and instant booking flow feel super smooth.",
  },
  {
    name: "Arjun Malhotra",
    rating: 4,
    date: "2 weeks ago",
    daysAgo: 14,
    comment:
      "Great lighting and easy access. Parking was hassle-free and staff was very cooperative.",
  },
  {
    name: "Amit Verma",
    rating: 3,
    date: "3 weeks ago",
    daysAgo: 21,
    comment:
      "The turf quality is good, but they should really improve the water dispenser and washroom facilities.",
  },
  {
    name: "Siddharth Rao",
    rating: 2,
    date: "1 month ago",
    daysAgo: 30,
    comment:
      "The court was double booked and we had to wait for 30 minutes. Customer support was slow in resolving the slot dispute.",
  },
  {
    name: "Neha Gupta",
    rating: 5,
    date: "1 month ago",
    daysAgo: 32,
    comment:
      "Superb experience! Highly recommended for weekend corporate matches. Booking was quick.",
  },
  {
    name: "Rohan Das",
    rating: 1,
    date: "2 months ago",
    daysAgo: 60,
    comment:
      "Extremely poor lighting! One of the floodlights was broken, making it impossible to play in the corners. Waste of money.",
  }
];

export function VenueDetails() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const passedVenue = location.state?.venue;
  const [fetchedTurf, setFetchedTurf] = useState(null);

  useEffect(() => {
    if (!passedVenue && id) {
      adminApi.getAll("turfs").then((turfs) => {
        const found = (turfs || []).find((t) => String(t.id) === String(id));
        if (found) setFetchedTurf(found);
      }).catch(console.error);
    }
  }, [id, passedVenue]);

  const activeVenueData = passedVenue || fetchedTurf;
  const venue = activeVenueData
    ? {
      name: activeVenueData.name,
      location: activeVenueData.location,
      address: `${typeof activeVenueData.location === 'object' ? (activeVenueData.location?.address || activeVenueData.location?.city || '') : (activeVenueData.location || '')}, Mumbai, Maharashtra`,
      rating:
        typeof activeVenueData.rating === "number"
          ? activeVenueData.rating
          : parseFloat(activeVenueData.rating) || 4.9,
      reviews: activeVenueData.reviews || 128,
      price:
        typeof activeVenueData.price === "number"
          ? activeVenueData.price
          : parseInt(
            String(activeVenueData.price || activeVenueData.price_per_hour).replace(/[^0-9]/g, "") || "1200",
          ),
      sport: (activeVenueData.sport || activeVenueData.sport_type || activeVenueData.sportType || "Football").split("•")[0]?.trim(),
      description: activeVenueData.description || `${activeVenueData.name} is built for fast discovery and confident booking.`,
      image: activeVenueData.image_url || activeVenueData.image || "/assets/venues/turf-1.webp",
      area: activeVenueData.area || "8,500 Sq. Ft. (120ft × 70ft)",
    }
    : defaultVenue;

  const [selectedSport, setSelectedSport] = useState(
    venue.sport || "Football",
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [startTime, setStartTime] = useState("18:00");
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
  const [sortBy, setSortBy] = useState("recent");
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(3);
  const [likedReviews, setLikedReviews] = useState(new Set());

  const handleLikeReview = (idx) => {
    setLikedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  const handleReplyReview = (idx) => {
    toast.success("Reply dialog opened!");
  };

  const handleReportReview = (idx) => {
    toast.info("Review reported to admins.");
  };
  const [showAllSlots, setShowAllSlots] = useState(false);
  const [dbBookings, setDbBookings] = useState([]);

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await adminApi.getAll("bookings");
        setDbBookings(data || []);
      } catch (err) {
        console.error("Error loading bookings in venue-details:", err);
      }
    }
    loadBookings();
  }, []);

  const isToday = selectedDate === new Date().toISOString().split("T")[0];
  const venueOpeningHour = venue.openingHour || 6;
  const venueClosingHour = venue.closingHour || 23;

  const baseTimeSlots = useMemo(() => {
    const slots = [];
    const targetVenueName = String(venue.name || "").toLowerCase().trim();

    // Filter active bookings for this venue & selectedDate
    const venueBookings = dbBookings.filter((b) => {
      const bVenueName = String(b.turf_name || b.venue || "").toLowerCase().trim();
      const isSameVenue = !targetVenueName || bVenueName.includes(targetVenueName) || targetVenueName.includes(bVenueName);
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

    for (let h = venueOpeningHour; h < venueClosingHour; h++) {
      const formatHour = (hourNum) => {
        let h12 = hourNum % 12;
        if (h12 === 0) h12 = 12;
        const ampm = hourNum >= 12 && hourNum < 24 ? "PM" : "AM";
        return `${String(h12).padStart(2, "0")}:00 ${ampm}`;
      };

      const matchingBkg = venueBookings.find((b) => {
        const bTime = String(b.time_slot || b.slot_time || b.slotTime || b.time || "").toLowerCase().trim();
        if (!bTime) return false;

        const rangeMatch = bTime.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
        if (rangeMatch) {
          let startH = parseInt(rangeMatch[1], 10);
          let startPeriod = rangeMatch[3] ? rangeMatch[3].toLowerCase() : null;
          let endH = parseInt(rangeMatch[4], 10);
          let endPeriod = rangeMatch[6] ? rangeMatch[6].toLowerCase() : null;

          if (!endPeriod) {
            if (startPeriod) endPeriod = startPeriod;
            else endPeriod = (bTime.includes("pm") && !bTime.includes("am")) ? "pm" : "am";
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

          return h >= startH && h < endH;
        }

        const singleMatch = bTime.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
        if (singleMatch) {
          let startH = parseInt(singleMatch[1], 10);
          const period = singleMatch[3] ? singleMatch[3].toLowerCase() : (bTime.includes("pm") ? "pm" : "am");
          if (period === "pm" && startH < 12) startH += 12;
          if (period === "am" && startH === 12) startH = 0;
          return h === startH;
        }

        return false;
      });

      let bookedBy = matchingBkg ? (matchingBkg.user_name || "Booked Player") : undefined;

      slots.push({
        startHour: h,
        label: formatHour(h),
        endLabel: formatHour(h + 1),
        bookedBy,
      });
    }
    return slots;
  }, [venueOpeningHour, venueClosingHour, dbBookings, venue.name, selectedDate]);

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
      let hourNum = h % 12;
      if (hourNum === 0) hourNum = 12;
      const amPm = h >= 24 || h < 12 ? "AM" : "PM";
      const displayHour = h === 24 ? "12" : hourNum.toString();
      return `${displayHour.padStart(2, "0")}:00 ${amPm}`;
    };
    return `${formatHour(startHour)} - ${formatHour(startHour + hours)}`;
  };

  const getSlotPrice = (startHour, hours) => {
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

  const getStartHour = (timeStr) => parseInt(timeStr.split(":")[0]);
  const hourToTimeStr = (hour) => `${hour.toString().padStart(2, "0")}:00`;

  const isOverlapping = (startHour) => {
    for (let i = 0; i < playHours; i++) {
      const checkHour = startHour + i;
      const slot = timeSlots.find((s) => s.startHour === checkHour);
      if (slot && slot.bookedBy) return true;
    }
    return false;
  };

  const isOutOfBounds = (startHour) => startHour + playHours > 23;

  useEffect(() => {
    const currentHour = getStartHour(startTime);
    if (isOverlapping(currentHour) || isOutOfBounds(currentHour)) {
      const firstAvailable = timeSlots.find(
        (s) =>
          !s.bookedBy &&
          !isOverlapping(s.startHour) &&
          !isOutOfBounds(s.startHour),
      );
      if (firstAvailable) {
        setStartTime(hourToTimeStr(firstAvailable.startHour));
      }
    }
  }, [playHours]);

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
                  src={venue.image || gallery[0]}
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
                        "flex items-center gap-1 px-1 rounded-full",
                        isDark
                          ? "bg-transparent text-white"
                          : "bg-transparent text-[#10B981]",
                      )}
                    >
                      <Star
                        className={cn(
                          "h-3.5 w-3.5 fill-current",
                          isDark ? "text-white" : "text-[#10B981]",
                        )}
                      />
                      <span className="font-bold">
                        {venue.rating.toFixed(1)}
                      </span>
                      <span
                        className={cn(
                          "text-[10px]",
                          isDark ? "text-white/80" : "text-white/80",
                        )}
                      >
                        ({venue.reviews})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Automatic Scrolling Marquee for Secondary Photos */}
              <div className="overflow-hidden relative w-full rounded-xl">

                <div className="animate-marquee-horizontal">
                  {[...gallery.slice(1, 4), ...gallery.slice(1, 4), ...gallery.slice(1, 4)].map((img, idx) => (
                    <div key={idx} className="relative aspect-video sm:aspect-[21/9] md:aspect-video rounded-xl overflow-hidden group border border-slate-200 dark:border-white/5 w-[150px] sm:w-[220px] md:w-[280px] shrink-0">
                      <ImageWithFallback
                        src={img}
                        alt={`Venue Photo ${idx + 1}`}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
                    </div>
                  ))}
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
                <div
                  className={cn(
                    "flex items-center gap-2 border px-3 py-1.5 rounded-2xl",
                    isDark
                      ? "bg-emerald-600/10 border-emerald-600/30"
                      : "bg-emerald-50 border-emerald-200",
                  )}
                >
                  <Star
                    className={cn(
                      "h-4 w-4 fill-current",
                      isDark ? "text-emerald-600" : "text-emerald-600",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-black",
                      isDark ? "text-emerald-600" : "text-emerald-700",
                    )}
                  >
                    {venue.rating.toFixed(1)}
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      isDark ? "text-white/60" : "text-slate-600",
                    )}
                  >
                    ({venue.reviews})
                  </span>
                </div>
              </div>

              {/* Review Sorting Controls - UI/UX Premium Redesign */}
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

              <div className="space-y-3">
                {[...reviewsList]
                  .sort((a, b) => {
                    if (sortBy === "highest") {
                      if (b.rating !== a.rating) return b.rating - a.rating;
                      return a.daysAgo - b.daysAgo;
                    }
                    if (sortBy === "lowest") {
                      if (a.rating !== b.rating) return a.rating - b.rating;
                      return a.daysAgo - b.daysAgo;
                    }
                    // Default: recent
                    return a.daysAgo - b.daysAgo;
                  })
                  .slice(0, visibleReviewsCount)
                  .map((rev, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-xl border p-3 space-y-1.5 transition-colors shadow-sm",
                        isDark
                          ? "border-white/5 bg-white/[0.03]"
                          : "border-slate-200 bg-white hover:bg-slate-50/30",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "h-8 w-8 rounded-full border font-bold text-xs flex items-center justify-center",
                              isDark
                                ? "bg-emerald-600/20 border-emerald-600/40 text-emerald-600"
                                : "bg-emerald-100 border-emerald-300 text-emerald-800",
                            )}
                          >
                            {rev.name[0]}
                          </div>
                          <div>
                            <p
                              className={cn(
                                "text-xs font-bold",
                                isDark ? "text-white" : "text-slate-800",
                              )}
                            >
                              {rev.name}
                            </p>
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
                            {rev.rating.toFixed(1)}
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
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          onClick={() => handleLikeReview(idx)}
                          className={cn(
                            "flex items-center gap-1.5 text-[11px] font-semibold transition-colors cursor-pointer",
                            likedReviews.has(idx)
                              ? "text-emerald-600"
                              : isDark ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-700"
                          )}
                        >
                          <ThumbsUp className={cn("h-3.5 w-3.5", likedReviews.has(idx) ? "fill-emerald-600" : "")} />
                          Like
                        </button>
                        <button
                          onClick={() => handleReplyReview(idx)}
                          className={cn(
                            "flex items-center gap-1.5 text-[11px] font-semibold transition-colors cursor-pointer",
                            isDark ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-700"
                          )}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Reply
                        </button>
                        <button
                          onClick={() => handleReportReview(idx)}
                          className={cn(
                            "flex items-center gap-1.5 text-[11px] font-semibold transition-colors cursor-pointer",
                            isDark ? "text-white/30 hover:text-rose-400" : "text-slate-300 hover:text-rose-500"
                          )}
                        >
                          <Flag className="h-3 w-3" />
                          Report
                        </button>
                      </div>
                    </div>
                  ))}

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
              {/* Ambient Glow */}
              <div
                className={cn(
                  "absolute top-0 right-0 h-40 w-40 rounded-tr-xl rounded-full blur-3xl pointer-events-none overflow-hidden",
                  isDark ? "bg-emerald-600/10" : "bg-emerald-500/10",
                )}
              />

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
                          <SelectValue placeholder="Select Sport" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border border-slate-300 dark:border-slate-700">
                          <SelectItem value="Football" className="text-sm font-medium py-2">⚽ Football</SelectItem>
                          <SelectItem value="Cricket" className="text-sm font-medium py-2">🏏 Cricket</SelectItem>
                          <SelectItem value="Basketball" className="text-sm font-medium py-2">🏀 Basketball</SelectItem>
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

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-1.5 lg:gap-2">
                    {timeSlots.length === 0 ? (
                      <div className="col-span-full py-8 text-center px-4 rounded-2xl border border-dashed border-border bg-muted/20">
                        <p className="text-xs font-bold text-muted-foreground">
                          ⏰ All time slots for today have passed. Please select Tomorrow or pick a custom date.
                        </p>
                      </div>
                    ) : (
                      (showAllSlots ? timeSlots : timeSlots.slice(0, 16)).map((slot) => {
                        const slotHour = slot.startHour;
                        const isBooked = !!slot.bookedBy && !cancelledSlots.includes(slotHour);
                        const overlaps = isOverlapping(slotHour);
                        const outOfBounds = isOutOfBounds(slotHour);
                        const cannotSelect = isBooked || overlaps || outOfBounds;
                        const selectedStartHour = getStartHour(startTime);
                        const isSelected = selectedStartHour !== null && slotHour === selectedStartHour;
                        const slotPrice = getSlotPrice(slotHour, playHours);

                        return (
                          <button
                            key={slotHour}
                            type="button"
                            disabled={cannotSelect}
                            onClick={() => !cannotSelect && setStartTime(hourToTimeStr(slotHour))}
                            className={cn(
                              "py-1.5 px-2 rounded-xl border flex flex-col items-center justify-center transition-all min-h-[48px] text-center relative",
                              !cannotSelect ? "cursor-pointer" : "cursor-not-allowed",
                              isSelected
                                ? isDark
                                  ? "bg-emerald-600/10 border border-emerald-600 text-white shadow-[0_0_15px_rgba(109,255,59,0.2)]"
                                  : "bg-emerald-50/50 border border-emerald-600 text-slate-900 shadow-sm"
                                : cannotSelect
                                  ? isDark
                                    ? "border-red-500/60 bg-red-500/10 opacity-70"
                                    : "border-red-200 bg-red-50 text-red-700 opacity-60"
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
                                  {isBooked && (
                                    <div className="flex flex-col items-center mt-1 w-full gap-0.5">
                                      <span className="block text-[7.5px] font-semibold opacity-90 normal-case tracking-normal text-slate-500 dark:text-white leading-none">
                                        Cancel by {formatSlotRange(slotHour - 2, 0).split(' - ')[0]}
                                      </span>
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCancelledSlots([...cancelledSlots, slotHour]);
                                        }}
                                        className="px-1.5 py-0.5 bg-red-500/20 text-red-600 dark:text-white rounded-md text-[8px] font-bold tracking-wider hover:bg-red-500/30 transition-colors cursor-pointer pointer-events-auto shadow-sm mt-0.5"
                                      >
                                        CANCEL
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : isSelected ? (
                                "Selected ✓"
                              ) : (
                                "Available"
                              )}
                            </span>
                          </button>
                        );
                      }))}
                  </div>
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
                    <span
                      className={cn(
                        "text-sm font-bold tracking-wider",
                        isDark ? "text-white" : "text-slate-900",
                      )}
                    >
                      Total payable:
                    </span>
                    <span
                      className={cn(
                        "text-xl font-black",
                        isDark ? "text-white" : "text-emerald-600",
                      )}
                    >
                      <span className="rupee-symbol">₹</span>{getSlotPrice(getStartHour(startTime), playHours)}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!currentUser) {
                      toast.error("Please sign in first to continue booking.");
                      navigate("/login");
                    } else {
                      const computedPrice = getSlotPrice(getStartHour(startTime), playHours);
                      const formattedSlotTime = formatSlotRange(getStartHour(startTime), playHours);
                      const safeImage = (venue.image && typeof venue.image === 'string' && venue.image.length < 500)
                        ? venue.image
                        : asset("/venues/turf-1.webp");

                      const bookingPayload = {
                        venue: venue.name,
                        image: safeImage,
                        location: typeof venue.location === 'object' ? (venue.location?.city || venue.location?.address || 'Mumbai') : (venue.location || 'Mumbai'),
                        sport: selectedSport,
                        date: selectedDate,
                        time: formattedSlotTime,
                        price: computedPrice,
                        userName: currentUser?.full_name || currentUser?.email?.split('@')[0] || 'SportX Player',
                        userEmail: currentUser?.email || 'user@sportxclub.com',
                        venueId: venue.id,
                      };

                      try {
                        sessionStorage.setItem("sportxclub_booking", JSON.stringify(bookingPayload));
                        sessionStorage.setItem("sportxclub_pending_booking", JSON.stringify(bookingPayload));
                        sessionStorage.setItem("sportxclub_last_booking", JSON.stringify(bookingPayload));
                      } catch (e) {
                        console.warn("Storage note:", e.message);
                      }

                      toast.loading("Connecting to PhonePe Business Gateway...", { id: "phonepe-init" });
                      phonepeService.initiatePayment(bookingPayload).then((res) => {
                        toast.dismiss("phonepe-init");
                        if (res.success && res.redirectUrl) {
                          window.location.href = res.redirectUrl;
                        } else {
                          navigate(`/payment-status?status=SUCCESS&merchantTransactionId=${res.merchantTransactionId || 'M22W_TEST'}`);
                        }
                      }).catch((err) => {
                        toast.dismiss("phonepe-init");
                        toast.error("Failed initiating PhonePe payment. Redirecting to status...");
                        navigate(`/payment-status?status=FAILED`);
                      });
                    }
                  }}
                  className={cn(
                    "group h-11 w-fit px-6 ml-auto rounded-xl font-bold text-xs tracking-widest transition-all duration-300 cursor-pointer flex items-center justify-center select-none bg-transparent border-2",
                    isDark
                      ? "border-emerald-600 text-emerald-600 hover:border-green-400 hover:text-green-400 hover:bg-green-400/5 active:scale-[0.97]"
                      : "border-emerald-600 text-emerald-600 hover:border-emerald-800 hover:text-emerald-800 hover:bg-emerald-50/50 active:scale-[0.97]",
                  )}
                >
                  <span className="translate-y-[0.5px]">Proceed to payment</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <GlobalFooter />
    </div>
  );
}
