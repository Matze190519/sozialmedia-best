#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# lina-v3-create-agent.sh
# Legt den Testagenten "Lina_V3_Outbound_Test" auf ElevenLabs ElevenAgents an.
# Production (Ultravox) wird NICHT angefasst. Nur ein NEUER Agent wird erstellt.
#
# AUSFÜHREN VOM LAPTOP (nicht aus der Cloud-Build-Umgebung — die hat keinen
# Netzzugang zu api.elevenlabs.io).
#
# Voraussetzungen (als ENV setzen, NICHT hier reinschreiben):
#   export ELEVENLABS_API_KEY="..."     # Conversational-AI-Key
#   export SUSI_VOICE_ID="..."          # Voice-ID der Susi/Lina-Stimme
#   export MAKE_WEBHOOK_CALENDAR="..."  # Make-Webhook create_calendar_event
#   export MAKE_WEBHOOK_SUMMARY="..."   # Make-Webhook sendMathiasSummary
#
# Optional:
#   export VOICE_MODEL="eleven_v3"          # oder "eleven_turbo_v2_5" (Flash-Fallback)
#   export LLM_MODEL="gemini-2.0-flash"     # LLM hinter dem Agenten
#
# HINWEIS ZU FELDNAMEN: Struktur nach ElevenLabs ConvAI API (Stand Jan 2026,
# NICHT live verifiziert). Falls die API ein Feld ablehnt, nennt die Fehlermeldung
# das Feld — dann gegen https://elevenlabs.io/docs/api-reference/agents/create prüfen.
# ---------------------------------------------------------------------------
set -euo pipefail

: "${ELEVENLABS_API_KEY:?Bitte ELEVENLABS_API_KEY setzen}"
: "${SUSI_VOICE_ID:?Bitte SUSI_VOICE_ID setzen}"
: "${MAKE_WEBHOOK_CALENDAR:?Bitte MAKE_WEBHOOK_CALENDAR setzen}"
: "${MAKE_WEBHOOK_SUMMARY:?Bitte MAKE_WEBHOOK_SUMMARY setzen}"
VOICE_MODEL="${VOICE_MODEL:-eleven_v3}"
LLM_MODEL="${LLM_MODEL:-gemini-2.0-flash}"
API="https://api.elevenlabs.io"

# --- System-Prompt (kurz gehalten, de-DE) ----------------------------------
read -r -d '' SYSTEM_PROMPT <<'PROMPT' || true
Du bist Lina, die KI-Assistentin von Mathias vom L R Lifestyle Team.
Du telefonierst mit Interessenten, die sich vorher wegen L R gemeldet haben.
Dein Ziel ist nicht zu verkaufen. Dein Ziel ist ein kurzer, sauber bestaetigter
Termin mit {{partnerVerantwortlich}}.

Transparenz: Wenn jemand fragt, ob du eine KI bist, sag freundlich:
"Ja genau, ich bin Linas KI-Stimme fuer Mathias. Ich klaere nur kurz vor und trag
dir den passenden Termin ein."

Sprechstil: Deutsch, locker, warm, klar. Kurze Saetze, meist ein bis zwei pro Antwort.
Immer nur eine Frage auf einmal. Kein Vortrag, kein Druck, keine Listen vorlesen.
Keine internen Toolnamen nennen. Begruesse genau einmal. Wiederhole nie
"Hallo, hier ist Lina", nachdem der Lead geantwortet hat. Wenn der Lead nur "ja",
"genau", "passt", "okay" sagt: akzeptiere das und mach weiter.

Lachen: [laughs] sehr selten, max. einmal pro Call, nur wenn der Lead selbst locker
klingt. Nie bei Skepsis, Preis-, MLM-Fragen, Terminbestaetigung oder Fehlern.

Interesse klaeren (wenn Zeit): "Super. Du hattest dich wegen L R gemeldet. Geht's dir
eher ums Online-Business von zu Hause, ums Autokonzept, oder beides?"
Einordnung: Online/Zuhause/Nebeneinkommen=Online-Business; Auto/Autokonzept=Autokonzept;
beides/offen/weiss nicht=Beides.

Termin (Fenster aus {{partnerZeitfenster}}): Ganztag 8-21, Vormittag 8-12,
Nachmittag 13-17, Abend 17-21. Wochenende erlaubt. Nur Termine im Fenster vorschlagen.
Bei "egal/jederzeit/asap": naechsten sinnvollen Slot selbst vorschlagen.
"Alles klar. Dann macht ein kurzes Gespraech mit {{partnerVerantwortlich}} Sinn.
Passt dir eher {{slot1}} oder {{slot2}}?"

Vor Buchung exakt zusammenfassen: "Super, dann fasse ich kurz zusammen: Termin mit
{{partnerVerantwortlich}} am {{datum}} um {{uhrzeit}}. Stimmt das so?"
Erst bei klarer Zustimmung create_calendar_event aufrufen.

Nach Erfolg (HTTP 200): "Perfekt, der Termin steht. {{partnerVerantwortlich}} meldet
sich dann am {{datum}} um {{uhrzeit}} bei dir. Hast du sonst noch Fragen?"
Keine Fragen: "Alles klar, danke dir. Dann bis zum Termin."

Tool-Fehler (kein 200): NICHT sagen, dass der Termin eingetragen ist. Sag: "Okay, mein
System hakt gerade kurz. Ich hab den Termin notiert, die Bestaetigung kommt gleich per
SMS." Danach sendMathiasSummary aufrufen.

Keine Zeit: "Alles gut. Dann machen wir einfach einen kurzen Rueckruf fest. Passt dir
eher heute Abend oder morgen?"
Infos per Mail: "Klar. Damit du nichts Unpassendes bekommst: Online-Business,
Autokonzept, oder beides?"
Kosten: "Gute Frage. Die genauen Konditionen erklaert dir {{partnerVerantwortlich}} im
Termin sauber. Ich will dir nichts Halbes erzaehlen."
MLM/Schneeball: "Versteh ich, dass du das fragst. L R ist ein echtes Unternehmen mit
Produkten im Gesundheits- und Beautybereich. Wie das Modell funktioniert, zeigt dir
{{partnerVerantwortlich}} transparent im Termin."
Kein Interesse: "Alles klar, danke dir fuer die Rueckmeldung. Schoenen Tag." Danach
sendMathiasSummary outcome KEIN_INTERESSE.
Mailbox (Ansage/Piepton/keine echte Person): "Hallo, hier ist Lina vom L R Lifestyle
Team. Ich versuch es spaeter nochmal. Schoenen Tag." Dann sendMathiasSummary outcome
VOICEMAIL und auflegen.

Leitplanken: keine erfundenen Termine/Fakten, keine Heilversprechen, keine
Einkommensgarantien. Immer die echte Lead-Nummer nutzen, nie Mathias' Nummer als Lead.
PROMPT

FIRST_MSG='Hallo {{leadName}}, hier ist Lina, die KI-Assistentin von Mathias vom L R Lifestyle Team. Passt es gerade ganz kurz?'

# --- Payload zusammenbauen (jq) --------------------------------------------
# Tools als inline webhook-tools im prompt. Bei neueren API-Versionen ggf. via
# /v1/convai/tools + tool_ids referenzieren -> siehe Doku-Hinweis oben.
PAYLOAD=$(jq -n \
  --arg name "Lina_V3_Outbound_Test" \
  --arg prompt "$SYSTEM_PROMPT" \
  --arg first "$FIRST_MSG" \
  --arg voice "$SUSI_VOICE_ID" \
  --arg vmodel "$VOICE_MODEL" \
  --arg llm "$LLM_MODEL" \
  --arg wh_cal "$MAKE_WEBHOOK_CALENDAR" \
  --arg wh_sum "$MAKE_WEBHOOK_SUMMARY" \
'{
  name: $name,
  conversation_config: {
    agent: {
      first_message: $first,
      language: "de",
      prompt: {
        prompt: $prompt,
        llm: $llm,
        temperature: 0.4,
        tools: [
          {
            type: "webhook",
            name: "create_calendar_event",
            description: "Legt einen Termin an. NUR nach expliziter Zustimmung des Leads aufrufen.",
            api_schema: {
              url: $wh_cal, method: "POST",
              request_body_schema: { type: "object", required: ["partnerName","phoneNumber","datetime","partnerVerantwortlich"], properties: {
                partnerName: {type:"string", description:"Name des Leads"},
                phoneNumber: {type:"string", description:"Echte Telefonnummer des Leads, nie Mathias"},
                datetime: {type:"string", description:"ISO-8601 mit +02:00, z.B. 2026-06-25T17:30:00+02:00"},
                durationMin: {type:"number", description:"Standard 30"},
                purpose: {type:"string", description:"z.B. LR Kennenlerntermin - Online-Business"},
                partnerVerantwortlich: {type:"string"},
                leadInteresse: {type:"string", description:"Online-Business | Autokonzept | Beides"},
                conversationId: {type:"string"}
              }}
            }
          },
          {
            type: "webhook",
            name: "sendMathiasSummary",
            description: "Nach JEDEM Call das Ergebnis senden.",
            api_schema: {
              url: $wh_sum, method: "POST",
              request_body_schema: { type: "object", required: ["leadName","phoneNumber","outcome"], properties: {
                leadName: {type:"string"}, phoneNumber: {type:"string"}, leadSource: {type:"string"},
                outcome: {type:"string", description:"TERMIN_VEREINBART|KEIN_INTERESSE|RUECKRUF_SPAETER|DURCHGESTELLT|NICHT_ERREICHT|VOICEMAIL"},
                summary: {type:"string"}, terminDatum: {type:"string"},
                partnerVerantwortlich: {type:"string"}, leadInteresse: {type:"string"}, conversationId: {type:"string"}
              }}
            }
          },
          { type: "system", name: "transfer_to_number", description: "Zu {{partnerVerantwortlich}} weiterleiten, wenn der Lead jetzt direkt sprechen will. Ohne Partnernummer NICHT raten, dann Termin buchen." }
        ]
      }
    },
    tts: { voice_id: $voice, model_id: $vmodel, speed: 0.95 },
    turn: { turn_timeout: 3, mode: "turn" }
  }
}')

echo ">> Erstelle Agent Lina_V3_Outbound_Test (Voice-Model: $VOICE_MODEL) ..."
RESP=$(curl -sS -X POST "$API/v1/convai/agents/create" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "$RESP" | jq . 2>/dev/null || echo "$RESP"
AGENT_ID=$(echo "$RESP" | jq -r '.agent_id // empty' 2>/dev/null || true)
if [ -n "$AGENT_ID" ]; then
  echo ""
  echo "✅ FERTIG. Neue Agent-ID: $AGENT_ID"
  echo "   -> In lina-v3-test-call.sh als AGENT_ID verwenden."
else
  echo ""
  echo "⚠️  Kein agent_id in der Antwort. Fehlermeldung oben prüfen (ggf. Feldnamen"
  echo "    gegen https://elevenlabs.io/docs/api-reference/agents/create abgleichen)."
fi
