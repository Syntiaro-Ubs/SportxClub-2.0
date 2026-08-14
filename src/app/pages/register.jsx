import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
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
  X,
  AlertTriangle,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Logo } from "../components/brand/Logo";
import { cn } from "../components/ui/utils";
import { adminApi } from "../services/admin-api";
import { toast } from "sonner";

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
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialType = searchParams.get("type") || "athlete";

  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: initialType, // athlete | owner | admin
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

  // Email verification states
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState("");
  const [emailExistsError, setEmailExistsError] = useState("");
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState("");

  // Phone verification states
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneOtpError, setPhoneOtpError] = useState("");
  const [phoneExistsError, setPhoneExistsError] = useState("");
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState("");

  const checkEmailAvailability = async (emailVal) => {
    if (!emailVal || !emailVal.includes("@")) {
      setEmailExistsError("");
      return;
    }
    try {
      const accountType = (formData.role === "owner" || initialType === "owner" || isOwnerRoute) ? "turf-owner" : "player";
      const res = await adminApi.checkExists({ email: emailVal.trim(), accountType });
      if (res.exists && res.field === "email") {
        setEmailExistsError("An account with this email address already exists for this portal. Please log in instead.");
      } else {
        setEmailExistsError("");
      }
    } catch (e) {
      console.error("Check email error:", e);
    }
  };

  const checkPhoneAvailability = async (phoneVal) => {
    if (!phoneVal || phoneVal.trim().length < 10) {
      setPhoneExistsError("");
      return;
    }
    try {
      const accountType = (formData.role === "owner" || initialType === "owner" || isOwnerRoute) ? "turf-owner" : "player";
      const res = await adminApi.checkExists({ phone: phoneVal.trim(), accountType });
      if (res.exists && res.field === "phone") {
        setPhoneExistsError("This mobile number is already registered for this portal. Please log in instead.");
      } else {
        setPhoneExistsError("");
      }
    } catch (e) {
      console.error("Check phone error:", e);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      setEmailOtpSent(false);
      setEmailOtpError("");
      checkEmailAvailability(value);
    }
    if (name === "phone") {
      setPhoneOtpSent(false);
      setPhoneOtpError("");
      checkPhoneAvailability(value);
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
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };

  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);

  const isStep1Valid = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.includes("@") &&
      !emailExistsError &&
      emailVerified &&
      formData.phone.length >= 10 &&
      !phoneExistsError &&
      phoneVerified
    );
  };

  const isStep2Valid = () => {
    const isPasswordValid =
      isPasswordStrong &&
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

  // Real Backend OTP Handlers (Live Nodemailer dispatch)
  const sendEmailOtp = async () => {
    if (!formData.email.includes("@") || emailExistsError) return;
    try {
      setIsSendingEmailOtp(true);
      setEmailOtpError("");
      const res = await adminApi.requestOtp(formData.email.trim(), "register");
      if (res.success) {
        setEmailOtpSent(true);
        toast.success(`Verification code sent to ${formData.email}! Check your Gmail inbox.`, { duration: 6000 });
      } else {
        setEmailOtpError(res.error || "Failed sending OTP code");
      }
    } catch (e) {
      setEmailOtpError("Failed requesting OTP");
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (!formData.otp.trim()) return;
    try {
      const res = await adminApi.verifyOtp(formData.email.trim(), formData.otp.trim());
      if (res.success) {
        setEmailVerified(true);
        setEmailOtpError("");
        toast.success("Email verified successfully!");
      } else {
        setEmailOtpError(res.error || "Invalid verification code");
      }
    } catch (e) {
      setEmailOtpError("Invalid verification code");
    }
  };

  const sendPhoneOtp = async () => {
    if (formData.phone.length < 10 || phoneExistsError) return;
    try {
      setIsSendingPhoneOtp(true);
      setPhoneOtpError("");
      const res = await adminApi.requestOtp(formData.phone.trim(), "register");
      if (res.success) {
        setPhoneOtpSent(true);
        toast.success(`SMS verification code sent to ${formData.phone}!`, { duration: 6000 });
      } else {
        setPhoneOtpError(res.error || "Failed sending SMS OTP");
      }
    } catch (e) {
      setPhoneOtpError("Failed requesting OTP");
    } finally {
      setIsSendingPhoneOtp(false);
    }
  };

  const verifyPhoneOtp = async () => {
    if (!phoneOtp.trim()) return;
    try {
      const res = await adminApi.verifyOtp(formData.phone.trim(), phoneOtp.trim());
      if (res.success) {
        setPhoneVerified(true);
        setPhoneOtpError("");
        toast.success("Phone number verified successfully!");
      } else {
        setPhoneOtpError(res.error || "Invalid verification code");
      }
    } catch (e) {
      setPhoneOtpError("Invalid verification code");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailVerified || !phoneVerified) {
      toast.error("Please verify both email and phone number first.");
      return;
    }

    setIsSubmitting(true);

    const result = await register({
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
      selectedSports: formData.selectedSports,
      skillLevel: formData.skillLevel,
      city: formData.city,
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
      toast.success("Account created successfully in database!");
      setTimeout(() => {
        if (formData.role === "owner") {
          navigate("/admin-panel");
        } else {
          navigate("/");
        }
      }, 1500);
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-end font-sans relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* MAIN CONTAINER (Right Aligned Full Height Drawer) */}
      <div className="w-full sm:w-[440px] sm:max-w-none min-h-screen h-full border-y border-l border-border/50 bg-card/95 backdrop-blur-3xl rounded-none p-6 sm:p-10 shadow-[-12px_0_40px_-12px_rgba(0,0,0,0.15)] dark:shadow-[-12px_0_40px_-12px_rgba(0,0,0,0.4)] relative overflow-y-auto z-10 flex flex-col justify-center">

        {/* HEADER LOGO */}
        <div className="w-full flex items-center justify-center mb-6 md:mb-10 z-10">
          <Link to="/" className="flex items-center gap-3">
            <Logo />
          </Link>
        </div>

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
                <h1 className="text-3xl font-bold tracking-tight">
                  Registration Complete!
                </h1>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Welcome aboard, {formData.firstName}. Creating your
                  personalized sports dashboard...
                </p>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => {
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem(
                      "userName",
                      formData.firstName,
                    );
                    navigate("/");
                  }}
                  className="w-full h-11 rounded-full bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/10 hover:shadow-primary/25 transition-all cursor-pointer"
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
                  <p className="text-xs text-primary dark:text-white font-semibold">
                    Step {step} of 2
                  </p>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {step === 1 && (formData.role === "owner" ? "Turf Owner Signup" : "Create Account")}
                    {step === 2 && "Setup Profile"}
                  </h1>
                </div>
                <span className="text-xs font-semibold text-muted-foreground bg-muted/65 rounded-full px-3 py-1">
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                          <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            placeholder="Enter First Name"
                            className="pl-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background placeholder:text-xs"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName">Last Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                          <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            placeholder="Enter Last Name"
                            className="pl-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background placeholder:text-xs"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* EMAIL ADDRESS FIELD */}
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
                            placeholder="Enter Your Email"
                            className={cn(
                              "pl-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background disabled:opacity-75 placeholder:text-xs",
                              emailExistsError && "border-rose-500 focus-visible:ring-rose-500"
                            )}
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        {!emailVerified && (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={!formData.email.includes("@") || emailOtpSent || Boolean(emailExistsError) || isSendingEmailOtp}
                            onClick={sendEmailOtp}
                            className="h-10.5 px-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary dark:text-white text-xs transition-all shrink-0 font-bold cursor-pointer"
                          >
                            {isSendingEmailOtp ? "Sending..." : emailOtpSent ? "OTP Sent" : "Send OTP"}
                          </Button>
                        )}
                        {emailVerified && (
                          <div className="h-10.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-white flex items-center justify-center gap-1 text-xs shrink-0 font-semibold">
                            <Check className="h-4 w-4 stroke-[3]" /> Verified
                          </div>
                        )}
                      </div>

                      {/* INLINE ALERT FOR EXISTING EMAIL */}
                      {emailExistsError && (
                        <div className="text-[11px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl flex items-center gap-2 mt-1.5 animate-in fade-in">
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>{emailExistsError}</span>
                        </div>
                      )}
                    </div>

                    {/* EMAIL OTP VERIFICATION BOX */}
                    {emailOtpSent && !emailVerified && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-1.5 bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl"
                      >
                        <Label htmlFor="otp" className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Enter 6-Digit Verification Code
                        </Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                            <Input
                              id="otp"
                              name="otp"
                              type="text"
                              maxLength={6}
                              placeholder="Enter OTP Code"
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
                            className="h-10.5 px-4 rounded-xl border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 transition-all text-xs font-bold shrink-0 cursor-pointer"
                          >
                            Verify Code
                          </Button>
                        </div>
                        {emailOtpError && (
                          <p className="text-xs text-rose-500 font-medium pt-1">{emailOtpError}</p>
                        )}
                      </motion.div>
                    )}

                    {/* PHONE NUMBER FIELD */}
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
                            placeholder="Enter Mobile No."
                            className={cn(
                              "pl-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background disabled:opacity-75 placeholder:text-xs",
                              phoneExistsError && "border-rose-500 focus-visible:ring-rose-500"
                            )}
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        {!phoneVerified && (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={formData.phone.length < 10 || phoneOtpSent || Boolean(phoneExistsError) || isSendingPhoneOtp}
                            onClick={sendPhoneOtp}
                            className="h-10.5 px-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary dark:text-white text-xs transition-all shrink-0 font-bold cursor-pointer"
                          >
                            {isSendingPhoneOtp ? "Sending..." : phoneOtpSent ? "OTP Sent" : "Send OTP"}
                          </Button>
                        )}
                        {phoneVerified && (
                          <div className="h-10.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-white flex items-center justify-center gap-1 text-xs shrink-0 font-semibold">
                            <Check className="h-4 w-4 stroke-[3]" /> Verified
                          </div>
                        )}
                      </div>

                      {/* INLINE ALERT FOR EXISTING PHONE */}
                      {phoneExistsError && (
                        <div className="text-[11px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl flex items-center gap-2 mt-1.5 animate-in fade-in">
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>{phoneExistsError}</span>
                        </div>
                      )}
                    </div>

                    {/* PHONE OTP VERIFICATION BOX */}
                    {phoneOtpSent && !phoneVerified && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-1.5 bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl"
                      >
                        <Label htmlFor="phoneOtp" className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Enter 6-Digit SMS Verification Code
                        </Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                            <Input
                              id="phoneOtp"
                              type="text"
                              maxLength={6}
                              placeholder="Enter OTP Code"
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
                            className="h-10.5 px-4 rounded-xl border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 transition-all text-xs font-bold shrink-0 cursor-pointer"
                          >
                            Verify Code
                          </Button>
                        </div>
                        {phoneOtpError && (
                          <p className="text-xs text-rose-500 font-medium pt-1">{phoneOtpError}</p>
                        )}
                      </motion.div>
                    )}

                    <div className="pt-2">
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={!isStep1Valid()}
                        className={cn(
                          "w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all",
                          !isStep1Valid() && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <span>Continue</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: PASSWORD & PREFERENCES */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            className="pl-10 pr-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background placeholder:text-xs"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4.5 w-4.5" />
                            ) : (
                              <Eye className="h-4.5 w-4.5" />
                            )}
                          </button>
                        </div>
                        {formData.password && (
                          <div className="pt-1.5 space-y-1 font-normal tracking-tight" style={{ fontSize: "10px", lineHeight: "12px" }}>
                            <p className={cn("flex items-center gap-1.5 transition-colors", passwordChecks.length ? "text-emerald-500" : "text-muted-foreground")}>
                              <Check className={cn("h-3 w-3 transition-opacity shrink-0", passwordChecks.length ? "opacity-100 stroke-[3]" : "opacity-40")} /> Minimum 8 characters
                            </p>
                            <p className={cn("flex items-center gap-1.5 transition-colors", passwordChecks.uppercase ? "text-emerald-500" : "text-muted-foreground")}>
                              <Check className={cn("h-3 w-3 transition-opacity shrink-0", passwordChecks.uppercase ? "opacity-100 stroke-[3]" : "opacity-40")} /> At least 1 uppercase letter (A-Z)
                            </p>
                            <p className={cn("flex items-center gap-1.5 transition-colors", passwordChecks.lowercase ? "text-emerald-500" : "text-muted-foreground")}>
                              <Check className={cn("h-3 w-3 transition-opacity shrink-0", passwordChecks.lowercase ? "opacity-100 stroke-[3]" : "opacity-40")} /> At least 1 lowercase letter (a-z)
                            </p>
                            <p className={cn("flex items-center gap-1.5 transition-colors", passwordChecks.number ? "text-emerald-500" : "text-muted-foreground")}>
                              <Check className={cn("h-3 w-3 transition-opacity shrink-0", passwordChecks.number ? "opacity-100 stroke-[3]" : "opacity-40")} /> At least 1 number (0-9)
                            </p>
                            <p className={cn("flex items-center gap-1.5 transition-colors", passwordChecks.special ? "text-emerald-500" : "text-muted-foreground")}>
                              <Check className={cn("h-3 w-3 transition-opacity shrink-0", passwordChecks.special ? "opacity-100 stroke-[3]" : "opacity-40")} /> At least 1 special character (@, #, etc.)
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Re-enter password"
                            className="pl-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background placeholder:text-xs"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                          <p className="text-xs text-rose-500 font-medium">Passwords do not match</p>
                        )}
                      </div>
                    </div>

                    {formData.role === "athlete" && (
                      <div className="space-y-2 pt-1">
                        <Label className="text-xs font-bold">Select Favorite Sports</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {sportsOptions.map((sport) => {
                            const isSelected = formData.selectedSports.includes(sport.id);
                            return (
                              <button
                                key={sport.id}
                                type="button"
                                onClick={() => toggleSport(sport.id)}
                                className={cn(
                                  "p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition-all cursor-pointer",
                                  isSelected
                                    ? "border-emerald-600 bg-emerald-500/10 font-bold text-emerald-600 dark:text-emerald-400"
                                    : "border-border bg-background/50 hover:bg-muted"
                                )}
                              >
                                <span className="flex items-center gap-1.5">
                                  <span>{sport.emoji}</span>
                                  <span>{sport.name}</span>
                                </span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="w-1/3 h-11 rounded-xl border-border text-xs font-bold cursor-pointer"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || !isStep2Valid()}
                        className="w-2/3 h-11 rounded-xl bg-primary text-primary-foreground font-bold text-xs cursor-pointer shadow-md"
                      >
                        {isSubmitting ? "Creating Account..." : "Complete Registration"}
                      </Button>
                    </div>
                  </div>
                )}
              </form>

              <div className="text-center pt-6">
                <p className="text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="font-bold text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
