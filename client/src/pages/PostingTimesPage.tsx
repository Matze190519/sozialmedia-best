import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { Clock, TrendingUp, Zap, Calendar, Star, AlertTriangle } from "lucide-react";

const PLATFORM_EMOJIS: Record<string, string> = {
  instagram: "📸", facebook: "📘", tiktok: "🎵", linkedin: "💼",
  twitter: "🐦", threads: "🧵", youtube: "🎬", pinterest: "📌",
};

function getScoreColor(score: number) {
  if (score >= 75) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (score >= 55) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
  return "bg-red-500/20 text-red-300 border-red-500/30";
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-accent/30 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${score >= 75 ? "bg-emerald-500" : score >= 55 ? "bg-yellow-500" : "bg-red-500"}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-mono w-8 text-right">{score}</span>
    </div>
  );
}

export default function PostingTimesPage() {
  const { data: allSchedules, isLoading } = trpc.postingTimes.allSchedules.useQuery();
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");

  const allPlatforms = useMemo(() => ["instagram", "tiktok", "facebook", "linkedin", "twitter", "threads", "youtube", "pinterest"], []);
  const { data: smartTimes } = trpc.postingTimes.smartNextMulti.useQuery({ platforms: allPlatforms });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Clock className="h-6 w-6 text-emerald-400" />
          Smart Posting-Zeiten
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Datenbasierte optimale Posting-Zeiten pro Plattform und Wochentag. Basierend auf Engagement-Studien der DACH-Region.
        </p>
      </div>

      {/* Nächste optimale Zeiten - Übersicht */}
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-400" />
            Nächste optimale Posting-Zeiten
          </CardTitle>
        </CardHeader>
        <CardContent>
          {smartTimes ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {smartTimes.map((t: any) => (
                <div key={t.platform} className="p-3 rounded-lg bg-accent/30 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{PLATFORM_EMOJIS[t.platform] || "📱"}</span>
                    <span className="text-sm font-medium capitalize">{t.platform}</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-emerald-300">
                    {String(t.hour).padStart(2, "0")}:{String(t.minute).padStart(2, "0")} Uhr
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.dayName} {t.isToday ? "(heute)" : ""}
                  </div>
                  <ScoreBar score={t.score} />
                  <p className="text-[10px] text-muted-foreground leading-tight">{t.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <Skeleton className="h-32" />
          )}
        </CardContent>
      </Card>

      {/* Plattform-Tabs */}
      <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-accent/30 p-1">
          {allSchedules?.map((s: any) => (
            <TabsTrigger key={s.platform} value={s.platform} className="gap-1.5 text-xs">
              <span>{s.emoji}</span>
              <span>{s.displayName}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {allSchedules?.map((schedule: any) => (
          <TabsContent key={schedule.platform} value={schedule.platform} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Wochenplan */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-xl">{schedule.emoji}</span>
                    {schedule.displayName} - Wochenplan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {schedule.weekSchedule.map((day: any) => (
                      <div key={day.dayOfWeek} className={`p-3 rounded-lg ${day.isTopDay ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-accent/20"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium w-24">{day.dayName}</span>
                            {day.isTopDay && (
                              <Badge variant="outline" className="text-[10px] gap-1 border-emerald-500/30 text-emerald-300">
                                <Star className="h-2.5 w-2.5" /> Top-Tag
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Best: {String(day.bestSlot.hour).padStart(2, "0")}:{String(day.bestSlot.minute).padStart(2, "0")} Uhr
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {day.slots.map((slot: any, idx: number) => (
                            <div key={idx} className={`px-2.5 py-1.5 rounded border text-xs ${getScoreColor(slot.score)}`}>
                              <span className="font-mono font-medium">
                                {String(slot.hour).padStart(2, "0")}:{String(slot.minute).padStart(2, "0")}
                              </span>
                              <span className="ml-1.5 opacity-80">Score {slot.score}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar Info */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      Top 3 Zeiten
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {schedule.globalBestTimes.slice(0, 3).map((t: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === 0 ? "bg-yellow-500/20 text-yellow-300" : idx === 1 ? "bg-gray-400/20 text-gray-300" : "bg-orange-500/20 text-orange-300"}`}>
                            {idx + 1}
                          </span>
                          <span className="font-mono">
                            {String(t.hour).padStart(2, "0")}:{String(t.minute).padStart(2, "0")}
                          </span>
                        </span>
                        <Badge variant="outline" className="text-[10px]">Score {t.score}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      Beste Tage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {schedule.peakDays.map((day: string) => (
                        <Badge key={day} className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      Vermeiden
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {schedule.avoidTimes.map((t: string, idx: number) => (
                      <p key={idx} className="text-xs text-red-300/80">{t}</p>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-amber-500/20 bg-amber-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-amber-400" />
                      Algorithmus-Tipp
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-amber-200/80 leading-relaxed">{schedule.algorithmNotes}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
