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

export function AdminPasses() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "Monthly",
    price: 999,
    validity: "30 Days",
    discount: "20% OFF",
    status: "Active",
  });

  const loadPasses = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAll("passes");
      setPasses(data);
    } catch (err) {
      console.warn("Failed loading passes from MySQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPasses();
  }, []);

  const handleCreatePass = async (e) => {
    e.preventDefault();
    try {
      const newP = await adminApi.create("passes", formData);
      setPasses([newP, ...passes]);
      setIsAddOpen(false);
      setFormData({ name: "", type: "Monthly", price: 999, validity: "30 Days", discount: "20% OFF", status: "Active" });
    } catch (err) {
      alert("Error adding pass: " + err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await adminApi.update("passes", id, { status: newStatus });
      setPasses(passes.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      alert("Error updating pass status: " + err.message);
    }
  };

  const handleDeletePass = async (id) => {
    if (!window.confirm("Are you sure you want to delete this game pass from MySQL?")) return;
    try {
      await adminApi.delete("passes", id);
      setPasses(passes.filter((p) => p.id !== id));
    } catch (err) {
      alert("Error deleting pass: " + err.message);
    }
  };

  const filteredPasses = passes.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Game Passes & Memberships</h1>
          <p className="text-muted-foreground">Manage membership passes dynamically in MySQL (`game_passes` table).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadPasses} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add New Pass
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Passes Directory ({filteredPasses.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pass name..."
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
                  <TableHead>Pass Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Discount Perk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading passes from MySQL...
                    </TableCell>
                  </TableRow>
                ) : filteredPasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No game passes found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPasses.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-bold text-foreground">{p.name}</TableCell>
                      <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                      <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">₹{p.price}</TableCell>
                      <TableCell className="text-xs">{p.validity}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.discount}</TableCell>
                      <TableCell>
                        <Select value={p.status} onValueChange={(val) => handleStatusChange(p.id, val)}>
                          <SelectTrigger className={`w-[110px] h-8 text-xs border ${
                            p.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeletePass(p.id)}>
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

      {/* Add Pass Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Game Pass</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePass} className="space-y-4 py-2">
            <div>
              <Label>Pass Name</Label>
              <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Pro Monthly Membership" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price (₹)</Label>
                <Input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Validity</Label>
                <Input value={formData.validity} onChange={(e) => setFormData({ ...formData, validity: e.target.value })} placeholder="30 Days" />
              </div>
              <div>
                <Label>Discount Perk</Label>
                <Input value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} placeholder="20% OFF on all bookings" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Create Pass</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
