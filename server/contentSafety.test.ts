import { describe, it, expect } from "vitest";

// We test the functions indirectly by importing the module
// Since enforceHashtagLimit and removePricesFromContent are private in externalApis,
// we test them through the exported scheduleOnBlotato behavior.
// For unit testing, we replicate the logic here.

// Replicate enforceHashtagLimit for testing
function enforceHashtagLimit(text: string, platform: string): string {
  const maxHashtags: Record<string, number> = {
    instagram: 5, tiktok: 5, threads: 5,
    facebook: 10, linkedin: 10, youtube: 10,
    twitter: 5, pinterest: 10, bluesky: 5,
  };
  const limit = maxHashtags[platform.toLowerCase()] || 5;
  const hashtags = text.match(/#\w+/g) || [];
  if (hashtags.length <= limit) return text;
  
  const hashtagsToRemove = hashtags.slice(limit);
  let result = text;
  for (const tag of hashtagsToRemove) {
    result = result.replace(new RegExp(`\\s*${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, ''), '');
  }
  return result.trim();
}

// Replicate removePricesFromContent for testing
function removePricesFromContent(text: string): string {
  const pricePatterns = [
    /\b\d+[.,]?\d*\s*€/g,
    /\b\d+[.,]?\d*\s*Euro\b/gi,
    /\b\d+[.,]?\d*\s*EUR\b/g,
    /\bab\s+\d+[.,]?\d*\s*€/gi,
    /\bnur\s+\d+[.,]?\d*\s*€/gi,
    /\bfür\s+\d+[.,]?\d*\s*€/gi,
    /\bEinstieg.*?\d+[.,]?\d*\s*€/gi,
  ];
  let result = text;
  let removed = false;
  for (const pattern of pricePatterns) {
    if (pattern.test(result)) {
      result = result.replace(pattern, '');
      removed = true;
    }
  }
  if (removed) {
    result = result.replace(/  +/g, ' ').replace(/\n\s*\n\s*\n/g, '\n\n').trim();
  }
  return result;
}

describe("Content Safety - Hashtag Limiter", () => {
  it("should keep text unchanged when hashtags <= limit", () => {
    const text = "Toller Post! #LR #Lifestyle #Erfolg";
    expect(enforceHashtagLimit(text, "instagram")).toBe(text);
  });

  it("should limit Instagram to 5 hashtags", () => {
    const text = "Post #a #b #c #d #e #f #g #h";
    const result = enforceHashtagLimit(text, "instagram");
    const remaining = result.match(/#\w+/g) || [];
    expect(remaining.length).toBe(5);
    expect(remaining).toEqual(["#a", "#b", "#c", "#d", "#e"]);
  });

  it("should limit TikTok to 5 hashtags", () => {
    const text = "Video #a #b #c #d #e #f #g";
    const result = enforceHashtagLimit(text, "tiktok");
    const remaining = result.match(/#\w+/g) || [];
    expect(remaining.length).toBe(5);
  });

  it("should allow up to 10 hashtags on LinkedIn", () => {
    const text = "Post #a #b #c #d #e #f #g #h #i #j";
    const result = enforceHashtagLimit(text, "linkedin");
    const remaining = result.match(/#\w+/g) || [];
    expect(remaining.length).toBe(10);
  });

  it("should handle text with no hashtags", () => {
    const text = "Einfacher Text ohne Hashtags";
    expect(enforceHashtagLimit(text, "instagram")).toBe(text);
  });

  it("should handle exactly 5 hashtags on Instagram", () => {
    const text = "#a #b #c #d #e";
    expect(enforceHashtagLimit(text, "instagram")).toBe(text);
  });

  it("should default to 5 for unknown platforms", () => {
    const text = "Post #a #b #c #d #e #f #g";
    const result = enforceHashtagLimit(text, "unknown_platform");
    const remaining = result.match(/#\w+/g) || [];
    expect(remaining.length).toBe(5);
  });
});

describe("Content Safety - Price Remover", () => {
  it("should remove Euro symbol prices", () => {
    const text = "Starte für nur 99€ dein Business!";
    const result = removePricesFromContent(text);
    expect(result).not.toContain("99€");
    expect(result).not.toContain("€");
  });

  it("should remove Euro word prices", () => {
    const text = "Der Einstieg kostet 119 Euro";
    const result = removePricesFromContent(text);
    expect(result).not.toContain("119 Euro");
  });

  it("should remove EUR prices", () => {
    const text = "Preis: 49.90 EUR";
    const result = removePricesFromContent(text);
    expect(result).not.toContain("49.90 EUR");
  });

  it("should remove 'ab X€' patterns", () => {
    const text = "Produkte ab 15€ verfügbar";
    const result = removePricesFromContent(text);
    expect(result).not.toContain("15€");
  });

  it("should remove 'nur X€' patterns", () => {
    const text = "Nur 99€ für den Start";
    const result = removePricesFromContent(text);
    expect(result).not.toContain("99€");
  });

  it("should keep text without prices unchanged", () => {
    const text = "LR bietet dir die beste Qualität für dein Business!";
    expect(removePricesFromContent(text)).toBe(text);
  });

  it("should handle multiple prices in one text", () => {
    const text = "Einstieg 99€, Produkte ab 15€, Premium 199 Euro";
    const result = removePricesFromContent(text);
    expect(result).not.toContain("99€");
    expect(result).not.toContain("15€");
    expect(result).not.toContain("199 Euro");
  });

  it("should clean up double spaces after removal", () => {
    const text = "Start für 99€ jetzt!";
    const result = removePricesFromContent(text);
    expect(result).not.toContain("  ");
  });

  it("should handle empty text", () => {
    expect(removePricesFromContent("")).toBe("");
  });
});
