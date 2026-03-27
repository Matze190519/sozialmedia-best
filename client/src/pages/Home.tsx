import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import {
  FileText, CheckCircle, XCircle, Clock, Send,
  Zap, Eye, TrendingUp,
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: apiHealth } = trpc.apiHealth.goViralBitch.useQuery();
  const { data: recentPosts, isLoading: postsLoading } = trpc.content.list.useQuery({ limit: 5 });

  const statCards = [
    { label: "Ausstehend", value: stats?.pending ?? 0, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { label: "Genehmigt", value: stats?.approved ?? 0, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Abgelehnt", value: stats?.rejected ?? 0, icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
    { label: "Geplant", value: stats?.scheduled ?? 0, icon: Send, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Veröffentlicht", value: stats?.published ?? 0, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Gesamt", value: stats?.total ?? 0, icon: FileText, color: "text-foreground", bg: "bg-foreground/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Willkommen, {user?.name?.split(" ")[0] || "Team"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            LR Content Approval Dashboard - Kein Post ohne Freigabe
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={apiHealth?.status === "online" ? "default" : "destructive"} className="gap-1.5">
            <span className={`h-2 w-2 rounded-full ${apiHealth?.status === "online" ? "bg-emerald-400" : "bg-red-400"}`} />
            GoViralBitch {apiHealth?.status === "online" ? "Online" : "Offline"}
          </Badge>
          <Button onClick={() => setLocation("/generator")} className="gap-2">
            <Zap className="h-4 w-4" />
            Content erstellen
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-4">
              {statsLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex flex-col gap-2">
                  <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Schnellzugriff</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation("/generator")}>
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-xs">Content generieren</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation("/approval")}>
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span className="text-xs">Posts genehmigen</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation("/creator-spy")}>
              <Eye className="h-5 w-5 text-blue-400" />
              <span className="text-xs">Creator Spy</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation("/calendar")}>
              <Clock className="h-5 w-5 text-yellow-400" />
              <span className="text-xs">Kalender</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Neueste Posts</CardTitle>
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
                {recentPosts.map((item) => (
                  <div key={item.post.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.post.content.substring(0, 60)}...</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
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
