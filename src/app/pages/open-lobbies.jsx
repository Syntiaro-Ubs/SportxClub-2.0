import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  Users,
  Trophy,
  Calendar,
  MapPin,
  Lock,
  Smartphone,
  Wallet,
  Check,
  Loader2,
  Star,
  Flame,
  Activity,
  Plus,
  ShieldCheck,
  Zap,
  Target,
  Smile
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { cn } from "../components/ui/utils";

// Mock data for open lobbies with types and features
const initialLobbies = [
  {
    id: 1,
    sport: "Football",
    teamName: "Weekend Warriors FC",
    currentPlayers: 6,
    maxPlayers: 10,
    time: "18:00 - 19:00",
    priceTotal: 1500,
    date: "Today",
    host: { name: "Rohan Das", rating: 4.8, avatar: "RD" },
    skillLevel: "Intermediate",
    description: "Casual 5v5 game. Need players of all skill levels!",
    type: "Casual",
    accent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
  },
  {
    id: 2,
    sport: "Football",
    teamName: "Night Owls FC",
    currentPlayers: 8,
    maxPlayers: 14,
    time: "20:00 - 22:00",
    priceTotal: 2800,
    date: "Today",
    host: { name: "Vikram Malhotra", rating: 4.9, avatar: "VM" },
    skillLevel: "Advanced",
    description: "7v7 fast paced match. Clean studs required!",
    type: "Competitive",
    accent: "text-amber-500 bg-amber-500/10 border-amber-500/20"
  },
  {
    id: 3,
    sport: "Cricket",
    teamName: "Powai Smashers XI",
    currentPlayers: 16,
    maxPlayers: 22,
    time: "16:00 - 18:00",
    priceTotal: 2200,
    date: "Tomorrow",
    host: { name: "Amit Patel", rating: 4.7, avatar: "AP" },
    skillLevel: "All Levels",
    description: "Box cricket with tennis ball. Fun weekend session.",
    type: "Friendly",
    accent: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  },
  {
    id: 4,
    sport: "Basketball",
    teamName: "Dunkin' Dynamos",
    currentPlayers: 3,
    maxPlayers: 10,
    time: "17:00 - 18:00",
    priceTotal: 1200,
    date: "Today",
    host: { name: "Kabir Mehta", rating: 4.6, avatar: "KM" },
    skillLevel: "Intermediate",
    description: "3v3 half-court practice and friendly matches.",
    type: "Training",
    accent: "text-rose-500 bg-rose-500/10 border-rose-500/20"
  },
];

const getLobbies = () => {
  const savedLobbies = JSON.parse(localStorage.getItem("open_lobbies") || "[]");
  return [...savedLobbies.map(l => ({
    ...l,
    host: l.host || { name: "You (Host)", rating: 5.0, avatar: "U" },
    skillLevel: l.skillLevel || "All Levels",
    type: l.type || "Casual",
    accent: l.accent || "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    description: l.description || "Freshly hosted lobby. Tap to join!"
  })).sort((a, b) => b.id - a.id), ...initialLobbies];
};

const getJoinedPlayersList = (lobby) => {
  if (!lobby) return [];
  const list = [lobby.host.name];
  const mockNames = [
    "Rahul Sharma", "Arjun Kapoor", "Priya Patel", "Sneha Singh",
    "Vikram Malhotra", "Amit Shah", "Kabir Sen", "Riya Sen",
    "Sameer Rao", "Ananya Roy", "Rohan Das", "Surekha K."
  ];
  // Determine names deterministically based on lobby.id to avoid random shifts on render
  let nameIndex = lobby.id % mockNames.length;
  while (list.length < lobby.currentPlayers) {
    const nextName = mockNames[nameIndex];
    if (!list.includes(nextName)) {
      list.push(nextName);
    }
    nameIndex = (nameIndex + 1) % mockNames.length;
  }
  return list;
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

  // Input states for Checkout Form
  const [upiId, setUpiId] = useState("");
  const [cardNo, setCardNo] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const allLobbies = getLobbies().filter(l => l.currentPlayers < l.maxPlayers);
  const filteredLobbies = selectedSport === "All"
    ? allLobbies
    : allLobbies.filter(l => l.sport === selectedSport);
  const joinedLobbies = JSON.parse(localStorage.getItem("joined_lobbies") || "[]");

  const amountToPay = selectedLobby ? Math.ceil(selectedLobby.priceTotal / selectedLobby.maxPlayers) : 0;

  const handleJoinClick = (lobby) => {
    setSelectedLobby(lobby);
    setPaymentStep("select");
    // Clear inputs
    setUpiId("");
    setCardNo("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
    setIsPaymentModalOpen(true);
  };

  const processPayment = (e) => {
    e.preventDefault();

    // Basic Validation
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
        toast.error("Please enter expiry in MM/YY format");
        return;
      }
      if (cardCvv.length < 3) {
        toast.error("Please enter a valid CVV");
        return;
      }
      if (!cardName.trim()) {
        toast.error("Please enter Cardholder Name");
        return;
      }
    }

    setPaymentStep("processing");
    setProcessingMessage("Initiating secure connection...");

    setTimeout(() => setProcessingMessage("Verifying slots availability..."), 1000);
    setTimeout(() => setProcessingMessage("Confirming split payment..."), 2000);

    setTimeout(() => {
      setPaymentStep("success");

      // Save last booking details to sessionStorage for the success screen
      const lobbyObj = {
        active: true,
        sport: selectedLobby.sport,
        maxSize: selectedLobby.maxPlayers,
        members: [
          { id: "h1", name: selectedLobby.host.name + " (Host)", role: "host" },
          { id: "m2", name: "You", role: "member" },
        ],
      };

      sessionStorage.setItem("sportxclub_last_booking", JSON.stringify({
        squadLobby: lobbyObj,
        paymentMode: "split",
        costPerPlayer: amountToPay,
        totalPrice: selectedLobby.priceTotal,
        selectedDate: selectedLobby.date === "Today" ? "June 18, 2026" : "June 19, 2026",
        startTime: selectedLobby.time.split(" ")[0],
        playHours: 1,
        venue: {
          name: venue.name,
          location: venue.location
        }
      }));

      // Dynamically update localStorage to increment joined players count for this lobby
      const existingOpenLobbies = JSON.parse(localStorage.getItem("open_lobbies") || "[]");
      const updatedOpenLobbies = existingOpenLobbies.map(l =>
        l.id === selectedLobby.id ? { ...l, currentPlayers: l.currentPlayers + 1 } : l
      );
      localStorage.setItem("open_lobbies", JSON.stringify(updatedOpenLobbies));

      // Record this lobby as joined by the user!
      const joinedLobbies = JSON.parse(localStorage.getItem("joined_lobbies") || "[]");
      if (!joinedLobbies.includes(selectedLobby.id)) {
        joinedLobbies.push(selectedLobby.id);
        localStorage.setItem("joined_lobbies", JSON.stringify(joinedLobbies));
      }

      setTimeout(() => navigate("/booking-success"), 1500);
    }, 3000);
  };

  const sportsList = ["All", "Football", "Cricket", "Basketball"];

  return (
    <div className="theme-adaptive bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-6 pb-12 sm:px-6 lg:px-8 lg:py-10">

        {/* Back Link */}
        <Link
          to="/venues"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-4 py-2 text-sm text-slate-600 dark:text-white/72 transition hover:border-[#6DFF3B]/25 hover:bg-[#6DFF3B]/10 hover:text-slate-900 dark:hover:text-[#6DFF3B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Venues
        </Link>

        {/* Hero Section & Visual Counter */}
        <div className="mt-8 mb-10 relative overflow-hidden rounded-[32px] border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216] p-6 md:p-8 shadow-sm">
          {/* Ambient glowing background blur */}
          <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-[#6DFF3B]/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#6DFF3B] bg-[#6DFF3B]/10 px-2.5 py-1 rounded-md mb-3 inline-block animate-pulse">
                Public Matchmaking
              </span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Open Lobbies
              </h1>
              <p className="text-slate-500 dark:text-white/60 mt-2 text-sm max-w-xl">
                Join an existing squad as a single player at <span className="text-slate-900 dark:text-[#6DFF3B] font-semibold">{venue.name}</span>. Pay only your individual split share.
              </p>
            </div>

            <div className="flex gap-4 items-center shrink-0">
              <div className="rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#050505]/40 px-5 py-4 text-center min-w-[100px]">
                <p className="text-3xl font-black text-slate-900 dark:text-[#6DFF3B]">{filteredLobbies.length}</p>
                <p className="text-[10px] text-slate-500 dark:text-white/40 uppercase font-bold tracking-wide mt-0.5">Active Matches</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-[#050505]/40 px-5 py-4 text-center min-w-[100px]">
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  {filteredLobbies.reduce((acc, curr) => acc + (curr.maxPlayers - curr.currentPlayers), 0)}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-white/40 uppercase font-bold tracking-wide mt-0.5">Slots Left</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Category Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2.5">
            {sportsList.map((sport) => {
              const isActive = selectedSport === sport;
              const count = sport === "All" ? allLobbies.length : allLobbies.filter(l => l.sport === sport).length;

              return (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(sport)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all cursor-pointer border",
                    isActive
                      ? "bg-[#6DFF3B] border-[#6DFF3B] text-black shadow-lg shadow-[#6DFF3B]/20 scale-105"
                      : "bg-white dark:bg-[#101216] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/[0.03] hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {sport === "Football" && <Trophy className="h-3.5 w-3.5" />}
                  {sport === "Cricket" && <Flame className="h-3.5 w-3.5" />}
                  {sport === "Basketball" && <Activity className="h-3.5 w-3.5" />}
                  <span>{sport === "All" ? "All Sports" : sport}</span>
                  <span className={cn(
                    "ml-1 text-[10px] px-1.5 py-0.5 rounded-full",
                    isActive ? "bg-black/10 text-black" : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <Link to="/squad-booking" state={{ venue }}>
            <Button className="h-10 rounded-full border border-[#6DFF3B] bg-[#6DFF3B] text-black hover:bg-[#86ff60] font-bold text-xs gap-1.5 px-5 shadow-[0_0_15px_rgba(109,255,59,0.2)] hover:scale-105 transition-all duration-300 cursor-pointer">
              <Plus className="h-4 w-4 text-black" /> Host New Lobby
            </Button>
          </Link>
        </div>

        {/* Lobbies Grid */}
        <div>
          {filteredLobbies.length === 0 ? (
            <Card className="rounded-[24px] border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216] py-16 text-center shadow-sm">
              <CardContent className="space-y-4">
                <Users className="h-12 w-12 text-slate-300 dark:text-white/20 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">No active lobbies found</h3>
                <p className="text-sm text-slate-500 dark:text-white/50 max-w-sm mx-auto">
                  There are currently no open lobbies for {selectedSport}. Why not host a new match and invite players to join?
                </p>
                <Link to="/squad-booking" state={{ venue }}>
                  <Button className="rounded-xl bg-[#6DFF3B] text-black hover:bg-[#86ff60] font-bold mt-2 hover:scale-105 transition-all">
                    Create a Lobby
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredLobbies.map((lobby) => {
                const splitPrice = Math.ceil(lobby.priceTotal / lobby.maxPlayers);
                const slotsRemaining = lobby.maxPlayers - lobby.currentPlayers;

                return (
                  <Card key={lobby.id} className="rounded-[28px] border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216]/60 backdrop-blur-md shadow-sm hover:border-[#6DFF3B]/50 hover:shadow-[0_15px_40px_rgba(109,255,59,0.05)] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between overflow-hidden">
                    <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full space-y-6">

                      {/* Top Header Row */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex gap-2 items-center mb-2">
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#6DFF3B] bg-[#6DFF3B]/10 px-2.5 py-0.5 rounded-full border border-[#6DFF3B]/20">
                              {lobby.sport}
                            </span>
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
                              lobby.accent || "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                            )}>
                              {lobby.type || "Casual"}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-white/50 bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full">
                              {lobby.skillLevel || "Intermediate"}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#6DFF3B] transition-colors leading-tight">
                            {lobby.teamName}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-white/50 mt-1 line-clamp-1">
                            {lobby.description || "Friendly open session. Join us!"}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-2xl font-black text-slate-900 dark:text-white">₹{splitPrice}</p>
                          <p className="text-[9px] text-slate-500 dark:text-white/40 uppercase font-bold tracking-wide mt-0.5">Split Share</p>
                        </div>
                      </div>

                      {/* Middle Details Grid */}
                      <div className="grid grid-cols-2 gap-4 border-y border-slate-100 dark:border-white/[0.05] py-4">
                        <div className="space-y-0.5">
                          <p className="text-[9px] uppercase text-slate-400 dark:text-white/40 font-bold tracking-wide">Schedule</p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-white font-semibold">
                            <Calendar className="h-3.5 w-3.5 text-[#6DFF3B] shrink-0" />
                            <span>{lobby.date} • {lobby.time}</span>
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <p className="text-[9px] uppercase text-slate-400 dark:text-white/40 font-bold tracking-wide">Lobby Host</p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-white font-semibold">
                            <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[8px] font-bold text-slate-600 dark:text-white shrink-0">
                              {lobby.host?.avatar || "H"}
                            </div>
                            <span className="truncate">{lobby.host?.name || "Host Player"}</span>
                            <span className="flex items-center gap-0.5 text-[10px] text-amber-500 shrink-0 font-bold">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              {lobby.host?.rating || "4.8"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Visual Avatar Slots Representation */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-700 dark:text-white/70">
                            Squad Setup ({lobby.currentPlayers}/{lobby.maxPlayers} Joined)
                          </span>
                          {slotsRemaining <= 2 ? (
                            <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-wide animate-pulse">
                              Only {slotsRemaining} slots left!
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#6DFF3B] font-bold uppercase tracking-wide">
                              {slotsRemaining} Slots available
                            </span>
                          )}
                        </div>

                        {/* Interactive Avatar Grid */}
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {Array.from({ length: lobby.maxPlayers }).map((_, idx) => {
                            const isJoined = idx < lobby.currentPlayers;
                            const isHost = idx === 0;

                            return (
                              <div
                                key={idx}
                                onClick={() => !isJoined && handleJoinClick(lobby)}
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all select-none border",
                                  isJoined
                                    ? isHost
                                      ? "bg-[#6DFF3B] border-[#6DFF3B] text-black shadow-sm"
                                      : "bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/10 text-slate-800 dark:text-white"
                                    : "border-dashed border-slate-300 dark:border-white/20 text-slate-400 dark:text-white/30 bg-transparent hover:border-[#6DFF3B] hover:text-[#6DFF3B] cursor-pointer hover:scale-110 active:scale-95"
                                )}
                                title={isJoined ? (isHost ? "Lobby Host" : "Player Joined") : "Empty Slot - Tap to join!"}
                              >
                                {isJoined ? (isHost ? "👑" : idx + 1) : "+"}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Join CTA */}
                      <div className="pt-2">
                        {joinedLobbies.includes(lobby.id) ? (
                          <div 
                            className="w-full h-12 bg-[#6DFF3B] text-black rounded-xl font-black flex items-center justify-center gap-1.5 cursor-not-allowed uppercase tracking-wider text-xs"
                          >
                            <Check className="h-4.5 w-4.5 text-black stroke-[3]" />
                            Joined - Ready to Play ✓
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleJoinClick(lobby)}
                            className="w-full h-12 bg-[#6DFF3B] text-black hover:bg-[#86ff60] rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:shadow-[#6DFF3B]/20 uppercase tracking-wider text-xs hover:scale-[1.02] active:scale-[0.98]"
                          >
                            Join & Pay ₹{splitPrice}
                          </Button>
                        )}
                      </div>

                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Payment Gateway Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={(open) => {
        if (paymentStep !== "processing") {
          setIsPaymentModalOpen(open);
          if (!open) setPaymentStep("select");
        }
      }}>
        <DialogContent className="sm:max-w-md rounded-[32px] border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101216] text-slate-900 dark:text-white shadow-2xl p-6">
          {paymentStep === "select" && (
            <form onSubmit={processPayment}>
              <DialogHeader className="mb-4">
                <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Lock className="h-5 w-5 text-[#6DFF3B]" />
                  Secure Checkout
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-white/60">
                  Select payment method and enter details to join <span className="text-slate-900 dark:text-white font-medium">{selectedLobby?.teamName}</span>.
                </DialogDescription>
              </DialogHeader>

              {/* Team/Lobby Details Card */}
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05] rounded-2xl p-4.5 mb-4 text-left space-y-3 relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#6DFF3B] bg-[#6DFF3B]/10 border border-[#6DFF3B]/20 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                      {selectedLobby?.sport} • {selectedLobby?.skillLevel || "All Levels"}
                    </span>
                    <h4 className="text-base font-black text-slate-800 dark:text-white leading-tight">
                      {selectedLobby?.teamName}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">Total Court Fee</span>
                    <span className="text-sm font-extrabold text-slate-700 dark:text-white/80">₹{selectedLobby?.priceTotal}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/50 dark:border-white/[0.05] text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Schedule Time</span>
                    <span className="font-bold text-slate-700 dark:text-white/90">{selectedLobby?.time}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Lobby Host</span>
                    <span className="font-bold text-slate-700 dark:text-white/90">{selectedLobby?.host?.name} ({selectedLobby?.host?.rating} ★)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/50 dark:border-white/[0.05] text-xs flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Squad Capacity</span>
                    <span className="font-bold text-slate-700 dark:text-white/90">{selectedLobby?.currentPlayers} / {selectedLobby?.maxPlayers} Joined</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#6DFF3B] font-bold">
                      {selectedLobby ? (selectedLobby.maxPlayers - selectedLobby.currentPlayers) : 0} Slots Left
                    </span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200/50 dark:border-white/[0.05] text-xs">
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold mb-1.5">Joined Players</span>
                  <div className="flex flex-wrap gap-2">
                    {getJoinedPlayersList(selectedLobby).map((player, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.05] px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-800 dark:text-white/90"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? "bg-[#6DFF3B]" : "bg-sky-400"}`} />
                        {player} {idx === 0 && <span className="text-[9px] text-muted-foreground font-bold">(Host)</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05] rounded-2xl p-4 mb-4 flex justify-between items-center shadow-inner">
                <span className="text-sm text-slate-600 dark:text-white/60 font-semibold">Your Split Share</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">₹{amountToPay}</span>
              </div>

              {/* Payment Method Tabs */}
              <div className="grid gap-4 py-2">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-3">
                  <Label
                    className={cn(
                      "flex flex-col items-center justify-between rounded-xl border-2 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all",
                      paymentMethod === "upi" ? "border-[#6DFF3B] bg-[#6DFF3B]/10" : "border-slate-200 dark:border-white/[0.08]"
                    )}
                  >
                    <RadioGroupItem value="upi" className="sr-only" />
                    <Smartphone className={cn("h-6 w-6 mb-2", paymentMethod === "upi" ? "text-[#6DFF3B]" : "text-slate-400 dark:text-white/40")} />
                    <span className="text-xs font-semibold">UPI Payment</span>
                  </Label>
                  <Label
                    className={cn(
                      "flex flex-col items-center justify-between rounded-xl border-2 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all",
                      paymentMethod === "card" ? "border-[#6DFF3B] bg-[#6DFF3B]/10" : "border-slate-200 dark:border-white/[0.08]"
                    )}
                  >
                    <RadioGroupItem value="card" className="sr-only" />
                    <Wallet className={cn("h-6 w-6 mb-2", paymentMethod === "card" ? "text-[#6DFF3B]" : "text-slate-400 dark:text-white/40")} />
                    <span className="text-xs font-semibold">Credit/Debit Card</span>
                  </Label>
                </RadioGroup>
              </div>

              {/* Form Input fields depending on method */}
              <div className="space-y-3.5 mt-4">
                {paymentMethod === "upi" ? (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-white/70">UPI ID</Label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. rohan@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] px-3.5 text-sm outline-none focus:border-[#6DFF3B]"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600 dark:text-white/70">Cardholder Name</Label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rohan Das"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] px-3.5 text-sm outline-none focus:border-[#6DFF3B]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600 dark:text-white/70">Card Number</Label>
                      <input
                        type="text"
                        required
                        placeholder="4532 •••• •••• ••••"
                        maxLength="19"
                        value={cardNo}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                          setCardNo(val);
                        }}
                        className="h-11 w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] px-3.5 text-sm outline-none focus:border-[#6DFF3B] font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-white/70">Expiry Date</Label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          maxLength="5"
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length >= 2) {
                              val = val.substring(0, 2) + '/' + val.substring(2, 4);
                            }
                            setCardExpiry(val);
                          }}
                          className="h-11 w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] px-3.5 text-sm outline-none focus:border-[#6DFF3B] font-mono text-center"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-white/70">CVV</Label>
                        <input
                          type="password"
                          required
                          placeholder="•••"
                          maxLength="3"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                          className="h-11 w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] px-3.5 text-sm outline-none focus:border-[#6DFF3B] font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)} className="rounded-xl h-12 text-slate-900 dark:text-white border-slate-200 dark:border-white/10 shrink-0">Cancel</Button>
                <Button type="submit" className="rounded-xl h-12 bg-slate-900 text-white dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-gray-200 font-bold flex-1 uppercase tracking-wider text-xs">
                  Pay ₹{amountToPay}
                </Button>
              </DialogFooter>
            </form>
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
              <div className="h-16 w-16 rounded-full bg-[#6DFF3B]/20 flex items-center justify-center mb-2 animate-bounce">
                <Check className="h-8 w-8 text-[#6DFF3B]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Successful!</h3>
              <p className="text-sm text-slate-500 dark:text-white/60 text-center max-w-xs leading-relaxed">
                Your split share of <span className="font-bold text-slate-800 dark:text-white">₹{amountToPay}</span> has been processed. You are now officially in the squad!
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
