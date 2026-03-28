import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUnapprovedContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 99,
    openId: "unapproved-user",
    email: "new@partner.de",
    name: "Neuer Partner",
    loginMethod: "manus",
    role: "user",
    isApproved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    partnerNumber: null,
    phoneNumber: null,
    blotatoApiKey: null,
    autoPostEnabled: false,
    preferredPostingTimes: null,
    personalSignature: null,
    personalHashtags: null,
    personalIntro: null,
    personalCTA: null,
  };
  return { req: {} as any, res: {} as any, user };
}

function createApprovedContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 100,
    openId: "approved-user",
    email: "approved@partner.de",
    name: "Freigeschalteter Partner",
    loginMethod: "manus",
    role: "user",
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    partnerNumber: "12345",
    phoneNumber: null,
    blotatoApiKey: null,
    autoPostEnabled: false,
    preferredPostingTimes: null,
    personalSignature: null,
    personalHashtags: null,
    personalIntro: null,
    personalCTA: null,
  };
  return { req: {} as any, res: {} as any, user };
}

describe("Access Gate - isApproved", () => {
  it("blocks non-approved users from dashboard.stats", async () => {
    const caller = appRouter.createCaller(createUnapprovedContext());
    await expect(caller.dashboard.stats()).rejects.toThrow(/freigeschaltet|10003/);
  });

  it("blocks non-approved users from content.generate", async () => {
    const caller = appRouter.createCaller(createUnapprovedContext());
    await expect(
      caller.content.generate({
        type: "post",
        platform: "instagram",
        topic: "test",
        pillar: "business",
      })
    ).rejects.toThrow(/freigeschaltet|10003/);
  });

  it("blocks non-approved users from trends.latest", async () => {
    const caller = appRouter.createCaller(createUnapprovedContext());
    await expect(caller.trends.latest()).rejects.toThrow(/freigeschaltet|10003/);
  });

  it("allows approved users to access dashboard.stats", async () => {
    const caller = appRouter.createCaller(createApprovedContext());
    // Should not throw FORBIDDEN - may throw other errors (no data) which is fine
    try {
      await caller.dashboard.stats();
    } catch (e: any) {
      expect(e.message).not.toMatch(/freigeschaltet|10003/);
    }
  });

  it("blocks non-approved users from team management", async () => {
    const caller = appRouter.createCaller(createUnapprovedContext());
    await expect(caller.team.list()).rejects.toThrow(/freigeschaltet|10003|FORBIDDEN/);
  });
});
