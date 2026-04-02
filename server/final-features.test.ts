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
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "partner-user",
    email: "partner@example.com",
    name: "Partner User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("postTracking", () => {
  it("getStatus throws NOT_FOUND for non-existent post", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(caller.postTracking.getStatus({ contentPostId: 99999 })).rejects.toThrow();
  });
});

describe("notifications", () => {
  it("test notification sends successfully", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.notifications.test();
    // Should return success (even if notification service is unavailable, it should not throw)
    expect(result).toHaveProperty("success");
  });
});

describe("adminUsers", () => {
  it("overview returns user list for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.adminUsers.overview();
    expect(Array.isArray(result)).toBe(true);
    // Each user should have stats
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("stats");
      expect(result[0].stats).toHaveProperty("totalPosts");
      expect(result[0].stats).toHaveProperty("approvedPosts");
      expect(result[0].stats).toHaveProperty("pendingPosts");
    }
  });

  it("overview throws for non-admin", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.adminUsers.overview()).rejects.toThrow();
  });
});

describe("inviteTokens", () => {
  it("list returns tokens for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.inviteTokens.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("create generates a valid token", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.inviteTokens.create({
      name: "Test Partner",
      partnerNumber: "TEST-001",
    });
    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("id");
    expect(typeof result.token).toBe("string");
    expect(result.token.length).toBeGreaterThan(10);
  });

  it("verify returns valid for a created token", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    // Create a token first
    const created = await caller.inviteTokens.create({
      name: "Verify Test",
      partnerNumber: "TEST-002",
    });
    // Verify it
    const result = await caller.inviteTokens.verify({ token: created.token });
    expect(result).toHaveProperty("valid");
    expect(result.valid).toBe(true);
  });

  it("verify returns invalid for non-existent token", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.inviteTokens.verify({ token: "nonexistent-token-xyz" });
    expect(result.valid).toBe(false);
  });

  it("create throws for non-admin", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.inviteTokens.create({
      name: "Hacker",
      partnerNumber: "HACK-001",
    })).rejects.toThrow();
  });
});

describe("teamActivity", () => {
  it("list returns activity items", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.teamActivity.list({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });
});
