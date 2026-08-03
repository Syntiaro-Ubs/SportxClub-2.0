import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Dumbbell,
  MapPin,
  Mic,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trophy,
  Waves,
  ShieldCheck,
  CreditCard,
  Zap,
  Headset,
} from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { cn } from "../ui/utils";
import { MobileAppBar, MobileBottomNav } from "./mobile-chrome";
import { useAuth } from "../../providers/auth-provider";
import { AppDownloadCTA } from "../home/AppDownloadCTA";
import { GlobalFooter } from "../layout/GlobalFooter";
import { demoVenues } from "../../pages/venue-booking";

const asset = (path) => `/assets${path}`;

const marqueeStyle = `
  @keyframes marquee-categories {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee-categories {
    display: flex;
    animation: marquee-categories 16s linear infinite;
  }
  .animate-marquee-categories:hover {
    animation-play-state: paused;
  }
`;

const sportsCategories = [
  {
    name: "Football",
    image: asset("/sports/cat-football.webp"),
    accent: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    name: "Cricket",
    image: asset("/sports/cat-cricket.webp"),
    accent: "from-lime-500/20 to-lime-500/5",
  },
  {
    name: "Badminton",
    image: asset("/sports/cat-badminton.webp"),
    accent: "from-primary/20 to-primary/5",
  },
  {
    name: "Tennis",
    image: asset("/sports/cat-tennis.webp"),
    accent: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    name: "Basketball",
    image: asset("/sports/cat-basketball.webp"),
    accent: "from-primary/20 to-primary/5",
  },
  {
    name: "Volleyball",
    image: asset("/sports/cat-boxmma.webp"),
    accent: "from-lime-500/20 to-lime-500/5",
  },
  {
    name: "Swimming",
    image: asset("/sports/cat-swimming.webp"),
    accent: "from-cyan-500/20 to-cyan-500/5",
  },
  {
    name: "Gym",
    image: asset("/sports/cat-padel.webp"),
    accent: "from-neutral-500/20 to-neutral-500/5",
  },
  {
    name: "More",
    image: asset("/sports/cat-boxmma.webp"),
    accent: "from-primary/20 to-primary/5",
  },
];

const offers = [
  {
    title: "Early bird cashback",
    value: "Flat 15% off",
    description: "Use BOOKFIRST before 11 AM and save on select weekday slots.",
    tag: "Limited time",
    tint: "from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/20 dark:to-emerald-500/5",
  },
  {
    title: "Tournament starter pack",
    value: "Free listing",
    description: "Launch your first event with verified venue discovery and bracket tools.",
    tag: "Organizer offer",
    tint: "from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/5",
  },
  {
    title: "Refund-safe booking",
    value: "Easy cancellation",
    description: "Clear refund rules, visible before payment, with trusted support.",
    tag: "Trusted",
    tint: "from-purple-500/10 to-purple-500/5 dark:from-purple-500/20 dark:to-purple-500/5",
  },
];

const whyCards = [
  {
    title: "Verified Venues",
    description: "Trusted venues with exact amenities and real-time availability.",
    icon: ShieldCheck,
  },
  {
    title: "Secure Payments",
    description: "100% secure checkouts with direct refund policies.",
    icon: CreditCard,
  },
  {
    title: "Instant Booking",
    description: "Find a court, choose a slot, and secure booking in seconds.",
    icon: Zap,
  },
  {
    title: "24x7 Support",
    description: "Dedicated assistance whenever you need it.",
    icon: Headset,
  },
];

// Dynamic nearby turfs will be generated inside the component

const tournaments = [
  {
    title: "City Five-A-Side Cup",
    date: "24 Jun",
    prize: "₹2.5L prize pool",
    image: asset("/tournaments/tournament-1-cover.webp"),
  },
  {
    title: "Midnight Turf League",
    date: "25 Jun",
    prize: "32 teams open",
    image: asset("/tournaments/tournament-2-cover.webp"),
  },
  {
    title: "Weekend Smash Open",
    date: "26 Jun",
    prize: "Registration closing",
    image: asset("/tournaments/tournament-3-cover.webp"),
  },
];

const recommended = [
  {
    id: 2,
    name: "Night Turf Special",
    detail: "After 7 PM slots",
    image: asset("/venues/turf-2.webp"),
  },
  {
    id: 1,
    name: "Weekend Cricket Nets",
    detail: "Family friendly",
    image: asset("/venues/turf-1.webp"),
  },
  {
    id: 3,
    name: "Indoor Smash Zone",
    detail: "Air-conditioned",
    image: asset("/venues/turf-3.webp"),
  },
];

const recent = [
  {
    name: "Elite Turf Arena",
    sport: "Football",
    image: asset("/venues/turf-1.webp"),
  },
  {
    name: "Metro Sports Park",
    sport: "Cricket",
    image: asset("/venues/turf-2.webp"),
  },
];

const trending = [
  {
    name: "5-a-side",
    icon: Trophy,
    note: "High energy matches",
  },
  {
    name: "Weekend leagues",
    icon: Sparkles,
    note: "Fast registration",
  },
  {
    name: "Recreation",
    icon: Dumbbell,
    note: "Fitness-first sessions",
  },
  {
    name: "Swimming",
    icon: Waves,
    note: "Pool bookings nearby",
  },
];

function SectionHeader({ title, action = "View all" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[1.05rem] font-bold tracking-tight text-foreground">
        {title}
      </h2>
      {/* 
      <button
        type="button"
        className="inline-flex items-center gap-1 text-sm text-primary"
      >
        {action}
        <ArrowRight className="h-4 w-4" />
      </button>
      */}
    </div>
  );
}

function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      navigate("/venues", { state: { search: query } });
    }
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening... Speak now");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      toast.success(`Search query set to: "${transcript}"`);
      setTimeout(() => {
        navigate("/venues", { state: { search: transcript } });
      }, 800);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      console.error(event.error);
      toast.error("Voice recognition failed. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="relative">
      <div className={cn(
        "transition",
        isListening ? "ring-4 ring-primary/10 rounded-[24px]" : "focus-within:ring-4 focus-within:ring-primary/10 rounded-[24px]"
      )}>
        <div className="flex items-center gap-2">
          <div className="flex h-9.5 flex-1 items-center gap-2.5 rounded-[16px] border border-border/60 dark:border-white/30 focus-within:dark:border-white bg-transparent px-3.5">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder={isListening ? "Listening..." : "Search venues, sports or tournaments"}
              className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
              disabled={isListening}
            />
          </div>
          <button
            type="button"
            onClick={startVoiceSearch}
            className={cn(
              "flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-[16px] border text-foreground shadow-sm transition-all duration-300 cursor-pointer",
              isListening
                ? "border-red-500 bg-red-500/20 text-red-500 animate-pulse"
                : "border-border/60 dark:border-white/30 bg-transparent hover:bg-muted"
            )}
            aria-label="Voice search"
          >
            <Mic className={cn("h-4 w-4", isListening && "scale-110")} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-[16px] border text-foreground shadow-sm transition-all duration-300 cursor-pointer",
                  "border-border/60 dark:border-white/30 bg-transparent hover:bg-muted"
                )}
                aria-label="Open filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuLabel>Quick Filters</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/venues", { state: { sort: "price_low" } })} className="cursor-pointer">
                Price: Low to High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/venues", { state: { sort: "rating" } })} className="cursor-pointer">
                Highest Rated
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/venues", { state: { sort: "distance" } })} className="cursor-pointer">
                Nearest to me
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/venues", { state: { openFilters: true } })} className="cursor-pointer font-medium text-primary focus:text-primary">
                Advanced Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isListening && (
        <div className="absolute top-14 left-0 right-0 z-50 flex items-center gap-3 p-3 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl animate-fade-in">
          <div className="flex space-x-1">
            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-xs text-white/90">Voice search active. Speak turf name, location, or sport...</p>
        </div>
      )}
    </div>
  );
}

function CarouselCard({ title, copy, tint }) {
  return (
    <motion.article
      whileTap={{ scale: 0.985 }}
      className={cn(
        "min-w-[86%] rounded-[24px] border border-border/60 bg-gradient-to-br p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.32)]",
        tint,
      )}
    >
      <div className="flex h-full flex-col justify-between gap-4">
        <div>
          <p className="text-xs  uppercase tracking-[0.22em] text-primary">
            Offer
          </p>
          <h3 className="mt-3 text-lg  text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
        </div>
        <Button
          variant="ghost"
          className="h-10 w-fit rounded-full border border-border/70 bg-background/80 px-4 text-sm  text-foreground"
        >
          Claim offer
        </Button>
      </div>
    </motion.article>
  );
}

export function MobileHomePage() {
  const navigate = useNavigate();
  const [currentBg, setCurrentBg] = useState(0);
  const { currentUser } = useAuth();
  const firstName = currentUser?.fullName ? currentUser.fullName.split(" ")[0] : "Rohan";
  const [city, setCity] = useState(
    () => localStorage.getItem("preferred-city") || "Mumbai",
  );

  useEffect(() => {
    const handleCityChange = (e) => {
      setCity(e.detail);
    };
    window.addEventListener("preferredCityChanged", handleCityChange);
    return () => window.removeEventListener("preferredCityChanged", handleCityChange);
  }, []);

  const nearbyTurfs = useMemo(() => {
    const searchCity = city === "All" ? "Mumbai" : city;
    let filtered = demoVenues.filter(v => v.location.toLowerCase().includes(searchCity.toLowerCase()));
    if (filtered.length === 0) {
      filtered = demoVenues.filter(v => v.location.toLowerCase().includes("mumbai"));
    }
    return filtered.slice(0, 3).map((v, i) => ({
      id: v.id,
      name: v.name,
      sport: v.sports || "Football",
      distance: `${(1.2 + i * 0.7).toFixed(1)} km`,
      price: `₹${800 + i * 200}/hr`,
      image: v.image,
    }));
  }, [city]);

  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isDragging = useRef(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    let autoScrollId;
    const scrollSpeed = 0.5; // Pixels per frame
    let scrollPos = slider.scrollLeft;

    const scrollStep = () => {
      if (!slider) return;
      scrollPos += scrollSpeed;
      const maxScroll = slider.scrollWidth / 2;
      if (maxScroll > 100 && scrollPos >= maxScroll) {
        scrollPos -= maxScroll;
      }
      slider.scrollLeft = Math.floor(scrollPos);
      autoScrollId = requestAnimationFrame(scrollStep);
    };

    if (!isPaused) {
      scrollPos = slider.scrollLeft;
      autoScrollId = requestAnimationFrame(scrollStep);
    }

    return () => {
      cancelAnimationFrame(autoScrollId);
    };
  }, [isPaused]);

  const handleMouseDown = (e) => {
    isDown.current = true;
    isDragging.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    setIsPaused(false);
  };

  const handleMouseUp = () => {
    isDown.current = false;
    setTimeout(() => {
      setIsPaused(false);
    }, 100);
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    isDragging.current = true;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleTouchStart = () => {
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      setIsPaused(false);
    }, 100);
  };

  const bgImages = [
    "/assets/hero/slider-1.jpg",
    "/assets/hero/slider-2.jpg",
    "/assets/hero/slider-3.jpg",
    "/assets/hero/slider-4.jpg",
    "/assets/hero/slider-5.jpg",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [bgImages.length]);

  return (
    <div className="theme-adaptive min-h-dvh bg-background text-foreground">
      <MobileAppBar />

      <div>
        <div className="space-y-4 px-4 pb-4 pt-0">
          <div className="relative z-10">
            <SearchBar />
          </div>

          <motion.section
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="!mt-1 -mx-2 relative overflow-hidden rounded-2xl p-5 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.35)] aspect-[21/9] flex flex-col justify-between always-dark border border-white/10"
          >
            <div className="absolute inset-0 z-0">
              <AnimatePresence initial={false}>
                <motion.div
                  key={currentBg}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute inset-0 bg-cover bg-no-repeat bg-center brightness-100 saturate-[1.1]"
                  style={{ backgroundImage: `url(${bgImages[currentBg]})` }}
                />
              </AnimatePresence>
            </div>

            <div className="relative z-10 mt-auto pb-1">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/90 mb-1 drop-shadow-md">
                Good evening, {firstName}
              </p>
              <h1 className="text-xl font-bold tracking-tight leading-[1.2] text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] max-w-[85%]">
                Ready for your next game?
              </h1>
            </div>
          </motion.section>

          <section className="space-y-2 sports-categories-container">
            <SectionHeader title="Sports categories" action="More" />
            <div className="relative w-full">
              <div
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="flex overflow-x-auto gap-2 pb-4 select-none cursor-grab active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {[...sportsCategories, ...sportsCategories].map((item, index) => (
                  <motion.button
                    key={`${item.name}-${index}`}
                    onClick={() => {
                      if (!isDragging.current) {
                        navigate("/venues", { state: { sport: item.name } });
                      }
                    }}
                    whileTap={{ scale: 0.96 }}
                    className="flex w-[calc(25%-6px)] min-w-[calc(25%-6px)] shrink-0 flex-col items-center gap-1 group cursor-pointer border-0 bg-transparent pointer-events-auto"
                  >
                    <span className="flex w-full aspect-square max-w-[90px] items-center justify-center rounded-[20px] transition-all border-0 bg-transparent pointer-events-none">
                      <span className="flex w-[95%] aspect-square overflow-hidden rounded-xl relative border-0 bg-transparent">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </span>
                    </span>
                    <span className="text-center text-[0.75rem] md:text-[0.8rem] leading-tight text-muted-foreground truncate w-full px-0.5 pointer-events-none">
                      {item.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </section>

          {/* Exclusive Offers Section */}
          <section className="space-y-2">
            <SectionHeader title="Exclusive offers" />
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {offers.map((offer, index) => (
                <motion.article
                  key={`${offer.title}-${index}`}
                  whileTap={{ scale: 0.985 }}
                  className={cn(
                    "min-w-[85%] rounded-[24px] border border-border/50 bg-gradient-to-br p-5 shadow-xs snap-center flex flex-col justify-between gap-4",
                    offer.tint
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                        {offer.tag}
                      </span>
                      <span className="text-xs font-black text-foreground">{offer.value}</span>
                    </div>
                    <h3 className="mt-3 text-base font-bold text-foreground leading-snug">{offer.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{offer.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="h-9 w-fit rounded-full border-primary/20 bg-background/50 hover:bg-primary hover:text-primary-foreground text-xs font-semibold px-4 cursor-pointer mt-1"
                  >
                    Claim Offer
                  </Button>
                </motion.article>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <SectionHeader title="Nearby turfs" />
            <div className="space-y-4">
              {nearbyTurfs.map((venue) => (
                <Link key={venue.name} to={`/venues/${venue.id}`} className="block group">
                  <motion.article
                    whileTap={{ scale: 0.985 }}
                    className="relative flex items-center gap-4 rounded-[28px] border border-border/40 bg-card p-2.5 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.15)] transition-all hover:shadow-[0_12px_24px_-12px_rgba(15,23,42,0.25)] hover:border-primary/30"
                  >
                    <div className="relative h-[110px] w-[110px] shrink-0 overflow-hidden rounded-[22px]">
                      <ImageWithFallback
                        src={venue.image}
                        alt={venue.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-1.5 left-2 flex items-center gap-1 text-[0.7rem] font-extrabold !text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] z-10">
                        <Star className="h-3 w-3 fill-emerald-500 text-emerald-500 shrink-0" />
                        <span className="!text-white font-extrabold">4.8</span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between py-1 pr-3 h-[110px]">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Badge variant="outline" className="text-[0.6rem] px-2 py-0 border-primary/20 text-primary bg-primary/5 rounded-md font-semibold tracking-wide uppercase">
                            {venue.sport}
                          </Badge>
                          <span className="text-[0.7rem] font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded-md">{venue.price}</span>
                        </div>

                        <h3 className="text-[1.05rem] font-bold text-foreground leading-tight line-clamp-1 mb-1">
                          {venue.name}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1 text-[0.75rem] text-muted-foreground font-medium">
                          <MapPin className="h-3.5 w-3.5 text-primary/80" />
                          <span className="truncate">{venue.distance} away</span>
                        </div>
                        <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full border border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-white bg-transparent hover:bg-emerald-600/10 transition-colors">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <SectionHeader title="Popular tournaments" />
            <div className="relative overflow-hidden">
              <style dangerouslySetInnerHTML={{ __html: marqueeStyle }} />
              <div className="animate-marquee-categories flex gap-3 w-max pb-1">
                {[...tournaments, ...tournaments].map((item, index) => (
                  <motion.article
                    key={`${item.title}-${index}`}
                    whileTap={{ scale: 0.985 }}
                    className="w-[280px] shrink-0 overflow-hidden rounded-[24px] border border-border/60 bg-card shadow-[0_12px_28px_-22px_rgba(15,23,42,0.32)]"
                  >
                    <div className="relative aspect-[16/10]">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 image-overlay bg-[linear-gradient(180deg,rgba(5,5,5,0.04),rgba(5,5,5,0.68))]" />
                      <Badge className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[0.65rem]  uppercase tracking-[0.18em] text-white backdrop-blur-md">
                        Upcoming
                      </Badge>
                    </div>
                    <div className="space-y-3 p-4">
                      <div>
                        <h3 className="text-base  text-foreground">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.date}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm  text-primary">{item.prize}</p>
                        <Button
                          variant="outline"
                          className="h-8 rounded-full px-4 text-xs font-bold border border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-white bg-transparent hover:bg-emerald-600/10 transition-colors shadow-none cursor-pointer"
                        >
                          Join
                        </Button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <SectionHeader title="Recommended for you" />
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {recommended.map((item, index) => (
                <Link key={item.name} to={`/venues/${item.id}`} className="min-w-[75%] sm:min-w-[40%] shrink-0 snap-center">
                  <motion.article
                    whileTap={{ scale: 0.985 }}
                    className="relative w-full h-full overflow-hidden rounded-[24px] border border-white/10 shadow-xl group aspect-[16/9]"
                  >
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-3.5 flex flex-col justify-end h-full z-10">
                      <div className="mb-auto self-end">
                        <div className="flex h-7 w-7 items-center justify-center">
                          <Sparkles className="h-4.5 w-4.5 text-emerald-400 dark:text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
                        </div>
                      </div>
                      <h3 className="text-base font-extrabold !text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-[1.15] mb-0.5 truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs !text-white flex items-center gap-1.5 font-semibold truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                        <Star className="h-3 w-3 fill-emerald-400 text-emerald-400 dark:text-white dark:fill-white" />
                        {item.detail}
                      </p>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          </section>



          <section className="space-y-2">
            <SectionHeader title="Trending activities" />
            <div className="relative overflow-hidden">
              <motion.div
                className="flex gap-3"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear",
                }}
              >
                {[...trending, ...trending].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.article
                      key={`${item.name}-${index}`}
                      whileTap={{ scale: 0.985 }}
                      className="min-w-[44%] shrink-0 rounded-[22px] border border-border/60 bg-card p-4 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.28)]"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-sm text-foreground">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {item.note}
                      </p>
                    </motion.article>
                  );
                })}
              </motion.div>
            </div>
          </section>

          {/* Why Choose Us Section */}
          <section className="space-y-2">
            <SectionHeader title="Why Choose SportXClub" />
            <div className="grid grid-cols-2 gap-3">
              {whyCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={index}
                    className="p-4 rounded-[22px] border border-border/50 bg-card/60 shadow-xs flex flex-col justify-between"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground mb-1">{card.title}</h4>
                      <p className="text-[10px] leading-relaxed text-muted-foreground">{card.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* App Download Section */}
          <AppDownloadCTA />
        </div>
        <div className="pb-10 md:pb-0">
          <GlobalFooter />
        </div>
      </div>

      <MobileBottomNav activeTab="home" />
    </div>
  );
}
