# Vorlagen

> **Route:** `/templates` | **Frontend:** `TemplatesPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Hook-Formeln, Einleitungssätze, CTA-Vorlagen, Einwandbehandlung. Für Partner, die selbst schreiben aber Inspiration brauchen.
**Beleg:** Sidebar `"Bewährte Texte & Hooks zum Anpassen"` — `DashboardLayout.tsx:86`

## 4. User-Flow
1. **5 Pillar-Filter** — nach Themenbereich filtern
2. Template-Grid: Name, Kategorie, Content, Usages-Zähler
3. **„Kopieren"** (`Zeile 182`) — Text in Zwischenablage
4. **„+ Neue Vorlage"** (`Zeile 88`) — eigene Vorlage erstellen
5. **„Löschen"** (`Zeile 185`)

## 5. Fehlermeldungen
| Meldung | Lösung | Zeile |
|---------|--------|-------|
| „Vorlage erstellt!" | Erfolg | 55 |
| „Vorlage gelöscht" | Erfolg | 65 |

## 11. Technische Referenz
- **tRPC:** `templates.list` (48), `templates.create` (52), `templates.delete` (62)
