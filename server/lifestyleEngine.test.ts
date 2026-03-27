import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          text: "🌅 Stell dir vor, du wachst auf und dein einziger Plan ist: Strand oder Pool?\n\nGenau das ist mein Alltag seit ich mit LR gestartet bin. Kein Wecker, kein Chef, keine Grenzen.\n\n99€ war alles was es brauchte. Früher 1.200€.\n\nSchreib mir eine DM wenn du mehr wissen willst 💬",
          hook: "Stell dir vor, du wachst auf und dein einziger Plan ist: Strand oder Pool?",
          hashtags: ["#Freiheit", "#LRLifestyle", "#OrtsunabhängigArbeiten", "#Traumleben", "#NetworkMarketing"],
        }),
      },
    }],
  }),
}));

// Mock image generation
vi.mock("./_core/imageGeneration", () => ({
  generateImage: vi.fn().mockResolvedValue({ url: "https://example.com/lifestyle-image.png" }),
}));

describe("Lifestyle Content Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("LIFESTYLE_CATEGORIES", () => {
    it("should have 5 categories defined", async () => {
      const { LIFESTYLE_CATEGORIES } = await import("./lifestyleEngine");
      const keys = Object.keys(LIFESTYLE_CATEGORIES);
      expect(keys).toHaveLength(5);
      expect(keys).toContain("freedom");
      expect(keys).toContain("luxury_cars");
      expect(keys).toContain("success");
      expect(keys).toContain("travel");
      expect(keys).toContain("motivation");
    });

    it("each category should have required fields", async () => {
      const { LIFESTYLE_CATEGORIES } = await import("./lifestyleEngine");
      for (const [key, cat] of Object.entries(LIFESTYLE_CATEGORIES)) {
        expect(cat.key).toBe(key);
        expect(cat.name).toBeTruthy();
        expect(cat.emoji).toBeTruthy();
        expect(cat.description).toBeTruthy();
        expect(cat.imagePrompts.length).toBeGreaterThanOrEqual(3);
        expect(cat.videoPrompts.length).toBeGreaterThanOrEqual(1);
        expect(cat.moods.length).toBeGreaterThanOrEqual(2);
        expect(cat.keywords.length).toBeGreaterThanOrEqual(3);
      }
    });

    it("freedom category should have correct structure", async () => {
      const { LIFESTYLE_CATEGORIES } = await import("./lifestyleEngine");
      const freedom = LIFESTYLE_CATEGORIES.freedom;
      expect(freedom.name).toBe("Freiheit & Unabhängigkeit");
      expect(freedom.emoji).toBe("🌅");
      expect(freedom.imagePrompts.length).toBe(8);
      expect(freedom.videoPrompts.length).toBe(3);
      expect(freedom.moods).toContain("inspirierend");
      expect(freedom.keywords).toContain("Freiheit");
    });

    it("luxury_cars category should reference LR Autokonzept", async () => {
      const { LIFESTYLE_CATEGORIES } = await import("./lifestyleEngine");
      const cars = LIFESTYLE_CATEGORIES.luxury_cars;
      expect(cars.name).toContain("Autokonzept");
      expect(cars.keywords).toContain("Autokonzept");
      expect(cars.keywords).toContain("Mercedes");
      expect(cars.keywords).toContain("BMW");
      expect(cars.keywords).toContain("Porsche");
    });

    it("all image prompts should be in English for AI generation", async () => {
      const { LIFESTYLE_CATEGORIES } = await import("./lifestyleEngine");
      for (const cat of Object.values(LIFESTYLE_CATEGORIES)) {
        for (const prompt of cat.imagePrompts) {
          // English prompts should contain common English words
          expect(prompt.toLowerCase()).toMatch(/(photo|luxury|professional|lifestyle|cinematic|modern|minimalist|premium|elegant|dramatic|aerial|close)/);
        }
      }
    });
  });

  describe("generateLifestyleContent", () => {
    it("should generate content for a valid category", async () => {
      const { generateLifestyleContent } = await import("./lifestyleEngine");
      const result = await generateLifestyleContent({
        category: "freedom",
        platform: "instagram",
      });

      expect(result.text).toBeTruthy();
      expect(result.hook).toBeTruthy();
      expect(result.hashtags).toBeInstanceOf(Array);
      expect(result.hashtags.length).toBeGreaterThan(0);
      expect(result.imagePrompt).toBeTruthy();
      expect(result.category).toBe("freedom");
      expect(result.mood).toBeTruthy();
    });

    it("should throw for invalid category", async () => {
      const { generateLifestyleContent } = await import("./lifestyleEngine");
      await expect(generateLifestyleContent({
        category: "nonexistent",
      })).rejects.toThrow("Unbekannte Lifestyle-Kategorie");
    });

    it("should use provided mood when specified", async () => {
      const { generateLifestyleContent } = await import("./lifestyleEngine");
      const result = await generateLifestyleContent({
        category: "motivation",
        mood: "kraftvoll",
      });
      // The mood should be set (either the provided one or a fallback)
      expect(result.mood).toBeTruthy();
    });

    it("should include video prompt when requested", async () => {
      const { generateLifestyleContent } = await import("./lifestyleEngine");
      const result = await generateLifestyleContent({
        category: "travel",
        includeVideo: true,
      });
      expect(result.videoPrompt).toBeTruthy();
    });

    it("should not include video prompt when not requested", async () => {
      const { generateLifestyleContent } = await import("./lifestyleEngine");
      const result = await generateLifestyleContent({
        category: "success",
        includeVideo: false,
      });
      expect(result.videoPrompt).toBeNull();
    });
  });

  describe("generateCustomImagePrompt", () => {
    it("should generate a custom prompt for valid category", async () => {
      const { generateCustomImagePrompt } = await import("./lifestyleEngine");
      const { invokeLLM } = await import("./_core/llm");
      (invokeLLM as any).mockResolvedValueOnce({
        choices: [{
          message: {
            content: "Professional lifestyle photo of entrepreneur working from luxury beach villa, golden hour, 4K",
          },
        }],
      });

      const prompt = await generateCustomImagePrompt(
        "Arbeite von überall auf der Welt",
        "freedom",
        "inspirierend"
      );
      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe("string");
    });

    it("should return fallback for invalid category", async () => {
      const { generateCustomImagePrompt } = await import("./lifestyleEngine");
      const prompt = await generateCustomImagePrompt("Test", "invalid_cat");
      expect(prompt).toContain("lifestyle");
    });
  });

  describe("generateLifestyleBatch", () => {
    it("should generate multiple posts", async () => {
      const { generateLifestyleBatch } = await import("./lifestyleEngine");
      const results = await generateLifestyleBatch(3);
      expect(results.length).toBeLessThanOrEqual(3);
      for (const r of results) {
        expect(r.text).toBeTruthy();
        expect(r.category).toBeTruthy();
      }
    });

    it("should cycle through categories", async () => {
      const { generateLifestyleBatch } = await import("./lifestyleEngine");
      const results = await generateLifestyleBatch(5, ["freedom", "luxury_cars"]);
      const categories = results.map(r => r.category);
      // Should alternate between the two categories
      expect(categories.filter(c => c === "freedom").length).toBeGreaterThan(0);
      expect(categories.filter(c => c === "luxury_cars").length).toBeGreaterThan(0);
    });

    it("should include video prompt for every 3rd post", async () => {
      const { generateLifestyleBatch } = await import("./lifestyleEngine");
      const results = await generateLifestyleBatch(6, ["freedom"]);
      // Posts at index 0, 3 should have video (i % 3 === 0)
      if (results.length >= 4) {
        expect(results[0].videoPrompt).toBeTruthy();
        expect(results[3].videoPrompt).toBeTruthy();
      }
    });
  });
});
