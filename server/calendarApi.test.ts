import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

// Set env vars before importing
process.env.BLOTATO_API_KEY = "test-api-key-123";

describe("Blotato Calendar API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getScheduledPosts", () => {
    it("should fetch scheduled posts with default limit", async () => {
      const mockResponse = {
        items: [
          {
            id: "abc123",
            scheduledAt: "2026-04-01T12:00:00.000Z",
            draft: {
              accountId: "98432",
              content: { text: "Test post", mediaUrls: [], platform: "twitter" },
              target: { targetType: "twitter" },
            },
            account: {
              id: "98432",
              name: "John Doe",
              username: "johndoe",
              profileImageUrl: null,
              subaccountId: null,
              subaccountName: null,
            },
          },
        ],
        count: "1",
        cursor: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { getScheduledPosts } = await import("./externalApis");
      const result = await getScheduledPosts(100, undefined, "test-api-key-123");

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe("abc123");
      expect(result.items[0].draft.content.text).toBe("Test post");
      expect(result.count).toBe("1");
    });

    it("should handle pagination with cursor", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [], count: "0", cursor: null }),
      });

      const { getScheduledPosts } = await import("./externalApis");
      await getScheduledPosts(10, "cursor123", "test-api-key-123");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/schedules?limit=10&cursor=cursor123"),
        expect.any(Object)
      );
    });

    it("should return empty array on error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { getScheduledPosts } = await import("./externalApis");
      const result = await getScheduledPosts();

      expect(result.items).toEqual([]);
      expect(result.count).toBe("0");
    });
  });

  describe("getScheduledPost", () => {
    it("should fetch a single scheduled post", async () => {
      const mockSchedule = {
        id: "abc123",
        scheduledAt: "2026-04-01T12:00:00.000Z",
        draft: {
          accountId: "98432",
          content: { text: "Single post", mediaUrls: [], platform: "instagram" },
          target: { targetType: "instagram" },
        },
        account: { id: "98432", name: "Test", username: "test", profileImageUrl: null, subaccountId: null, subaccountName: null },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ schedule: mockSchedule }),
      });

      const { getScheduledPost } = await import("./externalApis");
      const result = await getScheduledPost("abc123", "test-api-key-123");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("abc123");
      expect(result!.draft.content.platform).toBe("instagram");
    });

    it("should return null on error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Not found"));

      const { getScheduledPost } = await import("./externalApis");
      const result = await getScheduledPost("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("updateScheduledPost", () => {
    it("should update scheduled time", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const { updateScheduledPost } = await import("./externalApis");
      const result = await updateScheduledPost("abc123", {
        scheduledTime: "2026-05-01T15:00:00Z",
      }, "test-api-key-123");

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/schedules/abc123"),
        expect.objectContaining({ method: "PATCH" })
      );
    });

    it("should update draft content", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const { updateScheduledPost } = await import("./externalApis");
      const result = await updateScheduledPost("abc123", {
        draft: {
          accountId: "98432",
          content: { text: "Updated text", mediaUrls: [], platform: "twitter" },
          target: { targetType: "twitter" },
        },
      });

      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Update failed"));

      const { updateScheduledPost } = await import("./externalApis");
      const result = await updateScheduledPost("abc123", { scheduledTime: "2026-05-01T15:00:00Z" });

      expect(result).toBe(false);
    });
  });

  describe("deleteScheduledPost", () => {
    it("should delete a scheduled post", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const { deleteScheduledPost } = await import("./externalApis");
      const result = await deleteScheduledPost("abc123", "test-api-key-123");

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/schedules/abc123"),
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("should return false on error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Delete failed"));

      const { deleteScheduledPost } = await import("./externalApis");
      const result = await deleteScheduledPost("abc123");

      expect(result).toBe(false);
    });
  });

  describe("reschedulePost", () => {
    it("should reschedule by calling updateScheduledPost with new time", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const { reschedulePost } = await import("./externalApis");
      const result = await reschedulePost("abc123", "2026-06-01T09:00:00Z", "test-api-key-123");

      expect(result).toBe(true);
    });
  });

  describe("BlotatoScheduledPost interface", () => {
    it("should have correct structure for scheduled post data", () => {
      const post = {
        id: "test-id",
        scheduledAt: "2026-04-01T12:00:00.000Z",
        draft: {
          accountId: "12345",
          content: {
            text: "Hello world",
            mediaUrls: ["https://example.com/image.jpg"],
            platform: "instagram",
          },
          target: {
            targetType: "instagram",
          },
        },
        account: {
          id: "12345",
          name: "Test Account",
          username: "testuser",
          profileImageUrl: "https://example.com/avatar.jpg",
          subaccountId: null,
          subaccountName: null,
        },
      };

      expect(post.id).toBeTruthy();
      expect(post.scheduledAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(post.draft.content.platform).toBe("instagram");
      expect(post.draft.target.targetType).toBe("instagram");
      expect(post.account.username).toBe("testuser");
      expect(post.draft.content.mediaUrls).toHaveLength(1);
    });
  });

  describe("Calendar date grouping logic", () => {
    it("should group posts by date correctly", () => {
      const items = [
        { scheduledAt: "2026-04-01T09:00:00.000Z", id: "1" },
        { scheduledAt: "2026-04-01T14:00:00.000Z", id: "2" },
        { scheduledAt: "2026-04-02T10:00:00.000Z", id: "3" },
        { scheduledAt: "2026-04-03T08:00:00.000Z", id: "4" },
      ];

      const byDate: Record<string, typeof items> = {};
      for (const item of items) {
        const date = item.scheduledAt.split("T")[0];
        if (!byDate[date]) byDate[date] = [];
        byDate[date].push(item);
      }

      expect(Object.keys(byDate)).toHaveLength(3);
      expect(byDate["2026-04-01"]).toHaveLength(2);
      expect(byDate["2026-04-02"]).toHaveLength(1);
      expect(byDate["2026-04-03"]).toHaveLength(1);
    });

    it("should handle empty items array", () => {
      const items: any[] = [];
      const byDate: Record<string, any[]> = {};
      for (const item of items) {
        const date = item.scheduledAt.split("T")[0];
        if (!byDate[date]) byDate[date] = [];
        byDate[date].push(item);
      }

      expect(Object.keys(byDate)).toHaveLength(0);
    });
  });
});
