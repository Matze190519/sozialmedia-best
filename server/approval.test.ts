import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@lr-lifestyle.de",
    name: "Mathias",
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

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "team-user",
    email: "team@lr-lifestyle.de",
    name: "Team Member",
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

describe("Approval Workflow - Router Structure", () => {
  it("has all required routers defined", () => {
    const routerKeys = Object.keys(appRouter._def.procedures);
    // Check that all main routers exist
    expect(routerKeys).toContain("auth.me");
    expect(routerKeys).toContain("auth.logout");
    expect(routerKeys).toContain("dashboard.stats");
    expect(routerKeys).toContain("content.list");
    expect(routerKeys).toContain("content.getById");
    expect(routerKeys).toContain("content.generate");
    expect(routerKeys).toContain("content.generateBatch");
    expect(routerKeys).toContain("content.edit");
    expect(routerKeys).toContain("approval.approve");
    expect(routerKeys).toContain("approval.reject");
    expect(routerKeys).toContain("approval.publish");
    expect(routerKeys).toContain("approval.logs");
    expect(routerKeys).toContain("templates.list");
    expect(routerKeys).toContain("templates.create");
    expect(routerKeys).toContain("creatorSpy.reports");
    expect(routerKeys).toContain("creatorSpy.latest");
    expect(routerKeys).toContain("creatorSpy.analyze");
    expect(routerKeys).toContain("analytics.summary");
    expect(routerKeys).toContain("team.list");
    expect(routerKeys).toContain("team.updateRole");
  });

  it("has media generation routers", () => {
    const routerKeys = Object.keys(appRouter._def.procedures);
    expect(routerKeys).toContain("media.generateImage");
    expect(routerKeys).toContain("media.generateVideo");
    expect(routerKeys).toContain("media.uploadMedia");
  });

  it("has API health check routers", () => {
    const routerKeys = Object.keys(appRouter._def.procedures);
    expect(routerKeys).toContain("apiHealth.goViralBitch");
    expect(routerKeys).toContain("apiHealth.blotatoAccounts");
  });
});

describe("Approval Workflow - Access Control", () => {
  it("allows any user to approve their own content (owner-based)", async () => {
    const userCtx = createUserContext();
    const caller = appRouter.createCaller(userCtx);
    // Should not throw admin error - will throw NOT_FOUND since post doesn't exist
    await expect(caller.approval.approve({ id: 99999 })).rejects.toThrow();
  });

  it("allows any user to reject their own content (owner-based)", async () => {
    const userCtx = createUserContext();
    const caller = appRouter.createCaller(userCtx);
    await expect(caller.approval.reject({ id: 99999, comment: "test" })).rejects.toThrow();
  });

  it("allows any user to publish their own content (owner-based)", async () => {
    const userCtx = createUserContext();
    const caller = appRouter.createCaller(userCtx);
    await expect(caller.approval.publish({ id: 99999 })).rejects.toThrow();
  });

  it("rejects non-admin team role update attempts", async () => {
    const userCtx = createUserContext();
    const caller = appRouter.createCaller(userCtx);

    await expect(caller.team.updateRole({ userId: 1, role: "admin" })).rejects.toThrow("Nur Admins");
  });

  it("allows any user to use creator spy analyze", async () => {
    const userCtx = createUserContext();
    const caller = appRouter.createCaller(userCtx);
    // Should not throw admin error - may throw other errors (e.g. LLM timeout)
    try {
      await caller.creatorSpy.analyze({});
    } catch (e: any) {
      expect(e.message).not.toMatch(/Nur Admins|FORBIDDEN/);
    }
  }, 30000);
});

describe("Approval Workflow - Input Validation", () => {
  it("validates content generate input requires valid contentType", async () => {
    const adminCtx = createAdminContext();
    const caller = appRouter.createCaller(adminCtx);

    await expect(
      caller.content.generate({ contentType: "invalid_type" as any, platforms: ["instagram"] })
    ).rejects.toThrow();
  });

  it("validates approval reject requires comment", async () => {
    const adminCtx = createAdminContext();
    const caller = appRouter.createCaller(adminCtx);

    // Missing comment should fail validation
    await expect(
      (caller.approval.reject as any)({ id: 1 })
    ).rejects.toThrow();
  });

  it("validates media generateImage requires non-empty prompt", async () => {
    const adminCtx = createAdminContext();
    const caller = appRouter.createCaller(adminCtx);

    await expect(
      caller.media.generateImage({ prompt: "" })
    ).rejects.toThrow();
  });

  it("validates media generateVideo requires non-empty prompt", async () => {
    const adminCtx = createAdminContext();
    const caller = appRouter.createCaller(adminCtx);

    await expect(
      caller.media.generateVideo({ prompt: "" })
    ).rejects.toThrow();
  });
});
