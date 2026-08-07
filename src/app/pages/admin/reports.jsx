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

export function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "Turf Issue",
    reported_by: "Rahul Sharma",
    priority: "Medium",
    status: "Open",
    date: new Date().toISOString().split("T")[0],
  });

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAll("reports");
      setReports(data);
    } catch (err) {
      console.warn("Failed loading reports from MySQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleCreateReport = async (e) => {
    e.preventDefault();
    try {
      const newR = await adminApi.create("reports", formData);
      setReports([newR, ...reports]);
      setIsAddOpen(false);
      setFormData({
        title: "",
        category: "Turf Issue",
        reported_by: "Rahul Sharma",
        priority: "Medium",
        status: "Open",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      alert("Error adding report: " + err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await adminApi.update("reports", id, { status: newStatus });
      setReports(reports.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      alert("Error updating report: " + err.message);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report from MySQL?")) return;
    try {
      await adminApi.delete("reports", id);
      setReports(reports.filter((r) => r.id !== id));
    } catch (err) {
      alert("Error deleting report: " + err.message);
    }
  };

  const filteredReports = reports.filter(
    (r) =>
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reported_by?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System & User Reports</h1>
          <p className="text-muted-foreground">Track tickets & issues dynamically in MySQL (`reports` table).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadReports} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Create Ticket
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Reports ({filteredReports.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ticket title..."
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
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading reports from MySQL...
                    </TableCell>
                  </TableRow>
                ) : filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No reports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-semibold text-foreground">{r.title}</TableCell>
                      <TableCell><Badge variant="outline">{r.category}</Badge></TableCell>
                      <TableCell className="text-xs">{r.reported_by}</TableCell>
                      <TableCell className="text-xs font-semibold">{r.priority}</TableCell>
                      <TableCell>
                        <Select value={r.status} onValueChange={(val) => handleStatusChange(r.id, val)}>
                          <SelectTrigger className={`w-[120px] h-8 text-xs border ${
                            r.status === "Open"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : r.status === "In Progress"
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          }`}>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteReport(r.id)}>
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

      {/* Add Report Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Report Ticket</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateReport} className="space-y-4 py-2">
            <div>
              <Label>Title</Label>
              <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Booking Payment Issue" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Turf Issue" />
              </div>
              <div>
                <Label>Reported By</Label>
                <Input value={formData.reported_by} onChange={(e) => setFormData({ ...formData, reported_by: e.target.value })} placeholder="Rahul Sharma" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Create Ticket</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
