import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, Shield, ShieldCheck, Search, RefreshCw, CheckCircle, XCircle,
  BarChart3, Clock, Star, Key, Bell, Send,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const { data: users, isLoading, refetch } = trpc.adminUsers.overview.useQuery();
  const testNotification = trpc.notifications.test.useMutation({
    onSuccess: () => toast.success("Test-Benachrichtigung gesendet!"),
    onError: (e) => toast.error(`Fehler: ${e.message}`),
  });
  const approvePartner = trpc.team.approvePartner.useMutation({
    onSuccess: () => { toast.success("Partner freigeschaltet!"); refetch(); },
    onError: (e) => toast.error(`Fehler: ${e.message}`),
  });
  const revokePartner = trpc.team.revokePartner.useMutation({
    onSuccess: () => { toast.success("Partner gesperrt!"); refetch(); },
    onError: (e) => toast.error(`Fehler: ${e.message}`),
  });

  if (user?.role !== "admin") {
    return (
      <div className="p-4 sm:p-6">
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-lg font-bold text-red-400">Kein Zugriff</h2>
            <p className="text-muted-foreground mt-2">Nur Admins können die Nutzerübersicht sehen.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filtered = users?.filter((u) =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.partnerNumber?.includes(search)
  ) || [];

  const totalUsers = users?.length || 0;
  const approvedUsers = users?.filter(u => u.isApproved).length || 0;
  const admins = users?.filter(u => u.role === "admin").length || 0;
  const withBlotato = users?.filter(u => u.hasBlotatoKey).length || 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Nutzer-Übersicht
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Alle Partner und ihre Aktivitäten</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => testNotification.mutate()} disabled={testNotification.isPending}>
            <Bell className="h-4 w-4 mr-1" />
            Test-Benachrichtigung
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold">{totalUsers}</div>
            <div className="text-xs text-muted-foreground">Gesamt</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{approvedUsers}</div>
            <div className="text-xs text-muted-foreground">Freigeschaltet</div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/30 bg-purple-500/5">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{admins}</div>
            <div className="text-xs text-muted-foreground">Admins</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{withBlotato}</div>
            <div className="text-xs text-muted-foreground">Mit Blotato</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Name, E-Mail oder Partnernummer suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* User List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-border/50 bg-card/50 animate-pulse">
              <CardContent className="p-4 h-24" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">Keine Nutzer gefunden</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => (
            <Card key={u.id} className="border-border/50 bg-card/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* User Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      {u.role === "admin" ? (
                        <ShieldCheck className="h-5 w-5 text-primary" />
                      ) : (
                        <span className="text-sm font-bold text-primary">
                          {u.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{u.name || "Unbekannt"}</span>
                        {u.role === "admin" && (
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px]">
                            Admin
                          </Badge>
                        )}
                        {u.isApproved ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-[10px]">
                            <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Aktiv
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[10px]">
                            <Clock className="h-2.5 w-2.5 mr-0.5" /> Wartend
                          </Badge>
                        )}
                        {u.hasBlotatoKey && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]">
                            <Key className="h-2.5 w-2.5 mr-0.5" /> Blotato
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3">
                        {u.email && <span>{u.email}</span>}
                        {u.partnerNumber && <span>Partner: {u.partnerNumber}</span>}
                        {u.phoneNumber && <span>Tel: {u.phoneNumber}</span>}
                      </div>
                      <div className="text-[10px] text-muted-foreground/60 mt-1">
                        Letzter Login: {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Nie"}
                      </div>
                    </div>
                  </div>

                  {/* Stats + Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Mini Stats */}
                    <div className="flex gap-2 text-center">
                      <div className="px-2 py-1 rounded bg-background/50 border border-border/30">
                        <div className="text-sm font-bold">{u.stats.totalPosts}</div>
                        <div className="text-[9px] text-muted-foreground">Posts</div>
                      </div>
                      <div className="px-2 py-1 rounded bg-background/50 border border-border/30">
                        <div className="text-sm font-bold text-green-400">{u.stats.approvedPosts}</div>
                        <div className="text-[9px] text-muted-foreground">OK</div>
                      </div>
                      <div className="px-2 py-1 rounded bg-background/50 border border-border/30">
                        <div className="text-sm font-bold text-yellow-400">{u.stats.pendingPosts}</div>
                        <div className="text-[9px] text-muted-foreground">Offen</div>
                      </div>
                      {u.stats.avgQualityScore > 0 && (
                        <div className="px-2 py-1 rounded bg-background/50 border border-border/30">
                          <div className="text-sm font-bold text-primary flex items-center gap-0.5">
                            <Star className="h-3 w-3" />{u.stats.avgQualityScore}
                          </div>
                          <div className="text-[9px] text-muted-foreground">Score</div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {!u.isApproved && u.role !== "admin" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 text-xs"
                        onClick={() => {
                          const pn = prompt("Partnernummer eingeben:");
                          if (pn) approvePartner.mutate({ userId: u.id, partnerNumber: pn });
                        }}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Freischalten
                      </Button>
                    )}
                    {u.isApproved && u.role !== "admin" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs"
                        onClick={() => {
                          if (confirm(`${u.name} wirklich sperren?`)) {
                            revokePartner.mutate({ userId: u.id });
                          }
                        }}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Sperren
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
