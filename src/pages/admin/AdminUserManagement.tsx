import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  Ban,
  CheckCircle2,
  ShieldAlert,
  UserCheck,
  UserX,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type UserRole = "student" | "faculty" | "alumni" | "admin";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string;
  year?: string;
  isBanned: boolean;
  banReason?: string;
  bannedAt?: string;
  createdAt?: string;
}

// ✅ normalize base URL (remove trailing /api if present)
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api$/, "");

export default function AdminUserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all");

  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Load users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/admin/users`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await res.json();
        setUsers(data);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const status: "active" | "banned" = user.isBanned ? "banned" : "active";
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => !u.isBanned).length,
    banned: users.filter((u) => u.isBanned).length,
    students: users.filter((u) => u.role === "student").length,
    faculty: users.filter((u) => u.role === "faculty").length,
    alumni: users.filter((u) => u.role === "alumni").length,
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const openBanDialog = (user: User) => {
    setSelectedUser(user);
    setBanReason("");
    setBanDialogOpen(true);
  };

  const openUnbanDialog = (user: User) => {
    setSelectedUser(user);
    setUnbanDialogOpen(true);
  };

  const handleBan = async () => {
    if (!selectedUser) return;
    if (!banReason.trim()) {
      toast.error("Please provide a reason for banning the user");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${selectedUser._id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: banReason }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to ban user");
      }

      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id
            ? {
                ...u,
                isBanned: true,
                banReason: data.user.banReason,
                bannedAt: data.user.bannedAt,
              }
            : u,
        ),
      );

      toast.success(`User ${selectedUser.fullName} has been banned`);
      setBanDialogOpen(false);
      setSelectedUser(null);
      setBanReason("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to ban user");
    }
  };

  const handleUnban = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${selectedUser._id}/unban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to unban user");
      }

      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id
            ? { ...u, isBanned: false, banReason: undefined, bannedAt: undefined }
            : u,
        ),
      );

      toast.success(`User ${selectedUser.fullName} has been unbanned`);
      setUnbanDialogOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to unban user");
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.isBanned) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Ban className="w-3 h-3" /> Banned
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1 text-green-500 border-green-500/40"
      >
        <CheckCircle2 className="w-3 h-3" /> Active
      </Badge>
    );
  };

  const getRoleBadge = (role: UserRole) => {
    const map: Record<UserRole, string> = {
      admin: "bg-purple-500/10 text-purple-400",
      faculty: "bg-blue-500/10 text-blue-400",
      student: "bg-emerald-500/10 text-emerald-400",
      alumni: "bg-amber-500/10 text-amber-400",
    };
    return (
      <span className={`text-xs px-2 py-1 rounded ${map[role]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Monitor users, ban abusive accounts, and maintain a safe campus community.
            </p>
          </div>
          <ShieldAlert className="w-10 h-10 text-primary" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-5 text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <p className="text-2xl font-bold text-emerald-500">{stats.active}</p>
              <p className="text-xs text-muted-foreground mt-1">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <p className="text-2xl font-bold text-red-500">{stats.banned}</p>
              <p className="text-xs text-muted-foreground mt-1">Banned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <p className="text-2xl font-bold text-primary">{stats.students}</p>
              <p className="text-xs text-muted-foreground mt-1">Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <p className="text-2xl font-bold text-primary">{stats.faculty}</p>
              <p className="text-xs text-muted-foreground mt-1">Faculty</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 text-center">
              <p className="text-2xl font-bold text-primary">{stats.alumni}</p>
              <p className="text-xs text-muted-foreground mt-1">Alumni</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Role filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select
                  value={roleFilter}
                  onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="alumni">Alumni</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status filter */}
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>{filteredUsers.length} user(s) found</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users match the current filters.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => {
                  const status: "active" | "banned" = user.isBanned ? "banned" : "active";
                  return (
                    <div
                      key={user._id}
                      className={`p-4 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        status === "banned" ? "border-red-500/50 bg-red-500/5" : ""
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{user.fullName}</span>
                          {getRoleBadge(user.role)}
                          {getStatusBadge(user)}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {user.department && <span>Dept: {user.department}</span>}
                          {user.year && <span>Year: {user.year}</span>}
                          {user.createdAt && (
                            <span>Joined: {formatDateTime(user.createdAt)}</span>
                          )}
                          {user.isBanned && user.bannedAt && (
                            <span>Banned at: {formatDateTime(user.bannedAt)}</span>
                          )}
                        </div>
                        {user.isBanned && user.banReason && (
                          <p className="text-xs text-red-500 mt-1">
                            Ban reason: {user.banReason}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 shrink-0">
                        {status === "active" ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex items-center gap-1"
                            onClick={() => openBanDialog(user)}
                          >
                            <UserX className="w-4 h-4" />
                            Ban
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={() => openUnbanDialog(user)}
                          >
                            <UserCheck className="w-4 h-4" />
                            Unban
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ban Dialog */}
        <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ban User</DialogTitle>
              <DialogDescription>
                You are about to ban{" "}
                <span className="font-semibold">{selectedUser?.fullName}</span>. This user will
                not be able to login until unbanned by an admin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <p className="text-sm font-medium">Reason for ban (required)</p>
              <Textarea
                placeholder="Describe what policy the user violated (e.g., repeated abusive language, spamming, etc.)"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleBan}>
                <Ban className="w-4 h-4 mr-1" />
                Confirm Ban
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Unban Dialog */}
        <Dialog open={unbanDialogOpen} onOpenChange={setUnbanDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unban User</DialogTitle>
              <DialogDescription>
                Restore access for{" "}
                <span className="font-semibold">{selectedUser?.fullName}</span>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUnbanDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="default" onClick={handleUnban}>
                <UserCheck className="w-4 h-4 mr-1" />
                Unban User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
