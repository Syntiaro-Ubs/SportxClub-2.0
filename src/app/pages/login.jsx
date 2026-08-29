import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../providers/auth-provider";
import { motion } from "motion/react";
import {
  Mail,
  Lock,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Shield,
  Chrome,
  Activity,
  Users,
  MapPin,
  ShieldCheck,
  Headphones,
  X,
  KeyRound,
  Phone,
  RefreshCw,
  Plus,
  User,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Logo } from "../components/brand/Logo";
import { cn } from "../components/ui/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { adminApi } from "../services/admin-api";
import { toast } from "sonner";

// Helper function to parse Google JWT Credential Token
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isOwnerRoute = location.pathname === "/admin-login";
  const initialType = isOwnerRoute ? "owner" : (searchParams.get("type") || "player");

  const { login, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState(initialType);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Google Account Chooser Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [dbAccounts, setDbAccounts] = useState([]);
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googleNameInput, setGoogleNameInput] = useState("");
  const [isFetchingAccounts, setIsFetchingAccounts] = useState(false);

  // OTP & Recovery Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotMode, setForgotMode] = useState("password"); // "password" | "email"
  const [forgotStep, setForgotStep] = useState(1); // 1: Request, 2: Verify, 3: Reset/Result
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [activeOtpCode, setActiveOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveredUser, setRecoveredUser] = useState(null);
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // Google Credential Response Handler
  const handleGoogleCredentialResponse = async (response) => {
    if (response?.credential) {
      const payload = parseJwt(response.credential);
      if (payload && payload.email) {
        await selectGoogleAccount(
          payload.email,
          payload.name || payload.given_name || payload.email.split("@")[0],
          payload.picture
        );
      }
    }
  };

  // Load Google Identity Services (GIS) Client Library
  useEffect(() => {
    window.scrollTo(0, 0);

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: "847291048201-sportxclub.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
          auto_select: false,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleOpenGoogleModal = async () => {
    // 1. Trigger Google native One-Tap prompt if available on device
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
          setIsGoogleModalOpen(true);
        }
      });
    } else {
      setIsGoogleModalOpen(true);
    }

    // 2. Fetch real database accounts (No dummy static accounts)
    setShowCustomGoogleInput(false);
    try {
      setIsFetchingAccounts(true);
      const accs = await adminApi.getAccounts(loginType === "owner" ? "turf-owner" : "player");
      setDbAccounts(accs || []);
    } catch (e) {
      console.error("Failed loading accounts:", e);
      setDbAccounts([]);
    } finally {
      setIsFetchingAccounts(false);
    }
  };

  const selectGoogleAccount = async (email, fullName, avatar) => {
    try {
      setIsSubmitting(true);
      const targetRole = loginType === "owner" ? "owner" : "player";
      const result = await loginWithGoogle({
        email,
        fullName,
        avatar,
        role: targetRole,
      });

      setIsSubmitting(false);
      setIsGoogleModalOpen(false);

      if (result.success) {
        if (result.isNewUser) {
          toast.success(`Google account registered in MySQL! Welcome, ${result.user.fullName}!`);
        } else {
          toast.success(`Welcome back, ${result.user.fullName}! Logged in via Google.`);
        }
        setIsSuccess(true);
        setTimeout(() => {
          if (result.user.accountType === "turf-owner") {
            navigate("/admin-panel");
          } else {
            navigate("/");
          }
        }, 1000);
      } else {
        toast.error(result.error || "Google auth failed");
      }
    } catch (err) {
      toast.error("Google authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!googleEmailInput.trim()) {
      toast.error("Please enter a Google email or phone");
      return;
    }
    await selectGoogleAccount(
      googleEmailInput.trim(),
      googleNameInput.trim() || googleEmailInput.split("@")[0],
      `https://i.pravatar.cc/150?u=${encodeURIComponent(googleEmailInput.trim())}`
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
  };

  const isFormValid = () => {
    return formData.email.trim().length >= 3 && formData.password.trim().length >= 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsSubmitting(true);
    const result = await login(
      formData.email.trim(),
      formData.password.trim(),
      loginType === "owner" ? "turf-owner" : "player"
    );

    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);

    if (result.success) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", result.user.fullName ? result.user.fullName.split(" ")[0] : "User");
      toast.success(`Welcome back, ${result.user.fullName || "User"}!`);
      setIsSuccess(true);
      setTimeout(() => {
        if (result.user.accountType === "turf-owner") {
          navigate("/admin-panel");
        } else {
          navigate("/");
        }
      }, 1000);
    } else {
      toast.error(result.error || "Invalid email or password");
    }
  };

  // OTP Handlers
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      toast.error("Please enter your registered Email or Phone number");
      return;
    }
    try {
      setIsOtpLoading(true);
      const res = await adminApi.requestOtp(forgotIdentifier.trim());
      if (res.success) {
        setActiveOtpCode(res.otp);
        setRecoveredUser(res.user);
        toast.success(`OTP Code Generated: ${res.otp}`, { duration: 10000 });
        setForgotStep(2);
      } else {
        toast.error(res.error || "Account not found");
      }
    } catch (err) {
      toast.error("Failed requesting OTP");
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!forgotOtp.trim()) {
      toast.error("Please enter the 6-digit OTP code");
      return;
    }
    try {
      setIsOtpLoading(true);
      const res = await adminApi.verifyOtp(forgotIdentifier.trim(), forgotOtp.trim());
      if (res.success) {
        toast.success("OTP verified successfully!");
        setForgotStep(3);
      } else {
        toast.error(res.error || "Invalid OTP code");
      }
    } catch (err) {
      toast.error("Failed verifying OTP");
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      toast.error("Password must be at least 4 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setIsOtpLoading(true);
      const res = await adminApi.resetPassword(forgotIdentifier.trim(), forgotOtp.trim(), newPassword.trim());
      if (res.success) {
        toast.success("Password reset in database! Auto-filling your credentials.");
        setFormData((prev) => ({
          ...prev,
          email: recoveredUser?.email || forgotIdentifier,
          password: newPassword,
        }));
        setIsForgotModalOpen(false);
        setForgotStep(1);
      } else {
        toast.error(res.error || "Failed resetting password");
      }
    } catch (err) {
      toast.error("Error resetting password");
    } finally {
      setIsOtpLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-end font-sans relative overflow-hidden">
      {/* Right Aligned Full Height Login Form Drawer */}
      <div className="w-full sm:w-[440px] sm:max-w-none min-h-screen h-full bg-card shadow-[-8px_0_30px_rgb(0,0,0,0.06)] border-y border-l border-border px-6 sm:px-10 py-10 relative z-10 flex flex-col justify-center">

        {/* Close Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute right-5 top-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer z-20"
          title="Close Login"
          aria-label="Close Login"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Unified Form Wrapper */}
        <div className="w-full my-auto space-y-4">
          {/* HEADER LOGO */}
          <div className="w-full flex flex-col items-center justify-center m-0 p-0 z-10">
            <Link to="/" className="flex items-center m-0 p-0">
              <Logo className="h-[120px] sm:h-22" />
            </Link>
          </div>

          {/* Sign In Form */}
          <div className="space-y-3 pt-1">
            <div className="space-y-0.5 mb-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-tight">
                {loginType === "owner" ? "Admin Login" : "Login"}
              </h1>
              <p className="text-xs text-muted-foreground pt-1">
                Enter your credentials below to access<br className="hidden sm:block" /> your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[12px] font-medium text-foreground">{loginType === "owner" ? "Email or Turf Owner ID" : "Email Address, Phone or Username"}</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                  <Input
                    id="email"
                    name="email"
                    type="text"
                    placeholder={loginType === "owner" ? "Enter your email or Turf Owner ID" : "Enter your email or phone"}
                    className="pl-11 h-10 rounded-lg border-border text-[12px] focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground bg-background"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[12px] font-medium text-foreground">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-11 pr-10 h-10 rounded-lg border-border text-[12px] focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground bg-background"
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
                      <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                    ) : (
                      <Eye className="h-5 w-5" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotModalOpen(true);
                      setForgotStep(1);
                      setForgotMode("password");
                    }}
                    className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-0.5">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={handleCheckboxChange}
                  className="rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary cursor-pointer"
                />
                <label
                  htmlFor="remember"
                  className="text-[12px] font-medium text-muted-foreground cursor-pointer select-none"
                >
                  Remember me for 30 days
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !isFormValid()}
                className={cn(
                  "w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer mt-3",
                  (!isFormValid() || isSubmitting) && "opacity-60 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <span>Login</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-3 text-muted-foreground font-medium tracking-wider">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={handleOpenGoogleModal}
              className="w-full h-10 rounded-lg border-border bg-card hover:bg-muted text-foreground font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Login with Google</span>
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                Don't have an account yet?{" "}
                <Link
                  to={`/register?type=${loginType}`}
                  className="font-medium text-primary hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Premium UI/UX Success Modal Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 bg-card/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="h-16 w-16 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Authenticated!</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Redirecting you to your account...
            </p>
          </div>
        )}
      </div>

      {/* Official Google Dark Mode Sign-In Modal Overlay */}
      <Dialog open={isGoogleModalOpen} onOpenChange={setIsGoogleModalOpen}>
        <DialogContent className="bg-[#1f1f1f] text-white border border-[#444746] rounded-3xl max-w-2xl p-0 overflow-hidden shadow-2xl">
          {/* Header Bar */}
          <div className="p-6 pb-4 border-b border-[#303134] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="text-sm font-medium text-slate-300">Sign in with Google</span>
            </div>
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(false)}
              aria-label="Close modal"
              className="z-50 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/15 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          <div className="p-8 grid md:grid-cols-2 gap-8 items-start">
            {/* Left Column: Branding & Sign In Title */}
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-xl text-emerald-400">
                S
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-normal tracking-tight text-white">Sign in</h2>
                <p className="text-sm text-slate-400">to continue to <strong className="text-white">SportXClub</strong></p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pt-4">
                Before using this app, you can review SportXClub's <a href="#" className="text-blue-400 underline">Privacy Policy</a> and <a href="#" className="text-blue-400 underline">Terms of Service</a>.
              </p>
            </div>

            {/* Right Column: Database Accounts List & Input */}
            <div className="space-y-5">
              {dbAccounts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Google Account</p>
                  {isFetchingAccounts ? (
                    <div className="p-4 text-center text-xs text-slate-400 animate-pulse">
                      Checking accounts...
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {dbAccounts.map((acc, idx) => (
                        <button
                          key={acc.email || idx}
                          type="button"
                          onClick={() => selectGoogleAccount(acc.email, acc.name, acc.avatar)}
                          className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#2b2b2b] hover:bg-[#363636] border border-[#444746] transition-all cursor-pointer text-left group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={acc.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(acc.email)}`}
                              alt={acc.name}
                              className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/20"
                            />
                            <div className="min-w-0 truncate">
                              <p className="font-bold text-xs text-white truncate group-hover:text-blue-400">
                                {acc.name}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">{acc.email}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                            Sign In
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Or Google Email Input Box */}
              {(!showCustomGoogleInput && dbAccounts.length > 0) ? (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#2b2b2b] hover:bg-[#363636] border border-dashed border-[#444746] transition-all cursor-pointer text-left text-xs font-bold text-slate-300 hover:text-white"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-white">
                    +
                  </div>
                  <span>Use another account</span>
                </button>
              ) : (
                <form onSubmit={handleCustomGoogleSubmit} className="space-y-4 pt-1">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">Email or phone</Label>
                    <Input
                      type="text"
                      value={googleEmailInput}
                      onChange={(e) => setGoogleEmailInput(e.target.value)}
                      placeholder="Email or phone"
                      className="bg-[#131314] border-[#8e918f] focus-visible:ring-blue-500 text-white text-xs h-12 rounded-xl"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {dbAccounts.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowCustomGoogleInput(false)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-transparent text-xs font-medium p-0 h-auto"
                      >
                        Back to list
                      </Button>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#a8c7fa] hover:bg-[#8ab4f8] text-[#040b19] font-bold text-xs h-10 px-6 rounded-full cursor-pointer ml-auto"
                    >
                      {isSubmitting ? "Verifying..." : "Next"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Footer Bar */}
          <div className="p-4 bg-[#131314] border-t border-[#303134] flex items-center justify-between text-xs text-slate-400 px-8">
            <span>English (United States)</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">Help</a>
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgot Password / Forgot Email OTP Modal */}
      <Dialog open={isForgotModalOpen} onOpenChange={setIsForgotModalOpen}>
        <DialogContent className="bg-card text-foreground border-border rounded-2xl max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-lg flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-600" />
              Account Recovery (OTP)
            </DialogTitle>
          </DialogHeader>

          {/* Mode Switch Tabs */}
          <div className="flex border-b border-border pb-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setForgotMode("password");
                setForgotStep(1);
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                forgotMode === "password"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Forgot Password
            </button>
            <button
              type="button"
              onClick={() => {
                setForgotMode("email");
                setForgotStep(1);
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                forgotMode === "email"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Forgot Email
            </button>
          </div>

          {/* STEP 1: Enter Email / Phone */}
          {forgotStep === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4 pt-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enter your registered Email Address or Phone Number to generate and receive a 6-digit OTP code.
              </p>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Registered Email or Mobile Number</Label>
                <Input
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="e.g. rahul@example.com or 9876543210"
                  className="h-10 text-xs rounded-xl"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isOtpLoading}
                className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl cursor-pointer"
              >
                {isOtpLoading ? "Generating OTP..." : "Send OTP Code"}
              </Button>
            </form>
          )}

          {/* STEP 2: Enter & Verify OTP */}
          {forgotStep === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  OTP Code Generated! For testing, your OTP is: <span className="underline text-sm font-black tracking-widest">{activeOtpCode}</span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit verification code sent for <strong>{forgotIdentifier}</strong>:
              </p>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">6-Digit OTP Code</Label>
                <Input
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  placeholder="e.g. 123456"
                  maxLength={6}
                  className="h-10 text-center font-mono text-base tracking-widest rounded-xl"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgotStep(1)}
                  className="w-1/3 h-10 text-xs rounded-xl cursor-pointer"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isOtpLoading}
                  className="w-2/3 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl cursor-pointer"
                >
                  {isOtpLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: Reset Password OR Show Email */}
          {forgotStep === 3 && (
            <div className="space-y-4 pt-2">
              {forgotMode === "password" ? (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Set a new password for account: <strong>{recoveredUser?.email || forgotIdentifier}</strong>
                  </p>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">New Password</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-10 text-xs rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Confirm New Password</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-10 text-xs rounded-xl"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isOtpLoading}
                    className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl cursor-pointer"
                  >
                    {isOtpLoading ? "Updating Database..." : "Reset Password & Save"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4 text-center py-2">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold">Registered Account Found</p>
                    <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{recoveredUser?.email}</p>
                    <p className="text-xs text-muted-foreground">Name: {recoveredUser?.fullName}</p>
                  </div>
                  <Button
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, email: recoveredUser?.email || "" }));
                      setIsForgotModalOpen(false);
                      toast.success("Email auto-filled in login form!");
                    }}
                    className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Auto-Fill Email in Login Form
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
