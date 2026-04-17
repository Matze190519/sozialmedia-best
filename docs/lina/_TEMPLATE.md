# [Tool-Name]

> **Slug:** `[tool-slug]`
> **Route:** `/[pfad]`
> **Frontend-Datei:** `client/src/pages/[PageName].tsx`
> **Status:** ✅ Aktiv in Sidebar / 🔧 Gebaut, nicht aktiv / ❓ Unklar

---

## 1. Kurzbeschreibung

*1–2 Sätze: Was macht das Tool in einfachen Worten?*

**Beleg:** `[datei:zeile]`

---

## 2. Wann einsetzen (Use Cases)

*3–5 Anwendungsfälle aus Team-Sicht. Konkret, nicht abstrakt.*

1. **[Situation]** → [was Lina hier empfiehlt]
2. ...

---

## 3. Wann NICHT einsetzen

*Typische Missverständnisse. Wo verwechseln Partner das Tool mit einem anderen?*

- **Nicht dafür geeignet:** [Szenario] → Besser: [anderes Tool]
- ...

---

## 4. Schritt-für-Schritt User-Flow

*1:1 aus dem UI-Code. Button-Namen, Feldnamen genau wie im Produkt.*

1. Öffne Tool über Sidebar → **„[Menüeintrag]"** oder direkt `/[pfad]`
2. Feld **„[Feldname]"** ausfüllen: *[Beschreibung]*
3. Klick auf Button **„[Button-Text]"**
4. *System reagiert mit:* [sichtbares Ergebnis]
5. ...

**Belege:**
- Step 1: `[datei:zeile]` (Menü-Eintrag)
- Step 2: `[datei:zeile]` (Feld)
- Step 3: `[datei:zeile]` (Button)

---

## 5. Eingabefelder & Constraints

| Feld | Typ | Pflicht | Validierung | Default | Beleg |
|------|-----|---------|-------------|---------|-------|
| [feldname] | string | ✅ | min 3, max 200 | — | `[datei:zeile]` |
| ... | | | | | |

*Validierung aus Zod-Schema, React-Hook-Form oder JSX-Attributen lesen. Keine Erfindung.*

---

## 6. Ausgaben & Ergebnisse

**Was passiert beim Submit?**

- Aktion: *z. B. tRPC-Call zu `content.generate.mutate`*
- DB-Speicherung: *z. B. neuer Eintrag in `contentPosts`-Tabelle mit Status `pending`*
- UI-Feedback: *z. B. Toast „Post erstellt"*
- Weiterleitung: *z. B. Redirect zu `/approval`*

**Belege:**
- Mutation: `[datei:zeile]`
- DB-Tabelle: `drizzle/schema.ts:zeile`
- Toast: `[datei:zeile]`

---

## 7. Fehlermeldungen & Lösungen

| Error-String (exakt aus Code) | Erklärung | Lösung für User |
|-------------------------------|-----------|-----------------|
| `"[Error-Text]"` | [Was bedeutet der Fehler technisch] | [Was soll User tun] |
| ... | | |

**Belege pro Error:** `[datei:zeile]`

---

## 8. FAQ

*Antizipierte Fragen. Jede Antwort hat einen Code-Beleg.*

**F:** [Typische Partner-Frage]
**A:** [Antwort mit konkretem Schritt]
**Beleg:** `[datei:zeile]`

---

## 9. Verwandte Tools

- **[Verwandtes Tool 1]** → [docs/lina/[slug].md](./[slug].md) — *nutzen wenn [Szenario]*
- ...

---

## 10. Pitfalls & Known Issues

- ⚠️ **[Known Issue]:** [Beschreibung] — siehe `[datei:zeile]` oder externes Ticket
- ⚠️ **TODO (Matze verifizieren):** [Unklarheit aus dem Code — nicht geraten]
- ...

---

## 11. Technische Referenz (intern, für Entwickler)

### Frontend

- **Page:** `client/src/pages/[PageName].tsx`
- **Komponenten:** `client/src/components/[...]`
- **Hooks/Queries:** `[datei:zeile]`

### Backend

- **tRPC-Router:** `server/routers.ts:[zeile]` — Procedure `[name]`
- **REST-Endpoint (falls relevant):** `[METHODE] [/api/pfad]` → `server/[datei]:zeile`

### Datenbank (Drizzle)

- **Tabelle:** `[tabellenname]` → `drizzle/schema.ts:[zeile]`
- **Felder genutzt:** `[feld1, feld2, ...]`

### Externe APIs

- **[API-Name]:** *z. B. fal.ai / Blotato / HeyGen* — Endpoint `[url]`, Auth-Header `[header]`

### Feature-Flags

- `[FLAG_NAME]` (falls vorhanden) — Default `[on/off]`

---

## Changelog

| Version | Datum | Änderung | Autor |
|---------|-------|----------|-------|
| 0.1 | YYYY-MM-DD | Initiale Version | [Claude/Codex/Matze] |
