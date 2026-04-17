# Lifestyle-Engine

> **Route:** `/lifestyle` | **Frontend:** `LifestylePage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Emotionaler Content für Traumauto, Freiheit, Erfolg, Business. Zieht neue Partner an — kein direktes Produktmarketing.
**Beleg:** Sidebar `"Traumauto, Freiheit & Erfolg als Content"` — `DashboardLayout.tsx:60`

## 2. Wann einsetzen
- Emotionale Posts, die Lifestyle zeigen statt Produkte verkaufen
- Traumauto, Mallorca, finanzielle Freiheit, ortsunabhängiges Arbeiten
- Batch-Generierung: mehrere Lifestyle-Posts auf einmal

## 3. Wann NICHT einsetzen
- **Produkt-Post?** → Content Wizard (`/wizard`)
- **7 Plattform-Varianten?** → Remix 1→7 (`/remix7`)

## 4. User-Flow
1. **Kategorie** wählen (Traumauto, Freiheit, Erfolg, Business, `Zeile 42`)
2. **Thema** eingeben (`Zeile 43`), **Plattform** (`Zeile 44`), **Stimmung** (`Zeile 45`)
3. Klick auf **„Lifestyle-Content generieren"** (`Zeile 235`)
4. Oder Batch: **„X Lifestyle-Posts generieren"** (`Zeile 303`, Count `Zeile 50`)
5. Post + Bild werden generiert → landen automatisch in Freigabe-Queue

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Bitte Kategorie auswählen" | Kategorie anklicken | 76 |
| „Lifestyle-Content generiert!" | Erfolg | 61 |
| „X Lifestyle-Posts generiert!" | Batch-Erfolg | 70 |

## 6. Nach Submit → `/approval` (automatisch, `Zeile 84`)

## 11. Technische Referenz
- **tRPC:** `lifestyle.generate` (56), `lifestyle.generateBatch` (66)
- **DB:** `contentPosts` (autoCreatePost: true)
