# Analytics+

> **Route:** `/analytics-plus` | **Frontend:** `AnalyticsPlusPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Tiefe Analyse: Content-Mix Pie-Chart, Content-Typ Bar-Chart, 7×24 Posting-Heatmap, Weekly Trend Line-Chart, Top-5 Performer.
**Beleg:** Sidebar `"Tiefe Analyse: Heatmap & Trends"` — `DashboardLayout.tsx:90`

## 4. User-Flow
1. **Pie-Chart:** Content nach Pillar (Verteilung)
2. **Bar-Chart:** Content nach Typ (Post, Reel, Story etc.)
3. **Heatmap:** 7 Tage × 24 Stunden — wann postest du am meisten?
4. **Line-Chart:** Wöchentlicher Trend
5. **Top-5 Performer:** Beste Posts nach Score
6. Alles Read-Only

## 5. Fehlermeldungen
| Meldung | Zeile |
|---------|-------|
| „Noch keine Daten" | 115 |
| „Noch keine bewerteten Posts" | 282 |

## 11. Technische Referenz
- **tRPC:** `analyticsPlus.contentMix` (20), `analyticsPlus.heatmap` (21), `analyticsPlus.weeklyTrend` (22), `analyticsPlus.bestPerformers` (23)
