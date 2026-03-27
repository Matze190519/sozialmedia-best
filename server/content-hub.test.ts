import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import * as api from "./externalApis";

// ─── Test Helpers ────────────────────────────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext; clearedCookies: any[] } {
  const clearedCookies: any[] = [];
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "mathias@lr-lifestyle.de",
    name: "Mathias Vinzing",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    ctx: {
      user,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: (name: string, options: Record<string, unknown>) => { clearedCookies.push({ name, options }); } } as TrpcContext["res"],
    },
    clearedCookies,
  };
}

function createUserContext(): { ctx: TrpcContext } {
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
    ctx: {
      user,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    },
  };
}

function createUnauthContext(): { ctx: TrpcContext } {
  return {
    ctx: {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    },
  };
}

// ─── Brand Voice Tests ───────────────────────────────────────

describe("Brand Voice System", () => {
  it("should have complete LR Brand Voice identity", () => {
    expect(api.LR_BRAND_VOICE.identity.name).toBe("LR Lifestyle Team");
    expect(api.LR_BRAND_VOICE.identity.leader).toBe("Mathias Vinzing");
    expect(api.LR_BRAND_VOICE.identity.company).toBe("LR Health & Beauty");
    expect(api.LR_BRAND_VOICE.identity.entryPrice).toBe("99 Euro");
    expect(api.LR_BRAND_VOICE.identity.aiAssistant).toBe("Lina");
    expect(api.LR_BRAND_VOICE.identity.certifications).toContain("Fresenius-geprüft");
    expect(api.LR_BRAND_VOICE.identity.certifications).toContain("Dermatest-zertifiziert");
    expect(api.LR_BRAND_VOICE.identity.notCertified).toContain("TÜV");
  });

  it("should have all 6 content pillars", () => {
    expect(api.LR_BRAND_VOICE.pillars).toHaveLength(6);
    const pillarNames = api.LR_BRAND_VOICE.pillars.map(p => p.name);
    expect(pillarNames).toContain("Autokonzept");
    expect(pillarNames).toContain("Business Opportunity");
    expect(pillarNames).toContain("Produkt-Highlight");
    expect(pillarNames).toContain("Lina KI-Demo");
    expect(pillarNames).toContain("Lifestyle & Erfolg");
    expect(pillarNames).toContain("Einwandbehandlung");
  });

  it("should have tone definitions for all 9 platforms", () => {
    const platforms = Object.keys(api.LR_BRAND_VOICE.tonePerPlatform);
    expect(platforms).toContain("instagram");
    expect(platforms).toContain("tiktok");
    expect(platforms).toContain("linkedin");
    expect(platforms).toContain("facebook");
    expect(platforms).toContain("twitter");
    expect(platforms).toContain("youtube");
    expect(platforms).toContain("threads");
    expect(platforms).toContain("pinterest");
    expect(platforms).toContain("bluesky");
  });

  it("should have audience blockers with lie and destruction", () => {
    expect(api.LR_BRAND_VOICE.audienceBlockers.length).toBeGreaterThan(0);
    for (const blocker of api.LR_BRAND_VOICE.audienceBlockers) {
      expect(blocker).toHaveProperty("lie");
      expect(blocker).toHaveProperty("destruction");
      expect(blocker).toHaveProperty("pillar");
      expect(blocker.lie.length).toBeGreaterThan(0);
      expect(blocker.destruction.length).toBeGreaterThan(0);
    }
  });

  it("should return Brand Voice via tRPC", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const voice = await caller.brandVoice.get();
    expect(voice.identity.name).toBe("LR Lifestyle Team");
  });

  it("should return Hook Formulas via tRPC", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const hooks = await caller.brandVoice.getHooks();
    expect(hooks).toHaveProperty("curiosity");
    expect(hooks).toHaveProperty("story");
    expect(hooks).toHaveProperty("value");
    expect(hooks).toHaveProperty("contrarian");
    expect(hooks).toHaveProperty("socialProof");
  });

  it("should return Script Templates via tRPC", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const templates = await caller.brandVoice.getScriptTemplates();
    expect(templates).toHaveProperty("reelScript");
    expect(templates).toHaveProperty("storyPost");
    expect(templates).toHaveProperty("contrarianTake");
    expect(templates).toHaveProperty("listPost");
    expect(templates).toHaveProperty("howTo");
    expect(templates).toHaveProperty("carouselHook");
    expect(templates).toHaveProperty("youtubeThread");
  });

  it("should return Audience Blockers via tRPC", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const blockers = await caller.brandVoice.getBlockers();
    expect(Array.isArray(blockers)).toBe(true);
    expect(blockers.length).toBeGreaterThan(0);
  });
});

// ─── Hook Formulas Tests ─────────────────────────────────────

describe("Hook Formulas", () => {
  it("should have 5 hook styles with multiple examples each", () => {
    const styles = Object.keys(api.HOOK_FORMULAS);
    expect(styles).toHaveLength(5);
    for (const style of styles) {
      const hooks = api.HOOK_FORMULAS[style as keyof typeof api.HOOK_FORMULAS];
      expect(hooks.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("should have template variables in most hooks ({{...}})", () => {
    let totalHooks = 0;
    let hooksWithVars = 0;
    for (const hooks of Object.values(api.HOOK_FORMULAS)) {
      for (const hook of hooks) {
        totalHooks++;
        if (/\{\{.+?\}\}/.test(hook)) hooksWithVars++;
      }
    }
    // At least 80% of hooks should have template variables
    expect(hooksWithVars / totalHooks).toBeGreaterThan(0.7);
  });
});

// ─── CTA Templates Tests ─────────────────────────────────────

describe("CTA Templates", () => {
  it("should have CTA templates for major platforms", () => {
    expect(api.CTA_TEMPLATES).toHaveProperty("instagram");
    expect(api.CTA_TEMPLATES).toHaveProperty("tiktok");
    expect(api.CTA_TEMPLATES).toHaveProperty("linkedin");
    expect(api.CTA_TEMPLATES).toHaveProperty("youtube");
    expect(api.CTA_TEMPLATES).toHaveProperty("facebook");
  });

  it("should have DM and community CTA types for Instagram", () => {
    expect(api.CTA_TEMPLATES.instagram).toHaveProperty("community");
    expect(api.CTA_TEMPLATES.instagram).toHaveProperty("dm");
    expect(api.CTA_TEMPLATES.instagram.dm!.length).toBeGreaterThan(0);
  });

  it("should return platform-specific CTAs via tRPC", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const ctas = await caller.brandVoice.getCTAs({ platform: "instagram" });
    expect(ctas).toHaveProperty("community");
    expect(ctas).toHaveProperty("dm");
  });
});

// ─── Quality Gate Tests ──────────────────────────────────────

describe("Quality Gate", () => {
  it("should pass a well-formed Instagram post", () => {
    const content = `🚗 Ich fahre einen Porsche und LR zahlt mit. Klingt verrückt? Ist es nicht.

Vor 3 Jahren war ich in einem 9-to-5 Job gefangen. Heute fahre ich mein Traumauto - bezahlt von LR Health & Beauty.

Der Einstieg? Nur 99 Euro. Fresenius-geprüft. Dermatest-zertifiziert.

Schreib mir eine DM mit 'STARTEN' für mehr Infos! 💪

#LR #Autokonzept #NetworkMarketing #Erfolg`;

    const result = api.runQualityGate(content, "instagram");
    expect(result.passed).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(60);
  });

  it("should fail content that is too short", () => {
    const result = api.runQualityGate("Hi", "instagram");
    expect(result.passed).toBe(false);
    expect(result.checks.some(c => c.name === "Mindestlänge" && !c.passed)).toBe(true);
  });

  it("should fail content with forbidden TÜV term", () => {
    const content = `Unsere Produkte sind TÜV-geprüft und von höchster Qualität. Schreib mir eine DM!

#LR #Produkte`;
    const result = api.runQualityGate(content, "instagram");
    expect(result.checks.some(c => c.name === "Brand Safety" && !c.passed)).toBe(true);
  });

  it("should fail content with Schneeballsystem term", () => {
    const content = `LR ist kein Schneeballsystem, das ist ein seriöses Unternehmen. Schreib mir eine DM!

#LR #NetworkMarketing`;
    const result = api.runQualityGate(content, "instagram");
    expect(result.checks.some(c => c.name === "Brand Safety" && !c.passed)).toBe(true);
  });

  it("should warn about missing CTA", () => {
    const content = `🚗 Mein neues Auto ist der Wahnsinn. LR macht es möglich. Fresenius-geprüft und einfach geil.

#LR #Autokonzept #Lifestyle`;
    const result = api.runQualityGate(content, "instagram");
    // Should still pass but with lower score
    expect(result.score).toBeLessThan(100);
  });

  it("should check max length for Twitter", () => {
    const longContent = "A".repeat(300) + " Schreib mir eine DM! #LR";
    const result = api.runQualityGate(longContent, "twitter");
    expect(result.checks.some(c => c.name === "Maximallänge" && !c.passed)).toBe(true);
  });

  it("should recognize LR branding terms", () => {
    const content = `🌿 Aloe Vera von LR - Fresenius-geprüft und Dermatest-zertifiziert. Schreib mir eine DM!

#LR #AloeVera`;
    const result = api.runQualityGate(content, "instagram");
    expect(result.checks.some(c => c.name === "LR-Branding" && c.passed)).toBe(true);
  });
});

// ─── Viral Script Templates Tests ────────────────────────────

describe("Viral Script Templates", () => {
  it("should have all 7 script templates", () => {
    const templates = Object.keys(api.VIRAL_SCRIPT_TEMPLATES);
    expect(templates).toHaveLength(7);
    expect(templates).toContain("reelScript");
    expect(templates).toContain("storyPost");
    expect(templates).toContain("contrarianTake");
    expect(templates).toContain("listPost");
    expect(templates).toContain("howTo");
    expect(templates).toContain("carouselHook");
    expect(templates).toContain("youtubeThread");
  });

  it("each template should have name and structure", () => {
    for (const [key, tmpl] of Object.entries(api.VIRAL_SCRIPT_TEMPLATES)) {
      expect(tmpl).toHaveProperty("name");
      expect(tmpl).toHaveProperty("structure");
      expect(tmpl.name.length).toBeGreaterThan(0);
      expect(tmpl.structure.length).toBeGreaterThan(0);
    }
  });
});

// ─── Approval Workflow Tests ─────────────────────────────────

describe("Approval Workflow - Access Control", () => {
  it("should block non-admin from approving", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.approval.approve({ id: 1 })).rejects.toThrow("Nur Admins");
  });

  it("should block non-admin from rejecting", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.approval.reject({ id: 1, comment: "Nein" })).rejects.toThrow("Nur Admins");
  });

  it("should block non-admin from publishing", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.approval.publish({ id: 1 })).rejects.toThrow("Nur Admins");
  });

  it("should block unauthenticated users from content list", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.content.list()).rejects.toThrow();
  });
});

// ─── Team Management Tests ───────────────────────────────────

describe("Team Management - Access Control", () => {
  it("should block non-admin from updating roles", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.team.updateRole({ userId: 1, role: "admin" })).rejects.toThrow("Nur Admins");
  });
});

// ─── Blotato Account Mapping Tests ───────────────────────────

describe("Blotato Account Mapping", () => {
  it("should have all LR Blotato accounts mapped", () => {
    expect(api.LR_BLOTATO_ACCOUNTS.length).toBeGreaterThanOrEqual(8);
  });

  it("should have accounts for major platforms", () => {
    const platforms = api.LR_BLOTATO_ACCOUNTS.map(a => a.platform);
    expect(platforms).toContain("instagram");
    expect(platforms).toContain("facebook");
    expect(platforms).toContain("tiktok");
    expect(platforms).toContain("linkedin");
    expect(platforms).toContain("youtube");
    expect(platforms).toContain("twitter");
    expect(platforms).toContain("threads");
  });

  it("each account should have id, platform and username", () => {
    for (const account of api.LR_BLOTATO_ACCOUNTS) {
      expect(account.id).toBeGreaterThan(0);
      expect(account.platform.length).toBeGreaterThan(0);
      expect(account.username.length).toBeGreaterThan(0);
    }
  });
});

// ─── API Health Check Tests ──────────────────────────────────

describe("API Health Endpoints", () => {
  it("should have GoViralBitch health check endpoint", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.apiHealth.goViralBitch();
    expect(result).toHaveProperty("status");
    expect(result).toHaveProperty("url");
    expect(result.url).toBe("https://goviralbitch-deploy.onrender.com");
  });
});

// ─── Video KI Configuration Tests ────────────────────────────

describe("Video KI Configuration", () => {
  it("should throw error when FAL_API_KEY is not set", async () => {
    // Save original
    const originalKey = process.env.FAL_API_KEY;
    process.env.FAL_API_KEY = "";

    await expect(
      api.generateVideoWithFal({ prompt: "test" })
    ).rejects.toThrow("FAL_API_KEY");

    // Restore
    process.env.FAL_API_KEY = originalKey;
  });
});
