import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Copy, Check, Zap, MessageCircle, Users, Calendar, Flame, Image as ImageIcon, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * VIRAL ENGINE — 4 virale Mechanismen in einem Tool
 *
 * 1. DUET-BAIT — Posts die zum Duetten/Stitchen einladen
 * 2. MEME-WERKSTATT — Trending Memes + LR-Twist
 * 3. KOMMENTAR-ALCHEMIST — Posts die Kommentare explodieren lassen
 * 4. HYPE-KAMPAGNE — 10-Tage zusammenhängende Story-Serie
 *
 * BACKEND-API (Manus bitte einbinden):
 * - POST /api/viral/duet-bait { topic, format }
 * - POST /api/viral/meme { template, topic }
 * - POST /api/viral/comment-magnet { topic, style }
 * - POST /api/viral/hype-campaign { theme, days }
 */

type Mode = "duet" | "meme" | "comment" | "hype";

const DUET_BAIT_FORMATS = [
  { id: "guess", label: "Rate-Spiel", example: "Ratet mal wie viel ich diesen Monat verdient habe... *Ratet in den Kommentaren, Gewinner bekommt [X]*" },
  { id: "versus", label: "Versus", example: "Was ist besser: Ein 9-to-5 Job oder finanzielle Freiheit? Dueltt mich mit deiner Antwort!" },
  { id: "cliffhanger", label: "Cliffhanger", example: "Was passiert wenn man 90 Tage lang jeden Morgen einen LR Shake trinkt? Morgen verrate ich's... oder du machst ein Duett mit deiner Vermutung!" },
  { id: "reaction-bait", label: "Reaktions-Bait", example: "Schaut euch dieses Gehalt von einem LR Top Earner an und reagiert in einem Duett mit mir!" },
  { id: "controversial", label: "Kontrovers", example: "Meine Meinung: Jeder der Network Marketing als 'Schneeballsystem' abtut, ist schlicht uninformiert. Change my mind! *Duett mit deinem Gegenargument*" },
];

const MEME_TEMPLATES = [
  { id: "drake", label: "Drake", desc: "Nein/Ja-Format", template: "DRAKE MEME:\nNEIN: [Normales Leben - 9 to 5 Job]\nJA: [LR Partner Lifestyle - am Strand arbeiten]" },
  { id: "pov", label: "POV-Meme", desc: "Point of View", template: "POV: [Du arbeitest seit 3 Monaten mit LR und bekommst gerade deine erste Auto-Provision]" },
  { id: "nobody", label: "Niemand: / Ich:", desc: "Absurd-Vergleich", template: "NIEMAND: ...\nICH um 6 Uhr morgens mit meinem LR Shake in der Hand: 'Heute wird DER Tag!'" },
  { id: "distracted", label: "Distracted Boyfriend", desc: "Klassiker", template: "FREUNDIN (normales Leben): 'Schau mal der stabile Job'\nMANN: [Schaut begeistert zu] NETWORK MARKETING" },
  { id: "galaxy-brain", label: "Galaxy Brain", desc: "Wissens-Level", template: "LEVEL 1: Ein Job haben\nLEVEL 2: Einen zweiten Job\nLEVEL 3: Nebenbei was verkaufen\nLEVEL 100 (galaxy brain): Passives Einkommen mit LR" },
  { id: "this-is-fine", label: "This is Fine", desc: "Ironie", template: "*Zinsen steigen, Inflation galoppiert, Job unsicher*\n9-to-5 Angestellte: 'This is fine.'" },
];

const COMMENT_STYLES = [
  { id: "poll", label: "Umfrage", example: "Was ist dir wichtiger? 🏖️ Freiheit — ❤️ Familie — 💰 Geld. Kommentier mit deinem Emoji!" },
  { id: "fill-blank", label: "Lückentext", example: "Ich bin LR Partner geworden, weil _______ (füll in den Kommentaren aus!)" },
  { id: "guess-number", label: "Zahl raten", example: "Errate meine Einnahmen diesen Monat auf 100 € genau. Wer's trifft, bekommt ein kostenloses Beratungsgespräch!" },
  { id: "controversial", label: "Kontrovers", example: "Unpopuläre Meinung: Ein sicherer Job ist das unsicherste was es gibt. Change my mind in den Kommentaren!" },
  { id: "story-ask", label: "Story-Nachfrage", example: "Heute vor 365 Tagen war mein Leben ganz anders. Willst du die ganze Story hören? Kommentiere 'GESCHICHTE'!" },
  { id: "tag-friend", label: "Freund-Tag", example: "Markiere in den Kommentaren JEMANDEN, der diesen Post unbedingt sehen MUSS." },
];

const HYPE_THEMES = [
  { id: "big-reveal", label: "Big Reveal", desc: "Auto/Haus-Upgrade enthüllen", days: 10 },
  { id: "90-day-challenge", label: "90-Tage-Challenge", desc: "Vorher/Nachher-Series", days: 10 },
  { id: "product-launch", label: "Produkt-Launch", desc: "Neues LR-Produkt einführen", days: 7 },
  { id: "team-growth", label: "Team-Challenge", desc: "5 neue Partner in 30 Tagen", days: 10 },
];

function CopyBox({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-3 flex items-start gap-2">
        <p className="flex-1 text-xs whitespace-pre-line">{text}</p>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success("Kopiert!");
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ViralEnginePage() {
  const [mode, setMode] = useState<Mode>("duet");
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const generate = async () => {
    if (!topic.trim() && mode !== "hype") {
      toast.error("Bitte Thema eingeben");
      return;
    }
    setGenerating(true);
    try {
      // TODO MANUS: Backend API anbinden
      await new Promise(resolve => setTimeout(resolve, 1500));
      let generated: string[] = [];
      if (mode === "duet") generated = DUET_BAIT_FORMATS.slice(0, 3).map(f => `${f.label}: ${f.example}`);
      if (mode === "meme") generated = MEME_TEMPLATES.slice(0, 3).map(m => m.template);
      if (mode === "comment") generated = COMMENT_STYLES.slice(0, 3).map(c => c.example);
      if (mode === "hype") generated = [
        "TAG 1: 'Ich habe eine Ankündigung die mein Leben verändert...'",
        "TAG 3: 'Noch 7 Tage. Die ersten Hints: Es hat mit Freiheit zu tun. 🏝️'",
        "TAG 7: 'BIG REVEAL: Ich habe gerade mein Traumauto bestellt!'",
        "TAG 10: 'Willst du auch wissen wie das geht? Schreib mir DM.'",
      ];
      setResults(generated);
      toast.success(`${generated.length} ${mode === "hype" ? "Kampagnen-Posts" : "Varianten"} erstellt!`);
    } catch {
      toast.error("Fehler bei der Generierung");
    } finally {
      setGenerating(false);
    }
  };

  const MODE_INFO: Record<Mode, { icon: typeof Zap; title: string; desc: string }> = {
    duet: { icon: Users, title: "Duet-Bait", desc: "Posts die zum Duetten/Stitchen einladen. Dein Viral-Wachstumshack." },
    meme: { icon: ImageIcon, title: "Meme-Werkstatt", desc: "Trending Meme-Templates mit LR-Twist. 10x mehr Shares als normaler Post." },
    comment: { icon: MessageCircle, title: "Kommentar-Alchemist", desc: "Posts die explodieren mit Kommentaren. Algorithmus-Boost garantiert." },
    hype: { icon: Calendar, title: "Hype-Kampagne", desc: "10-Tage Story-Serie. Follower können nicht wegschauen." },
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>
          Viral Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          4 virale Mechanismen in einem Tool. Duet-Bait, Memes, Kommentar-Magneten, Hype-Kampagnen. Jeder erzeugt anderen Viral-Effekt.
        </p>
      </div>

      {/* Mode-Switch */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(Object.keys(MODE_INFO) as Mode[]).map(m => {
          const info = MODE_INFO[m];
          const Icon = info.icon;
          return (
            <button
              key={m}
              onClick={() => { setMode(m); setResults([]); }}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                mode === m ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
              }`}
            >
              <Icon className="h-5 w-5 text-primary mb-2" />
              <div className="text-xs font-semibold">{info.title}</div>
              <div className="text-[10px] text-muted-foreground">{info.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Input */}
      <Card className="border-primary/30">
        <CardContent className="p-5 space-y-3">
          {mode === "hype" ? (
            <>
              <h2 className="font-semibold">Kampagnen-Thema wählen</h2>
              <div className="grid grid-cols-2 gap-3">
                {HYPE_THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTopic(t.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      topic === t.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-xs font-semibold">{t.label}</div>
                    <div className="text-[10px] text-muted-foreground">{t.desc}</div>
                    <Badge variant="outline" className="text-[9px] mt-1">{t.days} Tage</Badge>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="font-semibold">Dein Thema</h2>
              <Input
                placeholder={
                  mode === "duet" ? "z.B. Auto-Bonus, Business-Erfolg, Freiheit" :
                  mode === "meme" ? "z.B. 9-to-5 Leben vs. Network Marketing" :
                  "z.B. Meine LR-Journey"
                }
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          className="btn-gold h-12 px-8"
          onClick={generate}
          disabled={generating || (!topic && mode !== "hype")}
        >
          {generating ? (
            <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Generiert...</>
          ) : (
            <><Wand2 className="h-5 w-5 mr-2" /> {MODE_INFO[mode].title} generieren</>
          )}
        </Button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h2 className="text-lg font-semibold">Ergebnisse</h2>
          {results.map((r, i) => (
            <div key={i} className="flex gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <CopyBox text={r} />
              </div>
            </div>
          ))}
        </motion.div>
      )}

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Hinweis an Manus:</p>
          <p className="text-muted-foreground">
            Backend: Pro Modus 1 Endpoint der GoViralBitch mit spezialisiertem System-Prompt callt.
            Meme-Bilder können optional via Imgflip API oder DALL-E generiert werden.
            Hype-Kampagne: Alle Posts werden direkt in contentPosts gespeichert mit scheduledAt verteilt über X Tage.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
