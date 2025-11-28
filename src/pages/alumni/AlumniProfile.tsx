import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Award, Briefcase, MapPin, Phone, Mail, Linkedin, Plus, X, Save } from "lucide-react";
import { useAuth } from "@/integrations/supabase/auth";
import apiClient from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AlumniProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  graduationYear: string;
  currentCompany: string;
  designation: string;
  location: string;
  linkedIn: string;
  bio: string;
  skills: string[];
  previousCompanies: string[];
  openToMentorship: boolean;
  openToReferrals: boolean;
}

const AlumniProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newCompany, setNewCompany] = useState("");
  
  const [profile, setProfile] = useState<AlumniProfile>({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: "",
    graduationYear: "",
    currentCompany: "",
    designation: "",
    location: "",
    linkedIn: "",
    bio: "",
    skills: [],
    previousCompanies: [],
    openToMentorship: false,
    openToReferrals: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/alumni/profile/${user?.id}`);
      if (data) {
        setProfile({ ...profile, ...data });
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await apiClient.put(`/alumni/profile/${user?.id}`, profile);
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
  };

  const addCompany = () => {
    if (newCompany.trim() && !profile.previousCompanies.includes(newCompany.trim())) {
      setProfile({ ...profile, previousCompanies: [...profile.previousCompanies, newCompany.trim()] });
      setNewCompany("");
    }
  };

  const removeCompany = (company: string) => {
    setProfile({ ...profile, previousCompanies: profile.previousCompanies.filter(c => c !== company) });
  };

  return (
    <DashboardLayout role="alumni">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Alumni Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your professional information
            </p>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button
                  onClick={() => setEditing(false)}
                  variant="outline"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setEditing(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <Card className="p-6 border-border/50 bg-card/50">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                disabled={!editing}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={profile.email}
                disabled
                className="mt-1 bg-secondary/50"
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={profile.phoneNumber}
                onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                disabled={!editing}
                placeholder="+91-9876543210"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Graduation Year</Label>
              <Input
                value={profile.graduationYear}
                onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                disabled={!editing}
                placeholder="2020"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                disabled={!editing}
                placeholder="Bangalore, India"
                className="mt-1"
              />
            </div>
            <div>
              <Label>LinkedIn Profile</Label>
              <Input
                value={profile.linkedIn}
                onChange={(e) => setProfile({ ...profile, linkedIn: e.target.value })}
                disabled={!editing}
                placeholder="linkedin.com/in/yourname"
                className="mt-1"
              />
            </div>
          </div>
          <div className="mt-4">
            <Label>Bio</Label>
            <Textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              disabled={!editing}
              placeholder="Tell us about yourself and your professional journey..."
              className="mt-1 min-h-[100px]"
            />
          </div>
        </Card>

        {/* Work Experience */}
        <Card className="p-6 border-border/50 bg-card/50">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-500" />
            Work Experience
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Current Company</Label>
              <Input
                value={profile.currentCompany}
                onChange={(e) => setProfile({ ...profile, currentCompany: e.target.value })}
                disabled={!editing}
                placeholder="Google"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Designation</Label>
              <Input
                value={profile.designation}
                onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                disabled={!editing}
                placeholder="Software Engineer"
                className="mt-1"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label>Previous Companies</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCompany()}
                disabled={!editing}
                placeholder="Add previous company"
              />
              <Button
                onClick={addCompany}
                disabled={!editing || !newCompany.trim()}
                size="icon"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.previousCompanies.map((company, idx) => (
                <Badge key={idx} variant="secondary" className="px-3 py-1">
                  {company}
                  {editing && (
                    <button
                      onClick={() => removeCompany(company)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Skills */}
        <Card className="p-6 border-border/50 bg-card/50">
          <h2 className="text-xl font-bold mb-4">Skills & Expertise</h2>
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              disabled={!editing}
              placeholder="Add a skill (e.g., React, Node.js)"
            />
            <Button
              onClick={addSkill}
              disabled={!editing || !newSkill.trim()}
              size="icon"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {profile.skills.map((skill, idx) => (
              <Badge key={idx} className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500">
                {skill}
                {editing && (
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Availability Settings */}
        <Card className="p-6 border-border/50 bg-card/50">
          <h2 className="text-xl font-bold mb-4">Availability</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Open to Mentorship</p>
                <p className="text-sm text-muted-foreground">
                  Allow students to request mentorship from you
                </p>
              </div>
              <Switch
                checked={profile.openToMentorship}
                onCheckedChange={(checked) => setProfile({ ...profile, openToMentorship: checked })}
                disabled={!editing}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Open to Referrals</p>
                <p className="text-sm text-muted-foreground">
                  Help students with job referrals
                </p>
              </div>
              <Switch
                checked={profile.openToReferrals}
                onCheckedChange={(checked) => setProfile({ ...profile, openToReferrals: checked })}
                disabled={!editing}
              />
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AlumniProfile;
