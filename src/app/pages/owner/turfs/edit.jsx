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
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
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
        const result = await turfService.getById(OWNER_ID, id);
        reset(result);
      } catch (err) {
        setError(
          "Backend API is not yet available. Could not load turf details.",
        );
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
      // Update only changed fields in a real app, passing whole data here
      await turfService.update(OWNER_ID, id, data);
      navigate("/owner-dashboard/turfs");
    } catch (err) {
      setError(
        err.message || "Failed to update turf. Backend API not available.",
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

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !watch("name")) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center text-muted-foreground space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-foreground">Failed to Load</p>
        <p className="text-sm max-w-md text-center">{error}</p>
        <Link to="/owner-dashboard/turfs">
          <Button variant="outline">Go Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/owner-dashboard/turfs">
            <Button variant="outline" size="icon" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl tracking-tight">Edit Turf</h1>
            <p className="text-muted-foreground mt-1">
              Update details for your turf
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50">
            <TabsTrigger value="basic" className="py-2.5">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="details" className="py-2.5">
              Details
            </TabsTrigger>
            <TabsTrigger value="pricing" className="py-2.5">
              Pricing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Turf Name</Label>
                  <Input id="name" {...register("name", { required: true })} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sportType">Primary Sport</Label>
                  <Select
                    value={watch("sportType")}
                    onValueChange={(val) => setValue("sportType", val)}
                  >
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-6 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
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
                        className="text-sm leading-none"
                      >
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="mt-6 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-w-xs">
                  <Label htmlFor="price">Price per Hour (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register("price", { required: true })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end border-t border-border/50 pt-6">
          <Button type="submit" disabled={isSubmitting} className="gap-2 px-8">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
