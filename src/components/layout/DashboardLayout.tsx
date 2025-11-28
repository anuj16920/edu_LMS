import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle"; // ✅ NEW

type UserRole = "admin" | "faculty" | "student" | "alumni";

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar role={role} />
        
        <div className="flex-1 flex flex-col">
          <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden" />
                
                {/* MLRIT Logo Section */}
                <div className="flex items-center gap-3">
                  <img 
                    src="/mlrit-logo.png" 
                    alt="MLRIT Logo" 
                    className="h-12 w-auto object-contain"
                  />
                  <div>
                    <h1 className="text-lg font-bold text-foreground">MLRIT</h1>
                    <p className="text-xs text-muted-foreground capitalize">{role} Portal</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground hidden md:block">
                  Welcome back! 👋
                </p>
                {/* ✅ NEW: Theme Toggle Button */}
                <ThemeToggle />
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
