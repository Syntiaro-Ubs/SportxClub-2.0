import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import {
  Loader2,
  AlertCircle,
  Save,
  Building2,
  Bell,
  Palette,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Globe,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Sun,
  Moon,
  Laptop,
  FileText,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Plus,
} from "lucide-react";
import { settingsService } from "../../services/settings.service";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const OWNER_ID = "owner-123";

export function Settings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [data, setData] = useState({
    businessName: "Elite Sports Management",
    contactEmail: "owner@elitesports.com",
    contactPhone: "+91 9800000000",
    city: "Mumbai",
    website: "https://elitesports.com",
    gstin: "27AAAAA0000A1Z5",
    timezone: "Asia/Kolkata (GMT+5:30)",
    notifications: true,
    emailAlerts: true,
    smsAlerts: false,
    dailySummary: true,
    theme: "system",
    currency: "INR",
    bankName: "HDFC Bank Ltd.",
    accountNumber: "•••• •••• 8842",
    ifscCode: "HDFC0001234",
    upiId: "elitesports@hdfc",
    payoutCycle: "daily"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [customColor, setCustomColor] = useState(() => localStorage.getItem("custom_theme_color") || "#059669");

  const handleColorChange = (newColor) => {
    setCustomColor(newColor);
    localStorage.setItem("custom_theme_color", newColor);
    document.documentElement.style.setProperty("--primary", newColor);
    toast.success(`Custom color set to ${newColor}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await settingsService.getAll(OWNER_ID);
        if (result && Object.keys(result).length > 0) {
          setData(prev => ({ ...prev, ...result }));
        }
      } catch (err) {
        console.warn("Using fallback local settings state", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    toast.success("Settings updated successfully!", {
      description: "Your business profile & preferences have been saved.",
      duration: 4000,
    });
  };

  const handleChange = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center text-destructive space-y-4">
        <AlertCircle className="h-12 w-12" />
        <p className="text-lg">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-16">

      {/* Top Page Header */}
      <div className="flex flex-row items-center justify-between gap-3 border-b border-border/40 pb-2 sm:pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Settings</h1>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-1/2 min-w-[150px] max-w-[190px] bg-transparent hover:bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl gap-1.5 px-2.5 h-10 transition-all cursor-pointer shrink-0 ml-auto"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> : <Save className="w-4 h-4 text-emerald-500 stroke-[2.5]" />}
          Save All Changes
        </Button>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-1 sm:mb-3">
          <TabsList className="flex sm:grid w-max sm:w-full grid-cols-2 sm:grid-cols-4 min-w-full h-auto p-1.5 bg-muted/40 rounded-2xl border border-border/40 gap-1.5 shadow-xs">
            <TabsTrigger value="general" className="gap-2 rounded-xl py-2.5 px-3.5 font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all shrink-0 whitespace-nowrap">
              <Building2 className="w-4 h-4 text-emerald-500 shrink-0" /> General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 rounded-xl py-2.5 px-3.5 font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all shrink-0 whitespace-nowrap">
              <Bell className="w-4 h-4 text-emerald-500 shrink-0" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2 rounded-xl py-2.5 px-3.5 font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all shrink-0 whitespace-nowrap">
              <Palette className="w-4 h-4 text-emerald-500 shrink-0" /> Appearance
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2 rounded-xl py-2.5 px-3.5 font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all shrink-0 whitespace-nowrap">
              <CreditCard className="w-4 h-4 text-emerald-500 shrink-0" /> Billing & Payouts
            </TabsTrigger>
          </TabsList>
        </div>

        {/* -------------------------------------------------------------
            TAB 1: GENERAL / BUSINESS PROFILE (2-COLUMN GRID)
            ------------------------------------------------------------- */}
        <TabsContent value="general">
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left Column (2 Cols): Business Form Fields */}
            <Card className="lg:col-span-2 border-border/40 bg-card/30 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-lg font-bold">Business Information</CardTitle>
                <CardDescription className="text-xs">
                  Update primary brand details, contact credentials, and public info.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="businessName" className="text-xs font-bold text-foreground">Business Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="businessName"
                        value={data.businessName}
                        onChange={(e) => handleChange("businessName", e.target.value)}
                        className="pl-9 rounded-xl border-border/60 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-bold text-foreground">City / Region</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="city"
                        value={data.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        className="pl-9 rounded-xl border-border/60 text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="contactEmail" className="text-xs font-bold text-foreground">Contact Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contactEmail"
                        type="email"
                        value={data.contactEmail}
                        onChange={(e) => handleChange("contactEmail", e.target.value)}
                        className="pl-9 rounded-xl border-border/60 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contactPhone" className="text-xs font-bold text-foreground">Contact Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={data.contactPhone}
                        onChange={(e) => handleChange("contactPhone", e.target.value)}
                        className="pl-9 rounded-xl border-border/60 text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="website" className="text-xs font-bold text-foreground">Website URL</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        value={data.website}
                        onChange={(e) => handleChange("website", e.target.value)}
                        className="pl-9 rounded-xl border-border/60 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="timezone" className="text-xs font-bold text-foreground">Timezone</Label>
                    <Input
                      id="timezone"
                      value={data.timezone}
                      onChange={(e) => handleChange("timezone", e.target.value)}
                      className="rounded-xl border-border/60 text-sm font-medium"
                    />
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Right Column (1 Col): Branding & Verification Card */}
            <div className="space-y-6">
              <Card className="border-border/40 bg-card/30 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden text-center p-6 flex flex-col items-center justify-center space-y-4">
                <div className="relative group cursor-pointer">
                  <div className="h-24 w-24 rounded-full border-2 border-dashed border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-emerald-500">
                    <Building2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md hover:bg-emerald-700 transition-colors">
                    <Upload className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-foreground">{data.businessName || "Your Turf Brand"}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Upload high-res logo PNG or JPEG</p>
                </div>

                <div className="w-full pt-3 border-t border-border/40 flex items-center justify-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Verified SportX Partner</span>
                </div>
              </Card>

              <Card className="border-border/40 bg-card/30 backdrop-blur-xl shadow-lg rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-500" /> GSTIN / Tax ID
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-muted/40 font-bold">Active</Badge>
                </div>
                <Input
                  value={data.gstin}
                  onChange={(e) => handleChange("gstin", e.target.value)}
                  className="rounded-xl border-border/60 text-xs font-mono font-bold"
                />
              </Card>
            </div>

          </div>
        </TabsContent>

        {/* -------------------------------------------------------------
            TAB 2: NOTIFICATIONS (TOGGLES & ALERT CHANNELS)
            ------------------------------------------------------------- */}
        <TabsContent value="notifications">
          <Card className="border-border/40 bg-card/30 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-lg font-bold">Notification Preferences</CardTitle>
              <CardDescription className="text-xs">
                Configure real-time booking alerts, instant SMS updates, and revenue summaries.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6 divide-y divide-border/40">

              <div className="flex items-center justify-between pt-0">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-foreground">Browser Push Notifications</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Receive instant pop-up alerts in browser when a customer books a slot.</p>
                  </div>
                </div>
                <Switch
                  checked={data.notifications}
                  onCheckedChange={(c) => handleChange("notifications", c)}
                  className="data-[state=checked]:bg-emerald-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-6">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-foreground">Email Booking Confirmations</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Send booking receipts and monthly summary reports directly to your email.</p>
                  </div>
                </div>
                <Switch
                  checked={data.emailAlerts}
                  onCheckedChange={(c) => handleChange("emailAlerts", c)}
                  className="data-[state=checked]:bg-emerald-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-6">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-foreground">SMS Instant Alerts</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Get direct SMS text messages on phone whenever an urgent slot cancellation occurs.</p>
                  </div>
                </div>
                <Switch
                  checked={data.smsAlerts}
                  onCheckedChange={(c) => handleChange("smsAlerts", c)}
                  className="data-[state=checked]:bg-emerald-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-6">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-foreground">Daily Revenue Summary Digest</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Receive a daily 09:00 PM summary message with total daily collection & slot occupancy.</p>
                  </div>
                </div>
                <Switch
                  checked={data.dailySummary}
                  onCheckedChange={(c) => handleChange("dailySummary", c)}
                  className="data-[state=checked]:bg-emerald-600 cursor-pointer"
                />
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------------------------------------------------
            TAB 3: APPEARANCE (VISUAL THEME SELECTOR CARDS)
            ------------------------------------------------------------- */}
        <TabsContent value="appearance">
          <Card className="border-border/40 bg-card/30 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-lg font-bold">Appearance & Interface Theme</CardTitle>
              <CardDescription className="text-xs">
                Select your preferred visual mode and accent display for the owner dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">

              <Label className="text-xs font-bold text-foreground uppercase tracking-wider">Choose Theme Mode</Label>
              <div className="grid sm:grid-cols-3 gap-4">

                {/* Light Theme Card */}
                <div
                  onClick={() => { setTheme("light"); handleChange("theme", "light"); }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center gap-3 ${resolvedTheme === "light" && theme !== "system" ? "border-emerald-500 bg-emerald-500/5 shadow-md" : "border-border/50 hover:border-border"}`}
                >
                  <div className="h-14 w-full rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                    <Sun className="h-6 w-6 text-amber-500" />
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-foreground">Light Mode</span>
                    {resolvedTheme === "light" && theme !== "system" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </div>
                </div>

                {/* Dark Theme Card */}
                <div
                  onClick={() => { setTheme("dark"); handleChange("theme", "dark"); }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center gap-3 ${resolvedTheme === "dark" && theme !== "system" ? "border-emerald-500 bg-emerald-500/5 shadow-md" : "border-border/50 hover:border-border"}`}
                >
                  <div className="h-14 w-full rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white">
                    <Moon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-foreground">Dark Mode</span>
                    {resolvedTheme === "dark" && theme !== "system" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </div>
                </div>

                {/* Custom Theme Color Card */}
                <div
                  onClick={() => { setTheme("custom"); handleChange("theme", "custom"); }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center gap-3 ${theme === "custom" ? "border-emerald-500 bg-emerald-500/5 shadow-md" : "border-border/50 hover:border-border"}`}
                >
                  <div
                    className="h-14 w-full rounded-xl border border-border flex items-center justify-center transition-all shadow-inner"
                    style={{ backgroundColor: customColor }}
                  >
                    <Palette className="h-6 w-6 text-white drop-shadow-md" />
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-foreground">Custom Color</span>
                    {theme === "custom" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </div>
                </div>

              </div>

              {/* Custom Accent Color Palette Picker */}
              <div className="pt-4 border-t border-border/40 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Palette className="w-4 h-4 text-emerald-500" /> Custom Primary Accent Color
                  </Label>
                  <span className="text-xs font-mono font-bold text-muted-foreground uppercase bg-muted/60 px-2 py-0.5 rounded-md border border-border/40">
                    {customColor}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Preset Swatches */}
                  {[
                    { name: "Emerald", hex: "#059669" },
                    { name: "Electric Blue", hex: "#2563eb" },
                    { name: "Neon Violet", hex: "#7c3aed" },
                    { name: "Sunset Orange", hex: "#f97316" },
                    { name: "Crimson Red", hex: "#e11d48" },
                    { name: "Rose Pink", hex: "#ec4899" },
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => handleColorChange(c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-9 h-9 rounded-xl transition-all cursor-pointer border-2 shadow-xs flex items-center justify-center ${customColor.toLowerCase() === c.hex.toLowerCase() ? "border-foreground scale-110 shadow-md ring-2 ring-emerald-500/40" : "border-transparent hover:scale-105"}`}
                      title={c.name}
                    >
                      {customColor.toLowerCase() === c.hex.toLowerCase() && <CheckCircle2 className="w-4.5 h-4.5 text-white drop-shadow-md" />}
                    </button>
                  ))}

                  {/* Native Custom Color Wheel Picker */}
                  <label className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 via-green-500 to-blue-500 border-2 border-border cursor-pointer flex items-center justify-center shadow-xs hover:scale-105 transition-all overflow-hidden" title="Pick Any Custom Color">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Plus className="w-4.5 h-4.5 text-white drop-shadow-md stroke-[3]" />
                  </label>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------------------------------------------------
            TAB 4: BILLING & PAYOUTS (BANK DETAILS & CURRENCY)
            ------------------------------------------------------------- */}
        <TabsContent value="billing">
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left Column (2 Cols): Connected Payout Account */}
            <Card className="lg:col-span-2 border-border/40 bg-card/30 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-500" /> Bank Payout Account
                </CardTitle>
                <CardDescription className="text-xs">
                  Direct bank transfer account where daily turf revenue is disbursed.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Bank Name</Label>
                    <Input
                      value={data.bankName}
                      onChange={(e) => handleChange("bankName", e.target.value)}
                      className="rounded-xl border-border/60 text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Account Number</Label>
                    <Input
                      value={data.accountNumber}
                      onChange={(e) => handleChange("accountNumber", e.target.value)}
                      className="rounded-xl border-border/60 text-sm font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">IFSC Code</Label>
                    <Input
                      value={data.ifscCode}
                      onChange={(e) => handleChange("ifscCode", e.target.value)}
                      className="rounded-xl border-border/60 text-sm font-mono uppercase font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">UPI ID (Instant Auto-Settle)</Label>
                    <Input
                      value={data.upiId}
                      onChange={(e) => handleChange("upiId", e.target.value)}
                      className="rounded-xl border-border/60 text-sm font-medium"
                    />
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Right Column (1 Col): Currency & Settlement Frequency */}
            <div className="space-y-6">
              <Card className="border-border/40 bg-card/30 backdrop-blur-xl shadow-lg rounded-2xl p-5 space-y-4">
                <div>
                  <Label className="text-xs font-bold text-foreground">Default Currency</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Used for revenue calculations & reports</p>
                </div>
                <select
                  value={data.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </Card>

              <Card className="border-border/40 bg-card/30 backdrop-blur-xl shadow-lg rounded-2xl p-5 space-y-4">
                <div>
                  <Label className="text-xs font-bold text-foreground">Payout Schedule</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Automatic transfer cycle to bank</p>
                </div>
                <select
                  value={data.payoutCycle}
                  onChange={(e) => handleChange("payoutCycle", e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="daily">T+1 Daily Automated Payouts</option>
                  <option value="weekly">Weekly Every Monday</option>
                </select>
              </Card>
            </div>

          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
