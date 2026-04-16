# Einstellungen

> **Route:** `/settings` | **Frontend:** `SettingsPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Zentrale Einstellungsseite: Blotato API-Key, Auto-Post Toggle, Posting-Zeiten pro Plattform und persönliches Branding (Signatur, Hashtags, Vorstellung, CTA).
**Beleg:** Sidebar `"Blotato verbinden & Branding"` — `DashboardLayout.tsx:105`

## 2. Bereiche

### Blotato API Key
- **Input:** API-Key einfügen (Format: `blt_XXXXX…`)
- **„Key speichern"** (`Zeile 200`)
- **„Key entfernen"** (`Zeile 203`)
- Grüner Haken = Key hinterlegt

### Auto-Post
- **Toggle:** Auto-Post nach Freigabe an/aus (`Zeile 240`)
- An = Post geht sofort raus nach Freigabe via Blotato
- Aus = Status auf „Freigegeben", manuell kopieren

### Posting-Zeiten
- **7 Plattform-Inputs:** Instagram, TikTok, Facebook, LinkedIn, X, Threads, YouTube
- **„Optimale Zeiten übernehmen"** (`Zeile 279`) — setzt Empfehlungen aus /posting-times
- **„Zeiten speichern"** (`Zeile 344`)

### Persönliches Branding (PFLICHT für KI-Personalisierung)
- **Signatur** — dein Abschluss-Text
- **Hashtags** — deine Standard-Tags
- **Vorstellung** — wer bist du?
- **CTA** — dein Call-to-Action
- **„Branding speichern"** (`Zeile 392`)

## 5. Fehlermeldungen
| Meldung | Zeile |
|---------|-------|
| „Blotato API Key gespeichert" | 97 |
| „Blotato API Key entfernt" | 102 |
| „Auto-Post aktiviert/deaktiviert" | 106 |
| „Posting-Zeiten gespeichert" | 110 |
| „Persönliches Branding gespeichert" | 114 |

## 8. FAQ
**F:** Was muss ich für die KI-Personalisierung ausfüllen?
**A:** Vorstellung + CTA + Signatur + Hashtags. Ohne diese Felder kann „✨ KI automatisch anpassen" in der Bibliothek nicht funktionieren.

**F:** Wie aktiviere ich Auto-Post?
**A:** Toggle „Auto-Post nach Freigabe" auf grün stellen. Voraussetzung: Blotato-Key ist hinterlegt.

## 11. Technische Referenz
- **tRPC:** `userSettings.get` (68), `userSettings.saveBlotatoKey` (96), `userSettings.removeBlotatoKey` (101), `userSettings.toggleAutoPost` (105), `userSettings.savePostingTimes` (109), `userSettings.savePersonalBranding` (113)
