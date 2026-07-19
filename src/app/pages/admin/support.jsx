import { motion } from "motion/react";
import { Search, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function AdminSupport() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">Manage user and owner support queries.</p>
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
              <Input placeholder="Search records..." className="pl-9 bg-muted/50" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>User Type</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>#TIC-001</TableCell>
                  <TableCell>Player</TableCell>
                  <TableCell>Payment failed but money deducted</TableCell>
                  <TableCell>High</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 border-none font-medium">Open</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>#TIC-002</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Cannot update turf images</TableCell>
                  <TableCell>Medium</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 border-none font-medium">In Progress</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>#TIC-003</TableCell>
                  <TableCell>Player</TableCell>
                  <TableCell>Refund not received</TableCell>
                  <TableCell>High</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-slate-500/15 text-slate-600 dark:text-slate-400 hover:bg-slate-500/25 border-none font-medium">Resolved</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>#TIC-004</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Requesting payout early</TableCell>
                  <TableCell>Low</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 border-none font-medium">Open</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
