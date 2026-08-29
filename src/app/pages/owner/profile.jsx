import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../providers/auth-provider";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Edit2,
  Hash,
  ShieldAlert,
  CheckCircle2,
  Landmark,
  FileCheck,
  ShieldCheck,
  Eye,
  ExternalLink,
  Star,
  Zap,
  Car,
  ShowerHead,
  Coffee,
  CalendarCheck,
  User
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const [editFormData, setEditFormData] = useState({
    fullName: activeProfile?.fullName || "",
    phone: activeProfile?.phone || "+91 98765 43210",
    location: activeProfile?.location || "Mumbai, India",
    bio: activeProfile?.bio || "",
    profilePicture: activeProfile?.profilePicture || "",
  });

  // KYC State
  const [isKycCompleted, setIsKycCompleted] = useState(() => {
    return localStorage.getItem("ownerKycCompleted") === "true";
  });

  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(true);
  const [panVerified, setPanVerified] = useState(false);

  // OTP Verification Modal State
  const [otpModalDoc, setOtpModalDoc] = useState(null); // 'aadhaar' | 'pan' | null
  const [otpStep, setOtpStep] = useState(1); // 1: Send OTP, 2: Enter OTP
  const [otpValue, setOtpValue] = useState(["", "", "", "", "", ""]);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleOpenOtpModal = (docType) => {
    setOtpModalDoc(docType);
    setOtpStep(1);
    setOtpValue(["", "", "", "", "", ""]);
  };

  const handleSendOtp = () => {
    setOtpStep(2);
    toast.info(`OTP sent to registered mobile number for ${otpModalDoc === 'aadhaar' ? 'Aadhaar' : 'PAN'} verification!`);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otpValue];
    newOtp[index] = value;
    setOtpValue(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValue[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtpSubmit = () => {
    const code = otpValue.join("");
    if (code.length < 6) {
      toast.error("Please enter 6-digit OTP code.");
      return;
    }
    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      if (otpModalDoc === 'aadhaar') {
        setAadhaarVerified(true);
      } else {
        setPanVerified(true);
      }
      toast.success(`${otpModalDoc === 'aadhaar' ? 'Aadhaar Card' : 'PAN Card'} verified via OTP successfully!`);
      setOtpModalDoc(null);
    }, 1000);
  };

  const [kycFormData, setKycFormData] = useState({
    bankName: "HDFC Bank",
    accountHolder: activeProfile?.fullName || "Turf Owner",
    accountNumber: "50100293847581",
    confirmAccountNumber: "50100293847581",
    ifscCode: "HDFC0001234",
    panNumber: "ABCDE1234F",
    gstin: "27ABCDE1234F1Z5",
  });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKycChange = (e) => {
    const { name, value } = e.target;
    setKycFormData(prev => ({ ...prev, [name]: value }));
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

  const handleSaveProfile = async () => {
    try {
      if (currentUser) {
        await updateUser(editFormData);
      } else {
        localStorage.setItem("mockOwnerProfile", JSON.stringify(editFormData));
        if (setDemoProfile) setDemoProfile(editFormData);
      }
      toast.success("Profile updated successfully!");
      setIsEditProfileOpen(false);
    } catch (error) {
      toast.error("Failed to save profile.");
    }
  };

  const handleSaveKyc = (e) => {
    e.preventDefault();
    if (!kycFormData.accountNumber || !kycFormData.ifscCode || !kycFormData.panNumber) {
      toast.error("Please fill in all required Bank & KYC details.");
      return;
    }
    if (kycFormData.accountNumber !== kycFormData.confirmAccountNumber) {
      toast.error("Account Numbers do not match!");
      return;
    }
    localStorage.setItem("ownerKycCompleted", "true");
    setIsKycCompleted(true);
    setIsKycModalOpen(false);
    toast.success("Bank & Owner KYC Completed Successfully!");
  };

  const ownerName = activeProfile?.fullName || editFormData.fullName || "Turf Owner";
  const ownerEmail = activeProfile?.email || "owner.google@sportxclub.com";
  const ownerPhone = activeProfile?.phone || editFormData.phone || "+91 98765 43210";
  const ownerLocation = activeProfile?.location || editFormData.location || "Mumbai, India";

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
              {activeProfile?.profilePicture || editFormData.profilePicture ? (
                <AvatarImage src={activeProfile?.profilePicture || editFormData.profilePicture} className="object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 text-2xl font-black rounded-full">
                  {getInitials(ownerName)}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="space-y-1 mt-1 sm:mt-0 sm:pb-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{ownerName}</h1>

                {/* KYC Button / Status Badge */}
                {isKycCompleted ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    KYC Completed
                  </Badge>
                ) : (
                  <Button
                    onClick={() => setIsKycModalOpen(true)}
                    className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-extrabold px-3.5 py-1 rounded-full cursor-pointer transition-all flex items-center gap-1.5 shadow-xs shrink-0 h-auto"
                  >
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                    Complete KYC
                  </Button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-semibold max-w-md">
                {activeProfile?.bio || "Professional Turf Manager & Sports Enthusiast"}
              </p>
            </div>
          </div>

          {/* Right Block: Edit Profile & Turf Preview CTA Buttons */}
          <div className="w-full sm:w-auto flex flex-wrap items-center justify-center sm:justify-end gap-2.5 sm:pb-2">
            <Button
              onClick={() => setIsPreviewModalOpen(true)}
              variant="ghost"
              className="h-9 px-3 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5 border-0 bg-transparent hover:bg-transparent shadow-none hover:text-emerald-700 dark:hover:text-emerald-300 hover:scale-105 active:scale-95"
            >
              <Eye className="h-4 w-4 text-emerald-500" />
              Turf Preview
            </Button>

            <Button
              onClick={() => setIsEditProfileOpen(true)}
              className="h-9 px-4 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 bg-transparent border-none shadow-none hover:bg-transparent hover:text-emerald-700 dark:hover:text-emerald-300 hover:scale-105 active:scale-95"
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
        <Card className="md:col-span-1 border-0 bg-transparent shadow-none p-0 space-y-4">
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
                <p className="text-xs font-bold text-muted-foreground tracking-wide">Email Address</p>
                <p className="text-xs font-bold text-foreground truncate">{ownerEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-muted/20 border border-border/30">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Phone className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground tracking-wide">Phone Number</p>
                <p className="text-xs font-bold text-foreground">{ownerPhone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-muted/20 border border-border/30">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <MapPin className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground tracking-wide">City / Location</p>
                <p className="text-xs font-bold text-foreground">{ownerLocation}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Business Profile */}
        <Card className="md:col-span-2 border-0 bg-transparent shadow-none p-0 space-y-4">
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
                <p className="text-sm font-extrabold font-mono text-foreground">
                  {currentUser?.ownerId ? `${currentUser.ownerId.slice(0, 4)} ${currentUser.ownerId.slice(4)}` : "Not Assigned"}
                </p>
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

            {/* KYC Documents Section with Proper Spacing & OTP Verification */}
            <div className="space-y-4 pt-6 border-t border-border/40 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-foreground">KYC Documents</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Government ID verification & tax compliance status</p>
                </div>
                <Badge className="text-[10px] font-bold py-1 px-2.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Fully Verified
                </Badge>
              </div>

              <div className="space-y-1.5 pt-1">
                {/* Aadhaar Card Row */}
                <div className="flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border/40 bg-card/40 hover:bg-card/70 transition-all text-xs sm:text-sm overflow-hidden">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      <FileCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground whitespace-nowrap">Aadhar Card</span>
                        {aadhaarVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
                            <CheckCircle2 className="h-3 w-3 hidden sm:block" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 shrink-0">
                            Unverified
                          </span>
                        )}
                      </div>
                      <div className="font-mono font-semibold text-muted-foreground text-[10px] sm:text-xs">
                        XXXX XXXX 1234
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => window.open("https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=1000&auto=format&fit=crop", "_blank")}
                      className="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title="View Aadhaar Card"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {!aadhaarVerified ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenOtpModal('aadhaar')}
                        className="h-7 sm:h-8 px-2 sm:px-3 rounded-lg text-[10px] sm:text-xs font-extrabold border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-transparent hover:bg-emerald-500/10 cursor-pointer shadow-none gap-1"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 hidden sm:block" /> Verify
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenOtpModal('aadhaar')}
                        className="h-7 sm:h-8 px-2 sm:px-3 rounded-lg text-[10px] sm:text-xs font-bold border-2 border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent hover:bg-emerald-500/10 cursor-pointer shadow-none gap-1 transition-all"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 hidden sm:block text-emerald-600 dark:text-emerald-400" />
                        <span>Re-verify</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* PAN Card Row */}
                <div className="flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border/40 bg-card/40 hover:bg-card/70 transition-all text-xs sm:text-sm overflow-hidden">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      <Landmark className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground whitespace-nowrap">PAN Card</span>
                        {panVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
                            <CheckCircle2 className="h-3 w-3 hidden sm:block" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 shrink-0">
                            Unverified
                          </span>
                        )}
                      </div>
                      <div className="font-mono font-semibold text-muted-foreground text-[10px] sm:text-xs">
                        ABCDE1234F
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => window.open("https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop", "_blank")}
                      className="p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title="View PAN Card"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {!panVerified ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenOtpModal('pan')}
                        className="h-7 sm:h-8 px-2 sm:px-3 rounded-lg text-[10px] sm:text-xs font-extrabold border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-transparent hover:bg-emerald-500/10 cursor-pointer shadow-none gap-1"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 hidden sm:block" /> Verify
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenOtpModal('pan')}
                        className="h-7 sm:h-8 px-2 sm:px-3 rounded-lg text-[10px] sm:text-xs font-bold border-2 border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent hover:bg-emerald-500/10 cursor-pointer shadow-none gap-1 transition-all"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 hidden sm:block text-emerald-600 dark:text-emerald-400" />
                        <span>Re-verify</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[425px] !rounded-none">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription className="text-xs">Update your personal contact details and location.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs font-bold">Photo</Label>
              <div className="col-span-3 flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  {editFormData.profilePicture ? (
                    <AvatarImage src={editFormData.profilePicture} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {getInitials(editFormData.fullName || "Turf Owner")}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Label htmlFor="picture-upload" className="cursor-pointer bg-transparent hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500 hover:border-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs">
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
              <Label htmlFor="fullName" className="text-right text-xs font-bold">
                Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={editFormData.fullName}
                onChange={handleEditChange}
                className="col-span-3 bg-transparent focus-visible:bg-transparent border border-emerald-500/40 focus-visible:border-emerald-500 focus-visible:ring-0 shadow-none selection:bg-transparent selection:text-foreground"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right text-xs font-bold">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={editFormData.phone}
                onChange={handleEditChange}
                placeholder="+91 98765 43210"
                className="col-span-3 bg-transparent focus-visible:bg-transparent border border-emerald-500/40 focus-visible:border-emerald-500 focus-visible:ring-0 shadow-none selection:bg-transparent selection:text-foreground"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right text-xs font-bold">
                Location
              </Label>
              <Input
                id="location"
                name="location"
                value={editFormData.location}
                onChange={handleEditChange}
                placeholder="Mumbai, India"
                className="col-span-3 bg-transparent focus-visible:bg-transparent border border-emerald-500/40 focus-visible:border-emerald-500 focus-visible:ring-0 shadow-none selection:bg-transparent selection:text-foreground"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right text-xs font-bold">
                Bio
              </Label>
              <Input
                id="bio"
                name="bio"
                value={editFormData.bio}
                onChange={handleEditChange}
                className="col-span-3 bg-transparent focus-visible:bg-transparent border border-emerald-500/40 focus-visible:border-emerald-500 focus-visible:ring-0 shadow-none selection:bg-transparent selection:text-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} variant="ghost" className="bg-transparent hover:bg-emerald-500/5 text-slate-900 dark:text-white border border-emerald-500 hover:border-emerald-700 font-extrabold text-xs transition-all cursor-pointer">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Turf Customer View Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="sm:max-w-[620px] !rounded-none p-0 overflow-hidden border border-border/50 shadow-2xl">
          {/* Top Banner Notice */}
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Live Customer View Preview</span>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Hero Image Card */}
            <div className="relative h-44 w-full rounded-2xl overflow-hidden group border border-border/30">
              <img
                src="/assets/venues/new_football_turf.png"
                alt="Turf Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-4 text-white">
                <div className="flex items-center justify-between">
                  <Badge className="bg-black/40 backdrop-blur-md text-emerald-400 border border-emerald-400 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5">
                    TOP RATED ARENA
                  </Badge>
                  <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.9 (128 Reviews)
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black tracking-tight text-white">{ownerName} Sports Arena</h3>
                  <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5 font-medium">
                    <MapPin className="h-3 w-3 text-emerald-400" /> {ownerLocation}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Details & Hourly Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-muted/20 border border-border/30 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground tracking-wide">Available Sports</span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <Badge className="bg-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500 text-[10px] font-bold">Football</Badge>
                  <Badge className="bg-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500 text-[10px] font-bold">Cricket</Badge>
                  <Badge className="bg-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500 text-[10px] font-bold">Badminton</Badge>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wide">Hourly Pricing</span>
                <p className="text-base font-black text-foreground">₹800 - ₹1,200 <span className="text-xs font-semibold text-muted-foreground">/ hr</span></p>
              </div>
            </div>

            {/* Amenities Included */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground tracking-wide">Customer Amenities & Features</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 border border-border/30 text-xs font-semibold">
                  <Zap className="h-3.5 w-3.5 text-amber-500" /> Floodlights
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 border border-border/30 text-xs font-semibold">
                  <Car className="h-3.5 w-3.5 text-blue-500" /> Free Parking
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 border border-border/30 text-xs font-semibold">
                  <ShowerHead className="h-3.5 w-3.5 text-cyan-500" /> Lockers & Showers
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 border border-border/30 text-xs font-semibold">
                  <Coffee className="h-3.5 w-3.5 text-rose-500" /> Refreshments
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-muted/30 p-4 border-t border-border/40 flex items-center justify-end">
            <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bank & Owner KYC Verification Modal */}
      <Dialog open={isKycModalOpen} onOpenChange={setIsKycModalOpen}>
        <DialogContent className="sm:max-w-[500px] !rounded-none p-6">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
              <DialogTitle className="text-lg font-extrabold">Bank & Owner KYC Verification</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide official bank settlement credentials and business registration info for automatic escrow payouts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveKyc} className="space-y-4 py-2">
            {/* Section 1: Bank Account Details */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-muted/20 border border-border/40">
              <div className="flex items-center gap-2 text-xs font-extrabold text-foreground border-b border-border/30 pb-2">
                <Landmark className="h-4 w-4 text-emerald-500" />
                Bank Settlement Account
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="bankName" className="text-[11px] font-bold">Bank Name</Label>
                  <Input
                    id="bankName"
                    name="bankName"
                    value={kycFormData.bankName}
                    onChange={handleKycChange}
                    placeholder="e.g. HDFC Bank"
                    className="h-9 text-xs bg-transparent focus-visible:bg-transparent border border-emerald-500/40 focus-visible:border-emerald-500 focus-visible:ring-0 shadow-none selection:bg-transparent selection:text-foreground"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="accountHolder" className="text-[11px] font-bold">Account Holder Name</Label>
                  <Input
                    id="accountHolder"
                    name="accountHolder"
                    value={kycFormData.accountHolder}
                    onChange={handleKycChange}
                    placeholder="Full Registered Name"
                    className="h-9 text-xs bg-transparent focus-visible:bg-transparent border border-emerald-500/40 focus-visible:border-emerald-500 focus-visible:ring-0 shadow-none selection:bg-transparent selection:text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="accountNumber" className="text-[11px] font-bold">Account Number</Label>
                  <Input
                    id="accountNumber"
                    name="accountNumber"
                    type="password"
                    value={kycFormData.accountNumber}
                    onChange={handleKycChange}
                    placeholder="Enter Account No."
                    className="h-9 text-xs font-mono bg-transparent focus-visible:bg-transparent border border-emerald-500/40 focus-visible:border-emerald-500 focus-visible:ring-0 shadow-none selection:bg-transparent selection:text-foreground"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirmAccountNumber" className="text-[11px] font-bold">Re-enter Account No.</Label>
                  <Input
                    id="confirmAccountNumber"
                    name="confirmAccountNumber"
                    value={kycFormData.confirmAccountNumber}
                    onChange={handleKycChange}
                    placeholder="Confirm Account No."
                    className="h-9 text-xs font-mono bg-transparent focus-visible:bg-transparent border border-emerald-500/40 focus-visible:border-emerald-500 focus-visible:ring-0 shadow-none selection:bg-transparent selection:text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="ifscCode" className="text-[11px] font-bold">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  name="ifscCode"
                  value={kycFormData.ifscCode}
                  onChange={handleKycChange}
                  placeholder="e.g. HDFC0001234"
                  className="h-9 text-xs font-mono uppercase bg-transparent focus-visible:bg-transparent border border-emerald-500/40 focus-visible:border-emerald-500 focus-visible:ring-0 shadow-none selection:bg-transparent selection:text-foreground"
                  required
                />
              </div>
            </div>

            {/* Section 2: Identity & Tax */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-muted/20 border border-border/40">
              <div className="flex items-center gap-2 text-xs font-extrabold text-foreground border-b border-border/30 pb-2">
                <FileCheck className="h-4 w-4 text-blue-500" />
                Identity & Tax Identification
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="panNumber" className="text-[11px] font-bold">PAN Card Number</Label>
                  <Input
                    id="panNumber"
                    name="panNumber"
                    value={kycFormData.panNumber}
                    onChange={handleKycChange}
                    placeholder="e.g. ABCDE1234F"
                    className="h-9 text-xs font-mono uppercase bg-transparent focus-visible:bg-transparent border border-emerald-500/40 focus-visible:border-emerald-500 focus-visible:ring-0 shadow-none selection:bg-transparent selection:text-foreground"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="gstin" className="text-[11px] font-bold">GSTIN (Optional)</Label>
                  <Input
                    id="gstin"
                    name="gstin"
                    value={kycFormData.gstin}
                    onChange={handleKycChange}
                    placeholder="e.g. 27ABCDE1234F1Z5"
                    className="h-9 text-xs font-mono uppercase bg-transparent focus-visible:bg-transparent border border-emerald-500/40 focus-visible:border-emerald-500 focus-visible:ring-0 shadow-none selection:bg-transparent selection:text-foreground"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsKycModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="ghost"
                className="bg-transparent hover:bg-emerald-500/5 text-foreground dark:text-white border border-emerald-500 hover:border-emerald-700 font-extrabold text-xs cursor-pointer transition-all"
              >
                Submit & Complete KYC
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* OTP Verification Modal */}
      <Dialog open={!!otpModalDoc} onOpenChange={(open) => !open && setOtpModalDoc(null)}>
        <DialogContent className="sm:max-w-[420px] !rounded-none p-6">
          <DialogHeader className="pr-6">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Verify {otpModalDoc === 'aadhaar' ? 'Aadhaar Card' : 'PAN Card'} via OTP
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Verify document authenticity using OTP sent to your registered mobile number.
            </DialogDescription>
          </DialogHeader>

          {otpStep === 1 ? (
            <div className="space-y-4 py-3">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Document Type:</span>
                  <span className="font-bold text-foreground uppercase">{otpModalDoc === 'aadhaar' ? 'Aadhaar Card' : 'PAN Card'}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Document Number:</span>
                  <span className="font-mono font-bold text-foreground">{otpModalDoc === 'aadhaar' ? 'XXXX XXXX 1234' : 'ABCDE1234F'}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Linked Mobile:</span>
                  <span className="font-bold text-foreground">+91 98765 ****40</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleSendOtp}
                className="w-full h-10 rounded-lg text-xs font-bold border-2 border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent hover:bg-emerald-500/10 cursor-pointer shadow-none gap-2 transition-all"
              >
                Send Verification OTP
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-3">
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground">
                  Enter 6-digit OTP code sent to <span className="font-bold text-foreground">+91 98765 ****40</span>
                </p>
              </div>

              {/* 6 OTP Input Boxes */}
              <div className="flex items-center justify-center gap-2 py-2">
                {otpValue.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-12 text-center text-base font-extrabold rounded-xl border border-border bg-muted/20 text-foreground focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                ))}
              </div>

              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  onClick={() => setOtpStep(1)}
                  className="text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                >
                  Change Details
                </button>
              </div>

              <DialogFooter className="gap-2 sm:gap-2 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setOtpModalDoc(null)}
                  className="h-9 px-4 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleVerifyOtpSubmit}
                  disabled={isVerifyingOtp}
                  className="h-9 px-5 text-xs font-bold border-2 border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent hover:bg-emerald-500/10 cursor-pointer shadow-none transition-all"
                >
                  {isVerifyingOtp ? "Verifying..." : "Verify & Confirm"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
