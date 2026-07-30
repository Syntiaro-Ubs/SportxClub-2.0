import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import {
  Loader2,
  AlertCircle,
  Plus,
  Search,
  MapPin,
  Star,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  PowerOff,
  IndianRupee,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { turfService } from "../../../services/turf.service";
import { useAuth } from "../../../providers/auth-provider";

const DEMO_TURFS = [
  {
    id: "turf-1",
    name: "Main Arena A",
    location: "Downtown Sports Complex",
    status: "Active",
    rating: 4.8,
    sportType: "Football",
    price: 1500,
    image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "turf-2",
    name: "Indoor Turf B",
    location: "Westside Stadium",
    status: "Active",
    rating: 4.5,
    sportType: "Cricket",
    price: 1200,
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "turf-3",
    name: "Court 1 (Clay)",
    location: "Elite Tennis Club",
    status: "Maintenance",
    rating: 4.9,
    sportType: "Tennis",
    price: 800,
    image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600&auto=format&fit=crop"
  }
];

export function TurfList() {
  const { currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        setIsLoading(true);
        const savedMockTurfs = JSON.parse(localStorage.getItem("mock_turfs") || "[]");
        const approvedTurfs = JSON.parse(localStorage.getItem("approved_turfs") || "[]");

        let baseData = DEMO_TURFS;
        try {
          const ownerId = currentUser?.id || "guest";
          const result = await turfService.getAll(ownerId);
          if (result && result.length > 0) {
            baseData = result;
          }
        } catch (err) {
          console.log("Using cached/local turfs for owner turfs list");
        }

        // Merge any updated turf details from localStorage
        const allSaved = [...savedMockTurfs, ...approvedTurfs];
        const mergedData = baseData.map(item => {
          const match = allSaved.find(s => String(s.id) === String(item.id));
          return match ? { ...item, ...match } : item;
        });

        // Add any new local turfs that aren't in baseData
        allSaved.forEach(s => {
          if (!mergedData.some(m => String(m.id) === String(s.id))) {
            mergedData.push(s);
          }
        });

        setData(mergedData);
      } catch (err) {
        setData(DEMO_TURFS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTurfs();

    const handleUpdate = () => fetchTurfs();
    window.addEventListener("turf_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("turf_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center text-muted-foreground space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-foreground">Failed to Load Turfs</p>
        <p className="text-sm max-w-md text-center">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const filteredData = data.filter(
    (turf) => {
      const loc = turf.location;
      const locStr = typeof loc === 'object' ? (loc?.address || loc?.city || loc?.landmark || '') : (loc || '');
      const nameStr = turf.name || '';
      const queryStr = searchQuery || '';
      return nameStr.toLowerCase().includes(queryStr.toLowerCase()) ||
        locStr.toLowerCase().includes(queryStr.toLowerCase());
    }
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-end items-center">
        <Link to="/owner-dashboard/turfs/add">
          <Button
            variant="outline"
            className="gap-2 border border-slate-300 dark:border-slate-700 text-foreground hover:bg-transparent hover:border-emerald-500 transition-colors font-bold cursor-pointer rounded-full px-5"
          >
            <Plus className="h-4 w-4 text-emerald-500" />
            Add New Turf
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
          <Input
            placeholder="Search by name or location..."
            className="pl-9 rounded-full border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-xs transition-all bg-background/60"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold px-5 cursor-pointer transition-all">Filter</Button>
      </div>

      {filteredData.length === 0 ? (
        <Card className="border-border/50 bg-card/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg">No turfs found</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              {searchQuery
                ? "No turfs match your search criteria."
                : "You haven't added any turfs yet."}
            </p>
            {!searchQuery && (
              <Link to="/owner-dashboard/turfs/add">
                <Button variant="outline">Add Your First Turf</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredData.map((turf) => (
            <Card
              key={turf.id}
              className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm group hover:border-primary/50 transition-colors"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                {turf.image ? (
                  <img
                    src={turf.image}
                    alt={turf.name}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className=" text-lg line-clamp-1">{turf.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {typeof turf.location === 'object' ? (turf.location?.city || turf.location?.address || 'Location unavailable') : turf.location}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mr-2"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Eye className="h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" asChild>
                        <Link to={`/owner-dashboard/turfs/${turf.id}/edit`}>
                          <Edit className="h-4 w-4" /> Edit Turf
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <PowerOff className="h-4 w-4" /> Disable
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="">{turf.rating}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-muted-foreground">
                    {turf.sportType}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                  <span className="flex items-center">
                    <IndianRupee className="w-4 h-4 mr-0.5" />
                    {turf.price}
                    <span className="text-sm font-normal text-muted-foreground ml-0.5">
                      /hr
                    </span>
                  </span>
                  <Link to={`/owner-dashboard/turfs/${turf.id}/edit`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-emerald-500/50 text-foreground hover:bg-emerald-500/10 hover:border-emerald-500 transition-colors font-bold rounded-xl"
                    >
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
