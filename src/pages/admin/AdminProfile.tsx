import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Briefcase, Edit, Save } from "lucide-react";
import { useState } from "react";

const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <DashboardLayout role="admin">
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
                AD
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-foreground mb-1">Admin User</h2>
            <p className="text-muted-foreground mb-4">System Administrator</p>
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
                    defaultValue="Admin User"
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
                    defaultValue="admin@college.edu"
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
                    defaultValue="+1 234-567-8900"
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
                    defaultValue="Administration"
                    disabled={!isEditing}
                    className="bg-secondary/30 border-border/50"
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Address
                </Label>
                <Input
                  defaultValue="123 College Street, Campus City, CC 12345"
                  disabled={!isEditing}
                  className="bg-secondary/30 border-border/50"
                />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6">Account Statistics</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Total Faculty</p>
              <p className="text-2xl font-bold text-foreground">48</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Total Students</p>
              <p className="text-2xl font-bold text-foreground">1,234</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">Active Courses</p>
              <p className="text-2xl font-bold text-foreground">23</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
              <p className="text-sm text-muted-foreground mb-1">System Status</p>
              <p className="text-2xl font-bold text-green-500">Active</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6">Security Settings</h2>
          <div className="space-y-4">
            <div>
              <Label className="mb-2">Current Password</Label>
              <Input type="password" placeholder="••••••••" className="bg-secondary/30 border-border/50" />
            </div>
            <div>
              <Label className="mb-2">New Password</Label>
              <Input type="password" placeholder="••••••••" className="bg-secondary/30 border-border/50" />
            </div>
            <div>
              <Label className="mb-2">Confirm New Password</Label>
              <Input type="password" placeholder="••••••••" className="bg-secondary/30 border-border/50" />
            </div>
            <Button className="bg-gradient-to-r from-primary to-cyan-glow">
              Update Password
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminProfile;
