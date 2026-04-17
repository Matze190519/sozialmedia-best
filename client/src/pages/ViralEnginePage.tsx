import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Copy, Check, Zap, MessageCircle, Users, Calendar, Wand2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

/**
 * VIRAL ENGINE — 4 virale Mechanismen in einem Tool
 *
 * FUNKTIONAL via bestehender tRPC content.generate Mutation
 * mit strukturierten topic-Prompts die den viralen Mechanismus injizieren.
 */

type Mode = "duet" | "meme" | "comment" | "hype";

const MODE_PROMPTS: Record<Mode, { label: string; topicPrefix: string; contextPrompt: string; icon: typeof Zap; desc: string }> = {
  duet: {
    label: "Duet-Bait",
    topicPrefix: "DUET-BAIT: ",
    contextPrompt: "Erstelle einen Post der EXPLIZIT zum Duetten oder Stitchen auf TikTok/Instagram einlädt. Der Post soll: 1) Einen kontroversen oder provokativen Hook haben, 2) Aktiv zum Duett auffordern ('Duettet mich', 'Stitch deine Antwort'), 3) Einen Cliffhanger oder eine offene Frage enthalten. Beispiele: Rate-Spiele, Versus-Fragen, Reaktions-Baits.",
    icon: Users,
    desc: "Posts die zum Duetten/Stitchen einladen",
  },
  meme: {
    label: "Meme",
    topicPrefix: "MEME-POST: ",
    contextPrompt: "Erstelle einen Meme-Post der ein trendiges Meme-Format (z.B. Drake-Meme, POV, 'Niemand:/Ich:') mit Network Marketing / LR-Business-Kontext kombiniert. Der Post soll humorvoll, teilbar und sofort verständlich sein. Füge Bildbeschreibung für das Meme hinzu.",
    icon: ImageIcon,
    desc: "Trending Meme-Templates mit LR-Twist",
  },
  comment: {
    label: "Kommentar-Magnet",
    topicPrefix: "KOMMENTAR-MAGNET: ",
    contextPrompt: "Erstelle einen Post der MAXIMAL viele Kommentare generiert. Nutze Taktiken wie: Umfragen mit Emojis, Lückentexte zum Vervollständigen, Zahlen-Raten-Spiele, kontroverse Meinungen ('Change my mind'), Tag-a-Friend Aufforderungen. Der Post muss explizit zum Kommentieren auffordern.",
    icon: MessageCircle,
    desc: "Posts die Kommentare explodieren lassen",
  },
  hype: {
    label: "Hype-Kampagne Tag 1",
    topicPrefix: "HYPE-KAMPAGNE TAG 1: ",
    contextPrompt: "Erstelle den ersten Post einer 10-tägigen Hype-Kampagne. Der Post soll: 1) Eine große Ankündigung teasern ohne sie zu verraten, 2) Spannung aufbauen, 3) Follower zum täglichen Wiederkommen animieren. Klassischer Cliffhanger-Start.",
    icon: Calendar,
    desc: "10-Tage Story-Serie (Tag 1)",
  },
};

const HYPE_THEMES = [
  { id: "big-reveal", label: "Big Reveal", topic: "Auto-Übergabe oder großes Business-Upgrade" },
  { id: "90-day-challenge", label: "90-Tage-Challenge", topic: "Vorher/Nachher Transformation" },
  { id: "product-launch", label: "Produkt-Launch", topic: "Neues LR-Produkt einführen" },
  { id: "team-growth", label: "Team-Challenge", topic: "5 neue Partner in 30 Tagen" },
];

export default function ViralEnginePage() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<Mode>("duet");
  const [topic, setTopic] = useState("");
  const [selectedHype, setSelectedHype] = useState("");

  const utils = trpc.useUtils();
  const generateMutation = trpc.content.generate.useMutation();

  const generate = async () => {
    const effectiveTopic = mode === "hype"
      ? HYPE_THEMES.find(t => t.id === selectedHype)?.topic
      : topic.trim();

    if (!effectiveTopic) {
      toast.error(mode === "hype" ? "Thema wählen" : "Thema eingeben");
      return;
    }

    const modeInfo = MODE_PROMPTS[mode];

    try {
      await generateMutation.mutateAsync({
        contentType: "post",
        topic: `${modeInfo.topicPrefix}${effectiveTopic}`,
        pillar: mode === "meme" ? "lifestyle" : "business_opportunity",
        platforms: ["instagram", "tiktok", "facebook"],
        context: modeInfo.contextPrompt,
        autoGenerateImage: mode === "meme",
        autoGenerateVideo: false,
      });

      utils.content.list.invalidate();
      toast.success(`${modeInfo.label}-Post erstellt! Landet in der Freigabe.`);
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
          Viral Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          4 virale Mechanismen. Generierter Post landet direkt in der Freigabe-Queue.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(Object.keys(MODE_PROMPTS) as Mode[]).map(m => {
          const info = MODE_PROMPTS[m];
          const Icon = info.icon;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                mode === m ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
              }`}
            >
              <Icon className="h-5 w-5 text-primary mb-2" />
              <div className="text-xs font-semibold">{info.label}</div>
              <div className="text-[10px] text-muted-foreground">{info.desc}</div>
            </button>
          );
        })}
      </div>

      <Card className="border-primary/30">
        <CardContent className="p-5 space-y-3">
          {mode === "hype" ? (
            <>
              <h2 className="font-semibold">Kampagnen-Thema</h2>
              <div className="grid grid-cols-2 gap-3">
                {HYPE_THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedHype(t.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      selectedHype === t.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-xs font-semibold">{t.label}</div>
                    <div className="text-[10px] text-muted-foreground">{t.topic}</div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="font-semibold">Dein Thema</h2>
              <Input
                placeholder={
                  mode === "duet" ? "z.B. Auto-Bonus, Monats-Einkommen" :
                  mode === "meme" ? "z.B. 9-to-5 vs. Network Marketing" :
                  "z.B. Meine LR-Journey"
                }
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          size="lg"
          className="btn-gold h-12 px-8"
          onClick={generate}
          disabled={generating || (mode === "hype" ? !selectedHype : !topic.trim())}
        >
          {generating ? (
            <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Generiert...</>
          ) : (
            <><Wand2 className="h-5 w-5 mr-2" /> {MODE_PROMPTS[mode].label} generieren</>
          )}
        </Button>
      </div>

      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-emerald-400 mb-1">✅ Funktioniert mit bestehendem Backend</p>
          <p className="text-muted-foreground">
            Nutzt <code>content.generate</code> mit spezialisierten Prompts pro Modus. Post landet automatisch in der Freigabe-Queue. Meme-Modus generiert zusätzlich ein Bild.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
