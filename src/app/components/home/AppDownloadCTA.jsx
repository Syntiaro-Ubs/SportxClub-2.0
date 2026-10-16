import { Smartphone, Zap, Bell, CreditCard } from "lucide-react";
import { motion } from "motion/react";

export function AppDownloadCTA() {
  return (
    <section className="hidden md:block py-10 md:py-14 bg-white dark:bg-[#060911] relative overflow-hidden transition-colors duration-300">
      <div className="mx-auto max-w-[1140px] px-6 sm:px-8 lg:px-10 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">

          {/* Left: Content Area */}
          <div className="flex-1 max-w-lg flex flex-col items-start text-left">
            {/* Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-50 text-emerald-700 dark:border-emerald-600/30 dark:bg-emerald-600/10 dark:text-emerald-500 text-xs font-semibold uppercase tracking-wider mb-3.5 transition-colors duration-300">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Get The App</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-slate-900 dark:text-white mb-3 leading-[1.2] transition-colors duration-300">
              Book turfs on the go <br />
              with the <span className="text-emerald-600 dark:text-emerald-500 transition-colors duration-300">SportXClub App</span>
            </h2>

            {/* Subtext */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed font-normal transition-colors duration-300 max-w-md">
              Download the SportXClub app for faster bookings, instant notifications, and exclusive app-only offers — available on both Android and iOS.
            </p>

            {/* Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6 w-full max-w-md">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Zap className="w-3 h-3" />
                </span>
                <span>1-Tap Instant Booking</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Bell className="w-3 h-3" />
                </span>
                <span>Real-Time Slot Alerts</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 sm:col-span-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CreditCard className="w-3 h-3" />
                </span>
                <span>Split Match Fees with Teammates</span>
              </div>
            </div>

            {/* Store Buttons */}
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              {/* Google Play */}
              <a
                href="#"
                className="inline-flex items-center gap-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2.5 rounded-xl font-bold transition duration-300 hover:scale-[1.02] active:scale-98 shadow-sm hover:shadow border border-slate-200 dark:border-slate-800"
              >
                {/* Google Play SVG */}
                <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.60986 20.6801C3.41986 20.4801 3.30986 20.1401 3.30986 19.7001V4.2901C3.30986 3.8501 3.41986 3.5101 3.60986 3.3101L3.69986 3.2201L12.3099 11.8301V12.0101L3.69986 20.6201L3.60986 20.6801Z" fill="#EA4335" />
                  <path d="M15.16 14.8699L12.31 12.0199V11.8399L15.16 8.98993L15.25 9.03993L18.63 10.9599C19.59 11.5059 19.59 12.3939 18.63 12.9399L15.25 14.8599L15.16 14.8699Z" fill="#FBBC04" />
                  <path d="M12.31 11.93L3.69995 20.54C4.01995 20.87 4.54995 20.89 5.15995 20.54L15.16 14.87L12.31 11.93Z" fill="#34A853" />
                  <path d="M12.31 11.93L15.16 8.99002L5.15995 3.31002C4.54995 2.96002 4.01995 2.98002 3.69995 3.31002L12.31 11.93Z" fill="#4285F4" />
                </svg>
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[7.5px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Get it on</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">Google Play</span>
                </div>
              </a>

              {/* App Store */}
              <a
                href="#"
                className="inline-flex items-center gap-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2.5 rounded-xl font-bold transition duration-300 hover:scale-[1.02] active:scale-98 shadow-sm hover:shadow border border-slate-200 dark:border-slate-800"
              >
                {/* Apple SVG */}
                <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 shrink-0 fill-current text-slate-900 dark:text-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.51-.62.73-1.16 1.87-1.01 2.98 1.12.09 2.26-.59 2.94-1.43Z" />
                </svg>
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[7.5px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Download on the</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">App Store</span>
                </div>
              </a>
            </div>
          </div>

          {/* Right: Realistic 3D Angled Phone Mockup without any background card */}
          <div className="flex-1 relative z-10 flex items-center justify-center w-full max-w-[480px]">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative w-full flex justify-center items-center"
            >
              <img
                src="/assets/sportx-app-phones.jpg"
                alt="SportXClub Mobile App Mockup"
                className="w-full max-w-[460px] h-auto object-contain select-none pointer-events-none"
                style={{
                  filter: "contrast(1.1) brightness(1.04)",
                  mixBlendMode: "multiply"
                }}
                loading="lazy"
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
