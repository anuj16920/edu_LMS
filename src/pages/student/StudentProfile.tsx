import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, GraduationCap, BookOpen, Edit, Save } from "lucide-react";
import { useState } from "react";

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <DashboardLayout role="student">
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
                AT
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-foreground mb-1">Alice Thompson</h2>
            <p className="text-muted-foreground mb-2">CS2021001</p>
            <p className="text-sm text-muted-foreground mb-4">3rd Year • CS-A</p>
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
                    defaultValue="Alice Thompson"
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
                    defaultValue="alice.t@student.edu"
                    disabled={!isEditing}
                    type="email"
                    className="bg-secondary/30 border-border/50"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    Roll Number
                  </Label>
                  <Input
                    defaultValue="CS2021001"
                    disabled
                    className="bg-secondary/30 border-border/50"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Class
                  </Label>
                  <Input
                    defaultValue="CS-A"
                    disabled
                    className="bg-secondary/30 border-border/50"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Year</Label>
                  <Input
                    defaultValue="3rd Year"
                    disabled
                    className="bg-secondary/30 border-border/50"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Phone Number</Label>
                  <Input
                    defaultValue="+1 234-567-8999"
                    disabled={!isEditing}
                    className="bg-secondary/30 border-border/50"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6">Academic Performance</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Overall GPA</p>
              <p className="text-2xl font-bold text-foreground">3.8</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Courses Enrolled</p>
              <p className="text-2xl font-bold text-foreground">6</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Tests Taken</p>
              <p className="text-2xl font-bold text-foreground">12</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Assignments Done</p>
              <p className="text-2xl font-bold text-foreground">24</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6">Enrolled Courses</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {["Data Structures", "Algorithms", "Web Development", "Database Systems", "Machine Learning", "Computer Networks"].map((course) => (
              <div key={course} className="p-4 rounded-lg bg-secondary/30 border border-border/30">
                <h3 className="font-semibold text-foreground mb-2">{course}</h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-semibold text-primary">
                    {Math.floor(Math.random() * 30 + 60)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
