import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  Users, Wand2, Loader2, Eye, MessageSquare, Phone, SkipForward,
  TrendingUp, ArrowLeftRight, Download, Target
} from "lucide-react";
import { toast } from "sonner";

/**
 * SYNTHETIC PROSPECT ROOM — Teste Content gegen simulierte Interessenten
 *
 * 20 Personas × Hook/CTA/Pitch → Reaktions-Matrix.
 * Preflight-Labor vor dem Posten.
 */

type Reaction = "ignore" | "watch" | "comment" | "dm" | "book";

interface ProspectPersona {
  id: string;
  label: string;
  emoji: string;
  motive: string;
  objections: string[];
  communicationStyle: string;
  platform: string;
  triggers: string[];
  blockers: string[];
}

interface SimulationResult {
  personaId: string;
  reaction: Reaction;
  reason: string;
  score: number;
}

const PERSONAS: ProspectPersona[] = [
  { id: "p1", label: "Alleinerziehende Mutter", emoji: "👩‍👧", motive: "Finanzielle Sicherheit für Kinder", objections: ["Keine Zeit", "Risiko"], communicationStyle: "warm, ehrlich", platform: "Facebook", triggers: ["Familie", "Freiheit", "Flexibel"], blockers: ["Hype", "Druck", "Komplexität"] },
  { id: "p2", label: "Junger Krankenpfleger", emoji: "👨‍⚕️", motive: "Weg vom Schichtsystem", objections: ["MLM-Vorbehalt"], communicationStyle: "direkt, skeptisch", platform: "Instagram", triggers: ["Nebeneinkommen", "Flexibel", "Real"], blockers: ["Versprechen", "Guru-Vibe"] },
  { id: "p3", label: "Selbstständiger Handwerker", emoji: "🔨", motive: "Passives Einkommen", objections: ["Zeit", "Nicht Verkäufer"], communicationStyle: "pragmatisch", platform: "Facebook", triggers: ["System", "Einmal aufbauen"], blockers: ["Social Media Kram", "Posen"] },
  { id: "p4", label: "Fitness-Enthusiastin 25+", emoji: "💪", motive: "Authentische Brand aufbauen", objections: ["Produkt-Qualität"], communicationStyle: "energetisch", platform: "Instagram", triggers: ["Performance", "Results", "Community"], blockers: ["Fake-Products"] },
  { id: "p5", label: "Lehrerin in Elternzeit", emoji: "👩‍🏫", motive: "Eigenes kleines Business", objections: ["Zeit mit Baby", "Technik"], communicationStyle: "vorsichtig, reflektiert", platform: "Instagram", triggers: ["Flexibel", "Von Zuhause", "Langsam starten"], blockers: ["Hustle-Culture"] },
  { id: "p6", label: "Ex-Angestellter 45+", emoji: "👨‍💼", motive: "Nochmal durchstarten", objections: ["Zu alt", "Digital?"], communicationStyle: "seriös", platform: "LinkedIn", triggers: ["Erfahrung zählt", "System", "Mentor"], blockers: ["Duz-Kultur", "Hype"] },
  { id: "p7", label: "Student BWL", emoji: "🎓", motive: "Skills + Nebenverdienst", objections: ["Kein Geld für Start"], communicationStyle: "analytisch", platform: "TikTok", triggers: ["Zahlen", "Business-Modell", "Skalierung"], blockers: ["Bauchgefühl-Argumente"] },
  { id: "p8", label: "Yoga-Lehrerin", emoji: "🧘", motive: "Ganzheitlicher Lifestyle + Income", objections: ["Kommerziell?"], communicationStyle: "sanft, spirituell", platform: "Instagram", triggers: ["Werte", "Wellness", "Gemeinschaft"], blockers: ["Aggressives Marketing"] },
  { id: "p9", label: "Zweifelnder Beamter", emoji: "🏛️", motive: "Sicherheit + Nebeneinkommen", objections: ["Ist MLM erlaubt?"], communicationStyle: "abwägend", platform: "Facebook", triggers: ["Rechtssicherheit", "Seriös", "Klar"], blockers: ["Graubereich-Feeling"] },
  { id: "p10", label: "Influencer-Aspirant", emoji: "📱", motive: "Monetarisierung seiner Reichweite", objections: ["Eigene Brand leidet"], communicationStyle: "trendbewusst", platform: "TikTok", triggers: ["Content", "Viral", "Passive Income"], blockers: ["Cringe-Produkte"] },
  { id: "p11", label: "Rentner aktiv", emoji: "👴", motive: "Sinnvolle Beschäftigung", objections: ["Technik-Hürde"], communicationStyle: "höflich, bedacht", platform: "Facebook", triggers: ["Einfach", "Erklärt", "Wie in meiner Zeit"], blockers: ["Englisch-Lastig", "Zu schnell"] },
  { id: "p12", label: "Kritischer Journalist", emoji: "📰", motive: "Verstehen wie's funktioniert", objections: ["Alles Scam?"], communicationStyle: "investigativ", platform: "LinkedIn", triggers: ["Transparenz", "Zahlen", "Quellen"], blockers: ["Marketing-Sprech"] },
  { id: "p13", label: "Work-from-Home Mom", emoji: "🏡", motive: "Business neben Kindern", objections: ["Keine Ruhe zum Posten"], communicationStyle: "geduldig, multitaskend", platform: "Instagram", triggers: ["Asynchron", "Schnell-Content", "Community"], blockers: ["Live-Events", "Rigide Zeitpläne"] },
  { id: "p14", label: "Burnout-Genesen", emoji: "🕊️", motive: "Weniger Stress, mehr Sinn", objections: ["Gleich wieder Druck?"], communicationStyle: "zurückhaltend", platform: "Facebook", triggers: ["Langsam", "Selbstbestimmt", "Menschlich"], blockers: ["Grind-Culture"] },
  { id: "p15", label: "Ex-Top-Sales aus Pharma", emoji: "💼", motive: "Eigenes Business statt Konzern", objections: ["Wieder verkaufen?"], communicationStyle: "professionell", platform: "LinkedIn", triggers: ["System", "Skalierung", "Autonomie"], blockers: ["Amateur-Vibe"] },
  { id: "p16", label: "Reise-Nomade 30+", emoji: "🌍", motive: "Ortsunabhängiges Einkommen", objections: ["Internet-Abhängig?"], communicationStyle: "offen", platform: "Instagram", triggers: ["Digital", "Flexibel", "Global"], blockers: ["Lokalisiert/deutsch-only"] },
  { id: "p17", label: "Skeptische Ehefrau", emoji: "👭", motive: "Eigene Einnahmen unabhängig", objections: ["Partner findet MLM doof"], communicationStyle: "strategisch", platform: "Facebook", triggers: ["Beweise", "Frauen-Community"], blockers: ["Offen männlich-dominant"] },
  { id: "p18", label: "Pharma-kritischer Biohacker", emoji: "🧬", motive: "Natural Supplements", objections: ["Produkt-Qualität"], communicationStyle: "wissenschaftlich", platform: "Instagram", triggers: ["Ingredienten", "Studien", "Bio"], blockers: ["Hype ohne Fakten"] },
  { id: "p19", label: "Junger Familienvater", emoji: "👨‍👩‍👧", motive: "Mehr Zeit mit Kindern", objections: ["Zusätzliche Zeit-Investition"], communicationStyle: "emotional", platform: "Instagram", triggers: ["Familie first", "Langfristig"], blockers: ["Schnell-Reich-Versprechen"] },
  { id: "p20", label: "Social Media Aversiv", emoji: "🙅", motive: "Nebeneinkommen ohne Insta-Posten", objections: ["Ich poste nie selbst"], communicationStyle: "distanziert", platform: "Email", triggers: ["Offline-Methoden", "1-to-1"], blockers: ["Muss täglich Content machen"] },
];

function simulateReaction(asset: string, persona: ProspectPersona): SimulationResult {
  const text = asset.toLowerCase();
  let score = 30;
  let reasons: string[] = [];

  // Trigger-Match
  const triggerHits = persona.triggers.filter(t => text.includes(t.toLowerCase())).length;
  if (triggerHits > 0) {
    score += triggerHits * 15;
    reasons.push(`Trifft ${triggerHits} Motiv${triggerHits === 1 ? "" : "e"}`);
  }

  // Blocker-Match (negativ)
  const blockerHits = persona.blockers.filter(b => text.includes(b.toLowerCase())).length;
  if (blockerHits > 0) {
    score -= blockerHits * 20;
    reasons.push(`Verletzt ${blockerHits} Blocker`);
  }

  // Objection-Handling prüfen
  const hasEmpathy = /verstehe|normal|kenne|auch so|auch gewesen/.test(text);
  if (hasEmpathy) {
    score += 15;
    reasons.push("Empathie erkennbar");
  }

  // Hook-Stärke
  const hasShock = /warum|niemand|geheim|wahrheit|nie/.test(text);
  if (hasShock && persona.communicationStyle.includes("analytisch")) {
    score -= 5; // Analytiker mögen keinen Shock-Content
    reasons.push("Shock-Hook wirkt unseriös für diese Persona");
  } else if (hasShock) {
    score += 10;
  }

  // CTA vorhanden
  const hasCTA = /kommentier|dm|schreib|link|start/.test(text);
  if (hasCTA) {
    score += 10;
    reasons.push("Klarer CTA");
  }

  // Persona-spezifische Boosts
  if (persona.id === "p2" && /ehrlich|real/.test(text)) score += 15;
  if (persona.id === "p6" && text.length > 200) score += 10;
  if (persona.id === "p7" && /\d+%|\d+€/.test(text)) score += 20;
  if (persona.id === "p12" && /studie|quelle|daten/.test(text)) score += 25;
  if (persona.id === "p20" && /social media/.test(text)) score -= 25;

  score = Math.max(0, Math.min(100, score));

  let reaction: Reaction;
  if (score >= 80) reaction = "book";
  else if (score >= 65) reaction = "dm";
  else if (score >= 50) reaction = "comment";
  else if (score >= 30) reaction = "watch";
  else reaction = "ignore";

  return {
    personaId: persona.id,
    reaction,
    reason: reasons.length > 0 ? reasons.join(" · ") : "Neutrale Reaktion",
    score,
  };
}

const REACTION_CONFIG: Record<Reaction, { label: string; icon: typeof Eye; color: string; bg: string }> = {
  ignore: { label: "Ignoriert", icon: SkipForward, color: "text-muted-foreground", bg: "bg-muted/30" },
  watch: { label: "Schaut zu", icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10" },
  comment: { label: "Kommentiert", icon: MessageSquare, color: "text-amber-400", bg: "bg-amber-500/10" },
  dm: { label: "Schreibt DM", icon: MessageSquare, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  book: { label: "Bucht Termin", icon: Phone, color: "text-primary", bg: "bg-primary/20" },
};

export default function SyntheticProspectRoomPage() {
  const [asset, setAsset] = useState("");
  const [compareAsset, setCompareAsset] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [compareResults, setCompareResults] = useState<SimulationResult[]>([]);
  const [running, setRunning] = useState(false);

  const runSimulation = async () => {
    if (!asset.trim()) {
      toast.error("Asset-Text eingeben");
      return;
    }
    setRunning(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      setResults(PERSONAS.map(p => simulateReaction(asset, p)));
      if (compareMode && compareAsset.trim()) {
        setCompareResults(PERSONAS.map(p => simulateReaction(compareAsset, p)));
      }
      toast.success(`${PERSONAS.length} Personas simuliert`);
    } finally {
      setRunning(false);
    }
  };

  const aggregated = useMemo(() => {
    const counts: Record<Reaction, number> = { ignore: 0, watch: 0, comment: 0, dm: 0, book: 0 };
    results.forEach(r => counts[r.reaction]++);
    const avgScore = results.length ? results.reduce((a, r) => a + r.score, 0) / results.length : 0;
    return { counts, avgScore };
  }, [results]);

  const compareAggregated = useMemo(() => {
    const counts: Record<Reaction, number> = { ignore: 0, watch: 0, comment: 0, dm: 0, book: 0 };
    compareResults.forEach(r => counts[r.reaction]++);
    const avgScore = compareResults.length ? compareResults.reduce((a, r) => a + r.score, 0) / compareResults.length : 0;
    return { counts, avgScore };
  }, [compareResults]);

  const selectedPersona = PERSONAS.find(p => p.id === selectedPersonaId);
  const selectedResult = results.find(r => r.personaId === selectedPersonaId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gold-text" style={{ fontFamily: "var(--font-heading)" }}>
          Synthetic Prospect Room
        </h1>
        <p className="text-sm text-muted-foreground">
          Teste Hook, CTA, Pitch gegen 20 simulierte Interessenten. Preflight vor dem Posten.
        </p>
      </div>

      <Card className="border-primary/30">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-[10px] uppercase font-semibold text-muted-foreground">Asset (Hook / Post / CTA)</label>
            <Button
              size="sm"
              variant={compareMode ? "default" : "outline"}
              className={compareMode ? "btn-gold" : ""}
              onClick={() => setCompareMode(!compareMode)}
            >
              <ArrowLeftRight className="h-3 w-3 mr-1" /> Vergleich
            </Button>
          </div>
          <Textarea
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            placeholder="Dein Hook, Post, CTA oder Pitch-Script..."
            rows={4}
          />
          {compareMode && (
            <Textarea
              value={compareAsset}
              onChange={(e) => setCompareAsset(e.target.value)}
              placeholder="Variante B zum Vergleich..."
              rows={4}
              className="border-cyan-500/30"
            />
          )}
          <Button className="btn-gold w-full" onClick={runSimulation} disabled={running || !asset.trim()}>
            {running ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Simuliere...</> : <><Wand2 className="h-4 w-4 mr-1" /> Gegen 20 Prospects testen</>}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <>
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-lg font-bold">Reaktions-Matrix {compareMode && "· Variante A"}</h2>
                <div className="text-2xl font-bold text-primary">⌀ {Math.round(aggregated.avgScore)}/100</div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(REACTION_CONFIG) as Reaction[]).map(r => {
                  const cfg = REACTION_CONFIG[r];
                  const Icon = cfg.icon;
                  return (
                    <div key={r} className={`p-2 rounded text-center ${cfg.bg}`}>
                      <Icon className={`h-4 w-4 mx-auto mb-1 ${cfg.color}`} />
                      <div className={`text-xl font-bold ${cfg.color}`}>{aggregated.counts[r]}</div>
                      <div className="text-[9px] text-muted-foreground">{cfg.label}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {compareMode && compareResults.length > 0 && (
            <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-transparent">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-lg font-bold">Reaktions-Matrix · Variante B</h2>
                  <div className="text-2xl font-bold text-cyan-400">⌀ {Math.round(compareAggregated.avgScore)}/100</div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.keys(REACTION_CONFIG) as Reaction[]).map(r => {
                    const cfg = REACTION_CONFIG[r];
                    const Icon = cfg.icon;
                    return (
                      <div key={r} className={`p-2 rounded text-center ${cfg.bg}`}>
                        <Icon className={`h-4 w-4 mx-auto mb-1 ${cfg.color}`} />
                        <div className={`text-xl font-bold ${cfg.color}`}>{compareAggregated.counts[r]}</div>
                        <div className="text-[9px] text-muted-foreground">{cfg.label}</div>
                      </div>
                    );
                  })}
                </div>
                <div className={`text-center text-sm font-semibold ${compareAggregated.avgScore > aggregated.avgScore ? "text-cyan-400" : "text-primary"}`}>
                  {compareAggregated.avgScore > aggregated.avgScore
                    ? `🏆 Variante B gewinnt (+${Math.round(compareAggregated.avgScore - aggregated.avgScore)} Punkte)`
                    : compareAggregated.avgScore < aggregated.avgScore
                      ? `🏆 Variante A gewinnt (+${Math.round(aggregated.avgScore - compareAggregated.avgScore)} Punkte)`
                      : "Gleichstand"}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Persona Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold mb-2">Einzelne Reaktionen</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {results.map(r => {
                  const persona = PERSONAS.find(p => p.id === r.personaId);
                  const cfg = REACTION_CONFIG[r.reaction];
                  const Icon = cfg.icon;
                  if (!persona) return null;
                  return (
                    <motion.button
                      key={r.personaId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setSelectedPersonaId(r.personaId)}
                      className={`p-2 rounded-lg border-2 transition-all text-center ${cfg.bg} ${
                        selectedPersonaId === r.personaId ? "border-primary" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-xl mb-1">{persona.emoji}</div>
                      <div className="text-[9px] font-semibold line-clamp-1">{persona.label}</div>
                      <div className="flex items-center justify-center gap-0.5 mt-1">
                        <Icon className={`h-2.5 w-2.5 ${cfg.color}`} />
                        <span className={`text-[9px] ${cfg.color}`}>{r.score}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Persona Detail */}
            <div className="lg:sticky lg:top-4 lg:self-start">
              {selectedPersona && selectedResult ? (
                <Card className="border-primary/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{selectedPersona.emoji}</span>
                      <div>
                        <h3 className="text-sm font-bold">{selectedPersona.label}</h3>
                        <p className="text-[10px] text-muted-foreground">{selectedPersona.motive}</p>
                      </div>
                    </div>

                    <div className={`p-3 rounded ${REACTION_CONFIG[selectedResult.reaction].bg}`}>
                      <div className="flex items-center justify-between">
                        <div className={`text-sm font-semibold ${REACTION_CONFIG[selectedResult.reaction].color}`}>
                          {REACTION_CONFIG[selectedResult.reaction].label}
                        </div>
                        <div className="text-lg font-bold">{selectedResult.score}/100</div>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{selectedResult.reason}</p>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase font-semibold text-emerald-400 mb-1">Trigger</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedPersona.triggers.map((t, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">+ {t}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase font-semibold text-red-400 mb-1">Blockers</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedPersona.blockers.map((b, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] text-red-400 border-red-500/30">− {b}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Objections</div>
                      <ul className="text-[10px] space-y-0.5">
                        {selectedPersona.objections.map((o, i) => (
                          <li key={i}>· "{o}"</li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/50">
                      Stil: {selectedPersona.communicationStyle} · Plattform: {selectedPersona.platform}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed border-border/50">
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Klick eine Persona für Details.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Optional an Manus:</p>
          <p className="text-muted-foreground">
            Neue Endpoints: <code>prospectRoom.simulate</code>, <code>prospectRoom.compare</code>, <code>prospectRoom.exportLearnings</code>. KI-basierte Persona-Simulation via LLM für natürlichere Reaktionen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
