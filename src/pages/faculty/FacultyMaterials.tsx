import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Upload, FileText, Download, Trash2, Edit, Search } from "lucide-react";
import { toast } from "sonner";

interface StudyFile {
  filename: string;
  url: string;
  size: number;
}

interface StudyMaterial {
  _id: string;
  title: string;
  description: string;
  subject: string;
  course: string;
  files: StudyFile[];
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
  downloads: number;
  isPinned: boolean;
  status: "active" | "flagged" | "removed";
}

// ✅ normalize: remove trailing /api if present
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api$/, "");

export default function FacultyMaterials() {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    course: "",
  });

  // Load only this faculty's materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/study-materials/mine`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load materials");
        setMaterials(data);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to load materials");
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(e.target.files);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.subject || !formData.course) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("subject", formData.subject);
      form.append("course", formData.course);
      Array.from(selectedFiles).forEach((file) => form.append("files", file));

      const res = await fetch(`${API_BASE}/api/study-materials`, {
        method: "POST",
        credentials: "include",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload material");

      setMaterials((prev) => [data.material, ...prev]);

      setFormData({ title: "", description: "", subject: "", course: "" });
      setSelectedFiles(null);
      setShowUploadForm(false);
      toast.success("Study material uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Upload failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/study-materials/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      setMaterials((prev) => prev.filter((m) => m._id !== id));
      toast.success("Material deleted successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Delete failed");
    }
  };

  const handlePin = async (material: StudyMaterial) => {
    try {
      const res = await fetch(`${API_BASE}/api/study-materials/${material._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isPinned: !material.isPinned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      setMaterials((prev) =>
        prev.map((m) => (m._id === material._id ? data.material : m)),
      );
      toast.success("Pinned state updated");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Update failed");
    }
  };

  const filteredMaterials = materials.filter((material) =>
    [material.title, material.subject, material.course]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <DashboardLayout role="faculty">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Study Materials</h1>
            <p className="text-muted-foreground mt-1">
              Upload and manage study materials for students
            </p>
          </div>
          <Button onClick={() => setShowUploadForm(!showUploadForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Upload Material
          </Button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <Card>
            <CardHeader>
              <CardTitle>Upload New Study Material</CardTitle>
              <CardDescription>
                Share notes, PDFs, and study resources with students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Data Structures - Arrays"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Data Structures"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course">Course *</Label>
                    <Input
                      id="course"
                      placeholder="e.g., CSE, ECE, MECH"
                      value={formData.course}
                      onChange={(e) =>
                        setFormData({ ...formData, course: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="files">Files *</Label>
                    <Input
                      id="files"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png"
                      onChange={handleFileChange}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Supported: PDF, DOC, PPT, Images (Max 10 files)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the material..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium mb-2">Selected Files:</p>
                    <ul className="text-sm space-y-1">
                      {Array.from(selectedFiles).map((file, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {file.name} ({formatFileSize(file.size)})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Material
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUploadForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search materials by title, subject, or course..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Materials List */}
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
                  <Button
                    variant="link"
                    onClick={() => setShowUploadForm(true)}
                    className="mt-2"
                  >
                    Upload your first material
                  </Button>
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
                          <CardTitle className="text-xl">
                            {material.title}
                          </CardTitle>
                          {material.isPinned && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              Pinned
                            </span>
                          )}
                        </div>
                        <CardDescription className="mt-1">
                          {material.description}
                        </CardDescription>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Subject: {material.subject}</span>
                          <span>•</span>
                          <span>Course: {material.course}</span>
                          <span>•</span>
                          <span>{material.downloads} downloads</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePin(material)}
                        >
                          {material.isPinned ? "Unpin" : "Pin"}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(material._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Attached Files:</p>
                      <div className="flex flex-wrap gap-2">
                        {material.files.map((file, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            asChild
                          >
                            <a href={API_BASE + file.url} target="_blank">
                              <FileText className="w-4 h-4" />
                              {file.filename}
                              <span className="text-xs text-muted-foreground">
                                ({formatFileSize(file.size)})
                              </span>
                              <Download className="w-3 h-3" />
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Uploaded on {new Date(material.createdAt).toLocaleDateString()}
                    </p>
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
