import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMock = vi.hoisted(() => ({
  createContentPost: vi.fn(),
  createApprovalLog: vi.fn(),
  updateContentPost: vi.fn(),
  updateContentPostStatus: vi.fn(),
  getContentPostById: vi.fn(),
  addToContentLibrary: vi.fn(),
  getUserById: vi.fn(),
  setBlotatoPostIds: vi.fn(),
  incrementLibraryCopyCount: vi.fn(),
  deleteFromContentLibrary: vi.fn(),
  getContentPosts: vi.fn(),
  getContentLibrary: vi.fn(),
}));

const apiMock = vi.hoisted(() => ({
  generatePost: vi.fn(),
  getBlotatoAccounts: vi.fn(),
  publishToAllPlatforms: vi.fn(),
  LR_BLOTATO_ACCOUNTS: [
    { id: 101, platform: "instagram", username: "lr.team", displayName: "LR Team" },
  ],
}));

const brevoMock = vi.hoisted(() => ({
  sendBrevoNotification: vi.fn(),
}));

const llmMock = vi.hoisted(() => ({
  invokeLLM: vi.fn(),
}));

vi.mock("./db", () => dbMock);
vi.mock("./externalApis", () => apiMock);
vi.mock("./brevoNotify", () => brevoMock);
vi.mock("./_core/llm", () => llmMock);

import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 7,
    openId: "team-user",
    email: "team@lr-lifestyle.de",
    name: "Team Member",
    loginMethod: "manus",
    role: "user",
    partnerNumber: null,
    phoneNumber: null,
    isApproved: true,
    blotatoApiKey: null,
    autoPostEnabled: false,
    preferredPostingTimes: null,
    personalBranding: null,
    personalSignature: null,
    personalHashtags: null,
    personalIntro: null,
    personalCTA: null,
    createdAt: new Date("2026-04-17T09:00:00Z"),
    updatedAt: new Date("2026-04-17T09:00:00Z"),
    lastSignedIn: new Date("2026-04-17T09:00:00Z"),
    ...overrides,
  };
}

function createContext(userOverrides: Partial<AuthenticatedUser> = {}): TrpcContext {
  return {
    user: createUser(userOverrides),
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function makePost(overrides: Record<string, unknown> = {}) {
  return {
    post: {
      id: 42,
      createdById: 7,
      contentType: "post",
      content: "Originaler Content",
      editedContent: null,
      platforms: ["instagram"],
      status: "pending",
      topic: "Aloe Vera",
      pillar: "produkt",
      mediaUrl: null,
      videoUrl: null,
      ...overrides,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();

  dbMock.createContentPost.mockResolvedValue(501);
  dbMock.createApprovalLog.mockResolvedValue(undefined);
  dbMock.updateContentPost.mockResolvedValue(undefined);
  dbMock.updateContentPostStatus.mockResolvedValue(undefined);
  dbMock.addToContentLibrary.mockResolvedValue(801);
  dbMock.getUserById.mockResolvedValue({ id: 7, name: "Team Member", blotatoApiKey: "user-key" });
  dbMock.setBlotatoPostIds.mockResolvedValue(undefined);
  dbMock.incrementLibraryCopyCount.mockResolvedValue(undefined);
  dbMock.deleteFromContentLibrary.mockResolvedValue(undefined);
  dbMock.getContentPosts.mockResolvedValue([]);
  dbMock.getContentLibrary.mockResolvedValue([]);

  apiMock.generatePost.mockResolvedValue({
    content: "Generierter Beitrag",
    metadata: { model: "test-model" },
  });
  apiMock.getBlotatoAccounts.mockResolvedValue([
    { id: 1, platform: "instagram", username: "lr.team", displayName: "LR Team" },
  ]);
  apiMock.publishToAllPlatforms.mockResolvedValue(["schedule-1"]);

  brevoMock.sendBrevoNotification.mockResolvedValue(true);
  llmMock.invokeLLM.mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            totalScore: 88,
            hookScore: 17,
            emotionScore: 16,
            shareabilityScore: 12,
            algorithmFitScore: 13,
            ctaConversionScore: 14,
            trendAlignmentScore: 16,
            predictedReach: "5.000-12.000 Impressions",
            predictedEngagement: "6-8%",
            viralProbability: "24%",
            tier: "A",
            feedback: "Starker Hook und gute CTA.",
            improvements: ["Mehr Social Proof", "Noch klarerer Benefit"],
            bestPostingTime: "Dienstag 18:00-19:00",
            competitorBenchmark: "Ueber Branchenschnitt",
          }),
        },
      },
    ],
  });
});

describe("content.generate", () => {
  it("creates a pending post and approval log from generated content", async () => {
    const caller = appRouter.createCaller(createContext());

    const result = await caller.content.generate({
      contentType: "post",
      topic: "Aloe Vera Gel",
      pillar: "produkt",
      platform: "instagram",
      platforms: ["instagram", "facebook"],
      count: 2,
      autoGenerateImage: false,
      autoGenerateVideo: false,
    });

    expect(result).toEqual({
      id: 501,
      content: "Generierter Beitrag",
      imageUrl: null,
      videoUrl: null,
    });
    expect(apiMock.generatePost).toHaveBeenCalledWith({
      topic: "Aloe Vera Gel",
      pillar: "produkt",
      platform: "instagram",
      count: 2,
    });
    expect(dbMock.createContentPost).toHaveBeenCalledWith({
      createdById: 7,
      contentType: "post",
      content: "Generierter Beitrag",
      platforms: ["instagram", "facebook"],
      status: "pending",
      topic: "Aloe Vera Gel",
      pillar: "produkt",
      apiMetadata: { model: "test-model" },
    });
    expect(dbMock.createApprovalLog).toHaveBeenCalledWith({
      contentPostId: 501,
      userId: 7,
      action: "edited",
      comment: "Content generiert und zur Review eingereicht",
      previousStatus: null,
      newStatus: "pending",
    });
  });
});

describe("approval flow", () => {
  it("approve moves a pending post to approved, stores schedule, and auto-publishes when requested", async () => {
    dbMock.getContentPostById.mockResolvedValue(
      makePost({
        status: "pending",
        editedContent: "Finaler Freigabe-Text",
        mediaUrl: "https://cdn.example.com/post.jpg",
        platforms: ["instagram", "facebook"],
      }),
    );

    const caller = appRouter.createCaller(createContext());
    const result = await caller.approval.approve({
      id: 42,
      comment: "Sieht gut aus",
      scheduledAt: "2026-04-18T10:00:00.000Z",
      autoPublish: true,
    });

    expect(result).toEqual({ success: true });
    expect(dbMock.updateContentPostStatus).toHaveBeenNthCalledWith(1, 42, "approved", 7, "Sieht gut aus");
    expect(dbMock.updateContentPost).toHaveBeenCalledWith(42, { scheduledAt: new Date("2026-04-18T10:00:00.000Z") });
    expect(dbMock.addToContentLibrary).toHaveBeenCalledWith({
      title: "Aloe Vera",
      category: "image",
      pillar: "produkt",
      textContent: "Finaler Freigabe-Text",
      imageUrl: "https://cdn.example.com/post.jpg",
      videoUrl: undefined,
      platforms: ["instagram", "facebook"],
      tags: ["post", "produkt"],
      createdById: 7,
      sourcePostId: 42,
      personalizationHints: "Passe den Text an deine persönliche Story an.",
    });
    expect(apiMock.publishToAllPlatforms).toHaveBeenCalledWith(
      "Finaler Freigabe-Text",
      ["instagram", "facebook"],
      [{ id: 1, platform: "instagram", username: "lr.team", displayName: "LR Team" }],
      ["https://cdn.example.com/post.jpg"],
      "2026-04-18T10:00:00.000Z",
      "user-key",
    );
    expect(dbMock.setBlotatoPostIds).toHaveBeenCalledWith(42, ["schedule-1"]);
    expect(dbMock.updateContentPostStatus).toHaveBeenNthCalledWith(2, 42, "scheduled", 7);
    expect(dbMock.createApprovalLog).toHaveBeenNthCalledWith(2, {
      contentPostId: 42,
      userId: 7,
      action: "scheduled",
      comment: "Auto-Published auf instagram, facebook via Blotato",
      previousStatus: "approved",
      newStatus: "scheduled",
    });
  });

  it("reject stores the rejected status and rejection comment", async () => {
    dbMock.getContentPostById.mockResolvedValue(
      makePost({
        status: "pending",
        editedContent: "Ablehnungs-Test",
      }),
    );

    const caller = appRouter.createCaller(createContext());
    const result = await caller.approval.reject({
      id: 42,
      comment: "Bitte CTA nachschärfen",
    });

    expect(result).toEqual({ success: true });
    expect(dbMock.updateContentPostStatus).toHaveBeenCalledWith(42, "rejected", 7, "Bitte CTA nachschärfen");
    expect(dbMock.createApprovalLog).toHaveBeenCalledWith({
      contentPostId: 42,
      userId: 7,
      action: "rejected",
      comment: "Bitte CTA nachschärfen",
      previousStatus: "pending",
      newStatus: "rejected",
    });
  });

  it("publish schedules an approved post via Blotato and logs the action", async () => {
    dbMock.getContentPostById.mockResolvedValue(
      makePost({
        status: "approved",
        editedContent: "Bereit fuer Blotato",
        mediaUrl: "https://cdn.example.com/post.jpg",
        videoUrl: "https://cdn.example.com/post.mp4",
        platforms: ["instagram"],
      }),
    );

    const caller = appRouter.createCaller(createContext());
    const result = await caller.approval.publish({
      id: 42,
      scheduledDate: "2026-04-19T08:30:00.000Z",
    });

    expect(result).toEqual({ success: true, postIds: ["schedule-1"] });
    expect(apiMock.publishToAllPlatforms).toHaveBeenCalledWith(
      "Bereit fuer Blotato",
      ["instagram"],
      [{ id: 1, platform: "instagram", username: "lr.team", displayName: "LR Team" }],
      ["https://cdn.example.com/post.jpg", "https://cdn.example.com/post.mp4"],
      "2026-04-19T08:30:00.000Z",
      undefined,
    );
    expect(dbMock.setBlotatoPostIds).toHaveBeenCalledWith(42, ["schedule-1"]);
    expect(dbMock.updateContentPostStatus).toHaveBeenCalledWith(42, "scheduled", 7);
    expect(dbMock.createApprovalLog).toHaveBeenCalledWith({
      contentPostId: 42,
      userId: 7,
      action: "scheduled",
      comment: "Auf instagram geplant via Blotato",
      previousStatus: "approved",
      newStatus: "scheduled",
    });
  });
});

describe("library", () => {
  it("adds, copies, and deletes library entries through the expected db calls", async () => {
    const caller = appRouter.createCaller(createContext());

    const addResult = await caller.library.add({
      title: "Story-Vorlage",
      category: "template",
      textContent: "Vorlage fuer das Team",
      platforms: ["instagram"],
      tags: ["template", "story"],
    });
    const copyResult = await caller.library.copy({ id: 801 });
    const deleteResult = await caller.library.delete({ id: 801 });

    expect(addResult).toEqual({ id: 801 });
    expect(copyResult).toEqual({ success: true });
    expect(deleteResult).toEqual({ success: true });
    expect(dbMock.addToContentLibrary).toHaveBeenCalledWith({
      title: "Story-Vorlage",
      category: "template",
      textContent: "Vorlage fuer das Team",
      platforms: ["instagram"],
      tags: ["template", "story"],
      createdById: 7,
    });
    expect(dbMock.incrementLibraryCopyCount).toHaveBeenCalledWith(801);
    expect(dbMock.deleteFromContentLibrary).toHaveBeenCalledWith(801);
  });
});

describe("duplicateCheck.check", () => {
  it("reports top matches from other users only and marks strong matches as duplicates", async () => {
    dbMock.getContentPosts.mockResolvedValue([
      makePost({
        id: 11,
        createdById: 99,
        content: "Aloe Vera hilft deiner Hautbalance mit Routine und Glow jeden Morgen",
      }),
      makePost({
        id: 12,
        createdById: 55,
        content: "Aloe Vera hilft deiner Hautbalance mit Routine und Glow jeden Morgen sofort",
      }),
      makePost({
        id: 13,
        createdById: 7,
        content: "Eigener Post des Users darf ignoriert werden",
      }),
    ]);
    dbMock.getUserById.mockImplementation(async (id: number) => ({
      id,
      name: id === 99 ? "Partnerin Anna" : "Partner Ben",
    }));

    const caller = appRouter.createCaller(createContext());
    const result = await caller.duplicateCheck.check({
      content: "Aloe Vera hilft deiner Hautbalance mit Routine und Glow jeden Morgen",
      threshold: 0.75,
    });

    expect(result.isDuplicate).toBe(true);
    expect(result.similarity).toBeGreaterThanOrEqual(75);
    expect(result.totalChecked).toBe(2);
    expect(result.matches).toHaveLength(2);
    expect(result.matches[0]).toMatchObject({
      postId: 11,
      authorName: "Partnerin Anna",
    });
    expect(result.matches.every(match => match.postId !== 13)).toBe(true);
  });
});

describe("viralPredictor", () => {
  it("quick returns the rule-based scoring output", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.viralPredictor.quick({
      content: "Warum speichern so viele dieses Aloe-Vera-Rezept? Schreib INFO in die DM! #aloe #lr #haut",
      platform: "instagram",
    });

    expect(result.quickScore).toBeGreaterThan(0);
    expect(result.hookStrength).toBeGreaterThan(5);
    expect(Array.isArray(result.emotionalTriggers)).toBe(true);
    expect(Array.isArray(result.shareabilityFactors)).toBe(true);
    expect(Array.isArray(result.issues)).toBe(true);
  });

  it("predict returns the parsed LLM-based viral prediction", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.viralPredictor.predict({
      content: "Stopp: Diese 3 Aloe-Vera-Fehler kosten dich taeglich Sichtbarkeit. Kommentiere ALOE fuer die Checkliste.",
      platform: "instagram",
      contentType: "post",
      hasMedia: true,
      hasVideo: false,
    });

    expect(llmMock.invokeLLM).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      totalScore: 88,
      hookScore: 17,
      tier: "A",
      bestPostingTime: "Dienstag 18:00-19:00",
    });
    expect(result.improvements).toEqual(["Mehr Social Proof", "Noch klarerer Benefit"]);
  });
});
