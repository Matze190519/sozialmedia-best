# Einladungen

> **Route:** `/invite-tokens` | **Frontend:** `InviteTokensPage.tsx` | **Status:** ✅ Aktiv (nur Admin)

## 1. Kurzbeschreibung
Magic-Login-Links für neue Partner generieren und versenden. 3 Stat-Cards (Aktive, Eingelöst, Abgelaufen) + Token-Management.
**Beleg:** Sidebar `"Neue Partner ins Team einladen"` — `DashboardLayout.tsx:101`

## 4. User-Flow
1. **„+ Neuen Link erstellen"** (`Zeile 93`)
2. Dialog: Name, Partnernummer, WhatsApp-Nummer, Gültigkeitstage eingeben
3. Link wird erstellt und in Zwischenablage kopiert
4. **„WhatsApp"** (`Zeile 213`) — Link direkt per WhatsApp senden
5. **„Kopieren"** (`Zeile 210`) — Link nochmal kopieren
6. **„Löschen"** (`Zeile 220`) — Token deaktivieren
7. Listen: Aktive Tokens / Eingelöste Tokens

## 5. Fehlermeldungen
| Meldung | Zeile |
|---------|-------|
| „Einladungs-Link erstellt! Link in Zwischenablage kopiert!" | 29, 38 |
| „Einladungs-Link kopiert!" | 53 |
| „Token gelöscht" | 45 |

## 11. Technische Referenz
- **tRPC:** `inviteTokens.list` (25), `inviteTokens.create` (27), `inviteTokens.delete` (43)
