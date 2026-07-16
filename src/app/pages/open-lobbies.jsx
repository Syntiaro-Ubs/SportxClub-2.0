import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Users, Trophy, Calendar, MapPin, Lock, Smartphone, Wallet, Building2, Check, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";

// Mock data for open lobbies
const initialLobbies = [
  { id: 1, sport: "Football", teamName: "Weekend Warriors", currentPlayers: 6, maxPlayers: 10, time: "18:00 - 19:00", priceTotal: 1500, date: "Today" },
  { id: 2, sport: "Football", teamName: "Night Owls FC", currentPlayers: 8, maxPlayers: 14, time: "20:00 - 22:00", priceTotal: 3000, date: "Today" },
  { id: 3, sport: "Cricket", teamName: "Smashers XI", currentPlayers: 15, maxPlayers: 22, time: "16:00 - 18:00", priceTotal: 2500, date: "Tomorrow" },
  { id: 4, sport: "Basketball", teamName: "Hoop Dreams", currentPlayers: 3, maxPlayers: 10, time: "17:00 - 18:00", priceTotal: 1000, date: "Today" },
];

const getLobbies = () => {
  const savedLobbies = JSON.parse(localStorage.getItem("open_lobbies") || "[]");
  return [...savedLobbies.sort((a, b) => b.id - a.id), ...initialLobbies]; 
};

export function OpenLobbiesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const venue = location.state?.venue || { name: "Elite Turf Arena", location: "Powai, Mumbai" };

  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedLobby, setSelectedLobby] = useState(null);
  
  // Payment Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState("select");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [processingMessage, setProcessingMessage] = useState("");

  const allLobbies = getLobbies();
  const filteredLobbies = selectedSport === "All" 
    ? allLobbies 
    : allLobbies.filter(l => l.sport === selectedSport);

  const amountToPay = selectedLobby ? Math.ceil(selectedLobby.priceTotal / selectedLobby.maxPlayers) : 0;

  const handleJoinClick = (lobby) => {
    setSelectedLobby(lobby);
    setPaymentStep("select");
    setIsPaymentModalOpen(true);
  };

  const processPayment = () => {
    setPaymentStep("processing");
    setProcessingMessage("Initiating secure connection...");
    
    setTimeout(() => setProcessingMessage("Verifying payment details..."), 1000);
    setTimeout(() => setProcessingMessage("Confirming split payment..."), 2000);
    
    setTimeout(() => {
      setPaymentStep("success");
      setTimeout(() => navigate("/booking-success"), 1500);
    }, 3000);
  };

  return (
    <div className="theme-adaptive bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-6 pb-6 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
        {/* Back Link */}
        <Link
          to="/venues"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-4 py-2 text-sm text-slate-600 dark:text-white/72 transition hover:border-[#6DFF3B]/25 hover:bg-[#6DFF3B]/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Venues
        </Link>

        {/* Title */}
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Open Lobbies</h1>
          <p className="text-slate-500 dark:text-white/60 mt-1 text-sm max-w-lg">
            Join an existing squad as a single player at {venue.name}.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* Filters */}
          <div className="space-y-6">
            <Card className="rounded-[24px] border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216] shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Sport Category</h3>
                  <Select value={selectedSport} onValueChange={setSelectedSport}>
                    <SelectTrigger className="w-full h-12 rounded-xl border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-white focus:ring-[#6DFF3B]">
                      <SelectValue placeholder="Select Sport" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216]">
                      <SelectItem value="All">All Sports</SelectItem>
                      <SelectItem value="Football">Football</SelectItem>
                      <SelectItem value="Cricket">Cricket</SelectItem>
                      <SelectItem value="Basketball">Basketball</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lobbies List */}
          <div className="space-y-4">
            {filteredLobbies.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-white/50">
                No open lobbies found for {selectedSport}. Try creating your own!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLobbies.map((lobby) => {
                  const splitPrice = Math.ceil(lobby.priceTotal / lobby.maxPlayers);
                  return (
                    <Card key={lobby.id} className="rounded-[24px] border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216] shadow-sm hover:border-[#6DFF3B]/50 transition-all group">
                      <CardContent className="p-5 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6DFF3B] bg-[#6DFF3B]/10 px-2 py-1 rounded-md mb-2 inline-block">
                              {lobby.sport}
                            </span>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-amber-500" />
                              {lobby.teamName}
                            </h3>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-slate-900 dark:text-white">₹{splitPrice}</p>
                            <p className="text-[10px] text-slate-500 dark:text-white/40 uppercase font-bold tracking-wide">Fixed Split Share</p>
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/60">
                            <Calendar className="h-4 w-4 opacity-70" />
                            <span>{lobby.date} • {lobby.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/60">
                            <Users className="h-4 w-4 opacity-70" />
                            <span>{lobby.currentPlayers} / {lobby.maxPlayers} Players Joined</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mt-2">
                            <div 
                              className="h-full bg-[#6DFF3B]" 
                              style={{ width: `${(lobby.currentPlayers / lobby.maxPlayers) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-auto">
                          <Button 
                            onClick={() => handleJoinClick(lobby)}
                            className="w-full h-11 bg-[#6DFF3B] text-black hover:bg-[#86ff60] rounded-xl font-bold transition-all shadow-lg shadow-[#6DFF3B]/20"
                          >
                            Join & Pay ₹{splitPrice}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
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
        <DialogContent className="sm:max-w-md rounded-[32px] border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216] text-slate-900 dark:text-white shadow-2xl">
          {paymentStep === "select" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Lock className="h-5 w-5 text-[#6DFF3B]" />
                  Secure Checkout
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-white/60">
                  Choose a payment method for your fixed split share of ₹{amountToPay}.
                </DialogDescription>
              </DialogHeader>

              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05] rounded-xl p-4 mb-4 flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-white/60 font-medium">Fixed Split Amount</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">₹{amountToPay}</span>
              </div>

              <div className="grid gap-4 py-2">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-3">
                  <Label
                    className={`flex flex-col items-center justify-between rounded-xl border-2 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all ${
                      paymentMethod === "upi" ? "border-[#6DFF3B] bg-[#6DFF3B]/10" : "border-slate-200 dark:border-white/[0.08]"
                    }`}
                  >
                    <RadioGroupItem value="upi" className="sr-only" />
                    <Smartphone className={`h-6 w-6 mb-2 ${paymentMethod === "upi" ? "text-[#6DFF3B]" : "text-slate-400 dark:text-white/40"}`} />
                    <span className="text-xs font-semibold">UPI</span>
                  </Label>
                  <Label
                    className={`flex flex-col items-center justify-between rounded-xl border-2 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all ${
                      paymentMethod === "card" ? "border-[#6DFF3B] bg-[#6DFF3B]/10" : "border-slate-200 dark:border-white/[0.08]"
                    }`}
                  >
                    <RadioGroupItem value="card" className="sr-only" />
                    <Wallet className={`h-6 w-6 mb-2 ${paymentMethod === "card" ? "text-[#6DFF3B]" : "text-slate-400 dark:text-white/40"}`} />
                    <span className="text-xs font-semibold">Card</span>
                  </Label>
                </RadioGroup>
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)} className="rounded-xl h-12 text-slate-900 dark:text-white border-slate-200 dark:border-white/10">Cancel</Button>
                <Button onClick={processPayment} className="rounded-xl h-12 bg-slate-900 text-white dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-gray-200 font-bold">
                  Pay ₹{amountToPay}
                </Button>
              </DialogFooter>
            </>
          )}

          {paymentStep === "processing" && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 text-[#6DFF3B] animate-spin" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Processing Payment</h3>
              <p className="text-sm text-slate-500 dark:text-white/60 animate-pulse">{processingMessage}</p>
            </div>
          )}

          {paymentStep === "success" && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-[#6DFF3B]/20 flex items-center justify-center mb-2">
                <Check className="h-8 w-8 text-[#6DFF3B]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Successful!</h3>
              <p className="text-sm text-slate-500 dark:text-white/60 text-center max-w-xs">
                Your split share of ₹{amountToPay} has been paid. You are now officially in the squad!
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
