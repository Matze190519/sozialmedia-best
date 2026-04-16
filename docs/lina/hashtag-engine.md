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
