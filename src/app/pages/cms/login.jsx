import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Lock, User, ShieldCheck, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Logo } from "../../components/brand/Logo";
import { cmsService } from "../../services/cms-service";

export function CMSLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please enter username and password.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await cmsService.login(username, password);
      sessionStorage.setItem("sportx_cms_token", res.token);
      sessionStorage.setItem("sportx_cms_user", JSON.stringify(res.user));
      localStorage.setItem("token", res.token);
      localStorage.setItem("cmsAdminUser", JSON.stringify(res.user));
      toast.success("Welcome to SportX Console!");
      navigate("/dashboard");
    } catch (err) {
      console.error("CMS Login Error:", err);
      toast.error(err.message || "Invalid CMS admin credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900 flex flex-col items-center justify-center p-4 relative font-sans antialiased select-none">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-[420px] relative z-10 space-y-5"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-block transform transition-transform hover:scale-105 duration-300">
            <Link to="/">
              <Logo className="h-24 sm:h-28 mx-auto" />
            </Link>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-extrabold text-emerald-700 tracking-wide uppercase mb-1 shadow-xs">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Console Administrator Portal
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Enter authorized credentials to access master dashboard.
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <Card className="border border-slate-200/90 bg-white shadow-lg shadow-slate-200/50 rounded-xl overflow-hidden p-3 sm:p-4 text-slate-800">
          <CardHeader className="space-y-1 pb-3 pt-2">
            <CardTitle className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
              Admin Authentication
            </CardTitle>
            <CardDescription className="text-[11px] text-slate-500">
              Secured single sign-on for platform administrators.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            <form onSubmit={handleLogin} className="space-y-4">

              {/* Username Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Username or Email</Label>
                <div className="relative group">
                  <User className="w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors absolute left-3.5 top-3" />
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    required
                    className="pl-10 h-11 bg-slate-50/80 border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl text-xs text-slate-900 placeholder:text-slate-400 font-semibold focus-visible:ring-1 focus-visible:ring-emerald-600 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Password</Label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors absolute left-3.5 top-3" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="pl-10 pr-10 h-11 bg-slate-50/80 border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl text-xs text-slate-900 placeholder:text-slate-400 font-semibold focus-visible:ring-1 focus-visible:ring-emerald-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button - Outline green border style */}
              <Button
                type="submit"
                disabled={isLoading}
                variant="outline"
                className="w-full h-11 bg-transparent border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-600 hover:text-emerald-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer active:scale-[0.99] gap-2 mt-1"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <>
                    Sign In to Console
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer info */}
        <p className="text-center text-[11px] font-medium text-slate-400">
          © 2026 SportXClub Technologies Pvt. Ltd. • Console v2.0
        </p>
      </motion.div>
    </div>
  );
}
