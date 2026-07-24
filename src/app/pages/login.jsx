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
    <div className="bg-background relative overflow-hidden transition-colors duration-200">
      <div className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-6 md:p-10">
        {/* BACKGROUND ELEMENTS (Grid + Radial Accent Glows) */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Floating Blur Circles (Dynamic glow backdrop) */}
      <div
        className="absolute top-[10%] right-[5%] w-72 h-72 md:w-96 md:h-96 rounded-full bg-emerald-500/10 blur-[80px] md:blur-[120px] pointer-events-none animate-pulse"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute bottom-[10%] left-[5%] w-72 h-72 md:w-96 md:h-96 rounded-full bg-primary/10 blur-[80px] md:blur-[120px] pointer-events-none animate-pulse"
        style={{ animationDuration: "6s" }}
      />


      {/* HEADER LOGO */}
      <div className="w-full max-w-md flex items-center justify-center mb-[-12px] md:mb-[-22px] z-10">
        <Link to="/" className="flex items-center gap-3">
          <Logo />
        </Link>
      </div>

      {/* MAIN CONTAINER (Centered premium Card) */}
      <div className="w-full max-w-md border border-border/50 bg-card/65 backdrop-blur-2xl rounded-[32px] p-6 sm:p-10 shadow-[0_28px_60px_-24px_rgba(15,23,42,0.15)] dark:shadow-[0_28px_60px_-24px_rgba(0,0,0,0.4)] relative overflow-hidden z-10">
        {/* Subtle top decoration bar */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

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
              <h1 className="text-3xl  tracking-tight">Login Successful</h1>
              <p className="text-muted-foreground text-sm">
                Welcome back! Loading your profile dashboard...
              </p>
            </div>
          </motion.div>
        ) : (
          // Sign In Form
          <div className="space-y-4">
            <div className="space-y-1.5">
              <h1 className="text-2xl  tracking-tight sm:text-3xl">
                {loginType === "owner" ? "Turf Owner Login" : "Login"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials below to access your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Account Type Selector Removed */}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10 h-10.5 rounded-xl border-border bg-background/50 focus-visible:bg-background"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-primary  hover:underline">
                    Forgot password?
                  </a>
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
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={handleCheckboxChange}
                />

                <label
                  htmlFor="rememberMe"
                  className="text-xs text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Remember me for 30 days
                </label>
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={!isFormValid() || isSubmitting}
                  className="w-1/2 h-11 rounded-full bg-primary text-primary-foreground  hover:shadow-lg hover:shadow-primary/10 transition-all flex items-center justify-center gap-1.5 group"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    <>
                      Login
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Social Login Divider */}
            <div className="relative my-4 flex items-center">
              <div className="flex-grow border-t border-border/60"></div>
              <span className="flex-shrink mx-4 text-[0.68rem] text-muted-foreground uppercase  tracking-wider bg-background px-2">
                Or continue with
              </span>
              <div className="flex-grow border-t border-border/60"></div>
            </div>

            {/* Google Sign In */}
            <div className="flex justify-center">
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
                className="w-1/2 h-11 rounded-full border border-border bg-card/30 hover:bg-muted/40 transition-all flex items-center justify-center gap-2.5 "
              >
                <Chrome className="h-4.5 w-4.5 text-primary" />
                Login with Google
              </Button>
            </div>
          </div>
        )}

        {/* Form Footer */}
        {!isSuccess && (
          <div className="text-center text-sm text-muted-foreground mt-4 pt-4 border-t border-border/40">
            {loginType === "owner" ? (
              <>
                Want to add your turf to our platform?{" "}
                <Link to={`/register${loginType === "owner" ? "?type=owner" : ""}`} className="text-primary hover:underline">
                  Register your turf
                </Link>
              </>
            ) : (
              <>
                Don't have an account yet?{" "}
                <Link to={`/register${loginType === "owner" ? "?type=owner" : ""}`} className="text-primary hover:underline">
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
