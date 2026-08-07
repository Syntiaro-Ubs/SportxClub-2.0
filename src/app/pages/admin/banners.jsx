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

export function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image_url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200",
    link: "/turfs",
    status: "Active",
    position: 1,
  });

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAll("banners");
      setBanners(data);
    } catch (err) {
      console.warn("Failed loading banners from MySQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    try {
      const newB = await adminApi.create("banners", formData);
      setBanners([newB, ...banners]);
      setIsAddOpen(false);
      setFormData({
        title: "",
        subtitle: "",
        image_url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200",
        link: "/turfs",
        status: "Active",
        position: 1,
      });
    } catch (err) {
      alert("Error adding banner: " + err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await adminApi.update("banners", id, { status: newStatus });
      setBanners(banners.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      alert("Error updating banner: " + err.message);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner from MySQL?")) return;
    try {
      await adminApi.delete("banners", id);
      setBanners(banners.filter((b) => b.id !== id));
    } catch (err) {
      alert("Error deleting banner: " + err.message);
    }
  };

  const filteredBanners = banners.filter(
    (b) =>
      b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banner Management</h1>
          <p className="text-muted-foreground">Manage homepage promotional banners dynamically in MySQL (`banners` table).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadBanners} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Banner
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Banners ({filteredBanners.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search banners..."
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
                  <TableHead>Banner</TableHead>
                  <TableHead>Subtitle</TableHead>
                  <TableHead>Target Link</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading banners from MySQL...
                    </TableCell>
                  </TableRow>
                ) : filteredBanners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No banners found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBanners.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <img
                            src={b.image_url || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200"}
                            alt={b.title}
                            className="w-16 h-10 rounded-md object-cover border"
                          />
                          <div className="font-semibold">{b.title}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{b.subtitle || "-"}</TableCell>
                      <TableCell><Badge variant="outline">{b.link || "/"}</Badge></TableCell>
                      <TableCell>
                        <Select value={b.status} onValueChange={(val) => handleStatusChange(b.id, val)}>
                          <SelectTrigger className={`w-[110px] h-8 text-xs border ${
                            b.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          }`}>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Paused">Paused</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteBanner(b.id)}>
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

      {/* Add Banner Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Promotional Banner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBanner} className="space-y-4 py-2">
            <div>
              <Label>Banner Title</Label>
              <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Monsoon Special Discount" />
            </div>
            <div>
              <Label>Subtitle / Description</Label>
              <Input value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} placeholder="Get 20% off on all cricket turfs" />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Redirect Link</Label>
                <Input value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="/turfs" />
              </div>
              <div>
                <Label>Position</Label>
                <Input type="number" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Create Banner</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
