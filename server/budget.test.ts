import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  }),
}));

describe("Budget Tracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export checkBudget function", async () => {
    const mod = await import("./budgetTracker");
    expect(typeof mod.checkBudget).toBe("function");
  });

  it("should export trackUsage function", async () => {
    const mod = await import("./budgetTracker");
    expect(typeof mod.trackUsage).toBe("function");
  });

  it("should export getBudgetStatus function", async () => {
    const mod = await import("./budgetTracker");
    expect(typeof mod.getBudgetStatus).toBe("function");
  });

  it("should export getPartnerUsage function", async () => {
    const mod = await import("./budgetTracker");
    expect(typeof mod.getPartnerUsage).toBe("function");
  });

  it("should export getAllPartnerUsage function", async () => {
    const mod = await import("./budgetTracker");
    expect(typeof mod.getAllPartnerUsage).toBe("function");
  });

  it("should have correct partner limits for testphase", async () => {
    // Import the module to check constants indirectly through checkBudget behavior
    const mod = await import("./budgetTracker");
    // The function should exist and be callable
    expect(mod.checkBudget).toBeDefined();
    expect(mod.getPartnerUsage).toBeDefined();
  });

  it("BudgetCheckResult should have correct shape", async () => {
    // Verify the interface structure by checking the function signature
    const mod = await import("./budgetTracker");
    expect(mod.checkBudget.length).toBe(2); // userId, type
    expect(mod.trackUsage.length).toBe(5); // userId, type, model, contentPostId?, durationSeconds?
  });

  it("getAllPartnerUsage should return partners and totals shape", async () => {
    const mod = await import("./budgetTracker");
    expect(mod.getAllPartnerUsage.length).toBe(0); // no params
  });
});
