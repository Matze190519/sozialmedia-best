import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Sparkles, Download, Loader2, Package, Video, Copy } from "lucide-react";
import { toast } from "sonner";

/**
 * 3D-PRODUKT-STUDIO — Apple-Style Werbung für LR-Produkte
 *
 * Zwei Modi:
 * A) 3D-BILD — Produkt in cinematischer Szene (Marmor, Studio-Licht, Wassertropfen)
 * B) SATISFYING-VIDEO — Slow-Motion Shake, Gel auf Haut, Unboxing, ASMR
 *
 * BACKEND-API (Manus bitte einbinden):
 * - POST /api/product-studio/image { product, scene, style } → imageUrl
 * - POST /api/product-studio/video { product, scene, duration } → videoUrl
 */

const PRODUCTS = [
  { id: "aloe-vera-gel", emoji: "🌿", name: "Aloe Vera Drinking Gel", category: "Gesundheit" },
  { id: "lifetakt", emoji: "⚡", name: "Lifetakt Energy", category: "Energie" },
  { id: "collagen-plus", emoji: "✨", name: "Collagen Plus", category: "Beauty" },
  { id: "protein-shake", emoji: "💪", name: "LR Protein Shake", category: "Fitness" },
  { id: "zeitgard", emoji: "🧖", name: "Zeitgard System", category: "Anti-Aging" },
  { id: "perfume", emoji: "🌸", name: "LR Parfum", category: "Duft" },
  { id: "aloe-cream", emoji: "💧", name: "Aloe Creme", category: "Hautpflege" },
  { id: "vitamins", emoji: "🌟", name: "LR Vitamine", category: "Gesundheit" },
];

const IMAGE_SCENES = [
  { id: "marble-studio", emoji: "⬜", label: "Marmor-Studio", desc: "Weißer Marmor, Spotlight", prompt: "Product on polished white marble surface, professional studio lighting, soft shadows, minimalist composition, commercial photography, photorealistic, 8K" },
  { id: "water-splash", emoji: "💦", label: "Water Splash", desc: "Explosion aus Wasser", prompt: "Product with dynamic water splash all around, freeze motion, droplets, blue gradient background, professional commercial, photorealistic, 8K" },
  { id: "gold-luxury", emoji: "🏆", label: "Gold Luxury", desc: "Goldene Akzente, Premium", prompt: "Product on gold podium with luxury gold and black gradient background, dramatic lighting, exclusive feel, premium commercial, photorealistic, 8K" },
  { id: "nature-botanical", emoji: "🌿", label: "Botanical", desc: "Pflanzen, Blätter, Natur", prompt: "Product surrounded by fresh green leaves and botanical elements, natural light, earthy tones, wellness spa aesthetic, photorealistic, 8K" },
  { id: "sunset-beach", emoji: "🌅", label: "Sunset Beach", desc: "Strand bei Sonnenuntergang", prompt: "Product on a pristine beach at golden hour sunset, waves in background, warm lighting, vacation lifestyle, photorealistic, 8K" },
  { id: "glow-neon", emoji: "💜", label: "Neon Glow", desc: "Trendige Neon-Farben", prompt: "Product with vibrant neon glow (pink, purple, cyan), modern aesthetic, dark background, contemporary commercial, photorealistic, 8K" },
  { id: "ice-frost", emoji: "❄️", label: "Ice & Frost", desc: "Eiskristalle, Frische", prompt: "Product covered in ice crystals and frost, cold refreshing feel, blue tones, dramatic lighting, photorealistic, 8K" },
  { id: "fire-dramatic", emoji: "🔥", label: "Fire & Drama", desc: "Dramatische Flammen", prompt: "Product with dramatic fire and flames in background, bold composition, warm orange glow, intense commercial, photorealistic, 8K" },
];

const VIDEO_SCENES = [
  { id: "shake-pour", emoji: "🥤", label: "Slow-Motion Shake", desc: "Shake wird in Glas gegossen", duration: "5s" },
  { id: "gel-drop", emoji: "💧", label: "Gel-Drop ASMR", desc: "Gel tropft auf Haut", duration: "4s" },
  { id: "unboxing", emoji: "📦", label: "Unboxing Reveal", desc: "Verpackung wird geöffnet", duration: "6s" },
  { id: "product-rotation", emoji: "🔄", label: "360°-Rotation", desc: "Produkt rotiert vor Studio", duration: "6s" },
  { id: "morning-routine", emoji: "☀️", label: "Morning Routine", desc: "Shake beim Sonnenaufgang", duration: "8s" },
  { id: "ice-splash", emoji: "🧊", label: "Ice Splash", desc: "Produkt fällt in Wasser", duration: "4s" },
];

interface GeneratedAsset {
  type: "image" | "video";
  url: string;
  scene: string;
  product: string;
}

export default function ProductStudioPage() {
  const [mode, setMode] = useState<"image" | "video">("image");
  const [product, setProduct] = useState<string>("aloe-vera-gel");
  const [scene, setScene] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);

  const currentProduct = PRODUCTS.find(p => p.id === product);
  const scenes = mode === "image" ? IMAGE_SCENES : VIDEO_SCENES;

  const runGeneration = async () => {
    if (!scene) {
      toast.error("Bitte eine Szene auswählen");
      return;
    }
    setGenerating(true);
    try {
      // TODO MANUS: Backend anbinden
      // POST /api/product-studio/{mode} { product, scene }
      await new Promise(resolve => setTimeout(resolve, 2000));
      const sceneData = scenes.find(s => s.id === scene);
      setAssets(prev => [{
        type: mode,
        url: `https://placehold.co/800x800/1a1a1a/d4af37?text=${encodeURIComponent(sceneData?.label || "Preview")}`,
        scene: sceneData?.label || scene,
        product: currentProduct?.name || product,
      }, ...prev]);
      toast.success(`${mode === "image" ? "3D-Bild" : "Satisfying Video"} erstellt!`);
    } catch {
      toast.error("Fehler bei der Generierung");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>
          3D-Produkt-Studio
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Apple-Style Produktbilder und ASMR-Videos für LR-Produkte. Cinematic, hyperrealistisch, social-media-ready.
        </p>
      </div>

      {/* Mode-Switch */}
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

      {/* Step 1: Product */}
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
                <div className="text-[10px] text-muted-foreground">{p.category}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Scene */}
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
                <div className="text-[10px] text-muted-foreground">{s.desc}</div>
                {"duration" in s && (
                  <Badge variant="outline" className="text-[9px] mt-1">{s.duration}</Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action */}
      <div className="flex justify-center">
        <Button
          size="lg"
          className="btn-gold h-14 px-10"
          onClick={runGeneration}
          disabled={generating || !scene}
        >
          {generating ? (
            <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Rendert... (15-30s)</>
          ) : (
            <><Sparkles className="h-5 w-5 mr-2" /> {mode === "image" ? "3D-Bild erstellen" : "Video erstellen"}</>
          )}
        </Button>
      </div>

      {/* Results */}
      {assets.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Erstellte Assets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {assets.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden">
                  <img src={a.url} alt="" className="aspect-square w-full object-cover" />
                  <CardContent className="p-3 space-y-2">
                    <div>
                      <p className="text-xs font-semibold">{a.product}</p>
                      <p className="text-[10px] text-muted-foreground">{a.scene}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">
                        <Download className="h-3 w-3 mr-1" /> Download
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">
                        <Copy className="h-3 w-3 mr-1" /> Als Post
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Hinweis an Manus:</p>
          <p className="text-muted-foreground">
            Backend: <code>POST /api/product-studio/image</code> (Nano Banana Pro mit Produkt-Referenz-Bild) + <code>POST /api/product-studio/video</code> (Kling 3.0 mit ASMR-Prompts). Produktbilder kommen aus der bestehenden Products-Tabelle.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
