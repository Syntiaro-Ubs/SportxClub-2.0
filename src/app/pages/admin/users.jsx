import { useState } from "react";
import { motion } from "motion/react";
import { Search, MoreVertical, Edit, Ban, CheckCircle2, Trash2, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const initialMockUsers = [
  { id: 1, name: "Rahul Sharma", email: "rahul.s@example.com", phone: "+91 9876543210", city: "Mumbai", role: "Player", status: "Active", joinedDate: "2023-01-15", gamesPlayed: 45, bookings: 12, avatar: "https://i.pravatar.cc/150?u=1" },
  { id: 2, name: "Priya Patel", email: "priya.p@example.com", phone: "+91 8765432109", city: "Delhi", role: "Captain", status: "Active", joinedDate: "2023-03-22", gamesPlayed: 120, bookings: 34, avatar: "https://i.pravatar.cc/150?u=2" },
  { id: 3, name: "Amit Kumar", email: "amit.k@example.com", phone: "+91 7654321098", city: "Bangalore", role: "Player", status: "Suspended", joinedDate: "2023-06-10", gamesPlayed: 15, bookings: 2, avatar: "https://i.pravatar.cc/150?u=3" },
  { id: 4, name: "Sneha Reddy", email: "sneha.r@example.com", phone: "+91 6543210987", city: "Hyderabad", role: "Player", status: "Active", joinedDate: "2023-08-05", gamesPlayed: 8, bookings: 1, avatar: "https://i.pravatar.cc/150?u=4" },
  { id: 5, name: "Vikram Singh", email: "vikram.s@example.com", phone: "+91 5432109876", city: "Pune", role: "Captain", status: "Active", joinedDate: "2022-11-20", gamesPlayed: 210, bookings: 85, avatar: "https://i.pravatar.cc/150?u=5" },
];

export function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState(initialMockUsers);

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
  };

  const handleStatusChange = (userId, newStatus) => {
    setUsers(users.map(user => user.id === userId ? { ...user, status: newStatus } : user));
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">User Management</h2>
          <p className="text-muted-foreground">Manage all registered users on the platform.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button>Export CSV</Button>
        </div>
      </div>

      <Card className="border-border/40 shadow-sm bg-card/30">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center w-full max-w-sm space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, email, or city..."
                className="pl-9 bg-background/50 border-border/40"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/40">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Stats</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredUsers.map((user) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    key={user.id} 
                    className="hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border/40">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-foreground">{user.name}</div>
                          <div className="text-xs text-muted-foreground">Joined {user.joinedDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-foreground">{user.city}</td>
                    <td className="px-6 py-4">
                      <Select defaultValue={user.role} onValueChange={(val) => handleRoleChange(user.id, val)}>
                        <SelectTrigger className="w-[110px] h-8 text-xs bg-transparent border-border/50">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Player">Player</SelectItem>
                          <SelectItem value="Captain">Captain</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div><span className="text-muted-foreground">Games:</span> <span className="font-medium text-foreground">{user.gamesPlayed}</span></div>
                        <div><span className="text-muted-foreground">Bookings:</span> <span className="font-medium text-foreground">{user.bookings}</span></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Select defaultValue={user.status} onValueChange={(val) => handleStatusChange(user.id, val)}>
                        <SelectTrigger className={`w-[110px] h-8 text-xs border ${
                          user.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Edit Profile
                          </DropdownMenuItem>
                          {user.status === 'Active' ? (
                            <DropdownMenuItem className="cursor-pointer text-orange-500 focus:text-orange-500" onClick={() => handleStatusChange(user.id, 'Suspended')}>
                              <Ban className="mr-2 h-4 w-4" /> Suspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="cursor-pointer text-emerald-500 focus:text-emerald-500" onClick={() => handleStatusChange(user.id, 'Active')}>
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}