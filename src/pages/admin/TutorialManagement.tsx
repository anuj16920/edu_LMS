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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Video, FileText, Eye, Edit, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/integrations/supabase/client";

interface Tutorial {
  _id: string;
  title: string;
  course: string;
  type: string;
  description: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  duration: string;
  uploadedByName: string;
  views: number;
  createdAt: string;
}

const TutorialManagement = () => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    course: "",
    type: "video",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch tutorials
  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/tutorials");
      console.log("✅ Tutorials fetched:", response.data);
      setTutorials(response.data);
    } catch (error: any) {
      console.error("❌ Error fetching tutorials:", error);
      toast.error(error.response?.data?.error || "Failed to fetch tutorials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle upload tutorial
  const handleUploadTutorial = async () => {
    if (!formData.title || !formData.course || !selectedFile) {
      toast.error("Please fill in all fields and select a file");
      return;
    }

    try {
      setUploading(true);
      console.log("📤 Uploading tutorial:", formData);

      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);
      uploadFormData.append("title", formData.title);
      uploadFormData.append("course", formData.course);
      uploadFormData.append("type", formData.type);
      uploadFormData.append("description", formData.description);

      const response = await apiClient.post("/tutorials", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Tutorial uploaded:", response.data);
      toast.success("Tutorial uploaded successfully!");
      setIsAddDialogOpen(false);

      // Reset form
      setFormData({
        title: "",
        course: "",
        type: "video",
        description: "",
      });
      setSelectedFile(null);

      // Refresh list
      fetchTutorials();
    } catch (error: any) {
      console.error("❌ Error uploading tutorial:", error);
      toast.error(error.response?.data?.error || "Failed to upload tutorial");
    } finally {
      setUploading(false);
    }
  };

  // Handle delete tutorial
  const handleDeleteTutorial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tutorial?")) return;

    try {
      await apiClient.delete(`/tutorials/${id}`);
      toast.success("Tutorial deleted successfully!");
      fetchTutorials();
    } catch (error: any) {
      console.error("❌ Error deleting tutorial:", error);
      toast.error(error.response?.data?.error || "Failed to delete tutorial");
    }
  };

  // Filter tutorials
  const filteredTutorials = tutorials.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
              Tutorial Management
            </h1>
            <p className="text-muted-foreground mt-2">Upload and manage tutorial content</p>
          </div>

          {/* Upload Tutorial Button */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-cyan-glow hover:shadow-neon">
                <Plus className="w-4 h-4 mr-2" />
                Upload Tutorial
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Upload New Tutorial</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tutorial Title</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Introduction to..."
                    className="bg-secondary/50 border-border"
                  />
                </div>
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
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tutorial description..."
                    className="bg-secondary/50 border-border min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Upload File</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="video/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        {selectedFile
                          ? selectedFile.name
                          : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Video (MP4, MOV) or PDF files
                      </p>
                    </label>
                  </div>
                </div>
                <Button
                  onClick={handleUploadTutorial}
                  disabled={uploading}
                  className="w-full bg-gradient-to-r from-primary to-cyan-glow"
                >
                  {uploading ? "Uploading..." : "Upload Tutorial"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-cyan-glow flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {tutorials.filter((t) => t.type === "video").length}
                </p>
                <p className="text-sm text-muted-foreground">Video Tutorials</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {tutorials.filter((t) => t.type === "pdf").length}
                </p>
                <p className="text-sm text-muted-foreground">PDF Notes</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-glow to-accent flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {tutorials.reduce((sum, t) => sum + t.views, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="p-4 border-border/50 bg-card/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search tutorials by title or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
        </Card>

        {/* Tutorials List */}
        {loading ? (
          <Card className="p-12 text-center border-border/50 bg-card/50">
            <p className="text-muted-foreground">Loading tutorials...</p>
          </Card>
        ) : filteredTutorials.length === 0 ? (
          <Card className="p-12 text-center border-border/50 bg-card/50">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No tutorials found matching your search"
                : "No tutorials yet. Upload one to get started!"}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTutorials.map((tutorial) => (
              <Card
                key={tutorial._id}
                className="p-6 border-border/50 bg-card/50 hover:border-primary/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      tutorial.type === "video"
                        ? "bg-gradient-to-br from-primary to-cyan-glow"
                        : "bg-gradient-to-br from-accent to-primary"
                    }`}
                  >
                    {tutorial.type === "video" ? (
                      <Video className="w-8 h-8 text-white" />
                    ) : (
                      <FileText className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {tutorial.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary">
                        {tutorial.course}
                      </span>
                      <span>{formatFileSize(tutorial.fileSize)}</span>
                      {tutorial.duration && <span>{tutorial.duration}</span>}
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {tutorial.views} views
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {tutorial.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      By {tutorial.uploadedByName || "Unknown"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteTutorial(tutorial._id)}
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
      </div>
    </DashboardLayout>
  );
};

export default TutorialManagement;
