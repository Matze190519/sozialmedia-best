import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Kanban, Clock, CheckCircle, Send, XCircle, Eye, Edit3,
  GripVertical, Image as ImageIcon, Video, Loader2, Calendar,
  RefreshCw, ArrowRight,
} from "lucide-react";

const COLUMNS = [
  { id: "draft", label: "Entwurf", icon: Edit3, color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20" },
  { id: "pending", label: "Zur Freigabe", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { id: "approved", label: "Freigegeben", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "published", label: "Veröffentlicht", icon: Send, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "rejected", label: "Abgelehnt", icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
] as const;

type ColumnId = typeof COLUMNS[number]["id"];

interface ContentPost {
  id: number;
  content: string;
  contentType: string;
  status: string;
  platforms: string[];
  topic?: string | null;
  pillar?: string | null;
  mediaUrl?: string | null;
  videoUrl?: string | null;
  feedbackScore?: number | null;
  createdAt: Date | string;
  createdBy?: { name: string } | null;
}

function KanbanCard({
  post,
  onMoveRight,
  isMoving,
}: {
  post: ContentPost;
  onMoveRight?: () => void;
  isMoving: boolean;
}) {
  const truncated = (post.content || "").slice(0, 100) + ((post.content || "").length > 100 ? "..." : "");
  const hasMedia = !!post.mediaUrl;
  const hasVideo = !!post.videoUrl;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group"
    >
      <Card className="border-border/30 hover:border-primary/30 transition-all cursor-pointer bg-card/80 backdrop-blur-sm">
        <CardContent className="p-3 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              {(post.platforms || []).map((p: string) => (
                <Badge key={p} variant="outline" className="text-[8px] px-1 py-0">
                  {p === "instagram" ? "📸" : p === "tiktok" ? "🎵" : p === "linkedin" ? "💼" : p === "facebook" ? "📘" : "🐦"} {p}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-0.5">
              {hasMedia && <ImageIcon className="h-3 w-3 text-purple-400" />}
              {hasVideo && <Video className="h-3 w-3 text-blue-400" />}
            </div>
          </div>

          {/* Content preview */}
          <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-3">
            {truncated}
          </p>

          {/* Pillar & Score */}
          <div className="flex items-center justify-between">
            {post.pillar && (
              <Badge variant="secondary" className="text-[8px] px-1 py-0">
                {post.pillar}
              </Badge>
            )}
            {post.feedbackScore != null && post.feedbackScore > 0 && (
              <Badge
                variant="outline"
                className={`text-[8px] px-1 py-0 ${
                  post.feedbackScore >= 80 ? "border-emerald-500/50 text-emerald-400" :
                  post.feedbackScore >= 60 ? "border-amber-500/50 text-amber-400" :
                  "border-red-500/50 text-red-400"
                }`}
              >
                {post.feedbackScore}/100
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-border/20">
            <span className="text-[9px] text-muted-foreground">
              {post.createdBy?.name || "Unbekannt"}
            </span>
            {onMoveRight && (
              <Button
                size="sm"
                variant="ghost"
                className="h-5 px-1.5 text-[9px] gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); onMoveRight(); }}
                disabled={isMoving}
              >
                {isMoving ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />}
                Weiter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function KanbanPage() {
  const [movingPostId, setMovingPostId] = useState<number | null>(null);

  const { data: posts, isLoading, refetch } = trpc.content.list.useQuery({
    limit: 200,
  });

  const approveMut = trpc.approval.approve.useMutation({
    onSuccess: () => { refetch(); setMovingPostId(null); toast.success("Post freigegeben!"); },
    onError: () => { setMovingPostId(null); toast.error("Fehler beim Freigeben"); },
  });

  const publishMut = trpc.approval.publish.useMutation({
    onSuccess: () => { refetch(); setMovingPostId(null); toast.success("Post veröffentlicht!"); },
    onError: () => { setMovingPostId(null); toast.error("Fehler beim Veröffentlichen"); },
  });

  const columns = useMemo(() => {
    if (!posts) return COLUMNS.map(c => ({ ...c, posts: [] as ContentPost[] }));
    const mapped = posts.map((p: any) => ({
      id: p.post.id,
      content: p.post.editedContent || p.post.content,
      contentType: p.post.contentType,
      status: p.post.status,
      platforms: p.post.platforms || [],
      topic: p.post.topic,
      pillar: p.post.pillar,
      mediaUrl: p.post.mediaUrl,
      videoUrl: p.post.videoUrl,
      feedbackScore: p.post.feedbackScore,
      createdAt: p.post.createdAt,
      createdBy: p.createdBy,
    })) as ContentPost[];
    return COLUMNS.map(col => ({
      ...col,
      posts: mapped.filter(p => p.status === col.id),
    }));
  }, [posts]);

  const getNextStatus = (current: string): string | null => {
    const order: string[] = ["draft", "pending", "approved", "published"];
    const idx = order.indexOf(current);
    if (idx >= 0 && idx < order.length - 1) return order[idx + 1];
    return null;
  };

  const handleMoveRight = (postId: number, currentStatus: string) => {
    setMovingPostId(postId);
    if (currentStatus === "pending") {
      approveMut.mutate({ id: postId });
    } else if (currentStatus === "approved") {
      publishMut.mutate({ id: postId });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Kanban className="h-6 w-6 text-primary" />
            Content Pipeline
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visuelles Kanban-Board. Alle Posts auf einen Blick.
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5" /> Aktualisieren
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-5 gap-3 min-h-[70vh]">
        {columns.map((col) => (
          <div key={col.id} className={`rounded-xl ${col.bg} border ${col.border} p-2 space-y-2`}>
            {/* Column Header */}
            <div className="flex items-center justify-between px-1 py-1.5">
              <div className="flex items-center gap-1.5">
                <col.icon className={`h-4 w-4 ${col.color}`} />
                <span className="text-xs font-semibold">{col.label}</span>
              </div>
              <Badge variant="outline" className="text-[9px] px-1 py-0">
                {col.posts.length}
              </Badge>
            </div>

            {/* Cards */}
            <div className="space-y-2 max-h-[calc(70vh-60px)] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : col.posts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[10px] text-muted-foreground/50">Keine Posts</p>
                </div>
              ) : (
                <AnimatePresence>
                  {col.posts.map((post) => (
                    <KanbanCard
                      key={post.id}
                      post={post}
                      onMoveRight={
                        col.id !== "published" && col.id !== "rejected"
                          ? () => handleMoveRight(post.id, col.id)
                          : undefined
                      }
                      isMoving={movingPostId === post.id}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
