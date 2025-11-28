import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/integrations/supabase/auth";
import Login from "./pages/Login";
import LoginSuccess from "./pages/LoginSuccess";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import NotFound from "./pages/NotFound";

// Admin pages
import FacultyManagement from "./pages/admin/FacultyManagement";
import StudentManagement from "./pages/admin/StudentManagement";
import TutorialManagement from "./pages/admin/TutorialManagement";
import TestManagement from "./pages/admin/TestManagement";
import AssignmentManagement from "./pages/admin/AssignmentManagement";
import AdminCalendar from "./pages/admin/AdminCalendar";
import AdminChat from "./pages/admin/AdminChat";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminSettings from "./pages/admin/AdminSettings";

// Faculty pages
import FacultyTutorials from "./pages/faculty/FacultyTutorials";
import FacultyProfile from "./pages/faculty/FacultyProfile";
import FacultyTests from "./pages/faculty/FacultyTests";
import FacultyAssignments from "./pages/faculty/FacultyAssignments";
import FacultyCalendar from "./pages/faculty/FacultyCalendar";
import FacultyChat from "./pages/faculty/FacultyChat";
import FacultySettings from "./pages/faculty/FacultySettings";

// Student pages
import StudentTutorials from "./pages/student/StudentTutorials";
import StudentChatbot from "./pages/student/StudentChatbot";
import StudentProfile from "./pages/student/StudentProfile";
import StudentTests from "./pages/student/StudentTests";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentCalendar from "./pages/student/StudentCalendar";
import StudentChat from "./pages/student/StudentChat";
import StudentSettings from "./pages/student/StudentSettings";

// ✅ Alumni pages
import AlumniDashboard from "./pages/alumni/AlumniDashboard";
import AlumniProfile from "./pages/alumni/AlumniProfile";
import AlumniDirectory from "./pages/alumni/AlumniDirectory";
import AlumniCommunities from "./pages/alumni/AlumniCommunities"; // ✅ NEW

const queryClient = new QueryClient();

// ✅ Protected Route Component
const ProtectedRoute = ({ 
  children, 
  allowedRole 
}: { 
  children: React.ReactNode; 
  allowedRole: 'admin' | 'faculty' | 'student' | 'alumni';
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root and Login Routes */}
      <Route 
        path="/" 
        element={
          user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/login" 
        element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />} 
      />
      
      <Route 
        path="/login/success" 
        element={<LoginSuccess />} 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/faculty" 
        element={
          <ProtectedRoute allowedRole="admin">
            <FacultyManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/students" 
        element={
          <ProtectedRoute allowedRole="admin">
            <StudentManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/tutorials" 
        element={
          <ProtectedRoute allowedRole="admin">
            <TutorialManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/tests" 
        element={
          <ProtectedRoute allowedRole="admin">
            <TestManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/assignments" 
        element={
          <ProtectedRoute allowedRole="admin">
            <AssignmentManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/calendar" 
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminCalendar />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/chat" 
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminChat />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/profile" 
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/settings" 
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminSettings />
          </ProtectedRoute>
        } 
      />

      {/* Faculty Routes */}
      <Route 
        path="/faculty/dashboard" 
        element={
          <ProtectedRoute allowedRole="faculty">
            <FacultyDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/faculty/tutorials" 
        element={
          <ProtectedRoute allowedRole="faculty">
            <FacultyTutorials />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/faculty/tests" 
        element={
          <ProtectedRoute allowedRole="faculty">
            <FacultyTests />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/faculty/assignments" 
        element={
          <ProtectedRoute allowedRole="faculty">
            <FacultyAssignments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/faculty/calendar" 
        element={
          <ProtectedRoute allowedRole="faculty">
            <FacultyCalendar />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/faculty/chat" 
        element={
          <ProtectedRoute allowedRole="faculty">
            <FacultyChat />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/faculty/profile" 
        element={
          <ProtectedRoute allowedRole="faculty">
            <FacultyProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/faculty/settings" 
        element={
          <ProtectedRoute allowedRole="faculty">
            <FacultySettings />
          </ProtectedRoute>
        } 
      />

      {/* Student Routes */}
      <Route 
        path="/student/dashboard" 
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/tutorials" 
        element={
          <ProtectedRoute allowedRole="student">
            <StudentTutorials />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/tests" 
        element={
          <ProtectedRoute allowedRole="student">
            <StudentTests />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/assignments" 
        element={
          <ProtectedRoute allowedRole="student">
            <StudentAssignments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/calendar" 
        element={
          <ProtectedRoute allowedRole="student">
            <StudentCalendar />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/chat" 
        element={
          <ProtectedRoute allowedRole="student">
            <StudentChat />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/chatbot" 
        element={
          <ProtectedRoute allowedRole="student">
            <StudentChatbot />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/profile" 
        element={
          <ProtectedRoute allowedRole="student">
            <StudentProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/settings" 
        element={
          <ProtectedRoute allowedRole="student">
            <StudentSettings />
          </ProtectedRoute>
        } 
      />

      {/* ✅ Alumni Routes */}
      <Route 
        path="/alumni/dashboard" 
        element={
          <ProtectedRoute allowedRole="alumni">
            <AlumniDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/alumni/profile" 
        element={
          <ProtectedRoute allowedRole="alumni">
            <AlumniProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/alumni/directory" 
        element={
          <ProtectedRoute allowedRole="alumni">
            <AlumniDirectory />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/alumni/communities" 
        element={
          <ProtectedRoute allowedRole="alumni">
            <AlumniCommunities />
          </ProtectedRoute>
        } 
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
