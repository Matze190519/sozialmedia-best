import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";
import {
  Users, Shield, User, Crown, CheckCircle, XCircle,
  Phone, Hash, UserPlus, Lock, Unlock,
} from "lucide-react";

export default function TeamPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const { data: teamMembers, isLoading } = trpc.team.list.useQuery();

  const [approveOpen, setApproveOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [partnerNumber, setPartnerNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const updateRoleMut = trpc.team.updateRole.useMutation({
    onSuccess: () => { utils.team.list.invalidate(); toast.success("Rolle aktualisiert!"); },
    onError: (err: any) => toast.error(err.message),
  });

  const approveMut = trpc.team.approvePartner.useMutation({
    onSuccess: () => {
      utils.team.list.invalidate();
      toast.success("Partner freigeschaltet!");
      setApproveOpen(false);
      setPartnerNumber("");
      setPhoneNumber("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const revokeMut = trpc.team.revokePartner.useMutation({
    onSuccess: () => { utils.team.list.invalidate(); toast.success("Zugang gesperrt."); },
    onError: (err: any) => toast.error(err.message),
  });

  const openApproveDialog = (userId: number) => {
    setSelectedUserId(userId);
    setPartnerNumber("");
    setPhoneNumber("");
    setApproveOpen(true);
  };

  const handleApprove = () => {
    if (!selectedUserId || !partnerNumber.trim()) {
      toast.error("Partnernummer ist Pflicht!");
      return;
    }
    approveMut.mutate({
      userId: selectedUserId,
      partnerNumber: partnerNumber.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
    });
  };

  const approvedCount = teamMembers?.filter((m: any) => m.isApproved).length || 0;
  const pendingCount = teamMembers?.filter((m: any) => !m.isApproved && m.id !== user?.id).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Team-Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Partner freischalten, Rollen zuweisen und Zugang verwalten.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{teamMembers?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Gesamt</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{approvedCount}</p>
            <p className="text-xs text-muted-foreground">Freigeschaltet</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Warten auf Freigabe</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{teamMembers?.filter((m: any) => m.role === "admin").length || 0}</p>
            <p className="text-xs text-muted-foreground">Admins</p>
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">So funktioniert die Freischaltung</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <div className="flex items-start gap-2">
            <span className="font-bold text-primary shrink-0">1.</span>
            <span>Partner meldet sich im Dashboard an (Login-Link teilen)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-primary shrink-0">2.</span>
            <span>Du siehst den neuen Partner hier in der Liste (Status: "Wartet")</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-primary shrink-0">3.</span>
            <span>Klicke "Freischalten" und trage <strong>Partnernummer</strong> und optional <strong>Telefonnummer</strong> (WhatsApp) ein</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-primary shrink-0">4.</span>
            <span>Partner hat Zugang zur Content-Bibliothek, kann Content erstellen und (mit eigenem Blotato Key) automatisch posten</span>
          </div>
        </CardContent>
      </Card>

      {/* Team List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : teamMembers && teamMembers.length > 0 ? (
        <div className="space-y-3">
          {teamMembers.map((member: any) => {
            const isSelf = member.id === user?.id;
            const isApproved = member.isApproved || member.role === "admin";

            return (
              <Card key={member.id} className={`border-border/50 ${!isApproved && !isSelf ? "border-amber-500/30" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Avatar + Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                        member.role === "admin" ? "bg-amber-500/10" :
                        isApproved ? "bg-green-500/10" : "bg-muted"
                      }`}>
                        {member.role === "admin" ? <Crown className="h-5 w-5 text-amber-400" /> :
                         isApproved ? <CheckCircle className="h-5 w-5 text-green-500" /> :
                         <Lock className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{member.name || "Unbenannt"}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email || "Keine E-Mail"}</p>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          <Badge variant={member.role === "admin" ? "default" : "outline"} className="text-[10px]">
                            {member.role === "admin" ? "Admin" : "Team"}
                          </Badge>
                          {isApproved ? (
                            <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30">
                              Freigeschaltet
                            </Badge>
                          ) : !isSelf ? (
                            <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                              Wartet auf Freigabe
                            </Badge>
                          ) : null}
                          {member.partnerNumber && (
                            <Badge variant="outline" className="text-[10px]">
                              <Hash className="h-2.5 w-2.5 mr-0.5" />{member.partnerNumber}
                            </Badge>
                          )}
                          {member.phoneNumber && (
                            <Badge variant="outline" className="text-[10px]">
                              <Phone className="h-2.5 w-2.5 mr-0.5" />{member.phoneNumber}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {isAdmin && !isSelf && (
                      <div className="flex gap-2 shrink-0">
                        {!isApproved ? (
                          <Button
                            size="sm"
                            onClick={() => openApproveDialog(member.id)}
                            className="gap-1.5"
                            disabled={approveMut.isPending}
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            Freischalten
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateRoleMut.mutate({
                                userId: member.id,
                                role: member.role === "admin" ? "user" : "admin",
                              })}
                              disabled={updateRoleMut.isPending}
                              className="gap-1.5"
                            >
                              <Shield className="h-3.5 w-3.5" />
                              {member.role === "admin" ? "Zu User" : "Zu Admin"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm(`${member.name || "Diesen Partner"} wirklich sperren?`)) {
                                  revokeMut.mutate({ userId: member.id });
                                }
                              }}
                              disabled={revokeMut.isPending}
                              className="gap-1.5 text-red-400 hover:text-red-300"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Sperren
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Noch keine Team-Mitglieder.</p>
            <p className="text-sm text-muted-foreground mt-2">Teile den Login-Link mit deinem Team.</p>
          </CardContent>
        </Card>
      )}

      {/* Approve Dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partner freischalten</DialogTitle>
            <DialogDescription>
              Trage die LR-Partnernummer und optional die WhatsApp-Nummer ein.
              Nur freigeschaltete Partner haben Zugang zum Content Hub.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="partnerNumber" className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" /> LR-Partnernummer *
              </Label>
              <Input
                id="partnerNumber"
                placeholder="z.B. 12345678"
                value={partnerNumber}
                onChange={e => setPartnerNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> WhatsApp-Nummer (optional)
              </Label>
              <Input
                id="phoneNumber"
                placeholder="z.B. +49 170 1234567"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">
                Wird für die Lina-Integration benötigt (Erkennung über WhatsApp).
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)} disabled={approveMut.isPending}>Abbrechen</Button>
            <Button onClick={handleApprove} disabled={approveMut.isPending || !partnerNumber.trim()}>
              <Unlock className="h-4 w-4 mr-1.5" />
              Freischalten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
