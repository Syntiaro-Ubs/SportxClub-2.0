import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
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
  X,
  Send,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../providers/auth-provider";
import { cmsService } from "../services/cms-service";
import { toast } from "sonner";

const initialPosts = [
  {
    id: 1,
    author: "Rahul Sharma",
    time: "2 hours ago",
    content:
      "Amazing match today! Our team won the Summer Cricket League finals. Special thanks to all teammates! 🏏🏆",
    image_url:
      "https://images.unsplash.com/photo-1594470117722-de4b9a02ebed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmlja2V0JTIwc3RhZGl1bSUyMG1hdGNofGVufDF8fHx8MTc4MTUxNTMxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    likes: 156,
    comments: 24,
    shares: 8,
    type: "match",
    badge: "Match Win",
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
    badge: "Friendly Match",
  },
  {
    id: 3,
    author: "Arjun Malhotra",
    time: "1 day ago",
    content:
      "Just completed my 100th match on SportXClub! Thank you to this amazing community for making sports accessible to everyone! ⚽",
    image_url:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHNvY2NlciUyMGZpZWxkJTIwYWN0aW9ufGVufDF8fHx8MTc4MTU3OTY5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    likes: 234,
    comments: 45,
    shares: 12,
    type: "milestone",
    badge: "Milestone",
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
    badge: "Review",
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
  const navigate = useNavigate();

  const [postsList, setPostsList] = useState(initialPosts);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null); // { url, type: 'image' | 'video' }
  const [isPosting, setIsPosting] = useState(false);

  // Interactivity States
  const [likedPosts, setLikedPosts] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [postCommentsMap, setPostCommentsMap] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const fileInputRef = useRef(null);

  const userAvatar = currentUser?.profilePicture || currentUser?.avatar || currentUser?.photoURL || null;
  const userName = currentUser?.fullName || currentUser?.name || "Sports Player";

  // Auth Guard Helper
  const checkAuthOrRedirect = () => {
    if (!currentUser) {
      toast.error("Please login first to post, like, comment, or share!");
      navigate("/player-login");
      return false;
    }
    return true;
  };

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await cmsService.getPosts();
        if (data && data.length > 0) {
          setPostsList(data);
        }
      } catch (err) {
        console.error("Failed loading community posts:", err);
      }
    }
    loadPosts();
  }, []);

  // Handle Photo/Video File Picker
  const triggerMediaPicker = () => {
    if (!checkAuthOrRedirect()) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const isVideo = file.type.startsWith("video/");
      setSelectedMedia({
        url: event.target?.result,
        type: isVideo ? "video" : "image",
        name: file.name,
      });
      toast.success(`Attached ${isVideo ? "video" : "photo"}: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Create Post Handler
  const handleCreatePost = async () => {
    if (!checkAuthOrRedirect()) return;
    if (!newPostContent.trim() && !selectedMedia) {
      toast.error("Please add text or attach a photo/video to post.");
      return;
    }
    try {
      setIsPosting(true);
      const created = await cmsService.createPost({
        author: userName,
        author_avatar: userAvatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(userName)}`,
        content: newPostContent,
        image_url: selectedMedia?.url || null,
        time: "Just now",
        badge: "Community",
        type: selectedMedia ? (selectedMedia.type === "video" ? "video" : "photo") : "general",
      });

      if (created) {
        setPostsList((prev) => [created, ...prev]);
        setNewPostContent("");
        setSelectedMedia(null);
        toast.success("Sports moment published successfully!");
      }
    } catch (err) {
      console.error("Error creating community post:", err);
      toast.error("Failed publishing post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  // Like Toggle Handler
  const handleToggleLike = async (post) => {
    if (!checkAuthOrRedirect()) return;
    const isLiked = !!likedPosts[post.id];
    const newLikedStatus = !isLiked;
    const currentLikes = Number(post.likes || 0);
    const newLikesCount = newLikedStatus ? currentLikes + 1 : Math.max(0, currentLikes - 1);

    setLikedPosts((prev) => ({ ...prev, [post.id]: newLikedStatus }));
    setPostsList((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, likes: newLikesCount } : p))
    );

    try {
      await cmsService.updatePost(post.id, { likes: newLikesCount });
      if (newLikedStatus) {
        toast.success("Post liked! ❤️");
      }
    } catch (err) {
      console.error("Error updating likes:", err);
    }
  };

  // Toggle Comment Section
  const handleToggleComments = (postId) => {
    if (!checkAuthOrRedirect()) return;
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Add Comment Handler
  const handleAddComment = async (post) => {
    if (!checkAuthOrRedirect()) return;
    const text = commentInputs[post.id]?.trim();
    if (!text) return;

    const newCommentObj = {
      author: userName,
      avatar: userAvatar,
      text,
      time: "Just now",
    };

    const currentComments = postCommentsMap[post.id] || [];
    const updatedComments = [...currentComments, newCommentObj];
    const newCommentCount = Number(post.comments || 0) + 1;

    setPostCommentsMap((prev) => ({ ...prev, [post.id]: updatedComments }));
    setCommentInputs((prev) => ({ ...prev, [post.id]: "" }));
    setPostsList((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, comments: newCommentCount } : p))
    );

    try {
      await cmsService.updatePost(post.id, { comments: newCommentCount });
      toast.success("Comment added!");
    } catch (err) {
      console.error("Error updating comment count:", err);
    }
  };

  // Share Post Handler
  const handleSharePost = async (post) => {
    if (!checkAuthOrRedirect()) return;
    const newShareCount = Number(post.shares || 0) + 1;
    setPostsList((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, shares: newShareCount } : p))
    );

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      }
      await cmsService.updatePost(post.id, { shares: newShareCount });
      toast.success("Post link copied to clipboard! 🚀");
    } catch (err) {
      toast.success("Post shared successfully!");
    }
  };

  const displayInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("") || "SP";

  const suggestions = ["Vikram Singh", "Anjali Gupta", "Rohan Verma"];
  const displaySuggestions = suggestions.map((name) =>
    name === currentUser?.fullName ? "Karan Malhotra" : name
  );

  return (
    <div className="grid lg:grid-cols-3 gap-5 sm:gap-6 -mt-1 sm:-mt-2">
      {/* Hidden Media Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">Community Feed</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Stay connected with the sports community
          </p>
        </div>

        {/* Create Post Card */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="bg-background border border-emerald-500/30">
                {userAvatar ? (
                  <AvatarImage src={userAvatar} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-transparent border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold">
                    {displayInitials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  value={newPostContent}
                  onChange={(e) => {
                    if (!currentUser) {
                      checkAuthOrRedirect();
                      return;
                    }
                    setNewPostContent(e.target.value);
                  }}
                  onFocus={() => {
                    if (!currentUser) {
                      checkAuthOrRedirect();
                    }
                  }}
                  placeholder="Share your sports moment..."
                  className="min-h-[80px] resize-none"
                />

                {/* Selected Media Preview */}
                {selectedMedia && (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 bg-black/5 p-2 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      {selectedMedia.type === "video" ? (
                        <div className="w-12 h-12 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                          VIDEO
                        </div>
                      ) : (
                        <img
                          src={selectedMedia.url}
                          alt="Attachment preview"
                          className="w-12 h-12 object-cover rounded-lg shrink-0 border border-border"
                        />
                      )}
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-bold truncate text-foreground">{selectedMedia.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{selectedMedia.type} Attached</p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedMedia(null)}
                      className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={triggerMediaPicker}
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-500/20 shadow-none cursor-pointer"
                    >
                      <ImageIcon className="h-4 w-4 stroke-[2.2]" />
                      Photo
                    </Button>
                    <Button
                      type="button"
                      onClick={triggerMediaPicker}
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-500/20 shadow-none cursor-pointer"
                    >
                      <Video className="h-4 w-4 stroke-[2.2]" />
                      Video
                    </Button>
                  </div>
                  <Button
                    onClick={handleCreatePost}
                    disabled={isPosting || (!newPostContent.trim() && !selectedMedia)}
                    variant="outline"
                    className="rounded-xl px-6 h-9 bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold text-xs shadow-none cursor-pointer transition-all active:scale-95 disabled:opacity-50 border-none"
                  >
                    {isPosting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        <div className="space-y-4">
          {postsList.map((post) => {
            const imageUrl = post.image || post.image_url;
            const isLiked = !!likedPosts[post.id];
            const isCommentsOpen = !!openComments[post.id];
            const commentsList = postCommentsMap[post.id] || [];
            const badgeText = post.badge || (post.type === "match" ? "Match Win" : post.type === "event" ? "Friendly Match" : post.type === "milestone" ? "Milestone" : "Community");

            return (
              <Card key={post.id || `post-${post.author}`} className="border-border/50">
                <CardContent className="p-4 sm:p-4.5">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="border border-emerald-500/20">
                      {post.author_avatar ? (
                        <AvatarImage src={post.author_avatar} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-transparent border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold">
                        {(post.author || "User")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-foreground">{post.author}</p>
                          <p className="text-xs text-muted-foreground">{post.time || "Just now"}</p>
                        </div>
                        {badgeText && (
                          <Badge className="gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] shadow-none">
                            <Trophy className="h-3 w-3 stroke-[2.5]" />
                            {badgeText}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="mb-4 text-sm text-foreground leading-relaxed">{post.content}</p>

                  {imageUrl && (
                    <div className="rounded-xl overflow-hidden mb-4 border border-border/50 max-h-96">
                      {imageUrl.startsWith("data:video/") ? (
                        <video src={imageUrl} controls className="w-full h-auto object-cover" />
                      ) : (
                        <ImageWithFallback
                          src={imageUrl}
                          alt="Post attachment"
                          className="w-full h-64 sm:h-80 object-cover"
                        />
                      )}
                    </div>
                  )}

                  {/* Actions Toolbar */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-border/50">
                    <div className="flex gap-4 sm:gap-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleLike(post)}
                        className={`gap-2 text-xs font-bold ${
                          isLiked ? "text-rose-500 hover:text-rose-600" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                        <span>{post.likes || 0}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleComments(post.id)}
                        className={`gap-2 text-xs font-bold ${
                          isCommentsOpen ? "text-blue-500" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comments || 0}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSharePost(post)}
                        className="gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>{post.shares || 0}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Comments Drawer */}
                  {isCommentsOpen && (
                    <div className="mt-4 pt-4 border-t border-border/40 space-y-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border border-emerald-500/20">
                          {userAvatar ? (
                            <AvatarImage src={userAvatar} className="object-cover" />
                          ) : (
                            <AvatarFallback className="text-[10px] font-bold text-emerald-600">
                              {displayInitials}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 flex gap-2">
                          <Input
                            value={commentInputs[post.id] || ""}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            placeholder="Write a comment..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddComment(post);
                            }}
                            className="h-8 text-xs bg-muted/30 rounded-xl"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddComment(post)}
                            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 rounded-xl"
                          >
                            <Send className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Display Comments List */}
                      {commentsList.length > 0 && (
                        <div className="space-y-2.5 pt-2 pl-3 border-l-2 border-emerald-500/20">
                          {commentsList.map((cmt, cIdx) => (
                            <div key={cIdx} className="text-xs space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-foreground">{cmt.author}</span>
                                <span className="text-[10px] text-muted-foreground">{cmt.time}</span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300">{cmt.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-3.5">
        {/* Stats */}
        <Card className="border-border/50">
          <CardContent className="p-4 sm:p-4.5">
            <h3 className="text-base font-bold mb-2.5 text-foreground">Your Activity</h3>
            <div className="space-y-2.5">
              {[
                { label: "Posts", value: `${postsList.filter(p => p.author === userName).length}` },
                { label: "Following", value: "156" },
                { label: "Followers", value: "342" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <span className="font-extrabold text-foreground">{stat.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trending Topics */}
        <Card className="border-border/50">
          <CardContent className="p-4 sm:p-4.5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-bold text-foreground">Trending Topics</h3>
            </div>
            <div className="space-y-3">
              {trendingTopics.map((topic) => (
                <button
                  key={topic.name}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <p className="font-bold text-xs text-foreground mb-1">#{topic.name}</p>
                  <p className="text-xs text-muted-foreground">{topic.posts}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggested Connections */}
        <Card className="border-border/50">
          <CardContent className="p-4 sm:p-4.5">
            <h3 className="text-base font-bold mb-2.5 text-foreground">Suggested Players</h3>
            <div className="space-y-3">
              {displaySuggestions.map((name) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-emerald-500/20">
                      <AvatarFallback className="text-xs bg-transparent border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold">
                        {name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">Cricket</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold border-emerald-500/30 text-emerald-600 hover:bg-emerald-50">
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
