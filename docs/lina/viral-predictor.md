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
