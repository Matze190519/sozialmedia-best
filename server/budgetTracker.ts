/**
 * Budget Tracker - Kontrolliert Generierungs-Kosten
 * 
 * Limits pro Partner/Monat:
 * - 40 Bilder ($0.08 each = $3.20 max) [TESTPHASE]
 * - 10 Videos ($0.84 each = $8.40 max) [TESTPHASE]
 * 
 * Globaler Monatsdeckel: $200 (20000 cents)
 */

import { getDb } from "./db";
import { generationUsage, globalBudget } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

// Limits
const PARTNER_IMAGE_LIMIT = 40; // TESTPHASE (normal: 20)
const PARTNER_VIDEO_LIMIT = 10; // TESTPHASE (normal: 5)
const GLOBAL_BUDGET_CENTS = 20000; // $200

// Kosten in Cents
const IMAGE_COST_CENTS = 8; // $0.08 Nano Banana 2
const VIDEO_COST_CENTS = 84; // $0.84 Kling 3.0 Pro 5s mit Audio

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export interface BudgetCheckResult {
  allowed: boolean;
  reason?: string;
  partnerUsed: number;
  partnerLimit: number;
  globalSpentCents: number;
  globalLimitCents: number;
}

/**
 * Prueft ob ein Partner noch generieren darf
 */
export async function checkBudget(userId: number, type: "image" | "video"): Promise<BudgetCheckResult> {
  const monthKey = getCurrentMonthKey();
  const limit = type === "image" ? PARTNER_IMAGE_LIMIT : PARTNER_VIDEO_LIMIT;

  const db = (await getDb())!;

  // Partner-Usage diesen Monat
  const [partnerUsage] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(generationUsage)
    .where(and(
      eq(generationUsage.userId, userId),
      eq(generationUsage.type, type),
      eq(generationUsage.monthKey, monthKey)
    ));
  
  const partnerUsed = Number(partnerUsage?.count || 0);

  // Globales Budget
  const [budget] = await db
    .select()
    .from(globalBudget)
    .where(eq(globalBudget.monthKey, monthKey));
  
  const globalSpent = budget?.totalSpentCents || 0;
  const globalLimit = budget?.limitCents || GLOBAL_BUDGET_CENTS;

  // Check 1: Globales Budget
  const costCents = type === "image" ? IMAGE_COST_CENTS : VIDEO_COST_CENTS;
  if (globalSpent + costCents > globalLimit) {
    return {
      allowed: false,
      reason: `Monatsbudget erreicht ($${(globalSpent / 100).toFixed(2)} von $${(globalLimit / 100).toFixed(2)}). Nutze die Content-Bibliothek fuer fertigen Content.`,
      partnerUsed,
      partnerLimit: limit,
      globalSpentCents: globalSpent,
      globalLimitCents: globalLimit,
    };
  }

  // Check 2: Partner-Limit
  if (partnerUsed >= limit) {
    return {
      allowed: false,
      reason: `Dein Frei-Kontingent fuer ${type === "image" ? "Bilder" : "Videos"} ist aufgebraucht (${partnerUsed}/${limit} diesen Monat). Nutze die Content-Bibliothek fuer fertigen Content.`,
      partnerUsed,
      partnerLimit: limit,
      globalSpentCents: globalSpent,
      globalLimitCents: globalLimit,
    };
  }

  return {
    allowed: true,
    partnerUsed,
    partnerLimit: limit,
    globalSpentCents: globalSpent,
    globalLimitCents: globalLimit,
  };
}

/**
 * Trackt eine Generierung (nach erfolgreichem Erstellen aufrufen)
 */
export async function trackUsage(userId: number, type: "image" | "video", model: string, contentPostId?: number, durationSeconds?: number): Promise<void> {
  const monthKey = getCurrentMonthKey();
  const costCents = type === "image" ? IMAGE_COST_CENTS : VIDEO_COST_CENTS;

  const db = (await getDb())!;

  // Usage eintragen
  await db.insert(generationUsage).values({
    userId,
    type,
    monthKey,
    costCents,
    model,
    durationSeconds,
    contentPostId,
  });

  // Globales Budget updaten (upsert)
  const [existing] = await db
    .select()
    .from(globalBudget)
    .where(eq(globalBudget.monthKey, monthKey));

  if (existing) {
    await db.update(globalBudget)
      .set({
        totalSpentCents: sql`${globalBudget.totalSpentCents} + ${costCents}`,
        totalImages: type === "image" ? sql`${globalBudget.totalImages} + 1` : existing.totalImages,
        totalVideos: type === "video" ? sql`${globalBudget.totalVideos} + 1` : existing.totalVideos,
      })
      .where(eq(globalBudget.monthKey, monthKey));
  } else {
    await db.insert(globalBudget).values({
      monthKey,
      totalSpentCents: costCents,
      limitCents: GLOBAL_BUDGET_CENTS,
      totalImages: type === "image" ? 1 : 0,
      totalVideos: type === "video" ? 1 : 0,
    });
  }
}

/**
 * Gibt den aktuellen Budget-Status zurueck (fuer Admin-Dashboard)
 */
export async function getBudgetStatus(): Promise<{
  monthKey: string;
  totalSpentCents: number;
  limitCents: number;
  totalImages: number;
  totalVideos: number;
  remainingCents: number;
  percentUsed: number;
}> {
  const monthKey = getCurrentMonthKey();
  const db = (await getDb())!;
  const [budget] = await db
    .select()
    .from(globalBudget)
    .where(eq(globalBudget.monthKey, monthKey));

  const spent = budget?.totalSpentCents || 0;
  const limit = budget?.limitCents || GLOBAL_BUDGET_CENTS;

  return {
    monthKey,
    totalSpentCents: spent,
    limitCents: limit,
    totalImages: budget?.totalImages || 0,
    totalVideos: budget?.totalVideos || 0,
    remainingCents: limit - spent,
    percentUsed: Math.round((spent / limit) * 100),
  };
}

/**
 * Partner-Usage fuer einen bestimmten User
 */
export async function getPartnerUsage(userId: number): Promise<{
  images: number;
  videos: number;
  imageLimit: number;
  videoLimit: number;
}> {
  const monthKey = getCurrentMonthKey();

  const db = (await getDb())!;
  const [imageCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(generationUsage)
    .where(and(
      eq(generationUsage.userId, userId),
      eq(generationUsage.type, "image"),
      eq(generationUsage.monthKey, monthKey)
    ));

  const [videoCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(generationUsage)
    .where(and(
      eq(generationUsage.userId, userId),
      eq(generationUsage.type, "video"),
      eq(generationUsage.monthKey, monthKey)
    ));

  return {
    images: Number(imageCount?.count || 0),
    videos: Number(videoCount?.count || 0),
    imageLimit: PARTNER_IMAGE_LIMIT,
    videoLimit: PARTNER_VIDEO_LIMIT,
  };
}
