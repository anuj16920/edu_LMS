import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Settings, 
  UserCircle,
  LogOut,
  GraduationCap,
  ClipboardList,
  Bot
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/integrations/supabase/auth"; // ✅ ADDED THIS
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type UserRole = "admin" | "faculty" | "student";

interface AppSidebarProps {
  role: UserRole;
}

const navigationConfig = {
  admin: [
    { title: "Dashboard", icon: LayoutDashboard, url: "/admin/dashboard" },
    { title: "Faculty", icon: Users, url: "/admin/faculty" },
    { title: "Students", icon: GraduationCap, url: "/admin/students" },
    { title: "Tutorials", icon: BookOpen, url: "/admin/tutorials" },
    { title: "Tests", icon: FileText, url: "/admin/tests" },
    { title: "Assignments", icon: ClipboardList, url: "/admin/assignments" },
    { title: "Calendar", icon: Calendar, url: "/admin/calendar" },
    { title: "Chat", icon: MessageSquare, url: "/admin/chat" },
  ],
  faculty: [
    { title: "Dashboard", icon: LayoutDashboard, url: "/faculty/dashboard" },
    { title: "Tutorials", icon: BookOpen, url: "/faculty/tutorials" },
    { title: "Tests", icon: FileText, url: "/faculty/tests" },
    { title: "Assignments", icon: ClipboardList, url: "/faculty/assignments" },
    { title: "Calendar", icon: Calendar, url: "/faculty/calendar" },
    { title: "Chat", icon: MessageSquare, url: "/faculty/chat" },
  ],
  student: [
    { title: "Dashboard", icon: LayoutDashboard, url: "/student/dashboard" },
    { title: "Tutorials", icon: BookOpen, url: "/student/tutorials" },
    { title: "Tests", icon: FileText, url: "/student/tests" },
    { title: "Assignments", icon: ClipboardList, url: "/student/assignments" },
    { title: "Calendar", icon: Calendar, url: "/student/calendar" },
    { title: "Chat", icon: MessageSquare, url: "/student/chat" },
    { title: "AI Chatbot", icon: Bot, url: "/student/chatbot" },
  ],
};

export function AppSidebar({ role }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const { signOut } = useAuth(); // ✅ ADDED THIS
  const items = navigationConfig[role];

  // ✅ UPDATED THIS FUNCTION
  const handleLogout = async () => {
    console.log('🖱️ LOGOUT BUTTON CLICKED IN SIDEBAR!');
    try {
      toast.success("Logged out successfully");
      await signOut(); // ✅ THIS IS THE KEY LINE!
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force logout anyway if signOut fails
      localStorage.clear();
      navigate("/login");
    }
  };

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-glow flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-lg text-foreground">EduPortal</h2>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-primary/10 text-primary border-l-4 border-primary"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Actions */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={`/${role}/profile`}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all"
                  >
                    <UserCircle className="w-5 h-5" />
                    {!isCollapsed && <span>Profile</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={`/${role}/settings`}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all"
                  >
                    <Settings className="w-5 h-5" />
                    {!isCollapsed && <span>Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-sidebar border-t border-sidebar-border p-4">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
