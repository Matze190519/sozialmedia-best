import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Zap, Loader2, Sparkles, Package, Image, Video, Wand2, Copy } from "lucide-react";

const CONTENT_TYPES = [
  { value: "post", label: "Social Media Post" },
  { value: "reel", label: "Reel / Video Script" },
  { value: "story", label: "Story" },
  { value: "hooks", label: "Hook Formulas" },
  { value: "ad_copy", label: "Ad Copy" },
  { value: "follow_up", label: "Follow-Up Nachricht" },
  { value: "objection", label: "Einwandbehandlung" },
];

const PILLARS = [
  { value: "autokonzept", label: "Autokonzept" },
  { value: "business_opportunity", label: "Business Opportunity" },
  { value: "produkt_highlight", label: "Produkt-Highlight" },
  { value: "lina_demo", label: "Lina Demo" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "team_culture", label: "Team Culture" },
  { value: "success_story", label: "Erfolgsgeschichte" },
];

const ALL_PLATFORMS = [
  "instagram", "facebook", "tiktok", "linkedin",
  "twitter", "threads", "bluesky", "pinterest", "youtube",
];

// Vorlagen aus GoViralBitch Agent Brain - bewährte Hook-Formulas
const HOOK_TEMPLATES = [
  { category: "Autokonzept", hooks: [
    "Ich fahre einen Porsche und LR zahlt mit. Klingt verrückt? Ist es nicht.",
    "Mein Chef fährt einen Golf. Ich fahre Porsche. Der Unterschied? Ich habe mich getraut.",
    "99 Euro. Das war mein Investment. Heute fahre ich mein Traumauto.",
  ]},
  { category: "Business Opportunity", hooks: [
    "Ich habe meinen 9-to-5 Job gekündigt. Hier ist was passiert ist.",
    "500 Euro nebenbei. Jeden Monat. Ohne Kaltakquise. So geht's.",
    "Meine KI-Assistentin Lina macht mein Social Media. Ich mache Umsatz.",
  ]},
  { category: "Produkt-Highlight", hooks: [
    "Mein Arzt hat mich gefragt, was ich anders mache. Meine Antwort: Aloe Vera.",
    "Fresenius-geprüft. Dermatest-zertifiziert. Und du trinkst immer noch Leitungswasser?",
    "Vorher-Nachher in 30 Tagen. Kein Filter. Nur LR.",
  ]},
  { category: "Lifestyle", hooks: [
    "Montag, 10 Uhr. Alle arbeiten. Ich sitze am Pool auf Mallorca.",
    "Freiheit ist kein Zufall. Es ist eine Entscheidung.",
    "3 Jahre. Von 0 auf finanziell frei. Hier ist mein Weg.",
  ]},
  { category: "Lina Demo", hooks: [
    "Angst vor Kaltakquise? Meine KI macht das für dich.",
    "Lina hat mir letzte Woche 47 Leads gebracht. Automatisch.",
    "Niemand im Network Marketing hat das: Eine KI die für dich arbeitet.",
  ]},
];

// CTA Templates aus GoViralBitch
const CTA_TEMPLATES = [
  "Schreib mir eine DM mit 'STARTEN' für mehr Infos",
  "Link in Bio - kostenlose Beratung buchen",
  "Kommentiere 'INFO' und ich schicke dir alle Details",
  "Klick den Link in meiner Bio für dein kostenloses Gespräch",
  "Schreib mir 'AUTO' und ich zeige dir wie das Autokonzept funktioniert",
];

export default function GeneratorPage() {
  const utils = trpc.useUtils();
  const [contentType, setContentType] = useState("post");
  const [topic, setTopic] = useState("");
  const [pillar, setPillar] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["instagram", "facebook", "tiktok"]);
  const [leadName, setLeadName] = useState("");
  const [step, setStep] = useState(1);
  const [objection, setObjection] = useState("");
  const [product, setProduct] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedPostId, setGeneratedPostId] = useState<number | null>(null);

  // Media generation states
  const [imagePrompt, setImagePrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState("");

  const generateMut = trpc.content.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      setGeneratedPostId(data.id);
      utils.content.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success("Content generiert und zur Review eingereicht!");
    },
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  const batchMut = trpc.content.generateBatch.useMutation({
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      setGeneratedPostId(data.id);
      utils.content.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success("Wochenplan generiert und zur Review eingereicht!");
    },
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  const generateImageMut = trpc.media.generateImage.useMutation({
    onSuccess: (data) => {
      setGeneratedImageUrl(data.url);
      toast.success("Bild generiert!");
    },
    onError: (err) => toast.error("Bild-Fehler: " + err.message),
  });

  const generateVideoMut = trpc.media.generateVideo.useMutation({
    onSuccess: (data) => {
      setGeneratedVideoUrl(data.url || "");
      toast.success("Video generiert!");
    },
    onError: (err) => toast.error("Video-Fehler: " + err.message),
  });

  const togglePlatform = (p: string) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleGenerate = () => {
    if (platforms.length === 0) { toast.error("Mindestens eine Plattform auswählen"); return; }
    generateMut.mutate({
      contentType: contentType as any,
      topic: topic || undefined,
      pillar: pillar || undefined,
      platforms,
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
    generateImageMut.mutate({
      prompt: imagePrompt,
      contentPostId: generatedPostId || undefined,
    });
  };

  const handleGenerateVideo = () => {
    if (!videoPrompt.trim()) { toast.error("Video-Prompt eingeben"); return; }
    generateVideoMut.mutate({
      prompt: videoPrompt,
      imageUrl: generatedImageUrl || undefined,
      contentPostId: generatedPostId || undefined,
    });
  };

  const useHookTemplate = (hook: string) => {
    setTopic(hook);
    toast.success("Hook als Topic übernommen!");
  };

  const isLoading = generateMut.isPending || batchMut.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Content-Maschine
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Viraler Content + KI-Bilder + KI-Videos. Alles landet in der Approval-Queue.
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="generate" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Text</TabsTrigger>
          <TabsTrigger value="image" className="gap-1.5"><Image className="h-3.5 w-3.5" /> KI-Bild</TabsTrigger>
          <TabsTrigger value="video" className="gap-1.5"><Video className="h-3.5 w-3.5" /> KI-Video</TabsTrigger>
          <TabsTrigger value="hooks" className="gap-1.5"><Wand2 className="h-3.5 w-3.5" /> Vorlagen</TabsTrigger>
        </TabsList>

        {/* ─── Text Generator Tab ─── */}
        <TabsContent value="generate">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Content generieren
                </CardTitle>
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
                  <Label>Thema / Topic</Label>
                  <Input placeholder="z.B. LR Autokonzept, Aloe Vera, Nebeneinkommen..." value={topic} onChange={e => setTopic(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Content Pillar</Label>
                  <Select value={pillar} onValueChange={setPillar}>
                    <SelectTrigger><SelectValue placeholder="Optional..." /></SelectTrigger>
                    <SelectContent>
                      {PILLARS.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

                {contentType === "ad_copy" && (
                  <div className="space-y-2 p-3 bg-accent/30 rounded-lg">
                    <Label>Produkt</Label>
                    <Input value={product} onChange={e => setProduct(e.target.value)} placeholder="z.B. Aloe Vera Drinking Gel..." />
                  </div>
                )}

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
                  <Button className="flex-1 gap-2" onClick={handleGenerate} disabled={isLoading}>
                    {generateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Generieren
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={handleBatch} disabled={isLoading}>
                    {batchMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                    Wochenplan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated Content Preview */}
            <div className="space-y-4">
              {generatedContent && (
                <Card className="border-primary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-primary flex items-center justify-between">
                      Generierter Content
                      <Badge variant="outline" className="text-[10px]">Post #{generatedPostId}</Badge>
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

              {/* Media Preview */}
              {(generatedImageUrl || generatedVideoUrl) && (
                <Card className="border-emerald-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-emerald-400">Generierte Medien</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {generatedImageUrl && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">KI-Bild:</p>
                        <img src={generatedImageUrl} alt="KI-generiertes Bild" className="rounded-lg w-full max-h-64 object-cover" />
                      </div>
                    )}
                    {generatedVideoUrl && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">KI-Video/Animation:</p>
                        <img src={generatedVideoUrl} alt="KI-generiertes Visual" className="rounded-lg w-full max-h-64 object-cover" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ─── KI-Bild Tab ─── */}
        <TabsContent value="image">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Image className="h-4 w-4 text-blue-400" />
                  KI-Bild generieren
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Bild-Prompt</Label>
                  <Textarea
                    rows={4}
                    value={imagePrompt}
                    onChange={e => setImagePrompt(e.target.value)}
                    placeholder="Beschreibe das Bild das du willst... z.B. 'Luxuriöser Porsche vor einer Villa, Sonnenuntergang, cinematic lighting, social media post style'"
                  />
                </div>

                {/* Quick Prompts */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Schnell-Prompts:</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Luxus-Auto vor Villa, Sonnenuntergang, cinematic",
                      "Gesunde Person mit Aloe Vera Drink, modern, bright",
                      "Laptop am Strand, digitaler Nomad, Freiheit",
                      "Team-Event, Motivation, Erfolg, professionell",
                      "Vorher-Nachher Transformation, clean design",
                    ].map((p, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent text-[10px]"
                        onClick={() => setImagePrompt(p)}
                      >
                        {p.slice(0, 35)}...
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

            {generatedImageUrl && (
              <Card className="border-blue-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-blue-400">Generiertes Bild</CardTitle>
                </CardHeader>
                <CardContent>
                  <img src={generatedImageUrl} alt="KI-Bild" className="rounded-lg w-full" />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ─── KI-Video Tab ─── */}
        <TabsContent value="video">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Video className="h-4 w-4 text-violet-400" />
                  KI-Video generieren
                </CardTitle>
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

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Schnell-Prompts:</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Slow-Motion Kamerafahrt um Luxus-Auto",
                      "Person trinkt Aloe Vera, strahlt, Zoom-In",
                      "Laptop öffnet sich, Geld-Animationen, Erfolg",
                      "Team feiert zusammen, Konfetti, Energie",
                      "Sonnenaufgang über Stadt, motivierend, epic",
                    ].map((p, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent text-[10px]"
                        onClick={() => setVideoPrompt(p)}
                      >
                        {p.slice(0, 35)}...
                      </Badge>
                    ))}
                  </div>
                </div>

                {generatedImageUrl && (
                  <div className="p-3 bg-accent/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Basis-Bild für Video (optional):</p>
                    <img src={generatedImageUrl} alt="Basis" className="rounded h-20 object-cover" />
                  </div>
                )}

                <Button className="w-full gap-2" onClick={handleGenerateVideo} disabled={generateVideoMut.isPending}>
                  {generateVideoMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                  Video generieren
                </Button>
              </CardContent>
            </Card>

            {generatedVideoUrl && (
              <Card className="border-violet-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-violet-400">Generiertes Video-Visual</CardTitle>
                </CardHeader>
                <CardContent>
                  <img src={generatedVideoUrl} alt="KI-Video" className="rounded-lg w-full" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Das generierte Visual kann als Reel-Hintergrund oder Story-Visual verwendet werden.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ─── Vorlagen Tab ─── */}
        <TabsContent value="hooks">
          <div className="space-y-6">
            {/* Hook Templates */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-amber-400" />
                Bewährte Hook-Formulas
              </h2>
              <p className="text-sm text-muted-foreground">
                Getestete Hooks aus dem GoViralBitch Agent Brain. Klicke um sie als Topic zu übernehmen.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {HOOK_TEMPLATES.map((group) => (
                  <Card key={group.category} className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{group.category}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {group.hooks.map((hook, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-accent/30 rounded-lg group cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => useHookTemplate(hook)}>
                          <p className="text-xs flex-1">{hook}</p>
                          <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* CTA Templates */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">CTA-Vorlagen</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                {CTA_TEMPLATES.map((cta, i) => (
                  <div
                    key={i}
                    className="p-3 bg-accent/30 rounded-lg text-sm cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => { navigator.clipboard.writeText(cta); toast.success("CTA kopiert!"); }}
                  >
                    {cta}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
