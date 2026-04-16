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
