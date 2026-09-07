import { Link } from "react-router";
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowLeft, 
  ShieldCheck, 
  Wallet, 
  CreditCard,
  HelpCircle,
  Mail,
  Phone,
  RotateCcw,
  Zap,
  Building2,
  FileCheck2
} from "lucide-react";
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
      desc: "Full 100% refund credited back to your original payment source (UPI / Card / Netbanking via Razorpay) within 5–7 working days or instant 100% SportX Wallet credit."
    },
    {
      timing: "Cancel 12 - 24 Hours Before Slot",
      refund: "75% Refund",
      badge: "75% BACK",
      badgeColor: "bg-teal-500/10 text-teal-500 border-teal-500/20",
      desc: "75% amount refunded to payment source. 25% retained as nominal venue holding and administrative fee."
    },
    {
      timing: "Cancel 4 - 12 Hours Before Slot",
      refund: "50% Refund",
      badge: "50% BACK",
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      desc: "50% amount refunded to original payment method or wallet credit. 50% retained for late-stage slot release."
    },
    {
      timing: "Cancel < 4 Hours Before Slot",
      refund: "Non-Refundable",
      badge: "NO REFUND",
      badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      desc: "Slots cancelled less than 4 hours before kickoff cannot be refunded as the turf reservation is locked exclusively for your squad."
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
              <p className="text-xs text-slate-500 dark:text-white/50">Last updated: August 1, 2026 | In accordance with Razorpay Merchant Guidelines</p>
            </div>
          </div>
        </div>

        {/* Highlight Summary Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-emerald-600/10 border border-emerald-500/20 mb-8">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">100% Weather & Venue Outage Guarantee</h2>
              <p className="text-xs text-slate-600 dark:text-white/70 mt-1 leading-relaxed">
                If a turf is unplayable due to unseasonal rain, floodlight electrical failure, or partner venue maintenance, SportXClub issues a <strong>100% Automatic Full Refund</strong> with zero cancellation charges.
              </p>
            </div>
          </div>
        </div>

        {/* Refund Schedule Table/Cards */}
        <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
          <Clock className="h-5 w-5 text-emerald-500" />
          <span>Turf Booking Cancellation Timeline & Deductions</span>
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

        {/* Razorpay Refund Timelines & Payment Modes */}
        <div className="space-y-4 mb-8">
          <div className={cn("p-6 rounded-2xl border", isDark ? "bg-[#10141D] border-white/10" : "bg-white border-slate-200 shadow-xs")}>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-500" />
              <span>Razorpay Refund Settlement Timelines & Modes</span>
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-white/70 leading-relaxed">
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <Zap className="h-4 w-4 text-emerald-500" />
                  Instant SportX Wallet Credit (0 – 15 Minutes)
                </p>
                <p className="text-xs text-slate-500 dark:text-white/60">
                  Select "SportX Wallet" at cancellation to receive 100% instant credit usable immediately across any turf, tournament, or open lobby.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  Original Payment Source via Razorpay (5 – 7 Working Days)
                </p>
                <p className="text-xs text-slate-500 dark:text-white/60">
                  Refunds to UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, or Net Banking are initiated instantly through Razorpay. As per standard banking settlement cycles, the amount will reflect in your bank account / card statement within <strong>5 to 7 business/working days</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Failed Transaction Reconciliation */}
          <div className={cn("p-6 rounded-2xl border", isDark ? "bg-[#10141D] border-white/10" : "bg-white border-slate-200 shadow-xs")}>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-teal-500" />
              <span>Failed / Incomplete Transactions Policy</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-white/70 leading-relaxed">
              In rare instances where your bank account is debited but your booking is not confirmed due to network timeouts or gateway handshake interruptions:
              <br /><br />
              • The transaction is automatically identified by Razorpay's auto-reconciliation engine.<br />
              • The deducted amount is automatically reversed back to your bank account / source within <strong>24 to 48 hours</strong> (or standard bank cycle of 5–7 working days).<br />
              • If the amount does not reflect after 48 hours, simply email your Razorpay Payment ID to <span className="text-emerald-500 font-semibold">support@sportxclub.com</span> for instant manual tracking.
            </p>
          </div>

          {/* Tournament & Special Events */}
          <div className={cn("p-6 rounded-2xl border", isDark ? "bg-[#10141D] border-white/10" : "bg-white border-slate-200 shadow-xs")}>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Tournament & Squad Registration Refunds</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-white/70 leading-relaxed">
              • <strong>100% Full Refund:</strong> If a tournament registration is cancelled prior to the official tournament entry deadline, or if the tournament is cancelled/postponed by organizers.<br />
              • <strong>Non-Refundable:</strong> Once match brackets/fixtures are officially finalized and published, tournament entry fees become non-refundable to prevent bracket disruptions.
            </p>
          </div>

          {/* Step-by-Step Cancellation Guide */}
          <div className={cn("p-6 rounded-2xl border", isDark ? "bg-[#10141D] border-white/10" : "bg-white border-slate-200 shadow-xs")}>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-emerald-500" />
              <span>How to Cancel a Booking & Request a Refund</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5">
                <span className="font-extrabold text-emerald-500 text-sm">Step 1</span>
                <p className="text-slate-700 dark:text-white/80 mt-1">Navigate to <strong>My Bookings</strong> from your user dashboard.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5">
                <span className="font-extrabold text-emerald-500 text-sm">Step 2</span>
                <p className="text-slate-700 dark:text-white/80 mt-1">Select your active slot and click <strong>Cancel Booking</strong>.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5">
                <span className="font-extrabold text-emerald-500 text-sm">Step 3</span>
                <p className="text-slate-700 dark:text-white/80 mt-1">Choose between <strong>Instant Wallet</strong> or <strong>Razorpay Original Source</strong>.</p>
              </div>
            </div>
          </div>
        </div>

        {/* How to Cancel CTA */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-600/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/20 text-center">
          <HelpCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Need Assistance With a Refund or Cancellation?</h3>
          <p className="text-xs text-slate-600 dark:text-white/70 mt-1 max-w-md mx-auto">
            Our support desk is available Monday to Saturday (9:00 AM – 7:00 PM IST) to assist with payment and refund queries.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Mail className="h-3.5 w-3.5" /> support@sportxclub.com
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Phone className="h-3.5 w-3.5" /> +91 9876543210
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <Link
              to="/bookings"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20"
            >
              Go to My Bookings
            </Link>
            <Link
              to="/profile"
              className={cn("inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl border transition-all", isDark ? "border-white/10 hover:bg-white/5 text-white" : "border-slate-300 hover:bg-slate-100 text-slate-800")}
            >
              Contact Support Desk
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
