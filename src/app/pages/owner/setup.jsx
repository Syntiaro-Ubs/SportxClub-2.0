import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../providers/auth-provider";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { motion } from "motion/react";
import { Building2, MapPin, Phone, Building, ArrowRight, CheckCircle2 } from "lucide-react";
import { Logo } from "../../components/brand/Logo";

export function OwnerSetupPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    businessName: "",
    address: "",
    city: "",
    phone: currentUser?.phone || "",
    gender: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, we'd update the user profile here via useAuth/API
    // const updatedUser = { ...currentUser, ...formData, isOnboarded: true };
    // updateProfile(updatedUser);

    setIsSubmitting(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      navigate("/owner-dashboard");
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md w-full border border-border/50 bg-card/65 backdrop-blur-2xl rounded-[32px] p-10"
        >
          <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Profile Created!</h2>
            <p className="text-muted-foreground text-sm">
              Your business profile has been successfully set up. Redirecting you to the dashboard...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-primary/10 blur-[80px] pointer-events-none animate-pulse" style={{ animationDuration: "6s" }} />

      <div className="w-full max-w-xl flex items-center justify-center mb-8 z-10">
        <Logo />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl border border-border/50 bg-card/65 backdrop-blur-2xl rounded-[32px] p-6 sm:p-10 shadow-xl relative z-10"
      >
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Complete your profile</h1>
          <p className="text-muted-foreground text-sm">
            Let's get your turf business set up. We need a few details to create your public profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business / Turf Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="businessName"
                  placeholder="e.g. Green Arena Sports"
                  className="pl-10 h-11 rounded-xl"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder="e.g. 123 Sports Avenue"
                  className="pl-10 h-11 rounded-xl"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="city"
                    placeholder="e.g. Mumbai"
                    className="pl-10 h-11 rounded-xl"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Business Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="Phone number"
                    className="pl-10 h-11 rounded-xl"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <Label htmlFor="gender">Owner Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(val) => setFormData({ ...formData, gender: val })}
                required
              >
                <SelectTrigger id="gender" className="h-11 rounded-xl">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-medium shadow-lg shadow-primary/25 group"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving Profile...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                Complete Setup
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
