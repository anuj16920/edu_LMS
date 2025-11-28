import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Send,
  Paperclip,
  Users,
  MessageSquare,
  Search,
  Download,
  Trash2,
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

const FacultyChat = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    fetchGroups();
    
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
      
      // Update selected group
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
    <DashboardLayout role="faculty">
      <div className="h-[calc(100vh-120px)] flex gap-4">
        {/* Groups Sidebar */}
        <div className="w-80 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-sm text-muted-foreground">
              {groups.length} groups
            </p>
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
              <Card className="p-8 text-center border-border/50">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No groups found" : "You haven't been added to any groups yet"}
                </p>
              </Card>
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
                    {selectedGroup.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedGroup.description}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="border-border">
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
                    const currentUser = JSON.parse(
                      localStorage.getItem("user") || "{}"
                    );
                    const isOwnMessage = msg.senderId === currentUser.id;

                    return (
                      <div
                        key={msg._id}
                        className={`flex ${
                          isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            isOwnMessage
                              ? "bg-primary text-white"
                              : "bg-secondary"
                          } rounded-lg p-3`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">
                              {msg.senderName}
                            </p>
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

export default FacultyChat;
