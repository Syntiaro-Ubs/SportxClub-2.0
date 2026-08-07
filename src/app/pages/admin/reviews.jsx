import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Trash2, RefreshCw } from "lucide-react";
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
import { adminApi } from "../../services/admin-api";

export function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAll("reviews");
      setReviews(data);
    } catch (err) {
      console.warn("Failed loading reviews from MySQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await adminApi.update("reviews", id, { status: newStatus });
      setReviews(reviews.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      alert("Error updating review status: " + err.message);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review from MySQL?")) return;
    try {
      await adminApi.delete("reviews", id);
      setReviews(reviews.filter((r) => r.id !== id));
    } catch (err) {
      alert("Error deleting review: " + err.message);
    }
  };

  const filteredReviews = reviews.filter(
    (r) =>
      r.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.turf_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Reviews</h1>
          <p className="text-muted-foreground">Moderate user reviews dynamically in MySQL (`reviews` table).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadReviews} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Reviews Directory ({filteredReviews.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search user, turf, comment..."
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
                  <TableHead>User</TableHead>
                  <TableHead>Turf</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading reviews from MySQL...
                    </TableCell>
                  </TableRow>
                ) : filteredReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No reviews found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-semibold">{r.user_name}</TableCell>
                      <TableCell>{r.turf_name}</TableCell>
                      <TableCell className="text-amber-500 font-bold">★ {r.rating} / 5</TableCell>
                      <TableCell className="text-xs max-w-xs text-muted-foreground italic">"{r.comment}"</TableCell>
                      <TableCell>
                        <Select value={r.status} onValueChange={(val) => handleStatusChange(r.id, val)}>
                          <SelectTrigger className={`w-[120px] h-8 text-xs border ${
                            r.status === "Approved"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : r.status === "Pending"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Flagged">Flagged</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteReview(r.id)}>
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
    </motion.div>
  );
}
