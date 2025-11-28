import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Search, ThumbsUp, MessageSquare, Pin } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudyFile {
  filename: string;
  url: string;
  size: number;
}

interface Comment {
  _id: string;
  text: string;
  userName: string;
  createdAt: string;
}

interface StudyMaterial {
  _id: string;
  title: string;
  description: string;
  subject: string;
  course: string;
  files: StudyFile[];
  uploadedByName: string;
  createdAt: string;
  downloads: number;
  likes: number;
  isPinned: boolean;
  status: "active" | "flagged" | "removed";
  comments: Comment[];
  isLiked?: boolean;
}

// normalize base URL (remove trailing /api if present)
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api$/, "");

export default function StudentMaterials() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all active materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/study-materials`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load materials");

        const withClientFields = (data as StudyMaterial[]).map((m) => ({
          ...m,
          isLiked: false,
          comments: [],
        }));
        setMaterials(withClientFields);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to load materials");
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const subjects = ["all", ...Array.from(new Set(materials.map((m) => m.subject)))];
  const courses = ["all", ...Array.from(new Set(materials.map((m) => m.course)))];

  const handleLike = async (material: StudyMaterial) => {
    try {
      const direction = material.isLiked ? "down" : "up";
      const res = await fetch(`${API_BASE}/api/study-materials/${material._id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ direction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update like");

      setMaterials((prev) =>
        prev.map((m) =>
          m._id === material._id
            ? { ...m, isLiked: !m.isLiked, likes: data.likes }
            : m,
        ),
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update like");
    }
  };

  const handleDownload = async (materialId: string, file: StudyFile) => {
    try {
      const res = await fetch(`${API_BASE}/api/study-materials/${materialId}/download`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update downloads");

      setMaterials((prev) =>
        prev.map((m) =>
          m._id === materialId ? { ...m, downloads: data.downloads } : m,
        ),
      );

      window.open(API_BASE + file.url, "_blank");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Download failed");
    }
  };

  const handleAddComment = (materialId: string) => {
    if (!commentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    const newComment: Comment = {
      _id: Date.now().toString(),
      text: commentText,
      userName: "You",
      createdAt: new Date().toISOString(),
    };

    setMaterials((prev) =>
      prev.map((m) =>
        m._id === materialId ? { ...m, comments: [...m.comments, newComment] } : m,
      ),
    );
    setCommentText("");
  };

  const filteredMaterials = materials
    .filter((material) => {
      const matchesSearch =
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject = selectedSubject === "all" || material.subject === selectedSubject;
      const matchesCourse = selectedCourse === "all" || material.course === selectedCourse;

      return matchesSearch && matchesSubject && matchesCourse;
    })
    .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Study Materials</h1>
          <p className="text-muted-foreground mt-1">
            Access notes, PDFs, and study resources shared by faculty
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search materials..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject === "all" ? "All Subjects" : subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course === "all" ? "All Courses" : course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-primary">{materials.length}</p>
              <p className="text-sm text-muted-foreground">Total Materials</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-primary">
                {subjects.length - 1 > 0 ? subjects.length - 1 : 0}
              </p>
              <p className="text-sm text-muted-foreground">Subjects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-primary">
                {materials.reduce((sum, m) => sum + m.downloads, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Downloads</p>
            </CardContent>
          </Card>
        </div>

        {/* Materials */}
        {loading ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Loading materials...
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredMaterials.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No study materials found</p>
                </CardContent>
              </Card>
            ) : (
              filteredMaterials.map((material) => (
                <Card
                  key={material._id}
                  className={material.isPinned ? "border-primary" : ""}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {material.isPinned && <Pin className="w-4 h-4 text-primary" />}
                          <CardTitle className="text-xl">{material.title}</CardTitle>
                        </div>
                        <CardDescription className="mt-2">
                          {material.description}
                        </CardDescription>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {material.subject}
                          </span>
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                            {material.course}
                          </span>
                        </div>
                        <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                          <span>By {material.uploadedByName}</span>
                          <span>•</span>
                          <span>{formatDate(material.createdAt)}</span>
                          <span>•</span>
                          <span>{material.downloads} downloads</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Attached Files:</p>
                      <div className="flex flex-wrap gap-2">
                        {material.files.map((file, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleDownload(material._id, file)}
                          >
                            <FileText className="w-4 h-4" />
                            {file.filename}
                            <span className="text-xs text-muted-foreground">
                              ({formatFileSize(file.size)})
                            </span>
                            <Download className="w-3 h-3" />
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant={material.isLiked ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleLike(material)}
                        className="gap-2"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        {material.likes}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setShowComments(
                            showComments === material._id ? null : material._id,
                          )
                        }
                        className="gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {material.comments.length} Comments
                      </Button>
                    </div>

                    {showComments === material._id && (
                      <div className="space-y-3 pt-3 border-t">
                        {material.comments.length > 0 && (
                          <div className="space-y-2">
                            {material.comments.map((comment) => (
                              <div key={comment._id} className="bg-muted p-3 rounded-md">
                                <p className="text-sm font-medium">{comment.userName}</p>
                                <p className="text-sm mt-1">{comment.text}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDate(comment.createdAt)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Add a comment or ask a question..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            rows={2}
                            className="flex-1"
                          />
                          <Button onClick={() => handleAddComment(material._id)}>
                            Post
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
