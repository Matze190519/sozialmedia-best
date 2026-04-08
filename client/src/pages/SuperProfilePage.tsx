import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Instagram, ExternalLink, MessageCircle, FileText, Link2,
  CheckCircle, ChevronDown, ChevronUp, Rocket, Users, Zap,
  Copy, ArrowRight, HelpCircle, Sparkles, BarChart3
} from "lucide-react";
import { useState } from "react";

function CopyText({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm whitespace-pre-wrap">{text}</div>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      >
        {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        <span className="ml-1 text-xs">{copied ? "Kopiert!" : label}</span>
      </Button>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-sm">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 ml-2" /> : <ChevronDown className="h-4 w-4 shrink-0 ml-2" />}
      </button>
      {open && <div className="px-4 pb-4 text-sm text-muted-foreground">{a}</div>}
    </div>
  );
}

function StepCard({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">{step}</div>
        <div className="w-0.5 flex-1 bg-border mt-2" />
      </div>
      <div className="pb-8 flex-1 min-w-0">
        <h3 className="font-semibold text-base mb-2">{title}</h3>
        <div className="text-sm text-muted-foreground space-y-2">{children}</div>
      </div>
    </div>
  );
}

export default function SuperProfilePage() {
  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
            <Instagram className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Instagram Growth mit SuperProfile</h1>
            <p className="text-muted-foreground">Automatisch Leads sammeln wenn jemand kommentiert</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary" className="gap-1"><Zap className="h-3 w-3" /> AutoDM</Badge>
          <Badge variant="secondary" className="gap-1"><FileText className="h-3 w-3" /> Lead Magnets</Badge>
          <Badge variant="secondary" className="gap-1"><Link2 className="h-3 w-3" /> Link-in-bio</Badge>
          <Badge variant="outline" className="gap-1 text-green-500 border-green-500/30"><Sparkles className="h-3 w-3" /> Kostenloser Start</Badge>
        </div>
      </div>

      {/* Was ist SuperProfile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Was ist SuperProfile?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>Stell dir vor, du postest ein Bild auf Instagram. Jemand sieht es und schreibt in die Kommentare <strong>"INFO"</strong>. Normalerweise muesstest du jetzt manuell eine Nachricht an diese Person schicken.</p>
          <p><strong>SuperProfile macht das automatisch fuer dich.</strong> Die Person kommentiert "INFO" und bekommt innerhalb von Sekunden eine private Nachricht (DM) von dir - mit einem Link zu deinem Content, deinem Shop oder was auch immer du willst. Das laeuft 24/7.</p>
          <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-2">
            <p className="font-medium">So laeuft es zusammen:</p>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <Badge variant="outline">Content erstellen</Badge>
              <ArrowRight className="h-3 w-3" />
              <Badge variant="outline">Blotato postet</Badge>
              <ArrowRight className="h-3 w-3" />
              <Badge variant="outline">Jemand kommentiert</Badge>
              <ArrowRight className="h-3 w-3" />
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">SuperProfile sendet DM</Badge>
              <ArrowRight className="h-3 w-3" />
              <Badge variant="outline">Neuer Lead!</Badge>
            </div>
          </div>
          <p className="text-muted-foreground"><strong>Wichtig:</strong> SuperProfile ersetzt Blotato NICHT. Blotato postet weiterhin. SuperProfile kuemmert sich nur darum, was passiert wenn jemand auf eure Posts reagiert.</p>
        </CardContent>
      </Card>

      {/* Kosten */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Was kostet das?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-green-500/30 rounded-lg p-4 bg-green-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-500 text-white border-0">Empfohlen zum Start</Badge>
              </div>
              <h3 className="font-bold text-lg">Starter</h3>
              <p className="text-2xl font-bold text-green-500">Kostenlos</p>
              <p className="text-xs text-muted-foreground mb-3">Fuer immer, keine Kreditkarte</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>- AutoDM auf Posts & Reels</li>
                <li>- 3 Keywords</li>
                <li>- 10 Leads pro Monat</li>
                <li>- Link-in-bio</li>
              </ul>
            </div>
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-bold text-lg">Creator</h3>
              <p className="text-2xl font-bold">~27 EUR/Monat</p>
              <p className="text-xs text-muted-foreground mb-3">Erster Monat nur ~4,50 EUR</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>- Alles unbegrenzt</li>
                <li>- 5 Instagram-Accounts</li>
                <li>- Stories/DMs/Lives AutoDM</li>
                <li>- Kein "Powered by" Branding</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schritt-fuer-Schritt Anleitung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Rocket className="h-5 w-5" /> Einrichtung Schritt fuer Schritt
          </CardTitle>
          <CardDescription>Dauert insgesamt ca. 15 Minuten</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          <StepCard step={1} title="Account erstellen">
            <p>Oeffne <strong>superprofile.bio</strong> und tippe auf "Start for Free". Melde dich mit deiner E-Mail an.</p>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open("https://superprofile.bio", "_blank")}>
              <ExternalLink className="h-3 w-3" /> SuperProfile oeffnen
            </Button>
          </StepCard>

          <StepCard step={2} title="Instagram verbinden">
            <p>Verbinde deinen <strong>Instagram Business Account</strong>. SuperProfile ist ein offizieller Meta Verified Tech Provider - also sicher.</p>
            <p className="text-xs bg-amber-500/10 text-amber-500 rounded p-2">Du brauchst einen Instagram Business Account (kein privater). Umstellung: Instagram → Einstellungen → Konto → Zu professionellem Konto wechseln → "Business"</p>
          </StepCard>

          <StepCard step={3} title="AutoDM einrichten">
            <p>Gehe auf <strong>"AutoDM"</strong> und erstelle einen neuen AutoDM:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Trigger: <strong>Post & Reels</strong></li>
              <li>Keyword: <strong>INFO</strong> (oder was du willst)</li>
              <li>Nachricht schreiben (siehe unten)</li>
              <li>Link einfuegen</li>
              <li>Aktivieren!</li>
            </ul>
          </StepCard>

          <StepCard step={4} title="Post-Text anpassen">
            <p>Fuege am Ende jedes Posts einen Textbaustein ein, damit die Leute wissen dass sie kommentieren sollen. Fertige Texte zum Kopieren findest du weiter unten.</p>
          </StepCard>

          <StepCard step={5} title="Testen!">
            <p>Kommentiere unter deinem eigenen Post <strong>"INFO"</strong> und pruefe ob du eine DM bekommst. Wenn ja - alles fertig!</p>
          </StepCard>
        </CardContent>
      </Card>

      {/* DM Nachricht Vorlage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" /> Fertige DM-Nachricht
          </CardTitle>
          <CardDescription>Kopiere diese Nachricht in deinen AutoDM</CardDescription>
        </CardHeader>
        <CardContent>
          <CopyText
            label="Kopieren"
            text={`Hey! Schoen dass du Interesse hast! 😊

Hier ist dein exklusiver Zugang zu unserem Content Hub mit allen Infos, Tipps und Produkten:

👉 [DEIN LINK HIER]

Falls du Fragen hast, schreib mir einfach!`}
          />
        </CardContent>
      </Card>

      {/* Post-Textbausteine */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Post-Textbausteine zum Kopieren</CardTitle>
          <CardDescription>Fuege einen davon am Ende jedes Posts ein</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Variante 1 - Einfach</p>
            <CopyText label="Kopieren" text='Schreib "INFO" in die Kommentare und ich schicke dir alle Details per DM! 📩' />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Variante 2 - Neugierig machen</p>
            <CopyText label="Kopieren" text='Willst du wissen wie das geht? Kommentiere "WILL ICH" und du bekommst sofort eine Nachricht von mir! 🚀' />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Variante 3 - Gratis-Angebot</p>
            <CopyText label="Kopieren" text='Kommentiere "GRATIS" und ich schicke dir kostenlos mein PDF mit den 10 besten Tipps! 🎁' />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Variante 4 - Produkt</p>
            <CopyText label="Kopieren" text='Interesse? Schreib einfach "LINK" in die Kommentare! Ich schicke dir alle Infos direkt per DM 💬' />
          </div>
          <p className="text-xs text-amber-500 bg-amber-500/10 rounded p-2">Wichtig: Das Keyword im Post-Text muss GENAU das gleiche sein wie in SuperProfile eingestellt!</p>
        </CardContent>
      </Card>

      {/* Wo landen die Anfragen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Wo landen die Anfragen?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
                <Instagram className="h-4 w-4 text-pink-500" />
              </div>
              <div>
                <p className="font-medium text-sm">Instagram DMs</p>
                <p className="text-xs text-muted-foreground">Die Person bekommt automatisch deine DM. Wenn sie antwortet, siehst du das in deinen normalen Instagram-Nachrichten.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="font-medium text-sm">SuperProfile Dashboard</p>
                <p className="text-xs text-muted-foreground">Unter "Analytics" siehst du wie viele Leute kommentiert haben und wie viele die DM geoeffnet haben.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="font-medium text-sm">Brevo (bei Lead Magnets)</p>
                <p className="text-xs text-muted-foreground">Wenn du Lead Magnets nutzt, werden E-Mail-Adressen gesammelt die du in Brevo importieren kannst.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lead Magnets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" /> Lead Magnets (optional)
          </CardTitle>
          <CardDescription>Kostenloses PDF anbieten um E-Mails einzusammeln</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>Ein Lead Magnet ist etwas Kostenloses das du anbietest, um E-Mail-Adressen einzusammeln.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: "10 Tipps fuer mehr Energie", desc: "Kurze Tipps mit LR-Produktempfehlungen" },
              { title: "Mein Morgenritual", desc: "Persoenliches Ritual mit LR-Produkten" },
              { title: "Starter-Guide LR", desc: "Einfuehrung ins LR-System" },
              { title: "Ernaehrungsplan 7 Tage", desc: "Wochenplan mit LR-Produkten" },
            ].map(item => (
              <div key={item.title} className="border border-border rounded-lg p-3">
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground">Erstelle dein PDF kostenlos in <strong>Canva</strong> (canva.com). Lade es dann in SuperProfile unter "Lead Magnets" hoch.</p>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5" /> Haeufige Fragen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <FAQItem q="Muss ich fuer jeden Post einen neuen AutoDM einrichten?" a="Nein! Einmal eingerichtet gilt der AutoDM fuer ALLE deine Posts. Egal ob du morgen oder in 3 Monaten postest." />
          <FAQItem q="Funktioniert das auch wenn Blotato den Post macht?" a="Ja! Blotato postet auf deinem Instagram-Account. SuperProfile ueberwacht die Kommentare. Die beiden stoeren sich nicht." />
          <FAQItem q="Kann ich mehrere Keywords haben?" a="Im kostenlosen Plan: 3 Keywords. Im Creator Plan: unbegrenzt. Du kannst z.B. 'INFO' fuer allgemeine Posts und 'REZEPT' fuer Rezept-Posts einrichten." />
          <FAQItem q="Brauche ich einen Instagram Business Account?" a="Ja. Die Umstellung ist kostenlos und dauert 2 Minuten: Instagram → Einstellungen → Konto → Zu professionellem Konto wechseln → Business." />
          <FAQItem q="Sehen andere dass ich SuperProfile nutze?" a="Im kostenlosen Plan steht klein 'Powered by SuperProfile' unter der DM. Im Creator Plan ist das weg." />
          <FAQItem q="Kann mein ganzes Team das nutzen?" a="Ja! Jeder Partner erstellt seinen eigenen SuperProfile-Account und verbindet seinen eigenen Instagram-Account." />
          <FAQItem q="Was kostet es wirklich?" a="Starter: 0 EUR fuer immer. Creator: ca. 4,50 EUR erster Monat, danach ca. 27 EUR/Monat. Keine versteckten Gebuehren." />
          <FAQItem q="Kann ich jederzeit kuendigen?" a="Ja, monatlich kuendbar. Dein Account wird dann auf den kostenlosen Starter-Plan zurueckgesetzt." />
          <FAQItem q="Was wenn jemand 'info' klein schreibt?" a="SuperProfile erkennt das normalerweise trotzdem. Aber schreib sicherheitshalber im Post-Text das Keyword so wie du es eingestellt hast." />
          <FAQItem q="Ich habe noch nie sowas gemacht, schaffe ich das?" a="Ja! Die Einrichtung dauert maximal 15 Minuten mit dieser Anleitung. Und wenn du nicht weiterkommst, schreib in die Team-Gruppe." />
        </CardContent>
      </Card>

      {/* Checkliste */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Checkliste</CardTitle>
          <CardDescription>Hake ab wenn du fertig bist</CardDescription>
        </CardHeader>
        <CardContent>
          <ChecklistItems />
        </CardContent>
      </Card>
    </div>
  );
}

function ChecklistItems() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const items = [
    "SuperProfile Account erstellt",
    "Instagram Business Account verbunden",
    "Erstes Keyword eingerichtet (z.B. INFO)",
    "DM-Nachricht geschrieben mit Link",
    "AutoDM aktiviert",
    "Post-Text angepasst (Keyword erwaehnen)",
    "Link-in-bio eingerichtet (optional)",
    "Test: Unter eigenem Post kommentiert und DM erhalten",
  ];

  const toggle = (item: string) => setChecked(prev => ({ ...prev, [item]: !prev[item] }));
  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(doneCount / items.length) * 100}%` }} />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{doneCount}/{items.length}</span>
      </div>
      {items.map(item => (
        <label key={item} className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={checked[item] || false}
            onChange={() => toggle(item)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span className={`text-sm transition-colors ${checked[item] ? "line-through text-muted-foreground" : ""}`}>{item}</span>
        </label>
      ))}
    </div>
  );
}


