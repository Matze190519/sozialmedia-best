import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Sparkles, Download, Loader2, Package, Video, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

/**
 * 3D-PRODUKT-STUDIO — Apple-Style Werbung für LR-Produkte
 *
 * FUNKTIONAL via bestehender tRPC content.generate Mutation:
 * - contentType: "post"
 * - topic: Strukturierter 3D-Prompt (Produkt + Szene + Stil)
 * - autoGenerateImage: true (triggert Nano Banana Pro via fal.ai)
 * - autoGenerateVideo: bei Video-Modus true
 *
 * Resultat landet automatisch in /approval mit Bild/Video.
 */

const PRODUCTS = [
  { id: "aloe-vera-gel", emoji: "🌿", name: "Aloe Vera Drinking Gel", refName: "LR Aloe Vera Drinking Gel Honey" },
  { id: "lifetakt", emoji: "⚡", name: "Lifetakt Energy", refName: "LR Lifetakt Energy Pro-Balance" },
  { id: "collagen-plus", emoji: "✨", name: "Collagen Plus", refName: "LR 5in1 Beauty Elixir Collagen" },
  { id: "protein-shake", emoji: "💪", name: "LR Protein Shake", refName: "LR Figu Active Shake" },
  { id: "zeitgard", emoji: "🧖", name: "Zeitgard System", refName: "LR Zeitgard Skincare System" },
  { id: "perfume", emoji: "🌸", name: "LR Parfum", refName: "LR Fragrances" },
  { id: "aloe-cream", emoji: "💧", name: "Aloe Creme", refName: "LR Aloe Vera Face Care Cream" },
  { id: "vitamins", emoji: "🌟", name: "LR Vitamine", refName: "LR Vital Complete" },
];

const IMAGE_SCENES = [
  { id: "marble-studio", emoji: "⬜", label: "Marmor-Studio", prompt: "Professional product photography on polished white marble surface, studio lighting with soft shadows, minimalist composition, commercial advertising style, photorealistic, 8K quality, sharp focus" },
  { id: "water-splash", emoji: "💦", label: "Water Splash", prompt: "Product photography with dramatic dynamic water splash all around the product, frozen water droplets in motion, blue gradient background, commercial advertising, photorealistic, 8K, sharp focus" },
  { id: "gold-luxury", emoji: "🏆", label: "Gold Luxury", prompt: "Ultra-premium product photography on gold podium, luxurious gold and black gradient background, dramatic rim lighting, exclusive atmosphere, high-end commercial, photorealistic, 8K" },
  { id: "nature-botanical", emoji: "🌿", label: "Botanical", prompt: "Product photography surrounded by fresh green leaves, aloe plants, botanical elements, natural soft daylight, earthy warm tones, wellness spa aesthetic, photorealistic, 8K" },
  { id: "sunset-beach", emoji: "🌅", label: "Sunset Beach", prompt: "Product photography on pristine white sand beach at golden hour, soft ocean waves in background, warm sunset lighting, luxury vacation lifestyle vibe, photorealistic, 8K" },
  { id: "glow-neon", emoji: "💜", label: "Neon Glow", prompt: "Modern product photography with vibrant neon glow (pink, purple, cyan accents), contemporary aesthetic, dark moody background, trendy commercial look, photorealistic, 8K" },
  { id: "ice-frost", emoji: "❄️", label: "Ice & Frost", prompt: "Product photography covered in frosty ice crystals, cold refreshing feel, icy blue tones, dramatic rim lighting, premium commercial, photorealistic, 8K" },
  { id: "fire-dramatic", emoji: "🔥", label: "Fire & Drama", prompt: "Dramatic product photography with fire and flames effects, bold intense composition, warm orange and red glow, cinematic advertising, photorealistic, 8K" },
];

const VIDEO_SCENES = [
  { id: "shake-pour", emoji: "🥤", label: "Slow-Motion Pour", prompt: "Slow motion cinematic shot of LR shake being poured into elegant glass, cream-colored liquid with gentle bubbles, morning light, minimalist kitchen, commercial quality, 8K" },
  { id: "gel-drop", emoji: "💧", label: "Gel-Drop ASMR", prompt: "Extreme close-up ASMR video of aloe vera gel dropping onto smooth skin, transparent clear gel, soft natural light, satisfying texture, commercial beauty ad style" },
  { id: "unboxing", emoji: "📦", label: "Unboxing Reveal", prompt: "Premium slow-motion unboxing of LR product, hands carefully removing lid, beautiful packaging, professional reveal, luxury commercial aesthetic" },
  { id: "product-rotation", emoji: "🔄", label: "360° Rotation", prompt: "Product rotating 360 degrees on turntable, clean white studio background, professional product showcase, cinematic lighting, commercial quality" },
  { id: "morning-routine", emoji: "☀️", label: "Morning Routine", prompt: "Cinematic morning routine with LR product, golden sunrise light streaming through window, peaceful lifestyle, authentic moment, warm colors" },
  { id: "ice-splash", emoji: "🧊", label: "Ice Splash", prompt: "Dramatic slow-motion of product hitting water surface, ice cubes splashing around, refreshing blue tones, commercial beauty advertising" },
];

export default function ProductStudioPage() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"image" | "video">("image");
  const [product, setProduct] = useState<string>("aloe-vera-gel");
  const [scene, setScene] = useState<string>("");

  const utils = trpc.useUtils();
  const generateMutation = trpc.content.generate.useMutation();

  const currentProduct = PRODUCTS.find(p => p.id === product);
  const scenes = mode === "image" ? IMAGE_SCENES : VIDEO_SCENES;

  const runGeneration = async () => {
    if (!scene || !currentProduct) {
      toast.error("Bitte Produkt und Szene auswählen");
      return;
    }
    const sceneData = scenes.find(s => s.id === scene);
    if (!sceneData) return;

    try {
      const fullPrompt = `${currentProduct.refName} product photography: ${sceneData.prompt}`;

      await generateMutation.mutateAsync({
        contentType: "post",
        topic: `${currentProduct.name} - ${sceneData.label}`,
        pillar: "product",
        platforms: ["instagram", "tiktok", "facebook"],
        product: currentProduct.refName,
        context: fullPrompt,
        autoGenerateImage: mode === "image",
        autoGenerateVideo: mode === "video",
      });

      utils.content.list.invalidate();
      toast.success(`${mode === "image" ? "3D-Bild" : "Video"} wird erstellt! Landet gleich in der Freigabe.`);

      setTimeout(() => setLocation("/approval"), 1500);
    } catch (err: any) {
      toast.error(`Fehler: ${err.message || "Generierung fehlgeschlagen"}`);
    }
  };

  const generating = generateMutation.isPending;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>
          3D-Produkt-Studio
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Apple-Style Produktbilder und ASMR-Videos für LR-Produkte. Cinematic, hyperrealistisch. Das Ergebnis landet direkt in der Freigabe-Queue.
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={mode === "image" ? "default" : "outline"}
          onClick={() => { setMode("image"); setScene(""); }}
          className={mode === "image" ? "btn-gold" : ""}
        >
          <Package className="h-4 w-4 mr-2" />
          3D-Bild
        </Button>
        <Button
          variant={mode === "video" ? "default" : "outline"}
          onClick={() => { setMode("video"); setScene(""); }}
          className={mode === "video" ? "btn-gold" : ""}
        >
          <Video className="h-4 w-4 mr-2" />
          Satisfying Video
        </Button>
      </div>

      <Card className="border-primary/30">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-3">Produkt wählen</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRODUCTS.map(p => (
              <button
                key={p.id}
                onClick={() => setProduct(p.id)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  product === p.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-3xl mb-1">{p.emoji}</div>
                <div className="text-xs font-semibold">{p.name}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30">
        <CardContent className="p-5">
          <h2 className="font-semibold mb-3">
            {mode === "image" ? "3D-Szene wählen" : "Video-Stil wählen"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {scenes.map(s => (
              <button
                key={s.id}
                onClick={() => setScene(s.id)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  scene === s.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-2xl mb-1">{s.emoji}</div>
                <div className="text-xs font-semibold">{s.label}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          size="lg"
          className="btn-gold h-14 px-10"
          onClick={runGeneration}
          disabled={generating || !scene}
        >
          {generating ? (
            <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Generiert... (15-30s)</>
          ) : (
            <><Sparkles className="h-5 w-5 mr-2" /> {mode === "image" ? "3D-Bild erstellen" : "Video erstellen"}</>
          )}
        </Button>
      </div>

      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-emerald-400 mb-1">✅ Funktioniert mit bestehendem Backend</p>
          <p className="text-muted-foreground">
            Nutzt <code>content.generate</code> mit Nano Banana Pro (fal.ai) für Bilder und Kling/Veo für Videos. Ergebnis landet automatisch in der Freigabe. Nach Klick wirst du dorthin geleitet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
