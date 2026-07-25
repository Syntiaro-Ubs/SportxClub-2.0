import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Plus, Filter, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function AdminTurfs() {
  const [pendingTurfs, setPendingTurfs] = useState([]);
  const [approvedTurfs, setApprovedTurfs] = useState([]);

  useEffect(() => {
    // Load data from localStorage
    const pTurfs = JSON.parse(localStorage.getItem("pending_turf_approvals") || "[]");
    const aTurfs = JSON.parse(localStorage.getItem("approved_turfs") || "[]");
    
    setPendingTurfs(pTurfs);
    setApprovedTurfs(aTurfs);
  }, []);

  const handleApprove = (id) => {
    const turfToApprove = pendingTurfs.find(t => t.id === id);
    if (!turfToApprove) return;

    const newPending = pendingTurfs.filter(t => t.id !== id);
    const newApproved = [...approvedTurfs, turfToApprove];

    localStorage.setItem("pending_turf_approvals", JSON.stringify(newPending));
    localStorage.setItem("approved_turfs", JSON.stringify(newApproved));

    setPendingTurfs(newPending);
    setApprovedTurfs(newApproved);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registered Turfs</h1>
          <p className="text-muted-foreground">Manage all venues listed on platform.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
          <Button><Plus className="h-4 w-4 mr-2" /> Add New</Button>
        </div>
      </div>

      {pendingTurfs.length > 0 && (
        <Card className="border-amber-500/30 shadow-md shadow-amber-500/5">
          <CardHeader className="pb-3 bg-amber-500/5">
            <CardTitle className="text-amber-600">Pending Approvals</CardTitle>
            <CardDescription>New turf registrations awaiting your review.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Turf Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Sports</TableHead>
                    <TableHead>Owner / Business</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTurfs.map((turf) => (
                    <TableRow key={turf.id}>
                      <TableCell className="font-medium">{turf.turf.name}</TableCell>
                      <TableCell>{turf.location.city}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {turf.turf.sports.map(sport => (
                            <Badge key={sport} variant="outline" className="text-[10px]">{sport}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{turf.business.ownerName || turf.personal.fullName}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => handleApprove(turf.id)}>
                          <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Active Turfs</CardTitle>
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
                  <TableHead>Turf Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Sports</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedTurfs.map((turf) => (
                  <TableRow key={turf.id}>
                    <TableCell className="font-medium">{turf.turf.name}</TableCell>
                    <TableCell>{turf.location.city}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {turf.turf.sports.map(sport => (
                          <Badge key={sport} variant="outline" className="text-[10px]">{sport}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{turf.business.ownerName || turf.personal.fullName}</TableCell>
                    <TableCell><Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-none font-medium">Active</Badge></TableCell>
                  </TableRow>
                ))}
                
                {approvedTurfs.length === 0 && (
                  <TableRow>
                    <TableCell>Green Field Arena (Mock)</TableCell>
                    <TableCell>Andheri West, Mumbai</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">Football</Badge></TableCell>
                    <TableCell>Elite Sports</TableCell>
                    <TableCell><Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-none font-medium">Active</Badge></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
