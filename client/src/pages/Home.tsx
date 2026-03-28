import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import {
  FileText, CheckCircle, XCircle, Clock, Send,
  Zap, TrendingUp, ArrowRight, Rocket,
  Image, Video, AlertCircle, Flame,
  Library, Eye, Sparkles,
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

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const isAdmin = user?.role === "admin";
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: apiHealth } = trpc.apiHealth.goViralBitch.useQuery();
  const { data: pendingPosts } = trpc.content.list.useQuery({ status: "pending", limit: 5 });
  const { data: approvedPosts } = trpc.content.list.useQuery({ status: "approved", limit: 3 });
  const { data: recentPosts, isLoading: postsLoading } = trpc.content.list.useQuery({ limit: 6 });
  const { data: userSettings } = trpc.userSettings.get.useQuery();

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header - Compact */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Hey {user?.name?.split(" ")[0] || "Team"}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Erstellen → Freigeben → Posten
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={apiHealth?.status === "online" ? "default" : "destructive"} className="gap-1.5 text-xs">
            <span className={`h-1.5 w-1.5 rounded-full ${apiHealth?.status === "online" ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            {apiHealth?.status === "online" ? "Online" : "Offline"}
          </Badge>
          {userSettings?.hasBlotatoKey ? (
            <Badge variant="outline" className="gap-1 text-xs text-emerald-400 border-emerald-500/30">
              <Send className="h-2.5 w-2.5" /> Auto-Post
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-xs text-amber-400 border-amber-500/30 cursor-pointer" onClick={() => setLocation("/settings")}>
              <AlertCircle className="h-2.5 w-2.5" /> Setup
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Actions - 3 Big Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-1.5 border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all group"
          onClick={() => setLocation("/generator")}
        >
          <Zap className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-sm">Content erstellen</span>
          <span className="text-[10px] text-muted-foreground">Text + Bild + Video</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-1.5 border-yellow-500/30 hover:border-yellow-500/60 hover:bg-yellow-500/5 transition-all group relative"
          onClick={() => setLocation("/approval")}
        >
          <CheckCircle className="h-6 w-6 text-yellow-400 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-sm">Freigeben</span>
          <span className="text-[10px] text-muted-foreground">Prüfen & genehmigen</span>
          {(stats?.pending ?? 0) > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 text-[10px] px-1.5 animate-pulse">
              {stats?.pending}
            </Badge>
          )}
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-1.5 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-all group"
          onClick={() => setLocation("/library")}
        >
          <Library className="h-6 w-6 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-sm">Bibliothek</span>
          <span className="text-[10px] text-muted-foreground">Fertige Posts kopieren</span>
        </Button>
      </div>

      {/* Stats Row - Compact */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: "Ausstehend", value: stats?.pending ?? 0, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
          { label: "Genehmigt", value: stats?.approved ?? 0, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Geplant", value: stats?.scheduled ?? 0, icon: Send, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Live", value: stats?.published ?? 0, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
          { label: "Abgelehnt", value: stats?.rejected ?? 0, icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
          { label: "Gesamt", value: stats?.total ?? 0, icon: FileText, color: "text-foreground", bg: "bg-foreground/10" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/40">
            <CardContent className="p-2.5">
              {statsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                    <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold leading-none">{stat.value}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{stat.label}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Pending Posts for Admin */}
          {pendingPosts && pendingPosts.length > 0 && (
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                    Warten auf Freigabe ({pendingPosts.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => setLocation("/approval")} className="gap-1.5 h-7 text-xs">
                    <CheckCircle className="h-3 w-3" />
                    Freigeben
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2">
                  {pendingPosts.slice(0, 3).map((item) => (
                    <div
                      key={item.post.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-yellow-500/5 border border-yellow-500/10 cursor-pointer hover:bg-yellow-500/10 transition-colors"
                      onClick={() => setLocation("/approval")}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Badge variant="outline" className="text-[9px] h-4">{item.post.contentType}</Badge>
                          {item.post.pillar && <Badge variant="secondary" className="text-[9px] h-4">{item.post.pillar}</Badge>}
                          {item.post.mediaUrl && <Image className="h-3 w-3 text-emerald-400" />}
                          {item.post.videoUrl && <Video className="h-3 w-3 text-violet-400" />}
                          {!item.post.mediaUrl && !item.post.videoUrl && (
                            <span className="text-[9px] text-amber-400">Kein Bild/Video</span>
                          )}
                        </div>
                        <p className="text-xs truncate">{(item.post.editedContent || item.post.content).substring(0, 80)}...</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {item.createdBy?.name || "Unbekannt"} · {new Date(item.post.createdAt).toLocaleDateString("de-DE")}
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approved - Ready to Post */}
          {approvedPosts && approvedPosts.length > 0 && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    Bereit zum Posten ({approvedPosts.length})
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setLocation("/library")} className="gap-1.5 h-7 text-xs">
                    <Library className="h-3 w-3" /> Bibliothek
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2">
                  {approvedPosts.slice(0, 3).map((item) => (
                    <div key={item.post.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate">{(item.post.editedContent || item.post.content).substring(0, 80)}...</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {(item.post.platforms as string[])?.map(p => (
                            <span key={p} className={`text-[9px] px-1.5 py-0.5 rounded ${PLATFORM_COLORS[p] || "bg-accent text-accent-foreground"}`}>
                              {p}
                            </span>
                          ))}
                          {item.post.mediaUrl && <Image className="h-3 w-3 text-emerald-400" />}
                          {item.post.videoUrl && <Video className="h-3 w-3 text-violet-400" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="border-border/40">
            <CardHeader className="flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Letzte Aktivität</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setLocation("/queue")}>
                Alle anzeigen
              </Button>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {postsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : recentPosts && recentPosts.length > 0 ? (
                <div className="space-y-1.5">
                  {recentPosts.slice(0, 5).map((item) => (
                    <div key={item.post.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate">{(item.post.editedContent || item.post.content).substring(0, 60)}...</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {item.post.contentType} · {item.createdBy?.name || "Unbekannt"}
                        </p>
                      </div>
                      <StatusBadge status={item.post.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  <p>Noch keine Posts. Starte mit dem Generator!</p>
                  <Button size="sm" className="mt-3 gap-1.5" onClick={() => setLocation("/generator")}>
                    <Zap className="h-3.5 w-3.5" /> Jetzt starten
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Links & Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Intelligence Quick Links */}
          <Card className="border-border/40">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-auto py-3 flex-col gap-1 text-[10px] border-border/40" onClick={() => setLocation("/trends")}>
                <Flame className="h-4 w-4 text-amber-400" />
                Trend-Scanner
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1 text-[10px] border-border/40" onClick={() => setLocation("/creator-spy")}>
                <Eye className="h-4 w-4 text-violet-400" />
                Creator Spy
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1 text-[10px] border-border/40" onClick={() => setLocation("/lifestyle")}>
                <Rocket className="h-4 w-4 text-cyan-400" />
                Lifestyle-Engine
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1 text-[10px] border-border/40" onClick={() => setLocation("/monthly-plan")}>
                <FileText className="h-4 w-4 text-blue-400" />
                Monatsplan
              </Button>
            </CardContent>
          </Card>

          {/* How It Works - For Team Members */}
          {(
            <Card className="border-primary/20">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-primary" />
                  So funktioniert's
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="space-y-2">
                  {[
                    { step: "1", text: "Content erstellen (Text + Bild + Video)", color: "bg-primary/20 text-primary" },
                    { step: "2", text: "Content selbst freigeben oder bearbeiten", color: "bg-yellow-500/20 text-yellow-400" },
                    { step: "3", text: "Freigegebene Posts in Bibliothek speichern oder via Blotato posten", color: "bg-emerald-500/20 text-emerald-400" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-full ${item.color} flex items-center justify-center text-xs font-bold shrink-0`}>
                        {item.step}
                      </div>
                      <p className="text-xs">{item.text}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Kein Blotato nötig! Kopiere fertige Posts aus der Bibliothek und poste manuell.
                </p>
              </CardContent>
            </Card>
          )}

          {/* System Status - Minimal */}
          <Card className="border-border/40">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-medium mb-2">System</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">GoViralBitch API</span>
                  <Badge variant={apiHealth?.status === "online" ? "default" : "destructive"} className="text-[8px] h-4">
                    {apiHealth?.status === "online" ? "Online" : "Offline"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Blotato Auto-Post</span>
                  <Badge variant={userSettings?.hasBlotatoKey ? "default" : "outline"} className="text-[8px] h-4">
                    {userSettings?.hasBlotatoKey ? "Bereit" : "Nicht eingerichtet"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">KI-Bild & Video</span>
                  <Badge variant="default" className="text-[8px] h-4">Verfügbar</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "Ausstehend", variant: "outline" },
    approved: { label: "Genehmigt", variant: "default" },
    rejected: { label: "Abgelehnt", variant: "destructive" },
    scheduled: { label: "Geplant", variant: "secondary" },
    published: { label: "Live", variant: "default" },
  };
  const c = config[status] || { label: status, variant: "outline" as const };
  return <Badge variant={c.variant} className="text-[9px] shrink-0">{c.label}</Badge>;
}
