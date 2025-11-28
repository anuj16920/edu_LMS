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
  Download,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/integrations/supabase/client";

interface Submission {
  _id: string;
  studentName: string;
  studentEmail: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  submittedAt: string;
  grade: number | null;
  feedback: string;
  status: string;
}

interface Assignment {
  _id: string;
  title: string;
  course: string;
  description: string;
  deadline: string;
  totalMarks: number;
  status: string;
  submissions: Submission[];
  createdByName: string;
  createdAt: string;
}

const FacultyAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    course: "",
    description: "",
    deadline: "",
    totalMarks: "100",
  });

  // Grading state
  const [gradingData, setGradingData] = useState<{
    [key: string]: { grade: string; feedback: string };
  }>({});

  // Fetch assignments
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/assignments");
      setAssignments(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to fetch assignments");
    } finally {
      setLoading(false);
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
      await apiClient.post("/assignments", formData);
      toast.success("Assignment created successfully!");
      setIsAddDialogOpen(false);
      resetForm();
      fetchAssignments();
    } catch (error: any) {
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
      toast.error(error.response?.data?.error || "Failed to delete assignment");
    }
  };

  // Handle view submissions
  const handleViewSubmissions = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsViewDialogOpen(true);
    
    // Initialize grading data
    const initialGradingData: any = {};
    assignment.submissions.forEach((sub) => {
      initialGradingData[sub._id] = {
        grade: sub.grade?.toString() || "",
        feedback: sub.feedback || "",
      };
    });
    setGradingData(initialGradingData);
  };

  // Handle grade submission
  const handleGradeSubmission = async (submissionId: string) => {
    if (!selectedAssignment) return;

    const gradeInfo = gradingData[submissionId];
    if (!gradeInfo.grade) {
      toast.error("Please enter a grade");
      return;
    }

    try {
      await apiClient.post(
        `/assignments/${selectedAssignment._id}/grade/${submissionId}`,
        {
          grade: parseInt(gradeInfo.grade),
          feedback: gradeInfo.feedback,
        }
      );
      toast.success("Submission graded successfully!");
      fetchAssignments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to grade submission");
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

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <DashboardLayout role="faculty">
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
                    placeholder="Assignment instructions..."
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
                <p className="text-2xl font-bold">{assignments.length}</p>
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
                <p className="text-2xl font-bold">
                  {assignments.filter((a) => a.status === "ongoing").length}
                </p>
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
                <p className="text-2xl font-bold">
                  {assignments.reduce((sum, a) => sum + a.submissions.length, 0)}
                </p>
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
                <p className="text-2xl font-bold">85%</p>
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
              placeholder="Search assignments..."
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
              <p className="text-muted-foreground">Loading...</p>
            </Card>
          ) : filteredAssignments.length === 0 ? (
            <Card className="p-12 text-center border-border/50 bg-card/50">
              <p className="text-muted-foreground">No assignments yet</p>
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
                      <span className="px-2 py-1 rounded text-xs font-medium bg-cyan-500/10 text-cyan-500">
                        {assignment.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary">
                        {assignment.course}
                      </span>
                      <span>Due: {formatDate(assignment.deadline)}</span>
                      <span>{assignment.submissions.length} submitted</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mt-3">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-cyan-glow"
                        style={{
                          width: `${
                            (assignment.submissions.length / 45) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewSubmissions(assignment)}
                      className="border-border hover:bg-primary/10"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Submissions
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteAssignment(assignment._id)}
                      className="border-border hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* View Submissions Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="bg-card border-border max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Submissions - {selectedAssignment?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {selectedAssignment?.submissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No submissions yet
                </p>
              ) : (
                selectedAssignment?.submissions.map((submission) => (
                  <Card key={submission._id} className="p-4 border-border/50 bg-secondary/20">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{submission.studentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {submission.studentEmail}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted: {formatDate(submission.submittedAt)}
                          </p>
                        </div>
                        <a
                          href={`http://localhost:5000${submission.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download ({formatFileSize(submission.fileSize)})
                          </Button>
                        </a>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium mb-1 block">
                            Grade (out of {selectedAssignment.totalMarks})
                          </label>
                          <Input
                            type="number"
                            value={gradingData[submission._id]?.grade || ""}
                            onChange={(e) =>
                              setGradingData({
                                ...gradingData,
                                [submission._id]: {
                                  ...gradingData[submission._id],
                                  grade: e.target.value,
                                },
                              })
                            }
                            placeholder="Enter grade"
                            className="bg-secondary/50 border-border"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1 block">
                            Feedback
                          </label>
                          <Input
                            value={gradingData[submission._id]?.feedback || ""}
                            onChange={(e) =>
                              setGradingData({
                                ...gradingData,
                                [submission._id]: {
                                  ...gradingData[submission._id],
                                  feedback: e.target.value,
                                },
                              })
                            }
                            placeholder="Optional feedback"
                            className="bg-secondary/50 border-border"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => handleGradeSubmission(submission._id)}
                        size="sm"
                        className="bg-gradient-to-r from-primary to-cyan-glow"
                      >
                        {submission.status === "graded" ? "Update Grade" : "Submit Grade"}
                      </Button>
                      {submission.status === "graded" && (
                        <div className="mt-2 p-2 bg-green-500/10 rounded">
                          <p className="text-sm text-green-500">
                            ✓ Graded: {submission.grade}/{selectedAssignment.totalMarks}
                            {submission.feedback && ` - ${submission.feedback}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default FacultyAssignments;
