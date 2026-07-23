import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../providers/auth-provider";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Building2, Shield, MapPin, Image as ImageIcon, IndianRupee,
  CreditCard, FileCheck2, ChevronRight, ChevronLeft, UploadCloud, Map,
  Clock, Check, FileImage, Trash2, Crosshair, AlertTriangle, CheckCircle2
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

const STEPS = [
  { id: 1, title: "Account Details", icon: User },
  { id: 2, title: "Personal Details", icon: User },
  { id: 3, title: "Business Details", icon: Building2 },
  { id: 4, title: "Identity Verify", icon: Shield },
  { id: 5, title: "Turf Details", icon: MapPin },
  { id: 6, title: "Location & Facilities", icon: Map },
  { id: 7, title: "Upload Images", icon: ImageIcon },
  { id: 8, title: "Pricing & Timings", icon: Clock },
  { id: 9, title: "Bank Details", icon: CreditCard },
  { id: 10, title: "Review & Submit", icon: FileCheck2 },
];

const SPORTS = ["Football", "Cricket", "Badminton", "Tennis", "Basketball", "Swimming", "Volleyball", "Table Tennis"];
const FACILITIES = ["Parking", "Washroom", "Drinking Water", "Flood Lights", "Changing Room", "Seating Area", "Cafeteria", "Equipment Rental", "First Aid", "CCTV", "WiFi"];

const FileUpload = ({ label, hint, file, onUpload, onRemove, multiple = false, files = [] }) => {
  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-semibold">{label}</Label>}
      
      {!multiple && !file && (
        <div 
          className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center bg-background/30 hover:bg-background/80 transition-colors cursor-pointer group"
          onClick={() => onUpload({ name: `uploaded_file_${Date.now()}.png` })}
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium">Click to upload or drag & drop</p>
          <p className="text-xs text-muted-foreground mt-1">{hint}</p>
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
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="text-rose-500 hover:bg-rose-500/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {multiple && (
        <div className="space-y-3">
          <div 
            className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center bg-background/30 hover:bg-background/80 transition-colors cursor-pointer group"
            onClick={() => onUpload({ name: `gallery_image_${Date.now()}.png` })}
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
                    <Button type="button" variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={() => onRemove(i)}>
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
  const { currentUser } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(2);
  const [completedSteps, setCompletedSteps] = useState([1]);
  
  const [status, setStatus] = useState("draft"); // draft, pending, approved, rejected, corrections
  const [adminFeedback, setAdminFeedback] = useState(null);

  const loadInitialState = () => {
    const saved = localStorage.getItem("ownerSetupForm");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      personal: { fullName: currentUser?.fullName || "John Owner", dob: "", gender: "", profilePhoto: null, address: "", city: "", state: "", pincode: "" },
      business: { businessName: "", ownerName: "", businessType: "", gst: "", tradeLicense: null, yearsInBusiness: "", email: "", phone: "" },
      identity: { aadhaarFront: null, aadhaarBack: null, panCard: null, selfie: null },
      turf: { name: "", sports: [], turfType: "", groundCount: "", groundSize: "", surfaceType: "", description: "" },
      location: { address: "", landmark: "", city: "", state: "", pincode: "", facilities: [] },
      images: { cover: null, gallery: [], promoVideo: null },
      pricing: { openingTime: "", closingTime: "", slotDuration: "", weekdayPrice: "", weekendPrice: "", holidayPrice: "", peakPrice: "", advanceBookingLimit: "", cancellationPolicy: "" },
      bank: { accountName: "", bankName: "", accountNumber: "", confirmAccountNumber: "", ifsc: "", upi: "", cancelledCheque: null }
    };
  };

  const [formData, setFormData] = useState(loadInitialState());

  useEffect(() => {
    localStorage.setItem("ownerSetupForm", JSON.stringify(formData));
  }, [formData]);

  const updateSection = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const toggleArrayItem = (section, field, value) => {
    setFormData(prev => {
      const arr = prev[section][field];
      const newArr = arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value];
      return { ...prev, [section]: { ...prev[section], [field]: newArr } };
    });
  };

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    setCurrentStep(prev => Math.min(prev + 1, 10));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 2));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setStatus("submitting");
    await new Promise(r => setTimeout(r, 2000));
    setStatus("pending");
    localStorage.removeItem("ownerSetupForm");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mock Admin Actions (for dev/demo purposes)
  const mockAdminAction = (action) => {
    if (action === "approve") {
      setStatus("approved");
      setTimeout(() => navigate("/owner-dashboard"), 1500);
    }
    if (action === "reject") {
      setStatus("rejected");
    }
    if (action === "corrections") {
      setStatus("corrections");
      setCurrentStep(4);
      setAdminFeedback({
        rejectedSteps: [4, 7],
        message: "Identity Verification documents are blurry. Please re-upload Aadhaar Front. Cover Image does not meet our quality guidelines."
      });
    }
  };

  // Render Status Screens
  if (status === "submitting") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
          <div className="h-16 w-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-2xl font-bold tracking-tight">Submitting Profile...</h2>
          <p className="text-muted-foreground">Please wait while we process your registration securely.</p>
        </motion.div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-md w-full border border-border/50 bg-card/65 backdrop-blur-2xl rounded-[32px] p-10">
          <div className="mx-auto h-20 w-20 rounded-full bg-amber-500/10 border-2 border-amber-500/20 flex items-center justify-center">
            <Clock className="h-10 w-10 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Pending Verification</h2>
            <p className="text-muted-foreground text-sm">Your turf owner profile has been submitted and is currently under review by our admin team. This usually takes 24-48 hours.</p>
          </div>
          <div className="pt-6 border-t border-border/50 flex flex-col gap-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Developer Mock Actions</p>
            <div className="flex gap-2 justify-center">
              <Button size="sm" variant="outline" className="text-emerald-500" onClick={() => mockAdminAction("approve")}>Approve</Button>
              <Button size="sm" variant="outline" className="text-rose-500" onClick={() => mockAdminAction("reject")}>Reject</Button>
              <Button size="sm" variant="outline" className="text-amber-500" onClick={() => mockAdminAction("corrections")}>Request Corrections</Button>
            </div>
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
            <p className="text-muted-foreground text-sm">Welcome to SportXClub! Redirecting you to your Owner Dashboard...</p>
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
          <Button onClick={() => { setStatus("draft"); setCurrentStep(2); }} className="w-full">Start New Application</Button>
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
      <div className="hidden md:flex flex-col w-72 lg:w-80 border-r border-border/50 bg-card/30 backdrop-blur-xl p-6 sticky top-0 h-screen overflow-y-auto z-10">
        <div className="mb-10">
          <Logo />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-tight mb-1">Onboarding Setup</h3>
          <p className="text-xs text-muted-foreground mb-6">Complete the steps below to list your turf.</p>
        </div>

        <div className="relative space-y-0 z-10">
          <div className="absolute top-4 bottom-4 left-[19px] w-[2px] bg-border/50 -z-10" />
          {STEPS.map((step, idx) => {
            const isCompleted = completedSteps.includes(step.id) || step.id === 1;
            const isCurrent = currentStep === step.id;
            const isFlagged = status === "corrections" && adminFeedback?.rejectedSteps?.includes(step.id);
            const StepIcon = step.icon;

            return (
              <div 
                key={step.id} 
                className={cn(
                  "flex items-center gap-4 py-4 cursor-pointer group transition-opacity",
                  !isCompleted && !isCurrent && status !== "corrections" ? "opacity-50 pointer-events-none" : "opacity-100",
                  isFlagged && "bg-rose-500/5 -mx-4 px-4 rounded-xl"
                )}
                onClick={() => {
                  if (isCompleted || status === "corrections") {
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
                    isCurrent ? "text-foreground" : "text-muted-foreground",
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
      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-y-auto pb-24">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-20">
          <Logo />
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
            Step {currentStep}/10
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

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">{STEPS.find(s => s.id === currentStep)?.title}</h1>
            <p className="text-muted-foreground">Provide accurate details to ensure quick verification and listing.</p>
          </div>

          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="border border-border/50 bg-card/40 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-sm mb-8"
          >
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <Label>Full Name (As per ID)</Label>
                  <Input value={formData.personal.fullName} onChange={(e) => updateSection('personal', 'fullName', e.target.value)} placeholder="John Doe" className="h-11 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label>Date of Birth</Label>
                    <Input type="date" value={formData.personal.dob} onChange={(e) => updateSection('personal', 'dob', e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Gender</Label>
                    <Select value={formData.personal.gender} onValueChange={(val) => updateSection('personal', 'gender', val)}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <FileUpload label="Profile Photo (Optional)" file={formData.personal.profilePhoto} onUpload={(f) => updateSection('personal', 'profilePhoto', f)} onRemove={() => updateSection('personal', 'profilePhoto', null)} />
                
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <h3 className="font-semibold text-sm">Residential Address</h3>
                  <div className="space-y-1.5">
                    <Label>Complete Address</Label>
                    <Textarea value={formData.personal.address} onChange={(e) => updateSection('personal', 'address', e.target.value)} placeholder="House/Flat No., Building Name, Street" className="rounded-xl min-h-[80px]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5"><Label>City</Label><Input value={formData.personal.city} onChange={(e) => updateSection('personal', 'city', e.target.value)} className="h-11 rounded-xl" /></div>
                    <div className="space-y-1.5"><Label>State</Label><Input value={formData.personal.state} onChange={(e) => updateSection('personal', 'state', e.target.value)} className="h-11 rounded-xl" /></div>
                    <div className="space-y-1.5"><Label>Pincode</Label><Input value={formData.personal.pincode} onChange={(e) => updateSection('personal', 'pincode', e.target.value)} className="h-11 rounded-xl" /></div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <Label>Business / Company Name</Label>
                  <Input value={formData.business.businessName} onChange={(e) => updateSection('business', 'businessName', e.target.value)} className="h-11 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label>Owner / Manager Name</Label>
                    <Input value={formData.business.ownerName} onChange={(e) => updateSection('business', 'ownerName', e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Business Type</Label>
                    <Select value={formData.business.businessType} onValueChange={(val) => updateSection('business', 'businessType', val)}>
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
                  <div className="space-y-1.5"><Label>GST Number (Optional)</Label><Input value={formData.business.gst} onChange={(e) => updateSection('business', 'gst', e.target.value)} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1.5"><Label>Years in Business</Label><Input type="number" value={formData.business.yearsInBusiness} onChange={(e) => updateSection('business', 'yearsInBusiness', e.target.value)} className="h-11 rounded-xl" /></div>
                </div>
                <FileUpload label="Trade License / Registration (Optional)" file={formData.business.tradeLicense} onUpload={(f) => updateSection('business', 'tradeLicense', f)} onRemove={() => updateSection('business', 'tradeLicense', null)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5"><Label>Business Email (Optional)</Label><Input type="email" value={formData.business.email} onChange={(e) => updateSection('business', 'email', e.target.value)} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1.5"><Label>Business Contact Number</Label><Input value={formData.business.phone} onChange={(e) => updateSection('business', 'phone', e.target.value)} className="h-11 rounded-xl" /></div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 text-sm">
                  <Shield className="h-5 w-5 text-primary shrink-0" />
                  <p>Your documents are securely encrypted and only used for verification purposes to ensure a trusted marketplace.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUpload label="Aadhaar Card (Front) *" file={formData.identity.aadhaarFront} onUpload={(f) => updateSection('identity', 'aadhaarFront', f)} onRemove={() => updateSection('identity', 'aadhaarFront', null)} />
                  <FileUpload label="Aadhaar Card (Back) *" file={formData.identity.aadhaarBack} onUpload={(f) => updateSection('identity', 'aadhaarBack', f)} onRemove={() => updateSection('identity', 'aadhaarBack', null)} />
                </div>
                <FileUpload label="PAN Card *" file={formData.identity.panCard} onUpload={(f) => updateSection('identity', 'panCard', f)} onRemove={() => updateSection('identity', 'panCard', null)} />
                <FileUpload label="Selfie with Aadhaar (Optional)" hint="Hold your Aadhaar card near your face" file={formData.identity.selfie} onUpload={(f) => updateSection('identity', 'selfie', f)} onRemove={() => updateSection('identity', 'selfie', null)} />
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <Label>Turf Name (Publicly Visible)</Label>
                  <Input value={formData.turf.name} onChange={(e) => updateSection('turf', 'name', e.target.value)} className="h-11 rounded-xl" placeholder="e.g. Skyline Sports Arena" />
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
                          formData.turf.sports.includes(sport) ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
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
                    <Select value={formData.turf.turfType} onValueChange={(val) => updateSection('turf', 'turfType', val)}>
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
                    <Input type="number" value={formData.turf.groundCount} onChange={(e) => updateSection('turf', 'groundCount', e.target.value)} className="h-11 rounded-xl" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5"><Label>Ground Size (e.g. 5v5, 100x50 ft)</Label><Input value={formData.turf.groundSize} onChange={(e) => updateSection('turf', 'groundSize', e.target.value)} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1.5"><Label>Surface Type</Label><Input placeholder="e.g. Artificial Grass, Hardwood" value={formData.turf.surfaceType} onChange={(e) => updateSection('turf', 'surfaceType', e.target.value)} className="h-11 rounded-xl" /></div>
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea value={formData.turf.description} onChange={(e) => updateSection('turf', 'description', e.target.value)} placeholder="Tell players what makes your turf special..." className="rounded-xl min-h-[120px]" />
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                <Button variant="outline" className="w-full h-12 rounded-xl bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 gap-2">
                  <Crosshair className="h-4 w-4" /> Detect Current Location
                </Button>
                <div className="h-48 w-full bg-muted rounded-xl border border-border flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=20.5937,78.9629&zoom=5&size=600x300&sensor=false')] bg-cover bg-center"></div>
                  <Button variant="secondary" className="relative z-10 shadow-lg">Open Google Maps Picker</Button>
                </div>
                
                <div className="space-y-1.5">
                  <Label>Full Address</Label>
                  <Textarea value={formData.location.address} onChange={(e) => updateSection('location', 'address', e.target.value)} className="rounded-xl" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5"><Label>Landmark</Label><Input value={formData.location.landmark} onChange={(e) => updateSection('location', 'landmark', e.target.value)} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1.5"><Label>Pincode</Label><Input value={formData.location.pincode} onChange={(e) => updateSection('location', 'pincode', e.target.value)} className="h-11 rounded-xl" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5"><Label>City</Label><Input value={formData.location.city} onChange={(e) => updateSection('location', 'city', e.target.value)} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1.5"><Label>State</Label><Input value={formData.location.state} onChange={(e) => updateSection('location', 'state', e.target.value)} className="h-11 rounded-xl" /></div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/50">
                  <Label>Facilities Available</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {FACILITIES.map(fac => {
                      const isSelected = formData.location.facilities.includes(fac);
                      return (
                        <div 
                          key={fac} 
                          className={cn(
                            "border rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-colors",
                            isSelected ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"
                          )}
                          onClick={() => toggleArrayItem('location', 'facilities', fac)}
                        >
                          <div className={cn("h-4 w-4 rounded border flex items-center justify-center shrink-0", isSelected ? "bg-primary border-primary" : "border-input")}>
                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <span className="text-sm font-medium">{fac}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-8">
                <FileUpload label="Cover Image (High Resolution) *" hint="This is the first image users will see. Make it count." file={formData.images.cover} onUpload={(f) => updateSection('images', 'cover', f)} onRemove={() => updateSection('images', 'cover', null)} />
                <FileUpload 
                  label="Gallery Images (Minimum 5)" 
                  hint="Add photos of the ground, seating, facilities, etc." 
                  multiple 
                  files={formData.images.gallery} 
                  onUpload={(f) => {
                    updateSection('images', 'gallery', [...formData.images.gallery, f]);
                  }} 
                  onRemove={(idx) => {
                    const newArr = [...formData.images.gallery];
                    newArr.splice(idx, 1);
                    updateSection('images', 'gallery', newArr);
                  }}
                />
                <FileUpload label="Promo Video (Optional)" hint="Upload a short walkthrough video (max 20MB)" file={formData.images.promoVideo} onUpload={(f) => updateSection('images', 'promoVideo', f)} onRemove={() => updateSection('images', 'promoVideo', null)} />
              </div>
            )}

            {currentStep === 8 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-1.5"><Label>Opening Time</Label><Input type="time" value={formData.pricing.openingTime} onChange={(e) => updateSection('pricing', 'openingTime', e.target.value)} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1.5"><Label>Closing Time</Label><Input type="time" value={formData.pricing.closingTime} onChange={(e) => updateSection('pricing', 'closingTime', e.target.value)} className="h-11 rounded-xl" /></div>
                  <div className="space-y-1.5">
                    <Label>Slot Duration</Label>
                    <Select value={formData.pricing.slotDuration} onValueChange={(val) => updateSection('pricing', 'slotDuration', val)}>
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
                        <Input type="number" placeholder="1200" value={formData.pricing.weekdayPrice} onChange={(e) => updateSection('pricing', 'weekdayPrice', e.target.value)} className="pl-9 h-11 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Weekend Price</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="1500" value={formData.pricing.weekendPrice} onChange={(e) => updateSection('pricing', 'weekendPrice', e.target.value)} className="pl-9 h-11 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Holiday Price (Optional)</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="1500" value={formData.pricing.holidayPrice} onChange={(e) => updateSection('pricing', 'holidayPrice', e.target.value)} className="pl-9 h-11 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Peak Hour Price (Optional)</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="1800" value={formData.pricing.peakPrice} onChange={(e) => updateSection('pricing', 'peakPrice', e.target.value)} className="pl-9 h-11 rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                  <div className="space-y-1.5">
                    <Label>Advance Booking Limit (Days)</Label>
                    <Input type="number" placeholder="e.g. 30" value={formData.pricing.advanceBookingLimit} onChange={(e) => updateSection('pricing', 'advanceBookingLimit', e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Cancellation Policy</Label>
                    <Select value={formData.pricing.cancellationPolicy} onValueChange={(val) => updateSection('pricing', 'cancellationPolicy', val)}>
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

            {currentStep === 9 && (
              <div className="space-y-6">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-sm">
                  <CreditCard className="h-5 w-5 text-amber-600 shrink-0" />
                  <p className="text-amber-700 dark:text-amber-400">Please ensure the bank details match your business or personal PAN card for seamless payouts.</p>
                </div>

                <div className="space-y-1.5">
                  <Label>Account Holder Name</Label>
                  <Input value={formData.bank.accountName} onChange={(e) => updateSection('bank', 'accountName', e.target.value)} className="h-11 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label>Bank Name</Label>
                    <Input value={formData.bank.bankName} onChange={(e) => updateSection('bank', 'bankName', e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>IFSC Code</Label>
                    <Input value={formData.bank.ifsc} onChange={(e) => updateSection('bank', 'ifsc', e.target.value)} className="h-11 rounded-xl uppercase" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label>Account Number</Label>
                    <Input type="password" value={formData.bank.accountNumber} onChange={(e) => updateSection('bank', 'accountNumber', e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Confirm Account Number</Label>
                    <Input type="text" value={formData.bank.confirmAccountNumber} onChange={(e) => updateSection('bank', 'confirmAccountNumber', e.target.value)} className="h-11 rounded-xl" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label>UPI ID (Optional)</Label>
                  <Input value={formData.bank.upi} onChange={(e) => updateSection('bank', 'upi', e.target.value)} placeholder="e.g. business@ybl" className="h-11 rounded-xl" />
                </div>

                <FileUpload label="Cancelled Cheque (Optional)" hint="Speeds up the verification process" file={formData.bank.cancelledCheque} onUpload={(f) => updateSection('bank', 'cancelledCheque', f)} onRemove={() => updateSection('bank', 'cancelledCheque', null)} />
              </div>
            )}

            {currentStep === 10 && (
              <div className="space-y-6">
                <div className="bg-muted/50 rounded-xl p-6 border border-border">
                  <h3 className="text-lg font-bold mb-4">Summary of Details</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between border-b border-border/50 pb-2 mb-2">
                        <span className="font-semibold text-sm">Business Info</span>
                        <Button variant="link" size="sm" onClick={() => setCurrentStep(3)} className="h-auto p-0">Edit</Button>
                      </div>
                      <div className="grid grid-cols-2 text-sm gap-2">
                        <p className="text-muted-foreground">Turf Name:</p><p className="font-medium text-right">{formData.turf.name || "-"}</p>
                        <p className="text-muted-foreground">Company:</p><p className="font-medium text-right">{formData.business.businessName || "-"}</p>
                        <p className="text-muted-foreground">Contact:</p><p className="font-medium text-right">{formData.business.phone || "-"}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between border-b border-border/50 pb-2 mb-2">
                        <span className="font-semibold text-sm">Location</span>
                        <Button variant="link" size="sm" onClick={() => setCurrentStep(6)} className="h-auto p-0">Edit</Button>
                      </div>
                      <div className="grid grid-cols-2 text-sm gap-2">
                        <p className="text-muted-foreground">City:</p><p className="font-medium text-right">{formData.location.city || "-"}</p>
                        <p className="text-muted-foreground">Facilities:</p><p className="font-medium text-right">{formData.location.facilities.length} selected</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-xl border border-primary/20">
                  <Checkbox id="terms" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="terms" className="text-sm font-medium leading-none">I agree to the Terms & Conditions</Label>
                    <p className="text-xs text-muted-foreground">By submitting, you confirm that all provided information is accurate and you authorize SportXClub to verify these details.</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Bottom Fixed Navigation Bar */}
          <div className="fixed bottom-0 left-0 right-0 md:left-72 lg:left-80 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50 flex justify-between items-center z-20">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={currentStep === 2}
              className="rounded-full px-6"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            
            {currentStep < 10 ? (
              <Button 
                onClick={handleNext} 
                className="rounded-full px-8 shadow-lg shadow-primary/20"
              >
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                className="rounded-full px-8 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
              >
                Submit Profile <Check className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
