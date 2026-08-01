import { Link } from "react-router";
import { ShieldCheck, FileText, Calendar, CheckCircle2, ChevronRight, HelpCircle, ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "../components/ui/utils";

export function TermsAndConditions() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: `By downloading, accessing, or using the SportXClub website, mobile applications, or venue booking platform (collectively, the "Services"), you agree to be bound by these Terms & Conditions. If you do not agree to all terms, please refrain from using our Services.`
    },
    {
      id: "accounts",
      title: "2. User Accounts & Responsibilities",
      content: `To book turfs, register for tournaments, or create sports squads, you must register an account. You agree to provide accurate, complete, and updated information. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account.`
    },
    {
      id: "turf-bookings",
      title: "3. Turf & Venue Bookings",
      content: `SportXClub acts as a discovery and booking marketplace connecting players with verified sports venues. When you confirm a booking:
• You agree to adhere to the venue's specific rules (e.g., proper footwear, timing, non-marking shoes for indoor courts).
• You must arrive on time for your scheduled slot. Extensions are subject to slot availability and extra venue charges.
• Any damage caused to venue property or equipment during your slot will be your financial responsibility.`
    },
    {
      id: "tournaments",
      title: "4. Tournaments & Community Play",
      content: `Participants in tournaments or open lobbies must maintain fair play and sportsmanship. Tournament organizers reserve the right to disqualify teams for misconduct, fraudulent player entries, or rule violations without refund.`
    },
    {
      id: "payments",
      title: "5. Payments & Pricing",
      content: `All prices for turf slots, squad bookings, and tournament entry fees are listed in Indian Rupees (INR) inclusive of applicable taxes. Payments are processed securely via verified gateways. Promos and discounts must be applied prior to checkout.`
    },
    {
      id: "limitation",
      title: "6. Limitation of Liability",
      content: `Sports and physical activities carry inherent risks of bodily injury. SportXClub is not liable for personal injuries, accidents, lost possessions, or property damage occurring at partner turf venues. Players participate at their own risk.`
    },
    {
      id: "changes",
      title: "7. Modifications to Terms",
      content: `SportXClub reserves the right to modify these terms at any time. Continued usage of the platform following published changes constitutes your acceptance of the updated terms.`
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
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Terms & Conditions</h1>
              <p className="text-xs text-slate-500 dark:text-white/50">Last updated: August 1, 2026</p>
            </div>
          </div>
        </div>

        {/* Quick Navigation Card */}
        <div className={cn("p-5 rounded-2xl border mb-8", isDark ? "bg-[#10141D] border-white/10" : "bg-white border-slate-200 shadow-xs")}>
          <h2 className="text-xs uppercase font-bold tracking-wider text-emerald-500 mb-3">Quick Navigation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className={cn("flex items-center gap-2 p-2 rounded-lg transition-all", isDark ? "hover:bg-white/5 text-white/80" : "hover:bg-slate-100 text-slate-700")}
              >
                <ChevronRight className="h-3.5 w-3.5 text-emerald-500" />
                <span>{sec.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6">
          {sections.map((sec) => (
            <div
              key={sec.id}
              id={sec.id}
              className={cn("p-6 rounded-2xl border scroll-mt-24 transition-all", isDark ? "bg-[#10141D] border-white/10" : "bg-white border-slate-200 shadow-xs")}
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{sec.title}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-white/70 leading-relaxed whitespace-pre-line">
                {sec.content}
              </p>
            </div>
          ))}
        </div>

        {/* Contact Support Footer Box */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-600/10 via-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center">
          <HelpCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Have questions about our Terms?</h3>
          <p className="text-xs text-slate-600 dark:text-white/70 mt-1 max-w-md mx-auto">
            Our support team is available 24/7 to clarify any booking terms or guidelines.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 mt-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            Contact Support Team
          </Link>
        </div>

      </div>
    </div>
  );
}
