import { eq, desc, and, gte, lte, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  contentPosts, InsertContentPost, ContentPost,
  approvalLogs, InsertApprovalLog,
  contentTemplates, InsertContentTemplate,
  creatorSpyReports, InsertCreatorSpyReport,
  analyticsSnapshots, InsertAnalyticsSnapshot,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── User Queries ───────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ─── Content Post Queries ───────────────────────────────────

export async function createContentPost(post: InsertContentPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contentPosts).values(post);
  return result[0].insertId;
}

export async function getContentPosts(filters?: {
  status?: string;
  createdById?: number;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.status) conditions.push(eq(contentPosts.status, filters.status as any));
  if (filters?.createdById) conditions.push(eq(contentPosts.createdById, filters.createdById));

  const query = db.select({
    post: contentPosts,
    createdBy: { id: users.id, name: users.name, role: users.role },
  })
    .from(contentPosts)
    .leftJoin(users, eq(contentPosts.createdById, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(contentPosts.createdAt))
    .limit(filters?.limit ?? 50)
    .offset(filters?.offset ?? 0);

  return query;
}

export async function getContentPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({
    post: contentPosts,
    createdBy: { id: users.id, name: users.name, role: users.role },
  })
    .from(contentPosts)
    .leftJoin(users, eq(contentPosts.createdById, users.id))
    .where(eq(contentPosts.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateContentPostStatus(
  id: number,
  status: "pending" | "approved" | "rejected" | "scheduled" | "published",
  reviewedById?: number,
  reviewComment?: string,
  editedContent?: string,
) {
  const db = await getDb();
  if (!db) return;
  const updateData: Record<string, unknown> = { status };
  if (reviewedById) updateData.reviewedById = reviewedById;
  if (reviewComment !== undefined) updateData.reviewComment = reviewComment;
  if (editedContent !== undefined) updateData.editedContent = editedContent;
  if (status === "published") updateData.publishedAt = new Date();
  await db.update(contentPosts).set(updateData).where(eq(contentPosts.id, id));
}

export async function updateContentPost(id: number, data: Partial<InsertContentPost>) {
  const db = await getDb();
  if (!db) return;
  await db.update(contentPosts).set(data).where(eq(contentPosts.id, id));
}

export async function setBlotatoPostIds(id: number, postIds: string[]) {
  const db = await getDb();
  if (!db) return;
  await db.update(contentPosts).set({ blotatoPostIds: postIds, status: "scheduled" }).where(eq(contentPosts.id, id));
}

export async function getContentPostsByDateRange(start: Date, end: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(contentPosts)
    .where(and(
      gte(contentPosts.scheduledAt, start),
      lte(contentPosts.scheduledAt, end),
    ))
    .orderBy(contentPosts.scheduledAt);
}

export async function getContentStats() {
  const db = await getDb();
  if (!db) return { pending: 0, approved: 0, rejected: 0, scheduled: 0, published: 0, total: 0 };
  const result = await db.select({
    status: contentPosts.status,
    count: sql<number>`count(*)`,
  }).from(contentPosts).groupBy(contentPosts.status);
  const stats: Record<string, number> = { pending: 0, approved: 0, rejected: 0, scheduled: 0, published: 0, total: 0 };
  for (const row of result) {
    stats[row.status] = Number(row.count);
    stats.total += Number(row.count);
  }
  return stats;
}

// ─── Approval Log Queries ───────────────────────────────────

export async function createApprovalLog(log: InsertApprovalLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(approvalLogs).values(log);
}

export async function getApprovalLogsForPost(contentPostId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    log: approvalLogs,
    user: { id: users.id, name: users.name },
  })
    .from(approvalLogs)
    .leftJoin(users, eq(approvalLogs.userId, users.id))
    .where(eq(approvalLogs.contentPostId, contentPostId))
    .orderBy(desc(approvalLogs.createdAt));
}

// ─── Content Template Queries ───────────────────────────────

export async function createContentTemplate(template: InsertContentTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contentTemplates).values(template);
  return result[0].insertId;
}

export async function getContentTemplates(category?: string) {
  const db = await getDb();
  if (!db) return [];
  if (category) {
    return db.select().from(contentTemplates).where(eq(contentTemplates.category, category)).orderBy(desc(contentTemplates.usageCount));
  }
  return db.select().from(contentTemplates).orderBy(desc(contentTemplates.usageCount));
}

export async function incrementTemplateUsage(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(contentTemplates).set({ usageCount: sql`${contentTemplates.usageCount} + 1` }).where(eq(contentTemplates.id, id));
}

export async function deleteContentTemplate(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(contentTemplates).where(eq(contentTemplates.id, id));
}

// ─── Creator Spy Queries ────────────────────────────────────

export async function createCreatorSpyReport(report: InsertCreatorSpyReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(creatorSpyReports).values(report);
  return result[0].insertId;
}

export async function getCreatorSpyReports(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(creatorSpyReports).orderBy(desc(creatorSpyReports.createdAt)).limit(limit);
}

export async function getLatestCreatorSpyReport() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(creatorSpyReports).orderBy(desc(creatorSpyReports.createdAt)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Analytics Queries ──────────────────────────────────────

export async function createAnalyticsSnapshot(snapshot: InsertAnalyticsSnapshot) {
  const db = await getDb();
  if (!db) return;
  await db.insert(analyticsSnapshots).values(snapshot);
}

export async function getAnalyticsForPost(contentPostId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(analyticsSnapshots)
    .where(eq(analyticsSnapshots.contentPostId, contentPostId))
    .orderBy(desc(analyticsSnapshots.snapshotDate));
}

export async function getAnalyticsSummary() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    platform: analyticsSnapshots.platform,
    totalLikes: sql<number>`sum(${analyticsSnapshots.likes})`,
    totalComments: sql<number>`sum(${analyticsSnapshots.comments})`,
    totalShares: sql<number>`sum(${analyticsSnapshots.shares})`,
    totalImpressions: sql<number>`sum(${analyticsSnapshots.impressions})`,
    avgEngagement: sql<string>`avg(${analyticsSnapshots.engagementRate})`,
  }).from(analyticsSnapshots).groupBy(analyticsSnapshots.platform);
}
