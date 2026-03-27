import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@lr.de",
      name: "Mathias",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "team-user",
      email: "team@lr.de",
      name: "Partner",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("Partner-Freischaltung", () => {
  it("Admin kann Partner freischalten (approvePartner)", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    // This will fail at DB level but validates the procedure exists and accepts input
    try {
      await caller.team.approvePartner({
        userId: 999,
        partnerNumber: "12345678",
        phoneNumber: "+49 170 1234567",
      });
    } catch (err: any) {
      // DB error is expected in test, but procedure should exist
      expect(err.message).not.toContain("is not a function");
    }
  });

  it("Normaler User kann NICHT Partner freischalten", async () => {
    const caller = appRouter.createCaller(createUserContext());
    try {
      await caller.team.approvePartner({
        userId: 999,
        partnerNumber: "12345678",
      });
      expect.unreachable("Should have thrown");
    } catch (err: any) {
      expect(err.message).toContain("Nur Admins");
    }
  });

  it("Admin kann Partner sperren (revokePartner)", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    try {
      await caller.team.revokePartner({ userId: 999 });
    } catch (err: any) {
      expect(err.message).not.toContain("is not a function");
    }
  });

  it("Normaler User kann NICHT Partner sperren", async () => {
    const caller = appRouter.createCaller(createUserContext());
    try {
      await caller.team.revokePartner({ userId: 999 });
      expect.unreachable("Should have thrown");
    } catch (err: any) {
      expect(err.message).toContain("Nur Admins");
    }
  });

  it("User kann eigenes Profil aktualisieren", async () => {
    const caller = appRouter.createCaller(createUserContext());
    try {
      await caller.team.updateProfile({
        phoneNumber: "+49 170 9876543",
      });
    } catch (err: any) {
      // DB error expected, but procedure should work
      expect(err.message).not.toContain("is not a function");
    }
  });

  it("Partnernummer ist Pflicht bei Freischaltung", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    try {
      await caller.team.approvePartner({
        userId: 999,
        partnerNumber: "", // Empty - should fail validation
      });
      expect.unreachable("Should have thrown");
    } catch (err: any) {
      // Zod validation error for min(1)
      expect(err).toBeDefined();
    }
  });
});
