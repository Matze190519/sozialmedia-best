import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, Clock, AlertTriangle, Globe, ExternalLink } from "lucide-react";

const platformIcons: Record<string, string> = {
  instagram: "📸", facebook: "📘", tiktok: "🎵", linkedin: "💼",
  twitter: "🐦", threads: "🧵", youtube: "🎬", pinterest: "📌", bluesky: "🦋",
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  published: { label: "Veröffentlicht", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
  scheduled: { label: "Geplant", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Clock },
  draft: { label: "Entwurf", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  error: { label: "Fehler", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertTriangle },
  not_found: { label: "Nicht gefunden", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: AlertTriangle },
};

export function PostTrackingPanel({ contentPostId }: { contentPostId: number }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data, isLoading, refetch } = trpc.postTracking.getStatus.useQuery({ contentPostId });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Status wird geladen...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.tracked) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            Noch nicht über Blotato veröffentlicht
          </div>
        </CardContent>
      </Card>
    );
  }

  const publishedCount = data.schedules.filter((s: any) => s.status === "published").length;
  const scheduledCount = data.schedules.filter((s: any) => s.status === "scheduled").length;
  const errorCount = data.schedules.filter((s: any) => s.status === "error" || s.status === "not_found").length;

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Post-Status ({data.total} Plattformen)
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
        {/* Summary badges */}
        <div className="flex gap-2 flex-wrap">
          {publishedCount > 0 && (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
              {publishedCount} veröffentlicht
            </Badge>
          )}
          {scheduledCount > 0 && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
              {scheduledCount} geplant
            </Badge>
          )}
          {errorCount > 0 && (
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">
              {errorCount} Fehler
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {data.schedules.map((schedule: any) => {
            const config = statusConfig[schedule.status] || statusConfig.error;
            const Icon = config.icon;
            return (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border/30"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base flex-shrink-0">
                    {platformIcons[schedule.platform?.toLowerCase()] || "🌐"}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">
                      {schedule.platform || "Unbekannt"}
                    </div>
                    {schedule.accountName && (
                      <div className="text-[10px] text-muted-foreground truncate">
                        @{schedule.accountName}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {schedule.scheduledAt && (
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(schedule.scheduledAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                  <Badge variant="outline" className={`${config.color} text-[10px] py-0 px-1.5`}>
                    <Icon className="h-2.5 w-2.5 mr-0.5" />
                    {config.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
