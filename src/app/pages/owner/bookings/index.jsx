import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Loader2,
  AlertCircle,
  Search,
  Calendar,
  Clock,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
} from "lucide-react";
import { bookingService } from "../../../services/booking.service";

const OWNER_ID = "owner-123";

export function BookingsList() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        // Uses the real backend integration method
        const result = await bookingService.getAll(OWNER_ID);
        setData(result);
      } catch (err) {
        setError(
          "Backend API is not yet available. Please implement the GET /api/owner/booking endpoint.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      // Optimistic update
      setData((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)),
      );
      // Real API call
      await bookingService.update(OWNER_ID, bookingId, { status: newStatus });
    } catch (err) {
      // Revert if API fails
      console.error("Failed to update status");
      // Could re-fetch or revert local state here
    }
  };

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
        <p className="text-lg text-foreground">Failed to Load Bookings</p>
        <p className="text-sm max-w-md text-center">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const filteredData = data.filter((booking) => {
    const searchLower = searchQuery.toLowerCase();
    
    // Create a comprehensive date string for searching (e.g., matching "October" or "2023")
    let dateSearchStr = booking.date?.toLowerCase() || "";
    try {
      if (booking.date) {
        const d = new Date(booking.date);
        if (!isNaN(d.getTime())) {
          const monthLong = d.toLocaleString('en-US', { month: 'long' }).toLowerCase();
          const monthShort = d.toLocaleString('en-US', { month: 'short' }).toLowerCase();
          dateSearchStr += ` ${monthLong} ${monthShort} ${d.getFullYear()}`;
        }
      }
    } catch(e) {}

    const matchesSearch =
      booking.id?.toLowerCase().includes(searchLower) ||
      booking.customerName?.toLowerCase().includes(searchLower) ||
      booking.turfName?.toLowerCase().includes(searchLower) ||
      dateSearchStr.includes(searchLower);

    if (activeTab === "all") return matchesSearch;
    return (
      matchesSearch && booking.status.toLowerCase() === activeTab.toLowerCase()
    );
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400";
      case "pending":
        return "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400";
      case "completed":
        return "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400";
      case "cancelled":
        return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl tracking-tight">Booking Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all venue bookings
          </p>
        </div>

      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full sm:w-auto overflow-x-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID or customer..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mb-4 text-muted" />
            <h3 className="text-lg text-foreground">No bookings found</h3>
            <p className="mt-1">No bookings match the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Turf & Sport</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredData.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">{booking.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="">{booking.customerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {booking.customerPhone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="">{booking.turfName}</div>
                        <div className="text-xs text-muted-foreground">
                          {booking.sportType}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {booking.date}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          {booking.time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="">₹{booking.amount}</div>
                      <div className="text-xs text-muted-foreground">
                        {booking.paymentStatus}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`border-0 ${getStatusColor(booking.status)}`}
                      >
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              to={`/owner-dashboard/bookings/${booking.id}`}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>

                          {booking.status?.toLowerCase() === "pending" && (
                            <>
                              <DropdownMenuItem
                                className="gap-2 text-green-600 dark:text-green-400"
                                onClick={() =>
                                  handleStatusChange(booking.id, "Confirmed")
                                }
                              >
                                <CheckCircle className="h-4 w-4" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-destructive"
                                onClick={() =>
                                  handleStatusChange(booking.id, "Cancelled")
                                }
                              >
                                <XCircle className="h-4 w-4" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}

                          {booking.status?.toLowerCase() === "confirmed" && (
                            <DropdownMenuItem
                              className="gap-2 text-destructive"
                              onClick={() =>
                                handleStatusChange(booking.id, "Cancelled")
                              }
                            >
                              <XCircle className="h-4 w-4" /> Cancel Booking
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
