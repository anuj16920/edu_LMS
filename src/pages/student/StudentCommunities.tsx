import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, MessageSquare, UserPlus, UserMinus, Send, Search } from "lucide-react";
import apiClient from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/integrations/supabase/auth";

interface Community {
  _id: string;
  title: string;
  description: string;
  createdBy: {
    _id: string;
    fullName: string;
    role: string;
  };
  members: any[];
  messages: {
    userId: string;
    userName: string;
    role: string;
    message: string;
    timestamp: string;
  }[];
  category: string;
  createdAt: string;
}

const StudentCommunities = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

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
      toast.error("Failed to load communities");
    } finally {
      setLoading(false);
    }
  };

  const isMember = (community: Community) => {
    return community.members.some(m => m._id === user?.id);
  };

  const handleJoin = async (communityId: string) => {
    try {
      await apiClient.post(`/communities/${communityId}/join`);
      toast.success("Joined community successfully!");
      fetchCommunities();
      if (selectedCommunity?._id === communityId) {
        const { data } = await apiClient.get(`/communities/${communityId}`);
        setSelectedCommunity(data);
      }
    } catch (error: any) {
      console.error("Error joining community:", error);
      toast.error(error.response?.data?.error || "Failed to join community");
    }
  };

  const handleLeave = async (communityId: string) => {
    try {
      await apiClient.post(`/communities/${communityId}/leave`);
      toast.success("Left community successfully!");
      fetchCommunities();
      if (selectedCommunity?._id === communityId) {
        setSelectedCommunity(null);
      }
    } catch (error: any) {
      console.error("Error leaving community:", error);
      toast.error(error.response?.data?.error || "Failed to leave community");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCommunity) return;

    try {
      setSendingMessage(true);
      await apiClient.post(`/communities/${selectedCommunity._id}/message`, {
        message: newMessage.trim()
      });
      setNewMessage("");
      
      // Refresh community to get new message
      const { data } = await apiClient.get(`/communities/${selectedCommunity._id}`);
      setSelectedCommunity(data);
      toast.success("Message sent!");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.error || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const selectCommunity = async (community: Community) => {
    try {
      const { data } = await apiClient.get(`/communities/${community._id}`);
      setSelectedCommunity(data);
    } catch (error) {
      console.error("Error fetching community details:", error);
      toast.error("Failed to load community details");
    }
  };

  const filteredCommunities = communities.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="student">
      <div className="h-[calc(100vh-100px)] flex gap-4">
        {/* Communities List */}
        <Card className="w-80 p-4 space-y-4 border-border/50 flex flex-col">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Users className="w-5 h-5" />
              Communities
            </h2>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center text-muted-foreground py-4">Loading...</div>
            ) : filteredCommunities.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No communities found
              </div>
            ) : (
              filteredCommunities.map((community) => (
                <div
                  key={community._id}
                  onClick={() => selectCommunity(community)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedCommunity?._id === community._id
                      ? "bg-primary/10 border-primary"
                      : "bg-secondary/20 hover:bg-secondary/40"
                  } border`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-sm">{community.title}</h3>
                    {isMember(community) && (
                      <Badge variant="secondary" className="text-xs">Joined</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {community.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{community.members.length} members</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Community Details/Chat */}
        <Card className="flex-1 p-6 border-border/50 flex flex-col">
          {!selectedCommunity ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a community to view details and chat</p>
              </div>
            </div>
          ) : (
            <>
              {/* Community Header */}
              <div className="border-b border-border pb-4 mb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedCommunity.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      Created by {selectedCommunity.createdBy.fullName} ({selectedCommunity.createdBy.role})
                    </p>
                  </div>
                  {isMember(selectedCommunity) ? (
                    <Button
                      onClick={() => handleLeave(selectedCommunity._id)}
                      variant="destructive"
                      size="sm"
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      Leave
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleJoin(selectedCommunity._id)}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500"
                      size="sm"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join
                    </Button>
                  )}
                </div>
                <p className="text-sm">{selectedCommunity.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{selectedCommunity.category}</Badge>
                  <Badge variant="secondary">
                    {selectedCommunity.members.length} members
                  </Badge>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {selectedCommunity.messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet. Be the first to start the conversation!
                  </div>
                ) : (
                  selectedCommunity.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        msg.userId === user?.id
                          ? "bg-primary/10 ml-auto max-w-[80%]"
                          : "bg-secondary/50 mr-auto max-w-[80%]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{msg.userName}</span>
                        <Badge variant="outline" className="text-xs">
                          {msg.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              {isMember(selectedCommunity) ? (
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="resize-none"
                    rows={2}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    Join this community to participate in discussions
                  </p>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentCommunities;
