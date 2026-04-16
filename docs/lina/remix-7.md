# Remix 1→7

> **Slug:** `remix-7`
> **Route:** `/remix7`
> **Frontend:** `client/src/pages/ContentRemix7Page.tsx`
> **Status:** ✅ Aktiv in Sidebar

---

## 1. Kurzbeschreibung

Aus einer einzigen Idee werden 7 plattform-optimierte Varianten erzeugt — inklusive ASMR-Script und Hopecore Reel. Spart 7× Schreiben.

**Beleg:** Sidebar `"1 Idee → 7 fertige Formate (inkl. ASMR)"` — `DashboardLayout.tsx:57`

---

## 2. Wann einsetzen

1. **Launch-Thema auf allen Plattformen** — 1 Idee, 7 Formate
2. **Plattform-optimiert** — jedes Format passt zur jeweiligen Plattform
3. **ASMR-Script** — für TikTok/Reels-Trend
4. **Batch-Content** — 7 Posts auf einmal statt einzeln

---

## 3. Wann NICHT einsetzen

- **Nur 1 Post?** → **Content Wizard** (`/wizard`)
- **Nur 5 Formate?** → **Content Remix** (`/remix`)
- **Karussell-Slides?** → **Karussell** (`/carousel`)

---

## 4. Schritt-für-Schritt User-Flow

1. Content/Thema eingeben (`Zeile 37–38`)
2. Pillar wählen (optional, `Zeile 39`)
3. **Formate auswählen** — welche der 7 sollen remixed werden (`Zeile 40`)
4. Klick auf **„1→7 Remix starten"** (`Zeile 244`)
5. 7 Varianten werden angezeigt — mit Hashtags, Music-Tipps, Notes
6. **„Kopieren"** pro Variante (`Zeile 334`) oder **„Alle kopieren"** (`Zeile 266`)
7. Optional: **„Speichern"** / **„Intern"** (`Zeile 324`) in Bibliothek

---

## 5. Eingabefelder & Constraints

| Feld | Typ | Pflicht | Zeile |
|------|-----|---------|-------|
| Content/Thema | Textarea | Ja | 37 |
| Thema | Input | Nein | 38 |
| Pillar | Select | Nein | 39 |
| Formate | Multi-Select (7) | Ja (mind. 1) | 40 |

---

## 7. Fehlermeldungen & Lösungen

| Fehlermeldung | Lösung | Zeile |
|---------------|--------|-------|
| „Bitte gib Content zum Remixen ein!" | Text eingeben | 59 |
| „Wähle mindestens ein Format!" | Mindestens 1 Format auswählen | 65 |

---

## 8. FAQ

**F:** Was sind die 7 Formate?
**A:** Instagram Post, Instagram Story, TikTok Caption, LinkedIn Post, Facebook Post, Twitter/X Tweet, Threads Post (+ ASMR/Hopecore je nach Auswahl).

**F:** Unterschied zu Content Remix (/remix)?
**A:** Remix 1→7 hat 7 Formate inkl. ASMR. Content Remix (/remix) hat 5 Basis-Formate (Post, Reel, Story, Hooks, Ad Copy).

---

## 9. Verwandte Tools

- **Content Remix** (`/remix`) — 5 Basis-Formate
- **Content Wizard** (`/wizard`) — einzelner Post
- **Bibliothek** (`/library`) — gespeicherte Remixe wiederverwenden

---

## 11. Technische Referenz

- **Page:** `client/src/pages/ContentRemix7Page.tsx`
- **Sidebar:** `DashboardLayout.tsx:57`
- **tRPC:** `contentRemix.formats` (44), `contentRemix.remixSelected` (45), `contentRemix.saveAsPost` (46)
