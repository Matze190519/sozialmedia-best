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
