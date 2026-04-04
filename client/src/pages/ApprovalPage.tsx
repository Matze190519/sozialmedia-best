import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { PostTrackingPanel } from "@/components/PostTrackingPanel";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  CheckCircle, XCircle, Send, Edit3, Clock, AlertTriangle,
  Image, Video, Rocket, CalendarClock, Zap, TrendingUp, ChevronDown, ChevronUp,
} from "lucide-react";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  facebook: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  tiktok: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  linkedin: "bg-blue-700/20 text-blue-200 border-blue-700/30",
  twitter: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  threads: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  youtube: "bg-red-600/20 text-red-300 border-red-600/30",
  pinterest: "bg-red-400/20 text-red-200 border-red-400/30",
};

const PLATFORM_EMOJIS: Record<string, string> = {
  instagram: "📸", facebook: "📘", tiktok: "🎵", linkedin: "💼",
  twitter: "🐦", threads: "🧵", youtube: "🎬", pinterest: "📌",
};

function SmartTimeRecommendation({ platforms }: { platforms: string[] }) {
  const stablePlatforms = useMemo(() => platforms, [platforms.join(",")]);
  const { data: smartTimes } = trpc.postingTimes.smartNextMulti.useQuery(
    { platforms: stablePlatforms },
    { enabled: stablePlatforms.length > 0 }
  );
  if (!smartTimes || smartTimes.length === 0) return null;

  return (
    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
      <div className="flex items-center gap-2 text-sm font-medium text-emerald-300 mb-2">
        <Zap className="h-4 w-4" />
        Optimale Posting-Zeiten
      </div>
      <div className="space-y-1.5">
        {smartTimes.map((t: any) => (
          <div key={t.platform} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <span>{PLATFORM_EMOJIS[t.platform] || "📱"}</span>
              <span className="capitalize">{t.platform}</span>
            </span>
            <span className="font-mono font-medium text-emerald-300">
              {String(t.hour).padStart(2, "0")}:{String(t.minute).padStart(2, "0")} Uhr
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Single post card - mobile-first with expandable content */
function PostCard({
  item,
  isAdmin,
  onApprove,
  onReject,
  onEdit,
  onPublish,
  variant,
}: {
  item: any;
  isAdmin: boolean;
  onApprove?: (id: number, platforms: string[]) => void;
  onReject?: (id: number) => void;
  onEdit?: (id: number, content: string) => void;
  onPublish?: (id: number, platforms: string[]) => void;
  variant: "pending" | "approved";
}) {
  const [expanded, setExpanded] = useState(false);
  const content = item.post.editedContent || item.post.content;
  const isLong = content.length > 200;
  const platforms = (item.post.platforms as string[]) || [];
  const hasMedia = !!item.post.mediaUrl || !!item.post.videoUrl;

  return (
    <Card className={`overflow-hidden ${variant === "pending" ? "border-yellow-500/20" : "border-emerald-500/20"}`}>
      <CardContent className="p-0">
        {/* Media Preview - Full width, prominent */}
        {!hasMedia && (
          <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300">Kein Bild/Video vorhanden. Generiere Medien im Content-Generator.</p>
          </div>
        )}
        {hasMedia && (
          <div className="relative">
            {item.post.mediaUrl && (
              <img
                src={item.post.mediaUrl}
                alt="Post Preview"
                className="w-full max-h-80 object-cover"
                loading="lazy"
              />
            )}
            {item.post.videoUrl && (
              <video
                src={item.post.videoUrl}
                className="w-full max-h-80 object-cover"
                controls
                muted
                playsInline
                preload="metadata"
              />
            )}
            {/* Media type badges overlay */}
            <div className="absolute top-2 right-2 flex gap-1.5">
              {item.post.mediaUrl && (
                <Badge className="bg-black/60 text-white border-0 text-[10px] gap-1 backdrop-blur-sm">
                  <Image className="h-3 w-3" /> Bild
                </Badge>
              )}
              {item.post.videoUrl && (
                <Badge className="bg-black/60 text-white border-0 text-[10px] gap-1 backdrop-blur-sm">
                  <Video className="h-3 w-3" /> Video
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="p-4 space-y-3">
          {/* Header: Type + Pillar + Date */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="outline" className="text-[10px]">{item.post.contentType}</Badge>
              {item.post.pillar && <Badge variant="secondary" className="text-[10px]">{item.post.pillar}</Badge>}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {item.createdBy?.name} · {new Date(item.post.createdAt).toLocaleDateString("de-DE")}
            </span>
          </div>

          {/* Platforms */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {platforms.map(p => (
              <span key={p} className={`text-xs px-2 py-1 rounded-full border ${PLATFORM_COLORS[p] || "bg-accent text-accent-foreground border-border"}`}>
                {PLATFORM_EMOJIS[p]} {p}
              </span>
            ))}
          </div>

          {/* Content Text - expandable */}
          <div className="relative">
            <div className={`bg-accent/20 rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap ${!expanded && isLong ? "max-h-32 overflow-hidden" : ""}`}>
              {content}
            </div>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-primary mt-1 hover:underline"
              >
                {expanded ? <><ChevronUp className="h-3 w-3" /> Weniger anzeigen</> : <><ChevronDown className="h-3 w-3" /> Mehr anzeigen</>}
              </button>
            )}
          </div>

          {/* Smart Time inline */}
          <SmartTimeRecommendation platforms={platforms} />

          {/* Action Buttons - large, touch-friendly */}
          {variant === "pending" && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
              <Button
                size="lg"
                className="gap-2 text-sm h-12"
                onClick={() => onApprove?.(item.post.id, platforms)}
              >
                <CheckCircle className="h-4 w-4" />
                Freigeben
              </Button>
              <Button
                size="lg"
                variant="destructive"
                className="gap-2 text-sm h-12"
                onClick={() => onReject?.(item.post.id)}
              >
                <XCircle className="h-4 w-4" />
                Ablehnen
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-sm h-12 col-span-2"
                onClick={() => onEdit?.(item.post.id, content)}
              >
                <Edit3 className="h-4 w-4" />
                Bearbeiten
              </Button>
            </div>
          )}

          {variant === "approved" && (
            <div className="space-y-2">
              <Button
                size="lg"
                className="gap-2 w-full h-12 text-sm"
                onClick={() => onPublish?.(item.post.id, platforms)}
              >
                <Send className="h-4 w-4" />
                Auf Blotato veröffentlichen
              </Button>
              {/* Live Post-Status Tracking */}
              {(item.post.blotatoPostIds as string[])?.length > 0 && (
                <PostTrackingPanel contentPostId={item.post.id} />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ApprovalPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const { data: pendingPosts, isLoading } = trpc.content.list.useQuery({ status: "pending", limit: 50 });
  const { data: approvedPosts } = trpc.content.list.useQuery({ status: "approved", limit: 20 });

  const approveMut = trpc.approval.approve.useMutation({
    onSuccess: () => { utils.content.list.invalidate(); utils.dashboard.stats.invalidate(); toast.success("Post genehmigt!"); setApproveDialog({ id: 0, open: false, platforms: [] }); },
    onError: (err) => toast.error(err.message),
  });
  const rejectMut = trpc.approval.reject.useMutation({
    onSuccess: () => { utils.content.list.invalidate(); utils.dashboard.stats.invalidate(); toast.success("Post abgelehnt."); },
    onError: (err) => toast.error(err.message),
  });
  const publishMut = trpc.approval.publish.useMutation({
    onSuccess: () => { utils.content.list.invalidate(); utils.dashboard.stats.invalidate(); toast.success("Post auf Blotato geplant!"); setPublishDialog({ id: 0, open: false, platforms: [] }); },
    onError: (err) => toast.error(err.message),
  });
  const editMut = trpc.content.edit.useMutation({
    onSuccess: () => { utils.content.list.invalidate(); toast.success("Content bearbeitet!"); setEditDialog({ id: 0, content: "", open: false }); },
    onError: (err) => toast.error(err.message),
  });

  const [rejectDialog, setRejectDialog] = useState<{ id: number; open: boolean }>({ id: 0, open: false });
  const [rejectComment, setRejectComment] = useState("");
  const [editDialog, setEditDialog] = useState<{ id: number; content: string; open: boolean }>({ id: 0, content: "", open: false });
  const [approveDialog, setApproveDialog] = useState<{ id: number; open: boolean; platforms: string[] }>({ id: 0, open: false, platforms: [] });
  const [approveAutoPublish, setApproveAutoPublish] = useState(true);
  const [approveScheduledAt, setApproveScheduledAt] = useState("");
  const [publishDialog, setPublishDialog] = useState<{ id: number; open: boolean; platforms: string[] }>({ id: 0, open: false, platforms: [] });
  const [publishScheduledDate, setPublishScheduledDate] = useState("");

  const dialogPlatforms = useMemo(
    () => approveDialog.open ? approveDialog.platforms : publishDialog.platforms,
    [approveDialog.open, approveDialog.platforms, publishDialog.open, publishDialog.platforms]
  );
  const { data: dialogSmartTimes } = trpc.postingTimes.smartNextMulti.useQuery(
    { platforms: dialogPlatforms },
    { enabled: dialogPlatforms.length > 0 && (approveDialog.open || publishDialog.open) }
  );

  const handleUseSmartTime = () => {
    if (dialogSmartTimes && dialogSmartTimes.length > 0) {
      const best = dialogSmartTimes.reduce((a: any, b: any) => a.score > b.score ? a : b);
      const date = new Date(best.scheduledTime);
      const formatted = date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0") + "T" +
        String(date.getHours()).padStart(2, "0") + ":" +
        String(date.getMinutes()).padStart(2, "0");
      if (approveDialog.open) setApproveScheduledAt(formatted);
      else setPublishScheduledDate(formatted);
      toast.success(`Optimale Zeit: ${best.dayName} ${String(best.hour).padStart(2, "0")}:${String(best.minute).padStart(2, "0")} Uhr`);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Freigabe-Center</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Prüfe und gib deine eigenen Posts frei.
        </p>
      </div>



      {/* Pipeline Status - compact for mobile */}
      {(
        <div className="flex gap-3">
          <div className="flex-1 text-center p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
            <Clock className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-xl font-bold">{pendingPosts?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground">Ausstehend</p>
          </div>
          <div className="flex-1 text-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-xl font-bold">{approvedPosts?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground">Genehmigt</p>
          </div>
        </div>
      )}

      {/* Pending Posts */}
      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-yellow-400" />
          Ausstehend ({pendingPosts?.length || 0})
        </h2>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}</div>
        ) : pendingPosts && pendingPosts.length > 0 ? (
          <div className="space-y-4">
            {pendingPosts.map((item) => (
              <PostCard
                key={item.post.id}
                item={item}
                isAdmin={isAdmin}
                variant="pending"
                onApprove={(id, platforms) => {
                  setApproveDialog({ id, open: true, platforms });
                  setApproveAutoPublish(false);
                  setApproveScheduledAt("");
                }}
                onReject={(id) => { setRejectDialog({ id, open: true }); setRejectComment(""); }}
                onEdit={(id, content) => setEditDialog({ id, content, open: true })}
              />
            ))}
          </div>
        ) : (
          <Card className="border-border/30">
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Alles erledigt! Keine ausstehenden Posts.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Approved Posts */}
      {approvedPosts && approvedPosts.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            Bereit zum Posten ({approvedPosts.length})
          </h2>
          <div className="space-y-4">
            {approvedPosts.map((item) => (
              <PostCard
                key={item.post.id}
                item={item}
                isAdmin={isAdmin}
                variant="approved"
                onPublish={(id, platforms) => {
                  setPublishDialog({ id, open: true, platforms });
                  setPublishScheduledDate("");
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Approve Dialog - mobile optimized */}
      <Dialog open={approveDialog.open} onOpenChange={(open) => setApproveDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              Post freigeben
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Info: Auto-save to library */}
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                Post wird automatisch in der Bibliothek gespeichert. Dein Team kann ihn dort kopieren und selbst posten.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <div>
                <p className="text-sm font-medium">Auch via Blotato posten?</p>
                <p className="text-xs text-muted-foreground">Optional: Automatisch auf Plattformen veröffentlichen</p>
              </div>
              <Switch checked={approveAutoPublish} onCheckedChange={setApproveAutoPublish} />
            </div>

            {approveAutoPublish && (
              <div className="space-y-3">
                {dialogSmartTimes && dialogSmartTimes.length > 0 && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-300 flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4" /> Beste Zeiten
                      </span>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-emerald-500/30 text-emerald-300" onClick={handleUseSmartTime}>
                        <Zap className="h-3 w-3" /> Übernehmen
                      </Button>
                    </div>
                    {dialogSmartTimes.map((t: any) => (
                      <div key={t.platform} className="flex items-center justify-between text-xs">
                        <span>{PLATFORM_EMOJIS[t.platform]} {t.platform}</span>
                        <span className="font-mono text-emerald-300">{String(t.hour).padStart(2, "0")}:{String(t.minute).padStart(2, "0")}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-sm flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" /> Zeitpunkt (optional)
                  </Label>
                  <Input type="datetime-local" value={approveScheduledAt} onChange={(e) => setApproveScheduledAt(e.target.value)} className="h-12 text-base" />
                  <p className="text-[10px] text-muted-foreground">Leer = sofort posten</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              size="lg"
              className="w-full h-12 gap-2"
              onClick={() => approveMut.mutate({ id: approveDialog.id, autoPublish: approveAutoPublish, scheduledAt: approveScheduledAt || undefined })}
              disabled={approveMut.isPending}
            >
              {approveMut.isPending ? <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> : <Rocket className="h-4 w-4" />}
              {approveAutoPublish ? (approveScheduledAt ? "Freigeben & Planen" : "Freigeben & Posten") : "Freigeben & In Bibliothek speichern"}
            </Button>
            <Button variant="outline" size="lg" className="w-full h-12" onClick={() => setApproveDialog({ id: 0, open: false, platforms: [] })}>
              Abbrechen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog - mobile optimized */}
      <Dialog open={publishDialog.open} onOpenChange={(open) => setPublishDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Send className="h-5 w-5 text-blue-400" /> Post veröffentlichen
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {dialogSmartTimes && dialogSmartTimes.length > 0 && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-300 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" /> Beste Zeiten
                  </span>
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-emerald-500/30 text-emerald-300" onClick={handleUseSmartTime}>
                    <Zap className="h-3 w-3" /> Übernehmen
                  </Button>
                </div>
                {dialogSmartTimes.map((t: any) => (
                  <div key={t.platform} className="flex items-center justify-between text-xs">
                    <span>{PLATFORM_EMOJIS[t.platform]} {t.platform}</span>
                    <span className="font-mono text-emerald-300">{String(t.hour).padStart(2, "0")}:{String(t.minute).padStart(2, "0")}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-2">
                <CalendarClock className="h-4 w-4" /> Wann live gehen?
              </Label>
              <Input type="datetime-local" value={publishScheduledDate} onChange={(e) => setPublishScheduledDate(e.target.value)} className="h-12 text-base" />
              <p className="text-[10px] text-muted-foreground">Leer = sofort posten</p>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              size="lg"
              className="w-full h-12 gap-2"
              onClick={() => publishMut.mutate({ id: publishDialog.id, scheduledDate: publishScheduledDate || undefined })}
              disabled={publishMut.isPending}
            >
              {publishMut.isPending ? <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> : <Send className="h-4 w-4" />}
              {publishScheduledDate ? "Planen" : "Jetzt posten"}
            </Button>
            <Button variant="outline" size="lg" className="w-full h-12" onClick={() => setPublishDialog({ id: 0, open: false, platforms: [] })}>
              Abbrechen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Post ablehnen</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Grund für die Ablehnung..."
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            rows={3}
            className="text-base"
          />
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              variant="destructive"
              size="lg"
              className="w-full h-12"
              onClick={() => {
                if (!rejectComment.trim()) { toast.error("Bitte Grund angeben"); return; }
                rejectMut.mutate({ id: rejectDialog.id, comment: rejectComment });
                setRejectDialog({ id: 0, open: false });
              }}
            >
              Ablehnen
            </Button>
            <Button variant="outline" size="lg" className="w-full h-12" onClick={() => setRejectDialog({ id: 0, open: false })}>
              Abbrechen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-2xl mx-4">
          <DialogHeader>
            <DialogTitle>Content bearbeiten</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editDialog.content}
            onChange={(e) => setEditDialog(prev => ({ ...prev, content: e.target.value }))}
            rows={10}
            className="font-mono text-sm"
          />
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              size="lg"
              className="w-full h-12"
              onClick={() => editMut.mutate({ id: editDialog.id, editedContent: editDialog.content })}
              disabled={editMut.isPending}
            >
              Speichern
            </Button>
            <Button variant="outline" size="lg" className="w-full h-12" onClick={() => setEditDialog({ id: 0, content: "", open: false })}>
              Abbrechen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
