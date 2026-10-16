import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useTheme } from "next-themes";
import { cn } from "../ui/utils";

const slides = [
  {
    title: "Host Your Own Tournament",
    description: "Easily organize and launch your own tournaments. Set custom rules, manage registrations, define prize pools, and use our built-in bracket generator to automate the entire event.",
    image: "/assets/tournaments/tournament-org-generated.jpg",
    color: "from-emerald-500/20 to-teal-500/5",
    badgeTitle: "Organizer Dashboard",
    badgeDesc: "Full control over your events.",
    badgeIcon: "⚙️",
  },
  {
    title: "Join & Compete",
    description: "Browse local tournaments and enroll your squad with a single tap. Split entry fees seamlessly, view opponent rosters, and prepare for match day.",
    image: "/assets/tournaments/tournament-join-generated.jpg",
    color: "from-blue-500/20 to-indigo-500/5",
    badgeTitle: "Registration Open",
    badgeDesc: "Secure your slot instantly.",
    badgeIcon: "🎟️",
  },
  {
    title: "Live Brackets & Scores",
    description: "Follow the action in real-time. Check live scores, monitor bracket progressions, and see exactly where your team ranks on the global leaderboard.",
    image: "/assets/tournaments/tournament-live-generated.jpg",
    color: "from-orange-500/20 to-red-500/5",
    badgeTitle: "Live Updates",
    badgeDesc: "Real-time match results.",
    badgeIcon: "📊",
  }
];

export function StickyScrollSection() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const containerRef = useRef(null);

  // We track the scroll progress of the 360vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth spring for fluid scrolling feel without lagging past container boundaries
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001
  });

  // Slide 1 stays in view from 0 to 0.18, then scales down as Slide 2 enters
  const slide1Scale = useTransform(smoothProgress, [0.18, 0.45], [1, 0.95], { clamp: true });
  const slide1Opacity = useTransform(smoothProgress, [0.18, 0.45], [1, 0.5], { clamp: true });

  // Slide 2 comes in from 0.18 to 0.45, rests from 0.45 to 0.52, then scales down as Slide 3 enters
  const slide2Y = useTransform(smoothProgress, [0.18, 0.45], ["100vh", "0vh"], { clamp: true });
  const slide2Scale = useTransform(smoothProgress, [0.52, 0.78], [1, 0.95], { clamp: true });
  const slide2Opacity = useTransform(smoothProgress, [0.52, 0.78], [1, 0.5], { clamp: true });

  // Slide 3 comes in from 0.52 to 0.78, and rests fully in view from 0.78 to 1.0
  // This gives ample time to view the last slide before smoothly scrolling to the next section
  const slide3Y = useTransform(smoothProgress, [0.52, 0.78], ["100vh", "0vh"], { clamp: true });

  return (
    <section 
      ref={containerRef} 
      className="relative h-[360vh] w-full"
    >
      {/* Sticky wrapper that stays on screen for the duration of the scroll */}
      <div className={cn(
        "sticky top-16 h-[calc(100vh-4rem)] w-full flex flex-col items-center justify-start pt-2 sm:pt-3 pb-3 sm:pb-4 overflow-hidden transition-colors duration-300",
        isDark ? "bg-[#0b0f19] text-white" : "bg-white text-slate-900"
      )}>
        
        {/* Title that stays fixed below navbar */}
        <div className="w-full z-10 px-3 sm:px-6 lg:px-8 max-w-[1700px] shrink-0 mb-2 sm:mb-2.5">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 dark:border-emerald-400/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wider uppercase shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Tournaments & Events
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              Ultimate Tournament Experience
            </h2>
          </div>
        </div>

        <div className="relative w-full flex-1 max-h-[76vh] md:max-h-[80vh] z-10 perspective-1000 px-3 sm:px-6 lg:px-8 max-w-[1700px] mb-2 sm:mb-3">
          
          {/* Slide 1 (Static base) */}
          <motion.div 
            style={{ scale: slide1Scale, opacity: slide1Opacity }}
            className={cn(
              "absolute inset-0 shadow-xl flex flex-col md:flex-row overflow-hidden rounded-[1rem] border transition-colors duration-300",
              isDark 
                ? "border-slate-800 bg-[#121826] shadow-[0_20px_50px_rgba(0,0,0,0.6)]" 
                : "border-slate-200 bg-white"
            )}
          >
            <div className={cn(
              "w-full md:w-[45%] lg:w-[40%] shrink-0 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-gradient-to-br",
              isDark ? "bg-[#121826]" : "bg-white",
              slides[0].color
            )}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 dark:bg-emerald-500/30 flex items-center justify-center mb-4 sm:mb-5">
                <span className="text-emerald-600 dark:text-emerald-400 font-black text-lg sm:text-xl">1</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">
                {slides[0].title}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {slides[0].description}
              </p>
            </div>
            <div className="flex-1 relative h-64 md:h-auto">
              <img src={slides[0].image} alt="Feature" className="absolute inset-0 w-full h-full object-cover" />
              
              <div className={cn(
                "absolute bottom-6 left-1/2 -translate-x-1/2 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4 w-[85%] max-w-sm border transition-colors",
                isDark 
                  ? "bg-[#0e1422]/90 border-slate-700/60 text-white" 
                  : "bg-white/95 border-slate-100 text-slate-900"
              )}>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 dark:bg-emerald-500/25 flex items-center justify-center shrink-0">
                  <span className="text-2xl">{slides[0].badgeIcon}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{slides[0].badgeTitle}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{slides[0].badgeDesc}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Slide 2 (Scrolls in from bottom) */}
          <motion.div 
            style={{ y: slide2Y, scale: slide2Scale, opacity: slide2Opacity }}
            className={cn(
              "absolute inset-0 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.15)] flex flex-col md:flex-row overflow-hidden rounded-[1rem] border transition-colors duration-300",
              isDark 
                ? "border-slate-800 bg-[#121826] shadow-[0_-20px_50px_rgba(0,0,0,0.6)]" 
                : "border-slate-200 bg-white"
            )}
          >
            <div className={cn(
              "w-full md:w-[45%] lg:w-[40%] shrink-0 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-gradient-to-br",
              isDark ? "bg-[#121826]" : "bg-white",
              slides[1].color
            )}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/20 dark:bg-blue-500/30 flex items-center justify-center mb-4 sm:mb-5">
                <span className="text-blue-600 dark:text-blue-400 font-black text-lg sm:text-xl">2</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">
                {slides[1].title}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {slides[1].description}
              </p>
            </div>
            <div className="flex-1 relative h-64 md:h-auto">
              <img src={slides[1].image} alt="Feature" className="absolute inset-0 w-full h-full object-cover" />
              
              <div className={cn(
                "absolute bottom-6 left-1/2 -translate-x-1/2 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4 w-[85%] max-w-sm border transition-colors",
                isDark 
                  ? "bg-[#0e1422]/90 border-slate-700/60 text-white" 
                  : "bg-white/95 border-slate-100 text-slate-900"
              )}>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 dark:bg-blue-500/25 flex items-center justify-center shrink-0">
                  <span className="text-2xl">{slides[1].badgeIcon}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{slides[1].badgeTitle}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{slides[1].badgeDesc}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Slide 3 (Scrolls in from bottom) */}
          <motion.div 
            style={{ y: slide3Y }}
            className={cn(
              "absolute inset-0 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.2)] flex flex-col md:flex-row overflow-hidden rounded-[1rem] border transition-colors duration-300",
              isDark 
                ? "border-slate-800 bg-[#121826] shadow-[0_-20px_50px_rgba(0,0,0,0.6)]" 
                : "border-slate-200 bg-white"
            )}
          >
            <div className={cn(
              "w-full md:w-[45%] lg:w-[40%] shrink-0 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-gradient-to-br",
              isDark ? "bg-[#121826]" : "bg-white",
              slides[2].color
            )}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-orange-500/20 dark:bg-orange-500/30 flex items-center justify-center mb-4 sm:mb-5">
                <span className="text-orange-600 dark:text-orange-400 font-black text-lg sm:text-xl">3</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">
                {slides[2].title}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {slides[2].description}
              </p>
            </div>
            <div className="flex-1 relative h-64 md:h-auto">
              <img src={slides[2].image} alt="Feature" className="absolute inset-0 w-full h-full object-cover" />
              
              <div className={cn(
                "absolute bottom-6 left-1/2 -translate-x-1/2 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4 w-[85%] max-w-sm border transition-colors",
                isDark 
                  ? "bg-[#0e1422]/90 border-slate-700/60 text-white" 
                  : "bg-white/95 border-slate-100 text-slate-900"
              )}>
                <div className="w-12 h-12 rounded-full bg-orange-500/10 dark:bg-orange-500/25 flex items-center justify-center shrink-0">
                  <span className="text-2xl">{slides[2].badgeIcon}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{slides[2].badgeTitle}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{slides[2].badgeDesc}</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
