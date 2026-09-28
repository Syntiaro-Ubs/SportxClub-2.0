import React, { useState, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import { Card } from "../../../components/ui/card";
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
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../components/ui/utils";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  MapPin,
  IndianRupee,
  Check,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Star,
  Plus,
  Image as ImageIcon,
  Building2,
  ExternalLink,
  Eye,
  Clock,
  CalendarDays,
  Crosshair,
  UploadCloud,
  FileImage,
  Sparkles,
  RotateCcw,
  Edit3,
  Video,
} from "lucide-react";
import { turfService } from "../../../services/turf.service";
import { compressImage } from "../../../utils/image-compressor";
import { toast } from "sonner";

const OWNER_ID = "owner-123";

const SPORTS = [
  "Football",
  "Cricket",
  "Badminton",
  "Tennis",
  "Basketball",
  "Swimming",
  "Volleyball",
  "Table Tennis",
];

const FACILITIES = [
  "Parking",
  "Washroom",
  "Drinking Water",
  "Flood Lights",
  "Changing Room",
  "Seating Area",
  "Cafeteria",
  "Equipment Rental",
  "First Aid",
  "CCTV",
  "WiFi",
];

const fileToBase64 = async (file) => {
  if (file && file.type && file.type.startsWith("image/")) {
    try {
      const compressed = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.82,
      });
      if (compressed) return compressed;
    } catch (err) {
      console.warn("Auto-compression fallback to standard reader:", err);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () =>
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result,
        url: reader.result,
      });
    reader.onerror = (error) => reject(error);
  });
};

const FileUpload = ({
  label,
  hint,
  file,
  onUpload,
  onRemove,
  multiple = false,
  accept = "image/*,.mp4,.webm",
}) => {
  const inputRef = useRef(null);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      if (multiple) {
        const filePromises = Array.from(e.target.files).map((f) => fileToBase64(f));
        const base64Files = await Promise.all(filePromises);
        onUpload(base64Files);
      } else {
        const base64File = await fileToBase64(e.target.files[0]);
        onUpload(base64File);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-semibold">{label}</Label>}
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple={multiple}
        accept={accept}
      />

      {!multiple && !file && (
        <div
          className="border-2 border-dashed border-border/80 rounded-2xl p-6 flex flex-col items-center justify-center bg-background/40 hover:bg-background/80 transition-all cursor-pointer group shadow-2xs"
          onClick={() => inputRef.current?.click()}
        >
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <UploadCloud className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-foreground">Click to upload or drag & drop</p>
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
      )}

      {!multiple && file && (
        <div className="flex items-center justify-between p-3.5 border border-border/80 rounded-2xl bg-card shadow-2xs">
          <div className="flex items-center space-x-3 overflow-hidden">
            {file.type?.startsWith("video/") ? (
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Video className="h-6 w-6 text-emerald-500" />
              </div>
            ) : (
              <img
                src={file.url || file.data}
                alt={file.name || "Uploaded"}
                className="h-12 w-12 rounded-xl object-cover shrink-0 border border-border/50"
              />
            )}
            <div className="truncate">
              <p className="text-sm font-semibold truncate text-foreground">
                {file.name || "Uploaded File"}
              </p>
              <p className="text-xs text-muted-foreground">
                {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Ready"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="rounded-xl text-xs h-8 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
            >
              Change
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:bg-destructive/10 rounded-xl h-8 px-2 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {multiple && (
        <div
          className="border-2 border-dashed border-border/80 rounded-2xl p-6 flex flex-col items-center justify-center bg-background/40 hover:bg-background/80 transition-all cursor-pointer group shadow-2xs"
          onClick={() => inputRef.current?.click()}
        >
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <UploadCloud className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-foreground">Click to upload multiple images</p>
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
      )}
    </div>
  );
};

export function AddTurf() {
  const navigate = useNavigate();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState("turf_details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Custom sport & facility inputs
  const [customSport, setCustomSport] = useState("");
  const [customFacility, setCustomFacility] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Modal for editing/replacing a specific gallery image
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState(null);
  const [editImageUrlValue, setEditImageUrlValue] = useState("");

  // Exact 4 Steps Form State matching Turf Onboarding & Edit Turf
  const [formData, setFormData] = useState({
    turf: {
      name: "",
      sports: ["Football"],
      turfType: "outdoor",
      groundCount: "1",
      groundSize: "5v5, 100x50 ft",
      surfaceType: "Artificial Turf",
      description: "",
    },
    location: {
      address: "",
      landmark: "",
      city: "Pune",
      state: "Maharashtra",
      pincode: "",
      latitude: "",
      longitude: "",
      mapUrl: "",
      facilities: ["Parking", "Washroom", "Drinking Water"],
    },
    images: {
      cover: null,
      gallery: [],
      promoVideo: null,
    },
    pricing: {
      openingTime: "06:00 AM",
      closingTime: "11:00 PM",
      slotDuration: "60",
      weekdayPrice: "1500",
      weekendPrice: "1800",
      holidayPrice: "",
      peakPrice: "",
      advanceBookingLimit: "30",
      cancellationPolicy: "moderate",
    },
    status: "Active",
  });

  const updateSection = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const toggleArrayItem = (section, field, value) => {
    setFormData((prev) => {
      const arr = prev[section]?.[field] || [];
      const newArr = arr.includes(value)
        ? arr.filter((i) => i !== value)
        : [...arr, value];
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArr,
        },
      };
    });
  };

  // Add custom sport
  const handleAddCustomSport = (e) => {
    e?.preventDefault();
    const trimmed = customSport.trim();
    if (!trimmed) return;
    if (!formData.turf.sports.includes(trimmed)) {
      updateSection("turf", "sports", [...formData.turf.sports, trimmed]);
      toast.success(`Sport "${trimmed}" added!`);
    }
    setCustomSport("");
  };

  // Add custom facility
  const handleAddCustomFacility = (e) => {
    e?.preventDefault();
    const trimmed = customFacility.trim();
    if (!trimmed) return;
    if (!formData.location.facilities.includes(trimmed)) {
      updateSection("location", "facilities", [
        ...formData.location.facilities,
        trimmed,
      ]);
      toast.success(`Facility "${trimmed}" added!`);
    }
    setCustomFacility("");
  };

  // GPS Auto-Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsDetectingLocation(true);
    toast.info("Requesting precise GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            setFormData((prev) => ({
              ...prev,
              location: {
                ...prev.location,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                mapUrl: `https://maps.google.com/?q=${latitude},${longitude}`,
                address:
                  data.display_name ||
                  prev.location.address ||
                  `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
                city:
                  addr.city ||
                  addr.town ||
                  addr.village ||
                  addr.state_district ||
                  prev.location.city,
                state: addr.state || prev.location.state,
                pincode: addr.postcode || prev.location.pincode,
                landmark:
                  addr.suburb ||
                  addr.neighbourhood ||
                  prev.location.landmark,
              },
            }));
            toast.success("Location coordinates & address detected!");
            return;
          }
        } catch {
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              mapUrl: `https://maps.google.com/?q=${latitude},${longitude}`,
            },
          }));
          toast.success(`Coordinates captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        console.warn("Geolocation error:", error);
        toast.error("Location permission denied or unavailable. Please enter address manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleOpenGoogleMaps = () => {
    const loc = formData.location || {};
    let query = "";
    if (loc.latitude && loc.longitude) {
      query = `${loc.latitude},${loc.longitude}`;
    } else {
      const parts = [
        loc.address,
        loc.landmark,
        loc.city,
        loc.state,
        loc.pincode,
      ].filter(Boolean);
      query =
        parts.length > 0
          ? parts.join(", ")
          : formData.turf?.name
          ? `${formData.turf.name}, India`
          : "India";
    }
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, "_blank");
  };

  const getMapEmbedUrl = () => {
    const loc = formData.location || {};
    if (loc.latitude && loc.longitude) {
      return `https://maps.google.com/maps?q=${loc.latitude},${loc.longitude}&hl=en&z=15&output=embed`;
    }
    const parts = [
      loc.address,
      loc.landmark,
      loc.city,
      loc.state,
      loc.pincode,
    ].filter(Boolean);
    if (parts.length > 0) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(parts.join(", "))}&hl=en&z=14&output=embed`;
    }
    return `https://maps.google.com/maps?q=India&hl=en&z=5&output=embed`;
  };

  // Gallery image reordering & replacement
  const handleMoveImage = (index, direction) => {
    const targetIndex = index + direction;
    const gallery = formData.images.gallery || [];
    if (targetIndex < 0 || targetIndex >= gallery.length) return;
    const next = [...gallery];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    updateSection("images", "gallery", next);
  };

  const handleOpenEditImage = (index) => {
    const img = formData.images.gallery[index];
    setEditingImageIndex(index);
    setEditImageUrlValue(img?.url || img?.data || (typeof img === "string" ? img : ""));
    setIsEditModalOpen(true);
  };

  const handleSaveEditImage = () => {
    if (editingImageIndex === null || !editImageUrlValue.trim()) return;
    const next = [...(formData.images.gallery || [])];
    next[editingImageIndex] = {
      name: `Photo ${editingImageIndex + 1}`,
      url: editImageUrlValue.trim(),
      data: editImageUrlValue.trim(),
    };
    updateSection("images", "gallery", next);
    setIsEditModalOpen(false);
    toast.success("Photo updated!");
  };

  // Submit / Publish Turf
  const handlePublishTurf = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      // Validation
      if (!formData.turf.name.trim()) {
        toast.error("Please enter a Turf Name");
        setActiveTab("turf_details");
        return;
      }
      if (!formData.turf.sports || formData.turf.sports.length === 0) {
        toast.error("Please select at least one sport");
        setActiveTab("turf_details");
        return;
      }
      if (!formData.location.address.trim()) {
        toast.error("Please enter the turf address");
        setActiveTab("location_facilities");
        return;
      }
      if (!formData.pricing.weekdayPrice) {
        toast.error("Please enter weekday hourly pricing");
        setActiveTab("pricing_timings");
        return;
      }

      // Build location string
      const rawLocParts = [
        formData.location.address?.trim(),
        formData.location.landmark?.trim(),
        formData.location.city?.trim(),
        formData.location.state?.trim(),
        formData.location.pincode?.trim(),
      ].filter(Boolean);

      const uniqueLocParts = [];
      rawLocParts.forEach((p) => {
        if (!uniqueLocParts.some((u) => u.toLowerCase() === p.toLowerCase())) {
          uniqueLocParts.push(p);
        }
      });
      const fullLocation = uniqueLocParts.join(", ") || formData.location.address || "Local Arena";

      // Primary cover image from Cover Image section
      const coverSrc =
        formData.images.cover?.data ||
        formData.images.cover?.url ||
        (typeof formData.images.cover === "string" ? formData.images.cover : "");

      const galleryUrls = (formData.images.gallery || [])
        .map((img) => {
          if (!img) return "";
          if (typeof img === "object") {
            return img.data || img.url || "";
          }
          return String(img);
        })
        .filter(Boolean);

      const mainImage =
        coverSrc ||
        galleryUrls[0] ||
        "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800";

      const payload = {
        name: formData.turf.name,
        description: formData.turf.description,
        sport_type: formData.turf.sports.join(", ") || "Football",
        sportType: formData.turf.sports.join(", ") || "Football",
        turf_type: formData.turf.turfType,
        ground_count: formData.turf.groundCount,
        ground_size: formData.turf.groundSize,
        surface_type: formData.turf.surfaceType,
        city: formData.location.city ? formData.location.city.trim() : "Pune",
        state: formData.location.state ? formData.location.state.trim() : "Maharashtra",
        pincode: formData.location.pincode ? formData.location.pincode.trim() : "",
        location: fullLocation,
        latitude: formData.location.latitude || "",
        longitude: formData.location.longitude || "",
        map_url: formData.location.mapUrl || "",
        price_per_hour: Number(formData.pricing.weekdayPrice) || 1500,
        price: Number(formData.pricing.weekdayPrice) || 1500,
        weekend_price: Number(formData.pricing.weekendPrice) || null,
        holiday_price: formData.pricing.holidayPrice ? Number(formData.pricing.holidayPrice) : null,
        peak_price: formData.pricing.peakPrice ? Number(formData.pricing.peakPrice) : null,
        opening_time: formData.pricing.openingTime || "06:00 AM",
        closing_time: formData.pricing.closingTime || "11:00 PM",
        slot_duration: Number(formData.pricing.slotDuration) || 60,
        advance_booking_limit: Number(formData.pricing.advanceBookingLimit) || 30,
        cancellation_policy: formData.pricing.cancellationPolicy || "moderate",
        amenities: formData.location.facilities,
        status: formData.status || "Active",
        image_url: mainImage,
        image: mainImage,
        gallery: galleryUrls.length > 0 ? galleryUrls : [mainImage],
        promo_video: formData.images.promoVideo?.url || formData.images.promoVideo?.data || "",
      };

      await turfService.create(OWNER_ID, payload);
      toast.success("Turf published and created successfully!");
      navigate("/admin-panel/turfs");
    } catch (err) {
      console.error("Failed to create turf:", err);
      setError(err.message || "Failed to create turf.");
      toast.error(err.message || "Failed to create turf");
    } finally {
      setIsSubmitting(false);
    }
  };

  const primaryCoverImage =
    formData.images.cover?.data ||
    formData.images.cover?.url ||
    formData.images.gallery?.[0]?.data ||
    formData.images.gallery?.[0]?.url ||
    "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800";

  return (
    <div className="space-y-4 pb-12 font-sans">
      {/* Modal for Editing/Replacing a Gallery Image URL */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-6 bg-card border border-border rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-emerald-500" />
              Edit or Replace Photo #{editingImageIndex !== null ? editingImageIndex + 1 : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Image Web URL</Label>
              <Input
                value={editImageUrlValue}
                onChange={(e) => setEditImageUrlValue(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="h-10 rounded-xl text-xs bg-background border-border"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
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
                className="h-9 px-5 rounded-xl text-xs font-bold border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
              >
                Save Photo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/admin-panel/turfs">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 cursor-pointer shadow-xs transition-all flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Add New Turf
              </h1>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                NEW LISTING
              </span>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {formData.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fill in details to publish your sports venue directly to MySQL.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button
            type="button"
            onClick={handlePublishTurf}
            disabled={isSubmitting}
            className="h-9 rounded-xl px-5 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-1.5 cursor-pointer shadow-xs transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" /> Publish Venue
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Workspace: 4 Steps Form on Left (Col-8) & Live Player Preview on Right (Col-4) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Side: 4 Steps Form Container */}
        <div className="xl:col-span-8 space-y-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* The Exact 4 Steps Stepper Bar */}
            <div className="w-full overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 bg-card/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl gap-1 shadow-xs">
                <TabsTrigger
                  value="turf_details"
                  className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 border-transparent text-muted-foreground data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-500/5 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:font-extrabold hover:text-foreground hover:bg-muted/40"
                >
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black shrink-0">
                    1
                  </span>
                  <span className="block leading-tight truncate">Turf Details</span>
                </TabsTrigger>

                <TabsTrigger
                  value="location_facilities"
                  className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 border-transparent text-muted-foreground data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-500/5 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:font-extrabold hover:text-foreground hover:bg-muted/40"
                >
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black shrink-0">
                    2
                  </span>
                  <span className="block leading-tight truncate">Location & Facilities</span>
                </TabsTrigger>

                <TabsTrigger
                  value="upload_images"
                  className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 border-transparent text-muted-foreground data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-500/5 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:font-extrabold hover:text-foreground hover:bg-muted/40"
                >
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black shrink-0">
                    3
                  </span>
                  <span className="block leading-tight truncate">Upload Images</span>
                </TabsTrigger>

                <TabsTrigger
                  value="pricing_timings"
                  className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 border-transparent text-muted-foreground data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-500/5 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:font-extrabold hover:text-foreground hover:bg-muted/40"
                >
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black shrink-0">
                    4
                  </span>
                  <span className="block leading-tight truncate">Pricing & Timings</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ========================================================================= */}
            {/* STEP 1: TURF DETAILS                                                      */}
            {/* ========================================================================= */}
            <TabsContent value="turf_details" className="mt-2 outline-none">
              <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-card/60 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Turf Details
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Basic information about your sports venue, sports supported, and grounds.
                  </p>
                </div>

                {/* Turf Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Turf Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={formData.turf.name}
                    onChange={(e) => updateSection("turf", "name", e.target.value)}
                    placeholder="e.g. Champions Cricket Arena"
                    className="h-10 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-medium"
                  />
                </div>

                {/* Sports Multi-select */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">
                      Sport Types <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      Select all sports available at this turf
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {SPORTS.map((sport) => {
                      const isSelected = formData.turf.sports.includes(sport);
                      return (
                        <button
                          key={sport}
                          type="button"
                          onClick={() => toggleArrayItem("turf", "sports", sport)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-slate-100 dark:bg-slate-800/80 text-foreground hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          {sport}
                        </button>
                      );
                    })}

                    {/* Custom sports added */}
                    {formData.turf.sports
                      .filter((s) => !SPORTS.includes(s))
                      .map((sport) => (
                        <button
                          key={sport}
                          type="button"
                          onClick={() => toggleArrayItem("turf", "sports", sport)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-emerald-600 text-white shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {sport}
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleArrayItem("turf", "sports", sport);
                            }}
                            className="ml-1 text-white/80 hover:text-white"
                          >
                            ×
                          </span>
                        </button>
                      ))}
                  </div>

                  {/* Add Custom Sport */}
                  <div className="flex items-center gap-2 pt-1 max-w-sm">
                    <Input
                      value={customSport}
                      onChange={(e) => setCustomSport(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddCustomSport(e);
                      }}
                      placeholder="Add other sport (e.g. Pickleball)..."
                      className="h-8 text-xs rounded-xl bg-background border-slate-300 dark:border-slate-700"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCustomSport}
                      className="h-8 px-3 rounded-xl border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                  </div>
                </div>

                {/* Turf Type & Number of Grounds */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Turf Type</Label>
                    <Select
                      value={formData.turf.turfType}
                      onValueChange={(val) => updateSection("turf", "turfType", val)}
                    >
                      <SelectTrigger className="h-10 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-medium">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="outdoor">Outdoor Ground</SelectItem>
                        <SelectItem value="indoor">Indoor Court</SelectItem>
                        <SelectItem value="rooftop">Rooftop Turf</SelectItem>
                        <SelectItem value="covered">Covered / Semi-Indoor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Number of Grounds / Courts
                    </Label>
                    <Select
                      value={formData.turf.groundCount}
                      onValueChange={(val) => updateSection("turf", "groundCount", val)}
                    >
                      <SelectTrigger className="h-10 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-medium">
                        <SelectValue placeholder="Select count" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Ground</SelectItem>
                        <SelectItem value="2">2 Grounds</SelectItem>
                        <SelectItem value="3">3 Grounds</SelectItem>
                        <SelectItem value="4">4 Grounds</SelectItem>
                        <SelectItem value="5">5+ Grounds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Ground Size & Surface Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Ground Size / Dimensions
                    </Label>
                    <Input
                      value={formData.turf.groundSize}
                      onChange={(e) => updateSection("turf", "groundSize", e.target.value)}
                      placeholder="e.g. 5v5, 100x50 ft"
                      className="h-10 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Surface Type</Label>
                    <Select
                      value={formData.turf.surfaceType}
                      onValueChange={(val) => updateSection("turf", "surfaceType", val)}
                    >
                      <SelectTrigger className="h-10 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-medium">
                        <SelectValue placeholder="Select surface" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Artificial Turf">Artificial Turf (Grass)</SelectItem>
                        <SelectItem value="Natural Grass">Natural Grass</SelectItem>
                        <SelectItem value="Wooden Court">Wooden Court</SelectItem>
                        <SelectItem value="Synthetic Rubber">Synthetic Rubber / Acrylic</SelectItem>
                        <SelectItem value="Clay">Clay</SelectItem>
                        <SelectItem value="Hard Court">Hard Court (Concrete)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Description & Ground Rules
                  </Label>
                  <Textarea
                    value={formData.turf.description}
                    onChange={(e) => updateSection("turf", "description", e.target.value)}
                    placeholder="Describe turf surface type, dimensions, lighting quality, footwear rules, seating area..."
                    className="min-h-[100px] rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-medium resize-y"
                  />
                </div>

                {/* Next Step Button */}
                <div className="flex justify-end pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("location_facilities")}
                    className="h-10 px-6 rounded-xl border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-2 cursor-pointer shadow-xs transition-all"
                  >
                    Next: Location & Facilities <ChevronRight className="h-4 w-4 text-emerald-500" />
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* ========================================================================= */}
            {/* STEP 2: LOCATION & FACILITIES                                             */}
            {/* ========================================================================= */}
            <TabsContent value="location_facilities" className="mt-2 outline-none">
              <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-card/60 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Location & Facilities
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Address, map pinpoint, landmarks, and available facilities for players.
                  </p>
                </div>

                {/* GPS Detect & Google Maps Actions */}
                <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <Button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetectingLocation}
                    className="h-9 px-4 rounded-xl border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-2 cursor-pointer shadow-xs transition-all disabled:opacity-50"
                  >
                    {isDetectingLocation ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Detecting GPS...
                      </>
                    ) : (
                      <>
                        <Crosshair className="h-3.5 w-3.5" /> Auto-Detect via GPS
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleOpenGoogleMaps}
                    className="h-9 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-background text-foreground hover:bg-muted font-bold text-xs gap-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" /> Open in Google Maps
                  </Button>

                  {formData.location.latitude && formData.location.longitude && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                      Lat: {Number(formData.location.latitude).toFixed(4)}, Lon:{" "}
                      {Number(formData.location.longitude).toFixed(4)}
                    </span>
                  )}
                </div>

                {/* Live Map Preview Iframe */}
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-48 w-full bg-slate-100 dark:bg-slate-900 shadow-inner relative">
                  <iframe
                    title="Turf Location Map"
                    src={getMapEmbedUrl()}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-border text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                    <MapPin className="w-3 h-3 text-emerald-500" /> Live Map Pin
                  </div>
                </div>

                {/* Street Address */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Full Address / Street Line <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={formData.location.address}
                    onChange={(e) => updateSection("location", "address", e.target.value)}
                    placeholder="e.g. Survey No. 45/2, Near City Sports Complex, Nigdi"
                    className="h-10 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-medium"
                  />
                </div>

                {/* Landmark & Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Landmark</Label>
                    <Input
                      value={formData.location.landmark}
                      onChange={(e) => updateSection("location", "landmark", e.target.value)}
                      placeholder="e.g. Opposite Phoenix Mall"
                      className="h-10 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Pincode</Label>
                    <Input
                      value={formData.location.pincode}
                      onChange={(e) => updateSection("location", "pincode", e.target.value)}
                      placeholder="e.g. 411035"
                      className="h-10 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* City & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">City</Label>
                    <Input
                      value={formData.location.city}
                      onChange={(e) => updateSection("location", "city", e.target.value)}
                      placeholder="e.g. Pune"
                      className="h-10 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">State</Label>
                    <Input
                      value={formData.location.state}
                      onChange={(e) => updateSection("location", "state", e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="h-10 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Google Maps Location Link */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Google Maps Location Link (URL)
                  </Label>
                  <Input
                    value={formData.location.mapUrl}
                    onChange={(e) => updateSection("location", "mapUrl", e.target.value)}
                    placeholder="https://maps.app.goo.gl/... or https://maps.google.com/?q=..."
                    className="h-10 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-medium"
                  />
                </div>

                {/* Facilities Checklist */}
                <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">
                      Facilities Available
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      Tick all amenities present at venue
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {FACILITIES.map((facility) => {
                      const isSelected = formData.location.facilities.includes(facility);
                      return (
                        <button
                          key={facility}
                          type="button"
                          onClick={() => toggleArrayItem("location", "facilities", facility)}
                          className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border text-left ${
                            isSelected
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                              : "bg-background border-slate-200 dark:border-slate-800 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "border-slate-300 dark:border-slate-700"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                          <span className="truncate">{facility}</span>
                        </button>
                      );
                    })}

                    {/* Custom Facilities */}
                    {formData.location.facilities
                      .filter((f) => !FACILITIES.includes(f))
                      .map((facility) => (
                        <button
                          key={facility}
                          type="button"
                          onClick={() => toggleArrayItem("location", "facilities", facility)}
                          className="p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-2 border bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-4 h-4 rounded-md flex items-center justify-center shrink-0 bg-emerald-600 border-emerald-600 text-white">
                              <Check className="w-3 h-3" />
                            </div>
                            <span className="truncate">{facility}</span>
                          </div>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleArrayItem("location", "facilities", facility);
                            }}
                            className="text-xs text-muted-foreground hover:text-destructive shrink-0"
                          >
                            ×
                          </span>
                        </button>
                      ))}
                  </div>

                  {/* Add Custom Facility */}
                  <div className="flex items-center gap-2 pt-1.5 max-w-sm">
                    <Input
                      value={customFacility}
                      onChange={(e) => setCustomFacility(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddCustomFacility(e);
                      }}
                      placeholder="Add custom facility (e.g. Shower)..."
                      className="h-8 text-xs rounded-xl bg-background border-slate-300 dark:border-slate-700"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCustomFacility}
                      className="h-8 px-3 rounded-xl border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("turf_details")}
                    className="h-10 px-5 rounded-xl font-bold text-xs gap-1.5 cursor-pointer border border-slate-300 dark:border-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4 text-emerald-500" /> Previous: Turf Details
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab("upload_images")}
                    className="h-10 px-6 rounded-xl border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-2 cursor-pointer shadow-xs transition-all"
                  >
                    Next: Upload Images <ChevronRight className="h-4 w-4 text-emerald-500" />
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* ========================================================================= */}
            {/* STEP 3: UPLOAD IMAGES                                                     */}
            {/* ========================================================================= */}
            <TabsContent value="upload_images" className="mt-2 outline-none">
              <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-card/60 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Upload Images
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cover photo, arena gallery photos, and optional walkthrough video.
                  </p>
                </div>

                {/* Cover Image Upload */}
                <FileUpload
                  label="Cover Image (High Resolution) *"
                  hint="This is the main display photo players see when browsing turfs."
                  file={formData.images.cover}
                  onUpload={(f) => updateSection("images", "cover", f)}
                  onRemove={() => updateSection("images", "cover", null)}
                  accept="image/*"
                />

                {/* Gallery Images Upload */}
                <div className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                  <FileUpload
                    label="Gallery Images (Add Photos of Ground, Seating, Lighting, Washroom)"
                    hint="Select multiple images from your computer or phone."
                    multiple
                    onUpload={(newFiles) => {
                      const toAdd = Array.isArray(newFiles) ? newFiles : [newFiles];
                      updateSection("images", "gallery", [
                        ...(formData.images.gallery || []),
                        ...toAdd,
                      ]);
                      toast.success(`${toAdd.length} photo(s) added to gallery`);
                    }}
                    accept="image/*"
                  />

                  {/* Render Existing & Uploaded Gallery Photos */}
                  {formData.images.gallery?.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                          Gallery Photos ({formData.images.gallery.length})
                        </h4>
                        <span className="text-[11px] text-muted-foreground">
                          Use arrows to reorder gallery photos
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {formData.images.gallery.map((imgItem, idx) => {
                          const isFirst = idx === 0;
                          const isLast = idx === formData.images.gallery.length - 1;
                          const src = imgItem?.data || imgItem?.url || (typeof imgItem === "string" ? imgItem : "");

                          return (
                            <div
                              key={idx}
                              className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-slate-400 shadow-xs transition-all group bg-slate-100 dark:bg-slate-900"
                            >
                              <div className="aspect-[16/10] w-full overflow-hidden relative">
                                <img
                                  src={src}
                                  alt={`Turf Photo ${idx + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/60 opacity-90 transition-opacity" />

                                {/* Top Badges & Actions */}
                                <div className="absolute top-2 inset-x-2 flex items-center justify-between z-10">
                                  <span className="bg-slate-900/80 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow backdrop-blur-xs">
                                    #{idx + 1}
                                  </span>

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
                                      onClick={() => {
                                        const newArr = [...(formData.images.gallery || [])];
                                        newArr.splice(idx, 1);
                                        updateSection("images", "gallery", newArr);
                                      }}
                                      className="p-1.5 rounded-lg bg-white/95 text-rose-600 hover:bg-rose-600 hover:text-white shadow hover:scale-110 transition-all cursor-pointer"
                                      title="Delete Photo"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Bottom Controls */}
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
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Promo Video */}
                <FileUpload
                  label="Promo Video (Optional)"
                  hint="Upload a short walkthrough video (max 20MB)"
                  file={formData.images.promoVideo}
                  onUpload={(f) => updateSection("images", "promoVideo", f)}
                  onRemove={() => updateSection("images", "promoVideo", null)}
                  accept="video/mp4,video/webm"
                />

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("location_facilities")}
                    className="h-10 px-5 rounded-xl font-bold text-xs gap-1.5 cursor-pointer border border-slate-300 dark:border-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4 text-emerald-500" /> Previous: Location & Facilities
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab("pricing_timings")}
                    className="h-10 px-6 rounded-xl border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-2 cursor-pointer shadow-xs transition-all"
                  >
                    Next: Pricing & Timings <ChevronRight className="h-4 w-4 text-emerald-500" />
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* ========================================================================= */}
            {/* STEP 4: PRICING & TIMINGS                                                 */}
            {/* ========================================================================= */}
            <TabsContent value="pricing_timings" className="mt-2 outline-none">
              <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-card/60 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Pricing & Timings
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Operating schedule, slot duration, hourly rates, and booking rules.
                  </p>
                </div>

                {/* Opening & Closing Times */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Opening Time <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        value={formData.pricing.openingTime}
                        onChange={(e) => updateSection("pricing", "openingTime", e.target.value)}
                        placeholder="e.g. 06:00 AM"
                        className="h-10 pl-9 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-medium"
                      />
                      <Clock className="w-4 h-4 text-emerald-500 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Closing Time <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        value={formData.pricing.closingTime}
                        onChange={(e) => updateSection("pricing", "closingTime", e.target.value)}
                        placeholder="e.g. 11:00 PM"
                        className="h-10 pl-9 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-medium"
                      />
                      <Clock className="w-4 h-4 text-emerald-500 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">Slot Duration</Label>
                    <Select
                      value={formData.pricing.slotDuration}
                      onValueChange={(val) => updateSection("pricing", "slotDuration", val)}
                    >
                      <SelectTrigger className="h-10 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-medium">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 mins</SelectItem>
                        <SelectItem value="45">45 mins</SelectItem>
                        <SelectItem value="60">60 mins (1 hr)</SelectItem>
                        <SelectItem value="90">90 mins (1.5 hr)</SelectItem>
                        <SelectItem value="120">120 mins (2 hr)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pricing Slabs */}
                <div className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                  <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
                    Hourly Pricing Slabs (₹)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">
                        Weekday Price (₹/hour) <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={formData.pricing.weekdayPrice}
                          onChange={(e) => updateSection("pricing", "weekdayPrice", e.target.value)}
                          placeholder="e.g. 1500"
                          className="h-10 pl-9 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                        />
                        <IndianRupee className="w-4 h-4 text-emerald-500 absolute left-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">
                        Weekend Price (₹/hour)
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={formData.pricing.weekendPrice}
                          onChange={(e) => updateSection("pricing", "weekendPrice", e.target.value)}
                          placeholder="e.g. 1800"
                          className="h-10 pl-9 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-semibold"
                        />
                        <IndianRupee className="w-4 h-4 text-emerald-500 absolute left-3 top-3 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">
                        Holiday Price (₹/hour)
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={formData.pricing.holidayPrice}
                          onChange={(e) => updateSection("pricing", "holidayPrice", e.target.value)}
                          placeholder="e.g. 2000"
                          className="h-10 pl-9 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-semibold"
                        />
                        <IndianRupee className="w-4 h-4 text-emerald-500 absolute left-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">
                        Peak Hours Rate (₹/hour)
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={formData.pricing.peakPrice}
                          onChange={(e) => updateSection("pricing", "peakPrice", e.target.value)}
                          placeholder="e.g. 1800"
                          className="h-10 pl-9 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-semibold"
                        />
                        <IndianRupee className="w-4 h-4 text-emerald-500 absolute left-3 top-3 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Rules & Cancellation Policy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Advance Booking Limit
                    </Label>
                    <Select
                      value={formData.pricing.advanceBookingLimit}
                      onValueChange={(val) => updateSection("pricing", "advanceBookingLimit", val)}
                    >
                      <SelectTrigger className="h-10 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-medium">
                        <SelectValue placeholder="Select limit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 Days Ahead</SelectItem>
                        <SelectItem value="14">14 Days Ahead</SelectItem>
                        <SelectItem value="30">30 Days Ahead</SelectItem>
                        <SelectItem value="60">60 Days Ahead</SelectItem>
                        <SelectItem value="90">90 Days Ahead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Cancellation Policy
                    </Label>
                    <Select
                      value={formData.pricing.cancellationPolicy}
                      onValueChange={(val) => updateSection("pricing", "cancellationPolicy", val)}
                    >
                      <SelectTrigger className="h-10 rounded-xl bg-background border-slate-300 dark:border-slate-700 text-xs font-medium">
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flexible">Flexible (100% refund up to 4 hrs before)</SelectItem>
                        <SelectItem value="moderate">Moderate (50% refund up to 12 hrs before)</SelectItem>
                        <SelectItem value="strict">Strict (No refund within 24 hrs)</SelectItem>
                        <SelectItem value="non-refundable">Non-Refundable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Navigation & Submit Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("upload_images")}
                    className="h-10 px-5 rounded-xl font-bold text-xs gap-1.5 cursor-pointer border border-slate-300 dark:border-slate-700"
                  >
                    <ChevronLeft className="h-4 w-4 text-emerald-500" /> Previous: Upload Images
                  </Button>
                  <Button
                    type="button"
                    onClick={handlePublishTurf}
                    disabled={isSubmitting}
                    className="h-10 px-7 rounded-xl border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-black text-xs gap-2 cursor-pointer shadow-xs transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Publishing Venue...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" /> Publish Turf Venue
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side: LIVE PLAYER PREVIEW CARD (Col-4) */}
        <div className="xl:col-span-4 sticky top-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-500" /> Live Player Preview
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Card
            </span>
          </div>

          <Card className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-card shadow-lg hover:shadow-xl transition-all">
            {/* Card Image Area */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
              <img
                src={primaryCoverImage}
                alt={formData.turf.name || "Turf"}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

              {/* Top Badges */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                <span className="bg-emerald-600/95 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-md backdrop-blur-md">
                  {formData.turf.sports[0] || "SPORTS"}
                </span>
                <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-md">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  New (0)
                </span>
              </div>

              {/* Bottom Image Overlay */}
              <div className="absolute bottom-3 inset-x-3 z-10">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white !text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate">
                  {formData.turf.name || "Your Turf Name"}
                </h3>
                <p className="text-[11px] text-white/90 font-medium flex items-center gap-1 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0 text-emerald-400" />
                  {formData.location.address ||
                    `${formData.location.city || "Pune"}, Maharashtra`}
                </p>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-3">
              {/* Timing & Slot Duration */}
              <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {formData.pricing.openingTime} - {formData.pricing.closingTime}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-foreground bg-background px-2 py-0.5 rounded-lg border border-border">
                  {formData.pricing.slotDuration}m slots
                </span>
              </div>

              {/* Facilities Chips */}
              <div className="flex flex-wrap gap-1.5">
                {formData.location.facilities.slice(0, 3).map((f) => (
                  <span
                    key={f}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                  >
                    ✓ {f}
                  </span>
                ))}
                {formData.location.facilities.length > 3 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-muted text-muted-foreground">
                    +{formData.location.facilities.length - 3} more
                  </span>
                )}
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">
                    Hourly Rate
                  </span>
                  <div className="flex items-baseline text-lg font-black text-foreground">
                    ₹{formData.pricing.weekdayPrice || 0}
                    <span className="text-xs text-muted-foreground font-semibold ml-0.5">
                      /hr
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  className="rounded-xl px-4 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs cursor-default pointer-events-none"
                >
                  Book Slot
                </Button>
              </div>
            </div>
          </Card>

          <p className="text-[11px] text-muted-foreground text-center px-2">
            Real-time interactive preview as seen by players on SportXClub app.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AddTurf;
