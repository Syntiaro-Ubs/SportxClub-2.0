import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../providers/auth-provider";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Check,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Shield,
  Smartphone,
  Eye,
  EyeOff,
  Star,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Logo } from "../components/brand/Logo";
import { cn } from "../components/ui/utils";

const sportsOptions = [
  { id: "football", name: "Football", emoji: "⚽", category: "Outdoor" },
  { id: "cricket", name: "Cricket", emoji: "🏏", category: "Outdoor" },
  { id: "badminton", name: "Badminton", emoji: "🏸", category: "Indoor" },
  { id: "tennis", name: "Tennis", emoji: "🎾", category: "Racket" },
  { id: "basketball", name: "Basketball", emoji: "🏀", category: "Court" },
  { id: "swimming", name: "Swimming", emoji: "🏊", category: "Aquatic" },
  { id: "gym", name: "Gym & Fitness", emoji: "🏋️", category: "Indoor" },
  { id: "volleyball", name: "Volleyball", emoji: "🏐", category: "Court" },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "athlete", // athlete | owner | admin
    selectedSports: [],
    skillLevel: "Intermediate", // Beginner | Intermediate | Pro
    city: "Mumbai",
    phone: "",
    otp: "",
    address: "",
    state: "",
    pincode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState("");
  // Phone verification states
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneOtpError, setPhoneOtpError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "email") {
      setEmailOtpSent(false);
      setEmailOtpError("");
    }
    if (name === "phone") {
      setPhoneOtpSent(false);
      setPhoneOtpError("");
    }
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const toggleSport = (sportId) => {
    setFormData((prev) => {
      const selected = prev.selectedSports.includes(sportId)
        ? prev.selectedSports.filter((id) => id !== sportId)
        : [...prev.selectedSports, sportId];
      return { ...prev, selectedSports: selected };
    });
  };

  const selectSkill = (level) => {
    setFormData((prev) => ({ ...prev, skillLevel: level }));
  };

  // Basic Validations
  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const isStep1Valid = () => {
    return (
      formData.fullName.trim() !== "" &&
      formData.email.includes("@") &&
      emailVerified &&
      formData.phone.length >= 10 &&
      phoneVerified
    );
  };

  const isStep2Valid = () => {
    const isPasswordValid =
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword;
      
    if (formData.role === "athlete") {
      return formData.selectedSports.length > 0 && isPasswordValid;
    }
    return isPasswordValid;
  };

  const handleNext = () => {
    if (step === 1 && isStep1Valid()) setStep(2);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const sendEmailOtp = () => {
    if (!formData.email.includes("@")) return;
    setEmailOtpSent(true);
    setEmailOtpError("");
    alert(`Mock Verification Code sent to your email (${formData.email}): 482015`);
  };

  const verifyEmailOtp = () => {
    if (formData.otp === "482015") {
      setEmailVerified(true);
      setEmailOtpError("");
    } else {
      setEmailOtpError("Invalid verification code. Please use 482015.");
    }
  };

  const sendPhoneOtp = () => {
    if (formData.phone.length < 10) return;
    setPhoneOtpSent(true);
    setPhoneOtpError("");
    alert(`Mock Verification Code sent to your phone (${formData.phone}): 994021`);
  };

  const verifyPhoneOtp = () => {
    if (phoneOtp === "994021") {
      setPhoneVerified(true);
      setPhoneOtpError("");
    } else {
      setPhoneOtpError("Invalid verification code. Please use 994021.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailVerified || !phoneVerified) {
      setEmailOtpError("Please verify both email and phone number first.");
      return;
    }

    setIsSubmitting(true);
    
    const result = register({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
      selectedSports: formData.selectedSports,
      skillLevel: formData.skillLevel,
      city: formData.city,
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    
    if (result.success) {
      // Ensure isLoggedIn and userName are explicitly set for homepage/mobile-home
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", formData.fullName.split(" ")[0]);
      
      setIsSuccess(true);
      setTimeout(() => {
        if (formData.role === "owner") navigate("/owner-setup");
        else if (formData.role === "admin") navigate("/admin");
        else navigate("/");
      }, 1500);
    } else {
      alert(result.error);
    }
  };

  const passwordStrength = getPasswordStrength();
  const strengthColors = [
    "bg-neutral-300",
    "bg-rose-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-emerald-500",
  ];
  const strengthLabels = ["Empty", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 transition-colors duration-200">
      {/* BACKGROUND ELEMENTS (Grid + Radial Accent Glows) */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Floating Blur Circles (Dynamic glow backdrop) */}
      <div
        className="absolute top-[10%] left-[5%] w-72 h-72 md:w-96 md:h-96 rounded-full bg-emerald-500/10 blur-[80px] md:blur-[120px] pointer-events-none animate-pulse"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute bottom-[10%] right-[5%] w-72 h-72 md:w-96 md:h-96 rounded-full bg-primary/10 blur-[80px] md:blur-[120px] pointer-events-none animate-pulse"
        style={{ animationDuration: "6s" }}
      />



      {/* HEADER LOGO */}
      <div className="w-full max-w-xl flex items-center justify-center mb-[-12px] md:mb-[-22px] z-10">
        <Link to="/" className="flex items-center gap-3">
          <Logo />
        </Link>
      </div>

      {/* MAIN CONTAINER (Centered premium Card) */}
      <div className="w-full max-w-xl border border-border/50 bg-card/65 backdrop-blur-2xl rounded-[32px] p-6 sm:p-10 shadow-[0_28px_60px_-24px_rgba(15,23,42,0.15)] dark:shadow-[0_28px_60px_-24px_rgba(0,0,0,0.4)] relative overflow-hidden z-10">
        {/* Subtle top decoration bar */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <AnimatePresence mode="wait">
          {isSuccess ? (
            // Success Screen
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center py-8 space-y-6"
            >
              <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    delay: 0.2,
                  }}
                >
                  <Check className="h-10 w-10 text-emerald-500" />
                </motion.div>
                <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping opacity-45 pointer-events-none" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl  tracking-tight">
                  Registration Complete!
                </h1>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Welcome aboard, {formData.fullName}. Creating your
                  personalized sports dashboard...
                </p>
              </div>

              {/* Profile Card Preview */}
              <div className="p-4 rounded-2xl border border-border bg-card/50 text-left space-y-3 shadow-md max-w-xs mx-auto">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center  text-sm">
                    {formData.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm ">{formData.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      @{formData.fullName.toLowerCase().replace(/\s+/g, "")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge
                    variant="outline"
                    className="text-[0.65rem] border-primary/20 bg-primary/5 text-primary rounded-full uppercase tracking-wide"
                  >
                    {formData.role}
                  </Badge>
                  {formData.role === "athlete" && (
                    <Badge
                      variant="outline"
                      className="text-[0.65rem] border-amber-500/20 bg-amber-500/5 text-amber-500 rounded-full uppercase tracking-wide"
                    >
                      {formData.skillLevel}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="text-[0.65rem] border-blue-500/20 bg-blue-500/5 text-blue-500 rounded-full"
                  >
                    {formData.city}
                  </Badge>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => {
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem(
                      "userName",
                      formData.fullName.split(" ")[0],
                    );
                    navigate("/");
                  }}
                  className="w-full h-11 rounded-full bg-primary text-primary-foreground  shadow-lg shadow-primary/10 hover:shadow-primary/25 transition-all"
                >
                  Go to Home Now
                </Button>
              </div>
            </motion.div>
          ) : (
            // Form Steps
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Step Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <p className="text-xs  uppercase tracking-[0.2em] text-primary">
                    Step {step} of 2
                  </p>
                  <h1 className="text-2xl  tracking-tight sm:text-3xl">
                    {step === 1 && "Create Account"}
                    {step === 2 && "Setup Profile"}
                  </h1>
                </div>
                <span className="text-xs  text-muted-foreground bg-muted/65 rounded-full px-3 py-1">
                  {step === 1 && "Account"}
                  {step === 2 && "Preferences"}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-muted rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${(step / 2) * 100}%` }}
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* STEP 1: ACCOUNT DETAILS */}
                {step === 1 && (
                  <div className="space-y-3">
                    {/* Account Type Selector */}
                    <div className="flex p-1 space-x-1 rounded-xl bg-muted/50 border border-border/50 mb-2">
                      {["athlete", "owner"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleRoleSelect(type)}
                          className={cn(
                            "flex-1 rounded-lg py-2 text-xs transition-all duration-200",
                            formData.role === type
                              ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                              : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                          )}
                        >
                          {type === "athlete" ? "Player" : "Turf Owner"}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                        <Input
                          id="fullName"
                          name="fullName"
                          type="text"
                          placeholder="John Doe"
                          className="pl-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {formData.role === "athlete" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                            <Input
                              id="address"
                              name="address"
                              type="text"
                              placeholder="123 Sports Avenue, Phase 1"
                              className="pl-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background"
                              value={formData.address}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="state">State</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                            <Input
                              id="state"
                              name="state"
                              type="text"
                              placeholder="Maharashtra"
                              className="pl-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background"
                              value={formData.state}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="pincode">Pin Code</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                            <Input
                              id="pincode"
                              name="pincode"
                              type="text"
                              placeholder="400001"
                              className="pl-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background"
                              value={formData.pincode}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            disabled={emailVerified}
                            placeholder="john@example.com"
                            className="pl-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background disabled:opacity-75"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        {!emailVerified && (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!formData.email.includes("@") || emailOtpSent}
                            onClick={sendEmailOtp}
                            className="h-10.5 px-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs transition-all shrink-0 font-bold"
                          >
                            {emailOtpSent ? "OTP Sent" : "Send OTP"}
                          </Button>
                        )}
                        {emailVerified && (
                          <div className="h-10.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center gap-1 text-xs shrink-0 font-semibold">
                            <Check className="h-4 w-4 stroke-[3]" /> Verified
                          </div>
                        )}
                      </div>
                    </div>

                    {emailOtpSent && !emailVerified && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-1.5"
                      >
                        <Label htmlFor="otp">Enter 6-Digit Email OTP</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                            <Input
                              id="otp"
                              name="otp"
                              type="text"
                              maxLength={6}
                              placeholder="482015"
                              className="pl-10 h-10.5 rounded-xl font-mono text-center tracking-[0.25em]"
                              value={formData.otp}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <Button
                            type="button"
                            disabled={formData.otp.length !== 6}
                            onClick={verifyEmailOtp}
                            className="h-10.5 px-4 rounded-xl bg-[#6DFF3B] text-black hover:bg-[#5ce630] text-xs font-bold shrink-0"
                          >
                            Verify Code
                          </Button>
                        </div>
                        {emailOtpError && (
                          <p className="text-xs text-rose-500">{emailOtpError}</p>
                        )}
                        <p className="text-[0.72rem] text-muted-foreground">
                          Enter mock verification code: <code className="bg-muted px-1.5 py-0.5 rounded font-mono">482015</code>
                        </p>
                      </motion.div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            disabled={phoneVerified}
                            placeholder="98765 43210"
                            className="pl-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background disabled:opacity-75"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        {!phoneVerified && (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={formData.phone.length < 10 || phoneOtpSent}
                            onClick={sendPhoneOtp}
                            className="h-10.5 px-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs transition-all shrink-0 font-bold"
                          >
                            {phoneOtpSent ? "OTP Sent" : "Send OTP"}
                          </Button>
                        )}
                        {phoneVerified && (
                          <div className="h-10.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center gap-1 text-xs shrink-0 font-semibold">
                            <Check className="h-4 w-4 stroke-[3]" /> Verified
                          </div>
                        )}
                      </div>
                    </div>

                    {phoneOtpSent && !phoneVerified && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-1.5"
                      >
                        <Label htmlFor="phoneOtp">Enter 6-Digit SMS OTP</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                            <Input
                              id="phoneOtp"
                              type="text"
                              maxLength={6}
                              placeholder="994021"
                              className="pl-10 h-10.5 rounded-xl font-mono text-center tracking-[0.25em]"
                              value={phoneOtp}
                              onChange={(e) => setPhoneOtp(e.target.value)}
                              required
                            />
                          </div>
                          <Button
                            type="button"
                            disabled={phoneOtp.length !== 6}
                            onClick={verifyPhoneOtp}
                            className="h-10.5 px-4 rounded-xl bg-[#6DFF3B] text-black hover:bg-[#5ce630] text-xs font-bold shrink-0"
                          >
                            Verify Code
                          </Button>
                        </div>
                        {phoneOtpError && (
                          <p className="text-xs text-rose-500">{phoneOtpError}</p>
                        )}
                        <p className="text-[0.72rem] text-muted-foreground">
                          Enter mock verification code: <code className="bg-muted px-1.5 py-0.5 rounded font-mono">994021</code>
                        </p>
                      </motion.div>
                    )}



                    <div className="flex justify-center">
                      <Button
                        type="button"
                        disabled={!isStep1Valid()}
                        onClick={handleNext}
                        className="w-1/2 h-11 rounded-full bg-primary text-primary-foreground  hover:shadow-lg hover:shadow-primary/10 transition-all flex items-center justify-center gap-1.5 group"
                      >
                        Continue
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: PROFILE SETUP (ROLE & SPORTS) */}
                {step === 2 && (
                  <div className="space-y-5">
                    {/* Dynamic Preferences */}
                    {formData.role === "athlete" ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Choose Your Sports</Label>
                            <span className="text-xs text-muted-foreground ">
                              {formData.selectedSports.length} selected
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 max-h-[170px] overflow-y-auto pr-1">
                            {sportsOptions.map((sport) => {
                              const isSelected =
                                formData.selectedSports.includes(sport.id);
                              return (
                                <button
                                  key={sport.id}
                                  type="button"
                                  onClick={() => toggleSport(sport.id)}
                                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left text-sm transition-all ${
                                    isSelected
                                      ? "border-primary bg-primary/10  text-foreground"
                                      : "border-border bg-background/30 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                                  }`}
                                >
                                  <span className="text-lg leading-none">
                                    {sport.emoji}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs  leading-tight">
                                      {sport.name}
                                    </p>
                                    <p className="text-[0.62rem] text-muted-foreground leading-none mt-0.5">
                                      {sport.category}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <div className="h-4.5 w-4.5 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                      <Check className="h-3 w-3 stroke-[3]" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Skill Level */}
                        <div className="space-y-2">
                          <Label>Your Skill Level</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {["Beginner", "Intermediate", "Pro"].map(
                              (level) => {
                                const isSelected =
                                  formData.skillLevel === level;
                                return (
                                  <button
                                    key={level}
                                    type="button"
                                    onClick={() => selectSkill(level)}
                                    className={`py-2 px-3 rounded-xl border text-xs  text-center transition-all ${
                                      isSelected
                                        ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                        : "border-border bg-background/30 text-muted-foreground hover:bg-muted/30"
                                    }`}
                                  >
                                    {level}
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4 pt-2">
                        <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-2.5">
                          <div className="flex gap-2">
                            <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs ">Verification Required</p>
                              <p className="text-[0.72rem] text-muted-foreground mt-0.5 leading-relaxed">
                                To ensure the highest quality listings and match
                                safety, SportXClub verifies all commercial venue
                                owners and tournament organizers.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="city">City of Operation</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                            <Input
                              id="city"
                              name="city"
                              type="text"
                              placeholder="E.g. Mumbai, Delhi"
                              className="pl-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background"
                              value={formData.city}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password">Password</Label>
                        {formData.password && (
                          <span
                            className={`text-xs  ${
                              passwordStrength >= 3
                                ? "text-emerald-500"
                                : passwordStrength === 2
                                  ? "text-amber-500"
                                  : "text-rose-500"
                            }`}
                          >
                            {strengthLabels[passwordStrength]}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4.5 w-4.5" />
                          ) : (
                            <Eye className="h-4.5 w-4.5" />
                          )}
                        </button>
                      </div>
                      {/* Password strength bar */}
                      {formData.password && (
                        <div className="grid grid-cols-4 gap-1.5 pt-1">
                          {[1, 2, 3, 4].map((index) => (
                            <div
                              key={index}
                              className={`h-1 rounded-full transition-all duration-300 ${
                                index <= passwordStrength
                                  ? strengthColors[passwordStrength]
                                  : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-[0.72rem] text-muted-foreground">
                        Must be at least 6 characters with mixed letters and
                        numbers.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      {formData.confirmPassword &&
                        formData.password !== formData.confirmPassword && (
                          <p className="text-xs text-rose-500 ">
                            Passwords do not match.
                          </p>
                        )}
                    </div>

                    <div className="p-4 rounded-2xl border border-border bg-muted/20 text-xs text-muted-foreground space-y-1.5 mt-2">
                      <p className=" text-foreground">Terms and Conditions</p>
                      <p className="leading-relaxed">
                        By finalizing registration, you agree to SportXClub's
                        Terms of Use, Privacy Policy, Turf Booking Codes, and
                        Match Fair-Play Guidelines.
                      </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 pt-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="h-11 px-4 rounded-full border border-border flex items-center justify-center gap-1.5"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={!isStep2Valid() || isSubmitting}
                        className="flex-1 h-11 rounded-full bg-[#6DFF3B] text-[#050505] hover:bg-[#86ff60] hover:shadow-lg hover:shadow-[#6DFF3B]/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Completing...
                          </span>
                        ) : (
                          <>
                            Complete Registration
                            <Check className="h-4.5 w-4.5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Footer */}
        {!isSuccess && (
          <div className="text-center text-sm text-muted-foreground mt-4 pt-4 border-t border-border/40">
            Already have an account?{" "}
            <Link to="/login" className="text-primary  hover:underline">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
