import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState, useMemo, useEffect } from "react";
import { useSearch } from "wouter";
import { toast } from "sonner";
import {
  Zap, Loader2, Sparkles, Package, Image, Video, Wand2, Copy,
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Brain,
  Flame, Target, MessageSquare, Film, Mic, FileText, TrendingUp,
  ArrowRight, ArrowLeft, Download, Eye, Send, ChevronRight,
} from "lucide-react";
import { ProductImagePicker } from "@/components/ProductImagePicker";
import AICopilot from "@/components/AICopilot";
import PlatformPreview from "@/components/PlatformPreview";

const CONTENT_TYPES = [
  { value: "post", label: "Social Media Post", icon: FileText, desc: "Feed-Post für alle Plattformen" },
  { value: "reel_script", label: "Reel / TikTok", icon: Film, desc: "Kurzvideo-Script mit Hook" },
  { value: "story", label: "Story", icon: Flame, desc: "Story für Instagram/Facebook" },
  { value: "carousel", label: "Carousel", icon: Image, desc: "Mehrere Slides zum Swipen" },
  { value: "ad_copy", label: "Ad Copy", icon: Target, desc: "Werbeanzeigen-Text" },
  { value: "linkedin", label: "LinkedIn", icon: MessageSquare, desc: "Professioneller Artikel" },
  { value: "youtube_script", label: "YouTube Script", icon: Mic, desc: "Langform Video-Script" },
  { value: "follow_up", label: "Follow-Up", icon: MessageSquare, desc: "Nachfass-Nachricht" },
  { value: "objection", label: "Einwandbehandlung", icon: ShieldCheck, desc: "Einwände entkräften" },
];

const PILLARS = [
  { value: "Autokonzept", label: "Autokonzept", emoji: "\u{1F697}", color: "from-amber-500 to-yellow-600" },
  { value: "Business Opportunity", label: "Business Opportunity", emoji: "\u{1F4BC}", color: "from-amber-400 to-amber-600" },
  { value: "Produkt-Highlight", label: "Produkt-Highlight", emoji: "\u{1F33F}", color: "from-emerald-500 to-green-600" },
  { value: "Lina KI-Demo", label: "Lina KI-Demo", emoji: "\u{1F916}", color: "from-purple-500 to-violet-600" },
  { value: "Lifestyle & Erfolg", label: "Lifestyle & Erfolg", emoji: "\u2728", color: "from-amber-300 to-amber-500" },
  { value: "Einwandbehandlung", label: "Einwandbehandlung", emoji: "\u{1F6E1}\uFE0F", color: "from-red-500 to-red-600" },
];

const HOOK_STYLES = [
  { value: "curiosity", label: "Neugier", desc: "Macht neugierig", icon: "🔍" },
  { value: "story", label: "Story", desc: "Persönliche Geschichte", icon: "📖" },
  { value: "value", label: "Value", desc: "Sofortiger Mehrwert", icon: "💎" },
  { value: "contrarian", label: "Contrarian", desc: "Provokant", icon: "🔥" },
  { value: "socialProof", label: "Social Proof", desc: "Beweise", icon: "⭐" },
];

const VIDEO_MODELS = [
  { value: "auto", label: "Auto (Beste Qualität)", desc: "Veo 3.1 (<=8s) / Kling 3.0 Pro (>8s)" },
  { value: "veo-3", label: "Veo 3.1 Fast", desc: "Google, 4K, Audio+Lip-Sync, max 8s" },
  { value: "kling-3", label: "Kling 3.0 Pro", desc: "Kuaishou, Audio, bis 15s" },
];

const ALL_PLATFORMS = [
  "instagram", "facebook", "tiktok", "linkedin",
  "twitter", "threads", "bluesky", "pinterest", "youtube",
];

const WIZARD_STEPS = [
  { id: 1, label: "Was?", desc: "Content-Typ" },
  { id: 2, label: "Thema", desc: "Pillar & Topic" },
  { id: 3, label: "Style", desc: "Hook & Plattform" },
  { id: 4, label: "Generieren", desc: "KI erstellt" },
  { id: 5, label: "Media", desc: "Bild & Video" },
  { id: 6, label: "Fertig", desc: "Vorschau & Copy" },
];

export default function GeneratorPage() {
  const utils = trpc.useUtils();
  const searchString = useSearch();

  // Wizard Step
  const [wizardStep, setWizardStep] = useState(1);

  // Content State
  const [contentType, setContentType] = useState("post");
  const [topic, setTopic] = useState("");
  const [pillar, setPillar] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [platforms, setPlatforms] = useState<string[]>(["instagram", "facebook", "tiktok"]);
  const [hookStyle, setHookStyle] = useState("curiosity");
  const [scriptTemplate, setScriptTemplate] = useState("");
  const [includeBlocker, setIncludeBlocker] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedPostId, setGeneratedPostId] = useState<number | null>(null);
  const [qualityResult, setQualityResult] = useState<any>(null);
  const [fromTrend, setFromTrend] = useState(false);

  // Follow-Up / Objection specific
  const [leadName, setLeadName] = useState("");
  const [step, setStep] = useState(1);
  const [objection, setObjection] = useState("");
  const [product, setProduct] = useState("");

  // Media generation states
  const [imagePrompt, setImagePrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoModel, setVideoModel] = useState("auto");
  const [videoDuration, setVideoDuration] = useState("5");
  const [videoAspect, setVideoAspect] = useState("9:16");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState("");
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  // Parse URL params from Trend-Scanner clone
  useEffect(() => {
    if (!searchString) return;
    const params = new URLSearchParams(searchString);
    const t = params.get("topic");
    const p = params.get("pillar");
    const src = params.get("source");
    if (t) setTopic(t);
    if (p) setPillar(p);
    if (src === "trend") {
      setFromTrend(true);
      setWizardStep(3);
      toast.info("Trend-Vorlage geladen! Passe den Content an.", { duration: 5000 });
    }
  }, [searchString]);

  // Brand Voice data
  const brandVoice = trpc.brandVoice.get.useQuery();
  const hookFormulas = trpc.brandVoice.getHooks.useQuery();
  const blockers = trpc.brandVoice.getBlockers.useQuery();

  // Brand Voice Generator
  const brandVoiceMut = trpc.brandVoice.generateWithVoice.useMutation({
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      setGeneratedPostId(data.id);
      setQualityResult(data.qualityGate);
      utils.content.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success(`Content generiert! Quality Score: ${data.qualityGate.score}/100`);
      setWizardStep(5);
    },
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  // GoViralBitch API Generator
  const goViralMut = trpc.content.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      setGeneratedPostId(data.id);
      setQualityResult(null);
      utils.content.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success("Content generiert!");
      setWizardStep(5);
    },
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  // Batch generator
  const batchMut = trpc.content.generateBatch.useMutation({
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      setGeneratedPostId(data.id);
      utils.content.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success("Wochenplan generiert!");
      setWizardStep(5);
    },
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  // Quality Gate check
  const qualityMut = trpc.qualityGate.check.useMutation({
    onSuccess: (data) => {
      setQualityResult(data);
      if (data.passed) toast.success(`Quality Gate bestanden! Score: ${data.score}/100`);
      else toast.error(`Quality Gate nicht bestanden. Score: ${data.score}/100`);
    },
  });

  // Media generation
  const generateImageMut = trpc.media.generateImage.useMutation({
    onSuccess: (data) => {
      setGeneratedImageUrl(data.url);
      toast.success("KI-Bild generiert!");
    },
    onError: (err) => toast.error("Bild-Fehler: " + err.message),
  });

  const generateVideoMut = trpc.media.generateVideo.useMutation({
    onSuccess: (data) => {
      setGeneratedVideoUrl(data.videoUrl || "");
      toast.success(`Video generiert mit ${data.model}!`);
    },
    onError: (err) => toast.error("Video-Fehler: " + err.message),
  });

  const togglePlatform = (p: string) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleGenerate = () => {
    if (!topic.trim()) { toast.error("Thema eingeben"); return; }
    if (!pillar) { toast.error("Content Pillar auswählen"); return; }
    brandVoiceMut.mutate({
      contentType: contentType as any,
      platform,
      pillar,
      topic,
      hookStyle: hookStyle as any,
      scriptTemplate: scriptTemplate || undefined,
      includeBlocker,
    });
  };

  const handleGoViralGenerate = () => {
    if (platforms.length === 0) { toast.error("Mindestens eine Plattform auswählen"); return; }
    goViralMut.mutate({
      contentType: contentType as any,
      topic: topic || undefined,
      pillar: pillar || undefined,
      platforms,
      platform: platform || undefined,
      leadName: leadName || undefined,
      step: contentType === "follow_up" ? step : undefined,
      objection: objection || undefined,
      product: product || undefined,
    });
  };

  const handleBatch = () => {
    if (platforms.length === 0) { toast.error("Mindestens eine Plattform auswählen"); return; }
    batchMut.mutate({ platforms });
  };

  const handleGenerateImage = () => {
    if (!imagePrompt.trim()) { toast.error("Bild-Prompt eingeben"); return; }
    generateImageMut.mutate({ prompt: imagePrompt, contentPostId: generatedPostId || undefined, usePremium: true });
  };

  const handleGenerateVideo = () => {
    if (!videoPrompt.trim()) { toast.error("Video-Prompt eingeben"); return; }
    generateVideoMut.mutate({
      prompt: videoPrompt,
      imageUrl: generatedImageUrl || undefined,
      model: videoModel as any,
      duration: videoDuration,
      aspectRatio: videoAspect as any,
      generateAudio: true,
      contentPostId: generatedPostId || undefined,
    });
  };

  const isLoading = brandVoiceMut.isPending || goViralMut.isPending || batchMut.isPending;

  const currentHookExamples = useMemo(() => {
    if (!hookFormulas.data) return [];
    const formulas = hookFormulas.data as Record<string, string[]>;
    return formulas[hookStyle] || [];
  }, [hookFormulas.data, hookStyle]);

  const copyAll = () => {
    const text = generatedContent + (generatedImageUrl ? `\n\n📷 Bild: ${generatedImageUrl}` : "");
    navigator.clipboard.writeText(text);
    toast.success("Alles kopiert!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-[Montserrat] flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20">
              <Zap className="h-6 w-6 text-amber-400" />
            </div>
            Content-Maschine
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Viraler Content in 60 Sekunden. Text + Bild + Video.
          </p>
        </div>
      </div>

      {fromTrend && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-400">Trend-Vorlage geladen</p>
            <p className="text-xs text-muted-foreground">Thema und Pillar wurden übernommen.</p>
          </div>
        </div>
      )}

      {/* Wizard Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          {WIZARD_STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                if (s.id <= wizardStep || (s.id === wizardStep + 1)) setWizardStep(s.id);
              }}
              className={`flex flex-col items-center gap-1 transition-all ${
                s.id === wizardStep
                  ? "scale-110"
                  : s.id < wizardStep
                  ? "opacity-70"
                  : "opacity-40"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s.id === wizardStep
                  ? "bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/30"
                  : s.id < wizardStep
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-white/5 text-muted-foreground border border-white/10"
              }`}>
                {s.id < wizardStep ? <CheckCircle2 className="h-5 w-5" /> : s.id}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block ${
                s.id === wizardStep ? "text-amber-400" : "text-muted-foreground"
              }`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
        <Progress value={(wizardStep / WIZARD_STEPS.length) * 100} className="h-1 bg-white/5" />
      </div>

      {/* ═══ STEP 1: Content-Typ wählen ═══ */}
      {wizardStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold font-[Montserrat]">Was möchtest du erstellen?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CONTENT_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => { setContentType(t.value); setWizardStep(2); }}
                className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  contentType === t.value
                    ? "border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                    : "border-white/10 bg-white/[0.02] hover:border-amber-500/30 hover:bg-amber-500/5"
                }`}
              >
                <t.icon className={`h-6 w-6 mb-2 ${contentType === t.value ? "text-amber-400" : "text-muted-foreground"}`} />
                <p className="font-medium text-sm">{t.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ STEP 2: Thema & Pillar ═══ */}
      {wizardStep === 2 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold font-[Montserrat]">Wähle dein Thema</h2>

          {/* Content Pillars als große Karten */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PILLARS.map(p => (
              <button
                key={p.value}
                onClick={() => setPillar(p.value)}
                className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  pillar === p.value
                    ? "border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                    : "border-white/10 bg-white/[0.02] hover:border-amber-500/30"
                }`}
              >
                <span className="text-2xl">{p.emoji}</span>
                <p className="font-medium text-sm mt-2">{p.label}</p>
              </button>
            ))}
          </div>

          {/* Topic Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Dein Thema / Idee</Label>
            <Input
              placeholder="z.B. Warum 99 Euro dein Leben verändern, Autokonzept erklärt..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="h-12 text-base bg-white/[0.03] border-white/10 focus:border-amber-500/50"
            />
          </div>

          {/* Hook-Beispiele als Inspiration */}
          {currentHookExamples.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Inspiration (klicken zum Übernehmen):</Label>
              <div className="flex flex-wrap gap-2">
                {currentHookExamples.slice(0, 6).map((hook: string, i: number) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="cursor-pointer hover:bg-amber-500/10 hover:border-amber-500/30 text-xs py-1.5 px-3 transition-all"
                    onClick={() => { setTopic(hook); toast.success("Übernommen!"); }}
                  >
                    {hook.length > 50 ? hook.slice(0, 50) + "..." : hook}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {contentType === "follow_up" && (
            <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="space-y-2">
                <Label>Lead Name</Label>
                <Input value={leadName} onChange={e => setLeadName(e.target.value)} placeholder="Name des Leads..." className="bg-white/[0.03]" />
              </div>
              <div className="space-y-2">
                <Label>Follow-Up Schritt</Label>
                <Input type="number" min={1} max={10} value={step} onChange={e => setStep(Number(e.target.value))} className="bg-white/[0.03]" />
              </div>
            </div>
          )}

          {contentType === "objection" && (
            <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <Label>Welcher Einwand?</Label>
              <Textarea value={objection} onChange={e => setObjection(e.target.value)} placeholder="z.B. Ich habe keine Zeit..." rows={2} className="bg-white/[0.03]" />
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setWizardStep(1)} className="gap-2 border-white/10">
              <ArrowLeft className="h-4 w-4" /> Zurück
            </Button>
            <Button
              className="flex-1 h-12 gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-base"
              onClick={() => {
                if (!pillar) { toast.error("Wähle einen Content Pillar"); return; }
                setWizardStep(3);
              }}
            >
              Weiter <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ═══ STEP 3: Style & Plattform ═══ */}
      {wizardStep === 3 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold font-[Montserrat]">Style & Plattform</h2>

          {/* Hook Style */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Hook-Stil</Label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {HOOK_STYLES.map(h => (
                <button
                  key={h.value}
                  onClick={() => setHookStyle(h.value)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    hookStyle === h.value
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-white/10 bg-white/[0.02] hover:border-amber-500/30"
                  }`}
                >
                  <span className="text-xl">{h.icon}</span>
                  <p className="text-xs font-medium mt-1">{h.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Plattform */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Hauptplattform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="h-12 bg-white/[0.03] border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_PLATFORMS.map(p => (
                  <SelectItem key={p} value={p}><span className="capitalize">{p}</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Multi-Plattform */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Auch posten auf:</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_PLATFORMS.map(p => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium capitalize transition-all ${
                    platforms.includes(p)
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                      : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-amber-500/30"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Einwandbehandlung Toggle */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <Switch checked={includeBlocker} onCheckedChange={setIncludeBlocker} />
            <div>
              <p className="text-sm font-medium">Einwandbehandlung einbauen</p>
              <p className="text-xs text-muted-foreground">Zerstört häufige Einwände direkt im Content</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setWizardStep(2)} className="gap-2 border-white/10">
              <ArrowLeft className="h-4 w-4" /> Zurück
            </Button>
            <Button
              className="flex-1 h-12 gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-base"
              onClick={() => setWizardStep(4)}
            >
              Weiter <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ═══ STEP 4: Generieren ═══ */}
      {wizardStep === 4 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold font-[Montserrat]">Content generieren</h2>

          {/* Zusammenfassung */}
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-amber-400">Deine Auswahl:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Typ:</span>
                  <Badge variant="outline" className="border-amber-500/30">{CONTENT_TYPES.find(t => t.value === contentType)?.label}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Pillar:</span>
                  <Badge variant="outline" className="border-amber-500/30">{PILLARS.find(p => p.value === pillar)?.emoji} {pillar}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Hook:</span>
                  <Badge variant="outline" className="border-amber-500/30">{HOOK_STYLES.find(h => h.value === hookStyle)?.label}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Plattform:</span>
                  <Badge variant="outline" className="border-amber-500/30 capitalize">{platform}</Badge>
                </div>
              </div>
              {topic && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Thema: </span>
                  <span className="text-amber-300">{topic}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generator Buttons */}
          <div className="grid gap-3">
            <Button
              className="h-16 gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-lg shadow-lg shadow-amber-500/20"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {brandVoiceMut.isPending ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  KI generiert deinen Content...
                </>
              ) : (
                <>
                  <Brain className="h-6 w-6" />
                  Mit Brand Voice generieren
                </>
              )}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 gap-2 border-white/10 hover:border-amber-500/30"
                onClick={handleGoViralGenerate}
                disabled={isLoading}
              >
                {goViralMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-400" />}
                GoViral API
              </Button>
              <Button
                variant="outline"
                className="h-12 gap-2 border-white/10 hover:border-amber-500/30"
                onClick={handleBatch}
                disabled={isLoading}
              >
                {batchMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4 text-amber-400" />}
                Wochenplan
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="text-center space-y-3 py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">KI erstellt deinen viralen Content...</p>
              <Progress value={65} className="h-1 max-w-xs mx-auto bg-white/5" />
            </div>
          )}

          <Button variant="outline" onClick={() => setWizardStep(3)} className="gap-2 border-white/10">
            <ArrowLeft className="h-4 w-4" /> Zurück
          </Button>
        </div>
      )}

      {/* ═══ STEP 5: Media (Bild & Video) ═══ */}
      {wizardStep === 5 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold font-[Montserrat]">Bild & Video hinzufügen</h2>

          {/* Generated Content Preview (kompakt) */}
          {generatedContent && (
            <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-amber-400">Dein Content</span>
                  <div className="flex items-center gap-2">
                    {qualityResult && (
                      <Badge className={qualityResult.passed ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                        Score: {qualityResult.score}/100
                      </Badge>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { navigator.clipboard.writeText(generatedContent); toast.success("Kopiert!"); }}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {generatedContent.slice(0, 300)}{generatedContent.length > 300 ? "..." : ""}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* KI-Bild */}
            <div className="space-y-4">
              <ProductImagePicker
                contentPostId={generatedPostId}
                onImageSelected={(url: string) => setGeneratedImageUrl(url)}
              />

              <Card className="border-white/10 bg-white/[0.02]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Image className="h-4 w-4 text-amber-400" />
                    KI-Bild generieren
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    rows={3}
                    value={imagePrompt}
                    onChange={e => setImagePrompt(e.target.value)}
                    placeholder="Beschreibe das Bild..."
                    className="bg-white/[0.03] border-white/10"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Luxus-Porsche vor Villa, goldene Stunde, cinematic",
                      "Gesunde Person mit Smoothie, strahlend, modern studio",
                      "Laptop am Strand, Palmen, digitaler Nomad",
                      "Mercedes AMG, Sonnenuntergang, epic drone shot",
                    ].map((p, i) => (
                      <Badge key={i} variant="outline" className="cursor-pointer hover:bg-amber-500/10 text-[10px] border-white/10" onClick={() => setImagePrompt(p)}>
                        {p.slice(0, 35)}...
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold" onClick={handleGenerateImage} disabled={generateImageMut.isPending}>
                    {generateImageMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
                    Bild generieren
                  </Button>
                </CardContent>
              </Card>

              {generatedImageUrl && (
                <Card className="border-amber-500/20 overflow-hidden">
                  <img src={generatedImageUrl} alt="Generiert" className="w-full rounded-t-lg" />
                  <CardContent className="p-3 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs border-white/10" onClick={() => window.open(generatedImageUrl, "_blank")}>
                      <Download className="h-3 w-3" /> Speichern
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs border-white/10" onClick={() => { setVideoPrompt(imagePrompt); toast.success("Prompt für Video übernommen!"); }}>
                      <Video className="h-3 w-3" /> Als Video
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* KI-Video */}
            <div className="space-y-4">
              <Card className="border-white/10 bg-white/[0.02]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Video className="h-4 w-4 text-amber-400" />
                    KI-Video generieren
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    rows={3}
                    value={videoPrompt}
                    onChange={e => setVideoPrompt(e.target.value)}
                    placeholder="Beschreibe das Video..."
                    className="bg-white/[0.03] border-white/10"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={videoModel} onValueChange={setVideoModel}>
                      <SelectTrigger className="text-xs bg-white/[0.03] border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {VIDEO_MODELS.map(m => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={videoDuration} onValueChange={setVideoDuration}>
                      <SelectTrigger className="text-xs bg-white/[0.03] border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5s</SelectItem>
                        <SelectItem value="8">8s</SelectItem>
                        <SelectItem value="10">10s</SelectItem>
                        <SelectItem value="15">15s</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={videoAspect} onValueChange={setVideoAspect}>
                      <SelectTrigger className="text-xs bg-white/[0.03] border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9:16">9:16 Reels</SelectItem>
                        <SelectItem value="16:9">16:9 YouTube</SelectItem>
                        <SelectItem value="1:1">1:1 Feed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold" onClick={handleGenerateVideo} disabled={generateVideoMut.isPending}>
                    {generateVideoMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                    Video generieren
                  </Button>
                </CardContent>
              </Card>

              {generatedVideoUrl && (
                <Card className="border-amber-500/20 overflow-hidden">
                  <video src={generatedVideoUrl} controls className="w-full rounded-t-lg" />
                  <CardContent className="p-3">
                    <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs border-white/10" onClick={() => window.open(generatedVideoUrl, "_blank")}>
                      <Download className="h-3 w-3" /> Video herunterladen
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setWizardStep(4)} className="gap-2 border-white/10">
              <ArrowLeft className="h-4 w-4" /> Zurück
            </Button>
            <Button
              className="flex-1 h-12 gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-base"
              onClick={() => setWizardStep(6)}
            >
              Vorschau & Fertig <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ═══ STEP 6: Fertig — Vorschau & Copy ═══ */}
      {wizardStep === 6 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30">
              <CheckCircle2 className="h-8 w-8 text-black" />
            </div>
            <h2 className="text-xl font-bold font-[Montserrat]">Dein Content ist fertig!</h2>
            <p className="text-sm text-muted-foreground">Kopiere alles mit einem Tap und poste es.</p>
          </div>

          {/* Content Card */}
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent overflow-hidden">
            {generatedImageUrl && (
              <img src={generatedImageUrl} alt="Content Bild" className="w-full max-h-80 object-cover" />
            )}
            {generatedVideoUrl && (
              <video src={generatedVideoUrl} controls className="w-full max-h-80" />
            )}
            <CardContent className="p-4 space-y-4">
              <div className="bg-black/30 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {generatedContent}
              </div>

              {qualityResult && (
                <div className="flex items-center gap-3">
                  <Progress value={qualityResult.score} className="h-2 flex-1 bg-white/5" />
                  <Badge className={qualityResult.passed ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>
                    {qualityResult.score}/100
                  </Badge>
                </div>
              )}

              {/* AI Copilot */}
              <AICopilot
                content={generatedContent}
                onApply={(newContent) => setGeneratedContent(newContent)}
                platform={platform}
                contentType={contentType}
              />

              {/* Platform Preview */}
              <PlatformPreview
                content={generatedContent}
                imageUrl={generatedImageUrl || undefined}
                platforms={platforms}
                userName="LR Partner"
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid gap-3">
            <Button
              className="h-14 gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-lg shadow-lg shadow-amber-500/20"
              onClick={copyAll}
            >
              <Copy className="h-5 w-5" />
              Alles kopieren
            </Button>

            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="h-11 gap-2 border-white/10 text-xs" onClick={() => { navigator.clipboard.writeText(generatedContent); toast.success("Text kopiert!"); }}>
                <FileText className="h-3.5 w-3.5" /> Text
              </Button>
              {generatedImageUrl && (
                <Button variant="outline" className="h-11 gap-2 border-white/10 text-xs" onClick={() => window.open(generatedImageUrl, "_blank")}>
                  <Download className="h-3.5 w-3.5" /> Bild
                </Button>
              )}
              {generatedVideoUrl && (
                <Button variant="outline" className="h-11 gap-2 border-white/10 text-xs" onClick={() => window.open(generatedVideoUrl, "_blank")}>
                  <Download className="h-3.5 w-3.5" /> Video
                </Button>
              )}
            </div>

            <Separator className="bg-white/5" />

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 gap-2 border-white/10" onClick={() => {
                setWizardStep(1);
                setGeneratedContent("");
                setGeneratedImageUrl("");
                setGeneratedVideoUrl("");
                setGeneratedPostId(null);
                setQualityResult(null);
                setTopic("");
                setPillar("");
                toast.success("Bereit für neuen Content!");
              }}>
                <Sparkles className="h-4 w-4" /> Neuen Content erstellen
              </Button>
              <Button variant="outline" className="flex-1 gap-2 border-white/10" onClick={() => setWizardStep(5)}>
                <ArrowLeft className="h-4 w-4" /> Bild/Video ändern
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
