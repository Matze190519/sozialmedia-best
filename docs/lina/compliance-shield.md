# Compliance Shield

> **Slug:** `compliance-shield`
> **Route:** `/compliance`
> **Frontend:** `client/src/pages/ComplianceShieldPage.tsx`
> **Status:** ✅ Aktiv in Sidebar

---

## 1. Kurzbeschreibung

Prüft jeden Post automatisch auf LR-Compliance: Heilaussagen, Verdienstversprechen, Markenrechts-Probleme. Status 🟢 Grün (sicher), 🟡 Gelb (Warnung), 🔴 Rot (nicht posten). Mit 1-Klick-Umformulierung.

**Beleg:** Sidebar `"Prüft ob dein Post rechtlich sicher ist"` — `DashboardLayout.tsx:56`

---

## 2. Wann einsetzen

1. **Vor dem Posten** — ist der Text rechtlich sicher?
2. **Heilaussagen vermeiden** — „heilt Krebs" → „unterstützt das Wohlbefinden"
3. **Verdienstversprechen prüfen** — „du verdienst garantiert X €" ist verboten
4. **Marken-Check** — keine Mitbewerber-Namen nennen
5. **LR-Pflichtangaben** — Disclaimer bei Einkommenshinweisen

---

## 3. Wann NICHT einsetzen

- **Viral-Potenzial prüfen?** → **Viral Predictor** (`/viral-predictor`)
- **Post erstellen?** → **Content Wizard** (`/wizard`)

---

## 4. Schritt-für-Schritt User-Flow

1. Text in Textarea eingeben (`Zeile 70`)
2. Plattform wählen (`Zeile 71`)
3. Klick auf **„Compliance Check"** (`Zeile 151`)
4. **Quick Check** sofort → **Deep Check** parallel (`Zeile 73–74`)
5. Ergebnis: Score-Ring, Violations-Detail, Prüfbereiche
6. Bei Verletzung: Umformulierungsvorschlag → 1-Klick übernehmen
7. **„Neuen Content prüfen"** (`Zeile 330`) für weiteren Text

---

## 5. Eingabefelder & Constraints

| Feld | Typ | Pflicht | Zeile |
|------|-----|---------|-------|
| Content-Text | Textarea | Ja | 70 |
| Plattform | Select | Nein | 71 |

---

## 7. Fehlermeldungen & Lösungen

| Fehlermeldung | Lösung | Zeile |
|---------------|--------|-------|
| „Bitte gib Content zum Prüfen ein!" | Text eingeben | 81 |

---

## 8. FAQ

**F:** Mein Post ist rot — was tun?
**A:** Umformulierungsvorschlag ansehen und mit 1 Klick übernehmen. Oft geht's um ein einzelnes Wort (z.B. „heilt" → „unterstützt").

**F:** Darf ich „heilt" schreiben?
**A:** Nein. Heilaussagen sind bei LR verboten. Das Shield bietet dir eine sichere Alternative.

**F:** Was bedeutet gelb?
**A:** Warnung — du kannst posten, aber eine Umformulierung ist empfohlen.

---

## 9. Verwandte Tools

- **Viral Predictor** (`/viral-predictor`) — Performance-Prüfung
- **Freigabe** (`/approval`) — Post zur Veröffentlichung freigeben

---

## 11. Technische Referenz

- **Page:** `client/src/pages/ComplianceShieldPage.tsx`
- **Sidebar:** `DashboardLayout.tsx:56`
- **tRPC:** `complianceShield.check` (73), `complianceShield.deepCheck` (74)
