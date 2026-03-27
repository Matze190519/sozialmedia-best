import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Eye, TrendingUp, Zap, Loader2, Lightbulb, AlertTriangle, Sparkles } from "lucide-react";
import { Streamdown } from "streamdown";

export default function CreatorSpyPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const { data: latestReport, isLoading } = trpc.creatorSpy.latest.useQuery();
  const { data: allReports } = trpc.creatorSpy.reports.useQuery({ limit: 5 });

  const analyzeMut = trpc.creatorSpy.analyze.useMutation({
    onSuccess: () => {
      utils.creatorSpy.latest.invalidate();
      utils.creatorSpy.reports.invalidate();
      toast.success("Creator Spy Report erstellt!");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Eye className="h-6 w-6 text-blue-400" />
            Creator Spy
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Virale Posts aus deiner Nische analysieren, Hooks extrahieren, Trends erkennen
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => analyzeMut.mutate({})}
            disabled={analyzeMut.isPending}
            className="gap-2"
          >
            {analyzeMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Neuen Report erstellen
          </Button>
        )}
      </div>

      {/* Quick Stats from latest report */}
      {latestReport && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(latestReport.topHooks as string[])?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Top Hooks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(latestReport.contentIdeas as string[])?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Nachmach-Ideen</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">KW {latestReport.weekNumber}/{latestReport.year}</p>
                  <p className="text-xs text-muted-foreground">Letzter Report</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Hooks */}
      {latestReport?.topHooks && (latestReport.topHooks as string[]).length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              Top Hooks der Woche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(latestReport.topHooks as string[]).map((hook, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-accent/30 rounded-lg">
                <Badge variant="outline" className="shrink-0 mt-0.5">#{i + 1}</Badge>
                <p className="text-sm">{hook}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Content Ideas */}
      {latestReport?.contentIdeas && (latestReport.contentIdeas as string[]).length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-emerald-400" />
              Nachmach-Ideen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(latestReport.contentIdeas as string[]).map((idea, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-accent/30 rounded-lg">
                <Badge variant="default" className="shrink-0 mt-0.5">{i + 1}</Badge>
                <p className="text-sm">{idea}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Full Report */}
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : latestReport ? (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Vollständiger Report - KW {latestReport.weekNumber}/{latestReport.year}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert prose-sm max-w-none">
              <Streamdown>{latestReport.reportContent}</Streamdown>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50">
          <CardContent className="py-16 text-center">
            <Eye className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Noch kein Creator Spy Report vorhanden.</p>
            {isAdmin && <p className="text-sm text-muted-foreground mt-2">Klicke auf "Neuen Report erstellen" um die Analyse zu starten.</p>}
          </CardContent>
        </Card>
      )}

      {/* Previous Reports */}
      {allReports && allReports.length > 1 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Frühere Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allReports.slice(1).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium">KW {report.weekNumber}/{report.year}</p>
                  <p className="text-xs text-muted-foreground">
                    {(report.topHooks as string[])?.length || 0} Hooks, {(report.contentIdeas as string[])?.length || 0} Ideen
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {new Date(report.createdAt).toLocaleDateString("de-DE")}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
