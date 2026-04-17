# Team

> **Route:** `/team` | **Frontend:** `TeamPage.tsx` | **Status:** ✅ Aktiv (nur Admin)

## 1. Kurzbeschreibung
Alle Partner verwalten: freischalten, sperren, Rollen ändern. 4 Stat-Cards (Total, Freigeschaltet, Warten, Admins).
**Beleg:** Sidebar `"Alle Partner verwalten"` — `DashboardLayout.tsx:102`

## 4. User-Flow
1. 4 Stat-Cards: Total / Freigeschaltet / Warten / Admins
2. Team-Member-Liste mit Avatar + Badges + Buttons
3. **„Freischalten"** (`Zeile 204`) — Partner Zugang geben
4. **„Zu Admin/User"** (`Zeile 220`) — Rolle wechseln
5. **„Sperren"** (`Zeile 233`) — Zugang entziehen

## 5. Fehlermeldungen
| Meldung | Zeile |
|---------|-------|
| „Rolle aktualisiert!" | 33 |
| „Partner freigeschaltet!" | 40 |
| „Zugang gesperrt." | 49 |

## 11. Technische Referenz
- **tRPC:** `team.list` (25), `team.updateRole` (32), `team.approvePartner` (37), `team.revokePartner` (48)
