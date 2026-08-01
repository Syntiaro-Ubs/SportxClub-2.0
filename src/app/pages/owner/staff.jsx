import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Switch } from "../../components/ui/switch";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Search,
  Plus,
  User,
  MoreVertical,
  Pencil,
  Trash2,
  Mail,
  Phone,
  ShieldCheck,
  Key,
  Lock,
  Check,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const JOB_ROLES = ["Manager", "Receptionist", "Maintenance", "Security", "Coach"];
const MOCK_TURFS = ["Cricket Ground 1", "Cricket Ground 2", "Premium Football Turf"];

const PERMISSION_OPTIONS = [
  { id: "dashboard", label: "Dashboard", desc: "Overview analytics, active bookings summary & quick actions" },
  { id: "revenue", label: "Revenue", desc: "Earnings breakdown, payout reports & transaction history" },
  { id: "turfs", label: "My Turfs", desc: "Manage turf details, slot schedules, pricing & image gallery" },
  { id: "bookings", label: "Bookings", desc: "View, approve, hold, or cancel real-time slot bookings" },
  { id: "roles", label: "Roles & Staff", desc: "Staff account management, access roles & system permissions" },
  { id: "events", label: "Events & Tournaments", desc: "Create, schedule, and manage local sports tournaments" },
  { id: "calendar", label: "Calendar View", desc: "Full visual schedule calendar for all turfs & slots" },
  { id: "reviews", label: "Customer Reviews", desc: "Read customer feedback, ratings, and respond to reviews" },
  { id: "promotions", label: "Promotions & Offers", desc: "Create promo codes, discounts, and broadcast notifications" },
  { id: "report", label: "Reports & Analytics", desc: "Export detailed sales, attendance, and performance reports" },
  { id: "settings", label: "Settings", desc: "Configure turf owner profile, banking & business details" },
];

const ALL_PERMISSION_IDS = PERMISSION_OPTIONS.map((p) => p.id);

const ROLE_PERMISSIONS_MAP = {
  Manager: ALL_PERMISSION_IDS,
  Receptionist: ["dashboard", "bookings", "calendar", "turfs"],
  Maintenance: ["dashboard", "turfs", "calendar"],
  Security: ["dashboard", "bookings"],
  Coach: ["dashboard", "events", "calendar"],
};

export function StaffManagement() {
  const [staffList, setStaffList] = useState([
    {
      id: "1",
      firstName: "Rahul",
      lastName: "Sharma",
      email: "rahul@sportxclub.com",
      phone: "+91 9876543210",
      password: "password123",
      role: "Manager",
      turf: "Cricket Ground 1",
      isActive: true,
      permissions: ALL_PERMISSION_IDS,
    },
    {
      id: "2",
      firstName: "Amit",
      lastName: "Patel",
      email: "amit@sportxclub.com",
      phone: "+91 9123456789",
      password: "password123",
      role: "Maintenance",
      turf: "Premium Football Turf",
      isActive: true,
      permissions: ["dashboard", "turfs", "calendar"],
    },
    {
      id: "3",
      firstName: "Sneha",
      lastName: "Gupta",
      email: "sneha@sportxclub.com",
      phone: "+91 9988776655",
      password: "password123",
      role: "Receptionist",
      turf: "Cricket Ground 2",
      isActive: false,
      permissions: ["dashboard", "bookings", "calendar", "turfs"],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
    turf: "",
    turfs: [],
    isActive: true,
    permissions: ["dashboard", "bookings"],
  });

  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) =>
      `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (staff.turf || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(staff.turfs) ? staff.turfs.join(" ").toLowerCase() : '').includes(searchQuery.toLowerCase())
    );
  }, [staffList, searchQuery]);

  const handleRoleChange = (role) => {
    const defaultPermissions = ROLE_PERMISSIONS_MAP[role] || ["dashboard", "bookings"];
    setFormData((prev) => ({
      ...prev,
      role,
      permissions: defaultPermissions,
    }));
  };

  const togglePermission = (permId) => {
    setFormData((prev) => {
      const current = prev.permissions || [];
      const updated = current.includes(permId)
        ? current.filter((id) => id !== permId)
        : [...current, permId];
      return { ...prev, permissions: updated };
    });
  };

  const handleOpenModal = (staff = null) => {
    if (staff) {
      setEditingStaff(staff);
      const existingTurfs = Array.isArray(staff.turfs) ? staff.turfs : (staff.turf ? [staff.turf] : [MOCK_TURFS[0]]);
      setFormData({
        ...staff,
        password: staff.password || "••••••••",
        turfs: existingTurfs,
        turf: existingTurfs[0] || staff.turf || MOCK_TURFS[0],
        permissions: staff.permissions || ROLE_PERMISSIONS_MAP[staff.role] || ["dashboard", "bookings"],
      });
    } else {
      setEditingStaff(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "",
        turf: MOCK_TURFS[0],
        turfs: [MOCK_TURFS[0]],
        isActive: true,
        permissions: ["dashboard", "bookings"],
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedTurfs = Array.isArray(formData.turfs) && formData.turfs.length > 0 ? formData.turfs : (formData.turf ? [formData.turf] : []);

    if (!formData.firstName || !formData.lastName || !formData.role || selectedTurfs.length === 0 || !formData.password || !formData.email) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (editingStaff) {
      const updated = staffList.map((s) => (s.id === editingStaff.id ? { ...formData, id: s.id } : s));
      setStaffList(updated);
      localStorage.setItem("staffList", JSON.stringify(updated));
      toast.success("Staff details updated successfully.");
    } else {
      const newStaff = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      };
      const updated = [newStaff, ...staffList];
      setStaffList(updated);
      localStorage.setItem("staffList", JSON.stringify(updated));
      toast.success("New staff added successfully.");
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      const updated = staffList.filter((s) => s.id !== id);
      setStaffList(updated);
      localStorage.setItem("staffList", JSON.stringify(updated));
      toast.success("Staff removed successfully.");
    }
  };

  const toggleStatus = (id) => {
    const updated = staffList.map((s) => {
      if (s.id === id) {
        const newStatus = !s.isActive;
        toast.info(`${s.firstName} is now ${newStatus ? 'Active' : 'Inactive'}`);
        return { ...s, isActive: newStatus };
      }
      return s;
    });
    setStaffList(updated);
    localStorage.setItem("staffList", JSON.stringify(updated));
  };

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto theme-adaptive pb-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground shrink-0">
            Staff & Job Roles
          </h1>
          
          {/* Search Toolbar */}
          <div className="relative w-full sm:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
            <Input
              placeholder="Search staff by name, role, or turf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-background border-2 border-emerald-500/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm w-full shadow-xs"
            />
          </div>
        </div>

        <Button onClick={() => handleOpenModal()} className="border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent hover:bg-emerald-500/10 rounded-xl font-bold px-4 h-10 transition-all flex items-center gap-2 cursor-pointer shadow-xs self-start md:self-auto shrink-0">
          <Plus className="w-4 h-4" />
          Add Staff
        </Button>
      </div>

      {/* Staff Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.length > 0 ? (
          filteredStaff.map((staff) => (
            <Card key={staff.id} className="border-border/40 bg-card/30 backdrop-blur-xl shadow-md transition-all duration-300 hover:shadow-lg rounded-2xl overflow-hidden group">
              <CardContent className="p-0">
                <div className="flex items-start p-4 gap-3">
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <User className="h-5 w-5 text-primary" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-bold text-foreground truncate">
                          {staff.firstName} {staff.lastName}
                        </h3>
                        <Badge variant="outline" className="mt-0.5 bg-muted/40 border-border/60 text-[11px]">
                          {staff.role}
                        </Badge>
                      </div>

                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg -mt-1 -mr-2 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                          <DropdownMenuItem onClick={() => handleOpenModal(staff)} className="cursor-pointer">
                            <Pencil className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(staff.id)} className="cursor-pointer text-rose-500 focus:text-rose-500">
                            <Trash2 className="w-4 h-4 mr-2" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{staff.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{staff.email || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer of Card */}
                <div className="bg-muted/30 px-5 py-3 border-t border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span className="opacity-70">Assigned:</span>
                    <span className="text-foreground font-semibold">{staff.turf}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`status-${staff.id}`} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground cursor-pointer">
                      {staff.isActive ? "Active" : "Inactive"}
                    </Label>
                    <Switch
                      id={`status-${staff.id}`}
                      checked={staff.isActive}
                      onCheckedChange={() => toggleStatus(staff.id)}
                      className="scale-90"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-1 lg:col-span-2 py-16 text-center text-muted-foreground bg-card/20 rounded-2xl border border-border/40">
            <User className="h-10 w-10 mx-auto opacity-20 mb-2" />
            <h4 className="text-base font-bold text-foreground">No Staff Found</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Try adjusting your search criteria or add a new staff member.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Staff Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto rounded-2xl border border-border/40 bg-popover shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-bold flex items-center gap-2 text-xl">
              <User className="h-5 w-5 text-primary" />
              {editingStaff ? "Edit Staff Details" : "Add New Staff"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingStaff ? "Update the information for this staff member." : "Enter the details to register a new employee for your turfs."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-semibold">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="e.g. John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="rounded-lg text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-semibold">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="e.g. Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="rounded-lg text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-lg text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password || ""}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="rounded-lg text-sm bg-transparent focus-visible:bg-transparent border border-emerald-500/40 focus-visible:border-emerald-500 shadow-none focus-visible:ring-0 selection:bg-transparent selection:text-foreground"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Job Role Column (Left) */}
              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs font-semibold">Job Role *</Label>
                <Select value={formData.role} onValueChange={handleRoleChange} required>
                  <SelectTrigger id="role" className="rounded-lg text-sm">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {JOB_ROLES.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned Turf Column (Right - Dropdown with Checkboxes inside) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Assigned Turf *</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center justify-between w-full h-9 px-3 rounded-lg border border-input bg-transparent text-xs font-medium transition-all hover:bg-muted/40 cursor-pointer shadow-none outline-none"
                    >
                      <span className="truncate text-foreground">
                        {(() => {
                          const currentTurfs = Array.isArray(formData.turfs) ? formData.turfs : (formData.turf ? [formData.turf] : []);
                          if (currentTurfs.length === 0) return "Select turfs";
                          if (currentTurfs.length === 1) return currentTurfs[0];
                          return `${currentTurfs.length} Turfs Selected`;
                        })()}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 ml-1 shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 p-1.5 rounded-xl border border-border/60 shadow-xl space-y-1 bg-popover" align="start">
                    {MOCK_TURFS.map((turf) => {
                      const currentTurfs = Array.isArray(formData.turfs) ? formData.turfs : (formData.turf ? [formData.turf] : []);
                      const isChecked = currentTurfs.includes(turf);
                      return (
                        <div
                          key={turf}
                          onClick={(e) => {
                            e.preventDefault();
                            const nextTurfs = isChecked
                              ? currentTurfs.filter((t) => t !== turf)
                              : [...currentTurfs, turf];
                            setFormData({ ...formData, turfs: nextTurfs, turf: nextTurfs[0] || "" });
                          }}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer select-none ${
                            isChecked
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                              : "text-foreground hover:bg-muted/50"
                          }`}
                        >
                          <div className={`h-4 w-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                            isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-border/60 bg-background"
                          }`}>
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{turf}</span>
                        </div>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Granular Access Permissions Section */}
            <div className="border border-border/40 rounded-xl p-3.5 bg-muted/10 space-y-2.5 mt-1">
              <div className="flex items-center justify-between border-b border-border/30 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <Label className="text-xs font-bold text-foreground uppercase tracking-wider">Access Permissions</Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, permissions: PERMISSION_OPTIONS.map(p => p.id) }))}
                    className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-muted-foreground text-[10px]">&bull;</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, permissions: [] }))}
                    className="text-[10px] font-bold text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                {PERMISSION_OPTIONS.map((perm) => {
                  const isChecked = (formData.permissions || []).includes(perm.id);
                  return (
                    <div
                      key={perm.id}
                      onClick={() => togglePermission(perm.id)}
                      className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all cursor-pointer select-none ${isChecked
                        ? "bg-emerald-500/10 border-emerald-500/40 text-foreground shadow-2xs"
                        : "bg-background/50 border-border/40 text-muted-foreground hover:bg-accent/40"
                        }`}
                    >
                      <div className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center border shrink-0 transition-colors ${isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-border/60 bg-background"
                        }`}>
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold leading-tight text-foreground">{perm.label}</p>
                        <p className="text-[9.5px] text-muted-foreground leading-tight">{perm.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between border border-border/50 rounded-xl p-3.5 bg-muted/20 mt-1">
              <div className="space-y-0.5">
                <Label htmlFor="active-status" className="text-sm font-semibold cursor-pointer">Account Status</Label>
                <p className="text-[10px] text-muted-foreground">Is this staff member currently active?</p>
              </div>
              <Switch
                id="active-status"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <DialogFooter className="mt-6 pt-4 border-t border-border/40 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl font-bold w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl font-bold w-full sm:w-auto"
              >
                {editingStaff ? "Save Changes" : "Create Staff Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
