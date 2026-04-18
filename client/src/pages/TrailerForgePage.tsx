import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Film, Wand2, Copy, Check, Download, Clapperboard, Image as ImageIcon, Sparkles
} from "lucide-react";
import { toast } from "sonner";

/**
 * TRAILER FORGE — 15/30/60s Trailer-Blueprints in 5 Pop-Culture-Styles
 *
 * Marvel, Netflix Mini-Doc, Apple Launch, Gritty POV, Sci-Fi Lore
 */

type Style = "marvel" | "netflix_doc" | "apple_launch" | "sci_fi" | "comedy";
type Format = "15s" | "30s" | "60s";
type Model = "higgsfield" | "veo31" | "sora2" | "kling30";

interface TrailerBeat {
  label: string;
  durationSec: number;
  prompt: string;
  model: Model;
  thumbnailHint?: string;
}

interface TrailerBlueprint {
  id: string;
  subject: string;
  style: Style;
  format: Format;
  beats: TrailerBeat[];
  cta: string;
  soundtrack: string;
}

const STYLE_CONFIG: Record<Style, {
  label: string;
  emoji: string;
  desc: string;
  vibe: string;
  music: string;
}> = {
  marvel: {
    label: "Marvel Teaser",
    emoji: "🦸",
    desc: "Epic, heroisch, mit Bass-Drops",
    vibe: "Slow-Mo Heroes, Close-Ups, Shield-Reveals, cinematische Sprünge",
    music: "Epic orchestral build-up → Bass drop → Silence → Logo reveal",
  },
  netflix_doc: {
    label: "Netflix Mini-Doc",
    emoji: "🎬",
    desc: "Dokumentarisch, ehrlich, emotional",
    vibe: "Interview-Shots, B-Roll, handwritten text overlays, real voices",
    music: "Sparse piano → emotional swell → authentic silence",
  },
  apple_launch: {
    label: "Apple Launch",
    emoji: "✨",
    desc: "Clean, product-focused, premium",
    vibe: "Minimalistisch, weiß/schwarz, product rotations, glowing accents",
    music: "Subtle electronic pulse → reveal chime → soft warm tone",
  },
  sci_fi: {
    label: "Sci-Fi Lore",
    emoji: "🌌",
    desc: "Mysterious, futuristic, aufgebauscht",
    vibe: "Neon, portals, data streams, Nova-Parallelwelt-Aesthetic",
    music: "Synthwave build → glitch → otherworldly drop",
  },
  comedy: {
    label: "Gritty POV Comedy",
    emoji: "😂",
    desc: "Raw, witzig, relatable",
    vibe: "Handheld, awkward cuts, text overlays, meme references",
    music: "Offbeat lo-fi → sudden stop → comic sting",
  },
};

const FORMAT_CONFIG: Record<Format, { label: string; beatCount: number; idealFor: string }> = {
  "15s": { label: "15s Flash", beatCount: 4, idealFor: "Attention Spike, Teaser, Pre-Launch" },
  "30s": { label: "30s Standard", beatCount: 6, idealFor: "Reels Main, TikTok Feature" },
  "60s": { label: "60s Epic", beatCount: 9, idealFor: "Shorts Main, YouTube-Feature, Launch-Anthem" },
};

const BEATS_BY_STYLE: Record<Style, string[]> = {
  marvel: ["Mystery Opening", "Problem Reveal", "Hero Intro", "Conflict Peak", "Power Demo", "Team Shot", "Villain/Challenge", "Final Charge", "Logo Drop"],
  netflix_doc: ["Question over Black", "Talking Head Intro", "Context B-Roll", "Struggle Moment", "Turning Point", "Growth B-Roll", "Realization Quote", "Hope Moment", "Final Statement"],
  apple_launch: ["Black Screen Text", "Product Tease (Close-Up)", "Product 360° Rotate", "Texture Macro", "Feature Highlight", "Contextual Shot", "Simple Benefit Line", "Release Info", "Logo + Tagline"],
  sci_fi: ["Portal Open", "Character Enter", "World Establish", "System Fail", "Data Reveal", "Upgrade Moment", "Parallel World Shift", "Choice Moment", "Ebene 2 Unlocked"],
  comedy: ["Normal Day", "Sudden Weird Moment", "Double-Take", "Cringe Escalation", "Absurd Peak", "Confused Audience", "Plot Twist", "Self-Aware Wink", "Mic Drop"],
};

const PREFERRED_MODELS: Record<Style, Record<string, Model>> = {
  marvel: {
    "Mystery Opening": "higgsfield", "Problem Reveal": "veo31", "Hero Intro": "higgsfield",
    "Conflict Peak": "veo31", "Power Demo": "veo31", "Team Shot": "higgsfield",
    "Villain/Challenge": "higgsfield", "Final Charge": "veo31", "Logo Drop": "kling30",
  },
  netflix_doc: {
    "Question over Black": "kling30", "Talking Head Intro": "sora2", "Context B-Roll": "veo31",
    "Struggle Moment": "sora2", "Turning Point": "higgsfield", "Growth B-Roll": "veo31",
    "Realization Quote": "sora2", "Hope Moment": "higgsfield", "Final Statement": "sora2",
  },
  apple_launch: {
    "Black Screen Text": "kling30", "Product Tease (Close-Up)": "higgsfield", "Product 360° Rotate": "kling30",
    "Texture Macro": "higgsfield", "Feature Highlight": "higgsfield", "Contextual Shot": "veo31",
    "Simple Benefit Line": "higgsfield", "Release Info": "kling30", "Logo + Tagline": "kling30",
  },
  sci_fi: {
    "Portal Open": "higgsfield", "Character Enter": "sora2", "World Establish": "higgsfield",
    "System Fail": "veo31", "Data Reveal": "kling30", "Upgrade Moment": "higgsfield",
    "Parallel World Shift": "higgsfield", "Choice Moment": "sora2", "Ebene 2 Unlocked": "kling30",
  },
  comedy: {
    "Normal Day": "veo31", "Sudden Weird Moment": "veo31", "Double-Take": "sora2",
    "Cringe Escalation": "veo31", "Absurd Peak": "veo31", "Confused Audience": "kling30",
    "Plot Twist": "sora2", "Self-Aware Wink": "sora2", "Mic Drop": "kling30",
  },
};

function buildBeatPrompt(style: Style, beatLabel: string, subject: string): { prompt: string; thumbnail?: string } {
  const styleCtx = STYLE_CONFIG[style];
  const promptMap: Record<Style, Record<string, string>> = {
    marvel: {
      "Mystery Opening": `Black screen, slow fade-in, dramatic orange glow, ${subject} silhouette forming in smoke, epic Marvel-style cinematography, 8K`,
      "Problem Reveal": `Fast-paced montage of the challenge ${subject} solves, cinematic sparks, world at stake, Marvel teaser vibe`,
      "Hero Intro": `Confident hero shot of ${subject}-Protagonist, heroic pose, golden hour lighting, camera slow push-in, Marvel style`,
      "Logo Drop": `${subject} logo slowly emerges from particles, metallic finish, bass-drop moment, Marvel style`,
    },
    netflix_doc: {
      "Question over Black": `Black screen, white hand-written text: "What if ${subject} could change everything?", documentary style`,
      "Talking Head Intro": `Real person, 35mm film look, sitting by window, talking about ${subject}, warm natural light, Netflix documentary`,
      "Struggle Moment": `Raw emotional moment showing the problem ${subject} solves, handheld camera, vulnerable honest footage`,
    },
    apple_launch: {
      "Black Screen Text": `Black screen, minimal white text: "Introducing. ${subject}.", soft fade`,
      "Product Tease (Close-Up)": `Extreme close-up of ${subject}, studio lighting, rim light, floating in clean white space, Apple launch style, macro lens`,
      "Product 360° Rotate": `${subject} rotating on invisible podium, pure white background, soft shadows, commercial perfection`,
    },
    sci_fi: {
      "Portal Open": `Neon portal opening in futuristic corridor, character ${subject} emerging, cyberpunk colors #0B1020 and gold, cinematic`,
      "Character Enter": `Nova Lenz walks through portal, confident, matte black jacket with gold seams, sci-fi hallway lighting`,
      "Parallel World Shift": `Reality glitches as ${subject} crosses into Parallelwelt, digital distortion, upgrade visualizations`,
    },
    comedy: {
      "Normal Day": `Totally mundane shot of person dealing with ${subject} in ordinary kitchen, handheld, zero production value, authentic`,
      "Sudden Weird Moment": `Same person experiences absurd twist related to ${subject}, deadpan face, meme-worthy composition`,
      "Plot Twist": `Character realizes something ironic about ${subject}, slow zoom on shocked face, comedic sting`,
    },
  };

  const prompt = promptMap[style]?.[beatLabel] || `${beatLabel} shot for ${subject}, style: ${styleCtx.vibe}`;
  const thumbnails: Record<Style, string> = {
    marvel: `Hero ${subject} pose, dramatic lighting, logo faintly visible`,
    netflix_doc: `Talking head + subject side-by-side, handwritten title`,
    apple_launch: `${subject} floating on white, minimal text "Introducing."`,
    sci_fi: `${subject} with neon portal, gold-blue palette`,
    comedy: `Exaggerated reaction shot with big text overlay`,
  };

  return { prompt, thumbnail: thumbnails[style] };
}

function buildBlueprint(subject: string, style: Style, format: Format): TrailerBlueprint {
  const cfg = FORMAT_CONFIG[format];
  const allBeats = BEATS_BY_STYLE[style];
  const beatCount = cfg.beatCount;
  const perBeatDuration = Math.floor(parseInt(format) / beatCount);

  const beatLabels = allBeats.slice(0, beatCount);

  const beats: TrailerBeat[] = beatLabels.map(label => {
    const { prompt, thumbnail } = buildBeatPrompt(style, label, subject);
    return {
      label,
      durationSec: perBeatDuration,
      prompt,
      model: PREFERRED_MODELS[style]?.[label] || "kling30",
      thumbnailHint: thumbnail,
    };
  });

  const ctas: Record<Style, string> = {
    marvel: `${subject.toUpperCase()}. ONLY IN YOUR FEED.`,
    netflix_doc: `The story of ${subject} — continues tomorrow.`,
    apple_launch: `${subject}. Available now.`,
    sci_fi: `${subject} — access Ebene 2. DM "PORTAL".`,
    comedy: `Yeah. This is ${subject}. Don't make it weird. 🫠`,
  };

  return {
    id: `trailer-${Date.now()}`,
    subject,
    style,
    format,
    beats,
    cta: ctas[style],
    soundtrack: STYLE_CONFIG[style].music,
  };
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 gap-1 text-xs"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(label || "Kopiert");
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {label}
    </Button>
  );
}

export default function TrailerForgePage() {
  const [subject, setSubject] = useState("");
  const [style, setStyle] = useState<Style>("marvel");
  const [format, setFormat] = useState<Format>("30s");
  const [blueprint, setBlueprint] = useState<TrailerBlueprint | null>(null);

  const generate = () => {
    if (!subject.trim()) {
      toast.error("Thema / Produkt eingeben");
      return;
    }
    setBlueprint(buildBlueprint(subject, style, format));
    toast.success(`${FORMAT_CONFIG[format].label} Trailer-Blueprint erstellt`);
  };

  const exportPromptPack = () => {
    if (!blueprint) return;
    const text = [
      `# TRAILER BLUEPRINT: ${blueprint.subject}`,
      `Style: ${STYLE_CONFIG[blueprint.style].label} · Format: ${FORMAT_CONFIG[blueprint.format].label}`,
      `Soundtrack: ${blueprint.soundtrack}`,
      ``,
      `## BEATS`,
      ...blueprint.beats.flatMap((b, i) => [
        `### Beat ${i + 1}: ${b.label} (${b.durationSec}s · ${b.model})`,
        `Prompt: ${b.prompt}`,
        b.thumbnailHint ? `Thumbnail: ${b.thumbnailHint}` : "",
        ``,
      ]),
      `## CTA`,
      blueprint.cta,
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Production Pack kopiert");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gold-text" style={{ fontFamily: "var(--font-heading)" }}>
          Trailer Forge
        </h1>
        <p className="text-sm text-muted-foreground">
          15/30/60s Trailer in 5 Pop-Culture-Styles. Für Produkte, Events, Recruiting.
        </p>
      </div>

      <Card className="border-primary/30">
        <CardContent className="p-5 space-y-3">
          <div>
            <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Thema / Produkt</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="z.B. Aloe Vera Gel, LR Auto-Bonus, LR Team Event Oktober"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-2 block">Style</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {(Object.keys(STYLE_CONFIG) as Style[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    style === s ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-2xl mb-1">{STYLE_CONFIG[s].emoji}</div>
                  <div className="text-xs font-semibold">{STYLE_CONFIG[s].label}</div>
                  <div className="text-[10px] text-muted-foreground">{STYLE_CONFIG[s].desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-2 block">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(FORMAT_CONFIG) as Format[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    format === f ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  <Film className="h-5 w-5 text-primary mx-auto mb-1" />
                  <div className="text-sm font-semibold">{FORMAT_CONFIG[f].label}</div>
                  <div className="text-[10px] text-muted-foreground">{FORMAT_CONFIG[f].beatCount} Beats</div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Ideal für: {FORMAT_CONFIG[format].idealFor}
            </p>
          </div>

          <Button className="btn-gold w-full" onClick={generate} disabled={!subject.trim()}>
            <Wand2 className="h-4 w-4 mr-1" /> Trailer-Blueprint erzeugen
          </Button>
        </CardContent>
      </Card>

      {blueprint && (
        <>
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{STYLE_CONFIG[blueprint.style].emoji}</span>
                    <div>
                      <h2 className="text-lg font-bold">{blueprint.subject}</h2>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">{STYLE_CONFIG[blueprint.style].label}</Badge>
                        <Badge variant="outline" className="text-[10px]">{FORMAT_CONFIG[blueprint.format].label}</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Vibe: {STYLE_CONFIG[blueprint.style].vibe}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="btn-gold" onClick={exportPromptPack}>
                    <Download className="h-3 w-3 mr-1" /> Production Pack
                  </Button>
                </div>
              </div>
              <div className="p-2 rounded bg-background/50 border border-border/50">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">🎵 Soundtrack</p>
                <p className="text-xs">{blueprint.soundtrack}</p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue={blueprint.format}>
            <TabsList className="w-full grid grid-cols-3">
              {(Object.keys(FORMAT_CONFIG) as Format[]).map(f => (
                <TabsTrigger
                  key={f}
                  value={f}
                  onClick={() => setBlueprint(buildBlueprint(blueprint.subject, blueprint.style, f))}
                >
                  {FORMAT_CONFIG[f].label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={blueprint.format} className="mt-3 space-y-2">
              {blueprint.beats.map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border-border/50">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          <span className="text-primary font-bold text-sm w-6 shrink-0">#{i + 1}</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{b.label}</p>
                            <div className="flex gap-1 flex-wrap mt-1">
                              <Badge variant="outline" className="text-[9px]">{b.durationSec}s</Badge>
                              <Badge variant="outline" className="text-[9px]">
                                <Clapperboard className="h-2.5 w-2.5 mr-0.5" /> {b.model}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 rounded bg-background/50 border border-border/50">
                        <pre className="text-[10px] whitespace-pre-wrap font-mono">{b.prompt}</pre>
                      </div>
                      {b.thumbnailHint && (
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <ImageIcon className="h-3 w-3" /> Thumbnail: {b.thumbnailHint}
                        </div>
                      )}
                      <CopyButton text={b.prompt} />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* CTA */}
              <Card className="border-primary/30">
                <CardContent className="p-3 flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Final CTA</p>
                    <p className="text-sm font-bold text-primary">{blueprint.cta}</p>
                  </div>
                  <CopyButton text={blueprint.cta} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Optional an Manus:</p>
          <p className="text-muted-foreground">
            Neue Endpoints: <code>trailerForge.generate</code>, <code>trailerForge.routeModels</code>, <code>trailerForge.exportPromptPack</code>. Bei Backend-Integration direktes Submit an Cinema-Stack-Pipeline.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
