import { motion } from "motion/react";
import { Search, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function AdminCoupons() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discount Coupons</h1>
          <p className="text-muted-foreground">Manage promotional codes.</p>
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
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage Limit</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>WELCOME50</TableCell>
                  <TableCell>50% OFF</TableCell>
                  <TableCell>1000</TableCell>
                  <TableCell>845</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-none font-medium">Active</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>FESTIVAL20</TableCell>
                  <TableCell>20% OFF</TableCell>
                  <TableCell>5000</TableCell>
                  <TableCell>4120</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-none font-medium">Active</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>FLAT100</TableCell>
                  <TableCell>₹100 OFF</TableCell>
                  <TableCell>Unlimited</TableCell>
                  <TableCell>12500</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-none font-medium">Active</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SUMMER30</TableCell>
                  <TableCell>30% OFF</TableCell>
                  <TableCell>2000</TableCell>
                  <TableCell>2000</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 border-none font-medium">Expired</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
