import { Link, useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  Trophy,
  Activity,
  ArrowRight,
  Wallet,
  Heart,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../providers/auth-provider";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { EmptyState } from "../components/ui/empty-state";

// Simplified data for demonstration
const upcomingBookings = [
  {
    id: 1,
    venue: "Elite Sports Arena",
    sport: "Football",
    date: "Today, June 18",
    time: "6:00 PM - 7:00 PM",
    location: "Downtown, Mumbai",
    status: "Confirmed",
  },
  {
    id: 2,
    venue: "Ace Tennis Academy",
    sport: "Tennis",
    date: "Tomorrow, June 19",
    time: "8:00 AM - 9:00 AM",
    location: "Powai, Mumbai",
    status: "Confirmed",
  },
];

const favoriteVenues = [
  {
    id: 1,
    name: "Champions Sports Complex",
    distance: "1.2 km",
    rating: 4.8,
    price: "₹600/hr",
    image:
      "https://images.unsplash.com/photo-1590227632180-80a3bf110871?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwY291cnQlMjBwbGF5ZXJzfGVufDF8fHx8MTc4MTU3OTY5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: 2,
    name: "Aqua Fitness Center",
    distance: "2.5 km",
    rating: 4.6,
    price: "₹800/hr",
    image:
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMHBvb2wlMjBhdGhsZXRlfGVufDF8fHx8MTc4MTU3MzA5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

const liveMatches = [
  {
    id: 1,
    tournament: "Summer Cricket League",
    team1: "Mumbai Warriors",
    team2: "Delhi Strikers",
    score1: "156/4",
    score2: "89/2",
    overs: "12.3 overs",
    status: "Live",
  },
];

export function HomeDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const firstName = currentUser?.fullName ? currentUser.fullName.split(" ")[0] : "Rohan";

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl  tracking-tight">Good evening, {firstName}! 👋</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Ready for your next game?
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/venues">
            <Button size="lg" className="shadow-lg shadow-primary/20">
              <MapPin className="mr-2 h-4 w-4" />
              Book a Venue
            </Button>
          </Link>
          <Link to="/tournaments">
            <Button variant="outline" size="lg">
              <Trophy className="mr-2 h-4 w-4" />
              Join Tournament
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Upcoming Bookings",
            value: "3",
            description: "Next: Today, 6:00 PM",
            icon: Calendar,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950/30",
          },
          {
            title: "Active Tournaments",
            value: "2",
            description: "1 game tomorrow",
            icon: Trophy,
            color: "text-amber-600",
            bgColor: "bg-amber-50 dark:bg-amber-950/30",
          },
          {
            title: "Wallet Balance",
            value: "₹1,250",
            description: "Credits available",
            icon: Wallet,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950/30",
          },
          {
            title: "Favorite Venues",
            value: "8",
            description: "Across 4 sports",
            icon: Heart,
            color: "text-rose-600",
            bgColor: "bg-rose-50 dark:bg-rose-950/30",
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm  text-muted-foreground">
                      {stat.title}
                    </p>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.bgColor}`}
                    >
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl  mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground ">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Upcoming Bookings */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Your Bookings</CardTitle>
              <Link to="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald-700 hover:text-emerald-800 dark:text-[#6DFF3B] dark:hover:text-[#6DFF3B] hover:bg-emerald-50 dark:hover:bg-[#6DFF3B]/10 font-semibold"
                >
                  View History
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-border/40 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-[#6DFF3B]/10 text-emerald-700 dark:text-[#6DFF3B] group-hover:bg-emerald-700 dark:group-hover:bg-[#6DFF3B] group-hover:text-white dark:group-hover:text-black transition-colors">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className=" text-base truncate">{booking.venue}</h4>
                      <Badge
                        variant="outline"
                        className="bg-background/50 border-emerald-500/20 text-emerald-700 dark:text-[#6DFF3B] dark:border-[#6DFF3B]/20"
                      >
                        {booking.sport}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {booking.location}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm  pt-1">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {booking.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {booking.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Calendar}
                title="No upcoming games"
                description="You haven't booked any venues yet. Ready to start playing?"
                actionText="Book a Venue"
                onAction={() => navigate("/venues")}
              />
            )}
          </CardContent>
        </Card>

        {/* Live Matches */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Live Competitions
              </CardTitle>
              <Link to="/tournaments">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary hover:bg-primary/10"
                >
                  Join a Game
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {liveMatches.length > 0 ? (
              liveMatches.map((match) => (
                <div
                  key={match.id}
                  className="p-5 rounded-xl border border-border/40 bg-card hover:border-primary/40 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm  text-muted-foreground">
                      {match.tournament}
                    </p>
                    <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600 mr-2 animate-pulse" />
                      {match.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <div className="text-center">
                      <p className=" text-sm sm:text-base leading-tight h-10 flex items-center justify-center">
                        {match.team1}
                      </p>
                      <p className="text-2xl  mt-2">{match.score1}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xs  text-muted-foreground/30 italic">
                        VS
                      </span>
                      <div className="h-px w-full bg-border/40 mt-1" />
                    </div>
                    <div className="text-center">
                      <p className=" text-sm sm:text-base leading-tight h-10 flex items-center justify-center">
                        {match.team2}
                      </p>
                      <p className="text-2xl  mt-2">{match.score2}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs  text-muted-foreground uppercase tracking-widest">
                      {match.overs}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Trophy}
                title="No live matches"
                description="There are no tournaments currently in progress. Why not start one?"
                actionText="Explore Tournaments"
                onAction={() => navigate("/tournaments")}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Favorite Venues */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Your Favorites</CardTitle>
            <Link to="/venues">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary hover:bg-primary/10"
              >
                View All Venues
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {favoriteVenues.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteVenues.map((venue, index) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link to={`/venues/${venue.id}`}>
                    <div className="group rounded-xl border border-border/40 overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer bg-card">
                      <div className="relative h-44 overflow-hidden">
                        <ImageWithFallback
                          src={venue.image}
                          alt={venue.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />

                        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground px-2.5 py-1 rounded-full text-xs  shadow-sm">
                          {venue.price}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-3 left-3 h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm text-rose-500 hover:bg-background/80"
                          aria-label="Remove from favorites"
                        >
                          <Heart className="h-4.5 w-4.5 fill-current" />
                        </Button>
                      </div>
                      <div className="p-4">
                        <h4 className=" mb-2 group-hover:text-primary transition-colors truncate">
                          {venue.name}
                        </h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground ">
                            <MapPin className="h-3.5 w-3.5" />
                            {venue.distance}
                          </div>
                          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-md">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className=" text-xs text-amber-700 dark:text-amber-500">
                              {venue.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Heart}
              title="No favorites yet"
              description="Save your favorite venues for quick booking later."
              actionText="Find Venues"
              onAction={() => navigate("/venues")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
