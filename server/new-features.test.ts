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
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createUserContext(approved = true): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "test-user",
    email: "user@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("inviteTokens", () => {
  it("admin can create an invite token", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.inviteTokens.create({
      name: "Test Partner",
      partnerNumber: "LR-99999",
      expiresInDays: 7,
    });

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("expiresAt");
    expect(typeof result.token).toBe("string");
    expect(result.token.length).toBeGreaterThan(10);
  });

  it("admin can list invite tokens", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const tokens = await caller.inviteTokens.list();
    expect(Array.isArray(tokens)).toBe(true);
  });

  it("public can verify a token", async () => {
    const adminCaller = appRouter.createCaller(createAdminContext());
    const created = await adminCaller.inviteTokens.create({
      name: "Verify Test",
      expiresInDays: 7,
    });

    // Verify with public context (no user)
    const publicCtx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
    };
    const publicCaller = appRouter.createCaller(publicCtx);
    const verification = await publicCaller.inviteTokens.verify({ token: created.token });

    expect(verification.valid).toBe(true);
    expect(verification.name).toBe("Verify Test");
  });

  it("returns invalid for non-existent token", async () => {
    const publicCtx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
    };
    const publicCaller = appRouter.createCaller(publicCtx);
    const result = await publicCaller.inviteTokens.verify({ token: "non-existent-token-12345" });
    expect(result.valid).toBe(false);
  });

  it("non-admin cannot create tokens", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.inviteTokens.create({ name: "Should Fail", expiresInDays: 7 })
    ).rejects.toThrow();
  });
});

describe("teamActivity", () => {
  it("can list team activities", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const activities = await caller.teamActivity.list({ limit: 10 });
    expect(Array.isArray(activities)).toBe(true);
  });

  it("can get activities by user", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const activities = await caller.teamActivity.byUser({ userId: 1, limit: 5 });
    expect(Array.isArray(activities)).toBe(true);
  });
});

describe("directPost", () => {
  it("throws NOT_FOUND for non-existent post", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.directPost.getForCopy({ contentPostId: 999999 })
    ).rejects.toThrow();
  });

  it("markPublished throws NOT_FOUND for non-existent post", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.directPost.markPublished({ contentPostId: 999999, platform: "instagram" })
    ).rejects.toThrow();
  });
});

describe("multiPublish", () => {
  it("throws NOT_FOUND for non-existent post", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.multiPublish.preview({ contentPostId: 999999 })
    ).rejects.toThrow();
  });

  it("publishSelected rejects unapproved posts", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.multiPublish.publishSelected({
        contentPostId: 999999,
        platforms: ["instagram"],
      })
    ).rejects.toThrow();
  });
});
