# Freigabe (Approval)

> **Slug:** `approval`
> **Route:** `/approval`
> **Frontend:** `client/src/pages/ApprovalPage.tsx`
> **Status:** ✅ Aktiv in Sidebar

---

## 1. Kurzbeschreibung

Das Freigabe-Center. Hier prüfst du deine Posts, gibst sie frei oder lehnst sie ab. Nach Freigabe werden sie automatisch via Blotato veröffentlicht (wenn Auto-Post aktiv ist).

**Beleg:** Sidebar `"Posts prüfen, freigeben & posten"` — `DashboardLayout.tsx:48`

---

## 2. Wann einsetzen

1. **Erstellte Posts überprüfen** — vor dem Veröffentlichen
2. **Batch-Freigabe** — alle ausstehenden Posts auf einmal freigeben
3. **Posts ablehnen** — mit Kommentar, wenn Content nicht passt
4. **Direkt auf Blotato posten** — nach Freigabe sofort auf alle Kanäle
5. **Posts bearbeiten** — Text oder Bild ändern vor dem Freigeben

---

## 3. Wann NICHT einsetzen

- **Neuen Post erstellen?** → **Content Wizard** (`/wizard`) oder **Generator** (`/generator`)
- **Geplante Posts im Kalender sehen?** → **Kalender** (`/calendar`)
- **Post-Performance auswerten?** → **Analytics** (`/analytics`)

---

## 4. Schritt-für-Schritt User-Flow

1. Öffne **„Freigabe"** in der Sidebar oder direkt `/approval`
2. Du siehst alle deine **ausstehenden Posts** (Admin sieht zusätzlich Team-Posts)
3. Pro Post: **„Freigeben"** (`Zeile 229`), **„Ablehnen"** (`Zeile 237`), **„Bearbeiten"** (`Zeile 247`)
4. Optional: **„Auf Blotato veröffentlichen"** (`Zeile 302`) für sofortiges Publishing
5. Für Batch: **„Alle freigeben"** (`Zeile 152`)
6. Filter: **„Ohne Bild"** (`Zeile 158`) zum Filtern von Posts ohne Medien

**Wichtig:** Jeder Partner sieht NUR eigene Posts. Mathias sieht „Meine Posts" + Tab „Team-Übersicht".

---

## 5. Eingabefelder & Constraints

| Feld | Typ | Pflicht | Zeile |
|------|-----|---------|-------|
| Ablehn-Kommentar | Textarea | Nein | 90 |
| Geplanter Zeitpunkt | DateTime | Nein | 94 |
| Veröffentlichungs-Datum | DateTime | Nein | 96 |
| Auto-Publish Toggle | Switch | Nein | 93 |

---

## 6. Ausgaben & Ergebnisse

- **tRPC:** `approval.approve` (64), `approval.reject` (68), `approval.publish` (72), `content.edit` (76), `content.delete` (80)
- **Smart Posting:** `postingTimes.smartNextMulti` (102) — schlägt optimale Zeiten vor
- **DB:** `contentPosts` Status-Update, `approvalLogs` INSERT

---

## 7. Fehlermeldungen & Lösungen

| Fehlermeldung | Lösung | Zeile |
|---------------|--------|-------|
| „Post genehmigt!" | Erfolg — kein Problem | 65 |
| „Post abgelehnt" | Erfolg — Post ist zurückgewiesen | 68 |
| „Post auf Blotato geplant!" | Erfolg — Publishing läuft | 72 |
| „Content bearbeitet!" | Erfolg — Änderung gespeichert | 76 |
| „Du kannst nur deinen eigenen Content veröffentlichen." | Nur eigene Posts freigeben | routers.ts:657 |
| „Nur genehmigte Posts können veröffentlicht werden." | Post erst freigeben, dann posten | routers.ts:659 |

---

## 8. FAQ

**F:** Kann ich mehrere Posts gleichzeitig freigeben?
**A:** Ja — Button „Alle freigeben" für Batch-Freigabe aller ausstehenden Posts.

**F:** Was passiert nach der Freigabe?
**A:** Auto-Post an → sofort via Blotato auf alle Kanäle. Ohne Auto-Post → Status „Freigegeben", manuell kopieren.

**F:** Sehe ich fremde Posts?
**A:** Nein — jeder sieht nur eigene. Nur Mathias sieht alle im Tab „Team-Übersicht".

**F:** Post hat kein Bild?
**A:** Wird automatisch als „Entwurf" markiert. Neu generieren im Generator.

---

## 9. Verwandte Tools

- **Content Wizard** (`/wizard`) — Posts erstellen
- **Kalender** (`/calendar`) — geplante Posts sehen
- **Blotato Command** (`/blotato`) — Publishing-Status prüfen
- **Pipeline** (`/kanban`) — visuelle Kanban-Ansicht

---

## 10. Pitfalls & Known Issues

- ⚠️ Reel-Scripts können nicht direkt gepostet werden — Fehlermeldung weist darauf hin
- ⚠️ Posts ohne Bild erscheinen nicht in der Freigabe (automatisch „Entwurf")

---

## 11. Technische Referenz

- **Page:** `client/src/pages/ApprovalPage.tsx`
- **Sidebar:** `DashboardLayout.tsx:48`
- **tRPC:** `content.list` (61), `approval.approve` (64), `approval.reject` (68), `approval.publish` (72), `content.edit` (76), `content.delete` (80), `postingTimes.smartNextMulti` (102)
- **DB:** `contentPosts` (Status-Updates), `approvalLogs` (Audit-Trail)
- **APIs:** Blotato (Publishing), Brevo (E-Mail-Benachrichtigung)
