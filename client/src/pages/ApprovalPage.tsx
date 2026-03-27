import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, Send, Edit3, Clock, AlertTriangle } from "lucide-react";

export default function ApprovalPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const { data: pendingPosts, isLoading } = trpc.content.list.useQuery({ status: "pending", limit: 50 });
  const { data: approvedPosts } = trpc.content.list.useQuery({ status: "approved", limit: 20 });

  const approveMut = trpc.approval.approve.useMutation({
    onSuccess: () => { utils.content.list.invalidate(); utils.dashboard.stats.invalidate(); toast.success("Post genehmigt!"); },
    onError: (err) => toast.error(err.message),
  });
  const rejectMut = trpc.approval.reject.useMutation({
    onSuccess: () => { utils.content.list.invalidate(); utils.dashboard.stats.invalidate(); toast.success("Post abgelehnt."); },
    onError: (err) => toast.error(err.message),
  });
  const publishMut = trpc.approval.publish.useMutation({
    onSuccess: () => { utils.content.list.invalidate(); utils.dashboard.stats.invalidate(); toast.success("Post auf Blotato geplant!"); },
    onError: (err) => toast.error(err.message),
  });

  const [rejectDialog, setRejectDialog] = useState<{ id: number; open: boolean }>({ id: 0, open: false });
  const [rejectComment, setRejectComment] = useState("");
  const [editDialog, setEditDialog] = useState<{ id: number; content: string; open: boolean }>({ id: 0, content: "", open: false });
  const editMut = trpc.content.edit.useMutation({
    onSuccess: () => { utils.content.list.invalidate(); toast.success("Content bearbeitet!"); setEditDialog({ id: 0, content: "", open: false }); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Approval Workflow</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isAdmin ? "Genehmige oder lehne Posts ab. Kein Content geht ohne deine Freigabe live." : "Hier siehst du den Status deiner eingereichten Posts."}
        </p>
      </div>

      {!isAdmin && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0" />
            <p className="text-sm text-yellow-200">Nur Admins können Posts genehmigen oder ablehnen. Deine Posts werden hier angezeigt sobald sie eingereicht sind.</p>
          </CardContent>
        </Card>
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
                    </div>
                    <span className="text-xs text-muted-foreground">
                      von {item.createdBy?.name || "Unbekannt"} - {new Date(item.post.createdAt).toLocaleDateString("de-DE")}
                    </span>
                  </div>
                  <div className="bg-accent/30 rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {item.post.content}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(item.post.platforms as string[])?.map(p => (
                      <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
                    ))}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                      <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => approveMut.mutate({ id: item.post.id })}
                        disabled={approveMut.isPending}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Genehmigen
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
              Keine ausstehenden Posts. Alles erledigt!
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
                        <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      className="gap-1.5 w-full"
                      onClick={() => publishMut.mutate({ id: item.post.id })}
                      disabled={publishMut.isPending}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Auf Blotato veröffentlichen
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
