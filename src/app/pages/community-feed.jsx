import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Copy, Heart, Image as ImageIcon, Link2, MessageCircle, MessageSquare, MoreHorizontal, Send, Share2, Trophy, TrendingUp, Video, X } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../providers/auth-provider";
import { cmsService } from "../services/cms-service";
import { toast } from "sonner";

const formatTime = (value) => {
  if (!value) return "Just now";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const initials = (name) => String(name || "?").split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

function ShareLogo({ platform }) {
  if (platform === "whatsapp") {
    return (
      <svg className="h-8 w-8 shrink-0 transition-transform duration-200" style={{ fill: "#25D366" }} viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    );
  }
  if (platform === "facebook") {
    return (
      <svg className="h-8 w-8 shrink-0 transition-transform duration-200" style={{ fill: "#1877F2" }} viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }
  if (platform === "x") {
    return (
      <svg className="h-7 w-7 shrink-0 transition-transform duration-200 text-slate-900 dark:text-white" style={{ fill: "currentColor" }} viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (platform === "telegram") {
    return (
      <svg className="h-8 w-8 shrink-0 transition-transform duration-200" style={{ fill: "#229ED9" }} viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.97 9.28c-.15.67-.54.83-1.1.52l-3.02-2.23-1.46 1.4c-.16.16-.3.3-.6.3l.21-3.05 5.56-5.02c.24-.22-.05-.34-.37-.13l-6.87 4.33-2.96-.92c-.64-.2-.65-.64.14-.95l11.57-4.46c.53-.2 1 .13.87.93z" />
      </svg>
    );
  }
  if (platform === "linkedin") {
    return (
      <svg className="h-8 w-8 shrink-0 transition-transform duration-200" style={{ fill: "#0A66C2" }} viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    );
  }
  return <Share2 className="h-7 w-7 text-emerald-600" />;
}

export function CommunityFeed() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [sharePost, setSharePost] = useState(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [media, setMedia] = useState(null);
  const [posting, setPosting] = useState(false);

  const userName = currentUser?.fullName || currentUser?.name || "";
  const userAvatar = currentUser?.profilePicture || currentUser?.avatar || currentUser?.photoURL || null;

  const checkAuth = () => {
    if (!currentUser) {
      toast.error("Please login first to post, like, comment, or share.");
      navigate("/player-login");
      return false;
    }
    return true;
  };

  const loadPosts = useCallback(async () => {
    try {
      const data = await cmsService.getPosts(currentUser);
      setPosts(data);
      setLikedPosts(Object.fromEntries(data.map((post) => [post.id, Boolean(post.liked_by_user)])));
    } catch (error) {
      toast.error(error.message || "Unable to load community posts.");
    }
  }, [currentUser]);

  useEffect(() => {
    const timer = setTimeout(() => loadPosts(), 0);
    return () => clearTimeout(timer);
  }, [loadPosts]);

  const activity = (() => {
    const ownPosts = posts.filter((post) => (currentUser?.id && post.author_user_id === currentUser.id) || post.author === userName);
    return {
      posts: ownPosts.length,
      likes: ownPosts.reduce((sum, post) => sum + Number(post.likes || 0), 0),
      comments: ownPosts.reduce((sum, post) => sum + Number(post.comments || 0), 0),
      shares: ownPosts.reduce((sum, post) => sum + Number(post.shares || 0), 0),
    };
  })();

  const handleMedia = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setMedia({ url: reader.result, type: file.type.startsWith("video/") ? "video" : "image", name: file.name });
    reader.readAsDataURL(file);
  };

  const createPost = async () => {
    if (!checkAuth()) return;
    if (!newContent.trim() && !media) return toast.error("Add text or media before posting.");
    try {
      setPosting(true);
      const created = await cmsService.createPost({
        author_user_id: currentUser.id,
        author: userName,
        author_avatar: userAvatar,
        content: newContent.trim(),
        image_url: media?.url || null,
        type: media?.type || "general",
        badge: "Community",
      });
      setPosts((previous) => [created, ...previous]);
      setLikedPosts((previous) => ({ ...previous, [created.id]: false }));
      setNewContent("");
      setMedia(null);
      toast.success("Post published.");
    } catch (error) {
      toast.error(error.message || "Unable to publish post.");
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (post) => {
    if (!checkAuth()) return;
    try {
      const result = await cmsService.togglePostLike(post.id, currentUser);
      setLikedPosts((previous) => ({ ...previous, [post.id]: result.liked }));
      setPosts((previous) => previous.map((item) => item.id === post.id ? result.post : item));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleComments = async (postId) => {
    if (!checkAuth()) return;
    const opening = !openComments[postId];
    setOpenComments((previous) => ({ ...previous, [postId]: opening }));
    if (opening && !Object.prototype.hasOwnProperty.call(comments, postId)) {
      try {
        const loadedComments = await cmsService.getPostComments(postId);
        setComments((previous) => ({ ...previous, [postId]: loadedComments }));
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const addComment = async (post) => {
    if (!checkAuth()) return;
    const text = String(commentInputs[post.id] || "").trim();
    if (!text) return;
    try {
      const result = await cmsService.addPostComment(post.id, currentUser, text);
      setComments((previous) => ({ ...previous, [post.id]: [...(previous[post.id] || []), result.comment] }));
      setPosts((previous) => previous.map((item) => item.id === post.id ? result.post : item));
      setCommentInputs((previous) => ({ ...previous, [post.id]: "" }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const postUrl = (post) => `${window.location.origin}/community#post-${post.id}`;
  const shareText = (post) => `${post.content || "Community post"} ${postUrl(post)}`;

  const recordShare = async (platform) => {
    if (!sharePost || !checkAuth()) return false;
    try {
      setShareBusy(true);
      const result = await cmsService.recordPostShare(sharePost.id, currentUser, platform);
      setPosts((previous) => previous.map((item) => item.id === sharePost.id ? result.post : item));
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    } finally {
      setShareBusy(false);
    }
  };

  const copyLink = async () => {
    if (!sharePost) return;
    try {
      await navigator.clipboard.writeText(postUrl(sharePost));
      if (await recordShare("copy")) toast.success("Post link copied.");
    } catch {
      toast.error("Clipboard access was blocked by the browser.");
    }
  };

  const shareTo = async (platform, url) => {
    if (await recordShare(platform)) window.open(url, "_blank", "noopener,noreferrer");
  };

  const moreShare = async () => {
    if (!sharePost || !navigator.share) return copyLink();
    try {
      await navigator.share({ title: "SportXClub community post", text: shareText(sharePost), url: postUrl(sharePost) });
      await recordShare("native");
    } catch (error) {
      if (error?.name !== "AbortError") toast.error("Share was not completed.");
    }
  };

  const displayInitials = initials(userName);

  return (
    <div className="grid lg:grid-cols-3 gap-5 sm:gap-6 -mt-1 sm:-mt-2">
      <input ref={fileInputRef} type="file" onChange={handleMedia} accept="image/*,video/*" className="hidden" />

      <Dialog open={Boolean(sharePost)} onOpenChange={(open) => !open && setSharePost(null)}>
        <DialogContent className="sm:max-w-md isolate overflow-hidden rounded-[30px] border border-slate-200 bg-white p-0 opacity-100 shadow-[0_28px_90px_rgba(15,23,42,0.28),0_10px_30px_rgba(16,185,129,0.16)]">
          <div className="relative overflow-hidden p-6 sm:p-7">
            <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-emerald-200/40 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-sky-200/30 blur-3xl" />
            <DialogHeader className="relative z-10 pr-8"><div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-white bg-white/80 text-emerald-600 shadow-[inset_0_1px_0_white,0_8px_18px_rgba(16,185,129,0.16)]"><Share2 className="h-6 w-6" /></div><DialogTitle className="text-2xl font-black tracking-tight text-slate-900">Share this post</DialogTitle><DialogDescription className="text-slate-500">Choose an app or copy the link. Completed shares are saved to the database.</DialogDescription></DialogHeader>
            {sharePost && <div className="relative z-10 mt-5 space-y-5">
              <div className="rounded-2xl border border-white/90 bg-white/75 p-3 shadow-[inset_0_1px_0_white,0_10px_24px_rgba(15,23,42,0.08)]"><div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400"><Link2 className="h-3.5 w-3.5 text-emerald-500" /> Post link</div><div className="flex gap-2"><Input readOnly value={postUrl(sharePost)} className="h-10 border-slate-200 bg-white/85 text-xs text-slate-600 shadow-inner" /><Button disabled={shareBusy} onClick={copyLink} aria-label="Copy post link" title="Copy post link" className="h-10 w-10 shrink-0 rounded-xl bg-slate-900 p-0 text-white shadow-[0_5px_0_#cbd5e1] hover:bg-slate-800"><Copy className="h-4 w-4" /></Button></div></div>
              <div><p className="mb-3 text-xs font-bold text-slate-500">Share via</p><div className="grid grid-cols-5 gap-3">
                <Button disabled={shareBusy} onClick={() => shareTo("whatsapp", `https://wa.me/?text=${encodeURIComponent(shareText(sharePost))}`)} aria-label="Share on WhatsApp" title="WhatsApp" className="h-14 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200 shadow-none"><ShareLogo platform="whatsapp" /><span className="sr-only">WhatsApp</span></Button>
                <Button disabled={shareBusy} onClick={() => shareTo("facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl(sharePost))}`)} aria-label="Share on Facebook" title="Facebook" className="h-14 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-200 shadow-none"><ShareLogo platform="facebook" /><span className="sr-only">Facebook</span></Button>
                <Button disabled={shareBusy} onClick={() => shareTo("x", `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText(sharePost))}`)} aria-label="Share on X" title="X" className="h-14 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400/40 hover:scale-105 active:scale-95 transition-all duration-200 shadow-none"><ShareLogo platform="x" /><span className="sr-only">X</span></Button>
                <Button disabled={shareBusy} onClick={() => shareTo("telegram", `https://t.me/share/url?url=${encodeURIComponent(postUrl(sharePost))}&text=${encodeURIComponent(sharePost.content || "")}`)} aria-label="Share on Telegram" title="Telegram" className="h-14 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-sky-500/40 hover:scale-105 active:scale-95 transition-all duration-200 shadow-none"><ShareLogo platform="telegram" /><span className="sr-only">Telegram</span></Button>
                <Button disabled={shareBusy} onClick={() => shareTo("linkedin", `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl(sharePost))}`)} aria-label="Share on LinkedIn" title="LinkedIn" className="h-14 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-600/40 hover:scale-105 active:scale-95 transition-all duration-200 shadow-none"><ShareLogo platform="linkedin" /><span className="sr-only">LinkedIn</span></Button>
              </div></div>
              <div className="grid grid-cols-2 gap-3"><Button disabled={shareBusy} onClick={copyLink} variant="outline" className="h-11 rounded-2xl border-white bg-white/80 font-bold text-slate-700 shadow-[0_5px_0_#cbd5e1] hover:bg-white"><Copy className="mr-2 h-4 w-4 text-emerald-600" />Copy link</Button><Button disabled={shareBusy} onClick={moreShare} variant="outline" className="h-11 rounded-2xl border-white bg-white/80 font-bold text-slate-700 shadow-[0_5px_0_#cbd5e1] hover:bg-white"><MoreHorizontal className="mr-2 h-4 w-4 text-slate-500" />More apps</Button></div>
            </div>}
          </div>
        </DialogContent>
      </Dialog>

      <div className="lg:col-span-2 space-y-4">
        <div><h1 className="text-xl font-extrabold tracking-tight">Community Feed</h1><p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Stay connected with the sports community</p></div>

        <Card className="border-border/50"><CardContent className="p-4"><div className="flex gap-3"><Avatar className="bg-background border border-emerald-500/30"><AvatarImage src={userAvatar || undefined} /><AvatarFallback className="border-2 border-emerald-500 text-emerald-600 font-bold">{displayInitials}</AvatarFallback></Avatar><div className="flex-1 space-y-3"><Textarea value={newContent} onChange={(event) => setNewContent(event.target.value)} onFocus={() => !currentUser && checkAuth()} placeholder="Share your sports moment..." className="min-h-[80px] resize-none" />{media && <div className="flex items-center justify-between rounded-xl border p-2"><span className="text-xs truncate">{media.name}</span><Button size="sm" variant="ghost" onClick={() => setMedia(null)}><X className="h-4 w-4" /></Button></div>}<div className="flex items-center justify-between"><div className="flex gap-2"><Button type="button" onClick={() => { if (checkAuth()) fileInputRef.current?.click(); }} variant="ghost" size="sm" className="gap-1.5 rounded-xl text-xs text-emerald-600 border border-emerald-500/20"><ImageIcon className="h-4 w-4" />Photo</Button><Button type="button" onClick={() => { if (checkAuth()) fileInputRef.current?.click(); }} variant="ghost" size="sm" className="gap-1.5 rounded-xl text-xs text-emerald-600 border border-emerald-500/20"><Video className="h-4 w-4" />Video</Button></div><Button onClick={createPost} disabled={posting || (!newContent.trim() && !media)} className="rounded-xl px-6 h-9 bg-emerald-600 text-white">{posting ? "Posting..." : "Post"}</Button></div></div></div></CardContent></Card>

        <div className="space-y-4">{posts.length ? posts.map((post) => {
          const imageUrl = post.image || post.image_url;
          const isLiked = Boolean(likedPosts[post.id]);
          const commentList = comments[post.id] || [];
          const badgeText = post.badge || "Community";
          return <Card key={post.id} id={`post-${post.id}`} className="border-border/50"><CardContent className="p-4 sm:p-4.5"><div className="flex items-start gap-3 mb-4"><Avatar className="border border-emerald-500/20"><AvatarImage src={post.author_avatar || undefined} /><AvatarFallback className="border-2 border-emerald-500 text-emerald-600 font-bold">{initials(post.author)}</AvatarFallback></Avatar><div className="flex-1"><div className="flex items-center justify-between"><div><p className="font-bold text-sm">{post.author}</p><p className="text-xs text-muted-foreground">{post.time || formatTime(post.created_at)}</p></div><Badge className="gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 font-bold text-[10px]"><Trophy className="h-3 w-3" />{badgeText}</Badge></div></div></div><p className="mb-4 text-sm leading-relaxed">{post.content}</p>{imageUrl && <div className="rounded-xl overflow-hidden mb-4 border border-border/50 max-h-96">{imageUrl.startsWith("data:video/") ? <video src={imageUrl} controls className="w-full h-auto object-cover" /> : <ImageWithFallback src={imageUrl} alt="Post attachment" className="w-full h-64 sm:h-80 object-cover" />}</div>}<div className="flex items-center justify-between pt-2.5 border-t border-border/50"><div className="flex gap-4 sm:gap-6"><Button variant="ghost" size="sm" onClick={() => toggleLike(post)} className={`gap-2 text-xs font-bold ${isLiked ? "text-rose-500" : "text-muted-foreground"}`}><Heart className={`h-4 w-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} /><span>{Number(post.likes || 0)}</span></Button><Button variant="ghost" size="sm" onClick={() => toggleComments(post.id)} className="gap-2 text-xs font-bold text-muted-foreground"><MessageSquare className="h-4 w-4" /><span>{Number(post.comments || 0)}</span></Button><Button variant="ghost" size="sm" onClick={() => setSharePost(post)} className="gap-2 text-xs font-bold text-muted-foreground"><Share2 className="h-4 w-4" /><span>{Number(post.shares || 0)}</span></Button></div></div>{openComments[post.id] && <div className="mt-4 pt-4 border-t border-border/40 space-y-3"><div className="flex items-center gap-2"><Avatar className="h-8 w-8 border border-emerald-500/20"><AvatarImage src={userAvatar || undefined} /><AvatarFallback className="text-[10px] font-bold text-emerald-600">{displayInitials}</AvatarFallback></Avatar><div className="flex-1 flex gap-2"><Input value={commentInputs[post.id] || ""} onChange={(event) => setCommentInputs((previous) => ({ ...previous, [post.id]: event.target.value }))} onKeyDown={(event) => event.key === "Enter" && addComment(post)} placeholder="Write a comment..." className="h-8 text-xs rounded-xl" /><Button size="sm" onClick={() => addComment(post)} className="h-8 bg-emerald-600 text-white"><Send className="w-3 h-3" /></Button></div></div>{commentList.length ? <div className="space-y-2.5 pt-2 pl-3 border-l-2 border-emerald-500/20">{commentList.map((comment) => <div key={comment.id} className="text-xs"><div className="flex items-center gap-2"><span className="font-extrabold">{comment.author}</span><span className="text-[10px] text-muted-foreground">{formatTime(comment.createdAt)}</span></div><p>{comment.text}</p></div>)}</div> : <p className="text-xs text-muted-foreground">No comments yet.</p>}</div>}</CardContent></Card>;
        }) : <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">No community posts have been published yet.</CardContent></Card>}</div>
      </div>

      <div className="space-y-3.5"><Card className="border-border/50"><CardContent className="p-4 sm:p-4.5"><div className="flex items-center gap-2 mb-3"><TrendingUp className="h-5 w-5 text-emerald-600" /><h3 className="text-base font-bold">Your Activity</h3></div><div className="space-y-2.5">{Object.entries(activity).map(([label, value]) => <div key={label} className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label[0].toUpperCase() + label.slice(1)}</span><span className="font-extrabold">{value}</span></div>)}</div></CardContent></Card><Card className="border-border/50"><CardContent className="p-4 sm:p-4.5"><h3 className="text-base font-bold mb-2.5">Database-backed engagement</h3><p className="text-sm text-muted-foreground">Likes, comments, shares, and their counters are saved with each community post.</p></CardContent></Card></div>
    </div>
  );
}
