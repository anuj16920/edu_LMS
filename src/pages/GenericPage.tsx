import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface GenericPageProps {
  role: "admin" | "faculty" | "student";
  title: string;
  description?: string;
}

const GenericPage = ({ role, title, description }: GenericPageProps) => {
  return (
    <DashboardLayout role={role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
            {title}
          </h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>

        <Card className="p-12 border-border/50 bg-card/50 backdrop-blur-sm text-center">
          <Construction className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2 text-foreground">Coming Soon</h2>
          <p className="text-muted-foreground">
            This feature is currently under development. Check back soon!
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GenericPage;
