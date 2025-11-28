import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Briefcase, MapPin, Award, Linkedin, Plus, X } from "lucide-react";
import apiClient from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/integrations/supabase/auth";

const AlumniProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    graduationYear: "",
    currentCompany: "",
    designation: "",
    location: "",
    linkedIn: "",
    bio: "",
    skills: [] as string[],
    openToMentorship: false,
    openToReferrals: false,
  });

  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/alumni/profile/${user?.id}`);
      
      setFormData({
        fullName: data.fullName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        graduationYear: data.graduationYear || "",
        currentCompany: data.currentCompany || "",
        designation: data.designation || "",
        location: data.location || "",
        linkedIn: data.linkedIn || "",
        bio: data.bio || "",
        skills: data.skills || [],
        openToMentorship: data.openToMentorship || false,
        openToReferrals: data.openToReferrals || false,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.put(`/alumni/profile/${user?.id}`, formData);
      toast.success("Profile updated successfully!");
      fetchProfile(); // Refresh
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="alumni">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-xl">Loading profile...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="alumni">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Update your alumni profile information
          </p>
        </div>

        {/* Basic Info */}
        <Card className="p-6 space-y-4 border-border/50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserCircle className="w-5 h-5" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label>Email *</Label>
              <Input
                value={formData.email}
                disabled
                className="bg-secondary/50 cursor-not-allowed"
              />
            </div>

            <div>
              <Label>Phone Number</Label>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <Label>Graduation Year</Label>
              <Input
                value={formData.graduationYear}
                onChange={(e) => handleInputChange("graduationYear", e.target.value)}
                placeholder="2020"
              />
            </div>
          </div>
        </Card>

        {/* Professional Info */}
        <Card className="p-6 space-y-4 border-border/50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Professional Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Current Company</Label>
              <Input
                value={formData.currentCompany}
                onChange={(e) => handleInputChange("currentCompany", e.target.value)}
                placeholder="Google"
              />
            </div>

            <div>
              <Label>Designation</Label>
              <Input
                value={formData.designation}
                onChange={(e) => handleInputChange("designation", e.target.value)}
                placeholder="Senior Software Engineer"
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Bangalore, India"
                className="flex items-center gap-2"
              />
            </div>

            <div>
              <Label>LinkedIn Profile</Label>
              <Input
                value={formData.linkedIn}
                onChange={(e) => handleInputChange("linkedIn", e.target.value)}
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>
          </div>

          <div>
            <Label>Bio</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell students about yourself, your experience, and areas of expertise..."
              className="min-h-[100px]"
            />
          </div>
        </Card>

        {/* Skills */}
        <Card className="p-6 space-y-4 border-border/50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Award className="w-5 h-5" />
            Skills
          </h2>

          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill (e.g., React, Node.js)"
              onKeyPress={(e) => e.key === "Enter" && addSkill()}
            />
            <Button onClick={addSkill} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, idx) => (
              <Badge key={idx} variant="secondary" className="text-sm flex items-center gap-1">
                {skill}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                  onClick={() => removeSkill(skill)}
                />
              </Badge>
            ))}
            {formData.skills.length === 0 && (
              <p className="text-sm text-muted-foreground">No skills added yet</p>
            )}
          </div>
        </Card>

        {/* Availability */}
        <Card className="p-6 space-y-4 border-border/50">
          <h2 className="text-xl font-bold">Availability</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
              <div>
                <p className="font-semibold">Open to Mentorship</p>
                <p className="text-sm text-muted-foreground">
                  Allow students to request mentorship from you
                </p>
              </div>
              <Switch
                checked={formData.openToMentorship}
                onCheckedChange={(checked) => handleInputChange("openToMentorship", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
              <div>
                <p className="font-semibold">Open to Referrals</p>
                <p className="text-sm text-muted-foreground">
                  Help students with job referrals
                </p>
              </div>
              <Switch
                checked={formData.openToReferrals}
                onCheckedChange={(checked) => handleInputChange("openToReferrals", checked)}
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={fetchProfile}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AlumniProfile;
