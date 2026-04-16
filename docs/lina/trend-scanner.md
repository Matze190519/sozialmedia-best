# Trend-Scanner

> **Route:** `/trends` | **Frontend:** `TrendScannerPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Scannt TikTok, YouTube und Reddit nach viralen Trends. Viral Score 0–100. Mit 1-Klick zum fertigen Post aus dem Trend.
**Beleg:** Sidebar `"Was ist gerade viral? Jetzt nutzen!"` — `DashboardLayout.tsx:69`

## 2. Wann einsetzen
- Aktuelle virale Trends finden und sofort Content daraus machen
- Pillar-basiert scannen (z.B. nur Lifestyle-Trends)
- Autopilot: Trend → Content + Bild + Video + Hashtags → Freigabe in einem Schritt

## 4. User-Flow
1. **Tabs:** Top Trends / Alle Scans
2. **Platform-Filter:** TikTok, YouTube, Reddit
3. **Pillar-Filter** oder Quick-Scan Pillar-Cards (`Zeile 117–131`)
4. Klick auf **„Jetzt scannen"** (`Zeile 110`)
5. Trends mit Viral Score werden angezeigt
6. **„KI-Ideen generieren"** (`Zeile 102`) — Content-Ideen aus Trend
7. **„Autopilot"** (`Zeile 367`) — kompletter Flow: Trend → Post + Bild/Video + Hashtags → Freigabe
8. **„Content erstellen"** (`Zeile 180`) — manuell Post aus Trend bauen

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Scan fehlgeschlagen" | Nochmal versuchen | 62 |
| „Pillar-Scan fehlgeschlagen" | Nochmal versuchen | 71 |
| „X Trends gescannt!" | Erfolg | 58 |
| „Autopilot: Content erstellt! Post #X wartet auf Freigabe." | Erfolg → /approval | 263 |

## 11. Technische Referenz
- **tRPC:** `trends.top` (53), `trends.latest` (54), `trends.scan` (56), `trends.scanPillar` (65), `trends.generateIdeas` (74), `trends.autopilot` (256)
- **Nach Autopilot:** → `/approval` (Zeile 264)
