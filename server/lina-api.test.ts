import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
vi.mock("./db", () => ({
  getContentPosts: vi.fn(),
  getContentLibrary: vi.fn(),
  getLRProducts: vi.fn(),
  getContentStats: vi.fn(),
}));

import * as db from "./db";

// Import the route registration function
import { registerLinaRoutes } from "./linaRoutes";

// Create a minimal Express mock
function createMockApp() {
  const routes: Record<string, Function> = {};
  return {
    get: (path: string, handler: Function) => {
      routes[path] = handler;
    },
    routes,
  };
}

function createMockReq(query: Record<string, string> = {}) {
  return { query };
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

describe("Lina REST API", () => {
  let app: ReturnType<typeof createMockApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createMockApp();
    registerLinaRoutes(app as any);
  });

  describe("GET /api/lina/status", () => {
    it("should return online status with stats", async () => {
      vi.mocked(db.getContentStats).mockResolvedValue({
        total: 10,
        pending: 2,
        approved: 5,
        rejected: 1,
        scheduled: 2,
        published: 0,
      });

      const req = createMockReq();
      const res = createMockRes();
      await app.routes["/api/lina/status"](req, res);

      const data = res.getData();
      expect(data.success).toBe(true);
      expect(data.status).toBe("online");
      expect(data.stats.totalPosts).toBe(10);
      expect(data.stats.pendingApproval).toBe(2);
      expect(data.stats.approved).toBe(5);
      expect(data.timestamp).toBeDefined();
    });

    it("should handle errors gracefully", async () => {
      vi.mocked(db.getContentStats).mockRejectedValue(new Error("DB error"));

      const req = createMockReq();
      const res = createMockRes();
      await app.routes["/api/lina/status"](req, res);

      // status(500).json() was called
      expect(res.getStatus()).toBe(500);
    });
  });

  describe("GET /api/lina/content", () => {
    it("should return approved posts", async () => {
      vi.mocked(db.getContentPosts).mockResolvedValue([
        {
          post: {
            id: 1,
            content: "Test content",
            editedContent: null,
            contentType: "post",
            platforms: ["instagram"],
            mediaUrl: "https://example.com/img.jpg",
            videoUrl: "https://example.com/vid.mp4",
            topic: "Autokonzept",
            pillar: "autokonzept",
            createdAt: new Date("2026-03-28"),
            status: "approved",
            hookStyle: null,
            qualityScore: 85,
            scheduledAt: null,
            approvedAt: new Date(),
            approvedBy: "admin",
            autoPublish: false,
            blotato: null,
            userId: 1,
          },
          user: { name: "Mathias", openId: "123" },
        },
      ] as any);

      const req = createMockReq({ limit: "3" });
      const res = createMockRes();
      await app.routes["/api/lina/content"](req, res);

      const data = res.getData();
      expect(data.success).toBe(true);
      expect(data.count).toBe(1);
      expect(data.posts[0].text).toBe("Test content");
      expect(data.posts[0].imageUrl).toBe("https://example.com/img.jpg");
      expect(data.posts[0].videoUrl).toBe("https://example.com/vid.mp4");
    });

    it("should filter by pillar", async () => {
      vi.mocked(db.getContentPosts).mockResolvedValue([
        {
          post: {
            id: 1, content: "Auto post", editedContent: null,
            contentType: "post", platforms: ["instagram"],
            mediaUrl: null, videoUrl: null,
            topic: "Autos", pillar: "autokonzept",
            createdAt: new Date(), status: "approved",
            hookStyle: null, qualityScore: 80,
            scheduledAt: null, approvedAt: null, approvedBy: null,
            autoPublish: false, blotato: null, userId: 1,
          },
          user: { name: "Mathias", openId: "123" },
        },
        {
          post: {
            id: 2, content: "Health post", editedContent: null,
            contentType: "post", platforms: ["instagram"],
            mediaUrl: null, videoUrl: null,
            topic: "Gesundheit", pillar: "gesundheit",
            createdAt: new Date(), status: "approved",
            hookStyle: null, qualityScore: 80,
            scheduledAt: null, approvedAt: null, approvedBy: null,
            autoPublish: false, blotato: null, userId: 1,
          },
          user: { name: "Mathias", openId: "123" },
        },
      ] as any);

      const req = createMockReq({ pillar: "auto" });
      const res = createMockRes();
      await app.routes["/api/lina/content"](req, res);

      const data = res.getData();
      expect(data.count).toBe(1);
      expect(data.posts[0].pillar).toBe("autokonzept");
    });
  });

  describe("GET /api/lina/library", () => {
    it("should return library items", async () => {
      vi.mocked(db.getContentLibrary).mockResolvedValue([
        {
          item: {
            id: 1,
            title: "Test Library Item",
            category: "autokonzept",
            textContent: "Library text",
            imageUrl: "https://example.com/lib.jpg",
            videoUrl: null,
            platforms: ["instagram"],
            tags: ["auto", "lr"],
          },
        },
      ] as any);

      const req = createMockReq({ limit: "5" });
      const res = createMockRes();
      await app.routes["/api/lina/library"](req, res);

      const data = res.getData();
      expect(data.success).toBe(true);
      expect(data.count).toBe(1);
      expect(data.items[0].title).toBe("Test Library Item");
      expect(data.items[0].text).toBe("Library text");
    });
  });

  describe("GET /api/lina/products", () => {
    it("should return LR products", async () => {
      vi.mocked(db.getLRProducts).mockResolvedValue([
        {
          id: 1,
          name: "Microsilver Plus Waschcreme",
          category: "Körperpflege",
          price: "23.49",
          imageUrl: "https://example.com/product.jpg",
          description: "Test product",
          descriptionWA: "WA description",
          whatsappText: "WA text",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any);

      const req = createMockReq({ limit: "10", category: "Körperpflege" });
      const res = createMockRes();
      await app.routes["/api/lina/products"](req, res);

      const data = res.getData();
      expect(data.success).toBe(true);
      expect(data.count).toBe(1);
      expect(data.products[0].name).toBe("Microsilver Plus Waschcreme");
    });
  });

  describe("Route registration", () => {
    it("should register all 4 Lina endpoints", () => {
      expect(app.routes["/api/lina/content"]).toBeDefined();
      expect(app.routes["/api/lina/library"]).toBeDefined();
      expect(app.routes["/api/lina/products"]).toBeDefined();
      expect(app.routes["/api/lina/status"]).toBeDefined();
    });
  });
});
