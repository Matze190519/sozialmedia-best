import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Wand2, Sparkles, Send, ChevronRight, ChevronLeft, Check,
  Image, Video, Loader2, Copy, Eye, Zap, Rocket, Globe,
  Instagram, Linkedin, Twitter, Youtube, Facebook,
  ArrowRight, RefreshCw, Brain, Target, Flame, Hash,
  CheckCircle, XCircle, AlertCircle, TrendingUp,
} from "lucide-react";
import { GlowCard } from "@/components/GlowCard";
import { AnimatedCounter } from "@/components/AnimatedCounter";

// ─── Constants ──────────────────────────────────────────────
const PILLARS = [
  { value: "Autokonzept", label: "Autokonzept", emoji: "\u{1F697}", desc: "Mercedes, BMW, Porsche als Bonus" },
  { value: "Business Opportunity", label: "Business Opportunity", emoji: "\u{1F4BC}", desc: "Nebeneinkommen & Karriere" },
  { value: "Produkt-Highlight", label: "Produkt-Highlight", emoji: "\u{1F33F}", desc: "Aloe Vera, Mind Master" },
  { value: "Lina KI-Demo", label: "Lina KI-Demo", emoji: "\u{1F916}", desc: "KI-Assistentin zeigen" },
  { value: "Lifestyle & Erfolg", label: "Lifestyle & Erfolg", emoji: "\u2728", desc: "Reisen, Events, Erfolge" },
  { value: "Einwandbehandlung", label: "Einwandbehandlung", emoji: "\u{1F6E1}\uFE0F", desc: "Einwände zerstören" },
];

const CONTENT_TYPES = [
  { value: "post", label: "Social Media Post", icon: "📝", desc: "Klassischer Feed-Post" },
  { value: "reel", label: "Reel / TikTok Script", icon: "🎬", desc: "Kurzvideos 15-60s" },
  { value: "story", label: "Story", icon: "📱", desc: "24h Story Content" },
  { value: "hooks", label: "Hooks / Carousel", icon: "🖼️", desc: "Aufmerksamkeits-Hooks" },
  { value: "ad_copy", label: "Ad Copy", icon: "🎯", desc: "Werbetexte" },
  { value: "follow_up", label: "Follow-Up", icon: "💼", desc: "Nachfass-Nachrichten" },
] as const;

type ContentTypeValue = typeof CONTENT_TYPES[number]["value"];

const ALL_PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: "📸", color: "from-pink-500 to-purple-500" },
  { id: "facebook", label: "Facebook", icon: "📘", color: "from-blue-600 to-blue-400" },
  { id: "tiktok", label: "TikTok", icon: "🎵", color: "from-cyan-500 to-pink-500" },
  { id: "linkedin", label: "LinkedIn", icon: "💼", color: "from-blue-700 to-blue-500" },
  { id: "twitter", label: "X / Twitter", icon: "🐦", color: "from-sky-500 to-sky-300" },
  { id: "threads", label: "Threads", icon: "🧵", color: "from-gray-600 to-gray-400" },
  { id: "youtube", label: "YouTube", icon: "🎬", color: "from-red-600 to-red-400" },
  { id: "pinterest", label: "Pinterest", icon: "📌", color: "from-red-500 to-pink-400" },
  { id: "bluesky", label: "Bluesky", icon: "🦋", color: "from-sky-400 to-blue-300" },
];

const HOOK_STYLES = [
  { value: "curiosity", label: "Neugier", desc: "Macht neugierig" },
  { value: "story", label: "Story", desc: "Persönlich & emotional" },
  { value: "value", label: "Mehrwert", desc: "Sofortiger Nutzen" },
  { value: "contrarian", label: "Provokant", desc: "Gegen den Strom" },
  { value: "socialProof", label: "Beweis", desc: "Ergebnisse zeigen" },
];

// ─── Step Components ────────────────────────────────────────

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        return (
          <div key={step} className="flex items-center gap-2">
            <motion.div
              animate={{
                scale: isActive ? 1.1 : 1,
                backgroundColor: isCompleted ? "rgb(16, 185, 129)" : isActive ? "rgb(99, 102, 241)" : "rgb(39, 39, 42)",
              }}
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border border-border/50"
            >
              {isCompleted ? <Check className="h-4 w-4 text-white" /> : step}
            </motion.div>
            {i < totalSteps - 1 && (
              <div className={`h-0.5 w-8 rounded-full transition-colors ${isCompleted ? "bg-emerald-500" : "bg-border/30"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Wizard ────────────────────────────────────────────

export default function ContentWizardPage() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Wizard State
  const [step, setStep] = useState(1);
  const [pillar, setPillar] = useState("");
  const [contentType, setContentType] = useState<ContentTypeValue>("post");
  const [topic, setTopic] = useState("");
  const [hookStyle, setHookStyle] = useState("curiosity");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "facebook", "linkedin"]);
  const [generateImage, setGenerateImage] = useState(true);
  const [generateVideo, setGenerateVideo] = useState(false);
  const [autoPublish, setAutoPublish] = useState(false);

  // Generated Content State
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<{ platform: string; success: boolean; id?: string }[]>([]);

  // API queries
  const { data: userSettings } = trpc.userSettings.get.useQuery();
  const { data: blotatoAccounts } = trpc.apiHealth.blotatoAccounts.useQuery();

  // Mutations
  const generateMutation = trpc.content.generate.useMutation();
  const publishMutation = trpc.approval.publish.useMutation();

  const connectedPlatforms = useMemo(() => {
    if (!blotatoAccounts?.accounts) return [];
    return blotatoAccounts.accounts.map((a: any) => a.platform.toLowerCase());
  }, [blotatoAccounts]);

  const togglePlatform = useCallback((id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }, []);

  // ─── Step 1: Generate Content ─────────────────────────────
  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Bitte gib ein Thema ein!");
      return;
    }
    setIsGenerating(true);
    setGeneratedContent("");
    setGeneratedImageUrl("");
    setGeneratedVideoUrl("");

    try {
      // Generate text content + optional image + optional video in one call
      const result = await generateMutation.mutateAsync({
        contentType,
        topic: topic.trim(),
        pillar: pillar || undefined,
        platforms: selectedPlatforms,
        autoGenerateImage: generateImage,
        autoGenerateVideo: generateVideo,
      });
      setGeneratedContent(result.content || "");
      if (result.imageUrl) setGeneratedImageUrl(result.imageUrl);
      if (result.videoUrl) setGeneratedVideoUrl(result.videoUrl);

      setStep(2);
      toast.success("Content generiert!");
    } catch (err: any) {
      toast.error(err.message || "Fehler beim Generieren");
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Step 3: Publish ──────────────────────────────────────
  const handlePublish = async () => {
    if (!generatedContent.trim()) return;
    setIsPublishing(true);
    setPublishResults([]);

    try {
      // The generate mutation already created the post in the DB
      // Now we just need to handle publishing if autoPublish is on
      // Re-generate to create a fresh post for publishing
      const freshPost = await generateMutation.mutateAsync({
        contentType,
        topic: topic.trim(),
        pillar: pillar || undefined,
        platforms: selectedPlatforms,
      });

      if (autoPublish && freshPost.id) {
        // Publish via Blotato
        try {
          await publishMutation.mutateAsync({
            id: freshPost.id,
          });
          const results = selectedPlatforms.map(p => ({
            platform: p,
            success: true,
            id: String(freshPost.id),
          }));
          setPublishResults(results);
          toast.success(`Auf ${selectedPlatforms.length} Plattformen veröffentlicht!`);
        } catch (e: any) {
          toast.error("Publishing teilweise fehlgeschlagen: " + (e.message || ""));
          setPublishResults(selectedPlatforms.map(p => ({ platform: p, success: false })));
        }
      } else {
        toast.success("Post erstellt und wartet auf Freigabe!");
        setPublishResults(selectedPlatforms.map(p => ({ platform: p, success: true })));
      }

      setStep(3);
      utils.dashboard.stats.invalidate();
      utils.content.list.invalidate();
    } catch (err: any) {
      toast.error(err.message || "Fehler beim Erstellen");
    } finally {
      setIsPublishing(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Content Wizard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            3 Schritte: Thema → KI generiert → Multi-Plattform Publish
          </p>
        </div>
        <StepIndicator currentStep={step} totalSteps={3} />
      </div>

      <AnimatePresence mode="wait">
        {/* ═══════════════ STEP 1: CONFIGURE ═══════════════ */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-4"
          >
            {/* Content Pillar Selection */}
            <GlowCard glowColor="rgba(99, 102, 241, 0.1)">
              <div className="p-4">
                <Label className="text-sm font-semibold mb-3 block">
                  <Target className="h-4 w-4 inline mr-1.5 text-primary" />
                  Content-Säule wählen
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                  {PILLARS.map(p => (
                    <motion.button
                      key={p.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPillar(pillar === p.value ? "" : p.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        pillar === p.value
                          ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                          : "border-border/40 bg-card/50 hover:bg-accent/50"
                      }`}
                    >
                      <span className="text-lg">{p.emoji}</span>
                      <p className="text-xs font-medium mt-1">{p.label}</p>
                      <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </GlowCard>

            {/* Topic & Content Type */}
            <GlowCard glowColor="rgba(16, 185, 129, 0.1)">
              <div className="p-4 space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    <Brain className="h-4 w-4 inline mr-1.5 text-emerald-400" />
                    Thema / Idee
                  </Label>
                  <Textarea
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="z.B. 'Wie ich mit LR mein erstes Auto bekommen habe' oder 'Warum Aloe Vera Gel besser als jede Creme ist'"
                    className="min-h-[80px] bg-background/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-xs mb-1.5 block">Content-Typ</Label>
                    <Select value={contentType} onValueChange={(v) => setContentType(v as ContentTypeValue)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_TYPES.map(ct => (
                          <SelectItem key={ct.value} value={ct.value}>
                            <span className="flex items-center gap-2">
                              <span>{ct.icon}</span>
                              <span>{ct.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Hook-Stil</Label>
                    <Select value={hookStyle} onValueChange={setHookStyle}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HOOK_STYLES.map(hs => (
                          <SelectItem key={hs.value} value={hs.value}>
                            <span>{hs.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </GlowCard>

            {/* Platform Selection */}
            <GlowCard glowColor="rgba(168, 85, 247, 0.1)">
              <div className="p-4">
                <Label className="text-sm font-semibold mb-3 block">
                  <Globe className="h-4 w-4 inline mr-1.5 text-amber-400" />
                  Plattformen ({selectedPlatforms.length}/9)
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
                  {ALL_PLATFORMS.map(p => {
                    const isSelected = selectedPlatforms.includes(p.id);
                    const isConnected = connectedPlatforms.includes(p.id);
                    return (
                      <motion.button
                        key={p.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => togglePlatform(p.id)}
                        className={`relative p-2.5 rounded-lg border text-center transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                            : "border-border/30 bg-card/30 hover:bg-accent/30"
                        }`}
                      >
                        <span className="text-lg block">{p.icon}</span>
                        <span className="text-[10px] font-medium block mt-0.5">{p.label}</span>
                        {isConnected && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border border-background flex items-center justify-center">
                            <Check className="h-2 w-2 text-white" />
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {connectedPlatforms.length > 0
                    ? `${connectedPlatforms.length} Kanäle via Blotato verbunden`
                    : "Blotato-Key in Einstellungen hinterlegen für Auto-Post"}
                </p>
              </div>
            </GlowCard>

            {/* Media Options */}
            <GlowCard glowColor="rgba(234, 179, 8, 0.1)">
              <div className="p-4">
                <Label className="text-sm font-semibold mb-3 block">
                  <Image className="h-4 w-4 inline mr-1.5 text-yellow-400" />
                  Medien
                </Label>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch checked={generateImage} onCheckedChange={setGenerateImage} />
                    <span className="text-sm">KI-Bild generieren</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch checked={generateVideo} onCheckedChange={setGenerateVideo} />
                    <span className="text-sm">KI-Video generieren</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch checked={autoPublish} onCheckedChange={setAutoPublish} />
                    <span className="text-sm flex items-center gap-1">
                      <Rocket className="h-3.5 w-3.5 text-primary" />
                      Sofort veröffentlichen
                    </span>
                  </label>
                </div>
              </div>
            </GlowCard>

            {/* Generate Button */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                size="lg"
                className="w-full h-14 text-base font-bold gap-3 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg shadow-primary/20"
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    KI generiert Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Content generieren
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </motion.div>

            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <Progress value={generateVideo ? 40 : 65} className="h-1.5" />
                <p className="text-xs text-muted-foreground text-center">
                  {generateVideo
                    ? "Text + Bild + Video werden generiert... (ca. 30-60s)"
                    : generateImage
                    ? "Text + Bild werden generiert... (ca. 10-20s)"
                    : "Text wird generiert... (ca. 5-10s)"}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ═══════════════ STEP 2: PREVIEW & EDIT ═══════════════ */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-4"
          >
            {/* Content Preview */}
            <GlowCard glowColor="rgba(16, 185, 129, 0.15)">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Eye className="h-4 w-4 text-emerald-400" />
                    Vorschau & Bearbeiten
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedContent);
                        toast.success("Kopiert!");
                      }}
                    >
                      <Copy className="h-3 w-3" /> Kopieren
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1"
                      onClick={() => { setStep(1); }}
                    >
                      <RefreshCw className="h-3 w-3" /> Neu generieren
                    </Button>
                  </div>
                </div>

                <Textarea
                  value={generatedContent}
                  onChange={e => setGeneratedContent(e.target.value)}
                  className="min-h-[200px] bg-background/50 text-sm leading-relaxed"
                />

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {selectedPlatforms.map(p => {
                    const platform = ALL_PLATFORMS.find(ap => ap.id === p);
                    return platform ? (
                      <Badge key={p} variant="outline" className="text-[10px] gap-1">
                        <span>{platform.icon}</span> {platform.label}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            </GlowCard>

            {/* Media Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedImageUrl && (
                <GlowCard glowColor="rgba(234, 179, 8, 0.1)">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                      <Image className="h-4 w-4 text-yellow-400" />
                      KI-Bild
                    </h3>
                    <div className="rounded-lg overflow-hidden border border-border/30">
                      <img
                        src={generatedImageUrl}
                        alt="Generated"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  </div>
                </GlowCard>
              )}
              {generatedVideoUrl && (
                <GlowCard glowColor="rgba(168, 85, 247, 0.1)">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                      <Video className="h-4 w-4 text-amber-400" />
                      KI-Video
                    </h3>
                    <div className="rounded-lg overflow-hidden border border-border/30">
                      <video
                        src={generatedVideoUrl}
                        controls
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  </div>
                </GlowCard>
              )}
            </div>

            {/* Platform Preview Cards */}
            <GlowCard glowColor="rgba(99, 102, 241, 0.1)">
              <div className="p-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Globe className="h-4 w-4 text-indigo-400" />
                  Multi-Plattform Vorschau
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {selectedPlatforms.map(pId => {
                    const platform = ALL_PLATFORMS.find(ap => ap.id === pId);
                    if (!platform) return null;
                    const isConnected = connectedPlatforms.includes(pId);
                    const charLimit: Record<string, number> = {
                      twitter: 280, threads: 500, tiktok: 2200,
                      instagram: 2200, facebook: 63206, linkedin: 3000,
                      youtube: 5000, pinterest: 500, bluesky: 300,
                    };
                    const limit = charLimit[pId] || 2200;
                    const isOverLimit = generatedContent.length > limit;

                    return (
                      <motion.div
                        key={pId}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-3 rounded-lg border ${
                          isOverLimit
                            ? "border-red-500/30 bg-red-500/5"
                            : isConnected
                            ? "border-emerald-500/20 bg-emerald-500/5"
                            : "border-border/30 bg-card/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="flex items-center gap-1.5 text-xs font-medium">
                            <span>{platform.icon}</span>
                            {platform.label}
                          </span>
                          {isConnected ? (
                            <Badge variant="outline" className="text-[8px] h-4 text-emerald-400 border-emerald-500/30">
                              Verbunden
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[8px] h-4 text-amber-400 border-amber-500/30">
                              Manuell
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-3">
                          {generatedContent.substring(0, 120)}...
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className={`text-[9px] ${isOverLimit ? "text-red-400" : "text-muted-foreground"}`}>
                            {generatedContent.length}/{limit} Zeichen
                          </span>
                          {generatedImageUrl && <Image className="h-3 w-3 text-emerald-400" />}
                          {generatedVideoUrl && <Video className="h-3 w-3 text-amber-400" />}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </GlowCard>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Zurück
              </Button>
              <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  size="lg"
                  className="w-full h-12 text-base font-bold gap-3 bg-gradient-to-r from-emerald-500 to-primary hover:from-emerald-500/90 hover:to-primary/90 shadow-lg shadow-emerald-500/20"
                  onClick={handlePublish}
                  disabled={isPublishing || !generatedContent.trim()}
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {autoPublish ? "Wird veröffentlicht..." : "Wird erstellt..."}
                    </>
                  ) : autoPublish ? (
                    <>
                      <Rocket className="h-5 w-5" />
                      Auf {selectedPlatforms.length} Plattformen veröffentlichen
                      <Send className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Post erstellen (zur Freigabe)
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════ STEP 3: SUCCESS ═══════════════ */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <GlowCard glowColor="rgba(16, 185, 129, 0.2)" className="border-emerald-500/30">
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Rocket className="h-8 w-8 text-emerald-400" />
                  </div>
                </motion.div>
                <h2 className="text-lg font-bold mb-1">
                  {autoPublish ? "Content veröffentlicht!" : "Content erstellt!"}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {autoPublish
                    ? `Dein Content wurde auf ${selectedPlatforms.length} Plattformen geplant.`
                    : "Dein Content wartet auf Freigabe in der Approval-Queue."}
                </p>

                {/* Platform Results */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-md mx-auto mb-6">
                  {publishResults.map((r, i) => {
                    const platform = ALL_PLATFORMS.find(ap => ap.id === r.platform);
                    return (
                      <motion.div
                        key={r.platform}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-2.5 rounded-lg border ${
                          r.success
                            ? "border-emerald-500/30 bg-emerald-500/10"
                            : "border-red-500/30 bg-red-500/10"
                        }`}
                      >
                        <span className="text-lg block">{platform?.icon}</span>
                        <span className="text-[10px] font-medium block">{platform?.label}</span>
                        {r.success ? (
                          <CheckCircle className="h-3 w-3 text-emerald-400 mx-auto mt-1" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-400 mx-auto mt-1" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Next Actions */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button onClick={() => { setStep(1); setGeneratedContent(""); setTopic(""); }} className="gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    Nächsten Content erstellen
                  </Button>
                  <Button variant="outline" onClick={() => setLocation("/approval")} className="gap-1.5">
                    <CheckCircle className="h-4 w-4" />
                    Zur Freigabe
                  </Button>
                  <Button variant="outline" onClick={() => setLocation("/calendar")} className="gap-1.5">
                    <Eye className="h-4 w-4" />
                    Kalender anzeigen
                  </Button>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
