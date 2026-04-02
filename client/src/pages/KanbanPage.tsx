import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Kanban, Clock, CheckCircle, Send, XCircle, Edit3,
  Image as ImageIcon, Video, Loader2,
  RefreshCw, ArrowRight, ChevronLeft, ChevronRight,
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
  const truncated = (post.content || "").slice(0, 120) + ((post.content || "").length > 120 ? "..." : "");
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
        <CardContent className="p-3 sm:p-3 space-y-2">
          {/* Header - platforms */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              {(post.platforms || []).slice(0, 3).map((p: string) => (
                <Badge key={p} variant="outline" className="text-[9px] sm:text-[8px] px-1.5 py-0.5 sm:px-1 sm:py-0">
                  {p === "instagram" ? "📸" : p === "tiktok" ? "🎵" : p === "linkedin" ? "💼" : p === "facebook" ? "📘" : "🐦"} {p}
                </Badge>
              ))}
              {(post.platforms || []).length > 3 && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0.5">
                  +{(post.platforms || []).length - 3}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {hasMedia && <ImageIcon className="h-3.5 w-3.5 text-purple-400" />}
              {hasVideo && <Video className="h-3.5 w-3.5 text-blue-400" />}
            </div>
          </div>

          {/* Content preview */}
          <p className="text-xs sm:text-[11px] leading-relaxed text-muted-foreground line-clamp-3">
            {truncated}
          </p>

          {/* Pillar & Score */}
          <div className="flex items-center justify-between gap-1">
            {post.pillar && (
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5 truncate max-w-[120px]">
                {post.pillar}
              </Badge>
            )}
            {post.feedbackScore != null && post.feedbackScore > 0 && (
              <Badge
                variant="outline"
                className={`text-[9px] px-1.5 py-0.5 shrink-0 ${
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
          <div className="flex items-center justify-between pt-1.5 border-t border-border/20">
            <span className="text-[10px] sm:text-[9px] text-muted-foreground truncate max-w-[100px]">
              {post.createdBy?.name || "Unbekannt"}
            </span>
            {onMoveRight && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[10px] gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
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
  // Mobile: show one column at a time
  const [mobileColumnIdx, setMobileColumnIdx] = useState(0);

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

  const handleMoveRight = (postId: number, currentStatus: string) => {
    setMovingPostId(postId);
    if (currentStatus === "pending") {
      approveMut.mutate({ id: postId });
    } else if (currentStatus === "approved") {
      publishMut.mutate({ id: postId });
    }
  };

  const renderColumn = (col: typeof columns[number], fullHeight = true) => (
    <div key={col.id} className={`rounded-xl ${col.bg} border ${col.border} p-3 space-y-2 ${fullHeight ? "min-h-[60vh]" : ""}`}>
      {/* Column Header */}
      <div className="flex items-center justify-between px-1 py-1.5">
        <div className="flex items-center gap-2">
          <col.icon className={`h-4 w-4 ${col.color}`} />
          <span className="text-sm font-semibold">{col.label}</span>
        </div>
        <Badge variant="outline" className="text-xs px-2 py-0.5">
          {col.posts.length}
        </Badge>
      </div>

      {/* Cards */}
      <div className={`space-y-2 ${fullHeight ? "max-h-[calc(60vh-60px)]" : ""} overflow-y-auto pr-1`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : col.posts.length === 0 ? (
          <div className="text-center py-8">
            <col.icon className={`h-8 w-8 mx-auto mb-2 ${col.color} opacity-30`} />
            <p className="text-xs text-muted-foreground/50">Keine Posts</p>
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
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Kanban className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Content Pipeline
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Visuelles Kanban-Board. Alle Posts auf einen Blick.
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5" /> Aktualisieren
        </Button>
      </div>

      {/* ═══ MOBILE: Swipeable single column view ═══ */}
      <div className="block md:hidden">
        {/* Column tabs */}
        <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-2 -mx-1 px-1">
          {columns.map((col, idx) => (
            <button
              key={col.id}
              onClick={() => setMobileColumnIdx(idx)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                mobileColumnIdx === idx
                  ? `${col.bg} ${col.border} border ${col.color}`
                  : "text-muted-foreground hover:bg-accent/30"
              }`}
            >
              <col.icon className="h-3.5 w-3.5" />
              {col.label}
              <Badge variant="outline" className="text-[9px] px-1 py-0 ml-0.5">
                {col.posts.length}
              </Badge>
            </button>
          ))}
        </div>

        {/* Navigation arrows + column */}
        <div className="relative">
          {mobileColumnIdx > 0 && (
            <button
              onClick={() => setMobileColumnIdx(i => i - 1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border/30 rounded-full p-1.5 shadow-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {mobileColumnIdx < columns.length - 1 && (
            <button
              onClick={() => setMobileColumnIdx(i => i + 1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border border-border/30 rounded-full p-1.5 shadow-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={columns[mobileColumnIdx]?.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              {columns[mobileColumnIdx] && renderColumn(columns[mobileColumnIdx], false)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {columns.map((col, idx) => (
            <button
              key={col.id}
              onClick={() => setMobileColumnIdx(idx)}
              className={`h-2 rounded-full transition-all ${
                mobileColumnIdx === idx ? "w-6 bg-primary" : "w-2 bg-border/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ═══ DESKTOP: Full 5-column grid ═══ */}
      <div className="hidden md:grid grid-cols-5 gap-3 min-h-[70vh]">
        {columns.map((col) => renderColumn(col))}
      </div>
    </div>
  );
}
