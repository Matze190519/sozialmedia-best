import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle, XCircle, Send, Edit3, Clock, AlertTriangle,
  Image, Video, Rocket, CalendarClock, Eye, ArrowRight,
} from "lucide-react";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500/20 text-pink-300",
  facebook: "bg-blue-500/20 text-blue-300",
  tiktok: "bg-cyan-500/20 text-cyan-300",
  linkedin: "bg-blue-700/20 text-blue-200",
  twitter: "bg-sky-500/20 text-sky-300",
  threads: "bg-gray-500/20 text-gray-300",
  youtube: "bg-red-600/20 text-red-300",
};

export default function ApprovalPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const { data: pendingPosts, isLoading } = trpc.content.list.useQuery({ status: "pending", limit: 50 });
  const { data: approvedPosts } = trpc.content.list.useQuery({ status: "approved", limit: 20 });

  const approveMut = trpc.approval.approve.useMutation({
    onSuccess: () => { utils.content.list.invalidate(); utils.dashboard.stats.invalidate(); toast.success("Post genehmigt!"); setApproveDialog({ id: 0, open: false }); },
    onError: (err) => toast.error(err.message),
  });
  const rejectMut = trpc.approval.reject.useMutation({
    onSuccess: () => { utils.content.list.invalidate(); utils.dashboard.stats.invalidate(); toast.success("Post abgelehnt."); },
    onError: (err) => toast.error(err.message),
  });
  const publishMut = trpc.approval.publish.useMutation({
    onSuccess: () => { utils.content.list.invalidate(); utils.dashboard.stats.invalidate(); toast.success("Post auf Blotato geplant!"); setPublishDialog({ id: 0, open: false }); },
    onError: (err) => toast.error(err.message),
  });

  const [rejectDialog, setRejectDialog] = useState<{ id: number; open: boolean }>({ id: 0, open: false });
  const [rejectComment, setRejectComment] = useState("");
  const [editDialog, setEditDialog] = useState<{ id: number; content: string; open: boolean }>({ id: 0, content: "", open: false });
  const [approveDialog, setApproveDialog] = useState<{ id: number; open: boolean }>({ id: 0, open: false });
  const [approveAutoPublish, setApproveAutoPublish] = useState(true);
  const [approveScheduledAt, setApproveScheduledAt] = useState("");
  const [publishDialog, setPublishDialog] = useState<{ id: number; open: boolean }>({ id: 0, open: false });
  const [publishScheduledDate, setPublishScheduledDate] = useState("");

  const editMut = trpc.content.edit.useMutation({
    onSuccess: () => { utils.content.list.invalidate(); toast.success("Content bearbeitet!"); setEditDialog({ id: 0, content: "", open: false }); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Freigabe-Center</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isAdmin
            ? "Prüfe, bearbeite und gib Posts frei. Genehmigte Posts werden automatisch gepostet."
            : "Hier siehst du den Status deiner eingereichten Posts."}
        </p>
      </div>

      {/* How it works for non-admins */}
      {!isAdmin && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0" />
            <p className="text-sm text-yellow-200">Nur Admins können Posts genehmigen oder ablehnen. Deine Posts werden hier angezeigt sobald sie eingereicht sind.</p>
          </CardContent>
        </Card>
      )}

      {/* Pipeline Status */}
      {isAdmin && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
              <p className="text-2xl font-bold">{pendingPosts?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Warten auf Freigabe</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 text-emerald-400 mx-auto mb-1" />
              <p className="text-2xl font-bold">{approvedPosts?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Bereit zum Posten</p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-4 text-center">
              <Rocket className="h-6 w-6 text-blue-400 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground mt-1">Genehmigen = Sofort posten</p>
              <p className="text-[10px] text-muted-foreground">(wenn Auto-Post aktiv)</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Posts */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-400" />
          Ausstehende Posts ({pendingPosts?.length || 0})
        </h2>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>
        ) : pendingPosts && pendingPosts.length > 0 ? (
          <div className="space-y-3">
            {pendingPosts.map((item) => (
              <Card key={item.post.id} className="border-yellow-500/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{item.post.contentType}</Badge>
                      {item.post.topic && <Badge variant="secondary" className="text-[10px]">{item.post.topic}</Badge>}
                      {item.post.pillar && <Badge variant="secondary" className="text-[10px]">{item.post.pillar}</Badge>}
                      {item.post.mediaUrl && (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Image className="h-2.5 w-2.5" /> Bild
                        </Badge>
                      )}
                      {item.post.videoUrl && (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Video className="h-2.5 w-2.5" /> Video
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      von {item.createdBy?.name || "Unbekannt"} - {new Date(item.post.createdAt).toLocaleDateString("de-DE")}
                    </span>
                  </div>

                  {/* Media Preview */}
                  {(item.post.mediaUrl || item.post.videoUrl) && (
                    <div className="flex gap-2">
                      {item.post.mediaUrl && (
                        <img src={item.post.mediaUrl} alt="Preview" className="h-20 w-20 rounded-lg object-cover border border-border/50" />
                      )}
                      {item.post.videoUrl && (
                        <video src={item.post.videoUrl} className="h-20 w-32 rounded-lg object-cover border border-border/50" controls muted />
                      )}
                    </div>
                  )}

                  <div className="bg-accent/30 rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {item.post.editedContent || item.post.content}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(item.post.platforms as string[])?.map(p => (
                      <span key={p} className={`text-[10px] px-1.5 py-0.5 rounded ${PLATFORM_COLORS[p] || "bg-accent text-accent-foreground"}`}>
                        {p}
                      </span>
                    ))}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                      <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => {
                          setApproveDialog({ id: item.post.id, open: true });
                          setApproveAutoPublish(true);
                          setApproveScheduledAt("");
                        }}
                        disabled={approveMut.isPending}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Genehmigen & Posten
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1.5"
                        onClick={() => { setRejectDialog({ id: item.post.id, open: true }); setRejectComment(""); }}
                        disabled={rejectMut.isPending}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Ablehnen
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => setEditDialog({ id: item.post.id, content: item.post.editedContent || item.post.content, open: true })}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Bearbeiten
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              Keine ausstehenden Posts. Alles erledigt! Erstelle neuen Content im Generator.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Approved Posts - ready to publish */}
      {isAdmin && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            Genehmigte Posts - bereit zum Publizieren ({approvedPosts?.length || 0})
          </h2>
          {approvedPosts && approvedPosts.length > 0 ? (
            <div className="space-y-3">
              {approvedPosts.map((item) => (
                <Card key={item.post.id} className="border-emerald-500/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="text-[10px]">Genehmigt</Badge>
                      <span className="text-xs text-muted-foreground">{item.post.contentType}</span>
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-3">
                      {item.post.editedContent || item.post.content}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(item.post.platforms as string[])?.map(p => (
                        <span key={p} className={`text-[10px] px-1.5 py-0.5 rounded ${PLATFORM_COLORS[p] || "bg-accent text-accent-foreground"}`}>
                          {p}
                        </span>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      className="gap-1.5 w-full"
                      onClick={() => {
                        setPublishDialog({ id: item.post.id, open: true });
                        setPublishScheduledDate("");
                      }}
                      disabled={publishMut.isPending}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Jetzt auf Blotato veröffentlichen
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border/50">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Keine genehmigten Posts zum Veröffentlichen.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Approve Dialog with Auto-Publish Option */}
      <Dialog open={approveDialog.open} onOpenChange={(open) => setApproveDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              Post genehmigen
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <div>
                <p className="text-sm font-medium">Sofort auf Social Media posten?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Wird über Blotato auf allen ausgewählten Plattformen veröffentlicht
                </p>
              </div>
              <Switch checked={approveAutoPublish} onCheckedChange={setApproveAutoPublish} />
            </div>

            {approveAutoPublish && (
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <CalendarClock className="h-4 w-4" />
                  Zeitpunkt festlegen (optional)
                </Label>
                <Input
                  type="datetime-local"
                  value={approveScheduledAt}
                  onChange={(e) => setApproveScheduledAt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leer lassen = sofort posten. Oder wähle Datum und Uhrzeit für geplantes Posting.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog({ id: 0, open: false })}>Abbrechen</Button>
            <Button
              onClick={() => {
                approveMut.mutate({
                  id: approveDialog.id,
                  autoPublish: approveAutoPublish,
                  scheduledAt: approveScheduledAt || undefined,
                });
              }}
              disabled={approveMut.isPending}
              className="gap-1.5"
            >
              {approveMut.isPending ? (
                <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Rocket className="h-3.5 w-3.5" />
              )}
              {approveAutoPublish ? "Genehmigen & Posten" : "Nur Genehmigen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog with Schedule Option */}
      <Dialog open={publishDialog.open} onOpenChange={(open) => setPublishDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-400" />
              Post veröffentlichen
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                Wann soll der Post live gehen?
              </Label>
              <Input
                type="datetime-local"
                value={publishScheduledDate}
                onChange={(e) => setPublishScheduledDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leer lassen = sofort posten. Oder wähle Datum und Uhrzeit.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishDialog({ id: 0, open: false })}>Abbrechen</Button>
            <Button
              onClick={() => {
                publishMut.mutate({
                  id: publishDialog.id,
                  scheduledDate: publishScheduledDate || undefined,
                });
              }}
              disabled={publishMut.isPending}
              className="gap-1.5"
            >
              {publishMut.isPending ? (
                <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {publishScheduledDate ? "Planen" : "Jetzt posten"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post ablehnen</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Grund für die Ablehnung..."
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ id: 0, open: false })}>Abbrechen</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!rejectComment.trim()) { toast.error("Bitte Grund angeben"); return; }
                rejectMut.mutate({ id: rejectDialog.id, comment: rejectComment });
                setRejectDialog({ id: 0, open: false });
              }}
            >
              Ablehnen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Content bearbeiten</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editDialog.content}
            onChange={(e) => setEditDialog(prev => ({ ...prev, content: e.target.value }))}
            rows={10}
            className="font-mono text-sm"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ id: 0, content: "", open: false })}>Abbrechen</Button>
            <Button
              onClick={() => editMut.mutate({ id: editDialog.id, editedContent: editDialog.content })}
              disabled={editMut.isPending}
            >
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
