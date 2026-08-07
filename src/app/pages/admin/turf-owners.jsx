import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Plus, Trash2, Edit, RefreshCw } from "lucide-react";
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

export function AdminTurfOwners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "Mumbai",
    status: "Active",
    total_turfs: 1,
    earnings: "₹0",
  });

  const loadOwners = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAll("turf-owners");
      setOwners(data);
    } catch (err) {
      console.warn("Failed loading turf owners from MySQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwners();
  }, []);

  const handleCreateOwner = async (e) => {
    e.preventDefault();
    try {
      const newOwner = await adminApi.create("turf-owners", {
        ...formData,
        joined_date: new Date().toISOString().split("T")[0],
      });
      setOwners([newOwner, ...owners]);
      setIsAddOpen(false);
      setFormData({ name: "", email: "", phone: "", city: "Mumbai", status: "Active", total_turfs: 1, earnings: "₹0" });
    } catch (err) {
      alert("Error adding turf owner: " + err.message);
    }
  };

  const handleStatusChange = async (ownerId, newStatus) => {
    try {
      const updated = await adminApi.update("turf-owners", ownerId, { status: newStatus });
      setOwners(owners.map((o) => (o.id === ownerId ? updated : o)));
    } catch (err) {
      alert("Error changing status: " + err.message);
    }
  };

  const handleDeleteOwner = async (ownerId) => {
    if (!window.confirm("Are you sure you want to delete this owner from MySQL?")) return;
    try {
      await adminApi.delete("turf-owners", ownerId);
      setOwners(owners.filter((o) => o.id !== ownerId));
    } catch (err) {
      alert("Error deleting owner: " + err.message);
    }
  };

  const filteredOwners = owners.filter(
    (o) =>
      o.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Turf Owners</h1>
          <p className="text-muted-foreground">Manage venue partners dynamically in MySQL (`turf_owners` table).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadOwners} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Partner
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Partner Directory ({filteredOwners.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search owner, email..."
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
                  <TableHead>Owner Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Total Turfs</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading partners from MySQL...
                    </TableCell>
                  </TableRow>
                ) : filteredOwners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No partners found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOwners.map((owner) => (
                    <TableRow key={owner.id}>
                      <TableCell className="font-medium">{owner.name}</TableCell>
                      <TableCell>
                        <div className="text-foreground">{owner.email}</div>
                        <div className="text-xs text-muted-foreground">{owner.phone || "-"}</div>
                      </TableCell>
                      <TableCell>{owner.city || "Mumbai"}</TableCell>
                      <TableCell><Badge variant="outline">{owner.total_turfs ?? owner.venues ?? 1} Venues</Badge></TableCell>
                      <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">{owner.earnings || "₹0"}</TableCell>
                      <TableCell>
                        <Select value={owner.status} onValueChange={(val) => handleStatusChange(owner.id, val)}>
                          <SelectTrigger className={`w-[140px] h-8 text-xs border ${
                            owner.status === "Active" || owner.status === "Verified"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : owner.status === "Pending Approval"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                            <SelectItem value="Suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteOwner(owner.id)}>
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

      {/* Add Partner Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Turf Owner Partner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOwner} className="space-y-4 py-2">
            <div>
              <Label>Owner Name</Label>
              <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Rajesh Mehta" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="rajesh@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 9820012345" />
              </div>
              <div>
                <Label>City</Label>
                <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Mumbai" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Add Partner</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
