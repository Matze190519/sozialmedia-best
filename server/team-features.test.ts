import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock image generation to prevent timeouts
vi.mock("./_core/imageGeneration", () => ({
  generateImage: vi.fn().mockResolvedValue({ url: "https://example.com/test-image.png" }),
}));
vi.mock("./productImageMatcher", () => ({
  getImageForContent: vi.fn().mockResolvedValue({ type: "ai", imageUrl: null, productName: null }),
}));
vi.mock("./externalApis", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    generatePremiumImage: vi.fn().mockResolvedValue({ imageUrl: "https://example.com/test.jpg" }),
    generateVideoWithFal: vi.fn().mockResolvedValue({ videoUrl: "https://example.com/test.mp4" }),
  };
});

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@lr.com",
      name: "Mathias",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
    isApproved: true,
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "team-user",
      email: "team@lr.com",
      name: "Team Member",
      loginMethod: "manus",
      role: "user",
    isApproved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("Library Router", () => {
  it("list returns an array", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.library.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("add requires authentication", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
    });
    await expect(caller.library.add({
      title: "Test",
      category: "text",
      textContent: "Test content",
    })).rejects.toThrow();
  });
});

describe("User Settings Router", () => {
  it("get returns user settings", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.userSettings.get();
    expect(result).toBeDefined();
    expect(typeof result.hasBlotatoKey).toBe("boolean");
  });

  it("toggleAutoPost works", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.userSettings.toggleAutoPost({ enabled: true });
    expect(result.success).toBe(true);
  });

  it("savePersonalBranding works", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.userSettings.savePersonalBranding({
      signature: "Dein Mathias",
      hashtags: ["#LRLifestyle", "#NetworkMarketing"],
      ownIntro: "Ich bin Mathias...",
      customCTA: "Schreib mir eine DM!",
    });
    expect(result.success).toBe(true);
  });

  it("savePostingTimes works", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.userSettings.savePostingTimes({
      times: { instagram: "09:00", tiktok: "18:00" },
    });
    expect(result.success).toBe(true);
  });
});

describe("A/B Test Router", () => {
  it("list returns an array", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.abTest.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("create requires valid data", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    // Should work with valid data (creates posts in DB)
    // We just verify the procedure exists and accepts input
    const result = await caller.abTest.create({
      name: "Hook Test",
      platform: "instagram",
      variantAContent: "Test A content",
      variantBContent: "Test B content",
    });
    expect(result).toBeDefined();
  });
});

describe("Feedback Router", () => {
  it("topPerforming returns an array", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.feedback.topPerforming({ limit: 5 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Posting Times Router", () => {
  it("get returns an array", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.postingTimes.get({});
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Lina API Router", () => {
  it("getApproved returns an array", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.lina.getApprovedContent({ limit: 5 });
    expect(Array.isArray(result)).toBe(true);
  });
});
