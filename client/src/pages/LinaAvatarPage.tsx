import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Sparkles, Video, Play, Download, Copy, Check,
  Loader2, Mic, Star, Zap, RefreshCw, Info, Bot,
} from "lucide-react";
import { GlowCard } from "@/components/GlowCard";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { trpc as trpcTyped } from "@/lib/trpc";
const trpc = trpcTyped as any;

const PRODUCT_PRESETS = [
  { label: "Aloe Vera Gel", topic: "Das LR Aloe Vera Gel ist das meistverkaufte Produkt. Es beruhigt die Haut, hilft bei Sonnenbrand und ist für die ganze Familie geeignet." },
  { label: "Lifetakt Energie", topic: "Lifetakt Energie gibt dir natürliche Energie ohne Absturz. Perfekt für lange Arbeitstage, Sport oder wenn du einfach mehr Power brauchst." },
  { label: "Collagen Plus", topic: "LR Collagen Plus unterstützt deine Haut von innen. Weniger Falten, mehr Elastizität – du siehst den Unterschied nach 4 Wochen." },
  { label: "LIFETAKT Protein", topic: "Das LR Protein Shake ist ideal nach dem Sport. 25g Protein pro Portion, lecker und sättigend – perfekt für deine Fitness-Ziele." },
  { label: "Zeitgard System", topic: "Das Zeitgard Schönheitssystem ist professionelle Hautpflege für zuhause. Ultraschall-Technologie für sichtbar jüngere Haut." },
  { label: "Eigenes Thema", topic: "" },
];

const STYLE_OPTIONS = [
  { id: "friendly", label: "Freundlich & Warm", emoji: "😊", desc: "Persönlich, nahbar, wie eine Freundin" },
  { id: "professional", label: "Professionell", emoji: "💼", desc: "Seriös, kompetent, überzeugend" },
  { id: "energetic", label: "Energetisch", emoji: "⚡", desc: "Begeistert, mitreißend, viral" },
  { id: "storytelling", label: "Story-Telling", emoji: "📖", desc: "Mit persönlicher Geschichte" },
];

export default function LinaAvatarPage() {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCT_PRESETS[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("friendly");
  const [duration, setDuration] = useState<"30" | "60" | "90">("30");
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateScriptMutation = trpc.linaAvatar.generateScript.useMutation({
    onSuccess: (data: { script: string; wordCount: number; estimatedDuration: number }) => {
      setGeneratedScript(data.script || "");
      toast.success("Script generiert! Jetzt Video erstellen.");
    },
    onError: () => toast.error("Fehler beim Script generieren"),
  });

  const generateVideoMutation = trpc.linaAvatar.generateVideo.useMutation({
    onSuccess: (data: { videoUrl: string; success: boolean }) => {
      setVideoUrl(data.videoUrl);
      toast.success("🎬 Lina Video ist fertig!");
    },
    onError: (e: { message: string }) => toast.error(`Video-Fehler: ${e.message}`),
  });

  const topic = selectedProduct.label === "Eigenes Thema" ? customTopic : selectedProduct.topic;

  const handleGenerateScript = () => {
    if (!topic.trim()) {
      toast.error("Bitte wähle ein Produkt oder gib ein Thema ein!");
      return;
    }
    generateScriptMutation.mutate({
      topic,
      style: selectedStyle,
      duration: parseInt(duration),
      productName: selectedProduct.label === "Eigenes Thema" ? "LR Produkt" : selectedProduct.label,
    });
  };

  const handleGenerateVideo = () => {
    if (!generatedScript) return;
    generateVideoMutation.mutate({
      script: generatedScript,
      style: selectedStyle,
    });
  };

  const handleCopyScript = () => {
    if (!generatedScript) return;
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Script kopiert!");
  };

  return (
    <motion.div
      className="space-y-6 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text-gold flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          Lina Avatar
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          KI-Sprecherin erklärt dein LR-Produkt als professionelles Video — kein Filmen, kein Schnitt.
        </p>
      </div>

      {/* Info Banner */}
      <GlowCard className="p-4">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">So funktioniert es:</strong> Wähle ein Produkt → KI schreibt das Script → Lina spricht es als Video ein. Das Video kannst du direkt auf Instagram, TikTok oder als Story posten. <strong className="text-foreground">Kein Kamera-Scheu nötig!</strong>
          </div>
        </div>
      </GlowCard>

      {/* Schritt 1: Produkt wählen */}
      <GlowCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">1</div>
          <Label className="text-sm font-semibold">Produkt oder Thema wählen</Label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {PRODUCT_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setSelectedProduct(p)}
              className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                selectedProduct.label === p.label
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 text-muted-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {selectedProduct.label === "Eigenes Thema" && (
          <Textarea
            className="min-h-[80px] text-sm resize-none mt-2"
            placeholder="Beschreibe dein Thema oder Produkt..."
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
          />
        )}
      </GlowCard>

      {/* Schritt 2: Stil & Länge */}
      <GlowCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">2</div>
          <Label className="text-sm font-semibold">Stil & Video-Länge</Label>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {STYLE_OPTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStyle(s.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedStyle === s.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="text-base mb-0.5">{s.emoji}</div>
              <div className="text-xs font-semibold">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.desc}</div>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(["30", "60", "90"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${
                duration === d
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 text-muted-foreground"
              }`}
            >
              {d} Sek
            </button>
          ))}
        </div>
      </GlowCard>

      {/* Schritt 3: Script generieren */}
      <GlowCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">3</div>
          <Label className="text-sm font-semibold">Script generieren</Label>
        </div>
        <Button
          onClick={handleGenerateScript}
          disabled={generateScriptMutation.isPending || !topic.trim()}
          className="btn-gold w-full gap-2"
        >
          {generateScriptMutation.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Script wird geschrieben...</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Script für Lina generieren</>
          )}
        </Button>
      </GlowCard>

      {/* Script Ergebnis */}
      <AnimatePresence>
        {generatedScript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <GlowCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Linas Script</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyScript}
                  className="h-7 text-xs gap-1"
                >
                  {copied ? <><Check className="h-3 w-3 text-emerald-400" /> Kopiert</> : <><Copy className="h-3 w-3" /> Kopieren</>}
                </Button>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap border border-border/50">
                {generatedScript}
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={handleGenerateScript}
                >
                  <RefreshCw className="h-3 w-3" /> Neu generieren
                </Button>
              </div>
            </GlowCard>

            {/* Schritt 4: Video erstellen */}
            <GlowCard className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">4</div>
                <Label className="text-sm font-semibold">Lina Video erstellen</Label>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
                <p className="text-xs text-amber-300 leading-relaxed">
                  <strong>Hinweis:</strong> Die Video-Generierung dauert 2-5 Minuten. Lina spricht das Script als KI-Avatar ein. Das Video wird in HD geliefert.
                </p>
              </div>
              <Button
                onClick={handleGenerateVideo}
                disabled={generateVideoMutation.isPending}
                className="btn-gold w-full gap-2"
              >
                {generateVideoMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Lina spricht... (2-5 Min)</>
                ) : (
                  <><Video className="h-4 w-4" /> Lina Video generieren</>
                )}
              </Button>
            </GlowCard>

            {/* Video Ergebnis */}
            {videoUrl && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <GlowCard className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">Linas Video ist fertig!</span>
                  </div>
                  <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-lg border border-border/50 mb-3"
                    style={{ maxHeight: "400px" }}
                  />
                  <div className="flex gap-2">
                    <a
                      href={videoUrl}
                      download="lina-video.mp4"
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                        <Download className="h-3 w-3" /> Herunterladen
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      className="flex-1 btn-gold text-xs gap-1.5"
                      onClick={() => {
                        navigator.clipboard.writeText(videoUrl);
                        toast.success("Video-Link kopiert!");
                      }}
                    >
                      <Copy className="h-3 w-3" /> Link kopieren
                    </Button>
                  </div>
                </GlowCard>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
