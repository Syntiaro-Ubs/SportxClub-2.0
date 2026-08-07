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

export function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discount: "20% OFF",
    max_uses: 500,
    used_count: 0,
    expiry: "2026-12-31",
    status: "Active",
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAll("coupons");
      setCoupons(data);
    } catch (err) {
      console.warn("Failed loading coupons from MySQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const newC = await adminApi.create("coupons", formData);
      setCoupons([newC, ...coupons]);
      setIsAddOpen(false);
      setFormData({ code: "", discount: "20% OFF", max_uses: 500, used_count: 0, expiry: "2026-12-31", status: "Active" });
    } catch (err) {
      alert("Error adding coupon: " + err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await adminApi.update("coupons", id, { status: newStatus });
      setCoupons(coupons.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      alert("Error updating coupon: " + err.message);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon from MySQL?")) return;
    try {
      await adminApi.delete("coupons", id);
      setCoupons(coupons.filter((c) => c.id !== id));
    } catch (err) {
      alert("Error deleting coupon: " + err.message);
    }
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.discount?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discount Coupons</h1>
          <p className="text-muted-foreground">Manage promotional codes dynamically in MySQL (`coupons` table).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadCoupons} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Coupon
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>All Coupons ({filteredCoupons.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search coupon code..."
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
                  <TableHead>Coupon Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading coupons from MySQL...
                    </TableCell>
                  </TableRow>
                ) : filteredCoupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No coupons found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCoupons.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-bold text-primary font-mono tracking-wider">{c.code}</TableCell>
                      <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">{c.discount}</TableCell>
                      <TableCell>{c.used_count ?? 0} / {c.max_uses ?? 500}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.expiry || "No limit"}</TableCell>
                      <TableCell>
                        <Select value={c.status} onValueChange={(val) => handleStatusChange(c.id, val)}>
                          <SelectTrigger className={`w-[110px] h-8 text-xs border ${
                            c.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteCoupon(c.id)}>
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

      {/* Add Coupon Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Coupon Code</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCoupon} className="space-y-4 py-2">
            <div>
              <Label>Coupon Code</Label>
              <Input required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="FESTIVAL50" />
            </div>
            <div>
              <Label>Discount Value</Label>
              <Input required value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} placeholder="50% OFF or ₹150 OFF" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Max Uses</Label>
                <Input type="number" value={formData.max_uses} onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })} />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input type="date" value={formData.expiry} onChange={(e) => setFormData({ ...formData, expiry: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Create Coupon</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
