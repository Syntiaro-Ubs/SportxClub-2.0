import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Loader2,
  AlertCircle,
  Plus,
  MapPin,
  Star,
  MoreVertical,
  Eye,
  Trash2,
  IndianRupee,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { turfService } from "../../../services/turf.service";

export function TurfList() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTurfs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const turfs = await turfService.getAll();
      setData(turfs || []);
    } catch (err) {
      console.error("Error loading turfs from MySQL backend:", err);
      setError("Failed to fetch turfs from MySQL database server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTurfs();
  }, []);

  const handleDeleteTurf = async (turfId) => {
    if (!window.confirm("Are you sure you want to delete this turf venue from MySQL?")) return;
    try {
      await turfService.delete(null, turfId);
      setData(data.filter((item) => String(item.id) !== String(turfId)));
    } catch (err) {
      alert("Failed to delete turf: " + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Fetching turfs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center text-muted-foreground space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-foreground">Failed to Load Turfs</p>
        <p className="text-sm max-w-md text-center">{error}</p>
        <Button variant="outline" onClick={loadTurfs}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Venues</h1>
          <p className="text-muted-foreground">Showing backend MySQL venue records (`sportxclub` database).</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadTurfs} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Link to="/admin-panel/turfs/add" className="shrink-0">
            <Button
              variant="outline"
              className="gap-2 border border-slate-300 dark:border-slate-700 text-foreground hover:bg-transparent hover:border-emerald-500 transition-colors font-bold cursor-pointer rounded-full px-5 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 text-emerald-500" />
              Add New Turf
            </Button>
          </Link>
        </div>
      </div>

      {data.length === 0 ? (
        <Card className="border-border/50 bg-card/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-bold">No turfs in database</h3>
            <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
              There are currently no turfs saved in your MySQL database. Click below to add a new turf venue.
            </p>
            <Link to="/admin-panel/turfs/add">
              <Button className="cursor-pointer gap-2 font-semibold">
                <Plus className="h-4 w-4" /> Add Your First Turf
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((turf) => {
            const price = turf.price_per_hour || turf.price || 0;
            const sport = turf.sport_type || turf.sportType || "Football";
            const image = turf.image_url || turf.image || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600";
            const status = turf.status || "Active";
            const rating = turf.rating || 4.5;
            const locationStr = typeof turf.location === "object" ? (turf.location?.city || turf.location?.address || "Location unavailable") : turf.location;

            return (
              <Card
                key={turf.id}
                className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm group hover:border-primary/50 transition-colors shadow-sm"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                  <img
                    src={image}
                    alt={turf.name}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-extrabold line-clamp-1 text-foreground">{turf.name}</h3>
                        <Badge
                          className={`text-[9px] uppercase tracking-wider font-extrabold rounded-md px-2 py-0.5 ${
                            status === "Active"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        {locationStr}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 -mr-2 rounded-xl cursor-pointer hover:bg-muted"
                        >
                          <MoreVertical className="h-4 w-4 text-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-2xl p-1.5 shadow-xl border-slate-300 dark:border-slate-700">
                        <DropdownMenuItem className="gap-2 cursor-pointer font-semibold rounded-xl focus:bg-muted/60 focus:text-foreground hover:bg-muted/60 text-foreground" asChild>
                          <Link to={`/venues/${turf.id}`} state={{ venue: turf }}>
                            <Eye className="h-4 w-4 text-emerald-500" /> View Details
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-1 border-t border-slate-200 dark:border-slate-800" />

                        <DropdownMenuItem
                          onClick={() => handleDeleteTurf(turf.id)}
                          className="gap-2 cursor-pointer font-semibold rounded-xl text-rose-500 focus:text-rose-500 focus:bg-rose-500/10 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-4 w-4 text-rose-500" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{rating}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-muted-foreground font-medium">{sport}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                    <span className="flex items-center font-bold text-foreground">
                      <IndianRupee className="w-4 h-4 mr-0.5 text-emerald-500 stroke-[2.5]" />
                      {price}
                      <span className="text-sm font-normal text-muted-foreground ml-0.5">/hr</span>
                    </span>
                    <Link to={`/admin-panel/turfs/${turf.id}/edit`}>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
