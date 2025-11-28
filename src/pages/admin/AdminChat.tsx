import { useState, useEffect, useRef } from "react";
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
  Send,
  Paperclip,
  Users,
  MessageSquare,
  Search,
  Download,
  Trash2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/integrations/supabase/client";

interface Member {
  userId: string;
  name: string;
  role: string;
  joinedAt: string;
}

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  replyTo: string | null;
  timestamp: string;
}

interface Group {
  _id: string;
  name: string;
  description: string;
  members: Member[];
  messages: Message[];
  isPublic: boolean;
  createdAt: string;
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
}

const AdminChat = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create group form
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    isPublic: false,
    selectedMembers: [] as string[],
  });

  // Fetch groups
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/chat/groups");
      console.log("✅ Groups fetched:", response.data);
      setGroups(response.data);

      // Select first group by default
      if (response.data.length > 0 && !selectedGroup) {
        setSelectedGroup(response.data[0]);
      }
    } catch (error: any) {
      console.error("❌ Error fetching groups:", error);
      toast.error("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for group creation
  const fetchUsers = async () => {
    try {
      const response = await apiClient.get("/chat/users");
      console.log("✅ Users fetched:", response.data);
      setUsers(response.data);
    } catch (error: any) {
      console.error("❌ Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchUsers();

    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      if (selectedGroup) {
        fetchGroups();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedGroup?.messages]);

  // Handle create group
  const handleCreateGroup = async () => {
    if (!groupForm.name) {
      toast.error("Group name is required");
      return;
    }

    if (!groupForm.isPublic && groupForm.selectedMembers.length === 0) {
      toast.error("Please select at least one member or make it public");
      return;
    }

    try {
      console.log("📤 Creating group:", groupForm);

      const response = await apiClient.post(
        "/chat/groups",
        {
          name: groupForm.name,
          description: groupForm.description,
          memberIds: groupForm.selectedMembers,
          isPublic: groupForm.isPublic,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Group created:", response.data);
      toast.success("Group created successfully!");
      setIsCreateDialogOpen(false);
      resetGroupForm();
      fetchGroups();
    } catch (error: any) {
      console.error("❌ Error creating group:", error);
      toast.error(error.response?.data?.error || "Failed to create group");
    }
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!selectedGroup) return;
    if (!messageText.trim() && !selectedFile) {
      toast.error("Please enter a message or select a file");
      return;
    }

    try {
      console.log("📤 Sending message...");

      const formData = new FormData();
      formData.append("message", messageText);
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await apiClient.post(
        `/chat/groups/${selectedGroup._id}/messages`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Message sent:", response.data);
      setMessageText("");
      setSelectedFile(null);
      fetchGroups();

      const updatedGroup = response.data.group;
      setSelectedGroup(updatedGroup);
    } catch (error: any) {
      console.error("❌ Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      toast.success("File selected: " + e.target.files[0].name);
    }
  };

  // Handle delete group
  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Are you sure you want to delete this group?")) return;

    try {
      await apiClient.delete(`/chat/groups/${id}`);
      toast.success("Group deleted successfully!");
      if (selectedGroup?._id === id) {
        setSelectedGroup(null);
      }
      fetchGroups();
    } catch (error: any) {
      toast.error("Failed to delete group");
    }
  };

  // Reset group form
  const resetGroupForm = () => {
    setGroupForm({
      name: "",
      description: "",
      isPublic: false,
      selectedMembers: [],
    });
  };

  // Toggle member selection
  const toggleMemberSelection = (userId: string) => {
    setGroupForm((prev) => ({
      ...prev,
      selectedMembers: prev.selectedMembers.includes(userId)
        ? prev.selectedMembers.filter((id) => id !== userId)
        : [...prev.selectedMembers, userId],
    }));
  };

  // Format date
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Filter groups
  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      <div className="h-[calc(100vh-120px)] flex gap-4">
        {/* Groups Sidebar */}
        <div className="w-80 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Messages</h1>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-primary to-cyan-glow">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Create New Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Group Name</label>
                    <Input
                      value={groupForm.name}
                      onChange={(e) =>
                        setGroupForm({ ...groupForm, name: e.target.value })
                      }
                      placeholder="All Faculty, CS Department..."
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      value={groupForm.description}
                      onChange={(e) =>
                        setGroupForm({ ...groupForm, description: e.target.value })
                      }
                      placeholder="Group purpose..."
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                    <input
                      type="checkbox"
                      checked={groupForm.isPublic}
                      onChange={(e) =>
                        setGroupForm({ ...groupForm, isPublic: e.target.checked })
                      }
                      className="w-5 h-5"
                    />
                    <div>
                      <label className="font-medium">Add All Users</label>
                      <p className="text-xs text-muted-foreground">
                        All faculty and students will be automatically added
                      </p>
                    </div>
                  </div>
                  {!groupForm.isPublic && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Select Members ({groupForm.selectedMembers.length} selected)
                      </label>
                      <div className="max-h-60 overflow-y-auto space-y-2 border border-border rounded-lg p-3">
                        {users.map((user) => (
                          <div
                            key={user._id}
                            onClick={() => toggleMemberSelection(user._id)}
                            className={`p-3 rounded-lg cursor-pointer transition-all ${
                              groupForm.selectedMembers.includes(user._id)
                                ? "bg-primary/20 border-2 border-primary"
                                : "bg-secondary/50 hover:bg-secondary"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{user.fullName || user.email}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {user.role}
                                </p>
                              </div>
                              {groupForm.selectedMembers.includes(user._id) && (
                                <Check className="w-5 h-5 text-primary" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={handleCreateGroup}
                    className="w-full bg-gradient-to-r from-primary to-cyan-glow"
                  >
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : filteredGroups.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No groups yet</p>
            ) : (
              filteredGroups.map((group) => (
                <Card
                  key={group._id}
                  onClick={() => setSelectedGroup(group)}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedGroup?._id === group._id
                      ? "border-primary bg-primary/10"
                      : "border-border/50 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{group.name}</h3>
                        {group.isPublic && (
                          <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-500">
                            Public
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        {group.members.length} members
                      </p>
                      {group.messages.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {group.messages[group.messages.length - 1].message ||
                            "📎 File attached"}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(group._id);
                      }}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedGroup ? (
            <>
              {/* Chat Header */}
              <Card className="p-4 border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selectedGroup.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedGroup.members.length} members
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Members
                  </Button>
                </div>
              </Card>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedGroup.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  selectedGroup.messages.map((msg) => {
                    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                    const isOwnMessage = msg.senderId === currentUser.id;

                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            isOwnMessage
                              ? "bg-primary text-white"
                              : "bg-secondary"
                          } rounded-lg p-3`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">{msg.senderName}</p>
                            <span className="text-xs opacity-70 capitalize">
                              ({msg.senderRole})
                            </span>
                          </div>
                          {msg.message && <p className="text-sm">{msg.message}</p>}
                          {msg.fileUrl && (
                            <div className="mt-2 p-2 bg-black/20 rounded flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Paperclip className="w-4 h-4" />
                                <div>
                                  <p className="text-xs">{msg.fileName}</p>
                                  <p className="text-xs opacity-70">
                                    {formatFileSize(msg.fileSize)}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={`http://localhost:5000${msg.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button size="icon" variant="ghost">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </a>
                            </div>
                          )}
                          <p className="text-xs opacity-70 mt-1">
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <Card className="p-4 border-border/50">
                {selectedFile && (
                  <div className="mb-2 p-2 bg-secondary/50 rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      <span className="text-sm">{selectedFile.name}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setSelectedFile(null)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="chat-file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="chat-file">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="border-border"
                      onClick={() => document.getElementById("chat-file")?.click()}
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </label>
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-secondary/50 border-border"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-primary to-cyan-glow"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <Card className="flex-1 flex items-center justify-center border-border/50">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select a group to start messaging
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminChat;
