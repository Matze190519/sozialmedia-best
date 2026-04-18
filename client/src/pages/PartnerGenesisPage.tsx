import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, ChevronRight, ChevronLeft, Sparkles, Calendar,
  Copy, Check, Download, Wand2, Target, Film, Hash
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

/**
 * PARTNER GENESIS — Onboarding-Interview + Character Twin + 30-Tage-Plan
 *
 * Interview mit 12 Fragen → automatisch:
 * - Character Twin (Archetyp)
 * - Content Lanes (3-4 Themen die zur Person passen)
 * - Hook Families + CTA Families
 * - 30-Tage-Plan mit konkreten Post-Ideen
 */

interface PartnerGenesisProfile {
  id: string;
  name: string;
  communicationStyle: string;
  lifeContext: string;
  confidenceLevel: number;
  archetypes: string[];
  objections: string[];
  contentLanes: string[];
  first30DayPlan: Array<{ day: number; theme: string; hook: string; cta: string }>;
}

interface Answers {
  name: string;
  role: string;
  age: string;
  familyStatus: string;
  bigGoal: string;
  whyLR: string;
  cameraComfort: number;
  writingComfort: number;
  speakingComfort: number;
  strengths: string[];
  stories: string;
  fears: string[];
  productFocus: string;
  timeAvailable: string;
  platform: string[];
}

const INITIAL_ANSWERS: Answers = {
  name: "",
  role: "",
  age: "",
  familyStatus: "",
  bigGoal: "",
  whyLR: "",
  cameraComfort: 5,
  writingComfort: 5,
  speakingComfort: 5,
  strengths: [],
  stories: "",
  fears: [],
  productFocus: "",
  timeAvailable: "",
  platform: [],
};

const ARCHETYPES = [
  { id: "mentor", label: "Mentor", match: (a: Answers) => a.speakingComfort >= 7 && a.strengths.includes("erklären") },
  { id: "storyteller", label: "Story-Teller", match: (a: Answers) => a.writingComfort >= 7 && a.stories.length > 30 },
  { id: "performer", label: "Performer", match: (a: Answers) => a.cameraComfort >= 8 },
  { id: "analyst", label: "Analyst", match: (a: Answers) => a.strengths.includes("daten") || a.strengths.includes("zahlen") },
  { id: "motivator", label: "Motivator", match: (a: Answers) => a.strengths.includes("motivieren") },
  { id: "coach", label: "Coach", match: (a: Answers) => a.strengths.includes("lehren") },
  { id: "lifestyle", label: "Lifestyle-Curator", match: (a: Answers) => a.strengths.includes("ästhetik") },
  { id: "underdog", label: "Underdog", match: (a: Answers) => a.confidenceLevel < 5 && a.stories.length > 50 },
];

const STRENGTHS = [
  "erklären", "daten", "zahlen", "motivieren", "lehren", "ästhetik",
  "humor", "einfühlen", "verkaufen", "strukturieren", "inspirieren", "zuhören",
];

const FEARS = [
  "vor Kamera stehen", "Ablehnung", "nicht gut genug", "Blamage", "Technik",
  "Schreiben", "unvorhersehbar", "bewertet werden",
];

const PLATFORMS = [
  { id: "instagram", label: "Instagram", emoji: "📸" },
  { id: "tiktok", label: "TikTok", emoji: "🎵" },
  { id: "youtube", label: "YouTube", emoji: "▶️" },
  { id: "facebook", label: "Facebook", emoji: "📘" },
  { id: "linkedin", label: "LinkedIn", emoji: "💼" },
];

const PRODUCT_FOCUS_OPTIONS = [
  "Aloe Vera Gel", "Lifetakt Energy", "Collagen Plus", "Fitness/Shake",
  "Zeitgard Hautpflege", "Parfum", "Alles (keine Festlegung)",
];

interface Question {
  id: keyof Answers | "strengths-multi" | "fears-multi" | "platform-multi";
  label: string;
  type: "input" | "textarea" | "slider" | "multi" | "select";
  options?: string[];
  placeholder?: string;
  desc?: string;
}

const QUESTIONS: Question[] = [
  { id: "name", label: "Wie heißt du?", type: "input", placeholder: "z.B. Michael" },
  { id: "role", label: "Was machst du (beruflich)?", type: "input", placeholder: "z.B. Krankenschwester / Lehrer / selbstständig" },
  { id: "age", label: "Altersgruppe?", type: "select", options: ["18-25", "26-35", "36-45", "46-55", "56+"] },
  { id: "familyStatus", label: "Familiensituation?", type: "select", options: ["Single", "In Beziehung", "Verheiratet", "Mit Kindern", "Allein-erziehend"] },
  { id: "bigGoal", label: "Was ist dein großes Ziel mit LR in 12 Monaten?", type: "textarea", placeholder: "Konkret — Einkommen, Lifestyle, Freiheit..." },
  { id: "whyLR", label: "Warum LR und nicht etwas anderes?", type: "textarea", placeholder: "Was hat dich überzeugt?" },
  { id: "cameraComfort", label: "Wie wohl fühlst du dich vor der Kamera? (1-10)", type: "slider" },
  { id: "writingComfort", label: "Wie gerne schreibst du? (1-10)", type: "slider" },
  { id: "speakingComfort", label: "Wie gerne sprichst du vor Leuten? (1-10)", type: "slider" },
  { id: "strengths-multi", label: "Was sind deine Stärken? (mehrere möglich)", type: "multi", options: STRENGTHS },
  { id: "stories", label: "Erzähle eine prägende Geschichte aus deinem Leben.", type: "textarea", placeholder: "Ein Moment der dich geformt hat..." },
  { id: "fears-multi", label: "Was sind deine größten Ängste beim Content-Machen?", type: "multi", options: FEARS },
  { id: "productFocus", label: "Hast du einen Lieblings-Produkt-Fokus?", type: "select", options: PRODUCT_FOCUS_OPTIONS },
  { id: "timeAvailable", label: "Wie viel Zeit pro Tag für Content?", type: "select", options: ["< 30 Min", "30-60 Min", "1-2h", "2h+"] },
  { id: "platform-multi", label: "Welche Plattformen willst du bespielen?", type: "multi", options: PLATFORMS.map(p => p.id) },
];

function buildProfile(a: Answers): PartnerGenesisProfile {
  const archetypes = ARCHETYPES.filter(arc => arc.match(a)).map(arc => arc.label).slice(0, 3);
  if (archetypes.length === 0) archetypes.push("Underdog");

  const contentLanes: string[] = [];
  if (a.stories.length > 30) contentLanes.push("Persönliche Story / Transformation");
  if (a.cameraComfort >= 6) contentLanes.push("Video-Content (Reels + Shorts)");
  if (a.writingComfort >= 6) contentLanes.push("Text-Posts mit Tiefe (Instagram, LinkedIn)");
  if (a.productFocus && !a.productFocus.includes("Alles")) contentLanes.push(`Produkt-Content: ${a.productFocus}`);
  if (a.strengths.includes("lehren") || a.strengths.includes("erklären")) contentLanes.push("Tutorials / Mini-Dokus");
  if (contentLanes.length === 0) contentLanes.push("Starter: einfache Copy-Paste-Posts aus Bibliothek");

  const objections: string[] = [];
  if (a.cameraComfort < 5) objections.push("Angst vor Kamera");
  if (a.writingComfort < 5) objections.push("Unsicher beim Schreiben");
  if (a.timeAvailable?.startsWith("<")) objections.push("Wenig Zeit");
  a.fears.forEach(f => objections.push(f));

  // 30-Tage-Plan
  const themes = [
    "Vorstellung + Warum",
    "Deine Story in 60 Sek",
    "Was du aktuell lernst",
    "Produkt-Erfahrung",
    "Tag im Leben",
    "Warum Network Marketing?",
    "Was mich antreibt",
    "Erfolg braucht Konsequenz",
    "Produkt-Review",
    "Lifestyle-Upgrade",
    "Team-Moment",
    "Motivations-Montag",
    "Produkt-Deep-Dive",
    "Myth-Busting",
    "Hinter den Kulissen",
    "Dein erstes 90-Tage-Update",
    "Antwort auf Einwand",
    "Familie & Business",
    "Finanzielle Freiheit",
    "Auto-Bonus / LR-Konzept",
    "Reisen mit LR",
    "Morgenroutine",
    "Produkt-Kombination",
    "Team-Aufbau",
    "Skepsis vs. Realität",
    "3 Gründe warum...",
    "Tag 25: Rückblick",
    "Produkt-Wirkung nach 30 Tagen",
    "Was kommt als nächstes",
    "Einladung an die Community",
  ];

  const first30DayPlan = themes.slice(0, 30).map((theme, i) => ({
    day: i + 1,
    theme,
    hook: archetypes.includes("Performer")
      ? `POV: Tag ${i + 1} — ${theme}`
      : archetypes.includes("Story-Teller")
        ? `Heute vor ${i + 1} Tagen wusste ich noch nicht...`
        : `Tag ${i + 1}: ${theme}`,
    cta: i % 3 === 0
      ? "Kommentar '🔥' für mehr Infos"
      : i % 3 === 1
        ? "Speicher diesen Post"
        : "Folge für Teil 2",
  }));

  const confidenceLevel = Math.round((a.cameraComfort + a.writingComfort + a.speakingComfort) / 3);

  return {
    id: `profile-${Date.now()}`,
    name: a.name || "Neuer Partner",
    communicationStyle: a.writingComfort >= 7 ? "schriftlich-stark" : a.speakingComfort >= 7 ? "redner-typ" : a.cameraComfort >= 7 ? "performer" : "entwicklungsbedarf",
    lifeContext: `${a.age || "?"} Jahre · ${a.role || "?"} · ${a.familyStatus || "?"}`,
    confidenceLevel,
    archetypes,
    objections,
    contentLanes,
    first30DayPlan,
  };
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
        toast.success("Kopiert");
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {label}
    </Button>
  );
}

export default function PartnerGenesisPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
  const [profile, setProfile] = useState<PartnerGenesisProfile | null>(null);

  const currentQ = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  const updateAnswer = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const toggleMulti = (key: "strengths" | "fears" | "platform", val: string) => {
    setAnswers(prev => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(val) ? arr.filter((v: string) => v !== val) : [...arr, val] };
    });
  };

  const isStepValid = useMemo(() => {
    if (!currentQ) return true;
    const id = currentQ.id as string;
    if (id.endsWith("-multi")) {
      const key = id.replace("-multi", "") as "strengths" | "fears" | "platform";
      return answers[key].length > 0;
    }
    const val = (answers as any)[id];
    if (currentQ.type === "slider") return typeof val === "number";
    return !!val && val.toString().trim().length > 0;
  }, [answers, currentQ]);

  const next = () => {
    if (!isStepValid) {
      toast.error("Bitte ausfüllen");
      return;
    }
    if (isLast) {
      const p = buildProfile(answers);
      setProfile(p);
      toast.success("Profil erstellt!");
    } else {
      setStep(step + 1);
    }
  };

  const prev = () => step > 0 && setStep(step - 1);

  const restart = () => {
    setStep(0);
    setAnswers(INITIAL_ANSWERS);
    setProfile(null);
  };

  const exportProfile = () => {
    if (!profile) return;
    const text = [
      `# PARTNER GENESIS: ${profile.name}`,
      ``,
      `## Profil`,
      `- Kontext: ${profile.lifeContext}`,
      `- Kommunikations-Stil: ${profile.communicationStyle}`,
      `- Konfidenz-Level: ${profile.confidenceLevel}/10`,
      ``,
      `## Archetypen`,
      ...profile.archetypes.map(a => `- ${a}`),
      ``,
      `## Content Lanes`,
      ...profile.contentLanes.map(l => `- ${l}`),
      ``,
      `## Bekannte Einwände / Blocker`,
      ...profile.objections.map(o => `- ${o}`),
      ``,
      `## 30-Tage-Plan`,
      ...profile.first30DayPlan.map(d => `Tag ${d.day}: ${d.theme}\n  Hook: ${d.hook}\n  CTA: ${d.cta}`),
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Profil + Plan kopiert");
  };

  const sendToHookEngine = () => {
    if (!profile) return;
    localStorage.setItem("hook-engine-seed", JSON.stringify({
      topic: profile.contentLanes[0] || profile.name,
      archetypes: profile.archetypes,
    }));
    toast.info("An Hook Engine übergeben");
  };

  const sendToCharacterBible = () => {
    if (!profile) return;
    localStorage.setItem("character-bible-seed", JSON.stringify(profile));
    toast.info("An Character Bible übergeben");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gold-text" style={{ fontFamily: "var(--font-heading)" }}>
          Partner Genesis
        </h1>
        <p className="text-sm text-muted-foreground">
          12 Fragen → dein Character Twin + 30-Tage-Plan + Hook-Families.
        </p>
      </div>

      {!profile && currentQ && (
        <>
          {/* Progress */}
          <div className="flex items-center gap-1">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded transition-all ${
                  i < step ? "bg-primary" : i === step ? "bg-primary animate-pulse" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-center text-[10px] text-muted-foreground">
            Frage {step + 1} von {QUESTIONS.length}
          </p>

          <Card className="border-primary/30">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <h2 className="text-lg font-bold">{currentQ.label}</h2>
                {currentQ.desc && <p className="text-xs text-muted-foreground">{currentQ.desc}</p>}
              </div>

              {currentQ.type === "input" && (
                <Input
                  value={(answers as any)[currentQ.id] || ""}
                  onChange={(e) => updateAnswer(currentQ.id as keyof Answers, e.target.value as any)}
                  placeholder={currentQ.placeholder}
                  autoFocus
                />
              )}
              {currentQ.type === "textarea" && (
                <Textarea
                  value={(answers as any)[currentQ.id] || ""}
                  onChange={(e) => updateAnswer(currentQ.id as keyof Answers, e.target.value as any)}
                  placeholder={currentQ.placeholder}
                  rows={4}
                  autoFocus
                />
              )}
              {currentQ.type === "slider" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">1</span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={(answers as any)[currentQ.id] || 5}
                      onChange={(e) => updateAnswer(currentQ.id as keyof Answers, parseInt(e.target.value) as any)}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground">10</span>
                  </div>
                  <div className="text-center text-2xl font-bold text-primary">{(answers as any)[currentQ.id] || 5}</div>
                </div>
              )}
              {currentQ.type === "select" && currentQ.options && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentQ.options.map(opt => (
                    <Button
                      key={opt}
                      variant={(answers as any)[currentQ.id] === opt ? "default" : "outline"}
                      className={(answers as any)[currentQ.id] === opt ? "btn-gold" : ""}
                      size="sm"
                      onClick={() => updateAnswer(currentQ.id as keyof Answers, opt as any)}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              )}
              {currentQ.type === "multi" && currentQ.options && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentQ.options.map(opt => {
                    const key = (currentQ.id as string).replace("-multi", "") as "strengths" | "fears" | "platform";
                    const selected = answers[key].includes(opt);
                    return (
                      <Button
                        key={opt}
                        variant={selected ? "default" : "outline"}
                        className={selected ? "btn-gold" : ""}
                        size="sm"
                        onClick={() => toggleMulti(key, opt)}
                      >
                        {PLATFORMS.find(p => p.id === opt)?.emoji} {opt}
                      </Button>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <Button variant="outline" onClick={prev} disabled={step === 0}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Zurück
                </Button>
                <Button className="btn-gold" onClick={next}>
                  {isLast ? "Profil erstellen" : "Weiter"} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {profile && (
        <>
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">{profile.name}</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">{profile.lifeContext}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={sendToHookEngine}>
                    <Wand2 className="h-3 w-3 mr-1" /> An Hook Engine
                  </Button>
                  <Button size="sm" variant="outline" onClick={sendToCharacterBible}>
                    <Sparkles className="h-3 w-3 mr-1" /> Character Bible
                  </Button>
                  <Button size="sm" onClick={exportProfile} className="btn-gold">
                    <Download className="h-3 w-3 mr-1" /> Export
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded bg-background/50 border border-border/50">
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">Konfidenz</div>
                  <div className="text-xl font-bold text-primary">{profile.confidenceLevel}/10</div>
                </div>
                <div className="p-3 rounded bg-background/50 border border-border/50">
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">Stil</div>
                  <div className="text-sm font-semibold">{profile.communicationStyle}</div>
                </div>
                <div className="p-3 rounded bg-background/50 border border-border/50">
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">Archetypen</div>
                  <div className="text-sm font-semibold">{profile.archetypes.length}</div>
                </div>
                <div className="p-3 rounded bg-background/50 border border-border/50">
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">Content Lanes</div>
                  <div className="text-sm font-semibold">{profile.contentLanes.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-primary/20">
              <CardContent className="p-4 space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" /> Archetypen
                </h3>
                <div className="flex flex-wrap gap-1">
                  {profile.archetypes.map((a, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{a}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="p-4 space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Film className="h-4 w-4 text-primary" /> Content Lanes
                </h3>
                <ul className="space-y-1">
                  {profile.contentLanes.map((l, i) => (
                    <li key={i} className="text-xs">· {l}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/30">
            <CardContent className="p-4 space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> 30-Tage-Plan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto">
                {profile.first30DayPlan.map(d => (
                  <Card key={d.day} className="border-border/50">
                    <CardContent className="p-3">
                      <Badge variant="outline" className="text-[9px] mb-1">Tag {d.day}</Badge>
                      <p className="text-xs font-semibold mb-1">{d.theme}</p>
                      <p className="text-[10px] text-muted-foreground mb-1">Hook: {d.hook}</p>
                      <p className="text-[10px] text-primary">CTA: {d.cta}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button variant="outline" onClick={restart}>Neues Interview starten</Button>
          </div>
        </>
      )}

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Optional an Manus:</p>
          <p className="text-muted-foreground">
            Neue Endpoints: <code>partnerGenesis.interview</code>, <code>partnerGenesis.buildPlan</code>, <code>partnerGenesis.exportTwin</code>. Integration mit Character Bible (DB-persist), Content-Queue für Auto-Post-Scheduling.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
