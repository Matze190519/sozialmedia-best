/**
 * Viral Score Predictor - KI-basierte Viral-Vorhersage
 * 
 * Analysiert Content auf:
 * 1. Hook-Stärke (0-20) - Fesselt in 2 Sekunden?
 * 2. Emotionale Resonanz (0-20) - Löst Emotionen aus?
 * 3. Teilbarkeit (0-15) - Würden Leute das teilen?
 * 4. Plattform-Algorithmus-Fit (0-15) - Passt zum Algorithmus?
 * 5. CTA-Conversion (0-15) - Treibt der CTA Aktionen?
 * 6. Trend-Alignment (0-15) - Passt zu aktuellen Trends?
 */

export interface ViralPrediction {
  totalScore: number;
  hookScore: number;
  emotionScore: number;
  shareabilityScore: number;
  algorithmFitScore: number;
  ctaConversionScore: number;
  trendAlignmentScore: number;
  predictedReach: string;
  predictedEngagement: string;
  viralProbability: string;
  tier: "S" | "A" | "B" | "C" | "D";
  feedback: string;
  improvements: string[];
  bestPostingTime: string;
  competitorBenchmark: string;
}

// Schnelle regelbasierte Voranalyse
export function quickViralScore(content: string, platform: string): {
  quickScore: number;
  hookStrength: number;
  emotionalTriggers: string[];
  shareabilityFactors: string[];
  issues: string[];
} {
  let quickScore = 50;
  const issues: string[] = [];
  const emotionalTriggers: string[] = [];
  const shareabilityFactors: string[] = [];

  // Hook-Analyse
  const firstLine = content.split("\n")[0] || "";
  let hookStrength = 5;

  // Frage-Hooks (stark)
  if (/^(Warum|Wie|Was|Wer|Wann|Wo|Welch)\b/.test(firstLine)) {
    hookStrength += 5;
    emotionalTriggers.push("Neugier-Hook");
  }
  // Zahlen-Hooks (stark)
  if (/^\d+\s/.test(firstLine) || /\b\d+\s*(Tipps|Gründe|Wege|Schritte|Fehler|Geheimnisse)\b/i.test(firstLine)) {
    hookStrength += 4;
    shareabilityFactors.push("Listicle-Format");
  }
  // Provokante Hooks
  if (/^(Stopp|Achtung|Vergiss|Niemand|Die\s*Wahrheit|Das\s*Problem)/i.test(firstLine)) {
    hookStrength += 5;
    emotionalTriggers.push("Provokation");
  }
  // Story-Hooks
  if (/^(Vor\s*\d|Als\s*ich|Ich\s*war|Stell\s*dir\s*vor|Letztes?\s*Jahr)/i.test(firstLine)) {
    hookStrength += 4;
    emotionalTriggers.push("Storytelling");
  }
  // Kurzer Hook (unter 10 Wörter = gut)
  if (firstLine.split(/\s+/).length <= 10) {
    hookStrength += 2;
  }
  // Emoji im Hook
  if (/[\uD83C-\uDBFF\uDC00-\uDFFF]/.test(firstLine)) {
    hookStrength += 1;
  }
  hookStrength = Math.min(20, hookStrength);

  // Emotionale Trigger
  const emotionWords = {
    "Angst/Dringlichkeit": /\b(verpas|letzte|nie\s*wieder|bevor\s*es|dringend|sofort)\b/i,
    "Hoffnung/Inspiration": /\b(Traum|Freiheit|möglich|schaffen|veränder|Zukunft|Erfolg)\b/i,
    "Überraschung": /\b(überrasch|unglaublich|krass|wow|unfassbar|Geheimnis|niemand\s*weiß)\b/i,
    "Wut/Empörung": /\b(Lüge|Betrug|unfair|Skandal|Wahrheit|verschweig)\b/i,
    "Zugehörigkeit": /\b(wir|Team|zusammen|Community|Familie|gemeinsam)\b/i,
    "Stolz": /\b(stolz|geschafft|erreicht|Meilenstein|Durchbruch)\b/i,
  };
  for (const [emotion, pattern] of Object.entries(emotionWords)) {
    if (pattern.test(content)) {
      emotionalTriggers.push(emotion);
    }
  }

  // Shareability-Faktoren
  if (/\b(teile|share|weitersagen|markiere|tag)\b/i.test(content)) {
    shareabilityFactors.push("Share-CTA");
    quickScore += 5;
  }
  if (/\b(speicher|save|bookmark)\b/i.test(content)) {
    shareabilityFactors.push("Save-CTA");
    quickScore += 5;
  }
  if (content.includes("?")) {
    shareabilityFactors.push("Frage (Kommentar-Trigger)");
    quickScore += 3;
  }
  if (/\b(Kommentier|Schreib.*Kommentar|Was\s*denkst\s*du|Was\s*meinst\s*du)\b/i.test(content)) {
    shareabilityFactors.push("Kommentar-CTA");
    quickScore += 5;
  }

  // Plattform-spezifische Checks
  const hashtagCount = (content.match(/#\w+/g) || []).length;
  if (platform === "instagram") {
    if (hashtagCount >= 3 && hashtagCount <= 5) quickScore += 5;
    if (content.length >= 150 && content.length <= 2200) quickScore += 3;
  } else if (platform === "tiktok") {
    if (hashtagCount >= 2 && hashtagCount <= 4) quickScore += 5;
    if (content.length <= 300) quickScore += 3;
  } else if (platform === "linkedin") {
    if (content.length >= 300) quickScore += 5;
    if (hashtagCount <= 3) quickScore += 3;
  }

  // Länge-Check
  if (content.length < 50) {
    issues.push("Zu kurz - mehr Substanz hinzufügen");
    quickScore -= 10;
  }

  // CTA-Check
  const hasCTA = /\b(Link\s*in\s*Bio|DM|Kommentiere|Schreib|klick|starten|INFO|Folge|Follow)\b/i.test(content);
  if (!hasCTA) {
    issues.push("Kein CTA gefunden");
    quickScore -= 5;
  } else {
    quickScore += 5;
  }

  // Emoji-Check
  const hasEmoji = /[\uD83C-\uDBFF\uDC00-\uDFFF]+/.test(content) || /[\u2600-\u27BF]/.test(content);
  if (!hasEmoji && platform !== "linkedin") {
    issues.push("Keine Emojis - für Social Media empfohlen");
    quickScore -= 3;
  }

  // Absätze/Formatierung
  const paragraphs = content.split("\n\n").length;
  if (paragraphs >= 3) {
    quickScore += 3;
    shareabilityFactors.push("Gute Formatierung");
  }

  // Emotionale Trigger Bonus
  quickScore += Math.min(15, emotionalTriggers.length * 3);

  return {
    quickScore: Math.max(0, Math.min(100, quickScore)),
    hookStrength,
    emotionalTriggers,
    shareabilityFactors,
    issues,
  };
}

// KI-basierte Deep-Analyse
export async function predictViralScore(
  content: string,
  platform: string,
  contentType: string = "post",
  hasMedia: boolean = false,
  hasVideo: boolean = false,
): Promise<ViralPrediction> {
  const { invokeLLM } = await import("./_core/llm");

  const quick = quickViralScore(content, platform);

  const llmResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Du bist ein Social Media Viral-Experte und Algorithmus-Analyst. Du analysierst Content und sagst voraus, wie viral er wird.

BEWERTUNGSKRITERIEN (Gesamtscore 0-100):
- Hook-Stärke (0-20): Fesselt der Einstieg in 2 Sekunden? Stoppt der Scroll?
- Emotionale Resonanz (0-20): Löst der Content starke Emotionen aus? (Freude, Überraschung, Empörung, Inspiration)
- Teilbarkeit (0-15): Würden Leute das teilen/reposten? Ist es "save-worthy"?
- Algorithmus-Fit (0-15): Passt der Content zum ${platform}-Algorithmus? (Länge, Format, Engagement-Signale)
- CTA-Conversion (0-15): Treibt der CTA Aktionen? (Kommentare, DMs, Klicks)
- Trend-Alignment (0-15): Passt zu aktuellen Trends 2026?

VORANALYSE:
- Quick Score: ${quick.quickScore}/100
- Hook-Stärke: ${quick.hookStrength}/20
- Emotionale Trigger: ${quick.emotionalTriggers.join(", ") || "keine"}
- Shareability: ${quick.shareabilityFactors.join(", ") || "keine"}
- Probleme: ${quick.issues.join(", ") || "keine"}

TIER-SYSTEM:
S (90-100): Viral-Potenzial - wird massiv geteilt
A (75-89): Sehr gut - überdurchschnittliches Engagement
B (60-74): Gut - solide Performance
C (40-59): Mittelmäßig - braucht Verbesserung
D (0-39): Schwach - grundlegend überarbeiten

Gib die Bewertung als JSON zurück.`
      },
      {
        role: "user",
        content: `Bewerte diesen ${contentType} für ${platform}:

"${content}"

Hat Bild: ${hasMedia ? "Ja" : "Nein"}
Hat Video: ${hasVideo ? "Ja" : "Nein"}
Zeichenanzahl: ${content.length}`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "viral_prediction",
        strict: true,
        schema: {
          type: "object",
          properties: {
            totalScore: { type: "integer", description: "Gesamtscore 0-100" },
            hookScore: { type: "integer", description: "Hook-Stärke 0-20" },
            emotionScore: { type: "integer", description: "Emotionale Resonanz 0-20" },
            shareabilityScore: { type: "integer", description: "Teilbarkeit 0-15" },
            algorithmFitScore: { type: "integer", description: "Algorithmus-Fit 0-15" },
            ctaConversionScore: { type: "integer", description: "CTA-Conversion 0-15" },
            trendAlignmentScore: { type: "integer", description: "Trend-Alignment 0-15" },
            predictedReach: { type: "string", description: "Geschätzte Reichweite (z.B. '500-2.000 Impressions')" },
            predictedEngagement: { type: "string", description: "Geschätzte Engagement-Rate (z.B. '3-5%')" },
            viralProbability: { type: "string", description: "Wahrscheinlichkeit viral zu gehen (z.B. '15%')" },
            tier: { type: "string", description: "Performance-Tier: S, A, B, C oder D" },
            feedback: { type: "string", description: "Kurzes Feedback (max 3 Sätze)" },
            improvements: { type: "array", items: { type: "string" }, description: "3-5 konkrete Verbesserungsvorschläge" },
            bestPostingTime: { type: "string", description: "Bester Zeitpunkt zum Posten (z.B. 'Dienstag 18:00-19:00')" },
            competitorBenchmark: { type: "string", description: "Vergleich mit durchschnittlichem Content in der Nische" },
          },
          required: ["totalScore", "hookScore", "emotionScore", "shareabilityScore", "algorithmFitScore", "ctaConversionScore", "trendAlignmentScore", "predictedReach", "predictedEngagement", "viralProbability", "tier", "feedback", "improvements", "bestPostingTime", "competitorBenchmark"],
          additionalProperties: false,
        },
      },
    },
  });

  const raw = llmResponse.choices?.[0]?.message?.content;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      // Fallback
    }
  }

  return {
    totalScore: quick.quickScore,
    hookScore: quick.hookStrength,
    emotionScore: 10,
    shareabilityScore: 7,
    algorithmFitScore: 7,
    ctaConversionScore: 7,
    trendAlignmentScore: 7,
    predictedReach: "Nicht berechnet",
    predictedEngagement: "Nicht berechnet",
    viralProbability: "Nicht berechnet",
    tier: quick.quickScore >= 75 ? "A" : quick.quickScore >= 60 ? "B" : quick.quickScore >= 40 ? "C" : "D",
    feedback: "KI-Analyse konnte nicht vollständig durchgeführt werden. Quick-Score basiert auf Regelanalyse.",
    improvements: quick.issues,
    bestPostingTime: "Dienstag/Donnerstag 18:00-20:00",
    competitorBenchmark: "Nicht verfügbar",
  };
}
