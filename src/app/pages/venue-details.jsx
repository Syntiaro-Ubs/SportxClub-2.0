import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../providers/auth-provider";
import { useTheme } from "next-themes";
import {
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
} from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { cn } from "../components/ui/utils";

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
  asset("/venues/turf-2.webp"),
  asset("/venues/turf-3.webp"),
  asset("/venues/turf-4.webp"),
];

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
    comment:
      "Excellent facility with clean turf and fast booking. The lighting is top-notch for night matches!",
  },
  {
    name: "Priya Patel",
    rating: 5,
    date: "1 week ago",
    comment:
      "Very professional experience. The slot selection and instant booking flow feel super smooth.",
  },
  {
    name: "Arjun Malhotra",
    rating: 4,
    date: "2 weeks ago",
    comment:
      "Great lighting and easy access. Parking was hassle-free and staff was very cooperative.",
  },
];

export function VenueDetails() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const passedVenue = location.state?.venue;
  const venue = passedVenue
    ? {
      name: passedVenue.name,
      location: passedVenue.location,
      address: `${passedVenue.location}, Mumbai, Maharashtra`,
      rating:
        typeof passedVenue.rating === "number"
          ? passedVenue.rating
          : parseFloat(passedVenue.rating) || 4.9,
      reviews: passedVenue.reviews || 128,
      price:
        typeof passedVenue.price === "number"
          ? passedVenue.price
          : parseInt(
            String(passedVenue.price).replace(/[^0-9]/g, "") || "1200",
          ),
      sport: passedVenue.sport?.split("•")[0]?.trim() || "Football",
      description: `${passedVenue.name} is built for fast discovery and confident booking. The venue combines FIFA-grade turfing, pro floodlighting, verified access, and 100% refund-safe terms.`,
      image: passedVenue.image,
      area: passedVenue.area || "8,500 Sq. Ft. (120ft × 70ft)",
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  const timeSlots = [
    { startHour: 15, label: "03:00 PM", endLabel: "04:00 PM" },
    { startHour: 16, label: "04:00 PM", endLabel: "05:00 PM" },
    {
      startHour: 17,
      label: "05:00 PM",
      endLabel: "06:00 PM",
      bookedBy: "Squad Alpha",
    },
    { startHour: 18, label: "06:00 PM", endLabel: "07:00 PM" },
    { startHour: 19, label: "07:00 PM", endLabel: "08:00 PM" },
    { startHour: 20, label: "08:00 PM", endLabel: "09:00 PM" },
    { startHour: 21, label: "09:00 PM", endLabel: "10:00 PM" },
    {
      startHour: 22,
      label: "10:00 PM",
      endLabel: "11:00 PM",
      bookedBy: "Night League",
    },
  ];

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
  const dateOptions = Array.from({ length: 4 }).map((_, idx) => {
    const d = new Date();
    d.setDate(today.getDate() + idx);
    const iso = d.toISOString().split("T")[0];
    const label =
      idx === 0
        ? "Today"
        : idx === 1
          ? "Tomorrow"
          : d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
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
      {/* Top Header & Breadcrumb Bar */}
      <div
        className={cn(
          "border-b backdrop-blur-xl sticky top-0 z-30 transition-colors duration-300",
          isDark
            ? "border-white/[0.08] bg-[#050505]/80 text-white"
            : "border-slate-200 bg-white/90 text-slate-800 shadow-sm",
        )}
      >
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/venues"
            className={cn(
              "flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer",
              isDark
                ? "text-white/70 hover:text-[#6DFF3B]"
                : "text-slate-600 hover:text-emerald-600",
            )}
          >
            <ArrowRight
              className={cn(
                "h-4 w-4 rotate-180",
                isDark ? "text-[#6DFF3B]" : "text-emerald-600",
              )}
            />
            <span>Back to Venues</span>
          </Link>

          <div className="flex items-center gap-3">
            <Badge
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider",
                isDark
                  ? "bg-[#6DFF3B]/10 text-[#6DFF3B] border-[#6DFF3B]/30"
                  : "bg-emerald-50 text-emerald-700 border-emerald-300",
              )}
            >
              🟢 Verified Arena
            </Badge>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleFavoriteClick}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border transition-all cursor-pointer",
                  isDark
                    ? "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    : "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700",
                )}
              >
                <Heart
                  className={cn(
                    "h-4 w-4",
                    isFavorite
                      ? "fill-rose-500 text-rose-500"
                      : isDark
                        ? "text-white"
                        : "text-slate-700",
                  )}
                />
              </button>
              <button
                onClick={handleShareClick}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border transition-all cursor-pointer",
                  isDark
                    ? "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    : "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700",
                )}
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Bento Box Media Header Grid */}
        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-3 gap-3 rounded-[28px] overflow-hidden border p-3 mb-8 transition-colors duration-300",
            isDark
              ? "border-white/10 bg-[#101216] shadow-2xl"
              : "border-slate-200 bg-white shadow-md",
          )}
        >
          {/* Main Hero Photo (Spans 2 columns on desktop) */}
          <div className="relative lg:col-span-2 aspect-[16/9] lg:aspect-auto h-[260px] sm:h-[340px] lg:h-[400px] rounded-[22px] overflow-hidden group">
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
                      ? "bg-[#6DFF3B] text-black"
                      : "bg-emerald-600 text-white",
                  )}
                >
                  FIFA Standard
                </Badge>
                <Badge
                  className={cn(
                    "rounded-full font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5",
                    isDark
                      ? "bg-[#6DFF3B] text-black"
                      : "bg-emerald-600 text-white",
                  )}
                >
                  Pro Lighting
                </Badge>
                <Badge
                  className={cn(
                    "rounded-full font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5",
                    isDark
                      ? "bg-[#6DFF3B] text-black"
                      : "bg-emerald-600 text-white",
                  )}
                >
                  📐 {venue.area}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black !text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                {venue.name}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-xs sm:text-sm font-semibold !text-white/90">
                <div className="flex items-center gap-1 text-[#6DFF3B]">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{venue.location}</span>
                </div>
                <span>•</span>
                <div
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full border backdrop-blur-md",
                    isDark
                      ? "bg-[#6DFF3B] text-black border-transparent"
                      : "bg-emerald-600 text-white border-transparent",
                  )}
                >
                  <Star
                    className={cn(
                      "h-3.5 w-3.5 fill-current",
                      isDark ? "text-black" : "text-white",
                    )}
                  />
                  <span className="font-bold">
                    {venue.rating.toFixed(1)}
                  </span>
                  <span
                    className={cn(
                      "text-[10px]",
                      isDark ? "text-black/75" : "text-white/90",
                    )}
                  >
                    ({venue.reviews})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Bento Photos Stack */}
          <div className="hidden lg:grid grid-cols-1 grid-rows-2 gap-3 h-[400px]">
            {gallery.slice(1, 3).map((img, idx) => (
              <div
                key={idx}
                className="relative rounded-[22px] overflow-hidden group h-full border border-slate-200 dark:border-white/5"
              >
                <ImageWithFallback
                  src={img}
                  alt={`Venue ${idx + 2}`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* 50 / 50 Split Layout Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column (50% Screen): Venue Overview, Amenities, Map, Reviews */}
          <div className="space-y-6">
            {/* Overview & Trust Cards */}
            <Card
              className={cn(
                "rounded-[28px] border transition-colors duration-300",
                isDark
                  ? "border-white/10 bg-[#101216] text-white shadow-xl"
                  : "border-slate-200 bg-white text-slate-900 shadow-sm",
              )}
            >
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles
                      className={cn(
                        "h-4 w-4",
                        isDark ? "text-[#6DFF3B]" : "text-emerald-600",
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-bold uppercase tracking-widest",
                        isDark ? "text-[#6DFF3B]" : "text-emerald-600",
                      )}
                    >
                      Overview
                    </span>
                  </div>
                  <h2
                    className={cn(
                      "text-2xl font-extrabold mt-1 tracking-tight",
                      isDark ? "text-white" : "text-slate-900",
                    )}
                  >
                    Book With Confidence
                  </h2>
                </div>

                <p
                  className={cn(
                    "text-sm sm:text-base leading-relaxed",
                    isDark ? "text-white/70" : "text-slate-600",
                  )}
                >
                  {venue.description}
                </p>

                {/* Trust Badges Trio */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    {
                      title: "100% Verified",
                      desc: "Inspected turf & lighting",
                    },
                    {
                      title: "Refund Safe",
                      desc: "Cancel up to 2 hrs before",
                    },
                    { title: "No Hidden Fee", desc: "Clear upfront rate" },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className={cn(
                        "rounded-2xl border p-3.5 flex items-start gap-3 transition-colors",
                        isDark
                          ? "border-white/10 bg-white/[0.02]"
                          : "border-slate-200/80 bg-slate-50/80",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full border shrink-0",
                          isDark
                            ? "bg-[#6DFF3B]/10 border-[#6DFF3B]/30 text-[#6DFF3B]"
                            : "bg-emerald-50 border-emerald-200 text-emerald-600",
                        )}
                      >
                        <ShieldCheck className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p
                          className={cn(
                            "text-xs font-bold",
                            isDark ? "text-white" : "text-slate-800",
                          )}
                        >
                          {item.title}
                        </p>
                        <p
                          className={cn(
                            "text-[11px] mt-0.5",
                            isDark ? "text-white/50" : "text-slate-500",
                          )}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Amenities Section */}
            <Card
              className={cn(
                "rounded-[28px] border transition-colors duration-300",
                isDark
                  ? "border-white/10 bg-[#101216] text-white shadow-xl"
                  : "border-slate-200 bg-white text-slate-900 shadow-sm",
              )}
            >
              <CardContent className="p-6 sm:p-8">
                <h3
                  className={cn(
                    "text-xl font-extrabold tracking-tight mb-5",
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
                          "flex items-center gap-3 rounded-2xl border p-3.5 transition-all",
                          isDark
                            ? "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#6DFF3B]/30"
                            : "border-slate-200/80 bg-slate-50/80 hover:bg-slate-100 hover:border-emerald-300",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl border shrink-0",
                            isDark
                              ? "bg-[#6DFF3B]/10 border-[#6DFF3B]/20 text-[#6DFF3B]"
                              : "bg-emerald-50 border-emerald-200 text-emerald-600",
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
              </CardContent>
            </Card>

            {/* Map & Directions */}
            <Card
              className={cn(
                "rounded-[28px] border overflow-hidden transition-colors duration-300",
                isDark
                  ? "border-white/10 bg-[#101216] text-white shadow-xl"
                  : "border-slate-200 bg-white text-slate-900 shadow-sm",
              )}
            >
              <CardContent className="p-6 sm:p-8 space-y-4">
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
                        ? "text-[#6DFF3B] hover:underline"
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
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(venue.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    allowFullScreen
                    title="Venue Google Map"
                    className="w-full h-full border-0 transition-opacity duration-300"
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
                      isDark ? "text-[#6DFF3B]" : "text-emerald-600",
                    )}
                  />
                  <span>{venue.address}</span>
                </div>
              </CardContent>
            </Card>

            {/* Verified Player Reviews */}
            <Card
              className={cn(
                "rounded-[28px] border transition-colors duration-300",
                isDark
                  ? "border-white/10 bg-[#101216] text-white shadow-xl"
                  : "border-slate-200 bg-white text-slate-900 shadow-sm",
              )}
            >
              <CardContent className="p-6 sm:p-8 space-y-5">
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
                        ? "bg-[#6DFF3B]/10 border-[#6DFF3B]/30"
                        : "bg-emerald-50 border-emerald-200",
                    )}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4 fill-current",
                        isDark ? "text-[#6DFF3B]" : "text-emerald-600",
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-black",
                        isDark ? "text-[#6DFF3B]" : "text-emerald-700",
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

                <div className="space-y-3">
                  {reviewsList.map((rev, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-2xl border p-4 space-y-2 transition-colors",
                        isDark
                          ? "border-white/10 bg-white/[0.02]"
                          : "border-slate-200/80 bg-slate-50/80",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "h-8 w-8 rounded-full border font-bold text-xs flex items-center justify-center",
                              isDark
                                ? "bg-[#6DFF3B]/20 border-[#6DFF3B]/40 text-[#6DFF3B]"
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
                        <div className="flex gap-0.5">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3.5 w-3.5 fill-current",
                                isDark ? "text-[#6DFF3B]" : "text-amber-500",
                              )}
                            />
                          ))}
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (50% Screen): High-Converting Interactive Slot Booking Widget */}
          <div className="lg:sticky lg:top-20 space-y-6">
            <Card
              className={cn(
                "rounded-[28px] border shadow-2xl overflow-hidden relative isolate transition-colors duration-300",
                isDark
                  ? "border-[#6DFF3B]/30 bg-[#0d0f15] text-white"
                  : "border-slate-200 bg-white text-slate-900",
              )}
            >
              {/* Ambient Glow */}
              <div
                className={cn(
                  "absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl pointer-events-none",
                  isDark ? "bg-[#6DFF3B]/10" : "bg-emerald-500/10",
                )}
              />

              <CardContent className="p-6 sm:p-8 space-y-6 relative z-10">
                {/* Header */}
                <div
                  className={cn(
                    "flex items-center justify-between border-b pb-5",
                    isDark ? "border-white/10" : "border-slate-200",
                  )}
                >
                  <div>
                    <Badge
                      className={cn(
                        "rounded-full font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 mb-1",
                        isDark
                          ? "bg-[#6DFF3B] text-black"
                          : "bg-emerald-600 text-white",
                      )}
                    >
                      INSTANT BOOKING
                    </Badge>
                    <h3
                      className={cn(
                        "text-2xl font-black tracking-tight",
                        isDark ? "text-white" : "text-slate-900",
                      )}
                    >
                      Reserve Slot
                    </h3>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        "text-2xl font-black",
                        isDark ? "text-[#6DFF3B]" : "text-emerald-600",
                      )}
                    >
                      ₹{getSlotPrice(getStartHour(startTime), playHours)}
                    </span>
                    <p
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        isDark ? "text-white/50" : "text-slate-500",
                      )}
                    >
                      {playHours} hour{playHours > 1 ? "s" : ""} selected
                    </p>
                  </div>
                </div>

                {/* Step 1: Select Sport Pills */}
                <div className="space-y-2.5">
                  <label
                    className={cn(
                      "text-xs font-bold uppercase tracking-wider flex items-center justify-between",
                      isDark ? "text-white/70" : "text-slate-700",
                    )}
                  >
                    <span>1. Select Sport</span>
                    <span
                      className={
                        isDark ? "text-[#6DFF3B]" : "text-emerald-600"
                      }
                    >
                      Available Format
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Football", "Cricket", "Basketball"].map((sp) => (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => setSelectedSport(sp)}
                        className={cn(
                          "h-11 rounded-2xl border text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                          selectedSport === sp
                            ? isDark
                              ? "bg-[#6DFF3B]/10 border-2 border-[#6DFF3B] text-[#6DFF3B] shadow-[0_0_15px_rgba(109,255,59,0.2)] scale-[1.02]"
                              : "bg-emerald-50/50 border-2 border-emerald-600 text-emerald-700 shadow-sm scale-[1.02]"
                            : isDark
                              ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                              : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200",
                        )}
                      >
                        <span>
                          {sp === "Football"
                            ? "⚽"
                            : sp === "Cricket"
                              ? "🏏"
                              : "🏀"}
                        </span>
                        <span>{sp}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Date Selector (Quick Pills + Picker) */}
                <div className="space-y-2.5">
                  <label
                    className={cn(
                      "text-xs font-bold uppercase tracking-wider flex items-center justify-between",
                      isDark ? "text-white/70" : "text-slate-700",
                    )}
                  >
                    <span>2. Select Date</span>
                    <span
                      className={
                        isDark ? "text-[#6DFF3B] font-extrabold" : "text-emerald-700 font-extrabold"
                      }
                    >
                      {formatDateLabel(selectedDate)}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="grid grid-cols-4 gap-2 flex-grow">
                      {dateOptions.map((opt) => (
                        <button
                          key={opt.iso}
                          type="button"
                          onClick={() => setSelectedDate(opt.iso)}
                          className={cn(
                            "h-10 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center",
                            selectedDate === opt.iso
                              ? isDark
                                ? "bg-[#6DFF3B]/10 border-2 border-[#6DFF3B] text-[#6DFF3B] font-extrabold shadow-md"
                                : "bg-emerald-50/50 border-2 border-emerald-600 text-emerald-700 font-extrabold shadow-md"
                              : isDark
                                ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                                : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200",
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Calendar Icon Button */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentCalendarDate(new Date(selectedDate));
                          setShowCalendar(!showCalendar);
                        }}
                        className={cn(
                          "h-10 w-10 rounded-xl border transition-all flex items-center justify-center cursor-pointer",
                          isCustomDate
                            ? isDark
                              ? "bg-[#6DFF3B]/10 border-2 border-[#6DFF3B] text-[#6DFF3B] shadow-[0_0_12px_rgba(109,255,59,0.3)] scale-[1.02]"
                              : "bg-emerald-50/50 border-2 border-emerald-600 text-emerald-700 shadow-sm scale-[1.02]"
                            : isDark
                              ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20"
                              : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800",
                        )}
                        title="Choose custom date"
                      >
                        <Calendar className="h-4 w-4 shrink-0" />
                      </button>

                      {showCalendar && (
                        <>
                          {/* Invisible backdrop for click-away */}
                          <div
                            className="fixed inset-0 z-40 cursor-default"
                            onClick={() => setShowCalendar(false)}
                          />
                          {/* Custom Dropdown Calendar */}
                          <div
                            className={cn(
                              "absolute right-0 top-12 z-50 w-72 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-colors duration-300",
                              isDark
                                ? "bg-[#0d0f15]/95 border-[#6DFF3B]/20 text-white"
                                : "bg-white/95 border-slate-200 text-slate-800"
                            )}
                          >
                            {/* Calendar Header Controls */}
                            <div className="flex items-center justify-between mb-4">
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

                            {/* Calendar Days-of-Week Header */}
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

                            {/* Calendar Days Grid */}
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
                                        ? isDark
                                          ? "bg-[#6DFF3B]/20 border border-[#6DFF3B] text-[#6DFF3B] font-extrabold shadow-sm"
                                          : "bg-emerald-50 border border-emerald-600 text-emerald-700 font-extrabold shadow-sm"
                                        : isDisabled
                                          ? "text-slate-300 dark:text-white/10 cursor-not-allowed line-through opacity-40"
                                          : cell.isCurrentMonth
                                            ? isDark
                                              ? "text-white hover:bg-white/5"
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
                  </div>
                </div>

                {/* Step 3: Duration Selection */}
                <div className="space-y-2.5">
                  <label
                    className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      isDark ? "text-white/70" : "text-slate-700",
                    )}
                  >
                    3. Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setPlayHours(hrs)}
                        className={cn(
                          "h-10 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1",
                          playHours === hrs
                            ? isDark
                              ? "bg-[#6DFF3B]/10 border-2 border-[#6DFF3B] text-[#6DFF3B] font-extrabold shadow-md"
                              : "bg-emerald-50/50 border-2 border-emerald-600 text-emerald-700 font-extrabold shadow-md"
                            : isDark
                              ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                              : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200",
                        )}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {hrs} Hr{hrs > 1 ? "s" : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 4: Time Slot Matrix */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label
                      className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        isDark ? "text-white/70" : "text-slate-700",
                      )}
                    >
                      4. Choose Time Slot ({playHours} Hr{playHours > 1 ? "s" : ""})
                    </label>
                    <span
                      className={cn(
                        "text-[10px] font-bold",
                        isDark ? "text-[#6DFF3B]" : "text-emerald-600",
                      )}
                    >
                      🟢 Available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5">
                    {timeSlots.map((slot) => {
                      const slotHour = slot.startHour;
                      const isBooked = !!slot.bookedBy;
                      const overlaps = isOverlapping(slotHour);
                      const outOfBounds = isOutOfBounds(slotHour);
                      const isDisabled = isBooked || overlaps || outOfBounds;
                      const isSelected = getStartHour(startTime) === slotHour;
                      const slotPrice = getSlotPrice(slotHour, playHours);

                      return (
                        <button
                          key={slotHour}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => setStartTime(hourToTimeStr(slotHour))}
                          className={cn(
                            "p-3 rounded-2xl border flex flex-col items-center justify-center transition-all min-h-[78px] text-center relative cursor-pointer",
                            isSelected
                              ? isDark
                                ? "bg-[#6DFF3B]/10 border-2 border-[#6DFF3B] text-white shadow-[0_0_15px_rgba(109,255,59,0.2)] scale-[1.02]"
                                : "bg-emerald-50/50 border-2 border-emerald-600 text-slate-900 shadow-sm scale-[1.02]"
                              : isDisabled
                                ? isDark
                                  ? "border-red-500/20 bg-red-500/10 opacity-50 cursor-not-allowed"
                                  : "border-red-200 bg-red-50 text-red-700 opacity-60 cursor-not-allowed"
                                : isDark
                                  ? "border-white/10 bg-white/[0.03] text-white hover:border-[#6DFF3B]/50 hover:bg-white/[0.08]"
                                  : "border-slate-200 bg-slate-50 text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50",
                          )}
                        >
                          <span
                            className={cn(
                              "text-xs font-bold",
                              isDisabled
                                ? isDark
                                  ? "text-white/40"
                                  : "text-red-400"
                                : isDark
                                  ? "text-white"
                                  : "text-slate-800",
                            )}
                          >
                            {formatSlotRange(slotHour, playHours)}
                          </span>

                          {!isDisabled && (
                            <span
                              className={cn(
                                "text-[11px] font-black mt-0.5",
                                isDark
                                  ? "text-[#6DFF3B]"
                                  : "text-emerald-700",
                              )}
                            >
                              ₹{slotPrice}
                            </span>
                          )}

                          <span
                            className={cn(
                              "text-[9px] font-extrabold uppercase mt-0.5 tracking-wider",
                              isSelected
                                ? isDark
                                  ? "text-[#6DFF3B]"
                                  : "text-emerald-600"
                                : isDisabled
                                  ? "text-red-500"
                                  : isDark
                                    ? "text-[#6DFF3B]/70"
                                    : "text-emerald-600/70",
                            )}
                          >
                            {isDisabled
                              ? "Booked"
                              : isSelected
                                ? "Selected ✓"
                                : "Available"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Booking Order Summary Box */}
                <div
                  className={cn(
                    "rounded-2xl border p-4 space-y-2.5 transition-colors",
                    isDark
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-slate-200 bg-slate-50/90",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-between text-xs",
                      isDark ? "text-white/70" : "text-slate-600",
                    )}
                  >
                    <span>Venue Rate ({playHours} hr):</span>
                    <span
                      className={cn(
                        "font-bold",
                        isDark ? "text-white" : "text-slate-900",
                      )}
                    >
                      ₹{getSlotPrice(getStartHour(startTime), playHours)}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "flex items-center justify-between text-xs",
                      isDark ? "text-white/70" : "text-slate-600",
                    )}
                  >
                    <span>Convenience Fee:</span>
                    <span
                      className={cn(
                        "font-bold",
                        isDark ? "text-[#6DFF3B]" : "text-emerald-600",
                      )}
                    >
                      FREE (₹0)
                    </span>
                  </div>
                  <div
                    className={cn(
                      "flex items-center justify-between text-xs",
                      isDark ? "text-white/70" : "text-slate-600",
                    )}
                  >
                    <span>Selected Time:</span>
                    <span
                      className={cn(
                        "font-bold",
                        isDark ? "text-[#6DFF3B]" : "text-emerald-600",
                      )}
                    >
                      {formatSlotRange(getStartHour(startTime), playHours)}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "border-t pt-2.5 flex items-center justify-between",
                      isDark ? "border-white/10" : "border-slate-200",
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        isDark ? "text-white" : "text-slate-900",
                      )}
                    >
                      Total Payable:
                    </span>
                    <span
                      className={cn(
                        "text-xl font-black",
                        isDark ? "text-[#6DFF3B]" : "text-emerald-600",
                      )}
                    >
                      ₹{getSlotPrice(getStartHour(startTime), playHours)}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => {
                    if (!currentUser) {
                      toast.error("Please sign in first to continue booking.");
                      navigate("/login");
                    } else {
                      sessionStorage.setItem(
                        "sportxclub_booking",
                        JSON.stringify({
                          venue: venue.name,
                          sport: selectedSport,
                          date: selectedDate,
                          time: formatSlotRange(
                            getStartHour(startTime),
                            playHours,
                          ),
                          price: getSlotPrice(
                            getStartHour(startTime),
                            playHours,
                          ),
                        }),
                      );
                      navigate("/payment");
                    }
                  }}
                  className={cn(
                    "group h-14 w-fit px-10 mx-auto rounded-full font-extrabold text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 select-none",
                    isDark
                      ? "bg-gradient-to-r from-[#6DFF3B] to-[#4ade80] text-black hover:from-[#86ff60] hover:to-[#55ef6a] shadow-[0_4px_20px_rgba(109,255,59,0.25)] hover:shadow-[0_8px_30px_rgba(109,255,59,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-[0_4px_20px_rgba(5,150,105,0.2)] hover:shadow-[0_8px_30px_rgba(5,150,105,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]",
                  )}
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
                </Button>

                {/* Trust Footer */}
                <div
                  className={cn(
                    "flex items-center justify-center gap-2 text-[11px]",
                    isDark ? "text-white/50" : "text-slate-500",
                  )}
                >
                  <Lock
                    className={cn(
                      "h-3.5 w-3.5",
                      isDark ? "text-[#6DFF3B]" : "text-emerald-600",
                    )}
                  />
                  <span>256-Bit Encrypted • Instant Confirmation</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
