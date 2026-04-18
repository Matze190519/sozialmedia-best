import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  Clapperboard, Film, Camera, Wand2, Copy, Check, Lock, Unlock,
  Zap, DollarSign, Gauge, Sparkles, Plus, Trash2, Download,
  Sun, Mic, Video, ArrowRight
} from "lucide-react";
import { toast } from "sonner";

/**
 * CINEMA STACK DIRECTOR — AI-Regie-Interface für vertikale Spielfilm-Produktion
 *
 * Routet Shots intelligent auf Higgsfield / Veo 3.1 / Sora 2 / Kling 3.0
 * basierend auf Shot-Typ, Budget und gewünschter Qualität.
 */

type ShotType = "hero" | "dialogue" | "action" | "cta" | "transition";
type VideoModel = "higgsfield" | "veo31" | "sora2" | "kling30";
type ExportFormat = "15s-trailer" | "30s-reel" | "60s-shorts";

interface CinemaShot {
  id: string;
  beat: string;
  shotType: ShotType;
  model: VideoModel;
  durationSec: number;
  prompt: string;
  cameraMove?: string;
  seedRefs?: string[];
  locked?: boolean;
}

interface SeedPack {
  characterSeed: string;
  environmentSeed: string;
  lensFamily: string;
  voiceSeed?: string;
}

const SHOT_CONFIG: Record<ShotType, { label: string; emoji: string; desc: string; preferredModel: VideoModel; duration: number }> = {
  hero: { label: "Hero Shot", emoji: "🎬", desc: "Cinematic Opener, Charakter-Fokus", preferredModel: "higgsfield", duration: 5 },
  dialogue: { label: "Dialogue", emoji: "🗣️", desc: "Charakter spricht, Lip-Sync nötig", preferredModel: "sora2", duration: 8 },
  action: { label: "Action Burst", emoji: "💥", desc: "Schnelle Bewegung, Energie", preferredModel: "veo31", duration: 4 },
  cta: { label: "CTA Shot", emoji: "🎯", desc: "Close-up mit Text/Produkt", preferredModel: "kling30", duration: 3 },
  transition: { label: "Transition", emoji: "✨", desc: "Übergang, Effekt, Morph", preferredModel: "higgsfield", duration: 2 },
};

const MODEL_CONFIG: Record<VideoModel, { label: string; strengths: string[]; weaknesses: string[]; costPerSec: number; qualityScore: number; speedScore: number }> = {
  higgsfield: {
    label: "Higgsfield",
    strengths: ["Kamera-Control", "Cinematic Look", "Camera Moves"],
    weaknesses: ["Limitierte Dauer", "Teurer"],
    costPerSec: 0.50,
    qualityScore: 95,
    speedScore: 70,
  },
  veo31: {
    label: "Veo 3.1",
    strengths: ["Physikalisch akkurat", "Action", "8s Clips"],
    weaknesses: ["Gesichter nicht perfekt", "Mittlere Audio"],
    costPerSec: 0.30,
    qualityScore: 88,
    speedScore: 80,
  },
  sora2: {
    label: "Sora 2",
    strengths: ["Lip-Sync", "Dialogue", "Audio+Video"],
    weaknesses: ["Teuer", "Rate-limited"],
    costPerSec: 0.60,
    qualityScore: 92,
    speedScore: 60,
  },
  kling30: {
    label: "Kling 3.0",
    strengths: ["Günstig", "Schnell", "Basis-Qualität"],
    weaknesses: ["Weniger cinematic", "Kamera-Control limitiert"],
    costPerSec: 0.15,
    qualityScore: 78,
    speedScore: 90,
  },
};

const CAMERA_MOVES = [
  "Static Hero Shot",
  "Slow Push-In",
  "Crash Zoom auf Gesicht",
  "Whip Pan seitlich",
  "POV Tracking",
  "Orbit 360°",
  "Crane Down from Sky",
  "Dolly Back Reveal",
  "Handheld Shake",
  "Rack Focus",
];

const LENS_FAMILIES = [
  { id: "cinematic-35mm", label: "Cinematic 35mm", desc: "Spielfilm-Look, shallow depth" },
  { id: "wide-anamorphic", label: "Wide Anamorphic", desc: "Blockbuster, ultra-wide" },
  { id: "portrait-85mm", label: "Portrait 85mm", desc: "Gesichts-Fokus, Bokeh" },
  { id: "iphone-vertical", label: "iPhone Vertical", desc: "Authentisch, handheld-Look" },
  { id: "studio-controlled", label: "Studio Controlled", desc: "Clean, kommerziell" },
];

const EXPORT_PRESETS: Record<ExportFormat, { label: string; totalSec: number; shotCount: number; distribution: ShotType[] }> = {
  "15s-trailer": {
    label: "15s Trailer",
    totalSec: 15,
    shotCount: 4,
    distribution: ["hero", "action", "action", "cta"],
  },
  "30s-reel": {
    label: "30s Reel",
    totalSec: 30,
    shotCount: 6,
    distribution: ["hero", "dialogue", "action", "transition", "dialogue", "cta"],
  },
  "60s-shorts": {
    label: "60s Shorts",
    totalSec: 60,
    shotCount: 10,
    distribution: ["hero", "dialogue", "action", "transition", "dialogue", "action", "transition", "dialogue", "action", "cta"],
  },
};

function buildShotPrompt(shot: CinemaShot, seeds: SeedPack): string {
  const lines = [
    `[BEAT] ${shot.beat}`,
    `[SHOT TYPE] ${SHOT_CONFIG[shot.shotType].label}`,
    `[MODEL] ${MODEL_CONFIG[shot.model].label}`,
    `[DURATION] ${shot.durationSec}s`,
    `[CAMERA] ${shot.cameraMove || "Static"}`,
    `[LENS] ${seeds.lensFamily}`,
    `[CHARACTER SEED] ${seeds.characterSeed || "(not set)"}`,
    `[ENVIRONMENT SEED] ${seeds.environmentSeed || "(not set)"}`,
    ``,
    `[VISUAL PROMPT]`,
    shot.prompt,
    ``,
    `[QUALITY] 8K, photorealistic, cinema-grade lighting, sharp focus, no text overlay`,
  ];
  return lines.join("\n");
}

function buildDefaultShots(format: ExportFormat, theme: string): CinemaShot[] {
  const preset = EXPORT_PRESETS[format];
  const perShotDuration = Math.floor(preset.totalSec / preset.shotCount);

  return preset.distribution.map((shotType, i) => {
    const config = SHOT_CONFIG[shotType];
    return {
      id: `shot-${Date.now()}-${i}`,
      beat: `Beat ${i + 1}: ${theme} — ${config.label}`,
      shotType,
      model: config.preferredModel,
      durationSec: perShotDuration,
      prompt: `${theme}, ${config.desc}, ${config.label.toLowerCase()} style`,
      cameraMove: CAMERA_MOVES[i % CAMERA_MOVES.length],
    };
  });
}

function ScoreBar({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: typeof Gauge }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="font-semibold w-8 text-right">{value}</span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 px-2"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Kopiert");
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

export default function CinemaStackDirectorPage() {
  const [theme, setTheme] = useState("");
  const [format, setFormat] = useState<ExportFormat>("30s-reel");
  const [shots, setShots] = useState<CinemaShot[]>([]);
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);

  const [seeds, setSeeds] = useState<SeedPack>({
    characterSeed: "Nova Lenz — cinematic female protagonist, platinum-dark-blonde hair, matte black jacket with gold luminous seams, confident eyes",
    environmentSeed: "futuristic reflective corridor, neon accents, minimalist sci-fi architecture",
    lensFamily: "cinematic-35mm",
    voiceSeed: "calm, precise, slightly ironic",
  });

  const generateShotPlan = () => {
    if (!theme.trim()) {
      toast.error("Beat-Thema eingeben");
      return;
    }
    const newShots = buildDefaultShots(format, theme);
    setShots(newShots);
    setSelectedShotId(newShots[0].id);
    toast.success(`${newShots.length} Shots vorgeschlagen`);
  };

  const updateShot = (id: string, patch: Partial<CinemaShot>) => {
    setShots(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  const deleteShot = (id: string) => {
    setShots(prev => prev.filter(s => s.id !== id));
    if (selectedShotId === id) setSelectedShotId(null);
  };

  const addShot = () => {
    const newShot: CinemaShot = {
      id: `shot-${Date.now()}`,
      beat: `Neuer Shot`,
      shotType: "hero",
      model: "higgsfield",
      durationSec: 5,
      prompt: "",
      cameraMove: "Static Hero Shot",
    };
    setShots(prev => [...prev, newShot]);
    setSelectedShotId(newShot.id);
  };

  const toggleLock = (id: string) => {
    setShots(prev => prev.map(s => s.id === id ? { ...s, locked: !s.locked } : s));
  };

  const selected = shots.find(s => s.id === selectedShotId);

  const totals = {
    duration: shots.reduce((a, s) => a + s.durationSec, 0),
    cost: shots.reduce((a, s) => a + (s.durationSec * MODEL_CONFIG[s.model].costPerSec), 0),
    quality: shots.length ? shots.reduce((a, s) => a + MODEL_CONFIG[s.model].qualityScore, 0) / shots.length : 0,
    consistency: shots.length >= 3 ? Math.min(100, 60 + (seeds.characterSeed ? 20 : 0) + (seeds.environmentSeed ? 20 : 0)) : 0,
  };

  const exportPromptPack = () => {
    if (shots.length === 0) return;
    const text = [
      `# CINEMA STACK PROMPT PACK`,
      `Format: ${EXPORT_PRESETS[format].label} · Gesamt: ${totals.duration}s · Kosten: ~${totals.cost.toFixed(2)}€`,
      ``,
      `## SEED PACK`,
      `Character: ${seeds.characterSeed}`,
      `Environment: ${seeds.environmentSeed}`,
      `Lens: ${seeds.lensFamily}`,
      `Voice: ${seeds.voiceSeed || "(not set)"}`,
      ``,
      `## SHOT LIST`,
      ...shots.flatMap((s, i) => [
        `### Shot ${i + 1}: ${s.beat}`,
        buildShotPrompt(s, seeds),
        ``,
      ]),
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Prompt-Pack kopiert");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gold-text" style={{ fontFamily: "var(--font-heading)" }}>
          Cinema Stack Director
        </h1>
        <p className="text-sm text-muted-foreground">
          AI-Regie für vertikale Spielfilm-Qualität. Routet Shots auf Higgsfield, Veo 3.1, Sora 2 oder Kling 3.0.
        </p>
      </div>

      {/* Seed Pack */}
      <Card className="border-primary/30">
        <CardContent className="p-4 space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Seed Pack (Konsistenz über alle Shots)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-semibold text-muted-foreground">Character Seed</label>
              <Textarea
                value={seeds.characterSeed}
                onChange={(e) => setSeeds({ ...seeds, characterSeed: e.target.value })}
                rows={2}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-semibold text-muted-foreground">Environment Seed</label>
              <Textarea
                value={seeds.environmentSeed}
                onChange={(e) => setSeeds({ ...seeds, environmentSeed: e.target.value })}
                rows={2}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-semibold text-muted-foreground">Lens Family</label>
              <div className="flex gap-1 flex-wrap mt-1">
                {LENS_FAMILIES.map(l => (
                  <Button
                    key={l.id}
                    size="sm"
                    variant={seeds.lensFamily === l.id ? "default" : "outline"}
                    className={`text-[10px] h-7 ${seeds.lensFamily === l.id ? "btn-gold" : ""}`}
                    onClick={() => setSeeds({ ...seeds, lensFamily: l.id })}
                  >
                    {l.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-semibold text-muted-foreground">Voice Seed</label>
              <Input
                value={seeds.voiceSeed || ""}
                onChange={(e) => setSeeds({ ...seeds, voiceSeed: e.target.value })}
                placeholder="z.B. calm, precise, slightly ironic"
                className="text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Format & Theme */}
      <Card className="border-primary/30">
        <CardContent className="p-4 space-y-3">
          <h2 className="text-sm font-semibold">Format & Beat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Export-Format</label>
              <div className="flex gap-1 flex-wrap">
                {(Object.keys(EXPORT_PRESETS) as ExportFormat[]).map(f => (
                  <Button
                    key={f}
                    size="sm"
                    variant={format === f ? "default" : "outline"}
                    className={`text-xs ${format === f ? "btn-gold" : ""}`}
                    onClick={() => setFormat(f)}
                  >
                    {EXPORT_PRESETS[f].label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Beat / Story</label>
              <Input
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="z.B. Nova entdeckt den Nebenraum"
              />
            </div>
          </div>
          <Button className="btn-gold w-full" onClick={generateShotPlan} disabled={!theme.trim()}>
            <Clapperboard className="h-4 w-4 mr-1" /> Shot-Plan generieren
          </Button>
        </CardContent>
      </Card>

      {/* Totals */}
      {shots.length > 0 && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-semibold">{shots.length} Shots · {totals.duration}s</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={addShot}>
                  <Plus className="h-3 w-3 mr-1" /> Shot
                </Button>
                <Button size="sm" onClick={exportPromptPack} className="btn-gold">
                  <Download className="h-3 w-3 mr-1" /> Prompt-Pack
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              <ScoreBar label="Konsistenz" value={Math.round(totals.consistency)} color="bg-primary" icon={Sparkles} />
              <ScoreBar label="Qualität" value={Math.round(totals.quality)} color="bg-amber-400" icon={Gauge} />
              <ScoreBar label="Kosten" value={Math.min(100, Math.round(totals.cost * 10))} color="bg-red-400" icon={DollarSign} />
              <ScoreBar label="Speed" value={shots.length ? Math.round(shots.reduce((a, s) => a + MODEL_CONFIG[s.model].speedScore, 0) / shots.length) : 0} color="bg-blue-400" icon={Zap} />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Geschätzte Kosten: ~{totals.cost.toFixed(2)}€ · Rechenzeit: ~{Math.ceil(totals.duration * 0.8)} Min
            </p>
          </CardContent>
        </Card>
      )}

      {/* Shots Grid */}
      {shots.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-2">
            <h3 className="text-xs uppercase font-semibold text-muted-foreground">Shot-Liste</h3>
            {shots.map((shot, i) => {
              const config = SHOT_CONFIG[shot.shotType];
              const model = MODEL_CONFIG[shot.model];
              return (
                <motion.div key={shot.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} layout>
                  <Card
                    className={`cursor-pointer transition-all ${
                      selectedShotId === shot.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
                    } ${shot.locked ? "ring-1 ring-amber-500/30" : ""}`}
                    onClick={() => setSelectedShotId(shot.id)}
                  >
                    <CardContent className="p-3 flex items-start gap-3">
                      <span className="text-primary font-bold text-xs w-6 shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap mb-1">
                          <Badge variant="outline" className="text-[9px]">
                            {config.emoji} {config.label}
                          </Badge>
                          <Badge variant="outline" className="text-[9px]">{model.label}</Badge>
                          <Badge variant="outline" className="text-[9px]">{shot.durationSec}s</Badge>
                          <Badge variant="outline" className="text-[9px]">{shot.cameraMove}</Badge>
                        </div>
                        <p className="text-xs font-medium line-clamp-1">{shot.beat}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{shot.prompt}</p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); toggleLock(shot.id); }}>
                          {shot.locked ? <Lock className="h-3 w-3 text-amber-400" /> : <Unlock className="h-3 w-3" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); deleteShot(shot.id); }}>
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Detail Panel */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            {selected ? (
              <Card className="border-primary/30">
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold">Shot-Details</h3>
                  <div>
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground">Beat</label>
                    <Input
                      value={selected.beat}
                      onChange={(e) => updateShot(selected.id, { beat: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground">Shot-Typ</label>
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      {(Object.keys(SHOT_CONFIG) as ShotType[]).map(t => (
                        <Button
                          key={t}
                          size="sm"
                          variant={selected.shotType === t ? "default" : "outline"}
                          className={`text-[10px] h-7 ${selected.shotType === t ? "btn-gold" : ""}`}
                          onClick={() => updateShot(selected.id, { shotType: t, model: SHOT_CONFIG[t].preferredModel, durationSec: SHOT_CONFIG[t].duration })}
                        >
                          {SHOT_CONFIG[t].emoji} {SHOT_CONFIG[t].label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground">Video-Modell</label>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {(Object.keys(MODEL_CONFIG) as VideoModel[]).map(m => (
                        <Button
                          key={m}
                          size="sm"
                          variant={selected.model === m ? "default" : "outline"}
                          className={`text-[10px] h-7 ${selected.model === m ? "btn-gold" : ""}`}
                          onClick={() => updateShot(selected.id, { model: m })}
                        >
                          {MODEL_CONFIG[m].label}
                        </Button>
                      ))}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                      <div>✓ {MODEL_CONFIG[selected.model].strengths.join(", ")}</div>
                      <div>⚠ {MODEL_CONFIG[selected.model].weaknesses.join(", ")}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[9px]">
                          <DollarSign className="h-2 w-2 mr-0.5" /> {MODEL_CONFIG[selected.model].costPerSec}€/s
                        </Badge>
                        <Badge variant="outline" className="text-[9px]">
                          <Gauge className="h-2 w-2 mr-0.5" /> Q{MODEL_CONFIG[selected.model].qualityScore}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground">Camera-Move</label>
                    <select
                      value={selected.cameraMove || ""}
                      onChange={(e) => updateShot(selected.id, { cameraMove: e.target.value })}
                      className="w-full text-xs p-2 rounded border border-border bg-background"
                    >
                      {CAMERA_MOVES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground">Dauer: {selected.durationSec}s</label>
                    <Input
                      type="number"
                      value={selected.durationSec}
                      onChange={(e) => updateShot(selected.id, { durationSec: parseInt(e.target.value) || 5 })}
                      min={1}
                      max={15}
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground">Visual Prompt</label>
                    <Textarea
                      value={selected.prompt}
                      onChange={(e) => updateShot(selected.id, { prompt: e.target.value })}
                      rows={4}
                      className="text-xs"
                    />
                  </div>

                  <div className="pt-2 border-t border-border/50 space-y-1">
                    <div className="bg-background/50 border border-border/50 rounded p-2 max-h-40 overflow-y-auto">
                      <pre className="text-[9px] whitespace-pre-wrap font-mono">
                        {buildShotPrompt(selected, seeds)}
                      </pre>
                    </div>
                    <CopyButton text={buildShotPrompt(selected, seeds)} />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-border/50">
                <CardContent className="p-6 text-center space-y-2">
                  <Camera className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-xs text-muted-foreground">Wähle einen Shot für Details.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Optional an Manus:</p>
          <p className="text-muted-foreground">
            Direktes Auslösen der Video-Generation braucht API-Integrationen: Higgsfield, Sora 2, Veo 3.1, Kling 3.0. Aktuell: Prompt-Pack-Export zum manuellen Ausführen. Neue Endpoints (Spec in V2): <code>cinemaDirector.routeShot</code>, <code>cinemaDirector.buildPromptPack</code>, <code>cinemaDirector.scoreCostQuality</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
