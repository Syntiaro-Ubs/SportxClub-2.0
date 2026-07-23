import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Calendar,
  Clock,
  CreditCard,
  Lock,
  Smartphone,
  Wallet,
  Building2,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
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

  const [selectedDate, setSelectedDate] = useState("2026-07-11");
  const [startTime, setStartTime] = useState("19:00");
  const [playHours, setPlayHours] = useState(1);
  const [selectedSlotObj, setSelectedSlotObj] = useState(null);
  
  const [venue] = useState(location.state?.venue || {
    name: "Elite Turf Arena",
    location: "Powai, Mumbai",
    price: 1200,
  });

  // Dynamic time slots configuration matching preview schedules
  const timeSlots = [
    { startHour: 15, label: "03:00 PM", endLabel: "04:00 PM", price: 1200 },
    { startHour: 16, label: "04:00 PM", endLabel: "05:00 PM", price: 1200 },
    { startHour: 17, label: "05:00 PM", endLabel: "06:00 PM", bookedBy: "Team Alpha", price: 1500 },
    { startHour: 18, label: "06:00 PM", endLabel: "07:00 PM", price: 1800 },
    { startHour: 19, label: "07:00 PM", endLabel: "08:00 PM", price: 2000 },
    { startHour: 20, label: "08:00 PM", endLabel: "09:00 PM", price: 2000 },
    { startHour: 21, label: "09:00 PM", endLabel: "10:00 PM", price: 2000 },
    { startHour: 22, label: "10:00 PM", endLabel: "11:00 PM", bookedBy: "Late Night Book", price: 1800 },
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

  const amountToPayNow = selectedSlotObj ? selectedSlotObj.price * playHours : 0;
  const displayPrice = amountToPayNow;

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
    if (paymentMethod === "wallet" && walletBalance < displayPrice) {
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
          setWalletBalance(prev => prev - displayPrice);
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
    toast.success(`Turf booked successfully! Slot reserved.`);

    const rangeStr = selectedSlotObj ? formatSlotRange(selectedSlotObj.startHour, playHours) : "N/A";

    const activeMembers = [{ id: 99, name: "You", role: "host" }];

    // Update active squad lobby (mock for receipt)
    const lobbyObj = {
      active: false,
      sport: "N/A",
      maxSize: 1,
      members: activeMembers,
      paymentMode: "full",
      paidMembers: [99]
    };
    
    // Save transaction state for the receipt download and Entry Pass screen
    sessionStorage.setItem("sportxclub_last_booking", JSON.stringify({
      squadLobby: lobbyObj,
      paymentMode: "full",
      amountToPayNow: displayPrice,
      costPerPlayer: displayPrice,
      totalPrice: displayPrice,
      venue,
      selectedDate: "Today",
      startTime: rangeStr,
      playHours
    }));

    setTimeout(() => {
      navigate("/booking-success");
    }, 800);
  };

  return (
    <div className="theme-adaptive bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-6 pb-6 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">

        {/* Title */}
        <div className="mt-6 mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Book Slot</h1>
          <p className="text-slate-500 dark:text-white/60 mt-1 text-sm max-w-lg mx-auto">
            Select an available time slot for your match at {venue.name}.
          </p>
        </div>

        <Card className="rounded-[28px] border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216] shadow-xl overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              {/* Date Selection */}
              <div className="space-y-3 mb-6">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/40 font-bold block">
                  Select Date
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-4 h-14">
                  <Calendar className="h-4 w-4 text-[#6DFF3B]" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </label>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#6DFF3B]" />
                  Available Slots
                </h3>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                  {[1, 2, 3, 4].map(h => (
                    <button
                      key={h}
                      onClick={() => setPlayHours(h)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${playHours === h ? 'bg-white dark:bg-[#101216] text-[#6DFF3B] shadow-sm' : 'text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/80'}`}
                    >
                      {h} Hr
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((slot, i) => {
                  const isBooked = isOverlapping(slot.startHour) || isOutOfBounds(slot.startHour);
                  const price = slot.price * playHours;
                  const rangeStr = formatSlotRange(slot.startHour, playHours);

                  return (
                    <button
                      key={i}
                      disabled={isBooked}
                      onClick={() => {
                        setSelectedSlotObj(slot);
                        setPaymentStep("select");
                        setIsPaymentModalOpen(true);
                      }}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all text-center relative ${isBooked
                        ? "bg-red-500/5 dark:bg-red-500/10 border-red-500/20 text-slate-400/40 cursor-not-allowed"
                        : "border-[#6DFF3B]/30 hover:border-[#6DFF3B] hover:bg-[#6DFF3B]/5 text-slate-800 dark:text-white bg-white dark:bg-white/[0.02] cursor-pointer"
                        }`}
                    >
                      <span className={`text-sm font-bold ${isBooked ? 'text-slate-500/40 opacity-50' : ''}`}>
                        {rangeStr}
                      </span>
                      {isBooked ? (
                        <span className="text-[10px] font-extrabold text-red-500 mt-1 uppercase tracking-wider">
                          Unavailable
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold text-emerald-500 dark:text-[#6DFF3B] mt-1 tracking-wider">
                          Available • ₹{price}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Gateway Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={(open) => {
        if (paymentStep !== "processing") {
          setIsPaymentModalOpen(open);
          if (!open) {
            setPaymentStep("select");
          }
        }
      }}>
        <DialogContent className="sm:max-w-md rounded-2xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216] text-slate-900 dark:text-white shadow-2xl p-0 overflow-hidden">
          {paymentStep === "select" && (
            <div className="p-6">
              <DialogHeader>
                <div className="flex items-center justify-between mb-1">
                  <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Lock className="h-5 w-5 text-emerald-600 dark:text-[#6DFF3B]" />
                    Secure Checkout
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="h-8 px-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    Close
                  </Button>
                </div>
                <DialogDescription className="text-slate-500 dark:text-white/60 text-xs text-left">
                  Choose a payment method to pay <strong className="text-emerald-600 dark:text-[#6DFF3B]">₹{displayPrice}</strong>
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handlePaymentSubmit} className="space-y-4 my-2">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 gap-2.5">
                  {/* UPI */}
                  <Label
                    htmlFor="pay-upi"
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer select-none ${paymentMethod === "upi"
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

                  {/* UPI ID Input fields */}
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
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer select-none ${paymentMethod === "card"
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
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer select-none ${paymentMethod === "netbanking"
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
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer select-none ${paymentMethod === "wallet"
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
                    Pay ₹{displayPrice} Securely
                  </Button>
                </DialogFooter>
              </form>
            </div>
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
                Booking Slot...
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
