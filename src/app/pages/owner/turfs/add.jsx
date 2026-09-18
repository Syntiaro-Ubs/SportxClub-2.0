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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
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
  Edit2,
  Edit3,
  Star,
  Plus,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
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
  const replaceFileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-3">
          <Link to="/admin-panel/turfs">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 cursor-pointer shadow-xs transition-all flex items-center justify-center">
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Stepper Tabs Bar */}
          <div className="w-full overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsList className="flex sm:grid w-max sm:w-full grid-cols-2 sm:grid-cols-4 min-w-full h-auto p-1 bg-card/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl gap-1 shadow-xs">
              <TabsTrigger
                value="basic"
                className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 border-transparent text-muted-foreground data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-500/5 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:font-extrabold hover:text-foreground hover:bg-muted/40 shrink-0 whitespace-nowrap"
              >
                <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black shrink-0">1</span>
                <FileText className="h-3.5 w-3.5 shrink-0 hidden sm:inline" />
                <span>Basic Info</span>
              </TabsTrigger>

              <TabsTrigger
                value="details"
                className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 border-transparent text-muted-foreground data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-500/5 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:font-extrabold hover:text-foreground hover:bg-muted/40 shrink-0 whitespace-nowrap"
              >
                <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black shrink-0">2</span>
                <MapPin className="h-3.5 w-3.5 shrink-0 hidden sm:inline" />
                <span>Details & Rules</span>
              </TabsTrigger>

              <TabsTrigger
                value="pricing"
                className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 border-transparent text-muted-foreground data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-500/5 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:font-extrabold hover:text-foreground hover:bg-muted/40 shrink-0 whitespace-nowrap"
              >
                <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black shrink-0">3</span>
                <IndianRupee className="h-3.5 w-3.5 shrink-0 hidden sm:inline stroke-[2.5]" />
                <span>Pricing & Hours</span>
              </TabsTrigger>

              <TabsTrigger
                value="media"
                className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 border-transparent text-muted-foreground data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-500/5 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:font-extrabold hover:text-foreground hover:bg-muted/40 shrink-0 whitespace-nowrap"
              >
                <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black shrink-0">4</span>
                <Camera className="h-3.5 w-3.5 shrink-0 hidden sm:inline" />
                <span>Photos</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: BASIC INFO */}
          <TabsContent value="basic" className="mt-2 space-y-2">
            <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-card/60 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="border-b border-border/60 pb-2">
                <h3 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-emerald-500" /> Basic Venue Information
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  General details visible to players when browsing and searching for turfs.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs font-bold">Turf Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter turf name"
                    className="h-10 rounded-xl border-slate-300 dark:border-slate-700 text-xs font-medium focus:border-emerald-500"
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
                      <SelectTrigger className="h-10 rounded-xl border-slate-300 dark:border-slate-700 text-xs font-medium">
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
                      placeholder="Enter contact phone number"
                      className="h-10 rounded-xl border-slate-300 dark:border-slate-700 text-xs font-medium"
                      {...register("contactNumber")}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description" className="text-xs font-bold">Venue Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe turf surface type, dimensions, lighting quality, seating area..."
                    className="min-h-[75px] rounded-xl border-slate-300 dark:border-slate-700 text-xs p-2.5"
                    {...register("description")}
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

          {/* TAB 2: DETAILS & LOCATION */}
          <TabsContent value="details" className="mt-2 space-y-2">
            <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-card/60 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="border-b border-border/60 pb-2">
                <h3 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
                  <MapPin className="h-4.5 w-4.5 text-emerald-500" /> Location & Amenities
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set address, GPS map link, and available facility features.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="space-y-1">
                  <Label htmlFor="location" className="text-xs font-bold">Address / Area Name *</Label>
                  <Input
                    id="location"
                    placeholder="Enter address or area name"
                    className="h-10 rounded-xl border-slate-300 dark:border-slate-700 text-xs font-medium"
                    {...register("location", { required: true })}
                  />
                </div>

                <div className="space-y-1 pt-1">
                  <Label className="text-xs font-bold block mb-1">Available Amenities</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {AMENITIES.map((item) => {
                      const isSelected = selectedAmenities.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleAmenity(item.id)}
                          className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-1.5 select-none ${isSelected
                            ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-bold"
                            : "border-slate-200/80 dark:border-slate-800 bg-card/40 text-muted-foreground hover:border-slate-400 hover:bg-accent/30"
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
                    placeholder="Enter ground rules & regulations..."
                    className="min-h-[75px] rounded-xl border-slate-300 dark:border-slate-700 text-xs p-2.5"
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

          {/* TAB 3: PRICING & HOURS */}
          <TabsContent value="pricing" className="mt-2 space-y-2">
            <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-card/60 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="border-b border-border/60 pb-2">
                <h3 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
                  <IndianRupee className="h-4.5 w-4.5 text-emerald-500 stroke-[2.5]" /> Pricing & Operating Hours
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set hourly rental rates and default daily opening/closing schedules.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1 w-1/2 min-w-[140px] max-w-[180px]">
                  <Label htmlFor="price" className="text-xs font-bold flex items-center gap-1">
                    Standard Hourly Rate (<IndianRupee className="h-3 w-3 stroke-[2.5]" />) *
                  </Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 stroke-[2.5]" />
                    <Input
                      id="price"
                      type="number"
                      placeholder="Enter hourly rate"
                      className="pl-10 h-10 rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold focus:border-emerald-500"
                      {...register("price", { required: true })}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-muted/20 p-3 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-emerald-500" /> Default Operating Schedule
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3 max-w-md pt-0.5">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Opening Time</Label>
                      <Input type="time" defaultValue="06:00" className="h-9 rounded-xl border-slate-300 dark:border-slate-700 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Closing Time</Label>
                      <Input type="time" defaultValue="23:00" className="h-9 rounded-xl border-slate-300 dark:border-slate-700 text-xs" />
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

          {/* TAB 4: PHOTOS & PUBLISH */}
          <TabsContent value="media" className="mt-2 space-y-2">
            <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-card/60 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
                    <Camera className="h-4.5 w-4.5 text-emerald-500" /> Gallery Photos & Upload
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add, edit, reorder, or delete photos in your venue gallery dynamically.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">
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
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${isDragging
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-emerald-500/40 hover:bg-emerald-500/5"
                  }`}
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Click or Drag & Drop Photos Here</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Supports PNG, JPG, WEBP, GIF files from your computer (select multiple).
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
                  <Upload className="h-3.5 w-3.5" /> Browse Files
                </Button>
              </div>

              {/* Option to paste image URL */}
              <div className="pt-1">
                <Label className="text-xs font-bold mb-1 block">Or Add Image via Web URL</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Image URL Here"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    className="h-10 rounded-xl border-slate-300 dark:border-slate-700 text-xs flex-1"
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

              {/* Gallery Photos List & Interactive Management */}
              {uploadedImages.length > 0 ? (
                <div className="pt-2 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                      Uploaded Gallery Photos ({uploadedImages.length}):
                    </h4>
                    <span className="text-[11px] text-muted-foreground">
                      Use arrows to reorder • First image is Primary Cover
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
                <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-muted-foreground">
                  No photos added to this turf yet. Upload photos above to build your gallery!
                </div>
              )}

              {/* Submit Buttons */}
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
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> Publishing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-emerald-500" /> Publish Turf Listing
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
