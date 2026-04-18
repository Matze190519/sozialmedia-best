import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Flame, Eye, X, Loader2, TrendingUp, Target, Zap,
  RefreshCw, ArrowRight, Film, Rocket, AlertCircle, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

/**
 * TREND RADAR — Strategische Trend-Priorisierung für LR
 *
 * Holt Trends aus bestehendem Scanner und priorisiert sie nach:
 * - Fit zu LR
 * - Serienpotenzial
 * - Lead-Potenzial
 * - Urgency (jetzt / beobachten / ignorieren)
 */

type Urgency = "now" | "watch" | "skip";

interface RawTrend {
  id: number;
  title: string;
  platform: string;
  pillar?: string | null;
  viralScore?: number | null;
  sourceUrl?: string | null;
  description?: string | null;
}

interface TrendRadarItem {
  id: number;
  title: string;
  platform: string;
  pillar?: string;
  viralScore: number;
  sourceUrl?: string;
  fitScore: number;
  seriesPotential: number;
  leadPotential: number;
  urgency: Urgency;
  lrAngle: string;
  suggestedHook: string;
}

const LR_KEYWORDS = [
  "beauty", "haut", "aloe", "vitamin", "energie", "business", "nebeneinkommen",
  "passiv", "freiheit", "auto", "lifestyle", "team", "partner", "mindset",
  "morning", "routine", "gesundheit", "fitness", "protein", "collagen",
  "erfolg", "geld", "finanziell", "mallorca", "reisen", "remote",
];

function classifyTrend(t: RawTrend): TrendRadarItem {
  const title = (t.title || "").toLowerCase();
  const pillar = t.pillar || "";
  const viral = t.viralScore ?? 50;

  // LR-Fit: keyword matching
  const matchCount = LR_KEYWORDS.filter(k => title.includes(k)).length;
  const fitScore = Math.min(100, Math.round(matchCount * 15 + (pillar ? 30 : 0)));

  // Series potential: longer titles + business/lifestyle pillars → higher
  const seriesPotential = Math.min(100, Math.round(
    (title.length > 40 ? 30 : 15) +
    (pillar === "lifestyle" || pillar === "business" || pillar === "success" ? 30 : 15) +
    (viral / 2)
  ));

  // Lead potential: business/product pillars + LR keywords
  const leadPotential = Math.min(100, Math.round(
    (pillar?.includes("business") || pillar === "product" ? 40 : 20) +
    matchCount * 10 +
    (viral / 4)
  ));

  // Urgency: combines viral momentum + fit
  let urgency: Urgency = "skip";
  if (viral >= 70 && fitScore >= 40) urgency = "now";
  else if (viral >= 50 && fitScore >= 25) urgency = "watch";
  else if (viral >= 85) urgency = "now"; // Sehr viraler Trend auch wenn Fit niedrig

  // LR-Angle: auto-suggest based on title
  let lrAngle = "Anschluss an bestehende Lifestyle-Serie prüfen";
  if (title.includes("beauty") || title.includes("haut")) lrAngle = "Über Aloe Vera Routine verknüpfen";
  else if (title.includes("energie") || title.includes("morgen")) lrAngle = "Lifetakt als Energie-Trigger einbauen";
  else if (title.includes("business") || title.includes("geld")) lrAngle = "LR Business Opportunity als Antwort positionieren";
  else if (title.includes("auto") || title.includes("freiheit")) lrAngle = "Autokonzept + ortsunabhängig arbeiten verweben";
  else if (title.includes("routine") || title.includes("fitness")) lrAngle = "Produkt-Routine als Story verpacken";

  // Hook-Vorschlag
  const hooks = [
    `${t.title} — die LR-Version, die niemand erwartet.`,
    `Warum ${t.title} dein LR-Business verändern könnte.`,
    `${t.title}: Wir haben es mit LR kombiniert. Das Ergebnis:`,
  ];
  const suggestedHook = hooks[t.id % hooks.length];

  return {
    id: t.id,
    title: t.title,
    platform: t.platform,
    pillar: pillar || undefined,
    viralScore: viral,
    sourceUrl: t.sourceUrl || undefined,
    fitScore,
    seriesPotential,
    leadPotential,
    urgency,
    lrAngle,
    suggestedHook,
  };
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="font-semibold w-8 text-right">{value}</span>
    </div>
  );
}

function TrendCard({ item, onSelect, selected }: { item: TrendRadarItem; onSelect: () => void; selected: boolean }) {
  const urgencyColor = {
    now: "border-emerald-500/50 bg-emerald-500/5 text-emerald-400",
    watch: "border-amber-500/50 bg-amber-500/5 text-amber-400",
    skip: "border-red-500/30 bg-red-500/5 text-red-400/70",
  }[item.urgency];

  const urgencyLabel = { now: "🔥 JETZT", watch: "👁️ BEOBACHTEN", skip: "✕ ÜBERSPRINGEN" }[item.urgency];

  return (
    <Card
      className={`cursor-pointer transition-all ${urgencyColor} ${selected ? "ring-2 ring-primary" : ""}`}
      onClick={onSelect}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium line-clamp-2">{item.title}</p>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <Badge variant="outline" className="text-[9px]">{item.platform}</Badge>
              {item.pillar && <Badge variant="outline" className="text-[9px]">{item.pillar}</Badge>}
              <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30">
                Viral {item.viralScore}
              </Badge>
            </div>
          </div>
          <Badge variant="outline" className={`text-[9px] shrink-0 ${urgencyColor}`}>
            {urgencyLabel}
          </Badge>
        </div>

        <div className="space-y-1">
          <ScoreBar label="LR-Fit" value={item.fitScore} color="bg-primary" />
          <ScoreBar label="Serie" value={item.seriesPotential} color="bg-blue-400" />
          <ScoreBar label="Leads" value={item.leadPotential} color="bg-emerald-400" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function TrendRadarPage() {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<TrendRadarItem | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterPillar, setFilterPillar] = useState<string>("all");
  const [filterUrgency, setFilterUrgency] = useState<Urgency | "all">("all");

  const { data: topTrends, isLoading, refetch } = trpc.trends?.top.useQuery();
  const scanMutation = trpc.trends?.scan.useMutation();

  const classified: TrendRadarItem[] = useMemo(() => {
    if (!topTrends) return [];
    return (topTrends as RawTrend[]).map(classifyTrend);
  }, [topTrends]);

  const platforms = useMemo(() => {
    const set = new Set(classified.map(t => t.platform));
    return ["all", ...Array.from(set)];
  }, [classified]);

  const pillars = useMemo(() => {
    const set = new Set(classified.map(t => t.pillar).filter(Boolean) as string[]);
    return ["all", ...Array.from(set)];
  }, [classified]);

  const filtered = useMemo(() => {
    return classified.filter(t => {
      if (filterPlatform !== "all" && t.platform !== filterPlatform) return false;
      if (filterPillar !== "all" && t.pillar !== filterPillar) return false;
      if (filterUrgency !== "all" && t.urgency !== filterUrgency) return false;
      return true;
    }).sort((a, b) => {
      const priority = { now: 0, watch: 1, skip: 2 };
      return priority[a.urgency] - priority[b.urgency] || b.fitScore - a.fitScore;
    });
  }, [classified, filterPlatform, filterPillar, filterUrgency]);

  const zones = {
    now: filtered.filter(t => t.urgency === "now"),
    watch: filtered.filter(t => t.urgency === "watch"),
    skip: filtered.filter(t => t.urgency === "skip"),
  };

  const runFreshScan = async () => {
    try {
      await scanMutation?.mutateAsync();
      await refetch();
      toast.success("Trends neu gescannt");
    } catch {
      toast.error("Scan fehlgeschlagen");
    }
  };

  const useAsSeed = (tool: "series" | "generator" | "hook") => {
    if (!selected) return;
    const seed = {
      topic: selected.title,
      hook: selected.suggestedHook,
      angle: selected.lrAngle,
      pillar: selected.pillar,
      platform: selected.platform,
    };
    if (tool === "series") {
      localStorage.setItem("series-builder-seed", JSON.stringify(seed));
      toast.info("An Series Builder übergeben");
    } else if (tool === "generator") {
      setLocation(`/generator?topic=${encodeURIComponent(selected.suggestedHook)}`);
    } else if (tool === "hook") {
      localStorage.setItem("hook-engine-seed", JSON.stringify(seed));
      toast.info("An Hook Engine übergeben");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gold-text" style={{ fontFamily: "var(--font-heading)" }}>
          Trend Radar
        </h1>
        <p className="text-sm text-muted-foreground">
          Nicht nur „was trendet", sondern „welcher Trend passt zu LR, hat Serienpotenzial und ist noch nicht zu spät".
        </p>
      </div>

      {/* Controls */}
      <Card className="border-primary/30">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1">
                <Flame className="h-3 w-3 text-emerald-400" /> {zones.now.length} jetzt
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Eye className="h-3 w-3 text-amber-400" /> {zones.watch.length} beobachten
              </Badge>
              <Badge variant="outline" className="gap-1">
                <X className="h-3 w-3 text-red-400" /> {zones.skip.length} skip
              </Badge>
            </div>
            <Button size="sm" onClick={runFreshScan} disabled={scanMutation?.isPending}>
              {scanMutation?.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
              Frisch scannen
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1">
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
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={filterUrgency === "all" ? "default" : "outline"}
              className={`text-xs ${filterUrgency === "all" ? "btn-gold" : ""}`}
              onClick={() => setFilterUrgency("all")}
            >
              Alle
            </Button>
            <Button
              size="sm"
              variant={filterUrgency === "now" ? "default" : "outline"}
              className={`text-xs ${filterUrgency === "now" ? "btn-gold" : ""}`}
              onClick={() => setFilterUrgency("now")}
            >
              🔥 Jetzt nutzen
            </Button>
            <Button
              size="sm"
              variant={filterUrgency === "watch" ? "default" : "outline"}
              className={`text-xs ${filterUrgency === "watch" ? "btn-gold" : ""}`}
              onClick={() => setFilterUrgency("watch")}
            >
              👁️ Beobachten
            </Button>
            <Button
              size="sm"
              variant={filterUrgency === "skip" ? "default" : "outline"}
              className={`text-xs ${filterUrgency === "skip" ? "btn-gold" : ""}`}
              onClick={() => setFilterUrgency("skip")}
            >
              ✕ Ignorieren
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <Card className="border-border/30">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Trends werden analysiert…</p>
          </CardContent>
        </Card>
      )}

      {/* No trends */}
      {!isLoading && filtered.length === 0 && (
        <Card className="border-border/30">
          <CardContent className="p-12 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm">Keine Trends mit diesen Filtern.</p>
            <Button size="sm" onClick={runFreshScan}>
              <RefreshCw className="h-3 w-3 mr-1" /> Frische Trends scannen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results + Detail */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Trend list */}
          <div className="lg:col-span-2 space-y-4">
            {filterUrgency === "all" ? (
              <>
                {zones.now.length > 0 && (
                  <div>
                    <h2 className="font-semibold text-sm mb-2 flex items-center gap-2 text-emerald-400">
                      <Flame className="h-4 w-4" /> Jetzt nutzen ({zones.now.length})
                    </h2>
                    <div className="space-y-2">
                      {zones.now.map(item => (
                        <TrendCard key={item.id} item={item} onSelect={() => setSelected(item)} selected={selected?.id === item.id} />
                      ))}
                    </div>
                  </div>
                )}
                {zones.watch.length > 0 && (
                  <div>
                    <h2 className="font-semibold text-sm mb-2 flex items-center gap-2 text-amber-400">
                      <Eye className="h-4 w-4" /> Beobachten ({zones.watch.length})
                    </h2>
                    <div className="space-y-2">
                      {zones.watch.map(item => (
                        <TrendCard key={item.id} item={item} onSelect={() => setSelected(item)} selected={selected?.id === item.id} />
                      ))}
                    </div>
                  </div>
                )}
                {zones.skip.length > 0 && (
                  <div>
                    <h2 className="font-semibold text-sm mb-2 flex items-center gap-2 text-red-400/70">
                      <X className="h-4 w-4" /> Ignorieren ({zones.skip.length})
                    </h2>
                    <div className="space-y-2">
                      {zones.skip.map(item => (
                        <TrendCard key={item.id} item={item} onSelect={() => setSelected(item)} selected={selected?.id === item.id} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">
                {filtered.map(item => (
                  <TrendCard key={item.id} item={item} onSelect={() => setSelected(item)} selected={selected?.id === item.id} />
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            {selected ? (
              <Card className="border-primary/30">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Badge variant="outline" className="text-[10px] mb-2">{selected.platform} · {selected.pillar || "—"}</Badge>
                    <h3 className="text-sm font-semibold leading-snug">{selected.title}</h3>
                  </div>

                  <div className="space-y-1">
                    <ScoreBar label="LR-Fit" value={selected.fitScore} color="bg-primary" />
                    <ScoreBar label="Serie" value={selected.seriesPotential} color="bg-blue-400" />
                    <ScoreBar label="Leads" value={selected.leadPotential} color="bg-emerald-400" />
                    <ScoreBar label="Viral" value={selected.viralScore} color="bg-amber-400" />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">LR-Angle</label>
                    <p className="text-xs p-2 rounded bg-primary/5 border border-primary/20">{selected.lrAngle}</p>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Hook-Vorschlag</label>
                    <p className="text-xs p-2 rounded bg-primary/5 border border-primary/20">{selected.suggestedHook}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <Button size="sm" className="btn-gold w-full" onClick={() => useAsSeed("series")}>
                      <Film className="h-3 w-3 mr-1" /> Als Serie anlegen
                    </Button>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => useAsSeed("hook")}>
                      <Sparkles className="h-3 w-3 mr-1" /> An Hook Engine
                    </Button>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => useAsSeed("generator")}>
                      <ArrowRight className="h-3 w-3 mr-1" /> In Generator
                    </Button>
                    {selected.sourceUrl && (
                      <a href={selected.sourceUrl} target="_blank" rel="noreferrer" className="block">
                        <Button size="sm" variant="ghost" className="w-full text-xs">
                          <ArrowRight className="h-3 w-3 mr-1" /> Quelle öffnen
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-border/50">
                <CardContent className="p-6 text-center space-y-2">
                  <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-xs text-muted-foreground">Wähle einen Trend für Details, LR-Angle und Aktionen.</p>
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
            Aktuell: Priorisierung client-seitig durch Keyword-Matching + Score-Heuristik. Für präzise KI-Scoring: neue Endpoints <code>trendRadar.scoreFit</code>, <code>trendRadar.classifyUrgency</code>, <code>trendRadar.createSeriesSeed</code>. Spec in docs/VIRAL_STRATEGY.md.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
