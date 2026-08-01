import { Link } from "react-router";
import { RefreshCw, CheckCircle2, AlertTriangle, Clock, ArrowLeft, ShieldCheck, Wallet } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "../components/ui/utils";

export function RefundPolicy() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const refundTiers = [
    {
      timing: "Cancel > 24 Hours Before Slot",
      refund: "100% Full Refund",
      badge: "FREE CANCELLATION",
      badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      desc: "Full money back directly to your original payment mode or 100% instant credit to SportX Wallet with zero cancellation charge."
    },
    {
      timing: "Cancel 12 - 24 Hours Before Slot",
      refund: "75% Refund",
      badge: "75% BACK",
      badgeColor: "bg-teal-500/10 text-teal-500 border-teal-500/20",
      desc: "75% amount refunded. 25% retained as nominal slot holding charge."
    },
    {
      timing: "Cancel 4 - 12 Hours Before Slot",
      refund: "50% Refund",
      badge: "50% BACK",
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      desc: "50% amount refunded to payment source."
    },
    {
      timing: "Cancel < 4 Hours Before Slot",
      refund: "Non-Refundable",
      badge: "NO REFUND",
      badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      desc: "Slots cancelled under 4 hours before kickoff cannot be refunded as the turf reservation is locked exclusively for your squad."
    }
  ];

  return (
    <div className={cn("min-h-screen pt-20 pb-16 transition-colors duration-200", isDark ? "bg-[#080B11] text-white" : "bg-slate-50 text-slate-900")}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:underline mb-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Cancellation & Refund Policy</h1>
              <p className="text-xs text-slate-500 dark:text-white/50">Last updated: August 1, 2026</p>
            </div>
          </div>
        </div>

        {/* Highlight Summary Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 mb-8">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">100% Weather & Turf Closure Protection</h2>
              <p className="text-xs text-slate-600 dark:text-white/70 mt-1 leading-relaxed">
                If a turf is unplayable due to unseasonal rain, floodlight power outage, or venue maintenance, SportXClub issues a <strong>100% Automatic Full Refund</strong> with zero hassle.
              </p>
            </div>
          </div>
        </div>

        {/* Refund Schedule Table/Cards */}
        <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
          <Clock className="h-5 w-5 text-emerald-500" />
          <span>Turf Booking Cancellation Timeline</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {refundTiers.map((tier, idx) => (
            <div
              key={idx}
              className={cn("p-5 rounded-2xl border flex flex-col justify-between transition-all", isDark ? "bg-[#10141D] border-white/10" : "bg-white border-slate-200 shadow-xs")}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider border", tier.badgeColor)}>
                    {tier.badge}
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{tier.refund}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-white/90 mb-1">{tier.timing}</h3>
                <p className="text-xs text-slate-500 dark:text-white/60 leading-relaxed">{tier.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Clauses */}
        <div className="space-y-4">
          <div className={cn("p-5 rounded-2xl border", isDark ? "bg-[#10141D] border-white/10" : "bg-white border-slate-200 shadow-xs")}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-500" />
              <span>Refund Processing Timeline & Mode</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed">
              • <strong>Instant Wallet Credit:</strong> Refund credited instantly to your SportX Wallet for future bookings.<br />
              • <strong>Original Payment Source (UPI / Card / Netbanking):</strong> Processed within 3 to 5 business days as per bank settlement timelines.
            </p>
          </div>

          <div className={cn("p-5 rounded-2xl border", isDark ? "bg-[#10141D] border-white/10" : "bg-white border-slate-200 shadow-xs")}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Tournament Entry Fee Refunds</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed">
              Tournament registrations are 100% refundable if cancelled prior to the registration closing date or if the tournament is cancelled by event organizers. Once match fixtures are officially drawn, entry fees become non-refundable.
            </p>
          </div>
        </div>

        {/* How to Cancel CTA */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-600/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/20 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Need to cancel a booking?</h3>
          <p className="text-xs text-slate-600 dark:text-white/70 mt-1 max-w-md mx-auto">
            You can request a 1-click cancellation directly from your "My Bookings" screen.
          </p>
          <Link
            to="/bookings"
            className="inline-flex items-center gap-2 px-5 py-2.5 mt-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            Go to My Bookings
          </Link>
        </div>

      </div>
    </div>
  );
}
