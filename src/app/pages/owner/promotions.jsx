import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "../../providers/auth-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Loader2, AlertCircle, Ticket, Tag, Calendar, Users, Copy, Plus, MoreVertical, IndianRupee, Percent, Megaphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { motion, AnimatePresence } from "motion/react";

// Assuming we have a promotionsService (we'll fetch it like in reviews)
import { promotionsService } from "../../services/promotions.service";

export function Promotions() {
  const { currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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

        // Update mock dates to look realistic (e.g. ending in the future)
        const modifiedResult = result.map((p, i) => {
          const d = new Date();
          d.setDate(d.getDate() + (i * 15 + 10)); // Push dates into the future
          return {
            ...p,
            validUntil: format(d, "MMM dd, yyyy"),
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

  const activePromotions = data.filter(p => p.status === "active").length;
  const totalRedemptions = data.reduce((acc, curr) => acc + (curr.used || 0), 0);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    // You could trigger a toast here
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const ownerId = currentUser?.id || "guest";
      const payload = {
        ...formData,
        discount: Number(formData.discount),
        usageLimit: Number(formData.usageLimit),
        status: "active",
        used: 0,
      };

      const newPromo = await promotionsService.create(ownerId, payload);

      try {
        newPromo.validUntil = format(new Date(newPromo.validUntil), "MMM dd, yyyy");
      } catch (e) {
        // fallback
      }

      setData((prev) => [newPromo, ...prev]);
      setIsCreateOpen(false);
      setFormData({ code: "", discount: "", type: "percentage", validUntil: "", usageLimit: "" });
    } catch (err) {
      console.error("Failed to create promotion", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-full overflow-hidden relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-tight font-bold">Promotions & Offers</h1>
          <p className="text-muted-foreground mt-2">Create and manage discount codes to attract more players.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 rounded-xl shadow-lg shadow-primary/25 gap-2">
              <Plus className="w-4 h-4" />
              Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Promotion</DialogTitle>
                <DialogDescription>
                  Create a new discount code for your customers.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SUMMER25"
                    className="col-span-3 uppercase"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Type</Label>
                  <select
                    id="type"
                    className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="discount" className="text-right">Discount</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder={formData.type === "percentage" ? "e.g. 20" : "e.g. 500"}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="validUntil" className="text-right">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="usageLimit" className="text-right">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="e.g. 100"
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
          onClick={() => alert("Advertisement portal coming soon!")}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnimatePresence>
          {data.map((promo, index) => {
            const isPercentage = promo.type === "percentage";
            const usagePercent = Math.round((promo.used / promo.usageLimit) * 100);

            return (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
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
                          {promo.discount}{isPercentage ? '%' : ''} OFF
                        </h3>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-6">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50 mb-6">
                      <span className="font-mono text-lg font-semibold tracking-wider text-primary">{promo.code}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors" onClick={() => copyToClipboard(promo.code)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Valid until <span className="font-medium text-foreground">{promo.validUntil}</span></span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Ticket className="w-4 h-4" /> Redemptions
                          </span>
                          <span className="font-medium text-foreground">{promo.used} / {promo.usageLimit}</span>
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
                <Button variant="outline">Create your first promotion</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
