import { motion } from "motion/react";
import { Search, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function AdminReviews() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Reviews</h1>
          <p className="text-muted-foreground">Moderate platform reviews.</p>
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
                  <TableHead>User</TableHead>
                  <TableHead>Turf</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Amit K.</TableCell>
                  <TableCell>Green Field</TableCell>
                  <TableCell>5/5</TableCell>
                  <TableCell>Excellent turf quality!</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-none font-medium">Published</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Suresh R.</TableCell>
                  <TableCell>Box Hub</TableCell>
                  <TableCell>2/5</TableCell>
                  <TableCell>Lighting was very poor.</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-none font-medium">Published</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Priya S.</TableCell>
                  <TableCell>Elite Club</TableCell>
                  <TableCell>4/5</TableCell>
                  <TableCell>Good overall.</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-none font-medium">Published</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Ravi T.</TableCell>
                  <TableCell>Super Turf</TableCell>
                  <TableCell>1/5</TableCell>
                  <TableCell>Inappropriate language.</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 border-none font-medium">Flagged</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
