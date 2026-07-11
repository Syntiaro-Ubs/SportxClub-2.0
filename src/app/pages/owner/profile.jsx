import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../providers/auth-provider";
import { Mail, Phone, MapPin, Building2, Briefcase, Camera, Edit2 } from "lucide-react";
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-muted h-48 sm:h-64 shadow-xl">
        <div className="absolute inset-0 bg-grid-white/10" />
      </div>

      <div className="px-4 sm:px-6 relative -mt-20 sm:-mt-24">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
          <div className="relative">
            <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-background shadow-2xl ring-2 ring-primary/20">
              {activeProfile.profilePicture ? (
                <AvatarImage src={activeProfile.profilePicture} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">
                  {getInitials(ownerName)}
                </AvatarFallback>
              )}
            </Avatar>
            <Button size="icon" variant="secondary" className="absolute bottom-2 right-2 rounded-full shadow-lg hover:shadow-xl transition-all">
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 text-center sm:text-left space-y-2 mb-4 sm:mb-6">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{ownerName}</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                Verified Owner
              </Badge>
              <Button size="sm" variant="outline" className="ml-auto flex items-center gap-2" onClick={() => setIsEditProfileOpen(true)}>
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
            <p className="text-muted-foreground text-lg">{activeProfile?.bio || "Professional Turf Manager & Sports Enthusiast"}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Personal Details */}
        <Card className="md:col-span-1 border-border/50 bg-card/40 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Your contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="font-semibold truncate">{ownerEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="font-semibold">{activeProfile?.phone || "+91 98765 43210"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="font-semibold">Mumbai, India</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Profile */}
        <Card className="md:col-span-2 border-border/50 bg-card/40 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>Manage your business presence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2 p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium text-sm">Company Name</span>
                </div>
                <p className="text-lg font-semibold">{ownerName} Sports Pvt. Ltd.</p>
              </div>
              <div className="space-y-2 p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="font-medium text-sm">Business Registration No.</span>
                </div>
                <p className="text-lg font-semibold font-mono">SPORTX-2026-98X2</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">About the Business</h3>
              <p className="text-muted-foreground leading-relaxed">
                Dedicated to providing premium quality sports infrastructure to local communities. 
                We manage highly rated multi-sport arenas with professional-grade synthetic turf, 
                floodlights, and top-tier amenities.
              </p>
            </div>
          </CardContent>
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
