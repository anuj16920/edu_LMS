import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  FileText,
  Clock,
  CheckCircle,
  Users,
  Eye,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/integrations/supabase/client";

interface Assignment {
  _id: string;
  title: string;
  course: string;
  description: string;
  deadline: string;
  totalMarks: number;
  status: string;
  submissions: any[];
  createdByName: string;
  createdAt: string;
}

interface AssignmentStats {
  totalAssignments: number;
  ongoingAssignments: number;
  totalSubmissions: number;
  averageScore: number;
}

const AssignmentManagement = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<AssignmentStats>({
    totalAssignments: 0,
    ongoingAssignments: 0,
    totalSubmissions: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    course: "",
    description: "",
    deadline: "",
    totalMarks: "100",
  });

  // Fetch assignments
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/assignments");
      console.log("✅ Assignments fetched:", response.data);
      setAssignments(response.data);
      fetchStats();
    } catch (error: any) {
      console.error("❌ Error fetching assignments:", error);
      toast.error(error.response?.data?.error || "Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/assignments/stats/summary");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle create assignment
  const handleCreateAssignment = async () => {
    if (!formData.title || !formData.course || !formData.deadline) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      console.log("📤 Creating assignment:", formData);

      const response = await apiClient.post("/assignments", formData);
      console.log("✅ Assignment created:", response.data);

      toast.success("Assignment created successfully!");
      setIsAddDialogOpen(false);
      resetForm();
      fetchAssignments();
    } catch (error: any) {
      console.error("❌ Error creating assignment:", error);
      toast.error(error.response?.data?.error || "Failed to create assignment");
    }
  };

  // Handle delete assignment
  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      await apiClient.delete(`/assignments/${id}`);
      toast.success("Assignment deleted successfully!");
      fetchAssignments();
    } catch (error: any) {
      console.error("❌ Error deleting assignment:", error);
      toast.error(error.response?.data?.error || "Failed to delete assignment");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      course: "",
      description: "",
      deadline: "",
      totalMarks: "100",
    });
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if deadline passed
  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
              Assignment Management
            </h1>
            <p className="text-muted-foreground mt-2">Create and grade assignments</p>
          </div>

          {/* Create Assignment Button */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-cyan-glow hover:shadow-neon">
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  Create New Assignment
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Assignment Title
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Project title..."
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Course</label>
                    <Input
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      placeholder="CS 201"
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Deadline</label>
                    <Input
                      name="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Total Marks
                  </label>
                  <Input
                    name="totalMarks"
                    type="number"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Description
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Assignment instructions and requirements..."
                    className="bg-secondary/50 border-border min-h-[120px]"
                  />
                </div>
                <Button
                  onClick={handleCreateAssignment}
                  className="w-full bg-gradient-to-r from-primary to-cyan-glow"
                >
                  Create Assignment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-cyan-glow flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalAssignments}</p>
                <p className="text-sm text-muted-foreground">Total Assignments</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-glow to-accent flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.ongoingAssignments}</p>
                <p className="text-sm text-muted-foreground">Ongoing</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSubmissions}</p>
                <p className="text-sm text-muted-foreground">Submissions</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.averageScore}%</p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="p-4 border-border/50 bg-card/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search assignments by title or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
        </Card>

        {/* Assignments List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">All Assignments</h2>
          {loading ? (
            <Card className="p-12 text-center border-border/50 bg-card/50">
              <p className="text-muted-foreground">Loading assignments...</p>
            </Card>
          ) : filteredAssignments.length === 0 ? (
            <Card className="p-12 text-center border-border/50 bg-card/50">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No assignments found matching your search"
                  : "No assignments yet. Create one to get started!"}
              </p>
            </Card>
          ) : (
            filteredAssignments.map((assignment) => (
              <Card
                key={assignment._id}
                className="p-6 border-border/50 bg-card/50 hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{assignment.title}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          assignment.status === "ongoing"
                            ? "bg-cyan-500/10 text-cyan-500"
                            : "bg-green-500/10 text-green-500"
                        }`}
                      >
                        {assignment.status}
                      </span>
                      {isDeadlinePassed(assignment.deadline) && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-500">
                          Expired
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary">
                        {assignment.course}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Due: {formatDate(assignment.deadline)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {assignment.submissions.length} submitted
                      </span>
                      <span>Total Marks: {assignment.totalMarks}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {assignment.description}
                    </p>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mt-3">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-cyan-glow"
                        style={{
                          width: `${
                            assignment.submissions.length > 0
                              ? (assignment.submissions.length / 45) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border hover:bg-primary/10"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Submissions
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteAssignment(assignment._id)}
                      className="border-border hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssignmentManagement;
