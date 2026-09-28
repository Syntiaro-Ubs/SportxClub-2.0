import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "../components/ui/button";
import {
  CheckCircle2,
  Download,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import { motion } from "motion/react";
import { Container } from "../components/ui/container";
import { toast } from "sonner";
import { downloadSportXPassPdf, parseBookingSlots } from "../utils/ticket-pdf-generator";
import { GlobalFooter } from "../components/layout/GlobalFooter";

/* ============================================================
   AUTHENTIC SPORT SVG ICON (Matches PDF 1:1)
============================================================ */
const SportIcon = ({ sport, className = "w-3.5 h-3.5" }) => {
  const s = String(sport || "").toLowerCase();
  if (s.includes("cricket")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <line x1="3.5" y1="3.5" x2="8" y2="8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <polygon points="7,9.5 9.5,7 20.5,18 18,20.5" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
        <line x1="8.5" y1="8.5" x2="19" y2="19" stroke="white" strokeWidth="0.9" />
        <circle cx="18" cy="6" r="3.2" fill="currentColor" stroke="currentColor" strokeWidth="0.8" />
        <path d="M15.5 6 C17 7.5, 19 7.5, 20.5 6" stroke="white" strokeWidth="0.8" fill="none" />
      </svg>
    );
  }
  if (s.includes("football") || s.includes("soccer")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9.5" />
        <polygon points="12,7.5 15.8,10.2 14.3,14.8 9.7,14.8 8.2,10.2" fill="currentColor" stroke="currentColor" />
        <line x1="12" y1="7.5" x2="12" y2="2.5" />
        <line x1="15.8" y1="10.2" x2="20.5" y2="8.5" />
        <line x1="14.3" y1="14.8" x2="17.5" y2="19.5" />
        <line x1="9.7" y1="14.8" x2="6.5" y2="19.5" />
        <line x1="8.2" y1="10.2" x2="3.5" y2="8.5" />
      </svg>
    );
  }
  if (s.includes("tennis")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9.5" />
        <path d="M6 3.5 C9 8, 9 16, 6 20.5" strokeWidth="1.5" />
        <path d="M18 3.5 C15 8, 15 16, 18 20.5" strokeWidth="1.5" />
      </svg>
    );
  }
  if (s.includes("badminton")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="19" r="2.5" fill="currentColor" />
        <polygon points="9.5,16.5 4,5 20,5 14.5,16.5" stroke="currentColor" fill="none" />
        <line x1="12" y1="5" x2="12" y2="16.5" />
        <line x1="7" y1="10" x2="17" y2="10" />
      </svg>
    );
  }
  if (s.includes("basketball")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9.5" />
        <line x1="2.5" y1="12" x2="21.5" y2="12" />
        <line x1="12" y1="2.5" x2="12" y2="21.5" />
        <path d="M5.5 5.5 C8.5 8.5, 8.5 15.5, 5.5 18.5" />
        <path d="M18.5 5.5 C15.5 8.5, 15.5 15.5, 18.5 18.5" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9.5" />
      <polygon points="12,7.5 15.8,10.2 14.3,14.8 9.7,14.8 8.2,10.2" fill="currentColor" stroke="currentColor" />
      <line x1="12" y1="7.5" x2="12" y2="2.5" />
      <line x1="15.8" y1="10.2" x2="20.5" y2="8.5" />
      <line x1="14.3" y1="14.8" x2="17.5" y2="19.5" />
      <line x1="9.7" y1="14.8" x2="6.5" y2="19.5" />
      <line x1="8.2" y1="10.2" x2="3.5" y2="8.5" />
    </svg>
  );
};

/* ============================================================
   TOP CHECKMARK BADGE (Exact 1:1 with PDF drawCheckBadge)
============================================================ */
function CheckBadge() {
  return (
    <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20">
      <div className="relative h-14 w-14 flex items-center justify-center">
        {/* White Knockout Circle to cleanly mask ticket border behind badge */}
        <div className="absolute inset-0 rounded-full bg-white dark:bg-[#111827]" />
        {/* SVG open circle + checkmark extending out top-right */}
        <svg className="w-14 h-14 relative z-10" viewBox="0 0 56 56" fill="none">
          {/* Open Circle Arc with symmetric gap at top-right (-20° to 294°) */}
          <path
            d="M 46.79 21.16 A 20 20 0 1 1 36.13 9.73"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Checkmark short leg */}
          <line
            x1="18.5"
            y1="27"
            x2="26"
            y2="34.2"
            stroke="#10B981"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          {/* Checkmark long leg extending right through opening center */}
          <line
            x1="26"
            y1="34.2"
            x2="43.6"
            y2="13.2"
            stroke="#10B981"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

export function BookingSuccess() {
  const location = useLocation();

  // Read saved booking info from location state or session storage
  let bookingData = location.state || null;
  if (!bookingData) {
    try {
      const saved = sessionStorage.getItem("sportxclub_booking") || sessionStorage.getItem("sportxclub_last_booking");
      if (saved) {
        bookingData = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error reading booking details:", e);
    }
  }

  // Fallback defaults with safe optional chaining
  const isSplit = bookingData ? bookingData.paymentMode === "split" : false;
  const costPerPlayer = bookingData?.costPerPlayer || bookingData?.price || 600;
  const totalPrice = bookingData?.totalPrice || bookingData?.price || 1200;
  const dateStr = bookingData?.selectedDate || bookingData?.date || "June 18, 2026";
  const rawTimeStr = bookingData?.startTime ? `${bookingData.startTime} (${bookingData.playHours || 1} hr)` : (bookingData?.time || bookingData?.time_slot || "6:00 PM - 7:00 PM");
  const parsedSlot = parseBookingSlots(rawTimeStr);
  const timeStr = parsedSlot.displaySlotText || rawTimeStr;
  const venueName = typeof bookingData?.venue === "object" ? (bookingData.venue.name || "Elite Sports Arena") : (bookingData?.venue || "Elite Sports Arena");
  const venueAddress = typeof bookingData?.venue === "object" ? (bookingData.venue.location || "123 Sports Complex, MG Road, Mumbai") : (bookingData?.location || "123 Sports Complex, MG Road, Mumbai");
  const members = bookingData?.squadLobby?.members || [
    { id: "m1", name: "You (Host)", role: "host" },
    { id: "m2", name: "Priya Patel", role: "member" },
  ];

  // Track which members have paid (Initially only host is paid in split)
  const hostId = members.find(m => m.role === "host")?.id || members[0]?.id;
  const [paidMemberIds, setPaidMemberIds] = useState(
    isSplit ? [hostId] : members.map(m => m.id)
  );

  const currentPaymentDate = (() => {
    try {
      const now = new Date();
      return now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) + ", " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
      return "26 Sep 2026, 08:30 PM";
    }
  })();
  
  const playerName = bookingData?.userName || localStorage.getItem("userName") || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}")?.name : "") || "SportX Player";
  const playerPhone = bookingData?.phone || bookingData?.userPhone || localStorage.getItem("userPhone") || "7410507803";
  const orderId = bookingData?.bookingId || bookingData?.orderId || "order_spx_1790347058513_950";
  const sportStr = bookingData?.sport || "FOOTBALL";

  const [copied, setCopied] = useState(false);
  const handleCopyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      toast.success("Order ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Simulate players payment completion after 10 seconds
  useEffect(() => {
    if (isSplit && paidMemberIds.length < members.length) {
      const timer = setTimeout(() => {
        setPaidMemberIds(members.map(m => m.id));
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, [isSplit, members, hostId, paidMemberIds.length]);

  const handleDownloadReceipt = async () => {
    const loadingToastId = toast.loading("Generating SportX Official Entry Pass PDF...");

    try {
      await downloadSportXPassPdf({
        orderId: orderId,
        userName: playerName,
        userPhone: playerPhone,
        turfName: venueName || "SportX Arena",
        location: venueAddress?.split(",")?.slice(-2)?.[0]?.trim() || venueAddress?.split(",")?.slice(-1)?.[0]?.trim() || "Nagpur",
        sport: sportStr,
        date: dateStr || "2026-09-25",
        timeSlot: timeStr || "06:00 PM - 07:00 PM",
        amount: (isSplit ? costPerPlayer : totalPrice) || 0,
        paymentDate: currentPaymentDate,
      }, `SportXClub_Pass_${orderId}.pdf`);

      toast.dismiss(loadingToastId);
      toast.success("SportX Entry Pass downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.dismiss(loadingToastId);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <>
      <Container className="pt-12 pb-4 md:pb-12 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="text-center space-y-6 max-w-lg w-full"
        >
          <div className="flex justify-center relative">
            {/* Ambient success glow background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

            {/* Animated premium glass badge */}
            <motion.div
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="relative h-24 w-24 flex items-center justify-center"
            >
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 dark:bg-emerald-600/10 animate-ping opacity-75" />

              {/* Layered border glow */}
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 dark:from-emerald-600 dark:to-emerald-400 opacity-20 blur-sm" />

              {/* Main glass coin */}
              <div className="relative h-20 w-20 rounded-full bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/10 flex items-center justify-center shadow-xl shadow-emerald-500/10 dark:shadow-emerald-600/10">
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 dark:bg-emerald-600/10 flex items-center justify-center text-emerald-600 dark:text-emerald-600">
                  <CheckCircle2 className="h-9 w-9 stroke-[2.5px]" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-3 px-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:bg-emerald-600/10 dark:text-emerald-600 mb-2.5 border border-emerald-500/20 dark:border-emerald-600/20">
                ⚡ Reservation Settled
              </span>
              <h1 className="text-3xl sm:text-4xl tracking-tight text-slate-900 dark:text-white font-black leading-tight">
                Booking Confirmed!
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 dark:text-white/60 text-sm sm:text-base max-w-md mx-auto leading-relaxed font-semibold"
            >
              Your slot at{" "}
              <span className="text-emerald-700 dark:text-emerald-600 font-extrabold underline decoration-emerald-500/30 dark:decoration-emerald-600/30 decoration-2 underline-offset-4">
                {venueName}
              </span>{" "}
              has been successfully reserved.
            </motion.p>
          </div>

          {/* 🎟️ Exact 1:1 Matching SportX Official Match Entry Ticket (Matches match-pass-pdf.js) */}
          <div className="relative w-full max-w-[480px] mx-auto select-none pt-8">
            {/* Outer Ticket Card with 1:1 PDF Navy Border */}
            <div className="relative bg-white dark:bg-[#111827] rounded-[24px] p-6 sm:p-8 pt-9 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border-[1.5px] border-[#0F2A43] dark:border-slate-300 space-y-4 text-center transition-all">

              {/* 🟢 Top Elevated Circular Checkmark Disc Badge (Exact 1:1 match with PDF) */}
              <CheckBadge />

              {/* 1. Header: Payment Successful + Venue Name + City + Order ID */}
              <div className="flex flex-col items-center justify-center text-center space-y-1 pt-2">
                {/* Payment Successful */}
                <h1 className="text-2xl sm:text-[26px] font-bold text-emerald-500 tracking-normal">
                  Payment Successful!
                </h1>

                {/* Venue Name */}
                <h2 className="text-xl sm:text-[22px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wide pt-1">
                  {venueName}
                </h2>

                {/* Location / City */}
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {venueAddress?.split(",")?.slice(-2)?.[0]?.trim() || venueAddress?.split(",")?.slice(-1)?.[0]?.trim() || "Nagpur"}
                </p>

                {/* Order ID */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono pt-0.5">
                  <span>{orderId}</span>
                  <button
                    onClick={handleCopyOrderId}
                    className="text-slate-400 hover:text-emerald-600 transition-colors p-0.5 rounded cursor-pointer"
                    title="Copy Order ID"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* 2. Sport Badge Pill (Snug & Centered 1:1 with PDF) */}
              <div className="flex justify-center pt-0.5 pb-1">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border-[1.2px] border-[#0F2A43] dark:border-slate-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider">
                  <SportIcon sport={sportStr} className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                  <span>{String(sportStr || "FOOTBALL").toUpperCase()}</span>
                </div>
              </div>

              {/* 3. Player Full Name & Mobile Number */}
              <div className="space-y-1 text-center pt-0.5">
                <h3 className="text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {playerName}
                </h3>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Mobile Number: {playerPhone}
                </p>
              </div>

              {/* 4. Center Divider with Solid Emerald Dot (Exact 1:1 with PDF) */}
              <div className="relative flex items-center justify-center my-3.5 w-3/5 mx-auto">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                <div className="absolute h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>

              {/* 5. 3 Rounded Detail Cards Grid (Side by Side 1:1 with PDF) */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center pt-1">
                {/* Card 1: Event Date */}
                <div className="bg-white dark:bg-slate-800/90 py-2.5 px-1.5 sm:px-2 rounded-xl border-[1.2px] border-[#0F2A43] dark:border-slate-600 shadow-2xs">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-none mb-1.5">
                    Event Date:
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {(() => {
                      try {
                        const d = new Date(dateStr);
                        if (!isNaN(d.getTime())) {
                          return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                        }
                      } catch (e) { }
                      return dateStr;
                    })()}
                  </p>
                </div>

                {/* Card 2: Event Time Slot */}
                <div className="bg-white dark:bg-slate-800/90 py-2.5 px-1.5 sm:px-2 rounded-xl border-[1.2px] border-[#0F2A43] dark:border-slate-600 shadow-2xs">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-none mb-1.5">
                    Event Time Slot:
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {parsedSlot.rangeText || timeStr}
                  </p>
                </div>

                {/* Card 3: Amount Paid */}
                <div className="bg-white dark:bg-slate-800/90 py-2.5 px-1.5 sm:px-2 rounded-xl border-[1.2px] border-[#0F2A43] dark:border-slate-600 shadow-2xs">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-none mb-1.5">
                    Amount Paid:
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    Rs. {Number(isSplit ? costPerPlayer : totalPrice).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* 6. Ticket Perforation Notches & Dashed Tear Line (Exact 1:1 with PDF) */}
              <div className="relative flex items-center justify-center my-4 -mx-6 sm:-mx-8">
                {/* Left Semicircular Inward Notch */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-7 overflow-hidden z-10">
                  <div className="w-7 h-7 rounded-full bg-[#f8fafc] dark:bg-[#0A0C10] border-[1.5px] border-[#0F2A43] dark:border-slate-300 -translate-x-1/2" />
                </div>

                {/* Dashed Line */}
                <div className="w-full border-b border-dashed border-slate-300 dark:border-slate-700 mx-5" />

                {/* Right Semicircular Inward Notch */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-7 overflow-hidden z-10 flex justify-end">
                  <div className="w-7 h-7 rounded-full bg-[#f8fafc] dark:bg-[#0A0C10] border-[1.5px] border-[#0F2A43] dark:border-slate-300 translate-x-1/2" />
                </div>
              </div>

              {/* 7. Bottom Section: Payment Date, Official Pass Badge & Bracketed QR Code */}
              <div className="flex items-center justify-between gap-4 text-left pt-1 px-1">
                {/* Left Side Details */}
                <div className="space-y-3.5 flex-1 min-w-0">
                  {/* Payment Date & Time */}
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Payment Date:</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white pt-0.5 leading-tight">
                      {currentPaymentDate}
                    </p>
                  </div>

                  {/* Stadium Pill: OFFICIAL PASS 🟢 */}
                  <div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border-[1.2px] border-[#0F2A43] dark:border-slate-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider">
                      <span>OFFICIAL PASS</span>
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Right Side: Bracketed Square QR Code */}
                <div className="relative p-2.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm shrink-0">
                  {/* 4 Corner Scan Brackets */}
                  <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-slate-900 dark:border-white rounded-tl-[2px] pointer-events-none" />
                  <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-slate-900 dark:border-white rounded-tr-[2px] pointer-events-none" />
                  <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-slate-900 dark:border-white rounded-bl-[2px] pointer-events-none" />
                  <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-slate-900 dark:border-white rounded-br-[2px] pointer-events-none" />

                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(orderId)}`}
                    alt="Gate Pass QR"
                    className="h-24 w-24 sm:h-28 sm:w-28 object-contain"
                  />
                </div>
              </div>

              {/* 8. Footer Gate Desk Note */}
              <div className="pt-3 text-center border-t border-slate-100 dark:border-slate-800/80">
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-normal">
                  Please present this PDF Pass at the gate entry desk on match day.
                </p>
              </div>

            </div>
          </div>

          <div className="pt-4 space-y-4 max-w-[480px] mx-auto w-full">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={handleDownloadReceipt}
                className="flex-1 cursor-pointer text-sm font-bold border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 bg-transparent rounded-xl h-12 gap-2 shadow-xs transition-all hover:scale-[1.01]"
              >
                <Download className="h-4 w-4" />
                Download Entry Pass
              </Button>
              <Link to="/venues" className="flex-1">
                <Button variant="outline" className="w-full cursor-pointer text-xs sm:text-sm font-bold border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50/30 rounded-xl h-12">
                  Book Another Turf
                </Button>
              </Link>
            </div>

            <Button
              variant="link"
              className="text-muted-foreground hover:text-primary group"
            >
              Need help with your booking?
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>
      </Container>
      <GlobalFooter />
    </>
  );
}
