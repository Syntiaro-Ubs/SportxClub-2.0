import { Link } from "react-router";
import { 
  Lock, 
  Shield, 
  Database, 
  ArrowLeft, 
  HelpCircle, 
  CreditCard, 
  CheckCircle2, 
  Mail, 
  Phone, 
  ShieldCheck,
  ChevronRight,
  UserCheck,
  EyeOff
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "../components/ui/utils";

export function PrivacyPolicy() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const sections = [
    {
      id: "commitment",
      title: "1. Commitment & Regulatory Compliance",
      content: `SportXClub (operated and powered by Syntiaro, "SportXClub", "we", "our", or "us") values your trust and is dedicated to protecting your privacy and personal data.

This Privacy Policy describes how we collect, process, store, and safeguard your personal information in compliance with:
• The Information Technology Act, 2000 (IT Act)
• The Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (SPDI Rules)
• The Digital Personal Data Protection Act, 2023 (DPDP Act)
• Applicable Reserve Bank of India (RBI) directives on digital payment data protection.`
    },
    {
      id: "collection",
      title: "2. Information We Collect",
      content: `We collect the following categories of data to provide seamless venue discovery and booking services:

• Personal Identity & Contact Data: Full name, email address, mobile phone number, and optional profile photograph.
• Venue Booking & Activity Data: Booking history, slot times, preferred sports (Cricket, Football, Badminton, etc.), squad invites, and tournament registrations.
• Location Information: Approximate device GPS location or city selections used solely to identify and display nearby sports facilities.
• Technical & Device Metadata: IP address, device model, operating system, browser type, and application performance logs.`
    },
    {
      id: "razorpay-payments",
      title: "3. Payment Information & Razorpay Security Guarantee",
      content: `• No Sensitive Card Data Storage: SportXClub DOES NOT collect, store, or process your sensitive financial credentials, including full credit/debit card numbers, CVV/CVC codes, ATM PINs, or Net Banking login credentials.
• PCI-DSS Level 1 Payment Aggregator: All payment transactions are securely handled by our authorized payment partner, Razorpay Software Private Limited ("Razorpay"). Razorpay is an RBI-authorized payment aggregator certified under Payment Card Industry Data Security Standard (PCI-DSS) Level 1 and ISO 27001.
• RBI Tokenization Compliance: In adherence with RBI guidelines, card transactions are processed via secure tokenization where card details are converted into encrypted tokens without exposing primary account numbers.
• Transaction Records: We only retain non-sensitive transaction confirmation metadata (e.g., Razorpay Payment ID, Order ID, Amount, Timestamp, and Payment Status) to issue invoices and process refund claims.`
    },
    {
      id: "usage",
      title: "4. Purpose & How We Use Your Data",
      content: `Your data is utilized strictly for legitimate operational purposes:
• Generating digital booking confirmations, venue QR entry passes, and tax receipts.
• Processing payments, authorized refunds, and managing transaction disputes.
• Sending match reminders, turf status alerts, and squad notifications via SMS, WhatsApp, and email.
• Providing customer support and resolving grievance redressal requests.
• Preventing fraudulent bookings, unauthorized logins, and safeguarding platform integrity.`
    },
    {
      id: "sharing",
      title: "5. Information Sharing & Third-Party Disclosures",
      content: `SportXClub respects your data privacy. We NEVER sell, lease, or monetize your personal information to third-party telemarketers or advertisers. 

We disclose data strictly under the following controlled circumstances:
• Partner Sports Venues: We share essential booking information (Customer Name, Phone Number, Slot Time) with venue managers solely for ground entry gate verification.
• Razorpay & Banking Partners: Encrypted transaction information is transmitted to Razorpay to authorize and settle payments and execute refunds.
• Legal & Statutory Obligations: Information may be disclosed if required by a court order, law enforcement investigation, or applicable Indian statutory regulations.`
    },
    {
      id: "security",
      title: "6. Data Security & Technical Measures",
      content: `We implement robust technical and organizational security measures to protect your information:
• 256-bit SSL/TLS encryption for all data in transit between your device and our servers.
• Encrypted database storage with multi-factor authentication (MFA) restricted access controls.
• Regular security audits and vulnerability assessments to protect against unauthorized access, loss, or data breaches.`
    },
    {
      id: "cookies",
      title: "7. Cookies & Session Storage",
      content: `We utilize industry-standard session cookies and local storage tokens to:
• Maintain your secure login session.
• Remember your visual theme preference (Dark Mode / Light Mode).
• Save your selected city to quickly load nearby turf arenas.`
    },
    {
      id: "rights",
      title: "8. Your Data Protection Rights",
      content: `Under applicable Indian data protection laws, you possess the right to:
• Access & Review: View your stored personal and booking information.
• Rectification: Update or correct inaccurate personal details in your Account Profile.
• Right to Erasure: Request permanent deletion of your account and personal data by writing to privacy@sportxclub.com.
• Revoke Consent: Withdraw consent for promotional communications at any time.`
    },
    {
      id: "grievance-officer",
      title: "9. Data Protection Grievance Officer",
      content: `In accordance with the Information Technology Act, 2000 and the DPDP Act, 2023, if you have any questions, concerns, or grievances regarding this Privacy Policy or your data handling, you can reach our Grievance Redressal Officer:

• Designation: Data Protection & Grievance Officer
• Company: SportXClub (Syntiaro)
• Email: privacy@sportxclub.com / support@sportxclub.com
• Phone: +91 9876543210
• Office Address: SportXClub Corporate Office, Mumbai, Maharashtra, India - 400001
• Redressal Timeline: All grievances are acknowledged within 48 hours and resolved within 30 days of receipt.`
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
              <p className="text-xs text-slate-500 dark:text-white/50">Last updated: August 1, 2026 | Compliant with DPDP Act 2023 & IT Act</p>
            </div>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/20 flex items-start gap-4 mb-8">
          <ShieldCheck className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Your Payment & Data Privacy is 100% Protected</h2>
            <p className="text-xs text-slate-600 dark:text-white/70 mt-1 leading-relaxed">
              We do not store credit/debit card numbers or bank credentials. All transactions are securely processed through <strong>Razorpay</strong> with RBI tokenization and PCI-DSS Level 1 compliance.
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

        {/* Privacy Contact Footer Box */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-600/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/20 text-center">
          <HelpCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Questions Regarding Your Privacy?</h3>
          <p className="text-xs text-slate-600 dark:text-white/70 mt-1 max-w-md mx-auto">
            Contact our dedicated Data Privacy Officer for data queries or account removal requests.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Mail className="h-3.5 w-3.5" /> privacy@sportxclub.com
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Phone className="h-3.5 w-3.5" /> +91 9876543210
            </span>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 mt-5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            Contact Privacy Support
          </Link>
        </div>

      </div>
    </div>
  );
}
