import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState, useMemo, useEffect } from "react";
import { useSearch } from "wouter";
import { toast } from "sonner";
import {
  Zap, Loader2, Sparkles, Package, Image, Video, Wand2, Copy,
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Brain,
  Flame, Target, MessageSquare, Film, Mic, FileText, TrendingUp,
} from "lucide-react";
import { ProductImagePicker } from "@/components/ProductImagePicker";
import AICopilot from "@/components/AICopilot";
import PlatformPreview from "@/components/PlatformPreview";

const CONTENT_TYPES = [
  { value: "post", label: "Social Media Post", icon: FileText },
  { value: "reel_script", label: "Reel / TikTok Script", icon: Film },
  { value: "story", label: "Story", icon: Flame },
  { value: "carousel", label: "Carousel (Instagram/LinkedIn)", icon: Image },
  { value: "ad_copy", label: "Ad Copy", icon: Target },
  { value: "linkedin", label: "LinkedIn Artikel", icon: MessageSquare },
  { value: "youtube_script", label: "YouTube Script", icon: Mic },
  { value: "follow_up", label: "Follow-Up Nachricht", icon: MessageSquare },
  { value: "objection", label: "Einwandbehandlung", icon: ShieldCheck },
];

const PILLARS = [
  { value: "Autokonzept", label: "Autokonzept", emoji: "\u{1F697}" },
  { value: "Business Opportunity", label: "Business Opportunity", emoji: "\u{1F4BC}" },
  { value: "Produkt-Highlight", label: "Produkt-Highlight", emoji: "\u{1F33F}" },
  { value: "Lina KI-Demo", label: "Lina KI-Demo", emoji: "\u{1F916}" },
  { value: "Lifestyle & Erfolg", label: "Lifestyle & Erfolg", emoji: "\u2728" },
  { value: "Einwandbehandlung", label: "Einwandbehandlung", emoji: "\u{1F6E1}\uFE0F" },
];

const HOOK_STYLES = [
  { value: "curiosity", label: "Neugier-Hook", desc: "Macht neugierig, zwingt zum Weiterlesen" },
  { value: "story", label: "Story-Hook", desc: "Persönliche Geschichte, emotional" },
  { value: "value", label: "Value-Hook", desc: "Sofortiger Mehrwert, How-To" },
  { value: "contrarian", label: "Contrarian-Hook", desc: "Unpopuläre Meinung, provokant" },
  { value: "socialProof", label: "Social Proof", desc: "Ergebnisse und Beweise" },
];

const SCRIPT_TEMPLATES = [
  { value: "reelScript", label: "Reel/TikTok Script" },
  { value: "storyPost", label: "Story Post (LinkedIn/FB)" },
  { value: "contrarianTake", label: "Contrarian Take" },
  { value: "listPost", label: "List Post" },
  { value: "howTo", label: "How-To Post" },
  { value: "carouselHook", label: "Carousel" },
  { value: "youtubeThread", label: "YouTube Longform" },
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

export default function GeneratorPage() {
  const utils = trpc.useUtils();
  const searchString = useSearch();

  // Brand Voice Generator State
  const [contentType, setContentType] = useState("post");
  const [topic, setTopic] = useState("");
  const [pillar, setPillar] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [fromTrend, setFromTrend] = useState(false);

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
      toast.info("Trend-Vorlage geladen! Passe den Content an und generiere.", { duration: 5000 });
    }
  }, [searchString]);
  const [platforms, setPlatforms] = useState<string[]>(["instagram", "facebook", "tiktok"]);
  const [hookStyle, setHookStyle] = useState("curiosity");
  const [scriptTemplate, setScriptTemplate] = useState("");
  const [includeBlocker, setIncludeBlocker] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedPostId, setGeneratedPostId] = useState<number | null>(null);
  const [qualityResult, setQualityResult] = useState<any>(null);

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

  // Brand Voice data
  const brandVoice = trpc.brandVoice.get.useQuery();
  const hookFormulas = trpc.brandVoice.getHooks.useQuery();
  const scriptTemplates = trpc.brandVoice.getScriptTemplates.useQuery();
  const blockers = trpc.brandVoice.getBlockers.useQuery();

  // Brand Voice Generator (uses LLM with full Brand Voice context)
  const brandVoiceMut = trpc.brandVoice.generateWithVoice.useMutation({
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      setGeneratedPostId(data.id);
      setQualityResult(data.qualityGate);
      utils.content.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success(`Content generiert! Quality Score: ${data.qualityGate.score}/100`);
    },
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  // GoViralBitch API Generator (direct API call)
  const goViralMut = trpc.content.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      setGeneratedPostId(data.id);
      setQualityResult(null);
      utils.content.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success("Content via GoViralBitch generiert!");
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

  // Brand Voice Generate
  const handleBrandVoiceGenerate = () => {
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

  // GoViralBitch API Generate
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

  const handleQualityCheck = () => {
    if (!generatedContent) { toast.error("Erst Content generieren"); return; }
    qualityMut.mutate({ content: generatedContent, platform });
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

  // Memoized hook examples
  const currentHookExamples = useMemo(() => {
    if (!hookFormulas.data) return [];
    const formulas = hookFormulas.data as Record<string, string[]>;
    return formulas[hookStyle] || [];
  }, [hookFormulas.data, hookStyle]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Content-Maschine
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Brand Voice + KI-Bilder + KI-Videos + Quality Gate. Viraler Content der Kontakte bringt.
        </p>
      </div>

      {fromTrend && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-3 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-400">Trend-Vorlage geladen</p>
              <p className="text-xs text-muted-foreground">Thema und Pillar wurden aus dem Trend-Scanner übernommen. Passe an und generiere!</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="brandvoice" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="brandvoice" className="gap-1.5"><Brain className="h-3.5 w-3.5" /> Brand Voice</TabsTrigger>
          <TabsTrigger value="goviralbitch" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" /> GoViral</TabsTrigger>
          <TabsTrigger value="image" className="gap-1.5"><Image className="h-3.5 w-3.5" /> KI-Bild</TabsTrigger>
          <TabsTrigger value="video" className="gap-1.5"><Video className="h-3.5 w-3.5" /> KI-Video</TabsTrigger>
          <TabsTrigger value="hooks" className="gap-1.5"><Wand2 className="h-3.5 w-3.5" /> Vorlagen</TabsTrigger>
        </TabsList>

        {/* ═══ BRAND VOICE GENERATOR ═══ */}
        <TabsContent value="brandvoice">
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    Brand Voice Generator
                  </CardTitle>
                  <CardDescription>
                    Generiert Content mit deiner LR Brand Voice, Hook-Formulas und CTA-Templates. Automatischer Quality Gate Check.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Content-Typ</Label>
                      <Select value={contentType} onValueChange={setContentType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CONTENT_TYPES.map(t => (
                            <SelectItem key={t.value} value={t.value}>
                              <span className="flex items-center gap-2">
                                <t.icon className="h-3.5 w-3.5" /> {t.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Plattform</Label>
                      <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ALL_PLATFORMS.map(p => (
                            <SelectItem key={p} value={p}><span className="capitalize">{p}</span></SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Thema / Topic</Label>
                    <Input
                      placeholder="z.B. Warum 99 Euro dein Leben verändern, Autokonzept erklärt, Lina Demo..."
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Content Pillar</Label>
                      <Select value={pillar} onValueChange={setPillar}>
                        <SelectTrigger><SelectValue placeholder="Pillar wählen..." /></SelectTrigger>
                        <SelectContent>
                          {PILLARS.map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.emoji} {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Hook-Stil</Label>
                      <Select value={hookStyle} onValueChange={setHookStyle}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {HOOK_STYLES.map(h => (
                            <SelectItem key={h.value} value={h.value}>
                              {h.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Script-Template (optional)</Label>
                    <Select value={scriptTemplate} onValueChange={setScriptTemplate}>
                      <SelectTrigger><SelectValue placeholder="Kein Template..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Kein Template</SelectItem>
                        {SCRIPT_TEMPLATES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg">
                    <Switch checked={includeBlocker} onCheckedChange={setIncludeBlocker} />
                    <div>
                      <p className="text-sm font-medium">Einwandbehandlung einbauen</p>
                      <p className="text-xs text-muted-foreground">Zerstört häufige Einwände direkt im Content</p>
                    </div>
                  </div>

                  {contentType === "follow_up" && (
                    <div className="space-y-3 p-3 bg-accent/30 rounded-lg">
                      <div className="space-y-2">
                        <Label>Lead Name</Label>
                        <Input value={leadName} onChange={e => setLeadName(e.target.value)} placeholder="Name des Leads..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Follow-Up Schritt</Label>
                        <Input type="number" min={1} max={10} value={step} onChange={e => setStep(Number(e.target.value))} />
                      </div>
                    </div>
                  )}

                  {contentType === "objection" && (
                    <div className="space-y-2 p-3 bg-accent/30 rounded-lg">
                      <Label>Einwand</Label>
                      <Textarea value={objection} onChange={e => setObjection(e.target.value)} placeholder="z.B. Ich habe keine Zeit..." rows={2} />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button className="flex-1 gap-2" onClick={handleBrandVoiceGenerate} disabled={isLoading}>
                      {brandVoiceMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                      Mit Brand Voice generieren
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Preview + Quality Gate */}
            <div className="lg:col-span-2 space-y-4">
              {/* Hook Examples */}
              {currentHookExamples.length > 0 && (
                <Card className="border-amber-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-400">
                      <Flame className="h-4 w-4" />
                      Hook-Beispiele ({HOOK_STYLES.find(h => h.value === hookStyle)?.label})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {currentHookExamples.slice(0, 4).map((hook: string, i: number) => (
                      <div
                        key={i}
                        className="p-2 bg-accent/30 rounded text-xs cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => { setTopic(hook); toast.success("Hook als Topic übernommen!"); }}
                      >
                        {hook}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Einwandbehandlung */}
              {includeBlocker && blockers.data && (
                <Card className="border-red-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-red-400">
                      <ShieldCheck className="h-4 w-4" />
                      Einwände die zerstört werden
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {(blockers.data as any[]).filter((b: any) => !pillar || b.pillar === pillar).slice(0, 3).map((b: any, i: number) => (
                      <div key={i} className="p-2 bg-red-500/10 rounded text-xs">
                        <p className="font-medium text-red-400">"{b.lie}"</p>
                        <p className="text-muted-foreground mt-1">{b.destruction}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Generated Content Preview */}
              {generatedContent && (
                <Card className="border-primary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-primary flex items-center justify-between">
                      Generierter Content
                      <div className="flex items-center gap-2">
                        {generatedPostId && <Badge variant="outline" className="text-[10px]">#{generatedPostId}</Badge>}
                        <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => { navigator.clipboard.writeText(generatedContent); toast.success("Kopiert!"); }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      className="bg-accent/30 text-xs leading-relaxed min-h-[120px] max-h-60 resize-y"
                    />
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleQualityCheck} disabled={qualityMut.isPending}>
                        {qualityMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
                        Quality Check
                      </Button>
                    </div>

                    {/* AI Copilot */}
                    <div className="mt-3">
                      <AICopilot
                        content={generatedContent}
                        onApply={(newContent) => setGeneratedContent(newContent)}
                        platform={platform}
                        contentType={contentType}
                      />
                    </div>

                    {/* Plattform-Vorschau */}
                    <div className="mt-3">
                      <PlatformPreview
                        content={generatedContent}
                        imageUrl={generatedImageUrl || undefined}
                        platforms={platforms}
                        userName="LR Partner"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quality Gate Results */}
              {qualityResult && (
                <Card className={qualityResult.passed ? "border-emerald-500/30" : "border-red-500/30"}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {qualityResult.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      Quality Gate: {qualityResult.score}/100
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Progress value={qualityResult.score} className="h-2" />
                    <div className="space-y-1">
                      {qualityResult.checks?.map((check: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {check.passed ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                          ) : check.severity === "error" ? (
                            <XCircle className="h-3 w-3 text-red-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
                          )}
                          <span className="text-muted-foreground">{check.name}:</span>
                          <span>{check.message}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ═══ GOVIRALBITCH API TAB ═══ */}
        <TabsContent value="goviralbitch">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  GoViralBitch API
                </CardTitle>
                <CardDescription>Direkte Content-Generierung über die GoViralBitch API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Content-Typ</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Thema</Label>
                  <Input placeholder="z.B. LR Autokonzept, Aloe Vera..." value={topic} onChange={e => setTopic(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Plattformen</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {ALL_PLATFORMS.map(p => (
                      <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={platforms.includes(p)} onCheckedChange={() => togglePlatform(p)} />
                        <span className="capitalize">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 gap-2" onClick={handleGoViralGenerate} disabled={isLoading}>
                    {goViralMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Generieren
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={handleBatch} disabled={isLoading}>
                    {batchMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                    Wochenplan
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {generatedContent && (
                <Card className="border-primary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-primary flex items-center justify-between">
                      Generierter Content
                      <Badge variant="outline" className="text-[10px]">#{generatedPostId}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-accent/30 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                      {generatedContent}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      In der Approval-Queue. Jetzt KI-Bild oder Video dazu generieren?
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ═══ KI-BILD TAB ═══ */}
        <TabsContent value="image">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Product Image Picker */}
              <ProductImagePicker
                contentPostId={generatedPostId}
                onImageSelected={(url: string) => {
                  setGeneratedImageUrl(url);
                }}
              />

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Image className="h-4 w-4 text-amber-400" />
                    KI-Bild generieren
                  </CardTitle>
                  <CardDescription>Oder erstelle ein neues Bild mit KI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Bild-Prompt</Label>
                    <Textarea
                      rows={4}
                      value={imagePrompt}
                      onChange={e => setImagePrompt(e.target.value)}
                      placeholder="Beschreibe das Bild... z.B. 'Luxuriöser Porsche vor einer Villa, Sonnenuntergang, cinematic lighting'"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">LR-Schnell-Prompts:</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "Luxus-Porsche vor Villa, goldene Stunde, cinematic, social media post",
                        "Gesunde Person mit grünem Smoothie, strahlend, modern studio, bright lighting",
                        "Laptop am Strand, Palmen, digitaler Nomad, Freiheit, warm tones",
                        "Team-Event, Konfetti, Champagner, Erfolg, professionell, celebration",
                        "Vorher-Nachher Transformation, split screen, clean design, dramatic",
                        "Mercedes AMG auf Bergstraße, Sonnenuntergang, epic, cinematic drone shot",
                        "Aloe Vera Pflanze, Wassertropfen, macro, frisch, Gesundheit, premium",
                      ].map((p, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent text-[10px]"
                          onClick={() => setImagePrompt(p)}
                        >
                          {p.slice(0, 40)}...
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full gap-2" onClick={handleGenerateImage} disabled={generateImageMut.isPending}>
                    {generateImageMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
                    Bild generieren
                  </Button>

                  {generatedPostId && (
                    <p className="text-xs text-muted-foreground text-center">
                      Wird automatisch an Post #{generatedPostId} angehängt
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {generatedImageUrl && (
              <Card className="border-amber-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-amber-400">Generiertes / Ausgewähltes Bild</CardTitle>
                </CardHeader>
                <CardContent>
                  <img src={generatedImageUrl} alt="Bild" className="rounded-lg w-full" />
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => window.open(generatedImageUrl, "_blank")}>
                      Vollbild öffnen
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => { setVideoPrompt(imagePrompt); toast.success("Prompt für Video übernommen!"); }}>
                      <Video className="h-3 w-3" /> Als Video animieren
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ═══ KI-VIDEO TAB ═══ */}
        <TabsContent value="video">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Video className="h-4 w-4 text-amber-400" />
                  KI-Video generieren
                </CardTitle>
                <CardDescription>Echte Video-KI: Kling 3.0 Pro oder Minimax</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Video-Prompt</Label>
                  <Textarea
                    rows={4}
                    value={videoPrompt}
                    onChange={e => setVideoPrompt(e.target.value)}
                    placeholder="Beschreibe das Video... z.B. 'Kamerafahrt um einen Porsche, goldene Stunde, cinematic slow motion'"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Video-KI Modell</Label>
                    <Select value={videoModel} onValueChange={setVideoModel}>
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {VIDEO_MODELS.map(m => (
                          <SelectItem key={m.value} value={m.value}>
                            <div>
                              <p className="font-medium">{m.label}</p>
                              <p className="text-xs text-muted-foreground">{m.desc}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Dauer</Label>
                    <Select value={videoDuration} onValueChange={setVideoDuration}>
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4s</SelectItem>
                        <SelectItem value="5">5s (Standard)</SelectItem>
                        <SelectItem value="6">6s</SelectItem>
                        <SelectItem value="8">8s (Veo 3.1 Max)</SelectItem>
                        <SelectItem value="10">10s (Kling 3.0)</SelectItem>
                        <SelectItem value="12">12s (Kling 3.0)</SelectItem>
                        <SelectItem value="15">15s (Kling 3.0 Max)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Format</Label>
                    <Select value={videoAspect} onValueChange={setVideoAspect}>
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9:16">9:16 (Reels/TikTok)</SelectItem>
                        <SelectItem value="16:9">16:9 (YouTube)</SelectItem>
                        <SelectItem value="1:1">1:1 (Feed)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">LR Video-Prompts:</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Cinematic slow-motion Kamerafahrt um weißen Porsche 911, goldene Stunde, Lens Flare",
                      "Person trinkt grünen Smoothie, strahlt, Zoom-In auf Gesicht, bright studio",
                      "Laptop öffnet sich am Strand, Palmen, Wellen, digitaler Nomad Lifestyle",
                      "Team auf Bühne, Konfetti fällt, Jubel, epic Zeitlupe, Celebration",
                      "Sonnenaufgang über Skyline, motivierend, Drohnenaufnahme, epic cinematic",
                    ].map((p, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent text-[10px]"
                        onClick={() => setVideoPrompt(p)}
                      >
                        {p.slice(0, 40)}...
                      </Badge>
                    ))}
                  </div>
                </div>

                {generatedImageUrl && (
                  <div className="p-3 bg-amber-500/10 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Basis-Bild (Image-to-Video):</p>
                    <img src={generatedImageUrl} alt="Basis" className="rounded h-20 object-cover" />
                    <p className="text-[10px] text-muted-foreground mt-1">Das Bild wird als Startframe für das Video verwendet</p>
                  </div>
                )}

                <Button className="w-full gap-2" onClick={handleGenerateVideo} disabled={generateVideoMut.isPending}>
                  {generateVideoMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                  Video generieren ({VIDEO_MODELS.find(m => m.value === videoModel)?.label})
                </Button>

                {/* Musik-Hinweis */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-300">
                  <p className="font-semibold mb-1">🎵 Musik hinzufügen (nach dem Download):</p>
                  <p className="text-muted-foreground">Das KI-Video hat keinen Ton. Füge Musik in CapCut oder Instagram Reels Editor hinzu:</p>
                  <ul className="mt-1.5 space-y-0.5 text-muted-foreground">
                    <li>• <strong className="text-amber-300">Team-Videos:</strong> Motivierende Beats, energiegeladen (z.B. Epic/Cinematic)</li>
                    <li>• <strong className="text-amber-300">Produkt-Videos:</strong> Ruhige, elegante Musik (Lo-Fi, Ambient)</li>
                    <li>• <strong className="text-amber-300">Lifestyle-Videos:</strong> Trendige Pop/R&B Beats</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {generatedVideoUrl && (
              <Card className="border-amber-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-amber-400">Generiertes KI-Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <video src={generatedVideoUrl} controls className="rounded-lg w-full" />
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => window.open(generatedVideoUrl, "_blank")}>
                      Video herunterladen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ═══ VORLAGEN TAB ═══ */}
        <TabsContent value="hooks">
          <div className="space-y-6">
            {/* Hook Formulas from GitHub Repos */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-400" />
                Hook-Formulas (aus Agent Brain)
              </h2>
              <p className="text-sm text-muted-foreground">
                Getestete Hooks aus dem GoViralBitch Agent Brain und marketingskills Repo. Klicke um als Topic zu übernehmen.
              </p>
              {hookFormulas.data && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(hookFormulas.data as Record<string, string[]>).map(([style, hooks]) => (
                    <Card key={style} className="border-border/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm capitalize">{style.replace(/([A-Z])/g, ' $1')}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1.5">
                        {(hooks as string[]).slice(0, 4).map((hook: string, i: number) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 p-2 bg-accent/30 rounded group cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => { setTopic(hook); toast.success("Hook als Topic übernommen!"); }}
                          >
                            <p className="text-[11px] flex-1">{hook}</p>
                            <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Script Templates */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-400" />
                Viral Script Templates
              </h2>
              {scriptTemplates.data && (
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(scriptTemplates.data as Record<string, { name: string; structure: string }>).map(([key, tmpl]) => (
                    <Card key={key} className="border-border/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{tmpl.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap bg-accent/30 rounded p-3 max-h-40 overflow-y-auto">
                          {tmpl.structure}
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 gap-1.5 text-xs"
                          onClick={() => { setScriptTemplate(key); toast.success(`Template "${tmpl.name}" ausgewählt!`); }}
                        >
                          <Wand2 className="h-3 w-3" /> Als Template verwenden
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Einwandbehandlung */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-red-400" />
                Einwandbehandlung (Audience Blockers)
              </h2>
              {blockers.data && (
                <div className="grid md:grid-cols-2 gap-3">
                  {(blockers.data as any[]).map((b: any, i: number) => (
                    <Card key={i} className="border-red-500/20">
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{b.pillar}</Badge>
                        </div>
                        <p className="text-sm font-medium text-red-400">"{b.lie}"</p>
                        <p className="text-xs text-muted-foreground">{b.destruction}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
