import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Calendar,
  Trophy,
  Users,
  ShieldCheck,
  MapPin,
  Star,
  CreditCard,
  Lock,
  Smartphone,
  Wallet,
  Building2,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";

export function SquadBookingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const squadLobby = location.state?.squadLobby || {
    active: true,
    sport: "Cricket",
    maxSize: 10,
    members: [
      { id: 99, name: "You (Host)", sport: "Cricket", skillLevel: "Expert", rating: 5.0, role: "host" },
      { id: 101, name: "Amit Patel", sport: "Cricket", skillLevel: "Advanced", rating: 4.7, role: "player" },
      { id: 102, name: "Vikram Malhotra", sport: "Cricket", skillLevel: "Intermediate", rating: 4.5, role: "player" },
      { id: 103, name: "Rohan Das", sport: "Cricket", skillLevel: "Expert", rating: 4.9, role: "player" },
      { id: 104, name: "Sneha Sen", sport: "Cricket", skillLevel: "Advanced", rating: 4.6, role: "player" },
      { id: 105, name: "Kabir Mehta", sport: "Cricket", skillLevel: "Beginner", rating: 4.2, role: "player" },
      { id: 106, name: "Neha Sharma", sport: "Cricket", skillLevel: "Intermediate", rating: 4.4, role: "player" },
      { id: 1, name: "Rahul Sharma", sport: "Cricket", skillLevel: "Advanced", rating: 4.8, role: "player" },
      { id: 2, name: "Priya Patel", sport: "Cricket", skillLevel: "Intermediate", rating: 4.6, role: "player" },
      { id: 3, name: "Arjun Malhotra", sport: "Cricket", skillLevel: "Expert", rating: 4.9, role: "player" },
    ],
  };

  const [selectedDate, setSelectedDate] = useState("2026-07-11");
  const [startTime, setStartTime] = useState("19:00");
  const [playHours, setPlayHours] = useState(1);
  const [paymentMode, setPaymentMode] = useState("split"); // "split" | "full"
  const [venue] = useState({
    name: "Elite Turf Arena",
    location: "Powai, Mumbai",
    price: 1200,
  });

  // Dynamic time slots configuration matching preview schedules
  const timeSlots = [
    { startHour: 15, label: "03:00 PM", endLabel: "04:00 PM" },
    { startHour: 16, label: "04:00 PM", endLabel: "05:00 PM" },
    { startHour: 17, label: "05:00 PM", endLabel: "06:00 PM", bookedBy: "Team Alpha" },
    { startHour: 18, label: "06:00 PM", endLabel: "07:00 PM" },
    { startHour: 19, label: "07:00 PM", endLabel: "08:00 PM" },
    { startHour: 20, label: "08:00 PM", endLabel: "09:00 PM" },
    { startHour: 21, label: "09:00 PM", endLabel: "10:00 PM" },
    { startHour: 22, label: "10:00 PM", endLabel: "11:00 PM", bookedBy: "Late Night Book" },
  ];

  const formatSlotRange = (startHour, hours) => {
    const formatHour = (h) => {
      const isPm = h >= 12 && h < 24;
      let hourNum = h % 12;
      if (hourNum === 0) hourNum = 12;
      const amPm = h >= 24 || h < 12 ? "AM" : "PM";
      const displayHour = h === 24 ? "12" : hourNum.toString();
      const displayAmPm = h === 24 ? "AM" : amPm;
      return `${displayHour.padStart(2, '0')}:00 ${displayAmPm}`;
    };

    const startStr = formatHour(startHour);
    const endStr = formatHour(startHour + hours);
    return `${startStr} - ${endStr}`;
  };

  const getStartHour = (timeStr) => {
    return parseInt(timeStr.split(":")[0]);
  };

  const hourToTimeStr = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const isOverlapping = (startHour) => {
    for (let i = 0; i < playHours; i++) {
      const checkHour = startHour + i;
      const slot = timeSlots.find(s => s.startHour === checkHour);
      if (slot && slot.bookedBy) {
        return true;
      }
    }
    return false;
  };

  const isOutOfBounds = (startHour) => {
    return startHour + playHours > 23;
  };

  // Auto-adjust start time if it overlaps on hours selection change
  useEffect(() => {
    const currentHour = getStartHour(startTime);
    if (isOverlapping(currentHour) || isOutOfBounds(currentHour)) {
      const firstAvailable = timeSlots.find(
        s => !s.bookedBy && !isOverlapping(s.startHour) && !isOutOfBounds(s.startHour)
      );
      if (firstAvailable) {
        setStartTime(hourToTimeStr(firstAvailable.startHour));
      }
    }
  }, [playHours]);

  const totalPrice = venue.price * playHours;
  const activeCount = squadLobby.members.length || 1;
  const costPerPlayer = Math.round(totalPrice / activeCount);
  const amountToPayNow = paymentMode === "full" ? totalPrice : costPerPlayer;

  // Secure checkout & payment states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState("select"); // "select" | "processing" | "success"
  const [paymentMethod, setPaymentMethod] = useState("upi"); // "upi" | "card" | "wallet" | "netbanking"
  const [processingMessage, setProcessingMessage] = useState("");
  
  // Input fields state
  const [upiId, setUpiId] = useState("");
  const [cardNo, setCardNo] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("hdfc");
  const [walletBalance, setWalletBalance] = useState(1500); // Simulated user wallet balance

  const handlePaymentSubmit = (e) => {
    e.preventDefault();

    // Basic Validations
    if (paymentMethod === "upi" && !upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID (e.g. name@upi)");
      return;
    }
    if (paymentMethod === "card") {
      if (cardNo.replace(/\s+/g, "").length < 16) {
        toast.error("Please enter a valid 16-digit card number");
        return;
      }
      if (!cardExpiry.includes("/")) {
        toast.error("Please enter expiry date in MM/YY format");
        return;
      }
      if (cardCvv.length < 3) {
        toast.error("Please enter a valid 3-digit CVV");
        return;
      }
      if (!cardName.trim()) {
        toast.error("Please enter Cardholder Name");
        return;
      }
    }
    if (paymentMethod === "wallet" && walletBalance < amountToPayNow) {
      toast.error("Insufficient wallet balance. Please top up or choose another payment method.");
      return;
    }

    // Start payment processing steps simulation
    setPaymentStep("processing");
    
    const steps = [
      "Securing connection to payment gateway...",
      paymentMethod === "upi" 
        ? "Sending payment request to your UPI app..." 
        : paymentMethod === "card"
        ? "Authorizing card details with bank..."
        : paymentMethod === "wallet"
        ? "Deducting amount from SportX Wallet..."
        : "Redirecting to bank secure portal...",
      "Verifying transaction token...",
      "Completing secure settlement...",
    ];

    let currentStep = 0;
    setProcessingMessage(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setProcessingMessage(steps[currentStep]);
      } else {
        clearInterval(interval);
        setPaymentStep("success");
        
        // Deduct from wallet if wallet selected
        if (paymentMethod === "wallet") {
          setWalletBalance(prev => prev - amountToPayNow);
        }

        // Successfully paid, complete checkout
        setTimeout(() => {
          setIsPaymentModalOpen(false);
          // Trigger the standard handleCheckout logic
          handleCheckout();
          // Reset modal state for future uses
          setPaymentStep("select");
        }, 1500);
      }
    }, 1200);
  };

  const handleCheckout = () => {
    toast.success(paymentMode === "full"
      ? `Full squad booking payment of ₹${totalPrice} successful!`
      : `Squad cost-split payment of ₹${costPerPlayer} successful! Remaining ${activeCount - 1} members notified of their split share.`
    );

    // Update active squad lobby in localStorage
    const savedLobby = localStorage.getItem("active_squad_lobby");
    if (savedLobby) {
      const lobbyObj = JSON.parse(savedLobby);
      lobbyObj.paymentMode = paymentMode; // "split" or "full"
      // If paymentMode is "full", host paid everything, so all members are marked paid.
      // If paymentMode is "split", only Host (id 99) has paid initially.
      lobbyObj.paidMembers = paymentMode === "full" 
        ? lobbyObj.members.map(m => m.id)
        : [99]; // Only Host paid
      localStorage.setItem("active_squad_lobby", JSON.stringify(lobbyObj));
    }

    // Save transaction state for the receipt download and Entry Pass screen
    const startHour = getStartHour(startTime);
    const startSlotObj = timeSlots.find(s => s.startHour === startHour);
    const endSlotObj = timeSlots.find(s => s.startHour === (startHour + playHours - 1));
    const rangeStr = startSlotObj && endSlotObj 
      ? `${startSlotObj.label} - ${endSlotObj.endLabel}`
      : `${startTime} (${playHours} hr)`;

    sessionStorage.setItem("sportxclub_last_booking", JSON.stringify({
      squadLobby,
      paymentMode,
      amountToPayNow,
      costPerPlayer,
      totalPrice,
      venue,
      selectedDate,
      startTime: rangeStr,
      playHours
    }));

    setTimeout(() => {
      navigate("/booking-success");
    }, 800);
  };


  return (
    <div className="theme-adaptive bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-6 pb-6 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
        {/* Back Link */}
        <Link
          to="/players"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-4 py-2 text-sm text-slate-600 dark:text-white/72 transition hover:border-[#6DFF3B]/25 hover:bg-[#6DFF3B]/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Find Players
        </Link>

        {/* Title */}
        <div className="mt-6">
          <h1 className="text-3xl tracking-tight">Squad Booking Confirmation</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review your completed {squadLobby.sport} squad of {squadLobby.members.length} players and finalize booking.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {/* Slot & Venue config */}
            <Card className="rounded-[28px] border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216]">
              <CardContent className="p-6 md:p-8 space-y-5">
                <h2 className="text-xl text-slate-900 dark:text-white font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#6DFF3B]" />
                  Booking Details
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-semibold block">Venue</label>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-white">
                      <p className="font-semibold">{venue.name}</p>
                      <p className="text-xs text-slate-500 dark:text-white/50">{venue.location}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-semibold block">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#6DFF3B]"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Duration Selector */}
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-semibold block">
                      Duration (Hours)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((hours) => (
                        <button
                          key={hours}
                          type="button"
                          onClick={() => setPlayHours(hours)}
                          className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            playHours === hours
                              ? "bg-[#6DFF3B] text-black border-[#6DFF3B] shadow-md shadow-[#6DFF3B]/10 font-black"
                              : "border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.03] text-slate-700 dark:text-white/80 bg-white dark:bg-white/[0.02]"
                          }`}
                        >
                          {hours} {hours === 1 ? "Hour" : "Hours"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slot Grid */}
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-semibold block">
                      Select Start Time ({playHours} {playHours === 1 ? 'Hour' : 'Hours'})
                    </label>
                    <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-3">
                      {timeSlots.map((slot) => {
                        const slotHour = slot.startHour;
                        const isBooked = !!slot.bookedBy;
                        const overlaps = isOverlapping(slotHour);
                        const outOfBounds = isOutOfBounds(slotHour);
                        const isDisabled = isBooked || overlaps || outOfBounds;
                        
                        const isSelected = getStartHour(startTime) === slotHour;
                        const labelRange = formatSlotRange(slotHour, playHours);

                        return (
                          <button
                            key={slotHour}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => setStartTime(hourToTimeStr(slotHour))}
                            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all min-h-[72px] text-center relative ${
                              isSelected
                                ? "bg-[#6DFF3B] text-black border-[#6DFF3B] shadow-md shadow-[#6DFF3B]/10 font-bold"
                                : isDisabled
                                ? "bg-red-500/5 dark:bg-red-500/10 border-red-500/20 text-slate-400/40 cursor-not-allowed"
                                : "border-[#6DFF3B]/30 hover:border-[#6DFF3B] hover:bg-[#6DFF3B]/5 text-slate-800 dark:text-white bg-white dark:bg-white/[0.02] cursor-pointer"
                            }`}
                          >
                            {isDisabled && (
                              <span className="absolute top-1.5 right-1.5 text-[9px] text-red-500/60">
                                🔒
                              </span>
                            )}
                            <span className={`text-[11px] font-mono font-bold ${isDisabled ? 'line-through text-slate-500/40' : ''}`}>
                              {labelRange}
                            </span>
                            {isDisabled ? (
                              <span className="text-[8px] font-extrabold text-red-500 mt-1 uppercase tracking-wider">
                                Booked
                              </span>
                            ) : isSelected ? (
                              <span className="text-[8px] font-extrabold text-black mt-1 uppercase tracking-wider">
                                {playHours} {playHours === 1 ? 'Hour' : 'Hours'}
                              </span>
                            ) : (
                              <span className="text-[8px] font-extrabold text-emerald-500 dark:text-[#6DFF3B]/80 mt-1 uppercase tracking-wider">
                                Available
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Mode */}
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-semibold block">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#6DFF3B] cursor-pointer"
                    >
                      <option value="split">🟢 Cost Split (Pay ₹{costPerPlayer} share)</option>
                      <option value="full">💳 Full Payment (Pay ₹{totalPrice} total)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

             {/* Split billing details */}
             <Card className="rounded-[28px] border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216]">
               <CardContent className="p-6 md:p-8 space-y-4">
                 <h2 className="text-xl text-slate-900 dark:text-white font-bold flex items-center gap-2">
                   <CreditCard className="h-5 w-5 text-[#6DFF3B]" />
                   Billing Summary
                 </h2>

                 {squadLobby.members.length < squadLobby.maxSize && (
                   <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-2xl text-xs leading-relaxed space-y-1.5 text-left">
                     <p className="font-bold flex items-center gap-1.5">
                       ⚠️ Squad is not full ({squadLobby.members.length}/{squadLobby.maxSize} joined)
                     </p>
                     <p className="text-slate-600 dark:text-zinc-300">
                       Booking cost will be split equally among the {squadLobby.members.length} active players (₹{costPerPlayer} each instead of ₹{Math.round(totalPrice / squadLobby.maxSize)}). Host can confirm booking now and other members will receive updated split requests.
                     </p>
                   </div>
                 )}

                 <div className="space-y-2.5 text-sm">
                   <div className="flex justify-between text-slate-600 dark:text-white/70">
                     <span>Total Turf Booking Cost:</span>
                     <span>₹{totalPrice}</span>
                   </div>
                   {paymentMode === "split" && (
                     <div className="flex justify-between text-slate-600 dark:text-white/70">
                       <span>Split Ratio (Active Players):</span>
                       <span>{activeCount} / {squadLobby.maxSize} Ways</span>
                     </div>
                   )}
                   <div className="border-t border-slate-200 dark:border-white/[0.08] pt-2 flex justify-between font-bold text-base text-[#6DFF3B]">
                     <span>{paymentMode === "full" ? "Total Amount to Pay Now:" : "Your Share to Pay Now:"}</span>
                     <span>₹{amountToPayNow}</span>
                   </div>
                 </div>

                 {paymentMode === "split" ? (
                   <div className="p-3 rounded-xl bg-[#6DFF3B]/5 dark:bg-[#6DFF3B]/10 border border-[#6DFF3B]/20 text-xs text-slate-700 dark:text-white/80 leading-relaxed font-medium text-left">
                     💡 <strong>Split details:</strong> Each player in the squad will receive an automated request to pay their share (₹{costPerPlayer}) within 1 hour of booking. As host, you secure the booking by paying your share now.
                   </div>
                 ) : (
                   <div className="p-3 rounded-xl bg-[#6DFF3B]/5 dark:bg-[#6DFF3B]/10 border border-[#6DFF3B]/20 text-xs text-slate-700 dark:text-white/80 leading-relaxed font-medium text-left">
                     ⚡ <strong>Full Payment details:</strong> You are paying the full slot booking amount (₹{totalPrice}) now. Other squad members will not be charged or asked to split.
                   </div>
                 )}
               </CardContent>
             </Card>
          </div>

          <div>
            {/* Squad List */}
            <Card className="rounded-[28px] border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216]">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#6DFF3B]" />
                  Squad Members ({squadLobby.members.length})
                </h3>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {squadLobby.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-xl border border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.01]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-[#6DFF3B]">
                          {member.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                            {member.name}
                            {member.role === "host" && <span>👑</span>}
                          </p>
                          <p className="text-[9px] text-slate-500 dark:text-white/50 truncate uppercase tracking-wider">
                            {member.role === "host" ? "Squad Leader" : "Member"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-medium text-slate-700 dark:text-white/80">{member.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] space-y-3">
                  <Button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full h-12 bg-[#6DFF3B] text-black hover:bg-[#86ff60] rounded-xl font-bold transition-all shadow-lg shadow-[#6DFF3B]/10 cursor-pointer"
                  >
                    Confirm & Pay ₹{amountToPayNow}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={(open) => {
        if (paymentStep !== "processing") {
          setIsPaymentModalOpen(open);
          if (!open) setPaymentStep("select");
        }
      }}>
        <DialogContent className="sm:max-w-md rounded-2xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216] text-slate-900 dark:text-white shadow-2xl">
          {paymentStep === "select" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Lock className="h-5 w-5 text-emerald-600 dark:text-[#6DFF3B]" />
                  Secure Checkout
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-white/60 text-xs">
                  Choose a payment method to pay your share of <strong className="text-emerald-600 dark:text-[#6DFF3B]">₹{amountToPayNow}</strong>
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handlePaymentSubmit} className="space-y-4 my-2">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 gap-2.5">
                  {/* UPI */}
                  <Label
                    htmlFor="pay-upi"
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer select-none ${
                      paymentMethod === "upi"
                        ? "border-[#6DFF3B] bg-[#6DFF3B]/5 dark:bg-[#6DFF3B]/10"
                        : "border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="upi" id="pay-upi" className="border-slate-300 dark:border-white/20 text-[#6DFF3B] focus:ring-[#6DFF3B] accent-[#6DFF3B]" />
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">UPI Payments</p>
                        <p className="text-[10px] text-slate-500 dark:text-white/50">Google Pay, PhonePe, Paytm</p>
                      </div>
                    </div>
                    <Smartphone className={`h-5 w-5 ${paymentMethod === "upi" ? "text-emerald-600 dark:text-[#6DFF3B]" : "text-slate-400 dark:text-white/40"}`} />
                  </Label>

                  {/* UPI ID Input fields (visible when selected) */}
                  {paymentMethod === "upi" && (
                    <div className="px-3 pb-2 space-y-2 text-left">
                      <Label htmlFor="upiId" className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/50 font-semibold block">UPI ID</Label>
                      <Input
                        id="upiId"
                        placeholder="username@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="h-10 bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus-visible:ring-1 focus-visible:ring-[#6DFF3B] focus-visible:border-[#6DFF3B] placeholder-slate-400 dark:placeholder-white/20 text-xs rounded-xl"
                        required
                      />
                    </div>
                  )}

                  {/* Card */}
                  <Label
                    htmlFor="pay-card"
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer select-none ${
                      paymentMethod === "card"
                        ? "border-[#6DFF3B] bg-[#6DFF3B]/5 dark:bg-[#6DFF3B]/10"
                        : "border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="card" id="pay-card" className="border-slate-300 dark:border-white/20 text-[#6DFF3B] focus:ring-[#6DFF3B] accent-[#6DFF3B]" />
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">Credit / Debit Card</p>
                        <p className="text-[10px] text-slate-500 dark:text-white/50">Visa, MasterCard, RuPay</p>
                      </div>
                    </div>
                    <CreditCard className={`h-5 w-5 ${paymentMethod === "card" ? "text-emerald-600 dark:text-[#6DFF3B]" : "text-slate-400 dark:text-white/40"}`} />
                  </Label>

                  {/* Card Inputs */}
                  {paymentMethod === "card" && (
                    <div className="px-3 pb-2 space-y-3 text-left">
                      <div className="space-y-1">
                        <Label htmlFor="cardNo" className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/50 font-semibold block">Card Number</Label>
                        <Input
                          id="cardNo"
                          placeholder="4111 2222 3333 4444"
                          maxLength={19}
                          value={cardNo}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            const matches = val.match(/\d{4,16}/g);
                            const match = (matches && matches[0]) || "";
                            const parts = [];
                            for (let i = 0, len = match.length; i < len; i += 4) {
                              parts.push(match.substring(i, i + 4));
                            }
                            if (parts.length > 0) {
                              setCardNo(parts.join(" "));
                            } else {
                              setCardNo(val);
                            }
                          }}
                          className="h-10 bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus-visible:ring-1 focus-visible:ring-[#6DFF3B] focus-visible:border-[#6DFF3B] placeholder-slate-400 dark:placeholder-white/20 text-xs rounded-xl"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="cardExpiry" className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/50 font-semibold block">Expiry Date</Label>
                          <Input
                            id="cardExpiry"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              if (val.length > 2) {
                                val = val.substring(0, 2) + "/" + val.substring(2, 4);
                              }
                              setCardExpiry(val);
                            }}
                            className="h-10 bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus-visible:ring-1 focus-visible:ring-[#6DFF3B] focus-visible:border-[#6DFF3B] placeholder-slate-400 dark:placeholder-white/20 text-xs rounded-xl"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="cardCvv" className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/50 font-semibold block">CVV</Label>
                          <Input
                            id="cardCvv"
                            type="password"
                            placeholder="•••"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                            className="h-10 bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus-visible:ring-1 focus-visible:ring-[#6DFF3B] focus-visible:border-[#6DFF3B] placeholder-slate-400 dark:placeholder-white/20 text-xs rounded-xl"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="cardName" className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/50 font-semibold block">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          placeholder="Name on card"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="h-10 bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus-visible:ring-1 focus-visible:ring-[#6DFF3B] focus-visible:border-[#6DFF3B] placeholder-slate-400 dark:placeholder-white/20 text-xs rounded-xl"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Net Banking */}
                  <Label
                    htmlFor="pay-netbanking"
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer select-none ${
                      paymentMethod === "netbanking"
                        ? "border-[#6DFF3B] bg-[#6DFF3B]/5 dark:bg-[#6DFF3B]/10"
                        : "border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="netbanking" id="pay-netbanking" className="border-slate-300 dark:border-white/20 text-[#6DFF3B] focus:ring-[#6DFF3B] accent-[#6DFF3B]" />
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">Net Banking</p>
                        <p className="text-[10px] text-slate-500 dark:text-white/50">All Indian Banks supported</p>
                      </div>
                    </div>
                    <Building2 className={`h-5 w-5 ${paymentMethod === "netbanking" ? "text-emerald-600 dark:text-[#6DFF3B]" : "text-slate-400 dark:text-white/40"}`} />
                  </Label>

                  {paymentMethod === "netbanking" && (
                    <div className="px-3 pb-2 space-y-2 text-left">
                      <Label htmlFor="bankSelect" className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/50 font-semibold block">Select Bank</Label>
                      <select
                        id="bankSelect"
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#6DFF3B] cursor-pointer"
                      >
                        <option value="hdfc">HDFC Bank</option>
                        <option value="sbi">State Bank of India</option>
                        <option value="icici">ICICI Bank</option>
                        <option value="axis">Axis Bank</option>
                        <option value="kotak">Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}

                  {/* Wallet */}
                  <Label
                    htmlFor="pay-wallet"
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer select-none ${
                      paymentMethod === "wallet"
                        ? "border-[#6DFF3B] bg-[#6DFF3B]/5 dark:bg-[#6DFF3B]/10"
                        : "border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="wallet" id="pay-wallet" className="border-slate-300 dark:border-white/20 text-[#6DFF3B] focus:ring-[#6DFF3B] accent-[#6DFF3B]" />
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">SportX Wallet</p>
                        <p className="text-[10px] text-emerald-600 dark:text-[#6DFF3B] font-medium">Available Balance: ₹{walletBalance}</p>
                      </div>
                    </div>
                    <Wallet className={`h-5 w-5 ${paymentMethod === "wallet" ? "text-emerald-600 dark:text-[#6DFF3B]" : "text-slate-400 dark:text-white/40"}`} />
                  </Label>
                </RadioGroup>

                <DialogFooter className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#6DFF3B] text-black hover:bg-[#86ff60] rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Pay ₹{amountToPayNow} Securely
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}

          {paymentStep === "processing" && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <Loader2 className="h-10 w-10 text-emerald-600 dark:text-[#6DFF3B] animate-spin" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Processing Payment</h3>
                <p className="text-xs text-slate-500 dark:text-white/50 max-w-[250px] mx-auto animate-pulse">{processingMessage}</p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-widest font-semibold">
                <Lock className="h-3 w-3" /> PCI-DSS Compliant
              </div>
            </div>
          )}

          {paymentStep === "success" && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center animate-scaleIn">
              <div className="h-14 w-14 rounded-full bg-emerald-500/10 dark:bg-[#6DFF3B]/10 border border-emerald-500/30 dark:border-[#6DFF3B]/30 flex items-center justify-center text-emerald-600 dark:text-[#6DFF3B]">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payment Successful!</h3>
                <p className="text-xs text-slate-500 dark:text-white/50">Your transaction has settled successfully.</p>
              </div>
              <p className="text-[10px] text-emerald-600 dark:text-[#6DFF3B] font-bold uppercase tracking-wider bg-emerald-500/10 dark:bg-[#6DFF3B]/10 px-2.5 py-0.5 rounded-full mt-2">
                Booking Squad...
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
