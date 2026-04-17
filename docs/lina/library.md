# Bibliothek

> **Slug:** `library`
> **Route:** `/library`
> **Frontend:** `client/src/pages/LibraryPage.tsx`
> **Status:** ✅ Aktiv in Sidebar

---

## 1. Kurzbeschreibung

Sammlung aller fertigen Inhalte — Texte, Bilder, Videos, Vorlagen, Lina-Videos, Skripte. Sofort kopierbar, personalisierbar und direkt auf Blotato postbar.

**Beleg:** Sidebar `"Fertige Posts kopieren & direkt nutzen"` — `DashboardLayout.tsx:49`

---

## 2. Wann einsetzen

1. **Fertigen Content schnell posten** — 1-Tap-Copy für Text + Hashtags + Bild
2. **KI-Personalisierung** — „✨ KI automatisch anpassen" passt Text auf dein Branding an
3. **Direkt auf Blotato posten** — ohne Umweg über Freigabe
4. **Content durchsuchen** — Volltextsuche + Pillar-Filter + Kategorie-Filter
5. **Eigene Inhalte verwalten** — hinzufügen, bearbeiten, löschen

---

## 3. Wann NICHT einsetzen

- **Neuen Content von Null erstellen?** → **Content Wizard** (`/wizard`)
- **Vorlagen/Hook-Formeln suchen?** → **Vorlagen** (`/templates`)
- **Post-Performance sehen?** → **Analytics** (`/analytics`)

---

## 4. Schritt-für-Schritt User-Flow

1. Öffne **„Bibliothek"** in der Sidebar
2. **Filtern:** Kategorie (Texte/Bilder/Videos/Vorlagen/Lina Videos/Skripte), Pillar, Suche (`Zeile 41–43`)
3. **Sortieren:** nach Datum/Relevanz (`Zeile 47`)
4. Post auswählen → **„Text + Hashtags kopieren"** (`Zeile 406`)
5. Oder: **„Auf Blotato posten"** (`Zeile 396`) — direkt auf alle Kanäle
6. Oder: **„✨ KI automatisch anpassen"** — personalisiert Text mit deinem Branding aus /settings
7. **Hinzufügen:** eigene Inhalte über **„Hinzufügen"** (`Zeile 185`)

---

## 5. Eingabefelder & Constraints

| Feld | Typ | Pflicht | Zeile |
|------|-----|---------|-------|
| Suchtext | Input | Nein | 42 |
| Kategorie-Filter | Tabs | Nein | 41 |
| Pillar-Filter | Select | Nein | 43 |
| Sortierung | Select | Nein | 47 |
| Neuer Titel | Input | Ja (beim Hinzufügen) | 52 |
| Neuer Text | Textarea | Ja | 55 |
| Neue Tags | Input | Nein | 56 |

---

## 6. Ausgaben & Ergebnisse

- **tRPC:** `library.list` (59), `library.add` (65), `library.copy` (75), `library.delete` (79), `library.publishToBlotato` (84)
- **DB:** Bibliotheks-Einträge erstellen/löschen
- Freigegebene Posts landen automatisch in der Bibliothek

---

## 7. Fehlermeldungen & Lösungen

| Fehlermeldung | Lösung | Zeile |
|---------------|--------|-------|
| „Zur Bibliothek hinzugefügt" | Erfolg | 67 |
| „Gelöscht" | Erfolg | 79 |
| „Text kopiert!" | Erfolg | 75 |
| „Auf X Plattformen gepostet!" | Erfolg | 86 |

---

## 8. FAQ

**F:** Wie personalisiere ich einen Text?
**A:** „✨ KI automatisch anpassen" klicken. Voraussetzung: Branding in /settings gefüllt (Vorstellung + CTA + Signatur + Hashtags).

**F:** Ist die Bibliothek leer?
**A:** Sie füllt sich automatisch mit jedem Post, den du erstellst und freigibst. Ersten Post im Wizard machen.

**F:** Kann ich eigene Texte hinzufügen?
**A:** Ja — Button „Hinzufügen", Titel + Text + Tags eingeben.

---

## 9. Verwandte Tools

- **Content Wizard** (`/wizard`) — neuen Content erstellen
- **Vorlagen** (`/templates`) — Hook-Formeln und Textbausteine
- **Blotato Command** (`/blotato`) — Publishing-Status
- **Freigabe** (`/approval`) — Posts vor Veröffentlichung prüfen

---

## 10. Pitfalls & Known Issues

- ⚠️ „KI automatisch anpassen" funktioniert nur mit gefülltem Branding in /settings
- ⚠️ Temporäre Bild-URLs können ablaufen — dann ist das Bild nicht mehr verfügbar

---

## 11. Technische Referenz

- **Page:** `client/src/pages/LibraryPage.tsx`
- **Sidebar:** `DashboardLayout.tsx:49`
- **tRPC:** `library.list` (59), `library.add` (65), `library.copy` (75), `library.delete` (79), `library.publishToBlotato` (84)
- **DB:** `contentLibrary` (oder `contentPosts` mit `sharedToLibrary: true`)
- **APIs:** Blotato (direktes Publishing)
