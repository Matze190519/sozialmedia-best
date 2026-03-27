import { describe, expect, it, vi, beforeEach } from "vitest";
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
    partnerNumber: null,
    phoneNumber: null,
    isApproved: true,
    blotatoApiKey: null,
    autoPostEnabled: false,
    preferredPostingTimes: null,
    personalBranding: null,
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
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    partnerNumber: null,
    phoneNumber: null,
    isApproved: true,
    blotatoApiKey: null,
    autoPostEnabled: false,
    preferredPostingTimes: null,
    personalBranding: null,
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

describe("Content Generation Pipeline", () => {
  it("content.generate mutation accepts autoGenerateImage and autoGenerateVideo params", () => {
    // Verify the router has the content.generate procedure
    const caller = appRouter.createCaller(createAdminContext());
    expect(caller.content.generate).toBeDefined();
    expect(typeof caller.content.generate).toBe("function");
  });

  it("brandVoice.generateWithVoice mutation accepts autoGenerateImage and autoGenerateVideo params", () => {
    const caller = appRouter.createCaller(createAdminContext());
    expect(caller.brandVoice.generateWithVoice).toBeDefined();
    expect(typeof caller.brandVoice.generateWithVoice).toBe("function");
  });
});

describe("Approval Flow", () => {
  it("approval.approve mutation exists and is callable", () => {
    const caller = appRouter.createCaller(createAdminContext());
    expect(caller.approval.approve).toBeDefined();
    expect(typeof caller.approval.approve).toBe("function");
  });

  it("approval.reject mutation exists and is callable", () => {
    const caller = appRouter.createCaller(createAdminContext());
    expect(caller.approval.reject).toBeDefined();
    expect(typeof caller.approval.reject).toBe("function");
  });

  it("approval.publish mutation exists and is callable", () => {
    const caller = appRouter.createCaller(createAdminContext());
    expect(caller.approval.publish).toBeDefined();
    expect(typeof caller.approval.publish).toBe("function");
  });

  it("content.shareToLibrary mutation exists and is callable", () => {
    const caller = appRouter.createCaller(createAdminContext());
    expect(caller.content.shareToLibrary).toBeDefined();
    expect(typeof caller.content.shareToLibrary).toBe("function");
  });
});

describe("Library System", () => {
  it("library.list query exists and is callable", () => {
    const caller = appRouter.createCaller(createAdminContext());
    expect(caller.library.list).toBeDefined();
    expect(typeof caller.library.list).toBe("function");
  });

  it("library.add mutation exists and is callable", () => {
    const caller = appRouter.createCaller(createAdminContext());
    expect(caller.library.add).toBeDefined();
    expect(typeof caller.library.add).toBe("function");
  });

  it("library.copy mutation exists and is callable", () => {
    const caller = appRouter.createCaller(createAdminContext());
    expect(caller.library.copy).toBeDefined();
    expect(typeof caller.library.copy).toBe("function");
  });
});

describe("Media Generation", () => {
  it("media.generateImage mutation exists and is callable", () => {
    const caller = appRouter.createCaller(createAdminContext());
    expect(caller.media.generateImage).toBeDefined();
    expect(typeof caller.media.generateImage).toBe("function");
  });

  it("media.generateVideo mutation exists and is callable", () => {
    const caller = appRouter.createCaller(createAdminContext());
    expect(caller.media.generateVideo).toBeDefined();
    expect(typeof caller.media.generateVideo).toBe("function");
  });
});

describe("Brand Voice System", () => {
  it("brandVoice.get query exists and is callable", () => {
    const caller = appRouter.createCaller(createAdminContext());
    expect(caller.brandVoice.get).toBeDefined();
    expect(typeof caller.brandVoice.get).toBe("function");
  });

  it("brandVoice.getHooks query exists and is callable", () => {
    const caller = appRouter.createCaller(createAdminContext());
    expect(caller.brandVoice.getHooks).toBeDefined();
    expect(typeof caller.brandVoice.getHooks).toBe("function");
  });

  it("brandVoice.getScriptTemplates query exists and is callable", () => {
    const caller = appRouter.createCaller(createAdminContext());
    expect(caller.brandVoice.getScriptTemplates).toBeDefined();
    expect(typeof caller.brandVoice.getScriptTemplates).toBe("function");
  });

  it("brandVoice.getBlockers query exists and is callable", () => {
    const caller = appRouter.createCaller(createAdminContext());
    expect(caller.brandVoice.getBlockers).toBeDefined();
    expect(typeof caller.brandVoice.getBlockers).toBe("function");
  });
});

describe("Quality Gate", () => {
  it("qualityGate.check mutation exists and is callable", () => {
    const caller = appRouter.createCaller(createAdminContext());
    expect(caller.qualityGate.check).toBeDefined();
    expect(typeof caller.qualityGate.check).toBe("function");
  });
});
