import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../providers/auth-provider";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Building2, Shield, MapPin, Image as ImageIcon, IndianRupee,
  CreditCard, FileCheck2, ChevronRight, ChevronLeft, UploadCloud, Map,
  Clock, Check, FileImage, Trash2, Crosshair, AlertTriangle, CheckCircle2,
  Mail, Lock, Eye, EyeOff, Copy, ArrowRight, Loader2, ExternalLink, Navigation,
  RotateCcw, Edit3
} from "lucide-react";
import { Logo } from "../../components/brand/Logo";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../components/ui/utils";
import { adminApi } from "../../services/admin-api";
import { toast } from "sonner";

const STEPS = [
  { id: 1, title: "Personal Details", icon: User },
  { id: 2, title: "Business Details", icon: Building2 },
  { id: 3, title: "Identity Verify", icon: Shield },
  { id: 4, title: "Turf Details", icon: MapPin },
  { id: 5, title: "Location & Facilities", icon: Map },
  { id: 6, title: "Upload Images", icon: ImageIcon },
  { id: 7, title: "Pricing & Timings", icon: Clock },
  { id: 8, title: "Bank Details", icon: CreditCard },
  { id: 9, title: "Review & Submit", icon: FileCheck2 },
];

const SPORTS = ["Football", "Cricket", "Badminton", "Tennis", "Basketball", "Swimming", "Volleyball", "Table Tennis"];
const FACILITIES = ["Parking", "Washroom", "Drinking Water", "Flood Lights", "Changing Room", "Seating Area", "Cafeteria", "Equipment Rental", "First Aid", "CCTV", "WiFi"];

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve({
      name: file.name,
      type: file.type,
      size: file.size,
      data: reader.result
    });
    reader.onerror = error => reject(error);
  });
};

const FileUpload = ({ label, hint, file, onUpload, onRemove, multiple = false, files = [] }) => {
  const inputRef = React.useRef(null);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      if (multiple) {
        const filePromises = Array.from(e.target.files).map(f => fileToBase64(f));
        const base64Files = await Promise.all(filePromises);
        base64Files.forEach(f => onUpload(f));
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
        accept="image/*,.pdf"
      />

      {!multiple && !file && (
        <div
          className="border-2 border-dashed border-border rounded-xl p-4 py-3 flex flex-col items-center justify-center bg-background/30 hover:bg-background/80 transition-colors cursor-pointer group"
          onClick={() => inputRef.current?.click()}
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <UploadCloud className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xs font-medium">Click to upload or drag & drop</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>
        </div>
      )}

      {!multiple && file && (
        <div className="border border-border rounded-xl p-4 bg-background/50 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
              <FileImage className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-emerald-500 font-medium">Uploaded Successfully</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="text-rose-500 hover:bg-rose-500/10 cursor-pointer">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {multiple && (
        <div className="space-y-3">
          <div
            className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center bg-background/30 hover:bg-background/80 transition-colors cursor-pointer group"
            onClick={() => inputRef.current?.click()}
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium">Click to upload multiple images</p>
            <p className="text-xs text-muted-foreground mt-1">{hint}</p>
          </div>
          {files.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {files.map((f, i) => (
                <div key={i} className="relative group border border-border rounded-xl overflow-hidden aspect-video bg-muted/50 flex items-center justify-center">
                  <FileImage className="h-8 w-8 text-muted-foreground/50" />
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button type="button" variant="destructive" size="icon" className="h-8 w-8 rounded-full cursor-pointer" onClick={() => onRemove(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function OwnerSetupPage() {
  const navigate = useNavigate();
  const { turfOwnerUser } = useAuth();
  const currentUser = turfOwnerUser;

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const [status, setStatus] = useState("draft"); // draft, submitting, submitted, pending, approved, rejected, corrections
  const [adminFeedback, setAdminFeedback] = useState(null);
  const [generatedOwnerId, setGeneratedOwnerId] = useState("");
  const [copied, setCopied] = useState(false);

  // Email Verification & OTP state for Step 1
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [emailVerified, setEmailVerified] = useState(Boolean(currentUser?.email && currentUser?.email.includes("@")));
  const [emailOtpError, setEmailOtpError] = useState("");
  const [emailExistsError, setEmailExistsError] = useState("");
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCountdown]);

  const getStorageKey = () => {
    if (!currentUser?.id && !currentUser?.ownerId) return "turfSetup_guest_draft";
    return `turfSetup_v2_${currentUser.id || currentUser.ownerId}`;
  };

  const getEmptyState = () => ({
    personal: {
      fullName: currentUser?.fullName || "",
      email: currentUser?.email || "",
      password: "",
      confirmPassword: "",
      phone: currentUser?.phone || "",
      dob: "",
      gender: "",
      profilePhoto: null,
      address: "",
      city: currentUser?.city || "",
      state: "",
      pincode: ""
    },
    business: {
      businessName: "",
      ownerName: currentUser?.fullName || "",
      businessType: "",
      gst: "",
      tradeLicense: null,
      yearsInBusiness: "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || ""
    },
    identity: {
      aadhaarFront: null,
      aadhaarBack: null,
      panCard: null,
      electricBill: null,
      rentalAgreement: null
    },
    turf: {
      name: "",
      sports: [],
      turfType: "",
      groundCount: "",
      groundSize: "",
      surfaceType: "",
      description: ""
    },
    location: {
      address: "",
      landmark: "",
      city: currentUser?.city || "",
      state: "",
      pincode: "",
      latitude: "",
      longitude: "",
      mapUrl: "",
      facilities: []
    },
    images: {
      cover: null,
      gallery: [],
      promoVideo: null
    },
    pricing: {
      openingTime: "",
      closingTime: "",
      slotDuration: "60",
      weekdayPrice: "",
      weekendPrice: "",
      holidayPrice: "",
      peakPrice: "",
      advanceBookingLimit: "30",
      cancellationPolicy: "moderate"
    },
    bank: {
      accountName: currentUser?.fullName || "",
      bankName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifsc: "",
      upi: "",
      cancelledCheque: null
    }
  });

  const loadInitialState = () => {
    const empty = getEmptyState();
    const key = getStorageKey();
    if (!key) return empty;

    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...empty,
          ...parsed,
          personal: {
            ...empty.personal,
            ...(parsed?.personal || {}),
            fullName: (parsed?.personal?.fullName === "John Owner" || !parsed?.personal?.fullName)
              ? (currentUser?.fullName || "")
              : parsed.personal.fullName,
            email: parsed?.personal?.email || currentUser?.email || "",
            password: "",
            confirmPassword: "",
          },
          business: { ...empty.business, ...(parsed?.business || {}) },
          identity: { ...empty.identity, ...(parsed?.identity || {}) },
          turf: { ...empty.turf, ...(parsed?.turf || {}) },
          location: { ...empty.location, ...(parsed?.location || {}) },
          images: { ...empty.images, ...(parsed?.images || {}) },
          pricing: { ...empty.pricing, ...(parsed?.pricing || {}) },
          bank: { ...empty.bank, ...(parsed?.bank || {}) },
        };
      } catch (e) {
        console.error(e);
      }
    }
    return empty;
  };

  const [formData, setFormData] = useState(loadInitialState());
  const [termsAccepted, setTermsAccepted] = useState(false);

  const currentOwnerRef = React.useRef(currentUser?.id || currentUser?.ownerId);

  useEffect(() => {
    const key = getStorageKey();
    if (key) {
      try {
        const storageSafeData = {
          ...formData,
          personal: { ...formData.personal, profilePhoto: null, password: "", confirmPassword: "" },
          business: { ...formData.business, tradeLicense: null },
          identity: { aadhaarFront: null, aadhaarBack: null, panCard: null, electricBill: null, rentalAgreement: null },
          images: { cover: null, gallery: [], promoVideo: null },
          bank: { ...formData.bank, cancelledCheque: null }
        };
        localStorage.setItem(key, JSON.stringify(storageSafeData));
      } catch (err) {
        console.warn("Could not save turf draft to localStorage:", err);
      }
    }
  }, [formData, currentUser]);

  useEffect(() => {
    const activeId = currentUser?.id || currentUser?.ownerId;
    if (activeId !== currentOwnerRef.current) {
      currentOwnerRef.current = activeId;
      setFormData(loadInitialState());
      setCurrentStep(1);
      setCompletedSteps([]);
    }
  }, [currentUser?.id, currentUser?.ownerId]);

  const updateSection = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const toggleArrayItem = (section, field, value) => {
    setFormData(prev => {
      const arr = prev[section]?.[field] || [];
      const newArr = arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value];
      return { ...prev, [section]: { ...prev[section], [field]: newArr } };
    });
  };

  const handleResetForm = () => {
    if (window.confirm("Do you want to reset this turf registration form and start fresh? All unsubmitted inputs will be cleared.")) {
      const key = getStorageKey();
      if (key) {
        try { localStorage.removeItem(key); } catch (e) {}
      }
      setFormData(getEmptyState());
      setEmailVerified(false);
      setEmailOtpSent(false);
      setEmailOtpCode("");
      setEmailExistsError("");
      setCurrentStep(1);
      setCompletedSteps([]);
      toast.info("Registration form reset. You can now start fresh!");
    }
  };

  // Check email availability
  const checkEmailAvailability = async (emailVal) => {
    if (!emailVal || !emailVal.includes("@")) {
      setEmailExistsError("");
      return;
    }
    try {
      const res = await adminApi.checkExists({ email: emailVal.trim(), accountType: "turf-owner" });
      if (res.exists && res.field === "email") {
        setEmailExistsError("An account with this email address already exists for Turf Owner. Please log in instead.");
      } else {
        setEmailExistsError("");
      }
    } catch (e) {
      console.error("Check email error:", e);
    }
  };

  const handleEmailChange = (e) => {
    const emailVal = e.target.value;
    updateSection('personal', 'email', emailVal);
    setEmailOtpSent(false);
    setResendCountdown(0);
    setEmailOtpError("");
    setEmailVerified(false);
    checkEmailAvailability(emailVal);
  };

  // Live OTP Request
  const sendEmailOtp = async () => {
    const emailVal = (formData?.personal?.email || "").trim();
    if (!emailVal.includes("@") || emailExistsError || isSendingEmailOtp) return;
    try {
      setIsSendingEmailOtp(true);
      setEmailOtpError("");
      const res = await adminApi.requestOtp(emailVal, "register");
      if (res.success) {
        setEmailOtpSent(true);
        setResendCountdown(60);
        toast.success(
          emailOtpSent
            ? `New verification code resent to ${emailVal}! Please check your inbox.`
            : `Verification code sent to ${emailVal}! Please check your inbox.`,
          { duration: 6000 }
        );
      } else {
        setEmailOtpError(res.error || "Failed sending OTP code");
      }
    } catch (e) {
      setEmailOtpError("Failed requesting OTP");
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  // Live OTP Verify
  const verifyEmailOtp = async (customOtp) => {
    const code = typeof customOtp === "string" ? customOtp : emailOtpCode;
    const emailVal = (formData?.personal?.email || "").trim();
    if (!code || !code.trim() || !emailVal) return;
    try {
      const res = await adminApi.verifyOtp(emailVal, code.trim());
      if (res.success) {
        setEmailVerified(true);
        setEmailOtpError("");
        toast.success("Email verified successfully!");
      } else {
        setEmailOtpError(res.error || "Invalid verification code");
      }
    } catch (e) {
      setEmailOtpError("Invalid verification code");
    }
  };

  // Location & Map Helpers
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
          // Reverse geocoding via OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en"
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};

            const road = addr.road || addr.street || addr.pedestrian || "";
            const landmark = addr.suburb || addr.neighbourhood || addr.amenity || addr.building || "";
            const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
            const state = addr.state || "";
            const pincode = addr.postcode || "";
            const formattedAddress = data.display_name || [road, landmark, city, state, pincode].filter(Boolean).join(", ");

            setFormData(prev => ({
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
                mapUrl: `https://maps.google.com/?q=${latitude},${longitude}`
              }
            }));

            toast.success("GPS Location & Address detected successfully!");
          } else {
            setFormData(prev => ({
              ...prev,
              location: {
                ...prev.location,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                mapUrl: `https://maps.google.com/?q=${latitude},${longitude}`
              }
            }));
            toast.success(`Coordinates captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (err) {
          console.error("Geocoding fetch error:", err);
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              mapUrl: `https://maps.google.com/?q=${latitude},${longitude}`
            }
          }));
          toast.success(`Coordinates captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        console.warn("Geolocation error:", error);
        if (error.code === 1) {
          toast.error("Location permission denied. Please allow location access in your browser or enter your address manually.");
        } else if (error.code === 2) {
          toast.error("Location position unavailable. Please enter address manually.");
        } else if (error.code === 3) {
          toast.error("Location request timed out. Please try again.");
        } else {
          toast.error("Could not detect location. Please enter manually.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleOpenGoogleMaps = () => {
    const loc = formData.location || {};
    let query = "";
    if (loc.latitude && loc.longitude) {
      query = `${loc.latitude},${loc.longitude}`;
    } else {
      const parts = [loc.address, loc.landmark, loc.city, loc.state, loc.pincode].filter(Boolean);
      query = parts.length > 0 ? parts.join(", ") : (formData.turf?.name ? `${formData.turf.name}, India` : "India");
    }
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, "_blank");
  };

  const getMapEmbedUrl = () => {
    const loc = formData.location || {};
    if (loc.latitude && loc.longitude) {
      return `https://maps.google.com/maps?q=${loc.latitude},${loc.longitude}&hl=en&z=15&output=embed`;
    }
    const parts = [loc.address, loc.landmark, loc.city, loc.state, loc.pincode].filter(Boolean);
    if (parts.length > 0) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(parts.join(", "))}&hl=en&z=14&output=embed`;
    }
    if (formData.turf?.name && formData.personal?.city) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(`${formData.turf.name}, ${formData.personal.city}`)}&hl=en&z=14&output=embed`;
    }
    return `https://maps.google.com/maps?q=India&hl=en&z=5&output=embed`;
  };

  const isPersonalStepValid = () => {
    const p = formData?.personal || {};
    const fullName = (p.fullName || "").trim();
    const email = (p.email || "").trim();
    const password = p.password || "";
    const confirmPassword = p.confirmPassword || "";

    if (!fullName) return false;
    if (!email.includes("@") || emailExistsError) return false;
    if (!emailVerified) return false;
    if (password) {
      if (password.length < 6) return false;
      if (password !== confirmPassword) return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const p = formData?.personal || {};
      const fullName = (p.fullName || "").trim();
      const email = (p.email || "").trim();
      const password = p.password || "";
      const confirmPassword = p.confirmPassword || "";

      if (!fullName) {
        toast.error("Please enter your Full Name.");
        return;
      }
      if (!email || !email.includes("@")) {
        toast.error("Please enter a valid email address.");
        return;
      }
      if (emailExistsError) {
        toast.error(emailExistsError);
        return;
      }
      if (!emailVerified) {
        toast.error("Please verify your email address with the OTP before proceeding.");
        return;
      }
      if (password && password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }
      if (password && password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    setCurrentStep(prev => Math.min(prev + 1, 9));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!termsAccepted) {
      toast.error("Please accept the Terms & Conditions.");
      return;
    }

    setStatus("submitting");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
      const response = await fetch(`${apiBase}/api/owner/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: currentUser?.ownerId || currentUser?.id || "",
          email: formData.personal.email || "",
          password: formData.personal.password || "",
          setupData: formData
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      if (data.success) {
        const assignedId = data.ownerId || "26090001";
        setGeneratedOwnerId(String(assignedId));
        localStorage.setItem("ownerId", String(assignedId));
        localStorage.setItem("userName", formData.personal.fullName);
        localStorage.removeItem(getStorageKey());
        setStatus("submitted");
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { }
        toast.success("Turf onboarding application submitted successfully!");
      } else {
        console.error("Failed to submit profile: ", data.error || data.message || data);
        toast.error("Submission failed: " + (data.error || data.message || "Unknown error"));
        setStatus("draft");
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.error("Network error: ", e.message);
      toast.error("Network error: " + e.message);
      setStatus("draft");
    }
  };

  // Render Status Screens
  if (status === "submitting") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
          <div className="h-16 w-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-2xl font-bold tracking-tight">Submitting Profile...</h2>
          <p className="text-muted-foreground">Please wait while we process your turf registration securely.</p>
        </motion.div>
      </div>
    );
  }

  // SUCCESS / SUBMITTED SCREEN WITH GENERATED OWNER ID
  if (status === "submitted") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-6 max-w-lg w-full border border-border/60 bg-card/90 backdrop-blur-2xl rounded-[32px] p-8 sm:p-10 shadow-2xl relative z-10"
        >
          <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center relative mb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
            >
              <Check className="h-10 w-10 text-emerald-500" />
            </motion.div>
            <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping opacity-45 pointer-events-none" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Turf Registration Submitted!
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Your turf onboarding application has been submitted and is currently under review by our admin team.
            </p>
          </div>

          {/* Assigned ID Box */}
          <div className="p-6 border border-border bg-muted/30 rounded-2xl text-center mx-auto w-full shadow-sm space-y-3">
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest">
              YOUR ASSIGNED TURF OWNER ID
            </p>

            <div className="flex items-center justify-between gap-3 w-full max-w-[280px] mx-auto h-16 bg-background rounded-xl border border-border px-4 shadow-sm">
              <span className="text-2xl sm:text-3xl font-bold font-mono tracking-widest text-emerald-600 dark:text-emerald-400 pl-2">
                {generatedOwnerId}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(generatedOwnerId);
                  setCopied(true);
                  toast.success("Owner ID copied to clipboard!");
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="h-9 w-9 rounded-lg hover:bg-muted cursor-pointer"
                title="Copy Owner ID"
              >
                {copied ? <Check className="h-4.5 w-4.5 text-emerald-500" /> : <Copy className="h-4.5 w-4.5 text-muted-foreground" />}
              </Button>
            </div>

            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Save this ID. You can log into your Turf Owner Portal using this ID or your verified email ({formData.personal.email}).
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate("/admin-login")}
              className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Login to Owner Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex-1 h-12 rounded-xl border-border font-semibold cursor-pointer"
            >
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 max-w-md w-full border border-border/50 bg-card/65 backdrop-blur-2xl rounded-[32px] p-10">
          <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Profile Approved!</h2>
            <p className="text-muted-foreground text-sm">Welcome to SportXClub! Your turf listing is now verified and active on our platform.</p>
          </div>
          <div className="pt-4">
            <Button onClick={() => navigate("/admin-panel")} className="w-full h-11 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer">
              Go to Turf Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-md w-full border border-border/50 bg-card/65 backdrop-blur-2xl rounded-[32px] p-10">
          <div className="mx-auto h-20 w-20 rounded-full bg-rose-500/10 border-2 border-rose-500/20 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Application Rejected</h2>
            <p className="text-muted-foreground text-sm">Unfortunately, your application did not meet our platform guidelines at this time.</p>
          </div>
          <Button onClick={() => { setStatus("draft"); setCurrentStep(1); }} className="w-full cursor-pointer">Start New Application</Button>
        </motion.div>
      </div>
    );
  }

  // Common Layout for Stepper
  return (
    <div className="min-h-screen bg-background relative flex flex-col md:flex-row font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />

      {/* Left Sidebar Stepper */}
      <div className="hidden md:flex flex-col w-64 lg:w-72 border-r border-border/50 bg-card/30 backdrop-blur-xl px-4 pb-4 pt-0 sm:px-6 sm:pb-6 sm:pt-0 sticky top-0 h-screen overflow-y-auto z-10">
        <div className="-mt-4 -mb-4">
          <Link to="/" className="cursor-pointer block">
            <Logo />
          </Link>
        </div>

        <div className="relative space-y-0 z-10">
          <div className="absolute top-4 bottom-4 left-[19px] w-[2px] bg-border/50 -z-10" />
          {STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isFlagged = status === "corrections" && adminFeedback?.rejectedSteps?.includes(step.id);
            const StepIcon = step.icon;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-4 py-3.5 cursor-pointer group transition-opacity",
                  !isCompleted && !isCurrent && status !== "corrections" ? "opacity-60 hover:opacity-90" : "opacity-100",
                  isFlagged && "bg-rose-500/5 -mx-4 px-4 rounded-xl"
                )}
                onClick={() => {
                  if (isCompleted || status === "corrections" || step.id <= Math.max(...completedSteps, 1)) {
                    setCurrentStep(step.id);
                  }
                }}
              >
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors relative bg-background",
                  isCompleted && !isFlagged ? "border-primary text-primary" : "",
                  isCurrent && !isFlagged ? "border-primary bg-primary text-primary-foreground" : "",
                  !isCompleted && !isCurrent && !isFlagged ? "border-border text-muted-foreground" : "",
                  isFlagged ? "border-rose-500 text-rose-500" : ""
                )}>
                  {isCompleted && !isCurrent && !isFlagged ? <Check className="h-5 w-5" /> :
                    isFlagged ? <AlertTriangle className="h-5 w-5" /> :
                      <StepIcon className="h-5 w-5" />}

                  {isCurrent && <div className="absolute -inset-1 rounded-full border border-primary/30 animate-ping" />}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium transition-colors",
                    isCurrent ? "text-foreground font-semibold" : "text-muted-foreground",
                    isFlagged ? "text-rose-500 font-semibold" : ""
                  )}>{step.title}</p>
                  {isFlagged && <p className="text-[10px] text-rose-500">Needs attention</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-y-auto pb-8">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-20">
          <Link to="/" className="cursor-pointer">
            <Logo />
          </Link>
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
            Step {currentStep}/9
          </Badge>
        </div>

        <div className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-8 lg:p-12">
          {status === "corrections" && adminFeedback && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex gap-4 items-start">
              <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-rose-500">Action Required</h4>
                <p className="text-sm text-rose-600/90 dark:text-rose-400 mt-1">{adminFeedback.message}</p>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">{STEPS.find(s => s.id === currentStep)?.title}</h1>
              <p className="text-muted-foreground text-sm">Provide accurate details to ensure quick verification and listing.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetForm}
              className="self-start sm:self-auto text-xs text-muted-foreground hover:text-foreground h-9 px-3 rounded-xl border-dashed border-border gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Start Fresh / Reset
            </Button>
          </div>

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="border border-border/50 bg-card/40 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-sm mb-8"
          >
            {/* STEP 1: PERSONAL DETAILS & EMAIL OTP VERIFICATION */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-semibold">Full Name (As per ID) *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Enter your legal full name"
                      value={formData.personal?.fullName || ""}
                      onChange={(e) => updateSection('personal', 'fullName', e.target.value)}
                      className="pl-10 h-10 rounded-xl text-sm"
                      required
                    />
                  </div>
                </div>

                {/* EMAIL ADDRESS WITH LIVE OTP VERIFICATION */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email" className="text-xs font-semibold">Email Address *</Label>
                    {emailVerified && (
                      <button
                        type="button"
                        onClick={() => {
                          setEmailVerified(false);
                          setEmailOtpSent(false);
                          setEmailOtpCode("");
                          setEmailExistsError("");
                          toast.info("Email unlocked. You can now edit your email address and verify with OTP.");
                        }}
                        className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Change / Edit Email
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        disabled={emailVerified}
                        placeholder="Enter your business/personal email"
                        className={cn(
                          "pl-10 h-10 rounded-xl text-sm",
                          emailVerified ? "bg-muted/40 text-foreground/80 cursor-default" : "bg-background",
                          emailExistsError && "border-rose-500 focus-visible:ring-rose-500"
                        )}
                        value={formData.personal?.email || ""}
                        onChange={handleEmailChange}
                        required
                      />
                    </div>
                    {!emailVerified && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={
                          !(formData.personal?.email || "").includes("@") ||
                          Boolean(emailExistsError) ||
                          isSendingEmailOtp ||
                          (emailOtpSent && resendCountdown > 0)
                        }
                        onClick={sendEmailOtp}
                        className={cn(
                          "h-10 px-4 rounded-xl border text-xs font-bold shrink-0 transition-all cursor-pointer",
                          emailOtpSent && resendCountdown === 0
                            ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                            : "border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary dark:text-white"
                        )}
                      >
                        {isSendingEmailOtp
                          ? "Sending..."
                          : emailOtpSent
                          ? resendCountdown > 0
                            ? `Resend (${resendCountdown}s)`
                            : "Resend OTP"
                          : "Send OTP"}
                      </Button>
                    )}
                    {emailVerified && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="h-10 px-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5 text-xs font-bold">
                          <Check className="h-4 w-4 stroke-[3]" /> Verified
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEmailVerified(false);
                            setEmailOtpSent(false);
                            setEmailOtpCode("");
                            setEmailExistsError("");
                            toast.info("Email unlocked. You can now edit your email address.");
                          }}
                          className="h-10 px-3 rounded-xl border-border hover:bg-muted text-xs font-semibold cursor-pointer"
                          title="Change email"
                        >
                          Change
                        </Button>
                      </div>
                    )}
                  </div>

                  {emailExistsError && (
                    <div className="text-[11px] font-medium text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl flex items-center gap-2 mt-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{emailExistsError}</span>
                    </div>
                  )}
                </div>

                {/* OTP INPUT SECTION */}
                {emailOtpSent && !emailVerified && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1.5 bg-emerald-500/5 border border-emerald-500/20 p-3.5 rounded-xl"
                  >
                    <Label htmlFor="otp" className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Enter 6-Digit Verification Code
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                        <Input
                          id="otp"
                          type="text"
                          maxLength={6}
                          placeholder="Enter OTP Code"
                          className="pl-10 h-10 rounded-xl font-mono text-center tracking-[0.25em] text-sm"
                          value={emailOtpCode}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEmailOtpCode(val);
                            if (val.trim().length === 6) {
                              verifyEmailOtp(val.trim());
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (emailOtpCode.trim().length === 6) {
                                verifyEmailOtp(emailOtpCode.trim());
                              }
                            }
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        disabled={emailOtpCode.trim().length !== 6}
                        onClick={() => verifyEmailOtp(emailOtpCode)}
                        className="h-10 px-4 rounded-xl border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Verify Code
                      </Button>
                    </div>
                    {emailOtpError && (
                      <p className="text-xs text-rose-500 font-medium pt-1">{emailOtpError}</p>
                    )}
                  </motion.div>
                )}

                {/* PASSWORD & CONFIRM PASSWORD */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-semibold">Account Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create strong password"
                        value={formData.personal?.password || ""}
                        onChange={(e) => updateSection('personal', 'password', e.target.value)}
                        className="pl-10 pr-10 h-10 rounded-xl text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-semibold">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={formData.personal?.confirmPassword || ""}
                        onChange={(e) => updateSection('personal', 'confirmPassword', e.target.value)}
                        className="pl-10 h-10 rounded-xl text-sm"
                      />
                    </div>
                    {formData.personal?.confirmPassword && formData.personal?.password !== formData.personal?.confirmPassword && (
                      <p className="text-[11px] text-rose-500 font-medium">Passwords do not match</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Phone Number</Label>
                    <Input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={formData.personal?.phone || ""}
                      onChange={(e) => updateSection('personal', 'phone', e.target.value)}
                      className="h-10 rounded-xl text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Date of Birth</Label>
                      <Input
                        type="date"
                        value={formData.personal?.dob || ""}
                        onChange={(e) => updateSection('personal', 'dob', e.target.value)}
                        className="h-10 rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Gender</Label>
                      <Select value={formData.personal?.gender || ""} onValueChange={(val) => updateSection('personal', 'gender', val)}>
                        <SelectTrigger className="h-10 rounded-xl text-sm"><SelectValue placeholder="Gender" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <FileUpload
                  label="Profile Photo (Optional)"
                  file={formData.personal?.profilePhoto}
                  onUpload={(f) => updateSection('personal', 'profilePhoto', f)}
                  onRemove={() => updateSection('personal', 'profilePhoto', null)}
                />

                <div className="space-y-3 pt-3 border-t border-border/50">
                  <h3 className="font-semibold text-xs">Residential Address</h3>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Complete Address</Label>
                    <Textarea
                      value={formData.personal?.address || ""}
                      onChange={(e) => updateSection('personal', 'address', e.target.value)}
                      placeholder="House/Flat No., Building Name, Street"
                      className="rounded-xl min-h-[60px] text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">City</Label>
                      <Input
                        value={formData.personal?.city || ""}
                        onChange={(e) => updateSection('personal', 'city', e.target.value)}
                        className="h-9 rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">State</Label>
                      <Input
                        value={formData.personal?.state || ""}
                        onChange={(e) => updateSection('personal', 'state', e.target.value)}
                        className="h-9 rounded-xl text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Pincode</Label>
                      <Input
                        value={formData.personal?.pincode || ""}
                        onChange={(e) => updateSection('personal', 'pincode', e.target.value)}
                        className="h-9 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: BUSINESS DETAILS */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label>Owner / Manager Name</Label>
                    <Input
                      value={formData.business?.ownerName || formData.personal?.fullName || ""}
                      onChange={(e) => updateSection('business', 'ownerName', e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Business Type</Label>
                    <Select value={formData.business?.businessType || ""} onValueChange={(val) => updateSection('business', 'businessType', val)}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Proprietorship, LLP, etc." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="proprietorship">Sole Proprietorship</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="llp">LLP</SelectItem>
                        <SelectItem value="pvt_ltd">Private Limited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label>GST Number (Optional)</Label>
                    <Input value={formData.business?.gst || ""} onChange={(e) => updateSection('business', 'gst', e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Years in Business</Label>
                    <Input type="number" value={formData.business?.yearsInBusiness || ""} onChange={(e) => updateSection('business', 'yearsInBusiness', e.target.value)} className="h-11 rounded-xl" />
                  </div>
                </div>
                <FileUpload
                  label="Trade License / Registration (Optional)"
                  file={formData.business?.tradeLicense}
                  onUpload={(f) => updateSection('business', 'tradeLicense', f)}
                  onRemove={() => updateSection('business', 'tradeLicense', null)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label>Business Email (Optional)</Label>
                    <Input type="email" value={formData.business?.email || formData.personal?.email || ""} onChange={(e) => updateSection('business', 'email', e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Business Contact Number</Label>
                    <Input value={formData.business?.phone || formData.personal?.phone || ""} onChange={(e) => updateSection('business', 'phone', e.target.value)} className="h-11 rounded-xl" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: IDENTITY VERIFICATION */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 text-sm">
                  <Shield className="h-5 w-5 text-primary shrink-0" />
                  <p>Your documents are securely encrypted and only used for verification purposes to ensure a trusted marketplace.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUpload label="Aadhaar Card (Front) *" file={formData.identity?.aadhaarFront} onUpload={(f) => updateSection('identity', 'aadhaarFront', f)} onRemove={() => updateSection('identity', 'aadhaarFront', null)} />
                  <FileUpload label="Aadhaar Card (Back) *" file={formData.identity?.aadhaarBack} onUpload={(f) => updateSection('identity', 'aadhaarBack', f)} onRemove={() => updateSection('identity', 'aadhaarBack', null)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUpload label="PAN Card *" file={formData.identity?.panCard} onUpload={(f) => updateSection('identity', 'panCard', f)} onRemove={() => updateSection('identity', 'panCard', null)} />
                  <FileUpload label="Electric Bill *" file={formData.identity?.electricBill} onUpload={(f) => updateSection('identity', 'electricBill', f)} onRemove={() => updateSection('identity', 'electricBill', null)} />
                </div>
                <FileUpload label="Rental Land Agreement (Optional)" hint="Upload your rental or lease agreement if applicable" file={formData.identity?.rentalAgreement} onUpload={(f) => updateSection('identity', 'rentalAgreement', f)} onRemove={() => updateSection('identity', 'rentalAgreement', null)} />
              </div>
            )}

            {/* STEP 4: TURF DETAILS */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <Label>Turf Name (Publicly Visible) *</Label>
                  <Input value={formData.turf?.name || ""} onChange={(e) => updateSection('turf', 'name', e.target.value)} className="h-11 rounded-xl" placeholder="e.g. Skyline Sports Arena" />
                </div>
                <div className="space-y-2">
                  <Label>Sport Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {SPORTS.map(sport => (
                      <Badge
                        key={sport}
                        variant="outline"
                        className={cn(
                          "cursor-pointer px-3 py-1.5 text-sm transition-colors rounded-full",
                          formData.turf?.sports?.includes(sport) ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
                        )}
                        onClick={() => toggleArrayItem('turf', 'sports', sport)}
                      >
                        {sport}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label>Turf Type</Label>
                    <Select value={formData.turf?.turfType || ""} onValueChange={(val) => updateSection('turf', 'turfType', val)}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indoor">Indoor</SelectItem>
                        <SelectItem value="outdoor">Outdoor</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Number of Grounds/Courts</Label>
                    <Input type="number" value={formData.turf?.groundCount || ""} onChange={(e) => updateSection('turf', 'groundCount', e.target.value)} className="h-11 rounded-xl" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5"><Label>Ground Size (e.g. 5v5, 100x50 ft)</Label><Input value={formData.turf?.groundSize || ""} onChange={(e) => updateSection('turf', 'groundSize', e.target.value)} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1.5"><Label>Surface Type</Label><Input placeholder="e.g. Artificial Grass, Hardwood" value={formData.turf?.surfaceType || ""} onChange={(e) => updateSection('turf', 'surfaceType', e.target.value)} className="h-11 rounded-xl" /></div>
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea value={formData.turf?.description || ""} onChange={(e) => updateSection('turf', 'description', e.target.value)} placeholder="Tell players what makes your turf special..." className="rounded-xl min-h-[120px]" />
                </div>
              </div>
            )}

            {/* STEP 5: LOCATION & FACILITIES */}
            {currentStep === 5 && (
              <div className="space-y-6">
                {/* Location Action Header */}
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

                {/* Workable Interactive Map Preview Container */}
                <div className="rounded-2xl border border-border/80 overflow-hidden shadow-sm bg-muted/20 relative">
                  <div className="p-3 px-4 bg-background/90 backdrop-blur-md border-b border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-foreground">
                        {formData.location?.city ? `${formData.location.city}${formData.location.state ? `, ${formData.location.state}` : ""}` : "Interactive Turf Map"}
                      </span>
                    </div>
                    {formData.location?.latitude && formData.location?.longitude && (
                      <span className="font-mono text-[11px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-md font-medium">
                        GPS: {Number(formData.location.latitude).toFixed(4)}°, {Number(formData.location.longitude).toFixed(4)}°
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

                {/* Location Form Inputs */}
                <div className="space-y-1.5">
                  <Label htmlFor="turfAddress" className="text-xs font-semibold">Full Address *</Label>
                  <Textarea
                    id="turfAddress"
                    placeholder="Plot / Survey No., Street name, Area, Colony..."
                    value={formData.location?.address || ""}
                    onChange={(e) => updateSection('location', 'address', e.target.value)}
                    className="rounded-xl min-h-[70px] text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="landmark" className="text-xs font-semibold">Landmark</Label>
                    <Input
                      id="landmark"
                      placeholder="e.g. Near Metro Station / Behind Sports Complex"
                      value={formData.location?.landmark || ""}
                      onChange={(e) => updateSection('location', 'landmark', e.target.value)}
                      className="h-10 rounded-xl text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pincode" className="text-xs font-semibold">Pincode *</Label>
                    <Input
                      id="pincode"
                      placeholder="e.g. 400001"
                      maxLength={6}
                      value={formData.location?.pincode || ""}
                      onChange={(e) => updateSection('location', 'pincode', e.target.value)}
                      className="h-10 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="turfCity" className="text-xs font-semibold">City *</Label>
                    <Input
                      id="turfCity"
                      placeholder="e.g. Mumbai"
                      value={formData.location?.city || ""}
                      onChange={(e) => updateSection('location', 'city', e.target.value)}
                      className="h-10 rounded-xl text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="turfState" className="text-xs font-semibold">State *</Label>
                    <Input
                      id="turfState"
                      placeholder="e.g. Maharashtra"
                      value={formData.location?.state || ""}
                      onChange={(e) => updateSection('location', 'state', e.target.value)}
                      className="h-10 rounded-xl text-sm"
                    />
                  </div>
                </div>

                {/* Google Maps Link / Custom Pin URL (Optional) */}
                <div className="space-y-1.5 pt-1">
                  <Label htmlFor="mapUrl" className="text-xs font-semibold flex items-center justify-between">
                    <span>Google Maps Link (Optional)</span>
                    <span className="text-[11px] text-muted-foreground font-normal">Auto-detected or custom share link</span>
                  </Label>
                  <Input
                    id="mapUrl"
                    placeholder="https://maps.google.com/..."
                    value={formData.location?.mapUrl || ""}
                    onChange={(e) => updateSection('location', 'mapUrl', e.target.value)}
                    className="h-10 rounded-xl text-sm font-mono text-xs"
                  />
                </div>

                {/* Facilities Checklist */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Facilities Available</Label>
                    <span className="text-xs text-muted-foreground">Select amenities provided at your turf</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {FACILITIES.map(fac => {
                      const isSelected = formData.location?.facilities?.includes(fac);
                      return (
                        <div
                          key={fac}
                          className={cn(
                            "border rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all select-none",
                            isSelected
                              ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                              : "border-border/70 hover:bg-muted/40 text-foreground"
                          )}
                          onClick={() => toggleArrayItem('location', 'facilities', fac)}
                        >
                          <div
                            className={cn(
                              "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                              isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input bg-background"
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs sm:text-sm">{fac}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: UPLOAD IMAGES */}
            {currentStep === 6 && (
              <div className="space-y-8">
                <FileUpload label="Cover Image (High Resolution) *" hint="This is the first image users will see. Make it count." file={formData.images?.cover} onUpload={(f) => updateSection('images', 'cover', f)} onRemove={() => updateSection('images', 'cover', null)} />
                <FileUpload
                  label="Gallery Images (Minimum 5)"
                  hint="Add photos of the ground, seating, facilities, etc."
                  multiple
                  files={formData.images?.gallery || []}
                  onUpload={(f) => {
                    updateSection('images', 'gallery', [...(formData.images?.gallery || []), f]);
                  }}
                  onRemove={(idx) => {
                    const newArr = [...(formData.images?.gallery || [])];
                    newArr.splice(idx, 1);
                    updateSection('images', 'gallery', newArr);
                  }}
                />
                <FileUpload label="Promo Video (Optional)" hint="Upload a short walkthrough video (max 20MB)" file={formData.images?.promoVideo} onUpload={(f) => updateSection('images', 'promoVideo', f)} onRemove={() => updateSection('images', 'promoVideo', null)} />
              </div>
            )}

            {/* STEP 7: PRICING & TIMINGS */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-1.5"><Label>Opening Time</Label><Input type="time" value={formData.pricing?.openingTime || ""} onChange={(e) => updateSection('pricing', 'openingTime', e.target.value)} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1.5"><Label>Closing Time</Label><Input type="time" value={formData.pricing?.closingTime || ""} onChange={(e) => updateSection('pricing', 'closingTime', e.target.value)} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1.5">
                    <Label>Slot Duration</Label>
                    <Select value={formData.pricing?.slotDuration || "60"} onValueChange={(val) => updateSection('pricing', 'slotDuration', val)}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="e.g. 60 mins" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 mins</SelectItem>
                        <SelectItem value="60">60 mins</SelectItem>
                        <SelectItem value="90">90 mins</SelectItem>
                        <SelectItem value="120">120 mins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/50">
                  <h3 className="font-semibold text-sm">Pricing Structure (₹ / Slot)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label>Standard Weekday Price</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="1200" value={formData.pricing?.weekdayPrice || ""} onChange={(e) => updateSection('pricing', 'weekdayPrice', e.target.value)} className="pl-9 h-11 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Weekend Price</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="1500" value={formData.pricing?.weekendPrice || ""} onChange={(e) => updateSection('pricing', 'weekendPrice', e.target.value)} className="pl-9 h-11 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Holiday Price (Optional)</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="1500" value={formData.pricing?.holidayPrice || ""} onChange={(e) => updateSection('pricing', 'holidayPrice', e.target.value)} className="pl-9 h-11 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Peak Hour Price (Optional)</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="1800" value={formData.pricing?.peakPrice || ""} onChange={(e) => updateSection('pricing', 'peakPrice', e.target.value)} className="pl-9 h-11 rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                  <div className="space-y-1.5">
                    <Label>Advance Booking Limit (Days)</Label>
                    <Input type="number" placeholder="e.g. 30" value={formData.pricing?.advanceBookingLimit || ""} onChange={(e) => updateSection('pricing', 'advanceBookingLimit', e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Cancellation Policy</Label>
                    <Select value={formData.pricing?.cancellationPolicy || "moderate"} onValueChange={(val) => updateSection('pricing', 'cancellationPolicy', val)}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select Policy" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flexible">Flexible (Free until 24h before)</SelectItem>
                        <SelectItem value="moderate">Moderate (50% refund)</SelectItem>
                        <SelectItem value="strict">Strict (No refund)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 8: BANK DETAILS */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-sm">
                  <CreditCard className="h-5 w-5 text-amber-600 shrink-0" />
                  <p className="text-amber-700 dark:text-amber-400">Please ensure the bank details match your business or personal PAN card for seamless payouts.</p>
                </div>

                <div className="space-y-1.5">
                  <Label>Account Holder Name</Label>
                  <Input value={formData.bank?.accountName || ""} onChange={(e) => updateSection('bank', 'accountName', e.target.value)} className="h-11 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label>Bank Name</Label>
                    <Input value={formData.bank?.bankName || ""} onChange={(e) => updateSection('bank', 'bankName', e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>IFSC Code</Label>
                    <Input value={formData.bank?.ifsc || ""} onChange={(e) => updateSection('bank', 'ifsc', e.target.value)} className="h-11 rounded-xl uppercase" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label>Account Number</Label>
                    <Input type="password" value={formData.bank?.accountNumber || ""} onChange={(e) => updateSection('bank', 'accountNumber', e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Confirm Account Number</Label>
                    <Input type="text" value={formData.bank?.confirmAccountNumber || ""} onChange={(e) => updateSection('bank', 'confirmAccountNumber', e.target.value)} className="h-11 rounded-xl" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>UPI ID (Optional)</Label>
                  <Input value={formData.bank?.upi || ""} onChange={(e) => updateSection('bank', 'upi', e.target.value)} placeholder="e.g. business@ybl" className="h-11 rounded-xl" />
                </div>

                <FileUpload label="Cancelled Cheque (Optional)" hint="Speeds up the verification process" file={formData.bank?.cancelledCheque} onUpload={(f) => updateSection('bank', 'cancelledCheque', f)} onRemove={() => updateSection('bank', 'cancelledCheque', null)} />
              </div>
            )}

            {/* STEP 9: REVIEW & SUBMIT */}
            {currentStep === 9 && (
              <div className="space-y-6">
                <div className="bg-muted/50 rounded-xl p-6 border border-border">
                  <h3 className="text-lg font-bold mb-4">Summary of Details</h3>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between border-b border-border/50 pb-2 mb-2">
                        <span className="font-semibold text-sm">Owner & Personal Info</span>
                        <Button variant="link" size="sm" onClick={() => setCurrentStep(1)} className="h-auto p-0 cursor-pointer">Edit</Button>
                      </div>
                      <div className="grid grid-cols-2 text-sm gap-2">
                        <p className="text-muted-foreground">Full Name:</p><p className="font-medium text-right">{formData.personal?.fullName || "-"}</p>
                        <p className="text-muted-foreground">Email:</p><p className="font-medium text-right">{formData.personal?.email || "-"}</p>
                        <p className="text-muted-foreground">Phone:</p><p className="font-medium text-right">{formData.personal?.phone || "-"}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between border-b border-border/50 pb-2 mb-2">
                        <span className="font-semibold text-sm">Turf & Business Info</span>
                        <Button variant="link" size="sm" onClick={() => setCurrentStep(4)} className="h-auto p-0 cursor-pointer">Edit</Button>
                      </div>
                      <div className="grid grid-cols-2 text-sm gap-2">
                        <p className="text-muted-foreground">Turf Name:</p><p className="font-medium text-right">{formData.turf?.name || "-"}</p>
                        <p className="text-muted-foreground">Turf Type:</p><p className="font-medium text-right capitalize">{formData.turf?.turfType || "-"}</p>
                        <p className="text-muted-foreground">City:</p><p className="font-medium text-right">{formData.location?.city || formData.personal?.city || "-"}</p>
                        <p className="text-muted-foreground">Weekday Price:</p><p className="font-medium text-right">₹{formData.pricing?.weekdayPrice || "-"}/slot</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-xl border border-primary/20">
                  <Checkbox id="terms" className="mt-1 cursor-pointer" checked={termsAccepted} onCheckedChange={setTermsAccepted} />
                  <div className="space-y-1">
                    <Label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer">I agree to the Terms & Conditions</Label>
                    <p className="text-xs text-muted-foreground">By submitting, you confirm that all provided information is accurate and you authorize SportXClub to verify these details.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-border/20">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="rounded-full px-6 bg-transparent border-border/40 hover:bg-muted/30 cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4 mr-2" /> Back
              </Button>

              {currentStep < 9 ? (
                <Button
                  variant="outline"
                  onClick={handleNext}
                  className="rounded-full px-8 bg-transparent border-border/40 hover:bg-muted/30 cursor-pointer"
                >
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!termsAccepted}
                  className="rounded-full px-8 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Submit Profile <Check className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
