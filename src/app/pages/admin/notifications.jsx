import { motion } from "motion/react";
import { Search, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function AdminNotifications() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Notifications</h1>
          <p className="text-muted-foreground">Send and manage push notifications.</p>
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
                  <TableHead>Title</TableHead>
                  <TableHead>Target Audience</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead>Open Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Server Maintenance</TableCell>
                  <TableCell>All Users</TableCell>
                  <TableCell>Oct 20, 2024</TableCell>
                  <TableCell>45%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>New Turf in Mumbai!</TableCell>
                  <TableCell>Mumbai Users</TableCell>
                  <TableCell>Oct 22, 2024</TableCell>
                  <TableCell>62%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>50% Off Weekend</TableCell>
                  <TableCell>All Users</TableCell>
                  <TableCell>Oct 23, 2024</TableCell>
                  <TableCell>88%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Update App</TableCell>
                  <TableCell>Android Users</TableCell>
                  <TableCell>Oct 24, 2024</TableCell>
                  <TableCell>31%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
