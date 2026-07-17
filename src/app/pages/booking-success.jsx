import { useState, useEffect } from "react";
import { Link } from "react-router";
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
export function BookingSuccess() {
  // Read saved booking info
  let bookingData = null;
  try {
    const saved = sessionStorage.getItem("sportxclub_last_booking");
    if (saved) {
      bookingData = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading booking details:", e);
  }

  // Fallback defaults matching the user screen screenshot exactly
  const isSplit = bookingData ? bookingData.paymentMode === "split" : true;
  const costPerPlayer = bookingData ? bookingData.costPerPlayer : 600;
  const totalPrice = bookingData ? bookingData.totalPrice : 1200;
  const dateStr = bookingData ? bookingData.selectedDate : "June 18, 2026";
  const timeStr = bookingData ? `${bookingData.startTime} (${bookingData.playHours} hr)` : "6:00 PM - 7:00 PM";
  const venueName = bookingData ? bookingData.venue.name : "Elite Sports Arena";
  const venueAddress = bookingData ? bookingData.venue.location : "123 Sports Complex, MG Road, Mumbai";
  const members = bookingData ? bookingData.squadLobby.members : [
    { id: "m1", name: "You (Host)", role: "host" },
    { id: "m2", name: "Priya Patel", role: "member" },
  ];

  // Track which members have paid (Initially only host is paid in split)
  const hostId = members.find(m => m.role === "host")?.id || members[0]?.id;
  const [paidMemberIds, setPaidMemberIds] = useState(
    isSplit ? [hostId] : members.map(m => m.id)
  );
  const paidMembers = members.filter(member => paidMemberIds.includes(member.id));

  // Simulate players payment completion after 10 seconds
  useEffect(() => {
    if (isSplit && paidMemberIds.length < members.length) {
      const timer = setTimeout(() => {
        setPaidMemberIds(members.map(m => m.id));
        
        // Find other members who transitioned to paid
        const guestNames = members.filter(m => m.id !== hostId).map(m => m.name).join(", ");
        toast.success(`${guestNames || "All team members"} paid their share!`, {
          description: "Split billing is fully settled. Booking is 100% secured.",
          duration: 5000,
        });
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, [isSplit, members, hostId, paidMemberIds.length]);

  // Generate 16x16 QR grid
  const qrSize = 16;
  const qrGrid = [];
  for (let r = 0; r < qrSize; r++) {
    for (let c = 0; c < qrSize; c++) {
      // Top-left finder
      if (r < 5 && c < 5) {
        const isBorder = r === 0 || r === 4 || c === 0 || c === 4;
        const isCenter = r === 2 && c === 2;
        qrGrid.push(isBorder || isCenter);
      }
      // Top-right finder
      else if (r < 5 && c >= qrSize - 5) {
        const cc = c - (qrSize - 5);
        const isBorder = r === 0 || r === 4 || cc === 0 || cc === 4;
        const isCenter = r === 2 && cc === 2;
        qrGrid.push(isBorder || isCenter);
      }
      // Bottom-left finder
      else if (r >= qrSize - 5 && c < 5) {
        const rr = r - (qrSize - 5);
        const isBorder = rr === 0 || rr === 4 || c === 0 || c === 4;
        const isCenter = rr === 2 && c === 2;
        qrGrid.push(isBorder || isCenter);
      }
      // Alignment pattern (near bottom right)
      else if (r >= 10 && r <= 12 && c >= 10 && c <= 12) {
        const rr = r - 10;
        const cc = c - 10;
        const isBorder = rr === 0 || rr === 2 || cc === 0 || cc === 2;
        const isCenter = rr === 1 && cc === 1;
        qrGrid.push(isBorder || isCenter);
      }
      // Timing and random patterns
      else {
        const isTiming = (r === 6 && c % 2 === 0) || (c === 6 && r % 2 === 0);
        const val = (r * 13 + c * 37) % 5 === 0 || (r * 7 + c * 19) % 3 === 0 || (r + c) % 3 === 0;
        const tooCloseToFinder = (r < 6 && c === 5) || (c < 6 && r === 5) || (r >= qrSize - 6 && c === 5) || (c >= qrSize - 6 && r === 5) || (r === 5 && c >= qrSize - 6) || (c === 5 && r >= qrSize - 6);
        qrGrid.push(isTiming || (val && !tooCloseToFinder));
      }
    }
  }

  const handleDownloadReceipt = () => {
    // Show a loading toast
    const loadingToastId = toast.loading("Generating receipt PDF...");

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Styling parameters
      doc.setFont("Helvetica", "normal");
      
      // Header Banner
      doc.setFillColor(16, 18, 22); // Dark slate bg
      doc.rect(0, 0, 210, 40, "F");
      
      doc.setTextColor(109, 255, 59); // Green text #6DFF3B
      doc.setFontSize(22);
      doc.setFont("Helvetica", "bold");
      doc.text("SPORTXCLUB RECEIPT", 20, 25);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("Helvetica", "normal");
      doc.text("Booking Reference: #SX-260714-EP", 125, 25);

      // Section: Booking Status
      doc.setTextColor(16, 18, 22);
      doc.setFontSize(12);
      doc.setFont("Helvetica", "bold");
      doc.text("BOOKING INFORMATION", 20, 55);
      doc.setDrawColor(220, 224, 230);
      doc.line(20, 58, 190, 58);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Pass Holder: You (Host)`, 20, 66);
      doc.text(`Status: Paid / Confirmed`, 20, 72);
      doc.text(`Venue: ${venueName}`, 20, 78);
      doc.text(`Address: ${venueAddress}`, 20, 84);
      
      doc.text(`Date: ${dateStr}`, 120, 66);
      doc.text(`Time Slot: ${timeStr}`, 120, 72);

      // Section: Transaction Details
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.text("PAYMENT & TRANSACTION DETAILS", 20, 100);
      doc.line(20, 103, 190, 103);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Transaction ID: TXN-260714984210", 20, 111);
      doc.text("Bank Ref No (RRN): 607140294821", 20, 117);
      doc.text("Payment Method: UPI (Google Pay)", 20, 123);
      doc.text("Payer Account ID: user@okaxis", 20, 129);

      // Pricing box
      doc.setFillColor(245, 247, 250);
      doc.rect(20, 135, 170, 32, "F");
      
      doc.setTextColor(100, 110, 120);
      doc.text(`Base Fare:`, 25, 142);
      doc.text(`GST (18%):`, 25, 148);
      doc.text(`Convenience Fee:`, 25, 154);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(16, 18, 22);
      doc.text(`Total Amount Paid:`, 25, 161);

      doc.setTextColor(16, 18, 22);
      doc.setFont("Helvetica", "normal");
      doc.text(`INR ${((isSplit ? costPerPlayer : totalPrice) * 0.8475).toFixed(2)}`, 150, 142);
      doc.text(`INR ${((isSplit ? costPerPlayer : totalPrice) * 0.1525).toFixed(2)}`, 150, 148);
      doc.text(`INR 0.00`, 150, 154);
      doc.setFont("Helvetica", "bold");
      doc.text(`INR ${(isSplit ? costPerPlayer : totalPrice).toFixed(2)}`, 150, 161);

      // Section: Split Details if active
      if (isSplit) {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(16, 18, 22);
        doc.text("SQUAD PAYMENT SPLIT DETAILS", 20, 182);
        doc.line(20, 185, 190, 185);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Payment Split: ${members.length}-Way Equal Split`, 20, 193);
        doc.text(`Cost Share: INR ${costPerPlayer.toFixed(2)} per player`, 20, 199);

        // Members list table
        let y = 210;
        members.forEach((m, idx) => {
          const hasPaid = paidMemberIds.includes(m.id);
          doc.text(`${idx + 1}. ${m.name}${m.role === 'host' ? ' (Host)' : ''}`, 25, y);
          doc.text(`INR ${costPerPlayer.toFixed(2)}`, 110, y);
          if (hasPaid) {
            doc.setTextColor(34, 197, 94); // Green
            doc.text("PAID", 160, y);
          } else {
            doc.setTextColor(245, 158, 11); // Amber
            doc.text("PENDING", 160, y);
          }
          doc.setTextColor(16, 18, 22);
          y += 8;
        });
      }

      // Footer
      doc.setDrawColor(220, 224, 230);
      doc.line(20, 260, 190, 260);
      doc.setFontSize(8);
      doc.setTextColor(120, 130, 140);
      doc.text("This is an electronically generated receipt. No physical signature is required.", 20, 267);
      doc.text("Thank you for playing with SportXClub!", 20, 273);
      doc.save("SportXClub-Receipt.pdf");
      toast.dismiss(loadingToastId);
      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.dismiss(loadingToastId);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <Container className="py-12 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="text-center space-y-6 max-w-lg w-full"
      >
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center text-green-600 shadow-xl shadow-green-500/10">
            <CheckCircle2 className="h-14 w-14" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl tracking-tight text-slate-900 dark:text-white font-bold">Booking Confirmed!</h1>
          <p className="text-muted-foreground text-lg">
            Your slot at{" "}
            <span className="text-foreground font-semibold">{venueName}</span> has
            been reserved.
          </p>
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
                  <div className="h-2 w-2 rounded-full bg-[#6DFF3B] animate-pulse" />
                  <span className="text-xs font-black tracking-widest text-[#6DFF3B] uppercase">SportX Entry Pass</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-[#6DFF3B] font-bold uppercase px-2 py-0.5 rounded-full">
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
                    <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-[#6DFF3B]" />
                    <span>{dateStr}</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase text-slate-400 dark:text-white/40 tracking-wider">Time Slot</p>
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-white font-semibold text-xs sm:text-sm">
                    <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-[#6DFF3B]" />
                    <span>{timeStr}</span>
                  </div>
                </div>

                <div className="space-y-0.5 col-span-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase text-slate-400 dark:text-white/40 tracking-wider">Venue Address</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-bold text-emerald-600 dark:text-[#6DFF3B] hover:underline flex items-center gap-0.5 transition-colors cursor-pointer"
                    >
                      Get Directions ↗
                    </a>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-1.5 text-slate-800 dark:text-white font-semibold hover:text-emerald-600 dark:hover:text-[#6DFF3B] transition-colors cursor-pointer text-xs sm:text-sm"
                  >
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-[#6DFF3B] mt-0.5 shrink-0" />
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
                  <div className="h-28 w-28 bg-[#050505] flex items-center justify-center p-1.5 rounded-xl">
                    <div className="grid gap-[2px] h-full w-full" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                      {qrGrid.map((filled, idx) => (
                        <div
                          key={idx}
                          className={`rounded-[1.2px] transition-all duration-300 ${
                            filled ? "bg-[#6DFF3B]" : "bg-transparent"
                          }`}
                        />
                      ))}
                    </div>
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
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-[#6DFF3B] font-bold px-2 py-0.5 rounded-full">
                      {paidMembers.length} Joined
                    </span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {paidMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] transition-all duration-300">
                        <div className="h-5 w-5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#6DFF3B] flex items-center justify-center text-[10px] font-black">
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
                  className="w-1/2 bg-[#6DFF3B] text-black hover:bg-[#86ff60] font-bold rounded-xl gap-2 h-10 border-none cursor-pointer text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/profile" className="flex-1">
              <Button size="lg" className="w-full shadow-lg shadow-primary/20">
                Go to Profile
              </Button>
            </Link>
            <Link to="/venues" className="flex-1">
              <Button size="lg" variant="secondary" className="w-full">
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
  );
}
