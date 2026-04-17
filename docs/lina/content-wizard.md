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
