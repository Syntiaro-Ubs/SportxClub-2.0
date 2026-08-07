import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Fingerprint, Zap, Trophy, KeyRound, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { AppDownloadCTA } from "../../components/home/AppDownloadCTA";
import { Footer } from "../../components/home/Footer";
import { Logo } from "../../components/brand/Logo";
import { useAuth } from "../../providers/auth-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { adminApi } from "../../services/admin-api";
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

export function PlayerLoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email/username and password.");
      return;
    }
    try {
      setIsLoading(true);
      const res = await login(email.trim(), password.trim());
      if (res.success) {
        toast.success(`Welcome back, ${res.user.fullName || "Player"}!`);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userName", res.user.fullName ? res.user.fullName.split(" ")[0] : "Player");
        setTimeout(() => {
          navigate("/community");
        }, 800);
      } else {
        toast.error(res.error || "Invalid email or password");
      }
    } catch (err) {
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

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
      const accs = await adminApi.getAccounts();
      setDbAccounts(accs || []);
    } catch (e) {
      console.error("Failed loading accounts:", e);
      setDbAccounts([]);
    } finally {
      setIsFetchingAccounts(false);
    }
  };

  const selectGoogleAccount = async (accountEmail, fullName, avatar) => {
    try {
      setIsLoading(true);
      const result = await loginWithGoogle({
        email: accountEmail,
        fullName,
        avatar,
        role: "player",
      });

      setIsLoading(false);
      setIsGoogleModalOpen(false);

      if (result.success) {
        if (result.isNewUser) {
          toast.success(`Account registered in MySQL database! Welcome, ${result.user.fullName}!`);
        } else {
          toast.success(`Welcome back, ${result.user.fullName}! Logged in via Google.`);
        }
        setTimeout(() => {
          navigate("/community");
        }, 800);
      } else {
        toast.error(result.error || "Google Auth failed");
      }
    } catch (err) {
      toast.error("Google login failed");
    } finally {
      setIsLoading(false);
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
        setEmail(recoveredUser?.email || forgotIdentifier);
        setPassword(newPassword);
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
    <div className="bg-background text-foreground relative overflow-hidden">
      <div className="min-h-screen relative flex flex-col md:flex-row">
        {/* Background ambient light */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Left Column - Graphic/Branding */}
        <div className="hidden md:flex md:w-1/2 relative flex-col justify-end p-12 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1518659132512-32b0051e51b1?q=80&w=1080"
              alt="Athlete in dark background"
              className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>

          <div className="relative z-10 space-y-6 max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold tracking-tight text-foreground leading-tight">
                Unleash Your <br />
                <span className="text-emerald-600">True Potential.</span>
              </h1>
              <p className="mt-4 text-muted-foreground text-sm">
                The ultimate portal for athletes. Book turfs, track stats, and
                join the elite community.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4 mt-8"
            >
              <div className="flex items-center gap-2 bg-muted/50 backdrop-blur-md px-4 py-2 rounded-full border border-border">
                <Zap className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-medium">Instant Booking</span>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 backdrop-blur-md px-4 py-2 rounded-full border border-border">
                <Trophy className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-medium">Pro Stats</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 z-10">
          <div className="w-full max-w-md flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center md:text-left flex flex-col"
            >
              <Logo className="h-28 md:h-20 m-0 p-0 mx-auto md:mx-0" />
              <h2 className="text-xl font-bold tracking-tight text-foreground mt-2">
                Player Portal
              </h2>
              <p className="text-xs text-muted-foreground">
                Login to access your dashboard & community feed
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleLogin}
              className="space-y-5"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium ml-1">
                    Email / Username
                  </label>
                  <Input
                    type="text"
                    placeholder="athlete@sportx.club"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-emerald-600 focus-visible:border-emerald-600 h-12 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-xs text-muted-foreground font-medium">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotModalOpen(true);
                        setForgotStep(1);
                        setForgotMode("password");
                      }}
                      className="text-[10px] text-emerald-600 hover:underline cursor-pointer font-bold"
                    >
                      Forgot password / email?
                    </button>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-emerald-600 focus-visible:border-emerald-600 h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all hover:shadow-[0_0_20px_rgba(5,150,105,0.4)] cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Enter Arena <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-background px-3 text-muted-foreground font-medium">OR</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleOpenGoogleModal}
                className="w-full h-11 rounded-xl border-border bg-card text-foreground font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
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

              <p className="text-center text-xs text-muted-foreground pt-4">
                Don't have an athlete pass?{" "}
                <Link to="/register?type=player" className="text-emerald-600 hover:underline font-bold">
                  Register now
                </Link>
              </p>
            </motion.form>
          </div>
        </div>
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
              onClick={() => setIsGoogleModalOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
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
                      disabled={isLoading}
                      className="bg-[#a8c7fa] hover:bg-[#8ab4f8] text-[#040b19] font-bold text-xs h-10 px-6 rounded-full cursor-pointer ml-auto"
                    >
                      {isLoading ? "Verifying..." : "Next"}
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
                  ? "bg-emerald-600 text-white"
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
                  ? "bg-emerald-600 text-white"
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
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
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
                  className="w-2/3 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
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
                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
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
                      setEmail(recoveredUser?.email || "");
                      setIsForgotModalOpen(false);
                      toast.success("Email auto-filled in login form!");
                    }}
                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Auto-Fill Email in Login Form
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <AppDownloadCTA />
      <Footer />
    </div>
  );
}
