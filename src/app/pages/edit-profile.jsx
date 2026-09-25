import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../providers/auth-provider";
import { profileService } from "../services/profile.service";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  User,
  MapPin,
  Check,
  ChevronLeft,
  Trophy,
  Upload,
  Phone,
  Trash2,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { isValidProfileImage } from "../components/ui/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

const sportsOptions = [
  { id: "football", name: "Football", emoji: "⚽" },
  { id: "cricket", name: "Cricket", emoji: "🏏" },
  { id: "badminton", name: "Badminton", emoji: "🏸" },
  { id: "tennis", name: "Tennis", emoji: "🎾" },
  { id: "basketball", name: "Basketball", emoji: "🏀" },
  { id: "swimming", name: "Swimming", emoji: "🏊" },
  { id: "gym", name: "Gym & Fitness", emoji: "🏋️" },
  { id: "volleyball", name: "Volleyball", emoji: "🏐" },
  { id: "tabletennis", name: "Table Tennis", emoji: "🏓" },
  { id: "baseball", name: "Baseball", emoji: "⚾" },
];

export function EditProfilePage() {
  const navigate = useNavigate();
  const { currentUser, updateUser, deleteAccount, logout } = useAuth();

  // Form State
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [selectedSports, setSelectedSports] = useState([]);
  const [profilePicture, setProfilePicture] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      toast.error("Please type DELETE to confirm account deletion.");
      return;
    }
    try {
      setIsDeleting(true);
      await profileService.deleteAccount(currentUser);
      if (typeof deleteAccount === "function") {
        await deleteAccount();
      } else {
        logout();
      }
      toast.success("Your player account has been permanently removed from database.");
      setDeleteOpen(false);
      navigate("/login");
    } catch (err) {
      console.error("Delete account error:", err);
      toast.error(err.message || "Failed to delete account from database");
    } finally {
      setIsDeleting(false);
    }
  };

  // Load current values
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || "");
      setCity(currentUser.city || "");
      setPhone(currentUser.phone || "");
      setBio(currentUser.bio || "");
      setSelectedSports(currentUser.selectedSports || []);
      setProfilePicture(isValidProfileImage(currentUser.profilePicture) ? currentUser.profilePicture : "");
    }
  }, [currentUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB limit. Please upload a smaller image.");
        e.target.value = null;
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSport = (sportId) => {
    setSelectedSports((prev) =>
      prev.includes(sportId)
        ? prev.filter((id) => id !== sportId)
        : [...prev, sportId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsSubmitting(true);
    // Premium simulated delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const result = await updateUser({
      fullName,
      city,
      phone,
      bio,
      selectedSports,
      profilePicture,
    });

    setIsSubmitting(false);
    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } else {
      alert("Failed to update profile: " + result.error);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto pt-0 pb-6 px-4 text-foreground">
      <div className="w-full space-y-3">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors -mt-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Profile
        </Link>

        <div className="border border-border/50 bg-card/65 backdrop-blur-2xl rounded-2xl pt-3.5 pb-5 px-4 sm:pt-4 sm:pb-6 sm:px-7 shadow-lg relative overflow-hidden">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-4"
            >
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center">
                <Check className="h-8 w-8 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">Profile Updated!</h2>
                <p className="text-muted-foreground text-sm">
                  Your changes have been saved successfully. Redirecting...
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3.5">
              <div className="space-y-0.5">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Edit Profile
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Update your display details and sports preferences below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2.5">
                {/* Profile Picture Uploader */}
                <div className="flex flex-col items-center gap-1 mb-0.5">
                  <div className="relative group">
                    <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-border bg-background flex items-center justify-center relative shadow-inner">
                      {isValidProfileImage(profilePicture) ? (
                        <img
                          src={profilePicture}
                          alt="Profile Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xl text-muted-foreground font-bold uppercase">
                          {fullName ? fullName.trim().split(/\s+/).map(n => n[0]).join("").slice(0, 2) : "U"}
                        </span>
                      )}
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-opacity">
                        <Upload className="h-3.5 w-3.5 mb-0.5" />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Click image to upload avatar</p>
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="fullName" className="text-xs font-semibold">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      className="pl-8.5 h-8.5 rounded-lg border-border bg-background/50 focus-visible:bg-background text-xs sm:text-sm"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-0.5">
                    <Label htmlFor="city" className="text-xs font-semibold">City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="city"
                        type="text"
                        className="pl-8.5 h-8.5 rounded-lg border-border bg-background/50 focus-visible:bg-background text-xs sm:text-sm"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        className="pl-8.5 h-8.5 rounded-lg border-border bg-background/50 focus-visible:bg-background text-xs sm:text-sm"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 "
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="bio" className="text-xs font-semibold">Bio</Label>
                  <textarea
                    id="bio"
                    className="w-full min-h-[60px] p-2 text-xs sm:text-sm rounded-lg border border-border bg-background/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    placeholder="Tell us a bit about your play style or favorite turfs..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Sports Preferences</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {sportsOptions.map((sport) => {
                      const isSelected = selectedSports.includes(sport.id);
                      return (
                        <button
                          key={sport.id}
                          type="button"
                          onClick={() => toggleSport(sport.id)}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/10 text-foreground font-semibold"
                              : "border-border bg-background/30 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                          }`}
                        >
                          <span className="text-sm leading-none">
                            {sport.emoji}
                          </span>
                          <span className="truncate text-xs leading-tight">
                            {sport.name}
                          </span>
                          {isSelected && (
                            <div className="ml-auto h-3.5 w-3.5 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                              <Check className="h-2 w-2 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Link to="/profile" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10 rounded-xl border-border font-semibold text-xs sm:text-sm"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isSubmitting || !fullName.trim()}
                    className="flex-1 h-10 rounded-xl border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent hover:bg-emerald-500/10 font-bold text-xs sm:text-sm cursor-pointer transition-all"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-3.5 w-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>

                {/* Danger Zone: Permanently Delete Account */}
                <div className="mt-5 pt-3.5 border-t border-rose-500/20 rounded-xl bg-rose-500/5 p-3.5 border border-dashed">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <Trash2 className="w-3.5 h-3.5" /> Danger Zone: Delete Account
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Permanently removes your athlete profile and all associated data.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setDeleteOpen(true)}
                      className="text-xs h-8 px-3 rounded-lg border border-rose-500/70 bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 shrink-0 font-bold cursor-pointer transition-all shadow-none"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Delete Account Confirmation Dialog */}
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-rose-600 font-black">
                  <Trash2 className="h-5 w-5" /> Permanently Delete Account
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
                  Are you sure you want to delete your SportXClub player account?
                  <br /><br />
                  <strong className="text-rose-500 font-bold">Important:</strong> All your personal details, match records, wallet balance, active bookings, and reviews will be <strong>permanently deleted from our MySQL database</strong>. This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <p className="text-xs text-muted-foreground font-medium">
                  Please type <strong className="text-foreground font-mono font-bold">DELETE</strong> to confirm:
                </p>
                <Input
                  type="text"
                  placeholder="Type DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="text-xs font-mono uppercase tracking-wider"
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => { setDeleteOpen(false); setDeleteConfirmText(""); }}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteConfirmText.trim().toUpperCase() !== "DELETE" || isDeleting}
                  onClick={handleDeleteAccount}
                  className="bg-rose-600 hover:bg-rose-700 font-bold text-white cursor-pointer"
                >
                  {isDeleting ? "Deleting from Database..." : "Permanently Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
