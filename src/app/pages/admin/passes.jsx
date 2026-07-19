import { motion } from "motion/react";
import { Search, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function AdminPasses() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Game Passes</h1>
          <p className="text-muted-foreground">Manage subscription and game passes.</p>
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
                  <TableHead>Pass Name</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Active Subs</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Monthly Pro</TableCell>
                  <TableCell>30 Days</TableCell>
                  <TableCell>₹999</TableCell>
                  <TableCell>1,240</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-none font-medium">Active</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Weekend Warrior</TableCell>
                  <TableCell>Weekends Only</TableCell>
                  <TableCell>₹499</TableCell>
                  <TableCell>850</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-none font-medium">Active</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Annual Elite</TableCell>
                  <TableCell>365 Days</TableCell>
                  <TableCell>₹9,999</TableCell>
                  <TableCell>312</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-none font-medium">Active</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Student Pass</TableCell>
                  <TableCell>30 Days</TableCell>
                  <TableCell>₹599</TableCell>
                  <TableCell>4,500</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-none font-medium">Active</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
