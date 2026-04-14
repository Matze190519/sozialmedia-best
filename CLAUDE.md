# CLAUDE.md — Regeln & Kontext für alle KI-Sessions

> Diese Datei liest Claude Code (und jede andere KI-Coding-Umgebung) **automatisch** beim Start.
> Sie ist der **Schutzschild** für das Live-System. Alle Regeln hier sind verbindlich — für Claude Code, Manus AI, Cursor, oder wen auch immer.

---

## 🚨 WICHTIGSTE REGEL

**Dieses System ist LIVE in Produktion und wird von echten LR-Partnern genutzt.**
Jede Änderung, die das Live-System brechen könnte, ist ein reales Problem für echte Menschen.

**Im Zweifel: FRAGEN statt ÄNDERN.**

---

## 1. Projekt-Kontext

- **Name:** `lr-approval-dashboard` (intern: "sozialmedia-best")
- **Zweck:** Social-Media-Management-System für LR-Partner mit KI-Content-Generierung, Multi-Plattform-Publishing und Team-Approval-Workflow
- **Status:** Produktiv, live, aktive Nutzer
- **Repo:** `matze190519/sozialmedia-best`
- **Default-Entwicklungsbranch:** Immer auf einem `claude/*`- oder `dev/*`-Branch arbeiten — **niemals direkt auf `main`**

---

## 2. Tech-Stack (nicht ohne Rücksprache ändern)

- **Frontend:** React 19.2 + Vite 7 + TailwindCSS 4 + Radix UI
- **Backend:** Express 4.21 + tRPC 11 (end-to-end TypeScript)
- **DB:** MySQL via Drizzle ORM (`drizzle/` enthält Schema + Migrations)
- **Auth:** Jose JWT + Magic Login Links
- **KI:** fal.ai (Nano Banana Pro für Bilder, Veo 3.1 + Kling 3.0 für Videos)
- **Publishing:** Blotato API (9 Plattformen)
- **Bot-Bridge:** Botpress/Lina-Integration (`/api/lina/*`)
- **Package Manager:** **pnpm** (nicht npm, nicht yarn)
- **Node-Version:** Was `package.json` vorgibt

---

## 3. Goldene Regeln (DO / DON'T)

### ✅ DO
- **Vor jeder Änderung lesen**, was existiert. Nie blind ergänzen.
- **Feature Flags** für alles Neue verwenden — im Zweifel per simplem `if (FEATURE_X_ENABLED)`.
- **Tests schreiben** für neuen Code (Vitest läuft im Repo).
- **Kleine, isolierte Commits** — 1 Commit = 1 logische Änderung.
- **Deutschsprachige UI-Texte** prüfen — das System ist für deutsche LR-Partner.
- **Drizzle-Migrations** nur mit Rollback-Plan.
- **Nach Push** immer einen **Draft-PR** erstellen — nie direkt nach `main` mergen.

### ❌ DON'T
- **Niemals** auf `main` pushen. Niemals.
- **Niemals** `--no-verify`, `--force`, `reset --hard` ohne explizite Freigabe.
- **Niemals** `.env`, API-Keys, Credentials committen.
- **Niemals** Migrationen auf Live-DB ohne Staging-Test.
- **Niemals** bestehende Features ohne Rücksprache "refactoren" oder "verbessern".
- **Niemals** Package-Manager wechseln (pnpm bleibt pnpm).
- **Niemals** Blotato-API-Keys oder fal.ai-Keys im Frontend verwenden.
- **Niemals** Dependencies großflächig updaten ohne Test.
- **Niemals** Auto-Post-Logik oder Approval-Workflow anfassen ohne expliziten Auftrag.

---

## 4. Die 5 Fragen vor jedem Merge nach `main`

Jede Änderung muss **alle 5** mit "Ja" beantworten können:

1. **Feature Flag?** — ist der neue Code per Toggle abschaltbar?
2. **Test?** — gibt es einen automatischen Test?
3. **Rollback?** — kann in < 5 Min zurückgerollt werden?
4. **Monitoring?** — sehen wir Fehler in Sentry/Logs?
5. **Staging-Run?** — lief es 48h auf Staging ohne Issues?

Wenn **eine** Antwort "Nein" ist → **nicht mergen**.

---

## 5. Git-Workflow

```
main (= live, geschützt)
 ├── staging (= Vorproduktion, optional)
 └── claude/<feature>  oder  dev/<feature>
```

- **Arbeits-Branch:** Immer neuer Branch pro Task, Namensschema `claude/<kurze-beschreibung>` oder `dev/<beschreibung>`.
- **Push:** `git push -u origin <branch>`
- **PR:** Immer als **Draft-PR** eröffnen. Mensch merged, nicht die KI.
- **Commit-Stil:** Klar und auf Deutsch ODER Englisch — konsistent pro Commit. Erste Zeile ≤ 72 Zeichen.
- **Niemals `git add .` oder `git add -A` blind** — einzelne Dateien benennen, damit keine Secrets reinrutschen.

---

## 6. Risiko-Klassifizierung

Bevor eine KI etwas ändert, muss sie den Risiko-Level erkennen:

| Level | Beispiel | Vorgehen |
|-------|----------|----------|
| 🟢 **Grün** | Neue isolierte Page, Text-Änderung, Dokumentation | Direkt im Branch, PR als Draft |
| 🟡 **Gelb** | Neue tRPC-Route, neue DB-Tabelle, UI-Refactor | Feature Flag + Test + Staging-Run |
| 🔴 **Rot** | Änderung an Auth, Approval-Workflow, Blotato-Publishing, Drizzle-Migration auf bestehenden Tabellen, Auto-Post | **User fragen** bevor irgendwas geändert wird |

**Im Zweifel immer als 🔴 behandeln.**

---

## 7. Verbotene Zonen (ohne explizite Erlaubnis nicht anfassen)

- `server/_core/` — Core-Server-Setup
- `server/auth/` (falls vorhanden) — Authentifizierung
- `drizzle/` Migrations auf existierenden Tabellen (neue Tabellen OK)
- `.env*`, `*.key`, `*.pem`
- Alles rund um **Auto-Post**, **Approval-Workflow**, **Blotato-Publishing**
- Lina-API-Endpunkte (`/api/lina/*`) — Breaking Change würde WhatsApp-Bot killen
- Payment/Invoice-Logik falls vorhanden

---

## 8. Häufige Kommandos

```bash
# Entwicklung
pnpm install                  # Dependencies
pnpm dev                      # Dev-Server starten
pnpm test                     # Tests laufen lassen
pnpm check                    # TypeScript-Check
pnpm format                   # Prettier

# Datenbank
pnpm db:push                  # Drizzle Generate + Migrate (VORSICHT bei Live-DB!)

# Build
pnpm build                    # Production-Build
pnpm start                    # Production-Server
```

**Nie `pnpm db:push` gegen Live-DB ohne Backup + Freigabe.**

---

## 9. Code-Konventionen

- **TypeScript strict** — keine `any`, keine `@ts-ignore` ohne Kommentar warum
- **Keine Emojis im Code** außer in UI-Strings, wenn User es wünscht
- **Keine spekulativen Abstraktionen** — lieber 3x ähnlicher Code als eine falsche Abstraktion
- **Keine unnötigen Kommentare** — Code soll sich selbst erklären
- **Keine neuen Dokumentations-Dateien** (`*.md`, READMEs) ohne expliziten Auftrag
- **Radix UI + shadcn-Stil** für neue Komponenten — nicht selbst Styles erfinden
- **tRPC statt REST** für neue Backend-Routen — außer bei externen Integrationen
- **Zod-Schemas** für alle Inputs

---

## 10. Wichtige Projekt-Dateien

- `AUDIT.md` — Feature-Audit (29/29 abgehakt)
- `BLUEPRINT_STATUS.md` — Feature-Roadmap
- `UI_STATUS.md` — UI-Screenshots-Status
- `WIZARD_INVESTIGATION.md` — Bekannter Mobile-Bug im Content Wizard
- `LINA_API_DOCS.md` — API-Doku für Botpress-Bridge
- `todo.md` — Aktueller Stand / Backlog
- `drizzle/` — DB-Schema (18 Tabellen)

**Bei Unklarheit über eine Komponente:** Erst diese Dateien lesen, dann fragen.

---

## 11. Bekannte Baustellen (Stand: April 2026)

- 🐞 Mobile-Bug im Content Wizard ("Load failed" x2) — siehe `WIZARD_INVESTIGATION.md`
- 🔧 Kanban-Board gebaut, aber nicht in Sidebar aktiviert
- 🔧 Team-Leaderboard gebaut, aber nicht freigeschaltet
- 🔧 Kein Sentry/PostHog — Monitoring fehlt
- 🔧 Keine Staging-Umgebung
- 🔧 Kein Redis/BullMQ — Video-Jobs laufen synchron
- 🔧 Keine WebSockets — alles Polling
- 🔧 Medien (R2/S3) nur teilweise persistiert

---

## 12. Eskalations-Regel für KI-Sessions

**Wenn eine dieser Situationen auftritt → SOFORT STOPPEN und User fragen:**

1. Ein Test schlägt fehl und du weißt nicht warum
2. Eine Migration würde bestehende Daten verändern
3. Ein Feature, das du ändern sollst, hat keine Tests
4. Der User hat etwas unklar formuliert und du müsstest raten
5. Es würde eine 🔴-Rote-Zone anfassen (siehe Abschnitt 6+7)
6. Der Umfang wächst über das hinaus, was ursprünglich beauftragt war

**Niemals "kreativ" sein. Niemals "nebenbei" verbessern. Scope halten.**

---

## 13. Kommunikation mit dem User

- **Deutsch** ist die Standard-Sprache (technische Begriffe englisch OK)
- **Kurz und präzise** — keine Roman-lange Antworten
- **Schritt-für-Schritt** bei Anleitungen
- **Immer transparent** was geändert wurde + warum
- **Immer** nach Push: Link zum PR geben
- **Nie Fortschritt behaupten**, der nicht tatsächlich verifiziert wurde
