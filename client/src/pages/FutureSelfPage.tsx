import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Sparkles, Download, Copy, Check, Loader2, ImageIcon, Wand2 } from "lucide-react";
import { toast } from "sonner";

/**
 * ZUKUNFTS-KI — "Du in 5 Jahren mit LR"
 *
 * Partner lädt Selfie hoch → KI generiert 10 Bilder:
 * - Du am Strand
 * - Du im Traumauto
 * - Du auf der Bühne
 * - Du mit deinem Team
 * - Du mit deiner Familie
 * - etc.
 *
 * Emotional extrem stark. Höchste Teilquote. Niemand macht das im Network Marketing.
 *
 * BACKEND-API (Manus bitte einbinden):
 * - POST /api/future-self/generate
 *   Input: { userPhotoUrl: string, scenario: string, style: string }
 *   Output: { imageUrl: string, prompt: string }
 *
 * ALTERNATIVE (client-only): Nutze bestehende media.generateImage Mutation
 * mit einem strukturierten Prompt + userPhotoUrl als Referenz.
 */

const SCENARIOS = [
  { id: "beach", emoji: "🏖️", label: "Am Strand", desc: "Du entspannt am Strand mit Laptop, Mallorca-Vibes", prompt: "Portrait of person relaxing at a beautiful beach in Mallorca, laptop open next to them, turquoise water, luxury lifestyle, cinematic lighting, golden hour, photorealistic" },
  { id: "dream-car", emoji: "🚗", label: "Im Traumauto", desc: "Du stolz vor deinem neuen Auto", prompt: "Portrait of person standing confidently next to their luxury dream car (BMW M4 or Mercedes AMG), sunny day, modern driveway, professional photography, photorealistic" },
  { id: "stage", emoji: "🎤", label: "Auf der Bühne", desc: "Du hältst Rede vor großer Menge", prompt: "Portrait of person speaking on a big stage in front of a cheering audience, spotlight, professional suit, confident pose, motivational conference setting, cinematic" },
  { id: "family", emoji: "👨‍👩‍👧", label: "Mit Familie", desc: "Qualitätszeit mit den Liebsten", prompt: "Portrait of person happily spending quality time with family, home setting, warm lighting, genuine smiles, emotional moment, photorealistic" },
  { id: "travel", emoji: "✈️", label: "Auf Weltreise", desc: "Du unterwegs an exotischem Ort", prompt: "Portrait of person traveling the world, scenic exotic location (Bali, Dubai, Paris), professional photography, vibrant colors, adventure vibe, photorealistic" },
  { id: "office", emoji: "💻", label: "Ortsunabhängig arbeiten", desc: "Dein Laptop-Office mit Traumblick", prompt: "Portrait of person working on laptop with stunning view (beach, mountains, or rooftop), modern setup, coffee, aesthetic, digital nomad lifestyle, photorealistic" },
  { id: "team", emoji: "👥", label: "Mit deinem Team", desc: "Dein erfolgreiches LR-Team", prompt: "Portrait of person surrounded by a successful team, group photo, professional setting, smiles, trophy or success moment, photorealistic" },
  { id: "luxury", emoji: "🏝️", label: "Luxus-Lifestyle", desc: "Yacht, Villa, Private Jet", prompt: "Portrait of person enjoying luxury lifestyle (yacht, private villa, or private jet), ultra premium, sunny weather, aspirational, cinematic composition, photorealistic" },
  { id: "mentor", emoji: "🎓", label: "Als Mentor", desc: "Du coachst andere", prompt: "Portrait of person as a mentor coaching others, teaching setting, whiteboard or presentation, authoritative yet approachable, professional, photorealistic" },
  { id: "reveal", emoji: "🔑", label: "Auto-Bonus Moment", desc: "Der Moment der Auto-Übergabe", prompt: "Portrait of person receiving the keys to a new luxury car, emotional reveal moment, celebration, tears of joy, dealership or staged reveal, photorealistic" },
];

const STYLES = [
  { id: "photorealistic", label: "Fotorealistisch", desc: "Wie ein echtes Foto" },
  { id: "cinematic", label: "Cinematisch", desc: "Wie aus einem Film" },
  { id: "editorial", label: "Editorial", desc: "Magazin-Stil" },
  { id: "premium", label: "Premium-Werbung", desc: "Wie Apple/Mercedes" },
];

interface GeneratedImage {
  scenarioId: string;
  scenarioLabel: string;
  imageUrl: string;
  prompt: string;
}

export default function FutureSelfPage() {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>("photorealistic");
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Foto zu groß (max 10 MB)");
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleScenario = (id: string) => {
    setSelectedScenarios(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id].slice(0, 10)
    );
  };

  const runGeneration = useCallback(async () => {
    if (!photoFile) {
      toast.error("Bitte zuerst ein Foto hochladen");
      return;
    }
    if (selectedScenarios.length === 0) {
      toast.error("Mindestens 1 Szenario wählen");
      return;
    }

    setGenerating(true);
    setGeneratedImages([]);

    try {
      // TODO MANUS: Hier Backend-API anbinden
      // Beispiel-Request:
      // const formData = new FormData();
      // formData.append("photo", photoFile);
      // formData.append("scenarios", JSON.stringify(selectedScenarios));
      // formData.append("style", selectedStyle);
      // const res = await fetch("/api/future-self/generate", { method: "POST", body: formData });

      // PLACEHOLDER: Simuliert Generation mit Scenario-Prompts + Selfie-Preview
      for (const scenarioId of selectedScenarios) {
        const scenario = SCENARIOS.find(s => s.id === scenarioId);
        if (!scenario) continue;

        // Simuliere Delay für realistisches Feeling
        await new Promise(resolve => setTimeout(resolve, 800));

        setGeneratedImages(prev => [...prev, {
          scenarioId: scenario.id,
          scenarioLabel: scenario.label,
          imageUrl: photoPreview!, // In Produktion: echtes KI-Bild von Manus-Backend
          prompt: `${scenario.prompt}, style: ${selectedStyle}`,
        }]);
      }

      toast.success(`${selectedScenarios.length} Zukunfts-Bilder erstellt!`);
    } catch {
      toast.error("Generierung fehlgeschlagen");
    } finally {
      setGenerating(false);
    }
  }, [photoFile, photoPreview, selectedScenarios, selectedStyle]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>
          Zukunfts-KI — Du in 5 Jahren
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lade dein Selfie hoch → KI zeigt dir dein Leben als erfolgreicher LR-Partner. Strand, Auto, Team, Freiheit. Maximaler emotionaler Impact für deine Stories.
        </p>
      </div>

      {/* Step 1: Upload */}
      <Card className="border-primary/30">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">1</span>
            Foto hochladen
          </h2>
          <div className="flex items-center gap-4 flex-wrap">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="h-24 w-24 rounded-xl object-cover border-2 border-primary/30" />
            ) : (
              <div className="h-24 w-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <Button asChild variant="outline" className="gap-2">
                  <span>
                    <Upload className="h-4 w-4" />
                    {photoFile ? "Anderes Foto" : "Selfie hochladen"}
                  </span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-2">Frontal, guter Licht, max 10 MB. Dein Gesicht wird in jede Szene eingebaut.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Scenarios */}
      <Card className="border-primary/30">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">2</span>
            Szenarien wählen <span className="text-xs font-normal text-muted-foreground">(max 10)</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => toggleScenario(s.id)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  selectedScenarios.includes(s.id)
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-3xl mb-1">{s.emoji}</div>
                <div className="text-xs font-semibold">{s.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Style */}
      <Card className="border-primary/30">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">3</span>
            Stil wählen
          </h2>
          <div className="flex gap-2 flex-wrap">
            {STYLES.map(s => (
              <Button
                key={s.id}
                variant={selectedStyle === s.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStyle(s.id)}
                className={selectedStyle === s.id ? "btn-gold" : ""}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action */}
      <div className="flex justify-center">
        <Button
          size="lg"
          className="btn-gold h-14 px-10 text-base font-semibold shadow-xl"
          onClick={runGeneration}
          disabled={generating || !photoFile || selectedScenarios.length === 0}
        >
          {generating ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              KI arbeitet... ({generatedImages.length}/{selectedScenarios.length})
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Zukunft zeigen ({selectedScenarios.length} Bilder)
            </span>
          )}
        </Button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {generatedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-semibold">Deine Zukunft</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {generatedImages.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="overflow-hidden border-primary/30">
                    <img src={img.imageUrl} alt={img.scenarioLabel} className="aspect-square w-full object-cover" />
                    <CardContent className="p-2 space-y-1">
                      <p className="text-xs font-semibold truncate">{img.scenarioLabel}</p>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px] flex-1">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px] flex-1">
                          <Sparkles className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manus TODO */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Hinweis an Manus:</p>
          <p className="text-muted-foreground">
            Backend-Integration benötigt: <code className="bg-background/50 px-1 rounded">POST /api/future-self/generate</code> mit Input (photo, scenarios, style) → Output (imageUrl pro Szenario). Empfohlene Engine: Nano Banana Pro mit Face-Reference oder Flux Pro Ultra.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
