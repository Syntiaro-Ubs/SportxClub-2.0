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
  "https://images.unsplash.com/photo-1592709823125-a191f07a2a5e?w=600&q=80",
  "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=600&q=80",
  "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600&q=80",
  "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=600&q=80",
  "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80",
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
  const [showCustomHours, setShowCustomHours] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [cancelledSlots, setCancelledSlots] = useState([]);
  const [sortBy, setSortBy] = useState("recent");

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-8">
          {/* Main Hero Photo (Spans 2 columns on desktop) */}
          <div className="relative lg:col-span-2 w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:h-[400px] rounded-2xl overflow-hidden group">
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
                      ? "bg-transparent text-[#6DFF3B]"
                      : "bg-transparent text-white",
                  )}
                >
                  FIFA Standard
                </Badge>
                <Badge
                  className={cn(
                    "rounded-full font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5",
                    isDark
                      ? "bg-transparent text-[#6DFF3B]"
                      : "bg-transparent text-white",
                  )}
                >
                  Pro Lighting
                </Badge>
                <Badge
                  className={cn(
                    "rounded-full font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5",
                    isDark
                      ? "bg-transparent text-[#6DFF3B]"
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
                    isDark ? "text-[#6DFF3B]" : "text-white"
                  )}
                >
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{venue.location}</span>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 px-1 rounded-full",
                    isDark
                      ? "bg-transparent text-[#6DFF3B]"
                      : "bg-transparent text-white",
                  )}
                >
                  <Star
                    className={cn(
                      "h-3.5 w-3.5 fill-current",
                      isDark ? "text-[#6DFF3B]" : "text-white",
                    )}
                  />
                  <span className="font-bold">
                    {venue.rating.toFixed(1)}
                  </span>
                  <span
                    className={cn(
                      "text-[10px]",
                      isDark ? "text-[#6DFF3B]/80" : "text-white/80",
                    )}
                  >
                    ({venue.reviews})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Bento Photos Stack with Vertical Marquee */}
          <div className="hidden lg:block relative h-[400px] overflow-hidden rounded-2xl border border-slate-200 dark:border-white/5 select-none">
            <style dangerouslySetInnerHTML={{ __html: marqueeVerticalStyle }} />



            <div className="animate-marquee-vertical">
              {gallery.slice(1).concat(gallery.slice(1)).map((img, idx) => (
                <div
                  key={idx}
                  className="h-[194px] w-full shrink-0 relative rounded-2xl overflow-hidden group border border-slate-250 dark:border-white/5"
                >
                  <ImageWithFallback
                    src={img}
                    alt={`Venue Scroll ${idx}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 50 / 50 Split Layout Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column (50% Screen): Venue Overview, Amenities, Map, Reviews */}
          <div className="space-y-6 order-2 lg:order-1">
            {/* Amenities Section */}
            <div className="space-y-4">
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
                          ? "border-white/5 bg-white/[0.03] hover:bg-white/[0.05] hover:border-[#6DFF3B]/30"
                          : "border-slate-200 bg-white hover:bg-slate-50/50 hover:border-emerald-300",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl border shrink-0",
                          isDark
                            ? "bg-[#6DFF3B]/10 border-[#6DFF3B]/20 text-[#6DFF3B]"
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
            <div className="space-y-4">
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
                >
                </MapPin>
                <span>{venue.address}</span>
              </div>
            </div>

            {/* Verified Player Reviews */}
            <div className="space-y-5">
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

              {/* Review Sorting Controls - UI/UX Premium Redesign */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1 pb-1">
                <div className="flex items-center gap-1.5 shrink-0 select-none">
                  <Sparkles className={cn(
                    "h-3.5 w-3.5",
                    isDark ? "text-[#6DFF3B]" : "text-emerald-600"
                  )} />
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest leading-none",
                    isDark ? "text-white/40" : "text-slate-400"
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
                          "flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap text-center active:scale-95",
                          isActive
                            ? isDark
                              ? "bg-[#6DFF3B] text-black shadow-md shadow-[#6DFF3B]/10 scale-100"
                              : "bg-white text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/40 scale-100"
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
                  .map((rev, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-2xl border p-4 space-y-2 transition-colors shadow-sm",
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
            </div>
          </div>

          {/* Right Column (50% Screen): High-Converting Interactive Slot Booking Widget */}
          <div className="lg:sticky lg:top-20 space-y-6 order-1 lg:order-2">
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
                    {["Football", "Cricket", "Basketball"].map((sp) => (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => setSelectedSport(sp)}
                        className={cn(
                          "h-11 px-4 rounded-2xl border text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full",
                          selectedSport === sp
                            ? isDark
                              ? "bg-[#6DFF3B]/10 border border-[#6DFF3B] text-[#6DFF3B] shadow-[0_0_15px_rgba(109,255,59,0.2)]"
                              : "bg-emerald-50/50 border border-emerald-600 text-emerald-700 shadow-sm"
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
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 flex-grow">
                      {dateOptions.map((opt) => (
                        <button
                          key={opt.iso}
                          type="button"
                          onClick={() => setSelectedDate(opt.iso)}
                          className={cn(
                            "h-10 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center w-full",
                            selectedDate === opt.iso
                              ? isDark
                                ? "bg-[#6DFF3B]/10 border border-[#6DFF3B] text-[#6DFF3B] font-extrabold shadow-md"
                                : "bg-emerald-50/50 border border-emerald-600 text-emerald-700 font-extrabold shadow-md"
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
                              ? "bg-[#6DFF3B]/10 border border-[#6DFF3B] text-[#6DFF3B] shadow-[0_0_12px_rgba(109,255,59,0.3)]"
                              : "bg-emerald-50/50 border border-emerald-600 text-emerald-700 shadow-sm"
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
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                    {[1, 2, 3].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => {
                          setPlayHours(hrs);
                          setShowCustomHours(false);
                        }}
                        className={cn(
                          "h-10 px-1 sm:px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 w-full",
                          playHours === hrs && !showCustomHours
                            ? isDark
                              ? "bg-[#6DFF3B]/10 border border-[#6DFF3B] text-[#6DFF3B] font-extrabold shadow-md"
                              : "bg-emerald-50/50 border border-emerald-600 text-emerald-700 font-extrabold shadow-md"
                            : isDark
                              ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                              : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200",
                        )}
                      >
                        <Clock className="h-3.5 w-3.5 hidden xs:inline" />
                        <span>
                          {hrs} Hr{hrs > 1 ? "s" : ""}
                        </span>
                      </button>
                    ))}

                    {showCustomHours ? (
                      <div className={cn(
                        "h-10 px-1 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-between gap-1 w-full",
                        isDark ? "border-[#6DFF3B] bg-[#6DFF3B]/10 text-[#6DFF3B]" : "border-emerald-600 bg-emerald-50/50 text-emerald-700"
                      )}>
                        <button
                          type="button"
                          onClick={() => setPlayHours(Math.max(1, playHours - 1))}
                          className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-extrabold whitespace-nowrap">{playHours} Hr{playHours > 1 ? "s" : ""}</span>
                        <button
                          type="button"
                          onClick={() => setPlayHours(Math.min(24, playHours + 1))}
                          className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomHours(true);
                          if (playHours === 1 || playHours === 2 || playHours === 3) {
                            setPlayHours(4);
                          }
                        }}
                        className={cn(
                          "h-10 px-1 sm:px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 w-full",
                          (playHours > 3 || showCustomHours)
                            ? isDark
                              ? "bg-[#6DFF3B]/10 border border-[#6DFF3B] text-[#6DFF3B] font-extrabold shadow-md"
                              : "bg-emerald-50/50 border border-emerald-600 text-emerald-700 font-extrabold shadow-md"
                            : isDark
                              ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                              : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200",
                        )}
                      >
                        <Clock className="h-3.5 w-3.5 hidden xs:inline" />
                        <span>Custom</span>
                      </button>
                    )}
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

                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                    {timeSlots.map((slot) => {
                      const slotHour = slot.startHour;
                      const isBooked = !!slot.bookedBy && !cancelledSlots.includes(slotHour);
                      const overlaps = isOverlapping(slotHour);
                      const outOfBounds = isOutOfBounds(slotHour);
                      const cannotSelect = isBooked || overlaps || outOfBounds;
                      const isSelected = getStartHour(startTime) === slotHour;
                      const slotPrice = getSlotPrice(slotHour, playHours);

                      return (
                        <button
                          key={slotHour}
                          type="button"
                          disabled={overlaps || outOfBounds}
                          onClick={() => !cannotSelect && setStartTime(hourToTimeStr(slotHour))}
                          className={cn(
                            "py-3 px-5 rounded-2xl border flex flex-col items-center justify-center transition-all min-h-[78px] text-center relative",
                            !cannotSelect ? "cursor-pointer" : "cursor-not-allowed",
                            isSelected
                              ? isDark
                                ? "bg-[#6DFF3B]/10 border border-[#6DFF3B] text-white shadow-[0_0_15px_rgba(109,255,59,0.2)]"
                                : "bg-emerald-50/50 border border-emerald-600 text-slate-900 shadow-sm"
                              : cannotSelect
                                ? isDark
                                  ? "border-red-500/20 bg-red-500/10 opacity-50"
                                  : "border-red-200 bg-red-50 text-red-700 opacity-60"
                                : isDark
                                  ? "border-white/10 bg-white/[0.03] text-white hover:border-[#6DFF3B]/50 hover:bg-white/[0.08]"
                                  : "border-slate-200 bg-slate-50 text-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50",
                          )}
                        >
                          <span
                            className={cn(
                              "text-xs font-bold",
                              cannotSelect
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

                          {!cannotSelect && (
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
                              "text-[9px] font-extrabold uppercase mt-0.5 tracking-wider leading-tight",
                              isSelected
                                ? isDark
                                  ? "text-[#6DFF3B]"
                                  : "text-emerald-600"
                                : cannotSelect
                                  ? "text-red-500"
                                  : isDark
                                    ? "text-[#6DFF3B]/70"
                                    : "text-emerald-600/70",
                            )}
                          >
                            {cannotSelect ? (
                              <>
                                <span className="block">{isBooked ? "Booked" : "Unavailable"}</span>
                                {isBooked && (
                                  <>
                                    <span className="block text-[7.5px] font-semibold opacity-80 mt-[2px] normal-case tracking-normal text-slate-500 dark:text-white/40">
                                      Cancel by {formatSlotRange(slotHour - 2, 0).split(' - ')[0]}
                                    </span>
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCancelledSlots([...cancelledSlots, slotHour]);
                                      }}
                                      className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-red-500/20 text-red-600 dark:text-red-400 rounded-md text-[8px] font-bold tracking-wider hover:bg-red-500/30 transition-colors cursor-pointer pointer-events-auto shadow-sm"
                                    >
                                      CANCEL
                                    </div>
                                  </>
                                )}
                              </>
                            ) : isSelected ? (
                              "Selected ✓"
                            ) : (
                              "Available"
                            )}
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
                    "group h-14 w-full sm:w-fit pl-6 pr-3 sm:ml-auto rounded-2xl font-extrabold text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer flex items-center justify-between gap-6 select-none",
                    isDark
                      ? "bg-white text-black hover:bg-[#6DFF3B] hover:text-black shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_rgba(109,255,59,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
                      : "bg-white text-emerald-600 border border-slate-200 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white shadow-sm hover:shadow-[0_8px_30px_rgba(5,150,105,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]",
                  )}
                >
                  <span className="translate-y-[0.5px]">Proceed to Payment</span>
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300",
                    isDark
                      ? "bg-black/10 text-black group-hover:bg-[#6DFF3B]/20"
                      : "bg-emerald-50 text-emerald-600 group-hover:bg-white group-hover:text-emerald-600 group-hover:scale-105"
                  )}>
                    <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
