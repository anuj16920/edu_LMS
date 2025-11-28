import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
} from "lucide-react";
import apiClient from "@/integrations/supabase/client";

interface DashboardStats {
  totalStudents: number;
  totalAssignments: number;
  totalTests: number;
  totalTutorials: number;
  pendingGrading: number;
  upcomingTests: number;
  averageScore: number;
  submissionRate: number;
}

interface RecentItem {
  _id: string;
  title: string;
  type: string;
  date: string;
  status: string;
  count?: number;
}

const FacultyDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalAssignments: 0,
    totalTests: 0,
    totalTutorials: 0,
    pendingGrading: 0,
    upcomingTests: 0,
    averageScore: 0,
    submissionRate: 0,
  });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [studentsRes, assignmentsRes, testsRes, tutorialsRes] =
        await Promise.all([
          apiClient.get("/students"),
          apiClient.get("/assignments"),
          apiClient.get("/tests"),
          apiClient.get("/tutorials"),
        ]);

      const students = studentsRes.data;
      const assignments = assignmentsRes.data;
      const tests = testsRes.data;
      const tutorials = tutorialsRes.data;

      // Calculate pending grading
      const pendingGrading = assignments.reduce((sum: number, a: any) => {
        const ungraded = a.submissions.filter(
          (s: any) => s.grade === null
        ).length;
        return sum + ungraded;
      }, 0);

      // Calculate upcoming tests
      const now = new Date();
      const upcomingTests = tests.filter((t: any) => {
        const testDate = new Date(t.startTime);
        return testDate > now && t.status === "scheduled";
      }).length;

      // Calculate average score
      let totalGrades = 0;
      let gradedCount = 0;
      assignments.forEach((a: any) => {
        a.submissions.forEach((s: any) => {
          if (s.grade !== null) {
            totalGrades += s.grade;
            gradedCount++;
          }
        });
      });
      const avgScore = gradedCount > 0 ? Math.round(totalGrades / gradedCount) : 0;

      // Calculate submission rate
      const totalPossibleSubmissions = assignments.length * students.length;
      const actualSubmissions = assignments.reduce(
        (sum: number, a: any) => sum + a.submissions.length,
        0
      );
      const submissionRate =
        totalPossibleSubmissions > 0
          ? Math.round((actualSubmissions / totalPossibleSubmissions) * 100)
          : 0;

      setStats({
        totalStudents: students.length,
        totalAssignments: assignments.length,
        totalTests: tests.length,
        totalTutorials: tutorials.length,
        pendingGrading,
        upcomingTests,
        averageScore: avgScore,
        submissionRate,
      });

      // Generate recent items
      const recent: RecentItem[] = [];

      // Add recent assignments
      assignments.slice(0, 2).forEach((a: any) => {
        recent.push({
          _id: a._id,
          title: a.title,
          type: "assignment",
          date: a.createdAt,
          status: a.status,
          count: a.submissions.length,
        });
      });

      // Add recent tests
      tests.slice(0, 2).forEach((t: any) => {
        recent.push({
          _id: t._id,
          title: t.title,
          type: "test",
          date: t.createdAt,
          status: t.status,
        });
      });

      // Add recent tutorials
      tutorials.slice(0, 1).forEach((t: any) => {
        recent.push({
          _id: t._id,
          title: t.title,
          type: "tutorial",
          date: t.uploadedAt || t.createdAt,
          status: "active",
        });
      });

      // Sort by date
      recent.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setRecentItems(recent.slice(0, 5));
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
    });
  };

  if (loading) {
    return (
      <DashboardLayout role="faculty">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="faculty">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
            Faculty Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Overview of your teaching activities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.pendingGrading}</p>
                <p className="text-sm text-muted-foreground">Pending Grading</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.upcomingTests}</p>
                <p className="text-sm text-muted-foreground">Upcoming Tests</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.totalTutorials}</p>
                <p className="text-sm text-muted-foreground">Tutorials</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Recent Activities</h2>
            </div>
            <div className="space-y-4">
              {recentItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No recent activities
                </p>
              ) : (
                recentItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                        item.type === "assignment"
                          ? "bg-gradient-to-br from-orange-500 to-red-500"
                          : item.type === "test"
                          ? "bg-gradient-to-br from-purple-500 to-pink-500"
                          : "bg-gradient-to-br from-green-500 to-emerald-500"
                      }`}
                    >
                      {item.type === "assignment" ? (
                        <FileText className="w-5 h-5" />
                      ) : item.type === "test" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <BookOpen className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground capitalize">
                          {item.type}
                        </span>
                        {item.count !== undefined && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {item.count} submissions
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(item.date)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === "ongoing"
                          ? "bg-cyan-500/10 text-cyan-500"
                          : item.status === "scheduled"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-green-500/10 text-green-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Performance Stats */}
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Performance Overview</h2>
            </div>
            <div className="space-y-6">
              {/* Average Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Average Student Score</span>
                  <span className="text-sm font-bold text-primary">
                    {stats.averageScore}%
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-cyan-glow"
                    style={{ width: `${stats.averageScore}%` }}
                  />
                </div>
              </div>

              {/* Submission Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Submission Rate</span>
                  <span className="text-sm font-bold text-green-500">
                    {stats.submissionRate}%
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${stats.submissionRate}%` }}
                  />
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-gradient-to-br from-primary/10 to-cyan-glow/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Assignments
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalAssignments}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Tests
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalTests}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm font-medium mb-3">Quick Stats</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                    <span className="text-sm">Total Content</span>
                    <span className="text-sm font-bold">
                      {stats.totalAssignments + stats.totalTests + stats.totalTutorials}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                    <span className="text-sm">Grading Queue</span>
                    <span className="text-sm font-bold text-orange-500">
                      {stats.pendingGrading}
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

export default FacultyDashboard;
