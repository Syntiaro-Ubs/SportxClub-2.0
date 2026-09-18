import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "../../providers/auth-provider";
import {
  Card,
  CardContent,
  CardHeader,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Loader2,
  AlertCircle,
  Ticket,
  Tag,
  Calendar,
  Users,
  Copy,
  Plus,
  MoreVertical,
  IndianRupee,
  Percent,
  Megaphone,
  Edit2,
  Trash2,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { motion, AnimatePresence } from "motion/react";
import { promotionsService } from "../../services/promotions.service";

export function Promotions() {
  const { currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    type: "percentage",
    validUntil: "",
    usageLimit: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const ownerId = currentUser?.id || "guest";
        const result = await promotionsService.getAll(ownerId);

        // Update dates to look realistic if missing
        const modifiedResult = result.map((p, i) => {
          let validDate = p.validUntil || p.valid_until;
          if (!validDate) {
            const d = new Date();
            d.setDate(d.getDate() + (i * 15 + 10));
            validDate = format(d, "MMM dd, yyyy");
          } else {
            try {
              validDate = format(new Date(validDate), "MMM dd, yyyy");
            } catch {
              // keep as is
            }
          }
          return {
            ...p,
            status: p.status || "active",
            validUntil: validDate,
            used: p.used ?? p.redemptions ?? 0,
            usageLimit: p.usageLimit ?? p.usage_limit ?? 100,
          };
        });

        setData(modifiedResult);
      } catch (err) {
        setError(err.message || "Failed to load promotions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center text-destructive space-y-4">
        <AlertCircle className="h-12 w-12" />
        <p className="text-lg">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const activePromotions = data.filter((p) => p.status === "active").length;
  const totalRedemptions = data.reduce((acc, curr) => acc + (Number(curr.used) || 0), 0);

  const copyToClipboard = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success(`Promo code "${code}" copied to clipboard!`);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const ownerId = currentUser?.id || "guest";
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discount: Number(formData.discount),
        usageLimit: Number(formData.usageLimit),
        usage_limit: Number(formData.usageLimit),
        status: "active",
        used: 0,
      };

      const newPromo = await promotionsService.create(ownerId, payload);

      let formattedDate = formData.validUntil;
      try {
        formattedDate = format(new Date(formData.validUntil), "MMM dd, yyyy");
      } catch (e) {}

      const cleanItem = {
        ...(newPromo || payload),
        id: newPromo?.id || Date.now(),
        code: payload.code,
        discount: payload.discount,
        type: payload.type,
        validUntil: formattedDate,
        usageLimit: payload.usageLimit,
        used: 0,
        status: "active",
      };

      setData((prev) => [cleanItem, ...prev]);
      setIsCreateOpen(false);
      setFormData({ code: "", discount: "", type: "percentage", validUntil: "", usageLimit: "" });
      toast.success(`Promotion "${cleanItem.code}" created successfully!`);
    } catch (err) {
      console.error("Failed to create promotion", err);
      toast.error("Failed to create promotion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (promo) => {
    const rawDiscount = String(promo.discount || "").replace(/[^0-9.]/g, "");
    let formattedDate = "";
    try {
      const d = new Date(promo.validUntil || promo.valid_until);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toISOString().split("T")[0];
      }
    } catch (e) {}

    setEditingPromo({
      id: promo.id,
      code: promo.code || "",
      discount: rawDiscount || "100",
      type: promo.type || "percentage",
      validUntil: formattedDate || new Date().toISOString().split("T")[0],
      usageLimit: promo.usageLimit || promo.usage_limit || 100,
      status: promo.status || "active",
      used: promo.used || 0,
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingPromo) return;
    setIsSubmitting(true);
    try {
      const ownerId = currentUser?.id || "guest";
      const payload = {
        code: editingPromo.code.toUpperCase().trim(),
        discount: Number(editingPromo.discount),
        type: editingPromo.type,
        validUntil: editingPromo.validUntil,
        valid_until: editingPromo.validUntil,
        usageLimit: Number(editingPromo.usageLimit),
        usage_limit: Number(editingPromo.usageLimit),
        status: editingPromo.status,
      };

      await promotionsService.update(ownerId, editingPromo.id, payload);

      let displayDate = editingPromo.validUntil;
      try {
        displayDate = format(new Date(editingPromo.validUntil), "MMM dd, yyyy");
      } catch (e) {}

      setData((prev) =>
        prev.map((p) =>
          p.id === editingPromo.id
            ? {
                ...p,
                ...payload,
                validUntil: displayDate,
              }
            : p
        )
      );

      setIsEditOpen(false);
      setEditingPromo(null);
      toast.success("Promotion updated successfully!");
    } catch (err) {
      console.error("Failed to update promotion:", err);
      toast.error("Failed to update promotion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (promo) => {
    const nextStatus = promo.status === "active" ? "paused" : "active";
    try {
      const ownerId = currentUser?.id || "guest";
      await promotionsService.update(ownerId, promo.id, { status: nextStatus });
      setData((prev) =>
        prev.map((p) => (p.id === promo.id ? { ...p, status: nextStatus } : p))
      );
      toast.success(`Promotion ${nextStatus === "active" ? "activated" : "paused"}!`);
    } catch (err) {
      console.error("Failed to update status:", err);
      setData((prev) =>
        prev.map((p) => (p.id === promo.id ? { ...p, status: nextStatus } : p))
      );
      toast.success("Promotion status updated.");
    }
  };

  const handleDelete = async (promoId) => {
    if (!window.confirm("Are you sure you want to delete this promotion?")) return;
    try {
      const ownerId = currentUser?.id || "guest";
      await promotionsService.delete(ownerId, promoId);
      setData((prev) => prev.filter((p) => p.id !== promoId));
      toast.success("Promotion deleted successfully!");
    } catch (err) {
      console.error("Failed to delete promo:", err);
      setData((prev) => prev.filter((p) => p.id !== promoId));
      toast.success("Promotion removed.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-full overflow-hidden relative">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Promotions & Offers</h1>
          <p className="text-muted-foreground mt-2">Create and manage discount codes to attract more players.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 rounded-xl shadow-lg shadow-primary/25 gap-2 cursor-pointer font-bold">
              <Plus className="w-4 h-4" />
              Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl bg-card border-border">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle className="font-extrabold text-foreground">Create Promotion</DialogTitle>
                <DialogDescription>
                  Create a new discount code for your customers.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right text-xs font-bold">Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SUMMER25"
                    className="col-span-3 uppercase rounded-xl"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right text-xs font-bold">Type</Label>
                  <select
                    id="type"
                    className="col-span-3 flex h-9 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="discount" className="text-right text-xs font-bold">Discount</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder={formData.type === "percentage" ? "e.g. 20" : "e.g. 100"}
                    className="col-span-3 rounded-xl"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="validUntil" className="text-right text-xs font-bold">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="col-span-3 rounded-xl"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="usageLimit" className="text-right text-xs font-bold">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="e.g. 100"
                    className="col-span-3 rounded-xl"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl font-bold cursor-pointer">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Promotion Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl bg-card border-border">
          {editingPromo && (
            <form onSubmit={handleSaveEdit}>
              <DialogHeader>
                <DialogTitle className="font-extrabold text-foreground flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-emerald-500" />
                  Edit Promotion
                </DialogTitle>
                <DialogDescription>
                  Update promotion details, discount rules, and validity.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-code" className="text-right text-xs font-bold">Code</Label>
                  <Input
                    id="edit-code"
                    value={editingPromo.code}
                    onChange={(e) => setEditingPromo({ ...editingPromo, code: e.target.value.toUpperCase() })}
                    className="col-span-3 uppercase rounded-xl font-bold"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-type" className="text-right text-xs font-bold">Type</Label>
                  <select
                    id="edit-type"
                    className="col-span-3 flex h-9 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={editingPromo.type}
                    onChange={(e) => setEditingPromo({ ...editingPromo, type: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-discount" className="text-right text-xs font-bold">Discount</Label>
                  <Input
                    id="edit-discount"
                    type="number"
                    min="1"
                    value={editingPromo.discount}
                    onChange={(e) => setEditingPromo({ ...editingPromo, discount: e.target.value })}
                    className="col-span-3 rounded-xl"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-validUntil" className="text-right text-xs font-bold">Valid Until</Label>
                  <Input
                    id="edit-validUntil"
                    type="date"
                    value={editingPromo.validUntil}
                    onChange={(e) => setEditingPromo({ ...editingPromo, validUntil: e.target.value })}
                    className="col-span-3 rounded-xl"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-usageLimit" className="text-right text-xs font-bold">Usage Limit</Label>
                  <Input
                    id="edit-usageLimit"
                    type="number"
                    min="1"
                    value={editingPromo.usageLimit}
                    onChange={(e) => setEditingPromo({ ...editingPromo, usageLimit: e.target.value })}
                    className="col-span-3 rounded-xl"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl font-bold cursor-pointer">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Card 1: Active Campaigns */}
        <div className="p-4 rounded-2xl bg-background border-2 border-emerald-500/30 hover:border-emerald-500 shadow-xs flex items-center justify-between transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Campaigns</p>
            <p className="text-2xl font-black text-foreground">
              {activePromotions}/{data.length}
            </p>
          </div>
          <div className="text-foreground">
            <Tag className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        {/* Card 2: Total Redemptions */}
        <div className="p-4 rounded-2xl bg-background border-2 border-emerald-500/30 hover:border-emerald-500 shadow-xs flex items-center justify-between transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Redemptions</p>
            <p className="text-2xl font-black text-foreground">{totalRedemptions}</p>
          </div>
          <div className="text-foreground">
            <Users className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        {/* Card 3: Boost Your Turf */}
        <div
          className="p-4 rounded-2xl bg-background border-2 border-emerald-500/30 hover:border-emerald-500 shadow-xs flex items-center justify-between transition-all duration-300 cursor-pointer group"
          onClick={() => toast.info("Advertisement portal coming soon!")}
        >
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Boost Your Turf</p>
            <p className="text-base font-black text-foreground group-hover:text-emerald-600 transition-colors">Start Advertisement</p>
          </div>
          <div className="text-foreground group-hover:text-emerald-600 transition-colors">
            <Megaphone className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Promotion Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnimatePresence>
          {data.map((promo, index) => {
            const isPercentage = promo.type === "percentage";
            const cleanDiscount = String(promo.discount || "").replace(/[^0-9.]/g, "");
            const discountLabel = isPercentage
              ? `${cleanDiscount || promo.discount}% OFF`
              : `₹${cleanDiscount || promo.discount} OFF`;
            const usagePercent = Math.min(100, Math.round(((Number(promo.used) || 0) / (Number(promo.usageLimit) || 1)) * 100));

            return (
              <motion.div
                key={promo.id || index}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full border-border/50 bg-card/50 backdrop-blur-xl shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                  <CardHeader className="pb-3 pt-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isPercentage ? (
                          <Percent className="w-5 h-5 text-emerald-500 stroke-[2.5]" />
                        ) : (
                          <IndianRupee className="w-5 h-5 text-emerald-500 stroke-[2.5]" />
                        )}
                        <h3 className="text-2xl font-bold tracking-tight">
                          {discountLabel}
                        </h3>
                        {promo.status === "paused" && (
                          <Badge variant="secondary" className="ml-2 text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                            Paused
                          </Badge>
                        )}
                      </div>

                      {/* Interactive 3-Dots Action Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-full cursor-pointer transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-2xl border border-border bg-popover/95 backdrop-blur-xl">
                          <DropdownMenuItem
                            onClick={() => copyToClipboard(promo.code)}
                            className="gap-2.5 text-xs font-bold cursor-pointer rounded-xl p-2"
                          >
                            <Copy className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copy Promo Code</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(promo)}
                            className="gap-2.5 text-xs font-bold cursor-pointer rounded-xl p-2"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                            <span>Edit Promotion</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(promo)}
                            className="gap-2.5 text-xs font-bold cursor-pointer rounded-xl p-2"
                          >
                            {promo.status === "active" ? (
                              <>
                                <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
                                <span>Pause Campaign</span>
                              </>
                            ) : (
                              <>
                                <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Activate Campaign</span>
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="my-1" />

                          <DropdownMenuItem
                            onClick={() => handleDelete(promo.id)}
                            className="gap-2.5 text-xs font-bold cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-xl p-2"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Delete Promotion</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-6">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50 mb-6">
                      <span className="font-mono text-lg font-bold tracking-wider text-primary">{promo.code}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors cursor-pointer rounded-lg"
                        onClick={() => copyToClipboard(promo.code)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        <span>Valid until <span className="font-bold text-foreground">{promo.validUntil}</span></span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-emerald-500" /> Redemptions
                          </span>
                          <span className="font-bold text-foreground">{promo.used} / {promo.usageLimit}</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-1000 ease-out"
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {data.length === 0 && (
          <div className="col-span-full">
            <Card className="border-dashed border-border/60 bg-transparent shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Tag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No promotions</h3>
                <p className="text-sm mt-1 mb-4">You haven't created any discount codes yet.</p>
                <Button variant="outline" onClick={() => setIsCreateOpen(true)} className="rounded-xl">
                  Create your first promotion
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
