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
import {
  Search,
  Plus,
  User,
  MoreVertical,
  Pencil,
  Trash2,
  Mail,
  Phone
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

export function StaffManagement() {
  const [staffList, setStaffList] = useState([
    {
      id: "1",
      firstName: "Rahul",
      lastName: "Sharma",
      email: "rahul@sportxclub.com",
      phone: "+91 9876543210",
      role: "Manager",
      turf: "Cricket Ground 1",
      isActive: true,
    },
    {
      id: "2",
      firstName: "Amit",
      lastName: "Patel",
      email: "amit@sportxclub.com",
      phone: "+91 9123456789",
      role: "Maintenance",
      turf: "Premium Football Turf",
      isActive: true,
    },
    {
      id: "3",
      firstName: "Sneha",
      lastName: "Gupta",
      email: "sneha@sportxclub.com",
      phone: "+91 9988776655",
      role: "Receptionist",
      turf: "Cricket Ground 2",
      isActive: false,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    turf: "",
    isActive: true,
  });

  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) =>
      `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.turf.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [staffList, searchQuery]);

  const handleOpenModal = (staff = null) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData(staff);
    } else {
      setEditingStaff(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "",
        turf: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.role || !formData.turf || !formData.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (editingStaff) {
      setStaffList(staffList.map((s) => (s.id === editingStaff.id ? { ...formData, id: s.id } : s)));
      toast.success("Staff details updated successfully.");
    } else {
      const newStaff = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      };
      setStaffList([newStaff, ...staffList]);
      toast.success("New staff added successfully.");
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      setStaffList(staffList.filter((s) => s.id !== id));
      toast.success("Staff removed successfully.");
    }
  };

  const toggleStatus = (id) => {
    setStaffList(staffList.map((s) => {
      if (s.id === id) {
        const newStatus = !s.isActive;
        toast.info(`${s.firstName} is now ${newStatus ? 'Active' : 'Inactive'}`);
        return { ...s, isActive: newStatus };
      }
      return s;
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto theme-adaptive pb-16">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
            Staff & Job Roles
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your turf employees, assign roles, and track their active status.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="rounded-xl font-bold px-5 py-6 shadow-md hover:scale-[1.02] transition-transform flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Staff
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="flex bg-card/20 p-4 rounded-2xl border border-border/40 backdrop-blur-md shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search staff by name, role, or turf..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-background/50 border-border/40 focus:border-primary/50 text-sm w-full"
          />
        </div>
      </div>

      {/* Staff Grid/List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStaff.length > 0 ? (
          filteredStaff.map((staff) => (
            <Card key={staff.id} className="border-border/40 bg-card/30 backdrop-blur-xl shadow-md transition-all duration-300 hover:shadow-lg rounded-2xl overflow-hidden group">
              <CardContent className="p-0">
                <div className="flex items-start p-5 gap-4">
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-foreground truncate">
                          {staff.firstName} {staff.lastName}
                        </h3>
                        <Badge variant="outline" className="mt-1 bg-muted/40 border-border/60 text-xs">
                          {staff.role}
                        </Badge>
                      </div>
                      
                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg -mt-1 -mr-2 text-muted-foreground hover:text-foreground">
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

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
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
        <DialogContent className="sm:max-w-[500px] rounded-2xl border border-border/40 bg-popover shadow-xl">
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
                <Label htmlFor="phone" className="text-xs font-semibold">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="e.g. +91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-lg text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs font-semibold">Job Role *</Label>
                <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })} required>
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
              <div className="space-y-1.5">
                <Label htmlFor="turf" className="text-xs font-semibold">Assigned Turf *</Label>
                <Select value={formData.turf} onValueChange={(val) => setFormData({ ...formData, turf: val })} required>
                  <SelectTrigger id="turf" className="rounded-lg text-sm">
                    <SelectValue placeholder="Select turf" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {MOCK_TURFS.map(turf => (
                      <SelectItem key={turf} value={turf}>{turf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between border border-border/50 rounded-xl p-4 bg-muted/20 mt-2">
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
