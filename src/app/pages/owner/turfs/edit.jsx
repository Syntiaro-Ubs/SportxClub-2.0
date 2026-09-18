import { useState, useEffect, useRef, useMemo } from "react";
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
  Edit3,
  Trash2,
  Star,
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  Eye,
  Info,
  Trophy,
  Layers,
  Sparkle,
} from "lucide-react";
import { turfService } from "../../../services/turf.service";
import { toast } from "sonner";

const OWNER_ID = "owner-123";

const AMENITIES = [
  { id: "Parking", label: "Parking Space", icon: "🚗", desc: "Dedicated vehicle parking" },
  { id: "Washroom", label: "Clean Washrooms", icon: "🚻", desc: "Hygienic restrooms" },
  { id: "Changing Room", label: "Changing Rooms", icon: "🚪", desc: "Secure locker rooms" },
  { id: "Drinking Water", label: "Drinking Water", icon: "💧", desc: "Chilled purified water" },
  { id: "Floodlights", label: "LED Floodlights", icon: "💡", desc: "High-lumen night lights" },
  { id: "Equipment Rent", label: "Equipment Rental", icon: "⚽", desc: "Balls, bibs, rackets" },
  { id: "First Aid", label: "First Aid Kit", icon: "🏥", desc: "Emergency medical kit" },
  { id: "Cafe", label: "Cafeteria / Snacks", icon: "☕", desc: "Energy drinks & food" },
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
  const turfName = watch("name");
  const turfSport = watch("sportType") || "Football";
  const turfPrice = watch("price") || 1500;
  const turfLocation = watch("location") || "";
  const turfStatus = watch("status") || "Active";
  const primaryCoverImage = uploadedImages[0] || watch("image") || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800";

  // Calculate profile completeness score
  const completenessScore = useMemo(() => {
    let score = 0;
    if (turfName?.trim()) score += 25;
    if (turfLocation?.trim()) score += 20;
    if (turfPrice) score += 20;
    if (selectedAmenities.length > 0) score += 15;
    if (uploadedImages.length > 0) score += 10;
    if (watch("description")?.trim()) score += 10;
    return score;
  }, [turfName, turfLocation, turfPrice, selectedAmenities, uploadedImages, watch("description")]);

  useEffect(() => {
    const fetchTurf = async () => {
      try {
        setIsLoading(true);
        if (!id) throw new Error("No turf ID provided");

        const result = await turfService.getById(OWNER_ID, id);
        if (result) {
          reset({
            name: result.name || "",
            description: result.description || "Premium sports arena with state-of-the-art turf turf surface and night floodlights.",
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
                } catch { }
                return result.amenities.split(",").map((s) => s.trim()).filter(Boolean);
              }
              return ["Parking", "Floodlights", "Washroom", "Drinking Water"];
            })(),
            rules: result.rules || "1. Non-marking shoes or turf studs only.\n2. Please report 10 minutes before slot start time.\n3. Outside food & beverages strictly prohibited on the turf.",
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
    toast.success(`${validFiles.length} photo(s) added to gallery!`);
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
    toast.success("Gallery photo updated!");
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
      toast.success("Photo replaced!");
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
      <div className="flex h-[500px] flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <Building2 className="w-6 h-6 text-emerald-500 absolute" />
        </div>
        <p className="text-sm font-bold text-muted-foreground animate-pulse">Syncing venue data from database...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
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
        <DialogContent className="max-w-md bg-card border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-emerald-500" />
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
                <span className="absolute bottom-2 left-2 bg-black/75 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-lg backdrop-blur-xs">
                  {editingImageIndex === 0 ? "★ Primary Cover Photo" : `Photo #${editingImageIndex + 1}`}
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">
                Option 1: Upload Replacement Image
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => replaceFileInputRef.current?.click()}
                className="w-full h-10 rounded-xl border-dashed border-emerald-500/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Browse New Photo from Computer
              </Button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-border/60"></div>
              <span className="flex-shrink mx-3 text-[10px] font-black text-muted-foreground/60 uppercase">Or</span>
              <div className="flex-grow border-t border-border/60"></div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">
                Option 2: Edit Image Web URL
              </Label>
              <Input
                value={editImageUrlValue}
                onChange={(e) => setEditImageUrlValue(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="h-10 rounded-xl text-xs bg-background border-border"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
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
                className="h-9 px-5 rounded-xl text-xs font-bold border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                Save Photo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Top Executive Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/admin-panel/turfs">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 cursor-pointer shadow-xs transition-all flex items-center justify-center">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {turfName || "Edit Turf Details"}
              </h1>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Venue #{id}
              </span>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {turfStatus}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              <span>Manage ground specifications, pricing slabs, amenities, and high-res media.</span>
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Link to={`/venues/${id}`} target="_blank">
            <Button
              type="button"
              className="h-9 rounded-xl px-4 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-500" /> View Public Page <ExternalLink className="w-3 h-3 opacity-70" />
            </Button>
          </Link>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="h-9 rounded-xl px-5 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-1.5 cursor-pointer shadow-xs transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> Saving...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-emerald-500" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Side: Form Stepper & Configuration (Col-8) */}
        <div className="xl:col-span-8 space-y-3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Stepper Tabs Bar */}
              <div className="w-full overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 bg-card/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl gap-1 shadow-xs">
                  <TabsTrigger
                    value="basic"
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 border-transparent text-muted-foreground data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-500/5 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:font-extrabold hover:text-foreground hover:bg-muted/40"
                  >
                    <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black shrink-0">1</span>
                    <div className="text-center sm:text-left">
                      <span className="block leading-tight">Basic Info</span>
                    </div>
                  </TabsTrigger>

                  <TabsTrigger
                    value="details"
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 border-transparent text-muted-foreground data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-500/5 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:font-extrabold hover:text-foreground hover:bg-muted/40"
                  >
                    <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black shrink-0">2</span>
                    <div className="text-center sm:text-left">
                      <span className="block leading-tight">Amenities & Rules</span>
                    </div>
                  </TabsTrigger>

                  <TabsTrigger
                    value="pricing"
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 border-transparent text-muted-foreground data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-500/5 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:font-extrabold hover:text-foreground hover:bg-muted/40"
                  >
                    <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black shrink-0">3</span>
                    <div className="text-center sm:text-left">
                      <span className="block leading-tight">Pricing & Rates</span>
                    </div>
                  </TabsTrigger>

                  <TabsTrigger
                    value="media"
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 border-transparent text-muted-foreground data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-500/5 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:font-extrabold hover:text-foreground hover:bg-muted/40"
                  >
                    <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black shrink-0">4</span>
                    <div className="text-center sm:text-left">
                      <span className="block leading-tight">Photos ({uploadedImages.length})</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* TAB 1: BASIC INFO */}
              <TabsContent value="basic" className="mt-2 space-y-2">
                <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-card/60 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
                  <div className="border-b border-border/60 pb-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
                      <Building2 className="h-4.5 w-4.5 text-emerald-500" /> Basic Turf Information
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Enter the essential details that identify your sports arena across SportXClub.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="name" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-emerald-500" /> Turf Venue Name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g. Apex Arena Football Ground"
                        className="h-10 rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold focus:border-emerald-500 bg-background/80"
                        {...register("name", { required: true })}
                      />
                      {errors.name && <span className="text-[10px] text-red-500 font-bold">Venue name is required</span>}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="sportType" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-emerald-500" /> Primary Sport Category *
                      </Label>
                      <Select
                        value={turfSport}
                        onValueChange={(val) => setValue("sportType", val)}
                      >
                        <SelectTrigger className="h-10 rounded-xl border-slate-300 dark:border-slate-700 text-xs font-semibold bg-background/80">
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
                      <Label htmlFor="status" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Listing Status
                      </Label>
                      <Select
                        value={turfStatus}
                        onValueChange={(val) => setValue("status", val)}
                      >
                        <SelectTrigger className="h-10 rounded-xl border-slate-300 dark:border-slate-700 text-xs font-semibold bg-background/80">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="Active" className="text-xs font-medium cursor-pointer text-emerald-600 dark:text-emerald-400">
                            Active (Open for Bookings)
                          </SelectItem>
                          <SelectItem value="Under Maintenance" className="text-xs font-medium cursor-pointer text-amber-600 dark:text-amber-400">
                            Under Maintenance
                          </SelectItem>
                          <SelectItem value="Inactive" className="text-xs font-medium cursor-pointer text-slate-500">
                            Inactive / Temporarily Closed
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="location" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-500" /> Full Address / City *
                      </Label>
                      <Input
                        id="location"
                        placeholder="e.g. Near City Center, Baner Road, Pune, Maharashtra"
                        className="h-10 rounded-xl border-slate-300 dark:border-slate-700 text-xs font-medium focus:border-emerald-500 bg-background/80"
                        {...register("location", { required: true })}
                      />
                      {errors.location && <span className="text-[10px] text-red-500 font-bold">Location address is required</span>}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="contactNumber" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-emerald-500" /> Contact Phone Number
                      </Label>
                      <Input
                        id="contactNumber"
                        placeholder="e.g. +91 98765 43210"
                        className="h-10 rounded-xl border-slate-300 dark:border-slate-700 text-xs font-medium focus:border-emerald-500 bg-background/80"
                        {...register("contactNumber")}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-emerald-500" /> Contact Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="e.g. contact@premierturf.com"
                        className="h-10 rounded-xl border-slate-300 dark:border-slate-700 text-xs font-medium focus:border-emerald-500 bg-background/80"
                        {...register("email")}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2.5 border-t border-border/60">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("details")}
                      className="rounded-xl px-5 h-9 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-1.5 cursor-pointer transition-all shadow-xs"
                    >
                      Next <ChevronRight className="h-4 w-4 text-emerald-500" />
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* TAB 2: DETAILS & RULES */}
              <TabsContent value="details" className="mt-2 space-y-2">
                <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-card/60 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
                  <div className="border-b border-border/60 pb-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
                      <Layers className="h-4.5 w-4.5 text-emerald-500" /> Amenities, Facilities & Ground Rules
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Specify available amenities and ground guidelines for incoming players.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <Label htmlFor="description" className="text-xs font-bold text-foreground">
                        About Venue / Surface Description
                      </Label>
                      <Textarea
                        id="description"
                        rows={3}
                        placeholder="Describe your turf surface (e.g. FIFA-certified artificial grass, 50mm pile height), lighting quality, seating, and unique facilities..."
                        className="rounded-xl border-slate-300 dark:border-slate-700 text-xs resize-none focus:border-emerald-500 bg-background/80 leading-relaxed"
                        {...register("description")}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-extrabold text-foreground">
                          Select Available Amenities & Features
                        </Label>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          {selectedAmenities.length} of {AMENITIES.length} Selected
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {AMENITIES.map((amenity) => {
                          const isSelected = selectedAmenities.includes(amenity.id);
                          return (
                            <button
                              key={amenity.id}
                              type="button"
                              onClick={() => toggleAmenity(amenity.id)}
                              className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer group ${isSelected
                                ? "bg-emerald-500/10 border-emerald-500 text-foreground shadow-xs ring-1 ring-emerald-500/30"
                                : "bg-background/80 border-slate-200/80 dark:border-slate-800 text-muted-foreground hover:border-slate-300 dark:hover:border-slate-700"
                                }`}
                            >
                              <span className="text-xl p-1.5 rounded-lg bg-muted/60 group-hover:scale-110 transition-transform">
                                {amenity.icon}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-extrabold text-foreground">{amenity.label}</span>
                                  {isSelected ? (
                                    <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                      <Check className="h-3 w-3 stroke-[3]" />
                                    </div>
                                  ) : (
                                    <div className="w-4.5 h-4.5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{amenity.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="rules" className="text-xs font-bold text-foreground">
                        Venue Rules & Player Guidelines
                      </Label>
                      <Textarea
                        id="rules"
                        rows={2}
                        placeholder="Enter footwear requirements, reporting guidelines, cancellation rules..."
                        className="rounded-xl border-slate-300 dark:border-slate-700 text-xs resize-none focus:border-emerald-500 bg-background/80 leading-relaxed"
                        {...register("rules")}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-2.5 border-t border-border/60">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("basic")}
                      className="rounded-xl px-5 h-9 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-1.5 cursor-pointer transition-all shadow-xs"
                    >
                      <ChevronLeft className="h-4 w-4 text-emerald-500" /> Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("pricing")}
                      className="rounded-xl px-5 h-9 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-1.5 cursor-pointer transition-all shadow-xs"
                    >
                      Next <ChevronRight className="h-4 w-4 text-emerald-500" />
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* TAB 3: PRICING */}
              <TabsContent value="pricing" className="mt-2 space-y-2">
                <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-card/60 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
                  <div className="border-b border-border/60 pb-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
                      <IndianRupee className="h-4.5 w-4.5 text-emerald-500 stroke-[2.5]" /> Hourly Rate & Slot Pricing
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Define the standard per-hour price charged to players when reserving time slots.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="price" className="text-xs font-bold text-foreground">
                        Standard Price per Hour (₹) *
                      </Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                        <Input
                          id="price"
                          type="number"
                          className="pl-10 h-10 rounded-xl border-slate-300 dark:border-slate-700 text-xs font-extrabold focus:border-emerald-500 bg-background/80"
                          {...register("price", { required: true })}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Players will be charged this base amount per 60-minute session.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                        <Sparkles className="w-3.5 h-3.5" /> Pricing Calculation Summary
                      </div>
                      <div className="text-xs space-y-1 text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Base Hourly Slot:</span>
                          <span className="font-bold text-foreground">₹{turfPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Est. 8h Daily Revenue:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{(Number(turfPrice) * 8).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform Fee:</span>
                          <span className="font-bold text-foreground">0% Direct Bank Transfer</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2.5 border-t border-border/60">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("details")}
                      className="rounded-xl px-5 h-9 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-1.5 cursor-pointer transition-all shadow-xs"
                    >
                      <ChevronLeft className="h-4 w-4 text-emerald-500" /> Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("media")}
                      className="rounded-xl px-5 h-9 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-1.5 cursor-pointer transition-all shadow-xs"
                    >
                      Next <ChevronRight className="h-4 w-4 text-emerald-500" />
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* TAB 4: PHOTOS */}
              <TabsContent value="media" className="mt-2 space-y-2">
                <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-card/60 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
                        <Camera className="h-4.5 w-4.5 text-emerald-500" /> Photo Gallery & Cover Media
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        High-resolution pictures dramatically improve customer confidence and bookings.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">
                        {uploadedImages.length} Photo{uploadedImages.length === 1 ? "" : "s"} Uploaded
                      </span>
                    </div>
                  </div>

                  {/* Upload Drop Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${isDragging
                      ? "border-emerald-500 bg-emerald-500/10 scale-[1.01]"
                      : "border-emerald-500/40 hover:border-emerald-500 hover:bg-emerald-500/5 bg-background/50"
                      }`}
                  >
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-foreground">Click or Drag & Drop Turf Photos</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Select multiple PNG, JPG, WEBP photos from your device
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
                      className="mt-1 rounded-xl text-xs font-bold border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1.5 cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" /> Choose Files from Computer
                    </Button>
                  </div>

                  {/* Add Image via URL */}
                  <div className="space-y-1 pt-1">
                    <Label className="text-xs font-bold text-foreground">Or Import Photo via Web Image URL</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://images.unsplash.com/photo-..."
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddImageUrl();
                          }
                        }}
                        className="h-10 rounded-xl border-slate-300 dark:border-slate-700 text-xs flex-1 bg-background/80"
                      />
                      <Button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="h-10 rounded-xl px-5 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-1.5 cursor-pointer transition-all shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-500" /> Add to Gallery
                      </Button>
                    </div>
                  </div>

                  {/* Photos Grid */}
                  {uploadedImages.length > 0 ? (
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                          Gallery Photos ({uploadedImages.length})
                        </h4>
                        <span className="text-[11px] text-muted-foreground">
                          ★ First photo is displayed as Primary Cover
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {uploadedImages.map((imgUrl, idx) => {
                          const isFirst = idx === 0;
                          const isLast = idx === uploadedImages.length - 1;

                          return (
                            <div
                              key={idx}
                              className={`relative rounded-xl overflow-hidden border shadow-xs transition-all group bg-slate-100 dark:bg-slate-900 ${isFirst
                                ? "border-amber-400 ring-2 ring-amber-400/40"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-400"
                                }`}
                            >
                              <div className="aspect-[16/10] w-full overflow-hidden relative">
                                <img
                                  src={imgUrl}
                                  alt={`Turf Photo ${idx + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/60 opacity-90 transition-opacity" />

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

                                {/* Bottom Reorder Controls */}
                                <div className="absolute bottom-2 inset-x-2 flex items-center justify-between z-10">
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={isFirst}
                                      onClick={() => handleMoveImage(idx, -1)}
                                      className="w-7 h-7 rounded-lg bg-black/70 hover:bg-black text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                                      title="Move Left"
                                    >
                                      <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isLast}
                                      onClick={() => handleMoveImage(idx, 1)}
                                      className="w-7 h-7 rounded-lg bg-black/70 hover:bg-black text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                                      title="Move Right"
                                    >
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {!isFirst && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetPrimary(idx)}
                                      className="text-[10px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md transition-all cursor-pointer"
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
                      No photos added yet. Upload photos above to build your turf gallery!
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="flex justify-between pt-2.5 border-t border-border/60">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("pricing")}
                      className="rounded-xl px-5 h-9 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-1.5 cursor-pointer transition-all shadow-xs"
                    >
                      <ChevronLeft className="h-4 w-4 text-emerald-500" /> Previous
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl px-6 h-9 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-1.5 cursor-pointer transition-all shadow-xs"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> Saving...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-emerald-500" /> Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </div>

        {/* Right Side: Live Player Card Preview (Col-4) */}
        <div className="xl:col-span-4 space-y-4 sticky top-20">
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-card/60 backdrop-blur-xl rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Live Player Preview</h3>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Card
              </span>
            </div>

            {/* Render Simulated Turf Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-background shadow-md">
              <div className="relative aspect-[16/10] w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <img
                  src={primaryCoverImage}
                  alt="Turf preview"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
                    {turfSport}
                  </span>
                </div>

                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2 py-1 rounded-lg bg-black/60 text-white text-[10px] font-black backdrop-blur-xs flex items-center gap-1 shadow">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9 (128)
                  </span>
                </div>

                <div className="absolute bottom-3 inset-x-3 z-10">
                  <h4 className="text-base font-black text-white truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {turfName || "Premier Sports Turf"}
                  </h4>
                  <p className="text-[11px] text-white/90 font-medium flex items-center gap-1 mt-0.5 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    {turfLocation || "Pune"}
                  </p>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {/* Amenities pills */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedAmenities.slice(0, 3).map((amenityId) => {
                    const item = AMENITIES.find((a) => a.id === amenityId);
                    return (
                      <span key={amenityId} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground flex items-center gap-1">
                        <span>{item?.icon}</span> {amenityId}
                      </span>
                    );
                  })}
                  {selectedAmenities.length > 3 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                      +{selectedAmenities.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-bold">Hourly Rate</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center">
                      <IndianRupee className="w-3.5 h-3.5 stroke-[2.5]" />{turfPrice}
                      <span className="text-[10px] text-muted-foreground font-normal ml-0.5">/hr</span>
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3.5 rounded-xl text-xs font-black border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 shadow-xs cursor-pointer transition-all"
                  >
                    Book Slot
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Real-time interactive preview as seen by players on SportXClub app.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

