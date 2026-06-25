# Lina_V3_Outbound_Test — Build-Spec (ElevenLabs ElevenAgents / v3)

> Zweck: Separater **Testagent** auf ElevenLabs ElevenAgents (Conversational AI) mit Eleven v3
> Expressive Mode für Outbound-Telefonie + Terminbuchung. **Production (Ultravox) bleibt unberührt.**
> Diese Datei ist paste-fertig: Agent kann damit im ElevenLabs-Web-UI gebaut werden (kein API-Zugang nötig).
>
> Stand der Doku-Verifikation: Wissensstand Jan 2026 — **nicht** live gegen elevenlabs.io/docs geprüft,
> weil diese Umgebung per Firewall keinen Zugriff auf elevenlabs.io hat. Vor Go-Live live-Docs gegenchecken.

---

## 0. Status / Blocker (was fehlt, um live zu gehen)

| # | Blocker | Typ | Wer löst |
|---|---------|-----|----------|
| 1 | **ElevenLabs-API-Key (Conversational AI / ElevenAgents)** — nirgends gefunden (Env + Make-Blueprints leer) | 🔴 hart | Mathias |
| 2 | **Egress-Firewall**: diese Umgebung erreicht `api.elevenlabs.io` nicht (HTTP 000) | 🔴 hart | Egress freischalten ODER Agent im Web-UI bauen |
| 3 | **Live-Docs** nicht prüfbar (elevenlabs.io geblockt) → v3-Telefonie-Reife unbestätigt | 🟡 | Test selbst beantwortet das |
| 4 | **Tool-Webhooks an Ultravox-`callId` gekoppelt** → für ElevenAgents Lead-Daten direkt übergeben | 🟡 | im Tool-Schema unten gelöst |

---

## 1. Bestandsaufnahme (verifiziert aus Repo + Make, read-only)

**Production-Stack (NICHT anfassen):**
- Voice-Engine: **Ultravox** (Realtime), Stimme via ElevenLabs, Telefonie Twilio, Orchestrierung Make.
- Agenten (Ultravox-IDs):
  - Outbound-Erstkontakt: `db3676bb-…` (PRODUCTION)
  - Inbound/Rückruf: `67ef590a-…` (PRODUCTION)
  - Coaching: `806df24b-…` (⛔ niemals anfassen)
- Twilio Caller-ID Outbound-Call: `[[TWILIO_VOICE_FROM]]` (real in Make hinterlegt)
- Twilio SMS-Absender: `[[TWILIO_SMS_FROM]]` (real in Make hinterlegt)

**Integrations-Glue (liegt in Make + Google, nicht im Repo):**
- `create_calendar_event` → Make-Webhook „Integration Webhooks, Google Calendar" (aktiv):
  Google-Calendar-Event (Kalender `jedermannhandy@googlemail.com`) + Lead-SMS + Partner-SMS +
  Sheet-Row „Termine_Lina". **Erwartet aktuell `callId`** und zieht Lead-Daten per `callId` aus
  Make-Datastore (163983), der beim Call-Trigger mit `leadName`/`phoneNumber`/`partnerName` vorbefüllt wird.
- `sendMathiasSummary` → eigenes Make-Szenario „Lina Summary — Mathias + aktiver Partner", gleiches Webhook-Muster.
- Google Sheet (Termine_Lina / Partner_Konto): Spreadsheet `[[SHEET_ID]]`.

**Lead-Variablen (Make `templateContext`, im Prompt als `{{…}}`):**
`leadName`, `phoneNumber`, `partnerName`, `partnerVerantwortlich`, `partnerZeitfenster`,
`leadSource`, `aktuellesDatum`, `aktuellerWochentag`, `aktuelleUhrzeit`, `aktuelleZeit`.

> ⚠️ Bekannte Inkonsistenz: Im Inbound-Make-Szenario wird teils `partnerName` mit dem **Lead**-Namen
> befüllt, `partnerVerantwortlich` trägt den **Partner**. Für den V3-Agenten gilt eindeutig:
> **Lead = `leadName` + `phoneNumber`**, **zuständiger Partner = `partnerVerantwortlich`**.

---

## 2. Agent-Grundeinstellungen

- **Name:** `Lina_V3_Outbound_Test`
- **Sprache:** Deutsch, `de-DE`
- **Voice:** zuerst bestehende „Susi/Lina"-Stimme (Voice-ID `[[SUSI_VOICE_ID]]`), falls in ElevenLabs verfügbar.
- **TTS-Modell:** **Eleven v3** (Conversational/Expressive).
  - Wenn v3 die Susi-Stimme nicht stabil hält / ElevenLabs warnt → **Variante B: Flash v2.5** als Fallback dokumentieren.
- **Speed:** 0.94–0.97 (falls Regler vorhanden), Stimme klar/warm, kein Dauer-Schauspiel.

### Conversation-Flow (Agent-Settings, NICHT im Prompt)
- Turn-taking: **Patient/Normal** (nicht aggressiv).
- Interruptions: **an**, Empfindlichkeit mittel.
- Silence/soft-timeout: **~3 s**, danach freundlich nachfassen.
- Keine Begrüßungsschleifen nach kurzen Antworten („ja"/„genau"/„passt").
- Voicemail-/AB-Detection: **aktivieren** (falls verfügbar) → Mailbox-Pfad unten.

---

## 3. Tools (ElevenLabs Webhook Tools)

> Alle drei als **Webhook Tool** anlegen. URLs = die bestehenden Make-Webhooks (real eintragen, hier maskiert).
> **Wichtig:** ElevenLabs hat keine Ultravox-`callId`. Darum Lead-Daten **direkt** im Payload übergeben
> und `conversationId` als Korrelations-ID nutzen. (Der Calendar-Webhook muss minimal angepasst werden,
> sodass er Lead-Daten aus dem Payload nimmt statt aus dem Datastore — siehe Hinweis am Ende.)

### Tool 1 — `create_calendar_event`
- Methode: `POST` → `[[MAKE_WEBHOOK_CALENDAR]]`
- Regel: **erst nach expliziter Zustimmung** aufrufen. Termin erst als „steht" bestätigen, wenn HTTP 200.
  Bei Timeout **nicht** blind mehrfach retryen.
- Body (JSON):
```json
{
  "partnerName": "{{leadName}}",
  "phoneNumber": "{{phoneNumber}}",
  "datetime": "2026-06-25T17:30:00+02:00",
  "durationMin": 30,
  "purpose": "LR Kennenlerntermin - Online-Business | Autokonzept | Beides",
  "partnerVerantwortlich": "{{partnerVerantwortlich}}",
  "leadInteresse": "Online-Business | Autokonzept | Beides",
  "conversationId": "{{system__conversation_id}}"
}
```

### Tool 2 — `sendMathiasSummary`
- Methode: `POST` → `[[MAKE_WEBHOOK_SUMMARY]]`
- Zweck: nach **jedem** Call Ergebnis senden.
- Body (JSON):
```json
{
  "leadName": "{{leadName}}",
  "phoneNumber": "{{phoneNumber}}",
  "leadSource": "LR",
  "outcome": "TERMIN_VEREINBART | KEIN_INTERESSE | RUECKRUF_SPAETER | DURCHGESTELLT | NICHT_ERREICHT | VOICEMAIL",
  "summary": "kurze Stichpunkte",
  "terminDatum": "ISO-8601 oder leer",
  "partnerVerantwortlich": "{{partnerVerantwortlich}}",
  "leadInteresse": "Online-Business | Autokonzept | Beides",
  "conversationId": "{{system__conversation_id}}"
}
```

### Tool 3 — `transfer_to_number` (System-Tool: Transfer to number)
- Ziel: `{{partnerVerantwortlich}}`-Nummer, sonst Mathias.
- Wenn **keine** Partnernummer vorhanden → **nicht raten**, stattdessen Termin buchen.

---

## 4. System Prompt (de-DE, kurz halten)

```
Du bist Lina, die KI-Assistentin von Mathias vom L R Lifestyle Team.

Du telefonierst mit Interessenten, die sich vorher wegen L R gemeldet haben.
Dein Ziel ist nicht zu verkaufen. Dein Ziel ist ein kurzer, sauber bestaetigter
Termin mit {{partnerVerantwortlich}}.

Transparenz:
Wenn jemand fragt, ob du eine KI bist, sagst du freundlich:
"Ja genau, ich bin Linas KI-Stimme fuer Mathias. Ich klaere nur kurz vor und
trag dir den passenden Termin ein."

Sprechstil:
- Deutsch, locker, warm, klar. Kurze Saetze. Meist ein bis zwei Saetze pro Antwort.
- Immer nur eine Frage auf einmal. Kein Vortrag. Kein Druck. Keine Listen vorlesen.
- Keine internen Toolnamen nennen. Begruesse genau einmal.
- Wiederhole nie "Hallo, hier ist Lina", nachdem der Lead geantwortet hat.
- Wenn der Lead nur "ja", "genau", "passt", "okay" sagt: akzeptiere das und mach weiter.

Lachen/Emotion:
- [laughs] sehr selten, max. einmal pro Call, nur wenn der Lead selbst locker klingt.
- Nie bei Skepsis, Preis-, MLM-Fragen, Terminbestaetigung oder Fehlern.
- Ein Laecheln im Ton ist besser als Lachen. Nach [laughs] sofort wieder ruhig.

Start (Outbound):
- Mit {{leadName}}: "Hallo {{leadName}}, hier ist Lina, die KI-Assistentin von
  Mathias vom L R Lifestyle Team. Passt es gerade ganz kurz?"
- Ohne {{leadName}}: "Hallo, hier ist Lina, die KI-Assistentin von Mathias vom
  L R Lifestyle Team. Mit wem spreche ich denn?"

Interesse klaeren (wenn Zeit):
"Super. Du hattest dich wegen L R gemeldet. Geht's dir eher ums Online-Business
von zu Hause, ums Autokonzept, oder beides?"
Einordnung: Online/Zuhause/Nebeneinkommen = Online-Business · Auto/Autokonzept = Autokonzept
· beides/offen/weiss nicht = Beides.

Termin anbieten (nach Interesse), Fenster aus {{partnerZeitfenster}}:
- Ganztag 8-21 · Vormittag 8-12 · Nachmittag 13-17 · Abend 17-21. Wochenende erlaubt.
- Nur Termine im erlaubten Fenster vorschlagen.
- Bei "egal/jederzeit/asap": naechsten sinnvollen Slot selbst vorschlagen.
"Alles klar. Dann macht ein kurzes Gespraech mit {{partnerVerantwortlich}} Sinn.
Passt dir eher {{slot1}} oder {{slot2}}?"

Vor der Buchung exakt zusammenfassen:
"Super, dann fasse ich kurz zusammen: Termin mit {{partnerVerantwortlich}} am
{{datum}} um {{uhrzeit}}. Stimmt das so?"
Erst bei klarer Zustimmung: create_calendar_event aufrufen.

Nach erfolgreicher Buchung (HTTP 200):
"Perfekt, der Termin steht. {{partnerVerantwortlich}} meldet sich dann am {{datum}}
um {{uhrzeit}} bei dir. Hast du sonst noch Fragen, oder ist soweit alles klar?"
Keine Fragen: "Alles klar, danke dir. Dann bis zum Termin."

Tool-Fehler (kein 200): NICHT sagen, dass der Termin eingetragen ist. Stattdessen:
"Okay, mein System hakt gerade kurz. Ich hab den Termin notiert, die Bestaetigung
kommt gleich per SMS." Danach sendMathiasSummary aufrufen.

Keine Zeit: "Alles gut. Dann machen wir einfach einen kurzen Rueckruf fest.
Passt dir eher heute Abend oder morgen?"
Infos per Mail: "Klar. Damit du nichts Unpassendes bekommst: Online-Business,
Autokonzept, oder beides?"
Was kostet das: "Gute Frage. Die genauen Konditionen erklaert dir
{{partnerVerantwortlich}} im Termin sauber. Ich will dir nichts Halbes erzaehlen."
MLM/Schneeball: "Versteh ich, dass du das fragst. L R ist ein echtes Unternehmen
mit Produkten im Gesundheits- und Beautybereich. Wie das Modell genau funktioniert,
zeigt dir {{partnerVerantwortlich}} transparent im Termin."
Kein Interesse: "Alles klar, danke dir fuer die Rueckmeldung. Schoenen Tag."
Danach sendMathiasSummary outcome KEIN_INTERESSE.

Mailbox (Ansage/Piepton/keine echte Person):
"Hallo, hier ist Lina vom L R Lifestyle Team. Ich versuch es spaeter nochmal.
Schoenen Tag." Dann sendMathiasSummary outcome VOICEMAIL und auflegen.

Leitplanken: keine erfundenen Termine/Fakten, keine Heilversprechen, keine
Einkommensgarantien. Echte Lead-Nummer nutzen, nie Mathias' Nummer als Lead.
```

---

## 5. Einzel-Testcall (kein Batch!) — Twilio Outbound

> Erst nach Mathias' ausdrücklicher Freigabe und **nur** an Testnummer `+49 1715060008`.
> Aus dieser Umgebung nicht ausführbar (Egress) → vom Laptop / aus ElevenLabs-UI starten.

```bash
curl -X POST "https://api.elevenlabs.io/v1/convai/twilio/outbound-call" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "[[NEW_AGENT_ID]]",
    "agent_phone_number_id": "[[ELEVENLABS_PHONE_NUMBER_ID]]",
    "to_number": "+491715060008",
    "conversation_initiation_client_data": {
      "dynamic_variables": {
        "leadName": "Test Mathias",
        "phoneNumber": "+491715060008",
        "partnerVerantwortlich": "Mathias",
        "partnerZeitfenster": "Ganztag",
        "leadSource": "LR"
      }
    }
  }'
```
> Endpoint/Feldnamen vor Nutzung gegen aktuelle ElevenLabs-Docs prüfen (Doku hier nicht live verifizierbar).

---

## 6. Testmatrix (min. 10 Einzeltests, dokumentieren: Transcript, ConversationID, ToolCalls, Latenz, Interrupts, Terminquote)

1. Lead sagt nur „ja". 2. 2 s Denkpause. 3. „beides". 4. Lead unterbricht.
5. „bist du eine KI?" 6. „schick mir Infos". 7. „was kostet das?". 8. „halb acht".
9. Termin außerhalb Partner-Fenster. 10. Mailbox.

Bewertung: menschlicher als Ultravox/Flash? · Susi-Stimme stabil? · Lachen natürlich? ·
Schneidet sie ab? · Begrüßung wiederholt? · Termin korrekt? · `create_calendar_event`
erst nach Bestätigung? · Termin erst nach 200 bestätigt? · `sendMathiasSummary` am Ende?

---

## 7. Vergleich: Ultravox/Flash (Production) vs. ElevenAgents/v3 (Test)

| Kriterium | Ultravox + Flash v2.5 (heute, live) | ElevenAgents + v3 (Test) |
|---|---|---|
| Status | produktiv, stabil | neu, unbestätigt |
| Latenz Telefon | niedrig (Realtime-Flash) | v3 expressive tendenziell höher — **Hauptrisiko fürs Telefon** |
| Emotion/Ausdruck | begrenzt (Realtime) | stärker (Tags wie [laughs]) — aber sparsam nötig |
| Turn-taking/Interrupt/Silence | über Ultravox-Settings | native Flow-Settings (sauberer trennbar) |
| Outbound-Telefonie | Twilio (läuft) | Twilio + SIP (laut Docs unterstützt) |
| Batch-Calling | Make-getrieben | native Batch Calls |
| Tools/Webhooks | Make-Webhooks (callId-gekoppelt) | Webhook-Tools (Lead-Daten direkt) |
| Integrations-Aufwand | 0 (läuft) | mittel (Calendar-Webhook entkoppeln) |

**Erwartung (Wissensstand Jan 2026, nicht live-verifiziert):** v3 expressive war für **Live-Telefonie
mit niedriger Latenz noch nicht produktionsreif**; der Realtime-Pfad war Flash v2.5. → Für Production
vermutlich **Flash-Variante** überlegen; v3-Test trotzdem sinnvoll, um Latenz/Stimme real zu messen
und ElevenAgents-Flow-Control vs. Ultravox zu bewerten.

**Empfehlung:** Test bauen (v3 + Flash-Fallback), 10 Calls fahren, **erst danach** über Umschalten
entscheiden. Bis dahin **Ultravox bleibt Production**.

---

## 8. Offene Punkte / TODO vor Go-Live
- [ ] ElevenLabs-API-Key (Conversational AI) bereitstellen → `$ELEVENLABS_API_KEY`.
- [ ] Egress `api.elevenlabs.io` freischalten **oder** Agent im Web-UI bauen.
- [ ] Susi/Lina Voice-ID in ElevenLabs verifizieren.
- [ ] ElevenLabs-Telefonnummer (`agent_phone_number_id`) anlegen/verknüpfen.
- [ ] Calendar-Webhook minimal entkoppeln: Lead-Daten aus Payload statt Datastore-`callId`.
- [ ] Platzhalter `[[…]]` mit realen Werten füllen (Webhook-URLs, Voice-ID, Nummern, Sheet-ID).
- [ ] Live gegen offizielle ElevenLabs-Docs gegenchecken (Endpoints/Feldnamen).
```
