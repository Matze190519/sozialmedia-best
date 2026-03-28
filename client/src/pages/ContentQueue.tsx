import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  FileText, Clock, CheckCircle, XCircle, Send, TrendingUp,
  Image, Video, ArrowRight, Eye, Zap,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "Alle Status" },
  { value: "pending", label: "Ausstehend" },
  { value: "approved", label: "Genehmigt" },
  { value: "rejected", label: "Abgelehnt" },
  { value: "scheduled", label: "Geplant" },
  { value: "published", label: "Veröffentlicht" },
];

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; variant: "default" | "secondary" | "destructive" | "outline"; nextAction?: string }> = {
  pending: { label: "Ausstehend", icon: Clock, color: "text-yellow-400", variant: "outline", nextAction: "Zur Freigabe" },
  approved: { label: "Genehmigt", icon: CheckCircle, color: "text-emerald-400", variant: "default", nextAction: "Veröffentlichen" },
  rejected: { label: "Abgelehnt", icon: XCircle, color: "text-red-400", variant: "destructive" },
  scheduled: { label: "Geplant", icon: Send, color: "text-blue-400", variant: "secondary" },
  published: { label: "Live", icon: TrendingUp, color: "text-purple-400", variant: "default" },
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  post: "Post", reel: "Reel", story: "Story", hooks: "Hooks",
  ad_copy: "Ad Copy", follow_up: "Follow-Up", objection: "Einwandbehandlung",
  batch: "Wochenplan", reel_script: "Reel Script", carousel: "Carousel",
  linkedin: "LinkedIn", youtube_script: "YouTube",
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500/20 text-pink-300",
  facebook: "bg-blue-500/20 text-blue-300",
  tiktok: "bg-cyan-500/20 text-cyan-300",
  linkedin: "bg-blue-700/20 text-blue-200",
  twitter: "bg-sky-500/20 text-sky-300",
  threads: "bg-gray-500/20 text-gray-300",
  bluesky: "bg-blue-400/20 text-blue-200",
  pinterest: "bg-red-500/20 text-red-300",
  youtube: "bg-red-600/20 text-red-300",
};

export default function ContentQueue() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: posts, isLoading } = trpc.content.list.useQuery(
    statusFilter === "all" ? { limit: 50 } : { status: statusFilter, limit: 50 }
  );
  const { data: stats } = trpc.dashboard.stats.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Queue</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Alle Posts im Überblick - vom Entwurf bis zum Posting
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setLocation("/generator")} className="gap-1.5" size="sm">
            <Zap className="h-3.5 w-3.5" />
            Neuer Post
          </Button>
        </div>
      </div>

      {/* Quick Status Overview */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: "all", label: "Alle", count: stats?.total ?? 0 },
          { key: "pending", label: "Ausstehend", count: stats?.pending ?? 0, color: "text-yellow-400" },
          { key: "approved", label: "Genehmigt", count: stats?.approved ?? 0, color: "text-emerald-400" },
          { key: "scheduled", label: "Geplant", count: stats?.scheduled ?? 0, color: "text-blue-400" },
          { key: "published", label: "Live", count: stats?.published ?? 0, color: "text-purple-400" },
          { key: "rejected", label: "Abgelehnt", count: stats?.rejected ?? 0, color: "text-red-400" },
        ].map(s => (
          <Button
            key={s.key}
            variant={statusFilter === s.key ? "default" : "outline"}
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={() => setStatusFilter(s.key)}
          >
            <span className={s.color}>{s.count}</span>
            <span className="text-xs">{s.label}</span>
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((item) => {
            const sc = STATUS_CONFIG[item.post.status] || STATUS_CONFIG.pending;
            const StatusIcon = sc.icon;
            return (
              <Card key={item.post.id} className="border-border/50 hover:border-border transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0`}>
                      <StatusIcon className={`h-5 w-5 ${sc.color}`} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">
                            {CONTENT_TYPE_LABELS[item.post.contentType] || item.post.contentType}
                          </Badge>
                          <Badge variant={sc.variant} className="text-[10px]">{sc.label}</Badge>
                          {item.post.pillar && <Badge variant="secondary" className="text-[10px]">{item.post.pillar}</Badge>}
                          {item.post.mediaUrl && <Image className="h-3 w-3 text-muted-foreground" />}
                          {item.post.videoUrl && <Video className="h-3 w-3 text-muted-foreground" />}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(item.post.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed line-clamp-3">
                        {item.post.editedContent || item.post.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(item.post.platforms as string[])?.map(p => (
                            <span key={p} className={`text-[10px] px-1.5 py-0.5 rounded ${PLATFORM_COLORS[p] || "bg-accent text-accent-foreground"}`}>
                              {p}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {item.createdBy?.name || "Unbekannt"}
                          </span>
                          {sc.nextAction && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1 text-xs h-7"
                              onClick={() => setLocation("/approval")}
                            >
                              {sc.nextAction}
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {item.post.scheduledAt && (
                        <div className="text-xs text-blue-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Geplant: {new Date(item.post.scheduledAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                      {item.post.reviewComment && (
                        <div className="text-xs text-muted-foreground bg-accent/50 rounded p-2 mt-1">
                          Review: {item.post.reviewComment}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              {statusFilter === "all" ? "Noch keine Posts erstellt." : `Keine Posts mit Status "${STATUS_OPTIONS.find(o => o.value === statusFilter)?.label}".`}
            </p>
            <Button onClick={() => setLocation("/generator")} className="gap-1.5">
              <Zap className="h-4 w-4" />
              Ersten Post erstellen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
