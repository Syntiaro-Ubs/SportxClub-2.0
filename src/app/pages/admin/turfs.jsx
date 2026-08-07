import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Plus, Trash2, Edit, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { adminApi } from "../../services/admin-api";

export function AdminTurfs() {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTurf, setEditingTurf] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    sport_type: "Football, Cricket",
    price_per_hour: 1500,
    rating: 4.8,
    status: "Active",
    owner_name: "",
    owner_phone: "",
    image_url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600",
  });

  const loadTurfs = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAll("turfs");
      setTurfs(data);
    } catch (err) {
      console.warn("Failed loading turfs from MySQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTurfs();
  }, []);

  const handleCreateTurf = async (e) => {
    e.preventDefault();
    try {
      const newTurf = await adminApi.create("turfs", formData);
      setTurfs([newTurf, ...turfs]);
      setIsAddOpen(false);
      resetForm();
    } catch (err) {
      alert("Error adding turf: " + err.message);
    }
  };

  const handleUpdateTurf = async (e) => {
    e.preventDefault();
    if (!editingTurf) return;
    try {
      const updated = await adminApi.update("turfs", editingTurf.id, formData);
      setTurfs(turfs.map((t) => (t.id === editingTurf.id ? updated : t)));
      setIsEditOpen(false);
      setEditingTurf(null);
    } catch (err) {
      alert("Error updating turf: " + err.message);
    }
  };

  const handleDeleteTurf = async (id) => {
    if (!window.confirm("Are you sure you want to delete this turf from MySQL?")) return;
    try {
      await adminApi.delete("turfs", id);
      setTurfs(turfs.filter((t) => t.id !== id));
    } catch (err) {
      alert("Error deleting turf: " + err.message);
    }
  };

  const openEditModal = (turf) => {
    setEditingTurf(turf);
    setFormData({
      name: turf.name || "",
      location: turf.location || "",
      sport_type: turf.sport_type || "Football",
      price_per_hour: turf.price_per_hour || 1500,
      rating: turf.rating || 4.5,
      status: turf.status || "Active",
      owner_name: turf.owner_name || "",
      owner_phone: turf.owner_phone || "",
      image_url: turf.image_url || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600",
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      sport_type: "Football, Cricket",
      price_per_hour: 1500,
      rating: 4.8,
      status: "Active",
      owner_name: "",
      owner_phone: "",
      image_url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600",
    });
  };

  const filteredTurfs = turfs.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Turf Management</h1>
          <p className="text-muted-foreground">Manage all turf venues dynamically in MySQL (`turfs` table).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadTurfs} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Add New Turf
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>All Venues ({filteredTurfs.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search turfs..."
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
                  <TableHead>Turf Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Sports</TableHead>
                  <TableHead>Price / hr</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading turfs from MySQL...
                    </TableCell>
                  </TableRow>
                ) : filteredTurfs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No turfs found in database.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTurfs.map((turf) => (
                    <TableRow key={turf.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <img
                            src={turf.image_url || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600"}
                            alt={turf.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <div>{turf.name}</div>
                            <div className="text-xs text-amber-500 font-semibold">★ {turf.rating || 4.5}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{turf.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{turf.sport_type || "Football"}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{turf.price_per_hour}
                      </TableCell>
                      <TableCell>
                        <div>{turf.owner_name || "-"}</div>
                        <div className="text-xs text-muted-foreground">{turf.owner_phone || ""}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            turf.status === "Active"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/15 text-amber-600"
                          }
                        >
                          {turf.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(turf)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteTurf(turf.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Turf Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Turf</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTurf} className="space-y-4 py-2">
            <div>
              <Label>Turf Name</Label>
              <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Green Field Arena" />
            </div>
            <div>
              <Label>Location / Address</Label>
              <Input required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Andheri West, Mumbai" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sports Offered</Label>
                <Input value={formData.sport_type} onChange={(e) => setFormData({ ...formData, sport_type: e.target.value })} placeholder="Football, Cricket" />
              </div>
              <div>
                <Label>Price / Hour (₹)</Label>
                <Input type="number" required value={formData.price_per_hour} onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Owner Name</Label>
                <Input value={formData.owner_name} onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })} placeholder="Rajesh Mehta" />
              </div>
              <div>
                <Label>Owner Phone</Label>
                <Input value={formData.owner_phone} onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })} placeholder="+91 9820012345" />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Add Turf</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Turf Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Turf Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTurf} className="space-y-4 py-2">
            <div>
              <Label>Turf Name</Label>
              <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label>Location / Address</Label>
              <Input required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sports Offered</Label>
                <Input value={formData.sport_type} onChange={(e) => setFormData({ ...formData, sport_type: e.target.value })} />
              </div>
              <div>
                <Label>Price / Hour (₹)</Label>
                <Input type="number" required value={formData.price_per_hour} onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Owner Name</Label>
                <Input value={formData.owner_name} onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
