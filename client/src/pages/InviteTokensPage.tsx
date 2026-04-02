import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Copy, Link, CheckCircle, Clock, UserPlus,
  MessageCircle, Share2, QrCode,
} from "lucide-react";
import { toast } from "sonner";

export default function InviteTokensPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [partnerNumber, setPartnerNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(7);

  const utils = trpc.useUtils();
  const { data: tokens, isLoading } = trpc.inviteTokens.list.useQuery();

  const createToken = trpc.inviteTokens.create.useMutation({
    onSuccess: (result) => {
      toast.success("Einladungs-Link erstellt!");
      utils.inviteTokens.list.invalidate();
      setShowCreate(false);
      setName("");
      setPartnerNumber("");
      setWhatsappNumber("");
      // Copy the invite link
      const inviteUrl = `${window.location.origin}/join?token=${result.token}`;
      navigator.clipboard.writeText(inviteUrl);
      toast.success("Link in Zwischenablage kopiert!");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteToken = trpc.inviteTokens.delete.useMutation({
    onSuccess: () => {
      toast.success("Token gelöscht");
      utils.inviteTokens.list.invalidate();
    },
  });

  const copyInviteLink = (token: string) => {
    const url = `${window.location.origin}/join?token=${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Einladungs-Link kopiert!");
  };

  const shareViaWhatsApp = (token: string, name?: string | null) => {
    const url = `${window.location.origin}/join?token=${token}`;
    const text = `Hey${name ? ` ${name}` : ""}! 🎉\n\nDu wurdest zum LR Content System eingeladen. Klicke auf den Link um beizutreten:\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      </div>
    );
  }

  const activeTokens = tokens?.filter(t => !t.used && (!t.expiresAt || new Date(t.expiresAt) > new Date())) || [];
  const usedTokens = tokens?.filter(t => t.used) || [];
  const expiredTokens = tokens?.filter(t => !t.used && t.expiresAt && new Date(t.expiresAt) <= new Date()) || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shrink-0">
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            Einladungs-Links
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Partner per WhatsApp-Link einladen</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Neuen Link erstellen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Einladungs-Link erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name (optional)</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="z.B. Max Mustermann"
                />
              </div>
              <div>
                <Label>Partnernummer (optional)</Label>
                <Input
                  value={partnerNumber}
                  onChange={(e) => setPartnerNumber(e.target.value)}
                  placeholder="z.B. LR-12345"
                />
              </div>
              <div>
                <Label>WhatsApp-Nummer (optional)</Label>
                <Input
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="z.B. +491234567890"
                />
              </div>
              <div>
                <Label>Gültig für (Tage)</Label>
                <Input
                  type="number"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 7)}
                  min={1}
                  max={365}
                />
              </div>
              <Button
                onClick={() => createToken.mutate({
                  name: name || undefined,
                  partnerNumber: partnerNumber || undefined,
                  whatsappNumber: whatsappNumber || undefined,
                  expiresInDays,
                })}
                disabled={createToken.isPending}
                className="w-full gap-2"
              >
                <Link className="h-4 w-4" />
                {createToken.isPending ? "Wird erstellt..." : "Link erstellen & kopieren"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{activeTokens.length}</p>
            <p className="text-xs text-muted-foreground">Aktive Links</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{usedTokens.length}</p>
            <p className="text-xs text-muted-foreground">Eingelöst</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{expiredTokens.length}</p>
            <p className="text-xs text-muted-foreground">Abgelaufen</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Tokens */}
      {activeTokens.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" /> Aktive Einladungen
          </h2>
          <div className="space-y-2">
            <AnimatePresence>
              {activeTokens.map((token, idx) => (
                <motion.div
                  key={token.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="hover:border-primary/30 transition-colors">
                    <CardContent className="py-3 px-4">
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <Link className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{token.name || "Unbenannt"}</span>
                            {token.partnerNumber && (
                              <Badge variant="outline" className="text-[9px] h-4">{token.partnerNumber}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3" />
                            Gültig bis {token.expiresAt ? new Date(token.expiresAt).toLocaleDateString("de-DE") : "Unbegrenzt"}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => copyInviteLink(token.token)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-400" onClick={() => shareViaWhatsApp(token.token, token.name)}>
                            <MessageCircle className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-destructive"
                            onClick={() => deleteToken.mutate({ id: token.id })}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Used Tokens */}
      {usedTokens.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-400" /> Eingelöste Einladungen
          </h2>
          <div className="space-y-2">
            {usedTokens.map(token => (
              <Card key={token.id} className="opacity-60">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{token.name || "Unbenannt"}</span>
                      <p className="text-[10px] text-muted-foreground">
                        Eingelöst am {token.usedAt ? new Date(token.usedAt).toLocaleDateString("de-DE") : "Unbekannt"}
                      </p>
                    </div>
                    <Badge variant="default" className="text-[9px]">Eingelöst</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tokens?.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground">Noch keine Einladungs-Links erstellt</p>
            <p className="text-xs text-muted-foreground mt-1">
              Erstelle einen Link und teile ihn per WhatsApp mit deinen Partnern.
            </p>
            <Button className="mt-4 gap-2" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" /> Ersten Link erstellen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
