/**
 * Trend Scanner Service - Scannt TikTok, YouTube und Reddit nach viralen Trends.
 * Nutzt die Manus Data APIs für Live-Daten von allen Plattformen.
 * Berechnet einen Viral Score und generiert Content-Ideen mit LLM.
 */

import { callDataApi } from "./_core/dataApi";
import { invokeLLM } from "./_core/llm";
import type { InsertTrendScan } from "../drizzle/schema";

// ═══════════════════════════════════════════════════════════════
// CONTENT PILLARS - aus Agent Brain (GoViralBitch)
// ═══════════════════════════════════════════════════════════════

export const CONTENT_PILLARS = {
  autokonzept: {
    name: "Autokonzept",
    keywords: ["Porsche", "Mercedes AMG", "BMW M", "Luxusauto", "Sportwagen", "Traumauto", "Autofinanzierung Network Marketing"],
    frequency: "3x/Woche",
    emoji: "🏎️",
  },
  business: {
    name: "Business & Erfolg",
    keywords: ["Network Marketing Erfolg", "passives Einkommen", "Nebeneinkommen", "Selbstständigkeit", "finanzielle Freiheit", "Unternehmertum"],
    frequency: "4x/Woche",
    emoji: "💼",
  },
  gesundheit: {
    name: "Gesundheit & Wellness",
    keywords: ["Aloe Vera Gesundheit", "Nahrungsergänzung", "Colostrum", "Immunsystem stärken", "gesund leben", "Wellness Routine"],
    frequency: "2x/Woche",
    emoji: "🌿",
  },
  lifestyle: {
    name: "Lifestyle & Freiheit",
    keywords: ["digitaler Nomad", "Reisen Freiheit", "Luxus Lifestyle", "Traumleben", "Motivation", "Mindset Erfolg"],
    frequency: "3x/Woche",
    emoji: "✨",
  },
  lina_ki: {
    name: "Lina & KI",
    keywords: ["KI Assistent", "Chatbot Business", "AI Marketing", "Automatisierung", "digitale Transformation"],
    frequency: "2x/Woche",
    emoji: "🤖",
  },
} as const;

export type PillarKey = keyof typeof CONTENT_PILLARS;

// ═══════════════════════════════════════════════════════════════
// TIKTOK SCANNER
// ═══════════════════════════════════════════════════════════════

interface TikTokVideo {
  id: string;
  desc: string;
  author?: { nickname?: string; uniqueId?: string };
  stats?: { playCount?: number; diggCount?: number; commentCount?: number; shareCount?: number };
  video?: { cover?: string };
}

export async function scanTikTok(keyword: string, pillar: PillarKey): Promise<InsertTrendScan[]> {
  try {
    const result = await callDataApi("Tiktok/search_tiktok_video_general", {
      query: { keyword },
    }) as any;

    if (!result?.data) return [];

    const videos: TikTokVideo[] = result.data.slice(0, 10);
    return videos.map((v) => {
      const views = v.stats?.playCount || 0;
      const likes = v.stats?.diggCount || 0;
      const comments = v.stats?.commentCount || 0;
      const shares = v.stats?.shareCount || 0;
      const viralScore = calculateViralScore(views, likes, comments, shares);

      return {
        platform: "tiktok" as const,
        keyword,
        pillar,
        title: (v.desc || "").slice(0, 5000),
        sourceUrl: `https://www.tiktok.com/@${v.author?.uniqueId || "user"}/video/${v.id}`,
        thumbnailUrl: v.video?.cover || null,
        authorName: v.author?.nickname || v.author?.uniqueId || null,
        views,
        likes,
        comments,
        shares,
        viralScore,
        usedForContent: false,
      } satisfies InsertTrendScan;
    });
  } catch (err) {
    console.error(`[TrendScanner] TikTok scan error for "${keyword}":`, err);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// YOUTUBE SCANNER
// ═══════════════════════════════════════════════════════════════

export async function scanYouTube(keyword: string, pillar: PillarKey): Promise<InsertTrendScan[]> {
  try {
    const result = await callDataApi("Youtube/search", {
      query: { q: keyword, hl: "de", gl: "DE" },
    }) as any;

    if (!result?.contents) return [];

    const videos = result.contents
      .filter((c: any) => c.type === "video")
      .slice(0, 10);

    return videos.map((c: any) => {
      const v = c.video || {};
      const viewText = v.viewCountText || "0";
      const views = parseViewCount(viewText);
      const viralScore = Math.min(100, Math.round((views / 100000) * 50 + 20));

      return {
        platform: "youtube" as const,
        keyword,
        pillar,
        title: (v.title || "").slice(0, 5000),
        sourceUrl: v.videoId ? `https://www.youtube.com/watch?v=${v.videoId}` : null,
        thumbnailUrl: v.thumbnails?.[0]?.url || null,
        authorName: v.channelTitle || null,
        views,
        likes: 0,
        comments: 0,
        shares: 0,
        viralScore,
        usedForContent: false,
      } satisfies InsertTrendScan;
    });
  } catch (err) {
    console.error(`[TrendScanner] YouTube scan error for "${keyword}":`, err);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// REDDIT SCANNER
// ═══════════════════════════════════════════════════════════════

export async function scanReddit(subreddit: string, pillar: PillarKey): Promise<InsertTrendScan[]> {
  try {
    const result = await callDataApi("Reddit/AccessAPI", {
      query: { subreddit, limit: "10" },
    }) as any;

    if (!result?.posts) return [];

    return result.posts.slice(0, 10).map((wrapper: any) => {
      const p = wrapper.data || wrapper;
      const score = p.score || p.ups || 0;
      const comments = p.num_comments || 0;
      const viralScore = Math.min(100, Math.round((score / 1000) * 40 + (comments / 100) * 30 + 10));

      return {
        platform: "reddit" as const,
        keyword: subreddit,
        pillar,
        title: (p.title || "").slice(0, 5000),
        sourceUrl: p.url || (p.permalink ? `https://reddit.com${p.permalink}` : null),
        thumbnailUrl: p.thumbnail && p.thumbnail !== "self" ? p.thumbnail : null,
        authorName: p.author || null,
        views: 0,
        likes: score,
        comments,
        shares: 0,
        viralScore,
        usedForContent: false,
      } satisfies InsertTrendScan;
    });
  } catch (err) {
    console.error(`[TrendScanner] Reddit scan error for "${subreddit}":`, err);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// FULL SCAN - Alle Plattformen, alle Pillars
// ═══════════════════════════════════════════════════════════════

export async function runFullTrendScan(): Promise<InsertTrendScan[]> {
  const allTrends: InsertTrendScan[] = [];

  // Scan each pillar with relevant keywords
  for (const [pillarKey, pillar] of Object.entries(CONTENT_PILLARS)) {
    const pk = pillarKey as PillarKey;
    // Pick 2 random keywords per pillar to avoid rate limits
    const keywords = [...pillar.keywords].sort(() => Math.random() - 0.5).slice(0, 2);

    for (const keyword of keywords) {
      // TikTok
      const tiktokResults = await scanTikTok(keyword, pk);
      allTrends.push(...tiktokResults);

      // YouTube
      const ytResults = await scanYouTube(keyword, pk);
      allTrends.push(...ytResults);

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // Reddit - specific subreddits
  const subreddits = [
    { sub: "networkmarketing", pillar: "business" as PillarKey },
    { sub: "Entrepreneur", pillar: "business" as PillarKey },
    { sub: "cars", pillar: "autokonzept" as PillarKey },
    { sub: "health", pillar: "gesundheit" as PillarKey },
    { sub: "digitalnomad", pillar: "lifestyle" as PillarKey },
  ];

  for (const { sub, pillar } of subreddits) {
    const redditResults = await scanReddit(sub, pillar);
    allTrends.push(...redditResults);
    await new Promise(r => setTimeout(r, 300));
  }

  // Sort by viral score
  allTrends.sort((a, b) => (b.viralScore || 0) - (a.viralScore || 0));

  return allTrends;
}

// ═══════════════════════════════════════════════════════════════
// AI CONTENT IDEAS - Generiert Content-Ideen basierend auf Trends
// ═══════════════════════════════════════════════════════════════

export async function generateContentIdeasFromTrends(
  trends: Array<{ title: string; platform: string; pillar?: string | null; viralScore?: number | null; views?: number | null }>
): Promise<{ ideas: Array<{ trendTitle: string; hook: string; contentIdea: string; pillar: string }> }> {
  const topTrends = trends.slice(0, 15);
  const trendSummary = topTrends.map((t, i) =>
    `${i + 1}. [${t.platform}] ${t.title} (Viral Score: ${t.viralScore}, Views: ${t.views})`
  ).join("\n");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Du bist ein viraler Content-Stratege für LR Health & Beauty (Network Marketing).
Dein Job: Aus aktuellen Trends Content-Ideen generieren die viral gehen.

Brand Voice: Authentisch, motivierend, Luxus-Lifestyle, Gesundheit, Freiheit.
Leader: Mathias Vinzing. Company: LR Health & Beauty (40+ Jahre, Fresenius-geprüft).
Pillars: Autokonzept, Business & Erfolg, Gesundheit, Lifestyle & Freiheit, Lina & KI.

Regeln:
- Hooks müssen in den ersten 3 Sekunden fesseln
- Kein "Ich verdiene X Euro" - stattdessen Lifestyle zeigen
- Produkte nur subtil einbauen (max 20% der Posts)
- Emotionen > Fakten
- Kontroverse Meinungen funktionieren gut
- Storytelling > Produktpräsentation`
      },
      {
        role: "user",
        content: `Hier sind die aktuell viralen Trends:\n\n${trendSummary}\n\nGeneriere 5 Content-Ideen die auf diesen Trends basieren. Für jede Idee:
1. Welcher Trend inspiriert sie
2. Ein Hook (erster Satz der fesselt)
3. Die Content-Idee (was posten)
4. Welcher Pillar (autokonzept/business/gesundheit/lifestyle/lina_ki)

Antworte als JSON Array.`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "content_ideas",
        strict: true,
        schema: {
          type: "object",
          properties: {
            ideas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trendTitle: { type: "string", description: "Der Trend der inspiriert hat" },
                  hook: { type: "string", description: "Hook - erster Satz der fesselt" },
                  contentIdea: { type: "string", description: "Was genau posten (Beschreibung)" },
                  pillar: { type: "string", description: "Content Pillar" },
                },
                required: ["trendTitle", "hook", "contentIdea", "pillar"],
                additionalProperties: false,
              },
            },
          },
          required: ["ideas"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices?.[0]?.message?.content;
    if (content && typeof content === 'string') return JSON.parse(content);
  } catch {}
  return { ideas: [] };
}

// ═══════════════════════════════════════════════════════════════
// AUTOPILOT - Trend → Content → zur Freigabe in einem Schritt
// ═══════════════════════════════════════════════════════════════

export async function autopilotGenerateFromTrend(
  trend: { title: string; platform: string; pillar: string; sourceUrl?: string | null; viralScore?: number | null },
  contentType: string = "post",
  targetPlatform: string = "instagram"
): Promise<{ content: string; hook: string; imagePrompt: string }> {
  const pillarInfo = CONTENT_PILLARS[trend.pillar as PillarKey];

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Du bist der #1 Viral Content Creator für LR Health & Beauty (Network Marketing).
Leader: Mathias Vinzing. Company: LR (40+ Jahre, 28 Länder, Fresenius-geprüft).
KI-Assistentin: Lina. Einstiegspreis: 0€ (früher 40€).

Dein Job: Aus einem viralen Trend einen NOCH viraleren Post erstellen.

REGELN:
1. Hook MUSS in 2 Sekunden fesseln - kontrovers, überraschend, emotional
2. Storytelling > Produktpräsentation (max 20% Produkt)
3. NIEMALS "TÜV" - nur "Fresenius-geprüft" und "Dermatest-zertifiziert"
4. CTA am Ende: DM-Aufforderung oder Link in Bio
5. Emojis passend zur Plattform
6. Deutsch, authentisch, motivierend
7. Ziel: Kontakte generieren, nicht verkaufen`
      },
      {
        role: "user",
        content: `Viraler Trend (${trend.platform}, Score: ${trend.viralScore}/100):
"${trend.title}"

Pillar: ${pillarInfo?.emoji || ""} ${pillarInfo?.name || trend.pillar}
Zielplattform: ${targetPlatform}
Content-Typ: ${contentType}

Erstelle:
1. Den fertigen Post-Text (viral, mit Hook und CTA)
2. Den Hook separat (erster Satz)
3. Einen Bild-Prompt für KI-Bildgenerierung (englisch, fotorealistisch, Lifestyle)

Antworte als JSON.`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "autopilot_content",
        strict: true,
        schema: {
          type: "object",
          properties: {
            content: { type: "string", description: "Fertiger Post-Text mit Hook und CTA" },
            hook: { type: "string", description: "Der Hook - erster Satz" },
            imagePrompt: { type: "string", description: "Englischer Prompt für KI-Bildgenerierung" },
          },
          required: ["content", "hook", "imagePrompt"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const parsed = JSON.parse(response.choices?.[0]?.message?.content as string);
    return parsed;
  } catch {
    return {
      content: `Inspiriert von: ${trend.title}\n\nContent konnte nicht automatisch generiert werden.`,
      hook: trend.title.slice(0, 100),
      imagePrompt: "Professional lifestyle photo, luxury car, success, freedom, modern aesthetic",
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function calculateViralScore(views: number, likes: number, comments: number, shares: number): number {
  // Engagement rate weighted formula
  const engagement = likes + comments * 2 + shares * 3;
  const engagementRate = views > 0 ? (engagement / views) * 100 : 0;

  let score = 0;
  // Views component (0-40 points)
  if (views >= 10_000_000) score += 40;
  else if (views >= 1_000_000) score += 35;
  else if (views >= 500_000) score += 30;
  else if (views >= 100_000) score += 25;
  else if (views >= 50_000) score += 20;
  else if (views >= 10_000) score += 15;
  else score += Math.round((views / 10_000) * 15);

  // Engagement rate component (0-40 points)
  if (engagementRate >= 10) score += 40;
  else if (engagementRate >= 5) score += 30;
  else if (engagementRate >= 2) score += 20;
  else score += Math.round(engagementRate * 10);

  // Shares bonus (0-20 points) - shares = highest signal
  if (shares >= 10_000) score += 20;
  else if (shares >= 1_000) score += 15;
  else if (shares >= 100) score += 10;
  else score += Math.round((shares / 100) * 10);

  return Math.min(100, score);
}

function parseViewCount(text: string): number {
  if (!text) return 0;
  const cleaned = text.replace(/[^0-9.,KkMmBb]/g, "").trim();
  const num = parseFloat(cleaned.replace(",", "."));
  if (isNaN(num)) return 0;
  if (/[Bb]/.test(cleaned)) return num * 1_000_000_000;
  if (/[Mm]/.test(cleaned)) return num * 1_000_000;
  if (/[Kk]/.test(cleaned)) return num * 1_000;
  return num;
}
