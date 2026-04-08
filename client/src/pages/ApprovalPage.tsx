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
import { ContentCard } from "@/components/ContentCard";
import { useAuth } from "@/_core/hooks/useAuth";
import { PostTrackingPanel } from "@/components/PostTrackingPanel";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  CheckCircle, XCircle, Send, Edit3, Clock, AlertTriangle,
  Rocket, CalendarClock, Zap, TrendingUp, Sparkles,
} from "lucide-react";

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
    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-300 mb-2">
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
            <span className="font-mono font-medium text-amber-300">
              {String(t.hour).padStart(2, "0")}:{String(t.minute).padStart(2, "0")} Uhr
            </span>
          </div>
        ))}
      </div>
    </div>
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
  const deleteMut = trpc.content.delete.useMutation({
    onSuccess: () => { utils.content.list.invalidate(); utils.dashboard.stats.invalidate(); toast.success("Post gelöscht!"); },
    onError: (err) => toast.error(err.message),
  });
  const deleteWithoutMediaMut = trpc.content.deleteWithoutMedia.useMutation({
    onSuccess: (data) => { utils.content.list.invalidate(); utils.dashboard.stats.invalidate(); toast.success(`${data.deleted} Posts ohne Bild/Video gelöscht!`); },
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

  // Batch approve all pending
  const handleBatchApprove = () => {
    if (!pendingPosts || pendingPosts.length === 0) return;
    if (!confirm(`Alle ${pendingPosts.length} ausstehenden Posts freigeben?`)) return;
    pendingPosts.forEach((item) => {
      approveMut.mutate({
        id: item.post.id,
        autoPublish: false,
      });
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight font-[Montserrat]">Freigabe-Center</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin ? "Admin: Alle Posts verwalten" : "Prüfe und gib deine eigenen Posts frei."}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && pendingPosts && pendingPosts.length > 1 && (
            <Button
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold shadow-lg shadow-amber-500/20"
              onClick={handleBatchApprove}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Alle freigeben
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={() => {
                if (confirm("Alle Posts OHNE Bild/Video löschen?")) {
                  deleteWithoutMediaMut.mutate();
                }
              }}
              disabled={deleteWithoutMediaMut.isPending}
            >
              {deleteWithoutMediaMut.isPending ? "..." : "🗑️ Ohne Bild"}
            </Button>
          )}
        </div>
      </div>

      {/* Pipeline Status */}
      <div className="flex gap-3">
        <div className="flex-1 text-center p-4 rounded-xl bg-gradient-to-br from-yellow-500/5 to-yellow-600/10 border border-yellow-500/20">
          <Clock className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-yellow-400">{pendingPosts?.length || 0}</p>
          <p className="text-xs text-muted-foreground">Ausstehend</p>
        </div>
        <div className="flex-1 text-center p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border border-emerald-500/20">
          <CheckCircle className="h-6 w-6 text-emerald-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-emerald-400">{approvedPosts?.length || 0}</p>
          <p className="text-xs text-muted-foreground">Genehmigt</p>
        </div>
      </div>

      {/* Pending Posts */}
      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2 font-[Montserrat]">
          <Clock className="h-4 w-4 text-yellow-400" />
          Ausstehend ({pendingPosts?.length || 0})
        </h2>
        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-96 w-full rounded-xl" />)}</div>
        ) : pendingPosts && pendingPosts.length > 0 ? (
          <div className="space-y-4">
            {pendingPosts.map((item) => (
              <ContentCard
                key={item.post.id}
                post={{
                  ...item.post,
                  platforms: item.post.platforms as string[],
                }}
                createdBy={item.createdBy}
                showCopyButtons={false}
              >
                {/* Skript-Warnung */}
                {(item.post.contentType === "reel_script" || item.post.contentType === "youtube_script") && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 text-xs text-amber-400">
                    🎬 <strong>Reel-Skript</strong> — kein fertiger Post. Als Vorlage für dein Video nutzen.
                  </div>
                )}

                {/* Smart Time */}
                <SmartTimeRecommendation platforms={(item.post.platforms as string[]) || []} />

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-500/10">
                  <Button
                    size="lg"
                    className="gap-2 text-sm h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20"
                    onClick={() => {
                      setApproveDialog({ id: item.post.id, open: true, platforms: (item.post.platforms as string[]) || [] });
                      setApproveAutoPublish(false);
                      setApproveScheduledAt("");
                    }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Freigeben
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 text-sm h-12 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => { setRejectDialog({ id: item.post.id, open: true }); setRejectComment(""); }}
                  >
                    <XCircle className="h-4 w-4" />
                    Ablehnen
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 text-sm h-12 col-span-2 border-amber-500/20 hover:bg-amber-500/10"
                    onClick={() => setEditDialog({ id: item.post.id, content: item.post.editedContent || item.post.content, open: true })}
                  >
                    <Edit3 className="h-4 w-4" />
                    Bearbeiten
                  </Button>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-xs h-8 col-span-2 text-red-400/60 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => {
                        if (confirm("Diesen Post endgültig löschen?")) deleteMut.mutate({ id: item.post.id });
                      }}
                    >
                      🗑️ Löschen
                    </Button>
                  )}
                </div>
              </ContentCard>
            ))}
          </div>
        ) : (
          <Card className="border-amber-500/10 bg-gradient-to-br from-card to-emerald-500/5">
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Alles erledigt! Keine ausstehenden Posts.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Approved Posts */}
      {approvedPosts && approvedPosts.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2 font-[Montserrat]">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            Bereit zum Posten ({approvedPosts.length})
          </h2>
          <div className="space-y-4">
            {approvedPosts.map((item) => (
              <ContentCard
                key={item.post.id}
                post={{
                  ...item.post,
                  platforms: item.post.platforms as string[],
                }}
                createdBy={item.createdBy}
              >
                <div className="space-y-2 pt-2 border-t border-amber-500/10">
                  <Button
                    size="lg"
                    className="gap-2 w-full h-12 text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold shadow-lg shadow-amber-500/20"
                    onClick={() => {
                      setPublishDialog({ id: item.post.id, open: true, platforms: (item.post.platforms as string[]) || [] });
                      setPublishScheduledDate("");
                    }}
                  >
                    <Send className="h-4 w-4" />
                    Auf Blotato veröffentlichen
                  </Button>
                  {(item.post.blotatoPostIds as string[])?.length > 0 && (
                    <PostTrackingPanel contentPostId={item.post.id} />
                  )}
                </div>
              </ContentCard>
            ))}
          </div>
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog open={approveDialog.open} onOpenChange={(open) => setApproveDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              Post freigeben
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-300 flex items-center gap-2">
                📚 Post wird automatisch in der Bibliothek gespeichert. Dein Team kann ihn dort kopieren.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <div>
                <p className="text-sm font-medium">Auch via Blotato posten?</p>
                <p className="text-xs text-muted-foreground">Optional: Automatisch veröffentlichen</p>
              </div>
              <Switch checked={approveAutoPublish} onCheckedChange={setApproveAutoPublish} />
            </div>

            {approveAutoPublish && (
              <div className="space-y-3">
                {dialogSmartTimes && dialogSmartTimes.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-amber-300 flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4" /> Beste Zeiten
                      </span>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-amber-500/30 text-amber-300" onClick={handleUseSmartTime}>
                        <Zap className="h-3 w-3" /> Übernehmen
                      </Button>
                    </div>
                    {dialogSmartTimes.map((t: any) => (
                      <div key={t.platform} className="flex items-center justify-between text-xs">
                        <span>{PLATFORM_EMOJIS[t.platform]} {t.platform}</span>
                        <span className="font-mono text-amber-300">{String(t.hour).padStart(2, "0")}:{String(t.minute).padStart(2, "0")}</span>
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
              className="w-full h-12 gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold"
              onClick={() => approveMut.mutate({ id: approveDialog.id, autoPublish: approveAutoPublish, scheduledAt: approveScheduledAt || undefined })}
              disabled={approveMut.isPending}
            >
              {approveMut.isPending ? <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> : <Rocket className="h-4 w-4" />}
              {approveAutoPublish ? (approveScheduledAt ? "Freigeben & Planen" : "Freigeben & Posten") : "Freigeben & In Bibliothek"}
            </Button>
            <Button variant="outline" size="lg" className="w-full h-12" onClick={() => setApproveDialog({ id: 0, open: false, platforms: [] })}>
              Abbrechen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog open={publishDialog.open} onOpenChange={(open) => setPublishDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Send className="h-5 w-5 text-amber-400" /> Post veröffentlichen
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {dialogSmartTimes && dialogSmartTimes.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-300 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" /> Beste Zeiten
                  </span>
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-amber-500/30 text-amber-300" onClick={handleUseSmartTime}>
                    <Zap className="h-3 w-3" /> Übernehmen
                  </Button>
                </div>
                {dialogSmartTimes.map((t: any) => (
                  <div key={t.platform} className="flex items-center justify-between text-xs">
                    <span>{PLATFORM_EMOJIS[t.platform]} {t.platform}</span>
                    <span className="font-mono text-amber-300">{String(t.hour).padStart(2, "0")}:{String(t.minute).padStart(2, "0")}</span>
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
              className="w-full h-12 gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold"
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
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold"
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
