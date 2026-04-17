# A/B Tests

> **Route:** `/ab-test` | **Frontend:** `ABTestPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
2 Varianten eines Posts vergleichen. KI generiert beide Versionen, du bestimmst den Gewinner.
**Beleg:** Sidebar `"Welche Version performt besser?"` — `DashboardLayout.tsx:88`

## 4. User-Flow
1. **„+ Neuer Test"** (`Zeile 56`)
2. Test-Name, Plattform, Pillar, Thema eingeben
3. 2× Textarea: Variante A und Variante B
4. Klick auf **„Test starten"** (`Zeile 124`)
5. Beide Varianten landen in der Queue
6. Nach Ergebnissen: **„A gewinnt"** oder **„B gewinnt"** (`Zeile 206–212`)

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „A/B Test erstellt!" | Erfolg — beide Varianten in Queue | 32 |
| „Test abgeschlossen!" | Gewinner wurde festgelegt | 41 |

## 11. Technische Referenz
- **tRPC:** `abTest.list` (28), `abTest.create` (30), `abTest.complete` (40)
- **DB:** `abTestGroups` (Tabelle)
