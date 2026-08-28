# Ausfall-Diagnose — sozialmedia.best & carwrap-mallorca.com

**Erstellt:** 28.08.2026 · **Status:** Diagnose abgeschlossen, KEINE Änderungen vorgenommen
**Zweck:** Sicherung des Ist-Zustands vor jeder Reparatur (gemäß Arbeitsauftrag)

---

## 1. Gemessener Ist-Zustand

### DNS (die entscheidende Messung)

| Domain | A-Record | Nameserver |
|---|---|---|
| sozialmedia.best | `104.18.26.246` | ns1/ns2.globaldomaingroup.com |
| carwrap-mallorca.com | `104.18.26.246` | ns1/ns2.globaldomaingroup.com |

**Beide Domains zeigen auf dieselbe IP.**

### Vergleichswerte zur Einordnung

| Ziel | IP-Bereich | Bedeutung |
|---|---|---|
| `manus.space` | 104.19.x.x (Cloudflare) | Manus-Plattform |
| **Beide Domains** | **104.18.26.246 (Cloudflare)** | **→ Manus-Infrastruktur** |
| `car-wrap-mallorca.netlify.app` | 18.208.x / 98.84.x (AWS) | Netlify-Infrastruktur |
| Netlify Apex-Standard | 75.2.60.5 | (nicht gesetzt) |

### HTTP-Antwort (vom Betreiber gemeldet)
```
HTTP 503 — "This site is under maintenance"
x-manus-original-status: 404
retry-after: 216000   (= 60 Stunden)
```

Der Header `x-manus-original-status` beweist: Die Anfrage wird von **Manus-Infrastruktur** beantwortet, nicht von Netlify. Netlify würde `x-nf-request-id` senden.

---

## 2. Hosting-Konto Netlify (Zugriff vorhanden)

**Konto:** Mathias Vinzing (Google-Login) · 66 Sites
**Team-ID:** `68d2d6d33eeb739afdf5f160` · Letzter Login: 28.08.2026

### sozialmedia.best
**Existiert NICHT in Netlify.** Suche nach "sozialmedia" ergab null Treffer.
Auch keine Site mit dieser Domain als Primary URL unter den LR-Projekten.

### carwrap-mallorca.com — Site existiert und ist gesund

| Feld | Wert |
|---|---|
| Site-Name | `car-wrap-mallorca` |
| **Site-ID** | `a142a0ba-fb8a-4bf9-b4d1-0b273276aad0` |
| Team | 68d2d6d33eeb739afdf5f160 (Mathias Vinzing) |
| Plan | nf_team_pro |
| Primary URL | `http://carwrap-mallorca.com` (Domain **ist** zugeordnet) |
| Netlify-Subdomain | main--car-wrap-mallorca.netlify.app |
| Zugriffsschutz | keiner (kein Passwort, kein SSO) |

**Produktions-Deployment:**

| Feld | Wert |
|---|---|
| Deploy-ID | `6a68b498abfaad00084a6fe7` |
| **Status** | **`ready` / `current`** — fehlerfrei |
| Veröffentlicht | 28.07.2026 13:54:47 UTC |
| Branch | main |
| Commit | `b00d9cbc55a875dac79a9abd27dfc2df9f524648` |
| Repo | Matze190519/allwecanprint-landing |
| Framework | vite |
| Fehler | keine (`error_message: null`) |
| Redirects/Header | 2 Redirect-Regeln, 5 Header-Regeln — alle fehlerfrei |
| Alias | `https://carwrap-mallorca.com` |

---

## 3. Repository-Befunde

### Matze190519/sozialmedia-best
- **Keine** `netlify.toml`, **keine** `vercel.json`
- Enthält `.manus/` Verzeichnis und `vite-plugin-manus-runtime` in package.json
- → **eindeutig Manus-Projekt, nie für Netlify konfiguriert**
- Letzter `main`-Commit: **17.04.2026** (4 Monate alt)
- `main` hat einen TypeScript-Fehler: `KanbanPage.tsx:226` ruft `refetch()` auf, das in Zeile 138 nicht deklariert wird → `pnpm build` bricht ab
- Hinweis: Laut Manus-Übergabedoku ist das **Live-Deployment-Repo `lr-approval-dashboard`**, nicht dieses Repo

### Matze190519/allwecanprint-landing
- **Konnte nicht geprüft werden** — die Claude-GitHub-App hat keinen Zugriff auf dieses Repository
- Indirekt aus dem Netlify-Deploy belegt: Build lief fehlerfrei (vite), Commit `b00d9cbc`, 215 Dateien, Redirects/Header korrekt verarbeitet

---

## 4. Ist der TypeScript-Fehler die Ursache des 503?

**Nein.** Vier unabhängige Gründe:

1. **Zeitpunkt der Antwort:** Der 503 entsteht am Edge, *bevor* App-Code läuft. `x-manus-original-status: 404` heißt: Der Origin fand überhaupt keine Anwendung — kein Laufzeitfehler der App.
2. **Zwei Domains gleichzeitig:** Ein Codefehler in einem Repo kann nicht zwei getrennte Projekte mit unterschiedlichen Codebasen gleichzeitig lahmlegen.
3. **Falsches Repo:** `sozialmedia-best` ist nicht die Deployment-Quelle des Live-Systems.
4. **Verhalten bei Build-Fehlern:** Ein fehlgeschlagener Build lässt das *letzte erfolgreiche* Deployment online — er nimmt die Seite nicht vom Netz.

Der TypeScript-Fehler ist ein **echtes, aber separates** Problem (blockiert künftige Deployments aus diesem Repo). Fix liegt als PR #37 vor.

---

## 5. Schlussfolgerung

**Ursache: Beide Domains zeigen per DNS auf Manus-Hosting. Dort liefert der Origin für beide Projekte 404, was die Manus-Edge in die generische 503-Wartungsseite übersetzt.**

Das `retry-after` von 60 Stunden und der gleichzeitige Ausfall zweier unabhängiger Projekte sprechen für ein **konto-/plattformseitiges Problem bei Manus** (abgelaufenes Guthaben, ausgesetztes Konto oder zurückgezogene Veröffentlichungen) — nicht für einen Einzelprojekt-Defekt.

**Netlify ist bei beiden Domains nicht im Traffic-Pfad:**
- `sozialmedia.best` — dort gar nicht angelegt
- `carwrap-mallorca.com` — Site vorhanden und **gesund** (Deploy `ready`, Domain zugeordnet), aber DNS leitet den Verkehr nicht dorthin

---

## 6. Ausdrücklich NICHT vorgenommen

- Keine neue Site angelegt
- Keine bestehende Site gelöscht
- **Keine DNS-Einträge geändert**
- Kein Deployment ausgelöst (weder Netlify noch anderswo)
- Keine Umgebungsvariablen, Datenbank, Partnerdaten, Lina-Logik oder WhatsApp-Konfiguration berührt
- Keine Umgehung fehlender Zugänge versucht

---

## 7. Fehlende Zugänge

| Zugang | Status | Auswirkung |
|---|---|---|
| Manus-Konto | **fehlt vollständig** | Reparatur ist nur dort möglich |
| GitHub `allwecanprint-landing` | **kein App-Zugriff** | Repo-Details ungeprüft |
| Live-Domains per HTTP | durch Netzwerk-Policy dieser Umgebung gesperrt | Verifikation muss der Betreiber fahren |
| Netlify | vorhanden ✓ | vollständig geprüft |
| GitHub `sozialmedia-best` | vorhanden ✓ | vollständig geprüft |
