import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, Loader2, Copy, ChevronLeft, ChevronRight, Sparkles,
  BookOpen, ListOrdered, ArrowLeftRight, Lightbulb, MessageSquare,
  Hash, Instagram, Linkedin,
} from "lucide-react";

const PILLARS = [
  { value: "Autokonzept", label: "Autokonzept", emoji: "\u{1F697}" },
  { value: "Business Opportunity", label: "Business Opportunity", emoji: "\u{1F4BC}" },
  { value: "Produkt-Highlight", label: "Produkt-Highlight", emoji: "\u{1F33F}" },
  { value: "Lina KI-Demo", label: "Lina KI-Demo", emoji: "\u{1F916}" },
  { value: "Lifestyle & Erfolg", label: "Lifestyle & Erfolg", emoji: "\u2728" },
  { value: "Einwandbehandlung", label: "Einwandbehandlung", emoji: "\u{1F6E1}\uFE0F" },
];

const STYLES = [
  { value: "educational", label: "Lehrreich", icon: BookOpen, desc: "Wissen vermitteln" },
  { value: "storytelling", label: "Story", icon: MessageSquare, desc: "Geschichte erzählen" },
  { value: "listicle", label: "Liste", icon: ListOrdered, desc: "Punkte aufzählen" },
  { value: "before_after", label: "Vorher/Nachher", icon: ArrowLeftRight, desc: "Transformation" },
  { value: "tips", label: "Tipps", icon: Lightbulb, desc: "Praktische Tipps" },
];

interface Slide {
  slideNumber: number;
  headline: string;
  body: string;
  designHint: string;
  emoji: string;
}

interface CarouselResult {
  title: string;
  slides: Slide[];
  caption: string;
  hashtags: string[];
}

const SLIDE_COLORS = [
  "from-purple-600 to-blue-600",
  "from-emerald-600 to-teal-600",
  "from-amber-600 to-orange-600",
  "from-pink-600 to-rose-600",
  "from-cyan-600 to-blue-600",
  "from-violet-600 to-purple-600",
  "from-lime-600 to-green-600",
  "from-red-600 to-pink-600",
  "from-indigo-600 to-blue-600",
  "from-teal-600 to-cyan-600",
  "from-orange-600 to-amber-600",
  "from-blue-600 to-indigo-600",
  "from-rose-600 to-red-600",
  "from-green-600 to-emerald-600",
  "from-sky-600 to-cyan-600",
];

export default function CarouselPage() {
  const [topic, setTopic] = useState("");
  const [pillar, setPillar] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "linkedin">("instagram");
  const [slideCount, setSlideCount] = useState(7);
  const [style, setStyle] = useState("educational");
  const [result, setResult] = useState<CarouselResult | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const generateMut = trpc.carousel.generate.useMutation({
    onSuccess: (data) => {
      setResult(data as CarouselResult);
      setCurrentSlide(0);
      toast.success(`Karussell mit ${(data as CarouselResult).slides.length} Slides generiert!`);
    },
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  const handleGenerate = () => {
    if (!topic.trim()) { toast.error("Thema eingeben"); return; }
    generateMut.mutate({
      topic,
      pillar: pillar || undefined,
      platform,
      slideCount,
      style: style as any,
    });
  };

  const copyAll = () => {
    if (!result) return;
    const text = result.slides.map(s => `--- Slide ${s.slideNumber} ---\n${s.headline}\n${s.body}`).join("\n\n");
    const full = `${result.title}\n\n${text}\n\n---\nCaption: ${result.caption}\n\n${result.hashtags.join(" ")}`;
    navigator.clipboard.writeText(full);
    toast.success("Alles kopiert!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
          <Layers className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          Karussell-Generator
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Erstelle Instagram/LinkedIn Karussells mit KI. Slide-für-Slide Content der viral geht.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left: Settings */}
        <div className="space-y-4">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Karussell erstellen
              </CardTitle>
              <CardDescription>Wähle Thema, Stil und Plattform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Thema</Label>
                <Input
                  placeholder="z.B. 5 Gründe warum LR dein Leben verändert..."
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                />
              </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Plattform</Label>
                  <Select value={platform} onValueChange={v => setPlatform(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram"><span className="flex items-center gap-1.5">📸 Instagram</span></SelectItem>
                      <SelectItem value="linkedin"><span className="flex items-center gap-1.5">💼 LinkedIn</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Anzahl Slides</Label>
                  <Select value={String(slideCount)} onValueChange={v => setSlideCount(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[3, 5, 7, 10, 12, 15].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} Slides</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content Pillar</Label>
                <Select value={pillar} onValueChange={setPillar}>
                  <SelectTrigger><SelectValue placeholder="Optional..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Pillar</SelectItem>
                    {PILLARS.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.emoji} {p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Stil</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {STYLES.map(s => (
                    <Button
                      key={s.value}
                      size="sm"
                      variant={style === s.value ? "default" : "outline"}
                      className="h-auto py-2 px-1.5 flex-col items-center text-[10px] gap-1"
                      onClick={() => setStyle(s.value)}
                    >
                      <s.icon className="h-3.5 w-3.5" />
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button className="w-full gap-2" onClick={handleGenerate} disabled={generateMut.isPending}>
                {generateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
                Karussell generieren
              </Button>
            </CardContent>
          </Card>

          {/* Caption & Hashtags */}
          {result && (
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Caption & Hashtags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-accent/30 rounded-lg p-3 text-xs leading-relaxed whitespace-pre-wrap">
                  {result.caption}
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.hashtags.map((h, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] cursor-pointer hover:bg-accent"
                      onClick={() => { navigator.clipboard.writeText(h); toast.success("Kopiert!"); }}>
                      <Hash className="h-2.5 w-2.5 mr-0.5" />{h.replace("#", "")}
                    </Badge>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs" onClick={copyAll}>
                  <Copy className="h-3 w-3" /> Alles kopieren
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Slide Preview */}
        <div className="space-y-4">
          {result && result.slides.length > 0 ? (
            <>
              {/* Slide Navigator */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{result.title}</h3>
                <Badge variant="outline" className="text-[10px]">
                  {currentSlide + 1} / {result.slides.length}
                </Badge>
              </div>

              {/* Current Slide Preview */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`aspect-square rounded-2xl bg-gradient-to-br ${SLIDE_COLORS[currentSlide % SLIDE_COLORS.length]} p-6 flex flex-col justify-between text-white shadow-2xl`}>
                      <div>
                        <span className="text-4xl mb-3 block">{result.slides[currentSlide]?.emoji}</span>
                        <h2 className="text-xl font-bold leading-tight mb-3">
                          {result.slides[currentSlide]?.headline}
                        </h2>
                      </div>
                      <div>
                        <p className="text-sm leading-relaxed opacity-90">
                          {result.slides[currentSlide]?.body}
                        </p>
                        <p className="text-[9px] opacity-50 mt-3">
                          {result.slides[currentSlide]?.designHint}
                        </p>
                      </div>
                      {/* Slide indicator dots */}
                      <div className="flex justify-center gap-1 mt-3">
                        {result.slides.map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                              i === currentSlide ? "bg-white w-4" : "bg-white/40"
                            }`}
                            onClick={() => setCurrentSlide(i)}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full bg-black/30 hover:bg-black/50 text-white"
                  onClick={() => setCurrentSlide(i => Math.max(0, i - 1))}
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full bg-black/30 hover:bg-black/50 text-white"
                  onClick={() => setCurrentSlide(i => Math.min(result.slides.length - 1, i + 1))}
                  disabled={currentSlide === result.slides.length - 1}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* All Slides Grid */}
              <div className="grid grid-cols-4 gap-2">
                {result.slides.map((slide, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg bg-gradient-to-br ${SLIDE_COLORS[i % SLIDE_COLORS.length]} p-2 cursor-pointer transition-all text-white ${
                      i === currentSlide ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105" : "opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setCurrentSlide(i)}
                  >
                    <span className="text-sm">{slide.emoji}</span>
                    <p className="text-[7px] font-bold leading-tight mt-0.5 line-clamp-2">{slide.headline}</p>
                  </div>
                ))}
              </div>

              {/* Copy individual slide */}
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1.5 text-xs"
                onClick={() => {
                  const s = result.slides[currentSlide];
                  navigator.clipboard.writeText(`${s.headline}\n\n${s.body}`);
                  toast.success(`Slide ${currentSlide + 1} kopiert!`);
                }}
              >
                <Copy className="h-3 w-3" /> Slide {currentSlide + 1} kopieren
              </Button>
            </>
          ) : (
            <Card className="border-dashed border-2 border-border/30">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Layers className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-sm font-medium text-muted-foreground">Kein Karussell generiert</h3>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Wähle ein Thema und klicke auf "Karussell generieren"
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
