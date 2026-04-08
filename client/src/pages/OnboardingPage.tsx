import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import {
  Rocket, CheckCircle, Circle, ArrowRight, Zap, Key,
  Send, Eye, Settings, Sparkles,
  Clock, Shield, TrendingUp, Play, ExternalLink,
  Monitor, Link2, Copy, UserPlus, LogIn,
  Smartphone, Instagram, Facebook, Youtube, Linkedin,
} from "lucide-react";

const ONBOARDING_STEPS = [
  {
    id: "login",
    title: "Einloggen",
    desc: "Du bist angemeldet und hast Zugang zum System.",
    icon: Shield,
    auto: true,
  },
  {
    id: "blotato",
    title: "Blotato einrichten (optional)",
    desc: "Für automatisches Posten auf allen Plattformen. Ohne Blotato kannst du Content manuell kopieren.",
    icon: Key,
    link: "/settings",
    linkLabel: "Zu den Einstellungen",
  },
  {
    id: "branding",
    title: "Persönliches Branding",
    desc: "Hinterlege deine Signatur, Hashtags und CTA damit der Content nach dir klingt.",
    icon: Sparkles,
    link: "/settings",
    linkLabel: "Branding einrichten",
  },
  {
    id: "first_post",
    title: "Ersten Post erstellen",
    desc: "Generiere deinen ersten viralen Post mit der Brand Voice Engine.",
    icon: Zap,
    link: "/generator",
    linkLabel: "Content erstellen",
  },
  {
    id: "approval",
    title: "Post freigeben",
    desc: "Prüfe deinen Post und gib ihn mit einem Klick frei. Dann wird er automatisch gepostet.",
    icon: CheckCircle,
    link: "/approval",
    linkLabel: "Zur Freigabe",
  },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: settings } = trpc.userSettings.get.useQuery();
  const { data: stats } = trpc.dashboard.stats.useQuery();

  const completedSteps = [
    true,
    !!settings?.hasBlotatoKey,
    !!(settings?.personalBranding && (settings.personalBranding as any).signature),
    (stats?.total ?? 0) > 0,
    (stats?.approved ?? 0) + (stats?.published ?? 0) + (stats?.scheduled ?? 0) > 0,
  ];
  const completedCount = completedSteps.filter(Boolean).length;
  const progress = (completedCount / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Rocket className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Willkommen im LR Content Hub!</h1>
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto">
          In 5 Minuten bist du startklar. Folge diesen Schritten und dein Content läuft auf Autopilot.
        </p>
      </div>

      {/* Progress */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Setup-Fortschritt</p>
            <Badge variant={progress === 100 ? "default" : "secondary"}>
              {completedCount}/{ONBOARDING_STEPS.length} erledigt
            </Badge>
          </div>
          <Progress value={progress} className="h-3" />
          {progress === 100 && (
            <p className="text-sm text-emerald-400 mt-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Alles eingerichtet! Du bist startklar.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-3">
        {ONBOARDING_STEPS.map((step, i) => {
          const completed = completedSteps[i];
          const StepIcon = step.icon;
          return (
            <Card
              key={step.id}
              className={`transition-all ${completed ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/50"}`}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                  completed ? "bg-emerald-500/20" : "bg-accent"
                }`}>
                  {completed ? (
                    <CheckCircle className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <StepIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${completed ? "text-emerald-400" : ""}`}>
                      {i + 1}. {step.title}
                    </p>
                    {completed && <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">Erledigt</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
                {!completed && step.link && (
                  <Button
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={() => setLocation(step.link!)}
                  >
                    {step.linkLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ============================================ */}
      {/* BLOTATO KOMPLETT-ANLEITUNG */}
      {/* ============================================ */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Send className="h-5 w-5 text-amber-400" />
            Blotato einrichten - Komplette Anleitung
          </CardTitle>
          <CardDescription>
            Mit Blotato postest du automatisch auf Instagram, Facebook, TikTok, LinkedIn, YouTube, Threads und mehr. Kosten: ab 25€/Monat.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Schritt 1: Account erstellen */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400">1</div>
              <h3 className="font-semibold">Account erstellen</h3>
            </div>
            <div className="ml-11 space-y-2">
              <p className="text-sm text-muted-foreground">
                Gehe zu <a href="https://my.blotato.com" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline inline-flex items-center gap-1 font-medium">my.blotato.com <ExternalLink className="h-3 w-3" /></a> und erstelle einen Account.
              </p>
              <div className="bg-background/50 rounded-lg p-3 text-sm space-y-1">
                <p className="flex items-center gap-2"><LogIn className="h-4 w-4 text-muted-foreground" /> E-Mail eingeben und registrieren</p>
                <p className="flex items-center gap-2"><Key className="h-4 w-4 text-muted-foreground" /> Starter Plan wählen (25€/Monat - bis zu 20 Social-Media-Accounts)</p>
                <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /> Zahlungsmethode hinterlegen</p>
              </div>
            </div>
          </div>

          {/* Schritt 2: Social Media Kanäle verbinden */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400">2</div>
              <h3 className="font-semibold">Deine Social-Media-Kanäle verbinden</h3>
            </div>
            <div className="ml-11 space-y-3">
              <p className="text-sm text-muted-foreground">
                Gehe in Blotato zu <a href="https://my.blotato.com/settings" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline inline-flex items-center gap-1 font-medium">Settings <ExternalLink className="h-3 w-3" /></a> und verbinde deine Accounts:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: "Instagram", icon: Instagram, desc: "Posts, Reels, Stories, Carousels" },
                  { name: "Facebook", icon: Facebook, desc: "Pages, Posts, Reels" },
                  { name: "TikTok", icon: Smartphone, desc: "Videos, Slideshows" },
                  { name: "LinkedIn", icon: Linkedin, desc: "Personal + Company" },
                  { name: "YouTube", icon: Youtube, desc: "Videos, Shorts" },
                  { name: "Twitter/X", icon: Monitor, desc: "Posts, Threads" },
                  { name: "Threads", icon: Link2, desc: "Posts, Threads" },
                  { name: "Pinterest", icon: Eye, desc: "Pins, Videos" },
                ].map(p => (
                  <div key={p.name} className="bg-background/50 rounded-lg p-2.5 text-center">
                    <p.icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs font-medium">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                  </div>
                ))}
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm">
                <p className="font-medium text-amber-400 mb-1">Wichtig beim Verbinden:</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Logge dich ZUERST in deinen Social-Media-Account ein (z.B. Instagram), DANN klicke in Blotato auf "Login with Instagram". 
                  Bei Facebook: Wähle jede Page einzeln aus (nicht "alle verbinden"). 
                  Für einen zweiten Account pro Plattform: Nutze ein Inkognito-Fenster.
                </p>
              </div>
            </div>
          </div>

          {/* Schritt 3: API Key kopieren */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400">3</div>
              <h3 className="font-semibold">API Key kopieren</h3>
            </div>
            <div className="ml-11 space-y-2">
              <p className="text-sm text-muted-foreground">
                In Blotato: Gehe zu <a href="https://my.blotato.com/settings" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline inline-flex items-center gap-1 font-medium">Settings <ExternalLink className="h-3 w-3" /></a> und scrolle runter zu <strong>"API Access"</strong>.
              </p>
              <div className="bg-background/50 rounded-lg p-3 text-sm space-y-2">
                <p className="flex items-center gap-2"><Eye className="h-4 w-4 text-muted-foreground" /> Scrolle in den Blotato Settings nach unten bis "API Access"</p>
                <p className="flex items-center gap-2"><Copy className="h-4 w-4 text-muted-foreground" /> Klicke auf <strong>"Copy API Key"</strong></p>
                <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /> Der Key ist jetzt in deiner Zwischenablage</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Falls du noch keinen Key hast: Klicke auf "Generate API Key". Der Key sieht aus wie eine lange Zeichenkette (z.B. <code className="bg-muted px-1 rounded">blot_abc123xyz...</code>).
              </p>
            </div>
          </div>

          {/* Schritt 4: Key im Dashboard einfügen */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400">4</div>
              <h3 className="font-semibold">API Key hier im Dashboard einfügen</h3>
            </div>
            <div className="ml-11 space-y-2">
              <p className="text-sm text-muted-foreground">
                Jetzt den kopierten Key hier bei uns einfügen:
              </p>
              <div className="bg-background/50 rounded-lg p-3 text-sm space-y-2">
                <p className="flex items-center gap-2"><Settings className="h-4 w-4 text-muted-foreground" /> Gehe zu <strong>Einstellungen</strong> (links im Menü)</p>
                <p className="flex items-center gap-2"><Key className="h-4 w-4 text-muted-foreground" /> Füge den Key in das Feld <strong>"Blotato API Key"</strong> ein</p>
                <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /> Klicke auf <strong>"Key speichern"</strong></p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 mt-1"
                onClick={() => setLocation("/settings")}
              >
                <Settings className="h-3.5 w-3.5" /> Jetzt zu den Einstellungen
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Fertig! */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <p className="font-medium text-emerald-400 flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4" /> Fertig!
            </p>
            <p className="text-sm text-muted-foreground">
              Ab jetzt wird jeder Content, den du freigibst, automatisch auf allen verbundenen Plattformen gepostet. 
              Du kannst in den Einstellungen auch festlegen, zu welcher Uhrzeit gepostet werden soll.
            </p>
          </div>

          {/* Kein Blotato? */}
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="font-medium text-sm mb-1">Kein Blotato? Kein Problem!</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Du kannst alle Features des Content Hubs auch ohne Blotato nutzen. Erstelle Content, gib ihn frei, und kopiere dann 
              Text + Bild aus der Bibliothek. Poste manuell auf deinen Kanälen. Blotato spart dir nur die Zeit des manuellen Postens.
            </p>
          </div>

          {/* Hilfe-Links */}
          <div className="flex flex-wrap gap-2">
            <a href="https://help.blotato.com/settings/social-accounts" target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ExternalLink className="h-3 w-3" /> Blotato: Kanäle verbinden
              </Button>
            </a>
            <a href="https://help.blotato.com/settings/api-keys" target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ExternalLink className="h-3 w-3" /> Blotato: API Key finden
              </Button>
            </a>
            <a href="https://help.blotato.com" target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ExternalLink className="h-3 w-3" /> Blotato Hilfe-Center
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            So funktioniert das System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold">1. Content erstellen</h3>
              <p className="text-sm text-muted-foreground">
                Wähle ein Thema, die Brand Voice Engine generiert viralen Text. 
                Füge optional ein KI-Bild oder Produktbild hinzu. Oder nutze fertigen Content aus der Bibliothek.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="font-semibold">2. Selbst freigeben</h3>
              <p className="text-sm text-muted-foreground">
                Du prüfst DEINEN Content, bearbeitest ihn bei Bedarf und gibst ihn mit einem Klick frei. 
                Jeder gibt nur seinen eigenen Content frei.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto">
                <Send className="h-7 w-7 text-amber-400" />
              </div>
              <h3 className="font-semibold">3. Automatisch posten</h3>
              <p className="text-sm text-muted-foreground">
                Nach der Freigabe wird der Post automatisch über Blotato auf Instagram, Facebook, TikTok etc. veröffentlicht.
                Ohne Blotato: Kopiere den Post aus der Bibliothek.
              </p>
            </div>
          </div>

          {/* Zugang über Lina */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
              <Smartphone className="h-4 w-4 text-primary" />
              Zugang über Lina (WhatsApp)
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Du erreichst alle Features auch über Lina auf WhatsApp. Schreibe Lina und wähle <strong>"Neue Features"</strong> im Hauptmenü. 
              Dort findest du: Content Hub öffnen, Content freigeben, Fertiger Content abrufen, KI-Coach Einwandbehandlung, Content on Demand und mehr.
              Lina schickt dir den direkten Link zum Dashboard.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Content Mix Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            Content-Mix für maximale Reichweite (14 Posts/Woche)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { name: "Business", count: "4x", type: "Lifestyle", emoji: "\u{1F4BC}" },
              { name: "Autokonzept", count: "3x", type: "Lifestyle", emoji: "\u{1F697}" },
              { name: "Lifestyle", count: "3x", type: "Lifestyle", emoji: "\u2728" },
              { name: "Gesundheit", count: "2x", type: "Produkt", emoji: "\u{1F33F}" },
              { name: "Lina / KI", count: "2x", type: "Lifestyle", emoji: "\u{1F916}" },
            ].map(item => (
              <div key={item.name} className="text-center p-3 bg-background/50 rounded-lg">
                <p className="text-2xl mb-1">{item.emoji}</p>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.count}/Woche</p>
                <Badge variant="outline" className="text-[9px] mt-1">
                  {item.type}
                </Badge>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            86% Lifestyle-Content (Freiheit, Autos, Erfolg) zieht Leads an. 14% Produkt-Content (Aloe Vera, Gesundheit) konvertiert. 
            Diesen Mix hat der Agent Brain aus den erfolgreichsten LR-Partnern abgeleitet.
          </p>
        </CardContent>
      </Card>

      {/* Checkliste */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-400" />
            Deine Checkliste
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {completedSteps[1] ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
              <span>Blotato Account erstellen und Kanäle verbinden (optional, 25€/Monat)</span>
            </div>
            <div className="flex items-center gap-2">
              {completedSteps[1] ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
              <span>Blotato API Key in den Einstellungen hinterlegen</span>
            </div>
            <div className="flex items-center gap-2">
              {completedSteps[2] ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
              <span>Persönliches Branding einrichten (Signatur, Hashtags, CTA)</span>
            </div>
            <div className="flex items-center gap-2">
              {completedSteps[3] ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
              <span>Ersten Test-Post erstellen</span>
            </div>
            <div className="flex items-center gap-2">
              {completedSteps[4] ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
              <span>Post freigeben und veröffentlichen</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-muted-foreground" />
              <span>Posting-Zeiten pro Plattform festlegen (Einstellungen)</span>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={() => setLocation("/generator")} className="gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Content erstellen
            </Button>
            <Button size="sm" variant="outline" onClick={() => setLocation("/settings")} className="gap-1.5">
              <Settings className="h-3.5 w-3.5" /> Einstellungen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex justify-center gap-3">
        <Button size="lg" onClick={() => setLocation("/generator")} className="gap-2">
          <Zap className="h-5 w-5" />
          Ersten Post erstellen
        </Button>
        <Button size="lg" variant="outline" onClick={() => setLocation("/")} className="gap-2">
          <Rocket className="h-5 w-5" />
          Zum Dashboard
        </Button>
      </div>
    </div>
  );
}
