import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Users, MapPin, Trophy, ShieldCheck } from "lucide-react";

export function CompanyDescription() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme !== "light";

  const stats = [
    { label: "Active Players", value: "25K+", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Verified Venues", value: "450+", icon: MapPin, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Tournaments Held", value: "180+", icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Trusted Partners", value: "100%", icon: ShieldCheck, color: "text-indigo-500", bg: "bg-indigo-500/10" }
  ];

  return (
    <section className={`w-full py-12 px-6 md:px-12 rounded-[32px] border transition-all duration-300 text-left ${
      isDark 
        ? "bg-slate-900/40 border-white/[0.05] text-white" 
        : "bg-white border-slate-200/80 text-slate-900 shadow-sm"
    }`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headline and description */}
        <div className="lg:col-span-6 space-y-4">
          <span className={`text-[10px] font-bold tracking-widest uppercase ${
            isDark ? "text-[#6DFF3B]" : "text-emerald-600"
          }`}>
            Who We Are
          </span>
          <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            SportXClub is a premium sports ecosystem.
          </h2>
          <p className={`text-sm leading-relaxed ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}>
            We bridge the gap between players, venue owners, and tournament organizers. Our platform streamlines venue bookings, facilitates intelligent player matching based on skills, and empowers communities to host, join, and manage sports activities effortlessly on the web and mobile.
          </p>
        </div>

        {/* Right Column: Statistics Grid */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`p-4 rounded-2xl border transition-colors duration-305 ${
                  isDark 
                    ? "bg-white/[0.02] border-white/[0.05] hover:border-white/10" 
                    : "bg-slate-50/50 border-slate-100 hover:border-slate-250"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <span className={`text-xl font-black block tracking-tight leading-none ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}>
                      {stat.value}
                    </span>
                    <span className={`text-[10px] uppercase font-semibold tracking-wider block mt-1.5 leading-none ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`}>
                      {stat.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
