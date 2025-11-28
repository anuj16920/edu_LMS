import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, FileText, Video } from "lucide-react";

const StudentCalendar = () => {
  const events = [
    { id: 1, title: "Data Structures Midterm", type: "test", date: "2025-12-01", time: "10:00 AM" },
    { id: 2, title: "Binary Search Assignment Due", type: "assignment", date: "2025-12-01", time: "11:59 PM" },
    { id: 3, title: "New Tutorial: Graph Theory", type: "tutorial", date: "2025-12-03", time: "9:00 AM" },
    { id: 4, title: "Algorithms Quiz", type: "test", date: "2025-12-05", time: "2:00 PM" },
    { id: 5, title: "Database Project Due", type: "assignment", date: "2025-12-05", time: "11:59 PM" },
  ];

  const getEventIcon = (type: string) => {
    switch(type) {
      case "test": return <FileText className="w-4 h-4" />;
      case "assignment": return <Clock className="w-4 h-4" />;
      case "tutorial": return <Video className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch(type) {
      case "test": return "bg-red-500/20 text-red-500 border-red-500/30";
      case "assignment": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "tutorial": return "bg-green-500/20 text-green-500 border-green-500/30";
      default: return "bg-primary/20 text-primary border-primary/30";
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
            My Calendar
          </h1>
          <p className="text-muted-foreground">Track your tests, assignments, and tutorials</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6">December 2025</h2>
            <div className="grid grid-cols-7 gap-4 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 2;
                const hasEvent = day > 0 && day <= 31 && events.some(e => new Date(e.date).getDate() === day);
                return (
                  <div
                    key={i}
                    className={`aspect-square flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                      day > 0 && day <= 31
                        ? hasEvent
                          ? 'bg-primary/20 text-primary border-2 border-primary/50 font-bold hover:bg-primary/30'
                          : 'bg-secondary/30 text-foreground hover:bg-secondary/50'
                        : 'text-muted-foreground/30'
                    }`}
                  >
                    {day > 0 && day <= 31 ? day : ''}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6">Upcoming Events</h2>
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg bg-secondary/30 border border-border/30 hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getEventColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-sm">{event.title}</h3>
                      <p className="text-xs text-muted-foreground">{event.date} at {event.time}</p>
                      <Badge variant="outline" className={`mt-1 text-xs ${getEventColor(event.type)}`}>
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentCalendar;
