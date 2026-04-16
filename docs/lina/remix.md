# Content Remix

> **Route:** `/remix` | **Frontend:** `ContentRemixPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
1 Thema → 5 verschiedene Formate (Post, Reel, Story, Hooks, Ad Copy). Schneller als Remix 1→7 — für die 5 Basis-Formate.
**Beleg:** Sidebar `"1 Thema → 5 verschiedene Formate"` — `DashboardLayout.tsx:63`

## 2. Wann einsetzen
- Schnell 5 verschiedene Content-Formate aus einem Thema
- Post + Reel + Story + Hooks + Ad Copy gleichzeitig

## 3. Wann NICHT einsetzen
- **7 Formate inkl. ASMR?** → Remix 1→7 (`/remix7`)
- **Nur 1 Post?** → Content Wizard (`/wizard`)

## 4. User-Flow
1. **Thema** eingeben (`Zeile 73`), optional **Pillar** (`Zeile 74`)
2. Klick auf **„5x Remix starten"** (`Zeile 192`)
3. 5 Varianten werden progressiv angezeigt (Post, Reel, Story, Hooks, Ad Copy)
4. **„Alle kopieren"** (`Zeile 317`) oder einzeln kopieren
5. **„Neues Thema remixen"** (`Zeile 298`)

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Bitte gib ein Thema ein!" | Thema eingeben | 83 |
| „X Content-Formate generiert!" | Erfolg | 117 |
| „Alle 5 Formate kopiert!" | Erfolg | 312 |

## 11. Technische Referenz
- **tRPC:** `content.generate` (79) — wird 5x aufgerufen (Zeile 94)
