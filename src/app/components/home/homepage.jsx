import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import useEmblaCarousel from "embla-carousel-react";
import { toast } from "sonner";
import { useAuth } from "../../providers/auth-provider";
import { motion, useInView, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
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
  MoreVertical,
  X,
  User,
  LogOut,
  Smartphone,
  Download,
  CreditCard,
  Headset,
} from "lucide-react";

import { useIsMobile } from "../ui/use-mobile";

import { Badge } from "../ui/badge";
import { LocationModal } from "./LocationModal";
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

function ChevronLeft120({ className = "h-8 w-8 md:h-10 md:w-10 text-slate-900 dark:text-white", strokeWidth = 1.35 }) {
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

function ChevronRight120({ className = "h-8 w-8 md:h-10 md:w-10 text-slate-900 dark:text-white", strokeWidth = 1.35 }) {
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

const sports = [
  {
    name: "Football",
    count: "1,248 venues",
    image: asset("/venues/new_football_turf_2.png"),
  },
  {
    name: "Cricket",
    count: "892 venues",
    image: asset("/venues/new_cricket_turf_2.png"),
  },
  {
    name: "Badminton",
    count: "734 venues",
    image: asset("/venues/new_badminton_turf.png"),
  },
  {
    name: "Basketball",
    count: "641 venues",
    image: asset("/sports/cat-basketball.webp"),
  },
  {
    name: "Swimming",
    count: "418 venues",
    image: asset("/sports/cat-swimming.webp"),
  },
  {
    name: "Tennis",
    count: "518 venues",
    image: asset("/venues/new_tennis_turf.png"),
  },
  {
    name: "Padel",
    count: "102 venues",
    image: asset("/sports/cat-padel.webp"),
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
    icon: ShieldCheck,
  },
  {
    title: "Secure Payments",
    description:
      "Keep every transaction clear and safe with a checkout flow that feels serious and dependable.",
    icon: CreditCard,
  },
  {
    title: "Instant Booking",
    description:
      "Convert interest into a confirmed slot quickly with a clean search, structured cards, and direct action.",
    icon: Zap,
  },
  {
    title: "24x7 Support",
    description:
      "Help is available when players, venues, or organizers need it most, without making the UI feel noisy.",
    icon: Headset,
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
              ? "h-1 w-1 bg-emerald-600/60"
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

function SectionHeading({ eyebrow, title, description, centered = false, titleClassName }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  return (
    <div className={cn("max-w-3xl", centered && "mx-auto text-center")}>
      {eyebrow && !title && (
        <h2 className={cn(
          "text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center",
          centered && "justify-center"
        )}>
          <span>{eyebrow}</span>
        </h2>
      )}

      {eyebrow && title && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 dark:border-emerald-400/20 text-emerald-700 dark:text-white text-xs font-bold tracking-wider uppercase mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-600 animate-pulse" />
          {eyebrow}
        </div>
      )}

      {title && (
        <h2 className={cn("mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-black tracking-tight text-slate-900 dark:text-white leading-tight", titleClassName)}>
          {title}
        </h2>
      )}

      {description && (
        <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
          {description}
        </p>
      )}
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
  const drawerRef = useRef(null);
  const navigate = useNavigate();

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
    { label: "Turf", to: "/venues" },
    { label: "Cart", to: "/bookings" },
    { label: "Events", to: "/community" },
    { label: "Coaching", to: "/ai-assistant" },
    { label: "Tournaments", to: "/tournaments" },
    {
      label: "Admin Login",
      to: "/admin-login",
    },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b backdrop-blur-2xl transition-colors duration-200 shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.6)]",
          isDark
            ? "border-white/[0.08] bg-black/95 text-white"
            : "border-slate-200/80 bg-white/95 text-slate-900",
        )}
      >
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 pl-6 lg:pl-8 pr-0">
          {/* Left Section: Logo */}
          <div className="flex items-center justify-start">
            <a href="/" className="flex items-center translate-y-[5px] md:translate-y-[8px]">
              <Logo className="h-[50px] md:h-[80px]" />
            </a>
          </div>

          {/* Right Section: Sign In + Hamburger Menu Toggle */}
          <div className="flex items-center justify-end gap-3 md:gap-4">
            {/* Location Pill (Moved here) */}
            <div className="hidden md:block">
              <LocationModal
                activeCity={activeCity}
                onCitySelect={handleCitySelect}
                trigger={
                  <button
                    className={cn(
                      "group relative flex items-center gap-1.5 px-3 py-2 rounded-md text-[13px] lg:text-[14px] font-medium transition-all cursor-pointer bg-transparent text-black dark:text-white"
                    )}
                  >
                    <MapPin className="h-3.5 w-3.5 lg:h-4 lg:w-4 shrink-0 text-emerald-600 dark:text-white" />
                    <span className="truncate max-w-[200px] lg:max-w-[250px] leading-normal pb-0.5 text-black dark:text-white group-hover:scale-110 transition-transform duration-300 origin-left">
                      {activeCity === "All" ? "All Areas" : activeCity}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-80 text-black dark:text-white" />
                  </button>
                }
              />
            </div>

            {/* Theme Toggle Button */}
            <div className="hidden md:block">
              <ThemeToggleButton
                className={cn(
                  "flex h-10 w-10 items-center justify-center transition hover:bg-transparent",
                  isDark
                    ? "text-white/80 hover:text-white"
                    : "text-slate-700 hover:text-slate-900"
                )}
                variant="ghost"
              />
            </div>
            {/* Auth Section: Login or Profile */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={cn(
                    "group relative flex h-10 items-center justify-center gap-2 transition px-2 lg:px-4 cursor-pointer rounded-md",
                    isDark
                      ? "bg-transparent text-white"
                      : "bg-transparent text-emerald-600",
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
                        to={currentUser?.role === 'owner' ? '/admin-panel' : '/profile'}
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
                    "flex h-10 items-center justify-center px-5 text-sm tracking-wide transition-all cursor-pointer group",
                    isDark
                      ? "bg-transparent text-white hover:shadow-none"
                      : "bg-transparent text-slate-800 hover:shadow-none",
                  )}
                >
                  <span className="group-hover:scale-110 transition-transform duration-300">Login</span>
                </button>
              </Link>
            )}

            {/* Hamburger Menu Toggle Button */}
            <button
              id="hamburger-menu-toggle-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition duration-200 cursor-pointer bg-transparent hover:bg-transparent group",
                isDark
                  ? "text-white/80 hover:text-white"
                  : "text-slate-700 hover:text-slate-900",
              )}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                >
                  <line x1="4" y1="9" x2="20" y2="9" />
                  <line x1="4" y1="15" x2="14" y2="15" />
                </svg>
              )}
            </button>

            {/* Removed Theme Toggle Button */}
          </div>
        </div>

        {/* Mobile/Tablet Location pill (shown only below 'md' screen size) */}
        <div className="md:hidden px-4 pb-3">
          <div
            className={cn(
              "flex items-center justify-center w-full rounded-full border px-4 py-2.5 shadow-sm transition-all duration-200",
              isDark
                ? "border-white/[0.08] bg-white/[0.03]"
                : "border-slate-200 bg-[#F1F3F6]/60",
            )}
          >
            <LocationModal
              activeCity={activeCity}
              onCitySelect={handleCitySelect}
              trigger={
                <button className="flex items-center gap-1.5 shrink-0 text-sm font-medium cursor-pointer text-black dark:text-white">
                  <MapPin
                    className="h-4 w-4 shrink-0 text-emerald-600 dark:text-white"
                  />
                  <span className="truncate max-w-[200px] text-black dark:text-white">{activeCity === "All" ? "All Areas" : activeCity}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-80 text-black dark:text-white" />
                </button>
              }
            />
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
              "fixed top-0 right-0 bottom-0 w-[210px] max-w-[70vw] z-[70] shadow-2xl px-6 py-4 flex flex-col gap-2 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-l",
              isDark
                ? "bg-[#0b0c0e] border-white/[0.08]"
                : "bg-white border-slate-200",
            )}
          >
            <div className="flex items-center justify-between mb-1">
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
                  "p-2 rounded-full transition cursor-pointer text-foreground hover:text-emerald-500 hover:bg-emerald-500/10",
                )}
              >
                <X className="h-5 w-5" />
              </button>
            </div>


            {/* Menu list items */}
            <div className="flex flex-col">
              {menuItems.map((item) => {
                const itemContent = (
                  <div className="flex items-center justify-between w-full py-3 px-3 border-b border-slate-100 dark:border-white/[0.05] transition-colors duration-150 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] group">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-sm tracking-wide transition-colors duration-150",
                          item.isGreen
                            ? isDark
                              ? "text-white"
                              : "text-emerald-600"
                            : isDark
                              ? "text-white/90 group-hover:text-white"
                              : "text-slate-800 group-hover:text-emerald-600",
                        )}
                      >
                        {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge !== undefined && (
                        <span className="text-xs font-bold text-black dark:text-white">
                          {item.badge}
                        </span>
                      )}
                      {item.hasChevron && (
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-colors duration-150",
                            isDark
                              ? "text-white/20 group-hover:text-white"
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
                    ? "border border-emerald-600/18 bg-emerald-600/10"
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

const heroSlides = [
  {
    id: 0,
    image: asset("/hero/ai_hero_1.jpg"),
    tag: "EXCLUSIVE OFFER",
    title: "Flat 15% Cashback on Early Bird & Night Turf Bookings",
    description: "Book verified turfs before 11 AM or after 10 PM. Instant refund-safe slots & zero extra fees.",
    badgeText: "LIMITED TIME",
    primaryAction: "Book a Turf Now",
    primaryLink: "/venues",
    secondaryAction: "Explore Passes",
    secondaryLink: "/venues",
  },
  {
    id: 2,
    image: asset("/hero/ai_hero_3.jpg"),
    tag: "MATCHMAKING & LOBBIES",
    title: "Never Play Short – Join Open Lobbies in Your City",
    description: "Find available players near you or create your own open lobby. Connect, play, and rate players.",
    badgeText: "COMMUNITY FEATURE",
    primaryAction: "Find Open Lobbies",
    primaryLink: "/open-lobbies",
    secondaryAction: "Book Squad Slot",
    secondaryLink: "/squad-booking",
  },
  {
    id: 3,
    image: asset("/hero/ai_hero_4.jpg"),
    tag: "CLUB PASS",
    title: "SportX Club All-Access Priority Pass",
    description: "Get up to 40% discount on regular bookings, priority slot reservation, and free cancellations.",
    badgeText: "SAVINGS PASS",
    primaryAction: "Get Club Pass",
    primaryLink: "/venues",
    secondaryAction: "Learn More",
    secondaryLink: "/venues",
  },
  {
    id: 4,
    image: asset("/hero/new_hero_5.jpg"),
    tag: "PREMIUM VENUES",
    title: "FIFA-Standard Floodlit Night Turfs & Arenas",
    description: "High-lux pro lighting, shock-pad turfing, rooftop courts, and player lounge amenities.",
    badgeText: "VERIFIED ARENAS",
    primaryAction: "Browse All Venues",
    primaryLink: "/venues",
    secondaryAction: "View Night Slots",
    secondaryLink: "/venues",
  },
];

const recommendedVenues = [
  {
    id: 1,
    name: "Champions Turf & Football Arena",
    location: "Powai, Mumbai",
    sport: "Football • Box Cricket",
    rating: "4.9",
    reviews: "128",
    price: "₹1,200",
    unit: "/ hr",
    badge: "PROMOTED",
    image: asset("/venues/champions_sports_arena_football.jpg"),
  },
  {
    id: 2,
    name: "Metro Sports Pitch & Stadium",
    location: "Bandra West, Mumbai",
    sport: "Cricket • Football",
    rating: "4.8",
    reviews: "96",
    price: "₹1,500",
    unit: "/ hr",
    badge: "POPULAR",
    image: asset("/venues/metro_sports_park_cricket.jpg"),
  },
  {
    id: 3,
    name: "Grand Playfield Badminton Club",
    location: "Andheri West, Mumbai",
    sport: "Badminton",
    rating: "4.9",
    reviews: "142",
    price: "₹600",
    unit: "/ hr",
    badge: "FAST FILLING",
    image: asset("/venues/grand_playfield_badminton.png"),
  },
  {
    id: 4,
    name: "GreenPark Pro Tennis Court",
    location: "Juhu, Mumbai",
    sport: "Lawn Tennis",
    rating: "4.7",
    reviews: "64",
    price: "₹1,000",
    unit: "/ hr",
    badge: "TOP RATED",
    image: asset("/venues/new_tennis_turf.png"),
  },
  {
    id: 5,
    name: "Spike & Jump Volleyball Arena",
    location: "South Mumbai",
    sport: "Volleyball",
    rating: "5.0",
    reviews: "210",
    price: "₹1,800",
    unit: "/ hr",
    badge: "FEATURED",
    image: asset("/venues/new_volleyball_turf.png"),
  },
];

export function HeroSection() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || isPaused) return;
    const timer = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [emblaApi, isPaused]);

  const handlePrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  const handleNext = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  const handleDotClick = (index) => {
    if (emblaApi) emblaApi.scrollTo(index);
  };

  return (
    <section className={cn(
      "relative w-full overflow-hidden pt-0 pb-0 md:pt-0 md:pb-0 isolate transition-colors duration-300",
      isDark ? "bg-[#060813] text-white" : "bg-slate-50/90 text-slate-900"
    )}>
      {/* Ambient Glow Backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={cn(
          "absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[850px] rounded-full blur-[120px]",
          isDark
            ? "bg-gradient-to-b from-emerald-600/15 via-emerald-600/10 to-transparent"
            : "bg-gradient-to-b from-emerald-500/20 via-teal-400/10 to-transparent"
        )} />
      </div>

      <div className="relative w-full">

        {/* BookMyShow Style Wide Banner Carousel Track (Edge-to-Edge Format) */}
        <div
          className="relative w-full mb-0 mt-0 group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden w-full cursor-grab active:cursor-grabbing" ref={emblaRef}>
            <div className="flex touch-pan-y items-center h-[220px] sm:h-[260px] md:h-[300px] lg:h-[330px]">
              {heroSlides.map((slide, index) => {
                const isActive = currentSlide === index;
                return (
                  <div
                    key={index}
                    className="relative flex-[0_0_100%] min-w-0 h-full"
                  >
                    <div className={cn(
                      "relative w-full h-full overflow-hidden border-y transition-all duration-500 shadow-2xl",
                      isDark ? "border-white/20 bg-[#101216]" : "border-y-slate-300/90 bg-white",
                      isActive ? "opacity-100" : "opacity-100 cursor-pointer"
                    )}
                      onClick={() => !isActive && handleDotClick(index)}>
                      {/* Background Banner Image */}
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="absolute inset-0 h-full w-full object-cover brightness-100 contrast-100"
                      />


                      {/* Banner Content (Only visible on active slide) */}
                      <div className={cn("absolute inset-0 flex flex-col justify-end px-5 sm:px-8 md:px-10 pb-2 md:pb-4 md:max-w-xl lg:max-w-2xl z-10 transition-opacity duration-500", isActive ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
                        <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-[2.3rem] font-normal tracking-tight !text-white leading-[1.18] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                          {slide.title}
                        </h1>

                        <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-3">
                          <Link to={slide.primaryLink}>
                            <Button variant="outline" className="h-9 sm:h-11 px-5 sm:px-7 rounded-full !border-white/50 !bg-transparent !text-white hover:!bg-white/20 backdrop-blur-md font-bold text-xs sm:text-sm transition-all hover:scale-105 shadow-lg cursor-pointer">
                              {slide.primaryAction}
                            </Button>
                          </Link>
                          <Link to={slide.secondaryLink}>
                            <Button variant="outline" className="h-9 sm:h-11 px-4 sm:px-6 rounded-full !border-white/50 !bg-transparent !text-white hover:!bg-white/20 hover:!text-white backdrop-blur-md text-xs sm:text-sm font-bold cursor-pointer shadow-lg transition-all">
                              {slide.secondaryAction}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          {/* Carousel Pagination Dots */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 z-20">
            {heroSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => handleDotClick(idx)}
                className={cn(
                  "h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer",
                  currentSlide === idx
                    ? (isDark
                      ? "w-4 sm:w-5 bg-emerald-600 shadow-[0_0_12px_rgba(109,255,59,0.8)]"
                      : "w-4 sm:w-5 bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.4)]")
                    : "w-2 sm:w-2.5 bg-white/40 hover:bg-white/70"
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export function RecommendedVenuesSection({ asSlider = false }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -350, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 350, behavior: "smooth" });
    }
  };

  return (
    <section className={cn(
      "relative w-full overflow-hidden pb-8 md:pb-12 isolate transition-colors duration-300",
      isDark ? "bg-[#060813] text-white" : "bg-slate-50/90 text-slate-900"
    )}>
      <div className="relative w-full">
        {/* Recommended Sports Venues Section */}
        <div className="mt-8 sm:mt-12 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "h-2 w-2 rounded-full animate-pulse",
                  isDark ? "bg-emerald-600" : "bg-emerald-500"
                )} />
                <span className={cn(
                  "text-xs font-bold uppercase tracking-widest",
                  isDark ? "text-white" : "text-emerald-600"
                )}>
                  Handpicked for you
                </span>
              </div>
              <h2 className={cn(
                "text-lg sm:text-xl font-extrabold tracking-tight mt-0.5",
                isDark ? "text-white" : "text-slate-900"
              )}>
                Recommended Venues
              </h2>
            </div>
            <Link
              to="/venues"
              className={cn(
                "flex items-center gap-1 text-xs sm:text-sm font-semibold transition-colors group cursor-pointer",
                isDark ? "text-white hover:text-white/80" : "text-emerald-600 hover:text-emerald-700"
              )}
            >
              <span>See All</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Dynamic Grid/Slider of Poster-Style Cards (BookMyShow Movie Poster Format) */}
          <div className={cn(asSlider ? "relative group/section" : "")}>
            {asSlider && (
              <button
                onClick={scrollLeft}
                aria-label="Scroll left"
                className="hidden md:flex absolute -left-7 sm:-left-9 lg:-left-11 top-1/2 -translate-y-1/2 z-30 h-10 w-10 md:h-12 md:w-12 items-center justify-center bg-transparent text-slate-900 dark:text-white hover:scale-125 active:scale-95 transition-all opacity-100 cursor-pointer shadow-none"
              >
                <ChevronLeft120 className="h-8 w-8 md:h-10 md:w-10 text-slate-900 dark:text-white" strokeWidth={1.35} />
              </button>
            )}

            <div
              ref={asSlider ? scrollRef : null}
              className={cn(
                asSlider
                  ? "flex snap-x snap-mandatory overflow-x-auto gap-3 sm:gap-5 pb-6 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5"
              )}
            >
              {recommendedVenues.map((venue) => (
                <motion.div
                  key={venue.id}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300",
                    asSlider ? "w-[160px] sm:w-[200px] md:w-[220px] lg:w-[240px] flex-shrink-0 snap-start" : "",
                    isDark
                      ? "border-white/10 bg-[#101216] shadow-xl hover:border-emerald-600/30"
                      : "border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-emerald-500/30"
                  )}
                >
                  <Link to={`/venues/${venue.id}`} state={{ venue }} className="block relative aspect-[3/4] w-full overflow-hidden">
                    <ImageWithFallback
                      src={venue.image}
                      alt={venue.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                    {/* Top Badges Removed as per user request */}

                    <div className="absolute top-2.5 right-2.5 z-10">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-white drop-shadow-md leading-none">
                        <Star className="h-3 w-3 fill-emerald-500 text-emerald-500 shrink-0" />
                        <span className="leading-none">{venue.rating}</span>
                        <span className="text-white/80 text-[9px] font-medium ml-0.5 leading-none">({venue.reviews || Math.floor(40 + (venue.id * 13) % 200)} Reviews)</span>
                      </div>
                    </div>

                    {/* Bottom Overlay & Text */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pt-16 pb-1.5 px-2.5 z-10 flex items-end justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-extrabold !text-white capitalize tracking-wider drop-shadow-sm mb-0.5">
                          {venue.sport.toLowerCase()}
                        </p>
                        <div className="flex flex-col gap-0.5 w-full">
                          <h3 className="text-sm font-extrabold !text-white leading-snug line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                            {venue.name}
                          </h3>
                          <span className="text-[10px] !text-white/80 font-medium truncate drop-shadow">
                            {typeof venue.location === 'object' ? (venue.location?.city || venue.location?.address || 'Location unavailable') : venue.location}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => e.preventDefault()}
                        className="bg-transparent text-white border border-white/50 hover:bg-white/10 hover:border-white hover:text-white font-semibold rounded-lg h-7 px-3 text-[10px] transition-colors shadow-none shrink-0"
                      >
                        Book Slot
                      </Button>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {asSlider && (
              <button
                onClick={scrollRight}
                aria-label="Scroll right"
                className="hidden md:flex absolute -right-7 sm:-right-9 lg:-right-11 top-1/2 -translate-y-1/2 z-30 h-10 w-10 md:h-12 md:w-12 items-center justify-center bg-transparent text-slate-900 dark:text-white hover:scale-125 active:scale-95 transition-all opacity-100 cursor-pointer shadow-none"
              >
                <ChevronRight120 className="h-8 w-8 md:h-10 md:w-10 text-slate-900 dark:text-white" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

function SportCard({ name, count, image, index }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      whileHover={{ y: -6, scale: 1.015 }}
      className="group shrink-0 snap-center w-[45vw] sm:w-[calc(33.33%-5.33px)] md:w-[calc(25%-6px)] lg:w-[calc(16.666%-6.66px)]"
    >
      <Link to="/venues" state={{ sport: name }} className="block">
        <div
          className={cn(
            "relative aspect-[2/3] overflow-hidden rounded-lg border transition-all duration-300 ease-out",
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

          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300 z-10" />

          <div className="absolute inset-x-0 bottom-0 z-20 p-6 sm:p-7">
            <p
              className="text-lg sm:text-xl leading-tight !text-white drop-shadow-md font-medium transition-colors duration-300"
            >
              {name}
            </p>
            <div className="flex items-center justify-between gap-3">
              <p
                className="text-sm leading-tight !text-white/80 drop-shadow-sm transition-colors duration-300"
              >
                {count}
              </p>
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
      className="group shrink-0 snap-center w-[45vw] sm:w-[calc(33.33%-10.66px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-12.8px)]"
    >
      <Link to="/venues" className="block h-full">
        <div
          className={cn(
            "relative flex h-full min-h-[280px] overflow-hidden rounded-lg border transition-all duration-300 ease-out",
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
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
          <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/60 to-transparent z-10" />

          <div className="relative z-20 flex flex-1 flex-col justify-between p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <Badge
                className="rounded-full border border-white/[0.08] bg-white/[0.06] !text-white px-3 py-1 text-[0.7rem] uppercase tracking-[0.2em] transition-all duration-300"
              >
                More
              </Badge>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-[#050505]/70 text-emerald-600 transition-all duration-300 ease-out"
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

      animationFrameId = requestAnimationFrame(animate);
    };

    let isWindowScrolling = false;
    let scrollTimeout;
    const handleScroll = () => {
      isWindowScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isWindowScrolling = false;
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    const safeAnimate = () => {
      if (!isWindowScrolling) {
        animate();
      } else {
        animationFrameId = requestAnimationFrame(safeAnimate);
      }
    };

    safeAnimate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
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
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -350, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 350, behavior: "smooth" });
    }
  };

  return (
    <section className="pt-1 pb-0 relative overflow-hidden group/section">
      <SportsBackgroundAnimation />
      <div className="mx-auto max-w-[1700px] px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          eyebrow="Popular Sports"
        />

        <div className="relative mt-1.5">
          <button
            onClick={scrollLeft}
            aria-label="Scroll left"
            className="hidden md:flex absolute -left-7 sm:-left-9 lg:-left-11 top-[calc(50%-12px)] -translate-y-1/2 z-30 h-10 w-10 md:h-12 md:w-12 items-center justify-center bg-transparent text-slate-900 dark:text-white hover:scale-125 active:scale-95 transition-all opacity-100 cursor-pointer shadow-none"
          >
            <ChevronLeft120 className="h-8 w-8 md:h-10 md:w-10 text-slate-900 dark:text-white" strokeWidth={1.35} />
          </button>

          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory overflow-x-auto gap-2 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {sports.map((sport, index) => (
              <SportCard key={sport.name} index={index} {...sport} />
            ))}
          </div>

          <button
            onClick={scrollRight}
            aria-label="Scroll right"
            className="hidden md:flex absolute -right-7 sm:-right-9 lg:-right-11 top-[calc(50%-12px)] -translate-y-1/2 z-30 h-10 w-10 md:h-12 md:w-12 items-center justify-center bg-transparent text-slate-900 dark:text-white hover:scale-125 active:scale-95 transition-all opacity-100 cursor-pointer shadow-none"
          >
            <ChevronRight120 className="h-8 w-8 md:h-10 md:w-10 text-slate-900 dark:text-white" strokeWidth={1.35} />
          </button>
        </div>
      </div>
    </section>
  );
}

export function DiscoveryRails() {
  return (
    <section id="how-it-works" className="pt-2 pb-4 md:pt-4 md:pb-6">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <Card className="overflow-hidden rounded-[28px] border-white/[0.08] bg-[#101216] shadow-[0_18px_56px_-30px_rgba(0,0,0,0.85)]">
            <CardContent className="space-y-5 p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.72rem]  uppercase tracking-[0.36em] text-emerald-600/85 dark:text-white/85">
                    Offers
                  </p>
                  <h2 className="mt-3 text-base sm:text-lg md:text-xl font-bold tracking-tight text-white">
                    Offers that feel clear, useful, and safe.
                  </h2>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-600/18 bg-emerald-600/10">
                  <Zap className="h-6 w-6 text-emerald-600 dark:text-white" />
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
                    <p className="mt-2 text-sm  text-emerald-600 dark:text-white">
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
              <div className="absolute left-5 top-5 rounded-full border border-emerald-600/20 bg-emerald-600/10 px-3 py-1 text-xs  uppercase tracking-[0.22em] text-emerald-600 dark:text-white">
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
                  <div className="flex gap-4 rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-3 transition hover:border-emerald-600/20 hover:bg-white/[0.05]">
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
                            {typeof event.location === 'object' ? (event.location?.city || event.location?.address || 'Location unavailable') : event.location}
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
    <section id="about" className="pt-2 pb-12 md:pt-4 md:pb-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why SportXClub"
          title="Built for booking speed, tournament control, and trust."
          centered
          titleClassName="!text-xl md:!text-2xl lg:!text-3xl"
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
                  <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-emerald-600/25 bg-emerald-600/10 shadow-[0_0_15px_rgba(109,255,59,0.15)]">
                    <card.icon className="h-6 w-6 text-emerald-600 dark:text-white filter drop-shadow-[0_2px_8px_rgba(109,255,59,0.3)]" />
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




const storeProducts = [
  {
    id: 1,
    name: "Premium Football Size 5",
    category: "Equipment",
    price: "₹1,499",
    rating: "4.8",
    image: asset("/sports/cat-football.webp"),
  },
  {
    id: 2,
    name: "Professional Badminton Racket",
    category: "Equipment",
    price: "₹3,499",
    rating: "4.9",
    image: asset("/sports/cat-badminton.webp"),
  },
  {
    id: 3,
    name: "Cricket Bat Grade 1 English Willow",
    category: "Equipment",
    price: "₹8,500",
    rating: "4.7",
    image: asset("/sports/cat-cricket.webp"),
  },
  {
    id: 4,
    name: "Sports Training Cones Set",
    category: "Accessories",
    price: "₹599",
    rating: "4.6",
    image: asset("/sports/cat-basketball.webp"),
  },
  {
    id: 5,
    name: "Elite Series Pickleball Paddle",
    category: "Equipment",
    price: "₹2,499",
    rating: "4.8",
    image: asset("/sports/cat-padel.webp"),
  },
  {
    id: 6,
    name: "Premium Leather Cricket Ball",
    category: "Accessories",
    price: "₹899",
    rating: "4.7",
    image: asset("/venues/new_cricket_turf_2.png"),
  },
  {
    id: 7,
    name: "Anti-Slip Performance Grip Socks",
    category: "Apparel",
    price: "₹399",
    rating: "4.9",
    image: asset("/sports/cat-swimming.webp"),
  },
  {
    id: 8,
    name: "Carbon Fiber Pro Shin Guards",
    category: "Accessories",
    price: "₹1,299",
    rating: "4.8",
    image: asset("/venues/champions_sports_arena_football.jpg"),
  },
  {
    id: 9,
    name: "Pro Match Tennis Balls (Pack of 3)",
    category: "Accessories",
    price: "₹649",
    rating: "4.7",
    image: asset("/sports/cat-tennis.webp"),
  },
  {
    id: 10,
    name: "Multi-Sport Duffel Bag 45L",
    category: "Apparel",
    price: "₹2,199",
    rating: "4.9",
    image: asset("/sports/cat-boxmma.webp"),
  },
];

export function StoreSection() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const navigate = useNavigate();

  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedItems, setAddedItems] = useState({});

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
  };

  const filteredModalProducts = storeProducts.filter((product) => {
    const matchesCat = selectedCat === "All" || product.category === selectedCat;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const containerRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);
  const lastScrollTime = useRef(0);
  const currentScrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    isDown.current = true;
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeftVal.current = containerRef.current.scrollLeft;
    containerRef.current.style.cursor = "grabbing";
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }
  };

  const handleMouseUp = () => {
    isDown.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    containerRef.current.scrollLeft = scrollLeftVal.current - walk;
  };

  const handleWheel = () => {
    lastScrollTime.current = Date.now();
  };

  const handleTouchStart = () => {
    lastScrollTime.current = Date.now();
  };

  const handleTouchMove = () => {
    lastScrollTime.current = Date.now();
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    currentScrollLeft.current = container.scrollLeft;

    const halfWidth = container.scrollWidth / 2;
    if (container.scrollLeft >= halfWidth) {
      container.scrollLeft -= halfWidth;
      currentScrollLeft.current = container.scrollLeft;
      if (isDown.current) {
        scrollLeftVal.current -= halfWidth;
      }
    } else if (container.scrollLeft <= 0) {
      container.scrollLeft += halfWidth;
      currentScrollLeft.current = container.scrollLeft;
      if (isDown.current) {
        scrollLeftVal.current += halfWidth;
      }
    }
  };

  useEffect(() => {
    if (isStoreModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isStoreModalOpen]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    currentScrollLeft.current = container.scrollLeft;

    let animationFrameId;
    const speed = 1.0;
    let isWindowScrolling = false;
    let scrollTimeout;

    const handleWindowScroll = () => {
      isWindowScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isWindowScrolling = false;
      }, 150);
    };

    window.addEventListener("scroll", handleWindowScroll, { passive: true });

    const animate = () => {
      const now = Date.now();
      const isUserScrolling = now - lastScrollTime.current < 1500;

      if (!isDown.current && !isUserScrolling && !isStoreModalOpen && !isWindowScrolling) {
        currentScrollLeft.current += speed;

        const halfWidth = container.scrollWidth / 2;
        if (currentScrollLeft.current >= halfWidth) {
          currentScrollLeft.current -= halfWidth;
        }

        container.scrollLeft = currentScrollLeft.current;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isStoreModalOpen]);

  return (
    <section className="pt-2 pb-2 md:pt-3 md:pb-4 relative overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pro Store"
          title="Sport Related Facilities & Equipment"
          titleClassName="!text-base sm:!text-lg md:!text-xl lg:!text-2xl"
        />
      </div>

      {/* Infinite scrolling marquee slider track */}
      <div className="relative overflow-hidden w-full py-4">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-[#050505] to-transparent z-10 pointer-events-none opacity-30" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-[#050505] to-transparent z-10 pointer-events-none opacity-30" />

        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onScroll={handleScroll}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className="flex gap-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden cursor-grab select-none w-full"
        >
          {storeProducts.map((product) => (
            <div
              key={`first-${product.id}`}
              className="w-[280px] sm:w-[310px] shrink-0"
            >
              <div
                className={cn(
                  "relative flex flex-col h-full overflow-hidden rounded-lg border transition-all duration-300",
                  isDark
                    ? "border-white/[0.08] bg-[#101216] hover:border-emerald-600/30 hover:shadow-[0_0_20px_rgba(109,255,59,0.05)]"
                    : "border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-emerald-500/30",
                )}
              >
                <div className="h-44 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative shrink-0">
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
                          ? "bg-[#050505]/80 text-emerald-600 dark:text-white border border-emerald-600/30"
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
                        isDark ? "text-white" : "text-emerald-600",
                      )}
                    >
                      {product.price}
                    </span>
                    <Button
                      size="sm"
                      onClick={(e) => handleAddToCart(e, product)}
                      className={cn(
                        "rounded-full px-4 text-xs tracking-wide transition-all group cursor-pointer",
                        addedItems[product.id]
                          ? "bg-emerald-600 text-white"
                          : isDark
                            ? "border border-white/20 bg-transparent text-white/80 hover:border-white hover:text-white"
                            : "border border-slate-300 bg-transparent text-slate-600 hover:border-slate-900 hover:text-slate-900",
                      )}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                      {addedItems[product.id] ? "Added ✓" : "Add"}
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
                  "relative flex flex-col h-full overflow-hidden rounded-lg border transition-all duration-300",
                  isDark
                    ? "border-white/[0.08] bg-[#101216] hover:border-emerald-600/30 hover:shadow-[0_0_20px_rgba(109,255,59,0.05)]"
                    : "border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-emerald-500/30",
                )}
              >
                <div className="h-44 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative shrink-0">
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
                          ? "bg-[#050505]/80 text-emerald-600 dark:text-white border border-emerald-600/30"
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
                        isDark ? "text-white" : "text-emerald-600",
                      )}
                    >
                      {product.price}
                    </span>
                    <Button
                      size="sm"
                      onClick={(e) => handleAddToCart(e, product)}
                      className={cn(
                        "rounded-full px-4 text-xs tracking-wide transition-all group cursor-pointer",
                        addedItems[product.id]
                          ? "bg-emerald-600 text-white"
                          : isDark
                            ? "border border-white/20 bg-transparent text-white/80 hover:border-white hover:text-white"
                            : "border border-slate-300 bg-transparent text-slate-600 hover:border-slate-900 hover:text-slate-900",
                      )}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                      {addedItems[product.id] ? "Added ✓" : "Add"}
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
            onClick={() => setIsStoreModalOpen(true)}
            className={cn(
              "rounded-full border-2 px-8 h-12 transition-all cursor-pointer font-bold shadow-sm hover:scale-105 active:scale-95 bg-transparent",
              isDark
                ? "border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
                : "border-emerald-600 text-emerald-600 hover:bg-emerald-50",
            )}
          >
            View All Products
          </Button>
        </div>
      </div>

      {/* Pro Store Catalog Modal */}
      <AnimatePresence>
        {isStoreModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "relative w-full max-w-6xl max-h-[90vh] flex flex-col rounded-[24px] sm:rounded-[28px] border shadow-2xl overflow-hidden [will-change:transform] [transform:translateZ(0)]",
                isDark ? "bg-[#0b0c10] border-white/10 text-white" : "bg-white border-slate-200/90 text-slate-900"
              )}
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-white/[0.02]">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    Pro Store Equipment Catalog
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Premium sports equipment, apparel, and accessories for players & sports clubs
                  </p>
                </div>
                <button
                  onClick={() => setIsStoreModalOpen(false)}
                  className="p-2.5 rounded-full hover:bg-slate-200/80 dark:hover:bg-white/10 transition cursor-pointer text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Filter & Search Bar */}
              <div className="p-4 sm:px-6 bg-slate-100/70 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {["All", "Equipment", "Accessories", "Apparel"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCat(cat)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap active:scale-95 bg-transparent",
                        selectedCat === cat
                          ? "border-2 border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 shadow-sm"
                          : isDark
                            ? "border border-white/15 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400"
                            : "border border-slate-300 text-slate-700 hover:border-emerald-600 hover:text-emerald-600"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search equipment or gear..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "w-full pl-9 pr-3 py-2 rounded-full text-xs font-medium outline-none border transition-all",
                      isDark
                        ? "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-sm"
                    )}
                  />
                </div>
              </div>

              {/* Products Grid with High Performance Hardware Scroll */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 smooth-scroll-container [will-change:transform] [transform:translateZ(0)] [overscroll-behavior:contain]">
                {filteredModalProducts.map((product) => (
                  <div
                    key={product.id}
                    className={cn(
                      "group flex flex-col h-[270px] overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 shrink-0",
                      isDark ? "bg-[#12141a] border-white/10 hover:border-emerald-500/40" : "bg-white border-slate-200/90 hover:border-emerald-500/30 shadow-sm"
                    )}
                  >
                    {/* Card Image (50% Height) */}
                    <div className="h-[135px] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative shrink-0 rounded-t-2xl">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge className="absolute top-2.5 right-2.5 rounded-full px-2 py-0.5 text-[10px] font-bold bg-black/70 backdrop-blur-md text-emerald-400 border border-emerald-500/30 shadow-sm">
                        <Star className="h-2.5 w-2.5 fill-current mr-0.5" />
                        {product.rating}
                      </Badge>
                    </div>

                    {/* Card Body (50% Height) */}
                    <div className="p-3.5 flex flex-col justify-between h-[135px] shrink-0 bg-white dark:bg-[#12141a]">
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider mb-1 block">
                          {product.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                          {product.name}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 mt-auto">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {product.price}
                        </span>
                        <Button
                          size="sm"
                          onClick={(e) => handleAddToCart(e, product)}
                          className={cn(
                            "h-7 rounded-full text-[11px] px-3.5 font-bold transition-colors cursor-pointer bg-transparent border hover:bg-transparent shadow-none",
                            addedItems[product.id]
                              ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 font-extrabold"
                              : "border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-emerald-600 dark:hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                          )}
                        >
                          {addedItems[product.id] ? "Added ✓" : "Add +"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:px-6 border-t border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.01] flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Showing {filteredModalProducts.length} items
                </span>
                <div className="flex gap-2.5">
                  <Button
                    variant="outline"
                    onClick={() => setIsStoreModalOpen(false)}
                    className="rounded-full text-xs font-semibold h-9 px-5 cursor-pointer border-slate-300 dark:border-white/20 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsStoreModalOpen(false);
                      navigate("/bookings");
                    }}
                    className="rounded-full border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 bg-transparent hover:bg-transparent hover:border-emerald-600 dark:hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold h-9 px-6 cursor-pointer transition-colors shadow-none"
                  >
                    View Cart / Checkout
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
    image: asset("/venues/turf-1.webp"),
    className: "md:col-span-2 md:row-span-2",
  },
  {
    id: 2,
    name: "Smash & Drive Badminton",
    location: "Andheri West",
    rating: "4.8",
    reviews: 89,
    image: asset("/venues/turf-3.webp"),
    className: "md:col-span-1 md:row-span-1",
  },
  {
    id: 3,
    name: "GreenPark Tennis Club",
    location: "Bandra",
    rating: "4.7",
    reviews: 56,
    image: asset("/venues/turf-4.webp"),
    className: "md:col-span-1 md:row-span-1",
  },
  {
    id: 4,
    name: "Hoops Rooftop Court",
    location: "South Mumbai",
    rating: "5.0",
    reviews: 210,
    image: asset("/venues/turf-6.webp"),
    className: "md:col-span-2 md:row-span-1",
  },
];

export function TurfGallery() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="pt-0 pb-4 md:pb-6 relative overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Gallery"
          title="Immersive Turf Experiences"
          titleClassName="!text-base sm:!text-lg md:!text-xl lg:!text-2xl"
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
                    className="rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg backdrop-blur-md border bg-[#050505]/60 text-emerald-600 dark:text-white border-emerald-600/30"
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
                  <MapPin className="h-4 w-4 text-emerald-600 dark:text-white" />
                  <span className="text-sm text-[#ffffff]/90 drop-shadow-md">
                    {typeof turf.location === 'object' ? (turf.location?.city || turf.location?.address || 'Location unavailable') : turf.location}
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
                    className="rounded-full bg-white/10 text-[#ffffff] border-white/20 hover:bg-emerald-600 hover:text-black hover:border-transparent backdrop-blur-sm transition-all cursor-pointer"
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
      <SportsCategories />
      <StoreSection />
      <DiscoveryRails />
      <TurfGallery />
      <WhySportXClub />

      <AppDownloadCTA />

      <Footer />
    </div>
  );
}
