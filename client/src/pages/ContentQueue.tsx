import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContentCard } from "@/components/ContentCard";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useState } from "react";
import {
  FileText, Clock, CheckCircle, XCircle, Send, TrendingUp,
  ArrowRight, Zap,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "Alle Status" },
  { value: "pending", label: "Ausstehend" },
  { value: "approved", label: "Genehmigt" },
  { value: "rejected", label: "Abgelehnt" },
  { value: "scheduled", label: "Geplant" },
  { value: "published", label: "Veröffentlicht" },
];

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string; nextAction?: string; nextRoute?: string }> = {
  pending: { label: "Ausstehend", icon: Clock, color: "text-yellow-400", bgColor: "bg-yellow-500/10 border-yellow-500/20", nextAction: "Zur Freigabe", nextRoute: "/approval" },
  approved: { label: "Genehmigt", icon: CheckCircle, color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20", nextAction: "Veröffentlichen", nextRoute: "/approval" },
  rejected: { label: "Abgelehnt", icon: XCircle, color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20" },
  scheduled: { label: "Geplant", icon: Send, color: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/20" },
  published: { label: "Live", icon: TrendingUp, color: "text-purple-400", bgColor: "bg-purple-500/10 border-purple-500/20" },
};

export default function ContentQueue() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: posts, isLoading } = trpc.content.list.useQuery(
    statusFilter === "all" ? { limit: 50 } : { status: statusFilter, limit: 50 }
  );
  const { data: stats } = trpc.dashboard.stats.useQuery();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-[Montserrat]">Content Queue</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Alle Posts im Überblick — vom Entwurf bis zum Posting
          </p>
        </div>
        <Button
          onClick={() => setLocation("/generator")}
          className="gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold shadow-lg shadow-amber-500/20"
          size="sm"
        >
          <Zap className="h-3.5 w-3.5" />
          Neuer Post
        </Button>
      </div>

      {/* Quick Status Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { key: "all", label: "Alle", count: stats?.total ?? 0 },
          { key: "pending", label: "Ausstehend", count: stats?.pending ?? 0, color: "text-yellow-400", border: "border-yellow-500/30" },
          { key: "approved", label: "Genehmigt", count: stats?.approved ?? 0, color: "text-emerald-400", border: "border-emerald-500/30" },
          { key: "scheduled", label: "Geplant", count: stats?.scheduled ?? 0, color: "text-amber-400", border: "border-amber-500/30" },
          { key: "published", label: "Live", count: stats?.published ?? 0, color: "text-purple-400", border: "border-purple-500/30" },
          { key: "rejected", label: "Abgelehnt", count: stats?.rejected ?? 0, color: "text-red-400", border: "border-red-500/30" },
        ].map(s => (
          <Button
            key={s.key}
            variant={statusFilter === s.key ? "default" : "outline"}
            size="sm"
            className={`gap-1.5 shrink-0 ${statusFilter === s.key ? "bg-amber-500 text-black hover:bg-amber-600" : s.border || ""}`}
            onClick={() => setStatusFilter(s.key)}
          >
            <span className={statusFilter === s.key ? "text-black font-bold" : s.color}>{s.count}</span>
            <span className="text-xs">{s.label}</span>
          </Button>
        ))}
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-96 w-full rounded-xl" />)}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((item) => {
            const sc = STATUS_CONFIG[item.post.status] || STATUS_CONFIG.pending;
            const StatusIcon = sc.icon;
            return (
              <ContentCard
                key={item.post.id}
                post={{
                  ...item.post,
                  platforms: item.post.platforms as string[],
                }}
                createdBy={item.createdBy}
              >
                {/* Status Badge + Action */}
                <div className="flex items-center justify-between pt-2 border-t border-amber-500/10">
                  <Badge className={`gap-1.5 ${sc.bgColor} border`}>
                    <StatusIcon className={`h-3 w-3 ${sc.color}`} />
                    <span className={sc.color}>{sc.label}</span>
                  </Badge>
                  {sc.nextAction && sc.nextRoute && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-xs h-7 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                      onClick={() => setLocation(sc.nextRoute!)}
                    >
                      {sc.nextAction}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </ContentCard>
            );
          })}
        </div>
      ) : (
        <Card className="border-amber-500/10">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-amber-500/30 mb-4" />
            <p className="text-muted-foreground mb-4">
              {statusFilter === "all" ? "Noch keine Posts erstellt." : `Keine Posts mit Status "${STATUS_OPTIONS.find(o => o.value === statusFilter)?.label}".`}
            </p>
            <Button
              onClick={() => setLocation("/generator")}
              className="gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold"
            >
              <Zap className="h-4 w-4" />
              Ersten Post erstellen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
