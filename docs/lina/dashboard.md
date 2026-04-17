# Dashboard

> **Slug:** `dashboard`
> **Route:** `/`
> **Frontend:** `client/src/pages/Home.tsx`
> **Status:** ✅ Aktiv in Sidebar

---

## 1. Kurzbeschreibung

Die Startseite nach dem Login. Zeigt alle Kennzahlen auf einen Blick — Anzahl Posts, Freigabe-Status, Content-Mix-Autopilot und Quick-Action-Buttons zu den wichtigsten Tools.

**Beleg:** Sidebar `"Deine Zentrale – alles auf einen Blick"` — `DashboardLayout.tsx:45`

---

## 2. Wann einsetzen

1. **Übersicht nach dem Login** — was steht an?
2. **Schnellzugriff** — zu Wizard, Freigabe, Bibliothek, Trends
3. **Content-Mix prüfen** — Autopilot zeigt 86% Lifestyle / 14% Produkt
4. **Wartende Posts sehen** — „Warten auf Freigabe"-Shortcut
5. **Team-Aktivitäten** — was machen die anderen?

---

## 3. Wann NICHT einsetzen

- **Content erstellen?** → **Content Wizard** (`/wizard`)
- **Details zu Analytics?** → **Analytics** (`/analytics`) oder **Analytics+** (`/analytics-plus`)

---

## 4. Schritt-für-Schritt User-Flow

1. Nach Login landest du automatisch auf `/`
2. **Stats-Karten:** Gesamt-Posts, Ausstehend, Freigegeben, Veröffentlicht (`Zeile 104–337`)
3. **Quick-Action-Buttons:**
   - **„Content erstellen"** → `/generator` (`Zeile 108`)
   - **„Freigeben"** → `/approval` (`Zeile 123`)
   - **„Bibliothek"** → `/library` (`Zeile 147`)
   - **„Trend-Scanner"** → `/trends` (`Zeile 349`)
   - **„Analytics+"** → `/analytics-plus` (`Zeile 354`)
4. **Pending-Posts:** Vorschau ausstehender Posts
5. **Activity Feed:** Team-Aktivitäten-Übersicht

---

## 5. Eingabefelder & Constraints

Keine — Dashboard ist Read-Only mit Navigations-Buttons.

---

## 6. Ausgaben & Ergebnisse

- **tRPC:** `dashboard.stats` (49), `apiHealth.goViralBitch` (50), `content.list` (51–53), `userSettings.get` (54)
- Zeigt Echtzeit-Stats aus DB

---

## 7. Fehlermeldungen & Lösungen

Keine spezifischen Fehler — nur Status-Badges (online/offline für APIs).

---

## 8. FAQ

**F:** Was bedeutet „Content-Mix Autopilot 86% / 14%"?
**A:** Das System sorgt automatisch dafür, dass 86% deiner Posts Lifestyle-Themen sind und 14% Produkt-Themen — das entspricht der LR-Compliance-Empfehlung.

**F:** Was zeigt „Warten auf Freigabe"?
**A:** Anzahl deiner Posts, die noch nicht freigegeben sind. Klick darauf führt zu /approval.

---

## 9. Verwandte Tools

Alle — das Dashboard ist der Startpunkt zu jedem Tool.

---

## 10. Pitfalls & Known Issues

Keine bekannten Issues.

---

## 11. Technische Referenz

- **Page:** `client/src/pages/Home.tsx`
- **Sidebar:** `DashboardLayout.tsx:45` — Icon: `LayoutDashboard`
- **tRPC:** `dashboard.stats` (49), `apiHealth.goViralBitch` (50), `content.list` (51–53), `userSettings.get` (54)
- **DB:** Read-Only (Stats-Aggregation aus `contentPosts`)
