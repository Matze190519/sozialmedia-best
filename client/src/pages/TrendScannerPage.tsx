import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Loader2, Zap, TrendingUp, Play, Eye, Heart, MessageCircle, Share2,
  Sparkles, RefreshCw, ExternalLink, Lightbulb, Flame, Target, Rocket
} from "lucide-react";
import { useLocation } from "wouter";

const PLATFORM_ICONS: Record<string, string> = {
  tiktok: "🎵",
  youtube: "📺",
  reddit: "💬",
  twitter: "🐦",
};

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  youtube: "bg-red-500/10 text-red-400 border-red-500/30",
  reddit: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  twitter: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

function ViralScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "bg-red-500/20 text-red-400 border-red-500/40"
    : score >= 40 ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
  const icon = score >= 70 ? <Flame className="h-3 w-3" /> : score >= 40 ? <TrendingUp className="h-3 w-3" /> : <Zap className="h-3 w-3" />;
  return (
    <Badge variant="outline" className={`gap-1 ${color}`}>
      {icon} {score}
    </Badge>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function TrendScannerPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("trends");
  const [platformFilter, setPlatformFilter] = useState<string | undefined>();
  const [pillarFilter, setPillarFilter] = useState<string | undefined>();

  const pillarsQuery = trpc.trends.pillars.useQuery();
  const topTrendsQuery = trpc.trends.top.useQuery({ hours: 48, limit: 50 });
  const latestQuery = trpc.trends.latest.useQuery({ platform: platformFilter, pillar: pillarFilter, limit: 50 });

  const scanMut = trpc.trends.scan.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.scanned} Trends gescannt!`);
      topTrendsQuery.refetch();
      latestQuery.refetch();
    },
    onError: (err) => toast.error(`Scan fehlgeschlagen: ${err.message}`),
  });

  const scanPillarMut = trpc.trends.scanPillar.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.scanned} Trends für Pillar gescannt!`);
      topTrendsQuery.refetch();
      latestQuery.refetch();
    },
    onError: (err) => toast.error(`Pillar-Scan fehlgeschlagen: ${err.message}`),
  });

  const generateIdeasMut = trpc.trends.generateIdeas.useMutation({
    onSuccess: () => toast.success("Content-Ideen generiert!"),
    onError: (err) => toast.error(`Ideen-Generierung fehlgeschlagen: ${err.message}`),
  });

  const trends = activeTab === "trends" ? (topTrendsQuery.data || []) : (latestQuery.data || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-400" />
            Trend-Scanner
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live virale Trends von TikTok, YouTube & Reddit - automatisch Content-Ideen generieren
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => generateIdeasMut.mutate()}
            disabled={generateIdeasMut.isPending || (topTrendsQuery.data?.length || 0) === 0}
            variant="outline"
            className="gap-2"
          >
            {generateIdeasMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4 text-yellow-400" />}
            KI-Ideen generieren
          </Button>
          <Button
            onClick={() => scanMut.mutate()}
            disabled={scanMut.isPending}
            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {scanMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {scanMut.isPending ? "Scannt alle Plattformen..." : "Jetzt scannen"}
          </Button>
        </div>
      </div>

      {/* Pillar Quick-Scan Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {pillarsQuery.data?.map((p) => (
          <Card
            key={p.key}
            className="cursor-pointer hover:border-primary/50 transition-colors border-border/50"
            onClick={() => scanPillarMut.mutate({ pillar: p.key })}
          >
            <CardContent className="p-3 text-center">
              <div className="text-2xl mb-1">{p.emoji}</div>
              <div className="text-xs font-medium">{p.name}</div>
              <div className="text-[10px] text-muted-foreground">{p.frequency}</div>
              {scanPillarMut.isPending && scanPillarMut.variables?.pillar === p.key && (
                <Loader2 className="h-3 w-3 animate-spin mx-auto mt-1 text-primary" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Generated Ideas */}
      {generateIdeasMut.data?.ideas && generateIdeasMut.data.ideas.length > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              KI-generierte Content-Ideen (basierend auf aktuellen Trends)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generateIdeasMut.data.ideas.map((idea, i) => (
                <div key={i} className="bg-background/50 rounded-lg p-4 border border-border/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-[10px]">
                          <Target className="h-2.5 w-2.5 mr-1" />
                          {idea.pillar}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          Inspiriert von: {idea.trendTitle.slice(0, 60)}...
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-primary mb-1">
                        „{idea.hook}"
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {idea.contentIdea}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 text-xs gap-1"
                      onClick={() => {
                        // Navigate to generator with pre-filled data from trend idea
                        const params = new URLSearchParams({
                          topic: idea.hook || idea.contentIdea,
                          pillar: idea.pillar || "Lifestyle & Erfolg",
                          source: "trend",
                        });
                        navigate(`/generator?${params.toString()}`);
                      }}
                    >
                      <Play className="h-3 w-3" /> Content erstellen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs: Top Trends / Alle Trends */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="trends" className="gap-1.5">
              <Flame className="h-3.5 w-3.5" /> Top Trends
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Alle Scans
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant={!platformFilter ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setPlatformFilter(undefined)}
            >
              Alle
            </Badge>
            {["tiktok", "youtube", "reddit"].map((p) => (
              <Badge
                key={p}
                variant={platformFilter === p ? "default" : "outline"}
                className={`cursor-pointer text-xs ${platformFilter !== p ? PLATFORM_COLORS[p] : ""}`}
                onClick={() => setPlatformFilter(platformFilter === p ? undefined : p)}
              >
                {PLATFORM_ICONS[p]} {p}
              </Badge>
            ))}
            <span className="text-muted-foreground text-xs">|</span>
            <Badge
              variant={!pillarFilter ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setPillarFilter(undefined)}
            >
              Alle Pillars
            </Badge>
            {pillarsQuery.data?.map((p) => (
              <Badge
                key={p.key}
                variant={pillarFilter === p.key ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setPillarFilter(pillarFilter === p.key ? undefined : p.key)}
              >
                {p.emoji} {p.name}
              </Badge>
            ))}
          </div>
        </div>

        <TabsContent value="trends" className="mt-4">
          <TrendGrid trends={trends} isLoading={topTrendsQuery.isLoading} />
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          <TrendGrid trends={trends} isLoading={latestQuery.isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TrendGrid({ trends, isLoading }: { trends: any[]; isLoading: boolean }) {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const autopilotMut = trpc.trends.autopilot.useMutation({
    onSuccess: (data) => {
      const parts = [];
      if (data.imageUrl) parts.push("Bild");
      if (data.videoUrl) parts.push("Video");
      if (data.hashtags?.length) parts.push(`${data.hashtags.length} Hashtags`);
      const mediaInfo = parts.length > 0 ? ` + ${parts.join(" + ")}` : "";
      toast.success(`Autopilot: Content${mediaInfo} erstellt! Post #${data.postId} wartet auf Freigabe.`, { duration: 6000 });
      navigate("/approval");
    },
    onError: (err) => toast.error(`Autopilot fehlgeschlagen: ${err.message}`),
  });
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <Zap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">Noch keine Trends gescannt</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Klicke auf "Jetzt scannen" um TikTok, YouTube und Reddit nach viralen Trends zu durchsuchen.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {trends.map((trend: any) => (
        <Card key={trend.id} className="border-border/40 hover:border-border/70 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Thumbnail */}
              {trend.thumbnailUrl && (
                <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-accent/30">
                  <img src={trend.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="outline" className={`text-[10px] ${PLATFORM_COLORS[trend.platform] || ""}`}>
                    {PLATFORM_ICONS[trend.platform] || "📌"} {trend.platform}
                  </Badge>
                  <ViralScoreBadge score={trend.viralScore || 0} />
                  {trend.pillar && (
                    <Badge variant="outline" className="text-[10px]">
                      {trend.pillar}
                    </Badge>
                  )}
                </div>

                <h3 className="text-sm font-medium line-clamp-2 mb-2">
                  {trend.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {trend.authorName && (
                    <span>@{trend.authorName}</span>
                  )}
                  {(trend.views || 0) > 0 && (
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {formatNumber(trend.views)}
                    </span>
                  )}
                  {(trend.likes || 0) > 0 && (
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {formatNumber(trend.likes)}
                    </span>
                  )}
                  {(trend.comments || 0) > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> {formatNumber(trend.comments)}
                    </span>
                  )}
                  {(trend.shares || 0) > 0 && (
                    <span className="flex items-center gap-1">
                      <Share2 className="h-3 w-3" /> {formatNumber(trend.shares)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex flex-col gap-2">
                <Button
                  size="sm"
                  className="gap-1.5 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  disabled={autopilotMut.isPending && autopilotMut.variables?.trendId === trend.id}
                  onClick={() => autopilotMut.mutate({
                    trendId: trend.id,
                    trendTitle: trend.title,
                    trendPlatform: trend.platform,
                    trendPillar: trend.pillar || "lifestyle",
                    trendViralScore: trend.viralScore,
                    trendSourceUrl: trend.sourceUrl,
                    generateImage: true,
                  })}
                >
                  {autopilotMut.isPending && autopilotMut.variables?.trendId === trend.id
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <Rocket className="h-3 w-3" />}
                  Autopilot
                </Button>
                {trend.sourceUrl && (
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => window.open(trend.sourceUrl, "_blank")}>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Content Idea */}
            {trend.contentIdea && (
              <div className="mt-3 bg-primary/5 rounded-lg p-3 border border-primary/10">
                <div className="flex items-center gap-1.5 mb-1">
                  <Lightbulb className="h-3 w-3 text-yellow-400" />
                  <span className="text-[10px] font-medium text-primary">Content-Idee</span>
                </div>
                <p className="text-xs text-muted-foreground">{trend.contentIdea}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
