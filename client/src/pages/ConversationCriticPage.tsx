import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  MessageSquare, Phone, Mail, Wand2, Loader2, Copy, Check,
  ThumbsUp, ThumbsDown, AlertTriangle, TrendingUp, Save, Bot,
  Sparkles, Target, Volume2, Smile
} from "lucide-react";
import { toast } from "sonner";

/**
 * CONVERSATION CRITIC — Debrief-System nach Sales-Gesprächen
 *
 * Analysiert Transkripte und generiert Coaching-Signale.
 * Vergleich Original vs. Top-Closer-Version vs. Mathias-Style.
 */

type SourceType = "call" | "dm" | "chat";

interface ConversationMoment {
  id: string;
  timestamp?: string;
  label: string;
  issue: string;
  improvedVersion: string;
  severity: "minor" | "major" | "critical";
}

interface ConversationReview {
  id: string;
  sourceType: SourceType;
  transcript: string;
  scores: {
    rapport: number;
    clarity: number;
    objectionHandling: number;
    closing: number;
  };
  moments: ConversationMoment[];
  topCloserVersion?: string;
  mathiasVersion?: string;
  overallScore: number;
}

const SOURCE_CONFIG: Record<SourceType, { label: string; icon: typeof Phone; color: string }> = {
  call: { label: "Call", icon: Phone, color: "text-emerald-400" },
  dm: { label: "DM", icon: MessageSquare, color: "text-blue-400" },
  chat: { label: "Chat", icon: Mail, color: "text-primary" },
};

const SEVERITY_CONFIG: Record<ConversationMoment["severity"], { label: string; color: string }> = {
  minor: { label: "Klein", color: "text-amber-400 border-amber-500/30 bg-amber-500/5" },
  major: { label: "Wichtig", color: "text-orange-400 border-orange-500/30 bg-orange-500/5" },
  critical: { label: "Kritisch", color: "text-red-400 border-red-500/50 bg-red-500/10" },
};

function analyzeTranscript(transcript: string, source: SourceType): ConversationReview {
  const t = transcript.toLowerCase();

  // Rapport-Score: Wärme-Signale
  const rapportSignals = ["hey", "danke", "schön", "cool", "klar", "verstehe", "freut mich", "gerne"];
  const rapportScore = Math.min(100, 40 + rapportSignals.filter(s => t.includes(s)).length * 10);

  // Clarity: kurze klare Sätze
  const avgSentenceLen = transcript.split(/[.!?]/).filter(s => s.trim()).reduce((a, s) => a + s.split(" ").length, 0) / Math.max(1, transcript.split(/[.!?]/).length);
  const clarityScore = Math.min(100, avgSentenceLen > 25 ? 40 : avgSentenceLen > 15 ? 65 : 85);

  // Objection Handling
  const objections = ["nein", "aber", "skep", "preis", "teuer", "zeit", "unsicher"];
  const objectionsFound = objections.filter(o => t.includes(o)).length;
  const hasGoodReframe = /verstehe|berechtigt|nachvollzieh|stimmt/i.test(t);
  const objectionHandling = objectionsFound > 0 ? (hasGoodReframe ? 75 : 50) : 85;

  // Closing
  const closingSignals = ["nächster schritt", "let's go", "entscheidung", "wann", "termin", "abmachen", "starten", "loslegen"];
  const hasClosing = closingSignals.some(c => t.includes(c));
  const closing = hasClosing ? 80 : 45;

  // Moments identifizieren
  const moments: ConversationMoment[] = [];
  if (t.includes("keine zeit")) {
    moments.push({
      id: "m-1",
      label: "Einwand 'keine Zeit' nicht professionell entkräftet",
      issue: "Einwand wurde akzeptiert statt umgedeutet. Du hast 'Verstehe, dann...' geantwortet — das schließt die Tür.",
      improvedVersion: "'Klar, Zeit ist der Klassiker. Aber mal andersrum: Wie viel Zeit verbringst du aktuell damit, dich über Geld zu sorgen? Das 15-Min-Gespräch könnte genau das in 6 Monaten eliminieren.'",
      severity: "major",
    });
  }
  if (t.includes("teuer") || t.includes("zu teuer")) {
    moments.push({
      id: "m-2",
      label: "Preis-Einwand defensiv beantwortet",
      issue: "Du hast den Preis gerechtfertigt, statt den Wert neu zu framen.",
      improvedVersion: "'Ja, das ist eine Investition. Aber die Frage ist nicht: Was kostet es? Sondern: Was kostet es dich, wenn du in einem Jahr nichts geändert hast?'",
      severity: "critical",
    });
  }
  if (!hasClosing) {
    moments.push({
      id: "m-3",
      label: "Kein klares Closing",
      issue: "Das Gespräch endete ohne konkrete nächste Aktion. Damit wird aus 80% Interesse 0% Ergebnis.",
      improvedVersion: "'Cool, dann lass uns Folgendes machen: Ich schick dir heute den kompakten Guide, du liest ihn bis morgen, und morgen Abend sprechen wir 15 Minuten. Deal?'",
      severity: "critical",
    });
  }
  if (transcript.length > 200 && avgSentenceLen > 25) {
    moments.push({
      id: "m-4",
      label: "Zu lange Sätze",
      issue: "Durchschnittlich über 25 Wörter pro Satz. Das verliert Leute.",
      improvedVersion: "Kürzere Sätze. Max. 15 Wörter. Pause. Atmen lassen. Fragen stellen.",
      severity: "minor",
    });
  }

  const overallScore = Math.round((rapportScore + clarityScore + objectionHandling + closing) / 4);

  const topCloserVersion = `[TOP CLOSER VERSION]

Rapport:
"Hey [Name], bevor wir reingehen — wie war dein Tag bisher? Echt jetzt, nicht Smalltalk."

Hook:
"Das Thema, wo du dich gemeldet hast — das ist für 99% der Leute das, was sie EHRLICH wollen. Lass uns direkt sein: Was steht für dich auf dem Spiel, wenn du in 12 Monaten GENAU DA stehst wo du heute bist?"

Einwand-Framing (vorweg):
"Normalerweise kommt jetzt 'ich hab keine Zeit' oder 'das ist zu teuer'. Darauf antworte ich immer: Wenn es dir das wert wäre, wärst du nicht in diesem Call."

Closing:
"3 Optionen:
1. Du startest heute, alles klar, wir setzen dich auf.
2. Du brauchst noch 1 Woche — ich geb dir den Guide, du meldest dich Dienstag.
3. Es ist einfach nicht dein Ding — auch cool, bin ehrlich froh dass du's geklärt hast.
Welche?"`;

  const mathiasVersion = `[MATHIAS-STYLE VERSION]

Öffnung (sofort auf Augenhöhe):
"Ok, du bist hier — das heißt du willst was ändern. Sag mir: Was nervt dich gerade am meisten in deinem Alltag?"

Einwand-Pattern:
"Klar verstehe ich das. Jeder den ich dazu geholt hab, hatte den gleichen Einwand. 12 Monate später sagen die alle: Warum hab ich nicht einfach angefangen?"

Close:
"Also schau — du hast jetzt alles gehört. Du weißt was es bringt, du weißt was es kostet. Entweder wir fangen heute an und du bist in 90 Tagen wo du sein willst. Oder du sagst 'eh nicht' und scrollst weiter. Beides fein. Was ist es?"`;

  return {
    id: `review-${Date.now()}`,
    sourceType: source,
    transcript,
    scores: {
      rapport: rapportScore,
      clarity: clarityScore,
      objectionHandling,
      closing,
    },
    moments,
    topCloserVersion,
    mathiasVersion,
    overallScore,
  };
}

function ScoreBar({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: typeof Smile }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground w-32 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="font-semibold w-10 text-right">{value}/100</span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
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
        toast.success("Kopiert");
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      Copy
    </Button>
  );
}

const SAMPLE_TRANSCRIPTS: Record<SourceType, string> = {
  call: `Partner: Hey Lisa, wie geht's dir heute?
Lisa: Ja passt schon, bisschen stressig. Aber gut dass wir jetzt sprechen.
Partner: Schön. Also, erzähl mal — du hast dich für das Business-Modell interessiert, richtig?
Lisa: Ja, aber ehrlich gesagt weiß ich nicht ob ich Zeit dafür habe. Ich arbeite Vollzeit und hab zwei Kinder.
Partner: Verstehe. Dann ist es vielleicht zu viel gerade.
Lisa: Ja, wahrscheinlich. Und das ist mir auch zu teuer irgendwie.
Partner: Ok, dann schick ich dir nochmal Infos und du meldest dich wenn du magst.
Lisa: Ja gerne, mach das. Tschüss.`,
  dm: `Interessent: Wie viel kostet das denn eigentlich?
Ich: Also das kommt drauf an, wir haben verschiedene Pakete und die Preise sind unterschiedlich je nach Einstieg.
Interessent: Ok, gib mir mal eine Range.
Ich: Zwischen 200 und 2000 Euro.
Interessent: Wow, das ist viel. Muss ich überlegen.`,
  chat: `Person: Hi, ich habe deine Story gesehen und frage mich ob das wirklich funktioniert.
Ich: Hey! Ja, das funktioniert bei mir seit 18 Monaten super.
Person: Aber man hört ja oft, dass solche Sachen Schneeballsysteme sind.
Ich: Ist es aber nicht.
Person: Ok.`,
};

export default function ConversationCriticPage() {
  const [source, setSource] = useState<SourceType>("call");
  const [transcript, setTranscript] = useState("");
  const [review, setReview] = useState<ConversationReview | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const loadSample = () => {
    setTranscript(SAMPLE_TRANSCRIPTS[source]);
    toast.info("Beispiel geladen");
  };

  const analyze = async () => {
    if (!transcript.trim()) {
      toast.error("Transkript einfügen");
      return;
    }
    setAnalyzing(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      setReview(analyzeTranscript(transcript, source));
      toast.success("Analyse fertig");
    } finally {
      setAnalyzing(false);
    }
  };

  const saveLearning = () => {
    if (!review) return;
    const learnings = review.moments.map(m => `- ${m.label}: ${m.improvedVersion}`).join("\n");
    localStorage.setItem(`team-memory-${Date.now()}`, learnings);
    toast.success("Learning im Team Memory gespeichert");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gold-text" style={{ fontFamily: "var(--font-heading)" }}>
          Conversation Critic
        </h1>
        <p className="text-sm text-muted-foreground">
          Debrief nach jedem Sales-Gespräch. Scores, kritische Momente, bessere Versionen.
        </p>
      </div>

      <Card className="border-primary/30">
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            {(Object.keys(SOURCE_CONFIG) as SourceType[]).map(s => {
              const cfg = SOURCE_CONFIG[s];
              const Icon = cfg.icon;
              return (
                <Button
                  key={s}
                  size="sm"
                  variant={source === s ? "default" : "outline"}
                  className={source === s ? "btn-gold" : ""}
                  onClick={() => setSource(s)}
                >
                  <Icon className={`h-3 w-3 mr-1 ${source !== s ? cfg.color : ""}`} />
                  {cfg.label}
                </Button>
              );
            })}
            <Button size="sm" variant="outline" onClick={loadSample}>Beispiel laden</Button>
          </div>
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Füge hier dein Gespräch / deine DMs / dein Chat-Transkript ein..."
            rows={8}
          />
          <Button className="btn-gold w-full" onClick={analyze} disabled={analyzing || !transcript.trim()}>
            {analyzing ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Analysiere...</>
            ) : (
              <><Wand2 className="h-4 w-4 mr-1" /> Analysieren</>
            )}
          </Button>
        </CardContent>
      </Card>

      {review && (
        <>
          {/* Scorecard */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Gesamt-Score</h2>
                <div className="text-3xl font-bold text-primary">{review.overallScore}/100</div>
              </div>
              <div className="space-y-2">
                <ScoreBar label="Rapport / Wärme" value={review.scores.rapport} color="bg-emerald-400" icon={Smile} />
                <ScoreBar label="Klarheit" value={review.scores.clarity} color="bg-blue-400" icon={Volume2} />
                <ScoreBar label="Einwand-Handling" value={review.scores.objectionHandling} color="bg-amber-400" icon={AlertTriangle} />
                <ScoreBar label="Closing" value={review.scores.closing} color="bg-primary" icon={Target} />
              </div>
            </CardContent>
          </Card>

          {/* Critical Moments */}
          {review.moments.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Kritische Momente ({review.moments.length})
              </h2>
              <div className="space-y-2">
                {review.moments.map(m => {
                  const cfg = SEVERITY_CONFIG[m.severity];
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Card className={`border ${cfg.color}`}>
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-1 mb-1">
                                <Badge variant="outline" className={`text-[9px] ${cfg.color}`}>{cfg.label}</Badge>
                                <p className="text-sm font-semibold">{m.label}</p>
                              </div>
                              <p className="text-xs text-muted-foreground">{m.issue}</p>
                            </div>
                          </div>
                          <div className="mt-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                            <div className="flex items-center gap-1 mb-1">
                              <ThumbsUp className="h-3 w-3 text-emerald-400" />
                              <span className="text-[10px] uppercase font-semibold text-emerald-400">Bessere Version</span>
                            </div>
                            <p className="text-xs">{m.improvedVersion}</p>
                            <div className="mt-1">
                              <CopyButton text={m.improvedVersion} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Closer vs. Mathias */}
          <Tabs defaultValue="top-closer">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="top-closer">🏆 Top-Closer-Version</TabsTrigger>
              <TabsTrigger value="mathias">⚡ Mathias-Style</TabsTrigger>
            </TabsList>
            <TabsContent value="top-closer" className="mt-3">
              <Card className="border-emerald-500/30">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-400" /> Wie ein Top Closer es gemacht hätte
                    </h3>
                    <CopyButton text={review.topCloserVersion || ""} />
                  </div>
                  <pre className="text-xs whitespace-pre-wrap font-sans p-3 rounded bg-background/50 border border-border/50">
                    {review.topCloserVersion}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="mathias" className="mt-3">
              <Card className="border-primary/30">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" /> Mathias-Style (direkt, bodenständig)
                    </h3>
                    <CopyButton text={review.mathiasVersion || ""} />
                  </div>
                  <pre className="text-xs whitespace-pre-wrap font-sans p-3 rounded bg-background/50 border border-border/50">
                    {review.mathiasVersion}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Learning */}
          <div className="flex justify-center">
            <Button size="lg" className="btn-gold" onClick={saveLearning}>
              <Save className="h-4 w-4 mr-1" /> Learnings in Team Memory speichern
            </Button>
          </div>
        </>
      )}

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Optional an Manus:</p>
          <p className="text-muted-foreground">
            Neue Endpoints: <code>conversationCritic.review</code>, <code>conversationCritic.compareTopCloser</code>, <code>conversationCritic.saveLearning</code>. Mit Whisper für Audio-Calls + LLM für Moment-Erkennung.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
