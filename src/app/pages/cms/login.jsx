import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, User, ShieldCheck, ArrowRight, LayoutDashboard } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { cmsService } from "../../services/cms-service";

export function CMSLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
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
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex items-center justify-center p-4 relative font-sans antialiased">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-black text-xl mx-auto shadow-md">
            S
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#0f172a]">SPORTX CONSOLE</h1>
          <p className="text-xs font-semibold text-[#64748b]">
            Sign in to access your website console dashboard.
          </p>
        </div>

        <Card className="border border-[#e2e8f0] bg-white shadow-xl rounded-3xl overflow-hidden p-2">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-extrabold text-[#0f172a] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Console Administrator Login
            </CardTitle>
            <CardDescription className="text-xs text-[#64748b]">
              Default credentials: <code className="text-[#0f172a] bg-[#f1f5f9] px-1.5 py-0.5 rounded font-mono font-bold">admin / admin123</code>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-extrabold text-[#334155]">Username or Email</Label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-3" />
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="pl-10 h-10 bg-[#f8fafc] border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] font-semibold focus:border-[#0f172a]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-extrabold text-[#334155]">Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-3" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 h-10 bg-[#f8fafc] border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] font-semibold focus:border-[#0f172a]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#0f172a] hover:bg-[#1e293b] text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md"
              >
                {isLoading ? "Authenticating..." : "Sign In to Console"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
