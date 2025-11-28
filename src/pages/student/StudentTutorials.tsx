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
import { VideoPlayer } from "@/components/VideoPlayer";
import { Search, Video, FileText, Eye, Play } from "lucide-react";
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

const StudentTutorials = () => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

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

  // Handle view tutorial
  const handleViewTutorial = async (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setIsPlayerOpen(true);

    // Increment view count
    try {
      await apiClient.post(`/tutorials/${tutorial._id}/view`);
      // Update local state
      setTutorials((prev) =>
        prev.map((t) =>
          t._id === tutorial._id ? { ...t, views: t.views + 1 } : t
        )
      );
    } catch (error) {
      console.error("Error incrementing view:", error);
    }
  };

  // Filter tutorials
  const filteredTutorials = tutorials.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Group tutorials by course
  const tutorialsByCourse = filteredTutorials.reduce((acc, tutorial) => {
    if (!acc[tutorial.course]) {
      acc[tutorial.course] = [];
    }
    acc[tutorial.course].push(tutorial);
    return acc;
  }, {} as Record<string, Tutorial[]>);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
            Tutorials
          </h1>
          <p className="text-muted-foreground mt-2">Access your course materials</p>
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

        {/* Tutorials List Grouped by Course */}
        {loading ? (
          <Card className="p-12 text-center border-border/50 bg-card/50">
            <p className="text-muted-foreground">Loading tutorials...</p>
          </Card>
        ) : Object.keys(tutorialsByCourse).length === 0 ? (
          <Card className="p-12 text-center border-border/50 bg-card/50">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No tutorials found matching your search"
                : "No tutorials available yet"}
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(tutorialsByCourse).map(([course, courseTutorials]) => (
              <div key={course}>
                <h2 className="text-2xl font-bold mb-4 text-foreground">{course}</h2>
                <div className="grid gap-4">
                  {courseTutorials.map((tutorial) => (
                    <Card
                      key={tutorial._id}
                      className="p-6 border-border/50 bg-card/50 hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => handleViewTutorial(tutorial)}
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-primary/50 hover:bg-primary/10"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {tutorial.type === "video" ? "Watch" : "View"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Player Dialog */}
        <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
          <DialogContent className="bg-card border-border max-w-5xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {selectedTutorial?.title}
              </DialogTitle>
            </DialogHeader>
            {selectedTutorial && (
              <div className="space-y-4 mt-4">
                {selectedTutorial.type === "video" ? (
                  <VideoPlayer
                    src={`http://localhost:5000${selectedTutorial.filePath}`}
                    title={selectedTutorial.title}
                  />
                ) : (
                  <div className="w-full h-[600px]">
                    <iframe
                      src={`http://localhost:5000${selectedTutorial.filePath}`}
                      className="w-full h-full border-0 rounded-lg"
                      title={selectedTutorial.title}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="px-2 py-1 rounded bg-primary/10 text-primary">
                      {selectedTutorial.course}
                    </span>
                    {selectedTutorial.duration && (
                      <span>{selectedTutorial.duration}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {selectedTutorial.views} views
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedTutorial.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded by {selectedTutorial.uploadedByName || "Unknown"}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default StudentTutorials;
