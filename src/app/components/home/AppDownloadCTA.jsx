import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Smartphone, Trophy, Compass, Users, Home, CheckCircle2, DownloadCloud } from "lucide-react";
import { cn } from "../ui/utils";
import { motion, AnimatePresence } from "motion/react";

export function AppDownloadCTA() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  
  // State for mock phone animations and cycling screens
  const [mockScreen, setMockScreen] = useState("dashboard"); // "dashboard" or "download"
  const [activeSport, setActiveSport] = useState("Football");
  const [currentTime, setCurrentTime] = useState("12:30 PM");
  const [progressPercent, setProgressPercent] = useState(0);

  // Sync clock to actual local time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? "0" + minutes : minutes;
      setCurrentTime(`${hours}:${minutesStr} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Cycle the mockup screens automatically (Dashboard <-> Download Stats)
  useEffect(() => {
    const interval = setInterval(() => {
      setMockScreen((prev) => (prev === "dashboard" ? "download" : "dashboard"));
    }, 8500); // Cycles every 8.5 seconds
    return () => clearInterval(interval);
  }, []);

  // Animate the progress counter when the download screen is active
  useEffect(() => {
    if (mockScreen !== "download") {
      setProgressPercent(0);
      return;
    }
    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          return 100; // Stay at 100 until screen cycles
        }
        return prev + 1;
      });
    }, 40); // takes ~4 seconds to reach 100%
    return () => clearInterval(interval);
  }, [mockScreen]);

  // Cycle sports filter for Dashboard view
  useEffect(() => {
    if (mockScreen !== "dashboard") return;
    const sports = ["Football", "Cricket", "Badminton"];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % sports.length;
      setActiveSport(sports[index]);
    }, 3800);
    return () => clearInterval(interval);
  }, [mockScreen]);

  // Fetch updated card details depending on active sport
  const getSportDetails = () => {
    switch (activeSport) {
      case "Cricket":
        return {
          title: "Bandra Turf Nets",
          location: "Bandra West, Mumbai",
          slots: "8/12",
          price: "₹150 / player",
          time: "07:00 PM - 09:00 PM",
          distance: "3.1 km",
          emoji: "🏏",
          turfs: [
            { name: "Master Nets A", price: "₹800/hr", img: "/assets/venues/turf-2.webp" },
            { name: "Lord's Field B", price: "₹1,500/hr", img: "/assets/venues/turf-2.webp" }
          ]
        };
      case "Badminton":
        return {
          title: "Apex Smash Club",
          location: "Andheri East, Mumbai",
          slots: "2/4",
          price: "₹120 / player",
          time: "06:00 PM - 07:00 PM",
          distance: "1.8 km",
          emoji: "🏸",
          turfs: [
            { name: "Smash Court A", price: "₹600/hr", img: "/assets/venues/turf-3.webp" },
            { name: "Apex Shuttle Club", price: "₹800/hr", img: "/assets/venues/turf-3.webp" }
          ]
        };
      case "Football":
      default:
        return {
          title: "SportSquare Arena",
          location: "Plot 28, Behind Axel Park...",
          slots: "5/10",
          price: "₹100 / player",
          time: "04:30 PM - 06:30 PM",
          distance: "2.5 km",
          emoji: "⚽",
          turfs: [
            { name: "Premium Turf 1", price: "₹1,200/hr", img: "/assets/venues/turf-1.webp" },
            { name: "Skyline Pitch B", price: "₹1,500/hr", img: "/assets/venues/turf-5.webp" }
          ]
        };
    }
  };

  const details = getSportDetails();

  return (
    <section className="py-12 md:py-20 bg-slate-50 dark:bg-[#050811] relative overflow-hidden transition-colors duration-300">
      {/* Ambient glowing backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[180px] bg-emerald-500/[0.04] dark:bg-blue-500/[0.03] pointer-events-none" />
      
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          
          {/* Left: Content Area */}
          <div className="flex-1 max-w-xl flex flex-col items-start text-left">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 text-emerald-700 dark:border-[#6DFF3B]/30 dark:bg-[#6DFF3B]/10 dark:text-[#6DFF3B] text-xs font-semibold uppercase tracking-wider transition-colors duration-300">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Get The App</span>
            </div>
            
            {/* Title */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 mt-6 leading-[1.1] transition-colors duration-300">
              Book turfs on the go <br />
              with the <span className="text-emerald-600 dark:text-[#6DFF3B] transition-colors duration-300">SportXClub App</span>
            </h2>
            
            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-light transition-colors duration-300">
              Download the SportXClub app for faster bookings, instant notifications, and exclusive app-only offers — available on both Android and iOS.
            </p>
            
            {/* Store Buttons */}
            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
              {/* Google Play */}
              <a 
                href="#"
                className="inline-flex items-center gap-3.5 bg-white text-slate-900 px-6 py-3.5 rounded-2xl font-bold transition duration-300 hover:scale-[1.03] active:scale-98 shadow-md border border-slate-200 dark:border-white/10 w-full sm:w-auto justify-center"
              >
                {/* Google Play SVG */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.60986 20.6801C3.41986 20.4801 3.30986 20.1401 3.30986 19.7001V4.2901C3.30986 3.8501 3.41986 3.5101 3.60986 3.3101L3.69986 3.2201L12.3099 11.8301V12.0101L3.69986 20.6201L3.60986 20.6801Z" fill="#EA4335" />
                  <path d="M15.16 14.8699L12.31 12.0199V11.8399L15.16 8.98993L15.25 9.03993L18.63 10.9599C19.59 11.5059 19.59 12.3939 18.63 12.9399L15.25 14.8599L15.16 14.8699Z" fill="#FBBC04" />
                  <path d="M12.31 11.93L3.69995 20.54C4.01995 20.87 4.54995 20.89 5.15995 20.54L15.16 14.87L12.31 11.93Z" fill="#34A853" />
                  <path d="M12.31 11.93L15.16 8.99002L5.15995 3.31002C4.54995 2.96002 4.01995 2.98002 3.69995 3.31002L12.31 11.93Z" fill="#4285F4" />
                </svg>
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Get it on</span>
                  <span className="text-sm font-black text-slate-900">Google Play</span>
                </div>
              </a>
              
              {/* App Store */}
              <a 
                href="#"
                className="inline-flex items-center gap-3.5 bg-white text-slate-900 px-6 py-3.5 rounded-2xl font-bold transition duration-300 hover:scale-[1.03] active:scale-98 shadow-md border border-slate-200 dark:border-white/10 w-full sm:w-auto justify-center"
              >
                {/* Apple SVG */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 fill-slate-900" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.51-.62.73-1.16 1.87-1.01 2.98 1.12.09 2.26-.59 2.94-1.43Z" />
                </svg>
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Download on the</span>
                  <span className="text-sm font-black text-slate-900">App Store</span>
                </div>
              </a>
            </div>
          </div>
          
          {/* Right: Phone Mockup Frame */}
          <div className="flex-1 relative z-10 flex items-center justify-center w-full max-w-sm">
            <motion.div 
              initial={{ y: 0 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-[300px] aspect-[9/18.5] rounded-[3rem] overflow-hidden border-[8px] border-slate-800 bg-[#070b12] shadow-[0_24px_60px_rgba(0,0,0,0.6)] flex flex-col"
            >
              {/* Top notch */}
              <div className="absolute top-0.5 inset-x-0 h-4 w-28 mx-auto rounded-full bg-slate-800 z-30" />
              
              {/* Phone Content Screen */}
              <div className="absolute inset-0 pt-6 pb-12 flex flex-col overflow-hidden bg-white dark:bg-[#070b12] text-slate-900 dark:text-white transition-colors duration-300">
                
                {/* Status Bar */}
                <div className="flex justify-between items-center text-[9px] px-4 py-2 font-semibold text-slate-500 dark:text-slate-400 select-none">
                  <span>{currentTime}</span>
                  <div className="flex items-center gap-1.5">
                    {/* Blinking message indicator */}
                    <motion.svg 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                      className="w-3.5 h-3.5 fill-current text-emerald-500 dark:text-[#6DFF3B]" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                    </motion.svg>
                    <div className="w-3 h-2 rounded-xs border border-current opacity-70 flex items-center p-[1px]"><div className="w-full h-full bg-current rounded-xs" /></div>
                  </div>
                </div>
                
                {/* Screen Content Wrapper with Screen Transition */}
                <div className="flex-1 relative overflow-hidden flex flex-col">
                  
                  <AnimatePresence mode="wait">
                    {mockScreen === "dashboard" ? (
                      /* SCREEN 1: Live booking dashboard view */
                      <motion.div 
                        key="dashboard"
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 5 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 px-3.5 flex flex-col gap-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                      >
                        {/* Let it Breathe Banner */}
                        <div className="rounded-xl p-3 bg-gradient-to-r from-blue-600 to-blue-700 relative overflow-hidden flex flex-col justify-between aspect-[3.2/1] shrink-0 shadow-md">
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full pointer-events-none"
                            animate={{ x: ["100%", "-100%"] }}
                            transition={{ repeat: Infinity, duration: 3.5, ease: "linear", repeatDelay: 1.5 }}
                          />
                          <div className="absolute right-0 top-0 bottom-0 w-24 bg-white/5 skew-x-[-20deg] translate-x-4 pointer-events-none" />
                          <div className="relative z-10">
                            <h4 className="text-[12px] font-black italic tracking-wide text-blue-100">LET IT BREATHE</h4>
                            <p className="text-[8px] text-blue-200 mt-0.5">Premium Indoor Arenas</p>
                          </div>
                          <div className="self-end text-[10px] opacity-20 font-bold text-white relative z-10">SPORTX</div>
                        </div>

                        {/* Play Category Selector */}
                        <div>
                          <h4 className="text-[9px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-2">What do you want to play?</h4>
                          <div className="flex gap-2">
                            {["Football", "Cricket", "Badminton"].map((sport) => {
                              const isActive = activeSport === sport;
                              const emoji = sport === "Football" ? "⚽" : sport === "Cricket" ? "🏏" : "🏸";
                              return (
                                <div key={sport} className="relative">
                                  {isActive && (
                                    <motion.div
                                      layoutId="activeSportTabPill"
                                      className="absolute inset-0 rounded-full bg-emerald-500 dark:bg-[#6DFF3B]"
                                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                                    />
                                  )}
                                  <span className={cn(
                                    "relative z-10 px-2.5 py-1 rounded-full font-bold text-[8px] flex items-center gap-1 transition-colors duration-300",
                                    isActive 
                                      ? "text-white dark:text-slate-900" 
                                      : "bg-slate-100 border border-slate-200 text-slate-600 dark:bg-[#121620] dark:border-slate-800 dark:text-slate-350"
                                  )}>
                                    <span>{emoji}</span>
                                    <span>{sport}</span>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Discover games section */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-[9px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Discover Games Near You</h4>
                            <span className="text-[8px] text-emerald-600 dark:text-[#6DFF3B] font-bold">See All</span>
                          </div>

                          <AnimatePresence mode="wait">
                            <motion.div 
                              key={activeSport}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.3 }}
                              className="rounded-xl p-3 bg-slate-50 border border-slate-200/80 dark:bg-[#111622] dark:border-slate-800/80 shadow-xs flex flex-col gap-2.5 transition-colors duration-300"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="text-[10px] font-bold text-slate-900 dark:text-white leading-tight">{details.title}</h5>
                                  <p className="text-[7px] text-slate-500 dark:text-slate-400 mt-0.5">{details.location}</p>
                                </div>
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border border-slate-250 text-[7px] text-slate-600 dark:bg-slate-800/80 dark:border-slate-700/50 dark:text-slate-400 font-medium">
                                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                                  <span>{details.distance}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="p-1.5 rounded-lg bg-white border border-slate-200 dark:bg-[#070a10] dark:border-slate-900">
                                  <p className="text-[6px] text-slate-400 dark:text-slate-500 leading-none">Sport</p>
                                  <p className="text-[8px] font-bold mt-1 text-slate-850 dark:text-white flex items-center gap-1">
                                    <span>{details.emoji}</span>
                                    <span>{activeSport}</span>
                                  </p>
                                </div>
                                <div className="p-1.5 rounded-lg bg-white border border-slate-200 dark:bg-[#070a10] dark:border-slate-900">
                                  <p className="text-[6px] text-slate-400 dark:text-slate-500 leading-none">Time Slot</p>
                                  <p className="text-[8px] font-bold mt-1 text-emerald-600 dark:text-[#6DFF3B]">{details.time}</p>
                                </div>
                              </div>

                              <div className="flex justify-between items-center mt-1">
                                <span className="text-[8px] text-slate-600 dark:text-slate-300">Slots: <strong className="text-slate-900 dark:text-white font-bold">{details.slots}</strong></span>
                                <span className="text-[9px] font-bold text-emerald-600 dark:text-[#6DFF3B]">{details.price}</span>
                              </div>

                              <motion.button 
                                animate={{ 
                                  boxShadow: isDark 
                                    ? ["0px 0px 0px rgba(109,255,59,0)", "0px 0px 8px rgba(109,255,59,0.3)", "0px 0px 0px rgba(109,255,59,0)"]
                                    : ["0px 0px 0px rgba(16,185,129,0)", "0px 0px 8px rgba(16,185,129,0.25)", "0px 0px 0px rgba(16,185,129,0)"],
                                  scale: [1, 1.012, 1] 
                                }}
                                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                                className="w-full py-1.5 rounded-lg bg-emerald-500 text-white dark:bg-[#6DFF3B] dark:text-slate-950 font-black text-[9px] hover:bg-emerald-600 dark:hover:bg-[#8aff62]"
                              >
                                Join Match
                              </motion.button>
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        {/* Recommended Turfs */}
                        <div>
                          <h4 className="text-[9px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-2">Recommended Turfs</h4>
                          <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                            {details.turfs.map((turf) => (
                              <motion.div 
                                key={turf.name}
                                whileHover={{ scale: 1.03 }}
                                className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200/80 dark:bg-[#111622] dark:border-slate-800/80 shadow-xs shrink-0 w-[110px] transition-colors duration-300"
                              >
                                <img src={turf.img} alt={turf.name} className="h-[65px] w-full object-cover" />
                                <div className="p-2">
                                  <h6 className="text-[8px] font-bold text-slate-900 dark:text-white truncate">{turf.name}</h6>
                                  <p className="text-[7.5px] text-emerald-600 dark:text-[#6DFF3B] font-bold mt-0.5">{turf.price}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      /* SCREEN 2: App Download, QR Scanner & Installation Perks view */
                      <motion.div 
                        key="download"
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 px-3.5 flex flex-col gap-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                      >
                        {/* Download Progress Status Box */}
                        <div className="rounded-xl p-3 bg-slate-50 border border-slate-200/80 dark:bg-[#111622] dark:border-slate-800/80 shadow-md flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            {/* Animated glowing App Icon */}
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg relative overflow-hidden shrink-0">
                              <motion.div 
                                className="absolute inset-0 bg-white/20 skew-x-[-15deg] translate-x-[-100%]"
                                animate={{ x: ["100%", "-100%"] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                              />
                              <span className="text-lg font-black text-white">X</span>
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-[11px] font-black text-slate-900 dark:text-white leading-tight">SportXClub Mobile</h5>
                              <p className="text-[8px] text-slate-500 mt-0.5">Play · Book · Compete (24 MB)</p>
                            </div>
                          </div>

                          {/* Progress slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] font-bold text-slate-500">
                              <span>
                                {progressPercent < 100 
                                  ? `Downloading... ${progressPercent}%` 
                                  : progressPercent === 100 
                                    ? "Installing..." 
                                    : "Installed"
                                }
                              </span>
                              <span>
                                {progressPercent < 100 
                                  ? `${Math.round(24 * (progressPercent/100))} MB / 24 MB`
                                  : "Completed"
                                }
                              </span>
                            </div>
                            {/* Inner progress bar track */}
                            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                              <motion.div 
                                className="h-full rounded-full bg-emerald-500 dark:bg-[#6DFF3B]"
                                style={{ width: `${progressPercent}%` }}
                                transition={{ type: "tween", ease: "linear" }}
                              />
                            </div>
                          </div>

                          {/* Download Trigger / Action Status */}
                          <div className="flex items-center gap-1.5 text-[8px] text-emerald-600 dark:text-[#6DFF3B] font-bold self-center">
                            <DownloadCloud className="w-3.5 h-3.5 animate-bounce" />
                            <span>{progressPercent < 100 ? "Syncing Package Files..." : "Ready to Play! ✅"}</span>
                          </div>
                        </div>

                        {/* Scan to Install QR Card */}
                        <div className="rounded-xl p-3 bg-slate-50 border border-slate-200/80 dark:bg-[#111622]/60 dark:border-slate-850 shadow-sm flex items-center gap-3">
                          {/* QR Code SVG */}
                          <svg viewBox="0 0 100 100" className="w-12 h-12 bg-white p-1 rounded-lg shrink-0 border border-slate-200" xmlns="http://www.w3.org/2000/svg">
                            <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
                            <rect x="10" y="10" width="15" height="15" fill="white" />
                            <rect x="13" y="13" width="9" height="9" fill="#0f172a" />

                            <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
                            <rect x="75" y="10" width="15" height="15" fill="white" />
                            <rect x="78" y="13" width="9" height="9" fill="#0f172a" />

                            <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
                            <rect x="10" y="75" width="15" height="15" fill="white" />
                            <rect x="13" y="78" width="9" height="9" fill="#0f172a" />

                            <rect x="35" y="5" width="10" height="10" fill="#0f172a" />
                            <rect x="50" y="15" width="15" height="5" fill="#0f172a" />
                            <rect x="35" y="20" width="20" height="5" fill="#0f172a" />
                            <rect x="40" y="30" width="10" height="10" fill="#0f172a" />
                            <rect x="5" y="35" width="15" height="10" fill="#0f172a" />
                            <rect x="25" y="45" width="10" height="15" fill="#0f172a" />
                            
                            <rect x="70" y="35" width="15" height="5" fill="#0f172a" />
                            <rect x="85" y="45" width="10" height="15" fill="#0f172a" />
                            <rect x="55" y="55" width="25" height="10" fill="#0f172a" />
                            <rect x="35" y="70" width="15" height="20" fill="#0f172a" />
                            <rect x="55" y="75" width="10" height="10" fill="#0f172a" />
                            <rect x="75" y="75" width="15" height="15" fill="#0f172a" />
                          </svg>
                          <div>
                            <h6 className="text-[9px] font-bold text-slate-800 dark:text-slate-200">Scan QR Code</h6>
                            <p className="text-[7.5px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                              Point your camera here to download the SportXClub app on your phone.
                            </p>
                          </div>
                        </div>

                        {/* App Only Perks Section */}
                        <div className="space-y-2">
                          <h6 className="text-[9px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">App Only Perks</h6>
                          <div className="space-y-1.5">
                            {[
                              { title: "⚡ 1-Tap Booking", desc: "Instantly secure slots with zero loading lag." },
                              { title: "🔔 Real-Time Alerts", desc: "Get notifications when local slots open up." },
                              { title: "💳 Payment Splits", desc: "Quickly split match fees with your teammates." }
                            ].map((perk, idx) => (
                              <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.15 }}
                                className="flex gap-2 items-start"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-[#6DFF3B] shrink-0 mt-0.5" />
                                <div>
                                  <h6 className="text-[8px] font-bold text-slate-800 dark:text-slate-200 leading-none">{perk.title}</h6>
                                  <p className="text-[7px] text-slate-500 dark:text-slate-400 mt-0.5">{perk.desc}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Page Indicator Carousel Dots */}
                <div className="absolute bottom-11 inset-x-0 flex justify-center gap-1.5 z-25 pointer-events-none">
                  <div className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300", mockScreen === "dashboard" ? "bg-emerald-500 dark:bg-[#6DFF3B] scale-125" : "bg-slate-300 dark:bg-slate-700")} />
                  <div className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300", mockScreen === "download" ? "bg-emerald-500 dark:bg-[#6DFF3B] scale-125" : "bg-slate-300 dark:bg-slate-700")} />
                </div>

              </div>

              {/* Bottom Nav Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-slate-50/95 dark:bg-[#0a0e17] border-t border-slate-200/60 dark:border-slate-800/60 py-1.5 flex justify-around items-center z-25 text-slate-400 dark:text-slate-500 transition-colors duration-300">
                <div className="flex flex-col items-center gap-0.5 text-emerald-600 dark:text-[#6DFF3B]">
                  <Home className="w-3.5 h-3.5" />
                  <span className="text-[6px] font-bold">Home</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span className="text-[6px] font-medium">Turfs</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <Trophy className="w-3.5 h-3.5" />
                  <span className="text-[6px] font-medium">Tournaments</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 flex-1 shrink-0 max-w-[25%]">
                  <svg className="w-3.5 h-3.5 fill-current mx-auto" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                  <span className="text-[6px] font-medium text-center block mt-0.5">Community</span>
                </div>
              </div>
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
