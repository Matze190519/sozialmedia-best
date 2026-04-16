# Quick-Start (Onboarding)

> **Route:** `/onboarding` | **Frontend:** `OnboardingPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
5-Schritte-Einführung für neue Partner mit Fortschrittsbalken. Führt vom Login bis zum ersten veröffentlichten Post.
**Beleg:** Sidebar `"Neu hier? Hier starten!"` — `DashboardLayout.tsx:106`

## Die 5 Onboarding-Schritte
1. **Einloggen** ✅ (automatisch erledigt via Magic-Link)
2. **Blotato einrichten** (optional, ca. 25 €/Monat) — 4-Schritt-Anleitung
3. **Persönliches Branding** (PFLICHT) — Vorstellung, CTA, Signatur, Hashtags in /settings
4. **Ersten Post erstellen** → Content Wizard oder Schnell-Post
5. **Post freigeben** → Freigabe-Center

## 4. User-Flow
1. Fortschrittsbalken zeigt den Stand
2. Jeder Schritt hat grünen Haken (erledigt) oder ausstehend
3. **Step-Links:** z.B. „Zu den Einstellungen" (`Zeile 138`), „Ersten Post erstellen" (`Zeile 448`)
4. Content-Mix-Grid erklärt das 86/14-Prinzip
5. Checkliste mit allen Schritten

## 11. Technische Referenz
- **tRPC:** `userSettings.get` (61), `dashboard.stats` (62)
- **Navigation:** → `/settings`, `/generator`, `/approval`, `/`
