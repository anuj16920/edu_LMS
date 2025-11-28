import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { GraduationCap, UserCog, Users, BookOpen, Award } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/integrations/supabase/auth";
import apiClient from "@/integrations/supabase/client";

type UserRole = "admin" | "faculty" | "student" | "alumni";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      const userRole = user.role || "student";
      navigate(`/${userRole}/dashboard`);
    }
  }, [user, loading, navigate]);

  const roles = [
    {
      type: "admin" as UserRole,
      title: "Admin",
      icon: UserCog,
      description: "Manage platform and users",
      gradient: "from-primary to-cyan-glow",
    },
    {
      type: "faculty" as UserRole,
      title: "Faculty",
      icon: BookOpen,
      description: "Create and manage content",
      gradient: "from-accent to-primary",
    },
    {
      type: "student" as UserRole,
      title: "Student",
      icon: Users,
      description: "Learn and grow",
      gradient: "from-cyan-glow to-accent",
    },
    {
      type: "alumni" as UserRole,
      title: "Alumni",
      icon: Award,
      description: "Connect and mentor",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const handleAuth = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    if (isSignUp) {
      if (!fullName) {
        toast.error("Please enter your full name");
        return;
      }

      const { error } = await signUp(email, password, fullName, selectedRole);

      if (error) {
        toast.error(typeof error === "string" ? error : "Sign up failed");
        return;
      }

      toast.success("Account created successfully!");
      navigate(`/${selectedRole}/dashboard`);
    } else {
      const { error } = await signIn(email, password);

      if (error) {
        toast.error(typeof error === "string" ? error : "Login failed");
        return;
      }

      toast.success("Welcome back!");
    }
  };

  const handleGoogleAuth = async () => {
    if (!selectedRole) {
      toast.error("Please select a role first");
      return;
    }

    try {
      console.log("🔐 Initiating Google login with role:", selectedRole);

      const { data } = await apiClient.get(`/auth/google/url?role=${selectedRole}`);

      if (data.url) {
        console.log("✅ Got Google auth URL, redirecting...");
        window.location.href = data.url;
      } else {
        toast.error("Failed to get Google login URL");
      }
    } catch (error: any) {
      console.error("❌ Google auth error:", error);
      toast.error("Google authentication failed to start");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-premium-black via-background to-deep-navy">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-premium-black via-background to-deep-navy p-4">
      <div className="w-full max-w-6xl">
        {/* Header with MLRIT logo */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img
              src="/mlrit-logo.png"
              alt="MLRIT"
              className="h-12 w-auto drop-shadow-lg"
            />
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
                MLRIT EduPortal
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Premium Learning Management System
              </p>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        {!selectedRole ? (
          <div className="grid md:grid-cols-4 gap-6 mb-8 animate-slide-up">
            {roles.map((role, idx) => {
              const Icon = role.icon;
              return (
                <Card
                  key={role.type}
                  onClick={() => setSelectedRole(role.type)}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  className="p-8 cursor-pointer hover-lift border-border/50 bg-card/50 backdrop-blur-sm group animate-scale-in"
                >
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${role.gradient} p-4 group-hover:animate-glow transition-all duration-300`}
                  >
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-2 text-foreground">
                    {role.title}
                  </h3>
                  <p className="text-muted-foreground text-center">
                    {role.description}
                  </p>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="max-w-md mx-auto p-8 border-border/50 bg-card/80 backdrop-blur-md shadow-premium animate-scale-in">
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedRole(null);
                  setIsSignUp(false);
                }}
                className="mb-4 text-muted-foreground hover:text-foreground"
              >
                ← Change Role
              </Button>
              <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-cyan-glow bg-clip-text text-transparent animate-shimmer">
                {roles.find((r) => r.type === selectedRole)?.title}{" "}
                {isSignUp ? "Sign Up" : "Login"}
              </h2>
            </div>

            <div className="space-y-4 mb-6">
              {isSignUp && (
                <div>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                  />
                </div>
              )}
              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleAuth}
                className="w-full bg-gradient-to-r from-primary to-cyan-glow hover:shadow-neon transition-all duration-300 hover-lift"
              >
                {isSignUp ? "Sign Up" : "Sign In"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                onClick={handleGoogleAuth}
                variant="outline"
                className="w-full border-border/50 hover:bg-secondary/50 hover:border-primary transition-all hover-lift"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:underline"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Login;
