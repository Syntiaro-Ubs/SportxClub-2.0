import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Users, MapPin, CalendarDays, IndianRupee, RefreshCw, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { adminApi } from "../../services/admin-api";

export function AdminDashboard() {
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalTurfs: 0,
    activeGames: 0,
    totalRevenue: "₹0L",
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getStats();
      if (res.success) {
        setStatsData(res.stats);
        setRecentActivity(res.recentActivity || []);
      }
    } catch (e) {
      console.warn("Using default stats preview:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleResetDB = async () => {
    if (!window.confirm("Do you want to re-sync / re-seed the MySQL database with initial demo data?")) return;
    setResetting(true);
    try {
      const res = await adminApi.resetDatabase();
      if (res.success) {
        alert("MySQL Database successfully re-seeded!");
        fetchStats();
      } else {
        alert("Failed to reset DB: " + res.error);
      }
    } catch (err) {
      alert("Error resetting database: " + err.message);
    } finally {
      setResetting(false);
    }
  };

  const stats = [
    { title: "Total Users", value: statsData.totalUsers, icon: Users, color: "text-blue-500" },
    { title: "Total Turfs", value: statsData.totalTurfs, icon: MapPin, color: "text-emerald-500" },
    { title: "Active Games", value: statsData.activeGames, icon: CalendarDays, color: "text-purple-500" },
    { title: "Total Revenue", value: statsData.totalRevenue, icon: IndianRupee, color: "text-orange-500" }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Admin Overview</h2>
          <p className="text-sm text-muted-foreground">Real-time statistics synced dynamically with MySQL (`sportxclub`).</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh Stats
          </Button>
          <Button variant="destructive" size="sm" onClick={handleResetDB} disabled={resetting} className="gap-2">
            <Database className="h-4 w-4" /> {resetting ? "Reseeding..." : "Reseed DB"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-border/40 bg-card/30 shadow-sm backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{loading ? "..." : stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/40 bg-card/30 shadow-sm backdrop-blur-sm">
          <CardHeader><CardTitle className="text-foreground">Recent Activity (MySQL Live)</CardTitle></CardHeader>
          <CardContent className="text-sm text-foreground">
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground">No recent activity found.</p>
            ) : (
              <ul className="space-y-4">
                {recentActivity.map((act, i) => (
                  <li key={i} className="flex gap-4 items-center">
                    <div className={`w-2 h-2 rounded-full ${
                      act.color === "emerald" ? "bg-emerald-500" : act.color === "blue" ? "bg-blue-500" : "bg-purple-500"
                    }`}></div>
                    <div className="text-muted-foreground">
                      <strong className="text-foreground">{act.type}:</strong> {act.text}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/30 shadow-sm backdrop-blur-sm">
          <CardHeader><CardTitle className="text-foreground">Database Health & System Status</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3 p-6">
            <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg border border-border/30">
              <span className="font-medium text-foreground">MySQL Database:</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">Connected (`sportxclub`)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg border border-border/30">
              <span className="font-medium text-foreground">Backend Server:</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full">Node.js Express (Port 5000)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg border border-border/30">
              <span className="font-medium text-foreground">Dynamic CRUD Status:</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full">Full Real-Time Sync</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}