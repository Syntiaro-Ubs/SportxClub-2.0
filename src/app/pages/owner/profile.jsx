import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../providers/auth-provider";
import { Mail, Phone, MapPin, Building2, Briefcase, Camera, Edit2, Hash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";

import { useOutletContext } from "react-router";

export function OwnerProfile() {
  const { activeProfile, setDemoProfile } = useOutletContext();
  const { currentUser, updateUser } = useAuth();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: activeProfile?.fullName || "",
    phone: activeProfile?.phone || "",
    bio: activeProfile?.bio || "",
    profilePicture: activeProfile?.profilePicture || "",
  });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          setEditFormData(prev => ({ ...prev, profilePicture: compressedBase64 }));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    try {
      if (currentUser) {
        updateUser(editFormData);
      } else {
        localStorage.setItem("mockOwnerProfile", JSON.stringify(editFormData));
        if (setDemoProfile) setDemoProfile(editFormData);
      }
      toast.success("Profile updated successfully!");
      setIsEditProfileOpen(false);
    } catch (error) {
      toast.error("Failed to save profile. Image might be too large.");
    }
  };

  const ownerName = activeProfile?.fullName || "Turf Owner";
  const ownerEmail = activeProfile?.email || "owner@sportxclub.com";
  const getInitials = (name) => {
    if (!name) return "TO";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-16 px-1">
      {/* 1. Avatar & Owner Title Header Section */}
      <div className="px-1 sm:px-2">
        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4">

          {/* Left Block: Avatar + Name + Badges */}
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 text-center sm:text-left w-full sm:w-auto">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 border-border/60 shadow-lg ring-2 ring-emerald-500/20 bg-background shrink-0">
              {activeProfile?.profilePicture ? (
                <AvatarImage src={activeProfile.profilePicture} className="object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 text-2xl font-black rounded-full">
                  {getInitials(ownerName)}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="space-y-1 mt-1 sm:mt-0 sm:pb-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{ownerName}</h1>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-lg shrink-0">
                  Verified Owner
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-semibold max-w-md">
                {activeProfile?.bio || "Professional Turf Manager & Sports Enthusiast"}
              </p>
            </div>
          </div>

          {/* Right Block: Edit Profile CTA Button */}
          <div className="w-full sm:w-auto flex justify-center sm:justify-end sm:pb-2">
            <Button
              onClick={() => setIsEditProfileOpen(true)}
              className="w-full sm:w-auto h-10 px-5 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 bg-transparent border-none shadow-none hover:bg-transparent hover:text-emerald-700 dark:hover:text-emerald-300"
            >
              <Edit2 className="h-4 w-4 text-emerald-500" />
              Edit Profile
            </Button>
          </div>

        </div>
      </div>

      {/* 3. Personal & Business Information Grid */}
      <div className="grid gap-5 md:grid-cols-3 pt-2">

        {/* Card 1: Personal Details */}
        <Card className="md:col-span-1 border border-border/40 bg-card/60 backdrop-blur-xl shadow-lg rounded-3xl p-5 space-y-4">
          <div className="border-b border-border/40 pb-3">
            <h3 className="text-base font-bold text-foreground">Personal Details</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Contact credentials & location</p>
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-muted/20 border border-border/30">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</p>
                <p className="text-xs font-bold text-foreground truncate">{ownerEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-muted/20 border border-border/30">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Phone className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone Number</p>
                <p className="text-xs font-bold text-foreground">{activeProfile?.phone || "+91 98765 43210"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-muted/20 border border-border/30">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <MapPin className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">City / Location</p>
                <p className="text-xs font-bold text-foreground">Mumbai, India</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Business Profile */}
        <Card className="md:col-span-2 border border-border/40 bg-card/60 backdrop-blur-xl shadow-lg rounded-3xl p-5 space-y-4">
          <div className="border-b border-border/40 pb-3">
            <h3 className="text-base font-bold text-foreground">Business Profile</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Manage your registered sports venue entity</p>
          </div>

          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-2xl border border-border/40 bg-muted/20 space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <Building2 className="h-4 w-4" /> Company Name
                </div>
                <p className="text-sm font-extrabold text-foreground">{ownerName} Sports Pvt. Ltd.</p>
              </div>

              <div className="p-3.5 rounded-2xl border border-border/40 bg-muted/20 space-y-1">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
                  <Briefcase className="h-4 w-4" /> Business Registration
                </div>
                <p className="text-sm font-extrabold font-mono text-foreground">SPORTX-2026-98X2</p>
              </div>

              <div className="p-3.5 rounded-2xl border border-border/40 bg-muted/20 space-y-1">
                <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-xs">
                  <Hash className="h-4 w-4" /> Customer ID
                </div>
                <p className="text-sm font-extrabold font-mono text-foreground">2607 0001</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/40">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">About the Venue Brand</h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Dedicated to providing premium quality sports infrastructure to local communities.
                We manage highly rated multi-sport arenas with professional-grade synthetic turf,
                floodlights, and top-tier amenities.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Photo</Label>
              <div className="col-span-3 flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {editFormData.profilePicture ? (
                    <AvatarImage src={editFormData.profilePicture} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(editFormData.fullName || "Turf Owner")}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Label htmlFor="picture-upload" className="cursor-pointer bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Upload new
                </Label>
                <Input
                  id="picture-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">
                Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={editFormData.fullName}
                onChange={handleEditChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={editFormData.phone}
                onChange={handleEditChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right">
                Bio
              </Label>
              <Input
                id="bio"
                name="bio"
                value={editFormData.bio}
                onChange={handleEditChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
