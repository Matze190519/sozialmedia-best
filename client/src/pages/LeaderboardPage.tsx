import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Trophy, Crown, Medal, Star, Zap, Target, TrendingUp,
  Award, Flame, Users, BarChart3, Loader2,
} from "lucide-react";

const BADGE_CONFIG: Record<string, { label: string; icon: typeof Trophy; color: string; bg: string }> = {
  diamond: { label: "Diamant", icon: Crown, color: "text-cyan-300", bg: "bg-gradient-to-br from-cyan-500/20 to-blue-500/20" },
  gold: { label: "Gold", icon: Trophy, color: "text-amber-400", bg: "bg-gradient-to-br from-amber-500/20 to-yellow-500/20" },
  silver: { label: "Silber", icon: Medal, color: "text-gray-300", bg: "bg-gradient-to-br from-gray-400/20 to-gray-500/20" },
  bronze: { label: "Bronze", icon: Award, color: "text-orange-400", bg: "bg-gradient-to-br from-orange-500/20 to-amber-500/20" },
  starter: { label: "Starter", icon: Star, color: "text-blue-400", bg: "bg-gradient-to-br from-blue-500/20 to-indigo-500/20" },
};

const RANK_STYLES = [
  { bg: "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent", border: "border-amber-500/30", icon: "🥇" },
  { bg: "bg-gradient-to-r from-gray-400/20 via-gray-400/10 to-transparent", border: "border-gray-400/30", icon: "🥈" },
  { bg: "bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent", border: "border-orange-500/30", icon: "🥉" },
];

export default function LeaderboardPage() {
  const { data: rankings, isLoading } = trpc.leaderboard.rankings.useQuery();
  const { data: myStats } = trpc.leaderboard.myStats.useQuery();

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
          <Trophy className="h-6 w-6 text-amber-400" />
          Team Leaderboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gamification: Punkte sammeln, Badges freischalten, Level aufsteigen.
        </p>
      </div>

      {/* My Stats Card */}
      {myStats && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl ${BADGE_CONFIG[myStats.badge]?.bg || "bg-accent"} flex items-center justify-center`}>
                  {(() => {
                    const BadgeIcon = BADGE_CONFIG[myStats.badge]?.icon || Star;
                    return <BadgeIcon className={`h-7 w-7 ${BADGE_CONFIG[myStats.badge]?.color || "text-primary"}`} />;
                  })()}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dein Status</p>
                  <p className="text-xl font-bold">{BADGE_CONFIG[myStats.badge]?.label || "Starter"}</p>
                  <p className="text-xs text-muted-foreground">Level {myStats.level}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{myStats.points}</p>
                  <p className="text-[10px] text-muted-foreground">Punkte</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{myStats.total}</p>
                  <p className="text-[10px] text-muted-foreground">Posts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">{myStats.published}</p>
                  <p className="text-[10px] text-muted-foreground">Published</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">{myStats.topPosts}</p>
                  <p className="text-[10px] text-muted-foreground">Top Posts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Level Progress */}
      {myStats && (
        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Level {myStats.level}</span>
              <span className="text-xs text-muted-foreground">
                Nächstes Badge: {
                  myStats.badge === "starter" ? "Bronze (5 Posts)" :
                  myStats.badge === "bronze" ? "Silber (20 Posts)" :
                  myStats.badge === "silver" ? "Gold (50 Posts)" :
                  myStats.badge === "gold" ? "Diamant (100 Posts)" :
                  "Max erreicht!"
                }
              </span>
            </div>
            <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (myStats.total / (
                    myStats.badge === "starter" ? 5 :
                    myStats.badge === "bronze" ? 20 :
                    myStats.badge === "silver" ? 50 :
                    myStats.badge === "gold" ? 100 : 100
                  )) * 100)}%`
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rankings Table */}
      <Card className="border-border/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team-Rangliste
          </CardTitle>
          <CardDescription>Basierend auf Posts, Veröffentlichungen und Content-Score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(!rankings || rankings.length === 0) ? (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Noch keine Daten. Erstelle Content um auf dem Leaderboard zu erscheinen!</p>
              </div>
            ) : (
              rankings.map((user, i) => {
                const rankStyle = i < 3 ? RANK_STYLES[i] : null;
                const badgeConfig = BADGE_CONFIG[user.badge] || BADGE_CONFIG.starter;

                return (
                  <motion.div
                    key={user.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      rankStyle ? `${rankStyle.bg} ${rankStyle.border}` : "border-border/20 bg-card/50"
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center">
                      {rankStyle ? (
                        <span className="text-xl">{rankStyle.icon}</span>
                      ) : (
                        <span className="text-sm font-bold text-muted-foreground">#{user.rank}</span>
                      )}
                    </div>

                    {/* Badge Icon */}
                    <div className={`w-9 h-9 rounded-lg ${badgeConfig.bg} flex items-center justify-center`}>
                      <badgeConfig.icon className={`h-4 w-4 ${badgeConfig.color}`} />
                    </div>

                    {/* Name & Level */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{user.userName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Level {user.level} · {badgeConfig.label}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-center">
                      <div>
                        <p className="text-sm font-bold">{user.totalPosts}</p>
                        <p className="text-[8px] text-muted-foreground">Posts</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-emerald-400">{user.publishedCount}</p>
                        <p className="text-[8px] text-muted-foreground">Published</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-amber-400">{user.avgScore || "-"}</p>
                        <p className="text-[8px] text-muted-foreground">Avg Score</p>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right min-w-[60px]">
                      <p className="text-lg font-bold text-primary">{user.points}</p>
                      <p className="text-[8px] text-muted-foreground">Punkte</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scoring Explanation */}
      <Card className="border-border/20 bg-accent/5">
        <CardContent className="p-4">
          <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            Punkte-System
          </h4>
          <div className="grid grid-cols-3 gap-3 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-blue-400" />
              <span>Post erstellt: +10 Punkte</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Target className="h-3 w-3 text-emerald-400" />
              <span>Veröffentlicht: +25 Punkte</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="h-3 w-3 text-amber-400" />
              <span>Content Score: +Score Punkte</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
