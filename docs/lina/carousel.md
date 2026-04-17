# Karussell

> **Route:** `/carousel` | **Frontend:** `CarouselPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Mehrseitige Slide-Posts für Instagram + LinkedIn. Ideal für Anleitungen, Top-Listen, Produkt-Vergleiche. 5–10 Slides automatisch generiert.
**Beleg:** Sidebar `"Mehrteilige Slide-Posts erstellen"` — `DashboardLayout.tsx:61`

## 2. Wann einsetzen
- Instagram-Karussell mit mehreren Slides
- LinkedIn-Slides (edukativer Content)
- Top-10-Listen, Schritt-für-Schritt-Anleitungen, Vorher/Nachher

## 3. Wann NICHT einsetzen
- **Einzelner Post?** → Content Wizard (`/wizard`)
- **Video?** → Lina Avatar (`/lina-avatar`)

## 4. User-Flow
1. **Thema** eingeben (`Zeile 68`)
2. **Plattform** wählen: Instagram oder LinkedIn (`Zeile 70`)
3. **Anzahl Slides** wählen (default 7, `Zeile 71`)
4. **Style** wählen: Educational, Storytelling, Listicle, Before/After, Tips (`Zeile 72`)
5. Klick auf **„Karussell generieren"** (`Zeile 194`)
6. Slides-Preview mit Navigation
7. **„Slide X kopieren"** (`Zeile 326`) oder **„Alles kopieren"** (`Zeile 218`)

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Thema eingeben" | Thema-Feld ausfüllen | 86 |
| „Karussell mit X Slides generiert!" | Erfolg | 80 |
| „Alles kopiert!" | Erfolg | 101 |

## 11. Technische Referenz
- **tRPC:** `carousel.generate` (76)
