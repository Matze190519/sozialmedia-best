# Evergreen

> **Route:** `/evergreen` | **Frontend:** `EvergreenPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Deine besten Posts werden nach einstellbaren Wochen automatisch wieder gepostet — mit leichten KI-Variationen. Passiv-Reichweite ohne Aufwand.
**Beleg:** Sidebar `"Deine besten Posts nochmal posten"` — `DashboardLayout.tsx:91`

## 4. User-Flow
1. **3 Tabs:** Fällig / Pool / Kandidaten
2. **Fällig:** Posts, die jetzt wieder gepostet werden können → **„Jetzt recyclen"** (`Zeile 93`)
3. **Pool:** Alle Evergreen-Posts mit Recycling-Intervall und Max-Recyclings
4. **Kandidaten:** Top-Posts mit Score-Badge → **„+ Hinzufügen"** (`Zeile 238`)
5. Entfernen: Trash-Icon (`Zeile 146`)

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Post zum Evergreen-Pool hinzugefügt!" | Erfolg | 21 |
| „Post recycled! (Recycling #X)" | Erfolg — Post ist wieder in Queue | 29 |
| „Aus Evergreen-Pool entfernt" | Erfolg | 38 |

## 11. Technische Referenz
- **tRPC:** `evergreen.list` (15), `evergreen.due` (16), `evergreen.candidates` (17), `evergreen.add` (19), `evergreen.recycle` (27), `evergreen.remove` (36)
