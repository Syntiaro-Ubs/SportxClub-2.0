import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  Edit,
  Play,
} from "lucide-react";

const tournaments = [
  {
    id: 1,
    name: "Summer Cricket League 2026",
    sport: "Cricket",
    status: "Active",
    teams: 16,
    matches: 24,
    startDate: "Jun 20, 2026",
  },
  {
    id: 2,
    name: "Basketball Championship",
    sport: "Basketball",
    status: "Registration",
    teams: 8,
    matches: 12,
    startDate: "Jun 25, 2026",
  },
];

const pendingApprovals = [
  {
    id: 1,
    teamName: "Mumbai Strikers",
    captain: "Rohit Sharma",
    members: 11,
    submitted: "2 hours ago",
  },
  {
    id: 2,
    teamName: "Delhi Warriors",
    captain: "Virat Kohli",
    members: 11,
    submitted: "5 hours ago",
  },
];

const fixtures = [
  {
    id: 1,
    team1: "Mumbai Warriors",
    team2: "Delhi Strikers",
    date: "Jun 18, 2026",
    time: "6:00 PM",
    venue: "Elite Sports Arena",
  },
  {
    id: 2,
    team1: "Chennai Champions",
    team2: "Kolkata Knights",
    date: "Jun 19, 2026",
    time: "7:00 PM",
    venue: "Champions Complex",
  },
];

export function TournamentOrganizerDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl ">Tournament Organizer Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage sports tournaments
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Tournament
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Tournament</DialogTitle>
              <DialogDescription>
                Fill in the details to start organizing a new tournament.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" placeholder="Tournament Name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sport" className="text-right">
                  Sport
                </Label>
                <Input id="sport" placeholder="e.g. Cricket, Football" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="teams" className="text-right">
                  Max Teams
                </Label>
                <Input id="teams" type="number" placeholder="16" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Start Date
                </Label>
                <Input id="startDate" type="date" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              {/* Note: since there is no state hooked up, this just serves as a UI popup for now */}
              <DialogTrigger asChild>
                <Button type="button" onClick={() => {
                  // The DialogTrigger automatically handles closing when clicked.
                }}>Create Tournament</Button>
              </DialogTrigger>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Active Tournaments", value: "3", icon: Trophy },
          { label: "Total Teams", value: "45", icon: Users },
          { label: "Pending Approvals", value: "8", icon: Calendar },
          { label: "Matches Today", value: "5", icon: Play },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl ">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* My Tournaments */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>My Tournaments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="">{tournament.name}</h4>
                  <Badge variant="outline">{tournament.sport}</Badge>
                  <Badge
                    className={
                      tournament.status === "Active"
                        ? "bg-accent hover:bg-accent"
                        : "bg-primary hover:bg-primary"
                    }
                  >
                    {tournament.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {tournament.teams} Teams
                  </span>
                  <span className="flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    {tournament.matches} Matches
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {tournament.startDate}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm">Manage</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="approvals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="approvals">Team Approvals</TabsTrigger>
          <TabsTrigger value="fixtures">Fixture Generator</TabsTrigger>
          <TabsTrigger value="scores">Live Scores</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Pending Team Approvals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingApprovals.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50"
                >
                  <div>
                    <h4 className=" mb-1">{team.teamName}</h4>
                    <p className="text-sm text-muted-foreground">
                      Captain: {team.captain} • {team.members} members •
                      Submitted {team.submitted}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="gap-2 bg-accent hover:bg-accent"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fixtures">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tournament Fixtures</CardTitle>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Generate Fixtures
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fixtures.map((fixture) => (
                <div
                  key={fixture.id}
                  className="p-4 rounded-lg border border-border/50"
                >
                  <div className="grid grid-cols-3 items-center gap-4 mb-3">
                    <div className="text-right">
                      <p className="">{fixture.team1}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl ">VS</span>
                    </div>
                    <div>
                      <p className="">{fixture.team2}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t border-border/50">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {fixture.date} • {fixture.time}
                    </span>
                    <span>{fixture.venue}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Update Live Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg border border-border/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="">Mumbai Warriors vs Delhi Strikers</h4>
                  <Badge className="bg-red-500 hover:bg-red-600">
                    <Play className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Mumbai Warriors Score</Label>
                    <Input placeholder="156/4" className="mt-2" />
                  </div>
                  <div>
                    <Label>Delhi Strikers Score</Label>
                    <Input placeholder="142/8" className="mt-2" />
                  </div>
                </div>
                <div>
                  <Label>Match Status</Label>
                  <Input
                    placeholder="12.3 overs - Mumbai Warriors batting"
                    className="mt-2"
                  />
                </div>
                <Button className="w-full">Update Score</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
