import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, Clock, FileText, ClipboardList, Video } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const eventData = [
  { id: 1, title: "Data Structures Midterm", type: "test", date: "2024-12-28", time: "10:00 AM", course: "CS 201", color: "from-primary to-cyan-glow" },
  { id: 2, title: "Binary Tree Assignment Due", type: "assignment", date: "2024-12-30", time: "11:59 PM", course: "CS 201", color: "from-accent to-primary" },
  { id: 3, title: "Web Dev Tutorial Upload", type: "tutorial", date: "2024-12-25", time: "2:00 PM", course: "CS 202", color: "from-cyan-glow to-accent" },
  { id: 4, title: "Algorithms Quiz", type: "test", date: "2024-12-27", time: "11:00 AM", course: "CS 301", color: "from-primary to-accent" },
  { id: 5, title: "Database Project Deadline", type: "assignment", date: "2025-01-05", time: "11:59 PM", course: "CS 203", color: "from-accent to-primary" },
];

const AdminCalendar = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [events, setEvents] = useState(eventData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "", type: "test", date: "", time: "", course: ""
  });

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.course) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    const colorMap: { [key: string]: string } = {
      test: "from-primary to-cyan-glow",
      assignment: "from-accent to-primary",
      tutorial: "from-cyan-glow to-accent"
    };
    const event = {
      id: events.length + 1,
      title: newEvent.title,
      type: newEvent.type,
      date: newEvent.date,
      time: newEvent.time,
      course: newEvent.course,
      color: colorMap[newEvent.type] || "from-primary to-accent"
    };
    setEvents([...events, event]);
    setNewEvent({ title: "", type: "test", date: "", time: "", course: "" });
    setDialogOpen(false);
    toast({ title: "Success!", description: "Event added to calendar" });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "test": return FileText;
      case "assignment": return ClipboardList;
      case "tutorial": return Video;
      default: return CalendarIcon;
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
              Calendar
            </h1>
            <p className="text-muted-foreground">View all scheduled events</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-cyan-glow hover:shadow-glow transition-all">
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Event Title</Label>
                  <Input 
                    placeholder="Midterm Exam..."
                    className="bg-secondary/30 border-border/50"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <select 
                    className="w-full p-2 rounded-md bg-secondary/30 border border-border/50 text-foreground"
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  >
                    <option value="test">Test</option>
                    <option value="assignment">Assignment</option>
                    <option value="tutorial">Tutorial</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input 
                      type="date"
                      className="bg-secondary/30 border-border/50"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input 
                      type="time"
                      className="bg-secondary/30 border-border/50"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label>Course</Label>
                  <Input 
                    placeholder="CS 201"
                    className="bg-secondary/30 border-border/50"
                    value={newEvent.course}
                    onChange={(e) => setNewEvent({...newEvent, course: e.target.value})}
                  />
                </div>
                <Button onClick={handleAddEvent} className="w-full bg-gradient-to-r from-primary to-cyan-glow">
                  Add Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === "month" ? "default" : "outline"}
            onClick={() => setViewMode("month")}
            className={viewMode === "month" ? "bg-gradient-to-r from-primary to-cyan-glow" : ""}
          >
            Month
          </Button>
          <Button 
            variant={viewMode === "week" ? "default" : "outline"}
            onClick={() => setViewMode("week")}
            className={viewMode === "week" ? "bg-gradient-to-r from-primary to-cyan-glow" : ""}
          >
            Week
          </Button>
          <Button 
            variant={viewMode === "day" ? "default" : "outline"}
            onClick={() => setViewMode("day")}
            className={viewMode === "day" ? "bg-gradient-to-r from-primary to-cyan-glow" : ""}
          >
            Day
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">December 2024</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 2;
                const isCurrentMonth = day > 0 && day <= 31;
                const hasEvent = isCurrentMonth && [25, 27, 28, 30].includes(day);
                
                return (
                  <div
                    key={i}
                    className={`aspect-square p-2 rounded-lg border ${
                      isCurrentMonth
                        ? hasEvent
                          ? "bg-primary/10 border-primary/30 hover:bg-primary/20 cursor-pointer"
                          : "bg-secondary/20 border-border/30 hover:bg-secondary/30 cursor-pointer"
                        : "bg-muted/10 border-transparent"
                    } transition-colors`}
                  >
                    {isCurrentMonth && (
                      <div className="text-sm font-medium text-foreground">{day}</div>
                    )}
                    {hasEvent && (
                      <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Upcoming Events
            </h2>
            <div className="space-y-3">
              {events.map((event) => {
                const Icon = getEventIcon(event.type);
                return (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg bg-secondary/30 border border-border/30 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${event.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm mb-1">{event.title}</h3>
                        <div className="space-y-1">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                            {event.course}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {event.date} • {event.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-cyan-glow flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">2</p>
                <p className="text-sm text-muted-foreground">Upcoming Tests</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">2</p>
                <p className="text-sm text-muted-foreground">Due Assignments</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-glow to-accent flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">1</p>
                <p className="text-sm text-muted-foreground">Tutorial Uploads</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminCalendar;
