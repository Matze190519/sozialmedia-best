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
