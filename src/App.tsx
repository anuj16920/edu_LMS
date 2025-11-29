import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/integrations/supabase/auth";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Eager load only Login and LoginSuccess
import Login from "./pages/Login";
import LoginSuccess from "./pages/LoginSuccess";

// Lazy load all dashboard pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const FacultyDashboard = lazy(() => import("./pages/faculty/FacultyDashboard"));
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages - lazy loaded
const FacultyManagement = lazy(() => import("./pages/admin/FacultyManagement"));
const StudentManagement = lazy(() => import("./pages/admin/StudentManagement"));
const TutorialManagement = lazy(() => import("./pages/admin/TutorialManagement"));
const TestManagement = lazy(() => import("./pages/admin/TestManagement"));
const AssignmentManagement = lazy(() => import("./pages/admin/AssignmentManagement"));
const AdminCalendar = lazy(() => import("./pages/admin/AdminCalendar"));
const AdminChat = lazy(() => import("./pages/admin/AdminChat"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminMaterialManagement = lazy(() => import("./pages/admin/AdminMaterialManagement"));
const AdminUserManagement = lazy(() => import("./pages/admin/AdminUserManagement"));

// Faculty pages - lazy loaded
const FacultyTutorials = lazy(() => import("./pages/faculty/FacultyTutorials"));
const FacultyProfile = lazy(() => import("./pages/faculty/FacultyProfile"));
const FacultyTests = lazy(() => import("./pages/faculty/FacultyTests"));
const FacultyAssignments = lazy(() => import("./pages/faculty/FacultyAssignments"));
const FacultyCalendar = lazy(() => import("./pages/faculty/FacultyCalendar"));
const FacultyChat = lazy(() => import("./pages/faculty/FacultyChat"));
const FacultySettings = lazy(() => import("./pages/faculty/FacultySettings"));
const FacultyMaterials = lazy(() => import("./pages/faculty/FacultyMaterials"));

// Student pages - lazy loaded
const StudentTutorials = lazy(() => import("./pages/student/StudentTutorials"));
const StudentChatbot = lazy(() => import("./pages/student/StudentChatbot"));
const StudentProfile = lazy(() => import("./pages/student/StudentProfile"));
const StudentTests = lazy(() => import("./pages/student/StudentTests"));
const StudentAssignments = lazy(() => import("./pages/student/StudentAssignments"));
const StudentCalendar = lazy(() => import("./pages/student/StudentCalendar"));
const StudentChat = lazy(() => import("./pages/student/StudentChat"));
const StudentSettings = lazy(() => import("./pages/student/StudentSettings"));
const StudentAlumniDirectory = lazy(() => import("./pages/student/StudentAlumniDirectory"));
const StudentMentorshipRequests = lazy(() => import("./pages/student/StudentMentorshipRequests"));
const StudentCommunities = lazy(() => import("./pages/student/StudentCommunities"));
const StudentMaterials = lazy(() => import("./pages/student/StudentMaterials"));

// Alumni pages - lazy loaded
const AlumniDashboard = lazy(() => import("./pages/alumni/AlumniDashboard"));
const AlumniProfile = lazy(() => import("./pages/alumni/AlumniProfile"));
const AlumniDirectory = lazy(() => import("./pages/alumni/AlumniDirectory"));
const AlumniCommunities = lazy(() => import("./pages/alumni/AlumniCommunities"));
const AlumniMentorshipRequests = lazy(() => import("./pages/alumni/AlumniMentorshipRequests"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-premium-black via-background to-deep-navy">
    <div className="text-xl text-white animate-pulse">Loading...</div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: "admin" | "faculty" | "student" | "alumni";
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <>{children}</>;
};

// App Routes Component
const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Routes>
      {/* Root and Login Routes */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={`/${user.role}/dashboard`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/login"
        element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />}
      />
      <Route path="/login/success" element={<LoginSuccess />} />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/faculty"
        element={
          <ProtectedRoute allowedRole="admin">
            <Suspense fallback={<PageLoader />}>
              <FacultyManagement />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRole="admin">
            <Suspense fallback={<PageLoader />}>
              <StudentManagement />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tutorials"
        element={
          <ProtectedRoute allowedRole="admin">
            <Suspense fallback={<PageLoader />}>
              <TutorialManagement />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/materials"
        element={
          <ProtectedRoute allowedRole="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminMaterialManagement />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tests"
        element={
          <ProtectedRoute allowedRole="admin">
            <Suspense fallback={<PageLoader />}>
              <TestManagement />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assignments"
        element={
          <ProtectedRoute allowedRole="admin">
            <Suspense fallback={<PageLoader />}>
              <AssignmentManagement />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/calendar"
        element={
          <ProtectedRoute allowedRole="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminCalendar />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/chat"
        element={
          <ProtectedRoute allowedRole="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminChat />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRole="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminProfile />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRole="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminSettings />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRole="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminUserManagement />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Faculty Routes */}
      <Route
        path="/faculty/dashboard"
        element={
          <ProtectedRoute allowedRole="faculty">
            <Suspense fallback={<PageLoader />}>
              <FacultyDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/tutorials"
        element={
          <ProtectedRoute allowedRole="faculty">
            <Suspense fallback={<PageLoader />}>
              <FacultyTutorials />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/materials"
        element={
          <ProtectedRoute allowedRole="faculty">
            <Suspense fallback={<PageLoader />}>
              <FacultyMaterials />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/tests"
        element={
          <ProtectedRoute allowedRole="faculty">
            <Suspense fallback={<PageLoader />}>
              <FacultyTests />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/assignments"
        element={
          <ProtectedRoute allowedRole="faculty">
            <Suspense fallback={<PageLoader />}>
              <FacultyAssignments />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/calendar"
        element={
          <ProtectedRoute allowedRole="faculty">
            <Suspense fallback={<PageLoader />}>
              <FacultyCalendar />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/chat"
        element={
          <ProtectedRoute allowedRole="faculty">
            <Suspense fallback={<PageLoader />}>
              <FacultyChat />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/profile"
        element={
          <ProtectedRoute allowedRole="faculty">
            <Suspense fallback={<PageLoader />}>
              <FacultyProfile />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/settings"
        element={
          <ProtectedRoute allowedRole="faculty">
            <Suspense fallback={<PageLoader />}>
              <FacultySettings />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <Suspense fallback={<PageLoader />}>
              <StudentDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/tutorials"
        element={
          <ProtectedRoute allowedRole="student">
            <Suspense fallback={<PageLoader />}>
              <StudentTutorials />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/materials"
        element={
          <ProtectedRoute allowedRole="student">
            <Suspense fallback={<PageLoader />}>
              <StudentMaterials />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/tests"
        element={
          <ProtectedRoute allowedRole="student">
            <Suspense fallback={<PageLoader />}>
              <StudentTests />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assignments"
        element={
          <ProtectedRoute allowedRole="student">
            <Suspense fallback={<PageLoader />}>
              <StudentAssignments />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/calendar"
        element={
          <ProtectedRoute allowedRole="student">
            <Suspense fallback={<PageLoader />}>
              <StudentCalendar />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/chat"
        element={
          <ProtectedRoute allowedRole="student">
            <Suspense fallback={<PageLoader />}>
              <StudentChat />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/chatbot"
        element={
          <ProtectedRoute allowedRole="student">
            <Suspense fallback={<PageLoader />}>
              <StudentChatbot />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRole="student">
            <Suspense fallback={<PageLoader />}>
              <StudentProfile />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/settings"
        element={
          <ProtectedRoute allowedRole="student">
            <Suspense fallback={<PageLoader />}>
              <StudentSettings />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/alumni-directory"
        element={
          <ProtectedRoute allowedRole="student">
            <Suspense fallback={<PageLoader />}>
              <StudentAlumniDirectory />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/mentorship-requests"
        element={
          <ProtectedRoute allowedRole="student">
            <Suspense fallback={<PageLoader />}>
              <StudentMentorshipRequests />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/communities"
        element={
          <ProtectedRoute allowedRole="student">
            <Suspense fallback={<PageLoader />}>
              <StudentCommunities />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Alumni Routes */}
      <Route
        path="/alumni/dashboard"
        element={
          <ProtectedRoute allowedRole="alumni">
            <Suspense fallback={<PageLoader />}>
              <AlumniDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/alumni/profile"
        element={
          <ProtectedRoute allowedRole="alumni">
            <Suspense fallback={<PageLoader />}>
              <AlumniProfile />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/alumni/directory"
        element={
          <ProtectedRoute allowedRole="alumni">
            <Suspense fallback={<PageLoader />}>
              <AlumniDirectory />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/alumni/communities"
        element={
          <ProtectedRoute allowedRole="alumni">
            <Suspense fallback={<PageLoader />}>
              <AlumniCommunities />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/alumni/mentorship-requests"
        element={
          <ProtectedRoute allowedRole="alumni">
            <Suspense fallback={<PageLoader />}>
              <AlumniMentorshipRequests />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          <Suspense fallback={<PageLoader />}>
            <NotFound />
          </Suspense>
        }
      />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
