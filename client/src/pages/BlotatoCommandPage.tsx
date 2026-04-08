import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Globe, RefreshCw, Loader2, CheckCircle, XCircle, AlertCircle,
  ExternalLink, Zap, Send, Calendar, BarChart3, Clock,
  Wifi, WifiOff, Activity, TrendingUp, Rocket, Settings,
} from "lucide-react";
import { GlowCard } from "@/components/GlowCard";
import { AnimatedCounter } from "@/components/AnimatedCounter";

// Platform metadata
const PLATFORM_META: Record<string, { icon: string; label: string; color: string; gradient: string }> = {
  instagram: { icon: "📸", label: "Instagram", color: "text-pink-400", gradient: "from-pink-500/20 to-purple-500/20" },
  facebook: { icon: "📘", label: "Facebook", color: "text-blue-400", gradient: "from-blue-600/20 to-blue-400/20" },
  tiktok: { icon: "🎵", label: "TikTok", color: "text-amber-400", gradient: "from-amber-500/20 to-pink-500/20" },
  linkedin: { icon: "💼", label: "LinkedIn", color: "text-blue-300", gradient: "from-blue-700/20 to-blue-500/20" },
  twitter: { icon: "🐦", label: "X / Twitter", color: "text-sky-400", gradient: "from-sky-500/20 to-sky-300/20" },
  threads: { icon: "🧵", label: "Threads", color: "text-gray-300", gradient: "from-gray-600/20 to-gray-400/20" },
  youtube: { icon: "🎬", label: "YouTube", color: "text-red-400", gradient: "from-red-600/20 to-red-400/20" },
  pinterest: { icon: "📌", label: "Pinterest", color: "text-red-300", gradient: "from-red-500/20 to-pink-400/20" },
  bluesky: { icon: "🦋", label: "Bluesky", color: "text-sky-300", gradient: "from-sky-400/20 to-blue-300/20" },
};

export default function BlotatoCommandPage() {
  const [, setLocation] = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Queries
  const { data: blotatoAccounts, isLoading: accountsLoading, refetch: refetchAccounts } = trpc.apiHealth.blotatoAccounts.useQuery();
  const { data: scheduledPosts, isLoading: postsLoading, refetch: refetchPosts } = trpc.calendar.list.useQuery({ limit: 50 });
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: gvbHealth } = trpc.apiHealth.goViralBitch.useQuery();

  const accounts = useMemo(() => blotatoAccounts?.accounts || [], [blotatoAccounts]);
  const scheduled = useMemo(() => scheduledPosts?.items || [], [scheduledPosts]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchAccounts(), refetchPosts()]);
      toast.success("Daten aktualisiert!");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Group scheduled posts by platform
  const postsByPlatform = useMemo(() => {
    const map: Record<string, number> = {};
    scheduled.forEach((p: any) => {
      const platform = p.platform || p.draft?.content?.platform || "unknown";
      map[platform] = (map[platform] || 0) + 1;
    });
    return map;
  }, [scheduled]);

  const totalConnected = accounts.length;
  const totalScheduled = scheduled.length;

  if (accountsLoading) {
    return (
      <div className="max-w-4xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Blotato Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Alle {totalConnected} Kanäle auf einen Blick. Auto-Publish auf 9 Plattformen.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Aktualisieren
          </Button>
          <Button
            size="sm"
            onClick={() => setLocation("/wizard")}
            className="gap-1.5 bg-gradient-to-r from-primary to-violet-600"
          >
            <Zap className="h-3.5 w-3.5" />
            Content Wizard
          </Button>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GlowCard glowColor="rgba(16, 185, 129, 0.1)">
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Wifi className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-muted-foreground">Verbunden</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              <AnimatedCounter value={totalConnected} />
            </p>
            <p className="text-[10px] text-muted-foreground">Kanäle aktiv</p>
          </div>
        </GlowCard>

        <GlowCard glowColor="rgba(99, 102, 241, 0.1)">
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span className="text-xs text-muted-foreground">Geplant</span>
            </div>
            <p className="text-2xl font-bold text-indigo-400">
              <AnimatedCounter value={totalScheduled} />
            </p>
            <p className="text-[10px] text-muted-foreground">Posts in Queue</p>
          </div>
        </GlowCard>

        <GlowCard glowColor="rgba(234, 179, 8, 0.1)">
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Activity className="h-4 w-4 text-yellow-400" />
              <span className="text-xs text-muted-foreground">API Status</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">
              {accounts.length > 0 ? "Online" : "Offline"}
            </p>
            <p className="text-[10px] text-muted-foreground">Blotato API</p>
          </div>
        </GlowCard>

        <GlowCard glowColor="rgba(168, 85, 247, 0.1)">
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">Heute</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">
              <AnimatedCounter value={stats?.publishedToday || 0} />
            </p>
            <p className="text-[10px] text-muted-foreground">Posts veröffentlicht</p>
          </div>
        </GlowCard>
      </div>

      {/* Connected Channels Grid */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          Verbundene Kanäle
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {accounts.map((account: any, i: number) => {
            const meta = PLATFORM_META[account.platform?.toLowerCase()] || {
              icon: "🌐", label: account.platform, color: "text-gray-400", gradient: "from-gray-500/20 to-gray-400/20",
            };
            const scheduledCount = postsByPlatform[account.platform?.toLowerCase()] || 0;

            return (
              <motion.div
                key={account.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlowCard glowColor="rgba(99, 102, 241, 0.08)">
                  <div className={`p-4 bg-gradient-to-br ${meta.gradient} rounded-lg`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{meta.icon}</span>
                        <div>
                          <p className={`text-sm font-semibold ${meta.color}`}>{meta.label}</p>
                          <p className="text-[10px] text-muted-foreground">
                            @{account.username || account.displayName}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[8px] h-4 text-emerald-400 border-emerald-500/30">
                        <Wifi className="h-2 w-2 mr-0.5" />
                        Live
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="h-3 w-3" />
                          {scheduledCount} geplant
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          ID: {account.id}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] gap-1 px-2"
                        onClick={() => setLocation("/wizard")}
                      >
                        <Send className="h-3 w-3" />
                        Posten
                      </Button>
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            );
          })}

          {/* Add more platforms CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: accounts.length * 0.05 }}
          >
            <GlowCard glowColor="rgba(99, 102, 241, 0.05)">
              <div className="p-4 h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-border/30 rounded-lg min-h-[100px]">
                <Globe className="h-6 w-6 text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground">
                  Weitere Kanäle verbinden
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-7 text-[10px] gap-1"
                  onClick={() => {
                    window.open("https://app.blotato.com/accounts", "_blank");
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                  In Blotato öffnen
                </Button>
              </div>
            </GlowCard>
          </motion.div>
        </div>
      </div>

      {/* Scheduled Posts Preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Nächste geplante Posts ({totalScheduled})
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setLocation("/calendar")}
          >
            <Calendar className="h-3 w-3" />
            Kalender öffnen
          </Button>
        </div>

        {postsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : scheduled.length === 0 ? (
          <GlowCard glowColor="rgba(234, 179, 8, 0.05)">
            <div className="p-6 text-center">
              <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Keine geplanten Posts</p>
              <Button
                size="sm"
                className="mt-3 gap-1.5"
                onClick={() => setLocation("/wizard")}
              >
                <Zap className="h-3.5 w-3.5" />
                Ersten Post erstellen
              </Button>
            </div>
          </GlowCard>
        ) : (
          <div className="space-y-2">
            {scheduled.slice(0, 8).map((post: any, i: number) => {
              const platform = post.platform || post.draft?.content?.platform || "unknown";
              const meta = PLATFORM_META[platform.toLowerCase()] || { icon: "🌐", label: platform, color: "text-gray-400" };
              const text = post.draft?.content?.text || post.content || "";
              const scheduledTime = post.scheduledTime || post.scheduledAt;

              return (
                <motion.div
                  key={post.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/20 hover:bg-accent/30 transition-colors"
                >
                  <span className="text-lg">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{text.substring(0, 80)}...</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                      <span className={meta.color}>{meta.label}</span>
                      {scheduledTime && (
                        <>
                          <span>•</span>
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(scheduledTime).toLocaleString("de-DE", {
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </>
                      )}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[8px] h-4 text-amber-400 border-amber-500/30">
                    Geplant
                  </Badge>
                </motion.div>
              );
            })}
            {scheduled.length > 8 && (
              <p className="text-xs text-center text-muted-foreground pt-1">
                + {scheduled.length - 8} weitere geplante Posts
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
        <Button
          variant="outline"
          className="h-auto py-3 flex-col gap-1.5"
          onClick={() => setLocation("/wizard")}
        >
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-xs">Content Wizard</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-3 flex-col gap-1.5"
          onClick={() => setLocation("/generator")}
        >
          <Send className="h-5 w-5 text-emerald-400" />
          <span className="text-xs">Generator</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-3 flex-col gap-1.5"
          onClick={() => setLocation("/calendar")}
        >
          <Calendar className="h-5 w-5 text-indigo-400" />
          <span className="text-xs">Kalender</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-3 flex-col gap-1.5"
          onClick={() => setLocation("/settings")}
        >
          <Settings className="h-5 w-5 text-yellow-400" />
          <span className="text-xs">Einstellungen</span>
        </Button>
      </div>
    </motion.div>
  );
}
