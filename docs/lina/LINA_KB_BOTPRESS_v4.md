# Lina Wissensdatenbank — LR Content Hub (sozialmedia.best)
# Version 4.0 — Code-belegt & Botpress-ready
# Stand: 17. April 2026
# Für Botpress Knowledge Base — alles was Lina wissen muss

---


# Glossar

## Begriffe

| Begriff | Bedeutung |
|---------|-----------|
| **LR** | LR Health & Beauty — Network-Marketing-Unternehmen |
| **LR-Partner** | Selbstständiger Vertriebspartner bei LR |
| **Pillar / Content-Säule** | Themenbereich: Autokonzept, Business Opportunity, Produkt-Highlight, Lifestyle & Erfolg, Gesundheit, Lina KI-Demo |
| **Content-Mix** | 86% Lifestyle / 14% Produkt — automatisch vom System gesteuert |
| **Magic-Link** | Einmal-Login-Link per WhatsApp, 24h gültig, kein Passwort nötig |
| **Blotato** | Externer Dienst (~25 €/Monat) für automatisches Multi-Plattform-Publishing |
| **Auto-Post** | Toggle in /settings — nach Freigabe sofort via Blotato veröffentlichen |
| **Viral Score** | KI-Bewertung 0–100% wie viral ein Post werden kann |
| **Quality Score** | Automatische Qualitätsbewertung jedes Posts (0–100) |
| **Feedback Score** | Partner-Bewertung 1–5 Sterne pro Post |
| **Brand Voice** | Persönliche Stimme — nutzt Branding aus /settings (Signatur, CTA, Hashtags, Vorstellung) |
| **Evergreen** | Top-Posts automatisch nach X Wochen wiederverwenden mit KI-Variationen |
| **Agent Brain** | Logik hinter dem Content-Mix-Autopilot (Wochenschema: Mo Motivation, Di Produkt, Mi Erfolg, Do Behind-the-Scenes, Fr Lifestyle) |
| **Daily Drop** | Tägliches automatisches Lina-Video um 06:00 + 18:00 auf Instagram + TikTok |
| **GoViralBitch API** | KI-Engine für Text-Generierung (Posts, Reels, Stories, Hooks, Ad Copy) |
| **fal.ai** | KI-Dienst für Bild-Generierung (Nano Banana Pro) und Video-Generierung (Veo 3.1, Kling 3.0) |
| **HeyGen** | KI-Avatar-Video-Dienst für Lina-Videos (Avatar IV, expressiveness=medium) |
| **Brevo** | E-Mail-Benachrichtigungsdienst nach Publishing |
| **tRPC** | Type-safe API-Framework zwischen Frontend und Backend |
| **Drizzle ORM** | Datenbank-Toolkit für MySQL |
| **Compliance Shield** | Automatische Prüfung auf Heilaussagen, Verdienstversprechen, Markenrechts-Probleme |
| **Approval / Freigabe** | Jeder Post muss freigegeben werden bevor er veröffentlicht wird |
| **Pending / Ausstehend** | Post wartet auf Freigabe |
| **Approved / Freigegeben** | Post ist freigegeben, bereit zum Posten |
| **Scheduled / Geplant** | Post hat einen festen Veröffentlichungszeitpunkt |
| **Published / Veröffentlicht** | Post wurde auf Social Media gepostet |
| **Rejected / Abgelehnt** | Post wurde zurückgewiesen |
| **SuperProfile** | Externes Tool für Instagram AutoDM und Lead-Generierung |
# Login & Zugang

## So funktioniert der Login

1. Partner meldet sich bei Lina (WhatsApp)
2. Lina fragt nach Name und Partnernummer
3. Lina prüft und schickt einen **Magic-Login-Link**: `https://sozialmedia.best/join?token=XXXXXXXX`
4. Partner klickt auf den Link → **sofort eingeloggt** (kein Passwort)
5. Partner sieht das Dashboard mit Willkommens-Overlay

## Technisch

- Link enthält einmaligen JWT-Token (jose-Library, 24h gültig)
- Nach Klick: Account ist sofort freigeschaltet (`isApproved = true`)
- User-Info in `localStorage["manus-runtime-user-info"]`

## Häufige Probleme

| Problem | Ursache | Lösung |
|---------|---------|--------|
| Link funktioniert nicht | Abgelaufen (>24h) | Lina auf WhatsApp → neuer Link |
| „Zugang ausstehend" | Account noch nicht freigeschaltet | Lina auf WhatsApp → sofortige Freischaltung |
| Link verloren | Nicht gespeichert | Lina auf WhatsApp → neuer Magic-Link |

## Was sieht ein nicht-freigeschalteter Partner?

Seite mit „Zugang ausstehend – Dein Teamleiter wird dich in Kürze freischalten." Plus „Seite neu laden" Button.

## Was sieht ein nicht-eingeloggter Besucher?

Öffentliche Landing Page mit Beschreibung aller Tools und Hinweis „Dein Zugang kommt automatisch von Lina". Kein Login-Formular.

## Rollen

| Rolle | Kann |
|-------|------|
| **Partner (User)** | Eigene Posts erstellen, freigeben, Bibliothek nutzen, Analytics sehen |
| **Admin (Mathias)** | Alles + Team verwalten, Partner freischalten/sperren, alle Posts sehen |
# Workflows — Tool-übergreifende Abläufe

## Workflow 1: Erster Post (Einsteiger)

1. Login via Magic-Link (von Lina auf WhatsApp)
2. `/onboarding` durchgehen (5 Schritte)
3. `/settings` → Branding ausfüllen (Vorstellung, CTA, Signatur, Hashtags)
4. `/wizard` → Thema eingeben → Content generieren
5. `/approval` → Post freigeben
6. Falls Blotato aktiv: Post wird automatisch veröffentlicht
7. Falls kein Blotato: Text + Bild kopieren, manuell posten

## Workflow 2: Tägliches Posten (Routine)

1. `/` Dashboard → Quick-Action „Content erstellen"
2. `/generator` oder `/wizard` → Post erstellen
3. `/compliance` → Compliance-Check (optional aber empfohlen)
4. `/viral-predictor` → Viral-Score prüfen (optional)
5. `/approval` → freigeben → Auto-Post oder manuell

## Workflow 3: Batch-Content (Woche vorbereiten)

1. `/monthly-plan` → Monatsplan generieren
2. Oder: `/generator` → Wochenplan-Modus (Batch)
3. Oder: `/lifestyle` → Batch-Generierung
4. `/approval` → „Alle freigeben" (Batch-Freigabe)
5. `/calendar` → geplante Posts prüfen/verschieben

## Workflow 4: Bibliotheks-Content nutzen

1. `/library` → Text suchen/filtern
2. „✨ KI automatisch anpassen" → personalisiert auf dein Branding
3. „Auf Blotato posten" oder „Text + Hashtags kopieren"

## Workflow 5: Trend nutzen

1. `/trends` → Trend-Scanner → viralen Trend finden
2. „Autopilot" → Trend → Post + Bild + Hashtags → Freigabe (alles automatisch)
3. Oder: „Content erstellen" → manuell Post aus Trend bauen

## Workflow 6: Lina-Video erstellen

1. `/lina-avatar` → Produkt/Thema wählen
2. Stil + Dauer wählen
3. Script generieren → optional bearbeiten
4. Video generieren (3–5 Min)
5. Herunterladen oder in Freigabe senden

## Workflow 7: Blotato einrichten (einmalig)

1. `sozialmedia.best/blotato-signup` → Account erstellen
2. `my.blotato.com` → Social-Kanäle verbinden
3. Blotato → Einstellungen → API Access → Key kopieren
4. `/settings` → Key einfügen → Speichern → grüner Haken
5. Auto-Post Toggle aktivieren (optional)

## Workflow 8: Post vor Veröffentlichung optimieren

1. Post erstellen (Wizard/Generator)
2. `/viral-predictor` → Score prüfen, Hook verbessern
3. `/compliance` → Compliance-Check
4. `/duplicate-check` → Duplikat-Prüfung
5. `/hashtags` → optimale Hashtags generieren
6. `/approval` → freigeben + veröffentlichen
# Häufige Fehler & Lösungen

| # | Fehler | Ursache | Lösung |
|---|--------|---------|--------|
| 1 | Seite lädt nicht / weiße Seite | Browser-Cache oder Verbindung | F5 / Pull-to-Refresh, Cache leeren, anderer Browser |
| 2 | „Zugang ausstehend" | Account nicht freigeschaltet | Lina auf WhatsApp → sofortige Freischaltung |
| 3 | Magic-Link funktioniert nicht | Abgelaufen (>24h) oder bereits benutzt | Lina auf WhatsApp → neuer Link |
| 4 | Bild wird nicht generiert | fal.ai (Nano Banana Pro) überlastet | 30 Sek warten, nochmal. Bleibt es → Lina melden |
| 5 | Video-Generierung schlägt fehl | HeyGen/fal.ai überlastet oder Script zu lang | Script kürzen (max. 200 Wörter für 30s), erneut versuchen |
| 6 | TikTok „Unsupported media format" | PNG statt JPEG | Post neu generieren (System speichert automatisch JPEG) |
| 7 | Post wird nicht gepostet | Auto-Post aus / kein Blotato-Key / Kanal getrennt | Settings prüfen, Key erneuern, Blotato-Verbindung checken |
| 8 | „Kein Bild vorhanden" in Freigabe | Post vor Bild-Generierung gespeichert | Wird automatisch als „Entwurf" gesetzt → neuen Post erstellen |
| 9 | Facebook postet nicht | Persönliches Profil statt Seite | In Blotato Facebook-Seite verbinden |
| 10 | LinkedIn postet nicht | Verbindung abgelaufen | In Blotato (my.blotato.com) LinkedIn neu verbinden |
| 11 | Bibliothek zeigt leere Tabs | Noch keine Inhalte in der Kategorie | Erst Content erstellen → landet automatisch drin |
| 12 | Compliance Shield rot, obwohl harmlos | False-Positive bei Wort-Matching | Vorschlag ansehen — oft ein einzelnes Wort (z.B. „heilt" → „unterstützt") |
| 13 | KI-Personalisierung funktioniert nicht | Einstellungen unvollständig | /settings → Vorstellung + CTA + Signatur + Hashtags ausfüllen |
| 14 | „Bitte gib ein Thema ein!" | Thema-Feld leer | Text eingeben |
| 15 | „Du kannst nur deinen eigenen Content veröffentlichen." | Fremder Post | Nur eigene Posts freigeben |
| 16 | „Nur genehmigte Posts können veröffentlicht werden." | Post noch nicht approved | Erst freigeben, dann posten |
| 17 | „Das ist ein Reel-Skript" | Reel-Script kann nicht direkt gepostet werden | Als Vorlage fürs Video nutzen, Video manuell posten |
| 18 | Leaderboard leer | Noch keine Posts erstellt | Content erstellen um auf dem Leaderboard zu erscheinen |
| 19 | Analytics leer | Noch keine Posts über Blotato veröffentlicht | Posts via Blotato posten für Tracking |
| 20 | Mobile: „Load failed" im Wizard | Framer-Motion-Rendering-Bug | Desktop nutzen oder Seite neu laden |
# Limits, Kosten & Quotas

## Kosten für Partner

| Was | Kosten | Wer zahlt |
|-----|--------|-----------|
| sozialmedia.best Zugang | **kostenlos** | Mathias |
| KI-Bild (Nano Banana Pro) | ca. 0,15 €/Bild | Mathias |
| KI-Video (fal.ai Veo/Kling) | variabel | Mathias |
| Lina Avatar Videos (HeyGen) | pro Video | Mathias |
| Blotato (Auto-Posten) | **ca. 25 €/Monat** | **Partner** (optional) |

**Kurz: Partner zahlt nur Blotato (optional). Alles andere übernimmt Mathias.**

## Unterstützte Plattformen

Instagram, TikTok, Facebook, LinkedIn, Twitter/X, Threads, YouTube — 7 Kanäle gleichzeitig über Blotato.

## Lina Avatar Video-Limits

- Max. Dauer: 60 Sekunden
- Max. Script-Länge: ca. 200 Wörter (für 30s Video)
- Generierungsdauer: 3–5 Minuten
- Sprechgeschwindigkeit: 1.1x

## Content-Mix-Regeln (Agent Brain)

- 86% Lifestyle / 14% Produkt (LR-Compliance-konform)
- Keine zwei Tage in Folge derselbe Pillar
- Keine zwei Tage in Folge dasselbe Produkt
- Morgen-Drops (06:00): emotional/motivational
- Abend-Drops (18:00): Call-to-Action-lastig

## Blotato API-Limits

- API-Key Format: `blt_XXXXX…`
- Base URL: `backend.blotato.com/v2`
- Rate Limits: siehe Blotato-Dokumentation

## Bild-Format

- Format: JPEG (nicht PNG — TikTok-Kompatibilität)
- Generierung: Nano Banana Pro über fal.ai
- Speicher: S3 (permanente URLs)
- Temporäre URLs (fal.run/fal-cdn) werden erkannt → Post wird „Entwurf"
# Dashboard

> **Slug:** `dashboard`
> **Route:** `/`
> **Frontend:** `client/src/pages/Home.tsx`
> **Status:** ✅ Aktiv in Sidebar

---

## 1. Kurzbeschreibung

Die Startseite nach dem Login. Zeigt alle Kennzahlen auf einen Blick — Anzahl Posts, Freigabe-Status, Content-Mix-Autopilot und Quick-Action-Buttons zu den wichtigsten Tools.

**Beleg:** Sidebar `"Deine Zentrale – alles auf einen Blick"` — `DashboardLayout.tsx:45`

---

## 2. Wann einsetzen

1. **Übersicht nach dem Login** — was steht an?
2. **Schnellzugriff** — zu Wizard, Freigabe, Bibliothek, Trends
3. **Content-Mix prüfen** — Autopilot zeigt 86% Lifestyle / 14% Produkt
4. **Wartende Posts sehen** — „Warten auf Freigabe"-Shortcut
5. **Team-Aktivitäten** — was machen die anderen?

---

## 3. Wann NICHT einsetzen

- **Content erstellen?** → **Content Wizard** (`/wizard`)
- **Details zu Analytics?** → **Analytics** (`/analytics`) oder **Analytics+** (`/analytics-plus`)

---

## 4. Schritt-für-Schritt User-Flow

1. Nach Login landest du automatisch auf `/`
2. **Stats-Karten:** Gesamt-Posts, Ausstehend, Freigegeben, Veröffentlicht (`Zeile 104–337`)
3. **Quick-Action-Buttons:**
   - **„Content erstellen"** → `/generator` (`Zeile 108`)
   - **„Freigeben"** → `/approval` (`Zeile 123`)
   - **„Bibliothek"** → `/library` (`Zeile 147`)
   - **„Trend-Scanner"** → `/trends` (`Zeile 349`)
   - **„Analytics+"** → `/analytics-plus` (`Zeile 354`)
4. **Pending-Posts:** Vorschau ausstehender Posts
5. **Activity Feed:** Team-Aktivitäten-Übersicht

---

## 5. Eingabefelder & Constraints

Keine — Dashboard ist Read-Only mit Navigations-Buttons.

---

## 6. Ausgaben & Ergebnisse

- **tRPC:** `dashboard.stats` (49), `apiHealth.goViralBitch` (50), `content.list` (51–53), `userSettings.get` (54)
- Zeigt Echtzeit-Stats aus DB

---

## 7. Fehlermeldungen & Lösungen

Keine spezifischen Fehler — nur Status-Badges (online/offline für APIs).

---

## 8. FAQ

**F:** Was bedeutet „Content-Mix Autopilot 86% / 14%"?
**A:** Das System sorgt automatisch dafür, dass 86% deiner Posts Lifestyle-Themen sind und 14% Produkt-Themen — das entspricht der LR-Compliance-Empfehlung.

**F:** Was zeigt „Warten auf Freigabe"?
**A:** Anzahl deiner Posts, die noch nicht freigegeben sind. Klick darauf führt zu /approval.

---

## 9. Verwandte Tools

Alle — das Dashboard ist der Startpunkt zu jedem Tool.

---

## 10. Pitfalls & Known Issues

Keine bekannten Issues.

---

## 11. Technische Referenz

- **Page:** `client/src/pages/Home.tsx`
- **Sidebar:** `DashboardLayout.tsx:45` — Icon: `LayoutDashboard`
- **tRPC:** `dashboard.stats` (49), `apiHealth.goViralBitch` (50), `content.list` (51–53), `userSettings.get` (54)
- **DB:** Read-Only (Stats-Aggregation aus `contentPosts`)
# Content Wizard

> **Slug:** `content-wizard`  
> **Route:** `/wizard`  
> **Frontend:** `client/src/pages/ContentWizardPage.tsx`  
> **Status:** ✅ Aktiv in Sidebar

---

## 1. Kurzbeschreibung

Der Content Wizard ist ein geführter 3-Schritt-Assistent, der aus einem Thema einen fertigen Social-Media-Post mit KI-generiertem Text, Bild und optional Video erstellt. Ideal für Einsteiger — unter 2 Minuten zum ersten Post.

**Beleg:** Sidebar-Beschreibung `"In 3 Schritten zum fertigen Post"` — `DashboardLayout.tsx:46`

---

## 2. Wann einsetzen

1. **Erster Post überhaupt** — der Wizard führt Schritt für Schritt, kein Vorwissen nötig
2. **Schnell Content zu einem Thema** — Thema eingeben, KI macht den Rest
3. **Post mit Bild + Video** — beides wird automatisch generiert
4. **Multi-Plattform-Post** — bis zu 9 Plattformen gleichzeitig bespielen
5. **Lifestyle- oder Produkt-Post** — Content-Säule (Pillar) wählbar

---

## 3. Wann NICHT einsetzen

- **7 Plattform-Varianten auf einmal?** → Besser: **Remix 1→7** (`/remix7`)
- **Nur schnell Text ohne Wizard-Schritte?** → Besser: **Schnell-Post** (`/generator`)
- **Fertigen Text aus Bibliothek personalisieren?** → Besser: **Bibliothek** (`/library`) → „KI automatisch anpassen"
- **Karussell / Slides erstellen?** → Besser: **Karussell** (`/carousel`)

---

## 4. Schritt-für-Schritt User-Flow

### Step 1 — Konfigurieren (`ContentWizardPage.tsx:249`)

1. **Content-Säule wählen** (optional) — 6 Buttons: Autokonzept, Business, Produkt, Lifestyle, Gesundheit, Lina KI-Demo (`Zeile 260–282`)
2. **Thema / Idee** eingeben (Pflicht) — Textarea, z.B. „Wie ich mit LR mein erstes Auto bekommen habe" (`Zeile 294–299`)
3. **Content-Typ** wählen — Dropdown: Post, Reel, Story, Hooks, Ad Copy, Follow-Up, Einwandbehandlung (`Zeile 305–319`)
4. **Hook-Stil** wählen — Dropdown: Freundlich, Professionell, Energetisch, Story (`Zeile 323–334`)
5. **Plattformen** wählen (optional) — 9 Buttons: Instagram, TikTok, Facebook, LinkedIn, X, Threads, YouTube, Pinterest, Bluesky (`Zeile 348–372`)
6. **KI-Bild generieren** — Toggle, Standard: AN (`Zeile 391–392`)
7. **KI-Video generieren** — Toggle, Standard: AUS (`Zeile 394–396`)
8. **Sofort veröffentlichen** — Toggle, Standard: AUS (`Zeile 399–403`)
9. Klick auf **„Content generieren"** (`Zeile 425`)

### Step 2 — Vorschau & Bearbeiten (`ContentWizardPage.tsx:452`)

- Generierter Text wird angezeigt (bearbeitbar)
- Bild-/Video-Vorschau
- Plattform-Vorschau (wie sieht der Post auf Instagram/TikTok etc. aus)
- Buttons: **„Kopieren"** (`Zeile 478`), **„Neu generieren"** (`Zeile 486`), **„Zurück"** (`Zeile 621`)
- Zeichenlimit-Warnung bei Überschreitung (`Zeile 600–601`)
- Klick auf **„Post erstellen (zur Freigabe)"** oder **„Auf X Plattformen veröffentlichen"** (`Zeile 638–644`)

### Step 3 — Erfolg (`ContentWizardPage.tsx:655`)

- Bestätigung: Post erstellt
- Buttons: **„Nächsten Content erstellen"** (`Zeile 714`), **„Zur Freigabe"** → `/approval` (`Zeile 718`), **„Kalender anzeigen"** → `/calendar` (`Zeile 722`)

---

## 5. Eingabefelder & Constraints

| Feld | Typ | Pflicht | Validierung | Zeile |
|------|-----|---------|-------------|-------|
| Content-Säule | Button-Grid (6) | Nein | — | 260 |
| Thema / Idee | Textarea | **Ja** | Nicht leer (Check in `handleGenerate`) | 294, 146 |
| Content-Typ | Select | Nein | Enum: post, reel, story, hooks, ad_copy, follow_up, objection | 305 |
| Hook-Stil | Select | Nein | — | 323 |
| Plattformen | Button-Grid (9) | Nein | — | 348 |
| KI-Bild generieren | Toggle | Nein | Default: true | 391 |
| KI-Video generieren | Toggle | Nein | Default: false | 394 |
| Sofort veröffentlichen | Toggle | Nein | Default: false | 399 |

**Backend-Input-Schema** (`routers.ts:81–100`):
```
z.object({
  contentType: z.enum(["post","reel","story","hooks","ad_copy","follow_up","objection"]),
  topic: z.string().optional(),
  pillar: z.string().optional(),
  platforms: z.array(z.string()).optional(),
  autoGenerateImage: z.boolean().optional(),
  autoGenerateVideo: z.boolean().optional(),
  ...weitere optionale Felder
})
```

---

## 6. Ausgaben & Ergebnisse

**Nach „Content generieren":**
- tRPC-Mutation `content.generate` (`routers.ts:80`)
- Neuer Eintrag in DB-Tabelle `contentPosts` mit Status `"pending"` (`routers.ts:132`)
- ApprovalLog-Eintrag wird erstellt (`routers.ts:143`)
- KI-Bild wird generiert via fal.ai / Fallback-Generator (`routers.ts:152–187`)
- Optional: KI-Video via fal.ai (`routers.ts:189–213`)
- Toast: **„Content generiert!"** (`ContentWizardPage.tsx:169`)

**Nach „Post erstellen":**
- tRPC-Mutation `approval.publish` (`routers.ts:647`)
- Status wird auf `"scheduled"` gesetzt (`routers.ts:691`)
- Blotato-API veröffentlicht auf alle gewählten Plattformen (`routers.ts:685`)
- Toast: **„Auf X Plattformen veröffentlicht!"** (`ContentWizardPage.tsx:206`)

---

## 7. Fehlermeldungen & Lösungen

| Fehlermeldung | Ursache | Lösung | Beleg |
|---------------|---------|--------|-------|
| „Bitte gib ein Thema ein!" | Thema-Feld leer | Thema eingeben, mindestens ein paar Worte | `ContentWizardPage.tsx:146` |
| „Fehler beim Generieren" | KI-API nicht erreichbar oder überlastet | 30 Sek warten, nochmal. Bleibt es → Lina melden | `ContentWizardPage.tsx:171` |
| „Fehler beim Erstellen" | Publish fehlgeschlagen | Blotato-Key prüfen in /settings | `ContentWizardPage.tsx:220` |
| „Publishing teilweise fehlgeschlagen: ..." | Einige Plattformen haben Fehler | Betroffene Plattform in Blotato neu verbinden | `ContentWizardPage.tsx:208` |
| „Du kannst nur deinen eigenen Content veröffentlichen." | Anderer Partner hat den Post erstellt | Nur eigene Posts freigeben | `routers.ts:657` |
| „Nur genehmigte Posts können veröffentlicht werden." | Post noch nicht approved | Erst in /approval freigeben, dann posten | `routers.ts:659` |
| „Das ist ein Reel-Skript – kein fertiger Post!" | Reel-Script kann nicht direkt gepostet werden | Als Vorlage für ein Video nutzen, Video manuell posten | `routers.ts:663` |
| „Unbekannter Content-Typ" | Interner Fehler | Seite neu laden, nochmal versuchen | `routers.ts:129` |

---

## 8. FAQ

**F:** Wie lange dauert die Generierung?
**A:** Text: 5–15 Sekunden. Bild dazu: 15–30 Sekunden. Video: 1–3 Minuten. Fortschrittsanzeige läuft automatisch.

**F:** Kann ich den generierten Text bearbeiten?
**A:** Ja, in Step 2 ist der Text direkt editierbar. Änderungen werden beim Erstellen übernommen.

**F:** Was passiert mit dem Post nach dem Erstellen?
**A:** Er landet im Freigabe-Center (`/approval`) mit Status „Ausstehend". Nach Freigabe wird er (bei aktivem Auto-Post + Blotato) automatisch veröffentlicht.

**F:** Brauche ich Blotato für den Wizard?
**A:** Nein. Ohne Blotato kannst du den Post trotzdem erstellen, den Text kopieren und manuell posten. Der Hinweis „Blotato-Key in Einstellungen hinterlegen für Auto-Post" erscheint bei fehlender Verbindung (`ContentWizardPage.tsx:375–377`).

**F:** Was sind die 6 Content-Säulen?
**A:** Autokonzept, Business Opportunity, Produkt-Highlight, Lifestyle & Erfolg, Gesundheit, Lina KI-Demo. Optional — ohne Auswahl wählt die KI automatisch.

---

## 9. Verwandte Tools

- **Schnell-Post** (`/generator`) → schneller, aber ohne Wizard-Führung
- **Remix 1→7** (`/remix7`) → 1 Idee in 7 Plattform-Varianten
- **Freigabe** (`/approval`) → hier landet der erstellte Post
- **Kalender** (`/calendar`) → geplante Posts im Überblick
- **Bibliothek** (`/library`) → fertige Posts kopieren statt neu generieren
- **Lifestyle-Engine** (`/lifestyle`) → spezialisiert auf emotionalen Lifestyle-Content
- **Viral Predictor** (`/viral-predictor`) → Post vor Veröffentlichung auf Viral-Potenzial prüfen
- **Compliance Shield** (`/compliance`) → Post auf LR-Compliance prüfen

---

## 10. Pitfalls & Known Issues

- ⚠️ **Mobile-Bug:** „Load failed" x2 auf Mobilgeräten — dokumentiert in `WIZARD_INVESTIGATION.md`. Vermutlich Framer-Motion-Rendering-Problem.
- ⚠️ **Reel-Scripts:** Content-Typ „Reel" generiert ein Script, keinen fertigen Post. Kann nicht direkt veröffentlicht werden — Error-Toast weist darauf hin.
- ⚠️ **Video-Timeout:** Bei langen Videos (> 30 Sek) kann die Generierung timeout-en, da kein Background-Job-System (BullMQ/Redis) vorhanden ist. Workaround: kürzere Videos wählen.
- ⚠️ **Temporäre Bild-URLs:** Falls fal.ai temporäre URLs liefert statt permanenter S3-URLs, wird der Post automatisch als „Entwurf" markiert und erscheint nicht in der Freigabe.

---

## 11. Technische Referenz (intern)

### Frontend
- **Page:** `client/src/pages/ContentWizardPage.tsx`
- **Route:** `/wizard` — definiert in `client/src/App.tsx:80`
- **Sidebar:** `DashboardLayout.tsx:46` — Icon: `Wand2`, Label: „Content Wizard"
- **State:** `const [step, setStep] = useState(1)` — `ContentWizardPage.tsx:106`

### Backend (tRPC)
- **Generate:** `content.generate` — `server/routers.ts:80` (approvedProcedure, Mutation)
- **Publish:** `approval.publish` — `server/routers.ts:647` (approvedProcedure, Mutation)
- **Queries:** `userSettings.get` (Zeile 125), `apiHealth.blotatoAccounts` (Zeile 126)

### Datenbank (Drizzle)
- **Tabelle:** `contentPosts` — `drizzle/schema.ts:44–85`
- **Wichtige Felder:** `id`, `createdById`, `contentType`, `content`, `platforms` (JSON), `status` (enum: pending/approved/rejected/scheduled/published), `mediaUrl`, `videoUrl`, `topic`, `pillar`, `qualityScore`
- **Verknüpft:** `approvalLogs` — INSERT bei Generate + Publish

### Externe APIs
- **GoViralBitch API:** Text-Generierung (`generatePost`, `generateReel`, `generateStory` etc.) — `routers.ts:106–126`
- **fal.ai:** Bild-Generierung (Nano Banana Pro) — `routers.ts:173`, Video-Generierung — `routers.ts:194`
- **Blotato API:** Publishing auf alle Plattformen — `routers.ts:685`
- **Brevo:** E-Mail-Benachrichtigung nach Publish — `routers.ts:705`

### Feature-Flags
- Keine expliziten Feature-Flags gefunden.
- `FAL_API_KEY` (env) steuert ob Premium-Bildgenerierung verfügbar ist (`routers.ts:172`)

### Tests
- Quality-Gate-Tests: `server/content-hub.test.ts:210–271`
- Approval-Workflow-Tests: `server/content-hub.test.ts:300–325`
- TODO (Matze verifizieren): Keine spezifischen End-to-End Wizard-Tests gefunden.

---

## Changelog

| Version | Datum | Änderung | Autor |
|---------|-------|----------|-------|
| 1.0 | 2026-04-16 | Initiale Version — vollständig code-belegt | Claude |
# Schnell-Post (Generator)

> **Slug:** `generator`
> **Route:** `/generator`
> **Frontend:** `client/src/pages/GeneratorPage.tsx`
> **Status:** ✅ Aktiv in Sidebar

---

## 1. Kurzbeschreibung

Der schnellste Weg zum fertigen Post. Ein 6-Schritt-Wizard mit Brand Voice, GoViral-API und automatischer Bild-/Video-Generierung. Für Partner, die schon wissen was sie wollen.

**Beleg:** Sidebar `"Text, Bild & Video auf Knopfdruck"` — `DashboardLayout.tsx:47`

---

## 2. Wann einsetzen

1. **Schnell einen Post erstellen** — ohne lange Wizard-Führung
2. **Brand Voice nutzen** — der Generator kann mit deiner persönlichen Stimme schreiben
3. **Batch-Generierung** — mehrere Posts auf einmal (Wochenplan-Modus)
4. **Bild + Video in einem Rutsch** — KI-Medien direkt im Flow
5. **GoViral-API** — alternative KI-Engine für virale Texte

---

## 3. Wann NICHT einsetzen

- **Kompletter Einsteiger?** → Besser: **Content Wizard** (`/wizard`) — geführter, einfacher
- **7 Plattform-Varianten?** → Besser: **Remix 1→7** (`/remix7`)
- **Nur Lifestyle-Content?** → Besser: **Lifestyle-Engine** (`/lifestyle`)

---

## 4. Schritt-für-Schritt User-Flow

### Step 1 — Was? (Content-Typ wählen, `Zeile 67`)
Karten-Grid: Post, Reel, Story, Hooks, Ad Copy, Follow-Up, Einwandbehandlung

### Step 2 — Thema & Pillar (`Zeile 68`)
- **Thema / Idee** eingeben (Pflicht) — Textarea
- **Content-Säule** wählen — große Emoji-Karten (6 Pillars)

### Step 3 — Style & Plattform (`Zeile 69`)
- **Hook-Stil** wählen: Freundlich, Professionell, Energetisch, Story
- **Plattformen** wählen (Multi-Select, 9 Plattformen)
- **Blocker-Check** Toggle

### Step 4 — Generieren (`Zeile 70`)
3 Buttons:
- **„Mit Brand Voice generieren"** (`Zeile 573`) — nutzt dein Branding aus /settings
- **„GoViral API"** (`Zeile 597`) — alternative KI-Engine
- **„Wochenplan"** (`Zeile 605`) — Batch-Generierung

### Step 5 — Media (`Zeile 71`)
- **„Bild generieren"** (`Zeile 691`) — KI-Bild via fal.ai
- **„Video generieren"** (`Zeile 757`) — KI-Video via fal.ai

### Step 6 — Fertig (`Zeile 72`)
- Vorschau von Text + Bild + Video
- **„Alles kopieren"** (`Zeile 845`) — 1-Tap-Copy
- Post landet automatisch in Freigabe-Queue

---

## 5. Eingabefelder & Constraints

| Feld | Typ | Pflicht | Zeile |
|------|-----|---------|-------|
| Content-Typ | Karten-Grid (7) | Ja | 84 |
| Thema / Idee | Textarea | Ja | 85 |
| Content-Säule (Pillar) | Emoji-Karten (6) | Ja | 86 |
| Plattformen | Multi-Select (9) | Ja (mind. 1) | 88 |
| Hook-Stil | Select | Nein | 89 |
| Blocker-Check | Toggle | Nein | 91 |
| Bild-Prompt | Textarea | Nur wenn Bild gewünscht | 104 |
| Video-Prompt | Textarea | Nur wenn Video gewünscht | 105 |

---

## 6. Ausgaben & Ergebnisse

- **tRPC-Mutations:** `brandVoice.generateWithVoice` (`Zeile 135`), `content.generate` (`Zeile 149`), `content.generateBatch` (`Zeile 163`)
- **Media:** `media.generateImage` (`Zeile 185`), `media.generateVideo` (`Zeile 193`)
- **Quality-Check:** `qualityGate.check` (`Zeile 176`)
- Post wird in `contentPosts` gespeichert mit Status `pending`

---

## 7. Fehlermeldungen & Lösungen

| Fehlermeldung | Lösung | Zeile |
|---------------|--------|-------|
| „Thema eingeben" | Thema-Feld ist leer — Text eintragen | 206 |
| „Content Pillar auswählen" | Pillar-Karte anklicken | 210 |
| „Mindestens eine Plattform" | Mind. 1 Plattform auswählen | 215 |
| „Bild-Prompt eingeben" | Beschreibung fürs Bild eintragen | 235 |
| „Video-Prompt eingeben" | Beschreibung fürs Video eintragen | 245 |

---

## 8. FAQ

**F:** Unterschied zum Content Wizard?
**A:** Generator = 6 Schritte, mehr Optionen (Brand Voice, GoViral, Batch). Wizard = 3 Schritte, einfacher für Einsteiger.

**F:** Was ist Brand Voice?
**A:** Nutzt deine persönlichen Einstellungen (Signatur, CTA, Hashtags aus /settings) um den Text auf dich zu personalisieren.

**F:** Was ist der Wochenplan-Modus?
**A:** Generiert mehrere Posts auf einmal — alle landen in der Freigabe-Queue.

---

## 9. Verwandte Tools

- **Content Wizard** (`/wizard`) — einfacher, geführter
- **Freigabe** (`/approval`) — hier landen die Posts
- **Bibliothek** (`/library`) — fertige Posts kopieren
- **Lifestyle-Engine** (`/lifestyle`) — spezialisiert auf Lifestyle

---

## 10. Pitfalls & Known Issues

- ⚠️ Gleicher Mobile-Bug wie Wizard möglich (Framer Motion)
- ⚠️ Brand Voice braucht gefüllte Einstellungen (/settings → Branding)

---

## 11. Technische Referenz

- **Page:** `client/src/pages/GeneratorPage.tsx`
- **Route:** `/generator` — `App.tsx`
- **Sidebar:** `DashboardLayout.tsx:47` — Icon: diverse, Label: „Content erstellen"
- **tRPC:** `brandVoice.generateWithVoice` (135), `content.generate` (149), `content.generateBatch` (163), `qualityGate.check` (176), `media.generateImage` (185), `media.generateVideo` (193)
- **DB:** `contentPosts`, `approvalLogs`
- **APIs:** GoViralBitch, fal.ai (Bild+Video)
# Freigabe (Approval)

> **Slug:** `approval`
> **Route:** `/approval`
> **Frontend:** `client/src/pages/ApprovalPage.tsx`
> **Status:** ✅ Aktiv in Sidebar

---

## 1. Kurzbeschreibung

Das Freigabe-Center. Hier prüfst du deine Posts, gibst sie frei oder lehnst sie ab. Nach Freigabe werden sie automatisch via Blotato veröffentlicht (wenn Auto-Post aktiv ist).

**Beleg:** Sidebar `"Posts prüfen, freigeben & posten"` — `DashboardLayout.tsx:48`

---

## 2. Wann einsetzen

1. **Erstellte Posts überprüfen** — vor dem Veröffentlichen
2. **Batch-Freigabe** — alle ausstehenden Posts auf einmal freigeben
3. **Posts ablehnen** — mit Kommentar, wenn Content nicht passt
4. **Direkt auf Blotato posten** — nach Freigabe sofort auf alle Kanäle
5. **Posts bearbeiten** — Text oder Bild ändern vor dem Freigeben

---

## 3. Wann NICHT einsetzen

- **Neuen Post erstellen?** → **Content Wizard** (`/wizard`) oder **Generator** (`/generator`)
- **Geplante Posts im Kalender sehen?** → **Kalender** (`/calendar`)
- **Post-Performance auswerten?** → **Analytics** (`/analytics`)

---

## 4. Schritt-für-Schritt User-Flow

1. Öffne **„Freigabe"** in der Sidebar oder direkt `/approval`
2. Du siehst alle deine **ausstehenden Posts** (Admin sieht zusätzlich Team-Posts)
3. Pro Post: **„Freigeben"** (`Zeile 229`), **„Ablehnen"** (`Zeile 237`), **„Bearbeiten"** (`Zeile 247`)
4. Optional: **„Auf Blotato veröffentlichen"** (`Zeile 302`) für sofortiges Publishing
5. Für Batch: **„Alle freigeben"** (`Zeile 152`)
6. Filter: **„Ohne Bild"** (`Zeile 158`) zum Filtern von Posts ohne Medien

**Wichtig:** Jeder Partner sieht NUR eigene Posts. Mathias sieht „Meine Posts" + Tab „Team-Übersicht".

---

## 5. Eingabefelder & Constraints

| Feld | Typ | Pflicht | Zeile |
|------|-----|---------|-------|
| Ablehn-Kommentar | Textarea | Nein | 90 |
| Geplanter Zeitpunkt | DateTime | Nein | 94 |
| Veröffentlichungs-Datum | DateTime | Nein | 96 |
| Auto-Publish Toggle | Switch | Nein | 93 |

---

## 6. Ausgaben & Ergebnisse

- **tRPC:** `approval.approve` (64), `approval.reject` (68), `approval.publish` (72), `content.edit` (76), `content.delete` (80)
- **Smart Posting:** `postingTimes.smartNextMulti` (102) — schlägt optimale Zeiten vor
- **DB:** `contentPosts` Status-Update, `approvalLogs` INSERT

---

## 7. Fehlermeldungen & Lösungen

| Fehlermeldung | Lösung | Zeile |
|---------------|--------|-------|
| „Post genehmigt!" | Erfolg — kein Problem | 65 |
| „Post abgelehnt" | Erfolg — Post ist zurückgewiesen | 68 |
| „Post auf Blotato geplant!" | Erfolg — Publishing läuft | 72 |
| „Content bearbeitet!" | Erfolg — Änderung gespeichert | 76 |
| „Du kannst nur deinen eigenen Content veröffentlichen." | Nur eigene Posts freigeben | routers.ts:657 |
| „Nur genehmigte Posts können veröffentlicht werden." | Post erst freigeben, dann posten | routers.ts:659 |

---

## 8. FAQ

**F:** Kann ich mehrere Posts gleichzeitig freigeben?
**A:** Ja — Button „Alle freigeben" für Batch-Freigabe aller ausstehenden Posts.

**F:** Was passiert nach der Freigabe?
**A:** Auto-Post an → sofort via Blotato auf alle Kanäle. Ohne Auto-Post → Status „Freigegeben", manuell kopieren.

**F:** Sehe ich fremde Posts?
**A:** Nein — jeder sieht nur eigene. Nur Mathias sieht alle im Tab „Team-Übersicht".

**F:** Post hat kein Bild?
**A:** Wird automatisch als „Entwurf" markiert. Neu generieren im Generator.

---

## 9. Verwandte Tools

- **Content Wizard** (`/wizard`) — Posts erstellen
- **Kalender** (`/calendar`) — geplante Posts sehen
- **Blotato Command** (`/blotato`) — Publishing-Status prüfen
- **Pipeline** (`/kanban`) — visuelle Kanban-Ansicht

---

## 10. Pitfalls & Known Issues

- ⚠️ Reel-Scripts können nicht direkt gepostet werden — Fehlermeldung weist darauf hin
- ⚠️ Posts ohne Bild erscheinen nicht in der Freigabe (automatisch „Entwurf")

---

## 11. Technische Referenz

- **Page:** `client/src/pages/ApprovalPage.tsx`
- **Sidebar:** `DashboardLayout.tsx:48`
- **tRPC:** `content.list` (61), `approval.approve` (64), `approval.reject` (68), `approval.publish` (72), `content.edit` (76), `content.delete` (80), `postingTimes.smartNextMulti` (102)
- **DB:** `contentPosts` (Status-Updates), `approvalLogs` (Audit-Trail)
- **APIs:** Blotato (Publishing), Brevo (E-Mail-Benachrichtigung)
# Bibliothek

> **Slug:** `library`
> **Route:** `/library`
> **Frontend:** `client/src/pages/LibraryPage.tsx`
> **Status:** ✅ Aktiv in Sidebar

---

## 1. Kurzbeschreibung

Sammlung aller fertigen Inhalte — Texte, Bilder, Videos, Vorlagen, Lina-Videos, Skripte. Sofort kopierbar, personalisierbar und direkt auf Blotato postbar.

**Beleg:** Sidebar `"Fertige Posts kopieren & direkt nutzen"` — `DashboardLayout.tsx:49`

---

## 2. Wann einsetzen

1. **Fertigen Content schnell posten** — 1-Tap-Copy für Text + Hashtags + Bild
2. **KI-Personalisierung** — „✨ KI automatisch anpassen" passt Text auf dein Branding an
3. **Direkt auf Blotato posten** — ohne Umweg über Freigabe
4. **Content durchsuchen** — Volltextsuche + Pillar-Filter + Kategorie-Filter
5. **Eigene Inhalte verwalten** — hinzufügen, bearbeiten, löschen

---

## 3. Wann NICHT einsetzen

- **Neuen Content von Null erstellen?** → **Content Wizard** (`/wizard`)
- **Vorlagen/Hook-Formeln suchen?** → **Vorlagen** (`/templates`)
- **Post-Performance sehen?** → **Analytics** (`/analytics`)

---

## 4. Schritt-für-Schritt User-Flow

1. Öffne **„Bibliothek"** in der Sidebar
2. **Filtern:** Kategorie (Texte/Bilder/Videos/Vorlagen/Lina Videos/Skripte), Pillar, Suche (`Zeile 41–43`)
3. **Sortieren:** nach Datum/Relevanz (`Zeile 47`)
4. Post auswählen → **„Text + Hashtags kopieren"** (`Zeile 406`)
5. Oder: **„Auf Blotato posten"** (`Zeile 396`) — direkt auf alle Kanäle
6. Oder: **„✨ KI automatisch anpassen"** — personalisiert Text mit deinem Branding aus /settings
7. **Hinzufügen:** eigene Inhalte über **„Hinzufügen"** (`Zeile 185`)

---

## 5. Eingabefelder & Constraints

| Feld | Typ | Pflicht | Zeile |
|------|-----|---------|-------|
| Suchtext | Input | Nein | 42 |
| Kategorie-Filter | Tabs | Nein | 41 |
| Pillar-Filter | Select | Nein | 43 |
| Sortierung | Select | Nein | 47 |
| Neuer Titel | Input | Ja (beim Hinzufügen) | 52 |
| Neuer Text | Textarea | Ja | 55 |
| Neue Tags | Input | Nein | 56 |

---

## 6. Ausgaben & Ergebnisse

- **tRPC:** `library.list` (59), `library.add` (65), `library.copy` (75), `library.delete` (79), `library.publishToBlotato` (84)
- **DB:** Bibliotheks-Einträge erstellen/löschen
- Freigegebene Posts landen automatisch in der Bibliothek

---

## 7. Fehlermeldungen & Lösungen

| Fehlermeldung | Lösung | Zeile |
|---------------|--------|-------|
| „Zur Bibliothek hinzugefügt" | Erfolg | 67 |
| „Gelöscht" | Erfolg | 79 |
| „Text kopiert!" | Erfolg | 75 |
| „Auf X Plattformen gepostet!" | Erfolg | 86 |

---

## 8. FAQ

**F:** Wie personalisiere ich einen Text?
**A:** „✨ KI automatisch anpassen" klicken. Voraussetzung: Branding in /settings gefüllt (Vorstellung + CTA + Signatur + Hashtags).

**F:** Ist die Bibliothek leer?
**A:** Sie füllt sich automatisch mit jedem Post, den du erstellst und freigibst. Ersten Post im Wizard machen.

**F:** Kann ich eigene Texte hinzufügen?
**A:** Ja — Button „Hinzufügen", Titel + Text + Tags eingeben.

---

## 9. Verwandte Tools

- **Content Wizard** (`/wizard`) — neuen Content erstellen
- **Vorlagen** (`/templates`) — Hook-Formeln und Textbausteine
- **Blotato Command** (`/blotato`) — Publishing-Status
- **Freigabe** (`/approval`) — Posts vor Veröffentlichung prüfen

---

## 10. Pitfalls & Known Issues

- ⚠️ „KI automatisch anpassen" funktioniert nur mit gefülltem Branding in /settings
- ⚠️ Temporäre Bild-URLs können ablaufen — dann ist das Bild nicht mehr verfügbar

---

## 11. Technische Referenz

- **Page:** `client/src/pages/LibraryPage.tsx`
- **Sidebar:** `DashboardLayout.tsx:49`
- **tRPC:** `library.list` (59), `library.add` (65), `library.copy` (75), `library.delete` (79), `library.publishToBlotato` (84)
- **DB:** `contentLibrary` (oder `contentPosts` mit `sharedToLibrary: true`)
- **APIs:** Blotato (direktes Publishing)
# Quick-Start (Onboarding)

> **Route:** `/onboarding` | **Frontend:** `OnboardingPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
5-Schritte-Einführung für neue Partner mit Fortschrittsbalken. Führt vom Login bis zum ersten veröffentlichten Post.
**Beleg:** Sidebar `"Neu hier? Hier starten!"` — `DashboardLayout.tsx:106`

## Die 5 Onboarding-Schritte
1. **Einloggen** ✅ (automatisch erledigt via Magic-Link)
2. **Blotato einrichten** (optional, ca. 25 €/Monat) — 4-Schritt-Anleitung
3. **Persönliches Branding** (PFLICHT) — Vorstellung, CTA, Signatur, Hashtags in /settings
4. **Ersten Post erstellen** → Content Wizard oder Schnell-Post
5. **Post freigeben** → Freigabe-Center

## 4. User-Flow
1. Fortschrittsbalken zeigt den Stand
2. Jeder Schritt hat grünen Haken (erledigt) oder ausstehend
3. **Step-Links:** z.B. „Zu den Einstellungen" (`Zeile 138`), „Ersten Post erstellen" (`Zeile 448`)
4. Content-Mix-Grid erklärt das 86/14-Prinzip
5. Checkliste mit allen Schritten

## 11. Technische Referenz
- **tRPC:** `userSettings.get` (61), `dashboard.stats` (62)
- **Navigation:** → `/settings`, `/generator`, `/approval`, `/`
# Pipeline (Kanban)

> **Route:** `/kanban` | **Frontend:** `KanbanPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Kanban-Board-Ansicht aller Posts. 5 Spalten: Entwurf → Zur Freigabe → Freigegeben → Veröffentlicht → Abgelehnt. Mobile: einzelne Spalte mit Swipe.
**Beleg:** Sidebar `"Deine Posts im Überblick (Kanban)"` — `DashboardLayout.tsx:62`

## 2. Wann einsetzen
- Visueller Überblick: wo stehen meine Posts?
- Schnelles Freigeben oder Veröffentlichen direkt aus der Kanban-Ansicht
- Mobile-optimiert: Spalten einzeln durchswipen

## 4. User-Flow
1. 5 Spalten: Draft / Zur Freigabe / Freigegeben / Veröffentlicht / Abgelehnt (`Zeile 14–20`)
2. Pro Card: **„Weiter"** (`Zeile 122`) — schiebt den Post in die nächste Spalte
3. **„Aktualisieren"** (`Zeile 239`)
4. Mobile: einzelne Spalte, swipe links/rechts (`Zeile 244–310`)

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Post freigegeben!" | Erfolg | 142 |
| „Post veröffentlicht!" | Erfolg | 147 |
| „Fehler beim Freigeben" | Nochmal versuchen | 143 |
| „Fehler beim Veröffentlichen" | Blotato-Key prüfen | 148 |

## 11. Technische Referenz
- **tRPC:** `content.list` (137), `approval.approve` (141), `approval.publish` (146)
# Viral Predictor

> **Slug:** `viral-predictor`
> **Route:** `/viral-predictor`
> **Frontend:** `client/src/pages/ViralPredictorPage.tsx`
> **Status:** ✅ Aktiv in Sidebar

---

## 1. Kurzbeschreibung

KI bewertet deinen Post vor dem Posten. Du bekommst einen Viral Score (0–100%) mit Radar-Chart und konkreten Verbesserungsvorschlägen für Hook, Emotionalität, CTA und Hashtags.

**Beleg:** Sidebar `"KI bewertet deinen Post vor dem Posten"` — `DashboardLayout.tsx:55`

---

## 2. Wann einsetzen

1. **Vor dem Posten** — Score checken, ob der Post viral-tauglich ist
2. **Hook verbessern** — KI sagt dir genau, was am Hook schwach ist
3. **CTA optimieren** — Verbesserungsvorschläge für den Call-to-Action
4. **A/B-Test-Entscheidung** — welche Variante hat den höheren Score?

---

## 3. Wann NICHT einsetzen

- **Post erstellen?** → **Content Wizard** (`/wizard`)
- **Rechtlich prüfen?** → **Compliance Shield** (`/compliance`)
- **2 Varianten vergleichen?** → **A/B Tests** (`/ab-test`)

---

## 4. Schritt-für-Schritt User-Flow

1. Text in Textarea eingeben (`Zeile 163`)
2. Plattform wählen (`Zeile 164`), optional: Medien-Toggles (`Zeile 165–166`)
3. Klick auf **„Score berechnen"** (`Zeile 268`)
4. **Quick Score** kommt sofort → dann **Deep Score** parallel (`Zeile 168–169`)
5. Ergebnis: Radar-Chart, Score-Breakdown, konkrete Improvements
6. **„Neuen Content analysieren"** (`Zeile 452`) für neuen Text

---

## 5. Eingabefelder & Constraints

| Feld | Typ | Pflicht | Zeile |
|------|-----|---------|-------|
| Content-Text | Textarea | Ja | 163 |
| Plattform | Select | Nein | 164 |
| Hat Medien | Toggle | Nein | 165 |
| Hat Video | Toggle | Nein | 166 |

---

## 6. Ausgaben & Ergebnisse

- **tRPC:** `viralPredictor.quick` (168), `viralPredictor.predict` (169)
- Ausgabe: Score 0–100, Radar-Chart (Hook/Emotion/CTA/Hashtags/Timing), Improvements-Liste

---

## 7. Fehlermeldungen & Lösungen

| Fehlermeldung | Lösung | Zeile |
|---------------|--------|-------|
| „Bitte gib Content zum Analysieren ein!" | Text eingeben | 177 |

---

## 8. FAQ

**F:** Was bedeutet Viral Score 72?
**A:** Solide, aber Luft nach oben. Der Predictor sagt dir konkret, was du verbessern kannst — meistens Hook oder CTA.

**F:** Ist der Score genau?
**A:** Er ist eine KI-Einschätzung, kein Garant. Aber er hilft, offensichtliche Schwächen zu finden.

---

## 9. Verwandte Tools

- **Compliance Shield** (`/compliance`) — rechtliche Prüfung
- **A/B Tests** (`/ab-test`) — 2 Varianten vergleichen
- **Content Wizard** (`/wizard`) — Post erstellen

---

## 10. Pitfalls & Known Issues

Keine bekannten Issues.

---

## 11. Technische Referenz

- **Page:** `client/src/pages/ViralPredictorPage.tsx`
- **Sidebar:** `DashboardLayout.tsx:55`
- **tRPC:** `viralPredictor.quick` (168), `viralPredictor.predict` (169)
# Compliance Shield

> **Slug:** `compliance-shield`
> **Route:** `/compliance`
> **Frontend:** `client/src/pages/ComplianceShieldPage.tsx`
> **Status:** ✅ Aktiv in Sidebar

---

## 1. Kurzbeschreibung

Prüft jeden Post automatisch auf LR-Compliance: Heilaussagen, Verdienstversprechen, Markenrechts-Probleme. Status 🟢 Grün (sicher), 🟡 Gelb (Warnung), 🔴 Rot (nicht posten). Mit 1-Klick-Umformulierung.

**Beleg:** Sidebar `"Prüft ob dein Post rechtlich sicher ist"` — `DashboardLayout.tsx:56`

---

## 2. Wann einsetzen

1. **Vor dem Posten** — ist der Text rechtlich sicher?
2. **Heilaussagen vermeiden** — „heilt Krebs" → „unterstützt das Wohlbefinden"
3. **Verdienstversprechen prüfen** — „du verdienst garantiert X €" ist verboten
4. **Marken-Check** — keine Mitbewerber-Namen nennen
5. **LR-Pflichtangaben** — Disclaimer bei Einkommenshinweisen

---

## 3. Wann NICHT einsetzen

- **Viral-Potenzial prüfen?** → **Viral Predictor** (`/viral-predictor`)
- **Post erstellen?** → **Content Wizard** (`/wizard`)

---

## 4. Schritt-für-Schritt User-Flow

1. Text in Textarea eingeben (`Zeile 70`)
2. Plattform wählen (`Zeile 71`)
3. Klick auf **„Compliance Check"** (`Zeile 151`)
4. **Quick Check** sofort → **Deep Check** parallel (`Zeile 73–74`)
5. Ergebnis: Score-Ring, Violations-Detail, Prüfbereiche
6. Bei Verletzung: Umformulierungsvorschlag → 1-Klick übernehmen
7. **„Neuen Content prüfen"** (`Zeile 330`) für weiteren Text

---

## 5. Eingabefelder & Constraints

| Feld | Typ | Pflicht | Zeile |
|------|-----|---------|-------|
| Content-Text | Textarea | Ja | 70 |
| Plattform | Select | Nein | 71 |

---

## 7. Fehlermeldungen & Lösungen

| Fehlermeldung | Lösung | Zeile |
|---------------|--------|-------|
| „Bitte gib Content zum Prüfen ein!" | Text eingeben | 81 |

---

## 8. FAQ

**F:** Mein Post ist rot — was tun?
**A:** Umformulierungsvorschlag ansehen und mit 1 Klick übernehmen. Oft geht's um ein einzelnes Wort (z.B. „heilt" → „unterstützt").

**F:** Darf ich „heilt" schreiben?
**A:** Nein. Heilaussagen sind bei LR verboten. Das Shield bietet dir eine sichere Alternative.

**F:** Was bedeutet gelb?
**A:** Warnung — du kannst posten, aber eine Umformulierung ist empfohlen.

---

## 9. Verwandte Tools

- **Viral Predictor** (`/viral-predictor`) — Performance-Prüfung
- **Freigabe** (`/approval`) — Post zur Veröffentlichung freigeben

---

## 11. Technische Referenz

- **Page:** `client/src/pages/ComplianceShieldPage.tsx`
- **Sidebar:** `DashboardLayout.tsx:56`
- **tRPC:** `complianceShield.check` (73), `complianceShield.deepCheck` (74)
# Remix 1→7

> **Slug:** `remix-7`
> **Route:** `/remix7`
> **Frontend:** `client/src/pages/ContentRemix7Page.tsx`
> **Status:** ✅ Aktiv in Sidebar

---

## 1. Kurzbeschreibung

Aus einer einzigen Idee werden 7 plattform-optimierte Varianten erzeugt — inklusive ASMR-Script und Hopecore Reel. Spart 7× Schreiben.

**Beleg:** Sidebar `"1 Idee → 7 fertige Formate (inkl. ASMR)"` — `DashboardLayout.tsx:57`

---

## 2. Wann einsetzen

1. **Launch-Thema auf allen Plattformen** — 1 Idee, 7 Formate
2. **Plattform-optimiert** — jedes Format passt zur jeweiligen Plattform
3. **ASMR-Script** — für TikTok/Reels-Trend
4. **Batch-Content** — 7 Posts auf einmal statt einzeln

---

## 3. Wann NICHT einsetzen

- **Nur 1 Post?** → **Content Wizard** (`/wizard`)
- **Nur 5 Formate?** → **Content Remix** (`/remix`)
- **Karussell-Slides?** → **Karussell** (`/carousel`)

---

## 4. Schritt-für-Schritt User-Flow

1. Content/Thema eingeben (`Zeile 37–38`)
2. Pillar wählen (optional, `Zeile 39`)
3. **Formate auswählen** — welche der 7 sollen remixed werden (`Zeile 40`)
4. Klick auf **„1→7 Remix starten"** (`Zeile 244`)
5. 7 Varianten werden angezeigt — mit Hashtags, Music-Tipps, Notes
6. **„Kopieren"** pro Variante (`Zeile 334`) oder **„Alle kopieren"** (`Zeile 266`)
7. Optional: **„Speichern"** / **„Intern"** (`Zeile 324`) in Bibliothek

---

## 5. Eingabefelder & Constraints

| Feld | Typ | Pflicht | Zeile |
|------|-----|---------|-------|
| Content/Thema | Textarea | Ja | 37 |
| Thema | Input | Nein | 38 |
| Pillar | Select | Nein | 39 |
| Formate | Multi-Select (7) | Ja (mind. 1) | 40 |

---

## 7. Fehlermeldungen & Lösungen

| Fehlermeldung | Lösung | Zeile |
|---------------|--------|-------|
| „Bitte gib Content zum Remixen ein!" | Text eingeben | 59 |
| „Wähle mindestens ein Format!" | Mindestens 1 Format auswählen | 65 |

---

## 8. FAQ

**F:** Was sind die 7 Formate?
**A:** Instagram Post, Instagram Story, TikTok Caption, LinkedIn Post, Facebook Post, Twitter/X Tweet, Threads Post (+ ASMR/Hopecore je nach Auswahl).

**F:** Unterschied zu Content Remix (/remix)?
**A:** Remix 1→7 hat 7 Formate inkl. ASMR. Content Remix (/remix) hat 5 Basis-Formate (Post, Reel, Story, Hooks, Ad Copy).

---

## 9. Verwandte Tools

- **Content Remix** (`/remix`) — 5 Basis-Formate
- **Content Wizard** (`/wizard`) — einzelner Post
- **Bibliothek** (`/library`) — gespeicherte Remixe wiederverwenden

---

## 11. Technische Referenz

- **Page:** `client/src/pages/ContentRemix7Page.tsx`
- **Sidebar:** `DashboardLayout.tsx:57`
- **tRPC:** `contentRemix.formats` (44), `contentRemix.remixSelected` (45), `contentRemix.saveAsPost` (46)
# Lina Avatar

> **Slug:** `lina-avatar`
> **Route:** `/lina-avatar`
> **Frontend:** `client/src/pages/LinaAvatarPage.tsx`
> **Status:** ✅ Aktiv in Sidebar

---

## 1. Kurzbeschreibung

Videos mit Linas KI-Avatar erstellen. Lina spricht das Script — ideal für Produkt-Highlights, Business Opportunity und Lifestyle-Themen. 15–60 Sekunden, mit LR-Logo-Overlay.

**Beleg:** Sidebar `"Lina erklärt dein Produkt als Video"` — `DashboardLayout.tsx:58`

---

## 2. Wann einsetzen

1. **Produkt-Erklärvideos** — Lina stellt Aloe Vera, Lifetakt, Collagen Plus etc. vor
2. **Business-Videos** — Freiheit & Einkommen, Partner werden, Erfolgsgeschichte
3. **Lifestyle-Content** — Morgenroutine, Traumauto, Reisen
4. **Daily Drop** — automatisches tägliches Lina-Video (06:00 + 18:00)

---

## 3. Wann NICHT einsetzen

- **Eigenes Gesicht im Video?** → Manuell mit Handy filmen
- **Nur Text-Post?** → **Content Wizard** (`/wizard`)
- **Karussell?** → **Karussell** (`/carousel`)

---

## 4. Schritt-für-Schritt User-Flow (4 Schritte)

### Step 1 — Produkt/Thema wählen (`Zeile 120`)
- **Preset wählen** oder eigenes Thema eingeben
- Presets: Aloe Vera Gel, Lifetakt Energie, Collagen Plus, Protein, Zeitgard
- Business: Freiheit & Einkommen, Mallorca Lifestyle, Partner werden
- Lifestyle: Morgenroutine, Traumauto, Reisen, Fitness

### Step 2 — Stil & Länge (`Zeile 150`)
- **Stil:** Freundlich 😊, Professionell 💼, Energetisch ⚡, Story 📖
- **Dauer:** 15 / 30 / 45 / 60 Sekunden

### Step 3 — Script generieren (`Zeile 192`)
- Klick auf **„Script für Lina generieren"** (`Zeile 200`)
- Script wird angezeigt — bearbeitbar
- **„Kopieren"** (`Zeile 225`)

### Step 4 — Lina Video generieren (`Zeile 254`)
- Klick auf **„Lina Video generieren"** (`Zeile 262`)
- Dauert 3–5 Minuten
- Toast: **„🎬 Lina Video ist fertig!"** (`Zeile 55`)
- **„Herunterladen"** (`Zeile 288`) oder im Dashboard teilen

---

## 5. Eingabefelder & Constraints

| Feld | Typ | Pflicht | Zeile |
|------|-----|---------|-------|
| Produkt/Preset | Select/Cards | Ja (oder Custom-Thema) | 33 |
| Eigenes Thema | Input | Alternative zu Preset | 34 |
| Stil | Select (4) | Ja | 35 |
| Dauer | Select (15/30/45/60s) | Ja | 36 |
| Script | Textarea | Auto-generiert, editierbar | 37 |

---

## 7. Fehlermeldungen & Lösungen

| Fehlermeldung | Lösung | Zeile |
|---------------|--------|-------|
| „Bitte wähle ein Produkt oder gib ein Thema ein!" | Preset wählen oder Thema eingeben | 44 |
| „Script generiert! Jetzt Video erstellen" | Erfolg — weiter zu Step 4 | 49 |
| „🎬 Lina Video ist fertig!" | Erfolg — Download verfügbar | 55 |

---

## 8. FAQ

**F:** Wie lange dauert ein Lina-Video?
**A:** 3–5 Minuten. Fortschrittsanzeige läuft.

**F:** Kann ich das Script bearbeiten?
**A:** Ja — nach dem Generieren ist es editierbar, bevor das Video erstellt wird.

**F:** Kostet das was?
**A:** Nein — Mathias übernimmt die HeyGen-Kosten.

**F:** Max. Videolänge?
**A:** 60 Sekunden.

---

## 9. Verwandte Tools

- **Bibliothek** (`/library`) — Lina-Videos finden
- **Freigabe** (`/approval`) — Video zur Veröffentlichung freigeben
- **Blotato Command** (`/blotato`) — Video auf Kanäle posten

---

## 10. Pitfalls & Known Issues

- ⚠️ Video-Generierung kann bei Überlastung fehlschlagen — 2 Min warten, nochmal versuchen
- ⚠️ Script max. 200 Wörter für 30-Sek-Video

---

## 11. Technische Referenz

- **Page:** `client/src/pages/LinaAvatarPage.tsx`
- **Sidebar:** `DashboardLayout.tsx:58`
- **tRPC:** `linaAvatar.generateScript` (41), `linaAvatar.generateVideo` (49)
- **APIs:** HeyGen Avatar IV (expressiveness=medium, speed 1.1)
- **LR-Logo:** Overlay oben rechts, 160px
# Duplicate Check

> **Route:** `/duplicate-check` | **Frontend:** `DuplicateCheckPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Verhindert, dass alle denselben Text posten. Prüft deinen Content gegen bestehende Posts im Team.
**Beleg:** Sidebar `"Verhindert dass alle denselben Text posten"` — `DashboardLayout.tsx:59`

## 2. Wann einsetzen
- Vor dem Posten prüfen, ob ein ähnlicher Text schon existiert
- Nach dem Kopieren aus der Bibliothek — ist der Text noch einzigartig?

## 3. Wann NICHT einsetzen
- **Compliance prüfen?** → Compliance Shield (`/compliance`)
- **Viral-Score prüfen?** → Viral Predictor (`/viral-predictor`)

## 4. User-Flow
1. Text eingeben (min. 20 Zeichen, `Zeile 92`)
2. Klick auf **„Jetzt prüfen"** (`Zeile 108`)
3. Ergebnis: ✅ „Kein Duplikat gefunden!" oder ⚠️ „Ähnlicher Content gefunden!" mit Similarity-Score
4. **„Neuen Text prüfen"** (`Zeile 202`)

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Bitte mindestens 20 Zeichen eingeben!" | Mehr Text eingeben | 44 |
| „Fehler beim Prüfen" | Seite neu laden | 39 |
| „✅ Kein Duplikat gefunden!" | Alles gut — posten | 36 |
| „⚠️ Ähnlicher Content gefunden!" | Text umschreiben | 34 |

## 11. Technische Referenz
- **tRPC:** `duplicateCheck.check` (25)
# Lifestyle-Engine

> **Route:** `/lifestyle` | **Frontend:** `LifestylePage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Emotionaler Content für Traumauto, Freiheit, Erfolg, Business. Zieht neue Partner an — kein direktes Produktmarketing.
**Beleg:** Sidebar `"Traumauto, Freiheit & Erfolg als Content"` — `DashboardLayout.tsx:60`

## 2. Wann einsetzen
- Emotionale Posts, die Lifestyle zeigen statt Produkte verkaufen
- Traumauto, Mallorca, finanzielle Freiheit, ortsunabhängiges Arbeiten
- Batch-Generierung: mehrere Lifestyle-Posts auf einmal

## 3. Wann NICHT einsetzen
- **Produkt-Post?** → Content Wizard (`/wizard`)
- **7 Plattform-Varianten?** → Remix 1→7 (`/remix7`)

## 4. User-Flow
1. **Kategorie** wählen (Traumauto, Freiheit, Erfolg, Business, `Zeile 42`)
2. **Thema** eingeben (`Zeile 43`), **Plattform** (`Zeile 44`), **Stimmung** (`Zeile 45`)
3. Klick auf **„Lifestyle-Content generieren"** (`Zeile 235`)
4. Oder Batch: **„X Lifestyle-Posts generieren"** (`Zeile 303`, Count `Zeile 50`)
5. Post + Bild werden generiert → landen automatisch in Freigabe-Queue

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Bitte Kategorie auswählen" | Kategorie anklicken | 76 |
| „Lifestyle-Content generiert!" | Erfolg | 61 |
| „X Lifestyle-Posts generiert!" | Batch-Erfolg | 70 |

## 6. Nach Submit → `/approval` (automatisch, `Zeile 84`)

## 11. Technische Referenz
- **tRPC:** `lifestyle.generate` (56), `lifestyle.generateBatch` (66)
- **DB:** `contentPosts` (autoCreatePost: true)
# Karussell

> **Route:** `/carousel` | **Frontend:** `CarouselPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Mehrseitige Slide-Posts für Instagram + LinkedIn. Ideal für Anleitungen, Top-Listen, Produkt-Vergleiche. 5–10 Slides automatisch generiert.
**Beleg:** Sidebar `"Mehrteilige Slide-Posts erstellen"` — `DashboardLayout.tsx:61`

## 2. Wann einsetzen
- Instagram-Karussell mit mehreren Slides
- LinkedIn-Slides (edukativer Content)
- Top-10-Listen, Schritt-für-Schritt-Anleitungen, Vorher/Nachher

## 3. Wann NICHT einsetzen
- **Einzelner Post?** → Content Wizard (`/wizard`)
- **Video?** → Lina Avatar (`/lina-avatar`)

## 4. User-Flow
1. **Thema** eingeben (`Zeile 68`)
2. **Plattform** wählen: Instagram oder LinkedIn (`Zeile 70`)
3. **Anzahl Slides** wählen (default 7, `Zeile 71`)
4. **Style** wählen: Educational, Storytelling, Listicle, Before/After, Tips (`Zeile 72`)
5. Klick auf **„Karussell generieren"** (`Zeile 194`)
6. Slides-Preview mit Navigation
7. **„Slide X kopieren"** (`Zeile 326`) oder **„Alles kopieren"** (`Zeile 218`)

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Thema eingeben" | Thema-Feld ausfüllen | 86 |
| „Karussell mit X Slides generiert!" | Erfolg | 80 |
| „Alles kopiert!" | Erfolg | 101 |

## 11. Technische Referenz
- **tRPC:** `carousel.generate` (76)
# Content Remix

> **Route:** `/remix` | **Frontend:** `ContentRemixPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
1 Thema → 5 verschiedene Formate (Post, Reel, Story, Hooks, Ad Copy). Schneller als Remix 1→7 — für die 5 Basis-Formate.
**Beleg:** Sidebar `"1 Thema → 5 verschiedene Formate"` — `DashboardLayout.tsx:63`

## 2. Wann einsetzen
- Schnell 5 verschiedene Content-Formate aus einem Thema
- Post + Reel + Story + Hooks + Ad Copy gleichzeitig

## 3. Wann NICHT einsetzen
- **7 Formate inkl. ASMR?** → Remix 1→7 (`/remix7`)
- **Nur 1 Post?** → Content Wizard (`/wizard`)

## 4. User-Flow
1. **Thema** eingeben (`Zeile 73`), optional **Pillar** (`Zeile 74`)
2. Klick auf **„5x Remix starten"** (`Zeile 192`)
3. 5 Varianten werden progressiv angezeigt (Post, Reel, Story, Hooks, Ad Copy)
4. **„Alle kopieren"** (`Zeile 317`) oder einzeln kopieren
5. **„Neues Thema remixen"** (`Zeile 298`)

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Bitte gib ein Thema ein!" | Thema eingeben | 83 |
| „X Content-Formate generiert!" | Erfolg | 117 |
| „Alle 5 Formate kopiert!" | Erfolg | 312 |

## 11. Technische Referenz
- **tRPC:** `content.generate` (79) — wird 5x aufgerufen (Zeile 94)
# Trend-Scanner

> **Route:** `/trends` | **Frontend:** `TrendScannerPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Scannt TikTok, YouTube und Reddit nach viralen Trends. Viral Score 0–100. Mit 1-Klick zum fertigen Post aus dem Trend.
**Beleg:** Sidebar `"Was ist gerade viral? Jetzt nutzen!"` — `DashboardLayout.tsx:69`

## 2. Wann einsetzen
- Aktuelle virale Trends finden und sofort Content daraus machen
- Pillar-basiert scannen (z.B. nur Lifestyle-Trends)
- Autopilot: Trend → Content + Bild + Video + Hashtags → Freigabe in einem Schritt

## 4. User-Flow
1. **Tabs:** Top Trends / Alle Scans
2. **Platform-Filter:** TikTok, YouTube, Reddit
3. **Pillar-Filter** oder Quick-Scan Pillar-Cards (`Zeile 117–131`)
4. Klick auf **„Jetzt scannen"** (`Zeile 110`)
5. Trends mit Viral Score werden angezeigt
6. **„KI-Ideen generieren"** (`Zeile 102`) — Content-Ideen aus Trend
7. **„Autopilot"** (`Zeile 367`) — kompletter Flow: Trend → Post + Bild/Video + Hashtags → Freigabe
8. **„Content erstellen"** (`Zeile 180`) — manuell Post aus Trend bauen

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Scan fehlgeschlagen" | Nochmal versuchen | 62 |
| „Pillar-Scan fehlgeschlagen" | Nochmal versuchen | 71 |
| „X Trends gescannt!" | Erfolg | 58 |
| „Autopilot: Content erstellt! Post #X wartet auf Freigabe." | Erfolg → /approval | 263 |

## 11. Technische Referenz
- **tRPC:** `trends.top` (53), `trends.latest` (54), `trends.scan` (56), `trends.scanPillar` (65), `trends.generateIdeas` (74), `trends.autopilot` (256)
- **Nach Autopilot:** → `/approval` (Zeile 264)
# Creator Spy

> **Route:** `/creator-spy` | **Frontend:** `CreatorSpyPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Analysiert erfolgreiche Creator im Network-Marketing. Zeigt Top-Hooks, Performance-Tiers und Strategien zum Kopieren.
**Beleg:** Sidebar `"Was machen erfolgreiche Creator?"` — `DashboardLayout.tsx:70`

## 2. Wann einsetzen
- Wettbewerber-Analyse: welche Hooks funktionieren?
- Content-Inspiration aus erfolgreichen Creator-Strategien
- Hook-Formeln für eigene Posts ableiten

## 4. User-Flow
1. Klick auf **„Neuen Report erstellen"** (`Zeile 45`)
2. Report wird generiert (KI-Analyse)
3. Ergebnis: Top Hooks, Content Ideas, Full Report
4. Toast: **„Creator Spy Report erstellt!"** (`Zeile 22`)

## 11. Technische Referenz
- **tRPC:** `creatorSpy.analyze` (18), `creatorSpy.latest` (15), `creatorSpy.reports` (16)
# Hashtag-Engine

> **Route:** `/hashtags` | **Frontend:** `HashtagPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Optimale Hashtag-Sets generieren — pro Plattform. Thema oder Text eingeben, KI liefert kategorisierte Tags mit Difficulty-Filter.
**Beleg:** Sidebar `"Die besten Hashtags für mehr Reichweite"` — `DashboardLayout.tsx:71`

## 2. Wann einsetzen
- Hashtags für einen fertigen Post generieren
- Plattform-spezifische Tag-Sets (Instagram vs. TikTok vs. LinkedIn)
- Hashtag-Recherche zu einem Thema
- Vordefinierte Hashtag-Pools (6 Pillars)

## 4. User-Flow
### Tab: Generator
1. Content in Textarea eingeben (`Zeile 85`)
2. Plattform, Pillar, Topic wählen
3. Klick auf **„Hashtags generieren"** (`Zeile 125`)
4. Generierte Hashtags nach Kategorien → einzeln oder alle kopieren

### Tab: Recherche
1. Topic + Pillar eingeben
2. Klick auf **„Hashtags recherchieren"** (`Zeile 225`)
3. Research-Ergebnis mit Difficulty-Filter

### Tab: Pools
- Vordefinierte LR-Sets für 6 Pillars (Autokonzept, Business, Produkt, Lifestyle, Gesundheit, Lina KI-Demo)

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Bitte Content eingeben" | Text eingeben | 29 |
| „Bitte Thema eingeben" | Thema-Feld ausfüllen | 37 |
| „X Hashtags kopiert!" | Erfolg | 45 |

## 11. Technische Referenz
- **tRPC:** `hashtags.generate` (22), `hashtags.research` (23), `hashtags.platforms` (24), `hashtags.pools` (25)
# Kalender

> **Route:** `/calendar` | **Frontend:** `CalendarPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Wochenansicht aller geplanten Posts. Tabs für Blotato- und Dashboard-Posts. Posts bearbeiten, verschieben oder löschen.
**Beleg:** Sidebar `"Wann wird was gepostet?"` — `DashboardLayout.tsx:77`

## 2. Wann einsetzen
- Geplante Posts im Überblick sehen
- Posts zeitlich verschieben
- Posts bearbeiten oder löschen

## 4. User-Flow
1. **Tabs:** Blotato-Kalender (nach Datum) / Dashboard-Posts (Wochenansicht)
2. Post anklicken → Dialog mit Details
3. **„Verschieben"** (`Zeile 315`) — neuen Zeitpunkt wählen
4. **„Löschen"** (`Zeile 327`)
5. **„Speichern"** (`Zeile 378`) — Änderungen übernehmen
6. **„Aktualisieren"** (`Zeile 229`) — Daten neu laden

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Post gelöscht" | Erfolg | 174 |
| „Post verschoben" | Erfolg | 185 |
| „Post aktualisiert" | Erfolg | 197 |

## 11. Technische Referenz
- **tRPC:** `calendar.byDate` (170), `calendar.delete` (172), `calendar.reschedule` (183), `calendar.update` (196), `content.list` (78)
# Monatsplan

> **Route:** `/monthly-plan` | **Frontend:** `MonthlyPlanPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
30 Posts für den ganzen Monat auf Knopfdruck. KI erstellt einen Plan nach dem Agent-Brain-Wochenschema (Mo: Motivation, Di: Produkt, Mi: Erfolg, Do: Behind the Scenes, Fr: Lifestyle).
**Beleg:** Sidebar `"30 Posts für den ganzen Monat"` — `DashboardLayout.tsx:78`

## 2. Wann einsetzen
- Kompletten Monat im Voraus planen
- Content-Mix automatisch ausbalancieren (86% Lifestyle / 14% Produkt)
- Einzelne Posts aus dem Plan direkt erstellen

## 4. User-Flow
1. **Monat** wählen (`Zeile 97`, MONTHS-Array `Zeile 11`)
2. **Jahr** wählen (`Zeile 107`)
3. Klick auf **„Monatsplan generieren"** (`Zeile 121`)
4. Plan-Grid wird angezeigt: Pillar + Topic + Platform pro Tag
5. Pro Eintrag: **„Erstellen"** (`Zeile 210`) → Post wird erzeugt und in Freigabe geschickt

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Monatsplan erstellt: X Posts für Monat Jahr" | Erfolg | 29 |
| „Post erstellt und zur Freigabe geschickt!" | Erfolg → /approval | 38 |

## 11. Technische Referenz
- **tRPC:** `monthlyPlan.generate` (27), `monthlyPlan.list` (44), `monthlyPlan.get` (45), `monthlyPlan.createPostFromPlan` (36)
- **Nach Post-Erstellung:** → `/approval` (Zeile 39)
# Posting-Zeiten

> **Route:** `/posting-times` | **Frontend:** `PostingTimesPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Optimale Posting-Zeiten pro Plattform — basierend auf Sprout Social, Hootsuite und Buffer 2026. Read-Only mit „Übernehmen"-Option.
**Beleg:** Sidebar `"Wann ist dein Publikum online?"` — `DashboardLayout.tsx:79`

## 2. Wann einsetzen
- Beste Zeiten fürs Posten nachschlagen
- Optimale Zeiten mit 1 Klick in Einstellungen übernehmen

## 4. User-Flow
1. **Tabs pro Plattform** (`Zeile 99–106`): Instagram, TikTok, Facebook, LinkedIn, X, Threads, YouTube
2. **Wochenplan** mit Zeitslots (`Zeile 122–148`)
3. **Top 3 Zeiten** pro Plattform (`Zeile 163`)
4. **Beste Tage** (`Zeile 188`)
5. **Zeiten zu vermeiden** (`Zeile 205`)
6. Button **„Optimale Zeiten übernehmen"** setzt die Werte in /settings

## Beste Zeiten (Kurzreferenz)
| Plattform | Beste Zeiten | Beste Tage |
|-----------|-------------|------------|
| Instagram | 07:00, 12:00, 18:00, 21:00 | Di, Mi, Fr |
| TikTok | 07:00, 10:00, 17:00, 21:00 | Di, Do, Fr |
| Facebook | 09:00, 13:00, 16:00 | Mo, Mi, Fr |
| LinkedIn | 08:00, 10:00, 12:00 | Di, Mi, Do |
| Twitter/X | 08:00, 12:00, 17:00 | Mo, Di, Mi |

## 11. Technische Referenz
- **tRPC:** `postingTimes.allSchedules` (35), `postingTimes.smartNextMulti` (39)
- **Read-Only:** Keine Mutations
# Produktbilder

> **Route:** `/products` | **Frontend:** `ProductsPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Offizielle LR-Produktbibliothek mit 226 Produkten und Originalfotos. Kategorien: Aloe Vera, Körperpflege, ZEITGARD, Parfum, Nahrungsergänzung, Haarpflege. Beim Post-Erstellen als Vorlage auswählbar.
**Beleg:** Sidebar `"Offizielle LR Produktfotos"` — `DashboardLayout.tsx:85`

## 4. User-Flow
1. Kategorie-Filter oder Suchfeld nutzen
2. Produkt anklicken → Detail-Dialog
3. **„Kopieren/Download"** (`Zeile 313/326`) — Bild-URL kopieren oder Bild herunterladen
4. Admin: **„Neu importieren"** (`Zeile 110`)

## 11. Technische Referenz
- **tRPC:** `products.categories` (45), `products.count` (46), `products.list` (49), `products.import` (56)
# Vorlagen

> **Route:** `/templates` | **Frontend:** `TemplatesPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Hook-Formeln, Einleitungssätze, CTA-Vorlagen, Einwandbehandlung. Für Partner, die selbst schreiben aber Inspiration brauchen.
**Beleg:** Sidebar `"Bewährte Texte & Hooks zum Anpassen"` — `DashboardLayout.tsx:86`

## 4. User-Flow
1. **5 Pillar-Filter** — nach Themenbereich filtern
2. Template-Grid: Name, Kategorie, Content, Usages-Zähler
3. **„Kopieren"** (`Zeile 182`) — Text in Zwischenablage
4. **„+ Neue Vorlage"** (`Zeile 88`) — eigene Vorlage erstellen
5. **„Löschen"** (`Zeile 185`)

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Vorlage erstellt!" | Erfolg | 55 |
| „Vorlage gelöscht" | Erfolg | 65 |

## 11. Technische Referenz
- **tRPC:** `templates.list` (48), `templates.create` (52), `templates.delete` (62)
# Content Queue

> **Route:** `/queue` | **Frontend:** `ContentQueue.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Alle Posts in der Warteschlange — mit Status-Filter (Alle, Ausstehend, Genehmigt, Geplant, Live, Abgelehnt). Schneller Überblick als Alternative zur Kanban-Ansicht.
**Beleg:** Sidebar `"Alle Posts in der Warteschlange"` — `DashboardLayout.tsx:87`

## 4. User-Flow
1. **Status-Pills** zum Filtern: Alle / Ausstehend / Genehmigt / Geplant / Live / Abgelehnt (`Zeile 72–82`)
2. Content-Grid mit Status-Badges
3. **„Neuer Post"** (`Zeile 53`) → `/generator`
4. **„Zur Freigabe"** (`Zeile 115`) → `/approval`

## 5. Fehlermeldungen
| Meldung | Zeile |
|---------|-------|
| „Noch keine Posts erstellt." | 130 |

## 11. Technische Referenz
- **tRPC:** `content.list` (37), `dashboard.stats` (40)
# A/B Tests

> **Route:** `/ab-test` | **Frontend:** `ABTestPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
2 Varianten eines Posts vergleichen. KI generiert beide Versionen, du bestimmst den Gewinner.
**Beleg:** Sidebar `"Welche Version performt besser?"` — `DashboardLayout.tsx:88`

## 4. User-Flow
1. **„+ Neuer Test"** (`Zeile 56`)
2. Test-Name, Plattform, Pillar, Thema eingeben
3. 2× Textarea: Variante A und Variante B
4. Klick auf **„Test starten"** (`Zeile 124`)
5. Beide Varianten landen in der Queue
6. Nach Ergebnissen: **„A gewinnt"** oder **„B gewinnt"** (`Zeile 206–212`)

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „A/B Test erstellt!" | Erfolg — beide Varianten in Queue | 32 |
| „Test abgeschlossen!" | Gewinner wurde festgelegt | 41 |

## 11. Technische Referenz
- **tRPC:** `abTest.list` (28), `abTest.create` (30), `abTest.complete` (40)
- **DB:** `abTestGroups` (Tabelle)
# Analytics

> **Route:** `/analytics` | **Frontend:** `AnalyticsPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Post-Performance: Likes, Kommentare, Shares, Impressions. Plattform-Performance-Tabelle.
**Beleg:** Sidebar `"Wie laufen deine Posts?"` — `DashboardLayout.tsx:89`

## 4. User-Flow
1. 4 Stat-Cards: Likes, Comments, Shares, Impressions
2. Platform-Performance-Tabelle (pro Plattform aufgeschlüsselt)
3. Read-Only — keine Aktionen

## 5. Fehlermeldungen
| Meldung | Zeile |
|---------|-------|
| „Noch keine Analytics-Daten vorhanden." | 121 |

## 8. FAQ
**F:** Warum sind meine Analytics leer?
**A:** Analytics füllen sich, sobald du Posts über Blotato veröffentlichst. Manuell gepostete Inhalte werden nicht getrackt.

## Verwandte Tools
- **Analytics+** (`/analytics-plus`) — tiefere Analyse mit Heatmap und Trends

## 11. Technische Referenz
- **tRPC:** `analytics.summary` (9)
- **Read-Only**
# Analytics+

> **Route:** `/analytics-plus` | **Frontend:** `AnalyticsPlusPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Tiefe Analyse: Content-Mix Pie-Chart, Content-Typ Bar-Chart, 7×24 Posting-Heatmap, Weekly Trend Line-Chart, Top-5 Performer.
**Beleg:** Sidebar `"Tiefe Analyse: Heatmap & Trends"` — `DashboardLayout.tsx:90`

## 4. User-Flow
1. **Pie-Chart:** Content nach Pillar (Verteilung)
2. **Bar-Chart:** Content nach Typ (Post, Reel, Story etc.)
3. **Heatmap:** 7 Tage × 24 Stunden — wann postest du am meisten?
4. **Line-Chart:** Wöchentlicher Trend
5. **Top-5 Performer:** Beste Posts nach Score
6. Alles Read-Only

## 5. Fehlermeldungen
| Meldung | Zeile |
|---------|-------|
| „Noch keine Daten" | 115 |
| „Noch keine bewerteten Posts" | 282 |

## 11. Technische Referenz
- **tRPC:** `analyticsPlus.contentMix` (20), `analyticsPlus.heatmap` (21), `analyticsPlus.weeklyTrend` (22), `analyticsPlus.bestPerformers` (23)
# Evergreen

> **Route:** `/evergreen` | **Frontend:** `EvergreenPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Deine besten Posts werden nach einstellbaren Wochen automatisch wieder gepostet — mit leichten KI-Variationen. Passiv-Reichweite ohne Aufwand.
**Beleg:** Sidebar `"Deine besten Posts nochmal posten"` — `DashboardLayout.tsx:91`

## 4. User-Flow
1. **3 Tabs:** Fällig / Pool / Kandidaten
2. **Fällig:** Posts, die jetzt wieder gepostet werden können → **„Jetzt recyclen"** (`Zeile 93`)
3. **Pool:** Alle Evergreen-Posts mit Recycling-Intervall und Max-Recyclings
4. **Kandidaten:** Top-Posts mit Score-Badge → **„+ Hinzufügen"** (`Zeile 238`)
5. Entfernen: Trash-Icon (`Zeile 146`)

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Post zum Evergreen-Pool hinzugefügt!" | Erfolg | 21 |
| „Post recycled! (Recycling #X)" | Erfolg — Post ist wieder in Queue | 29 |
| „Aus Evergreen-Pool entfernt" | Erfolg | 38 |

## 11. Technische Referenz
- **tRPC:** `evergreen.list` (15), `evergreen.due` (16), `evergreen.candidates` (17), `evergreen.add` (19), `evergreen.recycle` (27), `evergreen.remove` (36)
# Feedback

> **Route:** `/feedback` | **Frontend:** `FeedbackPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Posts mit 1–5 Sternen bewerten. System lernt daraus. Zeigt Top-Posts, beste Posting-Zeiten und Learnings.
**Beleg:** Sidebar `"Was hat am besten funktioniert?"` — `DashboardLayout.tsx:92`

## 4. User-Flow
1. **Pending-Feedback-Cards** — Posts, die noch bewertet werden müssen
2. **Score-Buttons 1–5** (`Zeile 72–84`) — 1 Klick zum Bewerten
3. **Top Posts** — Ranking nach Feedback-Score
4. **Beste Posting-Zeiten** — aus dem Feedback abgeleitet
5. **3er-Grid:** Funktioniert gut / Vermeiden / Pro-Tipps

## 5. Fehlermeldungen
| Meldung | Zeile |
|---------|-------|
| „Feedback gespeichert!" | 30 |

## 11. Technische Referenz
- **tRPC:** `feedback.topPerforming` (24), `postingTimes.get` (25), `content.list` (26), `feedback.updateScore` (29)
# Blotato Command

> **Route:** `/blotato` | **Frontend:** `BlotatoCommandPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Blotato Command Center — zeigt verbundene Social-Media-Kanäle, geplante Posts und API-Status. Zentraler Ort für alles rund ums Publishing.
**Beleg:** Sidebar `"Auf 9 Kanäle gleichzeitig posten"` — `DashboardLayout.tsx:98`

## 2. Wann einsetzen
- Prüfen ob Blotato verbunden ist
- Verbundene Kanäle sehen (Instagram, TikTok, Facebook, LinkedIn, X, Threads, YouTube)
- Geplante Posts einsehen
- Quick-Actions: Content erstellen oder in Kalender schauen

## 4. User-Flow
1. **4 Status-Cards:** Connected (Kanäle), Scheduled (geplant), API (Status), Today (Posts heute)
2. **Platform-Grid:** Icon + Name + Username + Live-Badge + Scheduled-Count
3. **Nächste geplante Posts** — Preview
4. **Quick-Actions:** → Content Wizard, Generator, Kalender, Settings
5. **„Aktualisieren"** (`Zeile 100`) — Daten neu laden
6. **„Posten"** (`Zeile 229`) — direkt Publishing

## Blotato einrichten (Kurzanleitung)
1. Account erstellen: `sozialmedia.best/blotato-signup`
2. Social-Kanäle verbinden in `my.blotato.com`
3. API-Key kopieren (Einstellungen → API Access)
4. Key in `/settings` einfügen → grüner Haken

## 11. Technische Referenz
- **tRPC:** `apiHealth.blotatoAccounts` (37), `calendar.list` (38), `dashboard.stats` (39)
# Einstellungen

> **Route:** `/settings` | **Frontend:** `SettingsPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Zentrale Einstellungsseite: Blotato API-Key, Auto-Post Toggle, Posting-Zeiten pro Plattform und persönliches Branding (Signatur, Hashtags, Vorstellung, CTA).
**Beleg:** Sidebar `"Blotato verbinden & Branding"` — `DashboardLayout.tsx:105`

## 2. Bereiche

### Blotato API Key
- **Input:** API-Key einfügen (Format: `blt_XXXXX…`)
- **„Key speichern"** (`Zeile 200`)
- **„Key entfernen"** (`Zeile 203`)
- Grüner Haken = Key hinterlegt

### Auto-Post
- **Toggle:** Auto-Post nach Freigabe an/aus (`Zeile 240`)
- An = Post geht sofort raus nach Freigabe via Blotato
- Aus = Status auf „Freigegeben", manuell kopieren

### Posting-Zeiten
- **7 Plattform-Inputs:** Instagram, TikTok, Facebook, LinkedIn, X, Threads, YouTube
- **„Optimale Zeiten übernehmen"** (`Zeile 279`) — setzt Empfehlungen aus /posting-times
- **„Zeiten speichern"** (`Zeile 344`)

### Persönliches Branding (PFLICHT für KI-Personalisierung)
- **Signatur** — dein Abschluss-Text
- **Hashtags** — deine Standard-Tags
- **Vorstellung** — wer bist du?
- **CTA** — dein Call-to-Action
- **„Branding speichern"** (`Zeile 392`)

## 5. Fehlermeldungen
| Meldung | Zeile |
|---------|-------|
| „Blotato API Key gespeichert" | 97 |
| „Blotato API Key entfernt" | 102 |
| „Auto-Post aktiviert/deaktiviert" | 106 |
| „Posting-Zeiten gespeichert" | 110 |
| „Persönliches Branding gespeichert" | 114 |

## 8. FAQ
**F:** Was muss ich für die KI-Personalisierung ausfüllen?
**A:** Vorstellung + CTA + Signatur + Hashtags. Ohne diese Felder kann „✨ KI automatisch anpassen" in der Bibliothek nicht funktionieren.

**F:** Wie aktiviere ich Auto-Post?
**A:** Toggle „Auto-Post nach Freigabe" auf grün stellen. Voraussetzung: Blotato-Key ist hinterlegt.

## 11. Technische Referenz
- **tRPC:** `userSettings.get` (68), `userSettings.saveBlotatoKey` (96), `userSettings.removeBlotatoKey` (101), `userSettings.toggleAutoPost` (105), `userSettings.savePostingTimes` (109), `userSettings.savePersonalBranding` (113)
# Instagram Growth

> **Route:** `/instagram-growth` | **Frontend:** `SuperProfilePage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Instagram-Wachstumsstrategien, AutoDM-Tipps, Lead-Generierung mit SuperProfile. Info-Seite mit konkreten Anleitungen und Textbausteinen.
**Beleg:** Sidebar `"AutoDM & neue Leads gewinnen"` — `DashboardLayout.tsx:107`

## 2. Inhalte der Seite
- **Was ist SuperProfile** — Erklärung des Tools
- **Kosten** — 2 Preispläne
- **5-Schritt-Anleitung** (StepCards)
- **Copy-Texte** — 4 Post-Varianten zum Kopieren
- **Wo landen die Anfragen** — Lead-Flow erklärt
- **Lead Magnets** — was du anbieten kannst
- **8-Item Checkliste** — alles abhaken
- **FAQ** — 9 häufige Fragen

## 4. User-Flow
1. Info lesen — reine Wissensvermittlung
2. **„SuperProfile öffnen"** (`Zeile 155`) → öffnet `superprofile.bio` extern
3. Checkliste abhaken (`Zeile 360–368`)
4. Copy-Texte nutzen

## 11. Technische Referenz
- **tRPC:** Keine (Info-Only Page)
- **Navigation:** `window.open("https://superprofile.bio")`
# Leaderboard

> **Route:** `/leaderboard` | **Frontend:** `LeaderboardPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Team-Ranking nach Post-Anzahl und Punkten. Gamification: Badges, Level, Punkte. Freundlicher Wettbewerb im Team.
**Beleg:** Sidebar `"Wer im Team postet am meisten?"` — `DashboardLayout.tsx:99`

## 4. User-Flow
1. **My Stats Card:** Badge + Level + Punkte + Posts + Published + Top Posts
2. **Level-Progress-Bar** — wie weit bis zum nächsten Level
3. **Rankings-Table:** Rank + Badge + Name + Level + Stats + Points
4. Read-Only — keine Aktionen

## 5. Fehlermeldungen
| Meldung | Zeile |
|---------|-------|
| „Noch keine Daten. Erstelle Content um auf dem Leaderboard zu erscheinen!" | 138 |

## 11. Technische Referenz
- **tRPC:** `leaderboard.rankings` (25), `leaderboard.myStats` (26)
# Team-Aktivitäten

> **Route:** `/team-activity` | **Frontend:** `TeamActivityPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Activity-Stream: was macht das Team gerade? Gruppiert nach Datum mit Icon, Action-Label, Beschreibung und Zeitstempel.
**Beleg:** Sidebar `"Was macht das Team gerade?"` — `DashboardLayout.tsx:100`

## 4. User-Flow
1. Activity-Stream lesen — gruppiert nach Datum
2. Pro Eintrag: Icon + Action + Description + Time
3. Read-Only

## 5. Fehlermeldungen
| Meldung | Zeile |
|---------|-------|
| „Noch keine Aktivitäten" | 90 |

## 11. Technische Referenz
- **tRPC:** `teamActivity.list` (42)
# Einladungen

> **Route:** `/invite-tokens` | **Frontend:** `InviteTokensPage.tsx` | **Status:** ✅ Aktiv (nur Admin)

## 1. Kurzbeschreibung
Magic-Login-Links für neue Partner generieren und versenden. 3 Stat-Cards (Aktive, Eingelöst, Abgelaufen) + Token-Management.
**Beleg:** Sidebar `"Neue Partner ins Team einladen"` — `DashboardLayout.tsx:101`

## 4. User-Flow
1. **„+ Neuen Link erstellen"** (`Zeile 93`)
2. Dialog: Name, Partnernummer, WhatsApp-Nummer, Gültigkeitstage eingeben
3. Link wird erstellt und in Zwischenablage kopiert
4. **„WhatsApp"** (`Zeile 213`) — Link direkt per WhatsApp senden
5. **„Kopieren"** (`Zeile 210`) — Link nochmal kopieren
6. **„Löschen"** (`Zeile 220`) — Token deaktivieren
7. Listen: Aktive Tokens / Eingelöste Tokens

## 5. Fehlermeldungen
| Meldung | Zeile |
|---------|-------|
| „Einladungs-Link erstellt! Link in Zwischenablage kopiert!" | 29, 38 |
| „Einladungs-Link kopiert!" | 53 |
| „Token gelöscht" | 45 |

## 11. Technische Referenz
- **tRPC:** `inviteTokens.list` (25), `inviteTokens.create` (27), `inviteTokens.delete` (43)
# Team

> **Route:** `/team` | **Frontend:** `TeamPage.tsx` | **Status:** ✅ Aktiv (nur Admin)

## 1. Kurzbeschreibung
Alle Partner verwalten: freischalten, sperren, Rollen ändern. 4 Stat-Cards (Total, Freigeschaltet, Warten, Admins).
**Beleg:** Sidebar `"Alle Partner verwalten"` — `DashboardLayout.tsx:102`

## 4. User-Flow
1. 4 Stat-Cards: Total / Freigeschaltet / Warten / Admins
2. Team-Member-Liste mit Avatar + Badges + Buttons
3. **„Freischalten"** (`Zeile 204`) — Partner Zugang geben
4. **„Zu Admin/User"** (`Zeile 220`) — Rolle wechseln
5. **„Sperren"** (`Zeile 233`) — Zugang entziehen

## 5. Fehlermeldungen
| Meldung | Zeile |
|---------|-------|
| „Rolle aktualisiert!" | 33 |
| „Partner freigeschaltet!" | 40 |
| „Zugang gesperrt." | 49 |

## 11. Technische Referenz
- **tRPC:** `team.list` (25), `team.updateRole` (32), `team.approvePartner` (37), `team.revokePartner` (48)
# Nutzer-Übersicht (Admin)

> **Route:** `/admin-users` | **Frontend:** `AdminUsersPage.tsx` | **Status:** ✅ Aktiv (nur Admin)

## 1. Kurzbeschreibung
Admin-Ansicht aller Nutzer mit Rollen, Blotato-Status und Mini-Stats. Partner freischalten oder sperren.
**Beleg:** Sidebar `"Admin: Zugänge & Rollen"` — `DashboardLayout.tsx:103`

## 4. User-Flow
1. 4 Stat-Cards: Total / Freigeschaltet / Admins / Blotato-verbunden
2. Suchfeld für Nutzer
3. User-Liste: Avatar + Badges + Info + Mini-Stats + Actions
4. **„Freischalten"** (`Zeile 221`) / **„Sperren"** (`Zeile 237`)
5. **„Test-Benachrichtigung"** (`Zeile 68`) — Benachrichtigungs-Test

## 11. Technische Referenz
- **tRPC:** `adminUsers.overview` (17), `notifications.test` (18), `team.approvePartner` (22), `team.revokePartner` (26)
# Kosten-Übersicht (Budget)

> **Route:** `/budget` | **Frontend:** `BudgetPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Zeigt KI-Kosten pro Monat: Bilder-Generierungen, Video-Generierungen, Budget-Limit und Verbrauch pro Partner.
**Beleg:** Sidebar `"Was kostet das Tool pro Monat?"` — `DashboardLayout.tsx:104`

## 4. User-Flow
1. **4 Stat-Cards:** Ausgegeben / Limit / Bilder / Videos
2. **Progress-Bar** — wie viel vom Budget ist verbraucht
3. **My Usage:** 2 Fortschrittsbalken (Bilder + Videos)
4. **Admin:** Partner-Verbrauch-Tabelle
5. **Cost-Info:** Preise pro Generierung
6. Read-Only

## Kosten (Kurzreferenz)
| Was | Kosten | Wer zahlt |
|-----|--------|-----------|
| sozialmedia.best Zugang | kostenlos | Mathias |
| KI-Bild (Nano Banana Pro) | ca. 0,15 €/Bild | Mathias |
| KI-Video (fal.ai) | variabel | Mathias |
| Lina Avatar Videos (HeyGen) | pro Video | Mathias |
| Blotato (Auto-Posten) | ca. 25 €/Monat | Partner |

## 5. Fehlermeldungen
| Meldung | Zeile |
|---------|-------|
| „Noch keine Generierungen diesen Monat." | 193 |

## 11. Technische Referenz
- **tRPC:** `budget.status` (22), `budget.myUsage` (23), `budget.allPartnerUsage` (24)
