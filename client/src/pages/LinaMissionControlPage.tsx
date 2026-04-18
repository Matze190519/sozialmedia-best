import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Users, Video, Calendar, MessageSquare, Flame,
  AlertTriangle, Check, Clock, Pause, Play, Sparkles,
  TrendingUp, Shield, Target, Brain, Zap, Sun
} from "lucide-react";
import { toast } from "sonner";

/**
 * LINA MISSION CONTROL — Das operative Cockpit für Team-KI Lina
 *
 * Zentrale Übersicht über alles was Lina für LR-Partner und Interessenten tut:
 * Leads, Coaching, Content, Termine, Reviews.
 */

type Domain = "lead" | "coaching" | "content" | "calendar" | "review";
type Priority = "low" | "medium" | "high" | "critical";
type MissionStatus = "todo" | "waiting_human" | "done" | "autonomous";
type AutonomyMode = "safe" | "review" | "autopilot";

interface LinaMissionItem {
  id: string;
  domain: Domain;
  title: string;
  priority: Priority;
  status: MissionStatus;
  summary: string;
  nextAction?: string;
  createdAt: string;
  linkedName?: string;
}

interface LinaPersonaProfile {
  id: string;
  name: string;
  speakingStyle: string;
  ctaStyle: string;
  complianceMode: "strict" | "balanced";
}

const DOMAIN_CONFIG: Record<Domain, { label: string; icon: typeof Users; color: string; bg: string }> = {
  lead: { label: "Leads", icon: Flame, color: "text-emerald-400", bg: "border-emerald-500/30 bg-emerald-500/5" },
  coaching: { label: "Coaching", icon: Brain, color: "text-blue-400", bg: "border-blue-500/30 bg-blue-500/5" },
  content: { label: "Content", icon: Video, color: "text-primary", bg: "border-primary/30 bg-primary/5" },
  calendar: { label: "Termine", icon: Calendar, color: "text-cyan-400", bg: "border-cyan-500/30 bg-cyan-500/5" },
  review: { label: "Reviews", icon: MessageSquare, color: "text-amber-400", bg: "border-amber-500/30 bg-amber-500/5" },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  critical: { label: "KRITISCH", color: "text-red-400 border-red-500/50" },
  high: { label: "HOCH", color: "text-amber-400 border-amber-500/50" },
  medium: { label: "MITTEL", color: "text-blue-400 border-blue-500/30" },
  low: { label: "NIEDRIG", color: "text-muted-foreground border-border" },
};

const STATUS_CONFIG: Record<MissionStatus, { label: string; icon: typeof Check; color: string }> = {
  todo: { label: "Offen", icon: Clock, color: "text-blue-400" },
  waiting_human: { label: "Braucht Mensch", icon: AlertTriangle, color: "text-amber-400" },
  done: { label: "Erledigt", icon: Check, color: "text-emerald-400" },
  autonomous: { label: "Autonom läuft", icon: Sparkles, color: "text-primary" },
};

const PERSONAS: LinaPersonaProfile[] = [
  { id: "mathias", name: "Mathias-Style", speakingStyle: "direkt, motivational, bodenständig", ctaStyle: "klare DMs, kein Fluff", complianceMode: "strict" },
  { id: "partner", name: "Partner-Style", speakingStyle: "warm, empathisch, persönlich", ctaStyle: "sanft einladend", complianceMode: "strict" },
  { id: "brand", name: "Brand-Style", speakingStyle: "professionell, LR-corporate", ctaStyle: "formell, informativ", complianceMode: "strict" },
];

const INITIAL_MISSIONS: LinaMissionItem[] = [
  {
    id: "m-1",
    domain: "lead",
    title: "Neuer Warm Lead: Sarah K.",
    priority: "high",
    status: "waiting_human",
    summary: "Hat auf deinen Auto-Post kommentiert: 'Wie kann ich starten?'. Lina hat eine DM-Antwort vorbereitet.",
    nextAction: "DM senden (Vorschlag prüfen)",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    linkedName: "Sarah K.",
  },
  {
    id: "m-2",
    domain: "coaching",
    title: "Daily Check-In: Michael M.",
    priority: "medium",
    status: "autonomous",
    summary: "Lina führt gerade den 7-Tage-Check-In durch. Fortschritt: 3 Posts diese Woche (+50%).",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    linkedName: "Michael M.",
  },
  {
    id: "m-3",
    domain: "content",
    title: "Tagescontent für Team generiert",
    priority: "medium",
    status: "done",
    summary: "Lina hat 12 personalisierte Tagesposts für 4 aktive Partner erstellt. Alle in Freigabe-Queue.",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "m-4",
    domain: "calendar",
    title: "Erstgespräch mit David R.",
    priority: "critical",
    status: "waiting_human",
    summary: "Termin in 2h. Lina hat Briefing + 3 Eisbrecher-Fragen vorbereitet. David ist heiß: hat dreimal in der Story reagiert.",
    nextAction: "Briefing öffnen und Call starten",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    linkedName: "David R.",
  },
  {
    id: "m-5",
    domain: "review",
    title: "Call-Review: Anna B.",
    priority: "medium",
    status: "autonomous",
    summary: "Gestriger Call analysiert. Hauptbefund: Einwände zu Preis kamen 3x — Antwort war zu schnell. Coaching-Tip generiert.",
    nextAction: "Coaching-Tip ansehen",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    linkedName: "Anna B.",
  },
  {
    id: "m-6",
    domain: "content",
    title: "Winner erkannt: POV Auto-Bonus Reel",
    priority: "high",
    status: "todo",
    summary: "Reel hat in 24h 8.400 Views. Lina schlägt 10 Varianten + 3 Folge-Episoden für Mini-Serie vor.",
    nextAction: "Varianten freigeben",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "m-7",
    domain: "lead",
    title: "Skeptiker-Kommentar auf TikTok",
    priority: "low",
    status: "autonomous",
    summary: "User schrieb 'Schneeballsystem'. Lina hat höflich-ruhig geantwortet, keine Rechtfertigung, Thema de-eskaliert.",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
];

function formatAge(isoDate: string): string {
  const min = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000);
  if (min < 60) return `vor ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `vor ${h}h`;
  return `vor ${Math.floor(h / 24)}d`;
}

function MissionCard({ item, onSelect, selected }: { item: LinaMissionItem; onSelect: () => void; selected: boolean }) {
  const dc = DOMAIN_CONFIG[item.domain];
  const pc = PRIORITY_CONFIG[item.priority];
  const sc = STATUS_CONFIG[item.status];
  const DomainIcon = dc.icon;
  const StatusIcon = sc.icon;

  return (
    <Card
      className={`cursor-pointer transition-all ${dc.bg} ${selected ? "ring-2 ring-primary" : ""}`}
      onClick={onSelect}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <DomainIcon className={`h-4 w-4 shrink-0 mt-0.5 ${dc.color}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold line-clamp-1">{item.title}</p>
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                <Badge variant="outline" className={`text-[9px] ${pc.color}`}>{pc.label}</Badge>
                <Badge variant="outline" className={`text-[9px] ${sc.color}`}>
                  <StatusIcon className="h-2.5 w-2.5 mr-0.5" /> {sc.label}
                </Badge>
                <span className="text-[9px] text-muted-foreground">{formatAge(item.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground line-clamp-2">{item.summary}</p>
      </CardContent>
    </Card>
  );
}

export default function LinaMissionControlPage() {
  const [missions, setMissions] = useState<LinaMissionItem[]>(INITIAL_MISSIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterDomain, setFilterDomain] = useState<Domain | "all">("all");
  const [autonomy, setAutonomy] = useState<AutonomyMode>("review");
  const [persona, setPersona] = useState<string>("mathias");

  const filtered = useMemo(() => {
    return missions
      .filter(m => filterDomain === "all" || m.domain === filterDomain)
      .sort((a, b) => {
        const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return pOrder[a.priority] - pOrder[b.priority];
      });
  }, [missions, filterDomain]);

  const counts = useMemo(() => {
    return {
      all: missions.length,
      lead: missions.filter(m => m.domain === "lead").length,
      coaching: missions.filter(m => m.domain === "coaching").length,
      content: missions.filter(m => m.domain === "content").length,
      calendar: missions.filter(m => m.domain === "calendar").length,
      review: missions.filter(m => m.domain === "review").length,
      waitingHuman: missions.filter(m => m.status === "waiting_human").length,
      autonomous: missions.filter(m => m.status === "autonomous").length,
      done: missions.filter(m => m.status === "done").length,
    };
  }, [missions]);

  const selected = missions.find(m => m.id === selectedId);

  const markDone = (id: string) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, status: "done" } : m));
    toast.success("Als erledigt markiert");
  };

  const dailyBriefing = useMemo(() => {
    const critical = missions.filter(m => m.priority === "critical" && m.status !== "done");
    const highWaiting = missions.filter(m => m.priority === "high" && m.status === "waiting_human");
    const autonomousActive = missions.filter(m => m.status === "autonomous");
    const topLine = critical.length > 0
      ? `Du hast ${critical.length} kritische Mission${critical.length === 1 ? "" : "en"} die Entscheidungen brauchen.`
      : highWaiting.length > 0
        ? `${highWaiting.length} wichtige Items warten auf deine Freigabe.`
        : "Alles läuft — Lina arbeitet autonom. Nur 1x prüfen heute.";
    return { topLine, critical, highWaiting, autonomousActive };
  }, [missions]);

  const activePersona = PERSONAS.find(p => p.id === persona)!;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Hero */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Bot className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold gold-text" style={{ fontFamily: "var(--font-heading)" }}>
            Lina Mission Control
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Das Cockpit für deine Team-KI. Leads, Coaching, Content, Termine, Reviews — alles auf einen Blick.
        </p>
      </div>

      {/* Autopilot-Mode + Persona */}
      <Card className="border-primary/30">
        <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Autonomie-Modus</label>
            <div className="flex gap-1">
              {(["safe", "review", "autopilot"] as AutonomyMode[]).map(m => {
                const active = autonomy === m;
                const cfg = {
                  safe: { icon: Shield, label: "Safe (fragt immer)", color: "border-amber-500/50 bg-amber-500/10 text-amber-400" },
                  review: { icon: Check, label: "Review (bei wichtig)", color: "border-blue-500/50 bg-blue-500/10 text-blue-400" },
                  autopilot: { icon: Zap, label: "Autopilot (agiert)", color: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" },
                }[m];
                const Icon = cfg.icon;
                return (
                  <Button
                    key={m}
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className={`text-xs ${active ? cfg.color : ""}`}
                    onClick={() => setAutonomy(m)}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {cfg.label}
                  </Button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Persona</label>
            <div className="flex gap-1">
              {PERSONAS.map(p => (
                <Button
                  key={p.id}
                  size="sm"
                  variant={persona === p.id ? "default" : "outline"}
                  className={`text-xs ${persona === p.id ? "btn-gold" : ""}`}
                  onClick={() => setPersona(p.id)}
                >
                  {p.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Briefing */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold">Tagesbriefing von Lina</h2>
            <Badge variant="outline" className="text-[9px] ml-auto">
              {new Date().toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "2-digit" })}
            </Badge>
          </div>
          <p className="text-sm">{dailyBriefing.topLine}</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-background/50 border border-border/50">
              <div className="text-lg font-bold text-red-400">{dailyBriefing.critical.length}</div>
              <div className="text-[10px] text-muted-foreground">Kritisch</div>
            </div>
            <div className="p-2 rounded bg-background/50 border border-border/50">
              <div className="text-lg font-bold text-amber-400">{counts.waitingHuman}</div>
              <div className="text-[10px] text-muted-foreground">Warten auf dich</div>
            </div>
            <div className="p-2 rounded bg-background/50 border border-border/50">
              <div className="text-lg font-bold text-primary">{counts.autonomous}</div>
              <div className="text-[10px] text-muted-foreground">Lina läuft autonom</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mission Zones */}
      <div className="grid grid-cols-6 gap-2">
        {[
          { id: "all" as const, label: "Alle", count: counts.all, icon: Target, color: "text-muted-foreground" },
          ...(Object.keys(DOMAIN_CONFIG) as Domain[]).map(d => ({
            id: d,
            label: DOMAIN_CONFIG[d].label,
            count: counts[d],
            icon: DOMAIN_CONFIG[d].icon,
            color: DOMAIN_CONFIG[d].color,
          })),
        ].map(z => (
          <button
            key={z.id}
            onClick={() => setFilterDomain(z.id as any)}
            className={`p-3 rounded-lg border-2 transition-all text-center ${
              filterDomain === z.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
            }`}
          >
            <z.icon className={`h-4 w-4 mx-auto mb-1 ${z.color}`} />
            <div className="text-lg font-bold">{z.count}</div>
            <div className="text-[10px] text-muted-foreground">{z.label}</div>
          </button>
        ))}
      </div>

      {/* Missions Grid + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          <h2 className="text-sm font-semibold">{filtered.length} Missionen</h2>
          <AnimatePresence>
            {filtered.map(m => (
              <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} layout>
                <MissionCard item={m} onSelect={() => setSelectedId(m.id)} selected={selectedId === m.id} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          {selected ? (
            <Card className="border-primary/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = DOMAIN_CONFIG[selected.domain].icon;
                    return <Icon className={`h-4 w-4 ${DOMAIN_CONFIG[selected.domain].color}`} />;
                  })()}
                  <Badge variant="outline" className="text-[10px]">{DOMAIN_CONFIG[selected.domain].label}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${PRIORITY_CONFIG[selected.priority].color}`}>
                    {PRIORITY_CONFIG[selected.priority].label}
                  </Badge>
                </div>

                <h3 className="text-sm font-semibold">{selected.title}</h3>
                {selected.linkedName && (
                  <Badge variant="outline" className="text-[10px]">
                    <Users className="h-2.5 w-2.5 mr-0.5" /> {selected.linkedName}
                  </Badge>
                )}

                <div className="p-2 rounded bg-primary/5 border border-primary/20">
                  <p className="text-xs whitespace-pre-line">{selected.summary}</p>
                </div>

                {selected.nextAction && (
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-3 w-3 text-amber-400" />
                      <span className="text-[10px] uppercase font-semibold text-amber-400">Nächster Move</span>
                    </div>
                    <p className="text-xs font-medium">{selected.nextAction}</p>
                  </div>
                )}

                <div className="text-[10px] text-muted-foreground">
                  Erstellt: {formatAge(selected.createdAt)} · Persona: {activePersona.name} · Modus: {autonomy}
                </div>

                {selected.status !== "done" && (
                  <div className="flex gap-1">
                    <Button size="sm" className="btn-gold flex-1" onClick={() => markDone(selected.id)}>
                      <Check className="h-3 w-3 mr-1" /> Erledigt
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Pause className="h-3 w-3 mr-1" /> Pausieren
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-border/50">
              <CardContent className="p-6 text-center space-y-2">
                <Bot className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">
                  Wähle eine Mission für Details, nächsten Move und Aktionen.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Persona Info */}
      <Card className="border-border/30">
        <CardContent className="p-4 text-xs flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary shrink-0" />
          <div>
            <div className="font-semibold mb-1">Aktive Persona: {activePersona.name}</div>
            <div className="text-muted-foreground">
              Sprechstil: {activePersona.speakingStyle} · CTA: {activePersona.ctaStyle} · Compliance: {activePersona.complianceMode}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Optional an Manus:</p>
          <p className="text-muted-foreground">
            Aktuell: Mock-Missionen zur UI-Demo. Live-Daten via neuer Endpoints <code>lina.missionFeed</code>, <code>lina.dailyBriefing</code>, <code>lina.toggleAutonomy</code>. Tiefer: Integration mit Kommentaren, CRM, Calendar, Content-Queue.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
