import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Mail, Phone, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

interface Faculty {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  courses: string[];
}

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    courses: "",
  });

  // Fetch faculty list
  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/faculty");
      console.log("✅ Faculty fetched:", response.data);
      setFaculty(response.data);
    } catch (error: any) {
      console.error("❌ Error fetching faculty:", error);
      toast.error(error.response?.data?.error || "Failed to fetch faculty");
    } finally {
      setLoading(false);
    }
  };

  // Load faculty on mount
  useEffect(() => {
    fetchFaculty();
  }, []);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle add faculty
  const handleAddFaculty = async () => {
    if (!formData.fullName || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      console.log("📤 Adding faculty:", formData);
      const response = await apiClient.post("/faculty", formData);
      console.log("✅ Faculty added:", response.data);
      
      toast.success("Faculty member added successfully!");
      setIsAddDialogOpen(false);
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        department: "",
        courses: "",
      });
      
      // Refresh faculty list
      fetchFaculty();
    } catch (error: any) {
      console.error("❌ Error adding faculty:", error);
      toast.error(error.response?.data?.error || "Failed to add faculty");
    }
  };

  // Handle edit faculty
  const handleEditClick = (facultyMember: Faculty) => {
    setEditingFaculty(facultyMember);
    setFormData({
      fullName: facultyMember.fullName,
      email: facultyMember.email,
      phone: facultyMember.phone || "",
      department: facultyMember.department || "",
      courses: facultyMember.courses ? facultyMember.courses.join(", ") : "",
    });
    setIsEditDialogOpen(true);
  };

  // Handle update faculty
  const handleUpdateFaculty = async () => {
    if (!editingFaculty) return;

    try {
      console.log("📤 Updating faculty:", editingFaculty._id, formData);
      const response = await apiClient.put(`/faculty/${editingFaculty._id}`, formData);
      console.log("✅ Faculty updated:", response.data);
      
      toast.success("Faculty member updated successfully!");
      setIsEditDialogOpen(false);
      setEditingFaculty(null);
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        department: "",
        courses: "",
      });
      
      // Refresh faculty list
      fetchFaculty();
    } catch (error: any) {
      console.error("❌ Error updating faculty:", error);
      toast.error(error.response?.data?.error || "Failed to update faculty");
    }
  };

  // Handle delete faculty
  const handleDeleteFaculty = async (id: string) => {
    if (!confirm("Are you sure you want to delete this faculty member?")) return;

    try {
      console.log("🗑️ Deleting faculty:", id);
      await apiClient.delete(`/faculty/${id}`);
      console.log("✅ Faculty deleted");
      
      toast.success("Faculty member deleted successfully!");
      fetchFaculty();
    } catch (error: any) {
      console.error("❌ Error deleting faculty:", error);
      toast.error(error.response?.data?.error || "Failed to delete faculty");
    }
  };

  // Filter faculty by search query
  const filteredFaculty = faculty.filter((f) =>
    f.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
              Faculty Management
            </h1>
            <p className="text-muted-foreground mt-2">Manage faculty members and their courses</p>
          </div>

          {/* Add Faculty Button */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-cyan-glow hover:shadow-neon">
                <Plus className="w-4 h-4 mr-2" />
                Add Faculty
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Add New Faculty Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name</label>
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Dr. John Doe"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@college.edu"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 234-567-8900"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Department</label>
                  <Input
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="Computer Science"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Courses</label>
                  <Input
                    name="courses"
                    value={formData.courses}
                    onChange={handleInputChange}
                    placeholder="Data Structures, Algorithms"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <Button
                  onClick={handleAddFaculty}
                  className="w-full bg-gradient-to-r from-primary to-cyan-glow"
                >
                  Add Faculty
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <Card className="p-4 border-border/50 bg-card/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search faculty by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
        </Card>

        {/* Faculty List */}
        {loading ? (
          <Card className="p-12 text-center border-border/50 bg-card/50">
            <p className="text-muted-foreground">Loading faculty...</p>
          </Card>
        ) : filteredFaculty.length === 0 ? (
          <Card className="p-12 text-center border-border/50 bg-card/50">
            <p className="text-muted-foreground">
              {searchQuery ? "No faculty found matching your search" : "No faculty members yet. Add one to get started!"}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredFaculty.map((facultyMember) => (
              <Card
                key={facultyMember._id}
                className="p-6 border-border/50 bg-card/50 hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {facultyMember.fullName}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{facultyMember.email}</span>
                      </div>
                      {facultyMember.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">{facultyMember.phone}</span>
                        </div>
                      )}
                      {facultyMember.department && (
                        <div className="text-sm">
                          <span className="text-primary font-medium">Department: </span>
                          <span className="text-foreground">{facultyMember.department}</span>
                        </div>
                      )}
                      {facultyMember.courses && facultyMember.courses.length > 0 && (
                        <div className="text-sm">
                          <span className="text-primary font-medium">Courses: </span>
                          <span className="text-foreground">{facultyMember.courses.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditClick(facultyMember)}
                      className="border-border hover:bg-primary/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteFaculty(facultyMember._id)}
                      className="border-border hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Edit Faculty Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Department</label>
                <Input
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Courses</label>
                <Input
                  name="courses"
                  value={formData.courses}
                  onChange={handleInputChange}
                  placeholder="Data Structures, Algorithms"
                  className="bg-secondary/50 border-border"
                />
              </div>
              <Button
                onClick={handleUpdateFaculty}
                className="w-full bg-gradient-to-r from-primary to-cyan-glow"
              >
                Update Faculty
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default FacultyManagement;
