# Nutzer-Übersicht (Admin)

> **Route:** `/admin-users` | **Frontend:** `AdminUsersPage.tsx` | **Status:** ✅ Aktiv (nur Admin)

## 1. Kurzbeschreibung
Admin-Ansicht aller Nutzer mit Rollen, Blotato-Status und Mini-Stats. Partner freischalten oder sperren.
**Beleg:** Sidebar `"Admin: Zugänge & Rollen"` — `DashboardLayout.tsx:103`

## 4. User-Flow
1. 4 Stat-Cards: Total / Freigeschaltet / Admins / Blotato-verbunden
2. Suchfeld für Nutzer
3. User-Liste: Avatar + Badges + Info + Mini-Stats + Actions
4. **„Freischalten"** (`Zeile 221`) / **„Sperren"** (`Zeile 237`)
5. **„Test-Benachrichtigung"** (`Zeile 68`) — Benachrichtigungs-Test

## 11. Technische Referenz
- **tRPC:** `adminUsers.overview` (17), `notifications.test` (18), `team.approvePartner` (22), `team.revokePartner` (26)
