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
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Logo } from "../components/brand/Logo";
import { cn } from "../components/ui/utils";
import { AppDownloadCTA } from "../components/home/AppDownloadCTA";
import { Footer } from "../components/home/Footer";

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

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const targetRole = loginType === "owner" ? "owner" : "player";
    const result = loginWithGoogle
      ? loginWithGoogle(targetRole)
      : { success: true, user: { role: targetRole } };

    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setIsSuccess(true);

    setTimeout(() => {
      if (result.user.role === "owner" || loginType === "owner") {
        navigate("/admin-panel");
      } else if (result.user.role === "admin") {
        navigate("/site-maker");
      } else {
        navigate("/");
      }
    }, 1200);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
  };

  const isFormValid = () => {
    return formData.email.includes("@") && formData.password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsSubmitting(true);
    const result = login(formData.email, formData.password);

    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);

    if (result.success) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", result.user.fullName.split(" ")[0]);
      setIsSuccess(true);
      setTimeout(() => {
        if (result.user.role === "owner" || loginType === "owner") navigate("/admin-panel");
        else if (result.user.role === "admin") navigate("/site-maker");
        else navigate("/");
      }, 1500);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-end font-sans relative overflow-hidden">
      {/* Right Aligned Full Height Login Form Drawer */}
      <div className="w-full sm:w-[440px] sm:max-w-none min-h-screen h-full bg-white shadow-[-8px_0_30px_rgb(0,0,0,0.06)] border-y border-l border-slate-200/80 px-6 sm:px-10 py-10 relative z-10 flex flex-col justify-center">

        {/* Close Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer z-20"
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
              <img src="/assets/icons/SportXClub.png" alt="SportXClub" className="h-20 sm:h-22 m-0 p-0 object-contain" />
            </Link>
          </div>

          {/* Premium Elegant Gradient Divider */}
          <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#0FA83F]/50 to-transparent" />

          {/* Sign In Form */}
          <div className="space-y-3 pt-1">
          <div className="space-y-0.5 mb-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
              {loginType === "owner" ? "Admin Login" : "Login"}
              </h1>
              <p className="text-xs text-slate-600 pt-1">
                Enter your credentials below to access<br className="hidden sm:block" /> your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              {/* Account Type Selector Removed */}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[12px] font-medium text-slate-900">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 h-5 w-5 text-slate-500" strokeWidth={1.5} />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-11 h-10 rounded-lg border-slate-300 text-[12px] focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 placeholder:text-slate-500 bg-white"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[12px] font-medium text-slate-900">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-[12px] font-medium text-slate-900 hover:text-emerald-600 hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 h-5 w-5 text-slate-500" strokeWidth={1.5} />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-11 pr-10 h-10 rounded-lg border-slate-300 text-[12px] focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 placeholder:text-slate-500 bg-white"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                    ) : (
                      <Eye className="h-5 w-5" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-0.5">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={handleCheckboxChange}
                  className="rounded border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 cursor-pointer"
                />
                <label
                  htmlFor="remember"
                  className="text-[12px] font-medium text-slate-600 cursor-pointer select-none"
                >
                  Remember me for 30 days
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !isFormValid()}
                className={cn(
                  "w-full h-10 rounded-lg bg-[#0FA83F] hover:bg-[#0c8a34] text-white font-medium text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer mt-3",
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
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-3 text-slate-600 font-medium tracking-wider">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={handleGoogleLogin}
              className="w-full h-10 rounded-lg border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
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
              <p className="text-xs text-slate-600">
                Don't have an account yet?{" "}
                <Link
                  to={`/register?type=${loginType}`}
                  className="font-medium text-[#0FA83F] hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Premium UI/UX Success Modal Overlay directly inside Login Card */}
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0 z-50 bg-white/95 dark:bg-[#0c0d10]/95 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-2xl border border-emerald-500/20 overflow-hidden"
          >
            {/* Subtle Background Glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header: Logo & Close */}
            <div className="w-full flex items-center justify-between z-10 pt-1">
              <img src="/assets/icons/SportXClub.png" alt="SportXClub" className="h-10 object-contain" />
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  if (loginType === "owner") navigate("/admin-panel");
                  else navigate("/");
                }}
                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Subtle Glowing Emerald Line */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent my-3 z-10" />

            {/* Center Section: Animated Badge + Message */}
            <div className="my-auto space-y-4 z-10 w-full flex flex-col items-center">
              {/* Animated Glowing Ring with Checkmark */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md animate-pulse" />
                <div className="h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500 relative z-10 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  >
                    <Check className="h-10 w-10 stroke-[3]" />
                  </motion.div>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Login Successful!
                </h2>
                <p className="text-xs text-slate-500 dark:text-white/60">
                  Welcome back! Preparing your sports experience...
                </p>
              </div>

              {/* Sleek Redirect Progress Bar */}
              <div className="w-full max-w-[200px] h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden mt-2">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
