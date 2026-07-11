import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../../providers/auth-provider";
import { motion, useInView, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Locate,
  MapPin,
  PlayCircle,
  Search,
  Star,
  ShieldCheck,
  SlidersHorizontal,
  Zap,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  Smartphone,
  Download,
} from "lucide-react";

import { useIsMobile } from "../ui/use-mobile";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { cn } from "../ui/utils";
import { Logo } from "../brand/Logo";
import { ThemeToggleButton } from "../ui/theme-toggle-button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { AppDownloadCTA } from "./AppDownloadCTA";
import { Footer } from "./Footer";

const asset = (path) => `/assets${path}`;

const sports = [
  {
    name: "Football",
    count: "1,248 venues",
    image: asset("/sports/cat-football.webp"),
  },
  {
    name: "Cricket",
    count: "892 venues",
    image: asset("/sports/cat-cricket.webp"),
  },
  {
    name: "Badminton",
    count: "734 venues",
    image: asset("/sports/cat-badminton.webp"),
  },
  {
    name: "Basketball",
    count: "641 venues",
    image: asset("/sports/cat-basketball.webp"),
  },
  {
    name: "Volleyball",
    count: "418 venues",
    image: asset("/sports/cat-boxmma.webp"),
  },
  {
    name: "Tennis",
    count: "518 venues",
    image: asset("/sports/cat-tennis.webp"),
  },
  {
    name: "Swimming",
    count: "302 venues",
    image: asset("/sports/cat-swimming.webp"),
  },
];

const moreSports = [
  { label: "Padel", image: asset("/sports/cat-padel.webp") },
  { label: "Box MMA", image: asset("/sports/cat-boxmma.webp") },
  { label: "More", image: asset("/sports/cat-swimming.webp") },
  { label: "Badminton", image: asset("/sports/cat-badminton.webp") },
];

const offers = [
  {
    title: "Early bird cashback",
    value: "Flat 15% off",
    description: "Use BOOKFIRST before 11 AM and save on select weekday slots.",
    tag: "Limited time",
  },
  {
    title: "Tournament starter pack",
    value: "Free listing",
    description:
      "Launch your first event with verified venue discovery and bracket tools.",
    tag: "Organizer offer",
  },
  {
    title: "Refund-safe booking",
    value: "Easy cancellation",
    description:
      "Clear refund rules, visible before payment, with trusted support.",
    tag: "Trusted",
  },
];

const events = [
  {
    title: "Weekend Turf League",
    date: "24 Jun - 26 Jun",
    location: "Powai, Mumbai",
    image: asset("/tournaments/tournament-1-cover.webp"),
  },
  {
    title: "City Cricket Cup",
    date: "Sat, 25 Jun",
    location: "Bandra, Mumbai",
    image: asset("/tournaments/tournament-2-cover.webp"),
  },
  {
    title: "Night Smash Open",
    date: "Sun, 26 Jun",
    location: "Navi Mumbai",
    image: asset("/tournaments/tournament-3-cover.webp"),
  },
];

const tournaments = [
  {
    title: "City Five-A-Side Cup",
    date: "Sat, 24 Jun",
    time: "6:30 PM",
    prize: "₹2.5L prize pool",
    image: asset("/tournaments/tournament-1-cover.webp"),
  },
  {
    title: "Midnight Turf League",
    date: "Sun, 25 Jun",
    time: "8:00 PM",
    prize: "32 teams open",
    image: asset("/tournaments/tournament-2-cover.webp"),
  },
  {
    title: "Weekend Smash Open",
    date: "Mon, 26 Jun",
    time: "7:15 PM",
    prize: "Entry closes soon",
    image: asset("/tournaments/tournament-3-cover.webp"),
  },
];

const whyCards = [
  {
    title: "Verified Venues",
    description:
      "Show only trusted venues with the right facilities, availability, and a booking experience players can rely on.",
    icon: asset("/why-us/feature-verified-venues.svg"),
  },
  {
    title: "Secure Payments",
    description:
      "Keep every transaction clear and safe with a checkout flow that feels serious and dependable.",
    icon: asset("/why-us/feature-secure-payment.svg"),
  },
  {
    title: "Instant Booking",
    description:
      "Convert interest into a confirmed slot quickly with a clean search, structured cards, and direct action.",
    icon: asset("/why-us/feature-instant-booking.svg"),
  },
  {
    title: "24x7 Support",
    description:
      "Help is available when players, venues, or organizers need it most, without making the UI feel noisy.",
    icon: asset("/why-us/feature-support.svg"),
  },
];

const stats = [
  {
    value: 42000,
    suffix: "+",
    label: "Players connected",
    icon: asset("/icons/users.svg"),
  },
];

function HeroParticles() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 18 }).map((_, index) => (
        <motion.span
          key={index}
          className={cn(
            "absolute rounded-full blur-[1px]",
            isDark
              ? "h-1 w-1 bg-[#6DFF3B]/60"
              : "h-0.5 w-0.5 bg-emerald-400/20",
          )}
          style={{
            left: `${10 + ((index * 7) % 80)}%`,
            top: `${12 + ((index * 11) % 72)}%`,
          }}
          animate={
            isDark
              ? {
                y: [0, -14, 0],
                opacity: [0.12, 0.7, 0.12],
                scale: [1, 1.35, 1],
              }
              : {
                y: [0, -10, 0],
                opacity: [0.03, 0.12, 0.03],
                scale: [1, 1.12, 1],
              }
          }
          transition={{
            duration: isDark ? 5 + (index % 4) : 8 + (index % 4),
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.16,
          }}
        />
      ))}
    </div>
  );
}

function AnimatedNumber({ value, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.7 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let frame = 0;
    const start = performance.now();
    const duration = 1400;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function SectionHeading({ eyebrow, title, description, centered = false }) {
  return (
    <div className={cn("max-w-3xl", centered && "mx-auto text-center")}>
      <p className="text-[0.72rem]  uppercase tracking-[0.36em] text-[#6DFF3B]/85">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl  tracking-tight text-white md:text-4xl lg:text-[2.8rem] lg:leading-[1.04]">
        {title}
      </h2>
      <p className="mt-4 text-base leading-8 text-white/66 md:text-lg">
        {description}
      </p>
    </div>
  );
}

export function Navbar() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const [activeCity, setActiveCity] = useState(
    () => localStorage.getItem("preferred-city") || "Mumbai",
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const drawerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && drawerRef.current && !drawerRef.current.contains(event.target)) {
        const toggleButton = document.getElementById("hamburger-menu-toggle-btn");
        if (toggleButton && toggleButton.contains(event.target)) {
          return;
        }
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const { currentUser } = useAuth();

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const name = localStorage.getItem("userName") || "User";
    setIsLoggedIn(loggedIn);
    setUserName(name);
  }, []);

  useEffect(() => {
    const handleCityChange = (e) => {
      const customEvent = e;
      setActiveCity(customEvent.detail);
    };
    window.addEventListener("preferredCityChanged", handleCityChange);
    return () =>
      window.removeEventListener("preferredCityChanged", handleCityChange);
  }, []);



  const handleCitySelect = (selected) => {
    localStorage.setItem("preferred-city", selected);
    setActiveCity(selected);
    window.dispatchEvent(
      new CustomEvent("preferredCityChanged", { detail: selected }),
    );
  };

  const cities = [
    "Mumbai",
    "Bengaluru",
    "Delhi NCR",
    "Pune",
    "Chennai",
    "Hyderabad",
    "Kolkata",
    "Ahmedabad",
    "Jaipur",
  ];

  const menuItems = [
    { label: "Turf", to: "/venues", hasChevron: true },
    { label: "Events", to: "/community", hasChevron: true },
    { label: "Coaching", to: "/ai-assistant", hasChevron: true },
    { label: "Tournaments", to: "/tournaments", hasChevron: true },
    {
      label: "Cart",
      to: "/bookings",
      hasChevron: true,
      isCart: true,
      badge: 2,
    },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b backdrop-blur-2xl transition-colors duration-200 shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.6)]",
          isDark
            ? "border-white/[0.08] bg-[#050505]/95 text-white"
            : "border-slate-200/80 bg-white/95 text-slate-900",
        )}
      >
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-4 px-6 lg:px-8">
          {/* Left Section: Logo */}
          <div className="flex flex-1 items-center justify-start">
            <Link to="/" className="flex items-center translate-y-[5px] md:translate-y-[8px]">
              <Logo />
            </Link>
          </div>

          {/* Center Section: Sleek Search Bar */}
          <div className="hidden md:flex items-center justify-center shrink-0 w-full max-w-[400px] lg:max-w-[460px] mx-4 relative">
            <div
              className={cn(
                "flex items-center w-full rounded-full border px-4 py-2 shadow-sm transition-all duration-200 focus-within:ring-2",
                isDark
                  ? "border-white/[0.08] bg-white/[0.03] focus-within:border-[#6DFF3B]/30 focus-within:ring-[#6DFF3B]/10"
                  : "border-slate-200 bg-[#F1F3F6]/60 hover:bg-[#F1F3F6]/80 focus-within:bg-white focus-within:border-emerald-500/30 focus-within:ring-emerald-500/10",
              )}
            >
              {/* Search Icon */}
              <Search
                className={cn(
                  "h-4 w-4 shrink-0 mr-2.5",
                  isDark ? "text-[#6DFF3B]" : "text-emerald-600",
                )}
              />

              {/* Real Search Input */}
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search venues, areas, sports..."
                className={cn(
                  "w-full bg-transparent border-0 p-0 text-[0.825rem] lg:text-[0.875rem] font-normal outline-none focus:ring-0 focus:outline-none",
                  isDark
                    ? "placeholder:text-white/40 text-white"
                    : "placeholder:text-slate-400 text-slate-800",
                )}
              />

              {/* Divider Line */}
              <div
                className={cn(
                  "h-4 w-[1px] shrink-0 mx-3",
                  isDark ? "bg-white/[0.12]" : "bg-slate-300",
                )}
              />

              {/* Location Selector (with Dialog Trigger) */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-1.5 shrink-0 text-[0.825rem] lg:text-[0.875rem] transition hover:opacity-80 cursor-pointer">
                    <MapPin
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        isDark ? "text-[#6DFF3B]" : "text-emerald-600",
                      )}
                    />
                    <span className={isDark ? "text-white" : "text-slate-700"}>
                      {activeCity === "All" ? "All Cities" : activeCity}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 shrink-0 transition-transform",
                        isDark ? "text-white/40" : "text-slate-400",
                      )}
                    />
                  </button>
                </DialogTrigger>
                <DialogContent
                  className={cn(
                    "sm:max-w-[425px]",
                    isDark
                      ? "bg-[#101216] border-white/[0.08]"
                      : "bg-white border-slate-200",
                  )}
                >
                  <DialogHeader>
                    <DialogTitle
                      className={cn(isDark ? "text-white" : "text-slate-900")}
                    >
                      Select your city
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => handleCitySelect("All")}
                      className={cn(
                        "flex items-center gap-3 w-full p-3 rounded-xl transition text-left",
                        isDark
                          ? "bg-[#6DFF3B]/10 text-[#6DFF3B] hover:bg-[#6DFF3B]/20"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                      )}
                    >
                      <Locate className="h-5 w-5" />
                      <div className="flex flex-col">
                        <span className=" text-sm">All Cities</span>
                        <span
                          className={cn(
                            "text-xs",
                            isDark
                              ? "text-[#6DFF3B]/70"
                              : "text-emerald-600/70",
                          )}
                        >
                          Detect my location
                        </span>
                      </div>
                    </button>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {cities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl transition text-center gap-2 border",
                            activeCity === city
                              ? isDark
                                ? "border-[#6DFF3B] bg-[#6DFF3B]/5 text-[#6DFF3B]"
                                : "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : isDark
                                ? "border-transparent hover:bg-white/[0.04] text-white/80 hover:text-white"
                                : "border-transparent hover:bg-slate-50 text-slate-700 hover:text-slate-900",
                          )}
                        >
                          <MapPin
                            className={cn(
                              "h-5 w-5",
                              activeCity === city
                                ? isDark
                                  ? "text-[#6DFF3B]"
                                  : "text-emerald-600"
                                : "opacity-50",
                            )}
                          />
                          <span className="text-xs">{city}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Right Section: Sign In + Hamburger Menu Toggle */}
          <div className="flex flex-1 items-center justify-end gap-4">
            {/* Auth Section: Login or Profile */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={cn(
                    "flex h-10 items-center justify-center gap-2 rounded-full border shadow-sm transition px-4",
                    isDark
                      ? "border-white/[0.08] bg-white/[0.03] text-[#6DFF3B] hover:bg-white/[0.06]"
                      : "border-slate-200 bg-slate-50 text-emerald-600 hover:bg-slate-100",
                  )}
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">{userName}</span>
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div
                    className={cn(
                      "absolute right-0 mt-2 w-48 rounded-xl border shadow-lg overflow-hidden z-50",
                      isDark
                        ? "bg-[#101216] border-white/[0.08]"
                        : "bg-white border-slate-200",
                    )}
                  >
                    <div className="p-2 space-y-1">
                      <Link
                        to={currentUser?.role === 'owner' ? '/owner-dashboard' : '/profile'}
                        onClick={() => setProfileOpen(false)}
                      >
                        <button
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition",
                            isDark
                              ? "hover:bg-white/5 text-white"
                              : "hover:bg-slate-100 text-slate-800",
                          )}
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </button>
                      </Link>
                      <div
                        className={cn(
                          "h-[1px] w-full my-1",
                          isDark ? "bg-white/10" : "bg-slate-100",
                        )}
                      />
                      <button
                        onClick={() => {
                          localStorage.removeItem("isLoggedIn");
                          setIsLoggedIn(false);
                          setProfileOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition",
                          isDark
                            ? "hover:bg-white/5 text-red-400"
                            : "hover:bg-slate-100 text-red-600",
                        )}
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <button
                  className={cn(
                    "flex h-10 items-center justify-center rounded-full border px-5 text-sm tracking-wide transition-all cursor-pointer group",
                    isDark
                      ? "border-[#6DFF3B] bg-transparent text-white hover:bg-[#6DFF3B] hover:text-[#050505]"
                      : "border-[#6DFF3B] bg-transparent text-slate-800 hover:bg-[#6DFF3B] hover:text-[#050505]",
                  )}
                >
                  Login
                </button>
              </Link>
            )}

            {/* Hamburger Menu Toggle Button */}
            <button
              id="hamburger-menu-toggle-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition duration-200 cursor-pointer",
                isDark
                  ? "text-white/80 hover:bg-white/[0.08] hover:text-white"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
              )}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Removed Theme Toggle Button */}
          </div>
        </div>

        {/* Mobile/Tablet Search pill (shown only below 'md' screen size) */}
        <div className="md:hidden px-4 pb-3">
          <div
            className={cn(
              "flex items-center w-full rounded-full border px-4 py-2 shadow-sm transition-all duration-200",
              isDark
                ? "border-white/[0.08] bg-white/[0.03] focus-within:border-[#6DFF3B]/30 focus-within:ring-2 focus-within:ring-[#6DFF3B]/10"
                : "border-slate-200 bg-[#F1F3F6]/60 focus-within:bg-white focus-within:border-emerald-500/30 focus-within:ring-2 focus-within:ring-emerald-500/10",
            )}
          >
            <Search
              className={cn(
                "h-4 w-4 shrink-0 mr-2.5",
                isDark ? "text-[#6DFF3B]" : "text-emerald-600",
              )}
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search venues, sports..."
              className={cn(
                "w-full bg-transparent border-0 p-0 text-sm font-normal outline-none focus:ring-0",
                isDark
                  ? "placeholder:text-white/40 text-white"
                  : "placeholder:text-slate-400 text-slate-800",
              )}
            />

            <div
              className={cn(
                "h-4 w-[1px] shrink-0 mx-2",
                isDark ? "bg-white/[0.12]" : "bg-slate-300",
              )}
            />
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1 shrink-0 text-xs cursor-pointer">
                  <MapPin
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      isDark ? "text-[#6DFF3B]" : "text-emerald-600",
                    )}
                  />
                  <span>{activeCity === "All" ? "Cities" : activeCity}</span>
                </button>
              </DialogTrigger>
              <DialogContent
                className={cn(
                  "sm:max-w-[425px]",
                  isDark
                    ? "bg-[#101216] border-white/[0.08]"
                    : "bg-white border-slate-200",
                )}
              >
                <DialogHeader>
                  <DialogTitle
                    className={cn(isDark ? "text-white" : "text-slate-900")}
                  >
                    Select your city
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => handleCitySelect("All")}
                    className={cn(
                      "flex items-center gap-3 w-full p-3 rounded-xl transition text-left",
                      isDark
                        ? "bg-[#6DFF3B]/10 text-[#6DFF3B] hover:bg-[#6DFF3B]/20"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                    )}
                  >
                    <Locate className="h-5 w-5" />
                    <div className="flex flex-col">
                      <span className=" text-sm">All Cities</span>
                      <span
                        className={cn(
                          "text-xs",
                          isDark ? "text-[#6DFF3B]/70" : "text-emerald-600/70",
                        )}
                      >
                        Detect my location
                      </span>
                    </div>
                  </button>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {cities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleCitySelect(city)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-xl transition text-center gap-2 border",
                          activeCity === city
                            ? isDark
                              ? "border-[#6DFF3B] bg-[#6DFF3B]/5 text-[#6DFF3B]"
                              : "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : isDark
                              ? "border-transparent hover:bg-white/[0.04] text-white/80 hover:text-white"
                              : "border-transparent hover:bg-slate-50 text-slate-700 hover:text-slate-900",
                        )}
                      >
                        <MapPin
                          className={cn(
                            "h-5 w-5",
                            activeCity === city
                              ? isDark
                                ? "text-[#6DFF3B]"
                                : "text-emerald-600"
                              : "opacity-50",
                          )}
                        />
                        <span className="text-xs">{city}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>


      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={drawerRef}
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] z-[70] shadow-2xl px-6 py-6 flex flex-col gap-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-l",
              isDark
                ? "bg-[#0b0c0e] border-white/[0.08]"
                : "bg-white border-slate-200",
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={cn(
                  "text-lg font-semibold",
                  isDark ? "text-white" : "text-slate-900",
                )}
              >
                Menu
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "p-2 rounded-full transition cursor-pointer",
                  isDark ? "hover:bg-white/10" : "hover:bg-slate-100",
                )}
              >
                <X
                  className={cn(
                    "h-5 w-5",
                    isDark ? "text-white/80" : "text-slate-700",
                  )}
                />
              </button>
            </div>


            {/* Menu list items */}
            <div className="flex flex-col">
              {menuItems.map((item) => {
                const itemContent = (
                  <div className="flex items-center justify-between w-full py-4 px-3 border-b border-slate-100 dark:border-white/[0.05] transition-colors duration-150 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] group">
                    <div className="flex items-center gap-3">
                      {item.isCart && (
                        <ShoppingCart
                          className={cn(
                            "h-5 w-5",
                            isDark ? "text-[#6DFF3B]" : "text-emerald-600",
                          )}
                        />
                      )}
                      <span
                        className={cn(
                          "text-sm tracking-wide transition-colors duration-150",
                          item.isGreen
                            ? isDark
                              ? "text-[#6DFF3B]"
                              : "text-emerald-600"
                            : isDark
                              ? "text-white/90 group-hover:text-[#6DFF3B]"
                              : "text-slate-800 group-hover:text-emerald-600",
                        )}
                      >
                        {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white",
                            isDark
                              ? "bg-[#6DFF3B] text-black"
                              : "bg-emerald-600",
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      {item.hasChevron && (
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-colors duration-150",
                            isDark
                              ? "text-white/20 group-hover:text-[#6DFF3B]"
                              : "text-slate-300 group-hover:text-emerald-600",
                          )}
                        />
                      )}
                    </div>
                  </div>
                );

                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="block text-left"
                  >
                    {itemContent}
                  </Link>
                );
              })}

              {/* Theme Toggle inside Menu */}
              <div className="flex items-center justify-between w-full py-4 px-3 border-b border-slate-100 dark:border-white/[0.05] transition-colors duration-150">
                <span className={cn("text-sm tracking-wide", isDark ? "text-white/90" : "text-slate-800")}>
                  Theme
                </span>
                <ThemeToggleButton
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition",
                    isDark
                      ? "border-white/[0.08] bg-white/[0.03] text-white/80 hover:bg-white/[0.06] hover:text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  )}
                  variant="ghost"
                />
              </div>


            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}



function StatsRow() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] p-4",
        isDark
          ? "border border-white/[0.08] bg-[#101216]"
          : "border border-slate-200/80 bg-white/82 shadow-[0_18px_50px_rgba(15,23,42,0.08)]",
      )}
    >
      <div
        className={cn("absolute inset-0", isDark ? "opacity-30" : "opacity-20")}
        style={{
          backgroundImage: `url(${asset("/stats/stats-bg-pattern.svg")})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative flex flex-wrap gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
          >
            <div
              className={cn(
                "flex h-full items-center gap-4 rounded-[20px] p-4",
                isDark
                  ? "border border-white/[0.08] bg-[#050505]/40"
                  : "border border-slate-200/80 bg-white/75",
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  isDark
                    ? "border border-[#6DFF3B]/18 bg-[#6DFF3B]/10"
                    : "border border-emerald-500/20 bg-emerald-500/10",
                )}
              >
                <img
                  src={stat.icon}
                  alt=""
                  aria-hidden="true"
                  className="h-5 w-5 object-contain"
                />
              </div>
              <div>
                <p
                  className={cn(
                    "text-2xl  tracking-tight",
                    isDark ? "text-white" : "text-slate-900",
                  )}
                >
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </p>
                <p
                  className={cn(
                    "text-sm",
                    isDark ? "text-white/58" : "text-slate-600",
                  )}
                >
                  {stat.label}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function HeroSection() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const isMobile = useIsMobile();
  const [currentBg, setCurrentBg] = useState(0);

  const bgImages = [
    "/assets/hero/unique-hero.jpg",
    "/assets/hero/unique-hero-2.jpg",
    "/assets/hero/unique-hero-3.jpg",
    "/assets/hero/unique-hero-4.jpg",
    "/assets/hero/unique-hero-5.jpg",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [bgImages.length]);

  return (
    <section className="always-dark relative isolate overflow-hidden bg-[#060813]">
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentBg}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-no-repeat bg-center brightness-100 contrast-[1.02] saturate-[1.05]"
            style={{ backgroundImage: `url(${bgImages[currentBg]})` }}
          />
        </AnimatePresence>
      </div>

      <div className="mx-auto flex min-h-[92svh] max-w-[1200px] flex-col justify-center items-center px-4 sm:px-6 md:min-h-[94svh] lg:px-8 xl:min-h-[96svh]">
        <div className="relative w-full max-w-[90vw] md:max-w-6xl flex flex-col items-center">
          <div className="relative z-10 flex flex-col items-center text-center w-full max-w-[90vw] md:max-w-6xl">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge
                className="rounded-full px-4 py-2 text-xs uppercase tracking-[0.26em] border border-[#6DFF3B]/20 bg-[#6DFF3B]/10 text-[#6DFF3B]"
              >
                Premium sports booking
              </Badge>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <h1
                className="mt-6 font-light w-full max-w-none text-center text-5xl sm:text-7xl tracking-tighter lg:text-[5.2rem] lg:leading-[1.05] !text-white drop-shadow-md md:whitespace-nowrap"
              >
                Play. Book.{" "}
                <span
                  className="text-[#6DFF3B] drop-shadow-[0_0_20px_rgba(109,255,59,0.3)]"
                >
                  Compete.
                </span>
              </h1>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
              <p className="mt-6 text-center text-lg sm:text-xl md:text-2xl font-light tracking-wider text-white/90 max-w-2xl mx-auto">
                Let's begin where the game never stops
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-10 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 w-full sm:w-auto">

              <Link to="/venues" className="w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto h-14 rounded-full px-8 text-base font-semibold backdrop-blur-md transition-all hover:scale-105 shadow-sm group border border-[#6DFF3B] bg-transparent !text-white hover:bg-[#6DFF3B] hover:!text-[#050505]"
                >
                  Book a turf now
                </Button>
              </Link>
              <Link to="/venues" className="w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto h-14 rounded-full px-8 text-base font-semibold backdrop-blur-md transition-all hover:scale-105 shadow-sm group border border-[#6DFF3B] bg-transparent !text-white hover:bg-[#6DFF3B] hover:!text-[#050505]"
                >
                  List of our turfs
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SportCard({ name, count, image, index }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      whileHover={{ y: -6, scale: 1.015 }}
      className="group shrink-0 snap-center w-[85vw] sm:w-auto"
    >
      <Link to="/venues" className="block">
        <div
          className={cn(
            "relative aspect-[4/5] overflow-hidden rounded-3xl border transition-all duration-300 ease-out",
            isDark
              ? "border-white/[0.08] bg-[#101216]"
              : "border-slate-300 bg-white shadow-sm hover:shadow-2xl hover:border-emerald-500/20",
          )}
        >
          <ImageWithFallback
            src={image}
            alt={name}
            className={cn(
              "h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.06]",
              !isDark && "brightness-[1.05] contrast-[1.08] saturate-[1.08]",
            )}
          />

          <div
            className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black/90 transition-all duration-300 ease-out opacity-100 group-hover:opacity-95 z-10"
          />

          <div className="absolute inset-x-0 bottom-0 z-20 p-6 sm:p-7">
            <p
              className="text-lg sm:text-xl !text-white drop-shadow-md font-medium transition-colors duration-300"
            >
              {name}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p
                className="text-sm !text-white/80 drop-shadow-sm transition-colors duration-300"
              >
                {count}
              </p>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.08] text-[#6DFF3B] group-hover:bg-[#6DFF3B] group-hover:text-[#050505] transition-all duration-300 ease-out"
              >
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function MoreSportsCard() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, delay: 0.35 }}
      whileHover={{ y: -6, scale: 1.015 }}
      className="group shrink-0 snap-center w-[85vw] sm:w-auto"
    >
      <Link to="/venues" className="block h-full">
        <div
          className={cn(
            "relative flex h-full min-h-[280px] overflow-hidden rounded-3xl border transition-all duration-300 ease-out",
            isDark
              ? "border-white/[0.08] bg-[#101216]"
              : "border-slate-300 bg-white shadow-sm hover:shadow-2xl hover:border-emerald-500/20",
          )}
        >
          <div className="absolute inset-0 grid grid-cols-2 gap-[1px] opacity-80 transition duration-500 ease-out group-hover:scale-[1.06]">
            {moreSports.map((sport) => (
              <ImageWithFallback
                key={sport.label}
                src={sport.image}
                alt={sport.label}
                className={cn(
                  "h-full w-full object-cover",
                  !isDark &&
                  "brightness-[1.05] contrast-[1.08] saturate-[1.08]",
                )}
              />
            ))}
          </div>
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black/90 transition-all duration-300 ease-out z-10"
          />

          <div className="relative z-20 flex flex-1 flex-col justify-between p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <Badge
                className="rounded-full border border-white/[0.08] bg-white/[0.06] !text-white px-3 py-1 text-[0.7rem] uppercase tracking-[0.2em] transition-all duration-300"
              >
                More
              </Badge>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-[#050505]/70 text-[#6DFF3B] transition-all duration-300 ease-out"
              >
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-5 max-w-[18rem]">
              <p
                className="text-xl !text-white drop-shadow-md font-medium transition-colors duration-300"
              >
                More courts, more formats.
              </p>
              <p
                className="mt-3 text-sm leading-relaxed !text-white/80 drop-shadow-sm transition-colors duration-300"
              >
                Padel, Box MMA, volleyball, and more formats stay one tap away.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Volleyball", "Padel", "Box MMA"].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/[0.08] bg-white/[0.05] !text-white px-3 py-1 text-xs transition-all duration-300"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function SportsBackgroundAnimation() {
  const canvasRef = useRef(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    const mouse = { x: -1000, y: -1000, radius: 140 };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove);
      parent.addEventListener("mouseleave", handleMouseLeave);
    }

    const particles = [];
    const count = 15;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 25 + 20,
        type: Math.floor(Math.random() * 5),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.006,
        baseOpacity: Math.random() * 0.08 + 0.06,
      });
    }

    const drawSportsSymbol = (ctx, x, y, size, type, rotation, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.strokeStyle = isDark
        ? `rgba(109, 255, 59, ${opacity})`
        : `rgba(34, 197, 94, ${opacity * 1.6})`;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      if (type === 0) {
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        const r = size / 6;
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
          ctx.lineTo(
            Math.cos(angle) * (size / 2),
            Math.sin(angle) * (size / 2),
          );
          ctx.stroke();
        }
      } else if (type === 1) {
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-size / 2, 0);
        ctx.lineTo(size / 2, 0);
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(0, size / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-size * 0.4, 0, size * 0.3, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(
          size * 0.4,
          0,
          size * 0.3,
          Math.PI - Math.PI / 3,
          Math.PI + Math.PI / 3,
        );
        ctx.stroke();
      } else if (type === 2) {
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-size * 0.42, -size * 0.42, size * 0.45, 0, Math.PI / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(size * 0.42, size * 0.42, size * 0.45, Math.PI, -Math.PI / 2);
        ctx.stroke();
      } else if (type === 3) {
        const h = size / 2;
        const w = size / 3;
        ctx.beginPath();
        ctx.arc(0, h / 2, w / 2, 0, Math.PI, true);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-w / 2, h / 2);
        ctx.lineTo(-w, -h / 2);
        ctx.lineTo(w, -h / 2);
        ctx.lineTo(w / 2, h / 2);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-w * 0.75, 0);
        ctx.lineTo(w * 0.75, 0);
        ctx.stroke();
      } else {
        const bh = size * 0.75;
        const bw = size * 0.18;
        const hh = size * 0.35;
        const hw = size * 0.06;
        ctx.rect(-bw / 2, -bh / 2, bw, bh);
        ctx.rect(-hw / 2, -bh / 2 - hh, hw, hh);
        ctx.stroke();
      }
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.x < -p.size) p.x = width + p.size;
        if (p.x > width + p.size) p.x = -p.size;
        if (p.y < -p.size) p.y = height + p.size;
        if (p.y > height + p.size) p.y = -p.size;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let currentOpacity = p.baseOpacity;

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x += (dx / dist) * force * 1.8;
          p.y += (dy / dist) * force * 1.8;
          currentOpacity = p.baseOpacity * (1 + force * 2.0);
        }

        drawSportsSymbol(
          ctx,
          p.x,
          p.y,
          p.size,
          p.type,
          p.rotation,
          currentOpacity,
        );
      });

      ctx.strokeStyle = isDark
        ? "rgba(109, 255, 59, 0.04)"
        : "rgba(34, 197, 94, 0.03)";
      ctx.lineWidth = 1;
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove);
        parent.removeEventListener("mouseleave", handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10 pointer-events-none h-full w-full opacity-65"
    />
  );
}

export function SportsCategories() {
  return (
    <section className="py-12 md:py-16 relative overflow-hidden">
      <SportsBackgroundAnimation />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Popular sports"
          title="Book the formats your community actually plays."
          description="A clean category system keeps discovery fast while still feeling premium and intentional."
        />

        <div className="mt-12 flex snap-x snap-mandatory overflow-x-auto gap-4 pb-6 sm:grid sm:grid-cols-2 xl:grid-cols-3 [-webkit-overflow-scrolling:touch]">
          {sports.map((sport, index) => (
            <SportCard key={sport.name} index={index} {...sport} />
          ))}
          <MoreSportsCard />
        </div>
      </div>
    </section>
  );
}

export function DiscoveryRails() {
  return (
    <section id="how-it-works" className="py-12 md:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <Card className="overflow-hidden rounded-[28px] border-white/[0.08] bg-[#101216] shadow-[0_18px_56px_-30px_rgba(0,0,0,0.85)]">
            <CardContent className="space-y-5 p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.72rem]  uppercase tracking-[0.36em] text-[#6DFF3B]/85">
                    Offers
                  </p>
                  <h2 className="mt-3 text-2xl  tracking-tight text-white md:text-3xl">
                    Offers that feel clear, useful, and safe.
                  </h2>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#6DFF3B]/18 bg-[#6DFF3B]/10">
                  <Zap className="h-6 w-6 text-[#6DFF3B]" />
                </div>
              </div>

              <div className="flex snap-x snap-mandatory overflow-x-auto gap-3 pb-4 md:grid md:grid-cols-3 [-webkit-overflow-scrolling:touch]">
                {offers.map((offer) => (
                  <div
                    key={offer.title}
                    className="shrink-0 snap-center w-[85vw] md:w-auto rounded-[22px] border border-white/[0.08] bg-[#050505]/55 p-4"
                  >
                    <Badge className="rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1 text-[0.68rem]  uppercase tracking-[0.2em] text-white/72">
                      {offer.tag}
                    </Badge>
                    <p className="mt-4 text-lg  text-white">{offer.title}</p>
                    <p className="mt-2 text-sm  text-[#6DFF3B]">
                      {offer.value}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-white/60">
                      {offer.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[28px] border-white/[0.08] bg-[#101216] shadow-[0_18px_56px_-30px_rgba(0,0,0,0.85)]">
            <div className="relative aspect-[16/8.4] overflow-hidden">
              <ImageWithFallback
                src={asset("/tournaments/tournaments-events-bg.png")}
                alt="Tournament events"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 image-overlay bg-[linear-gradient(180deg,rgba(5,5,5,0.06),rgba(5,5,5,0.88))]" />
              <div className="absolute left-5 top-5 rounded-full border border-[#6DFF3B]/20 bg-[#6DFF3B]/10 px-3 py-1 text-xs  uppercase tracking-[0.22em] text-[#6DFF3B]">
                Tournaments & events
              </div>
            </div>

            <CardContent className="space-y-4 p-6">
              {events.map((event) => (
                <div
                  key={event.title}
                  className="block cursor-pointer"
                  onClick={() => {
                    if (!currentUser) {
                      toast.error("Please sign up to view tournaments & events.");
                      navigate("/register");
                    } else {
                      navigate("/tournaments");
                    }
                  }}
                >
                  <div className="flex gap-4 rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-3 transition hover:border-[#6DFF3B]/20 hover:bg-white/[0.05]">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[18px]">
                      <ImageWithFallback
                        src={event.image}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm  text-white">{event.title}</p>
                          <p className="mt-1 text-xs text-white/52">
                            {event.location}
                          </p>
                        </div>
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-white/58">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>{event.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export function WhySportXClub() {
  return (
    <section id="about" className="py-12 md:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why SportXClub"
          title="Built for booking speed, tournament control, and trust."
          description="A premium product should feel clear, secure, and deliberate at every step of the journey."
          centered
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {whyCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
            >
              <Card className="h-full rounded-[22px] border-white/[0.08] bg-[#101216] shadow-[0_18px_56px_-30px_rgba(0,0,0,0.85)]">
                <CardContent className="flex h-full flex-col gap-5 p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#6DFF3B]/18 bg-[#6DFF3B]/10">
                    <img
                      src={card.icon}
                      alt=""
                      aria-hidden="true"
                      className="h-7 w-7 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg  text-white">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/64">
                      {card.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TournamentCTA() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "relative overflow-hidden rounded-[28px] border",
            isDark
              ? "border-white/[0.08] bg-[#101216]"
              : "border-slate-200 bg-[#F5F5F5]",
          )}
        >
          <div className="absolute inset-0">
            <img
              src={asset("/tournaments/tournament-launchpad-bg.png")}
              alt=""
              aria-hidden="true"
              className={cn(
                "h-full w-full object-cover",
                isDark ? "opacity-90" : "opacity-100",
              )}
            />

            <div
              className={cn(
                "absolute inset-0",
                isDark
                  ? "bg-[linear-gradient(90deg,rgba(5,5,5,0.96)_0%,rgba(5,5,5,0.85)_45%,rgba(5,5,5,0.25)_100%)]"
                  : "bg-[linear-gradient(90deg,rgba(245,245,245,0.55)_0%,rgba(245,245,245,0.40)_45%,rgba(245,245,245,0.10)_100%)]",
              )}
            />
          </div>

          <div className="relative grid gap-10 px-6 py-10 md:px-10 md:py-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:px-12">
            <div className="max-w-2xl">
              <Badge
                className={cn(
                  "rounded-full border px-4 py-2 text-xs  uppercase tracking-[0.26em]",
                  isDark
                    ? "border-[#6DFF3B]/20 bg-[#6DFF3B]/10 text-[#6DFF3B]"
                    : "border-[#6DFF3B]/30 bg-[#6DFF3B]/15 text-[#3eb315]",
                )}
              >
                Tournament launchpad
              </Badge>
              <h2
                className={cn(
                  "mt-6 text-3xl  tracking-tight md:text-5xl md:leading-[1.04]",
                  isDark ? "text-white" : "text-slate-900",
                )}
              >
                Host your tournament with the same polish players expect from
                the app.
              </h2>
              <p
                className={cn(
                  "mt-5 max-w-xl text-base leading-8 md:text-lg",
                  isDark ? "text-white/70" : "text-slate-600",
                )}
              >
                Promote brackets, prize pools, and registration with a premium
                call-to-action section that feels credible and production-ready.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={(e) => {
                    if (!currentUser) {
                      e.preventDefault();
                      toast.error("Please login first to host a tournament.");
                      navigate("/login");
                    } else {
                      navigate("/organizer-dashboard");
                    }
                  }}
                  className={cn(
                    "h-12 rounded-full px-6 cursor-pointer",
                    isDark
                      ? "bg-[#6DFF3B] text-[#050505] hover:bg-[#86ff60]"
                      : "bg-[#6DFF3B] text-[#050505] hover:bg-[#5fe032] shadow-sm",
                  )}
                >
                  Host Your Tournament
                </Button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[440px]">
              <div
                className={cn(
                  "absolute -left-6 top-8 h-48 w-48 rounded-full blur-3xl",
                  isDark ? "bg-[#6DFF3B]/14" : "bg-[#6DFF3B]/10",
                )}
              />
              <div
                className={cn(
                  "absolute -right-6 bottom-0 h-52 w-52 rounded-full blur-3xl",
                  isDark ? "bg-white/[0.1]" : "bg-white/[0.4]",
                )}
              />
              <div
                className={cn(
                  "relative overflow-hidden rounded-[26px] border p-5 backdrop-blur-md",
                  isDark
                    ? "border-white/[0.08] bg-[#050505]/72"
                    : "border-slate-200 bg-white/95 shadow-xl shadow-slate-200/50",
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "h-24 w-24 shrink-0 overflow-hidden rounded-[22px] border",
                      isDark
                        ? "border-white/[0.08] bg-[#101216]"
                        : "border-slate-100 bg-slate-50",
                    )}
                  >
                    <ImageWithFallback
                      src={asset("/tournaments/tournament-1-cover.webp")}
                      alt="Tournament cover"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-xs  uppercase tracking-[0.24em]",
                        isDark ? "text-[#6DFF3B]/80" : "text-[#5fe032]",
                      )}
                    >
                      Featured event
                    </p>
                    <h3
                      className={cn(
                        "mt-2 text-lg ",
                        isDark ? "text-white" : "text-slate-900",
                      )}
                    >
                      City Five-A-Side Cup
                    </h3>
                    <p
                      className={cn(
                        "mt-2 text-sm",
                        isDark ? "text-white/60" : "text-slate-500",
                      )}
                    >
                      24 teams. 4 venues. 1 knockout weekend.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div
                    className={cn(
                      "rounded-[18px] border p-4",
                      isDark
                        ? "border-white/[0.08] bg-white/[0.03]"
                        : "border-slate-100 bg-white",
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs uppercase tracking-[0.22em]",
                        isDark ? "text-white/45" : "text-slate-500",
                      )}
                    >
                      Prize pool
                    </p>
                    <p
                      className={cn(
                        "mt-2 text-xl ",
                        isDark ? "text-white" : "text-slate-900",
                      )}
                    >
                      ₹2.5L
                    </p>
                  </div>
                  <div
                    className={cn(
                      "rounded-[18px] border p-4",
                      isDark
                        ? "border-white/[0.08] bg-white/[0.03]"
                        : "border-slate-100 bg-white",
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs uppercase tracking-[0.22em]",
                        isDark ? "text-white/45" : "text-slate-500",
                      )}
                    >
                      Registrations
                    </p>
                    <p
                      className={cn(
                        "mt-2 text-xl ",
                        isDark ? "text-white" : "text-slate-900",
                      )}
                    >
                      72%
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "mt-5 flex items-center gap-4 rounded-[20px] border p-4",
                    isDark
                      ? "border-[#6DFF3B]/16 bg-[#6DFF3B]/10"
                      : "border-[#6DFF3B]/20 bg-[#6DFF3B]/10",
                  )}
                >
                  <img
                    src={asset("/tournaments/trophy-3d.png")}
                    alt=""
                    aria-hidden="true"
                    className="h-16 w-16 object-contain"
                  />

                  <div>
                    <p
                      className={cn(
                        "text-sm ",
                        isDark ? "text-white" : "text-slate-900",
                      )}
                    >
                      Tournament-ready templates
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-sm",
                        isDark ? "text-white/60" : "text-slate-600",
                      )}
                    >
                      Landing pages, bracket pages, and updates in one flow.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



const storeProducts = [
  {
    id: 1,
    name: "Premium Football Size 5",
    category: "Equipment",
    price: "₹1,499",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1614632537190-23e4146777db?w=500&q=80",
  },
  {
    id: 2,
    name: "Professional Badminton Racket",
    category: "Equipment",
    price: "₹3,499",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&q=80",
  },
  {
    id: 3,
    name: "Cricket Bat Grade 1 English Willow",
    category: "Equipment",
    price: "₹8,500",
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=500&q=80",
  },
  {
    id: 4,
    name: "Sports Training Cones Set",
    category: "Accessories",
    price: "₹599",
    rating: "4.6",
    image:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&q=80",
  },
  {
    id: 5,
    name: "Elite Series Pickleball Paddle",
    category: "Equipment",
    price: "₹2,499",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500&q=80",
  },
  {
    id: 6,
    name: "Premium Leather Cricket Ball",
    category: "Accessories",
    price: "₹899",
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&q=80",
  },
];

const marqueeStyle = `
  @keyframes marqueeStore {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee-store {
    display: flex;
    width: max-content;
    animation: marqueeStore 24s linear infinite;
  }
  .animate-marquee-store:hover {
    animation-play-state: paused;
  }
`;

export function StoreSection() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  return (
    <section className="py-12 md:py-16 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: marqueeStyle }} />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pro Store"
          title="Sport Related Facilities & Equipment"
          description="Gear up with the best sports merchandise and equipment. Delivered straight to your venue or home."
        />
      </div>

      {/* Infinite scrolling marquee slider track */}
      <div className="relative overflow-hidden w-full mt-12 py-4">
        {/* Gradient fade edge masks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-[#050505] to-transparent z-10 pointer-events-none opacity-30" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-[#050505] to-transparent z-10 pointer-events-none opacity-30" />

        <div className="animate-marquee-store flex gap-6">
          {/* First list iteration */}
          {storeProducts.map((product) => (
            <div
              key={`first-${product.id}`}
              className="w-[280px] sm:w-[310px] shrink-0"
            >
              <div
                className={cn(
                  "relative flex flex-col h-full overflow-hidden rounded-3xl border transition-all duration-300",
                  isDark
                    ? "border-white/[0.08] bg-[#101216] hover:border-[#6DFF3B]/30 hover:shadow-[0_0_20px_rgba(109,255,59,0.05)]"
                    : "border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-emerald-500/30",
                )}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  <div className="absolute top-4 right-4">
                    <Badge
                      className={cn(
                        "rounded-full px-2 py-1 flex items-center gap-1",
                        isDark
                          ? "bg-[#050505]/80 text-[#6DFF3B] border border-[#6DFF3B]/30"
                          : "bg-white/90 text-emerald-700 border border-emerald-200",
                      )}
                    >
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs">{product.rating}</span>
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-5">
                  <span
                    className={cn(
                      "text-xs uppercase tracking-wider mb-2",
                      isDark ? "text-white/50" : "text-slate-500",
                    )}
                  >
                    {product.category}
                  </span>
                  <h3
                    className={cn(
                      "text-base leading-tight mb-3 line-clamp-2 h-10",
                      isDark ? "text-white" : "text-slate-900",
                    )}
                  >
                    {product.name}
                  </h3>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-dashed border-slate-200 dark:border-white/10">
                    <span
                      className={cn(
                        "text-lg font-bold",
                        isDark ? "text-[#6DFF3B]" : "text-emerald-600",
                      )}
                    >
                      {product.price}
                    </span>
                    <Button
                      size="sm"
                      className={cn(
                        "rounded-full px-4 text-xs tracking-wide transition-all group",
                        isDark
                          ? "border border-[#6DFF3B] bg-transparent text-white hover:bg-[#6DFF3B] hover:text-[#050505]"
                          : "border border-[#6DFF3B] bg-transparent text-slate-800 hover:bg-[#6DFF3B] hover:text-[#050505]",
                      )}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Second copy for seamless looping */}
          {storeProducts.map((product) => (
            <div
              key={`second-${product.id}`}
              className="w-[280px] sm:w-[310px] shrink-0"
            >
              <div
                className={cn(
                  "relative flex flex-col h-full overflow-hidden rounded-3xl border transition-all duration-300",
                  isDark
                    ? "border-white/[0.08] bg-[#101216] hover:border-[#6DFF3B]/30 hover:shadow-[0_0_20px_rgba(109,255,59,0.05)]"
                    : "border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-emerald-500/30",
                )}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  <div className="absolute top-4 right-4">
                    <Badge
                      className={cn(
                        "rounded-full px-2 py-1 flex items-center gap-1",
                        isDark
                          ? "bg-[#050505]/80 text-[#6DFF3B] border border-[#6DFF3B]/30"
                          : "bg-white/90 text-emerald-700 border border-emerald-200",
                      )}
                    >
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs">{product.rating}</span>
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-5">
                  <span
                    className={cn(
                      "text-xs uppercase tracking-wider mb-2",
                      isDark ? "text-white/50" : "text-slate-500",
                    )}
                  >
                    {product.category}
                  </span>
                  <h3
                    className={cn(
                      "text-base leading-tight mb-3 line-clamp-2 h-10",
                      isDark ? "text-white" : "text-slate-900",
                    )}
                  >
                    {product.name}
                  </h3>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-dashed border-slate-200 dark:border-white/10">
                    <span
                      className={cn(
                        "text-lg font-bold",
                        isDark ? "text-[#6DFF3B]" : "text-emerald-600",
                      )}
                    >
                      {product.price}
                    </span>
                    <Button
                      size="sm"
                      className={cn(
                        "rounded-full px-4 text-xs tracking-wide transition-all group",
                        isDark
                          ? "border border-[#6DFF3B] bg-transparent text-white hover:bg-[#6DFF3B] hover:text-[#050505]"
                          : "border border-[#6DFF3B] bg-transparent text-slate-800 hover:bg-[#6DFF3B] hover:text-[#050505]",
                      )}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mt-10 flex justify-center">
          <Button
            variant="outline"
            className={cn(
              "rounded-full border-dashed px-8 h-12 transition-all",
              isDark
                ? "border-white/20 text-white hover:border-[#6DFF3B]/50 hover:bg-[#6DFF3B]/10 hover:text-[#6DFF3B]"
                : "border-slate-300 text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700",
            )}
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
}

const galleryTurfs = [
  {
    id: 1,
    name: "Elite Football Arena",
    location: "Mumbai Central",
    rating: "4.9",
    reviews: 124,
    image:
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80",
    className: "md:col-span-2 md:row-span-2",
  },
  {
    id: 2,
    name: "Smash & Drive Badminton",
    location: "Andheri West",
    rating: "4.8",
    reviews: 89,
    image:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    id: 3,
    name: "GreenPark Tennis Club",
    location: "Bandra",
    rating: "4.7",
    reviews: 56,
    image:
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&q=80",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    id: 4,
    name: "Hoops Rooftop Court",
    location: "South Mumbai",
    rating: "5.0",
    reviews: 210,
    image:
      "https://images.unsplash.com/photo-1505666287802-931dc83948e9?w=800&q=80",
    className: "md:col-span-2 md:row-span-1",
  },
];

export function TurfGallery() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16 relative overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Gallery"
          title="Immersive Turf Experiences"
          description="A glimpse into the premium sports facilities available for booking."
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 auto-rows-[280px] gap-4">
          {galleryTurfs.map((turf) => (
            <motion.div
              key={turf.id}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={cn(
                "group relative overflow-hidden rounded-3xl bg-[#101216]",
                turf.className,
              )}
            >
              <ImageWithFallback
                src={turf.image}
                alt={turf.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="absolute top-4 right-4 z-10">
                <div className="flex flex-col items-end">
                  <Badge
                    className="rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg backdrop-blur-md border bg-[#050505]/60 text-[#6DFF3B] border-[#6DFF3B]/30"
                  >
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="text-sm">{turf.rating}</span>
                  </Badge>
                  <span className="mt-1 text-[10px] text-[#ffffff]/90 drop-shadow-md mr-1">
                    {turf.reviews} Reviews
                  </span>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full p-6 z-10 translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-[#6DFF3B]" />
                  <span className="text-sm text-[#ffffff]/90 drop-shadow-md">
                    {turf.location}
                  </span>
                </div>
                <h3 className="text-2xl text-[#ffffff] drop-shadow-lg">
                  {turf.name}
                </h3>

                <div className="mt-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Button
                    onClick={() => {
                      if (!currentUser) {
                        toast.error("Please login first to view venue details and book.");
                        navigate("/login");
                      } else {
                        navigate("/venues");
                      }
                    }}
                    variant="outline"
                    className="rounded-full bg-white/10 text-[#ffffff] border-white/20 hover:bg-[#6DFF3B] hover:text-black hover:border-transparent backdrop-blur-sm transition-all cursor-pointer"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  return (
    <div
      className={cn(
        "theme-adaptive min-h-screen",
        isDark ? "bg-[#050505] text-white" : "bg-white text-slate-900",
      )}
    >
      <Navbar />
      <HeroSection />
      <StoreSection />
      <SportsCategories />
      <DiscoveryRails />
      <TurfGallery />
      <WhySportXClub />
      <TournamentCTA />
      <AppDownloadCTA />

      <Footer />
    </div>
  );
}
