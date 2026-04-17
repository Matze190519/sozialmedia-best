import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Heart, Loader2, Sparkles, TrendingUp, Brain, Video, Wand2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

/**
 * SMART ANALYSIS — 3 Analyse-Tools
 *
 * FUNKTIONAL mit bestehenden APIs:
 * - EMOTION-ENGINE: via content.generate mit Analyse-Prompt
 * - TRANSFORMATION: via content.generate mit Before/After-Prompt
 * - REACTION-STUDIO: Backend-Endpoint benötigt (Video-Composition)
 */

type Mode = "emotion" | "transformation" | "reaction";

const EMOTIONS = [
  { key: "inspiration", label: "Inspiration", color: "text-amber-400", engagement: "hoch" },
  { key: "envy", label: "Neid", color: "text-purple-400", engagement: "sehr hoch" },
  { key: "hope", label: "Hoffnung", color: "text-blue-400", engagement: "hoch" },
  { key: "curiosity", label: "Neugier", color: "text-cyan-400", engagement: "sehr hoch" },
  { key: "fomo", label: "FOMO", color: "text-red-400", engagement: "mittel-hoch" },
  { key: "pride", label: "Stolz", color: "text-emerald-400", engagement: "mittel" },
  { key: "controversy", label: "Kontroverse", color: "text-orange-400", engagement: "hoch (riskant)" },
];

const TRANSFORMATION_TYPES = [
  { id: "business", emoji: "💼", label: "Business-Transformation", prompt: "Erstelle einen Vorher/Nachher-Post: Vorher: gestresste Person im 9-to-5 Büro. Nachher: gleiche Person entspannt am Laptop am Strand. Beschreibe beide Zustände emotional. Generiere Bild mit beiden Szenen nebeneinander." },
  { id: "skin", emoji: "✨", label: "Haut-Transformation", prompt: "Erstelle einen Vorher/Nachher-Post über LR-Hautpflege: Vorher: müde, graue Haut. Nachher: strahlende, gesunde Haut dank Aloe Vera und Collagen Plus. Emotionale Beschreibung. Generiere passendes Bild." },
  { id: "energy", emoji: "⚡", label: "Energie-Transformation", prompt: "Vorher/Nachher Energie-Transformation: Vorher erschöpfte Person mit leerem Blick. Nachher energetische Person strahlend aktiv dank Lifetakt Energy. Emotionale Copy." },
  { id: "home", emoji: "🏡", label: "Home-Upgrade", prompt: "Vorher/Nachher Home-Upgrade: Vorher kleine Mietwohnung. Nachher großes Traumhaus mit Garten, finanziert durch LR-Business. Inspirierender Post." },
  { id: "mindset", emoji: "🧠", label: "Mindset-Shift", prompt: "Vorher/Nachher Mindset-Transformation: Vorher verzweifelte Person ohne Hoffnung. Nachher selbstbewusster LR-Partner mit klarer Vision." },
  { id: "income", emoji: "💰", label: "Einkommens-Sprung", prompt: "Vorher/Nachher Einkommens-Transformation: Vorher knapp am Monatsende. Nachher finanzielle Freiheit mit LR-Nebeneinkommen. Authentischer Post." },
];

export default function SmartAnalysisPage() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<Mode>("emotion");

  // Emotion
  const [postContent, setPostContent] = useState("");
  const [emotionResult, setEmotionResult] = useState<string | null>(null);

  // Transformation
  const [transformType, setTransformType] = useState("");

  const utils = trpc.useUtils();
  const generateMutation = trpc.content.generate.useMutation();

  const runAction = async () => {
    try {
      if (mode === "emotion") {
        if (!postContent.trim()) { toast.error("Post-Text eingeben"); return; }

        const result = await generateMutation.mutateAsync({
          contentType: "post",
          topic: "EMOTION-ANALYSE",
          context: `Analysiere diesen Social-Media-Post. Gib strukturiert zurück:
1. Primäre Emotion (eine aus: Inspiration, Neid, Hoffnung, Neugier, FOMO, Stolz, Kontroverse)
2. Emotion-Score (0-100)
3. Erwartetes Engagement-Level
4. 3 konkrete Verbesserungsvorschläge

POST:
${postContent}`,
        });

        setEmotionResult((result as any)?.content || "Analyse nicht möglich");
        toast.success("Analyse fertig!");

      } else if (mode === "transformation") {
        if (!transformType) { toast.error("Transformation wählen"); return; }
        const t = TRANSFORMATION_TYPES.find(x => x.id === transformType);
        if (!t) return;

        await generateMutation.mutateAsync({
          contentType: "post",
          topic: `TRANSFORMATION: ${t.label}`,
          pillar: "lifestyle",
          platforms: ["instagram", "tiktok"],
          context: t.prompt,
          autoGenerateImage: true,
        });

        utils.content.list.invalidate();
        toast.success("Transformations-Post erstellt! Landet in der Freigabe.");
        setTimeout(() => setLocation("/approval"), 1500);

      } else if (mode === "reaction") {
        toast.info("Reaction-Studio benötigt noch Backend-Integration (siehe BACKEND_SPECS.md)");
      }
    } catch (err: any) {
      toast.error(`Fehler: ${err.message || "Aktion fehlgeschlagen"}`);
    }
  };

  const generating = generateMutation.isPending;

  const MODE_INFO: Record<Mode, { icon: typeof Brain; title: string; desc: string; status: "ready" | "pending" }> = {
    emotion: { icon: Brain, title: "Emotion-Engine", desc: "KI analysiert welche Emotion dein Post auslöst", status: "ready" },
    transformation: { icon: TrendingUp, title: "Transformation", desc: "Vorher/Nachher-Posts mit KI-Bild", status: "ready" },
    reaction: { icon: Video, title: "Reaction-Studio", desc: "Subway-Surfers-Trick (braucht Video-Backend)", status: "pending" },
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>
          Smart Analysis
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analysiere, transformiere, generiere. Emotion-Analyse und Transformations-Posts funktionieren sofort.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(Object.keys(MODE_INFO) as Mode[]).map(m => {
          const info = MODE_INFO[m];
          const Icon = info.icon;
          return (
            <button
              key={m}
              onClick={() => { setMode(m); setEmotionResult(null); }}
              className={`p-4 rounded-xl border-2 transition-all text-left relative ${
                mode === m ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
              }`}
            >
              <Icon className="h-6 w-6 text-primary mb-2" />
              <div className="text-sm font-semibold">{info.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{info.desc}</div>
              <Badge
                variant="outline"
                className={`absolute top-2 right-2 text-[9px] ${
                  info.status === "ready" ? "border-emerald-500/50 text-emerald-400" : "border-amber-500/50 text-amber-400"
                }`}
              >
                {info.status === "ready" ? "✓ Aktiv" : "⏳ Backend"}
              </Badge>
            </button>
          );
        })}
      </div>

      {mode === "emotion" && (
        <Card className="border-primary/30">
          <CardContent className="p-5 space-y-3">
            <h2 className="font-semibold">Post-Text</h2>
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
                  <div className="text-xs font-semibold">{t.label}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "reaction" && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-5 text-xs">
            <p className="font-semibold text-amber-400 mb-2">⏳ Braucht Backend-Integration</p>
            <p className="text-muted-foreground">
              Reaction-Studio (Gameplay + Hook + Voiceover) benötigt einen FFmpeg-basierten Video-Compositor. Spec ist in <code>docs/BACKEND_SPECS.md</code> dokumentiert.
              Manus kann das als nächsten Schritt implementieren.
            </p>
          </CardContent>
        </Card>
      )}

      {mode !== "reaction" && (
        <div className="flex justify-center">
          <Button
            size="lg"
            className="btn-gold h-12 px-8"
            onClick={runAction}
            disabled={generating || (mode === "emotion" && !postContent.trim()) || (mode === "transformation" && !transformType)}
          >
            {generating ? (
              <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Läuft...</>
            ) : (
              <><Wand2 className="h-5 w-5 mr-2" /> {mode === "emotion" ? "Analysieren" : "Generieren"}</>
            )}
          </Button>
        </div>
      )}

      {emotionResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/30">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Heart className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-bold text-primary">Emotion-Analyse</h3>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm whitespace-pre-line">{emotionResult}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
