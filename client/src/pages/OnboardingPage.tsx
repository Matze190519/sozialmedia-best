import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { useState } from "react";
import {
  Rocket, CheckCircle, Circle, ArrowRight, Zap, Key,
  Send, Package, Eye, Settings, Users, Sparkles,
  Clock, Shield, TrendingUp, Play,
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
    title: "Blotato einrichten",
    desc: "Verbinde deinen Blotato Account für automatisches Posten auf Social Media.",
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
    title: "Post freigeben lassen",
    desc: "Dein Admin prüft den Post und gibt ihn frei. Dann wird er automatisch gepostet.",
    icon: CheckCircle,
    link: "/approval",
    linkLabel: "Zur Freigabe",
  },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [, setLocation] = useLocation();
  const { data: settings } = trpc.userSettings.get.useQuery();
  const { data: stats } = trpc.dashboard.stats.useQuery();

  // Calculate completion
  const completedSteps = [
    true, // login
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
                Füge optional ein KI-Bild oder Produktbild hinzu.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="font-semibold">2. Freigeben</h3>
              <p className="text-sm text-muted-foreground">
                Du prüfst deinen Content, bearbeitest ihn bei Bedarf und gibst ihn mit einem Klick frei.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto">
                <Send className="h-7 w-7 text-blue-400" />
              </div>
              <h3 className="font-semibold">3. Automatisch posten</h3>
              <p className="text-sm text-muted-foreground">
                Nach der Freigabe wird der Post automatisch über Blotato auf Instagram, Facebook, TikTok etc. veröffentlicht.
              </p>
            </div>
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
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>Blotato API Key hinterlegen (Einstellungen) - optional für Auto-Posting</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-muted-foreground" />
                <span>Ersten Test-Post erstellen und freigeben</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-muted-foreground" />
                <span>Posting-Zeiten pro Plattform festlegen</span>
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
