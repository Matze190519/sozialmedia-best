import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Trophy, TrendingUp, AlertCircle, X, Loader2, Copy, Target,
  Sparkles, Film, Globe, ArrowRight, RefreshCw, Eye
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

/**
 * WINNER DETECTOR — Bewertet Posts und gibt nächste Moves vor
 *
 * Datenquellen (bestehend):
 * - content.list (eigene Posts)
 * - creatorSpy.latest (Wettbewerber-Signale)
 * - feedback.topPerforming (bewertete Posts)
 *
 * Ergebnis: replicate / variant / localize / series / stop
 */

type Label = "winner" | "maybe" | "stop";
type Move = "replicate" | "variant" | "localize" | "series" | "stop";

interface WinnerItem {
  id: string;
  title: string;
  preview: string;
  platform: string;
  format: string;
  score: number;
  label: Label;
  strengths: string[];
  risks: string[];
  recommendedNextMove: Move;
  subScores: {
    hook: number;
    comments: number;
    saves: number;
    ctaResponse: number;
    leadSignal: number;
    seriesPotential: number;
  };
}

function deriveSubScores(post: any): WinnerItem["subScores"] {
  const content = post.post?.content || post.post?.editedContent || "";
  const qualityScore = post.post?.qualityScore || 50;
  const feedbackScore = post.post?.feedbackScore || 0;
  const viralScore = post.post?.viralScore || 50;

  // Hook-Score: erste 100 Zeichen analysieren
  const hookText = content.slice(0, 100).toLowerCase();
  const hookSignals = ["warum", "stop", "niemand", "keiner", "geheim", "wahrheit", "ich", "mein", "pov", "?"].filter(s => hookText.includes(s)).length;
  const hook = Math.min(100, 40 + hookSignals * 12);

  // Comments: basiert auf feedback + length
  const comments = Math.min(100, Math.round(feedbackScore + (content.includes("?") ? 20 : 0)));

  // Saves: lange Captions + Listen sparen eher
  const saves = Math.min(100, Math.round(
    (content.length > 300 ? 30 : 10) +
    (/\d\.\s/.test(content) ? 25 : 10) +
    (qualityScore / 2)
  ));

  // CTA-Response: klare CTAs erhöhen
  const ctaSignals = ["kommentier", "dm ", "schreib", "folge", "link", "speicher", "markier"].filter(s => content.toLowerCase().includes(s)).length;
  const ctaResponse = Math.min(100, 30 + ctaSignals * 18);

  // Lead-Signal: spezifische Trigger-Wörter
  const leadSignals = ["info", "guide", "gespräch", "termin", "plan", "🔥", "start"].filter(s => content.toLowerCase().includes(s)).length;
  const leadSignal = Math.min(100, 20 + leadSignals * 15);

  // Serien-Potenzial: narrative Hooks
  const seriesSignals = ["tag 1", "teil", "folge", "episode", "weitergeht", "morgen"].filter(s => content.toLowerCase().includes(s)).length;
  const seriesPotential = Math.min(100, 30 + seriesSignals * 18 + (viralScore / 4));

  return { hook, comments, saves, ctaResponse, leadSignal, seriesPotential };
}

function buildWinnerItem(post: any): WinnerItem {
  const subScores = deriveSubScores(post);
  const score = Math.round(
    (subScores.hook * 0.25) +
    (subScores.comments * 0.15) +
    (subScores.saves * 0.15) +
    (subScores.ctaResponse * 0.15) +
    (subScores.leadSignal * 0.2) +
    (subScores.seriesPotential * 0.1)
  );

  let label: Label = "stop";
  if (score >= 70) label = "winner";
  else if (score >= 50) label = "maybe";

  const strengths: string[] = [];
  const risks: string[] = [];
  if (subScores.hook >= 70) strengths.push("Starker Hook");
  if (subScores.comments >= 60) strengths.push("Hohe Kommentar-Wahrscheinlichkeit");
  if (subScores.ctaResponse >= 70) strengths.push("Klarer CTA");
  if (subScores.leadSignal >= 60) strengths.push("Lead-Trigger aktiv");
  if (subScores.seriesPotential >= 60) strengths.push("Serien-tauglich");

  if (subScores.hook < 40) risks.push("Hook zu schwach");
  if (subScores.ctaResponse < 30) risks.push("Kein klarer CTA");
  if (subScores.leadSignal < 20) risks.push("Keine Lead-Mechanik");

  let recommendedNextMove: Move = "stop";
  if (label === "winner") {
    if (subScores.seriesPotential >= 60) recommendedNextMove = "series";
    else if (subScores.leadSignal >= 70) recommendedNextMove = "replicate";
    else recommendedNextMove = "variant";
  } else if (label === "maybe") {
    recommendedNextMove = "variant";
  } else {
    recommendedNextMove = risks.length > 2 ? "stop" : "variant";
  }

  // Prüfen ob lokalisierbar (deutschsprachig mit klarem Wert)
  if (label === "winner" && subScores.leadSignal >= 60 && score >= 75) {
    recommendedNextMove = "localize";
  }

  const content = post.post?.content || post.post?.editedContent || "";
  return {
    id: String(post.post?.id ?? Math.random()),
    title: post.post?.topic || content.slice(0, 60) + "...",
    preview: content.slice(0, 200),
    platform: (post.post?.platforms as string[])?.[0] || "instagram",
    format: post.post?.contentType || "post",
    score,
    label,
    strengths,
    risks,
    recommendedNextMove,
    subScores,
  };
}

const LABEL_CONFIG = {
  winner: { icon: Trophy, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "WINNER" },
  maybe: { icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "MAYBE" },
  stop: { icon: X, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", label: "STOP" },
};

const MOVE_CONFIG: Record<Move, { icon: typeof Trophy; label: string; color: string }> = {
  replicate: { icon: Copy, label: "Replizieren", color: "text-emerald-400" },
  variant: { icon: Sparkles, label: "Varianten bauen", color: "text-blue-400" },
  localize: { icon: Globe, label: "Lokalisieren", color: "text-cyan-400" },
  series: { icon: Film, label: "Als Serie ausbauen", color: "text-primary" },
  stop: { icon: X, label: "Stoppen", color: "text-red-400" },
};

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-muted-foreground w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="font-semibold w-8 text-right">{value}</span>
    </div>
  );
}

function WinnerCard({ item, selected, onSelect }: { item: WinnerItem; selected: boolean; onSelect: () => void }) {
  const config = LABEL_CONFIG[item.label];
  const Icon = config.icon;

  return (
    <Card
      className={`cursor-pointer transition-all ${config.border} ${config.bg} ${selected ? "ring-2 ring-primary" : ""}`}
      onClick={onSelect}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold line-clamp-2">{item.title}</p>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <Badge variant="outline" className="text-[9px]">{item.platform}</Badge>
              <Badge variant="outline" className="text-[9px]">{item.format}</Badge>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant="outline" className={`text-[9px] ${config.color} ${config.border}`}>
              <Icon className="h-2.5 w-2.5 mr-0.5" /> {config.label}
            </Badge>
            <span className="text-xs font-bold text-primary">{item.score}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {item.strengths.slice(0, 2).map((s, i) => (
            <Badge key={i} variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">
              + {s}
            </Badge>
          ))}
          {item.risks.slice(0, 1).map((r, i) => (
            <Badge key={i} variant="outline" className="text-[9px] text-red-400 border-red-500/30">
              − {r}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function WinnerDetectorPage() {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<WinnerItem | null>(null);
  const [filterLabel, setFilterLabel] = useState<Label | "all">("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");

  const { data: recentPosts, isLoading, refetch } = trpc.content?.list.useQuery({ limit: 50 });

  const items: WinnerItem[] = useMemo(() => {
    if (!recentPosts) return [];
    return (recentPosts as any[]).map(buildWinnerItem);
  }, [recentPosts]);

  const platforms = useMemo(() => {
    return ["all", ...Array.from(new Set(items.map(i => i.platform)))];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter(i => {
      if (filterLabel !== "all" && i.label !== filterLabel) return false;
      if (filterPlatform !== "all" && i.platform !== filterPlatform) return false;
      return true;
    }).sort((a, b) => b.score - a.score);
  }, [items, filterLabel, filterPlatform]);

  const zones = {
    winner: items.filter(i => i.label === "winner").length,
    maybe: items.filter(i => i.label === "maybe").length,
    stop: items.filter(i => i.label === "stop").length,
  };

  // Pattern detection: find common strengths
  const patterns = useMemo(() => {
    const winnerItems = items.filter(i => i.label === "winner");
    const strengthCount: Record<string, number> = {};
    winnerItems.forEach(i => i.strengths.forEach(s => {
      strengthCount[s] = (strengthCount[s] || 0) + 1;
    }));
    return Object.entries(strengthCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [items]);

  const executeMove = (move: Move) => {
    if (!selected) return;
    if (move === "series") {
      localStorage.setItem("series-builder-seed", JSON.stringify({
        topic: selected.title,
        hook: selected.preview.slice(0, 80),
      }));
      toast.info("An Series Builder übergeben");
    } else if (move === "variant") {
      localStorage.setItem("variant-factory-seed", JSON.stringify(selected));
      toast.info("An Variant Factory übergeben");
    } else if (move === "replicate") {
      setLocation(`/generator?topic=${encodeURIComponent(selected.title)}`);
    } else if (move === "localize") {
      localStorage.setItem("localization-seed", JSON.stringify(selected));
      toast.info("An Localization übergeben");
    } else {
      toast.info("Als 'stopp' markiert — wird nicht mehr priorisiert");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gold-text" style={{ fontFamily: "var(--font-heading)" }}>
          Winner Detector
        </h1>
        <p className="text-sm text-muted-foreground">
          Welche Posts verdienen eine zweite Welle? Replizieren, Variante, Lokalisieren, als Serie ausbauen oder stoppen.
        </p>
      </div>

      {/* Stats & Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="border-primary/30">
          <CardContent className="p-4 flex items-center justify-around">
            <div className="text-center">
              <Trophy className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-emerald-400">{zones.winner}</div>
              <div className="text-[10px] text-muted-foreground">Winner</div>
            </div>
            <div className="text-center">
              <TrendingUp className="h-5 w-5 text-amber-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-amber-400">{zones.maybe}</div>
              <div className="text-[10px] text-muted-foreground">Maybe</div>
            </div>
            <div className="text-center">
              <X className="h-5 w-5 text-red-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-red-400">{zones.stop}</div>
              <div className="text-[10px] text-muted-foreground">Stop</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Patterns diese Woche</h3>
            </div>
            {patterns.length > 0 ? (
              <div className="space-y-1">
                {patterns.map(([name, count], i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{name}</span>
                    <Badge variant="outline" className="text-[9px]">{count}x</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground">Noch keine Gewinner-Patterns erkannt</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-primary/30">
        <CardContent className="p-3 flex items-center gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
            Aktualisieren
          </Button>
          <div className="flex gap-1 flex-wrap">
            {(["all", "winner", "maybe", "stop"] as const).map(l => (
              <Button
                key={l}
                size="sm"
                variant={filterLabel === l ? "default" : "outline"}
                className={`text-xs ${filterLabel === l ? "btn-gold" : ""}`}
                onClick={() => setFilterLabel(l)}
              >
                {l === "all" ? "Alle" : LABEL_CONFIG[l].label}
              </Button>
            ))}
          </div>
          {platforms.length > 1 && (
            <div className="flex gap-1 flex-wrap">
              {platforms.map(p => (
                <Button
                  key={p}
                  size="sm"
                  variant={filterPlatform === p ? "default" : "outline"}
                  className={`text-xs ${filterPlatform === p ? "btn-gold" : ""}`}
                  onClick={() => setFilterPlatform(p)}
                >
                  {p === "all" ? "Alle Plattformen" : p}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="border-border/30">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Posts werden analysiert…</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && filtered.length === 0 && (
        <Card className="border-border/30">
          <CardContent className="p-12 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm">Keine Posts mit diesen Filtern.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-2">
            <h2 className="text-sm font-semibold mb-2">{filtered.length} Posts</h2>
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <WinnerCard item={item} onSelect={() => setSelected(item)} selected={selected?.id === item.id} />
              </motion.div>
            ))}
          </div>

          <div className="lg:sticky lg:top-4 lg:self-start">
            {selected ? (
              <Card className="border-primary/30">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Badge variant="outline" className={`text-[10px] mb-2 ${LABEL_CONFIG[selected.label].color}`}>
                      {LABEL_CONFIG[selected.label].label} · Score {selected.score}
                    </Badge>
                    <h3 className="text-sm font-semibold leading-snug mb-1">{selected.title}</h3>
                    <p className="text-[10px] text-muted-foreground line-clamp-4">{selected.preview}</p>
                  </div>

                  <div className="space-y-1">
                    <ScoreBar label="Hook" value={selected.subScores.hook} color="bg-amber-400" />
                    <ScoreBar label="Kommentare" value={selected.subScores.comments} color="bg-blue-400" />
                    <ScoreBar label="Saves" value={selected.subScores.saves} color="bg-purple-400" />
                    <ScoreBar label="CTA-Response" value={selected.subScores.ctaResponse} color="bg-emerald-400" />
                    <ScoreBar label="Lead-Signal" value={selected.subScores.leadSignal} color="bg-primary" />
                    <ScoreBar label="Serie-Potenzial" value={selected.subScores.seriesPotential} color="bg-cyan-400" />
                  </div>

                  {selected.strengths.length > 0 && (
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-emerald-400 mb-1 block">Stärken</label>
                      <ul className="space-y-1">
                        {selected.strengths.map((s, i) => (
                          <li key={i} className="text-xs flex items-start gap-1">
                            <span className="text-emerald-400">+</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selected.risks.length > 0 && (
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-red-400 mb-1 block">Risiken</label>
                      <ul className="space-y-1">
                        {selected.risks.map((r, i) => (
                          <li key={i} className="text-xs flex items-start gap-1">
                            <span className="text-red-400">−</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-3 border-t border-border/50 space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded bg-primary/10 border border-primary/30">
                      <Target className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Empfohlener nächster Move</p>
                        <p className="text-sm font-semibold">
                          {MOVE_CONFIG[selected.recommendedNextMove].label}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {(["replicate", "variant", "series", "localize", "stop"] as Move[]).map(move => {
                        const config = MOVE_CONFIG[move];
                        const Icon = config.icon;
                        const isPrimary = move === selected.recommendedNextMove;
                        return (
                          <Button
                            key={move}
                            size="sm"
                            variant={isPrimary ? "default" : "outline"}
                            className={isPrimary ? "btn-gold" : ""}
                            onClick={() => executeMove(move)}
                          >
                            <Icon className={`h-3 w-3 mr-1 ${!isPrimary ? config.color : ""}`} />
                            {config.label}
                            {isPrimary && <ArrowRight className="h-3 w-3 ml-auto" />}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-border/50">
                <CardContent className="p-6 text-center space-y-2">
                  <Trophy className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-xs text-muted-foreground">Wähle einen Post für Detail-Analyse und nächsten Move.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Optional an Manus:</p>
          <p className="text-muted-foreground">
            Aktuell: Scoring aus vorhandenen Post-Daten (quality, feedback, viral, Content-Heuristik). Für echte Performance-Daten: neue Endpoints <code>winnerDetector.scoreContent</code>, <code>winnerDetector.extractPattern</code>, <code>winnerDetector.queueVariant</code> + Integration mit Blotato-Analytics + Platform-APIs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
