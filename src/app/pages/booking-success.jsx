import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Download,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { Container } from "../components/ui/container";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
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
  const paidMembers = members.filter(member => member.role === "host" && paidMemberIds.includes(member.id));

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
        orderId: bookingData?.bookingId || bookingData?.orderId || "SPX-MATCH-PASS",
        userName: "You (Host)",
        turfName: venueName || "SportX Arena",
        sport: bookingData?.sport || "Cricket",
        date: dateStr || "2026-09-25",
        timeSlot: timeStr || "06:00 PM - 07:00 PM",
        amount: (isSplit ? costPerPlayer : totalPrice) || 0,
      }, "SportXClub-Match-Pass.pdf");

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

          {/* Entry Pass / Ticket */}
          <div className="relative mt-4 max-w-lg mx-auto w-full">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 dark:bg-[#050505] border-r border-border/40 z-10 hidden sm:block" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 dark:bg-[#050505] border-l border-border/40 z-10 hidden sm:block" />

            <Card className="border-border/40 shadow-xl overflow-hidden bg-white dark:bg-[#101216] border-dashed sm:border-solid rounded-[28px]">
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/20 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="text-xs font-black tracking-widest text-emerald-600 uppercase">SportX Entry Pass</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-600 font-bold uppercase px-2 py-0.5 rounded-full">
                    Active / Paid
                  </span>
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-2 gap-3 text-left text-sm">
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase text-slate-400 dark:text-white/40 tracking-wider">Pass Holder</p>
                    <p className="font-semibold text-slate-800 dark:text-white text-xs sm:text-sm">You (Host)</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase text-slate-400 dark:text-white/40 tracking-wider">Pass ID</p>
                    <p className="font-mono text-xs font-bold text-slate-800 dark:text-white">#SX-260714-EP</p>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase text-slate-400 dark:text-white/40 tracking-wider">Date</p>
                    <div className="flex items-center gap-1.5 text-slate-800 dark:text-white font-semibold text-xs sm:text-sm">
                      <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-600" />
                      <span>{dateStr}</span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase text-slate-400 dark:text-white/40 tracking-wider">Time Slot</p>
                      {parsedSlot.slotCount > 1 && (
                        <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 px-1.5 py-0.2 rounded-full leading-none">
                          {parsedSlot.slotCount} Slots
                        </span>
                      )}
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-800 dark:text-white font-semibold text-xs sm:text-sm">
                      <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span>{parsedSlot.rangeText || timeStr}</span>
                        {parsedSlot.slotCount > 1 && parsedSlot.slotList.length > 1 && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-snug">
                            {parsedSlot.slotList.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-0.5 col-span-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase text-slate-400 dark:text-white/40 tracking-wider">Venue Address</p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-bold text-emerald-600 dark:text-emerald-600 hover:underline flex items-center gap-0.5 transition-colors cursor-pointer"
                      >
                        Get Directions ↗
                      </a>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-1.5 text-slate-800 dark:text-white font-semibold hover:text-emerald-600 dark:hover:text-emerald-600 transition-colors cursor-pointer text-xs sm:text-sm"
                    >
                      <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-600 mt-0.5 shrink-0" />
                      <span>{venueAddress}</span>
                    </a>
                  </div>
                </div>

                {/* Dotted Line Divider */}
                <div className="relative py-1">
                  <div className="absolute left-0 right-0 top-1/2 border-b border-dashed border-slate-200 dark:border-white/10" />
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center pt-1">
                  <div className="bg-slate-50 dark:bg-black/40 p-3 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-white/[0.05] shadow-inner w-full max-w-[210px]">
                    <div className="h-28 w-28 bg-white flex items-center justify-center p-2 rounded-xl">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SportXClub-Ticket" alt="QR Code" className="h-full w-full object-contain mix-blend-multiply" />
                    </div>
                    <span className="text-[8px] font-mono text-slate-600 dark:text-white/50 mt-2 font-semibold tracking-[0.25em] uppercase">
                      Scan at Reception
                    </span>
                  </div>
                </div>

                {/* Paid Players List */}
                {paidMembers.length > 0 && (
                  <div className="border-t border-border/20 pt-3.5 space-y-2 text-left">
                    <p className="text-[10px] uppercase text-slate-400 dark:text-white/40 tracking-wider font-extrabold flex justify-between items-center">
                      <span>Paid Teammates</span>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-600 font-bold px-2 py-0.5 rounded-full">
                        {paidMembers.length} Joined
                      </span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {paidMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] transition-all duration-300">
                          <div className="h-5 w-5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-600 flex items-center justify-center text-[10px] font-black">
                            ✓
                          </div>
                          <span className="text-xs font-semibold text-slate-700 dark:text-white/80 truncate max-w-[120px]">
                            {member.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons inside Ticket */}
                <div className="pt-3 border-t border-border/20 flex justify-center">
                  <Button
                    onClick={handleDownloadReceipt}
                    variant="outline"
                    className="w-1/2 bg-transparent border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold rounded-xl gap-2 h-10 cursor-pointer text-xs transition-all shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="pt-4 space-y-4">
            <div className="flex flex-row gap-3 w-full">
              <Link to="/profile" className="flex-1">
                <Button variant="outline" className="w-full cursor-pointer text-xs sm:text-sm font-bold bg-transparent border-2 border-emerald-600 text-emerald-600 hover:border-emerald-800 hover:text-emerald-800 hover:bg-emerald-50/20 dark:border-emerald-600 dark:text-emerald-600 dark:hover:border-green-400 dark:hover:text-green-400 dark:hover:bg-emerald-600/5 transition-all duration-300">
                  Go to Profile
                </Button>
              </Link>
              <Link to="/venues" className="flex-1">
                <Button variant="outline" className="w-full cursor-pointer text-xs sm:text-sm font-bold bg-transparent border-2 border-emerald-600 text-emerald-600 hover:border-emerald-800 hover:text-emerald-800 hover:bg-emerald-50/20 dark:border-emerald-600 dark:text-emerald-600 dark:hover:border-green-400 dark:hover:text-green-400 dark:hover:bg-emerald-600/5 transition-all duration-300">
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
