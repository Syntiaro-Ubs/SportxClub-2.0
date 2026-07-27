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
  const initialType = searchParams.get("type") || "player";
  
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState(initialType);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
        if (result.user.role === "owner" || loginType === "owner") navigate("/owner-dashboard");
        else if (result.user.role === "admin") navigate("/admin");
        else navigate("/");
      }, 1500);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="bg-slate-50 relative overflow-hidden transition-colors duration-200 font-sans">
      <div className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 pt-10 sm:pt-12">
        
      {/* MAIN CARD CONTAINER */}
      <div className="w-full max-w-[460px] bg-white rounded-none shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100 p-4 sm:px-6 sm:py-6 relative z-10">
        
        {/* HEADER LOGO */}
        <div className="w-full flex flex-col items-center justify-center mb-4 z-10">
          <Link to="/" className="flex items-center m-0 p-0">
            <img src="/assets/icons/SportXClub.png" alt="SportXClub" className="h-20 m-0 p-0 object-contain" />
          </Link>
          <div className="w-[85%] mt-2 h-[2px] bg-gradient-to-r from-transparent via-[#22c55e] to-transparent opacity-60" />
        </div>
        
        {isSuccess ? (
          // Success Screen
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 space-y-6"
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
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Login Successful</h1>
              <p className="text-slate-500 text-sm">
                Welcome back! Loading your profile dashboard...
              </p>
            </div>
          </motion.div>
        ) : (
          // Sign In Form
          <div className="space-y-4">
            <div className="space-y-1 mb-4">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {loginType === "owner" ? "Turf Owner Login" : "Login"}
              </h1>
              <p className="text-sm text-slate-600 pt-1">
                Enter your credentials below to access<br className="hidden sm:block"/> your account.
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
                    placeholder="john@example.com"
                    className="pl-11 h-10 rounded-lg border-slate-300 text-[12px] focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 placeholder:text-slate-500 bg-white"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[12px] font-medium text-slate-900">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 h-5 w-5 text-slate-500" strokeWidth={1.5} />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="* * * * * * *"
                    className="pl-11 pr-11 h-10 rounded-lg border-slate-300 text-sm tracking-widest focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 placeholder:text-slate-500 placeholder:tracking-widest placeholder:text-[13px] bg-white pt-1"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-700 transition"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                    ) : (
                      <Eye className="h-5 w-5" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                <div className="flex justify-end">
                  <a href="#" className="text-[11px] font-semibold text-slate-900 hover:underline">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-2 py-0.5">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={handleCheckboxChange}
                  className="h-4.5 w-4.5 rounded data-[state=checked]:bg-[#0FA83F] data-[state=checked]:border-[#0FA83F] border-slate-300"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-[12px] text-slate-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Remember me for 30 days
                </label>
              </div>

              <div className="pt-1">
                <Button
                  type="submit"
                  disabled={!isFormValid() || isSubmitting}
                  className="w-full h-10 rounded-lg bg-[#0FA83F] hover:bg-[#0E9739] text-white text-[13px] font-medium transition-all flex items-center justify-center gap-2 group"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    <>
                      Login
                      <ChevronRight className="h-4 w-4 stroke-[2.5] transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Social Login Divider */}
            <div className="relative my-4 flex items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wide bg-white px-2">
                OR CONTINUE WITH
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Google Sign In */}
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsSubmitting(true);
                setTimeout(() => {
                  setIsSubmitting(false);
                  setIsSuccess(true);
                  setTimeout(() => {
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("userName", "Guest");
                    if (loginType === "owner") navigate("/owner-dashboard");
                    else navigate("/");
                  }, 1500);
                }, 1200);
              }}
              className="w-full h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 text-[13px] font-medium transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 52.749 L -8.284 52.749 C -8.574 54.229 -9.424 55.479 -10.684 56.329 L -10.684 58.569 L -6.824 58.569 C -4.564 56.489 -3.264 53.309 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 58.569 L -10.684 56.329 C -11.764 57.059 -13.134 57.519 -14.754 57.519 C -17.904 57.519 -20.574 55.399 -21.524 52.539 L -25.534 52.539 L -25.534 55.659 C -23.534 59.639 -19.464 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.524 52.539 C -21.774 51.779 -21.924 50.969 -21.924 50.139 C -21.924 49.309 -21.774 48.499 -21.524 47.739 L -21.524 44.619 L -25.534 44.619 C -26.354 46.259 -26.834 48.139 -26.834 50.139 C -26.834 52.139 -26.354 54.019 -25.534 55.659 L -21.524 52.539 Z"/>
                  <path fill="#EA4335" d="M -14.754 42.749 C -12.984 42.749 -11.404 43.359 -10.154 44.559 L -6.744 41.149 C -8.804 39.229 -11.514 38.009 -14.754 38.009 C -19.464 38.009 -23.534 41.609 -25.534 44.619 L -21.524 47.739 C -20.574 44.879 -17.904 42.749 -14.754 42.749 Z"/>
                </g>
              </svg>
              Login with Google
            </Button>
          </div>
        )}

        {/* Form Footer */}
        {!isSuccess && (
          <div className="text-center text-[12px] text-slate-600 mt-4 mb-2">
            {loginType === "owner" ? (
              <>
                Want to add your turf to our platform?{" "}
                <Link to={`/register${loginType === "owner" ? "?type=owner" : ""}`} className="font-semibold text-[#0FA83F] hover:underline">
                  Register your turf
                </Link>
              </>
            ) : (
              <>
                Don't have an account yet?{" "}
                <Link to={`/register${loginType === "owner" ? "?type=owner" : ""}`} className="font-semibold text-[#0FA83F] hover:underline">
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
      </div>
      <AppDownloadCTA />
      <Footer />
    </div>
  );
}
