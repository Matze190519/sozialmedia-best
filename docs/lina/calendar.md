# Kalender

> **Route:** `/calendar` | **Frontend:** `CalendarPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Wochenansicht aller geplanten Posts. Tabs für Blotato- und Dashboard-Posts. Posts bearbeiten, verschieben oder löschen.
**Beleg:** Sidebar `"Wann wird was gepostet?"` — `DashboardLayout.tsx:77`

## 2. Wann einsetzen
- Geplante Posts im Überblick sehen
- Posts zeitlich verschieben
- Posts bearbeiten oder löschen

## 4. User-Flow
1. **Tabs:** Blotato-Kalender (nach Datum) / Dashboard-Posts (Wochenansicht)
2. Post anklicken → Dialog mit Details
3. **„Verschieben"** (`Zeile 315`) — neuen Zeitpunkt wählen
4. **„Löschen"** (`Zeile 327`)
5. **„Speichern"** (`Zeile 378`) — Änderungen übernehmen
6. **„Aktualisieren"** (`Zeile 229`) — Daten neu laden

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Post gelöscht" | Erfolg | 174 |
| „Post verschoben" | Erfolg | 185 |
| „Post aktualisiert" | Erfolg | 197 |

## 11. Technische Referenz
- **tRPC:** `calendar.byDate` (170), `calendar.delete` (172), `calendar.reschedule` (183), `calendar.update` (196), `content.list` (78)
