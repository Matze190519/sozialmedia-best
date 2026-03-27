import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 border-l-yellow-500 text-yellow-300",
  approved: "bg-emerald-500/20 border-l-emerald-500 text-emerald-300",
  rejected: "bg-red-500/20 border-l-red-500 text-red-300",
  scheduled: "bg-blue-500/20 border-l-blue-500 text-blue-300",
  published: "bg-purple-500/20 border-l-purple-500 text-purple-300",
};

export default function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);

  const { start, end, weekDates } = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return { start: monday.toISOString(), end: sunday.toISOString(), weekDates: dates };
  }, [weekOffset]);

  const { data: allPosts, isLoading } = trpc.content.list.useQuery({ limit: 200 });

  const postsByDay = useMemo(() => {
    const map: Record<string, Array<{ id: number; content: string; type: string; status: string; platforms: string[] }>> = {};
    weekDates.forEach(d => { map[d.toISOString().split("T")[0]] = []; });
    if (allPosts) {
      allPosts.forEach(item => {
        const date = item.post.scheduledAt ? new Date(item.post.scheduledAt) : new Date(item.post.createdAt);
        const key = date.toISOString().split("T")[0];
        if (map[key]) {
          map[key].push({
            id: item.post.id,
            content: (item.post.editedContent || item.post.content).substring(0, 80),
            type: item.post.contentType,
            status: item.post.status,
            platforms: (item.post.platforms as string[]) || [],
          });
        }
      });
    }
    return map;
  }, [allPosts, weekDates]);

  const weekLabel = weekDates[0]
    ? `${weekDates[0].toLocaleDateString("de-DE", { day: "2-digit", month: "short" })} - ${weekDates[6].toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}`
    : "";

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Content-Kalender
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Wochenansicht aller geplanten und erstellten Posts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset(o => o - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>Heute</Button>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset(o => o + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium ml-2">{weekLabel}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, idx) => {
            const key = date.toISOString().split("T")[0];
            const dayPosts = postsByDay[key] || [];
            const isToday = key === today;
            return (
              <Card key={key} className={`border-border/50 min-h-[200px] ${isToday ? "ring-1 ring-primary/50" : ""}`}>
                <div className={`px-3 py-2 border-b border-border/50 ${isToday ? "bg-primary/10" : ""}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{DAYS[idx]}</span>
                    <span className={`text-sm font-bold ${isToday ? "text-primary" : ""}`}>
                      {date.getDate()}
                    </span>
                  </div>
                </div>
                <CardContent className="p-2 space-y-1.5">
                  {dayPosts.length > 0 ? dayPosts.map(post => (
                    <div
                      key={post.id}
                      className={`text-[11px] p-1.5 rounded border-l-2 ${STATUS_COLORS[post.status] || "bg-accent"}`}
                    >
                      <p className="font-medium truncate">{post.type}</p>
                      <p className="truncate opacity-80">{post.content}</p>
                    </div>
                  )) : (
                    <p className="text-[10px] text-muted-foreground text-center py-4">Keine Posts</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
