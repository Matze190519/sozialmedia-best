import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Bot, MessageSquare, Phone, Video, Calendar, Copy, Check,
  Flame, Package, Briefcase, HelpCircle, Shield, Play, Download, Sparkles
} from "lucide-react";
import { toast } from "sonner";

/**
 * LINA SALES CONCIERGE — B2C Gesicht von Lina
 *
 * Steuert Interessentenpfade für Voice, Chat, Video-Message, Termin.
 * Klassifiziert Intent, baut Briefing, generiert Follow-up.
 */

type Source = "reel" | "short" | "comment" | "landingpage" | "dm";
type Interest = "product" | "business" | "both" | "unclear";
type Urgency = "cold" | "warm" | "hot";
type Path = "chat" | "voice" | "video" | "meeting";

interface ProspectIntent {
  id: string;
  name?: string;
  source: Source;
  interest: Interest;
  objections: string[];
  urgency: Urgency;
  recommendedPath: Path;
  notes?: string;
}

const SOURCE_LABELS: Record<Source, string> = {
  reel: "Instagram Reel",
  short: "YouTube Short",
  comment: "Kommentar",
  landingpage: "Landingpage",
  dm: "Direct Message",
};

const INTEREST_CONFIG: Record<Interest, { label: string; icon: typeof Package; color: string }> = {
  product: { label: "Produkt", icon: Package, color: "text-emerald-400 border-emerald-500/30" },
  business: { label: "Business", icon: Briefcase, color: "text-primary border-primary/30" },
  both: { label: "Beides", icon: Sparkles, color: "text-amber-400 border-amber-500/30" },
  unclear: { label: "Unklar", icon: HelpCircle, color: "text-muted-foreground border-border" },
};

const URGENCY_CONFIG: Record<Urgency, { label: string; color: string }> = {
  cold: { label: "❄️ Cold", color: "text-blue-400 border-blue-500/30" },
  warm: { label: "🌤️ Warm", color: "text-amber-400 border-amber-500/30" },
  hot: { label: "🔥 Hot", color: "text-red-400 border-red-500/30" },
};

const PATH_CONFIG: Record<Path, { label: string; icon: typeof MessageSquare; color: string }> = {
  chat: { label: "DM-Chat", icon: MessageSquare, color: "text-blue-400" },
  voice: { label: "Voice Call", icon: Phone, color: "text-emerald-400" },
  video: { label: "Video-Message", icon: Video, color: "text-primary" },
  meeting: { label: "Termin", icon: Calendar, color: "text-amber-400" },
};

// Demo Leads
const INITIAL_PROSPECTS: ProspectIntent[] = [
  {
    id: "p-1",
    name: "Sarah K.",
    source: "reel",
    interest: "business",
    objections: ["Habe keine Zeit", "Zu alt für Social Media"],
    urgency: "hot",
    recommendedPath: "voice",
    notes: "Hat auf 3 Reels reagiert, kommentiert 'Wie fange ich an?'",
  },
  {
    id: "p-2",
    name: "Thomas M.",
    source: "comment",
    interest: "product",
    objections: ["Zu teuer"],
    urgency: "warm",
    recommendedPath: "chat",
    notes: "Frage zu Aloe Vera Gel, konkretes Interesse",
  },
  {
    id: "p-3",
    name: "Lisa B.",
    source: "dm",
    interest: "both",
    objections: ["Ist das MLM?", "Funktioniert das wirklich?"],
    urgency: "warm",
    recommendedPath: "video",
    notes: "Vorsichtig, braucht Vertrauen. Video-Message mit Nova wäre ideal.",
  },
  {
    id: "p-4",
    name: "David R.",
    source: "landingpage",
    interest: "business",
    objections: [],
    urgency: "hot",
    recommendedPath: "meeting",
    notes: "Direkt Termin gebucht über Calendly. Call in 2h.",
  },
];

function generateCallOpening(prospect: ProspectIntent): string {
  const name = prospect.name || "da";
  const interestIntro = {
    product: "Du hast dich für unsere Produkte interessiert — ich zeige dir jetzt ganz konkret was dazu passt.",
    business: "Du hast dich für das Business-Modell interessiert — lass mich dir zeigen wie das bei mir funktioniert hat.",
    both: "Du interessierst dich sowohl für die Produkte als auch das Business — perfekt, beides hängt zusammen.",
    unclear: "Erzähl mir kurz was dich überhaupt interessiert, dann gehen wir direkt in die richtige Richtung.",
  }[prospect.interest];

  return `Hey ${name}, super dass du dir Zeit nimmst!

${interestIntro}

Der Call hat 3 Teile:
1. Erst verstehe ich wer du bist und wo du stehst (5 Min)
2. Dann zeige ich dir was realistisch möglich ist (10 Min)
3. Du entscheidest ob du einsteigen willst (kein Druck, keine Sales)

Deal?`;
}

function generateFollowupMessage(prospect: ProspectIntent, type: "chat" | "video-script" | "meeting-prep" | "after-call"): string {
  const name = prospect.name || "";
  if (type === "chat") {
    return `Hey ${name},

Schön dass du geschrieben hast! Um dir direkt weiterzuhelfen:
${prospect.interest === "product" ? "Was ist dein Hauptfokus? Haut, Energie, Fitness? Dann empfehle ich dir das Richtige." : "Was hat dich an Network Marketing / LR am meisten angesprochen?"}

Ich antworte jedem persönlich — kein Bot. Schreib gerne ehrlich.`;
  }
  if (type === "video-script") {
    return `[Szene: Nova schaut direkt in die Kamera, warm lächelnd]

"Hi ${name}, das ist persönlich für dich. Ich habe gesehen, dass du dich für ${INTEREST_CONFIG[prospect.interest].label} interessierst — und ich will dir in 60 Sekunden zeigen, was wirklich wichtig ist.

[Cut zu: Kurze Visualisierung des Themas]

Erstens: Es gibt keinen richtigen Zeitpunkt. Zweitens: Die meisten wünschen sich, sie hätten früher angefangen.

[Cut zurück zu Nova]

Wenn du magst, machen wir 15 Min per Video-Call. Kein Verkaufsdruck — ich erklär dir ehrlich wie es bei mir funktioniert hat. Schreib mir einfach 'CALL'. Bis später."`;
  }
  if (type === "meeting-prep") {
    return `# BRIEFING FÜR CALL MIT ${(name || "LEAD").toUpperCase()}

## Status
- Quelle: ${SOURCE_LABELS[prospect.source]}
- Interesse: ${INTEREST_CONFIG[prospect.interest].label}
- Temperatur: ${URGENCY_CONFIG[prospect.urgency].label}
${prospect.notes ? `- Notizen: ${prospect.notes}` : ""}

## Einwände, die wahrscheinlich kommen
${prospect.objections.length > 0 ? prospect.objections.map(o => `- "${o}"`).join("\n") : "- Keine bekannt"}

## 3 Eisbrecher-Fragen
1. "Bevor wir loslegen — was war der Auslöser dass du dich gemeldet hast?"
2. "Wo würdest du dich heute einschätzen: suchst du Nebeneinkommen, Hauptberuf oder einfach Produkte?"
3. "Hast du vorher schon Network Marketing gesehen oder wäre das dein erster Kontakt?"

## Call-Opening (aus Mathias-Style)
${generateCallOpening(prospect)}

## Follow-up nach dem Call (vorbereitet)
Wird nach dem Call generiert basierend auf Verlauf.`;
  }
  return `Hey ${name}, danke für den Call heute!

Kurze Zusammenfassung was wir besprochen haben:
- Dein Fokus: ${INTEREST_CONFIG[prospect.interest].label}
- Dein nächster Schritt: [je nach Call eintragen]

Wie versprochen sende ich dir:
[Dokumente / Links hier]

Bei Fragen: einfach DM — ich antworte persönlich innerhalb von 24h.

PS: Nächster Schritt ist bei dir. Kein Druck. Ich freue mich wenn du dich meldest.`;
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
        toast.success(`${label || "Kopiert"}`);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {label || "Copy"}
    </Button>
  );
}

export default function LinaSalesConciergePage() {
  const [prospects] = useState<ProspectIntent[]>(INITIAL_PROSPECTS);
  const [selectedId, setSelectedId] = useState<string | null>(INITIAL_PROSPECTS[0].id);
  const [simulatedText, setSimulatedText] = useState("");

  const selected = prospects.find(p => p.id === selectedId);

  const simulateNewLead = () => {
    if (!simulatedText.trim()) {
      toast.error("Text eingeben");
      return;
    }
    // Simuliere Klassifizierung
    const t = simulatedText.toLowerCase();
    const interest: Interest = /preis|produkt|gel|vitamin|aloe/i.test(t) ? "product" : /business|geld|nebenverdienst|job/i.test(t) ? "business" : /\?/.test(t) ? "unclear" : "both";
    const urgency: Urgency = /sofort|jetzt|heute|dringend|anfangen/i.test(t) ? "hot" : /interess|mehr info|wie/i.test(t) ? "warm" : "cold";
    const path: Path = urgency === "hot" ? "voice" : interest === "product" ? "chat" : "video";

    toast.success(`Klassifiziert: ${INTEREST_CONFIG[interest].label} · ${URGENCY_CONFIG[urgency].label} · Empfehlung: ${PATH_CONFIG[path].label}`);
  };

  const counts = useMemo(() => ({
    hot: prospects.filter(p => p.urgency === "hot").length,
    warm: prospects.filter(p => p.urgency === "warm").length,
    cold: prospects.filter(p => p.urgency === "cold").length,
  }), [prospects]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Bot className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold gold-text" style={{ fontFamily: "var(--font-heading)" }}>
            Lina Sales Concierge
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Das B2C-Gesicht von Lina für Erstkontakt, Vorqualifizierung und Terminvorbereitung.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card><CardContent className="p-3 text-center">
          <Flame className="h-5 w-5 text-red-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-red-400">{counts.hot}</div>
          <div className="text-[10px] text-muted-foreground">Hot Leads</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Flame className="h-5 w-5 text-amber-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-amber-400">{counts.warm}</div>
          <div className="text-[10px] text-muted-foreground">Warm Leads</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Flame className="h-5 w-5 text-blue-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-blue-400">{counts.cold}</div>
          <div className="text-[10px] text-muted-foreground">Cold Leads</div>
        </CardContent></Card>
      </div>

      {/* Simulator */}
      <Card className="border-primary/30">
        <CardContent className="p-4 space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Neuen Lead simulieren
          </h2>
          <Textarea
            placeholder="Beispiel-Text einfügen: 'Hallo! Ich habe dein Reel gesehen und frage mich, wie ich bei LR anfangen kann...'"
            value={simulatedText}
            onChange={(e) => setSimulatedText(e.target.value)}
            rows={3}
          />
          <Button className="btn-gold" onClick={simulateNewLead} disabled={!simulatedText.trim()}>
            <Play className="h-4 w-4 mr-1" /> Lina klassifizieren lassen
          </Button>
        </CardContent>
      </Card>

      {/* Prospect List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Aktive Leads ({prospects.length})</h2>
          {prospects.map(p => {
            const IntIcon = INTEREST_CONFIG[p.interest].icon;
            const PathIcon = PATH_CONFIG[p.recommendedPath].icon;
            return (
              <Card
                key={p.id}
                className={`cursor-pointer ${selectedId === p.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"}`}
                onClick={() => setSelectedId(p.id)}
              >
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{p.name || "Anonymous Lead"}</p>
                    <Badge variant="outline" className={`text-[9px] ${URGENCY_CONFIG[p.urgency].color}`}>
                      {URGENCY_CONFIG[p.urgency].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <Badge variant="outline" className="text-[9px]">{SOURCE_LABELS[p.source]}</Badge>
                    <Badge variant="outline" className={`text-[9px] ${INTEREST_CONFIG[p.interest].color}`}>
                      <IntIcon className="h-2.5 w-2.5 mr-0.5" /> {INTEREST_CONFIG[p.interest].label}
                    </Badge>
                    <Badge variant="outline" className="text-[9px]">
                      <PathIcon className="h-2.5 w-2.5 mr-0.5" /> {PATH_CONFIG[p.recommendedPath].label}
                    </Badge>
                  </div>
                  {p.notes && (
                    <p className="text-[10px] text-muted-foreground line-clamp-2">{p.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <Card className="border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-bold">{selected.name || "Lead"}</h3>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{SOURCE_LABELS[selected.source]}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${INTEREST_CONFIG[selected.interest].color}`}>
                        {INTEREST_CONFIG[selected.interest].label}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] ${URGENCY_CONFIG[selected.urgency].color}`}>
                        {URGENCY_CONFIG[selected.urgency].label}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Sparkles className="h-3 w-3" /> Empfohlen: {PATH_CONFIG[selected.recommendedPath].label}
                  </Badge>
                </div>

                {selected.notes && (
                  <p className="text-xs text-muted-foreground mb-3 p-2 rounded bg-background/50 border border-border/50">
                    {selected.notes}
                  </p>
                )}

                {selected.objections.length > 0 && (
                  <div className="mb-3">
                    <label className="text-[10px] uppercase font-semibold text-amber-400 mb-1 flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Erwartete Einwände
                    </label>
                    <div className="flex gap-1 flex-wrap">
                      {selected.objections.map((o, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                          "{o}"
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Tabs defaultValue={selected.recommendedPath}>
                  <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="chat" className="text-[10px]">
                      <MessageSquare className="h-3 w-3 mr-1" /> Chat
                    </TabsTrigger>
                    <TabsTrigger value="voice" className="text-[10px]">
                      <Phone className="h-3 w-3 mr-1" /> Voice
                    </TabsTrigger>
                    <TabsTrigger value="video" className="text-[10px]">
                      <Video className="h-3 w-3 mr-1" /> Video
                    </TabsTrigger>
                    <TabsTrigger value="meeting" className="text-[10px]">
                      <Calendar className="h-3 w-3 mr-1" /> Meeting
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="chat" className="mt-3 space-y-2">
                    <div className="p-3 rounded bg-primary/5 border border-primary/20">
                      <pre className="text-xs whitespace-pre-wrap font-sans">
                        {generateFollowupMessage(selected, "chat")}
                      </pre>
                    </div>
                    <CopyButton text={generateFollowupMessage(selected, "chat")} label="Chat-DM kopieren" />
                  </TabsContent>

                  <TabsContent value="voice" className="mt-3 space-y-2">
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground">Call-Opening (Mathias-Style)</label>
                    <div className="p-3 rounded bg-primary/5 border border-primary/20">
                      <pre className="text-xs whitespace-pre-wrap font-sans">
                        {generateCallOpening(selected)}
                      </pre>
                    </div>
                    <div className="flex gap-2">
                      <CopyButton text={generateCallOpening(selected)} label="Opening kopieren" />
                      <Button size="sm" variant="outline" className="text-xs">
                        <Phone className="h-3 w-3 mr-1" /> Call starten (Placeholder)
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="video" className="mt-3 space-y-2">
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground">Video-Message-Script (Nova-Persona)</label>
                    <div className="p-3 rounded bg-primary/5 border border-primary/20">
                      <pre className="text-xs whitespace-pre-wrap font-sans">
                        {generateFollowupMessage(selected, "video-script")}
                      </pre>
                    </div>
                    <div className="flex gap-2">
                      <CopyButton text={generateFollowupMessage(selected, "video-script")} label="Script kopieren" />
                      <Button size="sm" variant="outline" className="text-xs">
                        <Video className="h-3 w-3 mr-1" /> An Lina Avatar senden
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="meeting" className="mt-3 space-y-2">
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground">Meeting-Briefing</label>
                    <div className="p-3 rounded bg-primary/5 border border-primary/20 max-h-96 overflow-y-auto">
                      <pre className="text-[10px] whitespace-pre-wrap font-mono">
                        {generateFollowupMessage(selected, "meeting-prep")}
                      </pre>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <CopyButton text={generateFollowupMessage(selected, "meeting-prep")} label="Briefing kopieren" />
                      <Button size="sm" variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" /> Calendly-Link (Placeholder)
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-border/50">
              <CardContent className="p-6 text-center">
                <Bot className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground mt-2">Wähle einen Lead für Lina-Interaktion.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Optional an Manus:</p>
          <p className="text-muted-foreground">
            Neue Endpoints: <code>linaSales.classifyProspect</code>, <code>linaSales.buildBriefing</code>, <code>linaSales.generateFollowup</code>. Integration mit Calendly, CRM (HubSpot/Monday), ElevenLabs für Voice-Calls, HeyGen für Video-Messages.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
