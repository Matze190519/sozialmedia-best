# AGENTS.md — Regeln für OpenAI Codex & andere CLI-Agenten

> Diese Datei wird von **OpenAI Codex** (und kompatiblen Agenten) **automatisch** beim Start einer Session gelesen.
> Sie ist ein **dünner Wrapper** um die zentrale Regel-Datei `CLAUDE.md`.
>
> **Single Source of Truth ist `CLAUDE.md`.** Änderungen an Regeln passieren **nur dort**. Diese Datei ergänzt nur Codex-spezifische Aspekte.

---

## 🚨 Erste Handlung jeder Codex-Session

**ZUERST `CLAUDE.md` im Repo-Root lesen.** Alle dortigen Regeln gelten 1:1 auch für Codex.

---

## Codex-spezifische Ergänzungen

### 1. Branch-Namensschema
- **Claude Code arbeitet auf:** `claude/<feature>`
- **Codex arbeitet auf:** `codex/<feature>`
- **Manus AI arbeitet auf:** `manus/<feature>`
- **Niemals gleicher Branch zwischen zwei Agenten** — sonst Merge-Konflikte.

### 2. Sandbox & Approval
Beim Start von Codex immer:
- **Sandbox-Mode:** aktiviert (`--sandbox on` oder entsprechendes Setting)
- **Approval-Mode:** mindestens `on-failure`, bei kritischen Tasks `always`
- **Nie** `--dangerously-auto-approve` oder Bypass-Flags

### 3. Erlaubter Scope für Codex
| Farbe | Scope | Codex darf... |
|-------|-------|---------------|
| 🟢 Grün | Isolierte Doku, Text, neue UI-Komponenten | ...selbstständig arbeiten |
| 🟡 Gelb | Tests schreiben, Refactoring in einer Datei | ...arbeiten, aber Review durch Claude/User vor Merge |
| 🔴 Rot | Auth, Approval-Workflow, Blotato, Lina-API, Migrations | ...**nicht anfassen**. User fragen. |

### 4. Parallel-Arbeit mit Claude Code
- **Ein Feature → eine KI.** Wenn Claude Code an Feature X arbeitet, arbeitet Codex nicht am selben Feature.
- **Koordination läuft über den User** oder einen expliziten Handoff-Kommentar im PR.
- **Bei Unklarheit:** User fragen, welche KI zuständig ist.

### 5. Schnellreferenz (für Codex)

```
Vor jedem Commit:
  [ ] CLAUDE.md gelesen?
  [ ] Branch: codex/<feature>?
  [ ] Keine 🔴-rote Zone angefasst?
  [ ] Test geschrieben (bei Code-Änderungen)?
  [ ] Commit-Message ≤ 72 Zeichen erste Zeile?

Vor jedem Push:
  [ ] Keine Secrets im Diff?
  [ ] Push zu `codex/*`, NIEMALS `main`?

Nach dem Push:
  [ ] Draft-PR eröffnet?
  [ ] PR-Beschreibung mit Risiko-Level?
```

### 6. Eskalation (Codex-Version)

**Sofort stoppen und User fragen, wenn:**
1. `CLAUDE.md` nicht lesbar oder widersprüchlich
2. Branch-Protection verhindert Push (dann ist der Workflow richtig — nie umgehen)
3. Ein Test schlägt fehl ohne klaren Grund
4. Scope wächst über Auftrag hinaus
5. Man will eine 🔴-rote Zone anfassen

**Niemals eigenmächtig sein. Niemals "nebenbei" verbessern.**

---

## Beziehung zu CLAUDE.md

Wenn **Widerspruch** zwischen AGENTS.md und CLAUDE.md auftaucht:
- **CLAUDE.md gewinnt immer.**
- Diese Datei hier erweitert nur, überschreibt nie.

---

## Für Menschen (Dev-Team)

- Codex-Installation: https://github.com/openai/codex
- Erste Session: **nur eine kleine 🟢-grüne Aufgabe** geben, Verhalten beobachten
- Bei Problemen: AGENTS.md oder CLAUDE.md anpassen, nicht einzelne Sessions umkonfigurieren
