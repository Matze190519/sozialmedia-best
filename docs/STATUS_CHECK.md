# STATUS CHECK

Stand: 2026-04-17  
Branch geprüft: `main` nach `git pull origin main` auf Commit `a05fc13`

## Ergebnis

`main` ist aktuell **nicht deploybar**.

Grund:
- `pnpm check` schlägt mit **4 TypeScript-Fehlern** fehl.
- `pnpm test` schlägt mit **14 fehlenden Tests in 8 Testdateien** fehl.

Ausgeführte Schritte:
- `git checkout main`
- `git pull origin main`
- `corepack pnpm install`
- `corepack pnpm check`
- `corepack pnpm test`

## TypeScript-Fehler

### 1. Fehlender Import in Command Palette

- Datei: `client/src/components/CommandPalette.tsx:26`
- Fehler: `Cannot find name 'Target'`
- Ursache:
  Der neue Command-Palette-Eintrag für "Lead Capture" verwendet `Target`, aber `Target` wird nicht aus `lucide-react` importiert.
  Das ist ein **GitHub-main-Codefehler** und keine lokale Umgebungsabweichung.
- Fix-Vorschlag:
  `Target` in der `lucide-react`-Importliste ergänzen.

### 2. Nullable-Wert an tRPC-Input übergeben

- Datei: `client/src/pages/AutoLoopPage.tsx:69`
- Fehler: `Type 'number | null' is not assignable to type 'number | undefined'`
- Ursache:
  `trend.viralScore` kommt offenbar nullable zurück, der Mutations-Input erwartet aber `number | undefined`.
  Das ist sehr wahrscheinlich eine **GitHub-Code vs. API-/Schema-Diskrepanz**.
- Fix-Vorschlag:
  Übergabe normalisieren, z. B. `trend.viralScore ?? undefined`, oder den tRPC-/Typvertrag an die echten Daten anpassen.

### 3. Nullable-String an tRPC-Input übergeben

- Datei: `client/src/pages/AutoLoopPage.tsx:96`
- Fehler: `Type 'string | null' is not assignable to type 'string | undefined'`
- Ursache:
  Ein nullable String aus der Trend-/Compliance-Pipeline wird in einen Typ übergeben, der `undefined`, aber nicht `null` erlaubt.
  Das ist ebenfalls eine **GitHub-Code vs. API-/Schema-Diskrepanz**.
- Fix-Vorschlag:
  Vor Übergabe `null` in `undefined` umwandeln oder den Zieltyp konsistent nullable machen.

### 4. Falscher Typ in Lina-Route

- Datei: `server/linaRoutes.ts:546`
- Fehler: `Type 'string' is not assignable to type 'number'`
- Ursache:
  In der `reel`-Generierung wird `duration: "30"` als String übergeben. Der aufgerufene API-/Funktionsvertrag erwartet offenbar eine Zahl.
  Das ist ein **GitHub-main-Codefehler**.
- Fix-Vorschlag:
  `duration: 30` als Number übergeben oder den Zieltyp explizit string-basiert machen, wenn das wirklich gewünscht ist.

## Testfehler

Gesamt:
- Testdateien: `8 failed`, `18 passed`
- Tests: `14 failed`, `301 passed`

### A. Lina API Tests

#### 1. Generate-Endpunkt liefert keinen Success-Response

- Test: `server/lina-new-endpoints.test.ts:178`
- Fehler:
  `POST /api/lina/generate > should generate a post and save to DB`
  Erwartet `success === true`, erhält `false`
- Sichtbare Ursachen aus Test-Output:
  - `server/productImageMatcher.ts:69` wirft auf `undefined.length`
  - `server/linaRoutes.ts:563` schlägt in der Produktbild-/Bildgenerierung fehl
  - `server/_core/imageGeneration.ts:38` meldet `BUILT_IN_FORGE_API_URL is not configured`
- Bewertung:
  Das wirkt wie eine **Mischung aus GitHub-Codeproblem und Backend-/Env-Diskrepanz**.
  Der Endpunkt ist nicht robust gegen fehlende Produktdaten bzw. fehlende Forge-Config.
- Fix-Vorschlag:
  Produktmatcher gegen `undefined` absichern und in `linaRoutes` bei fehlender Bildgenerierungs-Config sauber degradieren statt `success: false` zurückzugeben.

#### 2. Reel-Generate-Endpunkt ebenfalls kaputt

- Test: `server/lina-new-endpoints.test.ts:196`
- Fehler:
  `POST /api/lina/generate > should support reel content type`
  Erwartet `success === true`, erhält `false`
- Ursache:
  Hängt sehr wahrscheinlich am selben Codepfad wie oben plus dem TS-Fehler bei `duration`.
- Fix-Vorschlag:
  Zuerst den Typfehler in `server/linaRoutes.ts:546` korrigieren, danach die Bild-/Fallback-Logik im Lina-Generate-Endpunkt testfest machen.

#### 3. Lina Content API liefert mehr Ergebnisse als Tests erwarten

- Test: `server/lina-api.test.ts:94`
- Fehler:
  `GET /api/lina/content > should return approved posts`
  Erwartet `count === 1`, erhält `2`
- Ursache:
  Sehr wahrscheinlich **GitHub-Code vs. Testfixture-Diskrepanz**.
  Route liefert heute mehr Daten/Statusfälle als die alten Tests annehmen.
- Fix-Vorschlag:
  Entweder den Route-Filter wieder exakt auf die erwarteten approved-Fälle einschränken oder die Testfixture/Assertion an das aktuelle Verhalten anpassen.

#### 4. Lina Pillar-Filter Test ebenfalls veraltet

- Test: `server/lina-api.test.ts:134`
- Fehler:
  `GET /api/lina/content > should filter by pillar`
  Erwartet `count === 1`, erhält `2`
- Ursache:
  Ebenfalls eine **Route-vs-Test-Diskrepanz**.
- Fix-Vorschlag:
  Filterlogik und Testdaten gegeneinander abgleichen. Vermutlich matchen aktuell zwei Posts auf denselben Pillar.

### B. Produktdaten-Test

#### 5. Kategorien enthalten keine bekannten LR-Kategorien

- Test: `server/products.test.ts:144`
- Fehler:
  `products.categories > includes known LR categories`
  Erwartet mindestens eine bekannte Kategorie, erhält `0`
- Ursache:
  Entweder liefert `products.categories` auf GitHub-main aktuell leere/falsch formatierte Daten oder der Test erwartet alte Seed-/Import-Daten.
  Das wirkt nach **GitHub-Code vs. Manus-/Backend-Daten-Diskrepanz**.
- Fix-Vorschlag:
  Prüfen, ob `products.categories` ohne DB/Import überhaupt Daten liefern soll.
  Falls DB-abhängig, Test mocken oder Seed sicherstellen.
  Falls statisch erwartbar, Kategorienormalisierung in Produktlogik korrigieren.

### C. Tests mit echter DB-Abhängigkeit

#### 6. User settings Test findet keinen User

- Test: `server/team-features.test.ts:81`
- Fehler:
  `User Settings Router > get returns user settings`
  `TRPCError: NOT_FOUND`
- Sichtbare Ursache:
  `server/routers.ts:1369` wirft `NOT_FOUND`, weil `db.getUserById(ctx.user.id)` nichts findet.
- Ursache:
  Test verwendet offenbar keinen gemockten oder vorbereiteten User-Datensatz.
  Das ist primär eine **Test-/Backend-Setup-Diskrepanz**.
- Fix-Vorschlag:
  Testdaten für den User vorbereiten oder `db.getUserById` im Test mocken.

#### 7. A/B-Test Router braucht echte DB

- Test: `server/team-features.test.ts:121`
- Fehler:
  `A/B Test Router > create requires valid data`
  `Database not available`
- Sichtbare Ursache:
  `server/db.ts:126` in `createContentPost`
- Ursache:
  Test läuft gegen einen Routerpfad mit echter DB-Abhängigkeit, aber ohne verfügbare DB.
  Das ist eine **Testumgebungs-Diskrepanz**, kein reiner Compilerfehler.
- Fix-Vorschlag:
  Test auf Mock-DB umstellen oder die Suite nur in einer DB-fähigen Umgebung laufen lassen.

#### 8. Invite Token Test in `new-features` braucht echte DB

- Test: `server/new-features.test.ts:48`
- Fehler:
  `inviteTokens > admin can create an invite token`
  `Database not available`
- Sichtbare Ursache:
  `server/db.ts:755` in `createInviteToken`
- Ursache:
  Echte DB wird erwartet, ist aber in der Testumgebung nicht verfügbar.
- Fix-Vorschlag:
  Invite-Token-DB-Funktionen mocken oder einen Test-DB-Setup-Step einführen.

#### 9. Invite Token Verify Test in `new-features` braucht echte DB

- Test: `server/new-features.test.ts:69`
- Fehler:
  `inviteTokens > public can verify a token`
  `Database not available`
- Ursache:
  Gleiches Problem wie oben.
- Fix-Vorschlag:
  Testdaten mocken oder DB-Testsetup bereitstellen.

#### 10. Invite Token Test in `final-features` braucht echte DB

- Test: `server/final-features.test.ts:88`
- Fehler:
  `inviteTokens > create generates a valid token`
  `Database not available`
- Ursache:
  Gleiches DB-Problem wie in `new-features.test.ts`.
- Fix-Vorschlag:
  DB mocken oder Suite nur mit Test-DB laufen lassen.

#### 11. Invite Token Verify Test in `final-features` braucht echte DB

- Test: `server/final-features.test.ts:100`
- Fehler:
  `inviteTokens > verify returns valid for a created token`
  `Database not available`
- Ursache:
  Gleiches DB-Problem wie oben.
- Fix-Vorschlag:
  DB mocken oder Test-DB bereitstellen.

### D. Tests mit Secret-/Environment-Abhängigkeit

#### 12. Blotato API Key Test erwartet echtes Secret

- Test: `server/externalApis.test.ts:15`
- Fehler:
  `API key is set and non-empty`
  `process.env.BLOTATO_API_KEY` ist leer
- Ursache:
  Test hängt an einem echten Secret in der Umgebung.
  Das ist **keine GitHub-Code-Regresssion**, sondern eine **Env-Diskrepanz**.
- Fix-Vorschlag:
  Entweder Secret in CI/Test-Umgebung bereitstellen oder Test so umbauen, dass er nur bei explizitem Integration-Test-Flag läuft.

#### 13. FAL API Key fehlt komplett

- Test: `server/fal-key.test.ts:4`
- Fehler:
  `should have FAL_API_KEY set in environment`
  `FAL_API_KEY` ist `undefined`
- Ursache:
  Reiner **Environment-/Secret-Fehler**.
- Fix-Vorschlag:
  `FAL_API_KEY` in der Testumgebung setzen oder Test in eine opt-in-Integrationstest-Suite verschieben.

#### 14. FAL Authentifizierung schlägt fehl

- Test: `server/fal-key.test.ts:10`
- Fehler:
  `fal.ai API Key ist ungültig - bitte korrekten Key eintragen`
- Ursache:
  Entweder kein Key oder ungültiger Key in der Umgebung.
  Ebenfalls **Environment-/Secret-Problem**.
- Fix-Vorschlag:
  Gültigen Key bereitstellen und den Test nur in Umgebungen mit echten Secrets ausführen.

## Ursacheinschätzung

Es gibt **nicht nur ein einziges Problem**, sondern drei getrennte Problemklassen:

### 1. Echte GitHub-main-Codefehler

Diese blockieren Deployments direkt:
- `client/src/components/CommandPalette.tsx:26`
- `client/src/pages/AutoLoopPage.tsx:69`
- `client/src/pages/AutoLoopPage.tsx:96`
- `server/linaRoutes.ts:546`

Solange diese 4 TS-Fehler offen sind, ist `main` nicht build-/deployfähig.

### 2. GitHub-Code vs. Test-/Backend-Diskrepanzen

Wahrscheinliche Beispiele:
- `server/lina-api.test.ts`
- `server/lina-new-endpoints.test.ts`
- `server/products.test.ts`

Hier passen Route-/Datenverhalten und Testannahmen nicht mehr sauber zusammen.

### 3. Testumgebung unvollständig

Klare Indikatoren:
- `Database not available`
- fehlende `BLOTATO_API_KEY`
- fehlende/ungültige `FAL_API_KEY`
- fehlende `BUILT_IN_FORGE_API_URL`

Diese Fehler sagen nicht zwingend, dass Production kaputt ist, aber sie bedeuten:
- `main` ist **nicht sauber verifizierbar**
- die lokale/CI-Testumgebung bildet die erwarteten Backend-Abhängigkeiten nicht vollständig ab

## Deploy-Fazit

**Nein, der aktuelle GitHub-`main`-Branch ist in diesem Stand nicht deploybar.**

Begründung:
- Schon der TypeScript-Check bricht ab.
- Zusätzlich schlägt die Test-Suite breit fehl.
- Selbst wenn man env-/DB-abhängige Tests ausklammert, bleiben echte Codefehler im aktuellen `main`.

## Empfohlene Reihenfolge zur Behebung

1. Alle 4 TypeScript-Fehler auf `main` beheben.
2. Lina-Generate-Code gegen fehlende Produkt-/Forge-Abhängigkeiten robust machen.
3. DB-abhängige Tests klar von Unit-Tests trennen oder mit Mock/Test-DB ausstatten.
4. Secret-/Integrationstests nur mit explizitem Env-Flag und gültigen Keys laufen lassen.
5. Danach `pnpm check` und `pnpm test` erneut auf frischem `main` ausführen.
