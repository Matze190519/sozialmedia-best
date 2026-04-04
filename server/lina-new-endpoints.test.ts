import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db module
vi.mock("./db", () => ({
  getContentPosts: vi.fn(),
  getContentPostById: vi.fn(),
  createContentPost: vi.fn(),
  updateContentPost: vi.fn(),
  getContentTemplates: vi.fn(),
  getContentStats: vi.fn(),
  getContentLibrary: vi.fn(),
  getLRProducts: vi.fn(),
  getPartnerByNumber: vi.fn(),
  createInviteToken: vi.fn(),
  getInviteTokenByToken: vi.fn(),
  markInviteTokenUsed: vi.fn(),
  getUserByOpenId: vi.fn(),
  upsertUser: vi.fn(),
  getTeamActivitiesByUser: vi.fn(),
}));

// Mock hashtagEngine
vi.mock("./hashtagEngine", () => ({
  generateSmartHashtags: vi.fn().mockResolvedValue({
    hashtags: ["#LR", "#AloeVera", "#Gesundheit", "#Lifestyle", "#NetworkMarketing"],
    categories: { trending: ["#Gesundheit"], niche: ["#AloeVera"], brand: ["#LR"], broad: ["#Lifestyle"] },
    totalReach: "50K+",
    tips: "Mix aus Brand und Nische",
    platform: "instagram",
  }),
}));

// Mock smartPostingTimes
vi.mock("./smartPostingTimes", () => ({
  getWeeklySchedule: vi.fn().mockReturnValue({
    platform: "instagram",
    displayName: "Instagram",
    emoji: "📸",
    timezone: "Europe/Berlin",
    weekSchedule: [
      { dayName: "Montag", bestSlot: { hour: 12, minute: 0, score: 85, reason: "Mittagspause" }, isTopDay: true },
      { dayName: "Dienstag", bestSlot: { hour: 18, minute: 30, score: 90, reason: "Feierabend" }, isTopDay: true },
    ],
    globalBestTimes: [{ hour: 12, minute: 0 }, { hour: 18, minute: 30 }],
    peakDays: ["Dienstag", "Mittwoch"],
    avoidTimes: ["3:00-6:00"],
    algorithmNotes: "Reels bevorzugt",
  }),
  getAllSchedules: vi.fn().mockReturnValue([]),
}));

// Mock externalApis
vi.mock("./externalApis", () => ({
  generatePost: vi.fn().mockResolvedValue({ content: "Generierter Post", id: "abc", type: "post", metadata: {}, created_at: "2026-04-04" }),
  generateReel: vi.fn().mockResolvedValue({ content: "Reel Script", id: "def", type: "reel", metadata: {}, created_at: "2026-04-04" }),
  generateStory: vi.fn().mockResolvedValue({ content: "Story Content", id: "ghi", type: "story", metadata: {}, created_at: "2026-04-04" }),
  generateObjection: vi.fn().mockResolvedValue({ content: "Einwandbehandlung Antwort", id: "jkl", type: "objection", metadata: {}, created_at: "2026-04-04" }),
  getBlotatoAccounts: vi.fn().mockResolvedValue([]),
  LR_BLOTATO_ACCOUNTS: [],
}));

import * as db from "./db";
import { registerLinaRoutes } from "./linaRoutes";

// Minimal Express mock that captures routes
function createMockApp() {
  const routes: Record<string, Function> = {};
  return {
    get: (path: string, handler: Function) => { routes[path] = handler; },
    post: (path: string, handler: Function) => { routes[path] = handler; },
    routes,
  };
}

function createMockReq(query: Record<string, string> = {}, body: Record<string, any> = {}) {
  return { query, body };
}

function createMockRes() {
  let statusCode = 200;
  let jsonData: any = null;
  return {
    status: (code: number) => {
      statusCode = code;
      return { json: (data: any) => { jsonData = data; } };
    },
    json: (data: any) => { jsonData = data; },
    getStatus: () => statusCode,
    getData: () => jsonData,
  };
}

describe("Lina REST API - New Endpoints", () => {
  let app: ReturnType<typeof createMockApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createMockApp();
    registerLinaRoutes(app as any);
  });

  // ─── HEALTH ────────────────────────────────────────────────
  describe("GET /api/lina/health", () => {
    it("should return health status", async () => {
      (db.getContentStats as any).mockResolvedValue({ total: 57 });
      const req = createMockReq();
      const res = createMockRes();
      await app.routes["/api/lina/health"](req, res);
      const data = res.getData();
      expect(data.status).toBe("ok");
      expect(data.db).toBe("connected");
      expect(data.endpoints).toBe(19);
      expect(data.totalPosts).toBe(57);
    });
  });

  // ─── TEMPLATES ─────────────────────────────────────────────
  describe("GET /api/lina/templates", () => {
    it("should return templates list", async () => {
      (db.getContentTemplates as any).mockResolvedValue([
        { id: 1, name: "Template A", category: "lifestyle", content: "Test", platforms: ["instagram"], usageCount: 5 },
        { id: 2, name: "Template B", category: "business", content: "Biz", platforms: ["linkedin"], usageCount: 3 },
      ]);
      const req = createMockReq();
      const res = createMockRes();
      await app.routes["/api/lina/templates"](req, res);
      const data = res.getData();
      expect(data.success).toBe(true);
      expect(data.count).toBe(2);
      expect(data.templates).toHaveLength(2);
      expect(data.templates[0].name).toBe("Template A");
    });

    it("should support category filter", async () => {
      (db.getContentTemplates as any).mockResolvedValue([]);
      const req = createMockReq({ category: "lifestyle" });
      const res = createMockRes();
      await app.routes["/api/lina/templates"](req, res);
      expect(db.getContentTemplates).toHaveBeenCalledWith("lifestyle");
    });

    it("should support limit parameter", async () => {
      (db.getContentTemplates as any).mockResolvedValue([
        { id: 1, name: "A", category: "x", content: "c", platforms: [], usageCount: 0 },
        { id: 2, name: "B", category: "x", content: "c", platforms: [], usageCount: 0 },
        { id: 3, name: "C", category: "x", content: "c", platforms: [], usageCount: 0 },
      ]);
      const req = createMockReq({ limit: "1" });
      const res = createMockRes();
      await app.routes["/api/lina/templates"](req, res);
      expect(res.getData().count).toBe(1);
    });
  });

  // ─── HASHTAGS ──────────────────────────────────────────────
  describe("POST /api/lina/hashtags", () => {
    it("should generate hashtags for a topic", async () => {
      const req = createMockReq({}, { topic: "LR Aloe Vera" });
      const res = createMockRes();
      await app.routes["/api/lina/hashtags"](req, res);
      const data = res.getData();
      expect(data.success).toBe(true);
      expect(data.hashtags).toHaveLength(5);
      expect(data.categories).toBeDefined();
      expect(data.totalReach).toBe("50K+");
    });

    it("should require topic field", async () => {
      const req = createMockReq({}, {});
      const res = createMockRes();
      await app.routes["/api/lina/hashtags"](req, res);
      expect(res.getStatus()).toBe(400);
    });
  });

  // ─── GENERATE ──────────────────────────────────────────────
  describe("POST /api/lina/generate", () => {
    it("should generate a post and save to DB", async () => {
      (db.createContentPost as any).mockResolvedValue(42);
      const req = createMockReq({}, { topic: "Aloe Vera Drinking Gel" });
      const res = createMockRes();
      await app.routes["/api/lina/generate"](req, res);
      const data = res.getData();
      expect(data.success).toBe(true);
      expect(data.postId).toBe(42);
      expect(data.content).toBe("Generierter Post");
    });

    it("should require topic field", async () => {
      const req = createMockReq({}, {});
      const res = createMockRes();
      await app.routes["/api/lina/generate"](req, res);
      expect(res.getStatus()).toBe(400);
    });

    it("should support reel content type", async () => {
      (db.createContentPost as any).mockResolvedValue(43);
      const req = createMockReq({}, { topic: "Fitness", contentType: "reel" });
      const res = createMockRes();
      await app.routes["/api/lina/generate"](req, res);
      expect(res.getData().success).toBe(true);
      expect(res.getData().content).toBe("Reel Script");
    });
  });

  // ─── SCHEDULE ──────────────────────────────────────────────
  describe("POST /api/lina/schedule", () => {
    it("should require postId and scheduledTime", async () => {
      const req = createMockReq({}, {});
      const res = createMockRes();
      await app.routes["/api/lina/schedule"](req, res);
      expect(res.getStatus()).toBe(400);
    });

    it("should return 404 for non-existent post", async () => {
      (db.getContentPostById as any).mockResolvedValue(null);
      const req = createMockReq({}, { postId: 999, scheduledTime: "2026-04-10T10:00:00Z" });
      const res = createMockRes();
      await app.routes["/api/lina/schedule"](req, res);
      expect(res.getStatus()).toBe(404);
    });

    it("should schedule an existing post", async () => {
      (db.getContentPostById as any).mockResolvedValue({ id: 1, content: "Test", status: "pending" });
      const req = createMockReq({}, { postId: 1, scheduledTime: "2026-04-10T10:00:00Z" });
      const res = createMockRes();
      await app.routes["/api/lina/schedule"](req, res);
      const data = res.getData();
      expect(data.success).toBe(true);
      expect(data.postId).toBe(1);
      expect(db.updateContentPost).toHaveBeenCalled();
    });
  });

  // ─── WEEKLY PLAN ───────────────────────────────────────────
  describe("GET /api/lina/weekly-plan", () => {
    it("should return weekly plan for instagram by default", async () => {
      const req = createMockReq();
      const res = createMockRes();
      await app.routes["/api/lina/weekly-plan"](req, res);
      const data = res.getData();
      expect(data.success).toBe(true);
      expect(data.platform).toBe("instagram");
      expect(data.tage).toHaveLength(2);
      expect(data.besteZeiten).toBeDefined();
      expect(data.topTage).toEqual(["Dienstag", "Mittwoch"]);
      expect(data.tipp).toContain("Instagram");
    });

    it("should support all platforms query", async () => {
      const req = createMockReq({ platform: "all" });
      const res = createMockRes();
      await app.routes["/api/lina/weekly-plan"](req, res);
      expect(res.getData().success).toBe(true);
    });
  });

  // ─── OBJECTION ─────────────────────────────────────────────
  describe("POST /api/lina/objection", () => {
    it("should generate objection handling response", async () => {
      const req = createMockReq({}, { objection: "Das ist doch Pyramidensystem" });
      const res = createMockRes();
      await app.routes["/api/lina/objection"](req, res);
      const data = res.getData();
      expect(data.success).toBe(true);
      expect(data.response).toBe("Einwandbehandlung Antwort");
      expect(data.message).toBe("Einwandbehandlung generiert!");
    });

    it("should require objection field", async () => {
      const req = createMockReq({}, {});
      const res = createMockRes();
      await app.routes["/api/lina/objection"](req, res);
      expect(res.getStatus()).toBe(400);
    });
  });

  // ─── ROUTE REGISTRATION ───────────────────────────────────
  describe("Route registration", () => {
    it("should register all 19 Lina endpoints", () => {
      const allRoutes = Object.keys(app.routes);
      expect(allRoutes).toContain("/api/lina/health");
      expect(allRoutes).toContain("/api/lina/templates");
      expect(allRoutes).toContain("/api/lina/hashtags");
      expect(allRoutes).toContain("/api/lina/generate");
      expect(allRoutes).toContain("/api/lina/schedule");
      expect(allRoutes).toContain("/api/lina/weekly-plan");
      expect(allRoutes).toContain("/api/lina/objection");
      expect(allRoutes).toContain("/api/lina/content");
      expect(allRoutes).toContain("/api/lina/library");
      expect(allRoutes).toContain("/api/lina/products");
      expect(allRoutes).toContain("/api/lina/status");
      expect(allRoutes.length).toBeGreaterThanOrEqual(15);
    });
  });
});
