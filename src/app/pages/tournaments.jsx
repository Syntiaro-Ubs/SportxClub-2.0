import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../providers/auth-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  Trophy,
  Calendar,
  Users,
  MapPin,
  Clock,
  Search,
  Plus,
  Medal,
  ChevronRight,
  Loader2,
  ShieldCheck,
  Building2,
  Edit2,
  Trash2,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { EmptyState } from "../components/ui/empty-state";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { adminApi } from "../services/admin-api";
import { openMapLocation } from "../utils/location";

const defaultFixtures = [
  {
    id: 1,
    team1: "Mumbai Warriors",
    team2: "Delhi Strikers",
    match_date: "Jun 18, 2026",
    time: "6:00 PM",
    venue: "Elite Sports Arena",
    status: "Upcoming",
  },
  {
    id: 2,
    team1: "Chennai Champions",
    team2: "Kolkata Knights",
    match_date: "Jun 19, 2026",
    time: "7:00 PM",
    venue: "Champions Complex",
    status: "Upcoming",
  },
];

export function Tournaments() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [tournamentsList, setTournamentsList] = useState([]);
  const [turfsList, setTurfsList] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [fixturesList, setFixturesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState("all");

  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);

  // Join Tournament Modal State
  const [selectedTournamentForJoin, setSelectedTournamentForJoin] = useState(null);
  const [joinForm, setJoinForm] = useState({
    teamName: "",
    captainName: "",
    membersCount: "11",
  });
  const [isJoining, setIsJoining] = useState(false);

  // Form state for creating/editing a tournament
  const [newTournament, setNewTournament] = useState({
    name: "",
    sport: "Cricket",
    teams: "16",
    startDate: "",
    prize: "₹50,000",
    location: "Mumbai",
    turfId: "",
    turfName: "",
    imageUrl: "",
    organizerTeamName: "",
    organizerCaptainName: "",
  });

  const fetchTournaments = async () => {
    try {
      setIsLoading(true);
      const [tData, turfsData, teamsData, fixData] = await Promise.all([
        adminApi.getAll("tournaments").catch(() => []),
        adminApi.getAll("turfs").catch(() => []),
        adminApi.getAll("tournament-teams").catch(() => []),
        adminApi.getAll("tournament-fixtures").catch(() => []),
      ]);
      setTournamentsList(tData || []);
      setTurfsList(turfsData || []);
      setAllTeams(teamsData || []);
      setFixturesList(fixData && fixData.length > 0 ? fixData : defaultFixtures);
    } catch (err) {
      console.error("Failed to fetch tournaments from MySQL:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  // Counts ONLY Approved teams officially enrolled in the tournament roster
  const getJoinedTeamsCount = (tournament) => {
    if (!tournament) return 0;
    const tName = (tournament.name || tournament.title || "").toLowerCase();
    const tId = String(tournament.id);

    return allTeams.filter((t) => {
      const matchesIdOrName = (t.tournament_id && String(t.tournament_id) === tId) ||
        (t.tournament_name && t.tournament_name.toLowerCase() === tName);
      const isApproved = !t.status || t.status.toLowerCase() === "approved";
      return matchesIdOrName && isApproved;
    }).length;
  };

  const isMyTournament = (t) => {
    const activeUser = currentUser || JSON.parse(localStorage.getItem("playerUser") || localStorage.getItem("turfOwnerUser") || "{}");
    const userEmail = (activeUser.email || "").toLowerCase();
    const userName = (activeUser.fullName || activeUser.name || "").toLowerCase();
    const orgEmail = (t.organizer_email || "").toLowerCase();
    const orgName = (t.organizer_name || "").toLowerCase();

    if (!userEmail && !userName) return false;
    return Boolean(
      (userEmail && orgEmail && userEmail === orgEmail) ||
      (userName && orgName && userName === orgName)
    );
  };

  const handleTurfSelect = (e) => {
    const selectedTurfId = e.target.value;
    if (!selectedTurfId) {
      setNewTournament((prev) => ({
        ...prev,
        turfId: "",
        turfName: "",
      }));
      return;
    }
    const turf = turfsList.find((t) => String(t.id) === String(selectedTurfId));
    if (turf) {
      const locStr = typeof turf.location === "string" ? turf.location : (turf.location?.city || turf.location?.address || "Mumbai");
      setNewTournament((prev) => ({
        ...prev,
        turfId: String(turf.id),
        turfName: turf.name,
        location: locStr,
        sport: turf.sport_type || turf.sportType || prev.sport,
        imageUrl: turf.image_url || turf.image || prev.imageUrl,
      }));
    }
  };

  const handleEditClick = (t) => {
    setEditingTournament(t);
    setNewTournament({
      name: t.name || t.title || "",
      sport: t.sport || "Cricket",
      teams: String(t.teams || 16),
      startDate: t.start_date || t.startDate || "",
      prize: t.prize || "₹50,000",
      location: t.location || "Mumbai",
      turfId: String(t.turf_id || ""),
      turfName: t.turf_name || "",
      imageUrl: t.image_url || "",
      organizerTeamName: "",
      organizerCaptainName: "",
    });
    setIsOrganizeModalOpen(true);
  };

  const handleDeleteTournament = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete tournament "${name}"?`)) return;
    try {
      await adminApi.delete("tournaments", id);
      toast.success(`Tournament "${name}" deleted from database`);
      fetchTournaments();
    } catch (err) {
      toast.error("Failed to delete tournament");
    }
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    if (!newTournament.name || !newTournament.startDate) {
      toast.error("Please fill in tournament name and start date");
      return;
    }
    try {
      const activeUser = currentUser || JSON.parse(localStorage.getItem("playerUser") || localStorage.getItem("turfOwnerUser") || "{}");
      const payload = {
        name: newTournament.name,
        sport: newTournament.sport,
        turf_name: newTournament.turfName || "",
        turf_id: newTournament.turfId ? parseInt(newTournament.turfId) : null,
        status: "Registration Open",
        teams: parseInt(newTournament.teams) || 16,
        matches: Math.floor((parseInt(newTournament.teams) || 16) * 1.5),
        start_date: newTournament.startDate,
        prize: newTournament.prize || "₹50,000",
        location: newTournament.location || "Mumbai",
        organizer_name: activeUser.fullName || activeUser.name || "Organizer",
        organizer_email: activeUser.email || "",
        image_url: newTournament.imageUrl || "",
      };

      let createdRes;
      if (editingTournament) {
        await adminApi.update("tournaments", editingTournament.id, payload);
        toast.success(`Tournament "${payload.name}" updated successfully!`);
      } else {
        createdRes = await adminApi.create("tournaments", payload);
        toast.success(`Tournament "${payload.name}" published successfully!`);
      }

      const createdId = createdRes?.id || (editingTournament ? editingTournament.id : null);
      if (newTournament.organizerTeamName && createdId) {
        await adminApi.create("tournament-teams", {
          tournament_id: createdId,
          tournament_name: payload.name,
          team_name: newTournament.organizerTeamName,
          captain_name: newTournament.organizerCaptainName || activeUser.fullName || activeUser.name || "Captain",
          captain_email: activeUser.email || "",
          members_count: 11,
          sport: payload.sport,
          organizer_email: activeUser.email || "",
          status: "Approved",
        });
        toast.success(`Your team "${newTournament.organizerTeamName}" registered!`);
      }

      setIsOrganizeModalOpen(false);
      setEditingTournament(null);
      setNewTournament({ name: "", sport: "Cricket", teams: "16", startDate: "", prize: "₹50,000", location: "Mumbai", turfId: "", turfName: "", imageUrl: "", organizerTeamName: "", organizerCaptainName: "" });
      fetchTournaments();
    } catch (err) {
      toast.error(err.message || "Failed to save tournament");
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!joinForm.teamName || !joinForm.captainName) {
      toast.error("Please provide Team Name and Captain Name");
      return;
    }
    try {
      setIsJoining(true);
      const activeUser = currentUser || JSON.parse(localStorage.getItem("playerUser") || "{}");
      const payload = {
        tournament_id: selectedTournamentForJoin.id,
        tournament_name: selectedTournamentForJoin.name || selectedTournamentForJoin.title,
        team_name: joinForm.teamName,
        captain_name: joinForm.captainName,
        captain_email: activeUser.email || "",
        members_count: parseInt(joinForm.membersCount) || 11,
        sport: selectedTournamentForJoin.sport || "Cricket",
        organizer_email: selectedTournamentForJoin.organizer_email || "",
        status: "Pending", // Sent to tournament organizer for approval!
      };

      await adminApi.create("tournament-teams", payload);
      toast.success(`Registration request submitted for "${joinForm.teamName}"! Sent to tournament organizer for approval.`);
      setSelectedTournamentForJoin(null);
      setJoinForm({ teamName: "", captainName: "", membersCount: "11" });
      fetchTournaments();
    } catch (err) {
      toast.error(err.message || "Failed to submit team registration");
    } finally {
      setIsJoining(false);
    }
  };

  // Metrics computation from real database
  const activeNow = useMemo(() => {
    return tournamentsList.filter(t => (t.status || "").toLowerCase().includes("active") || (t.status || "").toLowerCase().includes("registration")).length;
  }, [tournamentsList]);

  const upcomingCount = useMemo(() => {
    return tournamentsList.filter(t => (t.status || "").toLowerCase().includes("upcoming")).length;
  }, [tournamentsList]);

  const totalPrize = useMemo(() => {
    if (tournamentsList.length === 0) return "₹0";
    let sum = 0;
    tournamentsList.forEach(t => {
      const pStr = t.prize || t.prize_pool || "0";
      const num = parseInt(pStr.replace(/[^0-9]/g, "")) || 0;
      sum += num;
    });
    if (sum >= 100000) return `₹${(sum / 100000).toFixed(1)}L`;
    if (sum >= 1000) return `₹${(sum / 1000).toFixed(0)}K`;
    return `₹${sum}`;
  }, [tournamentsList]);

  const totalPlayers = useMemo(() => {
    const totalTeams = tournamentsList.reduce((acc, t) => acc + (Number(t.teams) || 16), 0);
    const count = totalTeams * 11;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return String(count);
  }, [tournamentsList]);

  // Filtered Public Tournaments (All users)
  const filteredTournaments = useMemo(() => {
    return tournamentsList.filter((t) => {
      const nameMatch = (t.name || t.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.sport || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.turf_name || "").toLowerCase().includes(searchQuery.toLowerCase());

      const statusStr = (t.status || "").toLowerCase();
      let tabMatch = true;
      if (statusTab === "ongoing") {
        tabMatch = statusStr.includes("active") || statusStr.includes("ongoing") || statusStr.includes("registration");
      } else if (statusTab === "upcoming") {
        tabMatch = statusStr.includes("upcoming");
      }

      return nameMatch && tabMatch;
    });
  }, [tournamentsList, searchQuery, statusTab]);

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Leagues & Tournaments
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm sm:text-base">
            Compete with the best and win exciting prizes
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* My Tournaments Page Navigation Button */}
          <Link to="/my-tournaments">
            <Button
              variant="outline"
              className="h-9 rounded-xl font-bold text-xs gap-1.5 transition-all border-slate-300 dark:border-slate-700 hover:bg-emerald-500/10 hover:border-emerald-500 text-foreground cursor-pointer"
            >
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              My Tournaments
            </Button>
          </Link>

          {/* Organize Tournament Modal */}
          <Dialog open={isOrganizeModalOpen} onOpenChange={(open) => {
            setIsOrganizeModalOpen(open);
            if (!open) setEditingTournament(null);
          }}>
            <DialogTrigger asChild>
              <Button size="default" className="shadow-md shadow-primary/20 h-9 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 cursor-pointer">
                <Plus className="h-3.5 w-3.5" />
                Organize Tournament
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border border-border/40 p-6 shadow-2xl">
              <DialogHeader className="space-y-1 pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-extrabold text-foreground">
                      {editingTournament ? "Edit Tournament Details" : "Organize Tournament"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      {editingTournament ? "Update your tournament parameters in MySQL database" : "Publish your tournament directly to the SportXClub network"}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <form onSubmit={handleCreateTournament} className="space-y-4 pt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">Tournament Title</Label>
                  <Input
                    required
                    value={newTournament.name}
                    onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
                    placeholder="e.g. Summer Futsal Cup 2026"
                    className="rounded-xl h-10 text-xs bg-muted/30"
                  />
                </div>

                {/* Select Turf / Venue Input */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-emerald-500" />
                    Select Nearby Turf / Venue
                  </Label>
                  <select
                    value={newTournament.turfId}
                    onChange={handleTurfSelect}
                    className="w-full h-10 rounded-xl bg-background border border-border px-3 text-xs font-medium text-foreground focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Choose Turf Arena (Optional) --</option>
                    {turfsList.map((turf) => {
                      const locStr = typeof turf.location === "string" ? turf.location : (turf.location?.city || turf.location?.address || "");
                      return (
                        <option key={turf.id} value={turf.id}>
                          📍 {turf.name} {locStr ? `(${locStr})` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Sport Type</Label>
                    <select
                      value={newTournament.sport}
                      onChange={(e) => setNewTournament({ ...newTournament, sport: e.target.value })}
                      className="w-full h-10 rounded-xl bg-background border border-border px-3 text-xs font-medium"
                    >
                      <option value="Cricket">Cricket</option>
                      <option value="Football">Football</option>
                      <option value="Basketball">Basketball</option>
                      <option value="Tennis">Tennis</option>
                      <option value="Badminton">Badminton</option>
                      <option value="Swimming">Swimming</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Location</Label>
                    <Input
                      value={newTournament.location}
                      onChange={(e) => setNewTournament({ ...newTournament, location: e.target.value })}
                      placeholder="e.g. Mumbai"
                      className="rounded-xl h-10 text-xs bg-muted/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Total Teams</Label>
                    <Input
                      type="number"
                      value={newTournament.teams}
                      onChange={(e) => setNewTournament({ ...newTournament, teams: e.target.value })}
                      placeholder="16"
                      className="rounded-xl h-10 text-xs bg-muted/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Prize Pool</Label>
                    <Input
                      value={newTournament.prize}
                      onChange={(e) => setNewTournament({ ...newTournament, prize: e.target.value })}
                      placeholder="₹50,000"
                      className="rounded-xl h-10 text-xs bg-muted/30"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">Start Date</Label>
                  <Input
                    type="text"
                    required
                    value={newTournament.startDate}
                    onChange={(e) => setNewTournament({ ...newTournament, startDate: e.target.value })}
                    placeholder="Jun 20, 2026"
                    className="rounded-xl h-10 text-xs bg-muted/30"
                  />
                </div>

                {/* Optional Add Own Team Section */}
                {!editingTournament && (
                  <div className="pt-2 border-t border-border/40 space-y-3">
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                      <UserPlus className="h-3.5 w-3.5" /> Add Your Own Team (Optional)
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold text-muted-foreground">Your Team Name</Label>
                        <Input
                          value={newTournament.organizerTeamName}
                          onChange={(e) => setNewTournament({ ...newTournament, organizerTeamName: e.target.value })}
                          placeholder="e.g. Host Warriors"
                          className="rounded-xl h-9 text-xs bg-muted/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold text-muted-foreground">Captain Name</Label>
                        <Input
                          value={newTournament.organizerCaptainName}
                          onChange={(e) => setNewTournament({ ...newTournament, organizerCaptainName: e.target.value })}
                          placeholder="Captain Name"
                          className="rounded-xl h-9 text-xs bg-muted/20"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter className="pt-3 border-t border-border/40 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOrganizeModalOpen(false)}
                    className="rounded-xl h-10 text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 shadow-lg shadow-emerald-600/20"
                  >
                    {editingTournament ? "Update Tournament" : "Publish Tournament"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Join Team Modal */}
      <Dialog open={Boolean(selectedTournamentForJoin)} onOpenChange={(open) => { if (!open) setSelectedTournamentForJoin(null); }}>
        <DialogContent className="sm:max-w-[440px] rounded-3xl border border-border/40 p-6 shadow-2xl">
          <DialogHeader className="space-y-1 pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-extrabold text-foreground">
                  Register Team for Tournament
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Submit team application to {selectedTournamentForJoin?.name || selectedTournamentForJoin?.title}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleJoinSubmit} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Team Name</Label>
              <Input
                required
                value={joinForm.teamName}
                onChange={(e) => setJoinForm({ ...joinForm, teamName: e.target.value })}
                placeholder="e.g. Mumbai Strikers"
                className="rounded-xl h-10 text-xs bg-muted/30"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Captain Full Name</Label>
              <Input
                required
                value={joinForm.captainName}
                onChange={(e) => setJoinForm({ ...joinForm, captainName: e.target.value })}
                placeholder="e.g. Rohit Sharma"
                className="rounded-xl h-10 text-xs bg-muted/30"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Roster Size (Players Count)</Label>
              <Input
                type="number"
                required
                value={joinForm.membersCount}
                onChange={(e) => setJoinForm({ ...joinForm, membersCount: e.target.value })}
                placeholder="11"
                className="rounded-xl h-10 text-xs bg-muted/30"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border/40 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedTournamentForJoin(null)}
                className="rounded-xl h-10 text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isJoining}
                className="rounded-xl h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 shadow-lg shadow-emerald-600/20"
              >
                {isJoining ? "Submitting..." : "Submit Registration Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dynamic Metric Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: "Active Now",
            value: activeNow,
            icon: Trophy,
            color: "text-emerald-600",
          },
          {
            label: "Total Prize",
            value: totalPrize,
            icon: Medal,
            color: "text-emerald-600",
          },
          {
            label: "Total Players",
            value: totalPlayers,
            icon: Users,
            color: "text-emerald-600",
          },
          {
            label: "Upcoming",
            value: upcomingCount,
            icon: Calendar,
            color: "text-emerald-600",
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="border-slate-300 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/60 shadow-2xs hover:border-emerald-500/50 transition-all">
                <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest mb-0.5">
                      {stat.label}
                    </p>
                    <p className="text-lg sm:text-xl font-black">{stat.value}</p>
                  </div>
                  <div
                    className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center ${stat.color}`}
                  >
                    <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tournaments or venues..."
                className="pl-10 h-10 text-xs border-border/60 bg-card/50 rounded-xl"
              />
            </div>
            <Tabs value={statusTab} onValueChange={setStatusTab} className="w-full sm:w-auto">
              <TabsList className="h-10 bg-muted/50 p-1 border border-border/40 rounded-xl">
                <TabsTrigger value="all" className="px-4 text-xs">
                  All
                </TabsTrigger>
                <TabsTrigger value="ongoing" className="px-4 text-xs">
                  Ongoing
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="px-4 text-xs">
                  Upcoming
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-3.5 sm:gap-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
            ) : filteredTournaments.length > 0 ? (
              filteredTournaments.map((tournament, index) => {
                const mine = isMyTournament(tournament);
                const locationStr = tournament.turf_name ? `${tournament.turf_name}, ${tournament.location}` : (typeof tournament.location === 'object' ? (tournament.location?.city || tournament.location?.address || 'Mumbai') : (tournament.location || 'Mumbai'));

                const joinedCount = getJoinedTeamsCount(tournament);
                const maxTeams = Number(tournament.teams) || 16;
                const isFull = joinedCount >= maxTeams;

                return (
                  <motion.div
                    key={tournament.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="group overflow-hidden border-border/40 hover:border-emerald-500/40 transition-all shadow-sm hover:shadow-xl bg-card relative">
                      <div className="flex flex-col sm:flex-row h-auto sm:h-52">
                        <div className="relative w-full sm:w-64 h-44 sm:h-full overflow-hidden shrink-0">
                          <ImageWithFallback
                            src={tournament.image_url || tournament.image || "https://images.unsplash.com/photo-1594470117722-de4b9a02ebed?w=1080"}
                            alt={tournament.name || tournament.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />

                          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                            {isFull ? (
                              <span className="inline-flex items-center justify-center bg-rose-600/90 text-white font-extrabold text-xs rounded-lg px-2.5 py-1 tracking-wide shadow-md backdrop-blur-md">
                                Tournament Full ({joinedCount}/{maxTeams})
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center bg-black/60 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs rounded-lg px-2.5 py-1 tracking-wide shadow-md backdrop-blur-md">
                                {tournament.status || "Registration Open"}
                              </span>
                            )}
                            {mine && (
                              <Badge className="bg-amber-500 text-white font-extrabold text-[10px] rounded-lg px-2 py-0.5 shadow-md">
                                Organized by You
                              </Badge>
                            )}
                          </div>
                        </div>
                        <CardContent className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <h3 className="text-xl font-bold group-hover:text-emerald-600 transition-colors leading-tight">
                                {tournament.name || tournament.title}
                              </h3>
                              {(tournament.prize || tournament.prize_pool) && (
                                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg shrink-0">
                                  <Medal className="h-4 w-4 text-amber-500" />
                                  <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                                    {tournament.prize || tournament.prize_pool}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-amber-500" />
                                {tournament.start_date || tournament.startDate || "Jun 20, 2026"}
                              </span>
                              <span className={`flex items-center gap-1.5 font-bold ${isFull ? 'text-rose-600' : 'text-blue-600 dark:text-blue-400'}`}>
                                <Users className="h-3.5 w-3.5" />
                                {joinedCount}/{maxTeams} Teams
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openMapLocation(locationStr);
                                }}
                                title="Click to open location in Google Maps / Apple Maps"
                                className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline hover:text-emerald-700 cursor-pointer group/loc border-0 bg-transparent p-0"
                              >
                                <MapPin className="h-3.5 w-3.5 text-emerald-500 group-hover/loc:scale-110 transition-transform" />
                                {locationStr}
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold">
                              {tournament.sport || "Cricket"}
                            </Badge>

                            <div className="flex items-center gap-2">
                              <Button
                                disabled={isFull}
                                onClick={() => setSelectedTournamentForJoin(tournament)}
                                className={`px-5 gap-1.5 group/btn font-bold text-xs rounded-xl h-8 transition-all ${
                                  isFull
                                    ? "bg-slate-400 dark:bg-slate-700 text-white cursor-not-allowed opacity-80 shadow-none"
                                    : "shadow-md shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                }`}
                              >
                                {isFull ? "Tournament Full" : "Join Now"}
                                {!isFull && <ChevronRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <EmptyState
                icon={Trophy}
                title="No tournaments found"
                description="We couldn't find any tournaments matching your search. Create one using Organize Tournament above!"
                actionText="Reset Filters"
                onAction={() => {
                  setSearchQuery("");
                  setStatusTab("all");
                }}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Match Day</h2>
            <Badge
              variant="outline"
              className="text-red-600 bg-red-50 border-red-200 uppercase text-[10px] font-bold"
            >
              Today
            </Badge>
          </div>

          <Card className="border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" />
                Next Fixtures
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {fixturesList.length > 0 ? (
                fixturesList.map((fixture) => (
                  <div
                    key={fixture.id}
                    className="p-4 rounded-xl border border-border/20 bg-muted/20 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-center flex-1">
                        <p className="text-sm font-bold leading-tight h-8 flex items-center justify-center">
                          {fixture.team1}
                        </p>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded text-[10px] font-extrabold text-emerald-600">
                        VS
                      </div>
                      <div className="text-center flex-1">
                        <p className="text-sm font-bold leading-tight h-8 flex items-center justify-center">
                          {fixture.team2}
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border/30 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {fixture.time}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openMapLocation(fixture.venue);
                        }}
                        className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-emerald-600 hover:underline cursor-pointer border-0 bg-transparent p-0"
                      >
                        <MapPin className="h-3 w-3 text-emerald-500" />
                        {fixture.venue}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground text-sm">
                  No matches today
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
