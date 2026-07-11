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
import { Loader2, AlertCircle, Save, Building2, Bell, Palette, CreditCard } from "lucide-react";
import { settingsService } from "../../services/settings.service";

// TODO: Replace with actual auth context ownerId
const OWNER_ID = "owner-123";

export function Settings() {
  const [data, setData] = useState({
    businessName: "",
    contactEmail: "",
    contactPhone: "",
    notifications: false,
    emailAlerts: false,
    smsAlerts: false,
    theme: "system",
    currency: "INR"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Replace with actual method when implemented
        const result = await settingsService.getAll(OWNER_ID);
        if (result) {
          setData(result);
        }
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In reality, call settingsService.update(OWNER_ID, data)
    setIsSaving(false);
    // Optional: show a toast notification here
  };

  const handleChange = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl tracking-tight font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your turf business preferences and profile.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex lg:grid-cols-4 mb-6">
          <TabsTrigger value="general" className="gap-2"><Building2 className="w-4 h-4" /> General</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="w-4 h-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2"><Palette className="w-4 h-4" /> Appearance</TabsTrigger>
          <TabsTrigger value="billing" className="gap-2"><CreditCard className="w-4 h-4" /> Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-md overflow-hidden">
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>
                Update your business details and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input 
                  id="businessName" 
                  value={data.businessName} 
                  onChange={(e) => handleChange("businessName", e.target.value)}
                  className="max-w-md"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input 
                  id="contactEmail" 
                  type="email"
                  value={data.contactEmail} 
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                  className="max-w-md"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input 
                  id="contactPhone" 
                  type="tel"
                  value={data.contactPhone} 
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 bg-muted/20 px-6 py-4 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="gap-2 shadow-sm">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-md overflow-hidden">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about bookings and updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2 max-w-xl">
                <div className="flex flex-col space-y-1">
                  <Label className="text-base font-medium">Push Notifications</Label>
                  <span className="text-sm text-muted-foreground">Receive push notifications in your browser.</span>
                </div>
                <Switch 
                  checked={data.notifications} 
                  onCheckedChange={(c) => handleChange("notifications", c)} 
                />
              </div>
              <div className="flex items-center justify-between space-x-2 max-w-xl">
                <div className="flex flex-col space-y-1">
                  <Label className="text-base font-medium">Email Alerts</Label>
                  <span className="text-sm text-muted-foreground">Receive daily summaries and booking confirmations via email.</span>
                </div>
                <Switch 
                  checked={data.emailAlerts} 
                  onCheckedChange={(c) => handleChange("emailAlerts", c)} 
                />
              </div>
              <div className="flex items-center justify-between space-x-2 max-w-xl">
                <div className="flex flex-col space-y-1">
                  <Label className="text-base font-medium">SMS Alerts</Label>
                  <span className="text-sm text-muted-foreground">Get instant SMS text messages for new bookings.</span>
                </div>
                <Switch 
                  checked={data.smsAlerts} 
                  onCheckedChange={(c) => handleChange("smsAlerts", c)} 
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 bg-muted/20 px-6 py-4 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="gap-2 shadow-sm">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-md overflow-hidden">
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the dashboard looks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="theme">Dashboard Theme</Label>
                <select 
                  id="theme"
                  value={data.theme}
                  onChange={(e) => handleChange("theme", e.target.value)}
                  className="max-w-xs flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="system">System Default</option>
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 bg-muted/20 px-6 py-4 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="gap-2 shadow-sm">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Appearance
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-md overflow-hidden">
            <CardHeader>
              <CardTitle>Billing & Currency</CardTitle>
              <CardDescription>
                Manage your primary currency for reports and payments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="currency">Default Currency</Label>
                <select 
                  id="currency"
                  value={data.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="max-w-xs flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 bg-muted/20 px-6 py-4 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="gap-2 shadow-sm">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Billing Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
