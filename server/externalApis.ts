/**
 * External API clients for GoViralBitch, Blotato, fal.ai Video-KI,
 * Brand Voice System, Quality Gate und Viral Script Engine.
 * Alles aus den GitHub-Vorlagen (Agent Brain, CTA-Templates, Hook-Formulas).
 */

import { fal } from "@fal-ai/client";

const GOVIRALBITCH_URL = process.env.GOVIRALBITCH_API_URL || "https://goviralbitch-deploy.onrender.com";
const BLOTATO_API_KEY = process.env.BLOTATO_API_KEY || "";
const FAL_API_KEY = process.env.FAL_API_KEY || "";

// Configure fal.ai client
if (FAL_API_KEY) {
  fal.config({ credentials: FAL_API_KEY });
}

// ═══════════════════════════════════════════════════════════════
// BRAND VOICE SYSTEM - aus Agent Brain (GoViralBitch GitHub)
// ═══════════════════════════════════════════════════════════════

export const LR_BRAND_VOICE = {
  identity: {
    name: "LR Lifestyle Team",
    leader: "Mathias Vinzing",
    company: "LR Health & Beauty",
    companyAge: "40+ Jahre",
    certifications: ["Fresenius-geprüft", "Dermatest-zertifiziert"],
    notCertified: ["TÜV"], // NICHT TÜV!
    entryPrice: "99 Euro",
    previousPrice: "1.200 Euro",
    countries: 32,
    aiAssistant: "Lina",
  },
  pillars: [
    { name: "Autokonzept", emoji: "🚗", description: "Firmenwagen durch LR - Mercedes, BMW, Porsche als Bonus" },
    { name: "Business Opportunity", emoji: "💼", description: "Nebeneinkommen, Karriere, finanzielle Freiheit" },
    { name: "Produkt-Highlight", emoji: "🌿", description: "Aloe Vera, Mind Master, Zeitgard - Fresenius-geprüft" },
    { name: "Lina KI-Demo", emoji: "🤖", description: "KI-Assistentin die Social Media und Kontakte übernimmt" },
    { name: "Lifestyle & Erfolg", emoji: "✨", description: "Reisen, Events, Team-Erfolge, Transformation" },
    { name: "Einwandbehandlung", emoji: "🛡️", description: "Häufige Einwände zerstören mit Fakten" },
  ],
  tonePerPlatform: {
    instagram: { tone: "inspirierend, persönlich, Story-driven", format: "Reels, Carousels, Stories", frequency: "1-2x täglich" },
    tiktok: { tone: "authentisch, direkt, unterhaltsam, provokant", format: "Kurzvideos 15-60s", frequency: "1-4x täglich" },
    linkedin: { tone: "professionell, Business-fokussiert, Thought Leadership", format: "Artikel, Carousels, Storys", frequency: "3-5x wöchentlich" },
    facebook: { tone: "community-orientiert, informativ, persönlich", format: "Posts, Videos, Gruppen", frequency: "1-2x täglich" },
    twitter: { tone: "kurz, provokant, Hot Takes", format: "Threads, Tweets", frequency: "3-10x täglich" },
    youtube: { tone: "ausführlich, lehrreich, professionell", format: "Longform, Shorts", frequency: "2-3x wöchentlich" },
    threads: { tone: "casual, authentisch, community", format: "Kurze Posts", frequency: "1-2x täglich" },
    pinterest: { tone: "visuell, aspirational, Lifestyle", format: "Pins, Idea Pins", frequency: "5-10x täglich" },
    bluesky: { tone: "early-adopter, authentisch", format: "Posts", frequency: "1-2x täglich" },
  },
  audienceBlockers: [
    { lie: "Network Marketing ist ein Schneeballsystem", destruction: "LR ist seit über 40 Jahren am Markt, in 32 Ländern aktiv, und ein seriös deutsches Unternehmen", pillar: "Business Opportunity" },
    { lie: "Ich habe keine Kontakte für Network Marketing", destruction: "Unsere KI Lina übernimmt Social Media und die Kontaktaufnahme. Du brauchst keine eigenen Kontakte.", pillar: "Lina KI-Demo" },
    { lie: "Ich habe keine Zeit für ein Nebenbusiness", destruction: "Mit Lina und unserer Automatisierung brauchst du nur 30 Min am Tag. Den Rest macht die KI.", pillar: "Lina KI-Demo" },
    { lie: "99 Euro ist zu viel Risiko", destruction: "Früher hat der Start 1.200 Euro gekostet. 99 Euro ist weniger als ein Abendessen für zwei.", pillar: "Business Opportunity" },
    { lie: "Die Produkte sind zu teuer", destruction: "Fresenius-geprüfte Qualität zum fairen Preis. Vergleich mit Apothekenpreisen zeigt: LR ist günstiger.", pillar: "Produkt-Highlight" },
    { lie: "Ich kann nicht verkaufen", destruction: "Du musst nicht verkaufen. Teile einfach deine Erfahrung. Lina macht den Rest.", pillar: "Lina KI-Demo" },
  ],
  ctaPreferences: [
    "Link in Bio",
    "Schreib mir eine DM",
    "Kommentiere STARTEN für mehr Infos",
    "Kostenlose Beratung buchen",
  ],
  funnel: "Meta Ad → Landing Page (lr-job.eu) → Lead-Formular → Automatische Verteilung an Partner → Follow-Up → Telefonat → Abschluss",
};

// ═══════════════════════════════════════════════════════════════
// CTA TEMPLATES - aus GoViralBitch GitHub (cta-templates.json)
// ═══════════════════════════════════════════════════════════════

export const CTA_TEMPLATES: Record<string, Record<string, string[]>> = {
  instagram: {
    community: [
      "Kommentiere '{{keyword}}' und ich schicke dir den Link",
      "Link in Bio für alle Details",
      "DM mir '{{keyword}}' für die kostenlose Beratung",
    ],
    lead_magnet: [
      "Kommentiere '{{keyword}}' und ich DM dir die kostenlose {{resource}}",
      "Kostenlose {{resource}} — Link in Bio",
      "DM mir '{{keyword}}' für die kostenlose {{resource}}",
    ],
    dm: [
      "DM mir '{{keyword}}' und ich schicke dir alles",
      "Kommentiere '{{keyword}}' und ich DM dir die Details",
    ],
    booking: [
      "DM mir 'STARTEN' für ein kostenloses Beratungsgespräch",
      "Kostenlose Beratung — Link in Bio",
    ],
  },
  tiktok: {
    community: [
      "Link in Bio für alle Details",
      "Kommentiere '{{keyword}}' für den Link",
    ],
    lead_magnet: [
      "Kommentiere '{{keyword}}' und ich schicke dir die kostenlose {{resource}}",
      "Kostenlose {{resource}} — Link in Bio",
    ],
    dm: [
      "DM mir '{{keyword}}' für den kompletten Walkthrough",
      "Kommentiere '{{keyword}}' und ich DM dir",
    ],
  },
  linkedin: {
    community: [
      "Kommentiere 'INFO' und ich schicke dir die Details per DM",
      "Mehr dazu in meinem Profil — Link zum kostenlosen Gespräch",
    ],
    lead_magnet: [
      "Kommentiere 'GUIDE' und ich schicke dir die kostenlose {{resource}}",
      "Lade dir die {{resource}} herunter — Link im ersten Kommentar",
    ],
    dm: [
      "Schreib mir eine Nachricht für ein persönliches Gespräch",
      "Kommentiere und ich melde mich bei dir",
    ],
  },
  youtube: {
    community: [
      "Alle Details findest du in der Beschreibung",
      "Link in der Beschreibung für die kostenlose Beratung",
    ],
    lead_magnet: [
      "Lade dir die kostenlose {{resource}} herunter — Link in der Beschreibung",
      "Hol dir die {{resource}} mit allen Schritten — Link unten",
    ],
  },
  facebook: {
    community: [
      "Kommentiere 'INFO' und ich schicke dir die Details",
      "Mehr Infos in meinem Profil",
    ],
    dm: [
      "Schreib mir eine Nachricht für ein persönliches Gespräch",
      "Kommentiere und ich melde mich bei dir",
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// HOOK FORMULAS - aus marketingskills GitHub (social-content)
// ═══════════════════════════════════════════════════════════════

export const HOOK_FORMULAS = {
  curiosity: [
    "Ich lag falsch über {{common_belief}}.",
    "Der wahre Grund warum {{outcome}} passiert, ist nicht was du denkst.",
    "{{impressive_result}} — und es hat nur {{short_time}} gedauert.",
    "Niemand spricht über {{insider_knowledge}}.",
    "Was passiert wenn {{unexpected_scenario}}?",
  ],
  story: [
    "Letzte Woche ist {{unexpected_thing}} passiert.",
    "Ich hätte fast {{big_mistake}} gemacht.",
    "Vor 3 Jahren war ich {{past_state}}. Heute {{current_state}}.",
    "{{person}} hat mir etwas gesagt, das ich nie vergessen werde.",
    "Der Moment der alles verändert hat...",
  ],
  value: [
    "Wie du {{desirable_outcome}} erreichst (ohne {{common_pain}}):",
    "{{number}} {{things}} die {{outcome}}:",
    "Der einfachste Weg zu {{outcome}}:",
    "Hör auf mit {{common_mistake}}. Mach stattdessen das:",
    "Die {{number}}-Schritte-Formel für {{outcome}}:",
  ],
  contrarian: [
    "Unpopuläre Meinung: {{bold_statement}}",
    "{{common_advice}} ist falsch. Hier ist warum:",
    "Ich habe aufgehört {{common_practice}} und {{positive_result}}.",
    "Alle sagen {{X}}. Die Wahrheit ist {{Y}}.",
    "Das will dir niemand über {{topic}} erzählen.",
  ],
  socialProof: [
    "Wir haben {{result}} in {{timeframe}} erreicht. Hier ist die ganze Geschichte:",
    "{{number}} Leute haben mich nach {{topic}} gefragt. Hier ist meine Antwort:",
    "{{authority_figure}} hat mir {{lesson}} beigebracht.",
    "Warum {{number}} Menschen bereits {{action}} gemacht haben.",
  ],
};

// ═══════════════════════════════════════════════════════════════
// VIRAL SCRIPT TEMPLATES - aus GoViralBitch GitHub
// ═══════════════════════════════════════════════════════════════

export const VIRAL_SCRIPT_TEMPLATES = {
  reelScript: {
    name: "Reel/TikTok Script",
    structure: `Hook (0-2 Sek): {{pattern_interrupt}}
Setup (2-5 Sek): {{context}}
Value (5-25 Sek): {{actual_advice}}
CTA (25-30 Sek): {{call_to_action}}`,
  },
  storyPost: {
    name: "Story Post (LinkedIn/Facebook)",
    structure: `{{hook_unexpected_outcome}}

{{set_the_scene}}

{{the_challenge}}

{{what_happened}}

{{the_turning_point}}

{{the_result}}

{{the_lesson}}

{{question_for_engagement}}`,
  },
  contrarianTake: {
    name: "Contrarian Take",
    structure: `{{unpopular_opinion}}

Hier ist warum:

{{reason_1}}

{{reason_2}}

{{reason_3}}

{{what_to_do_instead}}

{{invite_discussion}}`,
  },
  listPost: {
    name: "List Post",
    structure: `{{number}} Dinge die ich über {{topic}} gelernt habe nach {{credibility_builder}}:

1. {{point_1}} — {{explanation_1}}
2. {{point_2}} — {{explanation_2}}
3. {{point_3}} — {{explanation_3}}

{{wrap_up_insight}}

Was davon resoniert am meisten mit dir?`,
  },
  howTo: {
    name: "How-To Post",
    structure: `Wie du {{outcome}} in {{timeframe}} erreichst:

Schritt 1: {{action_1}}
↳ {{why_it_matters}}

Schritt 2: {{action_2}}
↳ {{key_detail}}

Schritt 3: {{action_3}}
↳ {{common_mistake_to_avoid}}

{{expected_result}}

{{cta}}`,
  },
  carouselHook: {
    name: "Carousel (Instagram/LinkedIn)",
    structure: `Slide 1: {{bold_statement_or_question}}
Slides 2-9: Je ein Punkt pro Slide mit Visual + Text
Slide 10: Zusammenfassung + CTA
Caption: {{expand_topic_add_context_cta}}`,
  },
  youtubeThread: {
    name: "YouTube Longform Script",
    structure: `HOOK (0-30 Sek): {{attention_grabber}}
INTRO (30-60 Sek): {{what_youll_learn}}
KAPITEL 1: {{main_point_1}}
KAPITEL 2: {{main_point_2}}
KAPITEL 3: {{main_point_3}}
ZUSAMMENFASSUNG: {{key_takeaways}}
CTA: {{subscribe_comment_link}}`,
  },
};

// ═══════════════════════════════════════════════════════════════
// QUALITY GATE - Automatische Prüfung vor Veröffentlichung
// ═══════════════════════════════════════════════════════════════

export interface QualityCheckResult {
  passed: boolean;
  score: number; // 0-100
  checks: {
    name: string;
    passed: boolean;
    message: string;
    severity: "error" | "warning" | "info";
  }[];
}

export function runQualityGate(content: string, platform: string): QualityCheckResult {
  const checks: QualityCheckResult["checks"] = [];
  let score = 100;

  // 1. Mindestlänge
  if (content.length < 50) {
    checks.push({ name: "Mindestlänge", passed: false, message: "Content ist zu kurz (min. 50 Zeichen)", severity: "error" });
    score -= 30;
  } else {
    checks.push({ name: "Mindestlänge", passed: true, message: `${content.length} Zeichen - OK`, severity: "info" });
  }

  // 2. Maximallänge pro Plattform
  const maxLengths: Record<string, number> = {
    twitter: 280, threads: 500, instagram: 2200, facebook: 63206,
    linkedin: 3000, tiktok: 2200, youtube: 5000, pinterest: 500, bluesky: 300,
  };
  const maxLen = maxLengths[platform.toLowerCase()] || 5000;
  if (content.length > maxLen) {
    checks.push({ name: "Maximallänge", passed: false, message: `Content zu lang für ${platform} (max. ${maxLen} Zeichen)`, severity: "error" });
    score -= 20;
  } else {
    checks.push({ name: "Maximallänge", passed: true, message: `Passt für ${platform}`, severity: "info" });
  }

  // 3. Brand Safety - Falsche Zertifizierungen
  const forbiddenTerms = ["TÜV-geprüft", "TÜV geprüft", "TÜV zertifiziert", "Schneeballsystem", "Pyramidensystem", "MLM-Scam"];
  for (const term of forbiddenTerms) {
    if (content.toLowerCase().includes(term.toLowerCase())) {
      checks.push({ name: "Brand Safety", passed: false, message: `Verbotener Begriff gefunden: "${term}"`, severity: "error" });
      score -= 25;
    }
  }
  if (!checks.some(c => c.name === "Brand Safety")) {
    checks.push({ name: "Brand Safety", passed: true, message: "Keine verbotenen Begriffe", severity: "info" });
  }

  // 4. Hook-Check - Erster Satz muss stark sein
  const firstLine = content.split("\n")[0] || "";
  const hasHook = firstLine.length > 10 && (
    firstLine.includes("?") || firstLine.includes("!") || firstLine.includes("...") ||
    firstLine.includes("Wie") || firstLine.includes("Warum") || firstLine.includes("Der") ||
    firstLine.includes("Die") || firstLine.includes("Das") || /\d/.test(firstLine)
  );
  if (!hasHook) {
    checks.push({ name: "Hook-Qualität", passed: false, message: "Erster Satz könnte stärker sein - nutze eine Hook-Formel", severity: "warning" });
    score -= 10;
  } else {
    checks.push({ name: "Hook-Qualität", passed: true, message: "Starker Hook erkannt", severity: "info" });
  }

  // 5. CTA-Check
  const ctaKeywords = ["Link in Bio", "DM", "Kommentiere", "Schreib", "klick", "Link", "Beratung", "buchen", "starten", "STARTEN", "INFO"];
  const hasCTA = ctaKeywords.some(kw => content.toLowerCase().includes(kw.toLowerCase()));
  if (!hasCTA) {
    checks.push({ name: "CTA vorhanden", passed: false, message: "Kein Call-to-Action gefunden - füge einen CTA hinzu", severity: "warning" });
    score -= 10;
  } else {
    checks.push({ name: "CTA vorhanden", passed: true, message: "CTA erkannt", severity: "info" });
  }

  // 6. Emoji-Check (für Social Media wichtig)
  const hasEmoji = /[\uD83C-\uDBFF\uDC00-\uDFFF]+/.test(content) || /[\u2600-\u27BF]/.test(content);
  if (platform !== "linkedin" && !hasEmoji) {
    checks.push({ name: "Emojis", passed: false, message: "Keine Emojis gefunden - für Social Media empfohlen", severity: "warning" });
    score -= 5;
  } else {
    checks.push({ name: "Emojis", passed: true, message: "OK", severity: "info" });
  }

  // 7. Hashtag-Check
  const hashtagCount = (content.match(/#\w+/g) || []).length;
  if (["instagram", "tiktok", "linkedin"].includes(platform.toLowerCase()) && hashtagCount === 0) {
    checks.push({ name: "Hashtags", passed: false, message: "Keine Hashtags gefunden - für diese Plattform empfohlen", severity: "warning" });
    score -= 5;
  } else if (platform.toLowerCase() === "instagram" && hashtagCount > 5) {
    checks.push({ name: "Hashtags", passed: false, message: `Zu viele Hashtags für Instagram (${hashtagCount}, max. 5 empfohlen seit 2026)`, severity: "warning" });
    score -= 5;
  } else if (hashtagCount > 15) {
    checks.push({ name: "Hashtags", passed: false, message: `Zu viele Hashtags (${hashtagCount})`, severity: "warning" });
    score -= 5;
  } else {
    checks.push({ name: "Hashtags", passed: true, message: `${hashtagCount} Hashtags - OK`, severity: "info" });
  }

  // 8. LR-Branding Check
  const lrTerms = ["LR", "Aloe Vera", "Mind Master", "Zeitgard", "Fresenius", "Dermatest", "Lina", "Autokonzept"];
  const hasLRBranding = lrTerms.some(term => content.includes(term));
  if (hasLRBranding) {
    checks.push({ name: "LR-Branding", passed: true, message: "LR-Bezug erkannt", severity: "info" });
    score = Math.min(score + 5, 100);
  } else {
    checks.push({ name: "LR-Branding", passed: true, message: "Kein direkter LR-Bezug (kann gewollt sein)", severity: "info" });
  }

  return {
    passed: score >= 60 && !checks.some(c => c.severity === "error" && !c.passed),
    score: Math.max(0, Math.min(100, score)),
    checks,
  };
}

// ═══════════════════════════════════════════════════════════════
// fal.ai PREMIUM BILD-KI - Nano Banana Pro (Google Gemini 3 Pro Image)
// ═══════════════════════════════════════════════════════════════

export interface PremiumImageRequest {
  prompt: string;
  aspectRatio?: "21:9" | "16:9" | "3:2" | "4:3" | "5:4" | "1:1" | "4:5" | "3:4" | "2:3" | "9:16";
  resolution?: "1K" | "2K" | "4K";
  outputFormat?: "jpeg" | "png" | "webp";
}

export interface PremiumImageResult {
  imageUrl: string;
  model: string;
  description: string;
}

export async function generatePremiumImage(req: PremiumImageRequest): Promise<PremiumImageResult> {
  const currentKey = process.env.FAL_API_KEY || "";
  if (!currentKey) {
    throw new Error("FAL_API_KEY ist nicht konfiguriert. Bitte in den Settings hinterlegen.");
  }

  fal.config({ credentials: currentKey });

  // Sicherstellen dass kein Text im Bild generiert wird
  const cleanPrompt = req.prompt.includes("no text") ? req.prompt : `${req.prompt}. Absolutely no text, no words, no letters, no watermarks in the image.`;

  const input: any = {
    prompt: cleanPrompt,
    num_images: 1,
    aspect_ratio: req.aspectRatio || "1:1",
    resolution: req.resolution || "2K",
    output_format: req.outputFormat || "png",
  };
  const result = await fal.subscribe("fal-ai/nano-banana-pro", { input }) as { data: { images: Array<{ url: string; content_type: string }>; description: string } };

  const imageUrl = result.data?.images?.[0]?.url || "";
  if (!imageUrl) {
    throw new Error("Nano Banana Pro hat kein Bild generiert");
  }

  return {
    imageUrl,
    model: "nano-banana-pro",
    description: result.data?.description || "",
  };
}

// ═══════════════════════════════════════════════════════════════
// fal.ai PREMIUM VIDEO-KI - Veo 3.1 Fast + Kling 3.0 Pro
// Automatische Modellwahl: Veo 3.1 (bis 8s), Kling 3.0 Pro (>8s bis 15s)
// ═══════════════════════════════════════════════════════════════

export interface VideoGenerationRequest {
  prompt: string;
  imageUrl?: string;
  model?: "kling-3" | "veo-3" | "minimax" | "auto";
  duration?: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  generateAudio?: boolean;
  resolution?: "720p" | "1080p" | "4k";
}

export interface VideoGenerationResult {
  videoUrl: string;
  model: string;
  duration: string;
}

/** Automatische Premium-Modellwahl: Veo 3.1 für <=8s, Kling 3.0 Pro für >8s */
function selectBestVideoModel(duration: string, hasImage: boolean): { model: "veo-3" | "kling-3"; reason: string } {
  const dur = parseInt(duration, 10) || 5;
  if (dur <= 8) {
    return { model: "veo-3", reason: `Veo 3.1 Fast (${dur}s, 4K, Audio+Lip-Sync)` };
  }
  return { model: "kling-3", reason: `Kling 3.0 Pro (${dur}s, bis 15s, Audio)` };
}

export async function generateVideoWithFal(req: VideoGenerationRequest): Promise<VideoGenerationResult> {
  const currentKey = process.env.FAL_API_KEY || "";
  if (!currentKey) {
    throw new Error("FAL_API_KEY ist nicht konfiguriert. Bitte in den Settings hinterlegen.");
  }

  const duration = req.duration || "5";
  const aspectRatio = req.aspectRatio || "9:16";
  const generateAudio = req.generateAudio !== false;

  // Auto-Modellwahl: Immer das Beste
  let effectiveModel = req.model || "auto";
  if (effectiveModel === "auto" || effectiveModel === "minimax") {
    const best = selectBestVideoModel(duration, !!req.imageUrl);
    effectiveModel = best.model;
    console.log(`[Premium Video] Auto-Wahl: ${best.reason}`);
  }

  let falModel: string;
  let input: Record<string, unknown>;

  switch (effectiveModel) {
    case "veo-3": {
      // Veo 3.1 Fast - Bestes Modell, max 8s, 4K, nativer Audio+Lip-Sync
      // Veo 3.1 erlaubt nur 4s, 6s oder 8s
      const rawDur = Math.min(parseInt(duration, 10) || 5, 8);
      const veoDuration = rawDur <= 4 ? 4 : rawDur <= 6 ? 6 : 8;
      const veoAspect = aspectRatio === "1:1" ? "16:9" : aspectRatio; // Veo unterstützt nur 16:9 und 9:16

      if (req.imageUrl) {
        falModel = "fal-ai/veo3.1/image-to-video";
        input = {
          prompt: req.prompt,
          image_url: req.imageUrl,
          duration: `${veoDuration}s`,
          aspect_ratio: veoAspect,
          resolution: req.resolution || "720p",
          generate_audio: generateAudio,
        };
      } else {
        falModel = "fal-ai/veo3.1";
        input = {
          prompt: req.prompt,
          duration: `${veoDuration}s`,
          aspect_ratio: veoAspect,
          resolution: req.resolution || "1080p",
          generate_audio: generateAudio,
        };
      }
      break;
    }
    case "kling-3": {
      // Kling 3.0 Pro - Für längere Videos (bis 15s), Audio
      const klingDuration = Math.min(Math.max(parseInt(duration, 10) || 5, 3), 15).toString();

      if (req.imageUrl) {
        falModel = "fal-ai/kling-video/v3/pro/image-to-video";
        input = {
          prompt: req.prompt,
          start_image_url: req.imageUrl, // Kling v3 nutzt start_image_url!
          duration: klingDuration,
          generate_audio: generateAudio,
          negative_prompt: "blur, distort, and low quality",
        };
      } else {
        falModel = "fal-ai/kling-video/v3/pro/text-to-video";
        input = {
          prompt: req.prompt,
          duration: klingDuration,
          aspect_ratio: aspectRatio,
          generate_audio: generateAudio,
          negative_prompt: "blur, distort, and low quality",
        };
      }
      break;
    }
    default: {
      // Fallback auf Veo 3.1
      falModel = "fal-ai/veo3.1";
      input = {
        prompt: req.prompt,
        duration: "5s",
        aspect_ratio: aspectRatio === "1:1" ? "16:9" : aspectRatio,
        resolution: "1080p",
        generate_audio: generateAudio,
      };
    }
  }

  // Configure fal with current key at runtime
  fal.config({ credentials: currentKey });
  console.log(`[Premium Video] Generiere mit ${falModel}, Duration: ${duration}, Audio: ${generateAudio}`);
  const result = await fal.subscribe(falModel, { input }) as { data: { video: { url: string } } };

  return {
    videoUrl: result.data?.video?.url || "",
    model: effectiveModel,
    duration,
  };
}

// ═══════════════════════════════════════════════════════════════
// GoViralBitch API Client
// ═══════════════════════════════════════════════════════════════

export interface GoViralBitchPostRequest {
  topic?: string;
  pillar?: string;
  platform?: string;
  count?: number;
}

export interface GoViralBitchReelRequest {
  topic?: string;
  pillar?: string;
  duration?: number;
  count?: number;
}

export interface GoViralBitchHookRequest {
  topic?: string;
  pillar?: string;
  style?: string;
  count?: number;
}

export interface GoViralBitchAdCopyRequest {
  product?: string;
  objective?: string;
  format?: string;
  count?: number;
}

export interface GoViralBitchBatchRequest {
  week_start?: string;
  platforms?: string[];
  posts_per_day?: number;
}

export interface GoViralBitchFollowUpRequest {
  lead_name: string;
  step: number;
  interest?: string;
  partner_name?: string;
}

export interface GoViralBitchObjectionRequest {
  objection: string;
  context?: string;
  partner_name?: string;
}

export interface GoViralBitchResponse {
  id: string;
  type: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

async function callGoViralBitch(endpoint: string, body: Record<string, unknown>): Promise<GoViralBitchResponse> {
  const res = await fetch(`${GOVIRALBITCH_URL}/api/content/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    throw new Error(`GoViralBitch API error (${res.status}): ${errText}`);
  }
  return res.json();
}

export async function goViralBitchHealthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${GOVIRALBITCH_URL}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function generatePost(req: GoViralBitchPostRequest) {
  return callGoViralBitch("post", { ...req, language: "deutsch", max_hashtags: 5 } as Record<string, unknown>);
}

export async function generateReel(req: GoViralBitchReelRequest) {
  return callGoViralBitch("reel", { ...req, language: "deutsch", max_hashtags: 5 } as Record<string, unknown>);
}

export async function generateStory(req: GoViralBitchPostRequest) {
  return callGoViralBitch("story", { ...req, language: "deutsch", max_hashtags: 5 } as Record<string, unknown>);
}

export async function generateHooks(req: GoViralBitchHookRequest) {
  return callGoViralBitch("hooks", { ...req, language: "deutsch" } as Record<string, unknown>);
}

export async function generateAdCopy(req: GoViralBitchAdCopyRequest) {
  return callGoViralBitch("ad-copy", { ...req, language: "deutsch" } as Record<string, unknown>);
}

export async function generateFollowUp(req: GoViralBitchFollowUpRequest) {
  return callGoViralBitch("follow-up", { ...req, language: "deutsch" } as unknown as Record<string, unknown>);
}

export async function generateObjection(req: GoViralBitchObjectionRequest) {
  return callGoViralBitch("objection", { ...req, language: "deutsch" } as unknown as Record<string, unknown>);
}

export async function generateBatch(req: GoViralBitchBatchRequest) {
  return callGoViralBitch("batch", { ...req, language: "deutsch", max_hashtags: 5 } as Record<string, unknown>);
}

// ═══════════════════════════════════════════════════════════════
// Blotato API Client
// ═══════════════════════════════════════════════════════════════

const BLOTATO_BASE = "https://backend.blotato.com/v2";

export interface BlotatoAccount {
  id: number;
  platform: string;
  username: string;
  displayName?: string;
}

async function callBlotato(endpoint: string, method: string = "GET", body?: unknown, apiKey?: string) {
  const headers: Record<string, string> = {
    "blotato-api-key": apiKey || BLOTATO_API_KEY,
    "Content-Type": "application/json",
  };
  const res = await fetch(`${BLOTATO_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    throw new Error(`Blotato API error (${res.status}): ${errText}`);
  }
  return res.json();
}

export async function getBlotatoAccounts(apiKey?: string): Promise<BlotatoAccount[]> {
  try {
    const data = await callBlotato("/users/me/accounts", "GET", undefined, apiKey);
    // Blotato returns { items: [...] }
    const items = data?.items || (Array.isArray(data) ? data : (data?.accounts || []));
    return items.map((a: any) => ({
      id: Number(a.id),
      platform: a.platform,
      username: a.username || a.fullname || "",
      displayName: a.fullname || a.username || "",
    }));
  } catch (err) {
    console.error("[Blotato] Failed to get accounts:", err);
    return [];
  }
}

export async function scheduleOnBlotato(
  accountId: number,
  text: string,
  platform: string,
  mediaUrls?: string[],
  scheduledDate?: string,
): Promise<unknown> {
  const postData: Record<string, unknown> = {
    post: {
      accountId,
      content: {
        text,
        mediaUrls: mediaUrls || [],
        platform,
      },
      target: {
        targetType: platform,
      },
    },
    useNextFreeSlot: !scheduledDate,
  };

  if (scheduledDate) {
    postData.scheduledTime = scheduledDate;
    postData.useNextFreeSlot = false;
  }

  try {
    return await callBlotato("/posts", "POST", postData);
  } catch (err: any) {
    // Fallback: Wenn kein freier Slot verfügbar, konkreten Zeitpunkt nutzen
    if (err?.message?.includes("No available slot") && !scheduledDate) {
      const fallbackTime = getNextOptimalPostingTime(platform);
      postData.useNextFreeSlot = false;
      postData.scheduledTime = fallbackTime;
      console.log(`[Blotato] Kein freier Slot, nutze Fallback-Zeit: ${fallbackTime}`);
      return callBlotato("/posts", "POST", postData);
    }
    throw err;
  }
}

/** Berechnet den nächsten optimalen Posting-Zeitpunkt basierend auf Plattform (Smart Engine) */
function getNextOptimalPostingTime(platform: string): string {
  const { getNextSmartPostingTime } = require("./smartPostingTimes");
  const result = getNextSmartPostingTime(platform);
  return result.scheduledTime;
}

export async function publishToAllPlatforms(
  content: string,
  platforms: string[],
  accounts: BlotatoAccount[],
  mediaUrls?: string[],
  scheduledDate?: string,
  apiKey?: string,
): Promise<string[]> {
  const postIds: string[] = [];

  for (const platform of platforms) {
    const account = accounts.find(a => a.platform.toLowerCase() === platform.toLowerCase());
    if (!account) {
      console.warn(`[Blotato] No account found for platform: ${platform}`);
      continue;
    }

    try {
      const result = await scheduleOnBlotato(
        account.id,
        content,
        platform,
        mediaUrls,
        scheduledDate,
      );
      const postId = (result as any)?.id || (result as any)?.post?.id || `${platform}-${Date.now()}`;
      postIds.push(String(postId));
    } catch (err) {
      console.error(`[Blotato] Failed to post to ${platform}:`, err);
    }
  }

  return postIds;
}

// ═══════════════════════════════════════════════════════════════
// BLOTATO CALENDAR API - Geplante Posts verwalten
// ═══════════════════════════════════════════════════════════════

export interface BlotatoScheduledPost {
  id: string;
  scheduledAt: string;
  draft: {
    accountId: string;
    content: {
      text: string;
      mediaUrls: string[];
      platform: string;
    };
    target: {
      targetType: string;
    };
  };
  account: {
    id: string;
    name: string;
    username: string;
    profileImageUrl: string | null;
    subaccountId: string | null;
    subaccountName: string | null;
  };
}

/** Alle geplanten Posts abrufen (nur zukünftige, sortiert nach scheduledAt) */
export async function getScheduledPosts(limit: number = 100, cursor?: string, apiKey?: string): Promise<{
  items: BlotatoScheduledPost[];
  count: string;
  cursor: string | null;
}> {
  try {
    let endpoint = `/schedules?limit=${limit}`;
    if (cursor) endpoint += `&cursor=${cursor}`;
    const data = await callBlotato(endpoint, "GET", undefined, apiKey);
    return {
      items: data?.items || [],
      count: data?.count || "0",
      cursor: data?.cursor || null,
    };
  } catch (err) {
    console.error("[Blotato Calendar] Failed to get scheduled posts:", err);
    return { items: [], count: "0", cursor: null };
  }
}

/** Einzelnen geplanten Post abrufen */
export async function getScheduledPost(scheduleId: string, apiKey?: string): Promise<BlotatoScheduledPost | null> {
  try {
    const data = await callBlotato(`/schedules/${scheduleId}`, "GET", undefined, apiKey);
    return data?.schedule || null;
  } catch (err) {
    console.error(`[Blotato Calendar] Failed to get schedule ${scheduleId}:`, err);
    return null;
  }
}

/** Geplanten Post aktualisieren (Text, Medien, Zeitpunkt) */
export async function updateScheduledPost(
  scheduleId: string,
  patch: {
    scheduledTime?: string;
    draft?: {
      accountId: string;
      content: {
        text: string;
        mediaUrls: string[];
        platform: string;
      };
      target: {
        targetType: string;
      };
    };
  },
  apiKey?: string,
): Promise<boolean> {
  try {
    await callBlotato(`/schedules/${scheduleId}`, "PATCH", { patch }, apiKey);
    return true;
  } catch (err) {
    console.error(`[Blotato Calendar] Failed to update schedule ${scheduleId}:`, err);
    return false;
  }
}

/** Geplanten Post löschen (unwiderruflich) */
export async function deleteScheduledPost(scheduleId: string, apiKey?: string): Promise<boolean> {
  try {
    await callBlotato(`/schedules/${scheduleId}`, "DELETE", undefined, apiKey);
    return true;
  } catch (err) {
    console.error(`[Blotato Calendar] Failed to delete schedule ${scheduleId}:`, err);
    return false;
  }
}

/** Geplanten Post auf neuen Zeitpunkt verschieben */
export async function reschedulePost(scheduleId: string, newTime: string, apiKey?: string): Promise<boolean> {
  return updateScheduledPost(scheduleId, { scheduledTime: newTime }, apiKey);
}

// Blotato Account Mapping - LR Lifestyle Team
export const LR_BLOTATO_ACCOUNTS: BlotatoAccount[] = [
  { id: 3978, platform: "facebook", username: "Sven Sven" },
  { id: 4089, platform: "youtube", username: "Mathias Vinzing" },
  { id: 5345, platform: "instagram", username: "lr_lifestyleteam" },
  { id: 2949, platform: "linkedin", username: "Mathias Vinzing" },
  { id: 1398, platform: "threads", username: "lr_lifestyleteam" },
  { id: 17918, platform: "tiktok", username: "mathiasvinzing978" },
  { id: 6683, platform: "tiktok", username: "lr_lifestyleteam" },
  { id: 2961, platform: "twitter", username: "Matze39063828" },
];

// ═══════════════════════════════════════════════════════════════
// BLOTATO VISUAL API - Carousels, Quote Cards, Infografiken
// ═══════════════════════════════════════════════════════════════

export interface BlotatoVisualRequest {
  prompt: string;
  templateId?: string;
  apiKey?: string;
}

export interface BlotatoVisualResult {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  mediaUrl?: string;
  imageUrls?: string[];
}

/** Blotato Visual erstellen (Carousel, Quote Card, Infografik) */
export async function createBlotatoVisual(req: BlotatoVisualRequest): Promise<BlotatoVisualResult> {
  const body: Record<string, unknown> = {
    prompt: req.prompt,
  };
  if (req.templateId) body.templateId = req.templateId;

  const data = await callBlotato("/visuals", "POST", body, req.apiKey);
  return {
    id: data?.id || data?.visual?.id || "",
    status: data?.status || "pending",
    mediaUrl: data?.mediaUrl,
    imageUrls: data?.imageUrls,
  };
}

/** Blotato Visual Status abfragen (Polling) */
export async function getBlotatoVisualStatus(visualId: string, apiKey?: string): Promise<BlotatoVisualResult> {
  const data = await callBlotato(`/visuals/${visualId}`, "GET", undefined, apiKey);
  return {
    id: visualId,
    status: data?.status || "pending",
    mediaUrl: data?.mediaUrl || data?.visual?.mediaUrl,
    imageUrls: data?.imageUrls || data?.visual?.imageUrls,
  };
}

/** Blotato Visual erstellen und auf Fertigstellung warten (max 60s) */
export async function createAndWaitForVisual(req: BlotatoVisualRequest): Promise<BlotatoVisualResult> {
  const created = await createBlotatoVisual(req);
  if (!created.id) throw new Error("Blotato Visual konnte nicht erstellt werden");

  // Polling: max 60 Sekunden warten
  const maxWait = 60000;
  const interval = 3000;
  let elapsed = 0;

  while (elapsed < maxWait) {
    await new Promise(resolve => setTimeout(resolve, interval));
    elapsed += interval;

    const status = await getBlotatoVisualStatus(created.id, req.apiKey);
    if (status.status === "completed") return status;
    if (status.status === "failed") throw new Error("Blotato Visual Generierung fehlgeschlagen");
  }

  throw new Error("Blotato Visual Timeout nach 60 Sekunden");
}
