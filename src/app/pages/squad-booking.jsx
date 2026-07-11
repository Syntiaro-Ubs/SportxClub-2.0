import { useState } from "react";
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
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

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

  const totalPrice = venue.price * playHours;
  const costPerPlayer = Math.round(totalPrice / squadLobby.maxSize);
  const amountToPayNow = paymentMode === "full" ? totalPrice : costPerPlayer;

  const handleCheckout = () => {
    toast.success(paymentMode === "full"
      ? `Full squad booking payment of ₹${totalPrice} successful!`
      : `Squad cost-split payment of ₹${costPerPlayer} successful!`
    );
    setTimeout(() => {
      navigate("/booking-success");
    }, 800);
  };

  return (
    <div className="theme-adaptive bg-[#050505] text-white min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-6 pb-6 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
        {/* Back Link */}
        <Link
          to="/players"
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white/72 transition hover:border-[#6DFF3B]/25 hover:bg-[#6DFF3B]/10"
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
            <Card className="rounded-[28px] border-white/[0.08] bg-[#101216]">
              <CardContent className="p-6 md:p-8 space-y-5">
                <h2 className="text-xl text-white font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#6DFF3B]" />
                  Booking Details
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-white/45 font-semibold block">Venue</label>
                    <div className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-white">
                      <p className="font-semibold">{venue.name}</p>
                      <p className="text-xs text-white/50">{venue.location}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-white/45 font-semibold block">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-white focus:outline-none focus:border-[#6DFF3B]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-white/45 font-semibold block">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-white/[0.08] bg-[#101216] text-sm text-white focus:outline-none focus:border-[#6DFF3B] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-white/45 font-semibold block">Duration (Hours)</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={playHours}
                      onChange={(e) => setPlayHours(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full h-11 px-3 rounded-xl border border-white/[0.08] bg-[#101216] text-sm text-white focus:outline-none focus:border-[#6DFF3B] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-white/45 font-semibold block">Payment Mode</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-white/[0.08] bg-[#101216] text-sm text-white focus:outline-none focus:border-[#6DFF3B] cursor-pointer"
                    >
                      <option value="split">🟢 Cost Split (Pay ₹{costPerPlayer} share)</option>
                      <option value="full">💳 Full Payment (Pay ₹{totalPrice} total)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Split billing details */}
            <Card className="rounded-[28px] border-white/[0.08] bg-[#101216]">
              <CardContent className="p-6 md:p-8 space-y-4">
                <h2 className="text-xl text-white font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#6DFF3B]" />
                  Billing Summary
                </h2>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-white/70">
                    <span>Total Turf Booking Cost:</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  {paymentMode === "split" && (
                    <div className="flex justify-between text-white/70">
                      <span>Split Ratio (Total Players):</span>
                      <span>{squadLobby.maxSize} Ways</span>
                    </div>
                  )}
                  <div className="border-t border-white/[0.08] pt-2 flex justify-between font-bold text-base text-[#6DFF3B]">
                    <span>{paymentMode === "full" ? "Total Amount to Pay Now:" : "Your Share to Pay Now:"}</span>
                    <span>₹{amountToPayNow}</span>
                  </div>
                </div>

                {paymentMode === "split" ? (
                  <div className="p-3 rounded-xl bg-[#6DFF3B]/5 border border-[#6DFF3B]/20 text-xs text-white/80 leading-relaxed font-medium">
                    💡 <strong>Split details:</strong> Each player in the squad will receive an automated request to pay their share (₹{costPerPlayer}) within 1 hour of booking. As host, you secure the booking by paying your share now.
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#6DFF3B]/5 border border-[#6DFF3B]/20 text-xs text-white/80 leading-relaxed font-medium">
                    ⚡ <strong>Full Payment details:</strong> You are paying the full slot booking amount (₹{totalPrice}) now. Other squad members will not be charged or asked to split.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            {/* Squad List */}
            <Card className="rounded-[28px] border-white/[0.08] bg-[#101216]">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#6DFF3B]" />
                  Squad Members ({squadLobby.members.length})
                </h3>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {squadLobby.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-xl border border-white/[0.05] bg-white/[0.01]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-[#6DFF3B]">
                          {member.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-white truncate flex items-center gap-1.5">
                            {member.name}
                            {member.role === "host" && <span>👑</span>}
                          </p>
                          <p className="text-[9px] text-white/50 truncate uppercase tracking-wider">
                            {member.role === "host" ? "Squad Leader" : "Member"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-medium text-white/80">{member.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/[0.08] space-y-3">
                  <Button
                    onClick={handleCheckout}
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
    </div>
  );
}
