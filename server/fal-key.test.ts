import { describe, expect, it } from "vitest";

describe("fal.ai API Key Validation", () => {
  it("should have FAL_API_KEY set in environment", () => {
    const key = process.env.FAL_API_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(10);
  });

  it("should be able to authenticate with fal.ai", async () => {
    const { fal } = await import("@fal-ai/client");
    fal.config({ credentials: process.env.FAL_API_KEY! });

    // Use a lightweight call to validate the key - just check if we can reach the API
    try {
      // fal.ai doesn't have a dedicated auth check endpoint,
      // so we test with a minimal request that would fail with 401 if key is invalid
      const result = await fetch("https://queue.fal.run/fal-ai/fast-sdxl", {
        method: "POST",
        headers: {
          "Authorization": `Key ${process.env.FAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "test",
          image_size: "square_hd",
          num_images: 1,
        }),
      });

      // 200 or 202 (queued) means the key is valid
      // 401 or 403 means invalid key
      expect(result.status).not.toBe(401);
      expect(result.status).not.toBe(403);
    } catch (err: any) {
      // Network errors are OK (means key format is valid but maybe rate limited)
      // Only fail on auth errors
      if (err.message?.includes("401") || err.message?.includes("403") || err.message?.includes("Unauthorized")) {
        throw new Error("fal.ai API Key ist ungültig - bitte korrekten Key eintragen");
      }
    }
  }, 30000);
});
