/**
 * Content Remix Engine - 1 Post → 7 Formate
 * 
 * Formate:
 * 1. Instagram Carousel (5-10 Slides)
 * 2. TikTok/Reel Script (15-60s)
 * 3. LinkedIn Thought Leadership
 * 4. YouTube Shorts Script
 * 5. Twitter/X Thread (5-10 Tweets)
 * 6. ASMR Script (Flüster-Content, Tapping, Unboxing)
 * 7. Hopecore/Motivational Reel (Emotional, Cinematic)
 */

export type RemixFormat = 
  | "carousel" 
  | "reel_script" 
  | "linkedin" 
  | "youtube_shorts" 
  | "twitter_thread" 
  | "asmr_script" 
  | "hopecore_reel";

export interface RemixResult {
  format: RemixFormat;
  formatLabel: string;
  content: string;
  platform: string;
  estimatedDuration?: string;
  productionNotes?: string;
  musicSuggestion?: string;
  hashtags: string[];
}

export interface FullRemixResult {
  originalContent: string;
  remixes: RemixResult[];
  totalFormats: number;
}

const FORMAT_CONFIGS: Record<RemixFormat, {
  label: string;
  platform: string;
  systemPrompt: string;
}> = {
  carousel: {
    label: "Instagram Karussell",
    platform: "instagram",
    systemPrompt: `Erstelle ein Instagram Karussell (5-8 Slides) aus dem Content.

FORMAT:
Slide 1: Hook (fesselnder Einstieg, max 10 Wörter)
Slide 2-6: Kernbotschaften (1 Punkt pro Slide, kurz und knackig)
Slide 7: CTA (Call-to-Action)

REGELN:
- Jede Slide max 30 Wörter
- Große, lesbare Schrift simulieren (kurze Sätze)
- Emojis sparsam einsetzen
- Slide 1 MUSS den Scroll stoppen
- Letzte Slide: Starker CTA mit "Speichern" oder "Teilen" Aufforderung
- 3-5 relevante Hashtags am Ende`,
  },

  reel_script: {
    label: "TikTok/Reel Script",
    platform: "tiktok",
    systemPrompt: `Erstelle ein TikTok/Reel Script (15-60 Sekunden) aus dem Content.

FORMAT:
[HOOK - 0:00-0:03] (Fesselt sofort, max 1 Satz)
[SETUP - 0:03-0:10] (Problem/Kontext aufbauen)
[CONTENT - 0:10-0:40] (Hauptbotschaft, 3-4 Punkte)
[TWIST/PAYOFF - 0:40-0:50] (Überraschung oder Aha-Moment)
[CTA - 0:50-0:60] (Was soll der Zuschauer tun?)

REGELN:
- Gesprochen, nicht geschrieben (natürlich, wie ein Gespräch)
- Schnelle Schnitte alle 3-5 Sekunden
- Visuell beschreiben: [B-Roll: ...] [Text-Overlay: ...] [Zoom auf...]
- Trending Audio Vorschlag
- Maximal 60 Sekunden
- 3-4 Hashtags`,
  },

  linkedin: {
    label: "LinkedIn Thought Leadership",
    platform: "linkedin",
    systemPrompt: `Erstelle einen LinkedIn Thought Leadership Post aus dem Content.

FORMAT:
Zeile 1: Provokanter Hook (max 1 Satz, wird im Feed angezeigt)
[Leerzeile]
Absatz 1: Persönliche Geschichte/Erfahrung (3-4 Sätze)
[Leerzeile]
Absatz 2: Kernbotschaft mit Daten/Fakten (3-4 Sätze)
[Leerzeile]
Absatz 3: Lesson Learned / Takeaway (2-3 Sätze)
[Leerzeile]
CTA: Frage an die Community
[Leerzeile]
2-3 Hashtags

REGELN:
- Professioneller aber persönlicher Ton
- Storytelling-Ansatz
- Keine Emojis-Überflutung (max 3-4 dezent)
- 1.300-2.000 Zeichen optimal
- Frage am Ende für Kommentare`,
  },

  youtube_shorts: {
    label: "YouTube Shorts Script",
    platform: "youtube",
    systemPrompt: `Erstelle ein YouTube Shorts Script (30-60 Sekunden) aus dem Content.

FORMAT:
[THUMBNAIL-TEXT: max 5 Wörter]
[HOOK - 0:00-0:05] Direkt in die Kamera, fesselnd
[CONTENT - 0:05-0:45] Hauptbotschaft, schnell und energisch
[PAYOFF - 0:45-0:55] Überraschung, Ergebnis oder Transformation
[CTA - 0:55-0:60] "Abonnieren" + "Folge für mehr"

REGELN:
- Vertikal (9:16)
- Schnelle Energie, keine Pausen
- Text-Overlays für Kernpunkte
- Trending Sound/Musik Vorschlag
- Thumbnail-Text der klicken lässt`,
  },

  twitter_thread: {
    label: "X/Twitter Thread",
    platform: "twitter",
    systemPrompt: `Erstelle einen X/Twitter Thread (5-8 Tweets) aus dem Content.

FORMAT:
Tweet 1/X: Hook + "🧵 Thread:" (max 280 Zeichen)
Tweet 2/X: Kontext/Problem
Tweet 3-6/X: Kernpunkte (1 pro Tweet)
Tweet 7/X: Zusammenfassung
Tweet 8/X: CTA + "RT wenn du zustimmst"

REGELN:
- Jeder Tweet max 280 Zeichen
- Tweet 1 MUSS zum Klicken auf "Mehr anzeigen" verleiten
- Nummerierung: 1/, 2/, etc.
- Emojis als Aufzählungszeichen
- Letzter Tweet: Retweet-CTA`,
  },

  asmr_script: {
    label: "ASMR Script",
    platform: "tiktok",
    systemPrompt: `Erstelle ein ASMR-Script für TikTok/Instagram aus dem Content.

ASMR-TYPEN (wähle den passendsten):
1. Flüster-ASMR: Leises Flüstern über das Thema
2. Unboxing-ASMR: Produkt auspacken mit Geräuschen
3. Tapping-ASMR: Auf Produkte tippen, Texturen zeigen
4. Roleplay-ASMR: Beratungsgespräch als ASMR
5. Get-Ready-With-Me ASMR: Routine mit Produkten

FORMAT:
[ASMR-TYP: z.B. Flüster-Unboxing]
[DAUER: 30-90 Sekunden]

[0:00-0:05] HOOK (Flüstern): "Psst... ich zeige dir etwas Besonderes..."
[SOUND: Paket-Rascheln / Tapping / Wasser]
[0:05-0:15] SETUP: Produkt/Thema vorstellen (geflüstert)
[SOUND: Deckel öffnen / Creme-Textur / Spray]
[0:15-0:40] CONTENT: Hauptbotschaft (ASMR-Stil)
[SOUND: Tapping auf Produkt / Eincremen / Blättern]
[0:40-0:50] PAYOFF: Ergebnis zeigen
[0:50-0:60] CTA (geflüstert): "Link in Bio..."

REGELN:
- Alles geflüstert oder sehr leise gesprochen
- Soundeffekte in [SOUND: ...] beschreiben
- Visuelle Nahaufnahmen beschreiben [CLOSE-UP: ...]
- Langsame, beruhigende Bewegungen
- KEIN lauter Ton, KEINE Musik
- Mikrofon-Empfehlung angeben
- Hashtags: #ASMR #asmrsounds #satisfying + themenspezifisch`,
  },

  hopecore_reel: {
    label: "Hopecore/Motivational Reel",
    platform: "instagram",
    systemPrompt: `Erstelle ein Hopecore/Motivational Reel Script aus dem Content.

HOPECORE-STIL:
- Emotional, cinematic, inspirierend
- Slow-Motion B-Roll + motivierender Voiceover
- "Gänsehaut-Momente" erzeugen
- Transformation zeigen (Vorher → Nachher)
- Musik: Episch, emotional (Hans Zimmer Stil)

FORMAT:
[MUSIK: Epischer, emotionaler Track - z.B. "Time" von Hans Zimmer Stil]
[VISUAL: Cinematic B-Roll Beschreibung]

[0:00-0:05] HOOK (Voiceover, emotional):
"Sie sagten mir, es wäre unmöglich..."
[VISUAL: Slow-Motion, Person allein, grau/dunkel]

[0:05-0:15] STRUGGLE:
Voiceover über die Herausforderung
[VISUAL: Harte Arbeit, früh aufstehen, Rückschläge]

[0:15-0:30] TRANSFORMATION:
Voiceover über den Wendepunkt
[VISUAL: Farben werden wärmer, Licht, Sonnenaufgang]
[MUSIK: Crescendo, Drums kommen rein]

[0:30-0:45] TRIUMPH:
Voiceover über den Erfolg
[VISUAL: Freiheit, Luxus, Team, Lachen, Reisen]
[MUSIK: Voller Höhepunkt]

[0:45-0:55] MESSAGE:
Motivierende Kernbotschaft (max 2 Sätze)
[TEXT-OVERLAY: Große, goldene Schrift]

[0:55-0:60] CTA:
"Deine Geschichte beginnt heute."
[VISUAL: Logo + "Link in Bio"]

REGELN:
- Cinematic Qualität (4K, Slow-Motion)
- Emotionale Musik ist PFLICHT
- Text-Overlays für Kernbotschaften
- Farbkorrektur: Warm, Golden Hour
- Hashtags: #hopecore #motivation #transformation #success
- Musik-Empfehlung konkret angeben`,
  },
};

export async function remixContent(
  originalContent: string,
  formats: RemixFormat[],
  topic?: string,
  pillar?: string,
): Promise<FullRemixResult> {
  const { invokeLLM } = await import("./_core/llm");
  const remixes: RemixResult[] = [];

  for (const format of formats) {
    const config = FORMAT_CONFIGS[format];
    if (!config) continue;

    try {
      const llmResponse = await invokeLLM({
        messages: [
          { role: "system", content: config.systemPrompt },
          {
            role: "user",
            content: `Wandle diesen Content in das Format "${config.label}" um:

ORIGINAL-CONTENT:
"${originalContent}"

${topic ? `THEMA: ${topic}` : ""}
${pillar ? `PILLAR: ${pillar}` : ""}

Erstelle den Content auf Deutsch. Mach es viral!`,
          },
        ],
      });

      const generatedContent = typeof llmResponse.choices?.[0]?.message?.content === "string"
        ? llmResponse.choices[0].message.content
        : "Content konnte nicht generiert werden";

      // Hashtags extrahieren
      const hashtagMatches = generatedContent.match(/#\w+/g) || [];

      // Dauer schätzen
      let estimatedDuration: string | undefined;
      if (format === "reel_script" || format === "youtube_shorts") estimatedDuration = "30-60 Sekunden";
      if (format === "asmr_script") estimatedDuration = "30-90 Sekunden";
      if (format === "hopecore_reel") estimatedDuration = "45-60 Sekunden";

      // Musik-Vorschlag
      let musicSuggestion: string | undefined;
      if (format === "hopecore_reel") musicSuggestion = "Epischer emotionaler Track (Hans Zimmer / Interstellar Stil)";
      if (format === "asmr_script") musicSuggestion = "Kein Musik - nur Naturgeräusche/ASMR Sounds";
      if (format === "reel_script") musicSuggestion = "Trending TikTok Sound 2026";

      // Produktions-Notizen
      let productionNotes: string | undefined;
      if (format === "asmr_script") productionNotes = "Mikrofon: Rode VideoMicro oder Blue Yeti. Aufnahme in ruhigem Raum. Nahaufnahmen mit Makro-Objektiv.";
      if (format === "hopecore_reel") productionNotes = "Drehe in Golden Hour. Slow-Motion 120fps. Farbkorrektur: Warm/Orange. Cinematic Bars (2.35:1).";
      if (format === "carousel") productionNotes = "Erstelle in Canva oder direkt im Karussell-Generator. Einheitliches Design, große Schrift.";

      remixes.push({
        format,
        formatLabel: config.label,
        content: generatedContent,
        platform: config.platform,
        estimatedDuration,
        productionNotes,
        musicSuggestion,
        hashtags: hashtagMatches,
      });
    } catch (err) {
      console.error(`[ContentRemix] ${format} failed:`, err);
      remixes.push({
        format,
        formatLabel: config.label,
        content: `Fehler beim Generieren des ${config.label} Formats.`,
        platform: config.platform,
        hashtags: [],
      });
    }
  }

  return {
    originalContent,
    remixes,
    totalFormats: remixes.length,
  };
}

// Alle 7 Formate auf einmal
export async function remixAll(
  originalContent: string,
  topic?: string,
  pillar?: string,
): Promise<FullRemixResult> {
  const allFormats: RemixFormat[] = [
    "carousel",
    "reel_script",
    "linkedin",
    "youtube_shorts",
    "twitter_thread",
    "asmr_script",
    "hopecore_reel",
  ];
  return remixContent(originalContent, allFormats, topic, pillar);
}

export function getAvailableFormats(): Array<{
  id: RemixFormat;
  label: string;
  platform: string;
  description: string;
  icon: string;
  isNew?: boolean;
}> {
  return [
    { id: "carousel", label: "Instagram Karussell", platform: "instagram", description: "5-8 Slides mit Hook und CTA", icon: "📱" },
    { id: "reel_script", label: "TikTok/Reel Script", platform: "tiktok", description: "15-60s Video-Script mit Timing", icon: "🎬" },
    { id: "linkedin", label: "LinkedIn Thought Leadership", platform: "linkedin", description: "Professioneller Story-Post", icon: "💼" },
    { id: "youtube_shorts", label: "YouTube Shorts", platform: "youtube", description: "30-60s Vertical Video Script", icon: "▶️" },
    { id: "twitter_thread", label: "X/Twitter Thread", platform: "twitter", description: "5-8 Tweet Thread", icon: "🐦" },
    { id: "asmr_script", label: "ASMR Script", platform: "tiktok", description: "Flüster-Content mit Sound-Design", icon: "🎧", isNew: true },
    { id: "hopecore_reel", label: "Hopecore Reel", platform: "instagram", description: "Cinematic Motivational Reel", icon: "✨", isNew: true },
  ];
}
