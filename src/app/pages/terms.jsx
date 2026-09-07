import { Link } from "react-router";
import { 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight, 
  HelpCircle, 
  ArrowLeft, 
  Mail, 
  Phone
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "../components/ui/utils";

export function TermsAndConditions() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms & Platform Overview",
      content: `Welcome to SportXClub (operated and powered by Syntiaro, hereinafter referred to as "SportXClub", "we", "us", or "our"). These Terms and Conditions ("Terms") govern your access to and use of the SportXClub website, mobile applications, APIs, and sports venue booking services (collectively, the "Services").

By creating an account, browsing our platform, booking a turf/court, or making a payment, you agree to be legally bound by these Terms, our Privacy Policy, and our Cancellation & Refund Policy. If you do not agree with any part of these Terms, you must not use our Services.`
    },
    {
      id: "eligibility",
      title: "2. User Eligibility & Account Registration",
      content: `• Eligibility: You must be at least 18 years of age or possess legal parental/guardian consent to enter into legally binding contracts under the Indian Contract Act, 1872.
• Account Security: You must provide accurate, current, and complete information during registration. You are solely responsible for safeguarding your login credentials and for any activity under your account.
• Prohibited Usage: You agree not to impersonate any individual, use automated scraping bots, or utilize the platform for fraudulent bookings or unauthorized commercial resale.`
    },
    {
      id: "venue-bookings",
      title: "3. Sports Venue & Slot Bookings",
      content: `• Booking Confirmation: SportXClub acts as a premier technology platform facilitating discovery and reservations for sports turfs, box cricket arenas, football grounds, badminton courts, and multi-sport facilities. A booking is confirmed only upon successful payment capture and issuance of a digital Booking ID / QR Pass.
• Punctuality & Slot Usage: You and your group must adhere strictly to the scheduled slot timing. Slot extensions are subject to venue availability and additional charges at the venue's prevailing rack rate.
• Venue Rules & Dress Code: Users must strictly comply with venue guidelines, including mandatory non-marking shoes for indoor wooden/synthetic courts, proper athletic footwear, and standard sports attire.
• Property Damage & Safety: Users are liable for any physical damage caused to the venue's turf, netting, floodlights, or sports gear during their booked slot.`
    },
    {
      id: "tournaments",
      title: "4. Tournaments, Open Lobbies & Squad Games",
      content: `• Fair Play & Code of Conduct: All players participating in community matches, open lobbies, or tournaments must maintain the highest standards of sportsmanship. Unsportsmanlike conduct, verbal abuse, violence, or cheating will result in immediate match forfeiture and permanent account suspension.
• Organizer Discretion: Tournament organizers reserve the right to verify player identity, modify match fixtures due to unforeseen scheduling constraints, or disqualify non-compliant teams without refund.`
    },
    {
      id: "payments-razorpay",
      title: "5. Pricing, Billing & Razorpay Payment Gateway Terms",
      content: `• Currency & Pricing: All pricing for turf slots, squad entries, and tournament registrations are listed in Indian Rupees (INR) and are inclusive or exclusive of applicable taxes (GST) as explicitly specified at checkout before payment.
• Payment Processing via Razorpay: All online payments on SportXClub are processed securely through our authorized payment aggregator, Razorpay Software Private Limited ("Razorpay"). By initiating a payment, you authorize Razorpay and SportXClub to charge your selected payment method (UPI, Credit Cards, Debit Cards, Net Banking, or supported Digital Wallets).
• Immediate Capture: Payments are captured in real-time upon authorization. Once the payment status confirms "SUCCESS" from Razorpay, your booking slot is instantly locked and confirmed.
• Surcharges & Bank Fees: SportXClub does not levy unauthorized surcharges. Any bank-specific convenience or processing fees charged by your card issuer or banking partner are outside our control.
• Fraud Prevention & Chargebacks: In the event of suspected payment fraud, stolen card usage, or unauthorized chargebacks, SportXClub reserves the right to cancel bookings, report the incident to relevant statutory authorities, and recover disputed funds.`
    },
    {
      id: "cancellation-refunds",
      title: "6. Cancellation, Rescheduling & Refund Policy",
      content: `All cancellations, slot modifications, and refund claims are governed by our dedicated Cancellation & Refund Policy. 

Key Highlights:
• Cancellation more than 24 hours prior to slot: 100% full refund or wallet credit.
• Cancellation between 12 to 24 hours: 75% refund.
• Cancellation between 4 to 12 hours: 50% refund.
• Cancellation under 4 hours: Non-refundable due to exclusive slot reservation.
• Venue closures (weather, floodlight failure): 100% full automatic refund.
• Refund Settlement Timeline: Approved refunds to original payment sources (UPI/Cards/Netbanking) will reflect within 5 to 7 working days as per standard banking settlement cycles.`
    },
    {
      id: "limitation-liability",
      title: "7. Risk Assumption, Health Disclaimer & Limitation of Liability",
      content: `• Physical Activity Disclaimer: Sports and physical activities carry inherent risks of bodily injury, strain, accidents, or medical emergencies. You voluntarily assume all risks associated with participation.
• Medical Fitness: It is your responsibility to ensure you and your participants are physically fit and medically cleared for vigorous sports activities.
• Limitation of Liability: To the maximum extent permitted by applicable Indian law, SportXClub and Syntiaro shall not be liable for any indirect, incidental, punitive, or consequential damages, personal bodily injuries, medical expenses, or loss of personal belongings occurring at partner turf venues.`
    },
    {
      id: "intellectual-property",
      title: "8. Intellectual Property Rights",
      content: `All trademarks, logos, brand names, software code, user interface designs, and content on SportXClub are the exclusive intellectual property of Syntiaro and SportXClub. You may not copy, reproduce, reverse-engineer, distribute, or create derivative works without prior written consent.`
    },
    {
      id: "termination",
      title: "9. Termination & Account Suspension",
      content: `SportXClub reserves the right to suspend, deactivate, or terminate your account immediately without prior notice if you violate these Terms, engage in fraudulent transactions, harass venue personnel or other players, or compromise platform security.`
    },
    {
      id: "governing-law",
      title: "10. Governing Law & Dispute Resolution",
      content: `These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes, claims, or controversies arising out of or relating to these Terms, payments, or the platform shall be subject to the exclusive jurisdiction of the competent courts in Mumbai / Pune, Maharashtra, India.`
    },
    {
      id: "grievance-officer",
      title: "11. Grievance Redressal & Support Contact",
      content: `In compliance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, the details of the Grievance Redressal Officer are provided below:

• Entity Name: SportXClub (Powered by Syntiaro)
• Grievance Officer: Legal & Compliance Department
• Email: support@sportxclub.com
• Phone: +91 9876543210
• Operating Hours: Monday to Saturday, 9:00 AM – 7:00 PM IST
• Business Address: SportXClub Headquarters, Mumbai, Maharashtra, India - 400001`
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
              <p className="text-xs text-slate-500 dark:text-white/50">Last updated: August 1, 2026 | Effective Date: August 1, 2026</p>
            </div>
          </div>
        </div>

        {/* Razorpay Compliance Summary Banner */}
        <div className={cn("p-5 rounded-2xl border mb-8 flex items-start gap-4", isDark ? "bg-[#10141D] border-emerald-500/20" : "bg-emerald-50/70 border-emerald-200")}>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Secure Razorpay Payment Guarantee</h2>
            <p className="text-xs text-slate-600 dark:text-white/70 mt-1 leading-relaxed">
              All transactions on SportXClub are processed via <strong>Razorpay Software Private Limited</strong> using 256-bit SSL encryption. We accept UPI, Cards, Net Banking, and authorized Wallets with instant booking confirmation.
            </p>
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
                <ChevronRight className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">{sec.title}</span>
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

        {/* Contact / Grievance Card */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-600/10 via-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center">
          <HelpCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Have Questions Regarding Our Terms?</h3>
          <p className="text-xs text-slate-600 dark:text-white/70 mt-1 max-w-md mx-auto">
            Our grievance & customer support team is here to assist you with booking rules, payment inquiries, or account questions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Mail className="h-3.5 w-3.5" /> support@sportxclub.com
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Phone className="h-3.5 w-3.5" /> +91 9876543210
            </span>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 mt-5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            Contact Customer Support
          </Link>
        </div>

      </div>
    </div>
  );
}
