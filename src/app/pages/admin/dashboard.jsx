import { motion } from "motion/react";
import { Users, MapPin, CalendarDays, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export function AdminDashboard() {
  const stats = [
    { title: "Total Users", value: "12,450", icon: Users, color: "text-blue-500" },
    { title: "Total Turfs", value: "342", icon: MapPin, color: "text-emerald-500" },
    { title: "Active Games", value: "89", icon: CalendarDays, color: "text-purple-500" },
    { title: "Total Revenue", value: "₹45.2L", icon: IndianRupee, color: "text-orange-500" }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-border/40 bg-card/30 shadow-sm backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/40 bg-card/30 shadow-sm backdrop-blur-sm">
          <CardHeader><CardTitle className="text-foreground">Recent Activity</CardTitle></CardHeader>
          <CardContent className="text-sm text-foreground">
            <ul className="space-y-4">
              <li className="flex gap-4"><div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500"></div><div className="text-muted-foreground"><strong className="text-foreground">New User Registered:</strong> John Doe</div></li>
              <li className="flex gap-4"><div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div><div className="text-muted-foreground"><strong className="text-foreground">Turf Approved:</strong> Green Arena</div></li>
              <li className="flex gap-4"><div className="w-2 h-2 mt-1.5 rounded-full bg-purple-500"></div><div className="text-muted-foreground"><strong className="text-foreground">Game Created:</strong> Football 5v5</div></li>
            </ul>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/30 shadow-sm backdrop-blur-sm">
          <CardHeader><CardTitle className="text-foreground">Revenue Analytics</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground h-48 flex items-center justify-center border-dashed border-2 border-border/40 rounded-lg m-4">
            [Chart Placeholder]
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}