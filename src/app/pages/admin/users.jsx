import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, MoreVertical, Edit, Ban, CheckCircle2, Trash2, Plus, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { adminApi } from "../../services/admin-api";

export function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "user123",
    role: "Player",
    phone: "",
    city: "Mumbai",
    status: "Active",
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAll("users");
      setUsers(data);
    } catch (err) {
      console.warn("Failed loading users from MySQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const newUser = await adminApi.create("users", {
        ...formData,
        joined_date: new Date().toISOString().split("T")[0],
        avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(formData.email)}`
      });
      setUsers([newUser, ...users]);
      setIsAddOpen(false);
      setFormData({ full_name: "", email: "", password: "user123", role: "Player", phone: "", city: "Mumbai", status: "Active" });
    } catch (err) {
      alert("Error adding user: " + err.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const updated = await adminApi.update("users", editingUser.id, formData);
      setUsers(users.map((u) => (u.id === editingUser.id ? updated : u)));
      setIsEditOpen(false);
      setEditingUser(null);
    } catch (err) {
      alert("Error updating user: " + err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updated = await adminApi.update("users", userId, { role: newRole });
      setUsers(users.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      alert("Error changing role: " + err.message);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const updated = await adminApi.update("users", userId, { status: newStatus });
      setUsers(users.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      alert("Error changing status: " + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user from MySQL?")) return;
    try {
      await adminApi.delete("users", userId);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      alert("Error deleting user: " + err.message);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || user.name || "",
      email: user.email || "",
      role: user.role || "Player",
      phone: user.phone || "",
      city: user.city || "",
      status: user.status || "Active",
    });
    setIsEditOpen(true);
  };

  const filteredUsers = users.filter((user) => {
    const name = user.full_name || user.name || "";
    const email = user.email || "";
    const city = user.city || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">User Management</h2>
          <p className="text-muted-foreground">Manage all registered users dynamically in MySQL (`users` table).</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadUsers} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => {
            setFormData({ full_name: "", email: "", password: "user123", role: "Player", phone: "", city: "Mumbai", status: "Active" });
            setIsAddOpen(true);
          }} className="gap-2">
            <Plus className="h-4 w-4" /> Add User
          </Button>
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
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-muted-foreground">Loading users from MySQL...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-muted-foreground">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const userName = user.full_name || user.name || "User";
                    return (
                      <motion.tr key={user.id} className="hover:bg-accent/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-border/40">
                              <AvatarImage src={user.avatar} alt={userName} />
                              <AvatarFallback className="bg-primary/10 text-primary">{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-foreground">{userName}</div>
                              <div className="text-xs text-muted-foreground">Joined {user.joined_date || user.joinedDate || "Recent"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-foreground">{user.email}</div>
                          <div className="text-xs text-muted-foreground">{user.phone || "-"}</div>
                        </td>
                        <td className="px-6 py-4 text-foreground">{user.city || "-"}</td>
                        <td className="px-6 py-4">
                          <Select value={user.role} onValueChange={(val) => handleRoleChange(user.id, val)}>
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
                            <div><span className="text-muted-foreground">Games:</span> <span className="font-medium text-foreground">{user.games_played ?? user.gamesPlayed ?? 0}</span></div>
                            <div><span className="text-muted-foreground">Bookings:</span> <span className="font-medium text-foreground">{user.bookings ?? 0}</span></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Select value={user.status} onValueChange={(val) => handleStatusChange(user.id, val)}>
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
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem className="cursor-pointer" onClick={() => openEditModal(user)}>
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
                              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => handleDeleteUser(user.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 py-2">
            <div>
              <Label>Full Name</Label>
              <Input
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. john@example.com"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Mumbai"
                />
              </div>
            </div>
            <div>
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Player">Player</SelectItem>
                  <SelectItem value="Captain">Captain</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4 py-2">
            <div>
              <Label>Full Name</Label>
              <Input
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Player">Player</SelectItem>
                    <SelectItem value="Captain">Captain</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}