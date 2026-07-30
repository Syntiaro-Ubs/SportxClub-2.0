import { useState } from "react";
import { motion } from "motion/react";
import {
  FileText,
  Search,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCcw,
  IndianRupee,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

const mockReportsData = [
  {
    id: "TRX-8923",
    player: "Rahul Sharma",
    turf: "Premium Green Turf",
    sport: "Football",
    date: "2024-03-24",
    time: "18:00 - 20:00",
    amount: 1500,
    status: "Success",
    type: "Booking"
  },
  {
    id: "TRX-8924",
    player: "Amit Patel",
    turf: "Skyline Arena",
    sport: "Cricket",
    date: "2024-03-24",
    time: "07:00 - 09:00",
    amount: 2000,
    status: "Cancelled",
    type: "Booking"
  },
  {
    id: "TRX-8925",
    player: "Priya Desai",
    turf: "Community Pitch",
    sport: "Badminton",
    date: "2024-03-25",
    time: "10:00 - 11:00",
    amount: 800,
    status: "Success",
    type: "Booking"
  },
  {
    id: "TRX-8926",
    player: "Vikram Singh",
    turf: "Neon Box",
    sport: "Box Cricket",
    date: "2024-03-25",
    time: "20:00 - 22:00",
    amount: 2500,
    status: "Refunded",
    type: "Cancellation"
  },
  {
    id: "TRX-8927",
    player: "Neha Gupta",
    turf: "Olympus Tennis Court",
    sport: "Tennis",
    date: "2024-03-26",
    time: "08:00 - 10:00",
    amount: 1200,
    status: "Pending",
    type: "Booking"
  },
  {
    id: "TRX-8928",
    player: "Arjun Reddy",
    turf: "Premium Green Turf",
    sport: "Football",
    date: "2024-03-26",
    time: "21:00 - 23:00",
    amount: 1500,
    status: "Success",
    type: "Booking"
  },
  {
    id: "TRX-8929",
    player: "Riya Sen",
    turf: "Titan Basketball Gym",
    sport: "Basketball",
    date: "2024-03-27",
    time: "16:00 - 18:00",
    amount: 1800,
    status: "Success",
    type: "Booking"
  },
];

export function OwnerReport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const getStatusBadge = (status) => {
    switch (status) {
      case "Success":
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-none font-medium gap-1"><CheckCircle2 className="w-3 h-3" /> Success</Badge>;
      case "Cancelled":
        return <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 border-none font-medium gap-1"><XCircle className="w-3 h-3" /> Cancelled</Badge>;
      case "Refunded":
        return <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 border-none font-medium gap-1"><RefreshCcw className="w-3 h-3" /> Refunded</Badge>;
      case "Pending":
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border-none font-medium gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredData = mockReportsData.filter(item => {
    const matchesSearch =
      item.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.turf.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & History</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-3.5 space-y-0.5">
          <div className="flex flex-row items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Revenue</span>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-xl font-extrabold flex items-center tracking-tight">
              <IndianRupee className="w-5 h-5 mr-0.5" />
              125,000
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <span className="text-emerald-500 font-bold flex items-center"><ArrowUpRight className="w-3 h-3" /> 12.5%</span> from last month
            </p>
          </div>
        </Card>
        <Card className="p-3.5 space-y-0.5">
          <div className="flex flex-row items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Successful Bookings</span>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight">284</div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <span className="text-emerald-500 font-bold flex items-center"><ArrowUpRight className="w-3 h-3" /> 8.2%</span> from last month
            </p>
          </div>
        </Card>
        <Card className="p-3.5 space-y-0.5">
          <div className="flex flex-row items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Cancellations</span>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight">12</div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <span className="text-red-500 font-bold flex items-center"><ArrowUpRight className="w-3 h-3" /> 2.1%</span> from last month
            </p>
          </div>
        </Card>
        <Card className="p-3.5 space-y-0.5">
          <div className="flex flex-row items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Refund Processed</span>
            <RefreshCcw className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-xl font-extrabold flex items-center tracking-tight">
              <IndianRupee className="w-5 h-5 mr-0.5 stroke-[2.5]" />
              8,500
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <span className="text-emerald-500 font-bold flex items-center"><ArrowDownRight className="w-3 h-3" /> 4.3%</span> from last month
            </p>
          </div>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-xl font-bold">Transaction History</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search player, turf or ID..."
                  className="pl-9 bg-muted/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex bg-muted/50 p-1 rounded-lg border">
                {["All", "Success", "Cancelled", "Pending"].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === status
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table className="text-center">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-center font-bold">Transaction ID</TableHead>
                  <TableHead className="text-center font-bold">Player</TableHead>
                  <TableHead className="text-center font-bold">Turf & Sport</TableHead>
                  <TableHead className="text-center font-bold">Date & Time</TableHead>
                  <TableHead className="text-center font-bold">Amount</TableHead>
                  <TableHead className="text-center font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((trx) => (
                  <TableRow key={trx.id}>
                    <TableCell className="font-mono text-xs text-center">{trx.id}</TableCell>
                    <TableCell className="font-medium text-center">{trx.player}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center justify-center text-center">
                        <span>{trx.turf}</span>
                        <span className="text-xs text-muted-foreground">{trx.sport}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center justify-center text-center">
                        <span>{new Date(trx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-xs text-muted-foreground">{trx.time}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-center">
                      <span className="flex items-center justify-center text-center">
                        <IndianRupee className="w-4 h-4 mr-0.5 stroke-[2.5]" />
                        {trx.amount}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center text-center">
                        {getStatusBadge(trx.status)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No transactions found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
