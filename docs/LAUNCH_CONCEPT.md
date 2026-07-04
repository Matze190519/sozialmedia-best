# Launch-Konzept — sozialmedia.best Übergabe & Ad-Start

Stand: 30.11.2026 · Branch: `claude/launch-landing-page`

---

## Was neu ist (dieser PR)

### 1. Öffentliche Landingpage (`/` für nicht eingeloggte Besucher)
**Vorher:** Mini-Karte mit „Anmelden"-Button — Conversion-Killer für Ad-Traffic.
**Jetzt:** Vollwertige Premium-Landingpage im Gold/Dark-Design:

| Sektion | Inhalt |
|---------|--------|
| Sticky Nav | Logo + Login + „Zugang anfragen" (WhatsApp) |
| Hero | Claim „Dein Social Media läuft ab jetzt auf Autopilot" + 2 CTAs + 4 Stats |
| Trust-Bar | Live im Einsatz · 100% Deutsch · Compliance geprüft · Kein Abo |
| Features | 6 Karten: Wizard, Lina, Auto-Posting, Trend-Radar, Compliance, KI-Videos |
| 3 Schritte | WhatsApp → Magic-Link → Posten |
| Lina-USP | „Die KI, die für dich arbeitet" — Alleinstellungsmerkmal |
| Warum | Zeit sparen / Überall präsent / Team-Wachstum |
| FAQ | 5 häufigste Einwände direkt beantwortet |
| Final CTA | WhatsApp-Button + Login-Link |
| Footer | Impressum, Datenschutz, MLM-Disclaimer |

**Conversion-Pfad:** Ad → Landingpage → WhatsApp (Lina) → Magic-Link → im System.
Alle CTAs führen zu `wa.me/491715060008` mit vorausgefülltem Text.

### 2. Impressum + Datenschutz (`/impressum`, `/datenschutz`)
**Öffentlich erreichbar** (außerhalb des Login-Gates) — Pflicht für Ads in DE.

### 3. SEO/Social-Meta in `index.html`
Title, Description, Open-Graph (WhatsApp/FB-Link-Preview), Twitter Card, Canonical, theme-color.

### 4. Bugfix
`KanbanPage.tsx`: fehlende `refetch`-Referenz (hätte den Build gebrochen).

**Verifiziert:** `pnpm check` = 0 Fehler · `pnpm build` = erfolgreich.

---

## ⚠️ VOR Ad-Start zwingend erledigen (Checkliste für Mathias)

### Rechtlich (Abmahn-Risiko!)
- [ ] **Impressum ausfüllen:** Platzhalter `[Straße]`, `[PLZ/Ort]`, `[Telefon]`, `[USt-IdNr.]` in `ImpressumPage.tsx` ersetzen
- [ ] **Datenschutz prüfen:** Dienstleister-Liste vervollständigen, Löschfrist eintragen (`DatenschutzPage.tsx`)
- [ ] Falls **Meta Pixel** für Ads eingebaut wird: Consent-Banner ist Pflicht (vorher mit mir/Codex bauen)

### Meta Ads (Facebook/Instagram)
- [ ] **Keine Einkommensversprechen** im Ad-Text — Meta lehnt MLM-Ads mit „verdiene X €" ab. Stattdessen: „Social-Media-System für LR-Partner", „Content auf Knopfdruck"
- [ ] Ziel-URL: `https://sozialmedia.best/` (Landingpage) — NICHT direkt WhatsApp, das killt das Pixel-Tracking
- [ ] Link-Preview testen: URL in [Meta Sharing Debugger](https://developers.facebook.com/tools/debug/) eingeben → OG-Tags prüfen

### Funktional testen (10 Minuten)
- [ ] Inkognito-Fenster: `sozialmedia.best` öffnen → Landingpage erscheint (nicht das Dashboard)
- [ ] WhatsApp-CTA klicken → Chat mit Lina öffnet sich mit vorausgefülltem Text
- [ ] „Login" klicken → bestehender Login-Flow funktioniert
- [ ] `/impressum` und `/datenschutz` ohne Login erreichbar
- [ ] Handy-Test: Landingpage auf iPhone/Android — alles lesbar, Buttons klickbar
- [ ] Als eingeloggter Partner: Dashboard erscheint normal (Landingpage NUR für Gäste)

### Deployment
- [ ] PR mergen → Manus-UI „Veröffentlichen" klicken
- [ ] Nach Deploy: Punkt „Funktional testen" auf der LIVE-Domain wiederholen

---

## Ad-Konzept-Empfehlung (Kurzfassung)

**Zielgruppe:** Bestehende LR-Partner + Network-Marketing-Interessierte DACH, 25–55.

**Ad-Angle (3 Varianten testen):**
1. **Zeit:** „5 Minuten am Tag statt 2 Stunden — dein Social Media auf Autopilot."
2. **Angst nehmen:** „Kein Bock auf Kamera? Die KI postet für dich. Auf 9 Kanälen."
3. **FOMO/Team:** „Dein Team postet schon täglich. Du auch?"

**Funnel:** Ad → Landingpage (Vertrauen + Story) → WhatsApp Lina (persönlich, niedrige Hürde) → Magic-Link → Onboarding im System.

**Warum Landingpage dazwischen:** WhatsApp-Direktlink aus Ads wirkt spammy und trackt nicht. Die Landingpage qualifiziert vor — wer klickt, will wirklich.

---

## Bekannte offene Punkte (nach Launch, nicht blockierend)

1. **OG-Image fehlt:** Link-Previews zeigen aktuell kein Bild. Empfehlung: 1200×630px Gold/Dark-Visual mit Claim erstellen (kann ich generieren), als `client/public/og-image.jpg` ablegen, `<meta property="og:image" ...>` ergänzen.
2. **Testimonials:** Die Landingpage hat bewusst noch keine Partner-Zitate (keine erfundenen Testimonials!). Sobald 2–3 echte Team-Stimmen da sind → einbauen, Conversion steigt messbar.
3. **Consent-Banner:** Nötig, sobald Meta Pixel / erweitertes Tracking dazukommt.
4. **Hinweis Live-Repo:** Dieses Repo (`sozialmedia-best`) und das Manus-Live-Repo (`lr-approval-dashboard`) sind teilweise divergiert. Beim Übernehmen prüft Manus: `DashboardLayout.tsx` (Logged-out-Block), `App.tsx` (2 neue Routen), 3 neue Seiten, `index.html` (Meta-Tags). Alle Änderungen sind klein und additiv — Konfliktrisiko minimal.
