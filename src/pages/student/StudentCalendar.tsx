import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, FileText, Video } from "lucide-react";
import { useCalendarEvents, CalendarEvent } from "@/hooks/useCalendarEvents";

const StudentCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: events = [] } = useCalendarEvents(currentMonth);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "test":
        return <FileText className="w-4 h-4" />;
      case "assignment":
        return <Clock className="w-4 h-4" />;
      case "tutorial":
        return <Video className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "test":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      case "assignment":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "tutorial":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      default:
        return "bg-primary/20 text-primary border-primary/30";
    }
  };

  const changeMonth = (offset: number) => {
    const d = new Date(year, month + offset, 1);
    setCurrentMonth(d);
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
              My Calendar
            </h1>
            <p className="text-muted-foreground">
              Track your tests, assignments, and tutorials
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="px-3 py-1 rounded-md border border-border/50 text-sm"
            >
              Prev
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="px-3 py-1 rounded-md border border-border/50 text-sm"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6">
              {currentMonth.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div className="grid grid-cols-7 gap-4 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 35 }, (_, i) => {
                const firstDayIndex = new Date(year, month, 1).getDay();
                const day = i - firstDayIndex + 1;
                const inMonth = day > 0 && day <= daysInMonth;
                const dateKey = inMonth
                  ? `${year}-${String(month + 1).padStart(2, "0")}-${String(
                      day
                    ).padStart(2, "0")}`
                  : "";
                const hasEvent = inMonth && !!eventsByDate[dateKey];

                return (
                  <div
                    key={i}
                    className={`aspect-square flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                      inMonth
                        ? hasEvent
                          ? "bg-primary/20 text-primary border-2 border-primary/50 font-bold hover:bg-primary/30"
                          : "bg-secondary/30 text-foreground hover:bg-secondary/50"
                        : "text-muted-foreground/30"
                    }`}
                  >
                    {inMonth ? day : ""}
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
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${getEventColor(
                        event.type
                      )}`}
                    >
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-sm">
                        {event.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {event.date} at {event.time}
                      </p>
                      <Badge
                        variant="outline"
                        className={`mt-1 text-xs ${getEventColor(event.type)}`}
                      >
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No events scheduled this month.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentCalendar;
