import { motion } from "motion/react";
import { Smartphone, MapPin, ChevronDown, Bell, Search, Trophy, Users, Home } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function AppDownloadSection() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme !== "light";

  return (
    <section className={`w-full py-16 px-6 md:px-12 relative overflow-hidden rounded-[32px] border transition-all duration-300 text-left ${
      isDark 
        ? "dark bg-[#090D16] border-white/[0.05] text-white" 
        : "bg-slate-50 border-slate-200/60 text-slate-900"
    }`}>
      {/* Inline Styles to Hide Phone Mockup Scrollbars */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />

      {/* Background Glows */}
      {isDark ? (
        <>
          <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full bg-[#2563EB]/10 blur-[150px] pointer-events-none -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#6DFF3B]/5 blur-[120px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
        </>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Side: Copy, Company Description & Action Buttons */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
              isDark 
                ? "border-[#6DFF3B]/30 bg-[#6DFF3B]/10 text-[#6DFF3B]" 
                : "border-emerald-600/20 bg-emerald-50 text-emerald-600"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Get the App</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-4xl sm:text-5xl font-black tracking-tight leading-tight transition-colors duration-300 ${
              isDark ? "text-white !text-white" : "text-slate-900 !text-slate-900"
            }`}
          >
            Book turfs on the go <br />
            with the <span className={isDark ? "text-[#6DFF3B]" : "text-emerald-600"}>SportXClub App</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`text-base md:text-lg max-w-lg leading-relaxed transition-colors duration-300 ${
              isDark ? "text-slate-300 !text-slate-300" : "text-slate-600 !text-slate-600"
            }`}
          >
            Download the SportXClub app for faster bookings, instant notifications,
            and exclusive app-only offers — available on both Android and iOS.
          </motion.p>

          {/* Company Description Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-2xl"
          >
            <div className={`p-4 rounded-2xl border transition-all duration-300 ${
              isDark 
                ? "bg-white/[0.02] border-white/[0.06] hover:border-[#6DFF3B]/30" 
                : "bg-white border-slate-200/80 shadow-xs hover:border-emerald-600/30"
            }`}>
              <h3 className={`font-bold text-xs tracking-wider uppercase transition-colors duration-300 ${
                isDark ? "text-[#6DFF3B] !text-[#6DFF3B]" : "text-emerald-600 !text-emerald-600"
              }`}>
                All-in-One Sports Ecosystem
              </h3>
              <p className={`text-xs mt-1.5 leading-relaxed transition-colors duration-300 ${
                isDark ? "text-slate-400 !text-slate-400" : "text-slate-500 !text-slate-500"
              }`}>
                Connect with local players, discover nearby turfs and courts, register for ongoing tournaments, and manage your sport communities in one unified application.
              </p>
            </div>
            <div className={`p-4 rounded-2xl border transition-all duration-300 ${
              isDark 
                ? "bg-white/[0.02] border-white/[0.06] hover:border-[#6DFF3B]/30" 
                : "bg-white border-slate-200/80 shadow-xs hover:border-emerald-600/30"
            }`}>
              <h3 className={`font-bold text-xs tracking-wider uppercase transition-colors duration-300 ${
                isDark ? "text-[#6DFF3B] !text-[#6DFF3B]" : "text-emerald-600 !text-emerald-600"
              }`}>
                Instant Availability & Booking
              </h3>
              <p className={`text-xs mt-1.5 leading-relaxed transition-colors duration-300 ${
                isDark ? "text-slate-400 !text-slate-400" : "text-slate-500 !text-slate-500"
              }`}>
                Browse slot schedules in real time, compare pricing structures, read verified ratings, and book your sports venues seamlessly with secure UPI or card checkout features.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            {/* Google Play Button */}
            <a
              href="#play-store"
              className={`flex items-center gap-3 active:scale-95 transition-all px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-black/10 border ${
                isDark 
                  ? "bg-white text-[#090D16] border-white hover:bg-white/90" 
                  : "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
              }`}
            >
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.25391 19.3496C3.0768 19.1725 2.97729 18.919 2.97729 18.636V5.36402C2.97729 5.081 3.0768 4.82747 3.25391 4.65036L12.3533 13.7497L3.25391 19.3496Z" fill="#00E5FF"/>
                <path d="M16.6341 9.46897L12.3533 13.7498L3.25391 4.65039C3.43102 4.47328 3.73373 4.39429 4.09395 4.39429H15.906C16.2087 4.39429 16.4678 4.47328 16.6341 4.65039L16.6341 9.46897Z" fill="#FFC107"/>
                <path d="M3.25391 19.3496C3.43102 19.5267 3.73373 19.6057H15.906C16.2087 19.6057 16.4678 19.5267 16.6341 19.3496L12.3533 13.7498L3.25391 19.3496Z" fill="#FF3D00"/>
                <path d="M20.7461 11.2057C21.0805 11.5401 21.2538 12.0001 21.2538 12.5001C21.2538 13.0001 21.0805 13.4601 20.7461 13.7945L16.6342 16.3496L12.3533 13.7498L16.6342 9.469L20.7461 11.2057Z" fill="#4CAF50"/>
              </svg>
              <div className={`text-left leading-none ${isDark ? "text-black" : "text-white"}`}>
                <span className={`text-[10px] font-medium block ${isDark ? "text-black/60" : "text-white/60"}`}>Get it on</span>
                <span className="text-sm font-bold block mt-0.5">Google Play</span>
              </div>
            </a>

            {/* App Store Button */}
            <a
              href="#app-store"
              className={`flex items-center gap-3 active:scale-95 transition-all px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-black/10 border ${
                isDark 
                  ? "bg-white text-[#090D16] border-white hover:bg-white/90" 
                  : "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
              }`}
            >
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.1 16.67C20.08 16.74 19.67 18.11 18.71 19.5ZM15.97 4.17C16.63 3.37 17.07 2.28 16.95 1C15.98 1.04 14.81 1.65 14.11 2.47C13.5 3.17 12.97 4.28 13.12 5.53C14.2 5.62 15.31 4.97 15.97 4.17Z"/>
              </svg>
              <div className={`text-left leading-none ${isDark ? "text-black" : "text-white"}`}>
                <span className={`text-[10px] font-medium block ${isDark ? "text-black/60" : "text-white/60"}`}>Download on the</span>
                <span className="text-sm font-bold block mt-0.5">App Store</span>
              </div>
            </a>
          </motion.div>
        </div>

        {/* Right Side: Smartphone Mockup */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: 2 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="w-[285px] h-[570px] border-[10px] border-slate-800 rounded-[40px] bg-[#050912] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden select-none"
          >
            {/* Speaker & Camera Notch */}
            <div className="absolute top-0 inset-x-0 h-7 bg-black z-30 flex items-center justify-between px-6 text-[10px] text-white/90">
              <span className="text-white">12:30</span>
              <div className="w-16 h-4 bg-black rounded-full absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-white/80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.07 19.58 10.48 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
                </svg>
                <div className="w-4 h-2.5 rounded-sm border border-white/60 p-0.5 flex items-center">
                  <div className="w-full h-full bg-white rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Inner Screen Scroll Container */}
            <div className={`h-full pt-10 pb-14 overflow-y-auto no-scrollbar flex flex-col gap-3 text-left transition-colors duration-300 ${
              isDark ? "bg-[#050912]" : "bg-[#F8FAF9]"
            }`}>
              {/* Dynamic Header */}
              <div className={`px-3 pt-2 flex items-center justify-between transition-colors duration-300 ${
                isDark ? "bg-[#050912]" : "bg-[#F8FAF9]"
              }`}>
                <div className="flex items-center gap-1.5">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors duration-300 ${
                    isDark ? "bg-primary/20 text-primary" : "bg-emerald-600/10 text-emerald-600"
                  }`}>
                    S
                  </div>
                  <div className="leading-tight">
                    <span className={`text-[8px] block ${isDark ? "text-white/40" : "text-slate-500"}`}>Your Location</span>
                    <span className={`text-[10px] font-medium flex items-center gap-0.5 ${isDark ? "text-white/95" : "text-slate-800"}`}>
                      Majiwada, Thane
                      <ChevronDown className={`w-2.5 h-2.5 ${isDark ? "text-white/50" : "text-slate-400"}`} />
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className={`h-7 w-7 rounded-full border flex items-center justify-center transition-colors ${
                    isDark ? "bg-slate-900 border-slate-800 text-white/70" : "bg-white border-slate-200 text-slate-600"
                  }`}>
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div className={`h-7 w-7 rounded-full border flex items-center justify-center transition-colors ${
                    isDark ? "bg-slate-900 border-slate-800 text-white/70" : "bg-white border-slate-200 text-slate-600"
                  }`}>
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Promo Banner Slider */}
              <div className="px-3">
                <div className={`w-full h-28 rounded-2xl p-3 relative overflow-hidden flex flex-col justify-between ${
                  isDark ? "bg-gradient-to-r from-blue-600 to-[#1d4ed8]" : "bg-gradient-to-r from-emerald-600 to-teal-650"
                }`}>
                  <span className="text-[8px] uppercase tracking-widest text-white/80 bg-white/15 px-1.5 py-0.5 rounded-full w-max">
                    Trending
                  </span>
                  <div className="space-y-0.5 z-10 text-left">
                    <h4 className="text-sm font-black italic tracking-wide text-white leading-none">
                      LET IT BREATHE
                    </h4>
                    <p className="text-[9px] text-white/90 font-medium">Premium Indoor Arenas</p>
                  </div>
                  {/* Runner Illustration */}
                  <svg className="absolute right-2 bottom-1 w-16 h-16 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.49 5.42c1.1-.1 1.93-.98 1.93-2.08 0-1.15-.93-2.08-2.08-2.08s-2.08.93-2.08 2.08c0 1.03.74 1.88 1.73 2.05l-1.92 3.84H8.38c-.55 0-1 .45-1 1s.45 1 1 1h3.38c.36 0 .69-.19.87-.51l1.86-3.72.58 2.9-2.03 4.06c-.18.36-.18.78 0 1.14l2.5 5.2c.24.49.85.7 1.34.46.49-.24.7-.85.46-1.34L15.35 15.5l2.06-4.12c.16-.32.19-.69.09-1.03l-1.21-6.05 2.1-1.05c.49-.24.7-.85.46-1.34-.24-.49-.85-.7-1.34-.46l-4.02 2.02z" />
                  </svg>
                </div>
              </div>

              {/* Sports Category pills */}
              <div className="px-3">
                <p className={`text-[10px] font-semibold mb-1.5 uppercase tracking-wider ${isDark ? "text-white/50" : "text-slate-500"}`}>
                  What Do You Want to Play?
                </p>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                  <span className={`flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    isDark ? "bg-[#6DFF3B] text-black" : "bg-[#6DFF3B] text-black"
                  }`}>
                    ⚽ Football
                  </span>
                  <span className={`flex items-center gap-1 border text-[9px] px-2.5 py-1 rounded-full shrink-0 ${
                    isDark ? "border-slate-800 bg-slate-900/50 text-white/80" : "border-slate-200 bg-white text-slate-700"
                  }`}>
                    🏏 Cricket
                  </span>
                  <span className={`flex items-center gap-1 border text-[9px] px-2.5 py-1 rounded-full shrink-0 ${
                    isDark ? "border-slate-800 bg-slate-900/50 text-white/80" : "border-slate-200 bg-white text-slate-700"
                  }`}>
                    🏸 Badminton
                  </span>
                </div>
              </div>

              {/* Discover Games Card */}
              <div className="px-3">
                <div className="flex justify-between items-center mb-1.5">
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-white/50" : "text-slate-500"}`}>
                    Discover Games Near You
                  </p>
                  <span className={`text-[9px] font-medium cursor-pointer ${isDark ? "text-[#6DFF3B]" : "text-emerald-600"}`}>See All</span>
                </div>
                <div className={`w-full rounded-2xl border p-3 space-y-3 transition-colors duration-300 ${
                  isDark ? "border-slate-800/80 bg-slate-900/60" : "border-slate-200 bg-white shadow-xs"
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5 text-left">
                      <h5 className={`text-xs font-semibold leading-tight ${isDark ? "text-white" : "text-slate-800"}`}>SportSquare Arena</h5>
                      <p className={`text-[8px] ${isDark ? "text-white/55" : "text-slate-500"}`}>Plot 28, Behind Axel Park...</p>
                    </div>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded ${isDark ? "bg-slate-800 text-white/70" : "bg-slate-100 text-slate-600"}`}>
                      2.5 km
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[8px]">
                    <div className={`p-1.5 rounded-lg border flex flex-col items-center transition-colors duration-300 ${
                      isDark ? "bg-slate-950 border-slate-800/40 text-white/60" : "bg-slate-50 border-slate-100 text-slate-600"
                    }`}>
                      <span className={`${isDark ? "text-white/40" : "text-slate-400"} block mb-0.5`}>Sport</span>
                      <span className={`font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>Football</span>
                    </div>
                    <div className={`p-1.5 rounded-lg border flex flex-col items-center transition-colors duration-300 ${
                      isDark ? "bg-slate-950 border-slate-800/40 text-white/60" : "bg-slate-50 border-slate-100 text-slate-600"
                    }`}>
                      <span className={`${isDark ? "text-white/40" : "text-slate-400"} block mb-0.5`}>Time Slot</span>
                      <span className={`font-semibold ${isDark ? "text-[#6DFF3B]" : "text-emerald-650"}`}>04:30 PM - 06:30 PM</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[9px]">
                    <span className={isDark ? "text-white/50" : "text-slate-500"}>Slots: <strong className={isDark ? "text-white" : "text-slate-700"}>5/10</strong></span>
                    <span className={`font-bold ${isDark ? "text-white" : "text-slate-800"}`}>₹100 / player</span>
                  </div>
                  <button type="button" className={`w-full py-1.5 rounded-lg font-bold text-[10px] active:scale-95 transition-transform cursor-pointer ${
                    isDark ? "bg-[#6DFF3B] text-black" : "bg-[#6DFF3B] text-black hover:bg-[#86ff60]"
                  }`}>
                    Join Match
                  </button>
                </div>
              </div>

              {/* Recommended Turfs */}
              <div className="px-3">
                <p className={`text-[10px] font-semibold mb-1.5 uppercase tracking-wider ${isDark ? "text-white/50" : "text-slate-500"}`}>
                  Recommended Turfs
                </p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  <div className={`w-32 rounded-xl border overflow-hidden shrink-0 transition-colors duration-300 ${
                    isDark ? "bg-slate-900/50 border-slate-800/50" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div className="h-16 bg-slate-800 relative">
                      <img
                        src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=200&auto=format&fit=crop"
                        alt="turf"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="p-1.5 text-left">
                      <h6 className={`text-[9px] font-bold truncate ${isDark ? "text-white" : "text-slate-800"}`}>Premium Turf</h6>
                      <span className={`text-[8px] font-semibold ${isDark ? "text-[#6DFF3B]" : "text-emerald-600"}`}>₹1,200/hr</span>
                    </div>
                  </div>
                  <div className={`w-32 rounded-xl border overflow-hidden shrink-0 transition-colors duration-300 ${
                    isDark ? "bg-slate-900/50 border-slate-800/50" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div className="h-16 bg-slate-800 relative">
                      <img
                        src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=200&auto=format&fit=crop"
                        alt="turf"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="p-1.5 text-left">
                      <h6 className={`text-[9px] font-bold truncate ${isDark ? "text-white" : "text-slate-800"}`}>Skyline Arena</h6>
                      <span className={`text-[8px] font-semibold ${isDark ? "text-[#6DFF3B]" : "text-emerald-600"}`}>₹1,500/hr</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Nav Bar */}
            <div className={`absolute bottom-0 inset-x-0 h-11 border-t flex items-center justify-around z-30 transition-colors duration-300 ${
              isDark ? "bg-[#090D16] border-slate-900/50 text-white/50" : "bg-white border-slate-200 text-slate-500"
            }`}>
              <div className={`flex flex-col items-center cursor-pointer ${isDark ? "text-[#6DFF3B]" : "text-emerald-600"}`}>
                <Home className="w-4 h-4" />
                <span className="text-[7px] mt-0.5">Home</span>
              </div>
              <div className="flex flex-col items-center hover:text-primary cursor-pointer">
                <MapPin className="w-4 h-4" />
                <span className="text-[7px] mt-0.5">Turfs</span>
              </div>
              <div className="flex flex-col items-center hover:text-primary cursor-pointer">
                <Trophy className="w-4 h-4" />
                <span className="text-[7px] mt-0.5">Tournaments</span>
              </div>
              <div className="flex flex-col items-center hover:text-primary cursor-pointer">
                <Users className="w-4 h-4" />
                <span className="text-[7px] mt-0.5">Community</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
