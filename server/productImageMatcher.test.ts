import { describe, it, expect, vi, beforeEach } from "vitest";
import { detectProductInTopic } from "./productImageMatcher";

// Mock db module
vi.mock("./db", () => ({
  getLRProducts: vi.fn().mockResolvedValue([]),
}));

describe("ProductImageMatcher", () => {
  describe("detectProductInTopic", () => {
    it("should detect Aloe Vera in topic", () => {
      expect(detectProductInTopic("Aloe Vera Drinking Gel")).toBe("aloe vera");
    });

    it("should detect Mind Master in topic", () => {
      expect(detectProductInTopic("Mind Master Brain Supplement")).toBe("mind master");
    });

    it("should detect Zeitgard in topic", () => {
      expect(detectProductInTopic("ZEITGARD Anti-Age Pflege")).toBe("zeitgard");
    });

    it("should detect Colostrum in topic", () => {
      expect(detectProductInTopic("LR Colostrum Kapseln")).toBe("colostrum");
    });

    it("should detect Parfum in topic", () => {
      expect(detectProductInTopic("Neues Parfum von Guido Maria")).toBe("parfum");
    });

    it("should detect Drinking Gel in topic", () => {
      expect(detectProductInTopic("Aloe Vera Drinking Gel Honig")).toBe("aloe vera");
    });

    it("should return null for lifestyle topics", () => {
      expect(detectProductInTopic("Freiheit und Erfolg im Business")).toBeNull();
    });

    it("should return null for motivation topics", () => {
      expect(detectProductInTopic("Warum du heute anfangen solltest")).toBeNull();
    });

    it("should return null for empty topic", () => {
      expect(detectProductInTopic("")).toBeNull();
    });

    it("should be case insensitive", () => {
      expect(detectProductInTopic("ALOE VERA TRINKGEL")).toBe("aloe vera");
    });

    it("should detect Protein Power", () => {
      expect(detectProductInTopic("Protein Power Shake")).toBe("protein power");
    });

    it("should detect Starter Set", () => {
      expect(detectProductInTopic("Das neue Starterpaket")).toBe("starterpaket");
    });

    it("should detect Nahrungsergänzung", () => {
      expect(detectProductInTopic("Nahrungsergänzung für jeden Tag")).toBe("nahrungsergänzung");
    });
  });
});
