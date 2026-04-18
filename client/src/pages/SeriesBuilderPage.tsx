import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film, Plus, Trash2, Edit3, Copy, Check, Loader2,
  Wand2, Calendar, Target, Zap, ArrowRight, FileText,
  Clapperboard, Sparkles, Users
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

/**
 * SERIES BUILDER — Aus Einzelidee eine 5/10/20-teilige Serie bauen
 *
 * Erzeugt Episodenbogen mit Hook, Konflikt, Cliffhanger, CTA, LR-Integration.
 * Export: Kalender, Beat-Sheet, Shot-Ready, Variant-Ready.
 */

type SeriesFormat = "sci-fi" | "comedy" | "hero" | "lifestyle" | "story";
type SeriesTarget = "follower" | "engagement" | "lead";

interface SeriesEpisode {
  episodeNumber: number;
  title: string;
  hook: string;
  storyArc: string;
  cliffhanger: string;
  cta: string;
  estimatedLengthSec: number;
  productIntegration: string;
}

interface SeriesPlan {
  id: string;
  title: string;
  premise: string;
  format: SeriesFormat;
  target: SeriesTarget;
  episodes: SeriesEpisode[];
}

const FORMATS: { id: SeriesFormat; label: string; emoji: string; desc: string }[] = [
  { id: "sci-fi", label: "Sci-Fi", emoji: "🌌", desc: "Parallelwelt, Upgrades, Systeme" },
  { id: "comedy", label: "Comedy", emoji: "😂", desc: "POV, Cringe, Alltags-Eskalation" },
  { id: "hero", label: "Hero", emoji: "🦸", desc: "Produkte als Superhelden" },
  { id: "lifestyle", label: "Lifestyle", emoji: "🏝️", desc: "Reise, Freiheit, Luxus" },
  { id: "story", label: "Story", emoji: "📖", desc: "Transformation, Reise, Drama" },
];

const TARGETS: { id: SeriesTarget; label: string }[] = [
  { id: "follower", label: "Follower" },
  { id: "engagement", label: "Engagement" },
  { id: "lead", label: "Leads" },
];

const LENGTH_OPTIONS = [5, 10, 20] as const;

function buildEpisodeTemplate(
  format: SeriesFormat,
  topic: string,
  episodeNum: number,
  total: number,
  target: SeriesTarget
): SeriesEpisode {
  const ctaByTarget: Record<SeriesTarget, string> = {
    follower: `Folge mir für Teil ${episodeNum + 1}. Neue Folge morgen.`,
    engagement: `Was denkst du? Kommentiere deine Theorie.`,
    lead: `Kommentiere 🔥 für Infos per DM.`,
  };

  const arcs: Record<SeriesFormat, string[]> = {
    "sci-fi": ["Entdeckung", "Aufklärung", "Konflikt", "Wendepunkt", "Enthüllung", "Eskalation", "Verrat", "Verbündete", "Finale Konfrontation", "Neue Realität"],
    comedy: ["Normaler Tag", "Erste Eskalation", "Missverständnis", "Peinlich", "Öffentlich blamiert", "Insider-Witz", "Wiedererkennung", "Cameo", "Nachspiel", "Happy End"],
    hero: ["Origin Story", "Schwäche entdeckt", "Mentor", "Erste Probe", "Rückschlag", "Wachstum", "Team-Up", "Big Boss", "Finale", "Nachfolge"],
    lifestyle: ["Der Wunsch", "Erste Schritte", "Widerstand", "Kleine Siege", "Großer Sprung", "Lebensveränderung", "Routine-Shift", "Traumrealität", "Zurückgeben", "Neue Ziele"],
    story: ["Ausgangslage", "Auslöser", "Entscheidung", "Hindernis", "Tiefpunkt", "Wendepunkt", "Kampf", "Transformation", "Erfolg", "Reflexion"],
  };

  const cliffhangers = [
    "...und dann passierte genau DAS.",
    "Morgen zeige ich dir, was niemand erwartet hat.",
    "Teil 2 wird noch krasser — bleib dran.",
    "Das, was gleich folgt, hat alles verändert.",
    "Und dann klingelte mein Handy.",
  ];

  return {
    episodeNumber: episodeNum,
    title: `Folge ${episodeNum}: ${arcs[format][Math.min(episodeNum - 1, 9)]}`,
    hook: episodeNum === 1
      ? `Das ist Teil 1 einer ${total}-teiligen Serie über ${topic}. Du willst das NICHT verpassen.`
      : `Teil ${episodeNum}/${total}: ${topic} — hier wird es ernst.`,
    storyArc: `${arcs[format][Math.min(episodeNum - 1, 9)]} — konkretisieren mit Zielgruppe, Hook-Moment und Payoff.`,
    cliffhanger: cliffhangers[episodeNum % cliffhangers.length],
    cta: ctaByTarget[target],
    estimatedLengthSec: format === "comedy" ? 25 : format === "sci-fi" ? 35 : 30,
    productIntegration: `LR-Produkt oder -Konzept als natürliche Zutat (nicht als Werbeblock).`,
  };
}

function buildDefaultPlan(
  topic: string,
  format: SeriesFormat,
  target: SeriesTarget,
  length: number
): SeriesPlan {
  return {
    id: `series-${Date.now()}`,
    title: topic,
    premise: `Eine ${length}-teilige ${FORMATS.find(f => f.id === format)?.label}-Serie über ${topic}.`,
    format,
    target,
    episodes: Array.from({ length }, (_, i) =>
      buildEpisodeTemplate(format, topic, i + 1, length, target)
    ),
  };
}

function StatusBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <Badge
      variant="outline"
      className={`text-[9px] ${ok ? "border-emerald-500/50 text-emerald-400" : "border-amber-500/30 text-amber-400"}`}
    >
      {ok ? <Check className="h-2.5 w-2.5 mr-0.5" /> : "..."}
      {label}
    </Badge>
  );
}

function EpisodeCard({
  ep,
  onChange,
  onDelete,
  canDelete,
}: {
  ep: SeriesEpisode;
  onChange: (ep: SeriesEpisode) => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const update = (patch: Partial<SeriesEpisode>) => onChange({ ...ep, ...patch });

  return (
    <Card className="border-border/50">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
            {ep.episodeNumber}
          </div>
          <Input
            value={ep.title}
            onChange={(e) => update({ title: e.target.value })}
            className="text-sm font-semibold h-8"
          />
          <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)}>
            <Edit3 className="h-3 w-3" />
          </Button>
          {canDelete && (
            <Button size="sm" variant="ghost" onClick={onDelete}>
              <Trash2 className="h-3 w-3 text-red-400" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <StatusBadge label="Hook" ok={ep.hook.length > 20} />
          <StatusBadge label="Cliff" ok={ep.cliffhanger.length > 10} />
          <StatusBadge label="CTA" ok={ep.cta.length > 10} />
          <Badge variant="outline" className="text-[9px]">{ep.estimatedLengthSec}s</Badge>
        </div>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2"
          >
            <div>
              <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Hook (erste 3 Sekunden)</label>
              <Textarea
                value={ep.hook}
                onChange={(e) => update({ hook: e.target.value })}
                rows={2}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Story-Arc</label>
              <Textarea
                value={ep.storyArc}
                onChange={(e) => update({ storyArc: e.target.value })}
                rows={2}
                className="text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Cliffhanger</label>
                <Textarea
                  value={ep.cliffhanger}
                  onChange={(e) => update({ cliffhanger: e.target.value })}
                  rows={2}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">CTA</label>
                <Textarea
                  value={ep.cta}
                  onChange={(e) => update({ cta: e.target.value })}
                  rows={2}
                  className="text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Produkt-Integration</label>
              <Input
                value={ep.productIntegration}
                onChange={(e) => update({ productIntegration: e.target.value })}
                className="text-xs h-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-muted-foreground">Länge:</label>
              <Input
                type="number"
                value={ep.estimatedLengthSec}
                onChange={(e) => update({ estimatedLengthSec: parseInt(e.target.value) || 30 })}
                className="w-20 h-7 text-xs"
              />
              <span className="text-[10px] text-muted-foreground">Sekunden</span>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SeriesBuilderPage() {
  const [, setLocation] = useLocation();

  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<SeriesFormat>("story");
  const [target, setTarget] = useState<SeriesTarget>("lead");
  const [length, setLength] = useState<number>(10);

  const [plan, setPlan] = useState<SeriesPlan | null>(null);
  const [generating, setGenerating] = useState(false);

  const generateMutation = trpc.content.generate?.useMutation();

  // Check seed from Hook Engine
  useEffect(() => {
    try {
      const seed = localStorage.getItem("series-builder-seed");
      if (seed) {
        const data = JSON.parse(seed);
        if (data.topic && !topic) setTopic(data.topic);
        localStorage.removeItem("series-builder-seed");
        toast.info("Seed aus Hook Engine übernommen");
      }
    } catch { /* ignore */ }
  }, []);

  const generate = async () => {
    if (!topic.trim()) {
      toast.error("Thema / Premise eingeben");
      return;
    }
    setGenerating(true);

    try {
      // Primary: template-based generation (instant, always works)
      const newPlan = buildDefaultPlan(topic, format, target, length);
      setPlan(newPlan);

      // Optional: enrich first 3 episodes via AI
      try {
        await generateMutation?.mutateAsync({
          contentType: "hooks",
          topic: `Serie: ${topic}`,
          pillar: format === "sci-fi" ? "lifestyle" : "business_opportunity",
          count: 3,
          context: `${length}-teilige ${format}-Serie. Erzeuge 3 alternative Episoden-Hooks für Folge 1, 2, 3.`,
        });
      } catch { /* silent */ }

      toast.success(`${length}-teilige Serie erstellt`);
    } catch (err: any) {
      toast.error(`Fehler: ${err.message || "Generierung fehlgeschlagen"}`);
    } finally {
      setGenerating(false);
    }
  };

  const updateEpisode = (idx: number, ep: SeriesEpisode) => {
    if (!plan) return;
    const episodes = [...plan.episodes];
    episodes[idx] = ep;
    setPlan({ ...plan, episodes });
  };

  const deleteEpisode = (idx: number) => {
    if (!plan) return;
    const episodes = plan.episodes
      .filter((_, i) => i !== idx)
      .map((ep, i) => ({ ...ep, episodeNumber: i + 1 }));
    setPlan({ ...plan, episodes });
  };

  const addEpisode = () => {
    if (!plan) return;
    const newNum = plan.episodes.length + 1;
    setPlan({
      ...plan,
      episodes: [...plan.episodes, buildEpisodeTemplate(plan.format, plan.title, newNum, newNum, plan.target)],
    });
  };

  const exportBeatSheet = () => {
    if (!plan) return;
    const text = [
      `# SERIE: ${plan.title}`,
      `Format: ${plan.format} · Ziel: ${plan.target} · ${plan.episodes.length} Episoden`,
      `Premise: ${plan.premise}`,
      "",
      ...plan.episodes.flatMap(ep => [
        `## ${ep.title}`,
        `**Hook:** ${ep.hook}`,
        `**Story:** ${ep.storyArc}`,
        `**Cliffhanger:** ${ep.cliffhanger}`,
        `**CTA:** ${ep.cta}`,
        `**Produkt:** ${ep.productIntegration}`,
        `**Länge:** ${ep.estimatedLengthSec}s`,
        "",
      ]),
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Beat-Sheet kopiert");
  };

  const exportToShotPlanner = () => {
    if (!plan) return;
    localStorage.setItem("shot-planner-seed", JSON.stringify(plan));
    toast.info("An Shot Planner übergeben (Seed gespeichert)");
  };

  const exportToVariantFactory = (ep: SeriesEpisode) => {
    localStorage.setItem("variant-factory-seed", JSON.stringify({ series: plan?.title, episode: ep }));
    toast.info(`Folge ${ep.episodeNumber} an Variant Factory übergeben`);
  };

  const openFirstEpisodeInGenerator = () => {
    if (!plan || plan.episodes.length === 0) return;
    const ep = plan.episodes[0];
    setLocation(`/generator?topic=${encodeURIComponent(`${plan.title} — ${ep.title}: ${ep.hook}`)}`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gold-text" style={{ fontFamily: "var(--font-heading)" }}>
          Series Builder
        </h1>
        <p className="text-sm text-muted-foreground">
          Aus einer Idee eine echte Franchise mit Cliffhangern, CTA-Logik und Veröffentlichungsplan.
        </p>
      </div>

      {/* Setup Form */}
      {!plan && (
        <Card className="border-primary/30">
          <CardContent className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Thema / Premise *</label>
              <Textarea
                placeholder="z.B. Nova Lenz entdeckt eine Parallelwelt, in der LR-Routinen echte Upgrades sind."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Format</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {FORMATS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      format === f.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{f.emoji}</div>
                    <div className="text-xs font-semibold">{f.label}</div>
                    <div className="text-[10px] text-muted-foreground">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Hauptziel</label>
                <div className="flex gap-2">
                  {TARGETS.map(t => (
                    <Button
                      key={t.id}
                      variant={target === t.id ? "default" : "outline"}
                      className={target === t.id ? "btn-gold" : ""}
                      onClick={() => setTarget(t.id)}
                    >
                      {t.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Serien-Länge</label>
                <div className="flex gap-2">
                  {LENGTH_OPTIONS.map(l => (
                    <Button
                      key={l}
                      variant={length === l ? "default" : "outline"}
                      className={length === l ? "btn-gold" : ""}
                      onClick={() => setLength(l)}
                    >
                      {l} Folgen
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="btn-gold w-full h-12"
              onClick={generate}
              disabled={generating || !topic.trim()}
            >
              {generating ? (
                <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Serie wird konstruiert...</>
              ) : (
                <><Film className="h-5 w-5 mr-2" /> Serie erstellen ({length} Folgen)</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Plan Canvas */}
      {plan && (
        <>
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Badge variant="outline" className="text-[10px] mb-2">{FORMATS.find(f => f.id === plan.format)?.label}</Badge>
                  <Input
                    value={plan.title}
                    onChange={(e) => setPlan({ ...plan, title: e.target.value })}
                    className="text-lg font-bold h-10 mb-2"
                  />
                  <Textarea
                    value={plan.premise}
                    onChange={(e) => setPlan({ ...plan, premise: e.target.value })}
                    rows={2}
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <Badge variant="outline" className="text-[10px]">
                    <Film className="h-2.5 w-2.5 mr-1" /> {plan.episodes.length} Folgen
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    <Target className="h-2.5 w-2.5 mr-1" /> {plan.target}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    <Calendar className="h-2.5 w-2.5 mr-1" /> ~{Math.ceil(plan.episodes.length / 3)}w Laufzeit
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={exportBeatSheet}>
                  <FileText className="h-3 w-3 mr-1" /> Beat-Sheet kopieren
                </Button>
                <Button size="sm" variant="outline" onClick={exportToShotPlanner}>
                  <Clapperboard className="h-3 w-3 mr-1" /> An Shot Planner
                </Button>
                <Button size="sm" variant="outline" onClick={openFirstEpisodeInGenerator}>
                  <ArrowRight className="h-3 w-3 mr-1" /> Folge 1 im Generator
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setPlan(null); setTopic(""); }}>
                  <Plus className="h-3 w-3 mr-1" /> Neue Serie
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Episoden</h2>
              <Button size="sm" variant="outline" onClick={addEpisode}>
                <Plus className="h-3 w-3 mr-1" /> Folge hinzufügen
              </Button>
            </div>
            <AnimatePresence>
              {plan.episodes.map((ep, i) => (
                <motion.div
                  key={ep.episodeNumber}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <EpisodeCard
                    ep={ep}
                    onChange={(updated) => updateEpisode(i, updated)}
                    onDelete={() => deleteEpisode(i)}
                    canDelete={plan.episodes.length > 1}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="border-primary/20">
              <CardContent className="p-4 text-center space-y-2">
                <Clapperboard className="h-6 w-6 text-primary mx-auto" />
                <h3 className="text-sm font-semibold">Shot Planner</h3>
                <p className="text-[10px] text-muted-foreground">Episoden in 5-12 Shots zerlegen</p>
                <Button size="sm" variant="outline" className="w-full" onClick={exportToShotPlanner}>
                  Export
                </Button>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="p-4 text-center space-y-2">
                <Sparkles className="h-6 w-6 text-primary mx-auto" />
                <h3 className="text-sm font-semibold">Variant Factory</h3>
                <p className="text-[10px] text-muted-foreground">1 Folge → 30 Varianten</p>
                <Button size="sm" variant="outline" className="w-full" onClick={() => exportToVariantFactory(plan.episodes[0])}>
                  Folge 1 exportieren
                </Button>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="p-4 text-center space-y-2">
                <Users className="h-6 w-6 text-primary mx-auto" />
                <h3 className="text-sm font-semibold">Character Bible</h3>
                <p className="text-[10px] text-muted-foreground">Figur + Welt dauerhaft speichern</p>
                <Button size="sm" variant="outline" className="w-full" disabled>
                  Später verlinken
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Optional an Manus:</p>
          <p className="text-muted-foreground">
            Für KI-basiertes Generieren kompletter Serien: neue Endpoints <code>seriesBuilder.generateSeason</code>, <code>seriesBuilder.rewriteEpisode</code>, <code>seriesBuilder.exportBeatSheet</code> (Spec in docs/VIRAL_STRATEGY.md). Aktuell: Template-basierte Generierung + bearbeitbar.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
