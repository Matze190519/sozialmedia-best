# Posting-Zeiten

> **Route:** `/posting-times` | **Frontend:** `PostingTimesPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Optimale Posting-Zeiten pro Plattform — basierend auf Sprout Social, Hootsuite und Buffer 2026. Read-Only mit „Übernehmen"-Option.
**Beleg:** Sidebar `"Wann ist dein Publikum online?"` — `DashboardLayout.tsx:79`

## 2. Wann einsetzen
- Beste Zeiten fürs Posten nachschlagen
- Optimale Zeiten mit 1 Klick in Einstellungen übernehmen

## 4. User-Flow
1. **Tabs pro Plattform** (`Zeile 99–106`): Instagram, TikTok, Facebook, LinkedIn, X, Threads, YouTube
2. **Wochenplan** mit Zeitslots (`Zeile 122–148`)
3. **Top 3 Zeiten** pro Plattform (`Zeile 163`)
4. **Beste Tage** (`Zeile 188`)
5. **Zeiten zu vermeiden** (`Zeile 205`)
6. Button **„Optimale Zeiten übernehmen"** setzt die Werte in /settings

## Beste Zeiten (Kurzreferenz)
| Plattform | Beste Zeiten | Beste Tage |
|-----------|-------------|------------|
| Instagram | 07:00, 12:00, 18:00, 21:00 | Di, Mi, Fr |
| TikTok | 07:00, 10:00, 17:00, 21:00 | Di, Do, Fr |
| Facebook | 09:00, 13:00, 16:00 | Mo, Mi, Fr |
| LinkedIn | 08:00, 10:00, 12:00 | Di, Mi, Do |
| Twitter/X | 08:00, 12:00, 17:00 | Mo, Di, Mi |

## 11. Technische Referenz
- **tRPC:** `postingTimes.allSchedules` (35), `postingTimes.smartNextMulti` (39)
- **Read-Only:** Keine Mutations
