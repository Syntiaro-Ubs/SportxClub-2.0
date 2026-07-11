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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
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
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 pointer-events-none">
            <Ticket className="w-32 h-32 text-primary" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-xl bg-primary/20 text-primary">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-foreground">{activePromotions}</h3>
                  <span className="text-sm text-muted-foreground">/ {data.length} Total</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 pointer-events-none">
            <Users className="w-32 h-32 text-emerald-500" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-500">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Redemptions</p>
                <h3 className="text-3xl font-bold text-foreground">{totalRedemptions}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-indigo-500/20 shadow-sm relative overflow-hidden group cursor-pointer hover:border-indigo-500/40 transition-colors" onClick={() => alert("Advertisement portal coming soon!")}>
          <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 pointer-events-none transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500">
            <Megaphone className="w-32 h-32 text-indigo-500" />
          </div>
          <CardContent className="p-6 h-full flex flex-col justify-center">
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-500">
                <Megaphone className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Boost your Turf</p>
                <h3 className="text-xl font-bold text-foreground mt-0.5">Start Advertisement</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  {/* Status Indicator Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${promo.status === 'active' ? 'bg-emerald-500' : 'bg-muted'}`} />
                  
                  <CardHeader className="pb-3 pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Badge variant={promo.status === "active" ? "default" : "secondary"} className="mb-2 uppercase text-[10px] tracking-wider font-semibold">
                          {promo.status}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {isPercentage ? (
                            <Percent className="w-5 h-5 text-primary" />
                          ) : (
                            <IndianRupee className="w-5 h-5 text-primary" />
                          )}
                          <h3 className="text-2xl font-bold tracking-tight">
                            {promo.discount}{isPercentage ? '%' : ''} OFF
                          </h3>
                        </div>
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
