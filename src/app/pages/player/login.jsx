import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Fingerprint, Zap, Trophy } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { AppDownloadCTA } from "../../components/home/AppDownloadCTA";
import { Footer } from "../../components/home/Footer";

export function PlayerLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      setIsLoading(false);
      navigate("/player-dashboard");
    }, 1200);
  };

  return (
    <div className="bg-background text-foreground relative overflow-hidden">
      <div className="min-h-screen relative flex flex-col md:flex-row">
      {/* Background ambient light */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#6DFF3B]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#6DFF3B]/5 blur-[120px] rounded-full pointer-events-none" />

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
            <h1 className="text-5xl font-bold tracking-tight text-foreground leading-tight">
              Unleash Your <br />
              <span className="text-[#6DFF3B]">True Potential.</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-lg">
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
              <Zap className="h-4 w-4 text-[#6DFF3B]" />
              <span className="text-sm font-medium">Instant Booking</span>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 backdrop-blur-md px-4 py-2 rounded-full border border-border">
              <Trophy className="h-4 w-4 text-[#6DFF3B]" />
              <span className="text-sm font-medium">Pro Stats</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 z-10">
        <div className="w-full max-w-md space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center md:text-left space-y-2"
          >
            <div className="w-12 h-12 bg-[#6DFF3B]/10 rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0 border border-[#6DFF3B]/20 shadow-[0_0_15px_rgba(109,255,59,0.15)]">
              <Fingerprint className="h-6 w-6 text-[#6DFF3B]" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Player Portal
            </h2>
            <p className="text-muted-foreground">
              Login to access your dashboard
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
                <label className="text-sm text-muted-foreground font-medium ml-1">
                  Email / Username
                </label>
                <Input
                  type="text"
                  placeholder="athlete@sportx.club"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#6DFF3B] focus-visible:border-[#6DFF3B] h-12 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm text-muted-foreground font-medium">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs text-[#6DFF3B] hover:underline"
                  >
                    Forgot?
                  </a>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#6DFF3B] focus-visible:border-[#6DFF3B] h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-[#6DFF3B] hover:bg-[#5ce630] text-black font-semibold text-base transition-all hover:shadow-[0_0_20px_rgba(109,255,59,0.4)]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Enter Arena <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-4">
              Don't have an athlete pass?{" "}
              <a href="#" className="text-[#6DFF3B] hover:underline">
                Register now
              </a>
            </p>
          </motion.form>
        </div>
      </div>
      </div>
      <AppDownloadCTA />
      <Footer />
    </div>
  );
}
