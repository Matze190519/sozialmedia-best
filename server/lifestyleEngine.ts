/**
 * Lifestyle Content Engine - Automatisch Bilder und Videos für Lifestyle-Content generieren.
 * Kategorien: Freiheit, Autos/Luxus, Erfolg/Business, Reisen, Motivation
 * Nutzt die eingebaute Image Generation API und fal.ai Video-KI.
 */

import { invokeLLM } from "./_core/llm";

// ═══════════════════════════════════════════════════════════════
// LIFESTYLE KATEGORIEN mit vordefinierten Bild-Prompts
// ═══════════════════════════════════════════════════════════════

export interface LifestyleCategory {
  key: string;
  name: string;
  emoji: string;
  description: string;
  imagePrompts: string[];
  videoPrompts: string[];
  moods: string[];
  keywords: string[];
}

export const LIFESTYLE_CATEGORIES: Record<string, LifestyleCategory> = {
  freedom: {
    key: "freedom",
    name: "Freiheit & Unabhängigkeit",
    emoji: "🌅",
    description: "Ortsunabhängig arbeiten, eigener Chef sein, Freiheit genießen",
    imagePrompts: [
      "Professional lifestyle photo of a young entrepreneur working on laptop at a luxury beach villa terrace with ocean view, golden hour sunlight, modern minimalist aesthetic, 4K photography",
      "Aerial drone shot of a person standing on a cliff overlooking the ocean at sunset, arms spread wide, feeling of freedom and success, cinematic lighting, professional photography",
      "Young professional couple walking on a pristine white sand beach at sunset, casual luxury clothing, relaxed confident posture, lifestyle photography, warm golden tones",
      "Person working remotely from a rooftop cafe in a Mediterranean city, laptop and coffee, beautiful cityscape in background, golden hour, lifestyle photography",
      "Entrepreneur sitting in first class airplane seat, working on laptop, champagne glass nearby, clouds visible through window, luxury travel lifestyle, professional photo",
      "Young successful person driving convertible along coastal road, ocean view, wind in hair, sunglasses, feeling of freedom, cinematic wide angle shot",
      "Digital nomad working from a hammock in tropical paradise, laptop balanced, palm trees and turquoise water, relaxed luxury lifestyle, professional photography",
      "Person meditating at sunrise on a luxury yacht deck, calm ocean, golden light, peace and freedom concept, minimalist aesthetic, 4K photo",
    ],
    videoPrompts: [
      "Cinematic slow motion of a person walking confidently towards a luxury beach villa at golden hour, ocean waves in background, feeling of achievement and freedom",
      "Drone footage following a convertible driving along a scenic coastal highway at sunset, ocean views, freedom and luxury lifestyle",
      "Time-lapse of a person working on laptop at different beautiful locations around the world, beach, mountain, city rooftop, digital nomad lifestyle",
    ],
    moods: ["befreiend", "inspirierend", "motivierend", "friedlich"],
    keywords: ["Freiheit", "Unabhängigkeit", "ortsunabhängig", "eigener Chef", "Traumleben"],
  },

  luxury_cars: {
    key: "luxury_cars",
    name: "Luxusautos & Autokonzept",
    emoji: "🏎️",
    description: "Mercedes, BMW, Porsche - das LR Autokonzept macht es möglich",
    imagePrompts: [
      "Sleek black Mercedes AMG GT parked in front of a modern luxury villa at dusk, dramatic lighting, reflections on wet ground, automotive photography, 4K",
      "White Porsche 911 Turbo S driving on a winding mountain road, dramatic alpine scenery, motion blur on wheels, professional automotive photography",
      "BMW M4 Competition in metallic blue parked at a luxury marina with yachts in background, golden hour, lifestyle automotive photography",
      "Young entrepreneur standing next to a brand new Mercedes-Benz S-Class, business casual outfit, confident smile, luxury lifestyle, professional photo",
      "Row of luxury cars (Mercedes, BMW, Porsche) in an underground parking garage with dramatic lighting, success and achievement concept, cinematic photo",
      "Person receiving keys to a new luxury car from a dealership, celebration moment, confetti, achievement and reward concept, professional photography",
      "Aerial view of a luxury sports car driving through a beautiful European countryside, winding roads, green hills, freedom and success, drone photography",
      "Close-up of luxury car steering wheel and dashboard with city lights reflected in windshield at night, premium lifestyle, automotive detail photography",
    ],
    videoPrompts: [
      "Cinematic reveal of a luxury Mercedes AMG in a dark garage, lights turning on dramatically, engine starting, powerful sound, luxury lifestyle commercial",
      "Slow motion of a Porsche 911 driving through city streets at night, reflections on wet road, neon lights, cinematic automotive footage",
      "Person walking towards their new BMW M car, getting in, driving away with confidence, city to highway transition, success lifestyle video",
    ],
    moods: ["kraftvoll", "luxuriös", "erfolgreich", "beeindruckend"],
    keywords: ["Autokonzept", "Firmenwagen", "Mercedes", "BMW", "Porsche", "Luxusauto"],
  },

  success: {
    key: "success",
    name: "Erfolg & Business",
    emoji: "💼",
    description: "Geschäftserfolg, Team-Building, Karriere, passives Einkommen",
    imagePrompts: [
      "Successful young entrepreneur in modern office with floor-to-ceiling windows overlooking city skyline, confident posture, business casual, professional photography",
      "Team of diverse young professionals celebrating success in a modern coworking space, high-fives, champagne, achievement moment, candid photography",
      "Person on stage giving a motivational speech to a large audience, dramatic stage lighting, confidence and leadership, event photography",
      "Close-up of hands signing a business contract with luxury pen, modern office desk, success and achievement, professional detail photography",
      "Young business person looking at financial charts on multiple screens showing growth, modern home office, success and wealth, professional photo",
      "Group of successful entrepreneurs at a luxury networking event, rooftop venue, city lights in background, professional social photography",
      "Person holding a large check or award on stage, celebration confetti, achievement and recognition, event photography, warm lighting",
      "Modern minimalist home office setup with dual monitors, city view, coffee, plants, successful remote work lifestyle, interior photography",
    ],
    videoPrompts: [
      "Motivational montage of a person's journey from humble beginnings to business success, office scenes, team celebrations, luxury lifestyle moments",
      "Cinematic footage of a business team meeting in a modern glass office, brainstorming, collaboration, success energy, corporate lifestyle",
      "Time-lapse of a person building their business from laptop at kitchen table to corner office with city view, transformation story",
    ],
    moods: ["motivierend", "kraftvoll", "inspirierend", "professionell"],
    keywords: ["Erfolg", "Business", "Karriere", "Einkommen", "Wachstum", "Team"],
  },

  travel: {
    key: "travel",
    name: "Reisen & Erlebnisse",
    emoji: "✈️",
    description: "Luxusreisen, Events, Incentive-Trips, die Welt entdecken",
    imagePrompts: [
      "Luxury infinity pool overlooking tropical ocean at sunset, person relaxing on edge, travel lifestyle, resort photography, warm golden tones",
      "Couple walking through narrow streets of Santorini Greece, white buildings, blue domes, travel lifestyle, golden hour photography",
      "Person standing at the edge of a luxury hotel balcony overlooking Dubai skyline at night, city lights, travel luxury, professional photo",
      "Group of friends toasting champagne on a luxury yacht at sunset, Mediterranean sea, celebration, travel lifestyle photography",
      "First class airport lounge, person relaxing with champagne, modern luxury interior, travel lifestyle, professional interior photography",
      "Panoramic view from luxury mountain chalet, snow-capped peaks, person with coffee on terrace, winter travel lifestyle, professional photo",
      "Person exploring a vibrant local market in Bali, colorful flowers and fruits, authentic travel experience, candid lifestyle photography",
      "Luxury safari lodge at golden hour, person watching sunset over African savanna, travel bucket list, professional wildlife travel photography",
    ],
    videoPrompts: [
      "Cinematic travel montage: luxury hotel room reveal, pool scenes, local food, sunset views, the ultimate incentive trip lifestyle",
      "Drone footage of a luxury resort on a tropical island, crystal clear water, white sand, palm trees, paradise travel lifestyle",
      "Person's travel day: first class flight, luxury transfer, hotel check-in, room reveal with ocean view, travel lifestyle vlog style",
    ],
    moods: ["abenteuerlich", "luxuriös", "entspannt", "inspirierend"],
    keywords: ["Reisen", "Luxusurlaub", "Incentive", "Erlebnis", "Abenteuer"],
  },

  motivation: {
    key: "motivation",
    name: "Motivation & Mindset",
    emoji: "🔥",
    description: "Motivationssprüche, Mindset-Shifts, Durchhaltevermögen",
    imagePrompts: [
      "Silhouette of a person standing on mountain peak at sunrise, arms raised in victory, dramatic clouds, motivational achievement photo, cinematic",
      "Close-up of a person's determined face, dramatic side lighting, focus and determination, black and white with subtle gold tones, portrait photography",
      "Person running up stairs at sunrise in a modern city, determination and hustle, fitness motivation, dynamic action photography",
      "Minimalist motivational quote layout: clean dark background with elegant gold typography, premium design aesthetic, social media ready",
      "Person breaking through a wall of obstacles symbolically, dramatic lighting, overcoming challenges concept, creative conceptual photography",
      "Early morning alarm clock showing 5:00 AM, person already at desk working, hustle culture, dedication and discipline, lifestyle photography",
      "Before and after transformation concept: split image showing struggle vs success, dramatic lighting contrast, motivational storytelling",
      "Lion portrait with dramatic lighting, power and leadership concept, metaphor for entrepreneurial spirit, professional wildlife photography",
    ],
    videoPrompts: [
      "Motivational montage: alarm at 5AM, workout, cold shower, work session, team meeting, celebration - the daily grind of a successful entrepreneur",
      "Cinematic slow motion of a person overcoming physical challenges (running, climbing, pushing limits), metaphor for business success",
      "Inspirational time-lapse: empty whiteboard filling up with goals and achievements being checked off, progress and determination",
    ],
    moods: ["kraftvoll", "energetisch", "inspirierend", "unaufhaltsam"],
    keywords: ["Motivation", "Mindset", "Disziplin", "Durchhalten", "Erfolg", "Hustle"],
  },
};

// ═══════════════════════════════════════════════════════════════
// LIFESTYLE CONTENT GENERATOR
// ═══════════════════════════════════════════════════════════════

export interface LifestyleContentRequest {
  category: string;
  topic?: string;
  platform?: string;
  mood?: string;
  includeText?: boolean;
  includeImage?: boolean;
  includeVideo?: boolean;
}

export interface LifestyleContentResult {
  text: string;
  imagePrompt: string;
  videoPrompt: string | null;
  category: string;
  mood: string;
  hashtags: string[];
  hook: string;
}

/**
 * Generiert kompletten Lifestyle-Content: Text + Bild-Prompt + Video-Prompt
 * Nutzt LLM für den Text und vordefinierte Prompts für die Medien.
 */
export async function generateLifestyleContent(
  req: LifestyleContentRequest
): Promise<LifestyleContentResult> {
  const category = LIFESTYLE_CATEGORIES[req.category];
  if (!category) {
    throw new Error(`Unbekannte Lifestyle-Kategorie: ${req.category}`);
  }

  const platform = req.platform || "instagram";
  const mood = req.mood || category.moods[Math.floor(Math.random() * category.moods.length)];

  // Zufälligen Bild-Prompt aus der Kategorie wählen
  const imagePrompt = category.imagePrompts[Math.floor(Math.random() * category.imagePrompts.length)];
  const videoPrompt = req.includeVideo
    ? category.videoPrompts[Math.floor(Math.random() * category.videoPrompts.length)]
    : null;

  // LLM generiert den Text passend zum Bild
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Du bist der #1 Lifestyle Content Creator für das LR Lifestyle Team von Mathias Vinzing.
LR Health & Beauty: 40+ Jahre, 32 Länder, Fresenius-geprüft, Dermatest-zertifiziert.
Einstiegspreis: 99€ (früher 1.200€). KI-Assistentin: Lina.

KATEGORIE: ${category.emoji} ${category.name}
${category.description}

STIMMUNG: ${mood}
PLATTFORM: ${platform}

REGELN:
1. Schreibe auf Deutsch, authentisch und motivierend
2. Der Hook MUSS in den ersten 2 Sekunden fesseln
3. Storytelling > Werbung (max 10% Produktbezug bei Lifestyle)
4. NIEMALS "TÜV" - nur "Fresenius-geprüft" und "Dermatest-zertifiziert"
5. CTA am Ende: DM-Aufforderung oder "Link in Bio"
6. Emojis passend zur Plattform und Stimmung
7. Content muss viral-tauglich sein
8. Keywords einbauen: ${category.keywords.join(", ")}
9. Das Bild zeigt: ${imagePrompt.slice(0, 200)}
10. Der Text muss zum Bild passen!`
      },
      {
        role: "user",
        content: `Erstelle einen ${platform}-Post für die Kategorie "${category.name}".
${req.topic ? `Thema: ${req.topic}` : "Wähle ein passendes Thema."}
Stimmung: ${mood}

Antworte als JSON mit: text (fertiger Post auf DEUTSCH), hook (erster Satz), hashtags (Array mit GENAU 5 passenden Hashtags - nicht mehr!).`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "lifestyle_content",
        strict: true,
        schema: {
          type: "object",
          properties: {
            text: { type: "string", description: "Fertiger Post-Text mit Hook, Story und CTA" },
            hook: { type: "string", description: "Der Hook - erster Satz des Posts" },
            hashtags: {
              type: "array",
              items: { type: "string" },
              description: "Genau 5 passende Hashtags",
            },
          },
          required: ["text", "hook", "hashtags"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const parsed = JSON.parse(response.choices?.[0]?.message?.content as string);
    return {
      text: parsed.text,
      hook: parsed.hook,
      hashtags: parsed.hashtags,
      imagePrompt,
      videoPrompt,
      category: req.category,
      mood,
    };
  } catch {
    return {
      text: `${category.emoji} Lifestyle Content für ${category.name}\n\nContent konnte nicht automatisch generiert werden.`,
      hook: `${category.emoji} ${category.name}`,
      hashtags: category.keywords.map(k => `#${k.replace(/\s+/g, "")}`),
      imagePrompt,
      videoPrompt,
      category: req.category,
      mood,
    };
  }
}

/**
 * Generiert einen angepassten Bild-Prompt basierend auf dem Content-Text.
 * Nutzt LLM um den Prompt an den spezifischen Text anzupassen.
 */
export async function generateCustomImagePrompt(
  text: string,
  category: string,
  mood?: string
): Promise<string> {
  const cat = LIFESTYLE_CATEGORIES[category];
  if (!cat) return "Professional lifestyle photography, luxury, success, modern aesthetic, 4K";

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Du bist ein Experte für KI-Bildgenerierung. Erstelle einen detaillierten, englischen Bild-Prompt für fotorealistische Lifestyle-Bilder.
Kategorie: ${cat.name}
Stimmung: ${mood || cat.moods[0]}
Stil: Professionelle Lifestyle-Fotografie, modern, hochwertig, 4K`
      },
      {
        role: "user",
        content: `Erstelle einen englischen Bild-Prompt der zu diesem Text passt:\n"${text.slice(0, 500)}"\n\nNur den Prompt zurückgeben, keine Erklärung. Max 200 Wörter.`
      }
    ],
  });

  const prompt = typeof response.choices?.[0]?.message?.content === "string"
    ? response.choices[0].message.content
    : cat.imagePrompts[0];

  return prompt.slice(0, 1000);
}

/**
 * Batch-Generator: Erstellt mehrere Lifestyle-Posts auf einmal.
 */
export async function generateLifestyleBatch(
  count: number = 5,
  categories?: string[],
  platform?: string
): Promise<LifestyleContentResult[]> {
  const cats = categories || Object.keys(LIFESTYLE_CATEGORIES);
  const results: LifestyleContentResult[] = [];

  for (let i = 0; i < count; i++) {
    const cat = cats[i % cats.length];
    try {
      const result = await generateLifestyleContent({
        category: cat,
        platform: platform || "instagram",
        includeImage: true,
        includeVideo: i % 3 === 0, // Jeder dritte Post mit Video
      });
      results.push(result);
    } catch (err) {
      console.error(`[LifestyleEngine] Failed to generate for ${cat}:`, err);
    }
  }

  return results;
}
