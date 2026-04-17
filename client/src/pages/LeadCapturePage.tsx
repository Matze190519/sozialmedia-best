import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { MessageCircle, Copy, Check, ArrowRight, Target, Zap, Sparkles, Instagram, Video } from "lucide-react";
import { toast } from "sonner";

// WhatsApp-Icon als SVG
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function buildWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^\d+]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

const LEAD_FLOWS = [
  {
    title: "Info-Paket per DM",
    trigger: "🔥",
    postExample: "Wer mehr über mein Business wissen will — kommentiere 🔥 und ich schick dir ein Info-Paket per DM!",
    dmResponse: "Hey! Danke für dein Interesse 💛\n\nHier ist das Info-Paket wie versprochen:\n\n📋 Business-Konzept erklärt\n💰 Verdienstmöglichkeiten\n🎁 Produkt-Übersicht\n\n👉 [Link zu deinem Landing-Page]\n\nHast du Fragen? Schreib einfach, ich antworte persönlich!",
    tags: ["Info", "Opportunity"],
  },
  {
    title: "Produkt-Probe anbieten",
    trigger: "PROBE",
    postExample: "Willst du meine Top-Produkte selbst testen? Schreib mir 'PROBE' in die DMs und ich melde mich!",
    dmResponse: "Hey! Danke für deine Nachricht 🌿\n\nIch schicke dir gerne eine Produkt-Empfehlung basierend auf deinen Zielen:\n\n❓ Was möchtest du verbessern?\n- Energie & Vitalität\n- Haut & Anti-Aging\n- Abnehmen & Fitness\n- Immunsystem\n\nSchreib mir deinen Fokus und ich gebe dir meine persönliche Empfehlung!",
    tags: ["Produkt", "Probe"],
  },
  {
    title: "Kostenloses Beratungsgespräch",
    trigger: "GESPRÄCH",
    postExample: "Du überlegst auch ein Nebeneinkommen aufzubauen? Ich biete dir ein 15-Min kostenloses Gespräch an. Schreib 'GESPRÄCH' in die DMs!",
    dmResponse: "Hey! Cool dass du Interesse hast 🚀\n\nLass uns einfach 15 Minuten unverbindlich quatschen — ich zeige dir wie es bei mir funktioniert und du entscheidest dann ob's was für dich ist.\n\n📅 Buch dir einen Termin:\n[Calendly-Link / WhatsApp]\n\nKeine Verkaufspräsentation, nur ein ehrliches Gespräch. Versprochen!",
    tags: ["Beratung", "Qualifizierung"],
  },
  {
    title: "Autokonzept-Rechner",
    trigger: "AUTO",
    postExample: "Du willst wissen wie du dir dein Traumauto über Network Marketing finanzieren kannst? Kommentiere 'AUTO' und ich schick dir den Rechner!",
    dmResponse: "Hey! Das Auto-Konzept ist wirklich genial 🚗\n\nHier ist der Rechner wie versprochen:\n\n1️⃣ Welches Auto ist dein Traum?\n2️⃣ Welche monatliche Rate wäre ok?\n3️⃣ Wieviel Nebeneinkommen bräuchtest du?\n\nSchreib mir dein Traumauto und ich rechne dir konkret aus wie's funktionieren kann!",
    tags: ["Autokonzept", "Rechner"],
  },
  {
    title: "Follower zu Freunde",
    trigger: "HALLO",
    postExample: "Neu hier? Schreib mir 'HALLO' in die DMs — ich antworte persönlich!",
    dmResponse: "Hey! Schön dass du da bist 👋\n\nIch bin [Name] und bau mir gerade ein Business auf das mir Freiheit gibt — und nebenbei zeige ich anderen wie sie das auch schaffen.\n\nWas hat dich zu mir geführt? Erzähl ein bisschen von dir — ich antworte JEDEM persönlich!",
    tags: ["Welcome", "Connection"],
  },
  {
    title: "Lead-Magnet kostenlos",
    trigger: "GUIDE",
    postExample: "Mein kostenloser Guide 'In 90 Tagen zum Nebeneinkommen' — Kommentiere 'GUIDE' und ich schick ihn dir per DM!",
    dmResponse: "Hey! Hier ist dein Guide wie versprochen 🎁\n\n👉 [Link zum PDF / Landing Page]\n\nDer Guide zeigt dir:\n✅ Woche 1-4: Grundlagen legen\n✅ Woche 5-8: Erste Umsätze\n✅ Woche 9-12: Skalierung\n\nLies ihn heute noch — und schreib mir dann was du denkst! Ich freu mich auf dein Feedback 💛",
    tags: ["Lead-Magnet", "Kostenlos"],
  },
];

const POST_TEMPLATES = [
  {
    name: "Kommentar-Magnet (Instagram/TikTok)",
    structure: [
      "🎯 HOOK: Aufmerksamkeit fesseln",
      "📖 STORY: 2-3 Sätze Kontext",
      "💡 VALUE: Was lernen sie?",
      "🔥 CTA: 'Kommentiere [TRIGGER] für...'",
    ],
    example: "Mein Chef hat gelacht als ich gekündigt habe.\n\n6 Monate später verdiene ich mehr als je zuvor — ohne feste Arbeitszeiten, von überall aus.\n\nDer Schlüssel? Ein Business-Modell das die meisten ignorieren.\n\nKommentiere 🔥 und ich schick dir alle Details per DM!",
  },
  {
    name: "Story-Reply (Instagram Stories)",
    structure: [
      "❓ FRAGE: Sticker mit Yes/No",
      "💬 POLL: Nach dem Yes, neue Story",
      "🎁 ANGEBOT: Kostenlose Info",
      "✉️ REPLY: DM mit Details",
    ],
    example: "Story 1: 'Willst du auch nebenbei Geld verdienen?' [JA/NEIN Sticker]\nStory 2: 'Perfekt! Schreib mir PROBE für eine kostenlose Produkt-Empfehlung'\nStory 3: Info-Slides mit deinem Angebot",
  },
  {
    name: "Save + Share (LinkedIn/Threads)",
    structure: [
      "📝 LISTE: Nummerierte Tipps",
      "💎 WERT: Konkrete Insights",
      "🔖 SAVE: 'Speichere diesen Post'",
      "📩 CTA: 'DM für mehr'",
    ],
    example: "5 Dinge die mich im 1. Jahr als LR Partner am meisten überrascht haben:\n\n1. Die Community ist unbezahlbar\n2. Es ist mehr Business als ich dachte\n3. Persönliches Wachstum > Geld\n4. Produkte verkaufen sich von selbst wenn du sie liebst\n5. Das erste Jahr ist das härteste\n\n🔖 Speichere diesen Post — du wirst ihn brauchen\n📩 Fragen? DM mir!",
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-8 gap-1.5 text-xs"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Kopiert!");
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {copied ? "Kopiert" : "Kopieren"}
    </Button>
  );
}

function WhatsAppButton({ phone, message }: { phone: string; message: string }) {
  if (!phone) return null;
  return (
    <Button
      size="sm"
      className="h-8 gap-1.5 text-xs bg-[#25D366] hover:bg-[#1ebe5d] text-white"
      onClick={() => window.open(buildWhatsAppLink(phone, message), "_blank")}
    >
      <WhatsAppIcon className="h-3.5 w-3.5" />
      WhatsApp senden
    </Button>
  );
}

export default function LeadCapturePage() {
  const [waPhone, setWaPhone] = useState(() => {
    return localStorage.getItem("lead-capture-wa-phone") || "";
  });
  const [customTrigger, setCustomTrigger] = useState("");
  const [customPost, setCustomPost] = useState("");
  const [customDM, setCustomDM] = useState("");
  const [customName, setCustomName] = useState("");

  const savePhone = (v: string) => {
    setWaPhone(v);
    localStorage.setItem("lead-capture-wa-phone", v);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>
          DM Lead Capture
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verwandle Follower in Kontakte: Post-Trigger → DM-Flow → Lead. 6 bewährte Flows + eigenen Flow bauen.
        </p>
      </div>

      {/* Hero-Info-Box */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center gap-4 flex-wrap">
            <Target className="h-10 w-10 text-primary shrink-0" />
            <div className="flex-1 min-w-[200px]">
              <h3 className="font-semibold text-base">Die Formel für mehr Kontakte</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Post mit Trigger-Wort ("Kommentiere 🔥") → Kommentar → WhatsApp- oder DM-Antwort → Lead ist warm.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="gap-1 border-primary/30">
                <Instagram className="h-3 w-3" /> Instagram
              </Badge>
              <Badge variant="outline" className="gap-1 border-primary/30">
                <Video className="h-3 w-3" /> TikTok
              </Badge>
              <Badge variant="outline" className="gap-1 border-[#25D366]/50 text-[#25D366]">
                <WhatsAppIcon className="h-3 w-3" /> WhatsApp
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp-Nummer konfigurieren */}
      <Card className="border-[#25D366]/30 bg-[#25D366]/5">
        <CardContent className="p-4 flex items-center gap-3 flex-wrap">
          <WhatsAppIcon className="h-8 w-8 text-[#25D366] shrink-0" />
          <div className="flex-1 min-w-[200px]">
            <h3 className="text-sm font-semibold">Deine WhatsApp-Nummer (optional)</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Einmal eingeben — alle Flows bekommen dann "WhatsApp senden"-Buttons mit vorgefüllter Nachricht. Nur lokal gespeichert.
            </p>
          </div>
          <Input
            type="tel"
            placeholder="+491715060008"
            value={waPhone}
            onChange={(e) => savePhone(e.target.value)}
            className="max-w-[200px]"
          />
        </CardContent>
      </Card>

      {/* Fertige Flows */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Bewährte Lead-Flows (6)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LEAD_FLOWS.map((flow, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-border/50 hover:border-primary/30 transition-colors h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <span className="text-primary">#{i + 1}</span>
                      {flow.title}
                    </CardTitle>
                    <div className="flex gap-1">
                      {flow.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Trigger */}
                  <div className="flex items-center gap-2 text-xs">
                    <Zap className="h-3 w-3 text-amber-400" />
                    <span className="text-muted-foreground">Trigger-Wort:</span>
                    <Badge variant="outline" className="border-amber-500/30 text-amber-300 font-mono">{flow.trigger}</Badge>
                  </div>

                  {/* Post */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">📱 Post-Text</div>
                    <div className="bg-background/50 border border-border/50 rounded-lg p-3">
                      <p className="text-xs whitespace-pre-line">{flow.postExample}</p>
                    </div>
                    <CopyButton text={flow.postExample} />
                  </div>

                  {/* DM Response */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> DM / WhatsApp-Antwort
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs whitespace-pre-line">{flow.dmResponse}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <CopyButton text={flow.dmResponse} />
                      <WhatsAppButton phone={waPhone} message={flow.dmResponse} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Post-Templates */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-primary" />
          Post-Templates für DM-Trigger
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {POST_TEMPLATES.map((tpl, i) => (
            <Card key={i} className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">{tpl.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1">
                  {tpl.structure.map((s, j) => (
                    <li key={j} className="text-xs text-muted-foreground">{s}</li>
                  ))}
                </ul>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5">
                  <p className="text-xs italic whitespace-pre-line">{tpl.example}</p>
                </div>
                <CopyButton text={tpl.example} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Eigener Flow Builder */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Eigenen Lead-Flow bauen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Name des Flows</label>
            <Input
              placeholder="z.B. Mein Produkt-Probe-Flow"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Trigger-Wort (was soll kommentiert werden?)</label>
            <Input
              placeholder="z.B. INFO, PROBE, START"
              value={customTrigger}
              onChange={(e) => setCustomTrigger(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Post-Text (mit Call-to-Action)</label>
            <Textarea
              placeholder={`Hey! Wer wissen will wie ich... Kommentiere "${customTrigger || "XXXX"}" und ich schick dir alles per DM!`}
              value={customPost}
              onChange={(e) => setCustomPost(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">DM-Antwort (was schickst du als DM?)</label>
            <Textarea
              placeholder="Hey! Danke für deine Nachricht! Hier sind die Infos..."
              value={customDM}
              onChange={(e) => setCustomDM(e.target.value)}
              rows={5}
            />
          </div>
          {(customPost || customDM) && (
            <div className="flex gap-2 flex-wrap">
              {customPost && <CopyButton text={customPost} />}
              {customDM && <CopyButton text={customDM} />}
              {customDM && <WhatsAppButton phone={waPhone} message={customDM} />}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How-To */}
      <Card className="border-border/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">So nutzt du Lead Capture</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          {[
            { num: "1", label: "Post mit Trigger", desc: "Wähle einen Flow oder baue eigenen" },
            { num: "2", label: "Veröffentlichen", desc: "Copy + Paste auf Instagram/TikTok" },
            { num: "3", label: "Kommentare sammeln", desc: "Trigger-Wort = Interesse" },
            { num: "4", label: "DM-Antwort senden", desc: "Fertigen Text kopieren + senden" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">{s.num}</div>
              <span className="text-xs font-semibold">{s.label}</span>
              <span className="text-[10px] text-muted-foreground">{s.desc}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
