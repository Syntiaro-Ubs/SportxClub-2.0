import { motion } from "motion/react";
import { Search, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function AdminPayments() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Transactions</h1>
          <p className="text-muted-foreground">Monitor platform revenue and payouts.</p>
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
                  <TableHead>Txn ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>TX-10029</TableCell>
                  <TableCell>Rahul M.</TableCell>
                  <TableCell>₹1,200</TableCell>
                  <TableCell>UPI</TableCell>
                  <TableCell>Oct 24, 2024</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-none font-medium">Success</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>TX-10030</TableCell>
                  <TableCell>Amit K.</TableCell>
                  <TableCell>₹2,500</TableCell>
                  <TableCell>Credit Card</TableCell>
                  <TableCell>Oct 25, 2024</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-none font-medium">Success</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>TX-10031</TableCell>
                  <TableCell>Priya S.</TableCell>
                  <TableCell>₹800</TableCell>
                  <TableCell>Debit Card</TableCell>
                  <TableCell>Oct 25, 2024</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 border-none font-medium">Failed</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>TX-10032</TableCell>
                  <TableCell>Vikram D.</TableCell>
                  <TableCell>₹1,500</TableCell>
                  <TableCell>UPI</TableCell>
                  <TableCell>Oct 26, 2024</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-none font-medium">Success</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
