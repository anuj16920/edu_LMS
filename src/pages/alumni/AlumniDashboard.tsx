import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Users, MessageSquare, Briefcase, TrendingUp, Calendar } from "lucide-react";
import { useAuth } from "@/integrations/supabase/auth";
import { useNavigate } from "react-router-dom";
import apiClient from "@/integrations/supabase/client";
import { toast } from "sonner";

const AlumniDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAlumni: 0,
    communitiesJoined: 0,
    mentorshipRequests: 0,
    profileCompletion: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with real API calls
      const { data } = await apiClient.get('/alumni/dashboard-stats');
      setStats(data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      // Mock data for now
      setStats({
        totalAlumni: 250,
        communitiesJoined: 3,
        mentorshipRequests: 5,
        profileCompletion: 75,
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Complete Profile",
      description: "Add your work experience & skills",
      icon: Award,
      color: "from-purple-500 to-pink-500",
      action: () => navigate("/alumni/profile"),
    },
    {
      title: "Browse Alumni",
      description: "Connect with fellow graduates",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      action: () => navigate("/alumni/directory"),
    },
    {
      title: "Join Communities",
      description: "Participate in discussions",
      icon: MessageSquare,
      color: "from-green-500 to-emerald-500",
      action: () => navigate("/alumni/communities"),
    },
    {
      title: "Mentorship",
      description: "View mentorship requests",
      icon: Briefcase,
      color: "from-orange-500 to-red-500",
      action: () => navigate("/alumni/mentorship-requests"),
    },
  ];

  return (
    <DashboardLayout role="alumni">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user?.fullName || "Alumni"}! 🎓
              </h1>
              <p className="text-white/90 text-lg">
                Great to see you in the alumni community
              </p>
            </div>
            <Award className="w-20 h-20 opacity-20" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalAlumni}</p>
                <p className="text-sm text-muted-foreground">Total Alumni</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.communitiesJoined}</p>
                <p className="text-sm text-muted-foreground">Communities Joined</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.mentorshipRequests}</p>
                <p className="text-sm text-muted-foreground">Mentorship Requests</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.profileCompletion}%</p>
                <p className="text-sm text-muted-foreground">Profile Complete</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Card
                  key={idx}
                  onClick={action.action}
                  className="p-6 cursor-pointer hover-lift border-border/50 bg-card/50 backdrop-blur-sm group transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Profile Completion Alert */}
        {stats.profileCompletion < 100 && (
          <Card className="p-6 border-orange-500/50 bg-orange-500/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Complete Your Profile</h3>
                <p className="text-muted-foreground mb-4">
                  Your profile is {stats.profileCompletion}% complete. Add your work experience, skills, and contact information to help students connect with you.
                </p>
                <Button
                  onClick={() => navigate("/alumni/profile")}
                  className="bg-gradient-to-r from-orange-500 to-red-500"
                >
                  Complete Profile
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-border/50 bg-card/50">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Recent Community Activity
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground">No recent activity yet</p>
                <p className="text-xs text-muted-foreground mt-1">Join communities to see updates</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Events
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground">No upcoming events</p>
                <p className="text-xs text-muted-foreground mt-1">Check back later for alumni meetups</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AlumniDashboard;
