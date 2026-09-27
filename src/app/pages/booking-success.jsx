import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "../components/ui/button";
import {
  CheckCircle2,
  Download,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { Container } from "../components/ui/container";
import { toast } from "sonner";
import { downloadSportXPassPdf, parseBookingSlots } from "../utils/ticket-pdf-generator";
import { GlobalFooter } from "../components/layout/GlobalFooter";

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

  const getSportEmoji = (sport) => {
    const s = String(sport || "").toLowerCase();
    if (s.includes("cricket")) return "🏏";
    if (s.includes("football") || s.includes("soccer")) return "⚽";
    if (s.includes("badminton")) return "🏸";
    if (s.includes("tennis")) return "🎾";
    if (s.includes("basketball")) return "🏀";
    if (s.includes("pickleball")) return "🏓";
    if (s.includes("swimming")) return "🏊";
    if (s.includes("volleyball")) return "🏐";
    return "⚡";
  };

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

          {/* 🎟️ Exact 1:1 Matching SportX Official Match Entry Ticket (Image 3 Replica) */}
          <div className="relative w-full max-w-[480px] mx-auto select-none pt-8">
            {/* Outer Pure White Ticket Card (No Outer Dark Border, Soft Shadow) */}
            <div className="relative bg-white dark:bg-[#111827] rounded-[28px] p-6 sm:p-8 pt-9 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-800/60 space-y-4 text-center transition-all">

              {/* 🟢 Top Elevated Circular Checkmark Disc Badge */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20">
                <div className="h-14 w-14 rounded-full bg-white dark:bg-[#111827] flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-800">
                  <div className="h-11 w-11 rounded-full border-[2.5px] border-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 stroke-[2.5px]" />
                  </div>
                </div>
              </div>

              {/* 1. Header: Payment Successful + Venue Name + City + Order ID */}
              <div className="flex flex-col items-center justify-center text-center space-y-1 pt-2">
                <h1 className="text-2xl sm:text-[26px] font-bold text-emerald-500 tracking-normal">
                  Payment Successful!
                </h1>

                <h2 className="text-xl sm:text-[22px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wide pt-1">
                  {venueName}
                </h2>

                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {venueAddress?.split(",")?.slice(-2)?.[0]?.trim() || venueAddress?.split(",")?.slice(-1)?.[0]?.trim() || "Nagpur"}
                </p>

                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono pt-0.5">
                  <span>{orderId}</span>
                </div>
              </div>

              {/* 2. Sport Badge Pill */}
              <div className="flex justify-center pt-0.5 pb-1">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-slate-800 dark:border-slate-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider shadow-2xs">
                  <span>{getSportEmoji(sportStr)}</span>
                  <span>{String(sportStr).toUpperCase()}</span>
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

              {/* 4. Green Center Divider with Solid Emerald Dot */}
              <div className="relative flex items-center justify-center my-3 px-2">
                <div className="w-full border-t-[1.5px] border-emerald-500" />
                <div className="absolute h-3 w-3 rounded-full bg-emerald-500 shadow-xs" />
              </div>

              {/* 5. 3 Rounded Detail Cards Grid (Side by Side) */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center pt-1">
                {/* Card 1: Event Date */}
                <div className="bg-white dark:bg-slate-800/90 py-2.5 px-1.5 sm:px-2 rounded-xl border border-slate-700 dark:border-slate-500 shadow-2xs">
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium leading-none mb-1.5">
                    Event Date:
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {dateStr}
                  </p>
                </div>

                {/* Card 2: Event Time Slot */}
                <div className="bg-white dark:bg-slate-800/90 py-2.5 px-1.5 sm:px-2 rounded-xl border border-slate-700 dark:border-slate-500 shadow-2xs">
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium leading-none mb-1.5">
                    Event Time Slot:
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {parsedSlot.rangeText || timeStr}
                  </p>
                </div>

                {/* Card 3: Amount Paid */}
                <div className="bg-white dark:bg-slate-800/90 py-2.5 px-1.5 sm:px-2 rounded-xl border border-slate-700 dark:border-slate-500 shadow-2xs">
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium leading-none mb-1.5">
                    Amount Paid:
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    ₹{Number(isSplit ? costPerPlayer : totalPrice).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* 6. Ticket Perforation Notches & Dashed Tear Line */}
              <div className="relative flex items-center justify-center my-4">
                <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-slate-50 dark:bg-[#030712] shadow-inner z-10" />
                <div className="w-full border-b border-dashed border-slate-300 dark:border-slate-700" />
                <div className="absolute -right-6 sm:-right-8 w-6 h-6 rounded-full bg-slate-50 dark:bg-[#030712] shadow-inner z-10" />
              </div>

              {/* 7. Bottom Section: Payment Date, Official Pass Badge & Bracketed QR Code */}
              <div className="flex items-center justify-between gap-4 text-left pt-1 px-1">
                {/* Left Side Details */}
                <div className="space-y-3.5 flex-1 min-w-0">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Payment Date:</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white pt-0.5 leading-tight">
                      {currentPaymentDate}
                    </p>
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-slate-800 dark:border-slate-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider shadow-2xs">
                      <span>OFFICIAL PASS</span>
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Right Side: Bracketed Square QR Code */}
                <div className="relative p-2.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm shrink-0">
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
