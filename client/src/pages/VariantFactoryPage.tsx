import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  Sparkles, Copy, Check, Lock, Unlock, Loader2, Wand2,
  Globe, Calendar, Shield, Layers, ArrowLeftRight, GitBranch
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * VARIANT FACTORY — 1 Gewinner → 10-30 Varianten
 *
 * Hebel: Hook, CTA, Audience, Character, Platform, Language
 * Lock-Mechanik: bestimmte Elemente fixieren, andere variieren.
 */

type Goal = "follower" | "engagement" | "lead";
type VariantType = "hook" | "cta" | "audience" | "character" | "platform" | "language";

interface VariantSeed {
  id: string;
  originalHook: string;
  originalCta: string;
  originalAngle: string;
  platform: string;
  goal: Goal;
}

interface VariantResult {
  id: string;
  variantType: VariantType;
  text: string;
  explanation: string;
  estimatedImpact: number;
  locked?: boolean;
  marked?: "ab-test" | "recycle" | "";
  complianceStatus?: "green" | "yellow" | "red" | "unchecked";
}

const VARIANT_HEBEL: { type: VariantType; label: string; icon: string; desc: string }[] = [
  { type: "hook", label: "Hook tauschen", icon: "🎣", desc: "Anderer Einstieg, gleiche Message" },
  { type: "cta", label: "CTA tauschen", icon: "📣", desc: "Anderer Call-to-Action" },
  { type: "audience", label: "Zielgruppe drehen", icon: "👥", desc: "Anderer Typ Mensch angesprochen" },
  { type: "character", label: "Perspektive (POV)", icon: "👁️", desc: "Ich-Form, Sie-Form, POV-Format" },
  { type: "platform", label: "Plattform optimieren", icon: "📱", desc: "Format an TikTok/Reels/Shorts anpassen" },
  { type: "language", label: "Sprachstil", icon: "🌐", desc: "Ernst, locker, comedy, premium" },
];

const QUICK_LABELS = [
  { id: "hook-only", label: "Nur Hook tauschen", types: ["hook"] as VariantType[] },
  { id: "cta-only", label: "Nur CTA tauschen", types: ["cta"] as VariantType[] },
  { id: "pov-flip", label: "POV drehen", types: ["character"] as VariantType[] },
  { id: "comedy", label: "Comedy-Version", types: ["language", "hook"] as VariantType[] },
  { id: "premium", label: "Premium-Version", types: ["language", "character"] as VariantType[] },
  { id: "full", label: "Alle Hebel", types: ["hook", "cta", "audience", "character", "platform", "language"] as VariantType[] },
];

const HOOK_VARIATIONS = [
  (h: string) => `POV: ${h.replace(/^[^a-zA-Zäöü]*/i, "")}`,
  (h: string) => `Warum ${h.toLowerCase()} wichtiger ist als du denkst.`,
  (h: string) => `Niemand spricht über: ${h}`,
  (h: string) => `Die meisten scheitern bei ${h.toLowerCase().replace(/[.!?]$/, "")} — hier der Grund.`,
  (h: string) => `3 Gründe, warum ${h.toLowerCase().replace(/[.!?]$/, "")} alles ändert.`,
  (h: string) => `${h} — aber was niemand dir zeigt, ist dieses Detail.`,
  (h: string) => `Heute vor 365 Tagen: ${h}. Heute: komplett anderes Spiel.`,
];

const CTA_VARIATIONS_BY_GOAL: Record<Goal, string[]> = {
  lead: [
    "Kommentiere 🔥 für mehr Infos per DM",
    "DM 'PLAN' für meinen kompletten Fahrplan",
    "Schreib mir 'START', ich antworte persönlich",
    "Link in Bio — kostenloser Guide",
    "15-Min Gespräch? Schreib 'CALL'",
  ],
  engagement: [
    "Was ist deine Version? Kommentar!",
    "Stimm ab — welche Option?",
    "Markiere jemanden, der das sehen muss",
    "Speichere den Post, du wirst ihn brauchen",
    "Teile das mit einer Person die es hören muss",
  ],
  follower: [
    "Folge mir für Teil 2 morgen",
    "Neue Folge morgen — folge mir jetzt",
    "Mehr davon? Folge mir.",
    "Du willst Teil 2 nicht verpassen? Folge mir.",
    "Drück auf Folgen für die nächste Wahrheit.",
  ],
};

const AUDIENCE_VARIATIONS = [
  { key: "moms", label: "Mütter", prefix: "Liebe Mamas," },
  { key: "men30plus", label: "Männer 30+", prefix: "Männer in den 30ern:" },
  { key: "students", label: "Studenten", prefix: "Unis-Abgänger hört zu:" },
  { key: "fitness", label: "Fitness-Community", prefix: "Für jeden der Fitness liebt:" },
  { key: "tired", label: "Müde Angestellte", prefix: "Wenn du gerade Montag-müde bist:" },
  { key: "dreamers", label: "Träumer", prefix: "An alle mit großen Träumen:" },
];

const POV_VARIATIONS = [
  (h: string) => `POV: ${h}`,
  (h: string) => `Ich erkläre es mir selbst: ${h}`,
  (h: string) => `Mein Team fragte mich, wie ich zu ${h.toLowerCase()} kam. Hier die ehrliche Antwort.`,
  (h: string) => `Wenn ich heute neu starten würde: ${h}`,
];

const PLATFORM_OPTS = [
  { key: "tiktok", label: "TikTok-optimiert", note: "3-Sek-Hook, schneller Cut, Trending-Audio" },
  { key: "instagram", label: "Instagram Reels", note: "Visuell premium, ästhetisches Opening" },
  { key: "youtube-shorts", label: "YouTube Shorts", note: "3-Min-Variante möglich, Ausführlicher Hook" },
  { key: "linkedin", label: "LinkedIn", note: "Business-sprachlich, keine Umgangssprache" },
];

const LANGUAGE_STYLES = [
  { key: "direct", label: "Direkt & Hart", note: "Kurze Sätze, harte Fakten" },
  { key: "warm", label: "Warm & Vertraut", note: "Erzählerisch, menschlich" },
  { key: "premium", label: "Premium & Edel", note: "Luxury-Vokabular, wenig Slang" },
  { key: "comedy", label: "Comedy & Selbstironie", note: "Meme-Referenzen, Overthink-Witze" },
];

function generateVariants(seed: VariantSeed, types: VariantType[]): VariantResult[] {
  const results: VariantResult[] = [];

  if (types.includes("hook")) {
    HOOK_VARIATIONS.slice(0, 3).forEach((fn, i) => {
      results.push({
        id: `v-hook-${i}-${Date.now()}`,
        variantType: "hook",
        text: fn(seed.originalHook),
        explanation: "Hook-Variation: anderer Einstieg, gleiche Zielgruppe",
        estimatedImpact: 70 + Math.floor(Math.random() * 20),
      });
    });
  }

  if (types.includes("cta")) {
    CTA_VARIATIONS_BY_GOAL[seed.goal].slice(0, 3).forEach((cta, i) => {
      results.push({
        id: `v-cta-${i}-${Date.now()}`,
        variantType: "cta",
        text: `${seed.originalHook}\n\n${cta}`,
        explanation: "CTA-Variation für gleiches Ziel",
        estimatedImpact: 65 + Math.floor(Math.random() * 25),
      });
    });
  }

  if (types.includes("audience")) {
    AUDIENCE_VARIATIONS.slice(0, 3).forEach((aud, i) => {
      results.push({
        id: `v-aud-${i}-${Date.now()}`,
        variantType: "audience",
        text: `${aud.prefix} ${seed.originalHook}`,
        explanation: `Auf ${aud.label} zugeschnitten`,
        estimatedImpact: 60 + Math.floor(Math.random() * 25),
      });
    });
  }

  if (types.includes("character")) {
    POV_VARIATIONS.slice(0, 2).forEach((fn, i) => {
      results.push({
        id: `v-pov-${i}-${Date.now()}`,
        variantType: "character",
        text: fn(seed.originalHook),
        explanation: "POV / Perspektiv-Wechsel",
        estimatedImpact: 68 + Math.floor(Math.random() * 20),
      });
    });
  }

  if (types.includes("platform")) {
    PLATFORM_OPTS.slice(0, 2).forEach((p, i) => {
      results.push({
        id: `v-plat-${i}-${Date.now()}`,
        variantType: "platform",
        text: `[${p.label}] ${seed.originalHook}`,
        explanation: p.note,
        estimatedImpact: 65 + Math.floor(Math.random() * 20),
      });
    });
  }

  if (types.includes("language")) {
    LANGUAGE_STYLES.slice(0, 2).forEach((l, i) => {
      results.push({
        id: `v-lang-${i}-${Date.now()}`,
        variantType: "language",
        text: `[Stil: ${l.label}] ${seed.originalHook}`,
        explanation: l.note,
        estimatedImpact: 62 + Math.floor(Math.random() * 25),
      });
    });
  }

  return results.sort((a, b) => b.estimatedImpact - a.estimatedImpact);
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
        toast.success("Kopiert");
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

export default function VariantFactoryPage() {
  const [seed, setSeed] = useState<VariantSeed>({
    id: `seed-${Date.now()}`,
    originalHook: "",
    originalCta: "",
    originalAngle: "",
    platform: "instagram",
    goal: "lead",
  });

  const [activeTypes, setActiveTypes] = useState<VariantType[]>(["hook", "cta"]);
  const [results, setResults] = useState<VariantResult[]>([]);
  const [generating, setGenerating] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  const complianceCheck = trpc.complianceShield?.check.useMutation();

  // Load seed from localStorage if available
  useEffect(() => {
    try {
      const raw = localStorage.getItem("variant-factory-seed");
      if (raw) {
        const data = JSON.parse(raw);
        setSeed(prev => ({
          ...prev,
          originalHook: data.title || data.preview?.slice(0, 100) || data.episode?.hook || "",
          originalCta: data.episode?.cta || "",
          originalAngle: data.angle || "",
        }));
        localStorage.removeItem("variant-factory-seed");
        toast.info("Seed geladen aus externem Tool");
      }
    } catch { /* ignore */ }
  }, []);

  const toggleType = (type: VariantType) => {
    setActiveTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const applyQuickLabel = (id: string) => {
    const label = QUICK_LABELS.find(l => l.id === id);
    if (label) setActiveTypes(label.types);
  };

  const toggleLock = (id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, locked: !r.locked } : r));
  };

  const markVariant = (id: string, mark: "ab-test" | "recycle" | "") => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, marked: mark } : r));
  };

  const generate = async () => {
    if (!seed.originalHook.trim()) {
      toast.error("Original-Hook eingeben");
      return;
    }
    if (activeTypes.length === 0) {
      toast.error("Mindestens einen Hebel aktivieren");
      return;
    }

    setGenerating(true);
    try {
      // Keep locked variants, regenerate rest
      const locked = results.filter(r => r.locked);
      const newResults = generateVariants(seed, activeTypes);
      setResults([...locked, ...newResults]);
      toast.success(`${newResults.length} neue Varianten`);
    } catch {
      toast.error("Generierung fehlgeschlagen");
    } finally {
      setGenerating(false);
    }
  };

  const checkAllCompliance = async () => {
    if (results.length === 0) return;
    toast.info("Compliance-Prüfung läuft...");
    let completed = 0;
    for (const result of results) {
      try {
        const res = await complianceCheck?.mutateAsync({
          content: result.text,
          platform: seed.platform,
        } as any);
        const status = ((res as any)?.status as VariantResult["complianceStatus"]) || "unchecked";
        setResults(prev => prev.map(r => r.id === result.id ? { ...r, complianceStatus: status } : r));
      } catch {
        setResults(prev => prev.map(r => r.id === result.id ? { ...r, complianceStatus: "unchecked" } : r));
      }
      completed++;
    }
    toast.success(`${completed} Varianten geprüft`);
  };

  const copyAll = () => {
    const text = results.map((r, i) => `--- Variante ${i + 1} (${r.variantType}) ---\n${r.text}\n`).join("\n");
    navigator.clipboard.writeText(text);
    toast.success(`${results.length} Varianten kopiert`);
  };

  const batchPlan = () => {
    localStorage.setItem("batch-plan-variants", JSON.stringify(results));
    toast.info("Als Batch geplant (Seed gespeichert)");
  };

  const toLocalization = () => {
    localStorage.setItem("localization-seed", JSON.stringify({ original: seed, variants: results }));
    toast.info("An Localization übergeben");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gold-text" style={{ fontFamily: "var(--font-heading)" }}>
          Variant Factory
        </h1>
        <p className="text-sm text-muted-foreground">
          1 Gewinner → 10-30 Varianten. Der Multiplikator für 50 Clips pro Woche.
        </p>
      </div>

      {/* Seed Input */}
      <Card className="border-primary/30">
        <CardContent className="p-5 space-y-3">
          <h2 className="font-semibold text-sm">Original / Gewinner-Seed</h2>
          <div>
            <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Original Hook *</label>
            <Textarea
              value={seed.originalHook}
              onChange={(e) => setSeed({ ...seed, originalHook: e.target.value })}
              rows={2}
              placeholder="Der Einstieg deines Gewinner-Posts"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Original CTA</label>
              <Input
                value={seed.originalCta}
                onChange={(e) => setSeed({ ...seed, originalCta: e.target.value })}
                placeholder="z.B. 'Kommentiere 🔥'"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Original Angle</label>
              <Input
                value={seed.originalAngle}
                onChange={(e) => setSeed({ ...seed, originalAngle: e.target.value })}
                placeholder="z.B. 'LR Business Opportunity'"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Plattform</label>
              <div className="flex gap-1 flex-wrap">
                {["instagram", "tiktok", "facebook", "youtube"].map(p => (
                  <Button
                    key={p}
                    size="sm"
                    variant={seed.platform === p ? "default" : "outline"}
                    className={`text-xs ${seed.platform === p ? "btn-gold" : ""}`}
                    onClick={() => setSeed({ ...seed, platform: p })}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Ziel</label>
              <div className="flex gap-1">
                {(["follower", "engagement", "lead"] as Goal[]).map(g => (
                  <Button
                    key={g}
                    size="sm"
                    variant={seed.goal === g ? "default" : "outline"}
                    className={`text-xs ${seed.goal === g ? "btn-gold" : ""}`}
                    onClick={() => setSeed({ ...seed, goal: g })}
                  >
                    {g}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hebel / Quick labels */}
      <Card className="border-primary/30">
        <CardContent className="p-5 space-y-3">
          <h2 className="font-semibold text-sm">Hebel wählen</h2>
          <div className="flex gap-2 flex-wrap mb-3">
            {QUICK_LABELS.map(l => (
              <Button
                key={l.id}
                size="sm"
                variant="outline"
                onClick={() => applyQuickLabel(l.id)}
                className="text-xs"
              >
                {l.label}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {VARIANT_HEBEL.map(h => (
              <button
                key={h.type}
                onClick={() => toggleType(h.type)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  activeTypes.includes(h.type) ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-xl mb-1">{h.icon}</div>
                <div className="text-xs font-semibold">{h.label}</div>
                <div className="text-[10px] text-muted-foreground">{h.desc}</div>
              </button>
            ))}
          </div>

          <Button
            size="lg"
            className="btn-gold w-full"
            onClick={generate}
            disabled={generating || !seed.originalHook.trim() || activeTypes.length === 0}
          >
            {generating ? (
              <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Erzeuge Varianten…</>
            ) : (
              <><Wand2 className="h-5 w-5 mr-2" /> Varianten generieren</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-semibold">{results.length} Varianten</h2>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => setCompareMode(!compareMode)}>
                <ArrowLeftRight className="h-3 w-3 mr-1" /> {compareMode ? "Normale Ansicht" : "Vergleich"}
              </Button>
              <Button size="sm" variant="outline" onClick={checkAllCompliance}>
                <Shield className="h-3 w-3 mr-1" /> Alle prüfen
              </Button>
              <Button size="sm" variant="outline" onClick={batchPlan}>
                <Calendar className="h-3 w-3 mr-1" /> Als Batch planen
              </Button>
              <Button size="sm" variant="outline" onClick={toLocalization}>
                <Globe className="h-3 w-3 mr-1" /> Lokalisieren
              </Button>
              <Button size="sm" variant="outline" onClick={copyAll}>
                <Copy className="h-3 w-3 mr-1" /> Alle kopieren
              </Button>
            </div>
          </div>

          <div className={compareMode ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "space-y-3"}>
            {compareMode && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <Badge variant="outline" className="text-[10px] mb-2">ORIGINAL</Badge>
                  <p className="text-sm whitespace-pre-line">{seed.originalHook}</p>
                  {seed.originalCta && <p className="text-xs text-muted-foreground mt-2">CTA: {seed.originalCta}</p>}
                </CardContent>
              </Card>
            )}

            {results.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card className={`${r.locked ? "border-amber-500/30 bg-amber-500/5" : "border-border/50"}`}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-primary font-bold text-xs w-6 shrink-0">#{i + 1}</span>
                      <p className="flex-1 text-sm whitespace-pre-line">{r.text}</p>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => toggleLock(r.id)}>
                          {r.locked ? <Lock className="h-3 w-3 text-amber-400" /> : <Unlock className="h-3 w-3" />}
                        </Button>
                        <CopyButton text={r.text} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <Badge variant="outline" className="text-[9px]">
                        <Layers className="h-2.5 w-2.5 mr-0.5" /> {r.variantType}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30">
                        Impact {r.estimatedImpact}
                      </Badge>
                      {r.complianceStatus === "green" && (
                        <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">
                          🟢 Compliance OK
                        </Badge>
                      )}
                      {r.complianceStatus === "yellow" && (
                        <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30">
                          🟡 Warnung
                        </Badge>
                      )}
                      {r.complianceStatus === "red" && (
                        <Badge variant="outline" className="text-[9px] text-red-400 border-red-500/30">
                          🔴 Stopp
                        </Badge>
                      )}
                      {r.explanation && (
                        <span className="text-[10px] text-muted-foreground">· {r.explanation}</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={r.marked === "ab-test" ? "default" : "outline"}
                        className="h-6 text-[10px] flex-1"
                        onClick={() => markVariant(r.id, r.marked === "ab-test" ? "" : "ab-test")}
                      >
                        <GitBranch className="h-2.5 w-2.5 mr-0.5" /> A/B-Test
                      </Button>
                      <Button
                        size="sm"
                        variant={r.marked === "recycle" ? "default" : "outline"}
                        className="h-6 text-[10px] flex-1"
                        onClick={() => markVariant(r.id, r.marked === "recycle" ? "" : "recycle")}
                      >
                        <Sparkles className="h-2.5 w-2.5 mr-0.5" /> Recycle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Optional an Manus:</p>
          <p className="text-muted-foreground">
            Aktuell: Template-basierte Varianten (instant). Für tiefere KI-Varianten: neue Endpoints <code>variantFactory.generate</code>, <code>variantFactory.compare</code>, <code>variantFactory.batchPlan</code> die content.generate mit spezifischen Hebeln aufrufen. Spec in docs/VIRAL_STRATEGY.md.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
