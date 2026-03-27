import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "normal-user",
    email: "user@example.com",
    name: "Normal User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("trends", () => {
  describe("trends.pillars", () => {
    it("returns all content pillars", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.trends.pillars();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("each pillar has required fields", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.trends.pillars();
      for (const pillar of result) {
        expect(pillar).toHaveProperty("key");
        expect(pillar).toHaveProperty("name");
        expect(pillar).toHaveProperty("emoji");
        expect(pillar).toHaveProperty("frequency");
        expect(typeof pillar.key).toBe("string");
        expect(typeof pillar.name).toBe("string");
        expect(typeof pillar.emoji).toBe("string");
      }
    });

    it("includes known pillars (auto, business, health, lifestyle, lina)", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.trends.pillars();
      const keys = result.map((p: any) => p.key);
      expect(keys).toContain("autokonzept");
      expect(keys).toContain("business");
      expect(keys).toContain("gesundheit");
      expect(keys).toContain("lifestyle");
      expect(keys).toContain("lina_ki");
    });
  });

  describe("trends.top", () => {
    it("returns an array of top trends", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.trends.top({ hours: 48, limit: 10 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("respects limit parameter", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.trends.top({ hours: 48, limit: 5 });
      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe("trends.latest", () => {
    it("returns an array of latest trends", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.trends.latest({ limit: 10 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("supports platform filter", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.trends.latest({ platform: "tiktok", limit: 10 });
      expect(Array.isArray(result)).toBe(true);
      for (const trend of result) {
        expect(trend.platform).toBe("tiktok");
      }
    });

    it("supports pillar filter", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.trends.latest({ pillar: "business", limit: 10 });
      expect(Array.isArray(result)).toBe(true);
      for (const trend of result) {
        expect(trend.pillar).toBe("business");
      }
    });
  });

  describe("trends.scan (admin only)", () => {
    it("rejects non-admin users", async () => {
      const caller = appRouter.createCaller(createUserContext());
      await expect(caller.trends.scan()).rejects.toThrow();
    });
  });

  describe("trends.scanPillar (admin only)", () => {
    it("rejects non-admin users", async () => {
      const caller = appRouter.createCaller(createUserContext());
      await expect(caller.trends.scanPillar({ pillar: "business" })).rejects.toThrow();
    });
  });

  describe("trends.autopilot (admin only)", () => {
    it("rejects non-admin users", async () => {
      const caller = appRouter.createCaller(createUserContext());
      await expect(
        caller.trends.autopilot({
          trendId: 1,
          trendTitle: "Test Trend",
          trendPlatform: "tiktok",
          trendPillar: "business",
        })
      ).rejects.toThrow();
    });
  });

  describe("trends.generateIdeas (admin only)", () => {
    it("rejects non-admin users", async () => {
      const caller = appRouter.createCaller(createUserContext());
      await expect(caller.trends.generateIdeas()).rejects.toThrow();
    });
  });
});
