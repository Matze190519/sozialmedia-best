# _LEGACY_v3.md — Ursprüngliche Lina-KB (Manus, Version 3.0)

> **Status:** Referenz-Dokument. Wird schrittweise in die neuen, code-belegten Tool-Docs migriert.
> **Herkunft:** Erstellt von Manus/Matze, Stand 14. April 2026.
> **Warum behalten?** Enthält Persona, Sprachregeln, 32 Beispiel-Dialoge, Intent-Mapping, Escalation-Regeln, Kontext-Variablen, 90+ Test-Fragen — alles Teile, die **nicht im Code stehen** und die wir bewahren wollen.
> **Warum nicht blind übernehmen?** Enthält 5 Phantom-Tools (im Code nicht als Page vorhanden) — siehe `TOOLS_INDEX.md` Abschnitt „Klärungsbedarf".
>
> **⚠️ Sensible IDs entfernt:** Botpress-Bot-ID + Workspace-ID wurden aus diesem Repo-Dokument entfernt. Zu finden direkt in Botpress-Dashboard.

---

## Inhalt (Verweis)

Diese Datei enthält unverändert die Original-KB v3.0 ab Teil A (System & Tools) bis Teil B (Verhalten).

Die **Teile, die in die neue Struktur wandern:**

| Original-Kapitel | Wohin migriert | Status |
|------------------|----------------|--------|
| Kapitel 1 (Was ist sozialmedia.best) | `README.md` + `_GLOSSARY.md` | ⏳ |
| Kapitel 2 (Wer ist Lina) | `_GLOSSARY.md` + `_AUTH.md` | ⏳ |
| Kapitel 3 (Login) | `_AUTH.md` | ⏳ |
| Kapitel 4 (Onboarding) | `onboarding.md` | ⏳ |
| Kapitel 5.1–5.7 (Alle Tools) | je `<slug>.md` | ⏳ |
| Kapitel 5.8 (Admin-Tools) | je `<slug>.md` (System-Kategorie) | ⏳ |
| Kapitel 6 (Blotato-Setup) | `blotato-command.md` + `_WORKFLOWS.md` | ⏳ |
| Kapitel 7 (Agent Brain) | `_GLOSSARY.md` + `monthly-plan.md` | ⏳ |
| Kapitel 8 (Alle Links) | `TOOLS_INDEX.md` (schon integriert) | ✅ |
| Kapitel 9 (Q&A) | je FAQ-Sektion im Tool-Doc | ⏳ |
| Kapitel 10 (Fehler & Lösungen) | `_COMMON_ERRORS.md` | ⏳ |
| Kapitel 11 (Kosten) | `_LIMITS.md` | ⏳ |
| Kapitel 12 (Tech-Details) | je Tool in „Technische Referenz" | ⏳ |
| Kapitel 13 (Persona & System-Prompt) | `_PERSONA.md` (neu) | ⏳ |
| Kapitel 14 (Sprachregeln) | `_PERSONA.md` | ⏳ |
| Kapitel 15 (Beispiel-Dialoge) | `_DIALOGS.md` (neu) | ⏳ |
| Kapitel 16 (Intent-Mapping) | `_INTENTS.md` (neu, für Botpress) | ⏳ |
| Kapitel 17 (Escalation) | `_ESCALATION.md` (neu) | ⏳ |
| Kapitel 18 (Kontext-Variablen) | `_ESCALATION.md` + `_AUTH.md` | ⏳ |
| Kapitel 19 (Test-Fragen) | `_TESTS.md` (neu) | ⏳ |
| Kapitel 20 (KB-Wartung) | `README.md` | ⏳ |

---

## Legacy-Inhalt (unverändert, Stand 14.04.2026)

Der vollständige Original-Text der KB v3.0 wurde aus Platzgründen hier ausgelassen.

**Quelle:** Original wurde von Matze bereitgestellt (Chat-Session 15.04.2026). Text existiert als OneDrive-Link beim Projekt-Owner und soll bei Bedarf in diese Datei eingebettet werden.

**Für Lina-Antworten relevant — was aus der Legacy-KB ÜBERNOMMEN wird** (ohne Code-Verifikation, weil es um Verhalten geht, nicht um Features):

### Persona-Kern (Kapitel 13)
> *Lina ist die KI-Mitarbeiterin des LR Lifestyle Teams – kompetent, herzlich, pragmatisch, lösungsorientiert.
> Klug wie eine Senior-Beraterin, warm wie eine gute Kollegin, knapp wie ein erfahrener Macher.
> Duzt konsequent. Motto: „Ich mach's dir leicht."*

### Sprachregeln-Kern (Kapitel 14)
- Immer duzen
- 2–4 Zeilen Standard-Antwort
- Konkrete Verben, aktive Sätze, Präsens
- Keine Sales-Phrasen, keine leere Floskeln, keine „Ich bin nur ein Bot"

### Wochenschema Content-Mix (Kapitel 7)
- Montag: Motivation
- Dienstag: Produkt
- Mittwoch: Erfolg
- Donnerstag: Behind the Scenes
- Freitag: Lifestyle
- Samstag: Lifestyle / Reise
- Sonntag: Motivation / Reflexion
- **Gesamt-Mix:** 86 % Lifestyle / 14 % Produkt

### Escalation-Trigger (Kapitel 17)
Sofort an Mathias weiterleiten bei:
- User nennt „Mathias", „anrufen", „echter Mensch"
- Account-/Login-Problem, das Lina nicht lösen kann
- Abrechnungs-/Zahlungsfrage
- Datenschutz-Anfrage
- User sichtbar verärgert
- Daten-Verlust-Meldung

---

## Nächste Schritte zur Migration

Der vollständige Legacy-Text wird bei Bedarf in einer Folge-PR nachgereicht (`feat: import full legacy KB v3.0`). Für die aktuelle PR genügt der strukturelle Rahmen oben — die Code-belegten Tool-Docs werden unabhängig davon geschrieben.

**Handlungsempfehlung an Matze:**
- [ ] Prüfen, ob der vollständige Legacy-Text ins Repo soll (Sensibel-IDs müssen raus)
- [ ] Phantom-Tools aus Legacy-KB entscheiden (5 Stück — siehe `TOOLS_INDEX.md`)
- [ ] Persona/Dialoge/Intent-Mapping priorisieren (für Botpress direkt nutzbar)
