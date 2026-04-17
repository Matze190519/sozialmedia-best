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
