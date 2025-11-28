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
} from "@/components/ui/dialog";
import {
  Search,
  FileText,
  Clock,
  CheckCircle,
  Upload,
  Award,
  Download,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/integrations/supabase/client";

interface Submission {
  _id: string;
  studentId: string;
  studentName: string;
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

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch assignments
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📥 Fetching assignments...");
      
      const response = await apiClient.get("/assignments");
      console.log("✅ Assignments fetched:", response.data);
      
      if (Array.isArray(response.data)) {
        setAssignments(response.data);
      } else {
        console.error("❌ Invalid data format:", response.data);
        setAssignments([]);
      }
    } catch (error: any) {
      console.error("❌ Error fetching assignments:", error);
      setError(error.response?.data?.error || error.message || "Failed to fetch assignments");
      toast.error("Failed to fetch assignments");
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Get user's submission for an assignment
  const getUserSubmission = (assignment: Assignment): Submission | null => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      if (!user || !user.id) return null;
      
      if (!assignment.submissions || !Array.isArray(assignment.submissions)) {
        return null;
      }
      
      return assignment.submissions.find((s) => s.studentId === user.id) || null;
    } catch (err) {
      console.error("Error getting user submission:", err);
      return null;
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle upload submission
  const handleUploadSubmission = async () => {
    if (!selectedFile || !selectedAssignment) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      console.log("📤 Uploading submission for:", selectedAssignment.title);

      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);

      const response = await apiClient.post(
        `/assignments/${selectedAssignment._id}/submit`,
        uploadFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Submission uploaded:", response.data);
      toast.success("Assignment submitted successfully!");
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      fetchAssignments();
    } catch (error: any) {
      console.error("❌ Error uploading submission:", error);
      toast.error(error.response?.data?.error || "Failed to submit assignment");
    } finally {
      setUploading(false);
    }
  };

  // Handle upload click
  const handleUploadClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsUploadDialogOpen(true);
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(
    (a) =>
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.course?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return "Invalid date";
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Check if deadline passed
  const isDeadlinePassed = (deadline: string) => {
    try {
      return new Date(deadline) < new Date();
    } catch (err) {
      return false;
    }
  };

  // Calculate stats - SAFE VERSION
  let submittedAssignments = 0;
  let gradedAssignments = 0;
  let avgScore = 0;

  try {
    submittedAssignments = assignments.filter((a) => {
      try {
        return getUserSubmission(a) !== null;
      } catch (err) {
        return false;
      }
    }).length;

    const gradedSubmissions = assignments
      .map(a => {
        try {
          return getUserSubmission(a);
        } catch (err) {
          return null;
        }
      })
      .filter((sub): sub is Submission => {
        return sub !== null && 
               sub.grade !== null && 
               sub.grade !== undefined &&
               typeof sub.grade === 'number';
      });

    gradedAssignments = gradedSubmissions.length;

    if (gradedAssignments > 0) {
      const totalGrades = gradedSubmissions.reduce((sum, sub) => sum + (sub.grade || 0), 0);
      avgScore = Math.round(totalGrades / gradedAssignments);
    }
  } catch (err) {
    console.error("Error calculating stats:", err);
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout role="student">
        <div className="space-y-6">
          <Card className="p-12 text-center border-border/50 bg-card/50">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold mb-2">Error Loading Assignments</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchAssignments}>Try Again</Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
            Assignments
          </h1>
          <p className="text-muted-foreground mt-2">
            View and submit your assignments
          </p>
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{submittedAssignments}</p>
                <p className="text-sm text-muted-foreground">Submitted</p>
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
                  {Math.max(0, assignments.length - submittedAssignments)}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgScore}%</p>
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
                  : "No assignments available yet"}
              </p>
            </Card>
          ) : (
            filteredAssignments.map((assignment) => {
              try {
                const userSubmission = getUserSubmission(assignment);
                const deadlinePassed = isDeadlinePassed(assignment.deadline);

                return (
                  <Card
                    key={assignment._id}
                    className="p-6 border-border/50 bg-card/50 hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{assignment.title}</h3>
                          {userSubmission ? (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-500">
                              ✓ Submitted
                            </span>
                          ) : deadlinePassed ? (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-500">
                              ⏰ Expired
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500">
                              ⏳ Pending
                            </span>
                          )}
                          {userSubmission && userSubmission.grade !== null && userSubmission.grade !== undefined && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                              Grade: {userSubmission.grade}/{assignment.totalMarks}
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
                          <span>Total Marks: {assignment.totalMarks}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {assignment.description}
                        </p>

                        {/* Submission Info */}
                        {userSubmission && (
                          <div className="mt-3 p-3 bg-secondary/50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm flex-wrap">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Submitted: {formatDate(userSubmission.submittedAt)}</span>
                                <span className="text-muted-foreground">•</span>
                                <span>{userSubmission.fileName}</span>
                                <span className="text-muted-foreground">
                                  ({formatFileSize(userSubmission.fileSize)})
                                </span>
                              </div>
                              <a
                                href={`http://localhost:5000${userSubmission.filePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                              </a>
                            </div>
                            {userSubmission.status === "graded" && 
                             userSubmission.grade !== null && 
                             userSubmission.grade !== undefined && (
                              <div className="mt-2 pt-2 border-t border-border/50">
                                <p className="text-sm font-semibold text-green-500">
                                  Grade: {userSubmission.grade}/{assignment.totalMarks} (
                                  {Math.round((userSubmission.grade / assignment.totalMarks) * 100)}%)
                                </p>
                                {userSubmission.feedback && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Feedback: {userSubmission.feedback}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Warning for expired assignments */}
                        {!userSubmission && deadlinePassed && (
                          <div className="mt-3 p-3 bg-red-500/10 rounded-lg flex items-center gap-2 text-sm text-red-500">
                            <AlertCircle className="w-4 h-4" />
                            <span>
                              Deadline has passed. You can no longer submit this assignment.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Upload Button */}
                      {!userSubmission && !deadlinePassed && (
                        <Button
                          onClick={() => handleUploadClick(assignment)}
                          className="bg-gradient-to-r from-primary to-cyan-glow hover:shadow-neon ml-4"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                      )}

                      {/* Resubmit Button */}
                      {userSubmission && !deadlinePassed && (
                        <Button
                          onClick={() => handleUploadClick(assignment)}
                          variant="outline"
                          className="border-primary/50 hover:bg-primary/10 ml-4"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Resubmit
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              } catch (err) {
                console.error("Error rendering assignment:", assignment._id, err);
                return null;
              }
            })
          )}
        </div>

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="bg-card border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Submit Assignment</DialogTitle>
            </DialogHeader>
            {selectedAssignment && (
              <div className="space-y-4 mt-4">
                <div className="p-4 bg-secondary/20 rounded-lg">
                  <h3 className="font-semibold mb-2">{selectedAssignment.title}</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {selectedAssignment.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <span>Course: {selectedAssignment.course}</span>
                    <span>Deadline: {formatDate(selectedAssignment.deadline)}</span>
                    <span>Total Marks: {selectedAssignment.totalMarks}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Upload File</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.zip,.rar"
                      onChange={handleFileChange}
                      className="hidden"
                      id="assignment-upload"
                    />
                    <label htmlFor="assignment-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supported formats: PDF, DOC, DOCX, ZIP, RAR (Max 100MB)
                      </p>
                    </label>
                  </div>
                </div>

                <Button
                  onClick={handleUploadSubmission}
                  disabled={!selectedFile || uploading}
                  className="w-full bg-gradient-to-r from-primary to-cyan-glow"
                >
                  {uploading ? "Uploading..." : "Submit Assignment"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default StudentAssignments;
