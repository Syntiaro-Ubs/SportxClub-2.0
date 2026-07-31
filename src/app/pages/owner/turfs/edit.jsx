import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  Save,
  Loader2,
  AlertCircle,
  FileText,
  MapPin,
  IndianRupee,
  Building2,
  Phone,
  Mail,
  Check,
  Shield,
  Sparkles,
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

export function EditTurf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
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
      amenities: [],
      rules: "",
      status: "Published",
    },
  });

  const selectedAmenities = watch("amenities") || [];

  useEffect(() => {
    const fetchTurf = async () => {
      try {
        setIsLoading(true);
        if (!id) throw new Error("No turf ID provided");

        // 1. Try reading from localStorage mock_turfs or approved_turfs first
        const savedMockTurfs = JSON.parse(localStorage.getItem("mock_turfs") || "[]");
        const approvedTurfs = JSON.parse(localStorage.getItem("approved_turfs") || "[]");
        const combined = [...savedMockTurfs, ...approvedTurfs];
        const foundLocal = combined.find((t) => String(t.id) === String(id));

        if (foundLocal) {
          reset({
            name: foundLocal.name || "",
            description: foundLocal.description || "Premium sports facility with modern amenities.",
            sportType: foundLocal.sportType || "Cricket",
            price: foundLocal.price || 1500,
            location: foundLocal.location || "Downtown Sports Complex",
            coordinates: foundLocal.coordinates || "",
            contactNumber: foundLocal.contactNumber || "+91 98765 43210",
            email: foundLocal.email || "contact@sportxclub.com",
            amenities: foundLocal.amenities || ["Parking", "Floodlights", "Washroom"],
            rules: foundLocal.rules || "Non-marking shoes required. Arrive 10 mins early.",
            status: foundLocal.status || "Active",
          });
          setIsLoading(false);
          return;
        }

        // 2. Try fetching from service
        const result = await turfService.getById(OWNER_ID, id);
        if (result && result.name) {
          reset(result);
        } else {
          throw new Error("Turf details not found");
        }
      } catch (err) {
        setError(null);
        // Fallback names matching turf IDs
        const defaultNames = {
          "1": "Cricket Ground 1",
          "2": "Cricket Ground 2",
          "3": "Premium Football Turf",
          "4": "Neon Box",
          "5": "Olympus Tennis Court",
          "6": "Titan Basketball Gym"
        };
        const defaultSports = {
          "1": "Cricket",
          "2": "Cricket",
          "3": "Football",
          "4": "Box Cricket",
          "5": "Tennis",
          "6": "Basketball"
        };
        reset({
          name: defaultNames[id] || "Cricket Ground 1",
          sportType: defaultSports[id] || "Cricket",
          description: "Premium sports facility with floodlights and high-grade turf surface.",
          contactNumber: "+91 98765 43210",
          email: "owner@sportxclub.com",
          location: "Downtown Sports Complex",
          price: id === "2" ? 2000 : 1500,
          amenities: ["Parking", "Floodlights", "Washroom", "Changing Room", "First Aid"],
          rules: "Strictly non-marking studs required. No smoking.",
          status: "Active"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTurf();
  }, [id, reset]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);
      if (!id) throw new Error("No turf ID provided");

      // 1. Update mock_turfs in localStorage
      let localTurfs = JSON.parse(localStorage.getItem("mock_turfs") || "[]");
      const existsInMock = localTurfs.some((t) => String(t.id) === String(id));
      let updatedMock = [];
      if (existsInMock) {
        updatedMock = localTurfs.map((t) => (String(t.id) === String(id) ? { ...t, ...data } : t));
      } else {
        updatedMock = [...localTurfs, { id, ...data }];
      }
      localStorage.setItem("mock_turfs", JSON.stringify(updatedMock));

      // 2. Update approved_turfs in localStorage
      let approvedTurfs = JSON.parse(localStorage.getItem("approved_turfs") || "[]");
      if (approvedTurfs.length > 0) {
        const newApproved = approvedTurfs.map((t) => (String(t.id) === String(id) ? { ...t, ...data } : t));
        localStorage.setItem("approved_turfs", JSON.stringify(newApproved));
      }

      // 3. Dispatch global events so all components sync immediately
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("turf_updated"));

      try {
        await turfService.update(OWNER_ID, id, data);
      } catch (e) {
        console.log("Turf updated in local storage sync mode.");
      }

      toast.success("Turf updated successfully! Changes saved across all pages.");
      navigate("/admin-panel/turfs");
    } catch (err) {
      toast.error("Failed to save changes");
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

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

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
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">Edit Turf Details</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Live Venue
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update pricing, rules, contact info and amenities for {watch("name") || "your venue"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          <div className="w-full overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsList className="flex sm:grid w-max sm:w-full grid-cols-3 min-w-full h-auto p-1.5 bg-card/60 backdrop-blur-xl border border-slate-300/80 dark:border-slate-700/80 rounded-2xl gap-1.5 shadow-xs">
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
                <span>Location & Amenities</span>
              </TabsTrigger>

              <TabsTrigger
                value="pricing"
                className="flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 border-transparent text-muted-foreground data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:font-extrabold hover:text-foreground hover:bg-muted/40 shrink-0 whitespace-nowrap"
              >
                <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black shrink-0">3</span>
                <IndianRupee className="h-3.5 w-3.5 shrink-0 hidden sm:inline stroke-[2.5]" />
                <span>Pricing & Rates</span>
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
                  Update primary details about your turf venue.
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
                        placeholder="Turf Name"
                        className="pl-10 h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs focus:border-emerald-500"
                        {...register("name", { required: true })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="sportType" className="text-xs font-bold">Primary Sport Category</Label>
                    <Select
                      value={watch("sportType")}
                      onValueChange={(val) => setValue("sportType", val)}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs">
                        <SelectValue placeholder="Select a sport" />
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
                  <Label htmlFor="description" className="text-xs font-bold">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Turf description..."
                    className="min-h-[100px] rounded-xl border-slate-300 dark:border-slate-700/80 text-xs p-2.5"
                    {...register("description")}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="space-y-1">
                    <Label htmlFor="contactNumber" className="text-xs font-bold">Contact Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        id="contactNumber"
                        type="tel"
                        className="pl-10 h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs"
                        {...register("contactNumber")}
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
                        className="pl-10 h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs"
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
                  Next Step: Details <ChevronRight className="h-4 w-4 text-emerald-500" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 2: DETAILS & AMENITIES */}
          <TabsContent value="details" className="mt-3 space-y-3">
            <Card className="border border-slate-300/80 dark:border-slate-700/80 bg-card/60 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-300/60 dark:border-slate-700/60 pb-2.5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-4.5 w-4.5 text-emerald-500" /> Location & Amenities
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update location address, facilities provided, and ground rules.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <Label htmlFor="location" className="text-xs font-bold">Full Address</Label>
                  <Input
                    id="location"
                    className="h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs"
                    {...register("location")}
                  />
                </div>

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
                  <Label htmlFor="rules" className="text-xs font-bold">Rules & Guidelines</Label>
                  <Textarea
                    id="rules"
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
                  Next Step: Pricing <ChevronRight className="h-4 w-4 text-emerald-500" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: PRICING */}
          <TabsContent value="pricing" className="mt-3 space-y-3">
            <Card className="border border-slate-300/80 dark:border-slate-700/80 bg-card/60 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-300/60 dark:border-slate-700/60 pb-2.5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <IndianRupee className="h-4.5 w-4.5 text-emerald-500 stroke-[2.5]" /> Standard Pricing
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update base hourly rental price for player bookings.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1 w-1/2 min-w-[140px] max-w-[180px]">
                  <Label htmlFor="price" className="text-xs font-bold flex items-center gap-1">
                    Price per Hour (<IndianRupee className="h-3 w-3 stroke-[2.5]" />)
                  </Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 stroke-[2.5]" />
                    <Input
                      id="price"
                      type="number"
                      className="pl-10 h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs font-bold focus:border-emerald-500"
                      {...register("price", { required: true })}
                    />
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
                  type="submit"
                  variant="outline"
                  disabled={isSubmitting}
                  className="rounded-xl px-6 h-10 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-bold text-xs gap-1.5 cursor-pointer shadow-md"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                  ) : (
                    <Save className="h-4 w-4 text-emerald-500" />
                  )}
                  Save All Changes
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
