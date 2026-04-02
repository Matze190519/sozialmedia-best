import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Flame, TrendingUp, PieChart, Calendar, Loader2,
  Award, Target, Zap,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";

const DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i}:00`);
const PIE_COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#10b981", "#ec4899", "#6366f1", "#14b8a6"];

export default function AnalyticsPlusPage() {
  const { data: contentMix, isLoading: loadingMix } = trpc.analyticsPlus.contentMix.useQuery();
  const { data: heatmap, isLoading: loadingHeat } = trpc.analyticsPlus.heatmap.useQuery();
  const { data: weeklyTrend, isLoading: loadingTrend } = trpc.analyticsPlus.weeklyTrend.useQuery();
  const { data: bestPerformers, isLoading: loadingBest } = trpc.analyticsPlus.bestPerformers.useQuery({ limit: 10 });

  const heatmapGrid = useMemo(() => {
    if (!heatmap) return [];
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    for (const d of heatmap) {
      if (d.day >= 0 && d.day < 7 && d.hour >= 0 && d.hour < 24) {
        grid[d.day][d.hour] = d.count;
      }
    }
    return grid;
  }, [heatmap]);

  const maxHeatValue = useMemo(() => {
    return Math.max(1, ...heatmapGrid.flat());
  }, [heatmapGrid]);

  const isLoading = loadingMix || loadingHeat || loadingTrend || loadingBest;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Analytics Command Center
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Tiefe Einblicke: Content-Mix, Posting-Heatmap, Trends und Top-Performer.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Content Mix by Pillar */}
        <Card className="border-border/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-purple-400" />
              Content-Mix nach Pillar
            </CardTitle>
            <CardDescription>Welche Themen dominieren deinen Content?</CardDescription>
          </CardHeader>
          <CardContent>
            {contentMix?.byPillar && contentMix.byPillar.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={contentMix.byPillar}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        innerRadius={30}
                      >
                        {contentMix.byPillar.map((_: any, i: number) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5">
                  {contentMix.byPillar.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="truncate max-w-[120px]">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.count}</span>
                        {p.avgScore > 0 && (
                          <Badge variant="outline" className="text-[8px] px-1 py-0">
                            {p.avgScore}/100
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Noch keine Daten</p>
            )}
          </CardContent>
        </Card>

        {/* Content Mix by Type */}
        <Card className="border-border/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-cyan-400" />
              Content-Mix nach Format
            </CardTitle>
            <CardDescription>Posts, Reels, Stories, Hooks...</CardDescription>
          </CardHeader>
          <CardContent>
            {contentMix?.byType && contentMix.byType.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={contentMix.byType}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#888" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#888" }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Noch keine Daten</p>
            )}
          </CardContent>
        </Card>

        {/* Posting Heatmap */}
        <Card className="border-border/30 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-400" />
              Posting-Heatmap
            </CardTitle>
            <CardDescription>Wann erstellst du am meisten Content?</CardDescription>
          </CardHeader>
          <CardContent>
            {heatmapGrid.length > 0 && heatmapGrid.some(row => row.some(v => v > 0)) ? (
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Hour labels */}
                  <div className="flex items-center mb-1">
                    <div className="w-8" />
                    {HOURS.filter((_, i) => i % 3 === 0).map((h) => (
                      <div key={h} className="flex-1 text-center text-[8px] text-muted-foreground">{h}</div>
                    ))}
                  </div>
                  {/* Grid */}
                  {DAYS.map((day, dayIdx) => (
                    <div key={day} className="flex items-center gap-0.5 mb-0.5">
                      <div className="w-8 text-[9px] text-muted-foreground text-right pr-1">{day}</div>
                      {Array.from({ length: 24 }, (_, hourIdx) => {
                        const val = heatmapGrid[dayIdx]?.[hourIdx] || 0;
                        const intensity = val / maxHeatValue;
                        return (
                          <div
                            key={hourIdx}
                            className="flex-1 aspect-square rounded-sm transition-colors cursor-pointer"
                            style={{
                              backgroundColor: val === 0
                                ? "rgba(255,255,255,0.05)"
                                : `rgba(139, 92, 246, ${0.15 + intensity * 0.85})`,
                            }}
                            title={`${day} ${hourIdx}:00 - ${val} Posts`}
                          />
                        );
                      })}
                    </div>
                  ))}
                  {/* Legend */}
                  <div className="flex items-center justify-end gap-1 mt-2">
                    <span className="text-[8px] text-muted-foreground">Wenig</span>
                    {[0.1, 0.3, 0.5, 0.7, 1].map((v, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: `rgba(139, 92, 246, ${0.15 + v * 0.85})` }}
                      />
                    ))}
                    <span className="text-[8px] text-muted-foreground">Viel</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Noch keine Posting-Daten</p>
            )}
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card className="border-border/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Wöchentlicher Trend
            </CardTitle>
            <CardDescription>Posts pro Woche und durchschnittlicher Score</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyTrend && weeklyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="week" tick={{ fontSize: 9, fill: "#888" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#888" }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="count" stroke="#8b5cf6" name="Posts" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="avgScore" stroke="#10b981" name="Avg Score" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Noch keine Daten</p>
            )}
          </CardContent>
        </Card>

        {/* Best Performers */}
        <Card className="border-border/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" />
              Top-Performer
            </CardTitle>
            <CardDescription>Deine besten Posts nach Score</CardDescription>
          </CardHeader>
          <CardContent>
            {bestPerformers && bestPerformers.length > 0 ? (
              <div className="space-y-2">
                {bestPerformers.slice(0, 5).map((post: any, i: number) => (
                  <motion.div
                    key={post.post?.id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-accent/20 border border-border/20"
                  >
                    <div className="w-6 text-center">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span className="text-[10px] text-muted-foreground">#{i + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] leading-relaxed truncate">
                        {post.post?.editedContent || post.post?.content || "Kein Content"}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {(post.post?.platforms || []).map((p: string) => (
                          <Badge key={p} variant="outline" className="text-[7px] px-0.5 py-0">{p}</Badge>
                        ))}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[9px] ${
                        (post.post?.feedbackScore || 0) >= 80 ? "border-emerald-500/50 text-emerald-400" :
                        (post.post?.feedbackScore || 0) >= 60 ? "border-amber-500/50 text-amber-400" :
                        "border-red-500/50 text-red-400"
                      }`}
                    >
                      {post.post?.feedbackScore || 0}/100
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Noch keine bewerteten Posts. Nutze den Feedback-Loop!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
