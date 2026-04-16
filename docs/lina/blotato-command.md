# Blotato Command

> **Route:** `/blotato` | **Frontend:** `BlotatoCommandPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Blotato Command Center — zeigt verbundene Social-Media-Kanäle, geplante Posts und API-Status. Zentraler Ort für alles rund ums Publishing.
**Beleg:** Sidebar `"Auf 9 Kanäle gleichzeitig posten"` — `DashboardLayout.tsx:98`

## 2. Wann einsetzen
- Prüfen ob Blotato verbunden ist
- Verbundene Kanäle sehen (Instagram, TikTok, Facebook, LinkedIn, X, Threads, YouTube)
- Geplante Posts einsehen
- Quick-Actions: Content erstellen oder in Kalender schauen

## 4. User-Flow
1. **4 Status-Cards:** Connected (Kanäle), Scheduled (geplant), API (Status), Today (Posts heute)
2. **Platform-Grid:** Icon + Name + Username + Live-Badge + Scheduled-Count
3. **Nächste geplante Posts** — Preview
4. **Quick-Actions:** → Content Wizard, Generator, Kalender, Settings
5. **„Aktualisieren"** (`Zeile 100`) — Daten neu laden
6. **„Posten"** (`Zeile 229`) — direkt Publishing

## Blotato einrichten (Kurzanleitung)
1. Account erstellen: `sozialmedia.best/blotato-signup`
2. Social-Kanäle verbinden in `my.blotato.com`
3. API-Key kopieren (Einstellungen → API Access)
4. Key in `/settings` einfügen → grüner Haken

## 11. Technische Referenz
- **tRPC:** `apiHealth.blotatoAccounts` (37), `calendar.list` (38), `dashboard.stats` (39)
