# Monatsplan

> **Route:** `/monthly-plan` | **Frontend:** `MonthlyPlanPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
30 Posts für den ganzen Monat auf Knopfdruck. KI erstellt einen Plan nach dem Agent-Brain-Wochenschema (Mo: Motivation, Di: Produkt, Mi: Erfolg, Do: Behind the Scenes, Fr: Lifestyle).
**Beleg:** Sidebar `"30 Posts für den ganzen Monat"` — `DashboardLayout.tsx:78`

## 2. Wann einsetzen
- Kompletten Monat im Voraus planen
- Content-Mix automatisch ausbalancieren (86% Lifestyle / 14% Produkt)
- Einzelne Posts aus dem Plan direkt erstellen

## 4. User-Flow
1. **Monat** wählen (`Zeile 97`, MONTHS-Array `Zeile 11`)
2. **Jahr** wählen (`Zeile 107`)
3. Klick auf **„Monatsplan generieren"** (`Zeile 121`)
4. Plan-Grid wird angezeigt: Pillar + Topic + Platform pro Tag
5. Pro Eintrag: **„Erstellen"** (`Zeile 210`) → Post wird erzeugt und in Freigabe geschickt

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Monatsplan erstellt: X Posts für Monat Jahr" | Erfolg | 29 |
| „Post erstellt und zur Freigabe geschickt!" | Erfolg → /approval | 38 |

## 11. Technische Referenz
- **tRPC:** `monthlyPlan.generate` (27), `monthlyPlan.list` (44), `monthlyPlan.get` (45), `monthlyPlan.createPostFromPlan` (36)
- **Nach Post-Erstellung:** → `/approval` (Zeile 39)
