# Leaderboard

> **Route:** `/leaderboard` | **Frontend:** `LeaderboardPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Team-Ranking nach Post-Anzahl und Punkten. Gamification: Badges, Level, Punkte. Freundlicher Wettbewerb im Team.
**Beleg:** Sidebar `"Wer im Team postet am meisten?"` — `DashboardLayout.tsx:99`

## 4. User-Flow
1. **My Stats Card:** Badge + Level + Punkte + Posts + Published + Top Posts
2. **Level-Progress-Bar** — wie weit bis zum nächsten Level
3. **Rankings-Table:** Rank + Badge + Name + Level + Stats + Points
4. Read-Only — keine Aktionen

## 5. Fehlermeldungen
| Meldung | Zeile |
|---------|-------|
| „Noch keine Daten. Erstelle Content um auf dem Leaderboard zu erscheinen!" | 138 |

## 11. Technische Referenz
- **tRPC:** `leaderboard.rankings` (25), `leaderboard.myStats` (26)
