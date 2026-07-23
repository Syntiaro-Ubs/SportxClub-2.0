import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { cn } from "../ui/utils";
import { MobileAppBar, MobileBottomNav } from "./mobile-chrome";
import { useAuth } from "../../providers/auth-provider";

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

const nearbyTurfs = [
  {
    id: 4,
    name: "Victory Greens",
    sport: "Football",
    distance: "1.9 km",
    price: "₹1,050/hr",
    image: asset("/venues/turf-4.webp"),
  },
  {
    id: 5,
    name: "Pro Match Grounds",
    sport: "Cricket",
    distance: "2.8 km",
    price: "₹800/hr",
    image: asset("/venues/turf-5.webp"),
  },
  {
    id: 6,
    name: "Apex Turf Club",
    sport: "Basketball",
    distance: "4.1 km",
    price: "₹1,300/hr",
    image: asset("/venues/turf-6.webp"),
  },
];

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

const offers = [
  {
    title: "Early bird cashback",
    copy: "Book your first weekend slot and get instant savings on select venues.",
    tint: "from-primary/20 to-primary/5",
  },
  {
    title: "Tournament starter pack",
    copy: "Launch a league with verified venues, live registrations, and smooth check-in.",
    tint: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    title: "Refund-safe booking",
    copy: "Clear booking policies, trusted payments, and easy cancellation in one flow.",
    tint: "from-lime-500/20 to-lime-500/5",
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
      <h2 className="text-[1.05rem]  tracking-tight text-foreground">
        {title}
      </h2>
      <button
        type="button"
        className="inline-flex items-center gap-1 text-sm  text-primary"
      >
        {action}
        <ArrowRight className="h-4 w-4" />
      </button>
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
        "rounded-[24px] border border-border/60 bg-card/80 p-3 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl transition",
        isListening ? "border-primary/50 ring-4 ring-primary/10" : "focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/10"
      )}>
        <div className="flex items-center gap-2">
          <div className="flex h-11 flex-1 items-center gap-3 rounded-[18px] border border-border/60 bg-background/90 px-4">
            <Search className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder={isListening ? "Listening..." : "Search venues, sports or tournaments"}
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              disabled={isListening}
            />
          </div>
          <button
            type="button"
            onClick={startVoiceSearch}
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border text-foreground shadow-sm transition-all duration-300 cursor-pointer",
              isListening
                ? "border-red-500 bg-red-500/20 text-red-500 animate-pulse"
                : "border-border/60 bg-background/90 hover:bg-muted"
            )}
            aria-label="Voice search"
          >
            <Mic className={cn("h-4.5 w-4.5", isListening && "scale-110")} />
          </button>
          <button
            type="button"
            onClick={() => navigate("/venues", { state: { openFilters: true } })}
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border text-foreground shadow-sm transition-all duration-300 cursor-pointer",
              "border-border/60 bg-background/90 hover:bg-muted"
            )}
            aria-label="Open filters"
          >
            <SlidersHorizontal className="h-4.5 w-4.5" />
          </button>
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
  const [currentBg, setCurrentBg] = useState(0);
  const { currentUser } = useAuth();
  const firstName = currentUser?.fullName ? currentUser.fullName.split(" ")[0] : "Rohan";
  const displayCity = currentUser?.city || "Mumbai Central";

  // Sports categories use Framer Motion marquee for infinite auto-scrolling

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

      <main className="pb-[calc(108px+env(safe-area-inset-bottom))]">
        <div className="space-y-6 px-4 py-4">
          <div className="sticky top-16 z-40">
            <SearchBar />
          </div>

          <motion.section
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[32px] p-6 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.35)] aspect-[16/9] flex flex-col justify-between always-dark border border-white/10"
          >
            <div className="absolute inset-0 z-0">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentBg}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute inset-0 bg-cover bg-no-repeat bg-center brightness-[0.75] saturate-[1.2]"
                  style={{ backgroundImage: `url(${bgImages[currentBg]})` }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30" />
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

          <section className="space-y-3 sports-categories-container">
            <SectionHeader title="Sports categories" action="More" />
            <div className="relative overflow-hidden">
              <style dangerouslySetInnerHTML={{ __html: marqueeStyle }} />
              <div className="animate-marquee-categories flex gap-3 w-max">
                {[...sportsCategories, ...sportsCategories].map((item, index) => (
                  <motion.button
                    key={`${item.name}-${index}`}
                    onClick={() => navigate("/venues", { state: { sport: item.name } })}
                    whileTap={{ scale: 0.96 }}
                    style={{ border: 'none', borderWidth: 0, outline: 'none', boxShadow: 'none' }}
                    className="flex min-w-[76px] shrink-0 flex-col items-center gap-2 group cursor-pointer border-0"
                  >
                    <span
                      style={{ border: 'none', borderWidth: 0, outline: 'none', boxShadow: 'none', background: 'transparent' }}
                      className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px] transition-all border-0 bg-transparent"
                    >
                      <span
                        style={{ border: 'none', borderWidth: 0, outline: 'none', boxShadow: 'none', background: 'transparent' }}
                        className="flex h-[56px] w-[56px] overflow-hidden rounded-xl relative border-0 bg-transparent"
                      >
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </span>
                    </span>
                    <span className="text-center text-[0.75rem] leading-tight text-muted-foreground">
                      {item.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-3">
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
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[0.65rem] font-bold text-foreground backdrop-blur-md shadow-sm border border-border/50">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        4.8
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
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-3">
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
                        variant="ghost"
                        className="h-10 rounded-full px-4 text-sm  text-foreground"
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

          <section className="space-y-3">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end h-full z-10">
                      <div className="mb-auto self-end">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background/50 backdrop-blur-md border border-border/50 shadow-sm">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                        </div>
                      </div>
                      <Badge className="w-fit mb-2 bg-primary/15 hover:bg-primary/25 text-primary border-primary/20 backdrop-blur-md transition-colors text-[0.65rem] px-2 py-0.5">
                        Top Pick
                      </Badge>
                      <h3 className="text-lg font-bold text-foreground drop-shadow-sm leading-[1.15] mb-1 truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium truncate">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        {item.detail}
                      </p>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          </section>



          <section className="space-y-3">
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
        </div>
      </main>

      <MobileBottomNav activeTab="home" />
    </div>
  );
}
