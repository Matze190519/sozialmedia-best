import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, ThumbsUp, MessageCircle, Share2, Eye, TrendingUp } from "lucide-react";
import { useMemo } from "react";

export default function AnalyticsPage() {
  const { data: platformData, isLoading } = trpc.analytics.summary.useQuery();

  const totals = useMemo(() => {
    if (!platformData || platformData.length === 0) return null;
    return {
      likes: platformData.reduce((s, p) => s + (p.totalLikes || 0), 0),
      comments: platformData.reduce((s, p) => s + (p.totalComments || 0), 0),
      shares: platformData.reduce((s, p) => s + (p.totalShares || 0), 0),
      impressions: platformData.reduce((s, p) => s + (p.totalImpressions || 0), 0),
    };
  }, [platformData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-emerald-400" />
          Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Performance-Daten deiner veröffentlichten Posts
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : totals ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <ThumbsUp className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.likes.toLocaleString("de-DE")}</p>
                    <p className="text-xs text-muted-foreground">Likes gesamt</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.comments.toLocaleString("de-DE")}</p>
                    <p className="text-xs text-muted-foreground">Kommentare</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Share2 className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.shares.toLocaleString("de-DE")}</p>
                    <p className="text-xs text-muted-foreground">Shares</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.impressions.toLocaleString("de-DE")}</p>
                    <p className="text-xs text-muted-foreground">Impressions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Performance nach Plattform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {platformData!.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                    <Badge variant="outline">{p.platform}</Badge>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {p.totalLikes}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {p.totalComments}</span>
                      <span className="flex items-center gap-1"><Share2 className="h-3 w-3" /> {p.totalShares}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-border/50">
          <CardContent className="py-16 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Noch keine Analytics-Daten vorhanden.</p>
            <p className="text-sm text-muted-foreground mt-2">Veröffentliche Posts über Blotato um Performance-Daten zu sammeln.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
