import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { GlowCard } from "@/components/GlowCard";
import { MotivationalGreeting } from "@/components/MotivationalGreeting";
import { ContentScoreBadge, calculateContentScore } from "@/components/ContentScoreBadge";
import { ActivityFeed, type ActivityItem } from "@/components/ActivityFeed";
import {
  FileText, CheckCircle, XCircle, Clock, Send,
  Zap, TrendingUp, ArrowRight, Rocket,
  Image, Video, AlertCircle, Flame,
  Library, Eye, Sparkles, Hash,
  CalendarDays, BarChart3,
} from "lucide-react";
import { useMemo } from "react";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500/20 text-pink-300",
  facebook: "bg-blue-500/20 text-blue-300",
  tiktok: "bg-cyan-500/20 text-cyan-300",
  linkedin: "bg-blue-700/20 text-blue-200",
  twitter: "bg-sky-500/20 text-sky-300",
  threads: "bg-gray-500/20 text-gray-300",
  youtube: "bg-red-600/20 text-red-300",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: apiHealth } = trpc.apiHealth.goViralBitch.useQuery();
  const { data: pendingPosts } = trpc.content.list.useQuery({ status: "pending", limit: 5 });
  const { data: approvedPosts } = trpc.content.list.useQuery({ status: "approved", limit: 3 });
  const { data: recentPosts, isLoading: postsLoading } = trpc.content.list.useQuery({ limit: 8 });
  const { data: userSettings } = trpc.userSettings.get.useQuery();

  // Build activity feed from recent posts
  const activityItems: ActivityItem[] = useMemo(() => {
    if (!recentPosts) return [];
    return recentPosts.slice(0, 6).map((item) => ({
      id: item.post.id,
      type: item.post.status as ActivityItem["type"],
      userName: item.createdBy?.name || "Unbekannt",
      contentPreview: (item.post.editedContent || item.post.content).substring(0, 80),
      timestamp: new Date(item.post.updatedAt || item.post.createdAt),
      platform: (item.post.platforms as string[])?.[0],
    }));
  }, [recentPosts]);

  const firstName = user?.name?.split(" ")[0] || "Team";

  return (
    <motion.div
      className="space-y-6 max-w-6xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with Motivational Greeting */}
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-3">
        <MotivationalGreeting name={firstName} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2"
        >
          <Badge variant={apiHealth?.status === "online" ? "default" : "destructive"} className="gap-1.5 text-xs">
            <span className={`h-1.5 w-1.5 rounded-full ${apiHealth?.status === "online" ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            {apiHealth?.status === "online" ? "Online" : "Offline"}
          </Badge>
          {userSettings?.hasBlotatoKey ? (
            <Badge variant="outline" className="gap-1 text-xs text-emerald-400 border-emerald-500/30">
              <Send className="h-2.5 w-2.5" /> Auto-Post
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-xs text-amber-400 border-amber-500/30 cursor-pointer" onClick={() => setLocation("/settings")}>
              <AlertCircle className="h-2.5 w-2.5" /> Setup
            </Badge>
          )}
        </motion.div>
      </motion.div>

      {/* Quick Actions - 3 Big Buttons with Glow */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <GlowCard
          glowColor="rgba(16, 185, 129, 0.2)"
          delay={0}
          onClick={() => setLocation("/generator")}
          className="group"
        >
          <div className="p-4 flex flex-col items-center gap-1.5 text-center">
            <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.4 }}>
              <Zap className="h-6 w-6 text-primary group-hover:text-emerald-300 transition-colors" />
            </motion.div>
            <span className="font-semibold text-sm">Content erstellen</span>
            <span className="text-[10px] text-muted-foreground">Text + Bild + Video</span>
          </div>
        </GlowCard>

        <GlowCard
          glowColor="rgba(234, 179, 8, 0.2)"
          delay={0.1}
          onClick={() => setLocation("/approval")}
          className="group relative"
        >
          <div className="p-4 flex flex-col items-center gap-1.5 text-center">
            <CheckCircle className="h-6 w-6 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
            <span className="font-semibold text-sm">Freigeben</span>
            <span className="text-[10px] text-muted-foreground">Prüfen & genehmigen</span>
            {(stats?.pending ?? 0) > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2"
              >
                <Badge variant="destructive" className="text-[10px] px-1.5 animate-pulse shadow-lg shadow-red-500/30">
                  {stats?.pending}
                </Badge>
              </motion.div>
            )}
          </div>
        </GlowCard>

        <GlowCard
          glowColor="rgba(16, 185, 129, 0.15)"
          delay={0.2}
          onClick={() => setLocation("/library")}
          className="group"
        >
          <div className="p-4 flex flex-col items-center gap-1.5 text-center">
            <Library className="h-6 w-6 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            <span className="font-semibold text-sm">Bibliothek</span>
            <span className="text-[10px] text-muted-foreground">Fertige Posts kopieren</span>
          </div>
        </GlowCard>
      </motion.div>

      {/* Stats Row - Animated Counters */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: "Ausstehend", value: stats?.pending ?? 0, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10", glow: "rgba(234, 179, 8, 0.1)" },
          { label: "Genehmigt", value: stats?.approved ?? 0, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10", glow: "rgba(16, 185, 129, 0.1)" },
          { label: "Geplant", value: stats?.scheduled ?? 0, icon: Send, color: "text-blue-400", bg: "bg-blue-400/10", glow: "rgba(59, 130, 246, 0.1)" },
          { label: "Live", value: stats?.published ?? 0, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10", glow: "rgba(168, 85, 247, 0.1)" },
          { label: "Abgelehnt", value: stats?.rejected ?? 0, icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", glow: "rgba(239, 68, 68, 0.1)" },
          { label: "Gesamt", value: stats?.total ?? 0, icon: FileText, color: "text-foreground", bg: "bg-foreground/10", glow: "rgba(255, 255, 255, 0.05)" },
        ].map((stat, i) => (
          <GlowCard key={stat.label} glowColor={stat.glow} delay={0.3 + i * 0.05}>
            <div className="p-2.5">
              {statsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                    <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                  </div>
                  <div className="min-w-0">
                    <AnimatedCounter
                      value={stat.value}
                      className="text-base font-bold leading-none block"
                    />
                    <p className="text-[9px] text-muted-foreground truncate">{stat.label}</p>
                  </div>
                </div>
              )}
            </div>
          </GlowCard>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Pending Posts */}
          <AnimatePresence>
            {pendingPosts && pendingPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <GlowCard glowColor="rgba(234, 179, 8, 0.15)" className="border-yellow-500/30 bg-yellow-500/5">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                        Warten auf Freigabe ({pendingPosts.length})
                      </h3>
                      <Button size="sm" onClick={() => setLocation("/approval")} className="gap-1.5 h-7 text-xs">
                        <CheckCircle className="h-3 w-3" />
                        Freigeben
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {pendingPosts.slice(0, 3).map((item, idx) => {
                        const score = calculateContentScore({
                          content: item.post.editedContent || item.post.content,
                          hashtags: ((item.post as any).hashtags as string[]) || [],
                          mediaUrl: item.post.mediaUrl,
                          videoUrl: item.post.videoUrl,
                          platforms: (item.post.platforms as string[]) || [],
                          pillar: item.post.pillar,
                        });
                        return (
                          <motion.div
                            key={item.post.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center gap-3 p-2.5 rounded-lg bg-yellow-500/5 border border-yellow-500/10 cursor-pointer hover:bg-yellow-500/10 transition-all hover:translate-x-1"
                            onClick={() => setLocation("/approval")}
                          >
                            <ContentScoreBadge score={score} size="sm" showLabel={false} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1">
                                <Badge variant="outline" className="text-[9px] h-4">{item.post.contentType}</Badge>
                                {item.post.mediaUrl && <Image className="h-3 w-3 text-emerald-400" />}
                                {item.post.videoUrl && <Video className="h-3 w-3 text-violet-400" />}
                                {!item.post.mediaUrl && !item.post.videoUrl && (
                                  <span className="text-[9px] text-amber-400">Kein Bild/Video</span>
                                )}
                              </div>
                              <p className="text-xs truncate">{(item.post.editedContent || item.post.content).substring(0, 80)}...</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {item.createdBy?.name || "Unbekannt"} · {new Date(item.post.createdAt).toLocaleDateString("de-DE")}
                              </p>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Approved - Ready to Post */}
          <AnimatePresence>
            {approvedPosts && approvedPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <GlowCard glowColor="rgba(16, 185, 129, 0.15)" className="border-emerald-500/30 bg-emerald-500/5">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        Bereit zum Posten ({approvedPosts.length})
                      </h3>
                      <Button size="sm" variant="outline" onClick={() => setLocation("/library")} className="gap-1.5 h-7 text-xs">
                        <Library className="h-3 w-3" /> Bibliothek
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {approvedPosts.slice(0, 3).map((item) => (
                        <div key={item.post.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs truncate">{(item.post.editedContent || item.post.content).substring(0, 80)}...</p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {(item.post.platforms as string[])?.map(p => (
                                <span key={p} className={`text-[9px] px-1.5 py-0.5 rounded ${PLATFORM_COLORS[p] || "bg-accent text-accent-foreground"}`}>
                                  {p}
                                </span>
                              ))}
                              {item.post.mediaUrl && <Image className="h-3 w-3 text-emerald-400" />}
                              {item.post.videoUrl && <Video className="h-3 w-3 text-violet-400" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Activity Feed */}
          <motion.div variants={itemVariants}>
            <GlowCard glowColor="rgba(255, 255, 255, 0.03)">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Aktivitäten
                  </h3>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setLocation("/queue")}>
                    Alle anzeigen
                  </Button>
                </div>
                {postsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : activityItems.length > 0 ? (
                  <ActivityFeed items={activityItems} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-30" />
                    </motion.div>
                    <p>Noch keine Posts. Starte mit dem Generator!</p>
                    <Button size="sm" className="mt-3 gap-1.5" onClick={() => setLocation("/generator")}>
                      <Zap className="h-3.5 w-3.5" /> Jetzt starten
                    </Button>
                  </div>
                )}
              </div>
            </GlowCard>
          </motion.div>
        </div>

        {/* Right Column - Quick Links & Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Intelligence Quick Links - Premium Grid */}
          <motion.div variants={itemVariants}>
            <GlowCard glowColor="rgba(168, 85, 247, 0.1)">
              <div className="p-4">
                <h3 className="text-sm font-semibold mb-3">Intelligence</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Flame, label: "Trend-Scanner", path: "/trends", color: "text-amber-400", glow: "hover:shadow-amber-500/20" },
                    { icon: Eye, label: "Creator Spy", path: "/creator-spy", color: "text-violet-400", glow: "hover:shadow-violet-500/20" },
                    { icon: Sparkles, label: "Lifestyle-Engine", path: "/lifestyle", color: "text-cyan-400", glow: "hover:shadow-cyan-500/20" },
                    { icon: CalendarDays, label: "Monatsplan", path: "/monthly-plan", color: "text-blue-400", glow: "hover:shadow-blue-500/20" },
                    { icon: Hash, label: "Hashtag-Engine", path: "/hashtags", color: "text-pink-400", glow: "hover:shadow-pink-500/20" },
                    { icon: BarChart3, label: "Analytics+", path: "/analytics-plus", color: "text-emerald-400", glow: "hover:shadow-emerald-500/20" },
                  ].map((item, idx) => (
                    <motion.button
                      key={item.path}
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + idx * 0.05 }}
                      onClick={() => setLocation(item.path)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border/40 bg-card/50 hover:bg-accent/50 transition-all shadow-sm ${item.glow} hover:shadow-lg`}
                    >
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                      <span className="text-[10px] font-medium">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </GlowCard>
          </motion.div>

          {/* How It Works */}
          <motion.div variants={itemVariants}>
            <GlowCard glowColor="rgba(16, 185, 129, 0.1)" className="border-primary/20">
              <div className="p-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Rocket className="h-4 w-4 text-primary" />
                  So funktioniert's
                </h3>
                <div className="space-y-2.5">
                  {[
                    { step: "1", text: "Content erstellen (Text + Bild + Video)", color: "bg-primary/20 text-primary" },
                    { step: "2", text: "Content selbst freigeben oder bearbeiten", color: "bg-yellow-500/20 text-yellow-400" },
                    { step: "3", text: "Via Blotato posten oder aus Bibliothek kopieren", color: "bg-emerald-500/20 text-emerald-400" },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + idx * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`h-6 w-6 rounded-full ${item.color} flex items-center justify-center text-xs font-bold shrink-0`}>
                        {item.step}
                      </div>
                      <p className="text-xs">{item.text}</p>
                    </motion.div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">
                  Kein Blotato nötig! Kopiere fertige Posts aus der Bibliothek und poste manuell.
                </p>
              </div>
            </GlowCard>
          </motion.div>

          {/* System Status - Premium */}
          <motion.div variants={itemVariants}>
            <GlowCard glowColor="rgba(255, 255, 255, 0.03)">
              <div className="p-4 space-y-2">
                <p className="text-xs font-medium mb-2">System</p>
                <div className="space-y-1.5">
                  {[
                    { label: "GoViralBitch API", status: apiHealth?.status === "online", statusText: apiHealth?.status === "online" ? "Online" : "Offline" },
                    { label: "Blotato Auto-Post", status: !!userSettings?.hasBlotatoKey, statusText: userSettings?.hasBlotatoKey ? "Bereit" : "Nicht eingerichtet" },
                    { label: "KI-Bild & Video", status: true, statusText: "Verfügbar" },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 + idx * 0.1 }}
                      className="flex items-center justify-between text-[10px]"
                    >
                      <span className="text-muted-foreground">{item.label}</span>
                      <Badge variant={item.status ? "default" : "outline"} className="text-[8px] h-4">
                        <span className={`h-1 w-1 rounded-full mr-1 ${item.status ? "bg-emerald-400" : "bg-amber-400"}`} />
                        {item.statusText}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            </GlowCard>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
