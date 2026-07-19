import { motion } from "motion/react";
import { Search, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function AdminGames() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Game Lobbies</h1>
          <p className="text-muted-foreground">Active open match lobbies.</p>
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
                  <TableHead>Lobby Name</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Players</TableHead>
                  <TableHead>Turf</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Weekend Football</TableCell>
                  <TableCell>Football</TableCell>
                  <TableCell>10/14</TableCell>
                  <TableCell>Green Field Arena</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 border-none font-medium">Filling</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Pro Cricket Box</TableCell>
                  <TableCell>Cricket</TableCell>
                  <TableCell>12/12</TableCell>
                  <TableCell>Super Sports Turf</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border-none font-medium">Full</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Evening Badminton</TableCell>
                  <TableCell>Badminton</TableCell>
                  <TableCell>2/4</TableCell>
                  <TableCell>Elite Club</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 border-none font-medium">Filling</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Sunday Basketball</TableCell>
                  <TableCell>Basketball</TableCell>
                  <TableCell>8/10</TableCell>
                  <TableCell>Hoops Court</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 border-none font-medium">Filling</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
