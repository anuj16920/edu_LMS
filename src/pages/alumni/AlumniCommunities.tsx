import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MessageSquare, Plus, Users, Send, X } from "lucide-react";
import { useAuth } from "@/integrations/supabase/auth";
import apiClient from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Community {
  _id: string;
  title: string;
  description: string;
  createdBy: { fullName: string; role: string };
  members: any[];
  category: string;
  messages: Message[];
  isActive: boolean;
  createdAt: string;
}

interface Message {
  userId: string;
  userName: string;
  role: string;
  message: string;
  timestamp: string;
}

const AlumniCommunities = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // New community form
  const [newCommunity, setNewCommunity] = useState({
    title: "",
    description: "",
    category: "General",
  });

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/communities");
      setCommunities(data || []);
    } catch (error) {
      console.error("Error fetching communities:", error);
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const createCommunity = async () => {
    if (!newCommunity.title.trim()) {
      toast.error("Please enter a community title");
      return;
    }

    try {
      await apiClient.post("/communities", newCommunity);
      toast.success("Community created successfully!");
      setCreateDialogOpen(false);
      setNewCommunity({ title: "", description: "", category: "General" });
      fetchCommunities();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create community");
    }
  };

  const joinCommunity = async (communityId: string) => {
    try {
      await apiClient.post(`/communities/${communityId}/join`);
      toast.success("Joined community!");
      fetchCommunities();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to join community");
    }
  };

  const leaveCommunity = async (communityId: string) => {
    try {
      await apiClient.post(`/communities/${communityId}/leave`);
      toast.success("Left community");
      setSelectedCommunity(null);
      fetchCommunities();
    } catch (error: any) {
      toast.error("Failed to leave community");
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedCommunity) return;

    try {
      await apiClient.post(`/communities/${selectedCommunity._id}/message`, {
        message: messageText,
      });
      setMessageText("");
      // Refresh community to get new messages
      const { data } = await apiClient.get(`/communities/${selectedCommunity._id}`);
      setSelectedCommunity(data);
      fetchCommunities();
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const isMember = (community: Community) => {
    return community.members.some((m: any) => m._id === user?.id || m.userId === user?.id);
  };

  const canCreateCommunity = user?.role === "admin" || user?.role === "alumni";

  return (
    <DashboardLayout role={user?.role as any}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Communities
            </h1>
            <p className="text-muted-foreground mt-1">Connect, discuss, and collaborate</p>
          </div>
          {canCreateCommunity && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Community
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Community</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newCommunity.title}
                      onChange={(e) => setNewCommunity({ ...newCommunity, title: e.target.value })}
                      placeholder="e.g., Placement Preparation 2025"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newCommunity.description}
                      onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                      placeholder="What is this community about?"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={newCommunity.category}
                      onChange={(e) => setNewCommunity({ ...newCommunity, category: e.target.value })}
                      placeholder="e.g., Career, Tech, General"
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={createCommunity} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                    Create Community
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Communities List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold">All Communities</h2>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : communities.length === 0 ? (
              <p className="text-muted-foreground">No communities yet</p>
            ) : (
              communities.map((community) => (
                <Card
                  key={community._id}
                  onClick={() => setSelectedCommunity(community)}
                  className={`p-4 cursor-pointer hover-lift transition-all ${
                    selectedCommunity?._id === community._id ? "border-purple-500 bg-purple-500/10" : "border-border/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold">{community.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{community.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {community.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {community.members.length}
                        </span>
                      </div>
                    </div>
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedCommunity ? (
              <Card className="p-6 h-[600px] flex flex-col border-border/50">
                {/* Community Header */}
                <div className="border-b border-border/50 pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedCommunity.title}</h2>
                      <p className="text-sm text-muted-foreground">{selectedCommunity.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge>{selectedCommunity.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {selectedCommunity.members.length} members
                        </span>
                      </div>
                    </div>
                    {isMember(selectedCommunity) ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => leaveCommunity(selectedCommunity._id)}
                      >
                        Leave
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => joinCommunity(selectedCommunity._id)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        Join
                      </Button>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {selectedCommunity.messages.length === 0 ? (
                    <p className="text-center text-muted-foreground mt-8">No messages yet. Start the conversation!</p>
                  ) : (
                    selectedCommunity.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          msg.userId === user?.id ? "bg-purple-500/20 ml-auto max-w-[80%]" : "bg-secondary/50 max-w-[80%]"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{msg.userName}</span>
                          <Badge variant="outline" className="text-xs">
                            {msg.role}
                          </Badge>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                {isMember(selectedCommunity) && (
                  <div className="flex gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} className="bg-gradient-to-r from-purple-500 to-pink-500">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-12 h-[600px] flex items-center justify-center border-border/50">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Select a community to view messages</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AlumniCommunities;
