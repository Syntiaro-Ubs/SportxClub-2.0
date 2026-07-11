import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import {
  Users,
  Plus,
  MessageSquare,
  Trophy,
  TrendingUp,
  UserPlus,
  Settings,
  Shield,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { EmptyState } from "../components/ui/empty-state";
import { useNavigate } from "react-router";
import { useAuth } from "../providers/auth-provider";

const teams = [
  {
    id: 1,
    name: "Mumbai Warriors",
    sport: "Cricket",
    members: 12,
    wins: 24,
    losses: 8,
    upcoming: 3,
    role: "Captain",
  },
  {
    id: 2,
    name: "Bandra Ballers",
    sport: "Basketball",
    members: 8,
    wins: 15,
    losses: 6,
    upcoming: 2,
    role: "Member",
  },
];

const teamMembers = [
  {
    id: 1,
    name: "Rohan Verma",
    role: "Captain",
    position: "All-rounder",
    matches: 45,
    status: "online",
  },
  {
    id: 2,
    name: "Rahul Sharma",
    role: "Vice Captain",
    position: "Batsman",
    matches: 42,
    status: "online",
  },
  {
    id: 3,
    name: "Arjun Patel",
    role: "Member",
    position: "Bowler",
    matches: 38,
    status: "offline",
  },
  {
    id: 4,
    name: "Vikram Singh",
    role: "Member",
    position: "Wicket Keeper",
    matches: 40,
    status: "online",
  },
  {
    id: 5,
    name: "Amit Kumar",
    role: "Member",
    position: "Batsman",
    matches: 35,
    status: "offline",
  },
];

export function TeamManagement() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const displayMembers = teamMembers.map((member) =>
    member.id === 1 && currentUser?.fullName
      ? { ...member, name: currentUser.fullName }
      : member
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl  tracking-tight">Teams & Communities</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage your squads and connect with fellow players
          </p>
        </div>
        <Button size="lg" className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          Create New Team
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Teams Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl ">Your Teams</h2>
            <Badge variant="secondary" className="">
              {teams.length} Active
            </Badge>
          </div>

          {teams.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {teams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="group overflow-hidden border-border/40 shadow-sm hover:shadow-md transition-all bg-card">
                    <div className="h-2 bg-primary/20 group-hover:bg-primary transition-colors" />
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Users className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg ">
                              {team.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className="text-[10px]  uppercase px-2 py-0 h-5 border-primary/20 text-primary"
                              >
                                {team.sport}
                              </Badge>
                              <Badge className="bg-accent/10 text-accent hover:bg-accent/10 border-none text-[10px]  px-2 h-5">
                                {team.role}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Team settings"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Settings className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center p-2 rounded-lg bg-muted/30">
                          <p className="text-lg ">{team.members}</p>
                          <p className="text-[10px]  text-muted-foreground uppercase tracking-wider">
                            Players
                          </p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-muted/30">
                          <p className="text-lg  text-accent">{team.wins}</p>
                          <p className="text-[10px]  text-muted-foreground uppercase tracking-wider">
                            Wins
                          </p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-muted/30">
                          <p className="text-lg  text-destructive">
                            {team.losses}
                          </p>
                          <p className="text-[10px]  text-muted-foreground uppercase tracking-wider">
                            Loss
                          </p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-muted/30">
                          <p className="text-lg  text-primary">
                            {team.upcoming}
                          </p>
                          <p className="text-[10px]  text-muted-foreground uppercase tracking-wider">
                            Next
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1  h-10 px-0"
                          variant="secondary"
                        >
                          Team Chat
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1  h-10 px-0 group"
                        >
                          Stats
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No teams joined"
              description="Join a team or create your own to start competing in leagues and tournaments."
              actionText="Create a Team"
              onAction={() => {}}
            />
          )}
        </div>

        {/* Sidebar: Current Team Roster */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl ">Team Roster</h2>
            <Button variant="ghost" size="sm" className="text-primary ">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite
            </Button>
          </div>
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Mumbai Warriors</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              {displayMembers.length > 0 ? (
                displayMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/20 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                          <AvatarFallback className="bg-primary/10 text-primary ">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
                            member.status === "online"
                              ? "bg-green-500"
                              : "bg-muted"
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className=" text-sm truncate">{member.name}</p>
                          {member.role === "Captain" && (
                            <Shield className="h-3 w-3 text-amber-500" />
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground  uppercase tracking-wider">
                          {member.position}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Message member"
                      className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground text-sm ">
                  No members found
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Statistics */}
      <Card className="border-border/40 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-xl">Team Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                label: "Overall Win Rate",
                value: "75%",
                icon: Trophy,
                color: "text-amber-500",
                bgColor: "bg-amber-500/10",
                change: "+5% trend",
              },
              {
                label: "Avg. Runs / Match",
                value: "156",
                icon: TrendingUp,
                color: "text-blue-500",
                bgColor: "bg-blue-500/10",
                change: "Top 10% in league",
              },
              {
                label: "Active Members",
                value: "12",
                icon: Users,
                color: "text-green-500",
                bgColor: "bg-green-500/10",
                change: "Full squad",
              },
              {
                label: "Season MVP",
                value: "Rahul S.",
                icon: Shield,
                color: "text-purple-500",
                bgColor: "bg-purple-500/10",
                change: "456 points",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bgColor} ${stat.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs  text-muted-foreground uppercase tracking-widest leading-tight">
                      {stat.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl ">{stat.value}</p>
                    <p className="text-[10px]  text-muted-foreground mt-1">
                      {stat.change}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
