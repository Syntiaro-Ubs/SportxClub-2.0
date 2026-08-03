import { useState, useMemo, useEffect } from "react";
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
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "../../components/ui/select";

const mockReportsData = Array.from({ length: 20 }, (_, i) => {
  const base = [
    { player: "Rahul Sharma", turf: "Premium Green Turf", sport: "Football", time: "18:00 - 20:00", amount: 1500, status: "Success", type: "Booking" },
    { player: "Amit Patel", turf: "Skyline Arena", sport: "Cricket", time: "07:00 - 09:00", amount: 2000, status: "Cancelled", type: "Booking" },
    { player: "Sneha Reddy", turf: "Elite Sports Club", sport: "Tennis", time: "06:00 - 07:00", amount: 800, status: "Success", type: "Booking" },
    { player: "Kiran Kumar", turf: "Downtown Court", sport: "Basketball", time: "19:00 - 20:00", amount: 1200, status: "Refunded", type: "Booking" },
    { player: "Priya Singh", turf: "Premium Green Turf", sport: "Football", time: "20:00 - 21:00", amount: 1500, status: "Pending", type: "Booking" },
    { player: "Vikram Rathore", turf: "Elite Sports Club", sport: "Badminton", time: "17:00 - 18:00", amount: 600, status: "Success", type: "Booking" },
    { player: "Ananya Desai", turf: "Skyline Arena", sport: "Tennis", time: "16:00 - 18:00", amount: 1800, status: "Success", type: "Booking" }
  ];
  const b = base[i % base.length];

  // Generate a random date within the last 7 months to have varied mock data
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * 210));

  return {
    id: `TRX-89${(30 - i).toString().padStart(2, '0')}`,
    player: b.player,
    turf: b.turf,
    sport: b.sport,
    date: format(d, "yyyy-MM-dd"),
    time: b.time,
    amount: b.amount,
    status: b.status,
    type: b.type
  };
});

export function OwnerReport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("This Month");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

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

  const filteredData = useMemo(() => {
    return mockReportsData.filter(item => {
      const matchesSearch =
        item.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.turf.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;

      let matchesDate = true;
      if (dateFilter === "Custom Date" && selectedDate) {
        matchesDate = item.date === format(selectedDate, "yyyy-MM-dd");
      } else if (dateFilter === "Custom Month" && selectedMonth) {
        matchesDate = item.date.startsWith(selectedMonth);
      } else if (dateFilter === "Custom Year" && selectedYear) {
        matchesDate = item.date.startsWith(selectedYear);
      } else if (dateFilter === "Past 6 Months") {
        const itemDate = new Date(item.date);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        matchesDate = itemDate >= sixMonthsAgo;
      } else if (dateFilter === "Yearly") {
        const itemDate = new Date(item.date);
        const now = new Date();
        matchesDate = itemDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === "This Month") {
        const itemDate = new Date(item.date);
        const now = new Date();
        matchesDate = itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchQuery, statusFilter, dateFilter, selectedDate, selectedMonth, selectedYear]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter, selectedDate]);

  const currentReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const exportToExcel = () => {
    const headers = ["Transaction ID", "Player", "Turf", "Sport", "Date", "Time", "Amount", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map(row => [
        row.id,
        `"${row.player}"`,
        `"${row.turf}"`,
        `"${row.sport}"`,
        row.date,
        `"${row.time}"`,
        row.amount,
        row.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `reports_${statusFilter.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.text(`Reports - ${statusFilter}`, 14, 15);

      let yPos = 25;
      const headers = ["ID", "Player", "Turf", "Amount", "Status"];
      doc.setFontSize(10);
      doc.text(headers[0], 14, yPos);
      doc.text(headers[1], 45, yPos);
      doc.text(headers[2], 95, yPos);
      doc.text(headers[3], 150, yPos);
      doc.text(headers[4], 175, yPos);

      yPos += 10;
      doc.setFontSize(9);
      filteredData.forEach(row => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(row.id.toString(), 14, yPos);
        doc.text(row.player.toString().substring(0, 20), 45, yPos);
        doc.text(row.turf.toString().substring(0, 25), 95, yPos);
        doc.text(row.amount.toString(), 150, yPos);
        doc.text(row.status.toString(), 175, yPos);
        yPos += 7;
      });

      doc.save(`reports_${statusFilter.toLowerCase()}.pdf`);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Reports & History</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer focus:bg-emerald-50/80 focus:text-emerald-700 dark:focus:bg-emerald-950/30 dark:focus:text-emerald-400 focus:font-semibold">
                Export Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer focus:bg-emerald-50/80 focus:text-emerald-700 dark:focus:bg-emerald-950/30 dark:focus:text-emerald-400 focus:font-semibold">
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards (2 Cards per row on Mobile) */}
      <div className="grid gap-2.5 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-3 sm:p-3.5 space-y-0.5">
          <div className="flex flex-row items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Total Revenue</span>
            <IndianRupee className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold flex items-center tracking-tight">
              <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 mr-0.5" />
              125,000
            </div>
            <p className="text-[9.5px] sm:text-[11px] text-muted-foreground flex items-center gap-0.5 sm:gap-1 mt-0.5 flex-wrap">
              <span className="text-emerald-500 font-bold flex items-center"><ArrowUpRight className="w-3 h-3" /> 12.5%</span> <span className="opacity-80">from last month</span>
            </p>
          </div>
        </Card>
        <Card className="p-3 sm:p-3.5 space-y-0.5">
          <div className="flex flex-row items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Successful Bookings</span>
            <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold tracking-tight">284</div>
            <p className="text-[9.5px] sm:text-[11px] text-muted-foreground flex items-center gap-0.5 sm:gap-1 mt-0.5 flex-wrap">
              <span className="text-emerald-500 font-bold flex items-center"><ArrowUpRight className="w-3 h-3" /> 8.2%</span> <span className="opacity-80">from last month</span>
            </p>
          </div>
        </Card>
        <Card className="p-3 sm:p-3.5 space-y-0.5">
          <div className="flex flex-row items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Cancellations</span>
            <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold tracking-tight">12</div>
            <p className="text-[9.5px] sm:text-[11px] text-muted-foreground flex items-center gap-0.5 sm:gap-1 mt-0.5 flex-wrap">
              <span className="text-red-500 font-bold flex items-center"><ArrowUpRight className="w-3 h-3" /> 2.1%</span> <span className="opacity-80">from last month</span>
            </p>
          </div>
        </Card>
        <Card className="p-3 sm:p-3.5 space-y-0.5">
          <div className="flex flex-row items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">Refund Processed</span>
            <RefreshCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold flex items-center tracking-tight">
              <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 mr-0.5 stroke-[2.5]" />
              8,500
            </div>
            <p className="text-[9.5px] sm:text-[11px] text-muted-foreground flex items-center gap-0.5 sm:gap-1 mt-0.5 flex-wrap">
              <span className="text-emerald-500 font-bold flex items-center"><ArrowDownRight className="w-3 h-3" /> 4.3%</span> <span className="opacity-80">from last month</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card className="bg-transparent border-0 shadow-none sm:bg-card sm:border sm:border-border/40 sm:shadow-lg rounded-2xl w-full max-w-full overflow-hidden">
        <CardHeader className="px-0 sm:px-6 pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-xl font-bold text-foreground">Transaction History</CardTitle>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64 min-w-[180px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search player, turf or ID..."
                  className="pl-9 bg-muted/50 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex bg-muted/50 p-1 rounded-xl border border-border/40 overflow-x-auto max-w-full">
                {["All", "Success", "Cancelled", "Pending"].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${statusFilter === status
                      ? "bg-background shadow-xs text-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[130px] rounded-xl h-8 text-xs font-semibold bg-muted/50 border-border/40 focus:ring-0">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="This Month" className="text-xs">Month</SelectItem>
                    <SelectSeparator />
                    <SelectItem value="Past 6 Months" className="text-xs">6 Months</SelectItem>
                    <SelectSeparator />
                    <SelectItem value="Yearly" className="text-xs">Yearly</SelectItem>
                    <SelectSeparator />
                    <SelectItem value="Custom Date" className="text-xs">
                      <div className="flex items-center">
                        <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-indigo-400" />
                        Custom
                      </div>
                    </SelectItem>
                    <SelectItem value="Custom Month" className="text-xs">Custom Month</SelectItem>
                    <SelectItem value="Custom Year" className="text-xs">Custom Year</SelectItem>
                  </SelectContent>
                </Select>
                {dateFilter === "Custom Date" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`h-8 rounded-xl text-xs font-semibold bg-muted/50 border-border/40 justify-start text-left font-normal ${!selectedDate && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={2010}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                )}
                {dateFilter === "Custom Month" && (
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="h-8 w-[140px] rounded-xl text-xs font-semibold bg-muted/50 border border-border/40 px-3 outline-none focus:ring-2 focus:ring-emerald-500/20 text-foreground"
                  />
                )}
                {dateFilter === "Custom Year" && (
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[100px] h-8 rounded-xl text-xs font-semibold bg-muted/50 border-border/40 focus:ring-0">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <SelectItem key={year} value={year.toString()} className="text-xs">{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6 pb-2">
          <div className="w-full max-w-full pb-4">
            <Table className="w-full min-w-[700px] md:min-w-full text-center border-collapse">
              <TableHeader className="bg-muted/40">
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
                {currentReports.map((trx) => (
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

          {filteredData.length > 0 && (
            <div className="flex items-center justify-between border-t border-border/40 px-4 py-3 sm:px-6 bg-card/40 rounded-b-2xl">
              <div className="text-xs text-muted-foreground hidden sm:block">
                Showing <span className="font-bold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-foreground">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-bold text-foreground">{filteredData.length}</span> entries
              </div>
              <div className="flex flex-1 justify-between sm:justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 text-xs font-medium border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1 sm:hidden">
                  <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 text-xs font-medium border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
