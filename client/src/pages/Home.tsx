import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import {
  FileText, CheckCircle, XCircle, Clock, Send,
  Zap, Eye, TrendingUp, ArrowRight, Rocket,
  CalendarClock, Image, Video, Package, AlertCircle,
  Flame, Target, Car, Briefcase, Heart, Bot,
  ShieldCheck, Sparkles,
} from "lucide-react";

// Agent Brain Content Mix - 14 Posts/Woche
const CONTENT_MIX = [
  { pillar: "Autokonzept", emoji: Car, perWeek: 3, color: "text-amber-400", bg: "bg-amber-400/10", type: "lifestyle" },
  { pillar: "Business", emoji: Briefcase, perWeek: 4, color: "text-blue-400", bg: "bg-blue-400/10", type: "lifestyle" },
  { pillar: "Gesundheit", emoji: Heart, perWeek: 2, color: "text-emerald-400", bg: "bg-emerald-400/10", type: "product" },
  { pillar: "Lifestyle", emoji: Sparkles, perWeek: 3, color: "text-purple-400", bg: "bg-purple-400/10", type: "lifestyle" },
  { pillar: "Lina / KI", emoji: Bot, perWeek: 2, color: "text-cyan-400", bg: "bg-cyan-400/10", type: "lifestyle" },
];

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
  const { data: approvedPosts } = trpc.content.list.useQuery({ status: "approved", limit: 5 });
  const { data: scheduledPosts } = trpc.content.list.useQuery({ status: "scheduled", limit: 5 });
  const { data: recentPosts, isLoading: postsLoading } = trpc.content.list.useQuery({ limit: 8 });
  const { data: userSettings } = trpc.userSettings.get.useQuery();

  const totalPerWeek = CONTENT_MIX.reduce((sum, c) => sum + c.perWeek, 0);
  const lifestylePercent = Math.round(CONTENT_MIX.filter(c => c.type === "lifestyle").reduce((s, c) => s + c.perWeek, 0) / totalPerWeek * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hey {user?.name?.split(" ")[0] || "Team"} <span className="text-primary">!</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Deine Content-Maschine - Erstellen, Freigeben, Posten.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={apiHealth?.status === "online" ? "default" : "destructive"} className="gap-1.5">
            <span className={`h-2 w-2 rounded-full ${apiHealth?.status === "online" ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            {apiHealth?.status === "online" ? "System Online" : "System Offline"}
          </Badge>
          {userSettings?.hasBlotatoKey ? (
            <Badge variant="outline" className="gap-1.5 text-emerald-400 border-emerald-500/30">
              <Send className="h-2.5 w-2.5" /> Auto-Post {userSettings.autoPostEnabled ? "aktiv" : "bereit"}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 text-amber-400 border-amber-500/30 cursor-pointer" onClick={() => setLocation("/settings")}>
              <AlertCircle className="h-2.5 w-2.5" /> Blotato einrichten
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Workflow - 3 Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="h-auto py-5 flex-col gap-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all group"
          onClick={() => setLocation("/generator")}
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <span className="font-semibold text-sm">1. Content erstellen</span>
          <span className="text-[10px] text-muted-foreground">Text + Bild + Video generieren</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-5 flex-col gap-2 border-yellow-500/30 hover:border-yellow-500/60 hover:bg-yellow-500/5 transition-all group relative"
          onClick={() => setLocation("/approval")}
        >
          <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <span className="font-semibold text-sm">2. Freigeben</span>
          <span className="text-[10px] text-muted-foreground">Prüfen & genehmigen</span>
          {(stats?.pending ?? 0) > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 text-[10px] px-1.5 animate-pulse">
              {stats?.pending}
            </Badge>
          )}
        </Button>
        <Button
          variant="outline"
          className="h-auto py-5 flex-col gap-2 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-all group"
          onClick={() => setLocation("/calendar")}
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Rocket className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="font-semibold text-sm">3. Posten</span>
          <span className="text-[10px] text-muted-foreground">Automatisch via Blotato</span>
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: "Ausstehend", value: stats?.pending ?? 0, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
          { label: "Genehmigt", value: stats?.approved ?? 0, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Geplant", value: stats?.scheduled ?? 0, icon: Send, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Live", value: stats?.published ?? 0, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
          { label: "Abgelehnt", value: stats?.rejected ?? 0, icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
          { label: "Gesamt", value: stats?.total ?? 0, icon: FileText, color: "text-foreground", bg: "bg-foreground/10" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-3">
              {statsLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                    <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold leading-none">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{stat.label}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Action Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Pending Posts for Admin */}
          {isAdmin && pendingPosts && pendingPosts.length > 0 && (
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    Warten auf Freigabe ({pendingPosts.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => setLocation("/approval")} className="gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Jetzt freigeben
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pendingPosts.slice(0, 3).map((item) => (
                    <div key={item.post.id} className="flex items-center justify-between p-2.5 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Badge variant="outline" className="text-[9px]">{item.post.contentType}</Badge>
                          {item.post.pillar && <Badge variant="secondary" className="text-[9px]">{item.post.pillar}</Badge>}
                          {item.post.mediaUrl && <Image className="h-3 w-3 text-muted-foreground" />}
                          {item.post.videoUrl && <Video className="h-3 w-3 text-muted-foreground" />}
                        </div>
                        <p className="text-sm truncate">{(item.post.editedContent || item.post.content).substring(0, 80)}...</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          von {item.createdBy?.name || "Unbekannt"} - {new Date(item.post.createdAt).toLocaleDateString("de-DE")}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scheduled Posts - Next Up */}
          {scheduledPosts && scheduledPosts.length > 0 && (
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarClock className="h-5 w-5 text-blue-400" />
                    Nächste Posts ({scheduledPosts.length})
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setLocation("/calendar")} className="gap-1.5">
                    Kalender
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scheduledPosts.slice(0, 3).map((item) => (
                    <div key={item.post.id} className="flex items-center justify-between p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{(item.post.editedContent || item.post.content).substring(0, 80)}...</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {(item.post.platforms as string[])?.map(p => (
                            <span key={p} className={`text-[9px] px-1.5 py-0.5 rounded ${PLATFORM_COLORS[p] || "bg-accent text-accent-foreground"}`}>
                              {p}
                            </span>
                          ))}
                          {item.post.scheduledAt && (
                            <span className="text-[9px] text-muted-foreground ml-auto">
                              {new Date(item.post.scheduledAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approved - Ready to Publish */}
          {isAdmin && approvedPosts && approvedPosts.length > 0 && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    Bereit zum Posten ({approvedPosts.length})
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setLocation("/approval")} className="gap-1.5">
                    <Send className="h-3.5 w-3.5" /> Veröffentlichen
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {approvedPosts.slice(0, 3).map((item) => (
                    <div key={item.post.id} className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{(item.post.editedContent || item.post.content).substring(0, 80)}...</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {(item.post.platforms as string[])?.map(p => (
                            <span key={p} className={`text-[9px] px-1.5 py-0.5 rounded ${PLATFORM_COLORS[p] || "bg-accent text-accent-foreground"}`}>
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="border-border/50">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Letzte Aktivität</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/queue")}>
                Alle anzeigen
              </Button>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : recentPosts && recentPosts.length > 0 ? (
                <div className="space-y-2">
                  {recentPosts.slice(0, 5).map((item) => (
                    <div key={item.post.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{(item.post.editedContent || item.post.content).substring(0, 60)}...</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {item.post.contentType} - {item.createdBy?.name || "Unbekannt"}
                        </p>
                      </div>
                      <StatusBadge status={item.post.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Noch keine Posts erstellt. Starte mit dem Generator!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Content Strategy */}
        <div className="space-y-4">
          {/* Content Mix Autopilot */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Content-Mix (14/Woche)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500" style={{ width: `${lifestylePercent}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{lifestylePercent}% Lifestyle</span>
              </div>
              {CONTENT_MIX.map((item) => (
                <div key={item.pillar} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded ${item.bg} flex items-center justify-center`}>
                      <item.emoji className={`h-3 w-3 ${item.color}`} />
                    </div>
                    <span className="text-xs">{item.pillar}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium">{item.perWeek}x</span>
                    <Badge variant="outline" className="text-[8px] px-1">{item.type === "lifestyle" ? "Lifestyle" : "Produkt"}</Badge>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-border/50">
                <p className="text-[10px] text-muted-foreground">
                  <strong>{lifestylePercent}% Lifestyle</strong> (Freiheit, Autos, Erfolg) zieht Leads an.
                  <strong> {100 - lifestylePercent}% Produkt</strong> (Aloe Vera, Gesundheit) konvertiert.
                </p>
              </div>
              <Button size="sm" className="w-full gap-1.5" onClick={() => setLocation("/generator")}>
                <Zap className="h-3.5 w-3.5" /> Content erstellen
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Schnellzugriff</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-[10px]" onClick={() => setLocation("/creator-spy")}>
                <Eye className="h-4 w-4 text-violet-400" />
                Creator Spy
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-[10px]" onClick={() => setLocation("/products")}>
                <Package className="h-4 w-4 text-orange-400" />
                Produktbilder
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-[10px]" onClick={() => setLocation("/library")}>
                <Flame className="h-4 w-4 text-amber-400" />
                Bibliothek
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-[10px]" onClick={() => setLocation("/settings")}>
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                Setup
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-medium">System-Status</p>
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
                    {userSettings?.hasBlotatoKey ? (userSettings.autoPostEnabled ? "Aktiv" : "Bereit") : "Nicht eingerichtet"}
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
  return <Badge variant={c.variant} className="text-[10px] shrink-0">{c.label}</Badge>;
}
