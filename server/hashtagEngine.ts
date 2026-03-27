/**
 * Smart Hashtag Engine - KI-generierte trendbasierte Hashtags pro Plattform
 * + Instagram Hashtag-Recherche
 */

import { invokeLLM } from "./_core/llm";
import { callDataApi } from "./_core/dataApi";

// ═══════════════════════════════════════════════════════════════
// PLATTFORM-SPEZIFISCHE HASHTAG-REGELN
// ═══════════════════════════════════════════════════════════════

const PLATFORM_RULES: Record<string, { maxHashtags: number; style: string; placement: string }> = {
  instagram: {
    maxHashtags: 5,
    style: "Nur 3-5 hochrelevante Hashtags. Mix aus 1 Brand, 2 Nische, 2 Trending. Instagram 2026: Weniger ist mehr.",
    placement: "Unter dem Post oder im ersten Kommentar",
  },
  tiktok: {
    maxHashtags: 5,
    style: "Nur die relevantesten Trend-Hashtags. Kurz und knackig. FYP-Hashtags einbauen.",
    placement: "In der Caption",
  },
  linkedin: {
    maxHashtags: 5,
    style: "Professionell, branchenspezifisch. Keine Emoji-Hashtags.",
    placement: "Am Ende des Posts",
  },
  facebook: {
    maxHashtags: 3,
    style: "Wenige, aber relevante Hashtags. Nicht übertreiben.",
    placement: "Am Ende des Posts",
  },
  twitter: {
    maxHashtags: 3,
    style: "Nur die 2-3 relevantesten Trending-Hashtags.",
    placement: "In den Tweet integriert",
  },
  youtube: {
    maxHashtags: 15,
    style: "SEO-optimierte Tags. Mix aus Broad und Specific.",
    placement: "In der Videobeschreibung und als Tags",
  },
  threads: {
    maxHashtags: 3,
    style: "Ähnlich wie Twitter - wenige, relevante Tags.",
    placement: "Am Ende des Posts",
  },
};

// ═══════════════════════════════════════════════════════════════
// LR-SPEZIFISCHE HASHTAG-POOLS
// ═══════════════════════════════════════════════════════════════

const LR_HASHTAG_POOLS = {
  brand: [
    "#LRHealthBeauty", "#LRWorld", "#LRPartner", "#LRLifestyle",
    "#LRAloeVera", "#LRTeam", "#LRBusiness", "#LRSuccess",
  ],
  autokonzept: [
    "#Autokonzept", "#Traumauto", "#Porsche", "#MercedesAMG", "#BMWM",
    "#Luxusauto", "#Sportwagen", "#CarGoals", "#DreamCar", "#AutoLiebe",
    "#Autofinanzierung", "#NetworkMarketingAuto", "#FreeCarProgram",
  ],
  business: [
    "#NetworkMarketing", "#PassivesEinkommen", "#Nebeneinkommen",
    "#FinanzielleFreiheit", "#Selbstständig", "#Unternehmertum",
    "#OnlineBusiness", "#Erfolg", "#Mindset", "#Motivation",
    "#SideHustle", "#Entrepreneur", "#BusinessMindset",
  ],
  gesundheit: [
    "#AloeVera", "#Gesundheit", "#Wellness", "#Nahrungsergänzung",
    "#Immunsystem", "#GesundLeben", "#Colostrum", "#ProBalance",
    "#HealthyLifestyle", "#NaturalHealth", "#Vitamine",
  ],
  lifestyle: [
    "#Lifestyle", "#Freiheit", "#Reisen", "#Luxus", "#Traumleben",
    "#DigitalNomad", "#LuxuryLifestyle", "#Freedom", "#Travel",
    "#LivingMyBestLife", "#LifestyleGoals", "#DreamLife",
  ],
  lina_ki: [
    "#KI", "#AI", "#Chatbot", "#Automatisierung", "#KünstlicheIntelligenz",
    "#AIMarketing", "#DigitaleTransformation", "#TechBusiness",
    "#FutureOfWork", "#AIAssistant",
  ],
};

// ═══════════════════════════════════════════════════════════════
// SMART HASHTAG GENERATION
// ═══════════════════════════════════════════════════════════════

export interface HashtagResult {
  hashtags: string[];
  categories: {
    trending: string[];
    niche: string[];
    brand: string[];
    broad: string[];
  };
  totalReach: string;
  tips: string;
  platform: string;
}

export async function generateSmartHashtags(
  content: string,
  platform: string,
  pillar?: string,
  topic?: string,
): Promise<HashtagResult> {
  const rules = PLATFORM_RULES[platform.toLowerCase()] || PLATFORM_RULES.instagram;
  const pillarPool = pillar ? LR_HASHTAG_POOLS[pillar as keyof typeof LR_HASHTAG_POOLS] || [] : [];
  const brandTags = LR_HASHTAG_POOLS.brand;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Du bist ein Hashtag-Experte für Social Media Marketing im Network Marketing / LR Health & Beauty Bereich.

PLATTFORM: ${platform}
MAX HASHTAGS: ${rules.maxHashtags}
STIL: ${rules.style}
PLATZIERUNG: ${rules.placement}

VERFÜGBARE BRAND-HASHTAGS: ${brandTags.join(", ")}
${pillarPool.length > 0 ? `PILLAR-HASHTAGS: ${pillarPool.join(", ")}` : ""}

REGELN:
1. Generiere exakt ${rules.maxHashtags} Hashtags
2. Mix: 20% Brand, 30% Trending, 30% Nische, 20% Broad
3. Hashtags müssen zum Content passen
4. Deutsche UND englische Hashtags mixen
5. Keine verbotenen/gesperrten Hashtags
6. Jeder Hashtag MUSS mit # beginnen`
      },
      {
        role: "user",
        content: `Content: "${content.slice(0, 500)}"
${topic ? `Thema: ${topic}` : ""}
${pillar ? `Pillar: ${pillar}` : ""}

Generiere die optimalen Hashtags. Antworte als JSON.`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "hashtag_result",
        strict: true,
        schema: {
          type: "object",
          properties: {
            hashtags: {
              type: "array",
              items: { type: "string" },
              description: "Alle Hashtags in optimaler Reihenfolge"
            },
            trending: {
              type: "array",
              items: { type: "string" },
              description: "Trending Hashtags"
            },
            niche: {
              type: "array",
              items: { type: "string" },
              description: "Nischen-Hashtags"
            },
            brand: {
              type: "array",
              items: { type: "string" },
              description: "Brand-Hashtags"
            },
            broad: {
              type: "array",
              items: { type: "string" },
              description: "Breite Hashtags"
            },
            totalReach: {
              type: "string",
              description: "Geschätzte Gesamtreichweite"
            },
            tips: {
              type: "string",
              description: "Tipps zur Hashtag-Nutzung"
            },
          },
          required: ["hashtags", "trending", "niche", "brand", "broad", "totalReach", "tips"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const parsed = JSON.parse(response.choices?.[0]?.message?.content as string);
    return {
      hashtags: parsed.hashtags || [],
      categories: {
        trending: parsed.trending || [],
        niche: parsed.niche || [],
        brand: parsed.brand || [],
        broad: parsed.broad || [],
      },
      totalReach: parsed.totalReach || "Unbekannt",
      tips: parsed.tips || "",
      platform,
    };
  } catch {
    // Fallback: Use pillar pool + brand tags
    const fallback = [...brandTags.slice(0, 3), ...pillarPool.slice(0, rules.maxHashtags - 3)];
    return {
      hashtags: fallback.slice(0, rules.maxHashtags),
      categories: { trending: [], niche: pillarPool.slice(0, 5), brand: brandTags.slice(0, 3), broad: [] },
      totalReach: "Unbekannt",
      tips: "Fallback-Hashtags verwendet. Bitte manuell optimieren.",
      platform,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// INSTAGRAM HASHTAG RECHERCHE
// ═══════════════════════════════════════════════════════════════

export interface InstagramHashtagInfo {
  hashtag: string;
  postCount: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

export async function researchInstagramHashtags(
  topic: string,
  pillar?: string,
): Promise<{ hashtags: InstagramHashtagInfo[]; recommendations: string }> {
  // Use LLM to generate research-based hashtag recommendations
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Du bist ein Instagram Hashtag-Recherche-Experte für Network Marketing / LR Health & Beauty.
Dein Job: Für ein gegebenes Thema die besten Instagram-Hashtags recherchieren und nach Schwierigkeit kategorisieren.

Kategorien:
- easy: Nischen-Hashtags mit <100K Posts (leichter zu ranken)
- medium: Mittlere Hashtags mit 100K-1M Posts (gute Balance)
- hard: Große Hashtags mit >1M Posts (viel Konkurrenz, aber hohe Reichweite)

Für LR Network Marketing empfehle einen Mix:
- 10 easy (Nische, spezifisch)
- 10 medium (gute Reichweite)
- 10 hard (maximale Sichtbarkeit)

Gib realistische Post-Zahlen an basierend auf deinem Wissen über Instagram-Hashtag-Popularität.`
      },
      {
        role: "user",
        content: `Recherchiere die besten Instagram-Hashtags für:
Thema: ${topic}
${pillar ? `Pillar: ${pillar}` : ""}
Branche: Network Marketing / LR Health & Beauty / Lifestyle

Antworte als JSON.`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "hashtag_research",
        strict: true,
        schema: {
          type: "object",
          properties: {
            hashtags: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  hashtag: { type: "string" },
                  postCount: { type: "string" },
                  category: { type: "string" },
                  difficulty: { type: "string" },
                },
                required: ["hashtag", "postCount", "category", "difficulty"],
                additionalProperties: false,
              },
            },
            recommendations: { type: "string", description: "Empfehlungen zur Hashtag-Strategie" },
          },
          required: ["hashtags", "recommendations"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const parsed = JSON.parse(response.choices?.[0]?.message?.content as string);
    return {
      hashtags: (parsed.hashtags || []).map((h: any) => ({
        hashtag: h.hashtag,
        postCount: h.postCount,
        category: h.category,
        difficulty: h.difficulty as "easy" | "medium" | "hard",
      })),
      recommendations: parsed.recommendations || "",
    };
  } catch {
    return { hashtags: [], recommendations: "Recherche fehlgeschlagen. Bitte erneut versuchen." };
  }
}

// ═══════════════════════════════════════════════════════════════
// MONATSPLAN GENERATOR - 30 Posts auf Knopfdruck
// ═══════════════════════════════════════════════════════════════

export interface MonthlyPlanPost {
  day: number;
  weekday: string;
  pillar: string;
  contentType: string;
  topic: string;
  hook: string;
  platform: string;
  hashtags: string[];
  imagePrompt: string;
}

export async function generateMonthlyPlan(
  month: number,
  year: number,
  postsPerWeek: number = 14,
): Promise<{ posts: MonthlyPlanPost[]; summary: string }> {
  // Calculate days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

  // Agent Brain Wochenplan
  const weeklyMix = [
    { pillar: "autokonzept", count: 3, platforms: ["instagram", "tiktok", "facebook"] },
    { pillar: "business", count: 4, platforms: ["instagram", "linkedin", "tiktok", "facebook"] },
    { pillar: "gesundheit", count: 2, platforms: ["instagram", "facebook"] },
    { pillar: "lifestyle", count: 3, platforms: ["instagram", "tiktok", "threads"] },
    { pillar: "lina_ki", count: 2, platforms: ["instagram", "linkedin"] },
  ];

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Du bist ein Content-Planer für LR Health & Beauty (Network Marketing).
Leader: Mathias Vinzing. Company: LR (40+ Jahre, Fresenius-geprüft, 0€ Einstieg).

WOCHENPLAN (Agent Brain):
- Autokonzept: 3x/Woche (Porsche, AMG, BMW M, Traumauto, Lifestyle)
- Business & Erfolg: 4x/Woche (Einkommen, Freiheit, Erfolgsgeschichten, Mindset)
- Gesundheit: 2x/Woche (Aloe Vera, Colostrum, Wellness, Immunsystem)
- Lifestyle: 3x/Woche (Reisen, Luxus, Freiheit, Motivation)
- Lina & KI: 2x/Woche (KI-Assistent, Automatisierung, Zukunft)

CONTENT-TYPEN: post, reel_script, story, carousel, linkedin
PLATTFORMEN: instagram, tiktok, linkedin, facebook, threads, youtube

REGELN:
1. Jeden Tag mindestens 1-2 Posts
2. Wochenende: Lifestyle und Motivation
3. Montag: Business-Motivation
4. Freitag: Erfolgsgeschichten
5. Abwechslung bei Content-Typen
6. Hooks müssen in 2 Sekunden fesseln
7. NIEMALS "TÜV" - nur "Fresenius-geprüft"
8. Jeder Post braucht einen CTA`
      },
      {
        role: "user",
        content: `Erstelle einen kompletten Content-Plan für ${month}/${year} (${daysInMonth} Tage).
Generiere für jeden Tag 1-2 Posts mit:
- Tag (1-${daysInMonth})
- Wochentag
- Pillar
- Content-Typ
- Thema/Topic
- Hook (erster Satz)
- Plattform
- 3-5 Hashtags (Instagram max 5!)
- Bild-Prompt (englisch, für KI-Bildgenerierung, KEIN Text im Bild)

Antworte als JSON mit einem Array "posts" und einem "summary" String.`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "monthly_plan",
        strict: true,
        schema: {
          type: "object",
          properties: {
            posts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "integer" },
                  weekday: { type: "string" },
                  pillar: { type: "string" },
                  contentType: { type: "string" },
                  topic: { type: "string" },
                  hook: { type: "string" },
                  platform: { type: "string" },
                  hashtags: { type: "array", items: { type: "string" } },
                  imagePrompt: { type: "string" },
                },
                required: ["day", "weekday", "pillar", "contentType", "topic", "hook", "platform", "hashtags", "imagePrompt"],
                additionalProperties: false,
              },
            },
            summary: { type: "string" },
          },
          required: ["posts", "summary"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const parsed = JSON.parse(response.choices?.[0]?.message?.content as string);
    return {
      posts: parsed.posts || [],
      summary: parsed.summary || `Monatsplan für ${month}/${year} generiert`,
    };
  } catch {
    return { posts: [], summary: "Monatsplan konnte nicht generiert werden." };
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export { PLATFORM_RULES, LR_HASHTAG_POOLS };
