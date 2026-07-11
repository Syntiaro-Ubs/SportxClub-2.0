import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  Loader2, 
  AlertCircle, 
  IndianRupee, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  Download,
  Filter,
  Calendar as CalendarIcon
} from "lucide-react";
import { paymentService } from "../../services/payment.service";

// TODO: Replace with actual auth context ownerId
const OWNER_ID = "owner-123";

export function Revenue() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Replace with actual method when implemented
        const result = await paymentService.getAll(OWNER_ID);
        setData(result || []);
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const totalRevenue = data.filter(t => t.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingRevenue = data.filter(t => t.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
  const totalTransactions = data.length;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800/30 dark:bg-emerald-500/20 dark:text-emerald-400";
      case "pending":
        return "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800/30 dark:bg-amber-500/20 dark:text-amber-400";
      case "failed":
        return "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl tracking-tight font-bold">Revenue</h1>
          <p className="text-muted-foreground mt-1">Track your earnings and transaction history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 shadow-sm bg-background/50 backdrop-blur-sm">
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Total Revenue</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <IndianRupee className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-amber-500/10 to-amber-500/5 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">Pending Payments</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700 dark:text-amber-400">₹{pendingRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1 flex items-center gap-1">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-sm hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              Across all turfs
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between py-4">
          <div>
            <CardTitle className="text-xl">Transaction History</CardTitle>
            <CardDescription>Recent payments from your turf bookings</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2 h-8">
            <Filter className="h-3.5 w-3.5" /> Filter
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {data && data.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center text-muted-foreground">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <IndianRupee className="h-8 w-8 opacity-50" />
              </div>
              <p className="text-lg font-medium text-foreground">No transactions yet</p>
              <p className="text-sm">When customers book your turfs, payments will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Transaction ID</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Source / Turf</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">{tx.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="whitespace-nowrap">{tx.date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {tx.source}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold flex items-center">
                          <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />
                          {tx.amount.toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`capitalize ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
