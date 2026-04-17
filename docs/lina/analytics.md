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
