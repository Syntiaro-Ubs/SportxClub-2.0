import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Trophy,
  Users,
  Calendar,
  Plus,
  Check,
  X,
  Edit2,
  Play,
  Shield,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  Award,
  Trash2,
  Loader2,
  Building2,
  ArrowLeft,
  Medal,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../providers/auth-provider";
import { adminApi } from "../services/admin-api";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { openMapLocation } from "../utils/location";

const initialFixtures = [
  {
    id: 1,
    team1: "Mumbai Strikers",
    team2: "Delhi Warriors",
    date: "Jun 20, 2026",
    time: "6:00 PM",
    venue: "Main Turf Stadium - Pitch A",
    status: "Scheduled",
  },
  {
    id: 2,
    team1: "Chennai Champions",
    team2: "Kolkata Knights",
    date: "Jun 21, 2026",
    time: "7:30 PM",
    venue: "Night Arena Ground B",
    status: "Scheduled",
  },
];

export function MyTournamentsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("turfOwnerUser") || localStorage.getItem("playerUser") || "{}");
    } catch (e) {
      return {};
    }
  }, []);
  const activeUser = currentUser || storedUser || {};
  const organizerEmail = activeUser.email || "";
  const organizerName = activeUser.fullName || activeUser.name || "";

  const [tournamentsList, setTournamentsList] = useState([]);
  const [turfsList, setTurfsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Team Registrations from MySQL
  const [pendingList, setPendingList] = useState([]);
  const [isPendingLoading, setIsPendingLoading] = useState(true);

  const [fixturesList, setFixturesList] = useState(initialFixtures);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);

  // Add Team Modal State
  const [selectedTournamentForAddTeam, setSelectedTournamentForAddTeam] = useState(null);
  const [addTeamForm, setAddTeamForm] = useState({
    teamName: "",
    captainName: "",
    membersCount: "11",
  });
  const [isAddingTeam, setIsAddingTeam] = useState(false);

  // Form State
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
      const [tData, turfsData] = await Promise.all([
        adminApi.getAll("tournaments", { organizerEmail, organizerName }).catch(() => []),
        adminApi.getAll("turfs").catch(() => []),
      ]);

      // Filter to ensure only tournaments belonging to activeUser are displayed
      const uEmail = (organizerEmail || "").toLowerCase();
      const uName = (organizerName || "").toLowerCase();
      const myOnly = (tData || []).filter((t) => {
        const orgE = (t.organizer_email || "").toLowerCase();
        const orgN = (t.organizer_name || "").toLowerCase();
        return (uEmail && orgE && uEmail === orgE) || (uName && orgN && uName === orgN);
      });

      setTournamentsList(myOnly);
      setTurfsList(turfsData || []);
    } catch (err) {
      console.error("Failed to load tournaments from MySQL:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingTeams = async () => {
    try {
      setIsPendingLoading(true);
      const data = await adminApi.getAll("tournament-teams", { organizerEmail });
      setPendingList(data || []);
    } catch (err) {
      console.error("Failed to load team applications from MySQL:", err);
    } finally {
      setIsPendingLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
    fetchPendingTeams();
  }, [organizerEmail, organizerName]);

  // Counts ONLY Approved teams enrolled in the tournament roster
  const getJoinedTeamsCount = (tournament) => {
    if (!tournament) return 0;
    const tName = (tournament.name || tournament.title || "").toLowerCase();
    const tId = String(tournament.id);

    return pendingList.filter((t) => {
      const matchesIdOrName = (t.tournament_id && String(t.tournament_id) === tId) ||
        (t.tournament_name && t.tournament_name.toLowerCase() === tName);
      const isApproved = !t.status || t.status.toLowerCase() === "approved";
      return matchesIdOrName && isApproved;
    }).length;
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

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    if (!newTournament.name || !newTournament.startDate) {
      toast.error("Please fill in all required fields!");
      return;
    }
    try {
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
        location: newTournament.location || activeUser.city || "Mumbai",
        organizer_name: organizerName || "Organizer",
        organizer_email: organizerEmail || "",
        image_url: newTournament.imageUrl || "",
      };

      let createdRes;
      if (editingTournament) {
        await adminApi.update("tournaments", editingTournament.id, payload);
        toast.success(`Tournament "${payload.name}" updated successfully!`);
      } else {
        createdRes = await adminApi.create("tournaments", payload);
        toast.success(`Tournament "${payload.name}" created successfully!`);
      }

      const createdId = createdRes?.id || (editingTournament ? editingTournament.id : null);
      if (newTournament.organizerTeamName && createdId) {
        await adminApi.create("tournament-teams", {
          tournament_id: createdId,
          tournament_name: payload.name,
          team_name: newTournament.organizerTeamName,
          captain_name: newTournament.organizerCaptainName || organizerName || "Captain",
          captain_email: organizerEmail || "",
          members_count: 11,
          sport: payload.sport,
          organizer_email: organizerEmail || "",
          status: "Approved",
        });
        toast.success(`Your team "${newTournament.organizerTeamName}" registered to tournament!`);
      }

      setIsCreateModalOpen(false);
      setEditingTournament(null);
      setNewTournament({ name: "", sport: "Cricket", teams: "16", startDate: "", prize: "₹50,000", location: "Mumbai", turfId: "", turfName: "", imageUrl: "", organizerTeamName: "", organizerCaptainName: "" });
      await Promise.all([fetchTournaments(), fetchPendingTeams()]);
    } catch (err) {
      toast.error(err.message || "Failed to save tournament");
    }
  };

  const handleAddTeamSubmit = async (e) => {
    e.preventDefault();
    if (!addTeamForm.teamName) {
      toast.error("Please enter team name!");
      return;
    }
    try {
      setIsAddingTeam(true);
      const targetT = selectedTournamentForAddTeam || (tournamentsList.length > 0 ? tournamentsList[0] : null);
      if (!targetT) {
        toast.error("No tournament selected!");
        return;
      }

      const payload = {
        tournament_id: targetT.id,
        tournament_name: targetT.name || targetT.title,
        team_name: addTeamForm.teamName,
        captain_name: addTeamForm.captainName || organizerName || "Captain",
        captain_email: organizerEmail || "",
        members_count: parseInt(addTeamForm.membersCount) || 11,
        sport: targetT.sport || "Cricket",
        organizer_email: organizerEmail || "",
        status: "Approved", // Auto-approved when added by organizer
      };

      await adminApi.create("tournament-teams", payload);
      toast.success(`Team "${addTeamForm.teamName}" added to "${payload.tournament_name}" roster!`);
      setSelectedTournamentForAddTeam(null);
      setAddTeamForm({ teamName: "", captainName: "", membersCount: "11" });
      await Promise.all([fetchTournaments(), fetchPendingTeams()]);
    } catch (err) {
      toast.error(err.message || "Failed to add team");
    } finally {
      setIsAddingTeam(false);
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
    setIsCreateModalOpen(true);
  };

  const handleDeleteTournament = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete tournament "${name}"?`)) return;
    try {
      await adminApi.delete("tournaments", id);
      toast.success(`Tournament "${name}" deleted from database`);
      await Promise.all([fetchTournaments(), fetchPendingTeams()]);
    } catch (err) {
      toast.error("Failed to delete tournament");
    }
  };

  const handleApproveTeam = async (id, name) => {
    try {
      await adminApi.update("tournament-teams", id, { status: "Approved" });
      toast.success(`Team "${name}" approved & added to roster!`);
      await Promise.all([fetchPendingTeams(), fetchTournaments()]);
    } catch (err) {
      toast.error("Failed to approve team registration");
    }
  };

  const handleRejectTeam = async (id, name) => {
    try {
      await adminApi.update("tournament-teams", id, { status: "Rejected" });
      toast.error(`Team "${name}" registration rejected.`);
      await Promise.all([fetchPendingTeams(), fetchTournaments()]);
    } catch (err) {
      toast.error("Failed to reject team registration");
    }
  };

  const activeTournamentsCount = tournamentsList.filter(t => t.status === "Active" || t.status === "Registration Open").length;
  const totalApprovedTeams = pendingList.filter(item => !item.status || item.status.toLowerCase() === "approved").length;
  const matchesCount = tournamentsList.reduce((acc, t) => acc + (Number(t.matches) || 12), 0);
  const pendingApprovalsCount = pendingList.filter(item => item.status === "Pending").length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/tournaments" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline mb-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to All Tournaments
          </Link>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Trophy className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                My Organized Tournaments
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage and edit all tournaments created by your account ({organizerName || organizerEmail || "User"})
              </p>
            </div>
          </div>
        </div>

        {/* Action Header CTA Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {tournamentsList.length > 0 && (
            <Button
              onClick={() => setSelectedTournamentForAddTeam(tournamentsList[0])}
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <UserPlus className="h-4 w-4 stroke-[2.5]" />
              Add Team
            </Button>
          )}

          <Dialog open={isCreateModalOpen} onOpenChange={(openState) => {
            setIsCreateModalOpen(openState);
            if (!openState) setEditingTournament(null);
          }}>
            <DialogTrigger asChild>
              <Button className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2 transition-all">
                <Plus className="h-4 w-4 stroke-[2.5]" />
                {editingTournament ? "Edit Tournament" : "Create New Tournament"}
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
                      {editingTournament ? "Edit Tournament Details" : "Host New Tournament"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      {editingTournament ? "Update your tournament parameters in database" : "Set up your tournament parameters & open team registrations"}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <form onSubmit={handleCreateTournament} className="space-y-4 pt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">Tournament Name</Label>
                  <Input
                    required
                    value={newTournament.name}
                    onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
                    placeholder="e.g. Summer Cricket Premier League 2026"
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
                    <Label className="text-xs font-bold text-foreground">Location / City</Label>
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
                    <Label className="text-xs font-bold text-foreground">Max Teams Roster</Label>
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
                          placeholder={organizerName || "Captain Name"}
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
                    onClick={() => setIsCreateModalOpen(false)}
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

      {/* Add Team Modal */}
      <Dialog open={Boolean(selectedTournamentForAddTeam)} onOpenChange={(open) => { if (!open) setSelectedTournamentForAddTeam(null); }}>
        <DialogContent className="sm:max-w-[440px] rounded-3xl border border-border/40 p-6 shadow-2xl">
          <DialogHeader className="space-y-1 pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <UserPlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-extrabold text-foreground">
                  Add Team to Tournament Roster
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Add team directly to {selectedTournamentForAddTeam?.name || selectedTournamentForAddTeam?.title}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddTeamSubmit} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Team Name</Label>
              <Input
                required
                value={addTeamForm.teamName}
                onChange={(e) => setAddTeamForm({ ...addTeamForm, teamName: e.target.value })}
                placeholder="e.g. Royal Strikers"
                className="rounded-xl h-10 text-xs bg-muted/30"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Captain Name</Label>
              <Input
                value={addTeamForm.captainName}
                onChange={(e) => setAddTeamForm({ ...addTeamForm, captainName: e.target.value })}
                placeholder={organizerName || "Captain Name"}
                className="rounded-xl h-10 text-xs bg-muted/30"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Roster Size (Players Count)</Label>
              <Input
                type="number"
                value={addTeamForm.membersCount}
                onChange={(e) => setAddTeamForm({ ...addTeamForm, membersCount: e.target.value })}
                placeholder="11"
                className="rounded-xl h-10 text-xs bg-muted/30"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border/40 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedTournamentForAddTeam(null)}
                className="rounded-xl h-10 text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAddingTeam}
                className="rounded-xl h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 shadow-lg shadow-emerald-600/20"
              >
                {isAddingTeam ? "Adding..." : "Add Team to Roster"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Top 4 Quick Metric Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            title: "MY ACTIVE TOURNAMENTS",
            value: activeTournamentsCount,
            sub: "Running Live",
            icon: Trophy,
            badge: "Active",
          },
          {
            title: "TOTAL TEAMS REGISTERED",
            value: totalApprovedTeams,
            sub: "Roster Enrolled",
            icon: Users,
            badge: "Live Roster",
          },
          {
            title: "PENDING APPROVALS",
            value: pendingApprovalsCount,
            sub: "Action Required",
            icon: Shield,
            badge: "Pending",
          },
          {
            title: "MATCHES SCHEDULED",
            value: matchesCount,
            sub: "Fixtures Created",
            icon: Play,
            badge: "Fixtures",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 shadow-2xs backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
                    {stat.title}
                  </span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-black tracking-tight text-foreground mt-1">
                  {stat.value}
                </div>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                  {stat.sub}
                </p>
              </div>

              <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                <Sparkles className="h-3 w-3" /> {stat.badge}
              </div>
            </Card>
          );
        })}
      </div>

      {/* My Tournaments Leaderboard/Overview Section */}
      <Card className="border-0 bg-transparent shadow-none">
        <div className="flex items-center justify-between pb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Trophy className="h-4.5 w-4.5 text-amber-500" />
              Tournaments Created by You ({tournamentsList.length})
            </h2>
            <p className="text-xs text-muted-foreground hidden sm:block">Edit parameters or manage registrations for your published tournaments</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : tournamentsList.length === 0 ? (
          <div className="p-8 text-center bg-card/40 border border-border/40 rounded-2xl">
            <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-bold text-foreground">You Haven't Created Any Tournaments Yet</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Click "Create New Tournament" above to host and publish your first tournament!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tournamentsList.map((tournament) => {
              const locationStr = tournament.turf_name ? `${tournament.turf_name}, ${tournament.location}` : (tournament.location || "Mumbai");
              const joinedCount = getJoinedTeamsCount(tournament);
              const maxTeams = Number(tournament.teams) || 16;
              const isFull = joinedCount >= maxTeams;

              return (
                <Card key={tournament.id} className="group overflow-hidden border-border/40 hover:border-amber-500/40 transition-all shadow-sm hover:shadow-xl bg-card relative">
                  <div className="flex flex-col sm:flex-row h-auto sm:h-52">
                    {/* Tournament Image */}
                    <div className="relative w-full sm:w-64 h-44 sm:h-full overflow-hidden shrink-0">
                      <ImageWithFallback
                        src={tournament.image_url || tournament.image || "https://images.unsplash.com/photo-1594470117722-de4b9a02ebed?w=1080"}
                        alt={tournament.name || tournament.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                        {isFull ? (
                          <span className="inline-flex items-center justify-center bg-rose-600/90 text-white font-extrabold text-xs rounded-lg px-2.5 py-1 tracking-wide shadow-md backdrop-blur-md">
                            Roster Full ({joinedCount}/{maxTeams})
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center bg-black/60 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs rounded-lg px-2.5 py-1 tracking-wide shadow-md backdrop-blur-md">
                            {tournament.status || "Registration Open"}
                          </span>
                        )}
                        <Badge className="bg-amber-500 text-white font-extrabold text-[10px] rounded-lg px-2 py-0.5 shadow-md">
                          Organized by You
                        </Badge>
                      </div>
                    </div>

                    {/* Tournament Details */}
                    <CardContent className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className="text-xl font-extrabold group-hover:text-amber-500 transition-colors leading-tight text-foreground">
                            {tournament.name || tournament.title}
                          </h3>
                          {(tournament.prize || tournament.prize_pool) && (
                            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg shrink-0">
                              <Medal className="h-4 w-4 text-amber-500" />
                              <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                                {tournament.prize || tournament.prize_pool}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-4 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-amber-500" />
                            {tournament.start_date || tournament.startDate || "Jun 20, 2026"}
                          </span>
                          <span className={`flex items-center gap-1.5 font-bold ${isFull ? 'text-rose-600' : 'text-blue-600 dark:text-blue-400'}`}>
                            <Users className="h-3.5 w-3.5" />
                            {joinedCount}/{maxTeams} Teams Roster
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openMapLocation(locationStr);
                            }}
                            title="Click to open location in Google Maps / Apple Maps"
                            className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 hover:underline hover:text-emerald-700 cursor-pointer group/loc border-0 bg-transparent p-0"
                          >
                            <MapPin className="h-3.5 w-3.5 text-emerald-500 group-hover/loc:scale-110 transition-transform" />
                            {locationStr}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/30">
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold">
                          {tournament.sport || "Cricket"}
                        </Badge>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            disabled={isFull}
                            onClick={() => setSelectedTournamentForAddTeam(tournament)}
                            className={`h-8.5 px-3.5 text-xs font-black rounded-xl gap-1.5 transition-all ${
                              isFull
                                ? "bg-slate-400 dark:bg-slate-700 text-white cursor-not-allowed opacity-80 shadow-none"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 cursor-pointer"
                            }`}
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            {isFull ? "Roster Full" : "Add Team"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(tournament)}
                            className="h-8.5 px-3 text-xs font-extrabold rounded-xl border-slate-300 dark:border-slate-700 hover:bg-emerald-500/10 gap-1.5 cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-emerald-600" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTournament(tournament.id, tournament.name || tournament.title)}
                            className="h-8.5 px-3 text-xs font-extrabold rounded-xl border-rose-300 dark:border-rose-800 text-rose-600 hover:bg-rose-500/10 gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Tabs Section for Approvals and Fixtures */}
      <Tabs defaultValue="approvals" className="space-y-4 pt-2">
        <TabsList className="bg-white dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 inline-flex items-center gap-1 max-w-full overflow-x-auto scrollbar-none">
          <TabsTrigger
            value="approvals"
            className="rounded-xl text-xs font-bold px-4 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs transition-all flex items-center gap-1.5"
          >
            <Shield className="h-3.5 w-3.5" />
            Team Approvals & Roster
            {pendingApprovalsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-extrabold">
                {pendingApprovalsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="fixtures"
            className="rounded-xl text-xs font-bold px-4 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs transition-all flex items-center gap-1.5"
          >
            <Calendar className="h-3.5 w-3.5" />
            Match Fixtures
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Enrolled Teams & Player Applications
            </h4>
            {tournamentsList.length > 0 && (
              <Button
                size="sm"
                onClick={() => setSelectedTournamentForAddTeam(tournamentsList[0])}
                className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3 gap-1.5 shadow-xs cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" /> + Add Team
              </Button>
            )}
          </div>

          {isPendingLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            </div>
          ) : pendingList.length === 0 ? (
            <div className="p-8 text-center bg-card/40 border border-border/40 rounded-2xl">
              <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <h3 className="text-sm font-bold text-foreground">No Teams Enrolled Yet</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Teams added by you or registered by players will appear here!
              </p>
              {tournamentsList.length > 0 && (
                <Button
                  onClick={() => setSelectedTournamentForAddTeam(tournamentsList[0])}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-9 px-4"
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add First Team to Roster
                </Button>
              )}
            </div>
          ) : (
            pendingList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-xs sm:text-sm text-foreground">{item.team_name || item.teamName}</h5>
                    <Badge variant="outline" className="text-[9px] rounded-md px-1.5 py-0">
                      {item.sport || "Cricket"}
                    </Badge>
                    <Badge className={`text-[9px] rounded-md px-1.5 py-0 ${
                      item.status === "Approved" ? "bg-emerald-500/20 text-emerald-600" :
                      item.status === "Rejected" ? "bg-rose-500/20 text-rose-600" : "bg-amber-500/20 text-amber-600"
                    }`}>
                      {item.status || "Pending"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Captain: <strong className="text-foreground">{item.captain_name || item.captain || "N/A"}</strong> • {item.members_count || item.members || 11} Enrolled • Tournament: <strong className="text-emerald-600 dark:text-emerald-400">{item.tournament_name || "Tournament"}</strong>
                  </p>
                </div>
                {item.status === "Pending" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleApproveTeam(item.id, item.team_name || item.teamName)}
                      className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl gap-1 px-3"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectTeam(item.id, item.team_name || item.teamName)}
                      className="h-8 text-rose-600 border-rose-300 dark:border-rose-800 hover:bg-rose-500/10 font-bold text-xs rounded-xl px-2.5"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="fixtures" className="space-y-3">
          {fixturesList.map((fix) => (
            <div
              key={fix.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4"
            >
              <div>
                <h5 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
                  <span>{fix.team1}</span>
                  <span className="text-xs text-muted-foreground font-normal">vs</span>
                  <span>{fix.team2}</span>
                </h5>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {fix.date} at {fix.time} • {fix.venue}
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold text-purple-600 border-purple-500/30">
                {fix.status}
              </Badge>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
