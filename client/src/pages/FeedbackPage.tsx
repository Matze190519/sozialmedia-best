import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  TrendingUp, Star, Flame, Lightbulb, ArrowUp, ArrowDown,
  BarChart3, Target, Zap, Clock, CheckCircle,
} from "lucide-react";

const SCORE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Flop", color: "text-red-400" },
  2: { label: "Schwach", color: "text-orange-400" },
  3: { label: "OK", color: "text-yellow-400" },
  4: { label: "Gut", color: "text-green-400" },
  5: { label: "Viral!", color: "text-primary" },
};

export default function FeedbackPage() {
  const [timeRange, setTimeRange] = useState("30");

  const { data: topPosts, isLoading: loadingTop } = trpc.feedback.topPerforming.useQuery({ limit: 10 });
  const { data: optimalTimes, isLoading: loadingTimes } = trpc.postingTimes.get.useQuery({});
  const { data: allPosts, isLoading: loadingAll, refetch } = trpc.content.list.useQuery({});
  const pendingFeedback = (allPosts || []).filter((p: any) => p.status === 'published' && !p.feedbackScore);

  const scoreMutation = trpc.feedback.updateScore.useMutation({
    onSuccess: () => { toast.success("Feedback gespeichert!"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feedback &amp; Learnings</h1>
          <p className="text-muted-foreground mt-1">
            Bewerte deine Posts, erkenne Muster und optimiere deinen Content.
          </p>
        </div>
      </div>

      {/* Pending Feedback */}
      {loadingAll ? (
        <Card className="border-amber-500/20">
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : pendingFeedback && pendingFeedback.length > 0 ? (
        <Card className="border-amber-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-base">Posts bewerten</CardTitle>
                <CardDescription>{pendingFeedback.length} Posts warten auf dein Feedback</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingFeedback.slice(0, 5).map((post: any) => (
              <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{post.title || `Post #${post.id}`}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{post.textContent}</p>
                  <div className="flex gap-1.5 mt-1">
                    {post.platform && <Badge variant="outline" className="text-[10px]">{post.platform}</Badge>}
                    {post.pillar && <Badge variant="outline" className="text-[10px]">{post.pillar}</Badge>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {[1, 2, 3, 4, 5].map(score => (
                    <button
                      key={score}
                      onClick={() => scoreMutation.mutate({ postId: post.id, feedbackScore: score, successFactors: [] })}
                      disabled={scoreMutation.isPending}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition-all hover:scale-110 ${
                        score <= 2 ? "bg-red-500/10 hover:bg-red-500/20 text-red-400" :
                        score === 3 ? "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400" :
                        score === 4 ? "bg-green-500/10 hover:bg-green-500/20 text-green-400" :
                        "bg-primary/10 hover:bg-primary/20 text-primary"
                      }`}
                      title={SCORE_LABELS[score]?.label}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-base">Kein offenes Feedback</CardTitle>
                <CardDescription>Aktuell gibt es keine veröffentlichten Posts, die noch bewertet werden müssen.</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Posts */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Top Posts</CardTitle>
                <CardDescription>Deine besten Posts nach Feedback-Score</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingTop ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}
              </div>
            ) : !topPosts || topPosts.length === 0 ? (
              <div className="text-center py-8">
                <Flame className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Noch keine bewerteten Posts</p>
              </div>
            ) : (
              <div className="space-y-2">
                {topPosts.map((post: any, idx: number) => (
                  <div key={post.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className={`text-lg font-bold w-6 text-center ${idx < 3 ? "text-primary" : "text-muted-foreground"}`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{post.title || `Post #${post.id}`}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {post.platform && <span className="text-[10px] text-muted-foreground capitalize">{post.platform}</span>}
                        {post.pillar && <span className="text-[10px] text-muted-foreground">{post.pillar}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span className={`text-sm font-bold ${SCORE_LABELS[post.feedbackScore]?.color || "text-foreground"}`}>
                        {post.feedbackScore}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Optimal Posting Times */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Beste Posting-Zeiten</CardTitle>
                <CardDescription>Basierend auf deinen Engagement-Daten</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingTimes ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
              </div>
            ) : !optimalTimes || optimalTimes.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Noch keine Daten. Poste mehr Content um Muster zu erkennen.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {optimalTimes.map((time: any) => (
                  <div key={time.id || time.platform} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">{time.platform}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold">{time.bestHour}:00 Uhr</p>
                        <p className="text-[10px] text-muted-foreground">{time.bestDay || "Alle Tage"}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-primary font-medium">{time.avgEngagement ? `${time.avgEngagement}%` : "-"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Learnings / Tips */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Content-Learnings</CardTitle>
              <CardDescription>Was bei deiner Zielgruppe funktioniert</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">Funktioniert gut</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>&bull; Pers&ouml;nliche Geschichten (Storytelling)</li>
                <li>&bull; Vorher/Nachher Ergebnisse</li>
                <li>&bull; Fragen als Hook</li>
                <li>&bull; Reels unter 30 Sekunden</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDown className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-500">Vermeiden</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>&bull; Reine Produkt-Werbung</li>
                <li>&bull; Zu lange Texte ohne Hook</li>
                <li>&bull; Generische Stock-Bilder</li>
                <li>&bull; Kein CTA am Ende</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Pro-Tipps</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>&bull; Poste 1x t&auml;glich konsistent</li>
                <li>&bull; Nutze die Posting-Zeiten oben</li>
                <li>&bull; Mische Content-Pillars durch</li>
                <li>&bull; Bewerte jeden Post f&uuml;r bessere Daten</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
