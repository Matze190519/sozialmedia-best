import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Copy, Check, Flame, Target, MessageCircle, Zap, Heart, Crown, Car, Palmtree, Briefcase, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 px-2 text-xs"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Kopiert!");
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

const VIRAL_HOOKS = [
  { category: "Storytelling", icon: Heart, hooks: [
    "Tag 1 vs. Tag 365 als LR Partner — der Unterschied wird dich schockieren",
    "Ich habe meinem Chef gekündigt. Das ist passiert...",
    "Vor einem Jahr konnte ich mir nicht mal Urlaub leisten. Heute...",
    "Sie haben gelacht als ich sagte ich mache Network Marketing. Jetzt...",
    "Das hat sich niemand getraut mir zu sagen, als ich mit LR angefangen habe",
    "Meine Eltern dachten ich spinne. 12 Monate später...",
    "Ich habe 3 Jahre lang den gleichen Fehler gemacht. Bis ich DAS verstanden habe",
    "Was passiert wenn du 90 Tage lang JEDEN TAG postest",
  ]},
  { category: "Autokonzept & Lifestyle", icon: Car, hooks: [
    "Mein neues Auto. Bezahlt von meinem Nebeneinkommen. So geht's.",
    "POV: Du fährst dein Traumauto und es kostet dich 0 € im Monat",
    "BMW, Mercedes oder Porsche? LR Partner fahren was sie wollen",
    "Wenn dein Autokredit von jemand anderem bezahlt wird",
    "Das Autokonzept erklärt in 30 Sekunden — und ja, es ist real",
    "Ich fahre seit 6 Monaten mein Traumauto. Ohne Leasing. Ohne Kredit.",
    "Stell dir vor, du bekommst jeden Monat 500 € für dein Auto. Einfach so.",
  ]},
  { category: "Freiheit & Reisen", icon: Palmtree, hooks: [
    "Montag, 11 Uhr, Mallorca. Mein 'Büro' heute.",
    "Work from anywhere ist nicht nur ein Hashtag — es ist mein Leben",
    "Dieses Video habe ich am Strand gedreht. Während mein Business läuft.",
    "Freiheit bedeutet: Morgens aufwachen und ENTSCHEIDEN was du heute machst",
    "Mein Chef hat mir 3 Wochen Urlaub gegeben. Ich habe mir 365 Tage gegeben.",
    "POV: Du arbeitest von Bali und verdienst mehr als dein alter 9-to-5 Job",
    "Reisen UND Geld verdienen? Ich zeig dir wie.",
  ]},
  { category: "Business Opportunity", icon: Briefcase, hooks: [
    "3 Gründe warum Network Marketing 2026 boomt wie nie zuvor",
    "Du brauchst kein Startkapital. Keinen Businessplan. Nur ein Handy.",
    "Nebeneinkommen aufbauen ohne deinen Job zu kündigen — hier ist der Plan",
    "Das beste Business-Modell das niemand ernst nimmt (bis sie die Zahlen sehen)",
    "Passives Einkommen gibt es nicht. Aber DAS kommt verdammt nah dran.",
    "Warum die smartesten Leute die ich kenne jetzt in Network Marketing einsteigen",
    "1.000 € Nebeneinkommen in 90 Tagen — mein exakter Fahrplan",
    "Du willst finanzielle Freiheit? Dann hör auf zu sparen und fang an zu BAUEN.",
  ]},
  { category: "Produkt-Hooks", icon: Sparkles, hooks: [
    "Dieses Produkt hat meine Haut in 4 Wochen komplett verändert",
    "Ich trinke das jeden Morgen. Das Ergebnis nach 30 Tagen...",
    "Meine Top 3 LR Produkte die ich JEDEM empfehle",
    "Vorher/Nachher — und nein, das ist kein Filter",
    "Warum alle nach diesem Aloe Vera Gel fragen",
    "Das Geheimnis hinter meiner Energie? Es kostet weniger als dein Kaffee.",
    "Meine Morgenroutine mit LR — und warum ich mich noch nie besser gefühlt habe",
    "Ich habe 20 Nahrungsergänzungen getestet. Nur EINE hat gewirkt.",
  ]},
  { category: "Kontrovers & Polarisierend", icon: Flame, hooks: [
    "Network Marketing ist KEIN Schneeballsystem. Hier ist der Beweis.",
    "Unpopuläre Meinung: Dein 9-to-5 Job ist das eigentliche Risiko",
    "Jeder der sagt 'das funktioniert nicht' hat es nie ernsthaft versucht",
    "Die Wahrheit über Network Marketing die dir niemand erzählt",
    "Warum 95% scheitern — und was die anderen 5% anders machen",
    "Dein Umfeld bestimmt dein Einkommen. Harte Wahrheit.",
    "Stop scrolling. Lies das. Dein zukünftiges Ich wird dir danken.",
  ]},
];

const LEAD_CTAS = [
  { label: "DM-Trigger", ctas: [
    "Kommentiere '🔥' und ich schick dir alle Infos per DM",
    "Schreib mir 'INFO' per DM — ich erkläre dir alles persönlich",
    "Willst du wissen wie? Kommentiere 'JA' und ich melde mich bei dir",
    "DM mich mit 'START' und ich zeig dir den ersten Schritt",
    "Neugierig? Schreib mir eine Nachricht — kostet nichts zu fragen",
  ]},
  { label: "Link-in-Bio", ctas: [
    "Alle Infos findest du über den Link in meiner Bio",
    "Klick den Link in meiner Bio für den kostenlosen Guide",
    "Den kompletten Fahrplan findest du in meiner Bio",
  ]},
  { label: "Story-Interaktion", ctas: [
    "Speichere diesen Post — du wirst ihn brauchen",
    "Teile das mit jemandem der das hören muss",
    "Folge mir für tägliche Tipps zu finanzieller Freiheit",
    "Sende diesen Post an 3 Freunde die mehr vom Leben wollen",
  ]},
  { label: "Urgency", ctas: [
    "Ich nehme diese Woche noch 5 neue Partner auf — bist du dabei?",
    "Mein Team wächst gerade. Perfekter Zeitpunkt einzusteigen.",
    "Wer JETZT startet, hat in 6 Monaten einen Vorsprung den andere nie aufholen",
  ]},
];

const CONTENT_FORMULAS = [
  { name: "Before/After", desc: "Zeige dein Leben VORHER vs. NACHHER. Emotional, visuell, überzeugend.", example: "Vor 1 Jahr: 9-to-5, gestresst, pleite. Heute: eigener Chef, Traumauto, Mallorca." },
  { name: "Day-in-the-Life", desc: "Zeige deinen Alltag als LR Partner. Authentisch, nicht perfekt.", example: "6:00 Morgenroutine mit LR Shake → 9:00 Content drehen am Strand → 14:00 Team-Call → 17:00 Feierabend" },
  { name: "POV-Video", desc: "Point-of-View Format. Der Zuschauer ist DU.", example: "POV: Du bekommst deine erste Autoprovision und kannst es nicht glauben" },
  { name: "Storytime", desc: "Erzähle DEINE Geschichte. Verletzlich, ehrlich, motivierend.", example: "Ich war 28, verschuldet, ohne Plan. Dann hat mir jemand von LR erzählt..." },
  { name: "3-Gründe-Liste", desc: "Nummerierte Liste. Einfach zu konsumieren, hohes Engagement.", example: "3 Gründe warum ich nie wieder angestellt arbeiten werde: 1. Freiheit 2. Einkommen 3. Sinn" },
  { name: "Myth-Buster", desc: "Räume mit Vorurteilen auf. Kontrovers = viral.", example: "MYTHOS: Network Marketing ist nur was für Verkäufer. WAHRHEIT: Die besten in meinem Team waren vorher Lehrer, Krankenschwestern, Studenten." },
  { name: "Get-Ready-With-Me", desc: "Während du dich fertig machst, erzählst du deine Story.", example: "GRWM während ich euch erzähle wie ich mit 0 € Startkapital ein Business aufgebaut habe" },
  { name: "Einwandbehandlung", desc: "Nimm den häufigsten Einwand und zerlege ihn.", example: "'Ich habe keine Zeit.' — Du hast 2 Stunden am Tag auf Social Media. Die Frage ist nicht OB du Zeit hast, sondern WOFÜR du sie nutzt." },
];

export default function ViralVaultPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"hooks" | "ctas" | "formulas">("hooks");
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>
          Viral Content Vault
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          50+ bewährte Viral-Hooks, Lead-CTAs und Content-Formeln. 1 Klick kopieren, direkt in deinen Post einbauen.
        </p>
      </div>

      <div className="flex gap-2">
        {([
          { key: "hooks" as const, label: "Viral Hooks", icon: Flame, count: VIRAL_HOOKS.reduce((s, c) => s + c.hooks.length, 0) },
          { key: "ctas" as const, label: "Lead-CTAs", icon: Target, count: LEAD_CTAS.reduce((s, c) => s + c.ctas.length, 0) },
          { key: "formulas" as const, label: "Content-Formeln", icon: Zap, count: CONTENT_FORMULAS.length },
        ]).map(tab => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "outline"}
            size="sm"
            className={activeTab === tab.key ? "btn-gold" : ""}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon className="h-4 w-4 mr-1.5" />
            {tab.label}
            <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">{tab.count}</Badge>
          </Button>
        ))}
      </div>

      {activeTab === "hooks" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {VIRAL_HOOKS.map((cat, i) => (
              <Button
                key={i}
                size="sm"
                variant={activeCategory === i ? "default" : "outline"}
                className={`text-xs ${activeCategory === i ? "btn-gold" : ""}`}
                onClick={() => setActiveCategory(i)}
              >
                <cat.icon className="h-3.5 w-3.5 mr-1" />
                {cat.category}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            {VIRAL_HOOKS[activeCategory].hooks.map((hook, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-3 flex items-center gap-3">
                    <span className="text-primary font-bold text-sm w-6 shrink-0">#{i + 1}</span>
                    <p className="flex-1 text-sm">{hook}</p>
                    <CopyButton text={hook} />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-primary"
                      onClick={() => setLocation(`/generator?topic=${encodeURIComponent(hook)}`)}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Post
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "ctas" && (
        <div className="space-y-6">
          {LEAD_CTAS.map((group, gi) => (
            <div key={gi}>
              <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                {group.label}
              </h3>
              <div className="space-y-2">
                {group.ctas.map((cta, i) => (
                  <Card key={i} className="border-border/50">
                    <CardContent className="p-3 flex items-center gap-3">
                      <MessageCircle className="h-4 w-4 text-primary shrink-0" />
                      <p className="flex-1 text-sm">{cta}</p>
                      <CopyButton text={cta} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "formulas" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTENT_FORMULAS.map((formula, i) => (
            <Card key={i} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  {formula.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">{formula.desc}</p>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5">
                  <p className="text-xs italic">"{formula.example}"</p>
                </div>
                <div className="flex gap-2">
                  <CopyButton text={formula.example} />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-primary"
                    onClick={() => setLocation(`/generator?topic=${encodeURIComponent(formula.example)}`)}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Als Post verwenden
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
