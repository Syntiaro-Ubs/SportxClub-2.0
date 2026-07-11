import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Bell,
  Bookmark,
  ChevronRight,
  CreditCard,
  Edit,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Medal,
  Settings,
  Ticket,
  Trophy,
  Wallet,
} from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Container } from "../components/ui/container";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useAuth } from "../providers/auth-provider";

const sportsOptions = [
  { id: "football", name: "Football", emoji: "⚽" },
  { id: "cricket", name: "Cricket", emoji: "🏏" },
  { id: "badminton", name: "Badminton", emoji: "🏸" },
  { id: "tennis", name: "Tennis", emoji: "🎾" },
  { id: "basketball", name: "Basketball", emoji: "🏀" },
  { id: "swimming", name: "Swimming", emoji: "🏊" },
  { id: "gym", name: "Gym & Fitness", emoji: "🏋️" },
  { id: "volleyball", name: "Volleyball", emoji: "🏐" },
];

const getInitials = (name) => {
  if (!name) return "RV";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getHandle = (user) => {
  if (!user) return "@rohanv";
  if (user.fullName) {
    return "@" + user.fullName.toLowerCase().replace(/\s+/g, "");
  }
  if (user.email) {
    return "@" + user.email.split("@")[0];
  }
  return "@user";
};

const getMappedSports = (selectedSports) => {
  if (!selectedSports || selectedSports.length === 0) {
    return ["Cricket", "Football", "Tennis"];
  }
  return selectedSports.map((id) => {
    const found = sportsOptions.find((s) => s.id === id);
    return found ? found.name : id.charAt(0).toUpperCase() + id.slice(1);
  });
};
const recentBookings = [
  {
    title: "Elite Turf Arena",
    subtitle: "Today, 6:00 PM",
    meta: "Football",
    accent: "Confirmed",
  },
  {
    title: "Ace Tennis Academy",
    subtitle: "Tomorrow, 8:00 AM",
    meta: "Tennis",
    accent: "Upcoming",
  },
];

const accountActions = [
  { label: "Wallet", icon: Wallet, href: "/payment" },
  { label: "Bookings", icon: Bookmark, href: "/bookings" },
  { label: "Membership", icon: CreditCard, href: "/profile" },
  { label: "Favorites", icon: Heart, href: "/venues" },
];

const settingsItems = [
  { label: "Coupons", icon: Ticket },
  { label: "Notifications", icon: Bell },
  { label: "Settings", icon: Settings },
  { label: "Help", icon: HelpCircle },
  { label: "Logout", icon: LogOut },
];

const achievements = [
  { title: "100 Matches", icon: Trophy, color: "text-amber-500" },
  { title: "Top Scorer", icon: Medal, color: "text-blue-500" },
  { title: "Team Captain", icon: Bookmark, color: "text-emerald-500" },
];

const matchHistory = [
  {
    id: 1,
    venue: "Elite Sports Arena",
    sport: "Cricket",
    date: "Jun 15, 2026",
    result: "Won",
    score: "156/4 vs 142/8",
  },
  {
    id: 2,
    venue: "Champions Complex",
    sport: "Football",
    date: "Jun 12, 2026",
    result: "Won",
    score: "3-1",
  },
  {
    id: 3,
    venue: "Ace Tennis Academy",
    sport: "Tennis",
    date: "Jun 10, 2026",
    result: "Lost",
    score: "6-4, 4-6, 5-7",
  },
];

function MobileProfilePage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = currentUser?.fullName || "Rohan Verma";
  const displayHandle = getHandle(currentUser);
  const displayCity = currentUser?.city ? `${currentUser.city}, India` : "Mumbai, India";
  const displayInitials = getInitials(currentUser?.fullName);
  const displaySports = getMappedSports(currentUser?.selectedSports);

  return (
    <div className="space-y-5 px-4 py-4">
      <div className="space-y-5">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-[28px] border border-primary/10 bg-gradient-to-br from-primary/10 via-card to-card p-4 shadow-[0_16px_38px_-28px_rgba(15,23,42,0.35)]"
        >
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 border border-primary/15 bg-background">
              {currentUser?.profilePicture && (
                <AvatarImage src={currentUser.profilePicture} className="object-cover" />
              )}
              <AvatarFallback className="bg-primary/10 text-2xl  text-primary">
                {displayInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs  uppercase tracking-[0.24em] text-primary">
                    Account
                  </p>
                  <h1 className="mt-2 truncate text-2xl  tracking-tight">
                    {displayName}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">{displayHandle}</p>
                </div>
                <Link to="/edit-profile">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 rounded-2xl border border-border/60 bg-background/80"
                    aria-label="Edit profile"
                  >
                    <Edit className="h-4.5 w-4.5" />
                  </Button>
                </Link>
              </div>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {displayCity}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {displaySports.map((sport) => (
              <Badge
                key={sport}
                className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[0.68rem]  uppercase tracking-[0.16em] text-primary"
              >
                {sport}
              </Badge>
            ))}
          </div>
        </motion.section>

        <section className="grid grid-cols-4 gap-3">
          {[
            { label: "Matches", value: "124" },
            { label: "Rating", value: "4.8" },
            { label: "Wins", value: "24" },
            { label: "Wallet", value: "₹1,250" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileTap={{ scale: 0.98 }}
              className="rounded-[22px] border border-border/60 bg-card p-3 text-center shadow-[0_10px_24px_-20px_rgba(15,23,42,0.28)]"
            >
              <p className="text-lg  text-foreground">{stat.value}</p>
              <p className="mt-1 text-[0.72rem] text-muted-foreground">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-base ">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {accountActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link key={action.label} to={action.href}>
                  <motion.div
                    whileTap={{ scale: 0.985 }}
                    className="rounded-[22px] border border-border/60 bg-card p-4 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.28)]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm  text-foreground">
                      {action.label}
                    </p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base ">Membership</h2>
          <Card className="rounded-[24px] border-primary/10 bg-gradient-to-br from-primary/10 via-card to-card">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs  uppercase tracking-[0.22em] text-primary">
                    SportXClub Plus
                  </p>
                  <h3 className="mt-2 text-lg ">Premium booking perks</h3>
                </div>
                <Medal className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Priority support, selected venue discounts, and early tournament
                access.
              </p>
              <Button className="h-11 w-full rounded-[16px] bg-primary  text-primary-foreground hover:bg-primary/90">
                Upgrade membership
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-base ">Recent bookings</h2>
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <motion.article
                key={booking.title}
                whileTap={{ scale: 0.99 }}
                className="rounded-[22px] border border-border/60 bg-card p-4 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.28)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs  uppercase tracking-[0.18em] text-primary">
                      {booking.accent}
                    </p>
                    <h3 className="mt-2 text-base ">{booking.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {booking.subtitle}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm  text-muted-foreground">
                  {booking.meta}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base ">Achievements</h2>
          <div className="grid gap-3">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;

              return (
                <motion.div
                  key={achievement.title}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center gap-3 rounded-[22px] border border-border/60 bg-card p-4 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.28)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
                    <Icon className={`h-5 w-5 ${achievement.color}`} />
                  </div>
                  <p className="">{achievement.title}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base ">Settings</h2>
            <Button
              variant="ghost"
              className="h-9 rounded-full px-3 text-sm text-primary"
            >
              Manage
            </Button>
          </div>
          <div className="space-y-2">
            {settingsItems.map((item) => {
              const Icon = item.icon;

              return (
                <motion.button
                  key={item.label}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    if (item.label === "Logout") {
                      handleLogout();
                    }
                  }}
                  className="flex w-full items-center justify-between rounded-[20px] border border-border/60 bg-card px-4 py-3 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.28)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span className="">{item.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </motion.button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export function UserProfile() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = currentUser?.fullName || "Rohan Verma";
  const displayHandle = getHandle(currentUser);
  const displayCity = currentUser?.city ? `${currentUser.city}, India` : "Mumbai, India";
  const displayInitials = getInitials(currentUser?.fullName);
  const displaySports = getMappedSports(currentUser?.selectedSports);

  return (
    <>
      <div className="md:hidden">
        <MobileProfilePage />
      </div>

      <div className="hidden md:block">
        <Container className="space-y-6">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <Avatar className="h-24 w-24 bg-background">
                  {currentUser?.profilePicture && (
                    <AvatarImage src={currentUser.profilePicture} className="object-cover" />
                  )}
                  <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                    {displayInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl ">{displayName}</h1>
                      <p className="text-muted-foreground">{displayHandle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to="/edit-profile">
                        <Button className="gap-2" variant="outline">
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        className="gap-2 shrink-0"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{displayCity}</span>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {displaySports.map((sport) => (
                      <Badge key={sport} variant="outline">
                        {sport}
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-2xl ">124</p>
                      <p className="text-sm text-muted-foreground">Matches</p>
                    </div>
                    <div>
                      <p className="text-2xl ">4.8</p>
                      <p className="text-sm text-muted-foreground">Rating</p>
                    </div>
                    <div>
                      <p className="text-2xl ">24</p>
                      <p className="text-sm text-muted-foreground">Wins</p>
                    </div>
                    <div>
                      <p className="text-2xl ">8</p>
                      <p className="text-sm text-muted-foreground">Losses</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={achievement.title}
                      className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-4"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Icon className={`h-6 w-6 ${achievement.color}`} />
                      </div>
                      <p className="">{achievement.title}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="history" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="history">Match History</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <Card className="border-border/50">
                <CardContent className="space-y-4 p-6">
                  {matchHistory.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-4"
                    >
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h4 className="">{match.venue}</h4>
                          <Badge variant="outline">{match.sport}</Badge>
                          <Badge
                            className={
                              match.result === "Won"
                                ? "bg-accent hover:bg-accent"
                                : "bg-destructive hover:bg-destructive"
                            }
                          >
                            {match.result}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {match.date}
                          </span>
                          <span>{match.score}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {[
                      { label: "Win Rate", value: "75%", sport: "Cricket" },
                      { label: "Average Score", value: "45", sport: "Cricket" },
                      { label: "Goals Scored", value: "18", sport: "Football" },
                      { label: "Assists", value: "12", sport: "Football" },
                      { label: "Aces", value: "34", sport: "Tennis" },
                      {
                        label: "Break Points Won",
                        value: "68%",
                        sport: "Tennis",
                      },
                    ].map((stat) => (
                      <div
                        key={`${stat.label}-${stat.sport}`}
                        className="rounded-lg border border-border/50 p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            {stat.label}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {stat.sport}
                          </Badge>
                        </div>
                        <p className="text-2xl ">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card className="border-border/50">
                <CardContent className="space-y-4 p-6">
                  {[
                    {
                      from: "Rahul Sharma",
                      rating: 5,
                      comment:
                        "Great player! Excellent teamwork and sportsmanship.",
                      date: "2 weeks ago",
                    },
                    {
                      from: "Priya Patel",
                      rating: 5,
                      comment:
                        "Very skilled and reliable. Would play with again!",
                      date: "1 month ago",
                    },
                  ].map((review, i) => (
                    <div
                      key={i}
                      className="border-b border-border/50 pb-4 last:border-0"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <p className="">{review.from}</p>
                        <div className="flex gap-1">
                          {Array.from({ length: review.rating }).map(
                            (_, starIndex) => (
                              <Trophy
                                key={starIndex}
                                className="h-4 w-4 fill-amber-400 text-amber-400"
                              />
                            ),
                          )}
                        </div>
                      </div>
                      <p className="mb-1 text-muted-foreground">
                        {review.comment}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {review.date}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Container>
      </div>
    </>
  );
}
