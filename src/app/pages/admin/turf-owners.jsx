import { useState } from "react";
import { motion } from "motion/react";
import { Search, Plus, Filter, MoreVertical, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
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
} from "../../components/ui/select";

const initialOwners = [
  { id: 1, name: "Elite Sports Management", venues: 4, revenue: "₹12,45,000", joinedDate: "Jan 12, 2023", status: "Verified" },
  { id: 2, name: "Sharma Turfs", venues: 1, revenue: "₹3,20,000", joinedDate: "May 05, 2023", status: "Verified" },
  { id: 3, name: "City Club Partners", venues: 2, revenue: "₹8,50,000", joinedDate: "Aug 19, 2023", status: "Verified" },
  { id: 4, name: "New Age Arenas", venues: 1, revenue: "₹0", joinedDate: "Oct 24, 2024", status: "Pending Verification" },
];

export function AdminTurfOwners() {
  const [owners, setOwners] = useState(initialOwners);
  const [searchTerm, setSearchTerm] = useState("");

  const handleStatusChange = (ownerId, newStatus) => {
    setOwners(owners.map(owner => owner.id === ownerId ? { ...owner, status: newStatus } : owner));
  };

  const filteredOwners = owners.filter(owner => 
    owner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Turf Owners</h1>
          <p className="text-muted-foreground">Manage registered venue partners.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
          <Button><Plus className="h-4 w-4 mr-2" /> Add New</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Overview</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search records..." 
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
                  <TableHead>Owner Name</TableHead>
                  <TableHead>Venues</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOwners.map((owner) => (
                  <TableRow key={owner.id}>
                    <TableCell className="font-medium">{owner.name}</TableCell>
                    <TableCell>{owner.venues}</TableCell>
                    <TableCell>{owner.revenue}</TableCell>
                    <TableCell>{owner.joinedDate}</TableCell>
                    <TableCell>
                      <Select defaultValue={owner.status} onValueChange={(val) => handleStatusChange(owner.id, val)}>
                        <SelectTrigger className={`w-[160px] h-8 text-xs border ${
                          owner.status === 'Verified' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                            : owner.status === 'Pending Verification'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Verified">Verified</SelectItem>
                          <SelectItem value="Pending Verification">Pending Verification</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {owner.status !== 'Verified' && (
                            <DropdownMenuItem className="cursor-pointer text-emerald-500 focus:text-emerald-500" onClick={() => handleStatusChange(owner.id, 'Verified')}>
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                            </DropdownMenuItem>
                          )}
                          {owner.status !== 'Rejected' && (
                            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => handleStatusChange(owner.id, 'Rejected')}>
                              <XCircle className="mr-2 h-4 w-4" /> Reject
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
