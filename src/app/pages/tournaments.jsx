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
  Trophy,
  Calendar,
  Users,
  MapPin,
  Clock,
  TrendingUp,
  Search,
  Plus,
  ArrowRight,
  Medal,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { EmptyState } from "../components/ui/empty-state";
import { Input } from "../components/ui/input";

const tournaments = [
  {
    id: 1,
    name: "Summer Cricket League 2026",
    sport: "Cricket",
    startDate: "Jun 20, 2026",
    teams: 16,
    prize: "₹50,000",
    status: "Registration Open",
    location: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1594470117722-de4b9a02ebed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmlja2V0JTIwc3RhZGl1bSUyMG1hdGNofGVufDF8fHx8MTc4MTUxNTMxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: 2,
    name: "Elite Basketball Championship",
    sport: "Basketball",
    startDate: "Jun 25, 2026",
    teams: 12,
    prize: "₹40,000",
    status: "Registration Open",
    location: "Pune",
    image:
      "https://images.unsplash.com/photo-1590227632180-80a3bf110871?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwY291cnQlMjBwbGF5ZXJzfGVufDF8fHx8MTc4MTU3OTY5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: 3,
    name: "Tennis Masters Cup",
    sport: "Tennis",
    startDate: "Jul 5, 2026",
    teams: 32,
    prize: "₹60,000",
    status: "Ongoing",
    location: "Bangalore",
    image:
      "https://images.unsplash.com/photo-1545151414-8a948e1ea54f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW5uaXMlMjBjb3VydCUyMHBsYXllcnxlbnwxfHx8fDE3ODE1Nzk2OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

const pointsTable = [
  { rank: 1, team: "Mumbai Warriors", played: 8, won: 7, lost: 1, points: 14 },
  { rank: 2, team: "Delhi Strikers", played: 8, won: 6, lost: 2, points: 12 },
  {
    rank: 3,
    team: "Chennai Champions",
    played: 8,
    won: 5,
    lost: 3,
    points: 10,
  },
  { rank: 4, team: "Kolkata Knights", played: 8, won: 4, lost: 4, points: 8 },
  { rank: 5, team: "Bangalore Bulls", played: 8, won: 3, lost: 5, points: 6 },
];

const fixtures = [
  {
    id: 1,
    team1: "Mumbai Warriors",
    team2: "Delhi Strikers",
    date: "Jun 18, 2026",
    time: "6:00 PM",
    venue: "Elite Sports Arena",
    status: "Upcoming",
  },
  {
    id: 2,
    team1: "Chennai Champions",
    team2: "Kolkata Knights",
    date: "Jun 19, 2026",
    time: "7:00 PM",
    venue: "Champions Complex",
    status: "Upcoming",
  },
];

export function Tournaments() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl  tracking-tight">Leagues & Tournaments</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Compete with the best and win exciting prizes
          </p>
        </div>
        {currentUser && (
          <Link to="/organizer-dashboard">
            <Button size="lg" className="shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              Organize Tournament
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Active Now",
            value: "12",
            icon: Trophy,
            color: "text-blue-600",
            bg: "bg-blue-500/10",
          },
          {
            label: "Total Prize",
            value: "₹5.2L",
            icon: Medal,
            color: "text-amber-600",
            bg: "bg-amber-500/10",
          },
          {
            label: "Total Players",
            value: "2.4K",
            icon: Users,
            color: "text-green-600",
            bg: "bg-green-500/10",
          },
          {
            label: "Upcoming",
            value: "8",
            icon: Calendar,
            color: "text-purple-600",
            bg: "bg-purple-500/10",
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
              <Card className="border-border/40 bg-card/50">
                <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] sm:text-xs  text-muted-foreground uppercase tracking-widest mb-1">
                      {stat.label}
                    </p>
                    <p className="text-xl sm:text-2xl ">{stat.value}</p>
                  </div>
                  <div
                    className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search tournaments..."
                className="pl-11 h-12 border-border/60 bg-card/50"
              />
            </div>
            <Tabs defaultValue="all" className="w-full sm:w-auto">
              <TabsList className="h-12 bg-muted/50 p-1 border border-border/40">
                <TabsTrigger value="all" className="px-6 ">
                  All
                </TabsTrigger>
                <TabsTrigger value="ongoing" className="px-6 ">
                  Ongoing
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="px-6 ">
                  Upcoming
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-6">
            {tournaments.length > 0 ? (
              tournaments.map((tournament, index) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="group overflow-hidden border-border/40 hover:border-primary/30 transition-all shadow-sm hover:shadow-xl bg-card">
                    <div className="flex flex-col sm:flex-row h-auto sm:h-52">
                      <div className="relative w-full sm:w-64 h-44 sm:h-full overflow-hidden shrink-0">
                        <ImageWithFallback
                          src={tournament.image}
                          alt={tournament.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />

                        <div className="absolute top-3 left-3">
                          <Badge
                            className={
                              tournament.status === "Registration Open"
                                ? "bg-primary text-primary-foreground  uppercase text-[10px] tracking-wider"
                                : "bg-accent text-accent-foreground  uppercase text-[10px] tracking-wider"
                            }
                          >
                            {tournament.status}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h3 className="text-xl  group-hover:text-primary transition-colors leading-tight">
                              {tournament.name}
                            </h3>
                            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg shrink-0">
                              <Medal className="h-4 w-4 text-amber-500" />
                              <span className=" text-xs">
                                {tournament.prize}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground  mb-4">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {tournament.startDate}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" />
                              {tournament.teams} Teams
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {tournament.location}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <Badge variant="secondary" className=" bg-muted/50">
                            {tournament.sport}
                          </Badge>
                          <Button className=" px-6 gap-2 group/btn shadow-md shadow-primary/10">
                            {tournament.status === "Registration Open"
                              ? "Join Now"
                              : "View Bracket"}
                            <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <EmptyState
                icon={Trophy}
                title="No tournaments found"
                description="We couldn't find any tournaments matching your criteria. Check back later!"
                actionText="Browse All"
                onAction={() => {}}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl ">Match Day</h2>
            <Badge
              variant="outline"
              className=" text-red-600 bg-red-50 border-red-200 uppercase text-[10px]"
            >
              Today
            </Badge>
          </div>

          <Card className="border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Next Fixtures
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {fixtures.length > 0 ? (
                fixtures.map((fixture) => (
                  <div
                    key={fixture.id}
                    className="p-4 rounded-xl border border-border/20 bg-muted/20 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-center flex-1">
                        <p className="text-sm  leading-tight h-8 flex items-center justify-center">
                          {fixture.team1}
                        </p>
                      </div>
                      <div className="bg-primary/10 px-2 py-1 rounded text-[10px]  text-primary">
                        VS
                      </div>
                      <div className="text-center flex-1">
                        <p className="text-sm  leading-tight h-8 flex items-center justify-center">
                          {fixture.team2}
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border/30 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px]  text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {fixture.time}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]  text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {fixture.venue.split(" ").slice(0, 2).join(" ")}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground text-sm ">
                  No matches today
                </p>
              )}
              <Button
                variant="ghost"
                className="w-full text-primary  group"
                size="sm"
              >
                View Full Schedule
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Live Standings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-5 text-[10px]  text-muted-foreground px-2 uppercase tracking-widest">
                  <span className="col-span-3">Team</span>
                  <span className="text-center">W-L</span>
                  <span className="text-right">Pts</span>
                </div>
                {pointsTable.slice(0, 4).map((team) => (
                  <div
                    key={team.team}
                    className="grid grid-cols-5 items-center p-2 rounded-lg hover:bg-muted/30 transition-colors text-sm "
                  >
                    <div className="col-span-3 flex items-center gap-2 min-w-0">
                      <span className="text-[10px] text-muted-foreground w-3">
                        {team.rank}
                      </span>
                      <span className="truncate">{team.team}</span>
                    </div>
                    <span className="text-center text-xs">
                      {team.won}-{team.lost}
                    </span>
                    <span className="text-right text-primary">
                      {team.points}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                className="w-full text-primary  mt-4"
                size="sm"
              >
                View Full Standings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
