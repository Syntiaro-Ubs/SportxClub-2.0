import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, Link, useParams } from "react-router";
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
          <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
        </div>
      )}

      {!multiple && file && (
        <div className="border border-border rounded-2xl p-3 bg-background/50 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            {file.data || file.url ? (
              file.type?.startsWith("video/") || String(file.url || "").includes(".mp4") ? (
                <div className="h-14 w-14 rounded-xl overflow-hidden border border-border shrink-0 bg-muted/40 flex items-center justify-center">
                  <Video className="h-6 w-6 text-emerald-500" />
                </div>
              ) : (
                <div className="h-14 w-14 rounded-xl overflow-hidden border border-border shrink-0 bg-muted/40">
                  <img
                    src={file.data || file.url}
                    alt={file.name || "Upload preview"}
                    className="w-full h-full object-cover"
                  />
                </div>
              )
            ) : (
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <FileImage className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">{file.name || "Uploaded File"}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Ready / Uploaded</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Change
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg cursor-pointer"
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
          <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
        </div>
      )}
    </div>
  );
};

export function EditTurf() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("turf_details");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Custom additions for sports and facilities
  const [customSports, setCustomSports] = useState([]);
  const [newSport, setNewSport] = useState("");
  const [isAddingSport, setIsAddingSport] = useState(false);

  const [customFacilities, setCustomFacilities] = useState([]);
  const [newFacility, setNewFacility] = useState("");
  const [isAddingFacility, setIsAddingFacility] = useState(false);

  // Modal for editing/replacing a specific gallery image
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState(null);
  const [editImageUrlValue, setEditImageUrlValue] = useState("");

  // Exact 4 Steps Form State matching Turf Onboarding
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

  // Fetch initial turf data from database
  useEffect(() => {
    const fetchTurf = async () => {
      try {
        setIsLoading(true);
        if (!id) throw new Error("No turf ID provided");

        const result = await turfService.getById(OWNER_ID, id);
        if (result) {
          // Parse sports
          let sports = [];
          if (Array.isArray(result.sports)) {
            sports = result.sports;
          } else if (result.sport_type || result.sportType) {
            sports = String(result.sport_type || result.sportType)
              .split(/[,•;/]+/)
              .map((s) => s.trim())
              .filter(Boolean);
          } else {
            sports = ["Cricket"];
          }

          // Parse location
          let locAddress = "";
          let locCity = "";
          let locState = "";
          let locPincode = "";
          let locLandmark = "";
          let locLatitude = "";
          let locLongitude = "";
          let locMapUrl = "";

          if (result.city) locCity = result.city;
          if (result.state) locState = result.state;
          if (result.pincode) locPincode = result.pincode;

          if (typeof result.location === "object" && result.location !== null) {
            locAddress = result.location.address || "";
            if (!locCity) locCity = result.location.city || "";
            if (!locState) locState = result.location.state || "";
            if (!locPincode) locPincode = result.location.pincode || "";
            locLandmark = result.location.landmark || "";
            locLatitude = result.location.latitude || "";
            locLongitude = result.location.longitude || "";
            locMapUrl = result.location.mapUrl || "";
          } else if (typeof result.location === "string") {
            locAddress = result.location;
            const pincodeMatch = result.location.match(/\b\d{6}\b/);
            if (pincodeMatch && !locPincode) locPincode = pincodeMatch[0];

            if (!locCity || /^\d+$/.test(locCity.trim())) {
              const nonNumParts = result.location
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s && !/^\d+$/.test(s) && s.toLowerCase() !== "india");

              const knownStates = ["maharashtra", "karnataka", "delhi", "gujarat", "tamil nadu", "telangana", "kerala", "rajasthan", "punjab", "haryana"];
              if (nonNumParts.length > 0) {
                const last = nonNumParts[nonNumParts.length - 1];
                if (knownStates.includes(last.toLowerCase()) && nonNumParts.length > 1) {
                  if (!locState) locState = last;
                  locCity = nonNumParts[nonNumParts.length - 2].replace(/\s+district$/i, "");
                } else {
                  locCity = last.replace(/\s+district$/i, "");
                }
              }
            }
          }

          // Parse facilities / amenities
          let facilities = [];
          if (Array.isArray(result.amenities)) {
            facilities = result.amenities;
          } else if (Array.isArray(result.facilities)) {
            facilities = result.facilities;
          } else if (typeof result.amenities === "string" && result.amenities.trim()) {
            try {
              let p = JSON.parse(result.amenities);
              while (typeof p === "string") {
                try {
                  p = JSON.parse(p);
                } catch {
                  break;
                }
              }
              if (Array.isArray(p)) facilities = p;
            } catch {
              facilities = result.amenities.split(",").map((s) => s.trim()).filter(Boolean);
            }
          }

          // Parse gallery
          let galleryList = [];
          if (Array.isArray(result.gallery)) {
            galleryList = result.gallery;
          } else if (typeof result.gallery === "string" && result.gallery.trim()) {
            try {
              let p = JSON.parse(result.gallery);
              while (typeof p === "string") {
                try {
                  p = JSON.parse(p);
                } catch {
                  break;
                }
              }
              if (Array.isArray(p)) galleryList = p;
            } catch {
              galleryList = [result.gallery];
            }
          }

          const coverUrl =
            result.image_url ||
            result.image ||
            (galleryList.length > 0
              ? typeof galleryList[0] === "string"
                ? galleryList[0]
                : galleryList[0]?.url
              : "");

          setFormData({
            turf: {
              name: result.name || "",
              sports: sports.length > 0 ? sports : ["Cricket"],
              turfType: result.turf_type || result.turfType || "outdoor",
              groundCount: String(result.ground_count || result.groundCount || "1"),
              groundSize: result.ground_size || result.groundSize || "5v5, 100x50 ft",
              surfaceType: result.surface_type || result.surfaceType || "Artificial Turf",
              description: result.description || "",
            },
            location: {
              address: locAddress,
              landmark: locLandmark,
              city: locCity || "Pune",
              state: locState || "Maharashtra",
              pincode: locPincode || "",
              latitude: locLatitude,
              longitude: locLongitude,
              mapUrl: locMapUrl,
              facilities:
                facilities.length > 0
                  ? facilities
                  : ["Parking", "Washroom", "Drinking Water"],
            },
            images: {
              cover: coverUrl ? { url: coverUrl, name: "Cover Image" } : null,
              gallery: galleryList.map((g, idx) =>
                typeof g === "string" ? { url: g, name: `Photo ${idx + 1}` } : g
              ),
              promoVideo:
                result.promo_video || result.promoVideo
                  ? {
                      url: result.promo_video || result.promoVideo,
                      name: "Promo Video",
                    }
                  : null,
            },
            pricing: {
              openingTime: result.opening_time || "06:00 AM",
              closingTime: result.closing_time || "11:00 PM",
              slotDuration: String(result.slot_duration || 60),
              weekdayPrice: String(result.price_per_hour || result.price || 1500),
              weekendPrice: String(
                result.weekend_price ||
                  Math.round(Number(result.price_per_hour || 1500) * 1.25)
              ),
              holidayPrice: String(result.holiday_price || ""),
              peakPrice: String(result.peak_price || ""),
              advanceBookingLimit: String(result.advance_booking_limit || 30),
              cancellationPolicy: result.cancellation_policy || "moderate",
            },
            status: result.status || "Active",
          });
        }
      } catch (err) {
        console.error("Failed to load turf details:", err);
        setError(err.message || "Failed to load turf details");
        toast.error("Failed to load turf details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTurf();
  }, [id]);

  // Location & Map Helpers matching Onboarding
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: { "Accept-Language": "en" },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};
            const road = addr.road || addr.street || addr.pedestrian || "";
            const landmark =
              addr.suburb ||
              addr.neighbourhood ||
              addr.amenity ||
              addr.building ||
              "";
            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.county ||
              addr.state_district ||
              "";
            const state = addr.state || "";
            const pincode = addr.postcode || "";
            const formattedAddress =
              data.display_name ||
              [road, landmark, city, state, pincode].filter(Boolean).join(", ");

            setFormData((prev) => ({
              ...prev,
              location: {
                ...prev.location,
                address: formattedAddress || prev.location.address,
                landmark: landmark || prev.location.landmark,
                city: city || prev.location.city,
                state: state || prev.location.state,
                pincode: pincode || prev.location.pincode,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                mapUrl: `https://maps.google.com/?q=${latitude},${longitude}`,
              },
            }));

            toast.success("GPS Location & Address detected successfully!");
          } else {
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
          }
        } catch (err) {
          console.error("Geocoding fetch error:", err);
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
    const gallery = [...(formData.images.gallery || [])];
    gallery[editingImageIndex] = {
      url: editImageUrlValue.trim(),
      name: `Photo ${editingImageIndex + 1}`,
    };
    updateSection("images", "gallery", gallery);
    setIsEditModalOpen(false);
    toast.success("Photo updated!");
  };

  // Submit / Update Handler
  const handleSaveTurf = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.turf.name?.trim()) {
        toast.error("Please enter a valid turf name");
        setActiveTab("turf_details");
        setIsSubmitting(false);
        return;
      }

      const rawParts = [
        formData.location.address?.trim(),
        formData.location.landmark?.trim(),
        formData.location.city?.trim(),
        formData.location.state?.trim(),
        formData.location.pincode?.trim(),
      ].filter(Boolean);

      const uniqueParts = [];
      rawParts.forEach((p) => {
        if (!uniqueParts.some((u) => u.toLowerCase() === p.toLowerCase())) {
          uniqueParts.push(p);
        }
      });
      const fullLocation = uniqueParts.join(", ") || formData.location.address || "Local Arena";

      const coverSrc =
        formData.images.cover?.data ||
        formData.images.cover?.url ||
        formData.images.cover ||
        "";

      const galleryUrls = (formData.images.gallery || [])
        .map((img) => {
          if (typeof img === "object" && img !== null) {
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
        sport_type: formData.turf.sports.join(", ") || "Cricket",
        turf_type: formData.turf.turfType,
        ground_count: formData.turf.groundCount,
        ground_size: formData.turf.groundSize,
        surface_type: formData.turf.surfaceType,
        city: formData.location.city ? formData.location.city.trim() : "Pune",
        state: formData.location.state ? formData.location.state.trim() : "Maharashtra",
        pincode: formData.location.pincode ? formData.location.pincode.trim() : "",
        location: fullLocation,
        price_per_hour: Number(formData.pricing.weekdayPrice) || 1500,
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
        gallery: galleryUrls.length > 0 ? galleryUrls : [mainImage],
      };

      await turfService.update(OWNER_ID, id, payload);
      toast.success("Turf details updated successfully!");
      navigate("/admin-panel/turfs");
    } catch (err) {
      console.error("Failed to update turf:", err);
      setError(err.message || "Failed to update turf.");
      toast.error("Failed to update turf");
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

  if (isLoading) {
    return (
      <div className="flex h-[500px] flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <Building2 className="w-6 h-6 text-emerald-500 absolute" />
        </div>
        <p className="text-sm font-bold text-muted-foreground animate-pulse">
          Syncing turf details from database...
        </p>
      </div>
    );
  }

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
                {formData.turf.name || "Edit Turf Details"}
              </h1>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Venue #{id}
              </span>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {formData.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage ground specifications, pricing slabs, amenities, and high-res media.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Link to={`/venues/${id}`} target="_blank">
            <Button
              type="button"
              className="h-9 rounded-xl px-4 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-500" /> View Public Page{" "}
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Button>
          </Link>
          <Button
            type="button"
            onClick={handleSaveTurf}
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
                    Provide accurate details to ensure quick verification and listing.
                  </p>
                </div>

                {/* Turf Name */}
                <div className="space-y-1.5">
                  <Label>Turf Name (Publicly Visible) *</Label>
                  <Input
                    value={formData.turf.name || ""}
                    onChange={(e) => updateSection("turf", "name", e.target.value)}
                    className="h-10 rounded-lg"
                    placeholder="Enter turf name"
                  />
                </div>

                {/* Sport Types Badges */}
                <div className="space-y-2">
                  <Label>Sport Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {[...SPORTS, ...customSports].map((sport) => {
                      const isSelected = formData.turf.sports?.includes(sport);
                      return (
                        <Badge
                          key={sport}
                          variant="outline"
                          className={cn(
                            "cursor-pointer px-3.5 py-1.5 text-xs font-medium transition-all rounded-full select-none",
                            isSelected
                              ? "border-2 border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400 bg-transparent hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20"
                              : "border border-slate-300 dark:border-slate-700 text-muted-foreground hover:border-slate-400 hover:text-foreground bg-transparent"
                          )}
                          onClick={() => toggleArrayItem("turf", "sports", sport)}
                        >
                          {sport}
                        </Badge>
                      );
                    })}

                    {isAddingSport ? (
                      <div className="flex items-center gap-2">
                        <Input
                          autoFocus
                          value={newSport}
                          onChange={(e) => setNewSport(e.target.value)}
                          placeholder="Type sport name..."
                          className="h-8 text-[11px] w-32 rounded-full px-3"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newSport.trim()) {
                              e.preventDefault();
                              const sportName = newSport.trim();
                              if (![...SPORTS, ...customSports].includes(sportName)) {
                                setCustomSports((prev) => [...prev, sportName]);
                              }
                              if (!formData.turf.sports?.includes(sportName)) {
                                toggleArrayItem("turf", "sports", sportName);
                              }
                              setNewSport("");
                              setIsAddingSport(false);
                            } else if (e.key === "Escape") {
                              setIsAddingSport(false);
                            }
                          }}
                          onBlur={() => {
                            if (newSport.trim()) {
                              const sportName = newSport.trim();
                              if (![...SPORTS, ...customSports].includes(sportName)) {
                                setCustomSports((prev) => [...prev, sportName]);
                              }
                              if (!formData.turf.sports?.includes(sportName)) {
                                toggleArrayItem("turf", "sports", sportName);
                              }
                            }
                            setNewSport("");
                            setIsAddingSport(false);
                          }}
                        />
                      </div>
                    ) : (
                      <Badge
                        variant="outline"
                        className="cursor-pointer px-3.5 py-1.5 text-xs font-medium transition-all rounded-full select-none border border-dashed border-slate-400 text-muted-foreground hover:border-primary hover:text-primary bg-transparent flex items-center gap-1"
                        onClick={() => setIsAddingSport(true)}
                      >
                        <Plus className="h-3 w-3" /> Add Sport
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Turf Type & Number of Grounds */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label>Turf Type</Label>
                    <Select
                      value={formData.turf.turfType || "outdoor"}
                      onValueChange={(val) => updateSection("turf", "turfType", val)}
                    >
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indoor">Indoor</SelectItem>
                        <SelectItem value="outdoor">Outdoor</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Number of Grounds/Courts</Label>
                    <Input
                      type="number"
                      value={formData.turf.groundCount || "1"}
                      onChange={(e) => updateSection("turf", "groundCount", e.target.value)}
                      className="h-10 rounded-lg"
                    />
                  </div>
                </div>

                {/* Ground Size & Surface Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label>Ground Size (e.g. 5v5, 100x50 ft)</Label>
                    <Input
                      value={formData.turf.groundSize || ""}
                      onChange={(e) => updateSection("turf", "groundSize", e.target.value)}
                      className="h-10 rounded-lg"
                      placeholder="e.g. 5v5, 100x50 ft"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Surface Type</Label>
                    <Input
                      placeholder="Surface type"
                      value={formData.turf.surfaceType || ""}
                      onChange={(e) => updateSection("turf", "surfaceType", e.target.value)}
                      className="h-10 rounded-lg"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.turf.description || ""}
                    onChange={(e) => updateSection("turf", "description", e.target.value)}
                    placeholder="Tell players what makes your turf special..."
                    className="rounded-lg min-h-[120px]"
                  />
                </div>

                {/* Navigation Button */}
                <div className="flex justify-end pt-3 border-t border-border/60">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("location_facilities")}
                    className="rounded-xl px-5 h-9 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-1.5 cursor-pointer transition-all shadow-xs"
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
                    Provide accurate details to ensure quick verification and listing.
                  </p>
                </div>

                {/* Location Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isDetectingLocation}
                    onClick={handleDetectLocation}
                    className="flex-1 h-12 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 gap-2 cursor-pointer font-semibold shadow-xs"
                  >
                    {isDetectingLocation ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>Detecting GPS Location...</span>
                      </>
                    ) : (
                      <>
                        <Crosshair className="h-4 w-4 text-primary" />
                        <span>Detect Current Location</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOpenGoogleMaps}
                    className="h-12 px-5 rounded-xl border border-border/80 hover:bg-muted/60 gap-2 cursor-pointer font-medium text-xs sm:text-sm shrink-0"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span>Open Google Maps</span>
                  </Button>
                </div>

                {/* Interactive Map Preview */}
                <div className="rounded-2xl border border-border/80 overflow-hidden shadow-sm bg-muted/20 relative">
                  <div className="p-3 px-4 bg-background/90 backdrop-blur-md border-b border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-foreground">
                        {formData.location.city
                          ? `${formData.location.city}${formData.location.state ? `, ${formData.location.state}` : ""}`
                          : "Interactive Turf Map"}
                      </span>
                    </div>
                    {formData.location.latitude && formData.location.longitude && (
                      <span className="font-mono text-[11px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-md font-medium">
                        GPS: {Number(formData.location.latitude).toFixed(4)}°,{" "}
                        {Number(formData.location.longitude).toFixed(4)}°
                      </span>
                    )}
                  </div>

                  <div className="w-full h-64 sm:h-72 relative bg-muted/50">
                    <iframe
                      title="Turf Location Map"
                      src={getMapEmbedUrl()}
                      className="w-full h-full border-0"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  <div className="p-2.5 px-4 bg-background/80 backdrop-blur-sm border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
                    <span className="truncate pr-2">Interactive map updates live with address & GPS</span>
                    <button
                      type="button"
                      onClick={handleOpenGoogleMaps}
                      className="text-primary hover:underline font-semibold cursor-pointer inline-flex items-center gap-1 shrink-0"
                    >
                      Full Screen <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Full Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="turfAddress">Full Address *</Label>
                  <Textarea
                    id="turfAddress"
                    placeholder="Plot / Survey No., Street name, Area, Colony..."
                    value={formData.location.address || ""}
                    onChange={(e) => updateSection("location", "address", e.target.value)}
                    className="rounded-lg min-h-[70px]"
                  />
                </div>

                {/* Landmark & Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="landmark">Landmark</Label>
                    <Input
                      id="landmark"
                      placeholder="Enter landmark"
                      value={formData.location.landmark || ""}
                      onChange={(e) => updateSection("location", "landmark", e.target.value)}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      placeholder="Enter pincode"
                      maxLength={6}
                      value={formData.location.pincode || ""}
                      onChange={(e) => updateSection("location", "pincode", e.target.value)}
                      className="h-10 rounded-lg"
                    />
                  </div>
                </div>

                {/* City & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="turfCity">City *</Label>
                    <Input
                      id="turfCity"
                      placeholder="Enter city"
                      value={formData.location.city || ""}
                      onChange={(e) => updateSection("location", "city", e.target.value)}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="turfState">State *</Label>
                    <Input
                      id="turfState"
                      placeholder="Enter state"
                      value={formData.location.state || ""}
                      onChange={(e) => updateSection("location", "state", e.target.value)}
                      className="h-10 rounded-lg"
                    />
                  </div>
                </div>

                {/* Google Maps Link */}
                <div className="space-y-1.5 pt-1">
                  <Label htmlFor="mapUrl" className="flex items-center justify-between">
                    <span>Google Maps Link (Optional)</span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      Auto-detected or custom share link
                    </span>
                  </Label>
                  <Input
                    id="mapUrl"
                    placeholder="https://maps.google.com/..."
                    value={formData.location.mapUrl || ""}
                    onChange={(e) => updateSection("location", "mapUrl", e.target.value)}
                    className="h-10 rounded-lg font-mono text-xs"
                  />
                </div>

                {/* Facilities Checklist */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <Label>Facilities Available</Label>
                    <span className="text-xs text-muted-foreground">
                      Select amenities provided at your turf
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[...FACILITIES, ...customFacilities].map((fac) => {
                      const isSelected = formData.location.facilities?.includes(fac);
                      return (
                        <div
                          key={fac}
                          className={cn(
                            "border rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all select-none",
                            isSelected
                              ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                              : "border-border/70 hover:bg-muted/40 text-foreground"
                          )}
                          onClick={() => toggleArrayItem("location", "facilities", fac)}
                        >
                          <div
                            className={cn(
                              "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-input bg-background"
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs sm:text-sm">{fac}</span>
                        </div>
                      );
                    })}

                    {isAddingFacility ? (
                      <div className="border border-dashed border-slate-400 rounded-xl p-3 flex items-center gap-2">
                        <Input
                          autoFocus
                          value={newFacility}
                          onChange={(e) => setNewFacility(e.target.value)}
                          placeholder="Type facility..."
                          className="h-7 text-xs w-full px-2"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newFacility.trim()) {
                              e.preventDefault();
                              const facName = newFacility.trim();
                              if (![...FACILITIES, ...customFacilities].includes(facName)) {
                                setCustomFacilities((prev) => [...prev, facName]);
                              }
                              if (!formData.location.facilities?.includes(facName)) {
                                toggleArrayItem("location", "facilities", facName);
                              }
                              setNewFacility("");
                              setIsAddingFacility(false);
                            } else if (e.key === "Escape") {
                              setIsAddingFacility(false);
                            }
                          }}
                          onBlur={() => {
                            if (newFacility.trim()) {
                              const facName = newFacility.trim();
                              if (![...FACILITIES, ...customFacilities].includes(facName)) {
                                setCustomFacilities((prev) => [...prev, facName]);
                              }
                              if (!formData.location.facilities?.includes(facName)) {
                                toggleArrayItem("location", "facilities", facName);
                              }
                            }
                            setNewFacility("");
                            setIsAddingFacility(false);
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className="border border-dashed border-slate-400 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer text-muted-foreground hover:border-primary hover:text-primary transition-all select-none"
                        onClick={() => setIsAddingFacility(true)}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="text-xs sm:text-sm font-medium">Add Facility</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-3 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("turf_details")}
                    className="rounded-xl px-5 h-9 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <ChevronLeft className="h-4 w-4 text-emerald-500" /> Previous: Turf Details
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab("upload_images")}
                    className="rounded-xl px-5 h-9 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-1.5 cursor-pointer transition-all shadow-xs"
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
                    Provide accurate details to ensure quick verification and listing.
                  </p>
                </div>

                {/* Cover Image Upload */}
                <FileUpload
                  label="Cover Image (High Resolution) *"
                  hint="This is the first image users will see. Make it count."
                  file={formData.images.cover}
                  onUpload={(f) => updateSection("images", "cover", f)}
                  onRemove={() => updateSection("images", "cover", null)}
                />

                {/* Multiple Gallery Upload */}
                <div className="space-y-3">
                  <FileUpload
                    label="Gallery Images (Minimum 5)"
                    hint="Add photos of the ground, seating, facilities, etc."
                    multiple
                    onUpload={(newFiles) => {
                      const toAdd = Array.isArray(newFiles) ? newFiles : [newFiles];
                      updateSection("images", "gallery", [
                        ...(formData.images.gallery || []),
                        ...toAdd,
                      ]);
                    }}
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
                  accept="video/mp4,video/webm"
                  onUpload={(f) => updateSection("images", "promoVideo", f)}
                  onRemove={() => updateSection("images", "promoVideo", null)}
                />

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-3 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("location_facilities")}
                    className="rounded-xl px-5 h-9 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <ChevronLeft className="h-4 w-4 text-emerald-500" /> Previous: Location & Facilities
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab("pricing_timings")}
                    className="rounded-xl px-5 h-9 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-1.5 cursor-pointer transition-all shadow-xs"
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
                    Provide accurate details to ensure quick verification and listing.
                  </p>
                </div>

                {/* Opening Time, Closing Time & Slot Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <Label>Opening Time</Label>
                    <Input
                      type="text"
                      placeholder="06:00 AM"
                      value={formData.pricing.openingTime || ""}
                      onChange={(e) => updateSection("pricing", "openingTime", e.target.value)}
                      className="h-10 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Closing Time</Label>
                    <Input
                      type="text"
                      placeholder="11:00 PM"
                      value={formData.pricing.closingTime || ""}
                      onChange={(e) => updateSection("pricing", "closingTime", e.target.value)}
                      className="h-10 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Slot Duration</Label>
                    <Select
                      value={formData.pricing.slotDuration || "60"}
                      onValueChange={(val) => updateSection("pricing", "slotDuration", val)}
                    >
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue placeholder="60 mins" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 mins</SelectItem>
                        <SelectItem value="60">60 mins</SelectItem>
                        <SelectItem value="90">90 mins</SelectItem>
                        <SelectItem value="120">120 mins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pricing Structure */}
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <h3 className="font-semibold text-sm">Pricing Structure (₹ / Slot)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label>Standard Weekday Price</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={formData.pricing.weekdayPrice || ""}
                          onChange={(e) => updateSection("pricing", "weekdayPrice", e.target.value)}
                          className="pl-9 h-10 rounded-lg"
                          placeholder="₹ Standard Price"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Weekend Price</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={formData.pricing.weekendPrice || ""}
                          onChange={(e) => updateSection("pricing", "weekendPrice", e.target.value)}
                          className="pl-9 h-10 rounded-lg"
                          placeholder="₹ Weekend Price"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Holiday Price (Optional)</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={formData.pricing.holidayPrice || ""}
                          onChange={(e) => updateSection("pricing", "holidayPrice", e.target.value)}
                          className="pl-9 h-10 rounded-lg"
                          placeholder="₹ Holiday Price"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Peak Hour Price (Optional)</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={formData.pricing.peakPrice || ""}
                          onChange={(e) => updateSection("pricing", "peakPrice", e.target.value)}
                          className="pl-9 h-10 rounded-lg"
                          placeholder="₹ Peak Hour Price"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advance Booking Limit & Cancellation Policy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                  <div className="space-y-1.5">
                    <Label>Advance Booking Limit (Days)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 30"
                      value={formData.pricing.advanceBookingLimit || ""}
                      onChange={(e) => updateSection("pricing", "advanceBookingLimit", e.target.value)}
                      className="h-10 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Cancellation Policy</Label>
                    <Select
                      value={formData.pricing.cancellationPolicy || "moderate"}
                      onValueChange={(val) => updateSection("pricing", "cancellationPolicy", val)}
                    >
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue placeholder="Select Policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flexible">Flexible (Free until 24h before)</SelectItem>
                        <SelectItem value="moderate">Moderate (50% refund)</SelectItem>
                        <SelectItem value="strict">Strict (No refund)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Navigation & Submit Buttons */}
                <div className="flex justify-between pt-3 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("upload_images")}
                    className="rounded-xl px-5 h-9 border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-600 font-extrabold text-xs gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <ChevronLeft className="h-4 w-4 text-emerald-500" /> Previous: Upload Images
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSaveTurf}
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
        </div>

        {/* Right Side: Live Player Card Preview (Col-4) */}
        <div className="xl:col-span-4 space-y-4 sticky top-20">
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-card/60 backdrop-blur-xl rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Live Player Preview
                </h3>
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
                    {formData.turf.sports?.[0] || "Cricket"}
                  </span>
                </div>

                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2 py-1 rounded-lg bg-black/60 text-white text-[10px] font-black backdrop-blur-xs flex items-center gap-1 shadow">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9 (128)
                  </span>
                </div>

                <div className="absolute bottom-3 inset-x-3 z-10">
                  <h4 className="text-base font-black text-white truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {formData.turf.name || "Champions Cricket Turf"}
                  </h4>
                  <p className="text-[11px] text-white/90 font-medium flex items-center gap-1 mt-0.5 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    {formData.location.city
                      ? `${formData.location.address ? formData.location.address + ", " : ""}${formData.location.city}`
                      : "Pune"}
                  </p>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {/* Operational Timing & Slots */}
                <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-500" />{" "}
                      {formData.pricing.openingTime || "06:00 AM"} -{" "}
                      {formData.pricing.closingTime || "11:00 PM"}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[10px]">
                      {formData.pricing.slotDuration || 60}m slots
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="w-3 h-3 text-muted-foreground" />
                    <span>Open Everyday (Mon - Sun)</span>
                  </div>
                </div>

                {/* Facilities Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {(formData.location.facilities || []).slice(0, 3).map((fac) => (
                    <span
                      key={fac}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground flex items-center gap-1"
                    >
                      <Check className="w-2.5 h-2.5 text-emerald-500" /> {fac}
                    </span>
                  ))}
                  {(formData.location.facilities || []).length > 3 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                      +{(formData.location.facilities || []).length - 3} more
                    </span>
                  )}
                </div>

                {/* Rate & Booking Simulation */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-bold">Hourly Rate</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center">
                      <IndianRupee className="w-3.5 h-3.5 stroke-[2.5]" />
                      {formData.pricing.weekdayPrice || "1500"}
                      <span className="text-[10px] text-muted-foreground font-normal ml-0.5">/slot</span>
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
