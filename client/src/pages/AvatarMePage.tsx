import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Upload, Video, Loader2, Play, Download, Sparkles, UserCircle, Check } from "lucide-react";
import { toast } from "sonner";

/**
 * AVATAR-ME — Dein eigener KI-Zwilling
 *
 * Partner scannt Gesicht → 3D-KI-Avatar mit seinem Gesicht.
 * Avatar kann: am Strand liegen, Rede halten, Auto fahren, tanzen, etc.
 * Unendlich Content ohne selbst filmen zu müssen.
 *
 * Prinzip: Wie Lina Avatar (HeyGen), aber mit DEINEM Gesicht.
 *
 * BACKEND-API (Manus bitte einbinden):
 * - POST /api/avatar-me/create { photo } → { avatarId } (1x pro Partner)
 * - POST /api/avatar-me/generate { avatarId, scene, script } → { videoUrl }
 */

const AVATAR_SCENES = [
  { id: "speaking", emoji: "🎤", label: "Rede halten", desc: "Motivational Speaker Mode", duration: "30s" },
  { id: "strand", emoji: "🏖️", label: "Am Strand", desc: "Entspannt auf Liege", duration: "15s" },
  { id: "driving", emoji: "🚗", label: "Im Auto", desc: "Sportwagen-Fahrt", duration: "10s" },
  { id: "office", emoji: "💻", label: "Am Laptop", desc: "Home Office mit Traumblick", duration: "15s" },
  { id: "gym", emoji: "💪", label: "Im Gym", desc: "Workout-Modus", duration: "15s" },
  { id: "celebration", emoji: "🎉", label: "Erfolgs-Feier", desc: "Nach großem Durchbruch", duration: "10s" },
  { id: "teaching", emoji: "📚", label: "Coach-Modus", desc: "Erklärt am Whiteboard", duration: "30s" },
  { id: "mallorca", emoji: "🌴", label: "Mallorca-Vibes", desc: "Pool, Palmen, Champagner", duration: "15s" },
  { id: "stage", emoji: "🌟", label: "Auf der Bühne", desc: "Vor tausenden Menschen", duration: "15s" },
  { id: "family", emoji: "👨‍👩‍👧", label: "Mit Familie", desc: "Warmer Familien-Moment", duration: "15s" },
];

const SCRIPT_TEMPLATES = [
  { id: "intro", label: "Vorstellung", text: "Hey, ich bin {name}. Und vor 12 Monaten dachte ich, ich wäre für immer im Hamsterrad gefangen. Heute arbeite ich wann und wo ich will. Willst du wissen wie?" },
  { id: "cta", label: "Call-to-Action", text: "Wenn du auch Freiheit willst, finanziell und zeitlich, schreib mir eine DM. Ich zeige dir genau wie es bei mir funktioniert hat. Kein Verkauf, nur ein Gespräch." },
  { id: "story", label: "Mini-Story", text: "Heute vor einem Jahr war ich noch total unsicher. Ich hatte Angst vor Social Media, vor Ablehnung, vor allem. Aber dann hab ich einfach angefangen. Und es hat sich alles verändert." },
  { id: "motivation", label: "Motivation", text: "Der Unterschied zwischen Erfolg und Scheitern? Konsequenz. Jeden Tag 1% besser. Nicht 100% perfekt. 1% besser. Das ist der Hack." },
];

type Step = "upload" | "processing" | "ready" | "generating";

export default function AvatarMePage() {
  const [step, setStep] = useState<Step>("upload");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [hasAvatar, setHasAvatar] = useState(false);
  const [selectedScene, setSelectedScene] = useState<string>("");
  const [script, setScript] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const createAvatar = async () => {
    if (!photoFile) return;
    setStep("processing");
    try {
      // TODO MANUS: POST /api/avatar-me/create { photo } → 60-180s Processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      setHasAvatar(true);
      setStep("ready");
      toast.success("Dein Avatar ist fertig! Jetzt Videos generieren.");
    } catch {
      toast.error("Avatar-Erstellung fehlgeschlagen");
      setStep("upload");
    }
  };

  const generateVideo = async () => {
    if (!selectedScene || !script.trim()) {
      toast.error("Szene + Text wählen");
      return;
    }
    setStep("generating");
    try {
      // TODO MANUS: POST /api/avatar-me/generate { avatarId, scene, script }
      await new Promise(resolve => setTimeout(resolve, 2500));
      setVideoUrl("https://placehold.co/720x1280/1a1a1a/d4af37?text=Avatar+Video+Preview");
      setStep("ready");
      toast.success("Avatar-Video fertig!");
    } catch {
      toast.error("Video-Generierung fehlgeschlagen");
      setStep("ready");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>
          Avatar-Me — Dein KI-Zwilling
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Erstell einmal deinen KI-Avatar → generiere unendlich Videos mit deinem Gesicht. Am Strand, im Auto, auf der Bühne. Ohne Kamera, ohne Make-up, ohne Zeit.
        </p>
      </div>

      {/* Step 1: Avatar erstellen */}
      {!hasAvatar && (
        <Card className="border-primary/30">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">1</span>
              Avatar erstellen (einmalig)
            </h2>

            <div className="flex items-center gap-4 flex-wrap">
              {photoPreview ? (
                <img src={photoPreview} alt="" className="h-32 w-32 rounded-xl object-cover border-2 border-primary/30" />
              ) : (
                <div className="h-32 w-32 rounded-xl border-2 border-dashed border-border flex items-center justify-center">
                  <UserCircle className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-[200px]">
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  <Button asChild variant="outline">
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {photoFile ? "Anderes Foto" : "Gesicht-Selfie hochladen"}
                    </span>
                  </Button>
                </label>
                <ul className="text-xs text-muted-foreground mt-3 space-y-1">
                  <li>✓ Frontal aufgenommen, gut beleuchtet</li>
                  <li>✓ Hoher Kontrast, keine Sonnenbrille</li>
                  <li>✓ Am besten vor neutralem Hintergrund</li>
                </ul>
              </div>
            </div>

            <Button
              className="btn-gold w-full"
              onClick={createAvatar}
              disabled={!photoFile || step === "processing"}
            >
              {step === "processing" ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Avatar wird trainiert (2-3 Min)</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Avatar erstellen</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {hasAvatar && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            {photoPreview && <img src={photoPreview} className="h-12 w-12 rounded-full object-cover border-2 border-emerald-500/50" />}
            <div className="flex-1">
              <p className="text-sm font-semibold">Dein Avatar ist bereit</p>
              <p className="text-xs text-muted-foreground">Du kannst jetzt unendlich Videos generieren.</p>
            </div>
            <Badge variant="outline" className="gap-1 border-emerald-500/50 text-emerald-400">
              <Check className="h-3 w-3" /> Aktiv
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Video generieren */}
      {hasAvatar && (
        <>
          <Card className="border-primary/30">
            <CardContent className="p-5">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">2</span>
                Szene wählen
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {AVATAR_SCENES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedScene(s.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      selectedScene === s.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{s.emoji}</div>
                    <div className="text-xs font-semibold">{s.label}</div>
                    <div className="text-[10px] text-muted-foreground">{s.desc}</div>
                    <Badge variant="outline" className="text-[9px] mt-1">{s.duration}</Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardContent className="p-5 space-y-3">
              <h2 className="font-semibold flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">3</span>
                Was soll dein Avatar sagen?
              </h2>
              <Textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Schreib den Text den dein Avatar spricht..."
                rows={4}
              />
              <div className="flex gap-2 flex-wrap">
                {SCRIPT_TEMPLATES.map(t => (
                  <Button
                    key={t.id}
                    size="sm"
                    variant="outline"
                    onClick={() => setScript(t.text)}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              size="lg"
              className="btn-gold h-14 px-10"
              onClick={generateVideo}
              disabled={step === "generating" || !selectedScene || !script.trim()}
            >
              {step === "generating" ? (
                <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Generiert... (2-5 Min)</>
              ) : (
                <><Video className="h-5 w-5 mr-2" /> Avatar-Video erstellen</>
              )}
            </Button>
          </div>

          {videoUrl && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden">
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
        </>
      )}

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Hinweis an Manus:</p>
          <p className="text-muted-foreground">
            Backend: HeyGen Avatar IV + Custom Face Training oder Sora 2 mit Face-Reference. Avatar-ID pro User speichern (DB: users.avatarId). Lina-Avatar-Integration existiert bereits → dieses System erweitert sie für alle Partner.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
