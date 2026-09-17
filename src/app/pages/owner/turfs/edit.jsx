import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useParams } from "react-router";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  MapPin,
  IndianRupee,
  Camera,
  Check,
  Shield,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  Edit2,
  Edit3,
  Trash2,
  Star,
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  ArrowUpDown,
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
  const fileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Modal state for editing an individual gallery photo
  const [editingImageIndex, setEditingImageIndex] = useState(null);
  const [editImageUrlValue, setEditImageUrlValue] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
      sportType: "Football",
      price: "1500",
      location: "",
      contactNumber: "",
      email: "",
      amenities: [],
      rules: "",
      status: "Active",
      image: "",
    },
  });

  const selectedAmenities = watch("amenities") || [];

  useEffect(() => {
    const fetchTurf = async () => {
      try {
        setIsLoading(true);
        if (!id) throw new Error("No turf ID provided");

        const result = await turfService.getById(OWNER_ID, id);
        if (result) {
          reset({
            name: result.name || "",
            description: result.description || "Sports facility",
            sportType: result.sport_type || result.sportType || "Football",
            price: result.price_per_hour || result.price || 1500,
            location: typeof result.location === "object" ? (result.location?.city || result.location?.address || "") : result.location || "",
            contactNumber: result.owner_phone || result.contactNumber || "",
            email: result.email || result.owner_email || "",
            amenities: (() => {
              if (Array.isArray(result.amenities)) return result.amenities;
              if (typeof result.amenities === "string") {
                try {
                  const p = JSON.parse(result.amenities);
                  if (Array.isArray(p)) return p;
                } catch {}
                return result.amenities.split(",").map((s) => s.trim()).filter(Boolean);
              }
              return ["Parking", "Floodlights"];
            })(),
            rules: result.rules || "",
            status: result.status || "Active",
            image: result.image_url || result.image || "",
          });

          // Parse gallery images dynamically
          let initialImages = [];
          if (result.gallery) {
            try {
              const parsed = typeof result.gallery === "string" ? JSON.parse(result.gallery) : result.gallery;
              if (Array.isArray(parsed) && parsed.length > 0) {
                initialImages = parsed.filter(Boolean);
              }
            } catch (e) {
              console.error("Failed parsing turf gallery:", e);
            }
          }
          if (initialImages.length === 0 && (result.image_url || result.image)) {
            initialImages = [result.image_url || result.image];
          }
          setUploadedImages(initialImages);
        }
      } catch (err) {
        console.warn("Could not load turf details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTurf();
  }, [id, reset]);

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (validFiles.length === 0) return;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setUploadedImages((prev) => {
          const next = [...prev, result];
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
    toast.success("Image URL added to gallery!");
  };

  const handleRemoveImage = (index) => {
    setUploadedImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setValue("image", next.length > 0 ? next[0] : "");
      return next;
    });
    toast.info("Photo removed from gallery");
  };

  const handleOpenEditImage = (index) => {
    setEditingImageIndex(index);
    setEditImageUrlValue(uploadedImages[index] || "");
    setIsEditModalOpen(true);
  };

  const handleSaveEditImage = (e) => {
    if (e) e.preventDefault();
    if (editingImageIndex === null || !editImageUrlValue.trim()) return;
    setUploadedImages((prev) => {
      const next = [...prev];
      next[editingImageIndex] = editImageUrlValue.trim();
      if (editingImageIndex === 0) setValue("image", next[0]);
      return next;
    });
    setIsEditModalOpen(false);
    setEditingImageIndex(null);
    toast.success("Gallery photo updated successfully!");
  };

  const handleReplaceFile = (e) => {
    if (editingImageIndex === null || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target.result;
      setUploadedImages((prev) => {
        const next = [...prev];
        next[editingImageIndex] = result;
        if (editingImageIndex === 0) setValue("image", next[0]);
        return next;
      });
      setIsEditModalOpen(false);
      setEditingImageIndex(null);
      toast.success("Photo replaced successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleSetPrimary = (index) => {
    if (index === 0) return;
    setUploadedImages((prev) => {
      const next = [...prev];
      const [selected] = next.splice(index, 1);
      next.unshift(selected);
      setValue("image", next[0]);
      return next;
    });
    toast.success("Set as primary cover photo!");
  };

  const handleMoveImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= uploadedImages.length) return;
    setUploadedImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      setValue("image", next[0]);
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
        gallery: uploadedImages.length > 0 ? uploadedImages : [mainImage],
      };
      await turfService.update(OWNER_ID, id, payload);
      toast.success("Turf details & gallery photos updated successfully!");
      navigate("/admin-panel/turfs");
    } catch (err) {
      setError(err.message || "Failed to update turf.");
      toast.error("Failed to update turf");
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
      <div className="flex h-[400px] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading venue details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Hidden File Input for Batch Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Hidden File Input for Single Photo Replacement */}
      <input
        type="file"
        ref={replaceFileInputRef}
        onChange={handleReplaceFile}
        accept="image/*"
        className="hidden"
      />

      {/* Edit Photo Dialog Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-[#0f172a] text-[#0f172a] dark:text-white rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-emerald-600" />
              Edit Gallery Photo {editingImageIndex !== null ? `#${editingImageIndex + 1}` : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {editingImageIndex !== null && uploadedImages[editingImageIndex] && (
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                <img
                  src={editImageUrlValue || uploadedImages[editingImageIndex]}
                  alt="Edit preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {editingImageIndex === 0 ? "★ Current Cover Photo" : `Photo #${editingImageIndex + 1}`}
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Option 1: Upload Replacement Photo
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => replaceFileInputRef.current?.click()}
                className="w-full h-10 rounded-xl border-dashed border-emerald-500/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Choose New File from Computer
              </Button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">Or</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Option 2: Edit Image Web URL
              </Label>
              <Input
                value={editImageUrlValue}
                onChange={(e) => setEditImageUrlValue(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="h-10 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="h-9 px-4 rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveEditImage}
                className="h-9 px-5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Save Photo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update venue features, hourly pricing, and photos in MySQL
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 h-11 bg-muted/60 p-1 rounded-2xl border border-slate-300/80 dark:border-slate-700/80">
            <TabsTrigger
              value="basic"
              className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">1. Basic Info</span>
              <span className="sm:hidden">1. Info</span>
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">2. Details & Rules</span>
              <span className="sm:hidden">2. Rules</span>
            </TabsTrigger>
            <TabsTrigger
              value="pricing"
              className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer"
            >
              <IndianRupee className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">3. Pricing</span>
              <span className="sm:hidden">3. Price</span>
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="rounded-xl text-xs font-bold gap-1.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer"
            >
              <Camera className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">4. Photos</span>
              <span className="sm:hidden">4. Photos</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: BASIC INFO */}
          <TabsContent value="basic" className="mt-3 space-y-3">
            <Card className="border border-slate-300/80 dark:border-slate-700/80 bg-card/60 backdrop-blur-2xl !rounded-none p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-300/60 dark:border-slate-700/60 pb-2.5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-emerald-500" /> Basic Turf Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="name" className="text-xs font-bold">Turf Venue Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Champions Arena Powai"
                    className="h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs font-medium focus:border-emerald-500"
                    {...register("name", { required: true })}
                  />
                  {errors.name && <span className="text-[10px] text-red-500 font-bold">Name is required</span>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="sportType" className="text-xs font-bold">Primary Sport *</Label>
                  <Select
                    defaultValue={watch("sportType") || "Football"}
                    onValueChange={(v) => setValue("sportType", v)}
                  >
                    <SelectTrigger className="h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs font-medium">
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {SPORTS.map((sport) => (
                        <SelectItem key={sport} value={sport} className="text-xs font-medium cursor-pointer">
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="status" className="text-xs font-bold">Listing Status</Label>
                  <Select
                    defaultValue={watch("status") || "Active"}
                    onValueChange={(v) => setValue("status", v)}
                  >
                    <SelectTrigger className="h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs font-medium">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="Active" className="text-xs font-medium cursor-pointer text-emerald-600 dark:text-emerald-400">
                        Active (Accepting Bookings)
                      </SelectItem>
                      <SelectItem value="Under Maintenance" className="text-xs font-medium cursor-pointer text-amber-600 dark:text-amber-400">
                        Under Maintenance
                      </SelectItem>
                      <SelectItem value="Inactive" className="text-xs font-medium cursor-pointer text-slate-500">
                        Inactive / Closed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="location" className="text-xs font-bold">Location / Full Address *</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Opp. City Mall, Link Road, Andheri West, Mumbai"
                    className="h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs font-medium focus:border-emerald-500"
                    {...register("location", { required: true })}
                  />
                  {errors.location && <span className="text-[10px] text-red-500 font-bold">Location is required</span>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="contactNumber" className="text-xs font-bold">Contact Phone Number</Label>
                  <Input
                    id="contactNumber"
                    placeholder="+91 9876543210"
                    className="h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs font-medium focus:border-emerald-500"
                    {...register("contactNumber")}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-bold">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="manager@turf.com"
                    className="h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs font-medium focus:border-emerald-500"
                    {...register("email")}
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

          {/* TAB 2: DETAILS & RULES */}
          <TabsContent value="details" className="mt-3 space-y-3">
            <Card className="border border-slate-300/80 dark:border-slate-700/80 bg-card/60 backdrop-blur-2xl !rounded-none p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-300/60 dark:border-slate-700/60 pb-2.5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-4.5 w-4.5 text-emerald-500" /> Amenities & Rules
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="description" className="text-xs font-bold">About Venue / Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder="Describe turf surface type, lighting quality, seating, and unique facilities..."
                    className="rounded-xl border-slate-300 dark:border-slate-700/80 text-xs resize-none focus:border-emerald-500"
                    {...register("description")}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold block">Available Amenities & Features</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {AMENITIES.map((amenity) => {
                      const isSelected = selectedAmenities.includes(amenity.id);
                      return (
                        <button
                          key={amenity.id}
                          type="button"
                          onClick={() => toggleAmenity(amenity.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${isSelected
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-xs"
                            : "bg-background border-slate-300/80 dark:border-slate-700/80 text-muted-foreground hover:border-slate-400"
                            }`}
                        >
                          <span className="text-base">{amenity.icon}</span>
                          <span className="truncate flex-1">{amenity.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="rules" className="text-xs font-bold">Venue Rules & Guidelines</Label>
                  <Textarea
                    id="rules"
                    rows={2}
                    placeholder="e.g. Non-marking shoes required. No outside food permitted on turf area."
                    className="rounded-xl border-slate-300 dark:border-slate-700/80 text-xs resize-none focus:border-emerald-500"
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
            <Card className="border border-slate-300/80 dark:border-slate-700/80 bg-card/60 backdrop-blur-2xl !rounded-none p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-300/60 dark:border-slate-700/60 pb-2.5">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <IndianRupee className="h-4.5 w-4.5 text-emerald-500 stroke-[2.5]" /> Standard Pricing
                </h3>
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

          {/* TAB 4: PHOTOS */}
          <TabsContent value="media" className="mt-3 space-y-3">
            <Card className="border border-slate-300/80 dark:border-slate-700/80 bg-card/60 backdrop-blur-2xl !rounded-none p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-300/60 dark:border-slate-700/60 pb-2.5">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Camera className="h-4.5 w-4.5 text-emerald-500" /> Gallery Photos & Upload
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add, edit, reorder, or delete photos in your venue gallery dynamically.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded-xl">
                    {uploadedImages.length} Photo{uploadedImages.length === 1 ? "" : "s"}
                  </span>
                </div>
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
                    Supports PNG, JPG, WEBP, GIF files (select multiple).
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
                  className="mt-1 rounded-xl text-xs font-bold border-emerald-500 text-emerald-600 dark:text-emerald-400 gap-1.5 cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" /> Browse Files
                </Button>
              </div>

              {/* Option to paste image URL */}
              <div className="pt-2">
                <Label className="text-xs font-bold mb-1.5 block">Or Add Image via Web URL</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    className="h-10 rounded-xl border-slate-300 dark:border-slate-700/80 text-xs flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="h-10 rounded-xl text-xs font-bold px-4 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add to Gallery
                  </Button>
                </div>
              </div>

              {/* Gallery Photos List & Interactive Management */}
              {uploadedImages.length > 0 ? (
                <div className="pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                      Uploaded Gallery Photos ({uploadedImages.length}):
                    </h4>
                    <span className="text-[11px] text-muted-foreground">
                      Drag or use arrows to reorder • First image is Primary Cover
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {uploadedImages.map((imgUrl, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === uploadedImages.length - 1;

                      return (
                        <div
                          key={idx}
                          className={`relative rounded-2xl overflow-hidden border shadow-sm transition-all group bg-slate-100 dark:bg-slate-900 ${isFirst
                            ? "border-amber-400 ring-2 ring-amber-400/30"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-400"
                            }`}
                        >
                          {/* Image preview */}
                          <div className="aspect-[16/10] w-full overflow-hidden relative">
                            <img
                              src={imgUrl}
                              alt={`Turf Photo ${idx + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 opacity-90 sm:opacity-75 sm:group-hover:opacity-100 transition-opacity" />

                            {/* Top Badges & Actions */}
                            <div className="absolute top-2 inset-x-2 flex items-center justify-between z-10">
                              {isFirst ? (
                                <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-white" /> Primary Cover
                                </span>
                              ) : (
                                <span className="bg-slate-900/80 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow backdrop-blur-xs">
                                  #{idx + 1}
                                </span>
                              )}

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditImage(idx)}
                                  className="p-1.5 rounded-lg bg-white/95 text-slate-800 hover:bg-emerald-600 hover:text-white shadow hover:scale-110 transition-all cursor-pointer"
                                  title="Edit or Replace Photo"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="p-1.5 rounded-lg bg-white/95 text-rose-600 hover:bg-rose-600 hover:text-white shadow hover:scale-110 transition-all cursor-pointer"
                                  title="Delete Photo"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Bottom Card Controls */}
                            <div className="absolute bottom-2 inset-x-2 flex items-center justify-between z-10">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={isFirst}
                                  onClick={() => handleMoveImage(idx, -1)}
                                  className="w-7 h-7 rounded-lg bg-black/60 hover:bg-black text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition-colors shadow-xs text-xs"
                                  title="Move Left"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={isLast}
                                  onClick={() => handleMoveImage(idx, 1)}
                                  className="w-7 h-7 rounded-lg bg-black/60 hover:bg-black text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition-colors shadow-xs text-xs"
                                  title="Move Right"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {!isFirst && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimary(idx)}
                                  className="text-[10px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                                  title="Make this the main cover photo"
                                >
                                  <Star className="w-3 h-3" /> Make Cover
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-muted-foreground">
                  No photos added to this turf yet. Upload photos above to build your gallery!
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
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Save Turf Changes
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
