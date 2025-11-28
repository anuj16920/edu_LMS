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
import { Plus, Search, Mail, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/integrations/supabase/client";

interface Student {
  _id: string;
  fullName: string;
  email: string;
  rollNo: string;
  class: string;
  year: string;
  gpa: number;
}

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    rollNo: "",
    class: "",
    year: "",
    gpa: "",
  });

  // Fetch students list
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/students");
      console.log("✅ Students fetched:", response.data);
      setStudents(response.data);
    } catch (error: any) {
      console.error("❌ Error fetching students:", error);
      toast.error(error.response?.data?.error || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  // Load students on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle add student
  const handleAddStudent = async () => {
    if (!formData.fullName || !formData.email || !formData.rollNo) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      console.log("📤 Adding student:", formData);
      const response = await apiClient.post("/students", {
        ...formData,
        gpa: formData.gpa ? parseFloat(formData.gpa) : 0,
      });
      console.log("✅ Student added:", response.data);
      
      toast.success("Student added successfully!");
      setIsAddDialogOpen(false);
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        rollNo: "",
        class: "",
        year: "",
        gpa: "",
      });
      
      // Refresh students list
      fetchStudents();
    } catch (error: any) {
      console.error("❌ Error adding student:", error);
      toast.error(error.response?.data?.error || "Failed to add student");
    }
  };

  // Handle edit student
  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      email: student.email,
      rollNo: student.rollNo || "",
      class: student.class || "",
      year: student.year || "",
      gpa: student.gpa ? student.gpa.toString() : "",
    });
    setIsEditDialogOpen(true);
  };

  // Handle update student
  const handleUpdateStudent = async () => {
    if (!editingStudent) return;

    try {
      console.log("📤 Updating student:", editingStudent._id, formData);
      const response = await apiClient.put(`/students/${editingStudent._id}`, {
        ...formData,
        gpa: formData.gpa ? parseFloat(formData.gpa) : 0,
      });
      console.log("✅ Student updated:", response.data);
      
      toast.success("Student updated successfully!");
      setIsEditDialogOpen(false);
      setEditingStudent(null);
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        rollNo: "",
        class: "",
        year: "",
        gpa: "",
      });
      
      // Refresh students list
      fetchStudents();
    } catch (error: any) {
      console.error("❌ Error updating student:", error);
      toast.error(error.response?.data?.error || "Failed to update student");
    }
  };

  // Handle delete student
  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      console.log("🗑️ Deleting student:", id);
      await apiClient.delete(`/students/${id}`);
      console.log("✅ Student deleted");
      
      toast.success("Student deleted successfully!");
      fetchStudents();
    } catch (error: any) {
      console.error("❌ Error deleting student:", error);
      toast.error(error.response?.data?.error || "Failed to delete student");
    }
  };

  // Filter students by search query
  const filteredStudents = students.filter((s) =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
              Student Management
            </h1>
            <p className="text-muted-foreground mt-2">Manage students and their enrollments</p>
          </div>

          {/* Add Student Button */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-cyan-glow hover:shadow-neon">
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Add New Student</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name</label>
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
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
                    placeholder="john.doe@student.edu"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Roll Number</label>
                  <Input
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleInputChange}
                    placeholder="CS2024001"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Class</label>
                  <Input
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    placeholder="CS-A"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Year</label>
                  <Input
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="1st Year"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">GPA (Optional)</label>
                  <Input
                    name="gpa"
                    type="number"
                    step="0.1"
                    min="0"
                    max="4"
                    value={formData.gpa}
                    onChange={handleInputChange}
                    placeholder="3.8"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <Button
                  onClick={handleAddStudent}
                  className="w-full bg-gradient-to-r from-primary to-cyan-glow"
                >
                  Add Student
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
              placeholder="Search students by name, email, or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
        </Card>

        {/* Students Table */}
        {loading ? (
          <Card className="p-12 text-center border-border/50 bg-card/50">
            <p className="text-muted-foreground">Loading students...</p>
          </Card>
        ) : filteredStudents.length === 0 ? (
          <Card className="p-12 text-center border-border/50 bg-card/50">
            <p className="text-muted-foreground">
              {searchQuery ? "No students found matching your search" : "No students yet. Add one to get started!"}
            </p>
          </Card>
        ) : (
          <Card className="border-border/50 bg-card/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/30 border-b border-border/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Roll No</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Name</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Email</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Class</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Year</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">GPA</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="p-4">
                        <span className="text-primary font-medium">{student.rollNo || 'N/A'}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-foreground">{student.fullName}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">{student.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/30">
                          {student.class || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-foreground">{student.year || 'N/A'}</span>
                      </td>
                      <td className="p-4">
                        <span className={`font-bold ${
                          student.gpa >= 3.5 ? 'text-green-500' :
                          student.gpa >= 3.0 ? 'text-cyan-500' :
                          student.gpa >= 2.5 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                          {student.gpa ? student.gpa.toFixed(1) : '0.0'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(student)}
                            className="border-border hover:bg-primary/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteStudent(student._id)}
                            className="border-border hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Edit Student</DialogTitle>
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
                <label className="text-sm font-medium mb-2 block">Roll Number</label>
                <Input
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleInputChange}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Class</label>
                <Input
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Year</label>
                <Input
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">GPA</label>
                <Input
                  name="gpa"
                  type="number"
                  step="0.1"
                  min="0"
                  max="4"
                  value={formData.gpa}
                  onChange={handleInputChange}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <Button
                onClick={handleUpdateStudent}
                className="w-full bg-gradient-to-r from-primary to-cyan-glow"
              >
                Update Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default StudentManagement;
