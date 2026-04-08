import { describe, it, expect } from "vitest";

// Test the compliance shield engine
describe("Compliance Shield Engine", () => {
  it("should detect health claims", async () => {
    const { runComplianceCheck } = await import("./complianceShield");
    const result = runComplianceCheck("Dieses Produkt heilt Krebs und garantiert Gesundheit!", "instagram");
    expect(result.passed).toBe(false);
    expect(result.score).toBeLessThan(80);
    expect(result.checks.some(c => c.category === "Heilversprechen" && c.severity !== "pass")).toBe(true);
  });

  it("should detect income promises", async () => {
    const { runComplianceCheck } = await import("./complianceShield");
    const result = runComplianceCheck("Verdiene garantiert 5000€ pro Monat ohne Arbeit!", "instagram");
    expect(result.passed).toBe(false);
    expect(result.checks.some(c => c.category === "Einkommensversprechen" && c.severity !== "pass")).toBe(true);
  });

  it("should pass clean content", async () => {
    const { runComplianceCheck } = await import("./complianceShield");
    const result = runComplianceCheck("Unsere Aloe Vera Produkte unterstützen dein Wohlbefinden. Probiere es aus! #LRHealthBeauty", "instagram");
    expect(result.score).toBeGreaterThan(70);
  });

  it("should return correct structure", async () => {
    const { runComplianceCheck } = await import("./complianceShield");
    const result = runComplianceCheck("Test content", "instagram");
    expect(result).toHaveProperty("passed");
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("riskLevel");
    expect(result).toHaveProperty("checks");
    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("autoFixSuggestions");
    expect(Array.isArray(result.checks)).toBe(true);
  });
});

// Test the viral predictor engine
describe("Viral Predictor Engine", () => {
  it("should return quick analysis with scores", async () => {
    const { quickViralScore } = await import("./viralPredictor");
    const result = quickViralScore("Ich habe in 6 Monaten mein Leben verändert! 🔥 Hier ist wie...", "instagram");
    expect(result).toHaveProperty("quickScore");
    expect(result).toHaveProperty("emotionalTriggers");
    expect(result).toHaveProperty("shareabilityFactors");
    expect(result).toHaveProperty("issues");
    expect(result.quickScore).toBeGreaterThanOrEqual(0);
    expect(result.quickScore).toBeLessThanOrEqual(100);
    expect(Array.isArray(result.emotionalTriggers)).toBe(true);
  });

  it("should detect emotional triggers", async () => {
    const { quickViralScore } = await import("./viralPredictor");
    const result = quickViralScore("Das hat mein Leben verändert! Unglaublich was passiert ist 😱", "tiktok");
    expect(result.emotionalTriggers.length).toBeGreaterThan(0);
  });

  it("should give higher scores for engaging content", async () => {
    const { quickViralScore } = await import("./viralPredictor");
    const boring = quickViralScore("Produkt kaufen.", "instagram");
    const engaging = quickViralScore("STOPP! 🛑 Das hat noch niemand über das LR Autokonzept erzählt... Ich habe in 3 Monaten mein Traumauto bekommen! 🔥 Kommentiere 'AUTO' für mehr Info!", "instagram");
    expect(engaging.quickScore).toBeGreaterThan(boring.quickScore);
  });
});

// Test the content remix engine
describe("Content Remix Engine", () => {
  it("should return available formats including ASMR and Hopecore", async () => {
    const { getAvailableFormats } = await import("./contentRemixEngine");
    const formats = getAvailableFormats();
    expect(formats.length).toBe(7);
    const ids = formats.map(f => f.id);
    expect(ids).toContain("asmr_script");
    expect(ids).toContain("hopecore_reel");
    expect(ids).toContain("carousel");
    expect(ids).toContain("reel_script");
    expect(ids).toContain("linkedin");
    expect(ids).toContain("youtube_shorts");
    expect(ids).toContain("twitter_thread");
  });

  it("should have correct format structure", async () => {
    const { getAvailableFormats } = await import("./contentRemixEngine");
    const formats = getAvailableFormats();
    for (const format of formats) {
      expect(format).toHaveProperty("id");
      expect(format).toHaveProperty("label");
      expect(format).toHaveProperty("description");
      expect(format).toHaveProperty("platform");
    }
  });
});
