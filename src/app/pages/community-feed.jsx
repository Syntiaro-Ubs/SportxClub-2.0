import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import {
  Heart,
  MessageSquare,
  Share2,
  Image as ImageIcon,
  Video,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../providers/auth-provider";

const posts = [
  {
    id: 1,
    author: "Rahul Sharma",
    time: "2 hours ago",
    content:
      "Amazing match today! Our team won the Summer Cricket League finals. Special thanks to all teammates! 🏏🏆",
    image:
      "https://images.unsplash.com/photo-1594470117722-de4b9a02ebed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmlja2V0JTIwc3RhZGl1bSUyMG1hdGNofGVufDF8fHx8MTc4MTUxNTMxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    likes: 156,
    comments: 24,
    shares: 8,
    type: "match",
  },
  {
    id: 2,
    author: "Priya Patel",
    time: "5 hours ago",
    content:
      "Looking for badminton players for a friendly match this Saturday at Champions Sports Complex. Who's in?",
    likes: 42,
    comments: 18,
    shares: 3,
    type: "event",
  },
  {
    id: 3,
    author: "Arjun Malhotra",
    time: "1 day ago",
    content:
      "Just completed my 100th match on SportXClub! Thank you to this amazing community for making sports accessible to everyone! ⚽",
    image:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHNvY2NlciUyMGZpZWxkJTIwYWN0aW9ufGVufDF8fHx8MTc4MTU3OTY5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    likes: 234,
    comments: 45,
    shares: 12,
    type: "milestone",
  },
  {
    id: 4,
    author: "Sneha Reddy",
    time: "2 days ago",
    content:
      "Tennis coaching session was absolutely amazing! Improved my backhand significantly. Highly recommend Ace Tennis Academy!",
    likes: 89,
    comments: 15,
    shares: 5,
    type: "review",
  },
];

const trendingTopics = [
  { name: "Summer Cricket League", posts: "1.2K posts" },
  { name: "Football Tournament", posts: "856 posts" },
  { name: "Tennis Championship", posts: "645 posts" },
  { name: "New Venue Opening", posts: "423 posts" },
];

export function CommunityFeed() {
  const { currentUser } = useAuth();

  const displayInitials = currentUser?.fullName
    ? currentUser.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "RV";

  const suggestions = ["Vikram Singh", "Anjali Gupta", "Rohan Verma"];
  const displaySuggestions = suggestions.map((name) =>
    name === currentUser?.fullName ? "Karan Malhotra" : name
  );

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl ">Community Feed</h1>
          <p className="text-muted-foreground mt-1">
            Stay connected with the sports community
          </p>
        </div>

        {/* Create Post */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="bg-background">
                {currentUser?.profilePicture && (
                  <AvatarImage src={currentUser.profilePicture} className="object-cover" />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {displayInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Share your sports moment..."
                  className="min-h-[80px] resize-none"
                />

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Photo
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Video className="h-4 w-4" />
                      Video
                    </Button>
                  </div>
                  <Button>Post</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {post.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="">{post.author}</p>
                        <p className="text-sm text-muted-foreground">
                          {post.time}
                        </p>
                      </div>
                      {post.type === "match" && (
                        <Badge className="gap-1">
                          <Trophy className="h-3 w-3" />
                          Match Win
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <p className="mb-4">{post.content}</p>

                {post.image && (
                  <div className="rounded-lg overflow-hidden mb-4">
                    <ImageWithFallback
                      src={post.image}
                      alt="Post"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex gap-6">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      <span>{post.shares}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Stats */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <h3 className=" mb-4">Your Activity</h3>
            <div className="space-y-4">
              {[
                { label: "Posts", value: "24" },
                { label: "Following", value: "156" },
                { label: "Followers", value: "342" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                  <span className="">{stat.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trending */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="">Trending Topics</h3>
            </div>
            <div className="space-y-3">
              {trendingTopics.map((topic) => (
                <button
                  key={topic.name}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <p className=" mb-1">#{topic.name}</p>
                  <p className="text-xs text-muted-foreground">{topic.posts}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggested Connections */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <h3 className=" mb-4">Suggested Players</h3>
            <div className="space-y-4">
              {displaySuggestions.map((name) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                        {name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className=" text-sm">{name}</p>
                      <p className="text-xs text-muted-foreground">Cricket</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
