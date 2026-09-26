import { useRef, useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Star, MapPin, ChevronRight, Filter, ChevronLeft, ChevronDown, Check, RotateCcw, Heart, CalendarDays, Users, Lightbulb, Bath, Car, MoreHorizontal, Dribbble, Loader2, ArrowLeft, X, PenLine, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { cn } from "../components/ui/utils";
import { Button } from "../components/ui/button";
import { adminApi } from "../services/admin-api";
import { fastCache } from "../services/fast-cache";

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
  const [reviewSubmittedSuccess, setReviewSubmittedSuccess] = useState(false);
  const [submittedReviewData, setSubmittedReviewData] = useState(null);

  const handleOpenReviewModal = (venue) => {
    setReviewModalData({ id: venue.id, name: venue.name });
    setReviewSubmittedSuccess(false);
    setSubmittedReviewData(null);
    setReviewRating(0);
    setHoverRating(0);
    setReviewText("");
  };

  const handleCloseReviewModal = () => {
    setReviewModalData(null);
    setReviewSubmittedSuccess(false);
    setSubmittedReviewData(null);
    setReviewRating(0);
    setHoverRating(0);
    setReviewText("");
  };

  const [turfs, setTurfs] = useState(() => {
    try {
      const cached = fastCache.get("/api/admin/turfs");
      return (cached && Array.isArray(cached.data)) ? cached.data : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(() => turfs.length === 0);

  const fetchTurfs = async () => {
    try {
      if (turfs.length === 0) setIsLoading(true);
      const data = await adminApi.getAll("turfs");
      setTurfs(data || []);
    } catch (err) {
      console.error("Error loading turfs from MySQL database:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTurfs();
  }, []);

  const handleReviewSubmit = async () => {
    if (reviewRating === 0) {
      toast.error("Please select a rating.");
      return;
    }
    try {
      setIsSubmittingReview(true);
      const userObj = JSON.parse(localStorage.getItem("playerUser") || "{}");
      const authorName = userObj.name || userObj.fullName || localStorage.getItem("userName") || "SportX Athlete";
      const reviewDate = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      const commentText = reviewText.trim() || "Great sports experience!";

      const payload = {
        user_name: authorName,
        turf_name: reviewModalData?.name || "Sports Arena",
        rating: reviewRating,
        comment: commentText,
        date: reviewDate,
      };

      const res = await fetch("/api/turf/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json().catch(() => null);
      const createdReview = responseData?.data || payload;

      setSubmittedReviewData(createdReview);
      setReviewSubmittedSuccess(true);
      toast.success("Thank you! Your review has been submitted.");

      // Refresh turf list in background so ratings and counts update immediately
      fetchTurfs();
    } catch (e) {
      console.error(e);
      toast.error("Failed submitting review. Please try again.");
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
      setSelectedLocation(e.detail || "All Cities");
    };
    window.addEventListener("preferredCityChanged", handleCityChange);
    return () => window.removeEventListener("preferredCityChanged", handleCityChange);
  }, []);

  useEffect(() => {
    if (location.state?.sport) {
      setSelectedSport(location.state.sport);
    }
  }, [location.state?.sport]);

function extractImageSrc(val) {
  if (!val) return "";
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        return parsed.data || parsed.url || parsed.preview || parsed.name || "";
      } catch (e) {}
    }
    return trimmed;
  }
  if (typeof val === "object" && val !== null) {
    return val.data || val.url || val.preview || val.name || "";
  }
  return "";
}

  const dynamicVenues = useMemo(() => {
    return turfs.map((t) => {
      let galleryList = [];
      if (t.gallery) {
        try {
          let parsed = t.gallery;
          while (typeof parsed === "string") {
            try {
              parsed = JSON.parse(parsed);
            } catch {
              break;
            }
          }
          if (Array.isArray(parsed)) {
            galleryList = parsed
              .map((img) => extractImageSrc(img))
              .filter(Boolean);
          }
        } catch {}
      }
      
      const singleCover = extractImageSrc(t.image_url || t.image);
      if (galleryList.length === 0 && singleCover) {
        galleryList = [singleCover];
      } else if (singleCover && !galleryList.includes(singleCover)) {
        galleryList = [singleCover, ...galleryList];
      }

      const mainImage = galleryList[0] || singleCover || "/assets/venues/turf-1.webp";

      return {
        id: t.id,
        name: t.name,
        location: typeof t.location === "string" ? t.location : (t.location?.city || t.location?.address || "Local Arena"),
        price: Number(t.price_per_hour !== undefined ? t.price_per_hour : (t.price !== undefined ? t.price : 1500)),
        rating: Number(t.rating !== undefined && t.rating !== null ? t.rating : 0),
        sports: (t.sport_type || t.sportType || t.sports || t.sport || "Football").toUpperCase(),
        image: mainImage,
        gallery: galleryList,
        images: galleryList,
        badge: t.status === "Active" ? "VERIFIED" : "FEATURED",
        reviews: Number(t.reviews ?? t.reviews_count ?? 0),
        status: t.status || "Active",
        display_order: Number(t.display_order || 0),
        all_display_order: Number(t.all_display_order || 0),
        description: t.description,
        amenities: t.amenities,
        rules: t.rules,
      };
    });
  }, [turfs]);

  const sportsList = useMemo(() => {
    const list = ["All Sports"];
    const seen = new Set(["all sports"]);
    
    // Add all sports from turfs in DB
    (turfs || []).forEach((t) => {
      const raw = t.sport_type || t.sportType || t.sports || t.sport || "";
      const parts = String(raw).split(/[,•;/]+/).map((s) => s.trim()).filter(Boolean);
      parts.forEach((p) => {
        if (p.toLowerCase() === "multi-sport" || p.toLowerCase() === "multisport") return;
        if (!seen.has(p.toLowerCase())) {
          seen.add(p.toLowerCase());
          list.push(p);
        }
      });
    });

    const standard = ["Football", "Cricket", "Box Cricket", "Badminton", "Tennis", "Basketball", "Swimming", "Volleyball", "Table Tennis", "Pickleball", "Padel", "Squash", "Box MMA", "Kabaddi", "Hockey"];
    standard.forEach((s) => {
      if (!seen.has(s.toLowerCase())) {
        seen.add(s.toLowerCase());
        list.push(s);
      }
    });

    return list;
  }, [turfs]);

  const dynamicCitiesList = useMemo(() => {
    const list = ["All Cities"];
    const seen = new Set(["all cities", "all", "all areas"]);
    
    // 1. Add onboarded cities from turfs in database
    (turfs || []).forEach((t) => {
      const raw = typeof t.location === "string" ? t.location : (t.location?.city || t.location?.address || "");
      const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
      parts.forEach((p) => {
        const lower = p.toLowerCase();
        if (!seen.has(lower) && lower.length > 2 && !["unknown location", "location not specified", "null", "undefined", "n/a", "none"].includes(lower)) {
          seen.add(lower);
          list.push(p.charAt(0).toUpperCase() + p.slice(1));
        }
      });
    });

    // 2. Add standard major cities
    const standard = ["Pune", "Mumbai", "Nagpur", "Pimpri-Chinchwad", "Bengaluru", "Delhi-NCR", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Kochi"];
    standard.forEach((c) => {
      if (!seen.has(c.toLowerCase())) {
        seen.add(c.toLowerCase());
        list.push(c);
      }
    });

    return list;
  }, [turfs]);

  // Helper matching functions
  const isCityMatch = (venueLoc, filterCity) => {
    if (!filterCity || filterCity === "All Cities" || filterCity === "All" || filterCity === "All Areas") return true;

    const normalize = (str) =>
      String(str || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    let vNorm = normalize(venueLoc);
    let fNorm = normalize(filterCity);

    if (!vNorm) return false;
    if (fNorm.startsWith("all ")) {
      fNorm = fNorm.replace(/^all\s+/, "").trim();
      if (!fNorm || fNorm === "cities" || fNorm === "areas") return true;
    }

    if (vNorm === fNorm) return true;

    // Split both by commas/separators to extract locality and city components
    const filterParts = String(filterCity)
      .split(/[,•;/|]+/)
      .map((p) => normalize(p))
      .filter((p) => p.length > 0 && p !== "all" && p !== "all areas" && p !== "all cities");

    const venueParts = String(venueLoc)
      .split(/[,•;/|]+/)
      .map((p) => normalize(p))
      .filter((p) => p.length > 0);

    if (filterParts.length === 0) return true;

    // If filter specifies a specific locality (e.g. "Koregaon Park" in "Koregaon Park, Pune")
    if (filterParts.length > 1) {
      const filterPrimary = filterParts[0].replace(/^all\s+/, "").trim();
      const matchesPrimary = vNorm.includes(filterPrimary) || venueParts.some((vp) => vp.includes(filterPrimary) || filterPrimary.includes(vp));
      return matchesPrimary;
    }

    // If filter only has 1 part (e.g. "Pune" or "Koregaon Park"):
    const singleFilter = filterParts[0].replace(/^all\s+/, "").trim();
    if (vNorm.includes(singleFilter) || singleFilter.includes(vNorm)) return true;
    for (const vPart of venueParts) {
      if (vPart.includes(singleFilter) || singleFilter.includes(vPart)) return true;
    }

    return false;
  };

  const isSportMatch = (venueSports, venueDesc, filterSport) => {
    if (!filterSport || filterSport === "All Sports") return true;
    const vSports = (venueSports || "").toLowerCase();
    const fSport = filterSport.toLowerCase();
    const vDesc = (venueDesc || "").toLowerCase();
    return vSports.includes(fSport) || fSport.includes(vSports) || vDesc.includes(fSport);
  };

  // 1. Venues matching sport filter
  const sportMatchedVenues = useMemo(() => {
    return dynamicVenues.filter((venue) => isSportMatch(venue.sports, venue.description, selectedSport));
  }, [dynamicVenues, selectedSport]);

  // 2. Venues matching both sport and city filter
  const strictMatchedVenues = useMemo(() => {
    return sportMatchedVenues.filter((venue) => isCityMatch(venue.location, selectedLocation));
  }, [sportMatchedVenues, selectedLocation]);

  // Final venues to display strictly matching selected location
  const venuesToDisplay = strictMatchedVenues;

  // Apply Price / Rating sort
  const sortedVenues = useMemo(() => {
    return [...venuesToDisplay].sort((a, b) => {
      if (sortField === "Price") {
        return sortByPrice === "Low to High" ? a.price - b.price : b.price - a.price;
      } else if (sortField === "Rating") {
        return sortByRating === "High to Low" ? b.rating - a.rating : a.rating - b.rating;
      }
      return 0;
    });
  }, [venuesToDisplay, sortField, sortByPrice, sortByRating]);

  // Recommended Venues (Section #1): Sorted by display_order set in Dashboard (or by most reviews if default)
  const premiumVenues = useMemo(() => {
    return [...sortedVenues].sort((a, b) => {
      const hasOrderA = Number(a.display_order) > 0;
      const hasOrderB = Number(b.display_order) > 0;
      if (hasOrderA && hasOrderB) {
        return Number(a.display_order) - Number(b.display_order);
      }
      if (hasOrderA) return -1;
      if (hasOrderB) return 1;
      const revA = Number(String(a.reviews ?? a.reviews_count ?? 0).replace(/[^0-9.]/g, "")) || 0;
      const revB = Number(String(b.reviews ?? b.reviews_count ?? 0).replace(/[^0-9.]/g, "")) || 0;
      if (revB !== revA) return revB - revA;
      const ratA = Number(String(a.rating ?? 0).replace(/[^0-9.]/g, "")) || 0;
      const ratB = Number(String(b.rating ?? 0).replace(/[^0-9.]/g, "")) || 0;
      if (ratB !== ratA) return ratB - ratA;
      return Number(b.id || 0) - Number(a.id || 0);
    });
  }, [sortedVenues]);

  // All Venues (Section #2): Sorted by all_display_order set in Dashboard (or by most reviews if default)
  const otherVenues = useMemo(() => {
    return [...sortedVenues].sort((a, b) => {
      const hasOrderA = Number(a.all_display_order) > 0;
      const hasOrderB = Number(b.all_display_order) > 0;
      if (hasOrderA && hasOrderB) {
        return Number(a.all_display_order) - Number(b.all_display_order);
      }
      if (hasOrderA) return -1;
      if (hasOrderB) return 1;
      const revA = Number(String(a.reviews ?? a.reviews_count ?? 0).replace(/[^0-9.]/g, "")) || 0;
      const revB = Number(String(b.reviews ?? b.reviews_count ?? 0).replace(/[^0-9.]/g, "")) || 0;
      if (revB !== revA) return revB - revA;
      const ratA = Number(String(a.rating ?? 0).replace(/[^0-9.]/g, "")) || 0;
      const ratB = Number(String(b.rating ?? 0).replace(/[^0-9.]/g, "")) || 0;
      if (ratB !== ratA) return ratB - ratA;
      return Number(b.id || 0) - Number(a.id || 0);
    });
  }, [sortedVenues]);

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
    const venuePrice = venue.price !== undefined && !isNaN(venue.price) ? venue.price : (800 + (venue.id * 130) % 1000);
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
                    {venue.reviews > 0 && Number(venue.rating) > 0 ? (
                      <>
                        <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400 shrink-0" />
                        <span>{Number(venue.rating).toFixed(1)}</span>
                        <span className="text-white/70 font-medium ml-0.5">({venue.reviews})</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-2.5 h-2.5 text-white/40 shrink-0" />
                        <span className="text-[10px] text-white/80 font-medium">New</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenReviewModal(venue);
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
    let list = [];
    if (venue.gallery && Array.isArray(venue.gallery) && venue.gallery.length > 0) {
      list = venue.gallery.map(img => extractImageSrc(img)).filter(Boolean);
    } else if (venue.images && Array.isArray(venue.images) && venue.images.length > 0) {
      list = venue.images.map(img => extractImageSrc(img)).filter(Boolean);
    } else if (venue.image) {
      const single = extractImageSrc(venue.image);
      if (single) list = [single];
    }

    // Filter unique valid images
    const uniqueImages = Array.from(new Set(list));

    // If venue has 2 or more distinct uploaded photos:
    if (uniqueImages.length >= 2) {
      // Secondary photos (excluding the main cover image at index 0)
      const secondary = uniqueImages.slice(1);
      const result = [];
      for (let i = 0; i < 3; i++) {
        result.push(secondary[i % secondary.length]);
      }
      return result;
    }

    // If only 1 image (or none) was uploaded, display 3 distinct themed angle views rather than repeating the single cover photo 3 times
    return [
      "/assets/venues/turf-2.webp",
      "/assets/venues/turf-3.webp",
      "/assets/venues/new_football_turf_2.png",
    ];
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
                    {venue.reviews > 0 && Number(venue.rating) > 0 ? (
                      <>
                        <span>{Number(venue.rating).toFixed(1)}</span>
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                        <span className="text-slate-500 font-medium">({venue.reviews})</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                        <span className="text-slate-500 font-medium">New</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenReviewModal(venue);
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
                    {venue.reviews > 0 && Number(venue.rating) > 0 ? (
                      <>
                        <span className="text-white font-bold text-sm">{Number(venue.rating).toFixed(1)}</span>
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                        <span className="text-white/80 text-xs ml-0.5">({venue.reviews} Reviews)</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-3.5 h-3.5 text-white/40 shrink-0" />
                        <span className="text-white/80 text-xs ml-0.5">New (0 reviews)</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenReviewModal(venue);
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

                            {/* LOCATION / CITY Section */}
                            <div className="w-full px-3.5 py-2.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                              <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">LOCATION</h4>
                              <CustomSelect
                                value={selectedLocation}
                                onChange={(val) => {
                                  setSelectedLocation(val);
                                  localStorage.setItem("preferred-city", val);
                                  window.dispatchEvent(new CustomEvent("preferredCityChanged", { detail: val }));
                                }}
                                options={dynamicCitiesList}
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
                onClick={() => {
                  setSelectedSport("All Sports");
                  setSelectedLocation("All Cities");
                  localStorage.setItem("preferred-city", "All Cities");
                  window.dispatchEvent(new CustomEvent("preferredCityChanged", { detail: "All Cities" }));
                }}
                className="flex items-center gap-1 text-[#059669] font-semibold text-sm hover:underline cursor-pointer"
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
                  <div className="w-full py-8 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      No recommended {selectedSport !== "All Sports" ? selectedSport : ""} turfs found in {selectedLocation}.
                    </p>
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
                <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-white/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-8 my-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Turfs Available</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[340px] leading-relaxed">
                    We couldn't find any {selectedSport !== "All Sports" ? selectedSport : ""} turfs in <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedLocation}</span>. Try choosing another area or clearing your filters.
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedSport("All Sports");
                      setSelectedLocation("All Cities");
                      localStorage.setItem("preferred-city", "All Cities");
                      window.dispatchEvent(new CustomEvent("preferredCityChanged", { detail: "All Cities" }));
                    }}
                    variant="outline"
                    className="mt-6 border-slate-200 dark:border-slate-800 dark:text-white bg-white dark:bg-slate-900 hover:border-emerald-500 hover:text-emerald-600 transition-all font-semibold rounded-xl shadow-xs cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
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
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseReviewModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800"
            >
              {reviewSubmittedSuccess && submittedReviewData ? (
                /* REVIEW SUBMITTED SUCCESS VIEW */
                <div className="flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        Review Submitted
                      </h3>
                    </div>
                    <button
                      onClick={handleCloseReviewModal}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-5 sm:p-6 flex flex-col items-center text-center gap-4">
                    {/* Animated Check Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15, stiffness: 200 }}
                      className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10"
                    >
                      <CheckCircle2 className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
                    </motion.div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                        Thank You for Your Feedback!
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                        Your review for <span className="font-semibold text-slate-800 dark:text-slate-200">{reviewModalData?.name}</span> has been published successfully.
                      </p>
                    </div>

                    {/* Submitted Review Card Preview */}
                    <div className="w-full bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4 text-left space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 font-black text-sm flex items-center justify-center uppercase">
                            {(submittedReviewData.user_name || "A")[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                {submittedReviewData.user_name || "SportX Athlete"}
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 uppercase">
                                YOU
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {submittedReviewData.date || "Today"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {Number(submittedReviewData.rating || 5).toFixed(1)}
                          </span>
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed">
                        "{submittedReviewData.comment || "Great sports experience!"}"
                      </p>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-900/40">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const venueId = reviewModalData?.id;
                        handleCloseReviewModal();
                        if (venueId) {
                          navigate(`/venues/${venueId}`);
                        }
                      }}
                      className="text-xs font-semibold border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 cursor-pointer"
                    >
                      View Venue Details
                    </Button>
                    <Button
                      onClick={handleCloseReviewModal}
                      className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 !text-white hover:!text-white active:!text-white border-none cursor-pointer shadow-sm"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                /* REVIEW FORM VIEW */
                <div className="flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Review {reviewModalData.name}
                    </h3>
                    <button
                      onClick={handleCloseReviewModal}
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
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setReviewRating(star)}
                            className="p-1 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
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
                      {(hoverRating || reviewRating) > 0 && (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hoverRating || reviewRating]} ({hoverRating || reviewRating}.0)
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Your Review
                      </label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Write your review here... (e.g. Clean turf, punctual slot timing, excellent floodlights)"
                        className="w-full h-28 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-slate-50/50 dark:bg-slate-900/40">
                    <Button
                      variant="outline"
                      onClick={handleCloseReviewModal}
                      className="bg-transparent text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReviewSubmit}
                      disabled={isSubmittingReview || reviewRating === 0}
                      className="bg-emerald-600 hover:bg-emerald-700 !text-white hover:!text-white active:!text-white font-bold text-xs cursor-pointer shadow-sm border-none disabled:opacity-50"
                    >
                      {isSubmittingReview ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Submit Review
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


