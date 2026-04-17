import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, Calendar, Clock, Trash2,
  Edit3, MoveRight, ExternalLink, RefreshCw, Globe,
} from "lucide-react";

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 border-l-yellow-500 text-yellow-300",
  approved: "bg-emerald-500/20 border-l-emerald-500 text-emerald-300",
  rejected: "bg-red-500/20 border-l-red-500 text-red-300",
  scheduled: "bg-amber-500/20 border-l-amber-500 text-amber-300",
  published: "bg-purple-500/20 border-l-purple-500 text-purple-300",
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📸", tiktok: "🎵", facebook: "📘", linkedin: "💼",
  twitter: "🐦", youtube: "🎬", threads: "🧵", pinterest: "📌",
  bluesky: "🦋",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("de-DE", {
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    weekday: "short", day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Internal Calendar (Dashboard Posts) ──────────────────────
function InternalCalendar() {
  const [weekOffset, setWeekOffset] = useState(0);

  const { weekDates } = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return { weekDates: dates };
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
    <div className="space-y-4">
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

// ── Blotato Calendar (Scheduled Posts via API) ───────────────
function BlotatoCalendar() {
  const utils = trpc.useUtils();
  const [editPost, setEditPost] = useState<any>(null);
  const [reschedulePost, setReschedulePost] = useState<any>(null);
  const [newTime, setNewTime] = useState("");
  const [editText, setEditText] = useState("");

  const { data: calendarData, isLoading, refetch } = trpc.calendar.byDate.useQuery({ limit: 100 });

  const deleteMutation = trpc.calendar.delete.useMutation({
    onSuccess: () => {
      toast.success("Post gelöscht");
      utils.calendar.byDate.invalidate();
      utils.calendar.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const rescheduleMutation = trpc.calendar.reschedule.useMutation({
    onSuccess: () => {
      toast.success("Post verschoben");
      setReschedulePost(null);
      setNewTime("");
      utils.calendar.byDate.invalidate();
      utils.calendar.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const updateMutation = trpc.calendar.update.useMutation({
    onSuccess: () => {
      toast.success("Post aktualisiert");
      setEditPost(null);
      setEditText("");
      utils.calendar.byDate.invalidate();
      utils.calendar.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    );
  }

  const dates = calendarData?.dates || [];
  const totalCount = calendarData?.totalCount || 0;
  const actionPending = deleteMutation.isPending || rescheduleMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {totalCount} geplante Posts
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      {dates.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine geplanten Posts</h3>
            <p className="text-muted-foreground text-sm">
              Erstelle Content und poste ihn über die Freigabe, um hier geplante Posts zu sehen.
            </p>
          </CardContent>
        </Card>
      ) : (
        dates.map(({ date, posts, count }) => (
          <Card key={date} className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {formatDate(date)}
                </CardTitle>
                <Badge variant="secondary">{count} Post{count !== 1 ? "s" : ""}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-accent/30 rounded-lg p-4 border border-border/50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {PLATFORM_ICONS[post.draft.content.platform] || <Globe className="h-3 w-3" />}
                          {" "}{post.draft.content.platform}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(post.scheduledAt)}
                        </span>
                        {post.account && (
                          <span className="text-xs text-muted-foreground">
                            @{post.account.username}
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed line-clamp-3">
                        {post.draft.content.text}
                      </p>
                      {post.draft.content.mediaUrls.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {post.draft.content.mediaUrls.slice(0, 3).map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" />
                              Media {i + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditPost(post);
                          setEditText(post.draft.content.text);
                        }}
                        title="Text bearbeiten"
                        disabled={actionPending}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setReschedulePost(post);
                          setNewTime(post.scheduledAt.slice(0, 16));
                        }}
                        title="Verschieben"
                        disabled={actionPending}
                      >
                        <MoveRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm(`Post wirklich löschen?\n\n"${post.draft.content.text.slice(0, 100)}..."`)) {
                            deleteMutation.mutate({ id: post.id });
                          }
                        }}
                        title="Löschen"
                        disabled={actionPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}

      {/* Edit Text Dialog */}
      <Dialog open={!!editPost} onOpenChange={(open) => { if (!open) setEditPost(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Post-Text bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editPost && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">
                  {PLATFORM_ICONS[editPost.draft.content.platform]} {editPost.draft.content.platform}
                </Badge>
                <span>{formatDateTime(editPost.scheduledAt)}</span>
              </div>
            )}
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={8}
              className="resize-none"
              placeholder="Post-Text..."
            />
            <p className="text-xs text-muted-foreground">{editText.length} Zeichen</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPost(null)} disabled={updateMutation.isPending}>Abbrechen</Button>
            <Button
              onClick={() => {
                if (editPost) {
                  updateMutation.mutate({
                    id: editPost.id,
                    text: editText,
                    platform: editPost.draft.content.platform,
                    accountId: editPost.draft.accountId,
                    mediaUrls: editPost.draft.content.mediaUrls,
                  });
                }
              }}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={!!reschedulePost} onOpenChange={(open) => { if (!open) setReschedulePost(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Post verschieben</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {reschedulePost && (
              <div className="text-sm text-muted-foreground">
                <p>Aktuell geplant: <strong>{formatDateTime(reschedulePost.scheduledAt)}</strong></p>
                <p className="mt-1 truncate">{reschedulePost.draft.content.text.slice(0, 100)}...</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block">Neuer Zeitpunkt</label>
              <Input
                type="datetime-local"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReschedulePost(null)} disabled={rescheduleMutation.isPending}>Abbrechen</Button>
            <Button
              onClick={() => {
                if (reschedulePost && newTime) {
                  const isoTime = new Date(newTime).toISOString();
                  rescheduleMutation.mutate({ id: reschedulePost.id, newTime: isoTime });
                }
              }}
              disabled={rescheduleMutation.isPending || !newTime}
            >
              {rescheduleMutation.isPending ? "Verschieben..." : "Verschieben"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Main Calendar Page ───────────────────────────────────────
export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Content-Kalender
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Wochenansicht & Blotato-Kalender mit allen geplanten Posts
        </p>
      </div>

      <Tabs defaultValue="blotato" className="w-full">
        <TabsList>
          <TabsTrigger value="blotato" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Blotato-Kalender
          </TabsTrigger>
          <TabsTrigger value="internal" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Dashboard-Posts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blotato" className="mt-4">
          <BlotatoCalendar />
        </TabsContent>

        <TabsContent value="internal" className="mt-4">
          <InternalCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}
