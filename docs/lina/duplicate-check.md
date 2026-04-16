# Duplicate Check

> **Route:** `/duplicate-check` | **Frontend:** `DuplicateCheckPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Verhindert, dass alle denselben Text posten. Prüft deinen Content gegen bestehende Posts im Team.
**Beleg:** Sidebar `"Verhindert dass alle denselben Text posten"` — `DashboardLayout.tsx:59`

## 2. Wann einsetzen
- Vor dem Posten prüfen, ob ein ähnlicher Text schon existiert
- Nach dem Kopieren aus der Bibliothek — ist der Text noch einzigartig?

## 3. Wann NICHT einsetzen
- **Compliance prüfen?** → Compliance Shield (`/compliance`)
- **Viral-Score prüfen?** → Viral Predictor (`/viral-predictor`)

## 4. User-Flow
1. Text eingeben (min. 20 Zeichen, `Zeile 92`)
2. Klick auf **„Jetzt prüfen"** (`Zeile 108`)
3. Ergebnis: ✅ „Kein Duplikat gefunden!" oder ⚠️ „Ähnlicher Content gefunden!" mit Similarity-Score
4. **„Neuen Text prüfen"** (`Zeile 202`)

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Bitte mindestens 20 Zeichen eingeben!" | Mehr Text eingeben | 44 |
| „Fehler beim Prüfen" | Seite neu laden | 39 |
| „✅ Kein Duplikat gefunden!" | Alles gut — posten | 36 |
| „⚠️ Ähnlicher Content gefunden!" | Text umschreiben | 34 |

## 11. Technische Referenz
- **tRPC:** `duplicateCheck.check` (25)
