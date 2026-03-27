import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useState } from "react";
import {
  Sparkles, Loader2, Image, Video, Copy, CheckCircle2,
  Zap, Car, Briefcase, Plane, Flame, Sunrise,
  Wand2, Package, LayoutGrid,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, any> = {
  freedom: Sunrise,
  luxury_cars: Car,
  success: Briefcase,
  travel: Plane,
  motivation: Flame,
};

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "threads", label: "Threads" },
  { value: "twitter", label: "Twitter/X" },
  { value: "youtube", label: "YouTube" },
];

export default function LifestylePage() {
  const utils = trpc.useUtils();
  const { data: categories, isLoading: loadingCats } = trpc.lifestyle.categories.useQuery();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [mood, setMood] = useState("");
  const [includeImage, setIncludeImage] = useState(true);
  const [includeVideo, setIncludeVideo] = useState(false);

  // Batch
  const [batchCount, setBatchCount] = useState(5);
  const [batchCategories, setBatchCategories] = useState<string[]>([]);

  // Results
  const [result, setResult] = useState<any>(null);

  const generateMut = trpc.lifestyle.generate.useMutation({
    onSuccess: (data) => {
      setResult(data);
      utils.content.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success("Lifestyle-Content generiert! Text + Bild erstellt.");
    },
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  const batchMut = trpc.lifestyle.generateBatch.useMutation({
    onSuccess: (data) => {
      utils.content.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success(`${data.count} Lifestyle-Posts generiert! Alle in der Freigabe-Queue.`);
    },
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  const handleGenerate = () => {
    if (!selectedCategory) { toast.error("Bitte Kategorie auswählen"); return; }
    generateMut.mutate({
      category: selectedCategory,
      topic: topic || undefined,
      platform,
      mood: mood || undefined,
      includeImage,
      includeVideo,
      autoCreatePost: true,
    });
  };

  const handleBatch = () => {
    batchMut.mutate({
      count: batchCount,
      categories: batchCategories.length > 0 ? batchCategories : undefined,
      platform,
    });
  };

  const toggleBatchCategory = (key: string) => {
    setBatchCategories(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("In Zwischenablage kopiert!");
  };

  const isGenerating = generateMut.isPending;
  const isBatching = batchMut.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Lifestyle Content Engine
        </h1>
        <p className="text-muted-foreground mt-1">
          Automatisch Bilder und Videos für Lifestyle-Content generieren. Freiheit, Autos, Erfolg, Reisen, Motivation.
        </p>
      </div>

      {/* Kategorie-Auswahl */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {loadingCats ? (
          [1,2,3,4,5].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4"><div className="h-16 bg-muted rounded" /></CardContent>
            </Card>
          ))
        ) : (
          categories?.map(cat => {
            const Icon = CATEGORY_ICONS[cat.key] || Sparkles;
            const isSelected = selectedCategory === cat.key;
            return (
              <Card
                key={cat.key}
                className={`cursor-pointer transition-all hover:border-primary/50 ${isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : ""}`}
                onClick={() => {
                  setSelectedCategory(cat.key);
                  setMood("");
                }}
              >
                <CardContent className="p-4 text-center space-y-2">
                  <div className={`mx-auto h-10 w-10 rounded-xl flex items-center justify-center ${isSelected ? "bg-primary/20" : "bg-muted"}`}>
                    <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{cat.emoji} {cat.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {cat.imagePromptCount} Bilder, {cat.videoPromptCount} Videos
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Generator Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wand2 className="h-4 w-4" /> Einzelner Lifestyle-Post
            </CardTitle>
            <CardDescription>Text + Bild automatisch generieren und zur Freigabe senden.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Thema (optional)</Label>
              <Input
                placeholder="z.B. 'Morgens am Strand arbeiten' oder leer lassen für automatisch"
                value={topic}
                onChange={e => setTopic(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Plattform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Stimmung</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger><SelectValue placeholder="Automatisch" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatisch</SelectItem>
                    {selectedCategory && categories?.find(c => c.key === selectedCategory)?.moods.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={includeImage} onCheckedChange={setIncludeImage} />
                <Label className="text-sm flex items-center gap-1">
                  <Image className="h-3.5 w-3.5" /> KI-Bild
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={includeVideo} onCheckedChange={setIncludeVideo} />
                <Label className="text-sm flex items-center gap-1">
                  <Video className="h-3.5 w-3.5" /> KI-Video
                </Label>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!selectedCategory || isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generiere Text + {includeImage ? "Bild" : ""} {includeVideo ? "+ Video" : ""}...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Lifestyle-Content generieren
                </>
              )}
            </Button>

            {isGenerating && (
              <div className="space-y-2">
                <Progress value={includeVideo ? 33 : 50} className="h-1.5" />
                <p className="text-xs text-muted-foreground text-center">
                  {includeVideo ? "Text → Bild → Video generieren..." : "Text + Bild generieren..."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Batch Generator */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" /> Batch: Mehrere Posts auf einmal
            </CardTitle>
            <CardDescription>Generiere {batchCount} Lifestyle-Posts mit Bildern auf Knopfdruck.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Anzahl Posts</Label>
              <Select value={String(batchCount)} onValueChange={v => setBatchCount(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[3, 5, 7, 10, 14].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} Posts</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kategorien (leer = alle)</Label>
              <div className="flex flex-wrap gap-2">
                {categories?.map(cat => (
                  <Badge
                    key={cat.key}
                    variant={batchCategories.includes(cat.key) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleBatchCategory(cat.key)}
                  >
                    {cat.emoji} {cat.name}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              onClick={handleBatch}
              disabled={isBatching}
              className="w-full"
              variant="secondary"
              size="lg"
            >
              {isBatching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generiere {batchCount} Posts...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  {batchCount} Lifestyle-Posts generieren
                </>
              )}
            </Button>

            {isBatching && (
              <div className="space-y-2">
                <Progress value={20} className="h-1.5" />
                <p className="text-xs text-muted-foreground text-center">
                  Generiere {batchCount} Posts mit Bildern... Das kann einige Minuten dauern.
                </p>
              </div>
            )}

            {batchMut.data && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-sm text-green-500 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {batchMut.data.count} Posts generiert! Alle in der Freigabe-Queue.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ergebnis */}
      {result && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Generierter Lifestyle-Content
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{result.category}</Badge>
                <Badge variant="outline">{result.mood}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Hook */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Hook:</p>
              <p className="text-sm font-medium">{result.hook}</p>
            </div>

            {/* Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Post-Text:</p>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(result.text)} className="h-7 gap-1">
                  <Copy className="h-3 w-3" /> Kopieren
                </Button>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 text-sm whitespace-pre-wrap">
                {result.text}
              </div>
            </div>

            {/* Hashtags */}
            {result.hashtags && result.hashtags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Hashtags:</p>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(result.hashtags.join(" "))} className="h-7 gap-1">
                    <Copy className="h-3 w-3" /> Kopieren
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.hashtags.map((tag: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Bild */}
            {result.imageUrl && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Generiertes Bild:</p>
                <div className="rounded-lg overflow-hidden border max-w-md">
                  <img src={result.imageUrl} alt="Lifestyle Content" className="w-full" />
                </div>
              </div>
            )}

            {/* Image Prompt */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Bild-Prompt (für Nachgenerierung):</p>
              <div className="bg-muted/30 rounded p-2 text-xs text-muted-foreground">
                {result.imagePrompt}
              </div>
            </div>

            {result.postId && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <p className="text-sm text-green-500">
                  Post #{result.postId} erstellt und wartet auf Freigabe.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info-Box */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm space-y-1">
              <p className="font-medium">So funktioniert die Lifestyle-Engine:</p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-0.5 text-xs">
                <li>Wähle eine Kategorie (Freiheit, Autos, Erfolg, Reisen, Motivation)</li>
                <li>Optional: Thema und Stimmung anpassen</li>
                <li>Die KI generiert automatisch Text + passendes Bild</li>
                <li>Der Post landet in der Freigabe-Queue</li>
                <li>Nach Freigabe wird er automatisch über Blotato gepostet</li>
              </ol>
              <p className="text-muted-foreground text-xs mt-2">
                <strong>Content-Mix:</strong> 86% Lifestyle (12 Posts/Woche) / 14% Produkt (2 Posts/Woche).
                Die Lifestyle-Engine deckt den Großteil deines Contents ab.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
