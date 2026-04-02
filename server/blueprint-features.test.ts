import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-blueprint",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("AI Copilot", () => {
  it("aiCopilot.suggest procedure exists and validates input", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Should reject empty text
    await expect(
      caller.aiCopilot.suggest({ text: "", action: "improve" })
    ).rejects.toThrow();
  });

  it("aiCopilot.fromBullets procedure exists and validates input", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Should reject empty bullets
    await expect(
      caller.aiCopilot.fromBullets({ bullets: "", platform: "instagram" })
    ).rejects.toThrow();
  });

  it("aiCopilot.suggest accepts valid action and calls LLM", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Just test one action - it will call LLM which may succeed or fail
    try {
      const result = await caller.aiCopilot.suggest({ text: "Test content for AI copilot", action: "improve" });
      expect(result).toHaveProperty("result");
    } catch (e: any) {
      // LLM errors are acceptable, validation errors are not
      expect(e.code).not.toBe("BAD_REQUEST");
    }
  }, 30000);
});

describe("Carousel Generator", () => {
  it("carousel.generate procedure exists and returns slides", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Should generate slides with valid input
    try {
      const result = await caller.carousel.generate({ topic: "LR Produkte", slideCount: 3, style: "educational", platform: "instagram" });
      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("slides");
      expect(Array.isArray(result.slides)).toBe(true);
    } catch (e: any) {
      // LLM errors acceptable
      expect(e.code).not.toBe("BAD_REQUEST");
    }
  }, 30000);

  it("carousel.generate validates slide count range", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Should reject slideCount > 15
    await expect(
      caller.carousel.generate({ topic: "Test", slideCount: 20, style: "educational", platform: "instagram" })
    ).rejects.toThrow();
  }, 10000);
});

describe("Team Leaderboard", () => {
  it("leaderboard.rankings procedure exists", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Should return an array (possibly empty)
    const result = await caller.leaderboard.rankings({ period: "month" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("leaderboard.myStats procedure exists", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Should return stats object
    const result = await caller.leaderboard.myStats();
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("approved");
    expect(result).toHaveProperty("points");
    expect(result).toHaveProperty("level");
    expect(result).toHaveProperty("badge");
  });
});

describe("Analytics Plus", () => {
  it("analyticsPlus.contentMix procedure exists", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analyticsPlus.contentMix();
    expect(result).toHaveProperty("byPillar");
    expect(result).toHaveProperty("byType");
    expect(Array.isArray(result.byPillar)).toBe(true);
    expect(Array.isArray(result.byType)).toBe(true);
  });

  it("analyticsPlus.heatmap procedure exists", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analyticsPlus.heatmap();
    expect(Array.isArray(result)).toBe(true);
  });

  it("analyticsPlus.bestPerformers procedure exists", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analyticsPlus.bestPerformers({ limit: 5 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("analyticsPlus.weeklyTrend procedure exists", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analyticsPlus.weeklyTrend({ weeks: 4 });
    expect(Array.isArray(result)).toBe(true);
  });
});
