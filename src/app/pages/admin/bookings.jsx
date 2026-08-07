import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Plus, Trash2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
  DialogFooter,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { adminApi } from "../../services/admin-api";

export function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    booking_code: "BK-" + Math.floor(1000 + Math.random() * 9000),
    user_name: "",
    user_email: "",
    turf_name: "",
    date: new Date().toISOString().split("T")[0],
    time_slot: "06:00 PM - 07:00 PM",
    amount: 1500,
    status: "Confirmed",
    payment_method: "UPI",
  });

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAll("bookings");
      setBookings(data);
    } catch (err) {
      console.warn("Failed loading bookings from MySQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      const newBk = await adminApi.create("bookings", formData);
      setBookings([newBk, ...bookings]);
      setIsAddOpen(false);
      setFormData({
        booking_code: "BK-" + Math.floor(1000 + Math.random() * 9000),
        user_name: "",
        user_email: "",
        turf_name: "",
        date: new Date().toISOString().split("T")[0],
        time_slot: "06:00 PM - 07:00 PM",
        amount: 1500,
        status: "Confirmed",
        payment_method: "UPI",
      });
    } catch (err) {
      alert("Error adding booking: " + err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await adminApi.update("bookings", id, { status: newStatus });
      setBookings(bookings.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      alert("Error updating booking status: " + err.message);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking from MySQL?")) return;
    try {
      await adminApi.delete("bookings", id);
      setBookings(bookings.filter((b) => b.id !== id));
    } catch (err) {
      alert("Error deleting booking: " + err.message);
    }
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.booking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.turf_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
          <p className="text-muted-foreground">Manage platform booking records dynamically in MySQL (`bookings` table).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadBookings} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Booking
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Bookings Directory ({filteredBookings.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search booking ID, user, turf..."
                className="pl-9 bg-muted/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Booking Code</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Turf Name</TableHead>
                  <TableHead>Slot / Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading bookings from MySQL...
                    </TableCell>
                  </TableRow>
                ) : filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No bookings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((bk) => (
                    <TableRow key={bk.id}>
                      <TableCell className="font-semibold text-primary">#{bk.booking_code || bk.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{bk.user_name}</div>
                        <div className="text-xs text-muted-foreground">{bk.user_email || ""}</div>
                      </TableCell>
                      <TableCell>{bk.turf_name}</TableCell>
                      <TableCell>
                        <div className="text-xs">{bk.date}</div>
                        <div className="text-xs text-muted-foreground">{bk.time_slot}</div>
                      </TableCell>
                      <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{bk.amount}
                      </TableCell>
                      <TableCell>
                        <Select value={bk.status} onValueChange={(val) => handleStatusChange(bk.id, val)}>
                          <SelectTrigger className={`w-[130px] h-8 text-xs border ${
                            bk.status === "Confirmed"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : bk.status === "Pending"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Confirmed">Confirmed</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteBooking(bk.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Booking Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Booking</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBooking} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>User Name</Label>
                <Input required value={formData.user_name} onChange={(e) => setFormData({ ...formData, user_name: e.target.value })} placeholder="Rahul Sharma" />
              </div>
              <div>
                <Label>User Email</Label>
                <Input type="email" value={formData.user_email} onChange={(e) => setFormData({ ...formData, user_email: e.target.value })} placeholder="rahul@example.com" />
              </div>
            </div>
            <div>
              <Label>Turf Name</Label>
              <Input required value={formData.turf_name} onChange={(e) => setFormData({ ...formData, turf_name: e.target.value })} placeholder="Green Turf Arena" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div>
                <Label>Time Slot</Label>
                <Input value={formData.time_slot} onChange={(e) => setFormData({ ...formData, time_slot: e.target.value })} placeholder="06:00 PM - 07:00 PM" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount (₹)</Label>
                <Input type="number" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select value={formData.payment_method} onValueChange={(val) => setFormData({ ...formData, payment_method: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Net Banking">Net Banking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Create Booking</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
