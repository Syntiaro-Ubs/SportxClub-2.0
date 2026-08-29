import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import {
  Card,
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
  FileText,
  MapPin,
  IndianRupee,
  Camera,
  Check,
  Clock,
  Sparkles,
  Shield,
  ChevronRight,
  ChevronLeft,
  X,
  Trash2,
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
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);

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
      sportType: "Football",
      price: "1500",
      location: "",
      coordinates: "",
      contactNumber: "",
      email: "",
      amenities: ["Parking", "Floodlights"],
      rules: "",
      status: "Active",
      image: "",
    },
  });

  const selectedAmenities = watch("amenities") || [];

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (validFiles.length === 0) return;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setUploadedImages((prev) => {
          const next = [...prev, result];
          // Set first image as default turf image
          setValue("image", next[0]);
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
    toast.success(`${validFiles.length} photo(s) added successfully!`);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setUploadedImages((prev) => {
      const next = [...prev, imageUrlInput.trim()];
      setValue("image", next[0]);
      return next;
    });
    setImageUrlInput("");
    toast.success("Image URL added!");
  };

  const handleRemoveImage = (index) => {
    setUploadedImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setValue("image", next.length > 0 ? next[0] : "");
      return next;
    });
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const mainImage = uploadedImages[0] || data.image || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600";
      const payload = {
        ...data,
        image: mainImage,
        image_url: mainImage,
      };
      await turfService.create(OWNER_ID, payload);
      toast.success("Turf created successfully!");
      navigate("/admin-panel/turfs");
    } catch (err) {
      setError(
        err.message || "Failed to create turf.",
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
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        multiple
        className="hidden"
      />

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
              Fill in details to publish your sports venue directly to MySQL
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
            <Card className="border border-slate-300/80 dark:border-slate-700/80 bg-card/60 backdrop-blur-2xl !rounded-none p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-300/60 dark:border-slate-700/60 pb-2.5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-emerald-500" /> Basic Venue Information
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  General details visible to players when browsing and searching for turfs.
                </p>
              </div>

              <div className="grid gap-3.5">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs font-bold">Turf Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Green Arena - Pitch 1"
                    className="h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs font-medium focus:border-emerald-500"
                    {...register("name", { required: "Turf name is required" })}
                  />
                  {errors.name && <p className="text-[10px] text-destructive font-semibold">{errors.name.message}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="sportType" className="text-xs font-bold">Primary Sport Category *</Label>
                    <Select
                      onValueChange={(val) => setValue("sportType", val)}
                      defaultValue={watch("sportType") || "Football"}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs font-medium">
                        <SelectValue placeholder="Select sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPORTS.map((sport) => (
                          <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="contactNumber" className="text-xs font-bold">Venue Contact Phone</Label>
                    <Input
                      id="contactNumber"
                      placeholder="+91 98765 43210"
                      className="h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs font-medium"
                      {...register("contactNumber")}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description" className="text-xs font-bold">Venue Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe turf surface type, dimensions, lighting quality, seating area..."
                    className="min-h-[80px] rounded-xl border-slate-300 dark:border-slate-700/80 text-xs p-2.5"
                    {...register("description")}
                  />
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

          {/* TAB 2: DETAILS & LOCATION */}
          <TabsContent value="details" className="mt-3 space-y-3">
            <Card className="border border-slate-300/80 dark:border-slate-700/80 bg-card/60 backdrop-blur-2xl !rounded-none p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-300/60 dark:border-slate-700/60 pb-2.5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-4.5 w-4.5 text-emerald-500" /> Location & Amenities
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set address, GPS map link, and available facility features.
                </p>
              </div>

              <div className="grid gap-3.5">
                <div className="space-y-1">
                  <Label htmlFor="location" className="text-xs font-bold">Address / Area Name *</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Andheri West, Mumbai"
                    className="h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs font-medium"
                    {...register("location", { required: true })}
                  />
                </div>

                <div className="space-y-1 pt-1">
                  <Label className="text-xs font-bold block mb-1.5">Available Amenities</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {AMENITIES.map((item) => {
                      const isSelected = selectedAmenities.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleAmenity(item.id)}
                          className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-1.5 select-none ${isSelected
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
            <Card className="border border-slate-300/80 dark:border-slate-700/80 bg-card/60 backdrop-blur-2xl !rounded-none p-5 sm:p-6 shadow-xl space-y-4">
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
                      placeholder="e.g. 1500"
                      className="pl-10 h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs font-bold focus:border-emerald-500"
                      {...register("price", { required: true })}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-300/70 dark:border-slate-700/70 bg-muted/20 p-3.5 space-y-2.5">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-emerald-500" /> Default Operating Schedule
                  </h4>
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
            <Card className="border border-slate-300/80 dark:border-slate-700/80 bg-card/60 backdrop-blur-2xl !rounded-none p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-300/60 dark:border-slate-700/60 pb-2.5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Camera className="h-4.5 w-4.5 text-emerald-500" /> Gallery Photos & Upload
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload turf photos from your device or paste image URLs.
                </p>
              </div>

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${isDragging
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-emerald-500/40 hover:bg-emerald-500/5"
                  }`}
              >
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <Upload className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Click or Drag & Drop Photos Here</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Supports PNG, JPG, WEBP, GIF files from your computer.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-1 rounded-xl text-xs font-bold border-emerald-500 text-emerald-600 dark:text-emerald-400 gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" /> Browse Files
                </Button>
              </div>

              {/* Option to paste image URL */}
              <div className="pt-2">
                <Label className="text-xs font-bold mb-1.5 block">Or Add Image via URL</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/turf-image.jpg"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="h-9 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="h-9 rounded-xl text-xs font-bold px-4"
                  >
                    Add URL
                  </Button>
                </div>
              </div>

              {/* Preview Grid */}
              {uploadedImages.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-foreground mb-2">Uploaded Photos ({uploadedImages.length}):</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {uploadedImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-border group bg-black/10">
                        <img src={imgUrl} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-md"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-300/60 dark:border-slate-700/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("pricing")}
                  className="rounded-xl px-4 h-10 text-xs font-bold gap-1.5 cursor-pointer border-slate-300 dark:border-slate-700/80 hover:bg-accent"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl px-6 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Publish Turf Listing
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
