# DNS-Sicherung & Umstellungsanleitung

**Erstellt:** 28.08.2026 · **Status:** Sicherung — es wurde NICHTS geändert
**Zweck:** Vollständige Aufnahme des Ist-Zustands vor einer möglichen DNS-Umstellung

---

## 1. Vollständige Zonen-Sicherung (Ist-Zustand)

Abgefragt wurden alle relevanten Record-Typen: A, AAAA, CNAME, NS, MX, TXT, CAA, SOA
sowie die Subdomains `www`, `mail`, `autodiscover`, `_dmarc` und fünf gängige DKIM-Selektoren.

### carwrap-mallorca.com

| Name | Typ | Wert |
|---|---|---|
| `carwrap-mallorca.com` | A | `104.18.26.246` |
| `www.carwrap-mallorca.com` | A | `104.18.26.246` |
| `carwrap-mallorca.com` | NS | `ns1.globaldomaingroup.com`, `ns2.globaldomaingroup.com` |
| `carwrap-mallorca.com` | SOA | ns1.globaldomaingroup.com · hostmaster.carwrap-mallorca.com · **Serial 2026071506** · refresh 16384 · retry 2048 · expire 1209600 · minTTL 300 |

**Nicht gesetzt** (jeweils ENODATA, d.h. Domain existiert, Record-Typ fehlt):
AAAA · CNAME · **MX** · **TXT** · CAA — auch auf `www`

### sozialmedia.best

| Name | Typ | Wert |
|---|---|---|
| `sozialmedia.best` | A | `104.18.26.246` |
| `www.sozialmedia.best` | A | `104.18.26.246` |
| `sozialmedia.best` | NS | `ns1.globaldomaingroup.com`, `ns2.globaldomaingroup.com` |
| `sozialmedia.best` | SOA | ns1.globaldomaingroup.com · hostmaster.sozialmedia.best · **Serial 2026052001** · refresh 16384 · retry 2048 · expire 1209600 · minTTL 300 |

**Nicht gesetzt:** AAAA · CNAME · **MX** · **TXT** · CAA — auch auf `www`

---

## 2. Zwei Befunde, die für die Entscheidung wichtig sind

### Es läuft keine E-Mail über diese Domains

Beide Zonen haben **keine MX- und keine TXT-Records** (kein SPF, kein DMARC, keine DKIM-Selektoren gefunden).
Die Sicherheitsauflage „E-Mail-DNS-Einträge dürfen nicht beschädigt werden" ist damit **gegenstandslos**:
Eine Änderung des A-Records kann keine E-Mail beschädigen, weil über diese Domains keine läuft.

Falls E-Mail-Adressen `@carwrap-mallorca.com` oder `@sozialmedia.best` genutzt werden, laufen sie
**nicht** über diese Zonen — das wäre vor einer Umstellung mit dem Postfach-Anbieter zu klären.

### Die Zone ist minimal — die Umstellung wäre klein

Pro Domain existieren nur zwei Web-Records (Apex + www) auf derselben IP. Eine Umstellung
beträfe genau diese zwei Einträge. Es gibt keine versteckten Abhängigkeiten in der Zone.

### Zeitlicher Hinweis aus den SOA-Serials

- carwrap-mallorca.com: Serial `2026071506` → letzte Zonenänderung um den **15.07.2026**
- sozialmedia.best: Serial `2026052001` → letzte Zonenänderung um den **20.05.2026**

Der gesunde Netlify-Deploy für carwrap datiert vom **28.07.2026** — also **nach** der letzten
DNS-Änderung. Zum Zeitpunkt dieses Deploys zeigte die Domain bereits auf Manus. Der Netlify-Deploy
ging damit ins Leere; die Seite wurde zu diesem Zeitpunkt schon von Manus ausgeliefert.

---

## 3. Umstellungsanleitung (NUR für carwrap-mallorca.com)

> Diese Umstellung ist ausdrücklich **nur für carwrap-mallorca.com** vorgesehen.
> Für **sozialmedia.best** ist sie wirkungslos — dort existiert keine Netlify-Site,
> die Domain würde ins Nichts zeigen. Diese Domain kann **ausschließlich bei Manus**
> wiederhergestellt werden.

### Voraussetzung

Zugang zum Registrar/DNS-Anbieter **GlobalDomainGroup** (ns1/ns2.globaldomaingroup.com).

### Zielzustand

| Name | Typ | Alt | Neu |
|---|---|---|---|
| `carwrap-mallorca.com` | A | `104.18.26.246` | `75.2.60.5` |
| `www.carwrap-mallorca.com` | A → CNAME | A `104.18.26.246` | CNAME `car-wrap-mallorca.netlify.app` |

Alternativ für `www`, falls der Anbieter kein CNAME erlaubt: ebenfalls A auf `75.2.60.5`.

### Ablauf

1. **Vorher:** Diese Datei als Sicherung aufbewahren — sie enthält den exakten Rückweg.
2. Im DNS-Panel den A-Record des Apex von `104.18.26.246` auf `75.2.60.5` ändern.
3. `www` entsprechend anpassen.
4. **Nichts anderes anfassen** — NS und SOA bleiben unverändert.
5. Propagation abwarten (minTTL der Zone: 300 s, real meist 5–30 Minuten).
6. In Netlify unter der Site `car-wrap-mallorca` prüfen, dass das HTTPS-Zertifikat
   für die Domain ausgestellt wird (Let's Encrypt, automatisch nach DNS-Umstellung).
7. Testen: `https://carwrap-mallorca.com/` und `https://www.carwrap-mallorca.com/`

### Rückweg (falls Manus wieder läuft)

Beide A-Records zurück auf `104.18.26.246` setzen. Mehr ist nicht nötig.

### Was diese Umstellung bedeutet

Sie ist ein **echter Hosting-Wechsel** für diese Domain, keine reine Reparatur:
Ausgeliefert würde danach der Netlify-Stand vom 28.07.2026 (Commit `b00d9cbc`), nicht
der zuletzt über Manus ausgelieferte Stand. Ob beide identisch sind, lässt sich ohne
Manus-Zugang nicht feststellen.

---

## 4. Zielsystem-Referenz (Netlify, carwrap)

| Feld | Wert |
|---|---|
| Site-Name | `car-wrap-mallorca` |
| Site-ID | `a142a0ba-fb8a-4bf9-b4d1-0b273276aad0` |
| Deploy-ID | `6a68b498abfaad00084a6fe7` |
| Deploy-Status | `ready` / `current` — fehlerfrei |
| Veröffentlicht | 28.07.2026 13:54:47 UTC |
| Commit | `b00d9cbc55a875dac79a9abd27dfc2df9f524648` (branch `main`) |
| Netlify-Subdomain | `car-wrap-mallorca.netlify.app` |
| Netlify Apex-IP | `75.2.60.5` |
| Admin | https://app.netlify.com/projects/car-wrap-mallorca |

**Sofort-Test ohne jede DNS-Änderung möglich:** `https://main--car-wrap-mallorca.netlify.app`
zeigt genau den Stand, der nach einer Umstellung ausgeliefert würde. Das sollte vor der
Umstellung geprüft werden — Bilder, Kontaktformular, WhatsApp-Buttons.
