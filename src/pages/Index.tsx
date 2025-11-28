import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050A0F] via-[#0A1A2F] to-[#050A0F] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ top: '10%', left: '10%' }}></div>
        <div className="absolute w-96 h-96 bg-cyan-glow/20 rounded-full blur-3xl animate-pulse" style={{ bottom: '10%', right: '10%', animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 text-center space-y-12 animate-fade-in">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-cyan-glow flex items-center justify-center shadow-glow transform hover:scale-110 transition-all duration-300">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
            🎓 EduPortal
          </h1>
          <p className="text-xl text-muted-foreground">Premium Learning Management System</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:shadow-glow">
            <h3 className="text-lg font-semibold text-foreground mb-2">📚 Smart Learning</h3>
            <p className="text-sm text-muted-foreground">AI-powered tutorials and personalized learning paths</p>
          </div>
          <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:shadow-glow">
            <h3 className="text-lg font-semibold text-foreground mb-2">🎯 Track Progress</h3>
            <p className="text-sm text-muted-foreground">Real-time analytics and performance tracking</p>
          </div>
          <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:shadow-glow">
            <h3 className="text-lg font-semibold text-foreground mb-2">💬 Collaborate</h3>
            <p className="text-sm text-muted-foreground">Built-in chat and group collaboration tools</p>
          </div>
        </div>

        <Button 
          onClick={() => navigate('/login')}
          className="bg-gradient-to-r from-primary to-cyan-glow hover:shadow-glow text-white px-12 py-6 text-lg rounded-xl transform hover:scale-105 transition-all duration-300"
        >
          Get Started →
        </Button>
      </div>
    </div>
  );
};

export default Index;
