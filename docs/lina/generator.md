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
