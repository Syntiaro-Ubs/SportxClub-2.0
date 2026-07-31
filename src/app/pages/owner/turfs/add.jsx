import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import {
  ArrowLeft,
  Upload,
  Save,
  Send,
  Loader2,
  FileText,
  MapPin,
  IndianRupee,
  Camera,
  Building2,
  Phone,
  Mail,
  Check,
  Clock,
  Sparkles,
  Shield,
  Layers,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { turfService } from "../../../services/turf.service";
import { toast } from "sonner";

const OWNER_ID = "owner-123";

const AMENITIES = [
  { id: "Parking", label: "Parking", icon: "🚗" },
  { id: "Washroom", label: "Washroom", icon: "🚻" },
  { id: "Changing Room", label: "Changing Room", icon: "🚪" },
  { id: "Drinking Water", label: "Drinking Water", icon: "💧" },
  { id: "Floodlights", label: "Floodlights", icon: "💡" },
  { id: "Equipment Rent", label: "Equipment Rent", icon: "⚽" },
  { id: "First Aid", label: "First Aid", icon: "🏥" },
  { id: "Cafe", label: "Cafe", icon: "☕" },
];

const SPORTS = [
  "Cricket",
  "Football",
  "Badminton",
  "Tennis",
  "Basketball",
  "Swimming",
];

export function AddTurf() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      sportType: "",
      price: "",
      location: "",
      coordinates: "",
      contactNumber: "",
      email: "",
      amenities: ["Parking", "Floodlights"],
      rules: "",
      status: "Published",
    },
  });

  const selectedAmenities = watch("amenities") || [];

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await turfService.create(OWNER_ID, data);
      toast.success("Turf created successfully!");
      navigate("/admin-panel/turfs");
    } catch (err) {
      setError(
        err.message || "Failed to create turf. Backend API not available.",
      );
      toast.error("Failed to create turf");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAmenity = (amenityId) => {
    if (selectedAmenities.includes(amenityId)) {
      setValue(
        "amenities",
        selectedAmenities.filter((a) => a !== amenityId),
      );
    } else {
      setValue("amenities", [...selectedAmenities, amenityId]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="flex items-center gap-3">
          <Link to="/admin-panel/turfs">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-300 dark:border-slate-700/80 hover:bg-accent cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">Add New Turf</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> New Listing
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fill in details to publish your sports venue to thousands of players
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <Shield className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          {/* Stepper Tabs Bar */}
          <div className="w-full overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsList className="flex sm:grid w-max sm:w-full grid-cols-2 sm:grid-cols-4 min-w-full h-auto p-1.5 bg-card/60 backdrop-blur-xl border border-slate-300/80 dark:border-slate-700/80 rounded-2xl gap-1.5 shadow-xs">
              <TabsTrigger
                value="basic"
                className="flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 border-transparent text-muted-foreground data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:font-extrabold hover:text-foreground hover:bg-muted/40 shrink-0 whitespace-nowrap"
              >
                <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black shrink-0">1</span>
                <FileText className="h-3.5 w-3.5 shrink-0 hidden sm:inline" />
                <span>Basic Info</span>
              </TabsTrigger>

              <TabsTrigger
                value="details"
                className="flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 border-transparent text-muted-foreground data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:font-extrabold hover:text-foreground hover:bg-muted/40 shrink-0 whitespace-nowrap"
              >
                <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black shrink-0">2</span>
                <MapPin className="h-3.5 w-3.5 shrink-0 hidden sm:inline" />
                <span>Details & Rules</span>
              </TabsTrigger>

              <TabsTrigger
                value="pricing"
                className="flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 border-transparent text-muted-foreground data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:font-extrabold hover:text-foreground hover:bg-muted/40 shrink-0 whitespace-nowrap"
              >
                <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black shrink-0">3</span>
                <IndianRupee className="h-3.5 w-3.5 shrink-0 hidden sm:inline stroke-[2.5]" />
                <span>Pricing & Hours</span>
              </TabsTrigger>

              <TabsTrigger
                value="media"
                className="flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 border-transparent text-muted-foreground data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:font-extrabold hover:text-foreground hover:bg-muted/40 shrink-0 whitespace-nowrap"
              >
                <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black shrink-0">4</span>
                <Camera className="h-3.5 w-3.5 shrink-0 hidden sm:inline" />
                <span>Photos</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: BASIC INFO */}
          <TabsContent value="basic" className="mt-3 space-y-3">
            <Card className="border border-slate-300/80 dark:border-slate-700/80 bg-card/60 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-300/60 dark:border-slate-700/60 pb-2.5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Building2 className="h-4.5 w-4.5 text-emerald-500" /> Basic Information
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  The primary details and contact info for your turf venue.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs font-bold">Turf Name *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        id="name"
                        placeholder="e.g., Green Arena Complex"
                        className="pl-10 h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs focus:border-emerald-500"
                        {...register("name", { required: true })}
                      />
                    </div>
                    {errors.name && (
                      <span className="text-[11px] font-semibold text-rose-500">
                        Turf name is required
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="sportType" className="text-xs font-bold">Primary Sport Category *</Label>
                    <Select onValueChange={(val) => setValue("sportType", val)}>
                      <SelectTrigger className="h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs">
                        <SelectValue placeholder="Select a sport category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-300 dark:border-slate-700/80">
                        {SPORTS.map((sport) => (
                          <SelectItem key={sport} value={sport} className="rounded-xl cursor-pointer text-xs">
                            {sport}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description" className="text-xs font-bold">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your turf, turf grass quality, lighting, and nearby landmarks..."
                    className="min-h-[100px] rounded-xl border-slate-300 dark:border-slate-700/80 text-xs p-2.5"
                    {...register("description", { required: true })}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="space-y-1">
                    <Label htmlFor="contactNumber" className="text-xs font-bold">Contact Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        id="contactNumber"
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="pl-10 h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs focus:border-emerald-500"
                        {...register("contactNumber", { required: true })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs font-bold">Business Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="contact@greenarena.com"
                        className="pl-10 h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs focus:border-emerald-500"
                        {...register("email")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-300/60 dark:border-slate-700/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("details")}
                  className="rounded-xl px-5 h-10 border-emerald-500/60 text-foreground hover:bg-emerald-500/10 hover:border-emerald-500 hover:text-emerald-600 font-bold text-xs gap-1.5 cursor-pointer"
                >
                  Next Step: Details & Rules <ChevronRight className="h-4 w-4 text-emerald-500" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 2: DETAILS & RULES */}
          <TabsContent value="details" className="mt-3 space-y-3">
            <Card className="border border-slate-300/80 dark:border-slate-700/80 bg-card/60 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-300/60 dark:border-slate-700/60 pb-2.5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-4.5 w-4.5 text-emerald-500" /> Location & Amenities
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Specify address, amenities provided, and ground rules.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <Label htmlFor="location" className="text-xs font-bold">Full Address *</Label>
                    <Input
                      id="location"
                      placeholder="e.g. 102 Sports Way, Sector 4"
                      className="h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs focus:border-emerald-500"
                      {...register("location", { required: true })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="coordinates" className="text-xs font-bold">Google Maps Coordinates</Label>
                    <Input
                      id="coordinates"
                      placeholder="https://maps.google.com/..."
                      className="h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs focus:border-emerald-500"
                      {...register("coordinates")}
                    />
                  </div>
                </div>

                {/* Interactive Amenities Pills Grid */}
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs font-bold">Select Venue Amenities</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {AMENITIES.map((item) => {
                      const isSelected = selectedAmenities.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleAmenity(item.id)}
                          className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-1.5 select-none ${
                            isSelected
                              ? "border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 font-bold"
                              : "border-slate-300/80 dark:border-slate-700/80 bg-card/40 text-muted-foreground hover:border-slate-400 hover:bg-accent/30"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-sm">{item.icon}</span>
                            <span>{item.label}</span>
                          </div>
                          {isSelected && <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <Label htmlFor="rules" className="text-xs font-bold">Ground Rules & Regulations</Label>
                  <Textarea
                    id="rules"
                    placeholder="e.g. Non-marking shoes required. No smoking or alcohol on premises."
                    className="min-h-[80px] rounded-xl border-slate-300 dark:border-slate-700/80 text-xs p-2.5"
                    {...register("rules")}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-300/60 dark:border-slate-700/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("basic")}
                  className="rounded-xl px-4 h-10 text-xs font-bold gap-1.5 cursor-pointer border-slate-300 dark:border-slate-700/80 hover:bg-accent"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("pricing")}
                  className="rounded-xl px-5 h-10 border-emerald-500/60 text-foreground hover:bg-emerald-500/10 hover:border-emerald-500 hover:text-emerald-600 font-bold text-xs gap-1.5 cursor-pointer"
                >
                  Next Step: Pricing & Hours <ChevronRight className="h-4 w-4 text-emerald-500" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: PRICING & HOURS */}
          <TabsContent value="pricing" className="mt-3 space-y-3">
            <Card className="border border-slate-300/80 dark:border-slate-700/80 bg-card/60 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-300/60 dark:border-slate-700/60 pb-2.5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <IndianRupee className="h-4.5 w-4.5 text-emerald-500 stroke-[2.5]" /> Pricing & Operating Hours
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set hourly rental rates and default daily opening/closing schedules.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1 w-1/2 min-w-[140px] max-w-[180px]">
                  <Label htmlFor="price" className="text-xs font-bold flex items-center gap-1">
                    Standard Hourly Rate (<IndianRupee className="h-3 w-3 stroke-[2.5]" />) *
                  </Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 stroke-[2.5]" />
                    <Input
                      id="price"
                      type="number"
                      placeholder="e.g. 1200"
                      className="pl-10 h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs font-bold focus:border-emerald-500"
                      {...register("price", { required: true })}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-300/70 dark:border-slate-700/70 bg-muted/20 p-3.5 space-y-2.5">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-emerald-500" /> Default Operating Schedule
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Detailed slot management and custom pricing per slot can be adjusted anytime from the Time Slots section.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 max-w-md pt-0.5">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Opening Time</Label>
                      <Input type="time" defaultValue="06:00" className="h-9 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Closing Time</Label>
                      <Input type="time" defaultValue="23:00" className="h-9 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-300/60 dark:border-slate-700/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("details")}
                  className="rounded-xl px-4 h-10 text-xs font-bold gap-1.5 cursor-pointer border-slate-300 dark:border-slate-700/80 hover:bg-accent"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("media")}
                  className="rounded-xl px-5 h-10 border-emerald-500/60 text-foreground hover:bg-emerald-500/10 hover:border-emerald-500 hover:text-emerald-600 font-bold text-xs gap-1.5 cursor-pointer"
                >
                  Next Step: Photos <ChevronRight className="h-4 w-4 text-emerald-500" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: PHOTOS & PUBLISH */}
          <TabsContent value="media" className="mt-3 space-y-3">
            <Card className="border border-slate-300/80 dark:border-slate-700/80 bg-card/60 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-300/60 dark:border-slate-700/60 pb-2.5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Camera className="h-4.5 w-4.5 text-emerald-500" /> Gallery Photos & Upload
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  High quality photos increase booking conversion by over 40%.
                </p>
              </div>

              <div className="border-2 border-dashed border-emerald-500/40 rounded-3xl p-8 text-center hover:bg-emerald-500/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <Upload className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Click or Drag & Drop Photos Here</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Supports PNG, JPG, WEBP up to 5MB each.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-300/60 dark:border-slate-700/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("pricing")}
                  className="rounded-xl px-4 h-10 text-xs font-bold gap-1.5 cursor-pointer border-slate-300 dark:border-slate-700/80 hover:bg-accent"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    variant="outline"
                    onClick={() => setValue("status", "Draft")}
                    disabled={isSubmitting}
                    className="rounded-xl px-4 h-10 text-xs font-bold gap-1.5 cursor-pointer border-slate-300 dark:border-slate-700/80 hover:bg-accent"
                  >
                    <Save className="h-4 w-4 text-muted-foreground" /> Save as Draft
                  </Button>
                  <Button
                    type="submit"
                    variant="outline"
                    onClick={() => setValue("status", "Published")}
                    disabled={isSubmitting}
                    className="rounded-xl px-5 h-10 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-bold text-xs gap-1.5 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                    ) : (
                      <Send className="h-4 w-4 text-emerald-500" />
                    )}
                    Publish Turf Listing
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
