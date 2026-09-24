import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Loader2,
  AlertCircle,
  Users,
  Search,
  Download,
  Calendar,
  IndianRupee,
  Phone,
  Mail,
  MapPin,
  Trophy,
  History,
  CheckCircle2,
  RefreshCw,
  Clock,
  Sparkles,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../providers/auth-provider";
import { customerService } from "../../services/customer.service";
import { cn } from "../../components/ui/utils";

export function CustomersList() {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const ownerEmail = currentUser?.email || "";
      const result = await customerService.getOwnerCustomers(ownerEmail);
      setCustomers(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Failed to load customer records from database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentUser]);

  // Filtered list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        String(c.name || "").toLowerCase().includes(q) ||
        String(c.email || "").toLowerCase().includes(q) ||
        String(c.phone || "").toLowerCase().includes(q) ||
        String(c.lastBookingVenue || "").toLowerCase().includes(q);

      const matchesSport =
        sportFilter === "all" ||
        String(c.favoriteSport || "").toLowerCase() === sportFilter.toLowerCase();

      const matchesTier =
        tierFilter === "all" ||
        String(c.tier || "").toLowerCase().includes(tierFilter.toLowerCase());

      return matchesSearch && matchesSport && matchesTier;
    });
  }, [customers, searchQuery, sportFilter, tierFilter]);

  // Overall Metrics
  const stats = useMemo(() => {
    const totalCount = customers.length;
    const totalBookings = customers.reduce((sum, c) => sum + (c.totalBookings || 0), 0);
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const vipCount = customers.filter((c) => c.tier === "VIP Regular").length;
    return { totalCount, totalBookings, totalRevenue, vipCount };
  }, [customers]);

  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      toast.error("No customer records to export.");
      return;
    }

    const headers = ["Name", "Email", "Phone", "City", "Favorite Sport", "Total Bookings", "Total Spent (INR)", "Tier", "Last Booking Date", "Last Venue"];
    const rows = filteredCustomers.map((c) => [
      `"${c.name || ""}"`,
      `"${c.email || ""}"`,
      `"${c.phone || ""}"`,
      `"${c.city || ""}"`,
      `"${c.favoriteSport || ""}"`,
      c.totalBookings || 0,
      c.totalSpent || 0,
      `"${c.tier || ""}"`,
      `"${c.lastBookingDate || ""}"`,
      `"${c.lastBookingVenue || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customers_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Customer list exported successfully!");
  };

  const getInitials = (name) => {
    if (!name) return "PL";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex h-[450px] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">Loading Customer Insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center text-destructive space-y-4">
        <AlertCircle className="h-12 w-12" />
        <p className="text-lg font-bold text-foreground">{error}</p>
        <Button variant="outline" onClick={fetchCustomers}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-[1440px] mx-auto pb-16 px-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="h-7 w-7 text-emerald-500" />
            Customer Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Player profiles, lifetime bookings, spend history, and CRM analytics.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchCustomers} className="gap-2 cursor-pointer">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button
            onClick={handleExportCSV}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer rounded-xl shadow-xs"
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/50 bg-card/60 backdrop-blur-md shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Players</p>
              <p className="text-2xl font-black text-foreground">{stats.totalCount}</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Active venue clientele</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/60 backdrop-blur-md shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Bookings</p>
              <p className="text-2xl font-black text-foreground">{stats.totalBookings}</p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Completed reservations</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Calendar className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/60 backdrop-blur-md shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lifetime Spend</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center">
                <IndianRupee className="h-5 w-5" />
                {stats.totalRevenue.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-muted-foreground font-semibold">Gross customer revenue</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <IndianRupee className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/60 backdrop-blur-md shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">VIP Regulars</p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.vipCount}</p>
              <p className="text-[11px] text-amber-600/80 font-semibold">5+ booking regulars</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Award className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border border-border/50 bg-card/40 backdrop-blur-md shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by player name, phone, email, or turf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/80 rounded-xl"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-background/80 rounded-xl">
                <SelectValue placeholder="Sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                <SelectItem value="Football">Football</SelectItem>
                <SelectItem value="Cricket">Cricket</SelectItem>
                <SelectItem value="Tennis">Tennis</SelectItem>
                <SelectItem value="Badminton">Badminton</SelectItem>
                <SelectItem value="Basketball">Basketball</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-background/80 rounded-xl">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="vip">VIP Regulars</SelectItem>
                <SelectItem value="returning">Returning</SelectItem>
                <SelectItem value="new">New Players</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || sportFilter !== "all" || tierFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSportFilter("all");
                  setTierFilter("all");
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer List Table */}
      <Card className="border border-border/50 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="p-5 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-foreground">Registered Customers & Players</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Showing {filteredCustomers.length} of {customers.length} customer records
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center text-muted-foreground space-y-3">
              <Users className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-base font-bold text-foreground">No customer records found</p>
              <p className="text-xs max-w-sm">No customers matched your current search filters or queries.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 border-b border-border/40 text-xs uppercase font-extrabold text-muted-foreground tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Customer Profile</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Preferred Sport</th>
                    <th className="py-3.5 px-4 text-center">Total Bookings</th>
                    <th className="py-3.5 px-4 text-right">Lifetime Spend</th>
                    <th className="py-3.5 px-4">Last Played</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredCustomers.map((cust) => (
                    <tr
                      key={cust.id}
                      className="hover:bg-muted/30 transition-colors duration-150 group"
                    >
                      {/* Customer Profile */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-border/50">
                            <AvatarImage src={cust.avatar} alt={cust.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                              {getInitials(cust.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-extrabold text-foreground group-hover:text-emerald-500 transition-colors">
                              {cust.name}
                            </p>
                            <Badge
                              className={cn(
                                "text-[9px] font-bold px-1.5 py-0 rounded mt-0.5 border",
                                cust.tier === "VIP Regular"
                                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                  : cust.tier === "Returning"
                                  ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                  : "bg-muted text-muted-foreground border-border/50"
                              )}
                            >
                              {cust.tier}
                            </Badge>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-foreground/90 font-medium">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[180px]">{cust.email || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{cust.phone || "N/A"}</span>
                        </div>
                      </td>

                      {/* Sport */}
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="text-xs font-semibold gap-1 py-0.5 px-2">
                          <Trophy className="h-3 w-3 text-emerald-500" />
                          {cust.favoriteSport || "Football"}
                        </Badge>
                      </td>

                      {/* Bookings */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-black text-sm text-foreground bg-muted/50 px-2.5 py-1 rounded-lg">
                          {cust.totalBookings}
                        </span>
                      </td>

                      {/* Lifetime Spend */}
                      <td className="py-4 px-4 text-right">
                        <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                          ₹{Number(cust.totalSpent || 0).toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Last Played */}
                      <td className="py-4 px-4 text-xs">
                        <p className="font-bold text-foreground">{cust.lastBookingDate || "Recent"}</p>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                          {cust.lastBookingVenue || "Turf Ground"}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setIsHistoryModalOpen(true);
                          }}
                          className="h-8 text-xs font-bold gap-1.5 rounded-lg border-border/60 hover:bg-emerald-500/10 hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
                        >
                          <History className="h-3.5 w-3.5" /> History
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Booking History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-500" />
              Booking History: {selectedCustomer?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              All reservation sessions made by {selectedCustomer?.email || selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Customer Summary banner */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-muted-foreground text-[10px] uppercase font-bold">Total Sessions</p>
                <p className="text-base font-black text-foreground">{selectedCustomer?.totalBookings || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase font-bold">Total Paid</p>
                <p className="text-base font-black text-emerald-500">₹{(selectedCustomer?.totalSpent || 0).toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase font-bold">Preferred Sport</p>
                <p className="text-base font-black text-foreground">{selectedCustomer?.favoriteSport || "Football"}</p>
              </div>
            </div>

            {/* List of bookings */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Session Log</h4>
              {selectedCustomer?.bookingHistory && selectedCustomer.bookingHistory.length > 0 ? (
                selectedCustomer.bookingHistory.map((b, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-border/40 bg-card/60 flex items-center justify-between text-xs hover:border-emerald-500/30 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-foreground">{b.turfName || "Turf"}</span>
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {b.sport || "Sport"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {b.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {b.timeSlot || "Slot"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="font-black text-sm text-emerald-500">₹{b.amount || 0}</p>
                      <Badge
                        className={cn(
                          "text-[9px] font-bold px-1.5 py-0 rounded",
                          b.status === "Confirmed" || b.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        )}
                      >
                        {b.status || "Confirmed"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground text-xs">
                  No individual booking records found for this player.
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsHistoryModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
