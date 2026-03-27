import { describe, expect, it } from "vitest";

describe("GoViralBitch API", () => {
  it("health endpoint responds with ok", async () => {
    const url = process.env.GOVIRALBITCH_API_URL || "https://goviralbitch-deploy.onrender.com";
    const res = await fetch(`${url}/api/health`);
    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(data.engine).toBe("goviralbitch");
  });
});

describe("Blotato API Key", () => {
  it("API key is set and non-empty", () => {
    const key = process.env.BLOTATO_API_KEY || "";
    expect(key.length).toBeGreaterThan(0);
    expect(key.startsWith("blt_")).toBe(true);
  });
});
