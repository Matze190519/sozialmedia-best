import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  AlertTriangle, TrendingUp, TrendingDown, Minus, MessageSquare, Phone, Mail,
  Copy, Check, Flame, Wand2, GraduationCap, Filter, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

/**
 * OBJECTION HEATMAP — Wiederkehrende Einwände als strategisches Markt-Signal
 *
 * Aggregiert aus Kommentaren, DMs, Calls.
 * Zeigt Trends, Beispiele, Antwort-Familien.
 */

type Source = "comment" | "dm" | "call";
type Trend = "up" | "flat" | "down";

interface ObjectionSignal {
  id: string;
  label: string;
  category: string;
  source: Source;
  frequency: number;
  trend: Trend;
  trendPercent: number;
  recommendedAngles: string[];
  examples: Array<{ text: string; source: Source; date: string }>;
  lastSeen: string;
  severity: "manageable" | "concerning" | "critical";
}

const INITIAL_OBJECTIONS: ObjectionSignal[] = [
  {
    id: "o1",
    label: "Keine Zeit",
    category: "Zeit",
    source: "comment",
    frequency: 47,
    trend: "up",
    trendPercent: 23,
    recommendedAngles: [
      "Zeit-Reframe: Was kostet es dich, in 12 Monaten gleich da zu stehen?",
      "Mikro-Commitment: 'Wäre 1 Gespräch mit 15 Min ok, um zu sehen ob es überhaupt zu dir passt?'",
      "Beweis: Partner-Story mit Familie + Vollzeit-Job + LR",
    ],
    examples: [
      { text: "Hab ne Familie, keine Zeit für sowas", source: "comment", date: "vor 2h" },
      { text: "Wann soll ich das machen? Zwischen Job und Kindern?", source: "dm", date: "vor 5h" },
    ],
    lastSeen: "vor 30 Min",
    severity: "concerning",
  },
  {
    id: "o2",
    label: "Schneeballsystem / MLM-Vorurteil",
    category: "Vertrauen",
    source: "comment",
    frequency: 38,
    trend: "flat",
    trendPercent: 2,
    recommendedAngles: [
      "Respektvolle Antwort, keine Verteidigung: 'Verstehe warum du das denkst. Ich hab selbst recherchiert — hier die 3 Fakten...'",
      "Transparenz-Content: Offen alle Zahlen zeigen",
      "Struktur-Erklärung: MLM vs. Network Marketing Unterschied",
    ],
    examples: [
      { text: "Is das nich Schneeballsystem?", source: "comment", date: "vor 1h" },
      { text: "Solche MLM Sachen sind immer sketchy", source: "comment", date: "vor 8h" },
    ],
    lastSeen: "vor 1h",
    severity: "manageable",
  },
  {
    id: "o3",
    label: "Zu teuer",
    category: "Geld",
    source: "dm",
    frequency: 31,
    trend: "up",
    trendPercent: 18,
    recommendedAngles: [
      "Value-Reframe: 'Die Frage ist nicht was es kostet, sondern was es kostet nix zu ändern'",
      "Einstieg-Splitting: Kleinere Pakete im Vordergrund",
      "ROI-Rechnung: Nach 6 Monaten bezahlt sich selbst",
    ],
    examples: [
      { text: "200€ sind zuviel für mich gerade", source: "dm", date: "gestern" },
      { text: "Wieviel muss ich investieren? Das klingt teuer", source: "comment", date: "vor 3h" },
    ],
    lastSeen: "vor 3h",
    severity: "concerning",
  },
  {
    id: "o4",
    label: "Nicht der Typ für Verkauf",
    category: "Identität",
    source: "comment",
    frequency: 22,
    trend: "up",
    trendPercent: 35,
    recommendedAngles: [
      "Verkauf-Reframe: 'Du verkaufst nicht — du teilst was dir geholfen hat'",
      "Content-First-Modell: Zeig Stories, kein Pushing",
      "Persönlichkeits-Typen: Mentor/Coach Archetyp als Alternative",
    ],
    examples: [
      { text: "Ich kann nicht verkaufen, das liegt mir nicht", source: "comment", date: "vor 4h" },
      { text: "Mich nervt Verkaufsdruck, kann ich das auch?", source: "dm", date: "gestern" },
    ],
    lastSeen: "vor 4h",
    severity: "manageable",
  },
  {
    id: "o5",
    label: "Funktioniert das in Deutschland?",
    category: "Skepsis",
    source: "dm",
    frequency: 18,
    trend: "flat",
    trendPercent: 5,
    recommendedAngles: [
      "Beispiele lokaler Partner zeigen",
      "LR-Heritage als deutscher Erfolg hervorheben",
      "Region-spezifische Case-Studies",
    ],
    examples: [
      { text: "Sowas funktioniert doch nur in den USA oder?", source: "dm", date: "vor 2d" },
    ],
    lastSeen: "vor 2d",
    severity: "manageable",
  },
  {
    id: "o6",
    label: "Kenne niemand, der das braucht",
    category: "Markt",
    source: "call",
    frequency: 15,
    trend: "up",
    trendPercent: 40,
    recommendedAngles: [
      "Markt-Neu-Framing: 'Du musst niemanden kennen — das System bringt dir die Leute'",
      "Content-First: Reichweite über Social Media statt Bekanntenkreis",
      "Follower-to-Customer-Flow zeigen",
    ],
    examples: [
      { text: "Mein Umfeld ist nicht die Zielgruppe", source: "call", date: "vor 3d" },
    ],
    lastSeen: "vor 3d",
    severity: "critical",
  },
  {
    id: "o7",
    label: "Produkte wirklich gut?",
    category: "Qualität",
    source: "comment",
    frequency: 14,
    trend: "down",
    trendPercent: -8,
    recommendedAngles: [
      "Probe-Angebot: 'Teste 30 Tage, bevor du dich entscheidest'",
      "Ingredient-Deep-Dive auf der Seite",
      "User-Generated-Reviews aus dem Team",
    ],
    examples: [
      { text: "Wie gut sind die Produkte wirklich?", source: "comment", date: "vor 1d" },
    ],
    lastSeen: "vor 1d",
    severity: "manageable",
  },
  {
    id: "o8",
    label: "Datenschutz / Privacy",
    category: "Compliance",
    source: "dm",
    frequency: 8,
    trend: "up",
    trendPercent: 60,
    recommendedAngles: [
      "Klarheit: Welche Daten werden wo gespeichert (LR-Partner-Portal, DSGVO-konform)",
      "Transparenz-Post: Wie LR mit Partner-Daten umgeht",
    ],
    examples: [
      { text: "Was machen die mit meinen Daten?", source: "dm", date: "vor 5d" },
    ],
    lastSeen: "vor 5d",
    severity: "concerning",
  },
];

const CATEGORIES = ["all", "Zeit", "Geld", "Vertrauen", "Identität", "Markt", "Skepsis", "Qualität", "Compliance"];

const SOURCE_CONFIG: Record<Source, { label: string; icon: typeof MessageSquare; color: string }> = {
  comment: { label: "Kommentar", icon: MessageSquare, color: "text-blue-400" },
  dm: { label: "DM", icon: Mail, color: "text-emerald-400" },
  call: { label: "Call", icon: Phone, color: "text-primary" },
};

const TREND_CONFIG: Record<Trend, { icon: typeof TrendingUp; color: string; label: string }> = {
  up: { icon: TrendingUp, color: "text-red-400", label: "steigend" },
  flat: { icon: Minus, color: "text-amber-400", label: "stabil" },
  down: { icon: TrendingDown, color: "text-emerald-400", label: "fallend" },
};

const SEVERITY_CONFIG: Record<ObjectionSignal["severity"], { label: string; color: string; bg: string }> = {
  manageable: { label: "Lösbar", color: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/30" },
  concerning: { label: "Achtung", color: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/30" },
  critical: { label: "Kritisch", color: "text-red-400", bg: "bg-red-500/10 border-red-500/50" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 px-2"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Kopiert");
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

export default function ObjectionHeatmapPage() {
  const [, setLocation] = useLocation();
  const [objections] = useState<ObjectionSignal[]>(INITIAL_OBJECTIONS);
  const [category, setCategory] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<Source | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return objections.filter(o => {
      if (category !== "all" && o.category !== category) return false;
      if (sourceFilter !== "all" && o.source !== sourceFilter) return false;
      return true;
    }).sort((a, b) => b.frequency - a.frequency);
  }, [objections, category, sourceFilter]);

  const rising = objections.filter(o => o.trend === "up").sort((a, b) => b.trendPercent - a.trendPercent);
  const totalFreq = filtered.reduce((a, o) => a + o.frequency, 0);

  const selected = objections.find(o => o.id === selectedId);

  const sendToHookEngine = () => {
    if (!selected) return;
    localStorage.setItem("hook-engine-seed", JSON.stringify({
      topic: `Einwand: ${selected.label}`,
      angle: selected.recommendedAngles[0],
    }));
    toast.info("Hook für diesen Einwand in Hook Engine");
    setLocation("/hook-engine");
  };

  const createTrainingTask = () => {
    if (!selected) return;
    toast.success(`Team-Coaching-Aufgabe erstellt: "Übe Antwort zu '${selected.label}'"`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gold-text" style={{ fontFamily: "var(--font-heading)" }}>
          Objection Heatmap
        </h1>
        <p className="text-sm text-muted-foreground">
          Wiederkehrende Einwände aus Kommentaren, DMs, Calls — als strategisches Markt-Signal.
        </p>
      </div>

      {/* Rising Objections */}
      {rising.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-red-400">
              <Flame className="h-4 w-4" /> Steigende Einwände — jetzt angehen
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {rising.slice(0, 3).map(o => (
                <Card
                  key={o.id}
                  className={`cursor-pointer ${SEVERITY_CONFIG[o.severity].bg}`}
                  onClick={() => setSelectedId(o.id)}
                >
                  <CardContent className="p-3">
                    <p className="text-sm font-semibold">{o.label}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-red-400" />
                      <span className="text-[10px] font-semibold text-red-400">+{o.trendPercent}%</span>
                      <span className="text-[10px] text-muted-foreground">· {o.frequency}x</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="border-primary/30">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Filter:</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map(c => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? "default" : "outline"}
                className={`text-xs ${category === c ? "btn-gold" : ""}`}
                onClick={() => setCategory(c)}
              >
                {c === "all" ? "Alle Kategorien" : c}
              </Button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            <Button
              size="sm"
              variant={sourceFilter === "all" ? "default" : "outline"}
              className={`text-xs ${sourceFilter === "all" ? "btn-gold" : ""}`}
              onClick={() => setSourceFilter("all")}
            >
              Alle Quellen
            </Button>
            {(Object.keys(SOURCE_CONFIG) as Source[]).map(s => {
              const cfg = SOURCE_CONFIG[s];
              const Icon = cfg.icon;
              return (
                <Button
                  key={s}
                  size="sm"
                  variant={sourceFilter === s ? "default" : "outline"}
                  className={`text-xs ${sourceFilter === s ? "btn-gold" : ""}`}
                  onClick={() => setSourceFilter(s)}
                >
                  <Icon className={`h-3 w-3 mr-1 ${sourceFilter !== s ? cfg.color : ""}`} />
                  {cfg.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold mb-2">Einwand-Heatmap ({filtered.length} · {totalFreq} total)</h2>
          <div className="space-y-2">
            {filtered.map(o => {
              const srcCfg = SOURCE_CONFIG[o.source];
              const trendCfg = TREND_CONFIG[o.trend];
              const SrcIcon = srcCfg.icon;
              const TrendIcon = trendCfg.icon;
              const sevCfg = SEVERITY_CONFIG[o.severity];
              const intensity = Math.min(100, (o.frequency / 50) * 100);
              return (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card
                    className={`cursor-pointer transition-all ${sevCfg.bg} ${selectedId === o.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedId(o.id)}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{o.label}</p>
                          <div className="flex items-center gap-1 flex-wrap mt-1">
                            <Badge variant="outline" className="text-[9px]">{o.category}</Badge>
                            <Badge variant="outline" className={`text-[9px] ${srcCfg.color}`}>
                              <SrcIcon className="h-2.5 w-2.5 mr-0.5" /> {srcCfg.label}
                            </Badge>
                            <Badge variant="outline" className={`text-[9px] ${sevCfg.color}`}>{sevCfg.label}</Badge>
                            <span className="text-[9px] text-muted-foreground">Zuletzt: {o.lastSeen}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold">{o.frequency}x</div>
                          <div className={`flex items-center justify-end gap-0.5 text-[9px] ${trendCfg.color}`}>
                            <TrendIcon className="h-2.5 w-2.5" />
                            {o.trend === "flat" ? "0%" : `${o.trendPercent > 0 ? "+" : ""}${o.trendPercent}%`}
                          </div>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full ${o.severity === "critical" ? "bg-red-400" : o.severity === "concerning" ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${intensity}%` }} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          {selected ? (
            <Card className="border-primary/30">
              <CardContent className="p-4 space-y-3">
                <div>
                  <Badge variant="outline" className={`text-[10px] mb-2 ${SEVERITY_CONFIG[selected.severity].color}`}>
                    {SEVERITY_CONFIG[selected.severity].label} · {selected.frequency}x aufgetreten
                  </Badge>
                  <h3 className="text-sm font-bold">{selected.label}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-[9px]">{selected.category}</Badge>
                    <div className={`flex items-center gap-0.5 text-[9px] ${TREND_CONFIG[selected.trend].color}`}>
                      {selected.trend === "up" ? <TrendingUp className="h-2.5 w-2.5" /> : selected.trend === "down" ? <TrendingDown className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />}
                      {TREND_CONFIG[selected.trend].label}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold text-emerald-400 mb-1 block">Empfohlene Antwort-Angles</label>
                  <div className="space-y-1">
                    {selected.recommendedAngles.map((a, i) => (
                      <div key={i} className="p-2 rounded bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-start gap-1">
                          <span className="text-emerald-400 font-bold text-xs shrink-0">{i + 1}.</span>
                          <p className="text-xs flex-1">{a}</p>
                          <CopyButton text={a} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Beispiele aus dem Wild</label>
                  <div className="space-y-1">
                    {selected.examples.map((ex, i) => {
                      const srcCfg = SOURCE_CONFIG[ex.source];
                      const SrcIcon = srcCfg.icon;
                      return (
                        <div key={i} className="p-2 rounded bg-background/50 border border-border/50 text-[10px]">
                          <div className="flex items-center gap-1 mb-1">
                            <SrcIcon className={`h-2.5 w-2.5 ${srcCfg.color}`} />
                            <span className={srcCfg.color}>{srcCfg.label}</span>
                            <span className="text-muted-foreground">· {ex.date}</span>
                          </div>
                          <p className="italic">"{ex.text}"</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 space-y-1">
                  <Button size="sm" className="btn-gold w-full" onClick={sendToHookEngine}>
                    <Wand2 className="h-3 w-3 mr-1" /> Hook gegen diesen Einwand bauen
                  </Button>
                  <Button size="sm" variant="outline" className="w-full" onClick={createTrainingTask}>
                    <GraduationCap className="h-3 w-3 mr-1" /> Team-Coaching-Aufgabe erstellen
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-border/50">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Wähle einen Einwand für Details und Gegenstrategien.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Optional an Manus:</p>
          <p className="text-muted-foreground">
            Neue Endpoints: <code>objectionHeatmap.aggregate</code>, <code>objectionHeatmap.trend</code>, <code>objectionHeatmap.responseFamilies</code>. Live-Daten aus Comment-to-Lead-Router und Conversation Critic aggregieren.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
