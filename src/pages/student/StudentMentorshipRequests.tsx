import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, XCircle, Mail, Briefcase, Calendar } from "lucide-react";
import apiClient from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MentorshipRequest {
  _id: string;
  alumni: {
    _id: string;
    fullName: string;
    email: string;
    currentCompany: string;
    designation: string;
  };
  message: string;
  status: "pending" | "accepted" | "rejected";
  alumniName: string;
  alumniCompany: string;
  alumniDesignation: string;
  rejectionReason?: string;
  createdAt: string;
  respondedAt?: string;
}

const StudentMentorshipRequests = () => {
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/mentorship/my-requests");
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load mentorship requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRequests = (status?: string) => {
    if (!status || status === "all") return requests;
    return requests.filter(r => r.status === status);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 text-white"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "accepted":
        return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const RequestCard = ({ request }: { request: MentorshipRequest }) => (
    <Card className="p-6 border-border/50 bg-card/50 hover-lift">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{request.alumniName}</h3>
            <p className="text-sm text-muted-foreground">
              {request.alumniDesignation} @ {request.alumniCompany}
            </p>
          </div>
        </div>
        {getStatusBadge(request.status)}
      </div>

      {/* Request Details */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1">YOUR MESSAGE:</p>
          <p className="text-sm bg-secondary/50 p-3 rounded-lg">{request.message}</p>
        </div>

        {request.status === "rejected" && request.rejectionReason && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">REASON:</p>
            <p className="text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-600">
              {request.rejectionReason}
            </p>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Sent: {new Date(request.createdAt).toLocaleDateString()}</span>
          </div>
          {request.respondedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Responded: {new Date(request.respondedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Contact Button for Accepted */}
        {request.status === "accepted" && (
          <Button
            onClick={() => window.location.href = `mailto:${request.alumni?.email || ''}`}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact Mentor
          </Button>
        )}
      </div>
    </Card>
  );

  const EmptyState = ({ status }: { status: string }) => (
    <Card className="p-12 text-center border-border/50">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
        {status === "pending" && <Clock className="w-8 h-8 text-muted-foreground" />}
        {status === "accepted" && <CheckCircle className="w-8 h-8 text-muted-foreground" />}
        {status === "rejected" && <XCircle className="w-8 h-8 text-muted-foreground" />}
        {status === "all" && <Mail className="w-8 h-8 text-muted-foreground" />}
      </div>
      <p className="text-muted-foreground">
        {status === "pending" && "No pending requests"}
        {status === "accepted" && "No accepted requests yet"}
        {status === "rejected" && "No rejected requests"}
        {status === "all" && "No mentorship requests sent yet"}
      </p>
    </Card>
  );

  return (
    <DashboardLayout role="student">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            My Mentorship Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all your mentorship requests and connect with mentors
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-border/50">
            <p className="text-sm text-muted-foreground">Total Requests</p>
            <p className="text-2xl font-bold">{requests.length}</p>
          </Card>
          <Card className="p-4 border-border/50 bg-yellow-500/10">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {requests.filter(r => r.status === "pending").length}
            </p>
          </Card>
          <Card className="p-4 border-border/50 bg-green-500/10">
            <p className="text-sm text-muted-foreground">Accepted</p>
            <p className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === "accepted").length}
            </p>
          </Card>
          <Card className="p-4 border-border/50 bg-red-500/10">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {requests.filter(r => r.status === "rejected").length}
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Card key={idx} className="p-6 animate-pulse">
                    <div className="h-6 w-3/4 bg-secondary/60 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-secondary/50 rounded"></div>
                  </Card>
                ))}
              </div>
            ) : getFilteredRequests("all").length === 0 ? (
              <EmptyState status="all" />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {getFilteredRequests("all").map(request => (
                  <RequestCard key={request._id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {getFilteredRequests("pending").length === 0 ? (
              <EmptyState status="pending" />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {getFilteredRequests("pending").map(request => (
                  <RequestCard key={request._id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4 mt-6">
            {getFilteredRequests("accepted").length === 0 ? (
              <EmptyState status="accepted" />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {getFilteredRequests("accepted").map(request => (
                  <RequestCard key={request._id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-6">
            {getFilteredRequests("rejected").length === 0 ? (
              <EmptyState status="rejected" />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {getFilteredRequests("rejected").map(request => (
                  <RequestCard key={request._id} request={request} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StudentMentorshipRequests;
