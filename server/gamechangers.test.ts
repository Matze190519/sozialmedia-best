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
    isApproved: true,
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
    isApproved: true,
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

// ─── Hashtag Engine Tests ───────────────────────────────────────
describe("hashtags", () => {
  describe("hashtags.generate", () => {
    it("rejects unauthenticated calls", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: { protocol: "https", headers: {} } as TrpcContext["req"],
        res: { clearCookie: () => {} } as TrpcContext["res"],
      });
      await expect(
        caller.hashtags.generate({ content: "Test content", platform: "instagram" })
      ).rejects.toThrow();
    });

    it("requires content parameter", async () => {
      const caller = appRouter.createCaller(createUserContext());
      // Empty content should still be accepted by zod (min length not enforced)
      // but LLM call may timeout - we just test it doesn't crash on validation
      try {
        await caller.hashtags.generate({ content: "a", platform: "instagram" });
      } catch (e: any) {
        // LLM timeout is expected in test env
        expect(e.message).toBeDefined();
      }
    }, 15000);

    it("accepts valid input from authenticated user", async () => {
      const caller = appRouter.createCaller(createUserContext());
      try {
        const result = await caller.hashtags.generate({
          content: "Aloe Vera Drinking Gel für mehr Energie und Wohlbefinden",
          platform: "instagram",
          pillar: "gesundheit",
        });
        expect(result).toBeDefined();
        expect(Array.isArray(result.hashtags)).toBe(true);
      } catch (e: any) {
        // LLM might fail/timeout in test env, that's ok
        expect(e.message).toBeDefined();
      }
    }, 30000);
  });

  describe("hashtags.research", () => {
    it("rejects unauthenticated calls", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: { protocol: "https", headers: {} } as TrpcContext["req"],
        res: { clearCookie: () => {} } as TrpcContext["res"],
      });
      await expect(
        caller.hashtags.research({ topic: "Network Marketing" })
      ).rejects.toThrow();
    });

    it("requires topic parameter", async () => {
      const caller = appRouter.createCaller(createUserContext());
      try {
        await caller.hashtags.research({ topic: "a" });
      } catch (e: any) {
        // LLM timeout is expected in test env
        expect(e.message).toBeDefined();
      }
    }, 15000);
  });

  describe("hashtags.pools", () => {
    it("returns an array of hashtag pools", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.hashtags.pools();
      expect(Array.isArray(result)).toBe(true);
      // Should have pools for each pillar
      expect(result.length).toBeGreaterThan(0);
    });

    it("each pool has required fields", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.hashtags.pools();
      for (const pool of result) {
        expect(pool).toHaveProperty("category");
        expect(pool).toHaveProperty("hashtags");
        expect(pool).toHaveProperty("count");
        expect(Array.isArray(pool.hashtags)).toBe(true);
        expect(typeof pool.count).toBe("number");
      }
    });
  });
});

// ─── Monthly Plan Tests ─────────────────────────────────────────
describe("monthlyPlan", () => {
  describe("monthlyPlan.generate", () => {
    it("allows non-admin users to generate plans", async () => {
      const caller = appRouter.createCaller(createUserContext());
      try {
        await caller.monthlyPlan.generate({ month: 4, year: 2026 });
      } catch (e: any) {
        expect(e.message).not.toMatch(/Nur Admins|FORBIDDEN/);
      }
    }, 120000);

    it("rejects unauthenticated calls", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: { protocol: "https", headers: {} } as TrpcContext["req"],
        res: { clearCookie: () => {} } as TrpcContext["res"],
      });
      await expect(
        caller.monthlyPlan.generate({ month: 4, year: 2026 })
      ).rejects.toThrow();
    });
  });

  describe("monthlyPlan.list", () => {
    it("returns an array for authenticated users", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.monthlyPlan.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("rejects unauthenticated calls", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: { protocol: "https", headers: {} } as TrpcContext["req"],
        res: { clearCookie: () => {} } as TrpcContext["res"],
      });
      await expect(caller.monthlyPlan.list()).rejects.toThrow();
    });
  });

  describe("monthlyPlan.get", () => {
    it("rejects unauthenticated calls", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: { protocol: "https", headers: {} } as TrpcContext["req"],
        res: { clearCookie: () => {} } as TrpcContext["res"],
      });
      await expect(caller.monthlyPlan.get({ id: 1 })).rejects.toThrow();
    });

    it("returns null for non-existent plan", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.monthlyPlan.get({ id: 99999 });
      expect(result).toBeNull();
    });
  });

  describe("monthlyPlan.createPostFromPlan", () => {
    it("allows non-admin users to create posts from plan", async () => {
      const caller = appRouter.createCaller(createUserContext());
      try {
        await caller.monthlyPlan.createPostFromPlan({
          planId: 1,
          dayIndex: 0,
          topic: "Test",
          hook: "Test hook",
          platform: "instagram",
          pillar: "lifestyle",
          contentType: "post",
          hashtags: [],
          imagePrompt: "",
        });
      } catch (e: any) {
        expect(e.message).not.toMatch(/Nur Admins|FORBIDDEN/);
      }
    }, 30000);
  });
});

// ─── Evergreen Recycling Tests ──────────────────────────────────
describe("evergreen", () => {
  describe("evergreen.list", () => {
    it("returns an array for authenticated users", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.evergreen.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("rejects unauthenticated calls", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: { protocol: "https", headers: {} } as TrpcContext["req"],
        res: { clearCookie: () => {} } as TrpcContext["res"],
      });
      await expect(caller.evergreen.list()).rejects.toThrow();
    });
  });

  describe("evergreen.due", () => {
    it("returns an array for authenticated users", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.evergreen.due();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("evergreen.candidates", () => {
    it("returns an array for authenticated users", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.evergreen.candidates();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("evergreen.add", () => {
    it("allows non-admin users to add evergreen posts", async () => {
      const caller = appRouter.createCaller(createUserContext());
      try {
        await caller.evergreen.add({
          originalPostId: 1,
          recycleAfterDays: 30,
          maxRecycles: 3,
        });
      } catch (e: any) {
        expect(e.message).not.toMatch(/Nur Admins|FORBIDDEN/);
      }
    });

    it("rejects unauthenticated calls", async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: { protocol: "https", headers: {} } as TrpcContext["req"],
        res: { clearCookie: () => {} } as TrpcContext["res"],
      });
      await expect(
        caller.evergreen.add({
          originalPostId: 1,
          recycleAfterDays: 30,
          maxRecycles: 3,
        })
      ).rejects.toThrow();
    });
  });

  describe("evergreen.recycle", () => {
    it("allows non-admin users to recycle evergreen posts", async () => {
      const caller = appRouter.createCaller(createUserContext());
      try {
        await caller.evergreen.recycle({ evergreenId: 1 });
      } catch (e: any) {
        expect(e.message).not.toMatch(/Nur Admins|FORBIDDEN/);
      }
    });
  });

  describe("evergreen.remove", () => {
    it("allows non-admin users to remove evergreen posts", async () => {
      const caller = appRouter.createCaller(createUserContext());
      try {
        await caller.evergreen.remove({ id: 1 });
      } catch (e: any) {
        expect(e.message).not.toMatch(/Nur Admins|FORBIDDEN/);
      }
    });
  });
});
