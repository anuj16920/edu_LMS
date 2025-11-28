import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Clock,
  CheckCircle,
  Award,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Calendar,
} from "lucide-react";
import apiClient from "@/integrations/supabase/client";

interface DashboardStats {
  totalAssignments: number;
  submittedAssignments: number;
  pendingAssignments: number;
  totalTests: number;
  completedTests: number;
  upcomingTests: number;
  averageScore: number;
  totalTutorials: number;
}

interface UpcomingItem {
  _id: string;
  title: string;
  type: string;
  deadline: string;
  status: string;
}

const StudentDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAssignments: 0,
    submittedAssignments: 0,
    pendingAssignments: 0,
    totalTests: 0,
    completedTests: 0,
    upcomingTests: 0,
    averageScore: 0,
    totalTutorials: 0,
  });
  const [upcomingItems, setUpcomingItems] = useState<UpcomingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id;

      const [assignmentsRes, testsRes, tutorialsRes] = await Promise.all([
        apiClient.get("/assignments"),
        apiClient.get("/tests"),
        apiClient.get("/tutorials"),
      ]);

      const assignments = assignmentsRes.data;
      const tests = testsRes.data;
      const tutorials = tutorialsRes.data;

      // Calculate assignment stats
      const submittedAssignments = assignments.filter((a: any) =>
        a.submissions.some((s: any) => s.studentId === userId)
      ).length;

      // Calculate test stats
      const now = new Date();
      const completedTests = tests.filter((t: any) => {
        const endTime = new Date(t.endTime);
        return endTime < now;
      }).length;

      const upcomingTests = tests.filter((t: any) => {
        const startTime = new Date(t.startTime);
        return startTime > now && t.status === "scheduled";
      }).length;

      // Calculate average score
      let totalGrades = 0;
      let gradedCount = 0;
      assignments.forEach((a: any) => {
        const userSubmission = a.submissions.find(
          (s: any) => s.studentId === userId
        );
        if (userSubmission && userSubmission.grade !== null) {
          totalGrades += userSubmission.grade;
          gradedCount++;
        }
      });
      const avgScore = gradedCount > 0 ? Math.round(totalGrades / gradedCount) : 0;

      setStats({
        totalAssignments: assignments.length,
        submittedAssignments,
        pendingAssignments: assignments.length - submittedAssignments,
        totalTests: tests.length,
        completedTests,
        upcomingTests,
        averageScore: avgScore,
        totalTutorials: tutorials.length,
      });

      // Generate upcoming items
      const upcoming: UpcomingItem[] = [];

      // Add pending assignments
      assignments.forEach((a: any) => {
        const hasSubmitted = a.submissions.some(
          (s: any) => s.studentId === userId
        );
        if (!hasSubmitted && new Date(a.deadline) > now) {
          upcoming.push({
            _id: a._id,
            title: a.title,
            type: "assignment",
            deadline: a.deadline,
            status: "pending",
          });
        }
      });

      // Add upcoming tests
      tests.forEach((t: any) => {
        const startTime = new Date(t.startTime);
        if (startTime > now && t.status === "scheduled") {
          upcoming.push({
            _id: t._id,
            title: t.title,
            type: "test",
            deadline: t.startTime,
            status: "upcoming",
          });
        }
      });

      // Sort by deadline
      upcoming.sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );

      setUpcomingItems(upcoming.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get days until deadline
  const getDaysUntil = (dateString: string) => {
    const deadline = new Date(dateString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days`;
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
            Student Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your academic progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.totalAssignments}</p>
                <p className="text-sm text-muted-foreground">Total Assignments</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.submittedAssignments}</p>
                <p className="text-sm text-muted-foreground">Submitted</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.pendingAssignments}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.averageScore}%</p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Deadlines */}
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Upcoming Deadlines</h2>
            </div>
            <div className="space-y-4">
              {upcomingItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No upcoming deadlines
                </p>
              ) : (
                upcomingItems.map((item) => {
                  const daysUntil = getDaysUntil(item.deadline);
                  const isUrgent = daysUntil === "Today" || daysUntil === "Tomorrow";

                  return (
                    <div
                      key={item._id}
                      className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                        isUrgent
                          ? "bg-red-500/10 border-2 border-red-500/30"
                          : "bg-secondary/30 hover:bg-secondary/50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                          item.type === "assignment"
                            ? "bg-gradient-to-br from-orange-500 to-red-500"
                            : "bg-gradient-to-br from-purple-500 to-pink-500"
                        }`}
                      >
                        {item.type === "assignment" ? (
                          <FileText className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {item.type}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(item.deadline)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            isUrgent
                              ? "bg-red-500 text-white"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {daysUntil}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Performance Overview */}
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Performance Overview</h2>
            </div>
            <div className="space-y-6">
              {/* Completion Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <span className="text-sm font-bold text-primary">
                    {stats.totalAssignments > 0
                      ? Math.round(
                          (stats.submittedAssignments / stats.totalAssignments) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-cyan-glow"
                    style={{
                      width: `${
                        stats.totalAssignments > 0
                          ? (stats.submittedAssignments / stats.totalAssignments) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Average Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Average Score</span>
                  <span className="text-sm font-bold text-green-500">
                    {stats.averageScore}%
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${stats.averageScore}%` }}
                  />
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Tests
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{stats.completedTests}/{stats.totalTests}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Tutorials
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalTutorials}</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm font-medium mb-3">Quick Stats</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                    <span className="text-sm">Upcoming Tests</span>
                    <span className="text-sm font-bold text-purple-500">
                      {stats.upcomingTests}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                    <span className="text-sm">Pending Work</span>
                    <span className="text-sm font-bold text-orange-500">
                      {stats.pendingAssignments}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
