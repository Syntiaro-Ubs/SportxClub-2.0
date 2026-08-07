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

export function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    transaction_id: "TXN-" + Math.floor(100000 + Math.random() * 900000),
    user_name: "",
    amount: 1500,
    method: "UPI",
    status: "Success",
    date: new Date().toISOString().split("T")[0],
  });

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAll("payments");
      setPayments(data);
    } catch (err) {
      console.warn("Failed loading payments from MySQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      const newP = await adminApi.create("payments", formData);
      setPayments([newP, ...payments]);
      setIsAddOpen(false);
      setFormData({
        transaction_id: "TXN-" + Math.floor(100000 + Math.random() * 900000),
        user_name: "",
        amount: 1500,
        method: "UPI",
        status: "Success",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      alert("Error adding payment: " + err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await adminApi.update("payments", id, { status: newStatus });
      setPayments(payments.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      alert("Error updating payment: " + err.message);
    }
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment record from MySQL?")) return;
    try {
      await adminApi.delete("payments", id);
      setPayments(payments.filter((p) => p.id !== id));
    } catch (err) {
      alert("Error deleting payment: " + err.message);
    }
  };

  const filteredPayments = payments.filter(
    (p) =>
      p.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.method?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Transactions</h1>
          <p className="text-muted-foreground">Monitor revenue and transactions dynamically in MySQL (`payments` table).</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadPayments} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Record
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Transactions ({filteredPayments.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Txn ID, User..."
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
                  <TableHead>Txn ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading payments from MySQL...
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No payments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs font-semibold text-primary">{p.transaction_id || p.id}</TableCell>
                      <TableCell className="font-medium">{p.user_name}</TableCell>
                      <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">₹{p.amount}</TableCell>
                      <TableCell><Badge variant="outline">{p.method}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.date}</TableCell>
                      <TableCell>
                        <Select value={p.status} onValueChange={(val) => handleStatusChange(p.id, val)}>
                          <SelectTrigger className={`w-[110px] h-8 text-xs border ${
                            p.status === "Success"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : p.status === "Pending"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Success">Success</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Refunded">Refunded</SelectItem>
                            <SelectItem value="Failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeletePayment(p.id)}>
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

      {/* Add Payment Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Manual Payment Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePayment} className="space-y-4 py-2">
            <div>
              <Label>User Name</Label>
              <Input required value={formData.user_name} onChange={(e) => setFormData({ ...formData, user_name: e.target.value })} placeholder="Rahul Sharma" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount (₹)</Label>
                <Input type="number" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select value={formData.method} onValueChange={(val) => setFormData({ ...formData, method: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Net Banking">Net Banking</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Add Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
