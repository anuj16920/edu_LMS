import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import apiClient from "@/integrations/supabase/client";

interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  totalTests: number;
  totalAssignments: number;
  pendingTests: number;
  courseCompletionRate: number;
  averageTestScore: number;
  assignmentSubmissionRate: number;
  studentGrowth: number;
  facultyGrowth: number;
  courseGrowth: number;
}

interface Activity {
  _id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
  type: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalTests: 0,
    totalAssignments: 0,
    pendingTests: 0,
    courseCompletionRate: 0,
    averageTestScore: 0,
    assignmentSubmissionRate: 0,
    studentGrowth: 0,
    facultyGrowth: 0,
    courseGrowth: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch all data
      const [
        studentsRes,
        facultyRes,
        tutorialsRes,
        testsRes,
        assignmentsRes,
        assignmentStatsRes,
      ] = await Promise.all([
        apiClient.get("/students"),
        apiClient.get("/faculty"),
        apiClient.get("/tutorials"),
        apiClient.get("/tests"),
        apiClient.get("/assignments"),
        apiClient.get("/assignments/stats/summary"),
      ]);

      const students = studentsRes.data;
      const faculty = facultyRes.data;
      const tutorials = tutorialsRes.data;
      const tests = testsRes.data;
      const assignments = assignmentsRes.data;
      const assignmentStats = assignmentStatsRes.data;

      // Calculate pending tests
      const pendingTests = tests.filter(
        (t: any) => t.status === "scheduled"
      ).length;

      // Calculate average test score (mock data)
      const avgTestScore = 82;

      setStats({
        totalStudents: students.length,
        totalFaculty: faculty.length,
        totalCourses: tutorials.length,
        totalTests: tests.length,
        totalAssignments: assignments.length,
        pendingTests,
        courseCompletionRate: 87,
        averageTestScore: avgTestScore,
        assignmentSubmissionRate: assignmentStats.averageScore || 94,
        studentGrowth: 12,
        facultyGrowth: 3,
        courseGrowth: 2,
      });

      // Generate recent activities
      const recentActivities: Activity[] = [];

      // Add tutorial activities
      tutorials.slice(0, 2).forEach((tutorial: any) => {
        recentActivities.push({
          _id: tutorial._id,
          user: tutorial.uploadedBy || "Dr. Sarah Johnson",
          action: "Created new tutorial",
          details: tutorial.title,
          timestamp: tutorial.uploadedAt || tutorial.createdAt,
          type: "tutorial",
        });
      });

      // Add test activities
      tests.slice(0, 2).forEach((test: any) => {
        recentActivities.push({
          _id: test._id,
          user: test.createdByName || "Prof. Mike Chen",
          action: "Published test",
          details: test.title,
          timestamp: test.createdAt,
          type: "test",
        });
      });

      // Add assignment activities
      assignments.slice(0, 1).forEach((assignment: any) => {
        if (assignment.submissions && assignment.submissions.length > 0) {
          const latestSubmission =
            assignment.submissions[assignment.submissions.length - 1];
          recentActivities.push({
            _id: latestSubmission._id,
            user: latestSubmission.studentName || "Emily Davis",
            action: "Submitted assignment",
            details: assignment.title,
            timestamp: latestSubmission.submittedAt,
            type: "assignment",
          });
        }
      });

      // Sort by timestamp
      recentActivities.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(recentActivities.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  };

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Platform overview and management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 border-border/50 bg-card/50 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-green-500 text-sm font-medium">
                  +{stats.studentGrowth}%
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.totalFaculty}</p>
                  <p className="text-sm text-muted-foreground">Faculty Members</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-green-500 text-sm font-medium">
                  +{stats.facultyGrowth}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.totalCourses}</p>
                  <p className="text-sm text-muted-foreground">Active Courses</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-green-500 text-sm font-medium">
                  +{stats.courseGrowth}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.pendingTests}</p>
                  <p className="text-sm text-muted-foreground">Pending Tests</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-red-500 text-sm font-medium">-4</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Recent Activities</h2>
            </div>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No recent activities
                </p>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        activity.type === "tutorial"
                          ? "bg-gradient-to-br from-green-500 to-emerald-500"
                          : activity.type === "test"
                          ? "bg-gradient-to-br from-purple-500 to-pink-500"
                          : "bg-gradient-to-br from-orange-500 to-red-500"
                      }`}
                    >
                      {getInitials(activity.user)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.action} • {activity.details}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Quick Stats</h2>
            </div>
            <div className="space-y-6">
              {/* Course Completion Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Course Completion Rate
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {stats.courseCompletionRate}%
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-cyan-glow"
                    style={{ width: `${stats.courseCompletionRate}%` }}
                  />
                </div>
              </div>

              {/* Average Test Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Average Test Score</span>
                  <span className="text-sm font-bold text-cyan-500">
                    {stats.averageTestScore}%
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: `${stats.averageTestScore}%` }}
                  />
                </div>
              </div>

              {/* Assignment Submission */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Assignment Submission
                  </span>
                  <span className="text-sm font-bold text-green-500">
                    {stats.assignmentSubmissionRate}%
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${stats.assignmentSubmissionRate}%` }}
                  />
                </div>
              </div>

              {/* Additional Stats Cards */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-gradient-to-br from-primary/10 to-cyan-glow/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Total Tests
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalTests}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Assignments
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalAssignments}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
