import { useRef, useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Star, MapPin, ChevronRight, Filter, ChevronLeft, ChevronDown, Check, RotateCcw, Heart, CalendarDays, Users, Lightbulb, Bath, Car, MoreHorizontal, Dribbble, Loader2, ArrowLeft, X, PenLine } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../components/ui/utils";
import { Button } from "../components/ui/button";
import { adminApi } from "../services/admin-api";

function ChevronLeft120({ className = "h-8 w-8 md:h-10 md:w-10 text-slate-900 dark:text-white", strokeWidth = 1.5 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="14 5 10 12 14 19" />
    </svg>
  );
}

function ChevronRight120({ className = "h-8 w-8 md:h-10 md:w-10 text-slate-900 dark:text-white", strokeWidth = 1.5 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="10 5 14 12 10 19" />
    </svg>
  );
}

const getArrowClass = (items, side) => {
  if (items.length <= 2) return "hidden";

  let responsiveClass = "absolute top-1/2 -translate-y-1/2 z-30 h-10 w-10 md:h-12 md:w-12 flex items-center justify-center bg-transparent text-slate-900 dark:text-white hover:scale-125 active:scale-95 transition-all opacity-100 cursor-pointer shadow-none";

  if (side === "left") {
    responsiveClass += " -left-7 sm:-left-9 lg:-left-11";
  } else {
    responsiveClass += " -right-7 sm:-right-9 lg:-right-11";
  }

  if (items.length === 3) {
    responsiveClass += " lg:hidden";
  } else if (items.length === 4) {
    responsiveClass += " xl:hidden";
  }

  return responsiveClass;
};

export const demoVenues = [];

function ImageWithLoader({ src, alt, className, onError, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <>
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm z-0">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(className, !isLoaded ? "opacity-0" : "opacity-100")}
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          setIsLoaded(true);
          setError(true);
          if (onError) onError(e);
        }}
        {...props}
      />
    </>
  );
}

function CustomSelect({ value, onChange, options, variant = "default" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", isOpen ? "z-50" : "z-10")} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between text-left transition-all duration-200 cursor-pointer",
          variant === "clean"
            ? "bg-transparent py-1 px-0 text-[13px] font-semibold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400"
            : "rounded-[14px] sm:rounded-2xl px-3 sm:px-4 py-2 h-9 sm:h-10 text-[12px] sm:text-[13px] font-medium shadow-sm bg-white dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        )}
      >
        <span className="truncate text-slate-800 dark:text-slate-200 font-semibold">{value}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 transition-transform duration-200 shrink-0 ml-1",
            isOpen ? "rotate-180 text-emerald-600 dark:text-emerald-400" : ""
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 mt-1.5 z-[999] max-h-48 overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-2xl backdrop-blur-2xl p-0 flex flex-col divide-y divide-slate-100 dark:divide-slate-800/70 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {options.map((opt, index) => {
              const isSelected = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[13px] transition-colors cursor-pointer",
                    index === 0 ? "rounded-t-xl" : "",
                    index === options.length - 1 ? "rounded-b-xl" : "",
                    isSelected
                      ? "bg-slate-50/70 dark:bg-slate-800/40 text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-emerald-600 dark:hover:text-emerald-400"
                  )}
                >
                  <span className="truncate">{opt}</span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function VenueBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);
  const filterContainerRef = useRef(null);

  const [selectedSport, setSelectedSport] = useState(location.state?.sport || "All Sports");
  const [selectedLocation, setSelectedLocation] = useState(
    () => localStorage.getItem("preferred-city") || "All Cities"
  );
  const [sortByPrice, setSortByPrice] = useState("Low to High");
  const [sortByRating, setSortByRating] = useState("High to Low");
  const [sortField, setSortField] = useState("Price"); // "Price" or "Rating"
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Review Modal State
  const [reviewModalData, setReviewModalData] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleReviewSubmit = async () => {
    if (reviewRating === 0) {
      alert("Please select a rating.");
      return;
    }
    try {
      setIsSubmittingReview(true);
      // Simulate API call for review submission
      await new Promise((resolve) => setTimeout(resolve, 800));
      alert("Review submitted successfully!");
      setReviewModalData(null);
      setReviewRating(0);
      setReviewText("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Close Quick Filters popover when clicking anywhere outside
  useEffect(() => {
    function handleClickOutsideFilter(event) {
      if (filterContainerRef.current && !filterContainerRef.current.contains(event.target)) {
        setIsMobileFilterOpen(false);
      }
    }
    if (isMobileFilterOpen) {
      document.addEventListener("mousedown", handleClickOutsideFilter);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideFilter);
    };
  }, [isMobileFilterOpen]);

  useEffect(() => {
    const handleCityChange = (e) => {
      setSelectedLocation(e.detail);
    };
    window.addEventListener("preferredCityChanged", handleCityChange);
    return () => window.removeEventListener("preferredCityChanged", handleCityChange);
  }, []);

  useEffect(() => {
    if (location.state?.sport) {
      setSelectedSport(location.state.sport);
    }
  }, [location.state?.sport]);

  const [turfs, setTurfs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTurfs() {
      try {
        setIsLoading(true);
        const data = await adminApi.getAll("turfs");
        setTurfs(data || []);
      } catch (err) {
        console.error("Error loading turfs from MySQL database:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTurfs();
  }, []);

  const dynamicVenues = useMemo(() => {
    return turfs.map((t) => ({
      id: t.id,
      name: t.name,
      location: typeof t.location === "string" ? t.location : (t.location?.city || t.location?.address || "Local Arena"),
      price: Number(t.price || t.price_per_hour || 1500),
      rating: Number(t.rating || 4.8),
      sports: (t.sport_type || t.sportType || "Football").toUpperCase(),
      image: t.image_url || t.image || "/assets/venues/turf-1.webp",
      badge: t.status === "Active" ? "VERIFIED" : "FEATURED",
      reviews: Number(t.reviews ?? t.reviews_count ?? 35),
      status: t.status || "Active",
      display_order: Number(t.display_order || 0),
      all_display_order: Number(t.all_display_order || 0),
      description: t.description,
      amenities: t.amenities,
      rules: t.rules,
    }));
  }, [turfs]);

  const sportsList = ["All Sports", "Football", "Cricket", "Badminton", "Tennis", "Basketball", "Volleyball", "Padel"];
  const citiesList = ["All Cities", "Mumbai", "Delhi-NCR", "Bengaluru", "Hyderabad", "Chandigarh", "Ahmedabad", "Pune", "Chennai", "Kolkata", "Kochi"];

  const filteredVenues = dynamicVenues.filter((venue) => {
    const matchSport = selectedSport === "All Sports" || venue.sports.toLowerCase().includes(selectedSport.toLowerCase());
    const matchLocation = selectedLocation === "All Cities" || venue.location.toLowerCase().includes(selectedLocation.toLowerCase());
    return matchSport && matchLocation;
  });

  // Recommended Venues (Section #1): Sorted by display_order set in Dashboard (or by most reviews if default)
  const premiumVenues = useMemo(() => {
    return [...filteredVenues].sort((a, b) => {
      const hasOrderA = a.display_order > 0;
      const hasOrderB = b.display_order > 0;
      if (hasOrderA && hasOrderB) {
        return a.display_order - b.display_order;
      }
      if (hasOrderA) return -1;
      if (hasOrderB) return 1;
      return b.reviews - a.reviews;
    });
  }, [filteredVenues]);

  // All Venues (Section #2): Sorted by all_display_order set in Dashboard (or by most reviews if default)
  const otherVenues = useMemo(() => {
    return [...filteredVenues].sort((a, b) => {
      const hasOrderA = a.all_display_order > 0;
      const hasOrderB = b.all_display_order > 0;
      if (hasOrderA && hasOrderB) {
        return a.all_display_order - b.all_display_order;
      }
      if (hasOrderA) return -1;
      if (hasOrderB) return 1;
      return b.reviews - a.reviews;
    });
  }, [filteredVenues]);

  const scrollLeft1 = () => {
    if (scrollRef1.current) {
      scrollRef1.current.scrollBy({ left: -350, behavior: "smooth" });
    }
  };

  const scrollRight1 = () => {
    if (scrollRef1.current) {
      scrollRef1.current.scrollBy({ left: 350, behavior: "smooth" });
    }
  };

  const scrollLeft2 = () => {
    if (scrollRef2.current) {
      scrollRef2.current.scrollBy({ left: -350, behavior: "smooth" });
    }
  };

  const scrollRight2 = () => {
    if (scrollRef2.current) {
      scrollRef2.current.scrollBy({ left: 350, behavior: "smooth" });
    }
  };

  const renderVenueCard = (venue) => {
    const venuePrice = venue.price || (800 + (venue.id * 130) % 1000);
    return (
      <div
        key={venue.id}
        className="w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)] flex-shrink-0 snap-start bg-white dark:bg-[#0f172a] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-800 flex flex-col group cursor-pointer"
        onClick={() => navigate(`/venues/${venue.id}`, { state: { venue: { ...venue, price: venuePrice } } })}
      >
        <div className="relative h-[240px] sm:h-[350px] md:h-[400px] w-full overflow-hidden">
          <ImageWithLoader
            src={venue.image}
            alt={venue.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.src = "/assets/venues/turf-1.webp"; // Fallback image
            }}
          />

          {/* Bottom Overlay & Text */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pt-16 pb-2.5 px-2.5 z-10 flex items-end justify-between gap-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-start gap-3 mb-1.5 w-full whitespace-nowrap text-[9px] sm:text-[10px] leading-none">
                <span className="!text-white font-extrabold tracking-wider uppercase drop-shadow-sm shrink-0 mt-0.5">
                  {venue.sports}
                </span>
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <div className="flex items-center gap-0.5 text-white font-semibold">
                    <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400 shrink-0" />
                    <span>{venue.rating.toFixed(1)}</span>
                    <span className="text-white/70 font-medium ml-0.5">({venue.reviews || Math.floor(40 + (venue.id * 13) % 200)})</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setReviewModalData({ id: venue.id, name: venue.name });
                    }}
                    className="flex items-center gap-1 text-[9px] text-white hover:text-white/80 font-medium cursor-pointer leading-none transition-transform duration-200 hover:scale-110"
                  >
                    Review <PenLine className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 w-full">
                <h3 className="text-white font-bold text-[12px] sm:text-[14px] leading-snug line-clamp-2">
                  {venue.name}
                </h3>
                <span className="text-white/80 text-[9px] sm:text-[11px] font-medium truncate">
                  {typeof venue.location === 'object' ? (venue.location?.city || venue.location?.address || 'Location unavailable') : venue.location}
                </span>
              </div>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/venues/${venue.id}`, { state: { venue: { ...venue, price: venuePrice } } });
              }}
              className="bg-transparent text-white border border-white/40 hover:bg-white/10 hover:border-white hover:text-white font-bold rounded-lg h-7 px-2 text-[10px] sm:text-[11px] transition-colors shadow-none shrink-0"
            >
              Book Slot
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const getVenueSubImages = (venue) => {
    if (venue.images && Array.isArray(venue.images) && venue.images.length >= 3) {
      return venue.images.slice(0, 3);
    }

    const sportsGallery = {
      FOOTBALL: [
        "/assets/venues/elite_turf_football.png",
        "/assets/venues/new_football_turf.png",
        "/assets/venues/champions_sports_arena_football.jpg",
        "/assets/venues/new_football_turf_2.png",
      ],
      CRICKET: [
        "/assets/venues/new_cricket_turf.png",
        "/assets/venues/metro_sports_park_cricket.jpg",
        "/assets/venues/new_cricket_turf_2.png",
        "/assets/venues/turf-2.webp",
      ],
      BADMINTON: [
        "/assets/venues/grand_playfield_badminton.png",
        "/assets/venues/new_badminton_turf.png",
        "/assets/sports/cat-badminton.webp",
        "/assets/venues/turf-3.webp",
      ],
      TENNIS: [
        "/assets/venues/new_tennis_turf.png",
        "/assets/sports/cat-tennis.webp",
        "/assets/venues/turf-4.webp",
        "/assets/sports/cat-padel.webp",
      ],
      VOLLEYBALL: [
        "/assets/venues/new_volleyball_turf.png",
        "/assets/sports/cat-basketball.webp",
        "/assets/venues/turf-6.webp",
        "/assets/sports/cat-swimming.webp",
      ],
    };

    const sportKey = venue.sports ? venue.sports.toUpperCase() : "FOOTBALL";
    const pool = sportsGallery[sportKey] || [
      "/assets/venues/turf-1.webp",
      "/assets/venues/turf-2.webp",
      "/assets/venues/turf-3.webp",
      "/assets/venues/turf-4.webp",
      "/assets/venues/turf-5.webp",
      "/assets/venues/turf-6.webp",
    ];

    const subImages = [];
    const offset = (venue.id * 3) % pool.length;

    for (let idx = 0; idx < pool.length; idx++) {
      const candidate = pool[(offset + idx) % pool.length];
      if (candidate !== venue.image && !subImages.includes(candidate)) {
        subImages.push(candidate);
      }
      if (subImages.length === 3) break;
    }

    const globalFallback = [
      "/assets/venues/turf-1.webp",
      "/assets/venues/turf-2.webp",
      "/assets/venues/turf-3.webp",
      "/assets/venues/turf-4.webp",
      "/assets/venues/turf-5.webp",
      "/assets/venues/turf-6.webp",
    ];

    let fallbackIdx = 0;
    while (subImages.length < 3 && fallbackIdx < globalFallback.length) {
      const fb = globalFallback[fallbackIdx];
      if (fb !== venue.image && !subImages.includes(fb)) {
        subImages.push(fb);
      }
      fallbackIdx++;
    }

    return subImages;
  };

  const renderHorizontalVenueCard = (venue) => {
    const venuePrice = venue.price || (800 + (venue.id * 130) % 1000);
    const subImages = getVenueSubImages(venue);

    return (
      <div
        key={venue.id}
        className="relative w-full bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/80 group cursor-pointer"
        onClick={() => navigate(`/venues/${venue.id}`, { state: { venue: { ...venue, price: venuePrice } } })}
      >
        {/* DESKTOP LAYOUT (Hidden on mobile) */}
        <div className="hidden md:flex flex-row w-full h-[145px] sm:h-[185px] md:h-[240px] lg:h-[280px]">
          {/* Left Side: Main Image */}
          <div className="relative w-full md:w-[48%] lg:w-[50%] shrink-0 ml-[0.5cm] my-1.5 sm:my-2 rounded-xl overflow-hidden">
            <ImageWithLoader
              src={venue.image}
              alt={venue.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.src = "/assets/venues/turf-1.webp"; // Fallback image
              }}
            />
            {/* Overlay for Name text at the bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 sm:p-4 md:p-5">
              <h3 className="text-white font-bold text-sm sm:text-base md:text-lg lg:text-xl leading-tight line-clamp-1 drop-shadow-lg">
                {venue.name}
              </h3>
            </div>
          </div>

          {/* Right Side: Details & Sub-images */}
          <div className="flex flex-1 flex-row w-full md:w-[52%] lg:w-[50%] gap-2 sm:gap-3 pl-1.5 sm:pl-2 min-w-0">
            {/* Left Column in Right Side: 3 Sub-images */}
            <div className="flex flex-col w-[52%] sm:w-[240px] lg:w-[290px] shrink-0 py-0.5 sm:py-1 gap-1">
              {subImages.map((subImg, idx) => (
                <div key={idx} className="flex-1 rounded-sm overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 relative">
                  <ImageWithLoader
                    src={subImg}
                    alt={`${venue.name} view ${idx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>

            {/* Right Column in Right Side: Info & Button */}
            <div className="flex flex-col flex-1 justify-between py-3 sm:py-4 pr-6 sm:pr-8 min-w-0">
              {/* Top: Stars & Sport */}
              <div className="space-y-1">
                <div className="flex items-center justify-end gap-1.5 w-full">
                  <span className="text-foreground/60 font-extrabold tracking-wider uppercase text-[9px] sm:text-[10px]">
                    {venue.sports}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-0.5 mt-0.5">
                  <div className="flex items-center justify-end gap-1 text-slate-800 dark:text-slate-200 font-semibold text-[10px] sm:text-xs">
                    <span>{venue.rating.toFixed(1)}</span>
                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                    <span className="text-slate-500 font-medium">({venue.reviews || Math.floor(40 + (venue.id * 13) % 200)})</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setReviewModalData({ id: venue.id, name: venue.name });
                    }}
                    className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium cursor-pointer leading-none transition-transform duration-200 hover:scale-110"
                  >
                    Review <PenLine className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Middle: Address */}
              <div className="flex flex-col items-end text-right my-2">
                <div className="text-slate-600 dark:text-slate-400 text-[10px] sm:text-xs font-medium line-clamp-2 flex items-start justify-end gap-1 w-full max-w-[200px]">
                  {typeof venue.location === 'object' ? (venue.location?.city || venue.location?.address || 'Location unavailable') : venue.location}
                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mt-0.5 text-slate-400" />
                </div>
              </div>

              {/* Bottom: Button */}
              <div className="flex justify-end mt-auto">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/venues/${venue.id}`, { state: { venue: { ...venue, price: venuePrice } } });
                  }}
                  className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-[#0f172a] hover:border-emerald-600 dark:hover:border-emerald-500 font-bold rounded-lg h-8 sm:h-9 px-4 sm:px-6 text-[10px] sm:text-xs transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-none cursor-pointer"
                >
                  Book Slot
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE LAYOUT (Hidden on desktop) */}
        <div className="flex flex-col md:hidden w-full">
          {/* Hero Image */}
          <div className="relative w-full h-[220px]">
            <ImageWithLoader
              src={venue.image}
              alt={venue.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "/assets/venues/turf-1.webp"; // Fallback image
              }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

            {/* Sport Badge & Heart Icon */}
            <div className="absolute top-3 left-3 bg-[#0d4d35]/80 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-full text-[9px] font-extrabold flex items-center gap-1.5 tracking-wider">
              <Dribbble className="w-3 h-3 text-white/80" />
              {venue.sports?.toUpperCase() || "FOOTBALL"}
            </div>
            <button
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm border border-white/20"
              onClick={(e) => { e.stopPropagation(); /* Add favorite logic here if needed */ }}
            >
              <Heart className="w-4 h-4 text-white" />
            </button>

            {/* Name, Rating, Location */}
            <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1.5">
              <h3 className="text-white font-bold text-xl leading-tight line-clamp-1 drop-shadow-md">
                {venue.name}
              </h3>
              <div className="flex items-start justify-between w-full">
                <div className="flex flex-col gap-0.5 items-start">
                  <div className="flex items-center gap-1">
                    <span className="text-white font-bold text-sm">{venue.rating.toFixed(1)}</span>
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                    <span className="text-white/80 text-xs ml-0.5">({venue.reviews || Math.floor(40 + (venue.id * 13) % 200)} Reviews)</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setReviewModalData({ id: venue.id, name: venue.name });
                    }}
                    className="flex items-center gap-1 text-[10px] text-white hover:text-white/80 font-medium cursor-pointer leading-none mt-0.5 transition-transform duration-200 hover:scale-110"
                  >
                    Review <PenLine className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="flex items-center justify-end gap-1 text-xs text-white/90 mt-0.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate max-w-[140px]">{typeof venue.location === 'object' ? (venue.location?.city || venue.location?.address || 'Location unavailable') : venue.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub images */}
          <div className="flex flex-row w-full gap-2 p-3 pb-2">
            {subImages.map((subImg, idx) => (
              <div key={idx} className="flex-1 aspect-[16/9] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 relative shadow-sm">
                <ImageWithLoader
                  src={subImg}
                  alt={`${venue.name} view ${idx + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Amenities Row */}
          <div className="flex flex-row items-center justify-around px-4 py-3 border-t border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">11-A-Side</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Flood Lights</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Bath className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Changing Room</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <MoreHorizontal className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">See More</span>
            </div>
          </div>

          {/* Book Slot Button */}
          <div className="p-3">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/venues/${venue.id}`, { state: { venue: { ...venue, price: venuePrice } } });
              }}
              className="w-full flex items-center justify-center bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-[#0f172a] hover:border-emerald-600 dark:hover:border-emerald-500 rounded-lg h-11 font-bold text-sm shadow-sm transition-all duration-200 cursor-pointer"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Book Slot
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-[#f8faf9] dark:bg-[#020617] min-h-screen pb-10 pt-2 px-4 md:px-8">
      {isLoading ? (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mb-4" />
          <p className="text-slate-500 font-medium animate-pulse">Loading turfs...</p>
        </div>
      ) : (
        <div className="max-w-[1440px] mx-auto flex flex-col gap-4">

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header Section */}
            <div className="flex items-end justify-between mb-3">
              <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={() => navigate(-1)} className="flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer text-slate-900 dark:text-white border-none bg-transparent">
                  <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <h2 className="text-base sm:text-lg md:text-[25px] font-semibold text-slate-900 dark:text-white tracking-tight">
                  Recommended Venues
                </h2>
                {/* Quick Filters Toggle Button & Dropdown */}
                <div className="relative z-40" ref={filterContainerRef}>
                  <Button
                    onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                    className="w-fit bg-white/90 dark:bg-[#0f172a]/80 text-slate-800 dark:text-white border border-slate-200/80 dark:border-slate-800 rounded-md h-10 font-bold shadow-2xs flex items-center justify-between px-4 hover:bg-white dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 backdrop-blur-xl cursor-pointer text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-2 mr-2">
                      <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Quick Filters</span>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", isMobileFilterOpen ? "rotate-180 text-emerald-600" : "")} />
                  </Button>

                  <AnimatePresence>
                    {isMobileFilterOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 md:left-0 md:right-auto top-full mt-1.5 w-[160px] sm:w-[170px] z-50 origin-top-right md:origin-top-left"
                      >
                        <div className="w-full bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 shadow-xl backdrop-blur-xl">
                          <div className="flex flex-col w-full divide-y divide-slate-100 dark:divide-slate-800/80">

                            {/* SPORT Section */}
                            <div className="w-full px-3.5 py-2.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                              <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">SPORT</h4>
                              <CustomSelect
                                value={selectedSport}
                                onChange={(val) => setSelectedSport(val)}
                                options={sportsList}
                                variant="clean"
                              />
                            </div>

                            {/* PRICE Section */}
                            <div className="w-full px-3.5 py-2.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                              <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">PRICE</h4>
                              <CustomSelect
                                value={sortByPrice}
                                onChange={(val) => {
                                  setSortByPrice(val);
                                  setSortField("Price");
                                }}
                                options={["Low to High", "High to Low"]}
                                variant="clean"
                              />
                            </div>

                            {/* RATING Section */}
                            <div className="w-full px-3.5 py-2.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                              <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">RATING</h4>
                              <CustomSelect
                                value={sortByRating}
                                onChange={(val) => {
                                  setSortByRating(val);
                                  setSortField("Rating");
                                }}
                                options={["High to Low", "Low to High"]}
                                variant="clean"
                              />
                            </div>

                            {/* Reset Filters Section */}
                            <div className="w-full">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSport("All Sports");
                                  setSelectedLocation("All Cities");
                                  setSortByPrice("Low to High");
                                  setSortByRating("High to Low");
                                  setSortField("Price");
                                  localStorage.setItem("preferred-city", "All Cities");
                                  window.dispatchEvent(new CustomEvent("preferredCityChanged", { detail: "All Cities" }));
                                }}
                                className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 group"
                              >
                                <RotateCcw className="w-3.5 h-3.5 opacity-70 group-hover:-rotate-90 transition-transform duration-300 text-emerald-600 dark:text-emerald-400" />
                                <span>Reset Filters</span>
                              </button>
                            </div>

                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <Link
                to="/venues"
                className="flex items-center gap-1 text-[#059669] font-semibold text-sm hover:underline"
              >
                See All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Recommended Venues Slider */}
            <div className="relative group/section">
              {premiumVenues.length > 2 && (
                <button
                  onClick={scrollLeft1}
                  aria-label="Scroll left"
                  className={getArrowClass(premiumVenues, "left")}
                >
                  <ChevronLeft120 className="h-8 w-8 md:h-10 md:w-10 text-slate-900 dark:text-white" strokeWidth={1.5} />
                </button>
              )}

              <div
                ref={scrollRef1}
                className="flex snap-x snap-mandatory overflow-x-auto gap-3 pb-6 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {premiumVenues.length > 0 ? (
                  premiumVenues.map(renderVenueCard)
                ) : (
                  <div className="w-full py-16 flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No recommended venues found</h3>
                  </div>
                )}
              </div>

              {premiumVenues.length > 2 && (
                <button
                  onClick={scrollRight1}
                  aria-label="Scroll right"
                  className={getArrowClass(premiumVenues, "right")}
                >
                  <ChevronRight120 className="h-8 w-8 md:h-10 md:w-10 text-slate-900 dark:text-white" strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* Explore Other Venues Header */}
            <div className="flex items-end justify-between mt-2 mb-3">
              <div>
                <h2 className="text-xl md:text-[25px] font-semibold text-slate-900 dark:text-white tracking-tight">
                  All Venues
                </h2>
              </div>
            </div>

            {/* Explore Other Venues List */}
            <div className="flex flex-col gap-2.5 pb-8">
              {otherVenues.length > 0 ? (
                otherVenues.map(renderHorizontalVenueCard)
              ) : (
                <div className="w-full py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No venues found</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[260px]">
                    We couldn't find any {selectedSport !== "All Sports" ? selectedSport : "sports"} venues in {selectedLocation}. Try adjusting your filters.
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedSport("All Sports");
                      setSelectedLocation("All Cities");
                    }}
                    variant="outline"
                    className="mt-6 border-slate-200 dark:border-slate-800 dark:text-white bg-transparent"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setReviewModalData(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Review {reviewModalData.name}
                </h3>
                <button
                  onClick={() => setReviewModalData(null)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Rate your experience</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star
                          className={cn(
                            "w-8 h-8",
                            (hoverRating || reviewRating) >= star
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300 dark:text-slate-700"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Your Review
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us about your experience..."
                    className="w-full h-28 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setReviewModalData(null)}
                  className="bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReviewSubmit}
                  disabled={isSubmittingReview || reviewRating === 0}
                  className="bg-transparent text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-bold"
                >
                  {isSubmittingReview ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Submit Review
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


