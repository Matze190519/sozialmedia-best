import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Send, ArrowRight, Plus, Copy, Check,
  HelpCircle, DollarSign, Package, Briefcase, AlertTriangle,
  Flame, Shield, Phone, FileText, Heart, X
} from "lucide-react";
import { toast } from "sonner";

/**
 * COMMENT-TO-LEAD ROUTER — Kommentar-Inbox mit Intent-Klassifizierung
 *
 * Wandelt Kommentare in planbare Gesprächseinstiege um.
 * Klassifiziert: Neugier, Preis, Produkt, Business, Skepsis, Warm Lead.
 * Empfiehlt: kurze/weiche/direkte Antworten + nächsten Schritt.
 */

type Platform = "instagram" | "facebook" | "tiktok";
type Intent = "curious" | "price" | "product" | "business" | "skeptic" | "hot";
type NextAction = "ask-question" | "send-guide" | "move-to-dm" | "book-call" | "do-not-push";
type Status = "new" | "lead" | "follow-up" | "community" | "archived";

interface LeadCommentInput {
  id: string;
  source: "comment" | "dm";
  platform: Platform;
  text: string;
  postContext?: string;
}

interface RoutedLeadResult {
  id: string;
  intent: Intent;
  confidence: number;
  suggestedReplies: { short: string; soft: string; direct: string };
  nextBestAction: NextAction;
  complianceNotes: string[];
  status: Status;
}

const INTENT_CONFIG: Record<Intent, { label: string; icon: typeof HelpCircle; color: string; bg: string; desc: string }> = {
  curious: { label: "Neugier", icon: HelpCircle, color: "text-cyan-400", bg: "border-cyan-500/30 bg-cyan-500/5", desc: "Generelle Fragen, noch unverbindlich" },
  price: { label: "Preis", icon: DollarSign, color: "text-amber-400", bg: "border-amber-500/30 bg-amber-500/5", desc: "Fragt direkt nach Kosten" },
  product: { label: "Produkt", icon: Package, color: "text-emerald-400", bg: "border-emerald-500/30 bg-emerald-500/5", desc: "Interessiert an Produkten" },
  business: { label: "Business", icon: Briefcase, color: "text-primary", bg: "border-primary/30 bg-primary/5", desc: "Interessiert an Geschäftsmodell" },
  skeptic: { label: "Skepsis", icon: AlertTriangle, color: "text-red-400", bg: "border-red-500/30 bg-red-500/5", desc: "Zweifelt, provoziert, kritisch" },
  hot: { label: "Warm Lead", icon: Flame, color: "text-orange-400", bg: "border-orange-500/30 bg-orange-500/5", desc: "Konkret, bereit zu kaufen/starten" },
};

const ACTION_CONFIG: Record<NextAction, { label: string; icon: typeof Send }> = {
  "ask-question": { label: "Gegenfrage stellen", icon: HelpCircle },
  "send-guide": { label: "Guide senden", icon: FileText },
  "move-to-dm": { label: "In DM führen", icon: MessageCircle },
  "book-call": { label: "Call buchen", icon: Phone },
  "do-not-push": { label: "Nicht nachfassen", icon: X },
};

const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
  new: { label: "Neu", color: "text-blue-400 border-blue-500/30" },
  lead: { label: "Lead", color: "text-emerald-400 border-emerald-500/30" },
  "follow-up": { label: "Follow-up", color: "text-amber-400 border-amber-500/30" },
  community: { label: "Community", color: "text-cyan-400 border-cyan-500/30" },
  archived: { label: "Archiv", color: "text-muted-foreground border-border" },
};

function classifyIntent(text: string): { intent: Intent; confidence: number } {
  const t = text.toLowerCase();

  if (/preis|kostet|wie teuer|euro|€|\$|monat|kosten|investition/i.test(text)) return { intent: "price", confidence: 85 };
  if (/schneeball|scam|betrug|mlm|pyramide|funktioniert.*nicht|lüge|lächerlich/i.test(text)) return { intent: "skeptic", confidence: 90 };
  if (/wie anfangen|wie starten|bin dabei|mach mit|wo kann ich mich|jetzt einsteigen|sofort|heute noch/i.test(text)) return { intent: "hot", confidence: 88 };
  if (/business|nebenverdienst|geld verdienen|einkommen|partner werden|selbständig|unternehmer/i.test(text)) return { intent: "business", confidence: 82 };
  if (/aloe|gel|produkt|vitamin|supplement|lifetakt|collagen|energie|haut/i.test(text)) return { intent: "product", confidence: 80 };
  if (/\?|wie genau|erklär|info|interessant|erzähl|mehr dazu|was ist das|bedeutet/i.test(text)) return { intent: "curious", confidence: 70 };

  return { intent: "curious", confidence: 50 };
}

function suggestReplies(intent: Intent): { short: string; soft: string; direct: string } {
  const replies: Record<Intent, { short: string; soft: string; direct: string }> = {
    curious: {
      short: "Schreib mir gerne in der DM, dann erkläre ich's dir in Ruhe.",
      soft: "Ich verstehe die Neugier — lass uns in der DM sprechen, da kann ich dir alles persönlich zeigen was ich mache. Interesse?",
      direct: "DM 'INFO' und ich sende dir meine komplette Übersicht.",
    },
    price: {
      short: "Preis hängt von deinem Einstieg ab. DM für Details.",
      soft: "Der Preis variiert je nachdem, was zu dir passt — das klären wir am besten persönlich. Schreib mir in der DM.",
      direct: "Kommt auf dein Ziel an. DM 'PREIS' für meinen genauen Fahrplan mit allen Zahlen.",
    },
    product: {
      short: "Super Wahl! DM mir, ich empfehle dir was passt.",
      soft: "Schön dass dich das Produkt anspricht! Was ist dein Hauptfokus? Haut, Energie, Fitness? Dann kann ich dir das Richtige empfehlen.",
      direct: "Schreib mir 'PROBE' in die DMs, ich schicke dir meine Top-Empfehlung.",
    },
    business: {
      short: "Business? Lass uns 15 Min Call machen. DM 'CALL'.",
      soft: "Freut mich, dass dich das Thema interessiert! Lass uns telefonieren — 15 Min unverbindlich, dann hast du alle Infos.",
      direct: "DM 'START' und ich zeige dir den exakten Plan meiner ersten 90 Tage.",
    },
    skeptic: {
      short: "Verstehe deine Skepsis. Keine Sorge, kein Druck hier.",
      soft: "Deine Skepsis ist absolut nachvollziehbar, ich war auch erst skeptisch. Schau einfach weiter mit und entscheide selbst.",
      direct: "Fair. Wenn du konkrete Zahlen willst: DM, ich zeige sie offen.",
    },
    hot: {
      short: "Geil! Schreib mir direkt, wir legen los.",
      soft: "Freut mich riesig! Schreib mir eine DM mit deinem Namen, dann führen wir das persönlich fort.",
      direct: "Perfekt. DM 'START' — ich antworte persönlich binnen 2 Stunden.",
    },
  };
  return replies[intent];
}

function nextActionFor(intent: Intent): NextAction {
  const map: Record<Intent, NextAction> = {
    curious: "ask-question",
    price: "move-to-dm",
    product: "send-guide",
    business: "book-call",
    skeptic: "do-not-push",
    hot: "move-to-dm",
  };
  return map[intent];
}

function complianceNotesFor(intent: Intent, text: string): string[] {
  const notes: string[] = [];
  if (/garantie|sicher|risikolos|100%/i.test(text)) notes.push("⚠️ Keine Garantien oder 'risikolos'-Aussagen verwenden");
  if (/heilt|wunder|medizinisch/i.test(text)) notes.push("⚠️ Keine Heilaussagen — auf 'unterstützt' umformulieren");
  if (intent === "business") notes.push("💡 Kein konkretes Einkommen versprechen — 'Nebeneinkommen' ist OK, spezifische Zahlen nur im persönlichen Gespräch");
  if (intent === "price") notes.push("💡 Preis nicht öffentlich kommentieren, in DM oder Call verlagern");
  if (intent === "skeptic") notes.push("💡 Nicht rechtfertigen, keine Verteidigung — nur kurze, respektvolle Antwort");
  return notes;
}

function routeComment(input: LeadCommentInput): RoutedLeadResult {
  const { intent, confidence } = classifyIntent(input.text);
  return {
    id: input.id,
    intent,
    confidence,
    suggestedReplies: suggestReplies(intent),
    nextBestAction: nextActionFor(intent),
    complianceNotes: complianceNotesFor(intent, input.text),
    status: "new",
  };
}

const SAMPLE_COMMENTS: LeadCommentInput[] = [
  { id: "s1", source: "comment", platform: "instagram", text: "Wie kann ich da mitmachen? Interesse!", postContext: "Post über LR Business" },
  { id: "s2", source: "dm", platform: "instagram", text: "Was kostet das denn im Monat?", postContext: "Post über Produkt-Probe" },
  { id: "s3", source: "comment", platform: "tiktok", text: "Klingt wie Schneeballsystem ehrlich gesagt", postContext: "Reel über Auto-Bonus" },
  { id: "s4", source: "comment", platform: "facebook", text: "Welches Aloe Vera Gel empfiehlst du?", postContext: "Produkt-Post" },
  { id: "s5", source: "dm", platform: "instagram", text: "Ich will sofort anfangen, wo kann ich mich anmelden?", postContext: "Reel über 90-Tage-Challenge" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 px-2"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Antwort kopiert");
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

export default function CommentToLeadRouterPage() {
  const [inputs, setInputs] = useState<LeadCommentInput[]>(SAMPLE_COMMENTS);
  const [results, setResults] = useState<RoutedLeadResult[]>(SAMPLE_COMMENTS.map(routeComment));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newPostContext, setNewPostContext] = useState("");
  const [newPlatform, setNewPlatform] = useState<Platform>("instagram");
  const [newSource, setNewSource] = useState<"comment" | "dm">("comment");

  const addComment = () => {
    if (!newComment.trim()) {
      toast.error("Kommentar eingeben");
      return;
    }
    const input: LeadCommentInput = {
      id: `c-${Date.now()}`,
      source: newSource,
      platform: newPlatform,
      text: newComment,
      postContext: newPostContext,
    };
    setInputs(prev => [input, ...prev]);
    setResults(prev => [routeComment(input), ...prev]);
    setNewComment("");
    setNewPostContext("");
    setSelectedId(input.id);
    toast.success("Kommentar analysiert");
  };

  const updateStatus = (id: string, status: Status) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const deleteComment = (id: string) => {
    setInputs(prev => prev.filter(i => i.id !== id));
    setResults(prev => prev.filter(r => r.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selected = results.find(r => r.id === selectedId);
  const selectedInput = inputs.find(i => i.id === selectedId);

  const openWhatsApp = () => {
    if (!selected) return;
    const phone = localStorage.getItem("lead-capture-wa-phone") || "";
    if (!phone) {
      toast.info("WhatsApp-Nummer erst in Lead-Capture hinterlegen");
      return;
    }
    const msg = selected.suggestedReplies.short;
    window.open(`https://wa.me/${phone.replace(/[^\d+]/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const counts = {
    new: results.filter(r => r.status === "new").length,
    lead: results.filter(r => r.status === "lead").length,
    followUp: results.filter(r => r.status === "follow-up").length,
    community: results.filter(r => r.status === "community").length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gold-text" style={{ fontFamily: "var(--font-heading)" }}>
          Comment-to-Lead Router
        </h1>
        <p className="text-sm text-muted-foreground">
          Aus Kommentaren werden Leads. Intent-Klassifizierung, 3 Antwortvarianten, Compliance-Check, nächster Move.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Neu", count: counts.new, icon: MessageCircle, color: "text-blue-400" },
          { label: "Leads", count: counts.lead, icon: Flame, color: "text-emerald-400" },
          { label: "Follow-up", count: counts.followUp, icon: Heart, color: "text-amber-400" },
          { label: "Community", count: counts.community, icon: MessageCircle, color: "text-cyan-400" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-3 text-center">
              <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
              <div className="text-2xl font-bold">{s.count}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New comment input */}
      <Card className="border-primary/30">
        <CardContent className="p-4 space-y-3">
          <h2 className="text-sm font-semibold">Neuen Kommentar hinzufügen</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="flex gap-1">
              {(["comment", "dm"] as const).map(s => (
                <Button key={s} size="sm" variant={newSource === s ? "default" : "outline"} className={`text-xs ${newSource === s ? "btn-gold" : ""}`} onClick={() => setNewSource(s)}>
                  {s === "comment" ? "Kommentar" : "DM"}
                </Button>
              ))}
            </div>
            <div className="flex gap-1">
              {(["instagram", "tiktok", "facebook"] as Platform[]).map(p => (
                <Button key={p} size="sm" variant={newPlatform === p ? "default" : "outline"} className={`text-xs ${newPlatform === p ? "btn-gold" : ""}`} onClick={() => setNewPlatform(p)}>
                  {p}
                </Button>
              ))}
            </div>
            <Input
              placeholder="Post-Kontext (optional)"
              value={newPostContext}
              onChange={(e) => setNewPostContext(e.target.value)}
              className="md:col-span-2"
            />
          </div>
          <Textarea
            placeholder="Kommentar-Text einfügen..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
          />
          <Button className="btn-gold" onClick={addComment} disabled={!newComment.trim()}>
            <Plus className="h-4 w-4 mr-1" /> Analysieren
          </Button>
        </CardContent>
      </Card>

      {/* Inbox + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Inbox */}
        <div className="lg:col-span-2 space-y-2">
          <h2 className="text-sm font-semibold">Inbox ({results.length})</h2>
          <AnimatePresence>
            {results.map(r => {
              const input = inputs.find(i => i.id === r.id);
              if (!input) return null;
              const config = INTENT_CONFIG[r.intent];
              const Icon = config.icon;
              const statusConfig = STATUS_CONFIG[r.status];
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  layout
                >
                  <Card
                    className={`cursor-pointer ${config.bg} ${selectedId === r.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedId(r.id)}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1 flex-wrap">
                            <Badge variant="outline" className="text-[9px]">{input.source.toUpperCase()}</Badge>
                            <Badge variant="outline" className="text-[9px]">{input.platform}</Badge>
                            <Badge variant="outline" className={`text-[9px] ${config.color} ${config.bg}`}>
                              <Icon className="h-2.5 w-2.5 mr-0.5" /> {config.label}
                            </Badge>
                            <Badge variant="outline" className={`text-[9px] ${statusConfig.color}`}>
                              {statusConfig.label}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{r.confidence}% sicher</span>
                          </div>
                          <p className="text-sm">{input.text}</p>
                          {input.postContext && (
                            <p className="text-[10px] text-muted-foreground mt-1">Kontext: {input.postContext}</p>
                          )}
                        </div>
                        <Button size="sm" variant="ghost" className="shrink-0" onClick={(e) => { e.stopPropagation(); deleteComment(r.id); }}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Detail */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          {selected && selectedInput ? (
            <Card className="border-primary/30">
              <CardContent className="p-4 space-y-3">
                <div>
                  <Badge variant="outline" className={`text-[10px] mb-2 ${INTENT_CONFIG[selected.intent].color}`}>
                    {INTENT_CONFIG[selected.intent].label} · {selected.confidence}% Konfidenz
                  </Badge>
                  <p className="text-xs text-muted-foreground italic">"{selectedInput.text}"</p>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-2 block">Antwort-Varianten</label>
                  <div className="space-y-2">
                    {(["short", "soft", "direct"] as const).map(style => (
                      <div key={style} className="p-2 rounded bg-primary/5 border border-primary/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-semibold text-primary">
                            {style === "short" ? "Kurz" : style === "soft" ? "Weich" : "Direkt"}
                          </span>
                          <CopyButton text={selected.suggestedReplies[style]} />
                        </div>
                        <p className="text-xs whitespace-pre-line">{selected.suggestedReplies[style]}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compliance */}
                {selected.complianceNotes.length > 0 && (
                  <div>
                    <label className="text-[10px] uppercase font-semibold text-amber-400 mb-1 flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Compliance-Hinweise
                    </label>
                    <ul className="space-y-1">
                      {selected.complianceNotes.map((n, i) => (
                        <li key={i} className="text-[10px] text-muted-foreground">{n}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Best Action */}
                <div className="p-2 rounded bg-primary/10 border border-primary/30 flex items-center gap-2">
                  {(() => {
                    const Icon = ACTION_CONFIG[selected.nextBestAction].icon;
                    return <Icon className="h-4 w-4 text-primary" />;
                  })()}
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground">Nächster Move</p>
                    <p className="text-sm font-semibold">{ACTION_CONFIG[selected.nextBestAction].label}</p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Status setzen</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(["lead", "follow-up", "community", "archived"] as Status[]).map(s => (
                      <Button
                        key={s}
                        size="sm"
                        variant={selected.status === s ? "default" : "outline"}
                        className={`text-[10px] h-7 ${selected.status === s ? "btn-gold" : ""}`}
                        onClick={() => updateStatus(selected.id, s)}
                      >
                        {STATUS_CONFIG[s].label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 space-y-1">
                  <Button size="sm" className="w-full btn-gold" onClick={openWhatsApp}>
                    <Send className="h-3 w-3 mr-1" /> Kurze Antwort per WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-border/50">
              <CardContent className="p-6 text-center space-y-2">
                <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">Wähle einen Kommentar für Antwort-Vorschläge und nächsten Move.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Optional an Manus:</p>
          <p className="text-muted-foreground">
            Aktuell: client-seitige Regex-basierte Klassifizierung (instant, funktioniert offline). Für KI-Klassifizierung: neue Endpoints <code>commentRouter.classify</code>, <code>commentRouter.replyOptions</code>, <code>commentRouter.nextBestAction</code>. Lina/Botpress-Bridge als spätere Phase für automatisches Commenting → DM-Flow.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
