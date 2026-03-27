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
    openId: "normal-user",
    email: "user@example.com",
    name: "Normal User",
    loginMethod: "manus",
    role: "user",
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

describe("products", () => {
  describe("products.list", () => {
    it("returns an array of products", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.products.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("returns products with required fields", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.products.list({ limit: 5 });
      if (result.length > 0) {
        const product = result[0];
        expect(product).toHaveProperty("id");
        expect(product).toHaveProperty("name");
        expect(product).toHaveProperty("category");
        expect(product).toHaveProperty("imageUrl");
        expect(typeof product.name).toBe("string");
        expect(typeof product.category).toBe("string");
        expect(typeof product.imageUrl).toBe("string");
        expect(product.imageUrl).toMatch(/^https?:\/\//);
      }
    });

    it("supports category filter", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.products.list({ category: "Aloe Vera", limit: 10 });
      expect(Array.isArray(result)).toBe(true);
      for (const product of result) {
        expect(product.category).toBe("Aloe Vera");
      }
    });

    it("supports search filter", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.products.list({ search: "Microsilver", limit: 10 });
      expect(Array.isArray(result)).toBe(true);
      for (const product of result) {
        expect(product.name.toLowerCase()).toContain("microsilver");
      }
    });

    it("supports pagination with limit and offset", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const page1 = await caller.products.list({ limit: 5, offset: 0 });
      const page2 = await caller.products.list({ limit: 5, offset: 5 });
      expect(page1.length).toBeLessThanOrEqual(5);
      expect(page2.length).toBeLessThanOrEqual(5);
      // Pages should not overlap (if enough data)
      if (page1.length > 0 && page2.length > 0) {
        const page1Ids = page1.map((p: any) => p.id);
        const page2Ids = page2.map((p: any) => p.id);
        for (const id of page2Ids) {
          expect(page1Ids).not.toContain(id);
        }
      }
    });
  });

  describe("products.categories", () => {
    it("returns an array of category strings", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.products.categories();
      expect(Array.isArray(result)).toBe(true);
      for (const cat of result) {
        expect(typeof cat).toBe("string");
      }
    });

    it("includes known LR categories", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.products.categories();
      // Should have at least some of these
      const knownCategories = ["Aloe Vera", "Körperpflege", "ZEITGARD", "Parfum", "Nahrungsergänzung"];
      const found = knownCategories.filter(c => result.includes(c));
      expect(found.length).toBeGreaterThan(0);
    });
  });

  describe("products.count", () => {
    it("returns a number", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const result = await caller.products.count();
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("returns count for a specific category", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const total = await caller.products.count();
      const aloeCount = await caller.products.count({ category: "Aloe Vera" });
      expect(aloeCount).toBeLessThanOrEqual(total);
      expect(aloeCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("products.getById", () => {
    it("returns a product by ID", async () => {
      const caller = appRouter.createCaller(createUserContext());
      const list = await caller.products.list({ limit: 1 });
      if (list.length > 0) {
        const product = await caller.products.getById({ id: list[0].id });
        expect(product).toHaveProperty("id", list[0].id);
        expect(product).toHaveProperty("name", list[0].name);
        expect(product).toHaveProperty("imageUrl");
      }
    });

    it("throws NOT_FOUND for non-existent ID", async () => {
      const caller = appRouter.createCaller(createUserContext());
      await expect(caller.products.getById({ id: 999999 })).rejects.toThrow();
    });
  });

  describe("products.import (admin only)", () => {
    it("rejects non-admin users", async () => {
      const caller = appRouter.createCaller(createUserContext());
      await expect(caller.products.import()).rejects.toThrow(/admin|forbidden/i);
    });
  });
});
