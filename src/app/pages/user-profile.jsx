import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Ban,
  Bookmark,
  Calendar,
  Coffee,
  Edit,
  Flame,
  History,
  LogOut,
  MapPin,
  Medal,
  MessageSquare,
  QrCode,
  Share2,
  ShoppingBag,
  Trophy,
  Wallet,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Container } from "../components/ui/container";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { useAuth } from "../providers/auth-provider";
import { profileService } from "../services/profile.service";
import { toast } from "sonner";

const sportsOptions = ["football", "cricket", "badminton", "tennis", "basketball", "swimming", "gym", "volleyball"];

const getInitials = (name) => {
  if (!name) return "?";
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
};

const getHandle = (user) => {
  if (user?.fullName) return `@${user.fullName.toLowerCase().replace(/\s+/g, "")}`;
  if (user?.email) return `@${user.email.split("@")[0]}`;
  return "";
};

const getSportName = (sport) => {
  const normalized = String(sport || "").toLowerCase();
  const known = sportsOptions.find((item) => item === normalized);
  return known ? known[0].toUpperCase() + known.slice(1) : String(sport || "");
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { dateStyle: "medium" });
};

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

function EmptyState({ children }) {
  return <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{children}</p>;
}

export function UserProfile() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [txHistoryOpen, setTxHistoryOpen] = useState(false);
  const [addonsOpen, setAddonsOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setProfile(await profileService.get(currentUser));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const timer = setTimeout(() => refreshProfile(), 0);
    return () => clearTimeout(timer);
  }, [refreshProfile]);

  const user = profile?.user || currentUser;
  const achievements = useMemo(() => {
    if (!user) return [];
    const values = [{ title: `${user.gamesPlayed || 0} Matches`, icon: Trophy }];
    if (user.isTopScorer) values.push({ title: "Top Scorer", icon: Medal });
    if (user.isTeamCaptain) values.push({ title: "Team Captain", icon: Bookmark });
    return values;
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleTopUp = async () => {
    const amount = Number(topUpAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    try {
      setProfile(await profileService.topUp(currentUser, amount));
      setTopUpAmount("");
      setTopUpOpen(false);
      toast.success("Wallet top-up recorded successfully.");
    } catch (requestError) {
      toast.error(requestError.message);
    }
  };

  const handlePurchase = async (productId, successMessage) => {
    try {
      setProfile(await profileService.purchase(currentUser, productId));
      toast.success(successMessage);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setSelectedProductId(null);
    }
  };

  const handleCancelBooking = async () => {
    if (!profile?.activeBooking) return;
    try {
      setProfile(await profileService.cancelBooking(currentUser, profile.activeBooking.id));
      setCancelOpen(false);
      toast.success("Booking cancelled and refund recorded in the database.");
    } catch (requestError) {
      toast.error(requestError.message);
    }
  };

  const handleCopyLink = () => {
    if (!profile?.activeBooking?.booking_code) return;
    navigator.clipboard.writeText(`${window.location.origin}/payment/split/${profile.activeBooking.booking_code}`);
    setCopiedLink(true);
    toast.success("Booking link copied.");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!currentUser) {
    return <Container className="py-16 text-center"><EmptyState>Please sign in to view your player account.</EmptyState></Container>;
  }

  if (loading) {
    return <Container className="py-16 text-center"><EmptyState>Loading your account data...</EmptyState></Container>;
  }

  if (error) {
    return <Container className="py-16 text-center space-y-4"><EmptyState>{error}</EmptyState><Button onClick={refreshProfile}>Retry</Button></Container>;
  }

  const displayName = user?.fullName || "";
  const xp = Number(user?.xp || 0);
  const level = Math.floor(xp / 1000) + 1;
  const xpToNextLevel = Math.max((level * 1000) - xp, 0);
  const matchHistory = profile?.matchHistory || [];
  const products = profile?.shopItems || [];
  const activeBooking = profile?.activeBooking;

  return (
    <Container className="px-0 sm:px-6 py-2 sm:py-6 space-y-6 sm:space-y-8 max-w-4xl w-full">
      <Dialog open={txHistoryOpen} onOpenChange={setTxHistoryOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Wallet className="h-5 w-5 text-emerald-600" /> Wallet Transactions</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            {profile?.transactions?.length ? profile.transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center bg-card p-3.5 border border-border/60 rounded-2xl">
                <div><p className="font-semibold text-xs">{tx.label}</p><p className="text-[10px] text-muted-foreground mt-1">{formatDateTime(tx.createdAt)} · {tx.type}</p></div>
                <div className="text-right"><span className={tx.isCredit ? "text-emerald-500 font-bold" : "font-bold"}>{tx.isCredit ? "+" : "-"}₹{tx.amount}</span><span className="block text-[9px] text-emerald-500 uppercase">{tx.status}</span></div>
              </div>
            )) : <EmptyState>No transactions recorded for this account.</EmptyState>}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
          <DialogHeader><DialogTitle>Top Up Wallet</DialogTitle></DialogHeader>
          <Input type="number" min="1" value={topUpAmount} onChange={(event) => setTopUpAmount(event.target.value)} placeholder="Enter amount" />
          <DialogFooter><Button onClick={handleTopUp}>Record Top Up</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addonsOpen} onOpenChange={setAddonsOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Coffee className="h-5 w-5 text-amber-500" /> Available Add-ons</DialogTitle><DialogDescription>Choose an item from the products stored in the database.</DialogDescription></DialogHeader>
          <div className="space-y-3 py-4">
            {products.length ? products.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3">
                <div className="flex items-center gap-3"><img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover" /><div><p className="text-xs font-semibold">{item.name}</p><p className="text-xs text-emerald-600">₹{item.price}</p></div></div>
                <Button size="sm" disabled={selectedProductId === item.id} onClick={() => handlePurchase(item.id, "Add-on purchase recorded in the database.")}>{selectedProductId === item.id ? "Processing" : "Buy"}</Button>
              </div>
            )) : <EmptyState>No add-ons are currently available.</EmptyState>}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Ban className="h-5 w-5 text-red-500" /> Cancel Booking</DialogTitle><DialogDescription>This changes the booking and wallet records in the database.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setCancelOpen(false)}>Keep Booking</Button><Button variant="destructive" onClick={handleCancelBooking}>Confirm Cancel</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="rounded-none sm:rounded-2xl border-x-0 sm:border-x border-border/50 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start justify-between">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <Avatar className="h-24 w-24 border border-primary/15 bg-background"><AvatarImage src={user?.profilePicture} className="object-cover" /><AvatarFallback className="bg-primary/10 text-2xl text-primary font-black">{getInitials(displayName)}</AvatarFallback></Avatar>
              <div className="space-y-1"><p className="text-xs uppercase tracking-[0.24em] text-primary font-bold">Athlete Profile</p><h1 className="text-2xl font-black text-slate-900 dark:text-white">{displayName}</h1><p className="text-sm text-muted-foreground">{getHandle(user)}</p><div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-muted-foreground text-xs font-semibold"><MapPin className="h-4 w-4 text-primary" />{user?.city || ""}{user?.joinedDate ? ` · Active since ${formatDate(user.joinedDate)}` : ""}</div><div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-1.5">{(user?.selectedSports || []).map((sport) => <Badge key={sport} variant="outline" className="text-[10px] rounded-full">{getSportName(sport)}</Badge>)}</div></div>
            </div>
            <div className="bg-background/50 border border-border/60 rounded-2xl p-4 w-full md:w-80 space-y-3 text-left"><div className="flex justify-between items-center text-xs"><span className="font-semibold flex items-center gap-1.5"><Flame className="h-4 w-4 text-emerald-600" /> LEVEL {level}</span><span className="text-emerald-600 font-mono font-bold">{xp} XP</span></div><Progress value={xp % 1000 / 10} className="h-2 bg-muted" indicatorColor="bg-emerald-600" /><div className="flex justify-between text-[10px] text-muted-foreground"><span>LVL {level}</span><span>{xpToNextLevel ? `${xpToNextLevel} XP to next level` : "Level ready"}</span></div></div>
          </div>
          <div className="mt-6 flex justify-end gap-2 border-t border-border/40 pt-4"><Link to="/edit-profile"><Button size="sm" variant="outline" className="text-xs rounded-xl gap-1"><Edit className="h-3.5 w-3.5" /> Edit Profile</Button></Link><Button size="sm" variant="destructive" className="text-xs rounded-xl gap-1" onClick={handleLogout}><LogOut className="h-3.5 w-3.5" /> Logout</Button></div>
        </CardContent>
      </Card>

      <div className="bg-gradient-to-br from-card to-card/95 border-y sm:border border-border shadow-sm rounded-none sm:rounded-[24px] p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left"><div className="flex items-center gap-4"><div className="bg-emerald-600/10 p-3.5 rounded-2xl border border-emerald-600/20 text-emerald-600"><Wallet className="h-7 w-7" /></div><div><p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">SportX Wallet Balance</p><h2 className="text-3xl font-extrabold">₹{profile?.walletBalance || 0}</h2></div></div><div className="flex flex-col sm:flex-row gap-3"><Button variant="outline" className="rounded-2xl h-12" onClick={() => setTxHistoryOpen(true)}><History className="h-4 w-4 mr-2" /> Transaction History</Button><Button className="rounded-2xl h-12 bg-transparent text-emerald-600 border border-emerald-600 hover:bg-emerald-50" onClick={() => setTopUpOpen(true)}>+ Top Up Wallet</Button></div></div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 px-3 sm:px-0">{achievements.map(({ title, icon: Icon }) => <div key={title} className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card p-4 shadow-sm text-left"><div className="flex h-12 w-12 items-center justify-center"><Icon className="h-6 w-6 text-emerald-600" /></div><p className="font-bold text-sm">{title}</p></div>)}</div>

      <hr className="border-border/60" />

      <div className="space-y-4"><h2 className="text-xl font-black text-left flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Active Match Center</h2>{activeBooking ? <div className="bg-card border border-border shadow-md rounded-[24px] overflow-hidden flex flex-col md:flex-row text-left"><div className="relative w-full md:w-1/3 min-h-[200px] p-3"><div className="relative w-full h-full rounded-2xl overflow-hidden min-h-[180px]"><img src={activeBooking.turf_image} alt={activeBooking.turf_name} className="w-full h-full object-cover absolute inset-0" /><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" /><div className="absolute bottom-4 left-4 right-4 z-10 space-y-1"><Badge className="bg-emerald-600 text-black font-bold text-[9px] rounded-full">{activeBooking.sport || "Sports booking"}</Badge><h3 className="text-base font-black text-white">{activeBooking.turf_name}</h3><p className="text-emerald-400 font-mono font-bold text-xs">{formatDate(activeBooking.date)} · {activeBooking.time_slot || activeBooking.slot_time}</p></div></div></div><div className="w-full md:w-2/3 p-6 flex flex-col justify-between space-y-6"><div className="flex items-center justify-between border-b border-border/40 pb-4"><div className="flex items-center gap-3"><div className="bg-emerald-600/10 p-2.5 rounded-full text-emerald-600"><Trophy className="h-5 w-5" /></div><div><h4 className="font-bold text-sm">{activeBooking.sport || "Sports"} booking</h4><p className="text-xs text-muted-foreground mt-0.5">Booking ID: {activeBooking.booking_code || activeBooking.id}</p></div></div><span className="text-emerald-600 font-black text-xs uppercase">{activeBooking.status}</span></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-4"><div className="rounded-2xl border border-border bg-card p-3 h-32 flex flex-col justify-between"><QrCode className="h-5 w-5 text-emerald-600" /><span className="text-xs font-bold">Entry Pass</span></div><div onClick={() => setAddonsOpen(true)} className="rounded-2xl border border-border bg-card p-3 h-32 flex flex-col justify-between cursor-pointer"><Coffee className="h-5 w-5 text-amber-500" /><span className="text-xs font-bold">Add-ons</span></div><div onClick={handleCopyLink} className="rounded-2xl border border-border bg-card p-3 h-32 flex flex-col justify-between cursor-pointer"><Share2 className="h-5 w-5 text-emerald-500" /><span className="text-xs font-bold">{copiedLink ? "Copied" : "Copy Link"}</span></div><div onClick={() => setCancelOpen(true)} className="rounded-2xl border border-border bg-card p-3 h-32 flex flex-col justify-between cursor-pointer"><Ban className="h-5 w-5 text-red-500" /><span className="text-xs font-bold">Cancel Slot</span></div></div></div></div> : <EmptyState>No active bookings are linked to this account.</EmptyState>}</div>

      <hr className="border-border/60" />

      <div className="space-y-4"><h2 className="text-xl font-black text-left flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-primary" /> Pro Shop Merchandise</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">{products.length ? products.map((item) => <div key={item.id} className="border border-border/80 bg-card rounded-2xl p-4 flex flex-col justify-between space-y-4"><div className="h-32 w-full bg-muted rounded-xl overflow-hidden"><img src={item.image} alt={item.name} className="h-full w-full object-cover" /></div><div><h5 className="font-bold text-sm line-clamp-1">{item.name}</h5><p className="text-base font-extrabold text-emerald-600 mt-1">₹{item.price}</p></div><Button size="sm" className="w-full" disabled={selectedProductId === item.id} onClick={() => { setSelectedProductId(item.id); handlePurchase(item.id, "Purchase recorded in the database."); }}>{selectedProductId === item.id ? "Processing" : "Purchase Item"}</Button></div>) : <div className="sm:col-span-2 lg:col-span-4"><EmptyState>No merchandise is currently available.</EmptyState></div>}</div></div>

      <hr className="border-border/60" />

      <div className="space-y-4"><h2 className="text-xl font-black text-left flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Match Logs & History</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{matchHistory.length ? matchHistory.map((match) => { const isWon = String(match.result || "").toLowerCase() === "won"; return <div key={match.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border bg-card/60 shadow-sm text-left gap-4 ${isWon ? "border-l-4 border-l-emerald-600" : "border-l-4 border-l-rose-500"}`}><div className="flex items-center gap-4"><div className="h-12 w-12 rounded-xl flex items-center justify-center font-bold text-xs bg-primary/10 text-primary border">{String(match.sport || "").substring(0, 2).toUpperCase()}</div><div><div className="flex items-center gap-2 flex-wrap"><h4 className="font-extrabold text-sm">{match.venue}</h4><Badge variant="outline" className="text-[9px]">{match.sport}</Badge></div><div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{formatDate(match.matchDate)}</div></div></div><div className="flex items-center justify-between sm:justify-end gap-6"><div className="text-right"><p className="text-[10px] text-muted-foreground uppercase tracking-widest">Match Score</p><p className="font-mono text-sm font-extrabold">{match.score || "—"}</p></div><Badge className={isWon ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}>{match.result || "Recorded"}</Badge></div></div>; }) : <div className="md:col-span-2"><EmptyState>No match history is stored for this account.</EmptyState></div>}</div></div>

      <hr className="border-border/60" />

      <div className="space-y-4"><h2 className="text-xl font-black text-left flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Teammate Reviews & Ratings</h2><Card className="border-border/50 bg-card"><CardContent className="space-y-4 p-6">{profile?.reviews?.length ? profile.reviews.map((review) => <div key={review.id} className="border-b border-border/50 pb-4 last:border-0 text-left space-y-1.5"><div className="flex items-center justify-between"><p className="font-bold text-sm">{review.reviewer}</p><div className="flex gap-1">{Array.from({ length: Number(review.rating || 0) }).map((_, index) => <Trophy key={index} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div></div><p className="text-xs text-muted-foreground">{review.comment}</p><p className="text-[10px] text-muted-foreground/60">{formatDateTime(review.createdAt)}</p></div>) : <EmptyState>No teammate reviews are stored for this account.</EmptyState>}</CardContent></Card></div>
    </Container>
  );
}
