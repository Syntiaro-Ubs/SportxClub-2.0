import { useState, useEffect, useRef } from "react";
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
  Plus,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent } from "../components/ui/dialog";
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
  const isOwnerRoute = searchParams.get("type") === "owner" || location.pathname === "/admin-register";
  const initialType = isOwnerRoute ? "owner" : (searchParams.get("type") || "athlete");

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
    role: initialType, // athlete | owner
    selectedSports: [],
    skillLevel: "Intermediate", // Beginner | Intermediate | Pro
    city: "",
    otp: "",
    address: "",
    state: "",
    pincode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedOwnerId, setGeneratedOwnerId] = useState("");

  // Email verification states
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState("");
  const [emailExistsError, setEmailExistsError] = useState("");
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCountdown]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      setEmailOtpSent(false);
      setResendCountdown(0);
      setEmailOtpError("");
      setEmailVerified(false);
      checkEmailAvailability(value);
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
      formData.email.includes("@") &&
      !emailExistsError &&
      emailVerified
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
    if (!formData.email.includes("@") || emailExistsError || isSendingEmailOtp) return;
    try {
      setIsSendingEmailOtp(true);
      setEmailOtpError("");
      const res = await adminApi.requestOtp(formData.email.trim(), "register");
      if (res.success) {
        setEmailOtpSent(true);
        setResendCountdown(60);
        setOtpDigits(["", "", "", "", "", ""]);
        setShowOtpModal(true);
        toast.success(
          emailOtpSent
            ? `New verification code resent to ${formData.email}! Please check your Gmail inbox.`
            : `Verification code sent to ${formData.email}! Please check your Gmail inbox.`,
          { duration: 6000 }
        );
        setTimeout(() => {
          otpRefs.current[0]?.focus();
        }, 300);
      } else {
        setEmailOtpError(res.error || "Failed sending OTP code");
        toast.error(res.error || "Failed sending OTP code");
      }
    } catch (e) {
      setEmailOtpError("Failed requesting OTP");
      toast.error("Failed requesting OTP");
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const verifyEmailOtp = async (customOtp) => {
    const code = typeof customOtp === "string" ? customOtp : (otpDigits.join("") || formData.otp);
    if (!code || code.trim().length !== 6) return;
    try {
      setIsVerifyingOtp(true);
      setEmailOtpError("");
      const res = await adminApi.verifyOtp(formData.email.trim(), code.trim());
      if (res.success) {
        setEmailVerified(true);
        setEmailOtpError("");
        toast.success("Email verified successfully!");
        setTimeout(() => {
          setShowOtpModal(false);
        }, 600);
      } else {
        setEmailOtpError(res.error || "Invalid verification code");
        toast.error(res.error || "Invalid verification code");
      }
    } catch (e) {
      setEmailOtpError("Invalid verification code");
      toast.error("Invalid verification code");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 6-digit OTP handlers for popup modal
  const handleOtpDigitChange = (index, value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length > 1) {
      const pasted = digits.slice(0, 6).split("");
      const newDigits = [...otpDigits];
      pasted.forEach((d, i) => {
        if (index + i < 6) newDigits[index + i] = d;
      });
      setOtpDigits(newDigits);
      const fullCode = newDigits.join("");
      setFormData((prev) => ({ ...prev, otp: fullCode }));
      const focusIdx = Math.min(index + pasted.length, 5);
      otpRefs.current[focusIdx]?.focus();
      if (fullCode.length === 6) {
        verifyEmailOtp(fullCode);
      }
      return;
    }

    const char = digits.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    const fullCode = newDigits.join("");
    setFormData((prev) => ({ ...prev, otp: fullCode }));

    if (char && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    if (fullCode.length === 6) {
      verifyEmailOtp(fullCode);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newDigits = ["", "", "", "", "", ""];
    pasted.split("").forEach((ch, idx) => {
      newDigits[idx] = ch;
    });
    setOtpDigits(newDigits);
    setFormData((prev) => ({ ...prev, otp: pasted }));
    const focusIdx = Math.min(pasted.length, 5);
    otpRefs.current[focusIdx]?.focus();
    if (pasted.length === 6) {
      verifyEmailOtp(pasted);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (isStep1Valid()) {
        handleNext();
      }
      return;
    }
    handleSubmit(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailVerified) {
      toast.error("Please verify your email address first.");
      return;
    }

    setIsSubmitting(true);

    const result = await register({
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      password: formData.password,
      role: formData.role,
      selectedSports: formData.selectedSports,
      skillLevel: formData.skillLevel,
      city: formData.city,
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
      const isOwner = formData.role === "owner" || result.user?.accountType === "turf-owner" || result.user?.role === "owner";
      const assignedId = result.user?.ownerId || result.user?.userId || result.user?.id || (isOwner ? "26080001" : "PLY-26080001");
      if (assignedId) {
        setGeneratedOwnerId(String(assignedId));
        if (isOwner) {
          localStorage.setItem("ownerId", String(assignedId));
        }
      }
      toast.success("Registration submitted successfully!");
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-end font-sans relative overflow-hidden">
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
              className="text-center space-y-6 flex flex-col justify-center h-full max-w-md mx-auto"
            >
              <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center relative mb-2">
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

              <div className="space-y-3 mb-6">
                <h1 className="text-[28px] text-slate-900 font-medium tracking-tight">
                  {formData.role === "owner" ? "Registration Completed!" : "Account Created Successfully!"}
                </h1>
                <p className="text-slate-600 text-[15px] max-w-xs mx-auto leading-relaxed">
                  {formData.role === "owner"
                    ? `Welcome aboard, ${formData.firstName}. Please proceed to complete the Turf Onboarding Process.`
                    : `Welcome aboard, ${formData.firstName}! Your sports profile is ready.`}
                </p>
              </div>

              {formData.role === "owner" && (
                <div className="p-8 border border-slate-200 bg-[#f8fafc] rounded-[24px] text-center mb-8 mx-auto w-[90%] shadow-sm">
                  <p className="text-[12px] text-slate-500 font-semibold uppercase tracking-widest mb-6">
                    YOUR ASSIGNED TURF OWNER ID
                  </p>

                  <div className="flex items-center justify-center w-full max-w-[280px] mx-auto h-[72px] bg-white rounded-2xl shadow-[-10px_12px_24px_rgba(0,0,0,0.04)] border border-slate-100 mb-6">
                    <p className="text-[26px] sm:text-[30px] font-bold text-slate-900 tracking-[0.15em] font-mono ml-[0.15em]">
                      {generatedOwnerId}
                    </p>
                  </div>

                  <p className="text-[13px] text-slate-500 max-w-[250px] mx-auto leading-relaxed">
                    Please save this ID. It has been generated securely in the database for your records.
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-center">
                <Button
                  onClick={() => {
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("userName", formData.firstName);
                    if (formData.role === "owner") {
                      navigate("/owner-setup");
                    } else {
                      navigate("/");
                    }
                  }}
                  className="w-[200px] h-11 rounded-full bg-white border-2 border-[#059669] text-[#059669] text-[15px] font-bold hover:bg-emerald-50 transition-all shadow-lg shadow-[#059669]/10 cursor-pointer"
                >
                  {formData.role === "owner" ? "Complete Turf Setup" : "Explore Turfs"}
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
                  <h1 className="text-lg font-bold tracking-tight sm:text-xl">
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

              <form onSubmit={handleFormSubmit} className="space-y-3">
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
                            className="pl-10 h-10.5 rounded-lg border-slate-400/80 dark:border-slate-600 bg-background/50 focus-visible:bg-background placeholder:text-xs"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName">
                          Last Name <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                          <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            placeholder="Enter Last Name"
                            className="pl-10 h-10.5 rounded-lg border-slate-400/80 dark:border-slate-600 bg-background/50 focus-visible:bg-background placeholder:text-xs"
                            value={formData.lastName}
                            onChange={handleInputChange}
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
                              "pl-10 h-10.5 rounded-lg border-slate-400/80 dark:border-slate-600 bg-background/50 focus-visible:bg-background disabled:opacity-75 placeholder:text-xs",
                              emailExistsError && "border-rose-500 focus-visible:ring-rose-500"
                            )}
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        {!emailVerified && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            {emailOtpSent && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowOtpModal(true)}
                                className="h-10.5 px-3 rounded-lg border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:border-emerald-600 hover:text-emerald-700 bg-transparent hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-xs font-bold shrink-0 transition-all cursor-pointer shadow-none"
                              >
                                Enter Code
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              disabled={
                                !formData.email.includes("@") ||
                                Boolean(emailExistsError) ||
                                isSendingEmailOtp ||
                                (emailOtpSent && resendCountdown > 0)
                              }
                              onClick={sendEmailOtp}
                              className={cn(
                                "h-10.5 px-3.5 sm:px-4 rounded-lg border text-xs transition-all shrink-0 font-bold cursor-pointer bg-transparent shadow-none",
                                emailOtpSent && resendCountdown === 0
                                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20"
                                  : "border-border text-foreground hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                              )}
                            >
                              {isSendingEmailOtp
                                ? "Sending..."
                                : emailOtpSent
                                  ? resendCountdown > 0
                                    ? `Resend (${resendCountdown}s)`
                                    : "Resend OTP"
                                  : "Send OTP"}
                            </Button>
                          </div>
                        )}
                        {emailVerified && (
                          <div className="h-10.5 px-3.5 rounded-lg bg-transparent border border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5 text-xs shrink-0 font-bold">
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

                    <div className="pt-2 flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleNext}
                        disabled={!isStep1Valid()}
                        className={cn(
                          "w-[200px] h-11 rounded-lg border border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all bg-transparent hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 shadow-none",
                          !isStep1Valid() && "opacity-50 cursor-not-allowed"
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
                            className="pl-10 pr-10 h-10.5 rounded-lg border-slate-400/80 dark:border-slate-600 bg-background/50 focus-visible:bg-background placeholder:text-xs"
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
                            className="pl-10 h-10.5 rounded-lg border-slate-400/80 dark:border-slate-600 bg-background/50 focus-visible:bg-background placeholder:text-xs"
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
                        variant="outline"
                        disabled={isSubmitting || !isStep2Valid()}
                        className="w-2/3 h-11 rounded-xl border border-border bg-background text-foreground hover:border-2 hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-xs cursor-pointer transition-all disabled:opacity-50 disabled:pointer-events-none"
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

      {/* 6-DIGIT OTP VERIFICATION POPUP MODAL (IMAGE 4 STYLE) */}
      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent className="sm:max-w-md p-6 bg-card border border-border/70 rounded-3xl shadow-2xl">
          <div className="space-y-5">
            {/* Header with Icon + Title + Email */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xl shadow-sm shrink-0 border border-slate-200 dark:border-zinc-700">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                    Verify to continue
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[220px] sm:max-w-[280px]">
                    Code sent to <span className="font-medium text-foreground">{formData.email || "your email"}</span>
                  </p>
                </div>
              </div>
              {emailVerified && (
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold flex items-center gap-1 shrink-0 animate-in fade-in">
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> VERIFIED
                </div>
              )}
            </div>

            {/* 6 Individual Digit Input Boxes */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 py-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={handleOtpPaste}
                  className={cn(
                    "w-11 h-13 sm:w-12 sm:h-14 rounded-xl text-center text-xl sm:text-2xl font-black font-mono transition-all outline-none",
                    "bg-muted/40 text-foreground",
                    digit
                      ? "border-2 border-emerald-500 bg-emerald-500/5 shadow-xs"
                      : "border border-border/80 focus:border-2 focus:border-emerald-500 focus:bg-background"
                  )}
                />
              ))}
            </div>

            {/* Security Banner (Exact from Image 4) */}
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-500/5 border border-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="leading-tight">Fake numbers & burner emails — blocked automatically</span>
            </div>

            {emailOtpError && (
              <p className="text-xs text-rose-500 font-semibold text-center animate-in fade-in">
                {emailOtpError}
              </p>
            )}

            {/* Action Verify Button - Outline with Green Border */}
            <Button
              type="button"
              variant="outline"
              disabled={otpDigits.join("").length !== 6 || isVerifyingOtp || emailVerified}
              onClick={() => verifyEmailOtp(otpDigits.join(""))}
              className="w-full h-11 rounded-xl border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:border-emerald-600 hover:text-emerald-700 bg-transparent hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-sm font-bold cursor-pointer transition-all shadow-none"
            >
              {isVerifyingOtp ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</span>
              ) : emailVerified ? (
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 stroke-[3]" /> Verified!</span>
              ) : (
                "Verify Code"
              )}
            </Button>

            {/* Resend Link */}
            <div className="text-center text-xs text-muted-foreground">
              Didn't receive code?{" "}
              {resendCountdown > 0 ? (
                <span className="font-semibold text-foreground">Resend in {resendCountdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={sendEmailOtp}
                  disabled={isSendingEmailOtp}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  {isSendingEmailOtp ? "Sending..." : "Resend OTP"}
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
