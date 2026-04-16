# Kosten-Übersicht (Budget)

> **Route:** `/budget` | **Frontend:** `BudgetPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Zeigt KI-Kosten pro Monat: Bilder-Generierungen, Video-Generierungen, Budget-Limit und Verbrauch pro Partner.
**Beleg:** Sidebar `"Was kostet das Tool pro Monat?"` — `DashboardLayout.tsx:104`

## 4. User-Flow
1. **4 Stat-Cards:** Ausgegeben / Limit / Bilder / Videos
2. **Progress-Bar** — wie viel vom Budget ist verbraucht
3. **My Usage:** 2 Fortschrittsbalken (Bilder + Videos)
4. **Admin:** Partner-Verbrauch-Tabelle
5. **Cost-Info:** Preise pro Generierung
6. Read-Only

## Kosten (Kurzreferenz)
| Was | Kosten | Wer zahlt |
|-----|--------|-----------|
| sozialmedia.best Zugang | kostenlos | Mathias |
| KI-Bild (Nano Banana Pro) | ca. 0,15 €/Bild | Mathias |
| KI-Video (fal.ai) | variabel | Mathias |
| Lina Avatar Videos (HeyGen) | pro Video | Mathias |
| Blotato (Auto-Posten) | ca. 25 €/Monat | Partner |

## 5. Fehlermeldungen
| Meldung | Zeile |
|---------|-------|
| „Noch keine Generierungen diesen Monat." | 193 |

## 11. Technische Referenz
- **tRPC:** `budget.status` (22), `budget.myUsage` (23), `budget.allPartnerUsage` (24)
