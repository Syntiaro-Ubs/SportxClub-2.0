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
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { ArrowLeft, Upload, Save, Send, Loader2 } from "lucide-react";
import { turfService } from "../../../services/turf.service";

const OWNER_ID = "owner-123";

const AMENITIES = [
  "Parking",
  "Washroom",
  "Changing Room",
  "Drinking Water",
  "Floodlights",
  "Equipment Rent",
  "First Aid",
  "Cafe",
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
      amenities: [],
      rules: "",
      status: "Published",
    },
  });

  const selectedAmenities = watch("amenities");

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await turfService.create(OWNER_ID, data);
      navigate("/owner-dashboard/turfs");
    } catch (err) {
      setError(
        err.message || "Failed to create turf. Backend API not available.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmenityChange = (amenity, checked) => {
    if (checked) {
      setValue("amenities", [...selectedAmenities, amenity]);
    } else {
      setValue(
        "amenities",
        selectedAmenities.filter((a) => a !== amenity),
      );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link to="/owner-dashboard/turfs">
          <Button variant="outline" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl tracking-tight">Add New Turf</h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details to list your sports venue
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50">
            <TabsTrigger value="basic" className="py-2.5">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="details" className="py-2.5">
              Details & Rules
            </TabsTrigger>
            <TabsTrigger value="pricing" className="py-2.5">
              Pricing & Hours
            </TabsTrigger>
            <TabsTrigger value="media" className="py-2.5">
              Photos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  The core details about your turf.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Turf Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Green Arena"
                    {...register("name", { required: true })}
                  />
                  {errors.name && (
                    <span className="text-xs text-destructive">
                      This field is required
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sportType">Primary Sport Category *</Label>
                  <Select onValueChange={(val) => setValue("sportType", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPORTS.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your turf, its quality, and surroundings..."
                    className="min-h-[120px]"
                    {...register("description", { required: true })}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number *</Label>
                    <Input
                      id="contactNumber"
                      type="tel"
                      placeholder="+91 9876543210"
                      {...register("contactNumber", { required: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Business Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@greenarena.com"
                      {...register("email")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="button" onClick={() => setActiveTab("details")}>
                Next Step
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-6 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Full Address *</Label>
                  <Input
                    id="location"
                    placeholder="Street, City, State, ZIP"
                    {...register("location", { required: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coordinates">
                    Google Maps Link / Coordinates
                  </Label>
                  <Input
                    id="coordinates"
                    placeholder="https://maps.google.com/..."
                    {...register("coordinates")}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
                <CardDescription>Select all that apply</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={(checked) =>
                          handleAmenityChange(amenity, checked)
                        }
                      />

                      <label
                        htmlFor={`amenity-${amenity}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Rules & Regulations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Textarea
                  id="rules"
                  placeholder="e.g., Non-marking shoes only. No smoking..."
                  className="min-h-[100px]"
                  {...register("rules")}
                />
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("basic")}
              >
                Previous
              </Button>
              <Button type="button" onClick={() => setActiveTab("pricing")}>
                Next Step
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="mt-6 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>Set your standard hourly rate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-w-xs">
                  <Label htmlFor="price">Price per Hour (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="800"
                    {...register("price", { required: true })}
                  />
                </div>
                {/* Advanced pricing would go here */}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  You can configure detailed time slots and availability blocks
                  from the Time Slot Management page after creating the turf.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 max-w-lg">
                  <div className="space-y-2">
                    <Label>Opening Time</Label>
                    <Input type="time" defaultValue="06:00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Closing Time</Label>
                    <Input type="time" defaultValue="23:00" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("details")}
              >
                Previous
              </Button>
              <Button type="button" onClick={() => setActiveTab("media")}>
                Next Step
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="media" className="mt-6 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Photos</CardTitle>
                <CardDescription>
                  Upload high-quality images of your turf
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                  <div className="p-4 rounded-full bg-primary/10 text-primary mb-2">
                    <Upload className="h-8 w-8" />
                  </div>
                  <h3 className=" text-lg">Click to upload photos</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Support for JPG, PNG. Max file size 5MB.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("pricing")}
              >
                Previous
              </Button>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="outline"
                  onClick={() => setValue("status", "Draft")}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" /> Save as Draft
                </Button>
                <Button
                  type="submit"
                  onClick={() => setValue("status", "Published")}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Publish Turf
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
