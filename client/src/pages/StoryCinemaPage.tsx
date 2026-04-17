import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Film, Play, Loader2, Plus, Trash2, Wand2, Volume2, Music, Download } from "lucide-react";
import { toast } from "sonner";

/**
 * KI-STORY-KINO — 30-60s Mini-Filme aus einer Idee
 *
 * Partner gibt Thema → System generiert:
 * - 3-6 Szenen (KI-Video pro Szene via Kling/Veo)
 * - Voiceover (ElevenLabs oder OpenAI TTS)
 * - Hintergrund-Musik (Suno AI)
 * - Animierte Untertitel
 * - Automatisch zusammengefügt zu fertigem Video
 *
 * BACKEND-API (Manus bitte einbinden):
 * - POST /api/story-cinema/generate { theme, scenes[], voice, music }
 *   → { videoUrl, scenes[], duration }
 */

const STORY_TEMPLATES = [
  {
    id: "wake-up",
    name: "Traum-Morgen",
    desc: "Perfekter Tag als LR-Partner",
    scenes: [
      "Aufwachen in einem luxuriösen Schlafzimmer, goldenes Morgenlicht strömt durch große Fenster",
      "Kaffee und LR-Shake auf einer eleganten Marmor-Küchenzeile, Garten im Hintergrund",
      "Am Laptop auf einer Terrasse mit Meerblick, entspannt lächelnd",
      "Spaziergang am Strand mit Familie, goldene Stunde",
      "Autoschlüssel hochhalten, sportliches Cabrio im Hintergrund",
    ],
    voiceover: "Das ist mein Leben. Nicht vor 5 Jahren — jetzt. Dank LR habe ich die Freiheit die ich mir immer gewünscht habe. Du willst das auch? Schreib mir.",
  },
  {
    id: "transformation",
    name: "Vorher → Nachher",
    desc: "Business-Transformation",
    scenes: [
      "Gestresste Person im Büro, graue Atmosphäre, Uhr zeigt 18:30",
      "Dieselbe Person im Stau, frustriert am Steuer",
      "Übergang: Kalender wird durchgeblättert, Monate vergehen",
      "Dieselbe Person entspannt mit Laptop am Strand",
      "Umarmung mit Familie, echtes Lächeln, glücklich",
    ],
    voiceover: "Vor 12 Monaten war ich genau wie du. Gefangen im Hamsterrad. Dann habe ich etwas geändert. Heute arbeite ich wann und wo ich will. Willst du wissen wie? Kommentiere FREIHEIT.",
  },
  {
    id: "dream-car",
    name: "Auto-Übergabe Moment",
    desc: "Der Moment der Auto-Bonus",
    scenes: [
      "Schlüssel werden feierlich übergeben, Dealership-Setting",
      "Person starrt mit glasigen Augen auf neues Auto",
      "Familie schreit vor Freude, Handyvideos werden gemacht",
      "Testfahrt mit großem Grinsen, offenes Dach",
      "Parkplatz vor dem eigenen Haus, Auto steht stolz",
    ],
    voiceover: "Heute ist der Tag. Was vor einem Jahr ein Traum war, ist jetzt Realität. Danke LR. Danke an mein Team. Und an jeden der daran geglaubt hat.",
  },
  {
    id: "custom",
    name: "Eigene Story",
    desc: "Du schreibst selbst",
    scenes: [],
    voiceover: "",
  },
];

const VOICES = [
  { id: "male-energetic", label: "Männlich, energetisch", sample: "🗣️" },
  { id: "female-warm", label: "Weiblich, warm", sample: "💫" },
  { id: "male-professional", label: "Männlich, professionell", sample: "🎙️" },
  { id: "female-confident", label: "Weiblich, selbstbewusst", sample: "✨" },
];

const MUSIC_STYLES = [
  { id: "epic", label: "Epic Cinematic", desc: "Hans-Zimmer-Stil" },
  { id: "uplifting", label: "Uplifting Pop", desc: "Motivational" },
  { id: "chill-beats", label: "Chill Beats", desc: "Lo-Fi Vibes" },
  { id: "dramatic", label: "Dramatic Piano", desc: "Emotional" },
  { id: "none", label: "Keine Musik", desc: "Nur Voice" },
];

export default function StoryCinemaPage() {
  const [template, setTemplate] = useState<string>("wake-up");
  const [customTheme, setCustomTheme] = useState("");
  const [scenes, setScenes] = useState<string[]>(STORY_TEMPLATES[0].scenes);
  const [voiceover, setVoiceover] = useState<string>(STORY_TEMPLATES[0].voiceover);
  const [voice, setVoice] = useState("female-warm");
  const [music, setMusic] = useState("uplifting");
  const [rendering, setRendering] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const selectTemplate = (id: string) => {
    setTemplate(id);
    const t = STORY_TEMPLATES.find(x => x.id === id);
    if (t && id !== "custom") {
      setScenes(t.scenes);
      setVoiceover(t.voiceover);
    }
    if (id === "custom") {
      setScenes([""]);
      setVoiceover("");
    }
  };

  const updateScene = (i: number, value: string) => {
    setScenes(prev => prev.map((s, idx) => idx === i ? value : s));
  };

  const addScene = () => {
    if (scenes.length < 6) setScenes([...scenes, ""]);
  };

  const removeScene = (i: number) => {
    setScenes(scenes.filter((_, idx) => idx !== i));
  };

  const render = async () => {
    if (scenes.filter(s => s.trim()).length < 2) {
      toast.error("Mindestens 2 Szenen nötig");
      return;
    }
    setRendering(true);
    try {
      // TODO MANUS: Backend anbinden
      // POST /api/story-cinema/generate { scenes, voiceover, voice, music }
      await new Promise(resolve => setTimeout(resolve, 3000));
      setVideoUrl("https://placehold.co/720x1280/1a1a1a/d4af37?text=Story+Video+Preview");
      toast.success("Mini-Film fertig! Dauer: ~45s");
    } catch {
      toast.error("Render fehlgeschlagen");
    } finally {
      setRendering(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>
          KI-Story-Kino
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          30-60s Mini-Filme auf Knopfdruck. Szenen + Voiceover + Musik = fertiger Werbespot. Perfekt für Reels, TikTok, Shorts.
        </p>
      </div>

      {/* Templates */}
      <Card className="border-primary/30">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-3">Story-Vorlage wählen</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STORY_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => selectTemplate(t.id)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  template === t.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <Film className="h-5 w-5 text-primary mb-2" />
                <div className="text-xs font-semibold">{t.name}</div>
                <div className="text-[10px] text-muted-foreground">{t.desc}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom theme */}
      {template === "custom" && (
        <Card className="border-primary/30">
          <CardContent className="p-5 space-y-3">
            <h2 className="font-semibold">Eigene Story</h2>
            <Input
              placeholder="Hauptthema (z.B. Mein Business-Durchbruch)"
              value={customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
            />
          </CardContent>
        </Card>
      )}

      {/* Scenes */}
      <Card className="border-primary/30">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Szenen ({scenes.length}/6)</h2>
            {scenes.length < 6 && (
              <Button size="sm" variant="outline" onClick={addScene}>
                <Plus className="h-3 w-3 mr-1" /> Szene
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {scenes.map((s, i) => (
              <div key={i} className="flex gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <Textarea
                  value={s}
                  onChange={(e) => updateScene(i, e.target.value)}
                  placeholder="Beschreibe die Szene (z.B. 'Sonnenaufgang über Mallorca, Person auf Yoga-Matte am Strand')"
                  rows={2}
                  className="flex-1"
                />
                {scenes.length > 2 && (
                  <Button size="sm" variant="ghost" onClick={() => removeScene(i)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voiceover */}
      <Card className="border-primary/30">
        <CardContent className="p-5 space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Voiceover-Text
          </h2>
          <Textarea
            value={voiceover}
            onChange={(e) => setVoiceover(e.target.value)}
            placeholder="Was soll gesprochen werden? (15-30 Wörter ideal für 45s Video)"
            rows={3}
          />
          <div>
            <p className="text-xs font-semibold mb-2">Stimme</p>
            <div className="flex gap-2 flex-wrap">
              {VOICES.map(v => (
                <Button
                  key={v.id}
                  variant={voice === v.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVoice(v.id)}
                  className={voice === v.id ? "btn-gold" : ""}
                >
                  <span className="mr-1">{v.sample}</span>
                  {v.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Music */}
      <Card className="border-primary/30">
        <CardContent className="p-5 space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Music className="h-4 w-4" />
            Hintergrund-Musik
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {MUSIC_STYLES.map(m => (
              <button
                key={m.id}
                onClick={() => setMusic(m.id)}
                className={`p-2 rounded-lg border-2 transition-all text-left ${
                  music === m.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-xs font-semibold">{m.label}</div>
                <div className="text-[10px] text-muted-foreground">{m.desc}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Render */}
      <div className="flex justify-center">
        <Button
          size="lg"
          className="btn-gold h-14 px-10"
          onClick={render}
          disabled={rendering}
        >
          {rendering ? (
            <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Rendert... (2-4 Min)</>
          ) : (
            <><Wand2 className="h-5 w-5 mr-2" /> Mini-Film erstellen</>
          )}
        </Button>
      </div>

      {/* Result */}
      {videoUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="overflow-hidden border-primary/30">
            <div className="aspect-[9/16] max-h-[500px] mx-auto bg-black flex items-center justify-center relative">
              <img src={videoUrl} alt="" className="h-full object-contain" />
              <Button size="lg" className="absolute btn-gold">
                <Play className="h-6 w-6 mr-2" /> Abspielen
              </Button>
            </div>
            <CardContent className="p-4 flex gap-2">
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
              <Button className="btn-gold flex-1">
                Zur Freigabe
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Hinweis an Manus:</p>
          <p className="text-muted-foreground">
            Backend-Integration: Kling 3.0 / Veo 3.1 für Szenen (pro Szene 1 Call mit 5-8s Clip) → ElevenLabs für Voiceover → Suno AI für Musik → FFmpeg-Server zum Zusammenfügen mit animierten Untertiteln. Rendering async, Status via Polling oder Websocket.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
