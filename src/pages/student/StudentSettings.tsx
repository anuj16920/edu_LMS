import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const StudentSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    testReminders: true,
    assignmentReminders: true,
    tutorialUpdates: false,
  });

  const handleSave = () => {
    toast({ title: "Success", description: "Settings saved successfully!" });
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6">Account Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input defaultValue="Alex" className="bg-secondary/30 border-border/50" />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input defaultValue="Johnson" className="bg-secondary/30 border-border/50" />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input defaultValue="alex.johnson@student.university.edu" className="bg-secondary/30 border-border/50" />
            </div>
            <div>
              <Label>Student ID</Label>
              <Input defaultValue="STU2025001" className="bg-secondary/30 border-border/50" disabled />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/30">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email updates about courses</p>
              </div>
              <Switch 
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/30">
              <div>
                <p className="font-medium text-foreground">Test Reminders</p>
                <p className="text-sm text-muted-foreground">Get reminded about upcoming tests</p>
              </div>
              <Switch 
                checked={settings.testReminders}
                onCheckedChange={(checked) => setSettings({...settings, testReminders: checked})}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/30">
              <div>
                <p className="font-medium text-foreground">Assignment Reminders</p>
                <p className="text-sm text-muted-foreground">Get reminded about assignment deadlines</p>
              </div>
              <Switch 
                checked={settings.assignmentReminders}
                onCheckedChange={(checked) => setSettings({...settings, assignmentReminders: checked})}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/30">
              <div>
                <p className="font-medium text-foreground">Tutorial Updates</p>
                <p className="text-sm text-muted-foreground">Get notified when new tutorials are posted</p>
              </div>
              <Switch 
                checked={settings.tutorialUpdates}
                onCheckedChange={(checked) => setSettings({...settings, tutorialUpdates: checked})}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6">Change Password</h2>
          <div className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <Input type="password" className="bg-secondary/30 border-border/50" />
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" className="bg-secondary/30 border-border/50" />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input type="password" className="bg-secondary/30 border-border/50" />
            </div>
          </div>
        </Card>

        <Button onClick={handleSave} className="w-full bg-gradient-to-r from-primary to-cyan-glow hover:shadow-glow">
          Save Changes
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default StudentSettings;
