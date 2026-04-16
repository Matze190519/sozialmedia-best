# Feedback

> **Route:** `/feedback` | **Frontend:** `FeedbackPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Posts mit 1–5 Sternen bewerten. System lernt daraus. Zeigt Top-Posts, beste Posting-Zeiten und Learnings.
**Beleg:** Sidebar `"Was hat am besten funktioniert?"` — `DashboardLayout.tsx:92`

## 4. User-Flow
1. **Pending-Feedback-Cards** — Posts, die noch bewertet werden müssen
2. **Score-Buttons 1–5** (`Zeile 72–84`) — 1 Klick zum Bewerten
3. **Top Posts** — Ranking nach Feedback-Score
4. **Beste Posting-Zeiten** — aus dem Feedback abgeleitet
5. **3er-Grid:** Funktioniert gut / Vermeiden / Pro-Tipps

## 5. Fehlermeldungen
| Meldung | Zeile |
|---------|-------|
| „Feedback gespeichert!" | 30 |

## 11. Technische Referenz
- **tRPC:** `feedback.topPerforming` (24), `postingTimes.get` (25), `content.list` (26), `feedback.updateScore` (29)
