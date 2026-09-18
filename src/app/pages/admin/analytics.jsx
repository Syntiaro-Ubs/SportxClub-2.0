import { motion } from "motion/react";
import { Search, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function AdminAnalytics() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-muted-foreground">Key metrics and performance overview.</p>
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
                  <TableHead>Metric</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Previous Month</TableHead>
                  <TableHead>Growth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Total Users</TableCell>
                  <TableCell>24,592</TableCell>
                  <TableCell>21,300</TableCell>
                  <TableCell>+15.4%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Active Turfs</TableCell>
                  <TableCell>1,204</TableCell>
                  <TableCell>1,150</TableCell>
                  <TableCell>+4.7%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Monthly Revenue</TableCell>
                  <TableCell>₹45,23,000</TableCell>
                  <TableCell>₹38,50,000</TableCell>
                  <TableCell>+17.5%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total Bookings</TableCell>
                  <TableCell>15,890</TableCell>
                  <TableCell>14,200</TableCell>
                  <TableCell>+11.9%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
