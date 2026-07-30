import { useState } from "react";
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
  ClipboardList,
  Flame,
  Shield,
  MapPin,
  Clock,
  Sparkles,
  Radio,
  Swords,
  ChevronRight,
  Layers,
  Award,
} from "lucide-react";
import { toast } from "sonner";

const initialTournaments = [
  {
    id: 1,
    name: "Summer Cricket League 2026",
    sport: "Cricket",
    status: "Active",
    teams: 16,
    matches: 24,
    startDate: "Jun 20, 2026",
    prize: "₹50,000",
  },
  {
    id: 2,
    name: "Basketball Championship",
    sport: "Basketball",
    status: "Registration Open",
    teams: 8,
    matches: 12,
    startDate: "Jun 25, 2026",
    prize: "₹25,000",
  },
  {
    id: 3,
    name: "Monsoon Futsal Cup 2026",
    sport: "Football",
    status: "Upcoming",
    teams: 12,
    matches: 18,
    startDate: "Jul 10, 2026",
    prize: "₹35,000",
  },
];

const initialPendingApprovals = [
  {
    id: 1,
    teamName: "Mumbai Strikers",
    captain: "Rohit Sharma",
    members: 11,
    sport: "Cricket",
    submitted: "2 hours ago",
  },
  {
    id: 2,
    teamName: "Delhi Warriors",
    captain: "Virat Kohli",
    members: 11,
    sport: "Cricket",
    submitted: "5 hours ago",
  },
  {
    id: 3,
    teamName: "Bangalore Bullets",
    captain: "KL Rahul",
    members: 8,
    sport: "Basketball",
    submitted: "1 day ago",
  },
];

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

export function TournamentOrganizerDashboard() {
  const [tournamentsList, setTournamentsList] = useState(initialTournaments);
  const [pendingList, setPendingList] = useState(initialPendingApprovals);
  const [fixturesList, setFixturesList] = useState(initialFixtures);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [newTournament, setNewTournament] = useState({
    name: "",
    sport: "Cricket",
    teams: "16",
    startDate: "",
    prize: "₹10,000",
  });

  // Score Live State
  const [liveScores, setLiveScores] = useState({
    team1Score: "156/4",
    team2Score: "142/8",
    status: "12.3 overs • Mumbai Strikers batting",
  });

  const handleCreateTournament = (e) => {
    e.preventDefault();
    if (!newTournament.name || !newTournament.startDate) {
      toast.error("Please fill in all required fields!");
      return;
    }
    const created = {
      id: Date.now(),
      name: newTournament.name,
      sport: newTournament.sport,
      status: "Registration Open",
      teams: parseInt(newTournament.teams) || 12,
      matches: Math.floor(parseInt(newTournament.teams) * 1.5) || 15,
      startDate: newTournament.startDate,
      prize: newTournament.prize,
    };
    setTournamentsList([created, ...tournamentsList]);
    setIsCreateModalOpen(false);
    setNewTournament({ name: "", sport: "Cricket", teams: "16", startDate: "", prize: "₹10,000" });
    toast.success(`Tournament "${created.name}" created successfully!`);
  };

  const handleApproveTeam = (id, name) => {
    setPendingList(pendingList.filter((item) => item.id !== id));
    toast.success(`Team "${name}" approved & added to roster!`);
  };

  const handleRejectTeam = (id, name) => {
    setPendingList(pendingList.filter((item) => item.id !== id));
    toast.error(`Team "${name}" registration rejected.`);
  };

  return (
    <div className="space-y-3.5 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-transparent p-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Trophy className="h-5 w-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Tournament Organizer Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
            Create, schedule fixtures, approve teams and manage live match scores in real-time
          </p>
        </div>

        {/* Create Tournament CTA */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 px-4 rounded-xl bg-transparent border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-extrabold text-xs shadow-none cursor-pointer flex items-center gap-2 transition-all shrink-0">
              <Plus className="h-4 w-4 stroke-[2.5]" />
              Create New Tournament
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[480px] rounded-3xl border border-border/40 p-6 shadow-2xl">
            <DialogHeader className="space-y-1 pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-extrabold text-foreground">
                    Host New Tournament
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Set up tournament details, rules, and team limits
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleCreateTournament} className="space-y-4 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold">Tournament Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Premier Box Cricket Cup 2026"
                  value={newTournament.name}
                  onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
                  className="rounded-xl h-9 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sport" className="text-xs font-bold">Sport Category</Label>
                  <select
                    id="sport"
                    value={newTournament.sport}
                    onChange={(e) => setNewTournament({ ...newTournament, sport: e.target.value })}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Cricket">Box Cricket</option>
                    <option value="Football">Football / Futsal</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Badminton">Badminton</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="teams" className="text-xs font-bold">Max Teams Limit</Label>
                  <Input
                    id="teams"
                    type="number"
                    placeholder="16"
                    value={newTournament.teams}
                    onChange={(e) => setNewTournament({ ...newTournament, teams: e.target.value })}
                    className="rounded-xl h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="startDate" className="text-xs font-bold">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newTournament.startDate}
                    onChange={(e) => setNewTournament({ ...newTournament, startDate: e.target.value })}
                    className="rounded-xl h-9 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prize" className="text-xs font-bold">Prize Pool</Label>
                  <Input
                    id="prize"
                    placeholder="e.g. ₹50,000"
                    value={newTournament.prize}
                    onChange={(e) => setNewTournament({ ...newTournament, prize: e.target.value })}
                    className="rounded-xl h-9 text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-10 text-xs font-extrabold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  Publish & Open Registrations
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
        {[
          {
            label: "Active Tournaments",
            value: tournamentsList.filter((t) => t.status === "Active" || t.status === "Registration Open").length,
            icon: Trophy,
            badge: "Running Live",
          },
          {
            label: "Total Teams Registered",
            value: "45",
            icon: Users,
            badge: "Roster Enrolled",
          },
          {
            label: "Pending Approvals",
            value: pendingList.length,
            icon: ClipboardList,
            badge: "Action Required",
          },
          {
            label: "Matches Today",
            value: "5",
            icon: Play,
            badge: "Scheduled",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="bg-slate-50/80 dark:bg-slate-900/60 border-2 border-slate-300 dark:border-slate-700 hover:border-emerald-500 transition-all duration-300 rounded-2xl flex flex-col justify-between p-3.5 pb-2.5 min-h-[90px] text-foreground shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-black tracking-tight mt-0.5 text-foreground">{stat.value}</h3>
                </div>
                <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 stroke-[2.2] shrink-0" />
              </div>
              <div className="mt-2 text-[10px] font-extrabold flex items-center gap-1 text-muted-foreground">
                <Sparkles className="h-3 w-3 text-foreground" /> {stat.badge}
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
              My Organized Tournaments
            </h2>
            <p className="text-xs text-muted-foreground">Active leagues, slot fixtures and registration status</p>
          </div>
          <span className="px-3 py-1 rounded-xl text-[10px] font-extrabold border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent">
            {tournamentsList.length} Total Hosted
          </span>
        </div>

        <div className="space-y-3">
          {tournamentsList.map((tournament) => (
            <div
              key={tournament.id}
              className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-extrabold text-sm sm:text-base text-foreground">{tournament.name}</h4>
                  <Badge variant="outline" className="text-[10px] font-bold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    {tournament.sport}
                  </Badge>
                  <Badge className={`text-[10px] font-bold rounded-md px-2 py-0.5 ${tournament.status === "Active"
                    ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                    : "bg-blue-500/15 text-blue-600 border border-blue-500/30"
                    }`}>
                    {tournament.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium pt-0.5">
                  <span className="flex items-center gap-1 font-semibold text-foreground/90">
                    <Users className="h-3.5 w-3.5 text-blue-500" />
                    {tournament.teams} Teams Roster
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-foreground/90">
                    <Play className="h-3.5 w-3.5 text-purple-500" />
                    {tournament.matches} Total Matches
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-foreground/90">
                    <Calendar className="h-3.5 w-3.5 text-amber-500" />
                    {tournament.startDate}
                  </span>
                  {tournament.prize && (
                    <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                      <Award className="h-3.5 w-3.5" />
                      Prize Pool: {tournament.prize}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info(`Editing details for ${tournament.name}`)}
                  className="h-8 text-xs font-bold rounded-xl border-slate-300 dark:border-slate-700 cursor-pointer gap-1.5"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success(`Opening management portal for ${tournament.name}`)}
                  className="h-8 text-xs font-extrabold rounded-xl bg-transparent border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer gap-1 transition-all"
                >
                  Manage <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs Section for Approvals, Fixtures, and Live Scores */}
      <Tabs defaultValue="approvals" className="space-y-4 pt-2">
        <TabsList className="bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 inline-flex items-center gap-1 max-w-full overflow-x-auto scrollbar-none">
          <TabsTrigger
            value="approvals"
            className="rounded-xl text-xs font-bold px-4 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs transition-all flex items-center gap-1.5"
          >
            <Shield className="h-3.5 w-3.5" />
            Team Approvals
            {pendingList.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-extrabold">
                {pendingList.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="fixtures"
            className="rounded-xl text-xs font-bold px-4 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs transition-all flex items-center gap-1.5"
          >
            <Swords className="h-3.5 w-3.5" />
            Fixture Generator
          </TabsTrigger>
          <TabsTrigger
            value="scores"
            className="rounded-xl text-xs font-bold px-4 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs transition-all flex items-center gap-1.5"
          >
            <Radio className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
            Live Scores
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Pending Approvals */}
        <TabsContent value="approvals" className="space-y-4 focus-visible:outline-none">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <ClipboardList className="h-4.5 w-4.5 text-amber-500" />
                Pending Team Registrations
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Review and approve team rosters before generating match slots
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-3">
              {pendingList.length === 0 ? (
                <div className="text-center py-12 border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40">
                  <Check className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-bold text-foreground">All Approvals Cleared!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">No pending team registration requests.</p>
                </div>
              ) : (
                pendingList.map((team) => (
                  <div
                    key={team.id}
                    className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-foreground">{team.teamName}</h4>
                        <Badge variant="outline" className="text-[10px] font-bold rounded-md bg-blue-500/10 text-blue-600 border-blue-500/30">
                          {team.sport}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Captain: <strong className="text-foreground">{team.captain}</strong> • {team.members} players enrolled • <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{team.submitted}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectTeam(team.id, team.teamName)}
                        className="h-8 text-xs font-bold rounded-xl border-rose-500/40 text-rose-600 hover:bg-rose-500/10 cursor-pointer gap-1"
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproveTeam(team.id, team.teamName)}
                        className="h-8 text-xs font-extrabold rounded-xl bg-transparent border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer gap-1 transition-all"
                      >
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Approve Team
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Fixtures Generator */}
        <TabsContent value="fixtures" className="space-y-4 focus-visible:outline-none">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Swords className="h-4.5 w-4.5 text-purple-500" />
                  Scheduled Tournament Fixtures
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Automated knock-out match slotting & pitch allocation
                </CardDescription>
              </div>

              <Button
                size="sm"
                onClick={() => toast.success("Knockout Fixture Matrix Auto-Generated!")}
                className="h-8 text-xs font-extrabold rounded-xl bg-transparent border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer gap-1.5 transition-all"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" /> Generate Auto-Fixtures
              </Button>
            </CardHeader>

            <CardContent className="p-0 space-y-3">
              {fixturesList.map((fixture) => (
                <div
                  key={fixture.id}
                  className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-3"
                >
                  <div className="grid grid-cols-12 items-center gap-2">
                    <div className="col-span-5 text-right font-extrabold text-sm text-foreground">
                      {fixture.team1}
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        VS
                      </span>
                    </div>
                    <div className="col-span-5 text-left font-extrabold text-sm text-foreground">
                      {fixture.team2}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                      {fixture.date} • {fixture.time}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-foreground/80">
                      <MapPin className="h-3.5 w-3.5 text-blue-500" />
                      {fixture.venue}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Live Score Manager */}
        <TabsContent value="scores" className="space-y-4 focus-visible:outline-none">
          <Card className="border-0 bg-transparent shadow-none max-w-2xl">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <Radio className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
                Live Match Score Controller
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Broadcast real-time runs, overs, and wickets to app spectators
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <div className="p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                    <Flame className="h-4 w-4 text-amber-500" />
                    Mumbai Strikers vs Delhi Warriors
                  </h4>
                  <Badge className="bg-rose-500/15 text-rose-600 border border-rose-500/30 text-[10px] font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" /> LIVE IN PROGRESS
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Mumbai Strikers Score</Label>
                    <Input
                      value={liveScores.team1Score}
                      onChange={(e) => setLiveScores({ ...liveScores, team1Score: e.target.value })}
                      placeholder="e.g. 156/4"
                      className="rounded-xl h-9 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Delhi Warriors Score</Label>
                    <Input
                      value={liveScores.team2Score}
                      onChange={(e) => setLiveScores({ ...liveScores, team2Score: e.target.value })}
                      placeholder="e.g. 142/8"
                      className="rounded-xl h-9 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Match Live Status / Comment</Label>
                  <Input
                    value={liveScores.status}
                    onChange={(e) => setLiveScores({ ...liveScores, status: e.target.value })}
                    placeholder="e.g. 12.3 overs • Mumbai Strikers batting"
                    className="rounded-xl h-9 text-xs font-medium"
                  />
                </div>

                <div className="flex justify-center pt-1">
                  <Button
                    variant="outline"
                    onClick={() => toast.success("Live Match Score Broadcasted Successfully!")}
                    className="h-8 px-5 text-[11px] font-extrabold rounded-md bg-transparent border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 shadow-none cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                  >
                    Broadcast Live Score Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
