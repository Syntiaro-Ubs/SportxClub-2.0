import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../providers/auth-provider";
import { motion } from "motion/react";
import {
  User,
  MapPin,
  Check,
  ChevronLeft,
  Trophy,
  Upload,
  Phone,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Container } from "../components/ui/container";

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
  const { currentUser, updateUser } = useAuth();

  // Form State
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [selectedSports, setSelectedSports] = useState([]);
  const [profilePicture, setProfilePicture] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Load current values
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || "");
      setCity(currentUser.city || "");
      setPhone(currentUser.phone || "");
      setBio(currentUser.bio || "");
      setSelectedSports(currentUser.selectedSports || []);
      setProfilePicture(currentUser.profilePicture || "");
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
    
    const result = updateUser({
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
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative overflow-hidden text-foreground">
      {/* Dynamic backdrop glows */}
      <div className="absolute top-[10%] left-[10%] w-72 h-72 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[10%] right-[10%] w-72 h-72 rounded-full bg-primary/5 blur-[100px] pointer-events-none animate-pulse" />

      <Container className="w-full max-w-xl z-10 space-y-6">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Profile
        </Link>

        <div className="border border-border/50 bg-card/65 backdrop-blur-2xl rounded-[32px] p-6 sm:p-10 shadow-[0_28px_60px_-24px_rgba(0,0,0,0.15)] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-4"
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
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Edit Profile
                </h1>
                <p className="text-sm text-muted-foreground">
                  Update your display details and sports preferences below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Profile Picture Uploader */}
                <div className="flex flex-col items-center gap-2 mb-2">
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 bg-background flex items-center justify-center relative shadow-inner">
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt="Profile Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl text-muted-foreground font-bold uppercase">
                          {fullName ? fullName.trim().split(/\s+/).map(n => n[0]).join("").slice(0, 2) : "U"}
                        </span>
                      )}
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-opacity">
                        <Upload className="h-5 w-5 mb-1" />
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
                  <p className="text-[11px] text-muted-foreground">Click image to upload avatar</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      className="pl-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                    <Input
                      id="city"
                      type="text"
                      className="pl-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      className="pl-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 "
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="w-full min-h-[80px] p-3 text-sm rounded-xl border border-border bg-background/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    placeholder="Tell us a bit about your play style or favorite turfs..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div className="space-y-2.5">
                  <Label>Sports Preferences</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
                    {sportsOptions.map((sport) => {
                      const isSelected = selectedSports.includes(sport.id);
                      return (
                        <button
                          key={sport.id}
                          type="button"
                          onClick={() => toggleSport(sport.id)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left text-sm transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-background/30 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                          }`}
                        >
                          <span className="text-base leading-none">
                            {sport.emoji}
                          </span>
                          <span className="truncate text-xs font-semibold leading-tight">
                            {sport.name}
                          </span>
                          {isSelected && (
                            <div className="ml-auto h-4 w-4 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Link to="/profile" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 rounded-full border-border"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !fullName.trim()}
                    className="flex-1 h-11 rounded-full bg-[#6DFF3B] text-black hover:bg-[#86ff60] font-bold hover:shadow-lg hover:shadow-[#6DFF3B]/20 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
