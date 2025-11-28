import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Briefcase, Edit, Save } from "lucide-react";
import { useState } from "react";

const FacultyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <DashboardLayout role="faculty">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
              Profile
            </h1>
            <p className="text-muted-foreground">Manage your account information</p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? "bg-gradient-to-r from-primary to-cyan-glow" : ""}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm text-center">
            <Avatar className="w-32 h-32 mx-auto mb-4">
              <AvatarFallback className="bg-gradient-to-br from-primary to-cyan-glow text-white text-4xl">
                SJ
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-foreground mb-1">Dr. Sarah Johnson</h2>
            <p className="text-muted-foreground mb-4">Computer Science Faculty</p>
            <Button variant="outline" className="w-full">
              Change Avatar
            </Button>
          </Card>

          <Card className="lg:col-span-2 p-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6">Personal Information</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-primary" />
                    Full Name
                  </Label>
                  <Input
                    defaultValue="Dr. Sarah Johnson"
                    disabled={!isEditing}
                    className="bg-secondary/30 border-border/50"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Email
                  </Label>
                  <Input
                    defaultValue="sarah.j@college.edu"
                    disabled={!isEditing}
                    type="email"
                    className="bg-secondary/30 border-border/50"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-primary" />
                    Phone Number
                  </Label>
                  <Input
                    defaultValue="+1 234-567-8901"
                    disabled={!isEditing}
                    className="bg-secondary/30 border-border/50"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    Department
                  </Label>
                  <Input
                    defaultValue="Computer Science"
                    disabled={!isEditing}
                    className="bg-secondary/30 border-border/50"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Courses Teaching</Label>
                <Input
                  defaultValue="Data Structures, Algorithms"
                  disabled={!isEditing}
                  className="bg-secondary/30 border-border/50"
                />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6">Teaching Statistics</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Tutorials Uploaded</p>
              <p className="text-2xl font-bold text-foreground">12</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Tests Created</p>
              <p className="text-2xl font-bold text-foreground">8</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Assignments</p>
              <p className="text-2xl font-bold text-foreground">15</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Total Students</p>
              <p className="text-2xl font-bold text-foreground">156</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FacultyProfile;
