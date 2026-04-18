import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  Search, Youtube, Copy, Check, Wand2, Clock, Target,
  Tag, FileText, Repeat, TrendingUp, Plus, Trash2, Download
} from "lucide-react";
import { toast } from "sonner";

/**
 * SHORTS SEO LAB — YouTube-Shorts-Strategien für Search, Home, Series
 *
 * 60/90/180s Formate. Topic-Cluster. Titel-Varianten nach Intent.
 * Deep-Dive-Formate die auf TikTok NICHT funktionieren würden.
 */

type ShortsFormat = "60s" | "90s" | "180s";
type Intent = "search" | "curiosity" | "series";

interface ShortsTopicPlan {
  id: string;
  topic: string;
  searchIntent: string;
  format: ShortsFormat;
  titles: { search: string[]; curiosity: string[]; series: string[] };
  tags: string[];
  outline: string[];
  description: string;
  score: {
    searchFit: number;
    hookStrength: number;
    seriesPotential: number;
    rewatchPotential: number;
  };
}

const TOPIC_CLUSTERS = [
  { id: "lr-business", label: "LR Business", emoji: "💼", topics: ["Was ist LR wirklich", "Wie verdient man bei LR Geld", "LR Erfahrungen nach 1 Jahr", "LR vs. anderer Firma"] },
  { id: "products", label: "Produkte", emoji: "🌿", topics: ["Aloe Vera Gel erklärt", "Lifetakt Wirkung", "Collagen Plus Test", "Produkt-Routine Morgen"] },
  { id: "side-income", label: "Nebenberuf", emoji: "💰", topics: ["Nebeneinkommen aufbauen", "Nebenberuf mit Familie", "Von 0 auf Nebenverdienst", "Job + Nebenjob koordinieren"] },
  { id: "objections", label: "Einwände", emoji: "🛡️", topics: ["Ist Network Marketing Schneeballsystem", "MLM Wahrheit", "Warum scheitern viele", "Ist LR seriös"] },
  { id: "social-media", label: "Social Media", emoji: "📱", topics: ["Als LR Partner auf Instagram", "Reels für Network Marketing", "Content-Plan MLM", "Hashtag-Strategie"] },
];

const FORMAT_CONFIG: Record<ShortsFormat, { label: string; desc: string; idealFor: string[]; hookSeconds: number }> = {
  "60s": { label: "60s Quick-Hit", desc: "Schneller Punch, eine Message", idealFor: ["Hook+Fact+CTA", "Listicles (3 Gründe...)", "Myth-Busting"], hookSeconds: 3 },
  "90s": { label: "90s Story", desc: "Mini-Story mit Arc", idealFor: ["Before/After mit Kontext", "Problem→Lösung", "Erzähl-Hooks"], hookSeconds: 5 },
  "180s": { label: "180s Deep-Dive", desc: "Ausführlich, lehrreich, Mini-Doku", idealFor: ["Tutorials", "Business-Erklärungen", "Erfahrungsberichte", "Mini-Dokus"], hookSeconds: 8 },
};

function generateTitles(topic: string, format: ShortsFormat): { search: string[]; curiosity: string[]; series: string[] } {
  const search = [
    `${topic} erklärt (${format === "180s" ? "Komplett-Guide" : "kurz und klar"})`,
    `${topic} — alles was du wissen musst`,
    `Was ist ${topic}? Ehrliche Antwort ${format === "180s" ? "in 3 Minuten" : ""}`,
    `${topic}: Meine Erfahrungen 2026`,
  ];
  const curiosity = [
    `Niemand spricht über ${topic.toLowerCase()} — das ist der Grund`,
    `Die Wahrheit über ${topic.toLowerCase()} die niemand teilen will`,
    `Warum ${topic.toLowerCase()} 99% falsch verstehen`,
    `${topic}: Was sie dir verschweigen`,
  ];
  const series = [
    `${topic} — Teil 1: Grundlagen`,
    `${topic} — Day 1 of 30`,
    `Meine ${topic}-Reise: Episode 1`,
    `${topic}-Challenge Tag 1`,
  ];
  return { search, curiosity, series };
}

function generateTags(topic: string): string[] {
  const base = topic.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
  return [
    ...base.map(w => `#${w}`),
    "#NetworkMarketing",
    "#LRLifestyle",
    "#Nebeneinkommen",
    "#FinanzielleFreiheit",
    "#BusinessOpportunity",
    "#MLM",
    "#Erfahrungsbericht",
    "#Shorts",
    "#YouTubeShorts",
  ].slice(0, 12);
}

function generateOutline(topic: string, format: ShortsFormat): string[] {
  if (format === "60s") {
    return [
      `0-3s HOOK: "Wusstest du, dass ${topic.toLowerCase()}?" — direkt in die Aussage`,
      `3-20s CONTEXT: Warum das Thema relevant ist + überraschender Fakt`,
      `20-50s MAIN POINT: Die 1 wichtige Sache + Beweis (Zahl, Story, Visual)`,
      `50-60s CTA: "Folge für Teil 2" oder "Kommentar 'INFO'"`,
    ];
  }
  if (format === "90s") {
    return [
      `0-5s HOOK: Stark provokante Aussage zu ${topic}`,
      `5-15s SETUP: Die Ausgangslage / das Problem`,
      `15-45s JOURNEY: Was passiert ist / Wende`,
      `45-75s PAYOFF: Die Lektion / Erkenntnis`,
      `75-90s CTA: "Save den Post" oder "Folge für die ganze Story"`,
    ];
  }
  return [
    `0-8s HOOK: Provokante These oder Versprechen ("In 3 Min zeige ich dir...")`,
    `8-30s PROBLEM: Warum die meisten bei ${topic} scheitern`,
    `30-80s STRUKTUR: 3 Kernpunkte (je 15-20s) mit Beispielen`,
    `80-130s TIEFENEBENE: Ein konkreter Fallback, ein Expert-Tip, ein Widerspruch`,
    `130-160s ANWENDUNG: Wie du das morgen umsetzt (Schritt 1, 2, 3)`,
    `160-180s CTA + CLIFFHANGER: Link-in-Bio + "Nächste Woche: Teil 2"`,
  ];
}

function generateDescription(topic: string, format: ShortsFormat): string {
  const formatMap: Record<ShortsFormat, string> = {
    "60s": "Quick Breakdown",
    "90s": "Story",
    "180s": "Deep Dive in 3 Minuten",
  };
  return `${topic} — ${formatMap[format]}.

In diesem Short erfährst du:
✅ Was wirklich dahinter steckt
✅ Die 1 Sache die du dir merken solltest
✅ Wie du es morgen umsetzt

💬 Kommentiere 'INFO' für mehr Details per DM
🔔 Folge für tägliche Einblicke ins LR Lifestyle
📩 Link in Bio für den kostenlosen Guide

#NetworkMarketing #LRLifestyle #Nebeneinkommen #Shorts`;
}

function scorePlan(topic: string, format: ShortsFormat, intent: Intent): ShortsTopicPlan["score"] {
  const topicLen = topic.length;
  const hasNumber = /\d/.test(topic);
  const hasQuestion = /\?|warum|wie|was|welche/i.test(topic);

  return {
    searchFit: Math.min(100, 40 + (hasQuestion ? 25 : 0) + (topicLen > 15 ? 15 : 5) + (intent === "search" ? 20 : 0)),
    hookStrength: Math.min(100, 50 + (hasNumber ? 15 : 0) + (format === "60s" ? 20 : format === "90s" ? 15 : 10)),
    seriesPotential: Math.min(100, 30 + (format === "180s" ? 30 : 15) + (intent === "series" ? 30 : 10) + (topicLen > 20 ? 20 : 5)),
    rewatchPotential: Math.min(100, 40 + (format === "60s" ? 25 : 10) + (hasQuestion ? 15 : 5)),
  };
}

function buildPlan(topic: string, format: ShortsFormat): ShortsTopicPlan {
  return {
    id: `plan-${Date.now()}`,
    topic,
    searchIntent: topic.toLowerCase(),
    format,
    titles: generateTitles(topic, format),
    tags: generateTags(topic),
    outline: generateOutline(topic, format),
    description: generateDescription(topic, format),
    score: scorePlan(topic, format, "search"),
  };
}

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

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 gap-1 text-xs"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(`${label || "Kopiert"}`);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {label}
    </Button>
  );
}

export default function ShortsSeoLabPage() {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<ShortsFormat>("60s");
  const [activeCluster, setActiveCluster] = useState<string | null>(null);
  const [plans, setPlans] = useState<ShortsTopicPlan[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const generate = () => {
    if (!topic.trim()) {
      toast.error("Thema eingeben");
      return;
    }
    const plan = buildPlan(topic, format);
    setPlans(prev => [plan, ...prev]);
    setSelectedId(plan.id);
    toast.success("Shorts-Plan erstellt");
  };

  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selected = plans.find(p => p.id === selectedId);

  const exportProductionCard = (plan: ShortsTopicPlan) => {
    const text = [
      `# SHORTS PRODUCTION CARD`,
      `Topic: ${plan.topic}`,
      `Format: ${FORMAT_CONFIG[plan.format].label}`,
      ``,
      `## TITEL-VARIANTEN`,
      `### Search-Intent`,
      ...plan.titles.search.map(t => `- ${t}`),
      `### Curiosity-Intent`,
      ...plan.titles.curiosity.map(t => `- ${t}`),
      `### Series-Intent`,
      ...plan.titles.series.map(t => `- ${t}`),
      ``,
      `## BEAT-OUTLINE`,
      ...plan.outline.map(b => `- ${b}`),
      ``,
      `## DESCRIPTION`,
      plan.description,
      ``,
      `## TAGS`,
      plan.tags.join(" "),
      ``,
      `## SCORES`,
      `- Search-Fit: ${plan.score.searchFit}/100`,
      `- Hook-Strength: ${plan.score.hookStrength}/100`,
      `- Series-Potenzial: ${plan.score.seriesPotential}/100`,
      `- Rewatch-Potenzial: ${plan.score.rewatchPotential}/100`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Production Card kopiert");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gold-text" style={{ fontFamily: "var(--font-heading)" }}>
          Shorts SEO Lab
        </h1>
        <p className="text-sm text-muted-foreground">
          YouTube Shorts bis 3 Min — der unterschätzte Killer-Kanal für LR. Such-optimiert, serien-tauglich.
        </p>
      </div>

      {/* Topic Cluster Map */}
      <Card className="border-primary/30">
        <CardContent className="p-4 space-y-3">
          <h2 className="text-sm font-semibold">Topic-Cluster für LR</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {TOPIC_CLUSTERS.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCluster(c.id === activeCluster ? null : c.id)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  activeCluster === c.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-2xl mb-1">{c.emoji}</div>
                <div className="text-xs font-semibold">{c.label}</div>
              </button>
            ))}
          </div>
          {activeCluster && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1">
              <div className="text-[10px] uppercase font-semibold text-muted-foreground">Vorschläge für Cluster:</div>
              {TOPIC_CLUSTERS.find(c => c.id === activeCluster)?.topics.map(t => (
                <Button
                  key={t}
                  size="sm"
                  variant="outline"
                  className="text-xs justify-start w-full"
                  onClick={() => { setTopic(t); setActiveCluster(null); }}
                >
                  {t}
                </Button>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Input */}
      <Card className="border-primary/30">
        <CardContent className="p-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Thema / Keyword *</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="z.B. Aloe Vera Gel erklärt, Nebeneinkommen aufbauen"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(FORMAT_CONFIG) as ShortsFormat[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    format === f ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  <Clock className="h-5 w-5 text-primary mb-1" />
                  <div className="text-xs font-semibold">{FORMAT_CONFIG[f].label}</div>
                  <div className="text-[10px] text-muted-foreground">{FORMAT_CONFIG[f].desc}</div>
                </button>
              ))}
            </div>
            <div className="text-[10px] text-muted-foreground mt-2">
              Ideal für: {FORMAT_CONFIG[format].idealFor.join(" · ")}
            </div>
          </div>
          <Button className="btn-gold w-full" onClick={generate} disabled={!topic.trim()}>
            <Wand2 className="h-4 w-4 mr-1" /> Shorts-Plan generieren
          </Button>
        </CardContent>
      </Card>

      {/* Deep-Dive-only Formate */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Youtube className="h-4 w-4 text-red-500" /> TikTok ungeeignet, Shorts brutal stark
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded bg-background/50 border border-border/50">
              <div className="font-semibold mb-1">Mini-Dokus (3 Min)</div>
              <div className="text-muted-foreground">"Ein Tag als LR Top-Earner" — detailliert mit Transparenz</div>
            </div>
            <div className="p-2 rounded bg-background/50 border border-border/50">
              <div className="font-semibold mb-1">Business-Erklärungen</div>
              <div className="text-muted-foreground">"Das Auto-Konzept in 3 Min — alle Zahlen offen"</div>
            </div>
            <div className="p-2 rounded bg-background/50 border border-border/50">
              <div className="font-semibold mb-1">Tutorials</div>
              <div className="text-muted-foreground">"So baust du dein erstes Team" — Schritt-für-Schritt</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      {plans.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-2">
            <h2 className="text-sm font-semibold">{plans.length} Shorts-Plan(s)</h2>
            {plans.map(p => (
              <Card
                key={p.id}
                className={`cursor-pointer ${selectedId === p.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"}`}
                onClick={() => setSelectedId(p.id)}
              >
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-1">{p.topic}</p>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[9px]">
                          <Clock className="h-2.5 w-2.5 mr-0.5" /> {FORMAT_CONFIG[p.format].label}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30">
                          <Target className="h-2.5 w-2.5 mr-0.5" /> Search {p.score.searchFit}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] text-blue-400 border-blue-500/30">
                          <Repeat className="h-2.5 w-2.5 mr-0.5" /> Series {p.score.seriesPotential}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); deletePlan(p.id); }}>
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:sticky lg:top-4 lg:self-start">
            {selected ? (
              <Card className="border-primary/30">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold">{selected.topic}</h3>
                    <Badge variant="outline" className="text-[10px] mt-1">{FORMAT_CONFIG[selected.format].label}</Badge>
                  </div>

                  <div className="space-y-1">
                    <ScoreBar label="Search-Fit" value={selected.score.searchFit} color="bg-amber-400" />
                    <ScoreBar label="Hook-Strength" value={selected.score.hookStrength} color="bg-red-400" />
                    <ScoreBar label="Series-Potenzial" value={selected.score.seriesPotential} color="bg-blue-400" />
                    <ScoreBar label="Rewatch" value={selected.score.rewatchPotential} color="bg-emerald-400" />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Titel-Varianten</label>
                    <div className="space-y-1">
                      <div>
                        <Badge variant="outline" className="text-[9px] mb-1 text-amber-400 border-amber-500/30">🔍 Search</Badge>
                        {selected.titles.search.slice(0, 2).map((t, i) => (
                          <div key={i} className="flex items-start gap-1 mb-1">
                            <p className="text-[10px] flex-1">{t}</p>
                            <CopyButton text={t} />
                          </div>
                        ))}
                      </div>
                      <div>
                        <Badge variant="outline" className="text-[9px] mb-1 text-cyan-400 border-cyan-500/30">🧐 Curiosity</Badge>
                        {selected.titles.curiosity.slice(0, 2).map((t, i) => (
                          <div key={i} className="flex items-start gap-1 mb-1">
                            <p className="text-[10px] flex-1">{t}</p>
                            <CopyButton text={t} />
                          </div>
                        ))}
                      </div>
                      <div>
                        <Badge variant="outline" className="text-[9px] mb-1 text-blue-400 border-blue-500/30">📺 Series</Badge>
                        {selected.titles.series.slice(0, 2).map((t, i) => (
                          <div key={i} className="flex items-start gap-1 mb-1">
                            <p className="text-[10px] flex-1">{t}</p>
                            <CopyButton text={t} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Beat-Outline
                    </label>
                    <div className="space-y-1">
                      {selected.outline.map((b, i) => (
                        <p key={i} className="text-[10px] p-2 rounded bg-background/50 border border-border/50">
                          {b}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block flex items-center gap-1">
                      <Tag className="h-3 w-3" /> Tags & Description
                    </label>
                    <div className="p-2 rounded bg-background/50 border border-border/50 max-h-32 overflow-y-auto">
                      <pre className="text-[9px] whitespace-pre-wrap font-mono">{selected.description}</pre>
                    </div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {selected.tags.slice(0, 6).map((t, i) => (
                        <Badge key={i} variant="outline" className="text-[9px]">{t}</Badge>
                      ))}
                    </div>
                  </div>

                  <Button size="sm" className="btn-gold w-full" onClick={() => exportProductionCard(selected)}>
                    <Download className="h-3 w-3 mr-1" /> Production Card exportieren
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-border/50">
                <CardContent className="p-6 text-center space-y-2">
                  <Search className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-xs text-muted-foreground">Wähle einen Plan für Details und Export.</p>
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
            KI-Clustering + echte Such-Daten: neue Endpoints <code>shortsSeo.generate</code>, <code>shortsSeo.cluster</code>, <code>shortsSeo.score</code>. YouTube Data API v3 für Suchvolumen + Wettbewerb.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
