import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Sparkles, TrendingUp, Target, Heart, Zap, Shield,
  ChevronDown, ChevronUp, Loader2, Wand2,
} from "lucide-react";

interface ScoreResult {
  totalScore: number;
  hookScore: number;
  emotionScore: number;
  ctaScore: number;
  platformFitScore: number;
  viralScore: number;
  brandScore: number;
  feedback: string;
  improvements: string[];
  predictedEngagement: string;
}

function ScoreBar({ label, score, max, icon: Icon, color }: {
  label: string;
  score: number;
  max: number;
  icon: React.ElementType;
  color: string;
}) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="h-3 w-3" />
          {label}
        </span>
        <span className="font-mono font-semibold">{score}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-accent/30 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : score >= 40 ? "#f97316" : "#ef4444";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-accent/20" />
        <motion.circle
          cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-bold"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {score}
        </motion.span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
}

export default function AIContentIntelligence({
  content,
  platform,
  contentType,
  hasMedia,
  hasVideo,
  postId,
  onImproved,
}: {
  content: string;
  platform: string;
  contentType: string;
  hasMedia: boolean;
  hasVideo: boolean;
  postId: number;
  onImproved?: (newContent: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);

  const scoreMut = trpc.contentIntelligence.score.useMutation({
    onSuccess: (data) => {
      setScoreResult(data as ScoreResult);
      setExpanded(true);
    },
    onError: (err) => toast.error("Bewertung fehlgeschlagen: " + err.message),
  });

  const improveMut = trpc.contentIntelligence.improve.useMutation({
    onSuccess: (data) => {
      if (onImproved) onImproved(data.improvedContent);
      toast.success("Content verbessert! Prüfe die Änderungen.");
    },
    onError: (err) => toast.error("Verbesserung fehlgeschlagen: " + err.message),
  });

  const handleScore = () => {
    scoreMut.mutate({ content, platform, contentType, hasMedia, hasVideo });
  };

  const handleImprove = (focusArea: "hook" | "cta" | "emotion" | "viral" | "all") => {
    improveMut.mutate({ content, platform, focusArea });
  };

  return (
    <div className="border border-purple-500/20 rounded-lg overflow-hidden bg-purple-500/5">
      {/* Trigger Button */}
      <button
        onClick={scoreResult ? () => setExpanded(!expanded) : handleScore}
        disabled={scoreMut.isPending}
        className="w-full flex items-center justify-between p-3 hover:bg-purple-500/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">KI Content Intelligence</span>
          {scoreResult && (
            <Badge
              className={`text-[10px] ${
                scoreResult.totalScore >= 80 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                scoreResult.totalScore >= 60 ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" :
                "bg-red-500/20 text-red-300 border-red-500/30"
              }`}
            >
              {scoreResult.totalScore}/100
            </Badge>
          )}
        </div>
        {scoreMut.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
        ) : scoreResult ? (
          expanded ? <ChevronUp className="h-4 w-4 text-purple-400" /> : <ChevronDown className="h-4 w-4 text-purple-400" />
        ) : (
          <Sparkles className="h-4 w-4 text-purple-400" />
        )}
      </button>

      {/* Expanded Score Panel */}
      <AnimatePresence>
        {expanded && scoreResult && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-purple-500/20 space-y-4">
              {/* Score Ring + Engagement Prediction */}
              <div className="flex items-center gap-4">
                <ScoreRing score={scoreResult.totalScore} />
                <div className="flex-1 space-y-2">
                  <div className="p-2 rounded-lg bg-accent/20">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Engagement-Prognose</p>
                    <p className="text-sm font-semibold text-emerald-300">{scoreResult.predictedEngagement}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{scoreResult.feedback}</p>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-2">
                <ScoreBar label="Hook" score={scoreResult.hookScore} max={20} icon={Zap} color="bg-amber-500" />
                <ScoreBar label="Emotion" score={scoreResult.emotionScore} max={20} icon={Heart} color="bg-pink-500" />
                <ScoreBar label="CTA" score={scoreResult.ctaScore} max={15} icon={Target} color="bg-blue-500" />
                <ScoreBar label="Plattform-Fit" score={scoreResult.platformFitScore} max={15} icon={TrendingUp} color="bg-cyan-500" />
                <ScoreBar label="Viral" score={scoreResult.viralScore} max={15} icon={Sparkles} color="bg-purple-500" />
                <ScoreBar label="Brand" score={scoreResult.brandScore} max={15} icon={Shield} color="bg-emerald-500" />
              </div>

              {/* Improvements */}
              {scoreResult.improvements && scoreResult.improvements.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Verbesserungsvorschläge:</p>
                  {scoreResult.improvements.map((imp, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>{imp}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Improve Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-purple-500/10">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] gap-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  onClick={() => handleImprove("all")}
                  disabled={improveMut.isPending}
                >
                  <Wand2 className="h-3 w-3" /> Alles verbessern
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] gap-1 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                  onClick={() => handleImprove("hook")}
                  disabled={improveMut.isPending}
                >
                  <Zap className="h-3 w-3" /> Hook
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] gap-1 border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                  onClick={() => handleImprove("cta")}
                  disabled={improveMut.isPending}
                >
                  <Target className="h-3 w-3" /> CTA
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] gap-1 border-pink-500/30 text-pink-300 hover:bg-pink-500/10"
                  onClick={() => handleImprove("emotion")}
                  disabled={improveMut.isPending}
                >
                  <Heart className="h-3 w-3" /> Emotion
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] gap-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  onClick={() => handleImprove("viral")}
                  disabled={improveMut.isPending}
                >
                  <Sparkles className="h-3 w-3" /> Viral
                </Button>
              </div>
              {improveMut.isPending && (
                <div className="flex items-center gap-2 text-xs text-purple-300">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  KI verbessert den Content...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
