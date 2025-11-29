import { useQuery } from "@tanstack/react-query";
import apiClient from "@/integrations/supabase/client";

export interface CalendarEvent {
  id: string;
  title: string;
  type: "class" | "exam" | "meeting" | "deadline" | "event" | "holiday";
  date: string; // YYYY-MM-DD
  time: string;
  color: string;
  location: string;
  description: string;
}

export const useCalendarEvents = (month: Date) => {
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;

  return useQuery({
    queryKey: ["calendar-events", monthKey],
    queryFn: async () => {
      const { data } = await apiClient.get<CalendarEvent[]>("/calendar/events", {
        params: { month: monthKey },
      });
      return data;
    },
    staleTime: 60_000,
  });
};
