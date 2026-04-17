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
