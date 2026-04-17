# Lina Wissensdatenbank — Tool-Index

> **Zweck:** Zentraler Einstiegspunkt für Linas Wissen über alle Tools der Plattform.
> Jedes Tool hat eine eigene Datei in `docs/lina/<tool-slug>.md` — mit **code-belegten** Angaben (Datei:Zeile).
>
> **Quelle der Wahrheit für aktive Tools:** `client/src/components/DashboardLayout.tsx` (Sidebar-Struktur).
> **Persona, Dialoge, Intent-Mapping:** siehe `_LEGACY_v3.md` (ursprüngliche KB, wird schrittweise migriert).

---

## Stand & Zählung

- **Pages im Repo:** 41 `.tsx`-Dateien unter `client/src/pages/` (inkl. `ComponentShowcase`, `JoinPage`, `NotFound` = System-Seiten, keine Tools).
- **Tool-Pages:** **38 aktive** in Sidebar + **0 nur-im-Code-gebaut** (Kanban und Leaderboard sind in der alten KB als aktiv beschrieben — muss am Code-Verhalten verifiziert werden).
- **Phantom-Tools aus alter KB:** 5 Tools aus `_LEGACY_v3.md` existieren **nicht** als eigene Page im Code — siehe Abschnitt „Klärungsbedarf" am Ende.

---

## Kategorisierung (gemäß Sidebar)

### 🎨 ERSTELLEN (5 Tools)

| # | Tool | Route | Slug | Datei | Doku-Status |
|---|------|-------|------|-------|-------------|
| 1 | Dashboard | `/` | `dashboard` | `client/src/pages/Home.tsx` | ⏳ offen |
| 2 | Content Wizard | `/wizard` | `content-wizard` | `client/src/pages/ContentWizardPage.tsx` | ⏳ offen (Pilot) |
| 3 | Schnell-Post (Generator) | `/generator` | `generator` | `client/src/pages/GeneratorPage.tsx` | ⏳ offen |
| 4 | Freigabe (Approval) | `/approval` | `approval` | `client/src/pages/ApprovalPage.tsx` | ⏳ offen |
| 5 | Bibliothek | `/library` | `library` | `client/src/pages/LibraryPage.tsx` | ⏳ offen |

### 🤖 KI-POWER (9 Tools)

| # | Tool | Route | Slug | Datei | Doku-Status |
|---|------|-------|------|-------|-------------|
| 6 | Viral Predictor | `/viral-predictor` | `viral-predictor` | `client/src/pages/ViralPredictorPage.tsx` | ⏳ offen |
| 7 | Compliance Shield | `/compliance` | `compliance-shield` | `client/src/pages/ComplianceShieldPage.tsx` | ⏳ offen |
| 8 | Remix 1→7 | `/remix7` | `remix-7` | `client/src/pages/ContentRemix7Page.tsx` | ⏳ offen |
| 9 | Lina Avatar | `/lina-avatar` | `lina-avatar` | `client/src/pages/LinaAvatarPage.tsx` | ⏳ offen |
| 10 | Duplicate Check | `/duplicate-check` | `duplicate-check` | `client/src/pages/DuplicateCheckPage.tsx` | ⏳ offen ❗ nicht in alter KB |
| 11 | Lifestyle-Engine | `/lifestyle` | `lifestyle-engine` | `client/src/pages/LifestylePage.tsx` | ⏳ offen |
| 12 | Karussell | `/carousel` | `carousel` | `client/src/pages/CarouselPage.tsx` | ⏳ offen |
| 13 | Pipeline (Kanban) | `/kanban` | `kanban` | `client/src/pages/KanbanPage.tsx` | ⏳ offen — *TODO (Matze verifizieren): laut CLAUDE.md nicht in Sidebar, laut alter KB aktiv* |
| 14 | Content Remix | `/remix` | `remix` | `client/src/pages/ContentRemixPage.tsx` | ⏳ offen ❗ nicht in alter KB (zusätzlich zu Remix 1→7) |

### 🔍 RECHERCHE (3 Tools)

| # | Tool | Route | Slug | Datei | Doku-Status |
|---|------|-------|------|-------|-------------|
| 15 | Trend-Scanner | `/trends` | `trend-scanner` | `client/src/pages/TrendScannerPage.tsx` | ⏳ offen |
| 16 | Creator Spy | `/creator-spy` | `creator-spy` | `client/src/pages/CreatorSpyPage.tsx` | ⏳ offen |
| 17 | Hashtag-Engine | `/hashtags` | `hashtag-engine` | `client/src/pages/HashtagPage.tsx` | ⏳ offen |

### 📅 PLANEN (3 Tools)

| # | Tool | Route | Slug | Datei | Doku-Status |
|---|------|-------|------|-------|-------------|
| 18 | Kalender | `/calendar` | `calendar` | `client/src/pages/CalendarPage.tsx` | ⏳ offen |
| 19 | Monatsplan | `/monthly-plan` | `monthly-plan` | `client/src/pages/MonthlyPlanPage.tsx` | ⏳ offen |
| 20 | Posting-Zeiten | `/posting-times` | `posting-times` | `client/src/pages/PostingTimesPage.tsx` | ⏳ offen |

### 🧩 MEHR (8 Tools)

| # | Tool | Route | Slug | Datei | Doku-Status |
|---|------|-------|------|-------|-------------|
| 21 | Produktbilder | `/products` | `products` | `client/src/pages/ProductsPage.tsx` | ⏳ offen |
| 22 | Vorlagen | `/templates` | `templates` | `client/src/pages/TemplatesPage.tsx` | ⏳ offen |
| 23 | Content Queue | `/queue` | `content-queue` | `client/src/pages/ContentQueue.tsx` | ⏳ offen ❗ nicht in alter KB |
| 24 | A/B Tests | `/ab-test` | `ab-test` | `client/src/pages/ABTestPage.tsx` | ⏳ offen |
| 25 | Analytics | `/analytics` | `analytics` | `client/src/pages/AnalyticsPage.tsx` | ⏳ offen |
| 26 | Analytics+ | `/analytics-plus` | `analytics-plus` | `client/src/pages/AnalyticsPlusPage.tsx` | ⏳ offen ❗ nicht in alter KB |
| 27 | Evergreen | `/evergreen` | `evergreen` | `client/src/pages/EvergreenPage.tsx` | ⏳ offen |
| 28 | Feedback | `/feedback` | `feedback` | `client/src/pages/FeedbackPage.tsx` | ⏳ offen |

### ⚙️ SYSTEM / ADMIN (10 Tools)

| # | Tool | Route | Slug | Datei | Doku-Status |
|---|------|-------|------|-------|-------------|
| 29 | Blotato Command | `/blotato` | `blotato-command` | `client/src/pages/BlotatoCommandPage.tsx` | ⏳ offen |
| 30 | Leaderboard | `/leaderboard` | `leaderboard` | `client/src/pages/LeaderboardPage.tsx` | ⏳ offen — *TODO (Matze verifizieren): laut CLAUDE.md nicht freigeschaltet, laut alter KB aktiv* |
| 31 | Team-Aktivitäten | `/team-activity` | `team-activity` | `client/src/pages/TeamActivityPage.tsx` | ⏳ offen |
| 32 | Einladungen | `/invite-tokens` | `invite-tokens` | `client/src/pages/InviteTokensPage.tsx` | ⏳ offen |
| 33 | Team | `/team` | `team` | `client/src/pages/TeamPage.tsx` | ⏳ offen |
| 34 | Nutzer-Übersicht (Admin) | `/admin-users` | `admin-users` | `client/src/pages/AdminUsersPage.tsx` | ⏳ offen |
| 35 | Kosten-Übersicht (Budget) | `/budget` | `budget` | `client/src/pages/BudgetPage.tsx` | ⏳ offen ❗ nicht in alter KB |
| 36 | Einstellungen | `/settings` | `settings` | `client/src/pages/SettingsPage.tsx` | ⏳ offen |
| 37 | Quick-Start (Onboarding) | `/onboarding` | `onboarding` | `client/src/pages/OnboardingPage.tsx` | ⏳ offen |
| 38 | Instagram Growth | `/instagram-growth` | `instagram-growth` | `client/src/pages/SuperProfilePage.tsx` | ⏳ offen |

---

## ❓ Klärungsbedarf (TODO Matze verifizieren)

Die alte KB (`_LEGACY_v3.md` — wird gleich hinzugefügt) nennt **5 Tools, die im Code als eigene Page NICHT existieren**:

| Alte KB → Tool | Alte KB → Route | Code-Check | Mögliche Erklärung |
|---|---|---|---|
| KI Video Generator | `/video-generator` | ❌ Keine Page | Eventuell integriert in Content Wizard oder Generator — prüfen |
| Reel klonen | `/clone-reel` | ❌ Keine Page | Nie gebaut? Oder unter anderem Pfad? |
| Daily Drop | `/daily-drop` | ❌ Keine Page | Eventuell reiner Cron-Job ohne UI — prüfen |
| Trending Audio | `/trending-audio` | ❌ Keine Page | Nie gebaut? Oder Teil von Video-Tool? |
| Music Library | `/admin-music` | ❌ Keine Page | Nie gebaut? Oder Backend-only? |

**Entscheidung von Matze nötig:** Pro Tool entweder (a) **streichen** aus KB, (b) als **geplant/nicht verfügbar** markieren, oder (c) Hinweis geben, **wo** die Funktion im Code tatsächlich liegt.

Bis zur Klärung werden diese Tools **nicht dokumentiert**.

---

## Verwandte Cross-Cutting-Dokumente

Diese werden am Ende (nach allen Tool-Docs) erstellt:

- `_GLOSSARY.md` — Begriffsklärungen (LR-Partner, Pillar, Viral Score, Magic Link, ...)
- `_AUTH.md` — Login, Magic-Link-Flow, Zugangsrollen
- `_COMMON_ERRORS.md` — Wiederkehrende Fehler (TikTok JPEG, Facebook-Seite, LinkedIn-Reconnect, ...)
- `_WORKFLOWS.md` — Tool-übergreifende Abläufe (Erster Post, Batch-Freigabe, Kampagne planen)
- `_LIMITS.md` — Grenzen, Quotas, Kosten (fal.ai, Blotato, HeyGen)
- `_LEGACY_v3.md` — Ursprüngliche Manus-KB als Referenz (Persona, Dialoge, Intent-Mapping, Test-Fragen)
- `_TEMPLATE.md` — Muster-Datei, die für jedes Tool-Doc genutzt wird

---

## Arbeitsweise

1. **Discovery** → diese Datei (aktuell)
2. **Pilot-Tool** → `content-wizard.md` zur Validierung des Formats (nächster Schritt)
3. **Batches** → 3–5 Tools pro PR, jeweils Draft
4. **Cross-Cutting** zuletzt

**Alle PRs bleiben Draft.** Nur Matze mergt.

**Keine Halluzinationen.** Unklares Verhalten → `TODO (Matze verifizieren): ...` einfügen, nicht raten.

---

## Changelog

| Version | Datum | Änderung |
|---------|-------|----------|
| 0.1 | 2026-04-15 | Initialer Index erstellt (Discovery-Phase) |
