import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Mail, Linkedin, Search } from "lucide-react";
import apiClient from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Alumni {
  id: string;
  fullName: string;
  email: string;
  graduationYear: string;
  currentCompany: string;
  designation: string;
  location: string;
  linkedIn: string;
  skills: string[];
  bio: string;
  openToMentorship: boolean;
  openToReferrals: boolean;
}

const AlumniDirectory = () => {
  const [query, setQuery] = useState("");
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlumni();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredAlumni(alumni);
    } else {
      setFilteredAlumni(
        alumni.filter(a =>
          (a.fullName + " " + a.currentCompany + " " + a.skills.join(" "))
            .toLowerCase()
            .includes(query.toLowerCase())
        )
      );
    }
  }, [query, alumni]);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/alumni");
      setAlumni(data || []);
      setFilteredAlumni(data || []);
    } catch (error) {
      setAlumni([]);
      setFilteredAlumni([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="alumni">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Alumni Directory
          </h1>
          <div className="hidden md:flex items-center gap-2 bg-card/50 border-border/50 px-3 py-1 rounded-xl">
            <Users className="w-6 h-6 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">{alumni.length} Alumni</span>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Search by name, company, skill, etc."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="max-w-md"
          />
          <Button variant="outline" className="ml-2" onClick={() => setQuery("")}>
            <Search className="w-4 h-4" />
            Clear
          </Button>
        </div>

        {/* Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!loading && filteredAlumni.length === 0 && (
            <p className="text-muted-foreground col-span-full">No alumni profiles found.</p>
          )}
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <Card key={idx} className="p-6 animate-pulse">
                  <div className="h-6 w-1/2 bg-secondary/60 rounded mb-2"></div>
                  <div className="h-4 w-1/3 bg-secondary/50 rounded mb-2"></div>
                  <div className="h-4 w-1/5 bg-secondary/40 rounded mb-2"></div>
                </Card>
              ))
            : filteredAlumni.map(a => (
                <Card key={a.id} className="p-6 space-y-2 border-border/50 bg-card/60">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-purple-500 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl font-bold">{a.fullName}</h2>
                      <p className="text-sm text-muted-foreground">
                        {a.designation} @ {a.currentCompany}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Graduated: {a.graduationYear} | Location: {a.location}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">{a.bio}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {a.skills.map((s, i) => (
                      <Badge key={i} className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <a href={`mailto:${a.email}`} className="hover:underline flex gap-2 items-center text-sm text-blue-500">
                      <Mail className="w-4 h-4" /> Email
                    </a>
                    {a.linkedIn && (
                      <a href={a.linkedIn} target="_blank" rel="noopener" className="hover:underline flex gap-2 items-center text-sm text-blue-700">
                        <Linkedin className="w-4 h-4" /> LinkedIn
                      </a>
                    )}
                    <span className={`text-xs rounded px-2 py-1 ${a.openToMentorship ? 'bg-green-200 text-green-800' : 'bg-orange-100 text-orange-700'}`}>
                      {a.openToMentorship ? "Available for Mentoring" : "Mentoring: No"}
                    </span>
                    <span className={`text-xs rounded px-2 py-1 ${a.openToReferrals ? 'bg-green-200 text-green-800' : 'bg-orange-100 text-orange-700'}`}>
                      {a.openToReferrals ? "Open to Referrals" : "Referrals: No"}
                    </span>
                  </div>
                </Card>
              ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AlumniDirectory;
