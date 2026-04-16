# Instagram Growth

> **Route:** `/instagram-growth` | **Frontend:** `SuperProfilePage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Instagram-Wachstumsstrategien, AutoDM-Tipps, Lead-Generierung mit SuperProfile. Info-Seite mit konkreten Anleitungen und Textbausteinen.
**Beleg:** Sidebar `"AutoDM & neue Leads gewinnen"` — `DashboardLayout.tsx:107`

## 2. Inhalte der Seite
- **Was ist SuperProfile** — Erklärung des Tools
- **Kosten** — 2 Preispläne
- **5-Schritt-Anleitung** (StepCards)
- **Copy-Texte** — 4 Post-Varianten zum Kopieren
- **Wo landen die Anfragen** — Lead-Flow erklärt
- **Lead Magnets** — was du anbieten kannst
- **8-Item Checkliste** — alles abhaken
- **FAQ** — 9 häufige Fragen

## 4. User-Flow
1. Info lesen — reine Wissensvermittlung
2. **„SuperProfile öffnen"** (`Zeile 155`) → öffnet `superprofile.bio` extern
3. Checkliste abhaken (`Zeile 360–368`)
4. Copy-Texte nutzen

## 11. Technische Referenz
- **tRPC:** Keine (Info-Only Page)
- **Navigation:** `window.open("https://superprofile.bio")`
