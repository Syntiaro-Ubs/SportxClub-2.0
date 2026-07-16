import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../providers/auth-provider";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  ChevronDown,
  Filter,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  TimerReset,
  X,
  User,
  Users
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { cn } from "../components/ui/utils";

const asset = (path) => `/assets${path}`;

const venueData = [
  {
    id: 1,
    name: "Elite Turf Arena",
    location: "Powai, Mumbai",
    city: "Mumbai",
    sport: "Football",
    rating: 4.9,
    reviews: 234,
    price: 1200,
    distance: 1.2,
    availableToday: true,
    availability: "Tonight slots available",
    image: asset("/venues/turf-1.webp"),
    badges: [asset("/venues/badge-top-rated.svg")],
    amenities: ["Flood lights", "Parking", "Verified venue"],
  },
  {
    id: 2,
    name: "Metro Sports Park",
    location: "Bandra West, Mumbai",
    city: "Mumbai",
    sport: "Cricket",
    rating: 4.8,
    reviews: 189,
    price: 950,
    distance: 2.5,
    availableToday: true,
    availability: "Few evening slots left",
    image: asset("/venues/turf-2.webp"),
    badges: [asset("/venues/badge-new.svg")],
    amenities: ["Wi-Fi", "Shower", "Secure payments"],
  },
  {
    id: 3,
    name: "Grand Playfield",
    location: "Andheri East, Mumbai",
    city: "Mumbai",
    sport: "Badminton",
    rating: 5.0,
    reviews: 92,
    price: 1500,
    distance: 3.8,
    availableToday: false,
    availability: "Morning slots only",
    image: asset("/venues/turf-3.webp"),
    badges: [asset("/venues/badge-top-rated.svg")],
    amenities: ["Pro lighting", "Parking", "Real reviews"],
  },
  {
    id: 4,
    name: "Victory Greens",
    location: "Juhu, Mumbai",
    city: "Mumbai",
    sport: "Tennis",
    rating: 4.7,
    reviews: 128,
    price: 1050,
    distance: 4.1,
    availableToday: true,
    availability: "Available after 6 PM",
    image: asset("/venues/turf-4.webp"),
    badges: [asset("/venues/badge-new.svg")],
    amenities: ["Flood lights", "Wi-Fi", "Verified venue"],
  },
  {
    id: 5,
    name: "Pro Match Grounds",
    location: "Thane West, Thane",
    city: "Thane",
    sport: "Football",
    rating: 4.8,
    reviews: 101,
    price: 800,
    distance: 6.6,
    availableToday: true,
    availability: "Prime time available",
    image: asset("/venues/turf-5.webp"),
    badges: [asset("/venues/badge-top-rated.svg")],
    amenities: ["Parking", "Changing room", "Easy refund"],
  },
  {
    id: 6,
    name: "Apex Turf Club",
    location: "Navi Mumbai",
    city: "Navi Mumbai",
    sport: "Basketball",
    rating: 4.9,
    reviews: 76,
    price: 1300,
    distance: 8.4,
    availableToday: false,
    availability: "Next slot tomorrow",
    image: asset("/venues/turf-6.webp"),
    badges: [asset("/venues/badge-new.svg")],
    amenities: ["Flood lights", "Shower", "Secure payments"],
  },
  {
    id: 7,
    name: "Champions Sports Arena",
    location: "Bandra East, Mumbai",
    city: "Mumbai",
    sport: "Football",
    rating: 4.8,
    reviews: 150,
    price: 1100,
    distance: 3.2,
    availableToday: true,
    availability: "Slots available now",
    image: asset("/venues/turf-1.webp"),
    badges: [asset("/venues/badge-top-rated.svg")],
    amenities: ["Flood lights", "Changing room", "Verified venue"],
  },
  {
    id: 8,
    name: "Ace Tennis Academy",
    location: "Powai, Mumbai",
    city: "Mumbai",
    sport: "Tennis",
    rating: 4.9,
    reviews: 95,
    price: 1250,
    distance: 1.5,
    availableToday: true,
    availability: "Evening slots open",
    image: asset("/sports/cat-padel.webp"),
    badges: [asset("/venues/badge-new.svg")],
    amenities: ["Flood lights", "Pro coaching", "Parking"],
  },
  {
    id: 9,
    name: "Super Cricket Club",
    location: "Andheri West, Mumbai",
    city: "Mumbai",
    sport: "Cricket",
    rating: 4.6,
    reviews: 112,
    price: 1000,
    distance: 4.4,
    availableToday: true,
    availability: "Prime slots open",
    image: asset("/venues/turf-2.webp"),
    badges: [asset("/venues/badge-top-rated.svg")],
    amenities: ["Flood lights", "Wi-Fi", "Secure payments"],
  },
  {
    id: 10,
    name: "Smash & Drive Badminton",
    location: "Andheri West, Mumbai",
    city: "Mumbai",
    sport: "Badminton",
    rating: 4.7,
    reviews: 84,
    price: 1400,
    distance: 4.6,
    availableToday: false,
    availability: "Available tomorrow",
    image: asset("/venues/turf-3.webp"),
    badges: [asset("/venues/badge-new.svg")],
    amenities: ["Flood lights", "Locker room", "Real reviews"],
  },
];

const sports = [
  "Football",
  "Cricket",
  "Badminton",
  "Basketball",
  "Tennis",
];
const locations = ["All", "Mumbai", "Thane", "Navi Mumbai"];
const sorts = ["Recommended", "Rating", "Price: Low to High", "Distance"];

export function VenueBooking() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const locationState = useLocation();
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("All");
  const [location, setLocation] = useState(
    () => localStorage.getItem("preferred-city") || "All",
  );

  useEffect(() => {
    if (locationState.state?.search) {
      setQuery(locationState.state.search);
    }
    if (locationState.state?.openFilters) {
      setFilterOpen(true);
    }
  }, [locationState]);

  useEffect(() => {
    const handleCityChange = (e) => {
      const customEvent = e;
      setLocation(customEvent.detail);
    };
    window.addEventListener("preferredCityChanged", handleCityChange);
    return () =>
      window.removeEventListener("preferredCityChanged", handleCityChange);
  }, []);

  const handleLocationChange = (newVal) => {
    setLocation(newVal);
    localStorage.setItem("preferred-city", newVal);
    window.dispatchEvent(
      new CustomEvent("preferredCityChanged", { detail: newVal }),
    );
  };

  const [sortBy, setSortBy] = useState("Recommended");
  const [priceRange, setPriceRange] = useState([700, 1600]);
  const [availabilityOnly, setAvailabilityOnly] = useState(true);
  const [ratingOnly, setRatingOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState("Sort");
  const [modeModalVenue, setModeModalVenue] = useState(null);

  const filteredVenues = useMemo(() => {
    const filtered = venueData.filter((venue) => {
      const matchesQuery =
        !query.trim() ||
        venue.name.toLowerCase().includes(query.toLowerCase()) ||
        venue.location.toLowerCase().includes(query.toLowerCase()) ||
        venue.sport.toLowerCase().includes(query.toLowerCase());
      const matchesSport = sport === "All" || venue.sport === sport;
      const matchesLocation = location === "All" || venue.city === location;
      const matchesPrice =
        venue.price >= priceRange[0] && venue.price <= priceRange[1];
      const matchesAvailability = !availabilityOnly || venue.availableToday;
      const matchesRating = !ratingOnly || venue.rating >= 4.8;

      return (
        matchesQuery &&
        matchesSport &&
        matchesLocation &&
        matchesPrice &&
        matchesAvailability &&
        matchesRating
      );
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortBy === "Rating" || sortBy === "Ratings high to low") return b.rating - a.rating;
      if (sortBy === "Price: Low to High" || sortBy === "Price low to high") return a.price - b.price;
      if (sortBy === "Price high to low") return b.price - a.price;
      if (sortBy === "Distance" || sortBy === "Distance from you") return a.distance - b.distance;
      return b.reviews - a.reviews;
    });

    return sorted;
  }, [
    availabilityOnly,
    location,
    priceRange,
    query,
    ratingOnly,
    sortBy,
    sport,
  ]);

  return (
    <div
      className={cn(
        "theme-adaptive",
        isDark ? "bg-[#050505] text-white" : "bg-white text-slate-900",
      )}
    >
      <section
        className="always-dark relative overflow-hidden border-b border-white/[0.08] bg-[#060813] min-h-[320px] md:min-h-[480px] flex items-center py-8 md:py-16 text-white"
      >
        {/* Abstract Glowing Sports Field Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/assets/venues/playground-banner.png"
            alt="Sports Playground"
            className="w-full h-full object-cover"
          />
          {/* Main green pitch glow */}
          <div className="absolute -bottom-[30%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
          {/* Spotlight glows */}
          <div className="absolute -top-[10%] left-[20%] w-[35%] h-[35%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute -top-[10%] right-[20%] w-[35%] h-[35%] rounded-full bg-emerald-500/8 blur-[100px] pointer-events-none" />
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-35" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col gap-4">
            <div className="max-w-3xl space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.36em] text-[#6DFF3B]">
                Venues
              </p>
              <h1 className="text-3xl tracking-tight text-white md:text-5xl font-black">
                Find & Book Premium Venues Near You.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/80 md:text-base">
                Search by sport, check real-time slot availability, and book your sports venue instantly with SportXClub.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/60 backdrop-blur-md shadow-2xl p-4 md:p-5">
              <div className="flex gap-2.5 items-center">
                <label className="relative block flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search sports"
                    className="h-12 rounded-[18px] border border-white/10 bg-black/40 pl-11 text-white placeholder:text-white/40 w-full hover:border-[#6DFF3B]/30 focus:border-[#6DFF3B] focus:outline-none transition-colors text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  className="h-12 w-12 shrink-0 flex items-center justify-center rounded-[18px] bg-[#6DFF3B] text-[#050505] shadow-[0_4px_12px_rgba(109,255,59,0.25)] hover:bg-[#86ff60] transition-colors lg:hidden"
                  aria-label="Open Filters"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>


          </div>
        </div>
      </section>



      {/* Mobile Filter Bottom Sheet */}
      <AnimatePresence>
        {filterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
              className="fixed inset-0 z-[60] bg-transparent lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              key="filter-drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 z-[70] flex flex-col h-[75vh] rounded-t-[32px] overflow-hidden lg:hidden bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2 w-full shrink-0">
                <div className="h-1 w-12 rounded-full bg-slate-300" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100 shrink-0 bg-white">
                <h2 className="text-xl font-semibold text-slate-900">Filter</h2>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Main Content Area: 2 Columns */}
              <div className="flex flex-1 overflow-hidden bg-white">
                {/* Left Tabs Column */}
                <div className="w-[35%] flex flex-col overflow-y-auto overflow-x-hidden border-r border-slate-100 bg-slate-50">
                  {["Sort", "Sports", "Surfaces", "Amenities", "Price", "Radius", "Team Size", "Preferred Time"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveFilterTab(tab)}
                      className={cn(
                        "w-full text-left px-4 py-4 text-sm font-medium transition-colors border-l-4",
                        activeFilterTab === tab
                          ? "border-[#4CFF3B] text-[#4CFF3B] bg-[#E8FFE5]"
                          : "border-transparent text-slate-600 hover:bg-white"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Right Content Column */}
                <div className="flex-1 overflow-y-auto p-5 bg-white">
                  {activeFilterTab === "Sort" && (
                    <div className="flex flex-col gap-5">
                      {["Distance from you", "Ratings high to low", "Price low to high", "Price high to low"].map((option) => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer group">
                          <div className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border-2 transition",
                            sortBy === option
                              ? "border-[#4CFF3B]"
                              : "border-slate-300 group-hover:border-slate-400"
                          )}>
                            {sortBy === option && <div className="h-2.5 w-2.5 rounded-full bg-[#4CFF3B]" />}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{option}</span>
                          <input
                            type="radio"
                            name="sort"
                            value={option}
                            checked={sortBy === option}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="hidden"
                          />
                        </label>
                      ))}
                    </div>
                  )}
                  {activeFilterTab === "Sports" && (
                    <div className="flex flex-col gap-5">
                      {sports.map((item) => (
                        <label key={item} className="flex items-center gap-3 cursor-pointer group">
                          <div className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border-2 transition",
                            sport === item
                              ? "border-[#4CFF3B]"
                              : "border-slate-300 group-hover:border-slate-400"
                          )}>
                            {sport === item && <div className="h-2.5 w-2.5 rounded-full bg-[#4CFF3B]" />}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{item === "All" ? "All Sports" : item}</span>
                          <input
                            type="radio"
                            name="sport"
                            value={item}
                            checked={sport === item}
                            onChange={(e) => setSport(e.target.value)}
                            className="hidden"
                          />
                        </label>
                      ))}
                    </div>
                  )}
                  {activeFilterTab === "Price" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-700">Price per hour</p>
                      </div>
                      <div className="py-2">
                        <Slider value={priceRange} min={500} max={2000} step={50} onValueChange={setPriceRange} className="py-1 cursor-pointer" />
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-2 text-center">
                          <p className="text-[10px] uppercase text-slate-500">Min</p>
                          <p className="text-sm font-medium text-slate-800">₹{priceRange[0]}</p>
                        </div>
                        <div className="text-xs text-slate-400">-</div>
                        <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-2 text-center">
                          <p className="text-[10px] uppercase text-slate-500">Max</p>
                          <p className="text-sm font-medium text-slate-800">₹{priceRange[1]}+</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {["Surfaces", "Amenities", "Radius", "Team Size", "Preferred Time"].includes(activeFilterTab) && (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-center text-slate-400">
                        Options for {activeFilterTab} will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSortBy("Recommended");
                    setSport("All");
                    setPriceRange([700, 1600]);
                    setActiveFilterTab("Sort");
                  }}
                  className="text-sm font-semibold tracking-wide transition-colors uppercase text-slate-900 hover:text-[#4CFF3B]"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="rounded-[10px] bg-[#4CFF3B] px-8 py-3 text-sm font-semibold text-[#050505] shadow-lg shadow-[#4CFF3B]/20 active:scale-[0.98] transition-transform uppercase tracking-wide"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <section className="mx-auto grid max-w-[1400px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8 lg:py-10">
        <aside className="hidden space-y-4 lg:block lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-[24px] border-white/[0.08] bg-[#101216]">
            <CardContent className="space-y-6 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs  uppercase tracking-[0.28em] text-white/45">
                    Filters
                  </p>
                  <h2 className="mt-2 text-lg  text-white">
                    Refine your search
                  </h2>
                </div>
                <Filter className="h-5 w-5 text-[#6DFF3B]" />
              </div>

              <div className="space-y-3">
                <p className="text-sm text-white/78">Sport</p>
                <Select value={sport} onValueChange={setSport}>
                  <SelectTrigger className="h-10 rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-white/[0.08] dark:bg-[#050505]/50 dark:text-white cursor-pointer">
                    <SelectValue placeholder="All Sports" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 text-slate-900 dark:bg-[#101216] dark:border-white/[0.08] dark:text-white rounded-xl">
                    {sports.map((item) => (
                      <SelectItem key={item} value={item} className="cursor-pointer">
                        {item === "All" ? "All Sports" : item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/78">Price per hour</p>
                    <span className="text-xs text-[#6DFF3B] font-semibold bg-[#6DFF3B]/10 px-2 py-0.5 rounded-full">
                      ₹{priceRange[0]} - ₹{priceRange[1]}+
                    </span>
                  </div>

                  <div className="rounded-[24px] border border-white/[0.08] bg-[#050505]/40 p-5 space-y-4">
                    {/* Price Histogram chart */}
                    <div className="flex items-end justify-between h-14 px-2 pt-2">
                      {[15, 25, 35, 55, 75, 95, 80, 60, 45, 30, 50, 65, 85, 55, 35, 20, 10, 5].map((height, idx) => {
                        const barPrice = 500 + idx * ((2000 - 500) / 18);
                        const isActive = barPrice >= priceRange[0] && barPrice <= priceRange[1];
                        return (
                          <div
                            key={idx}
                            className={cn(
                              "w-full mx-[2px] rounded-t-sm transition-all duration-300",
                              isActive ? "bg-primary" : "bg-white/[0.08]"
                            )}
                            style={{
                              height: `${height}%`,
                            }}
                          />
                        );
                      })}
                    </div>

                    <Slider
                      value={priceRange}
                      min={500}
                      max={2000}
                      step={50}
                      onValueChange={setPriceRange}
                      className="py-1 cursor-pointer"
                    />

                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex-1 rounded-xl border border-white/[0.08] bg-[#101216]/50 p-2 text-center">
                        <p className="text-[10px] text-white/40 uppercase">Min Price</p>
                        <p className="text-sm font-medium text-white">₹{priceRange[0]}</p>
                      </div>
                      <div className="text-white/35 text-xs">-</div>
                      <div className="flex-1 rounded-xl border border-white/[0.08] bg-[#101216]/50 p-2 text-center">
                        <p className="text-[10px] text-white/40 uppercase">Max Price</p>
                        <p className="text-sm font-medium text-white">₹{priceRange[1]}+</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm  text-white/78">Trust & availability</p>
                <button
                  type="button"
                  onClick={() => setAvailabilityOnly((current) => !current)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[18px] border px-4 py-3 text-left transition",
                    availabilityOnly
                      ? "border-[#6DFF3B]/30 bg-[#6DFF3B]/10 text-white"
                      : "border-white/[0.08] bg-white/[0.03] text-white/72",
                  )}
                >
                  <div>
                    <p className="text-sm ">Available today</p>
                    <p className="mt-1 text-xs text-white/52">
                      Hide sold-out venues
                    </p>
                  </div>
                  <TimerReset className="h-4 w-4 text-[#6DFF3B]" />
                </button>
                <button
                  type="button"
                  onClick={() => setRatingOnly((current) => !current)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[18px] border px-4 py-3 text-left transition",
                    ratingOnly
                      ? "border-[#6DFF3B]/30 bg-[#6DFF3B]/10 text-white"
                      : "border-white/[0.08] bg-white/[0.03] text-white/72",
                  )}
                >
                  <div>
                    <p className="text-sm ">4.8+ only</p>
                    <p className="mt-1 text-xs text-white/52">
                      Prioritize better-rated venues
                    </p>
                  </div>
                  <Star className="h-4 w-4 text-[#6DFF3B]" />
                </button>
              </div>

              <div className="rounded-[20px] border border-[#6DFF3B]/18 bg-[#6DFF3B]/10 p-4">
                <p className="text-sm  text-white">Trust badges</p>
                <div className="mt-3 space-y-2 text-sm text-white/70">
                  <p>Verified venue</p>
                  <p>Secure payment</p>
                  <p>Easy refund</p>
                  <p>Real reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-white/52">
              Showing{" "}
              <span className="text-white">{filteredVenues.length}</span> venues
              in your area
            </p>
          </div>

          {filteredVenues.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredVenues.map((venue, index) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  whileHover={{ y: -6 }}
                >
                  <div className="block h-full">
                    <Card className="always-dark group relative flex flex-col h-[420px] md:h-[400px] overflow-hidden rounded-[24px] border-white/[0.08] bg-[#101216] shadow-[0_18px_56px_-30px_rgba(0,0,0,0.85)]">
                      {/* Full Background Image */}
                      <ImageWithFallback
                        src={venue.image}
                        alt={venue.name}
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      {/* Overlay for Text Readability - 50% Right or Left Side (Zig-Zag) */}
                      <div className={cn(
                        "absolute inset-0 md:inset-auto md:absolute md:inset-y-0 w-full md:w-[50%] bg-gradient-to-t pointer-events-none",
                        index % 2 === 0
                          ? "md:right-0 md:bg-gradient-to-l from-[#050505]/95 via-[#050505]/90 to-transparent"
                          : "md:left-0 md:bg-gradient-to-r from-[#050505]/95 via-[#050505]/90 to-transparent"
                      )} />

                      {/* Top Badges */}
                      <div className={cn(
                        "absolute top-6 flex gap-2 z-10",
                        index % 2 === 0 ? "left-6" : "right-6 flex-row-reverse"
                      )}>
                        {venue.badges.map((badge) => (
                          <img
                            key={badge}
                            src={badge}
                            alt=""
                            aria-hidden="true"
                            className="h-7 w-7 drop-shadow-md"
                          />
                        ))}
                      </div>

                      {/* Content Overlay */}
                      <CardContent className={cn(
                        "relative z-10 flex flex-col justify-end flex-1 p-6 md:p-8 w-full h-full",
                        index % 2 === 0 ? "md:items-end" : "md:items-start"
                      )}>
                        <div className={cn(
                          "flex flex-col w-full md:max-w-[70%] lg:max-w-[50%] gap-5",
                          index % 2 === 0 ? "items-end" : "items-start"
                        )}>
                          {/* Details */}
                          <div className={cn(
                            "flex flex-col space-y-3 w-full",
                            index % 2 === 0 ? "items-end" : "items-start"
                          )}>
                            <div className={index % 2 === 0 ? "text-right" : "text-left"}>
                              <h3
                                className="text-2xl font-bold uppercase tracking-tight"
                                style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
                              >
                                {venue.name}
                              </h3>
                              <p
                                className={cn(
                                  "mt-1 flex items-center gap-1.5 text-sm font-medium",
                                  index % 2 === 0 ? "justify-end" : "justify-start"
                                )}
                                style={{ color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
                              >
                                <MapPin className="w-4 h-4" /> {venue.location} • {venue.distance.toFixed(1)} km
                              </p>
                            </div>

                            <div className={cn(
                              "flex flex-wrap gap-4 items-center",
                              index % 2 === 0 ? "justify-end" : "justify-start"
                            )}>
                              <div className="flex items-center text-xs font-bold text-white whitespace-nowrap">
                                <Star className="inline-block h-3.5 w-3.5 fill-[#6DFF3B] text-[#6DFF3B] mr-1" />
                                {venue.rating.toFixed(1)}
                              </div>
                              <span className="text-[0.68rem] uppercase tracking-[0.16em] text-white font-bold">
                                {venue.sport}
                              </span>
                              <span className="text-[0.68rem] uppercase tracking-[0.16em] text-white font-bold">
                                {venue.availableToday
                                  ? "Available today"
                                  : "Limited slots"}
                              </span>
                            </div>


                          </div>

                          {/* Buttons */}
                          <div className={cn(
                            "flex flex-wrap items-center gap-3 mt-2",
                            index % 2 === 0 ? "justify-end" : "justify-start"
                          )}>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!currentUser) {
                                  toast.error("Please sign in first to view details.");
                                  navigate("/login");
                                } else {
                                  navigate(`/venues/${venue.id}`);
                                }
                              }}
                              className="group h-12 rounded-full border border-[#6DFF3B] bg-[#6DFF3B] px-6 text-[#050505] font-bold uppercase tracking-wider transition-all hover:bg-[#86ff60] hover:scale-105 shadow-[0_0_20px_rgb(109,255,59,0.3)]"
                            >
                              Details
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setModeModalVenue(venue);
                              }}
                              className="group h-12 rounded-full border border-[#6DFF3B] bg-[#6DFF3B] px-6 text-[#050505] font-bold uppercase tracking-wider transition-all hover:bg-[#86ff60] hover:scale-105 shadow-[0_0_20px_rgb(109,255,59,0.3)]"
                            >
                              Slots
                              <ArrowRight className="h-4 w-4 ml-2 text-[#050505] transition-transform group-hover:translate-x-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="rounded-[24px] border-white/[0.08] bg-[#101216]">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <p className="text-lg  text-white">
                  No venues match your filters
                </p>
                <p className="max-w-md text-sm leading-7 text-white/58">
                  Try widening the price range or switching the sport and
                  location filters.
                </p>
                <Button
                  onClick={() => {
                    setQuery("");
                    setSport("All");
                    setLocation("All");
                    setSortBy("Recommended");
                    setPriceRange([700, 1600]);
                    setAvailabilityOnly(true);
                    setRatingOnly(false);
                  }}
                  className="h-11 rounded-[16px] bg-[#6DFF3B] px-5  text-[#050505] hover:bg-[#86ff60]"
                >
                  Reset filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
      {/* Mode Selection Modal */}
      <Dialog open={!!modeModalVenue} onOpenChange={(open) => !open && setModeModalVenue(null)}>
        <DialogContent className="sm:max-w-2xl rounded-[32px] border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white shadow-2xl p-8 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[200px] bg-[#6DFF3B]/10 blur-[80px] rounded-full pointer-events-none" />

          <DialogHeader className="mb-6 relative z-10 text-center">
            <DialogTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
              Choose Booking Mode
            </DialogTitle>
            <DialogDescription className="text-base text-slate-600 dark:text-white/60 max-w-sm mx-auto">
              How would you like to experience <span className="text-slate-900 dark:text-white font-medium">{modeModalVenue?.name}</span>?
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            {/* Single Player Mode */}
            <Button
              onClick={() => {
                setModeModalVenue(null);
                navigate("/open-lobbies", { state: { venue: modeModalVenue } });
              }}
              className="group h-auto flex flex-col items-center text-center p-8 rounded-[24px] border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:border-slate-300 dark:hover:border-white/20 hover:shadow-lg transition-all"
            >
              <div className="h-16 w-16 mb-4 rounded-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-white group-hover:scale-110 transition-transform duration-500">
                <User className="h-7 w-7" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Single Player
              </span>
              <p className="text-sm text-slate-500 dark:text-white/50 leading-relaxed font-normal whitespace-normal">
                Book a solo slot and join an open match with other players.
              </p>
            </Button>

            {/* Create Own Lobby Mode */}
            <Button
              onClick={() => {
                setModeModalVenue(null);
                navigate("/squad-booking", { state: { venue: modeModalVenue } });
              }}
              className="group h-auto flex flex-col items-center text-center p-8 rounded-[24px] border border-emerald-500/30 dark:border-[#6DFF3B]/30 bg-[#6DFF3B]/10 dark:bg-[#6DFF3B]/5 hover:bg-[#6DFF3B]/20 dark:hover:bg-[#6DFF3B]/10 hover:border-emerald-500/60 dark:hover:border-[#6DFF3B]/60 hover:shadow-[0_0_30px_rgba(109,255,59,0.15)] transition-all"
            >
              <div className="h-16 w-16 mb-4 rounded-full bg-[#6DFF3B] text-black flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(109,255,59,0.4)]">
                <Users className="h-7 w-7" />
              </div>
              <span className="text-xl font-bold text-emerald-700 dark:text-[#6DFF3B] mb-2">
                Create Own Lobby
              </span>
              <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed font-normal whitespace-normal">
                Reserve the entire turf, invite your squad, and split the cost.
              </p>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
