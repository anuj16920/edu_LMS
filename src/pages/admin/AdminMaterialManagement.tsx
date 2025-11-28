import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Search, Trash2, Eye, BarChart3, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
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

interface StudyMaterial {
  _id: string;
  title: string;
  description: string;
  subject: string;
  course: string;
  files: Array<{
    filename: string;
    url: string;
    size: number;
  }>;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  downloads: number;
  likes: number;
  comments: number;
  isPinned: boolean;
  status: "active" | "flagged" | "removed";
}

export default function AdminMaterialManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);

  // Mock data - replace with API call later
  const [materials, setMaterials] = useState<StudyMaterial[]>([
    {
      _id: "1",
      title: "Data Structures - Linked Lists Notes",
      description: "Complete notes on singly linked lists, doubly linked lists with examples",
      subject: "Data Structures",
      course: "CSE",
      files: [
        { filename: "linked-lists.pdf", url: "/uploads/linked-lists.pdf", size: 2048000 }
      ],
      uploadedBy: "faculty123",
      uploadedByName: "Dr. Sharma",
      uploadedAt: new Date().toISOString(),
      downloads: 145,
      likes: 23,
      comments: 8,
      isPinned: true,
      status: "active"
    },
    {
      _id: "2",
      title: "Operating Systems - Process Scheduling",
      description: "Detailed notes on CPU scheduling algorithms",
      subject: "Operating Systems",
      course: "CSE",
      files: [
        { filename: "process-scheduling.pdf", url: "/uploads/process-scheduling.pdf", size: 1536000 }
      ],
      uploadedBy: "faculty456",
      uploadedByName: "Prof. Reddy",
      uploadedAt: new Date(Date.now() - 86400000).toISOString(),
      downloads: 267,
      likes: 45,
      comments: 12,
      isPinned: false,
      status: "active"
    },
    {
      _id: "3",
      title: "Inappropriate Content Example",
      description: "This material has been flagged by users",
      subject: "General",
      course: "ALL",
      files: [
        { filename: "flagged-content.pdf", url: "/uploads/flagged.pdf", size: 512000 }
      ],
      uploadedBy: "faculty789",
      uploadedByName: "Unknown User",
      uploadedAt: new Date(Date.now() - 172800000).toISOString(),
      downloads: 5,
      likes: 0,
      comments: 3,
      isPinned: false,
      status: "flagged"
    }
  ]);

  const subjects = ["all", ...Array.from(new Set(materials.map(m => m.subject)))];
  const statuses = ["all", "active", "flagged", "removed"];

  const handleDelete = () => {
    if (selectedMaterial) {
      setMaterials(materials.filter(m => m._id !== selectedMaterial._id));
      toast.success("Material deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedMaterial(null);
    }
  };

  const handleRemove = (id: string) => {
    setMaterials(materials.map(m => 
      m._id === id ? { ...m, status: "removed" as const } : m
    ));
    toast.success("Material removed from platform");
  };

  const handleRestore = (id: string) => {
    setMaterials(materials.map(m => 
      m._id === id ? { ...m, status: "active" as const } : m
    ));
    toast.success("Material restored successfully");
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.uploadedByName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = selectedSubject === "all" || material.subject === selectedSubject;
    const matchesStatus = selectedStatus === "all" || material.status === selectedStatus;
    
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const stats = {
    total: materials.length,
    active: materials.filter(m => m.status === "active").length,
    flagged: materials.filter(m => m.status === "flagged").length,
    removed: materials.filter(m => m.status === "removed").length,
    totalDownloads: materials.reduce((sum, m) => sum + m.downloads, 0),
    totalLikes: materials.reduce((sum, m) => sum + m.likes, 0)
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + " " + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">Active</span>;
      case "flagged":
        return <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">Flagged</span>;
      case "removed":
        return <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">Removed</span>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Material Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage all study materials on the platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Materials</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{stats.active}</p>
                <p className="text-xs text-muted-foreground mt-1">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-500">{stats.flagged}</p>
                <p className="text-xs text-muted-foreground mt-1">Flagged</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{stats.removed}</p>
                <p className="text-xs text-muted-foreground mt-1">Removed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.totalDownloads}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Downloads</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.totalLikes}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Likes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search materials or faculty..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Subject Filter */}
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject === "all" ? "All Subjects" : subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Materials Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Study Materials</CardTitle>
            <CardDescription>
              {filteredMaterials.length} material(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredMaterials.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No materials found matching your filters
                </div>
              ) : (
                filteredMaterials.map((material) => (
                  <div
                    key={material._id}
                    className={`p-4 border rounded-lg ${
                      material.status === "flagged" ? "border-yellow-500 bg-yellow-500/5" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{material.title}</h3>
                          {getStatusBadge(material.status)}
                          {material.status === "flagged" && (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {material.description}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm">
                          <span className="text-muted-foreground">
                            <strong>Subject:</strong> {material.subject}
                          </span>
                          <span className="text-muted-foreground">
                            <strong>Course:</strong> {material.course}
                          </span>
                          <span className="text-muted-foreground">
                            <strong>By:</strong> {material.uploadedByName}
                          </span>
                          <span className="text-muted-foreground">
                            <strong>Uploaded:</strong> {formatDate(material.uploadedAt)}
                          </span>
                        </div>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {material.downloads}
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            {material.likes} likes
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {material.comments} comments
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {material.files.map((file, index) => (
                            <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                              <FileText className="w-3 h-3 inline mr-1" />
                              {file.filename} ({formatFileSize(file.size)})
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {material.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemove(material._id)}
                          >
                            Remove
                          </Button>
                        )}
                        {material.status === "removed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestore(material._id)}
                          >
                            Restore
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedMaterial(material);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Material</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete "{selectedMaterial?.title}"? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Permanently
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
