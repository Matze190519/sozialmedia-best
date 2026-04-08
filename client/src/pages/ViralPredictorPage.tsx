import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Zap, TrendingUp, Loader2, Target, Eye, Heart,
  Share2, BarChart3, Sparkles, ArrowRight, RefreshCw,
  CheckCircle, AlertTriangle, XCircle, Clock, Trophy,
} from "lucide-react";
import { GlowCard } from "@/components/GlowCard";

const PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "facebook", label: "Facebook" },
  { id: "youtube", label: "YouTube" },
  { id: "twitter", label: "X/Twitter" },
];

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; glow: string; icon: typeof Trophy }> = {
  S: { label: "VIRAL", color: "text-amber-300", bg: "bg-amber-500/20", glow: "shadow-[0_0_30px_rgba(212,175,55,0.4)]", icon: Trophy },
  A: { label: "SEHR GUT", color: "text-emerald-400", bg: "bg-emerald-500/20", glow: "shadow-[0_0_20px_rgba(52,211,153,0.3)]", icon: TrendingUp },
  B: { label: "GUT", color: "text-blue-400", bg: "bg-blue-500/20", glow: "shadow-[0_0_15px_rgba(96,165,250,0.2)]", icon: CheckCircle },
  C: { label: "MITTEL", color: "text-orange-400", bg: "bg-orange-500/20", glow: "shadow-[0_0_10px_rgba(251,146,60,0.2)]", icon: AlertTriangle },
  D: { label: "SCHWACH", color: "text-red-400", bg: "bg-red-500/20", glow: "shadow-[0_0_10px_rgba(248,113,113,0.2)]", icon: XCircle },
};

// Simple SVG Radar Chart
function RadarChart({ scores }: { scores: { label: string; value: number; max: number }[] }) {
  const cx = 120, cy = 120, r = 90;
  const n = scores.length;
  const angleStep = (2 * Math.PI) / n;

  const points = scores.map((s, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const ratio = s.value / s.max;
    return {
      x: cx + r * ratio * Math.cos(angle),
      y: cy + r * ratio * Math.sin(angle),
      labelX: cx + (r + 24) * Math.cos(angle),
      labelY: cy + (r + 24) * Math.sin(angle),
      label: s.label,
      value: s.value,
      max: s.max,
    };
  });

  const polygon = points.map(p => `${p.x},${p.y}`).join(" ");

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[280px] mx-auto">
      {/* Grid */}
      {rings.map(ring => (
        <polygon
          key={ring}
          points={scores.map((_, i) => {
            const angle = angleStep * i - Math.PI / 2;
            return `${cx + r * ring * Math.cos(angle)},${cy + r * ring * Math.sin(angle)}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(212,175,55,0.1)"
          strokeWidth="0.5"
        />
      ))}
      {/* Axis lines */}
      {scores.map((_, i) => {
        const angle = angleStep * i - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)}
            stroke="rgba(212,175,55,0.08)"
            strokeWidth="0.5"
          />
        );
      })}
      {/* Data polygon */}
      <polygon
        points={polygon}
        fill="rgba(212,175,55,0.15)"
        stroke="rgba(212,175,55,0.8)"
        strokeWidth="1.5"
      />
      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#d4af37" />
      ))}
      {/* Labels */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.labelX}
          y={p.labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted-foreground"
          fontSize="7"
        >
          {p.label} ({p.value})
        </text>
      ))}
    </svg>
  );
}

// Animated Score Circle
function ScoreCircle({ score, tier }: { score: number; tier: string }) {
  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.C;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative w-36 h-36 mx-auto ${tierConfig.glow} rounded-full`}>
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle
          cx="60" cy="60" r="54"
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="#f5d060" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold gradient-text-gold font-heading"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {score}
        </motion.span>
        <Badge className={`${tierConfig.bg} ${tierConfig.color} border-0 text-[10px] mt-0.5`}>
          {tierConfig.label}
        </Badge>
      </div>
    </div>
  );
}

export default function ViralPredictorPage() {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [hasMedia, setHasMedia] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);

  const quickMutation = trpc.viralPredictor.quick.useMutation();
  const deepMutation = trpc.viralPredictor.predict.useMutation();

  const isLoading = quickMutation.isPending || deepMutation.isPending;
  const quickResult = quickMutation.data;
  const deepResult = deepMutation.data;

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast.error("Bitte gib Content zum Analysieren ein!");
      return;
    }

    // Quick Score sofort
    quickMutation.mutate({ content, platform });

    // Deep Score parallel
    deepMutation.mutate({ content, platform, hasMedia, hasVideo });
  };

  const radarScores = useMemo(() => {
    if (!deepResult) return [];
    return [
      { label: "Hook", value: deepResult.hookScore, max: 20 },
      { label: "Emotion", value: deepResult.emotionScore, max: 20 },
      { label: "Teilbar", value: deepResult.shareabilityScore, max: 15 },
      { label: "Algorithmus", value: deepResult.algorithmFitScore, max: 15 },
      { label: "CTA", value: deepResult.ctaConversionScore, max: 15 },
      { label: "Trend", value: deepResult.trendAlignmentScore, max: 15 },
    ];
  }, [deepResult]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl space-y-4"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2 font-heading">
          <Zap className="h-5 w-5 text-primary" />
          <span className="gradient-text-gold">Viral Score Predictor</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          KI-basierte Viral-Vorhersage - Wisse VOR dem Posten, wie gut dein Content performt
        </p>
      </div>

      {/* Input Section */}
      <GlowCard>
        <div className="p-4 space-y-3">
          <div>
            <Label className="text-sm font-semibold mb-2 block">
              <Sparkles className="h-4 w-4 inline mr-1.5 text-primary" />
              Content analysieren
            </Label>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Füge deinen Post-Text hier ein, um den Viral Score zu berechnen..."
              className="min-h-[100px] bg-background/50"
            />
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label className="text-xs mb-1 block">Plattform</Label>
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                className="h-9 rounded-md border border-border/40 bg-background/50 px-3 text-sm"
              >
                {PLATFORMS.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={hasMedia}
                onChange={e => setHasMedia(e.target.checked)}
                className="rounded border-border/40"
              />
              Hat Bild
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={hasVideo}
                onChange={e => setHasVideo(e.target.checked)}
                className="rounded border-border/40"
              />
              Hat Video
            </label>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="h-9 gap-2 btn-gold"
                onClick={handleAnalyze}
                disabled={isLoading || !content.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analysiere...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Score berechnen
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </GlowCard>

      {/* Quick Score (sofort) */}
      <AnimatePresence>
        {quickResult && !deepResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <GlowCard>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm font-medium">Quick Score: {quickResult.quickScore}/100 — Deep-Analyse läuft...</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickResult.emotionalTriggers.map((t, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-amber-500/30 text-amber-400">{t}</Badge>
                  ))}
                  {quickResult.shareabilityFactors.map((f, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">{f}</Badge>
                  ))}
                </div>
                {quickResult.issues.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {quickResult.issues.map((issue, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-red-500/30 text-red-400">{issue}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </GlowCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deep Result */}
      <AnimatePresence>
        {deepResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Main Score + Radar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Score Circle */}
              <GlowCard>
                <div className="p-6 text-center">
                  <ScoreCircle score={deepResult.totalScore} tier={deepResult.tier} />
                  <p className="text-sm text-muted-foreground mt-3">{deepResult.feedback}</p>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="p-2 rounded-lg bg-background/50">
                      <Eye className="h-4 w-4 mx-auto text-primary mb-1" />
                      <p className="text-[10px] text-muted-foreground">Reichweite</p>
                      <p className="text-xs font-semibold">{deepResult.predictedReach}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-background/50">
                      <Heart className="h-4 w-4 mx-auto text-pink-400 mb-1" />
                      <p className="text-[10px] text-muted-foreground">Engagement</p>
                      <p className="text-xs font-semibold">{deepResult.predictedEngagement}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-background/50">
                      <TrendingUp className="h-4 w-4 mx-auto text-emerald-400 mb-1" />
                      <p className="text-[10px] text-muted-foreground">Viral-Chance</p>
                      <p className="text-xs font-semibold">{deepResult.viralProbability}</p>
                    </div>
                  </div>
                </div>
              </GlowCard>

              {/* Radar Chart */}
              <GlowCard>
                <div className="p-4">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Score-Breakdown
                  </h3>
                  <RadarChart scores={radarScores} />
                </div>
              </GlowCard>
            </div>

            {/* Score Bars */}
            <GlowCard>
              <div className="p-4 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Detailbewertung
                </h3>
                {radarScores.map((s, i) => {
                  const pct = (s.value / s.max) * 100;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{s.label}</span>
                        <span className="text-muted-foreground">{s.value}/{s.max}</span>
                      </div>
                      <div className="h-2 rounded-full bg-background/50 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: pct >= 75 ? "linear-gradient(90deg, #d4af37, #f5d060)" :
                              pct >= 50 ? "linear-gradient(90deg, #3b82f6, #60a5fa)" :
                              pct >= 25 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" :
                              "linear-gradient(90deg, #ef4444, #f87171)",
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlowCard>

            {/* Improvements + Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Improvements */}
              <GlowCard>
                <div className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Verbesserungsvorschläge
                  </h3>
                  <div className="space-y-2">
                    {deepResult.improvements.map((imp, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="flex items-start gap-2 p-2 rounded-lg bg-background/50"
                      >
                        <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="text-xs">{imp}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GlowCard>

              {/* Meta Info */}
              <GlowCard>
                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Empfehlungen
                  </h3>
                  <div className="space-y-2">
                    <div className="p-2 rounded-lg bg-background/50">
                      <p className="text-[10px] text-muted-foreground">Bester Posting-Zeitpunkt</p>
                      <p className="text-xs font-semibold">{deepResult.bestPostingTime}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-background/50">
                      <p className="text-[10px] text-muted-foreground">Vergleich mit Nische</p>
                      <p className="text-xs font-semibold">{deepResult.competitorBenchmark}</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 mt-2 border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => {
                      setContent("");
                      quickMutation.reset();
                      deepMutation.reset();
                    }}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Neuen Content analysieren
                  </Button>
                </div>
              </GlowCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
