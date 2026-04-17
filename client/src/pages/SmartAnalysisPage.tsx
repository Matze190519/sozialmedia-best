import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Upload, Heart, Loader2, Sparkles, TrendingUp, Brain, Video, Wand2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

/**
 * SMART ANALYSIS — 3 smarte Analyse-Tools
 *
 * 1. REACTION-STUDIO — Subway-Surfers-Style Videos (Gameplay + Hook-Text + Voiceover)
 * 2. EMOTION-ENGINE — KI analysiert welche Emotion ein Post auslöst
 * 3. TRANSFORMATION — Vorher/Nachher mit KI (Business, Haut, Lifestyle)
 *
 * BACKEND-API (Manus bitte einbinden):
 * - POST /api/reaction/generate { hook, gameplay, voice } → videoUrl
 * - POST /api/emotion/analyze { content } → { emotion, score, recommendations }
 * - POST /api/transformation/generate { beforePhoto, scenario } → { beforeUrl, afterUrl }
 */

type Mode = "reaction" | "emotion" | "transformation";

const GAMEPLAY_OPTIONS = [
  { id: "subway", emoji: "🏃", label: "Subway Surfers", desc: "Der Klassiker" },
  { id: "minecraft-parkour", emoji: "🟦", label: "Minecraft Parkour", desc: "Hypnotic" },
  { id: "satisfying-slime", emoji: "🟢", label: "Slime Squeeze", desc: "ASMR" },
  { id: "soap-cutting", emoji: "🧼", label: "Soap Cutting", desc: "Oddly Satisfying" },
  { id: "kinetic-sand", emoji: "🟨", label: "Kinetic Sand", desc: "Relaxing" },
  { id: "none", emoji: "⬛", label: "Nur Text", desc: "Clean Look" },
];

const EMOTIONS = [
  { key: "inspiration", label: "Inspiration", color: "text-amber-400", desc: "Motiviert, aufbauend", engagement: "hoch" },
  { key: "envy", label: "Neid", color: "text-purple-400", desc: "Lifestyle-Posting", engagement: "sehr hoch" },
  { key: "hope", label: "Hoffnung", color: "text-blue-400", desc: "Zukunfts-Versprechen", engagement: "hoch" },
  { key: "curiosity", label: "Neugier", color: "text-cyan-400", desc: "Cliffhanger, Fragen", engagement: "sehr hoch" },
  { key: "fomo", label: "FOMO", color: "text-red-400", desc: "Fear of Missing Out", engagement: "mittel-hoch" },
  { key: "pride", label: "Stolz", color: "text-emerald-400", desc: "Erfolgs-Posts", engagement: "mittel" },
  { key: "controversy", label: "Kontroverse", color: "text-orange-400", desc: "Polarisierend", engagement: "hoch (riskant)" },
];

const TRANSFORMATION_TYPES = [
  { id: "business", emoji: "💼", label: "Business-Transformation", before: "9-to-5 gestresst im Büro", after: "Laptop-Office am Strand" },
  { id: "skin", emoji: "✨", label: "Haut-Transformation", before: "Müde, grau, ohne Strahlen", after: "Strahlend, frisch, geglowed" },
  { id: "energy", emoji: "⚡", label: "Energie-Transformation", before: "Erschöpft, Kaffee-abhängig", after: "Voller Energie, aktiv, fit" },
  { id: "home", emoji: "🏡", label: "Home-Upgrade", before: "Kleine Mietwohnung", after: "Eigenes Traumhaus mit Garten" },
  { id: "mindset", emoji: "🧠", label: "Mindset-Shift", before: "Verzweifelt, keine Hoffnung", after: "Selbstbewusst, klar, fokussiert" },
  { id: "income", emoji: "💰", label: "Einkommens-Sprung", before: "Knapp am Ende des Monats", after: "Finanzielle Freiheit erreicht" },
];

export default function SmartAnalysisPage() {
  const [mode, setMode] = useState<Mode>("emotion");

  // Reaction
  const [hook, setHook] = useState("");
  const [gameplay, setGameplay] = useState("subway");

  // Emotion
  const [postContent, setPostContent] = useState("");
  const [emotionResult, setEmotionResult] = useState<{ emotion: string; score: number; tips: string[] } | null>(null);

  // Transformation
  const [transformType, setTransformType] = useState("");

  const [generating, setGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const runAction = async () => {
    setGenerating(true);
    setResultUrl(null);
    setEmotionResult(null);
    try {
      // TODO MANUS: Backend anbinden
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (mode === "reaction") {
        if (!hook.trim()) { toast.error("Hook eingeben"); setGenerating(false); return; }
        setResultUrl("https://placehold.co/720x1280/1a1a1a/d4af37?text=Reaction+Video");
        toast.success("Reaction-Video erstellt!");
      } else if (mode === "emotion") {
        if (!postContent.trim()) { toast.error("Post-Text eingeben"); setGenerating(false); return; }
        const emotions = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
        setEmotionResult({
          emotion: emotions.label,
          score: Math.floor(Math.random() * 30) + 70,
          tips: [
            `Dieser Post triggert vor allem: ${emotions.label}`,
            `Erwartetes Engagement: ${emotions.engagement}`,
            "Tipp: Füge einen Cliffhanger am Ende hinzu für noch mehr Kommentare",
            "Tipp: Nutze Pillar 'Lifestyle' für visuellen Support",
          ],
        });
        toast.success("Post analysiert!");
      } else if (mode === "transformation") {
        if (!transformType) { toast.error("Transformation wählen"); setGenerating(false); return; }
        setResultUrl("https://placehold.co/1600x800/1a1a1a/d4af37?text=Before+%7C+After");
        toast.success("Transformation erstellt!");
      }
    } catch {
      toast.error("Fehler bei der Aktion");
    } finally {
      setGenerating(false);
    }
  };

  const MODE_INFO: Record<Mode, { icon: typeof Brain; title: string; desc: string }> = {
    reaction: { icon: Video, title: "Reaction-Studio", desc: "Subway-Surfers-Trick: Hook + Gameplay + Voiceover = garantiert viral" },
    emotion: { icon: Brain, title: "Emotion-Engine", desc: "KI sagt dir welche Emotion dein Post auslöst und wie du Engagement boosten kannst" },
    transformation: { icon: TrendingUp, title: "Transformation", desc: "Vorher/Nachher-Bilder mit KI. Business, Haut, Lifestyle, Einkommen" },
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>
          Smart Analysis
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          3 smarte Tools für maximale Viral-Chance. Analysiere, transformiere, generiere.
        </p>
      </div>

      {/* Mode-Switch */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(Object.keys(MODE_INFO) as Mode[]).map(m => {
          const info = MODE_INFO[m];
          const Icon = info.icon;
          return (
            <button
              key={m}
              onClick={() => { setMode(m); setResultUrl(null); setEmotionResult(null); }}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                mode === m ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
              }`}
            >
              <Icon className="h-6 w-6 text-primary mb-2" />
              <div className="text-sm font-semibold">{info.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{info.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Reaction Mode */}
      {mode === "reaction" && (
        <>
          <Card className="border-primary/30">
            <CardContent className="p-5 space-y-3">
              <h2 className="font-semibold">Hook-Text</h2>
              <Textarea
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                placeholder="z.B. '3 Gründe warum 90% der Leute im Hamsterrad bleiben...'"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardContent className="p-5">
              <h2 className="font-semibold mb-3">Gameplay-Hintergrund</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GAMEPLAY_OPTIONS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setGameplay(g.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      gameplay === g.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{g.emoji}</div>
                    <div className="text-xs font-semibold">{g.label}</div>
                    <div className="text-[10px] text-muted-foreground">{g.desc}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Emotion Mode */}
      {mode === "emotion" && (
        <Card className="border-primary/30">
          <CardContent className="p-5 space-y-3">
            <h2 className="font-semibold">Post-Text zum Analysieren</h2>
            <Textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Füge deinen Post-Text ein. KI analysiert welche Emotion ausgelöst wird."
              rows={5}
            />
            <div className="flex flex-wrap gap-1">
              {EMOTIONS.map(e => (
                <Badge key={e.key} variant="outline" className={`text-[10px] ${e.color}`}>
                  {e.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transformation Mode */}
      {mode === "transformation" && (
        <Card className="border-primary/30">
          <CardContent className="p-5">
            <h2 className="font-semibold mb-3">Transformations-Typ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TRANSFORMATION_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTransformType(t.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    transformType === t.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-3xl mb-2">{t.emoji}</div>
                  <div className="text-xs font-semibold mb-2">{t.label}</div>
                  <div className="text-[10px] text-muted-foreground">
                    <span className="text-red-400">{t.before}</span>
                    <ArrowRight className="h-2 w-2 inline mx-1" />
                    <span className="text-emerald-400">{t.after}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action */}
      <div className="flex justify-center">
        <Button
          size="lg"
          className="btn-gold h-12 px-8"
          onClick={runAction}
          disabled={generating}
        >
          {generating ? (
            <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Läuft...</>
          ) : (
            <><Wand2 className="h-5 w-5 mr-2" /> {mode === "emotion" ? "Analysieren" : "Generieren"}</>
          )}
        </Button>
      </div>

      {/* Results */}
      {resultUrl && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden">
            <img src={resultUrl} alt="" className="w-full" />
          </Card>
        </motion.div>
      )}

      {emotionResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/30">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Primäre Emotion</p>
                  <h3 className="text-xl font-bold text-primary">{emotionResult.emotion}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${emotionResult.score}%` }} />
                    </div>
                    <span className="text-xs font-semibold">{emotionResult.score}/100</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                {emotionResult.tips.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <Sparkles className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Hinweis an Manus:</p>
          <p className="text-muted-foreground">
            Reaction: FFmpeg-Service der Gameplay-Video + Text-Overlay + KI-Voiceover zusammenfügt. Gameplay-Videos als Stock in R2/S3. <br/>
            Emotion: LLM-Call mit System-Prompt "Analysiere Emotion" → strukturiertes JSON zurück. <br/>
            Transformation: 2x Nano Banana Pro Call (before + after), nebeneinander composited.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
