import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { motion, useReducedMotion } from "framer-motion";
import {
  Rocket, Bot, Wand2, Send, Flame, Shield, Trophy,
  Sparkles, MessageCircle, ChevronDown, ArrowRight, Check,
  Zap, Globe, Video, Star, Clock, Users,
} from "lucide-react";

/**
 * Öffentliche Landingpage für sozialmedia.best
 *
 * Wird angezeigt, wenn kein User eingeloggt ist (Ad-Traffic, neue Partner).
 * Ziel: Vertrauen aufbauen → CTA WhatsApp (Lina-Onboarding) oder Login.
 * Komplett self-contained: keine tRPC-Calls, keine Auth, keine externen Bilder.
 */

const WHATSAPP_URL = "https://wa.me/491715060008?text=Hi%20Lina%2C%20ich%20m%C3%B6chte%20Zugang%20zum%20LR%20Content%20Hub!";

const STATS = [
  { value: "37+", label: "KI-Tools" },
  { value: "9", label: "Plattformen" },
  { value: "24/7", label: "Lina KI-Support" },
  { value: "< 2 Min", label: "zum fertigen Post" },
];

const FEATURES = [
  {
    icon: Wand2,
    title: "Content Wizard",
    desc: "Thema eingeben, fertig. Die KI schreibt Text, erstellt das Bild und liefert die Hashtags — in unter 2 Minuten.",
  },
  {
    icon: Bot,
    title: "Lina — deine KI-Mitarbeiterin",
    desc: "Lina erstellt Avatar-Videos, beantwortet Fragen rund um die Uhr und begleitet dich per WhatsApp. So etwas hat kein anderes Team.",
  },
  {
    icon: Send,
    title: "Auto-Posting auf 9 Kanäle",
    desc: "Instagram, TikTok, Facebook, LinkedIn, YouTube & mehr — ein Klick, überall online. Zur besten Uhrzeit, automatisch.",
  },
  {
    icon: Flame,
    title: "Trend-Radar",
    desc: "Das System scannt TikTok, YouTube und Reddit nach viralen Trends und baut dir sofort passenden Content daraus.",
  },
  {
    icon: Shield,
    title: "Compliance Shield",
    desc: "Jeder Post wird automatisch auf rechtliche Sicherheit geprüft. Keine Abmahn-Risiken, kein Rätselraten.",
  },
  {
    icon: Video,
    title: "KI-Videos in Kinoqualität",
    desc: "Produktvideos, Avatar-Clips und Reels auf Knopfdruck — ohne Kamera, ohne Schnittprogramm, ohne Vorkenntnisse.",
  },
];

const STEPS = [
  {
    num: "1",
    icon: MessageCircle,
    title: "Schreib Lina auf WhatsApp",
    desc: "Kein Passwort, kein Formular. Lina schickt dir deinen persönlichen Zugangslink direkt aufs Handy.",
  },
  {
    num: "2",
    icon: Zap,
    title: "Klick — und du bist drin",
    desc: "Ein Klick auf den Magic-Link und dein persönliches Content-Cockpit öffnet sich. Sofort startklar.",
  },
  {
    num: "3",
    icon: Rocket,
    title: "Poste wie ein Profi",
    desc: "Thema wählen, Post generieren, freigeben. Das System übernimmt den Rest — jeden Tag, auf allen Kanälen.",
  },
];

const FAQS = [
  {
    q: "Brauche ich Technik-Kenntnisse?",
    a: "Nein. Wenn du WhatsApp bedienen kannst, kannst du das System bedienen. Alles ist auf Deutsch, alles ist geführt, und Lina hilft dir bei jeder Frage.",
  },
  {
    q: "Was kostet mich das?",
    a: "Der Zugang zum System ist für Teampartner kostenlos — inklusive KI-Texte, KI-Bilder und Lina-Videos. Optional gibt es einen Auto-Posting-Dienst (ca. 25 €/Monat, direkt beim Anbieter).",
  },
  {
    q: "Wie bekomme ich Zugang?",
    a: "Schreib Lina auf WhatsApp. Sie prüft deine Partnernummer und schickt dir deinen persönlichen Login-Link. Das dauert keine 2 Minuten.",
  },
  {
    q: "Muss ich vor die Kamera?",
    a: "Nein. Die KI erstellt Bilder und Videos für dich — inklusive Lina als Video-Sprecherin, die deine Produkte erklärt. Wer selbst vor die Kamera will, kann — muss aber nicht.",
  },
  {
    q: "Wie viel Zeit brauche ich pro Tag?",
    a: "Mit dem Tages-Autopilot: 1 Klick am Morgen, kurz freigeben — fertig. Realistisch 5–10 Minuten am Tag für tägliche Präsenz auf allen Kanälen.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-semibold">{q}</span>
        <ChevronDown className={`h-4 w-4 text-primary shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const prefersReducedMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background bg-grid text-foreground overflow-x-hidden">
      {/* ── Sticky Nav ─────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all ${
          scrolled ? "bg-background/90 backdrop-blur border-b border-border/50" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="font-bold tracking-tight gradient-text-gold" style={{ fontFamily: "var(--font-heading)" }}>
              LR Content Hub
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
              onClick={() => { window.location.href = getLoginUrl(); }}
            >
              Login
            </Button>
            <Button
              size="sm"
              className="btn-gold rounded-xl"
              onClick={() => window.open(WHATSAPP_URL, "_blank")}
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              Zugang anfragen
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Glow-Hintergrund */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <motion.div
          className="relative max-w-4xl mx-auto text-center space-y-8"
          variants={stagger}
          initial={prefersReducedMotion ? undefined : "hidden"}
          animate="visible"
        >
          <motion.div variants={fadeUp}>
            <Badge variant="outline" className="border-primary/40 text-primary px-4 py-1.5 text-xs gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Exklusiv für das LR Lifestyle Team
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Dein Social Media läuft ab jetzt{" "}
            <span className="gold-shimmer">auf Autopilot.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Die KI-Content-Maschine für LR-Partner: Texte, Bilder und Videos auf Knopfdruck —
            automatisch gepostet auf 9 Plattformen. Kein Vorwissen nötig.
            <span className="text-foreground font-medium"> Nur du, dein Handy und 5 Minuten am Tag.</span>
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="btn-gold h-14 px-8 text-base rounded-2xl shadow-xl w-full sm:w-auto"
              onClick={() => window.open(WHATSAPP_URL, "_blank")}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Jetzt Zugang über Lina holen
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base rounded-2xl border-primary/30 hover:bg-primary/10 w-full sm:w-auto"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              Was steckt drin?
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 max-w-2xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="glass-card rounded-2xl p-4">
                <div className="text-2xl font-extrabold gradient-text-gold" style={{ fontFamily: "var(--font-heading)" }}>
                  {s.value}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Social Proof Bar ───────────────────────────── */}
      <section className="px-4 pb-16">
        <div className="max-w-3xl mx-auto glass-card rounded-2xl px-6 py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Live im Team-Einsatz</span>
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> 100 % auf Deutsch</span>
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> LR-Compliance geprüft</span>
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Kein Abo, kein Risiko</span>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section id="features" className="px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-10">
          <motion.div
            className="text-center space-y-3"
            variants={fadeUp}
            initial={prefersReducedMotion ? undefined : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <Badge variant="outline" className="border-primary/40 text-primary">Das System</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              Alles, was du brauchst. <span className="gradient-text-gold">Nichts, was dich aufhält.</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              37+ Profi-Tools in einem System — gebaut für Menschen, die Social Media nutzen wollen, ohne Social-Media-Profi zu sein.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={stagger}
            initial={prefersReducedMotion ? undefined : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={fadeUp}>
                <div className="glass-card glow-primary-hover rounded-2xl p-6 h-full transition-all">
                  <div className="h-11 w-11 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── So funktioniert's ──────────────────────────── */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto space-y-10">
          <motion.div
            className="text-center space-y-3"
            variants={fadeUp}
            initial={prefersReducedMotion ? undefined : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <Badge variant="outline" className="border-primary/40 text-primary">In 3 Schritten</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              Von null auf <span className="gradient-text-gold">sichtbar</span> — heute noch.
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            variants={stagger}
            initial={prefersReducedMotion ? undefined : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {STEPS.map((s, i) => (
              <motion.div key={s.num} variants={fadeUp} className="relative">
                <div className="glass-card rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full btn-gold flex items-center justify-center font-bold text-background">
                      {s.num}
                    </div>
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 h-5 w-5 text-primary/40 -translate-y-1/2" aria-hidden />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Lina USP ───────────────────────────────────── */}
      <section className="px-4 py-16">
        <motion.div
          className="max-w-5xl mx-auto"
          variants={fadeUp}
          initial={prefersReducedMotion ? undefined : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="glass-card border-gradient rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-primary/10 blur-[80px] pointer-events-none" aria-hidden />
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <Badge variant="outline" className="border-primary/40 text-primary gap-1.5">
                  <Bot className="h-3 w-3" /> Weltweit einzigartig
                </Badge>
                <h2 className="text-3xl font-bold leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  Lerne <span className="gold-shimmer">Lina</span> kennen —<br />
                  die KI, die für dich arbeitet.
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Lina ist mehr als ein Chatbot. Sie schickt dir deinen Zugang per WhatsApp, erklärt dir jedes Tool,
                  erstellt Avatar-Videos mit ihrer eigenen Stimme und beantwortet Fragen zu Produkten und Business —
                  rund um die Uhr, an 7 Tagen die Woche.
                </p>
                <ul className="space-y-2">
                  {[
                    "Persönliches Onboarding per WhatsApp",
                    "Avatar-Videos für deine Kanäle",
                    "Antworten auf jede Frage — sofort",
                    "Tägliche Video-Drops, vollautomatisch",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="h-48 w-48 md:h-64 md:w-64 rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent flex items-center justify-center glow-gold">
                    <Bot className="h-24 w-24 md:h-32 md:w-32 text-primary" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 glass-card rounded-full px-4 py-1.5 flex items-center gap-2 whitespace-nowrap">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-medium">Lina ist online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Warum / Ergebnis ───────────────────────────── */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            variants={stagger}
            initial={prefersReducedMotion ? undefined : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {[
              { icon: Clock, title: "Spar dir Stunden", desc: "Was früher ein ganzer Abend war, ist jetzt 1 Klick: Post, Bild, Hashtags, Veröffentlichung — das System macht's." },
              { icon: Trophy, title: "Sei überall präsent", desc: "9 Plattformen gleichzeitig, zur jeweils besten Uhrzeit. Deine Reichweite wächst, während du dein Leben lebst." },
              { icon: Users, title: "Wachse mit dem Team", desc: "Leaderboard, geteilte Bibliothek, Team-Vorlagen: Die Besten teilen, alle profitieren. Gemeinsam statt allein." },
            ].map((b) => (
              <motion.div key={b.title} variants={fadeUp}>
                <div className="glass-card rounded-2xl p-6 h-full text-center">
                  <div className="h-12 w-12 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
                    <b.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────── */}
      <section className="px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          <motion.div
            className="text-center space-y-3"
            variants={fadeUp}
            initial={prefersReducedMotion ? undefined : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <Badge variant="outline" className="border-primary/40 text-primary">Häufige Fragen</Badge>
            <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              Noch Fragen? <span className="gradient-text-gold">Kurz beantwortet.</span>
            </h2>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────── */}
      <section className="px-4 py-20">
        <motion.div
          className="max-w-3xl mx-auto text-center space-y-6"
          variants={fadeUp}
          initial={prefersReducedMotion ? undefined : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="flex justify-center gap-1" aria-hidden>
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-primary fill-primary" />
            ))}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Dein Team postet schon.<br />
            <span className="gold-shimmer">Wann startest du?</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Der Zugang ist exklusiv für LR-Partner aus dem Team. Schreib Lina — sie schaltet dich in wenigen Minuten frei.
          </p>
          <Button
            size="lg"
            className="btn-gold h-14 px-10 text-base rounded-2xl shadow-xl glow-gold"
            onClick={() => window.open(WHATSAPP_URL, "_blank")}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Jetzt Zugang über Lina holen
          </Button>
          <p className="text-[11px] text-muted-foreground">
            Bereits Partner mit Zugang?{" "}
            <button
              className="text-primary underline-offset-2 hover:underline"
              onClick={() => { window.location.href = getLoginUrl(); }}
            >
              Hier einloggen
            </button>
          </p>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-border/50 px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Rocket className="h-4 w-4 text-primary" />
            <span>LR Content Hub · sozialmedia.best</span>
          </div>
          <nav className="flex items-center gap-5 text-xs text-muted-foreground">
            <a href="/impressum" className="hover:text-foreground transition-colors">Impressum</a>
            <a href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</a>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Kontakt</a>
          </nav>
        </div>
        <p className="max-w-6xl mx-auto mt-4 text-[10px] text-muted-foreground/60 leading-relaxed">
          Unabhängige Team-Plattform für LR-Vertriebspartner. Kein offizielles Angebot der LR Health & Beauty Systems GmbH.
          Keine Einkommens- oder Erfolgsversprechen — Ergebnisse hängen vom persönlichen Einsatz ab.
        </p>
      </footer>
    </div>
  );
}
