import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Briefcase, MapPin, Award, Send, Search, Filter } from "lucide-react";
import apiClient from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/integrations/supabase/auth";

interface Alumni {
  _id: string;
  fullName: string;
  email: string;
  graduationYear: string;
  currentCompany: string;
  designation: string;
  location: string;
  linkedIn: string;
  skills: string[];
  bio: string;
  openToMentorship: boolean;
  openToReferrals: boolean;
}

const StudentAlumniDirectory = () => {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMentorsOnly, setShowMentorsOnly] = useState(false);
  
  // Mentorship request state
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchAlumni();
  }, []);

  useEffect(() => {
    filterAlumni();
  }, [searchQuery, showMentorsOnly, alumni]);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/alumni");
      setAlumni(data || []);
      setFilteredAlumni(data || []);
    } catch (error) {
      console.error("Error fetching alumni:", error);
      toast.error("Failed to load alumni");
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAlumni = () => {
    let filtered = alumni;

    // Filter by mentorship availability
    if (showMentorsOnly) {
      filtered = filtered.filter(a => a.openToMentorship);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.fullName.toLowerCase().includes(query) ||
        a.currentCompany.toLowerCase().includes(query) ||
        a.designation.toLowerCase().includes(query) ||
        a.skills.some(s => s.toLowerCase().includes(query))
      );
    }

    setFilteredAlumni(filtered);
  };

  const handleRequestMentorship = (alumni: Alumni) => {
    setSelectedAlumni(alumni);
    setRequestMessage("");
    setDialogOpen(true);
  };

  const sendMentorshipRequest = async () => {
    if (!requestMessage.trim()) {
      toast.error("Please write a message");
      return;
    }

    if (requestMessage.length > 500) {
      toast.error("Message too long (max 500 characters)");
      return;
    }

    try {
      setSendingRequest(true);
      await apiClient.post("/mentorship/request", {
        alumniId: selectedAlumni?._id,
        message: requestMessage.trim()
      });

      toast.success("Mentorship request sent successfully!");
      setDialogOpen(false);
      setRequestMessage("");
      setSelectedAlumni(null);
    } catch (error: any) {
      console.error("Error sending request:", error);
      toast.error(error.response?.data?.error || "Failed to send request");
    } finally {
      setSendingRequest(false);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Alumni Directory
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect with alumni for mentorship and career guidance
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4 border-border/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, company, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant={showMentorsOnly ? "default" : "outline"}
              onClick={() => setShowMentorsOnly(!showMentorsOnly)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showMentorsOnly ? "Showing Mentors Only" : "Show Mentors Only"}
            </Button>
          </div>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredAlumni.length} {filteredAlumni.length === 1 ? "alumni" : "alumni"} found
          </p>
        </div>

        {/* Alumni Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card key={idx} className="p-6 animate-pulse">
                <div className="h-6 w-3/4 bg-secondary/60 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-secondary/50 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-secondary/40 rounded"></div>
              </Card>
            ))}
          </div>
        ) : filteredAlumni.length === 0 ? (
          <Card className="p-12 text-center border-border/50">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No alumni found</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlumni.map((alumni) => (
              <Card key={alumni._id} className="p-6 space-y-4 border-border/50 bg-card/50 hover-lift">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{alumni.fullName}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {alumni.designation} @ {alumni.currentCompany}
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="w-4 h-4" />
                    <span>Graduated {alumni.graduationYear}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{alumni.location || "Location not specified"}</span>
                  </div>
                </div>

                {/* Bio */}
                {alumni.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{alumni.bio}</p>
                )}

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {alumni.skills.slice(0, 3).map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {alumni.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{alumni.skills.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  {alumni.openToMentorship && (
                    <Badge className="bg-green-500 text-white">
                      Available for Mentorship
                    </Badge>
                  )}
                  {alumni.openToReferrals && (
                    <Badge className="bg-blue-500 text-white">
                      Open to Referrals
                    </Badge>
                  )}
                </div>

                {/* Action Button */}
                {alumni.openToMentorship && (
                  <Button
                    onClick={() => handleRequestMentorship(alumni)}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Request Mentorship
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Mentorship Request Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Mentorship</DialogTitle>
            </DialogHeader>
            
            {selectedAlumni && (
              <div className="space-y-4">
                {/* Alumni Info */}
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="font-bold">{selectedAlumni.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAlumni.designation} @ {selectedAlumni.currentCompany}
                  </p>
                </div>

                {/* Message */}
                <div>
                  <Label>Your Message *</Label>
                  <Textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Introduce yourself and explain why you'd like their mentorship..."
                    className="mt-1 min-h-[120px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {requestMessage.length}/500 characters
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="flex-1"
                    disabled={sendingRequest}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={sendMentorshipRequest}
                    disabled={sendingRequest || !requestMessage.trim()}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                  >
                    {sendingRequest ? "Sending..." : "Send Request"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default StudentAlumniDirectory;
