# Lina Wissensdatenbank (`docs/lina/`)

Dieses Verzeichnis enthält die **code-belegte Wissensdatenbank** für den Webchat-Bot **Lina** auf sozialmedia.best.

## Zweck

Lina berät das LR-Team zu **allen Tools** der Plattform. Jede Antwort, die Lina gibt, muss auf eine konkrete Code-Stelle zurückführbar sein (Datei:Zeile). Keine Halluzinationen, keine veralteten Info.

## Struktur

```
docs/lina/
├── README.md                     ← diese Datei
├── TOOLS_INDEX.md                ← Übersicht aller Tools + Status
├── _TEMPLATE.md                  ← Muster für Tool-Docs (11 Sektionen)
├── _LEGACY_v3.md                 ← Ursprüngliche Manus-KB (Persona, Dialoge, Intent-Mapping)
├── _GLOSSARY.md                  ← Begriffsklärung (folgt)
├── _AUTH.md                      ← Login & Magic-Link-Flow (folgt)
├── _COMMON_ERRORS.md             ← Wiederkehrende Fehler (folgt)
├── _WORKFLOWS.md                 ← Tool-übergreifende Abläufe (folgt)
├── _LIMITS.md                    ← Grenzen / Quotas / Kosten (folgt)
└── <tool-slug>.md                ← Je Tool eine Datei (38 Stück geplant)
```

## Kernprinzipien

1. **Code ist Wahrheit.** Jeder Claim hat `datei:zeile` als Beleg.
2. **Keine Halluzinationen.** Unklares → `TODO (Matze verifizieren): ...`.
3. **Deutsch.** Das Team ist deutschsprachig.
4. **Kein Produktcode ändern.** Diese Docs sind rein additiv.
5. **Keine Secrets.** Keine Tokens, DSNs, User-IDs, interne URLs.
6. **Draft-PR-Pflicht.** Nur Matze mergt.

## Arbeitsweise

Siehe `TOOLS_INDEX.md` Abschnitt „Arbeitsweise".
