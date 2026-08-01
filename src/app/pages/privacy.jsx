import { Link } from "react-router";
import { Lock, Shield, Eye, Database, Bell, UserCheck, ArrowLeft, HelpCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "../components/ui/utils";

export function PrivacyPolicy() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const sections = [
    {
      id: "collection",
      title: "1. Information We Collect",
      content: `We collect information to provide seamless turf discovery and slot reservations:
• Personal Details: Name, email address, phone number, and profile picture.
• Location Data: Device GPS or city selection used exclusively for displaying nearby sports venues.
• Booking & Payment Info: Reservation history, squad invites, and tokenized payment confirmation logs.`
    },
    {
      id: "usage",
      title: "2. How We Use Your Data",
      content: `Your data is utilized strictly for service delivery:
• Confirming turf bookings and issuing instant booking QR pass codes.
• Connecting players for Squad Games and open lobby matches.
• Sending match reminders, venue directions, and refund confirmations.
• Improving AI-based turf recommendations and personalized sports feeds.`
    },
    {
      id: "sharing",
      title: "3. Information Sharing & Disclosure",
      content: `SportXClub respects your privacy. We NEVER sell or rent your personal information to third-party advertisers. Data is shared strictly under these conditions:
• Partner Turf Owners: Shared only necessary booking details (Name, Contact No, Slot Timing) to facilitate entry at the venue gate.
• Secure Payment Gateways: Encrypted transaction data processed via PCI-DSS compliant partners.
• Legal Compliance: Disclosed only when mandated by law or valid court order.`
    },
    {
      id: "security",
      title: "4. Data Security & Storage",
      content: `We enforce industry-standard security controls including TLS 1.3 encryption, secure OAuth 2.0 authentication, and encrypted database backups to safeguard your personal data from unauthorized access or breaches.`
    },
    {
      id: "cookies",
      title: "5. Cookies & Local Storage",
      content: `We use cookies and local storage tokens to remember your theme preference (Dark/Light mode), preferred city selection, and logged-in user session for a smooth app experience.`
    },
    {
      id: "rights",
      title: "6. Your Data Rights & Choices",
      content: `You have full control over your data:
• You can view and edit your profile details at any time in Account Settings.
• You can request account deletion or data export by reaching out to support@sportxclub.com.`
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
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
              <p className="text-xs text-slate-500 dark:text-white/50">Last updated: August 1, 2026</p>
            </div>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 mb-8">
          <Shield className="h-6 w-6 text-emerald-500 shrink-0" />
          <p className="text-xs sm:text-sm text-slate-700 dark:text-white/80 font-medium">
            Your privacy is our priority. SportXClub never sells your personal data or phone number to third-party telemarketers.
          </p>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6">
          {sections.map((sec) => (
            <div
              key={sec.id}
              id={sec.id}
              className={cn("p-6 rounded-2xl border transition-all", isDark ? "bg-[#10141D] border-white/10" : "bg-white border-slate-200 shadow-xs")}
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{sec.title}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-white/70 leading-relaxed whitespace-pre-line">
                {sec.content}
              </p>
            </div>
          ))}
        </div>

        {/* Privacy Contact Footer Box */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-600/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/20 text-center">
          <HelpCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Questions regarding your privacy?</h3>
          <p className="text-xs text-slate-600 dark:text-white/70 mt-1 max-w-md mx-auto">
            Contact our dedicated Data Privacy Officer at privacy@sportxclub.com
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 mt-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            Contact Privacy Support
          </Link>
        </div>

      </div>
    </div>
  );
}
