import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Plus, Trash2, RefreshCw } from "lucide-react";
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
import { adminApi } from "../../services/admin-api";

export function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    target: "All Users",
    status: "Sent",
    sent_at: new Date().toLocaleString(),
  });

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAll("notifications");
      setNotifications(data);
    } catch (err) {
      console.warn("Failed loading notifications from MySQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    try {
      const newN = await adminApi.create("notifications", {
        ...formData,
        sent_at: new Date().toLocaleString(),
      });
      setNotifications([newN, ...notifications]);
      setIsAddOpen(false);
      setFormData({
        title: "",
        message: "",
        target: "All Users",
        status: "Sent",
        sent_at: new Date().toLocaleString(),
      });
    } catch (err) {
      alert("Error sending notification: " + err.message);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification from MySQL?")) return;
    try {
      await adminApi.delete("notifications", id);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (err) {
      alert("Error deleting notification: " + err.message);
    }
  };

  const filteredNotifications = notifications.filter(
    (n) =>
      n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.target?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Notifications</h1>
          <p className="text-muted-foreground">Broadcast & track notifications dynamically in MySQL (`notifications` table).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadNotifications} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Broadcast Notification
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Sent Notifications ({filteredNotifications.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
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
                  <TableHead>Notification Title</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Target Audience</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading notifications from MySQL...
                    </TableCell>
                  </TableRow>
                ) : filteredNotifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No notifications broadcasted yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotifications.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-semibold text-foreground">{n.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs">{n.message || "-"}</TableCell>
                      <TableCell><Badge variant="outline">{n.target || "All Users"}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{n.sent_at || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteNotification(n.id)}>
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

      {/* Add Notification Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Broadcast System Notification</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateNotification} className="space-y-4 py-2">
            <div>
              <Label>Notification Title</Label>
              <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Weekend Tournament Open!" />
            </div>
            <div>
              <Label>Message Content</Label>
              <Input required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Register your team now and get flat 20% cashback!" />
            </div>
            <div>
              <Label>Target Audience</Label>
              <Input value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} placeholder="All Users / Turf Owners / Mumbai Players" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Send Notification</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
