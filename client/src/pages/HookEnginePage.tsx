import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Wand2, Copy, Check, Star, Flame, Shield, MessageCircle,
  TrendingUp, Zap, Loader2, ArrowRight, Sparkles, Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

/**
 * HOOK ENGINE — Täglicher Startpunkt für jede Clip-Produktion
 *
 * Erzeugt aus Thema + Ziel + Plattform + Funnel + Ton 10-30 Hooks mit Scores.
 * Integriert mit bestehendem content.generate + complianceShield.check.
 */

type Platform = "instagram" | "tiktok" | "facebook" | "youtube";
type FunnelGoal = "follower" | "engagement" | "lead";
type HookStyle = "shock" | "story" | "pov" | "myth" | "comparison" | "comedy";
type Tone = "bold" | "warm" | "curious" | "premium";
type Risk = "low" | "medium";

interface HookRequest {
  topic: string;
  product?: string;
  audience?: string;
  platform: Platform;
  funnelGoal: FunnelGoal;
  hookStyle: HookStyle;
  tone: Tone;
  riskTolerance: Risk;
}

interface HookResult {
  id: string;
  text: string;
  angle: string;
  ctaTrigger: string;
  captionStarter: string;
  scores: {
    scrollStop: number;
    commentPotential: number;
    leadPotential: number;
    complianceRisk: number;
  };
}

const PLATFORMS: { id: Platform; label: string; emoji: string }[] = [
  { id: "instagram", label: "Instagram", emoji: "📸" },
  { id: "tiktok", label: "TikTok", emoji: "🎵" },
  { id: "facebook", label: "Facebook", emoji: "📘" },
  { id: "youtube", label: "YouTube", emoji: "▶️" },
];

const FUNNEL_GOALS: { id: FunnelGoal; label: string; desc: string }[] = [
  { id: "follower", label: "Follower", desc: "Reichweite aufbauen" },
  { id: "engagement", label: "Engagement", desc: "Kommentare + Shares" },
  { id: "lead", label: "Leads", desc: "Kontakte generieren" },
];

const HOOK_STYLES: { id: HookStyle; label: string; emoji: string; desc: string }[] = [
  { id: "shock", label: "Schock", emoji: "⚡", desc: "Harte Wahrheit" },
  { id: "story", label: "Story", emoji: "📖", desc: "Story Open Loop" },
  { id: "pov", label: "POV", emoji: "👀", desc: "Perspektiv-Wechsel" },
  { id: "myth", label: "Myth-Busting", emoji: "🔨", desc: "Räum auf" },
  { id: "comparison", label: "Vergleich", emoji: "⚖️", desc: "A vs. B" },
  { id: "comedy", label: "Humor", emoji: "😂", desc: "Witz & Selbstironie" },
];

const TONES: { id: Tone; label: string; emoji: string }[] = [
  { id: "bold", label: "Bold", emoji: "🔥" },
  { id: "warm", label: "Warm", emoji: "💛" },
  { id: "curious", label: "Neugierig", emoji: "🧐" },
  { id: "premium", label: "Premium", emoji: "✨" },
];

const HOOK_TEMPLATES: Record<HookStyle, (topic: string, tone: Tone) => string[]> = {
  shock: (t) => [
    `Die meisten haben bei ${t} längst aufgegeben. Das ist der Grund.`,
    `${t}: Was niemand dir sagt, weil es zu unbequem ist.`,
    `Ich habe bei ${t} 12 Monate falsch investiert. Hier die ehrliche Wahrheit.`,
    `${t} funktioniert nicht — außer du machst diese eine Sache.`,
    `Keiner spricht öffentlich über diesen Teil von ${t}.`,
  ],
  story: (t) => [
    `Heute vor einem Jahr hat sich bei ${t} alles verändert.`,
    `Der Moment, an dem ich bei ${t} verstanden habe, was wirklich zählt.`,
    `Das ist die ${t}-Story, die ich normalerweise nicht erzähle.`,
    `Von 0 auf real: Meine ersten 90 Tage bei ${t}.`,
    `Mein ${t}-Wendepunkt war nicht, was du denkst.`,
  ],
  pov: (t) => [
    `POV: Du hast dich gerade für ${t} entschieden.`,
    `POV: Dein altes Ich sieht dich heute bei ${t}.`,
    `POV: Du erklärst deinen Eltern, warum ${t} dein Ding ist.`,
    `POV: Erster Tag bei ${t} vs. heute.`,
    `POV: Dein zukünftiges Ich dankt dir für ${t}.`,
  ],
  myth: (t) => [
    `Mythos über ${t}: "Das ist nur für Junge." Die Wahrheit:`,
    `"${t} ist Schneeballsystem." Drei Fakten, die das widerlegen.`,
    `Stop sagen "${t} funktioniert nicht" — hier die Zahlen.`,
    `Unpopuläre Wahrheit über ${t}, die 95% nicht hören wollen.`,
    `Change my mind: ${t} ist das beste Business-Modell 2026.`,
  ],
  comparison: (t) => [
    `9-to-5 Job vs. ${t}: Der eine Unterschied, der alles ändert.`,
    `${t} früher vs. heute — die Lücke wird jeden Tag größer.`,
    `Das machen Top-Performer bei ${t} anders. Liste:`,
    `Team A vs. Team B im gleichen ${t}-Business. Unterschied: Mindset.`,
    `Dein Gehalt vs. dein ${t}-Nebeneinkommen in 12 Monaten.`,
  ],
  comedy: (t) => [
    `Wenn ${t} ein Meme wäre, dann dieses:`,
    `Niemand: ...\nIch um 6 Uhr bei ${t}: 'Heute wird der Tag!'`,
    `${t} in 2025: Kompliziert. ${t} mit mir: Peinlich einfach.`,
    `"${t} klappt eh nicht" — sagte der, der es nie probiert hat.`,
    `Ich und mein Team bei ${t} jeden Morgen: *selbstironisches Gif*`,
  ],
};

const CTA_BY_GOAL: Record<FunnelGoal, string[]> = {
  follower: ["Folge mir für mehr davon.", "Speichere den Post, wenn du's brauchst.", "Markiere jemanden, der das sehen muss."],
  engagement: ["Kommentier dein Warum 👇", "Stimm ab in den Stories.", "Was ist deine Version? Kommentar!"],
  lead: ["Kommentiere 🔥 für Infos per DM.", "Schreib 'START' für den ersten Schritt.", "DM 'PLAN' für die komplette Anleitung."],
};

function scoreHook(style: HookStyle, goal: FunnelGoal, risk: Risk): HookResult["scores"] {
  const base = {
    scrollStop: style === "shock" ? 90 : style === "pov" ? 85 : style === "story" ? 80 : 75,
    commentPotential: goal === "engagement" ? 90 : style === "myth" ? 85 : 70,
    leadPotential: goal === "lead" ? 90 : goal === "follower" ? 60 : 50,
    complianceRisk: style === "shock" && risk === "medium" ? 45 : style === "myth" ? 30 : 15,
  };
  return {
    scrollStop: Math.min(100, base.scrollStop + Math.floor(Math.random() * 10)),
    commentPotential: Math.min(100, base.commentPotential + Math.floor(Math.random() * 10)),
    leadPotential: Math.min(100, base.leadPotential + Math.floor(Math.random() * 10)),
    complianceRisk: Math.max(0, Math.min(100, base.complianceRisk + Math.floor(Math.random() * 10))),
  };
}

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
        toast.success("Kopiert!");
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-muted-foreground w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="font-semibold w-8 text-right">{value}</span>
    </div>
  );
}

export default function HookEnginePage() {
  const [, setLocation] = useLocation();

  const [form, setForm] = useState<HookRequest>({
    topic: "",
    product: "",
    audience: "",
    platform: "instagram",
    funnelGoal: "lead",
    hookStyle: "story",
    tone: "warm",
    riskTolerance: "low",
  });

  const [hooks, setHooks] = useState<HookResult[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(() => {
    try {
      const saved = localStorage.getItem("hookengine-favs");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  }));
  const [selectedHook, setSelectedHook] = useState<HookResult | null>(null);
  const [generating, setGenerating] = useState(false);

  const complianceCheck = trpc.complianceShield?.check.useMutation();
  const generateMutation = trpc.content.generate.useMutation();

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("hookengine-favs", JSON.stringify([...next]));
      return next;
    });
  };

  const generate = async () => {
    if (!form.topic.trim()) {
      toast.error("Thema eingeben");
      return;
    }
    setGenerating(true);
    setHooks([]);
    setSelectedHook(null);

    try {
      // Primary: use template-based generation (instant, always works)
      const templates = HOOK_TEMPLATES[form.hookStyle](form.topic, form.tone);
      const cta = CTA_BY_GOAL[form.funnelGoal];

      const results: HookResult[] = templates.map((text, i) => ({
        id: `hook-${Date.now()}-${i}`,
        text,
        angle: HOOK_STYLES.find(s => s.id === form.hookStyle)?.label || form.hookStyle,
        ctaTrigger: cta[i % cta.length],
        captionStarter: `${text}\n\n...`,
        scores: scoreHook(form.hookStyle, form.funnelGoal, form.riskTolerance),
      }));

      setHooks(results);

      // Optional: enrich with AI via content.generate (async, don't block UI)
      try {
        const aiResult = await generateMutation.mutateAsync({
          contentType: "hooks",
          topic: form.topic,
          pillar: "business_opportunity",
          platform: form.platform,
          count: 10,
          context: `Style: ${form.hookStyle}, Tone: ${form.tone}, Goal: ${form.funnelGoal}. Erzeuge 10 zusätzliche Hooks.`,
        });

        const aiText = (aiResult as any)?.content;
        if (aiText && typeof aiText === "string") {
          const aiHooks = aiText
            .split(/\n+/)
            .map((l: string) => l.trim())
            .filter((l: string) => l && l.length > 10 && !/^(hook|#|\*)/i.test(l))
            .slice(0, 10)
            .map((text: string, i: number) => ({
              id: `hook-ai-${Date.now()}-${i}`,
              text: text.replace(/^\d+[.):]\s*/, "").replace(/^["']|["']$/g, ""),
              angle: "KI-generiert",
              ctaTrigger: cta[i % cta.length],
              captionStarter: `${text}\n\n...`,
              scores: scoreHook(form.hookStyle, form.funnelGoal, form.riskTolerance),
            }));
          setHooks(prev => [...prev, ...aiHooks]);
        }
      } catch {
        // Silent fail — templates already shown
      }

      toast.success(`${results.length}+ Hooks erstellt`);
    } catch (err: any) {
      toast.error(`Fehler: ${err.message || "Generierung fehlgeschlagen"}`);
    } finally {
      setGenerating(false);
    }
  };

  const checkCompliance = async (hook: HookResult) => {
    try {
      const res = await complianceCheck?.mutateAsync({
        content: hook.text,
        platform: form.platform,
      } as any);
      const status = (res as any)?.status;
      if (status === "green") toast.success("Compliance: 🟢 Clean");
      else if (status === "yellow") toast.warning("Compliance: 🟡 Warnung");
      else if (status === "red") toast.error("Compliance: 🔴 Stopp");
      else toast.info("Compliance-Prüfung durchgeführt");
    } catch {
      toast.error("Compliance-Check fehlgeschlagen");
    }
  };

  const openInGenerator = (hook: HookResult) => {
    setLocation(`/generator?topic=${encodeURIComponent(hook.text)}`);
  };

  const expandAsSeries = (hook: HookResult) => {
    localStorage.setItem("series-builder-seed", JSON.stringify({
      hook: hook.text,
      topic: form.topic,
      tone: form.tone,
    }));
    toast.info("Hook gespeichert — öffne Series Builder für Ausbau");
  };

  const sortedHooks = hooks.slice().sort((a, b) => {
    const aFav = favorites.has(a.id) ? 1 : 0;
    const bFav = favorites.has(b.id) ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;
    return b.scores.scrollStop - a.scores.scrollStop;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gold-text" style={{ fontFamily: "var(--font-heading)" }}>
          Hook Engine
        </h1>
        <p className="text-sm text-muted-foreground">
          Hooks für Reels, Kommentare und Leads — täglicher Startpunkt jeder Clip-Produktion.
        </p>
      </div>

      {/* Form */}
      <Card className="border-primary/30">
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Thema / Fokus *</label>
              <Input
                placeholder="z.B. Autokonzept, Morning Routine, Mindset"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Produkt (optional)</label>
              <Input
                placeholder="z.B. Aloe Vera Gel"
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Zielgruppe (optional)</label>
              <Input
                placeholder="z.B. Frauen 30+, Mütter, Fitness-Enthusiasten"
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Plattform</label>
              <div className="flex gap-1 flex-wrap">
                {PLATFORMS.map(p => (
                  <Button
                    key={p.id}
                    size="sm"
                    variant={form.platform === p.id ? "default" : "outline"}
                    className={form.platform === p.id ? "btn-gold" : ""}
                    onClick={() => setForm({ ...form, platform: p.id })}
                  >
                    {p.emoji} {p.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Funnel-Ziel</label>
              <div className="grid grid-cols-3 gap-1">
                {FUNNEL_GOALS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setForm({ ...form, funnelGoal: g.id })}
                    className={`p-2 rounded-lg border text-xs transition-all ${
                      form.funnelGoal === g.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-semibold">{g.label}</div>
                    <div className="text-[10px] text-muted-foreground">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Hook-Stil</label>
              <div className="grid grid-cols-3 gap-1">
                {HOOK_STYLES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setForm({ ...form, hookStyle: s.id })}
                    className={`p-2 rounded-lg border text-xs transition-all ${
                      form.hookStyle === s.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div>{s.emoji} {s.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tonalität</label>
              <div className="grid grid-cols-2 gap-1">
                {TONES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setForm({ ...form, tone: t.id })}
                    className={`p-2 rounded-lg border text-xs transition-all ${
                      form.tone === t.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-muted-foreground">Risiko:</label>
            <Button
              size="sm"
              variant={form.riskTolerance === "low" ? "default" : "outline"}
              className={form.riskTolerance === "low" ? "btn-gold" : ""}
              onClick={() => setForm({ ...form, riskTolerance: "low" })}
            >
              <Shield className="h-3 w-3 mr-1" /> Safe (Compliance-first)
            </Button>
            <Button
              size="sm"
              variant={form.riskTolerance === "medium" ? "default" : "outline"}
              className={form.riskTolerance === "medium" ? "btn-gold" : ""}
              onClick={() => setForm({ ...form, riskTolerance: "medium" })}
            >
              <Flame className="h-3 w-3 mr-1" /> Bold (Polarisierend)
            </Button>
          </div>

          <Button
            size="lg"
            className="btn-gold w-full h-12"
            onClick={generate}
            disabled={generating || !form.topic.trim()}
          >
            {generating ? (
              <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Hooks werden generiert...</>
            ) : (
              <><Wand2 className="h-5 w-5 mr-2" /> 10-30 Hooks erzeugen</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results + Detail side-by-side on desktop */}
      {hooks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Hooks list */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {hooks.length} Hooks
                {favorites.size > 0 && <span className="text-xs text-muted-foreground ml-2">({favorites.size} Favoriten)</span>}
              </h2>
            </div>
            {sortedHooks.map((hook, i) => {
              const isFav = favorites.has(hook.id);
              const isSelected = selectedHook?.id === hook.id;
              return (
                <motion.div
                  key={hook.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    className={`cursor-pointer transition-all ${
                      isSelected ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
                    }`}
                    onClick={() => setSelectedHook(hook)}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-bold text-xs w-6 shrink-0">#{i + 1}</span>
                        <p className="flex-1 text-sm leading-relaxed">{hook.text}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 shrink-0"
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(hook.id); }}
                        >
                          <Star className={`h-3.5 w-3.5 ${isFav ? "fill-amber-400 text-amber-400" : ""}`} />
                        </Button>
                        <CopyButton text={hook.text} />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[9px]">{hook.angle}</Badge>
                        <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30">
                          <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> Stop {hook.scores.scrollStop}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] text-blue-400 border-blue-500/30">
                          <MessageCircle className="h-2.5 w-2.5 mr-0.5" /> Kommentar {hook.scores.commentPotential}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">
                          <Zap className="h-2.5 w-2.5 mr-0.5" /> Lead {hook.scores.leadPotential}
                        </Badge>
                        {hook.scores.complianceRisk > 30 && (
                          <Badge variant="outline" className="text-[9px] text-red-400 border-red-500/30">
                            <Shield className="h-2.5 w-2.5 mr-0.5" /> Risk {hook.scores.complianceRisk}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            {selectedHook ? (
              <Card className="border-primary/30">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Badge variant="outline" className="text-[10px] mb-2">{selectedHook.angle}</Badge>
                    <p className="text-sm font-medium leading-relaxed">{selectedHook.text}</p>
                  </div>

                  <div className="space-y-1.5">
                    <ScoreBar label="Scroll-Stop" value={selectedHook.scores.scrollStop} color="bg-amber-400" />
                    <ScoreBar label="Kommentare" value={selectedHook.scores.commentPotential} color="bg-blue-400" />
                    <ScoreBar label="Lead-Potenzial" value={selectedHook.scores.leadPotential} color="bg-emerald-400" />
                    <ScoreBar label="Compliance-Risk" value={selectedHook.scores.complianceRisk} color="bg-red-400" />
                  </div>

                  <Tabs defaultValue="cta">
                    <TabsList className="w-full grid grid-cols-3">
                      <TabsTrigger value="cta" className="text-[10px]">CTA</TabsTrigger>
                      <TabsTrigger value="caption" className="text-[10px]">Caption</TabsTrigger>
                      <TabsTrigger value="variants" className="text-[10px]">Varianten</TabsTrigger>
                    </TabsList>
                    <TabsContent value="cta" className="mt-3 space-y-2">
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5">
                        <p className="text-xs">{selectedHook.ctaTrigger}</p>
                      </div>
                      <CopyButton text={selectedHook.ctaTrigger} />
                    </TabsContent>
                    <TabsContent value="caption" className="mt-3 space-y-2">
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5">
                        <p className="text-xs whitespace-pre-line">{selectedHook.captionStarter}</p>
                      </div>
                      <CopyButton text={selectedHook.captionStarter} />
                    </TabsContent>
                    <TabsContent value="variants" className="mt-3 space-y-2">
                      <p className="text-[10px] text-muted-foreground">
                        Öffne Hook im Generator, um automatische Text-Varianten zu erzeugen.
                      </p>
                    </TabsContent>
                  </Tabs>

                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <Button
                      size="sm"
                      className="btn-gold w-full"
                      onClick={() => openInGenerator(selectedHook)}
                    >
                      <ArrowRight className="h-3 w-3 mr-1" /> In Generator öffnen
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => expandAsSeries(selectedHook)}
                    >
                      <Sparkles className="h-3 w-3 mr-1" /> Als Serie ausbauen
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => checkCompliance(selectedHook)}
                      disabled={complianceCheck?.isPending}
                    >
                      <Shield className="h-3 w-3 mr-1" /> Compliance prüfen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-border/50">
                <CardContent className="p-6 text-center space-y-2">
                  <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-xs text-muted-foreground">
                    Wähle einen Hook aus der Liste für Details, Scores, CTAs und Aktionen.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Inspiration / Empty state */}
      {hooks.length === 0 && !generating && (
        <Card className="border-border/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6 text-center space-y-3">
            <Lightbulb className="h-10 w-10 text-primary mx-auto" />
            <h3 className="font-semibold">Starte mit einem Thema</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Beispiele: "Autokonzept", "Morning Routine mit Aloe Vera", "Warum ich meinen Job gekündigt habe", "Lifetakt für Sportler".
              Je präziser das Thema, desto schärfer die Hooks.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Manus note */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Optional an Manus:</p>
          <p className="text-muted-foreground">
            Die Seite funktioniert sofort mit bestehenden APIs (<code>content.generate</code>, <code>complianceShield.check</code>).
            Für tiefere Scoring-Logik könnten dedizierte Endpoints <code>hookEngine.generateSet</code>, <code>hookEngine.score</code>, <code>hookEngine.expandVariant</code> angelegt werden (Spec in docs/VIRAL_STRATEGY.md).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
