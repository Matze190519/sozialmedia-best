import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Content posts - the core queue table.
 * Every generated piece of content lives here with its approval status.
 */
export const contentPosts = mysqlTable("content_posts", {
  id: int("id").autoincrement().primaryKey(),
  /** Who created/requested this content */
  createdById: int("createdById").notNull(),
  /** Content type: post, reel, story, hooks, ad_copy, follow_up, objection, batch */
  contentType: varchar("contentType", { length: 32 }).notNull(),
  /** The generated text content */
  content: text("content").notNull(),
  /** Platform targets as JSON array: ["instagram","facebook","tiktok",...] */
  platforms: json("platforms").$type<string[]>().notNull(),
  /** Approval status */
  status: mysqlEnum("status", ["pending", "approved", "rejected", "scheduled", "published"]).default("pending").notNull(),
  /** Optional: who approved/rejected */
  reviewedById: int("reviewedById"),
  /** Review comment (reason for rejection etc.) */
  reviewComment: text("reviewComment"),
  /** Scheduled publish date (after approval) */
  scheduledAt: timestamp("scheduledAt"),
  /** When it was actually published */
  publishedAt: timestamp("publishedAt"),
  /** GoViralBitch API response metadata as JSON */
  apiMetadata: json("apiMetadata").$type<Record<string, unknown>>(),
  /** Blotato post IDs after scheduling, as JSON */
  blotatoPostIds: json("blotatoPostIds").$type<string[]>(),
  /** Media URL if any (image) */
  mediaUrl: text("mediaUrl"),
  /** Video URL if any */
  videoUrl: text("videoUrl"),
  /** Media type: none, image, video, image_and_video */
  mediaType: varchar("mediaType", { length: 32 }).default("none"),
  /** Image generation prompt used */
  imagePrompt: text("imagePrompt"),
  /** Video generation prompt used */
  videoPrompt: text("videoPrompt"),
  /** Topic/pillar used for generation */
  topic: varchar("topic", { length: 255 }),
  /** Content pillar */
  pillar: varchar("pillar", { length: 128 }),
  /** Platform-specific text (edited version) */
  editedContent: text("editedContent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContentPost = typeof contentPosts.$inferSelect;
export type InsertContentPost = typeof contentPosts.$inferInsert;

/**
 * Approval log - tracks every review action for audit trail.
 */
export const approvalLogs = mysqlTable("approval_logs", {
  id: int("id").autoincrement().primaryKey(),
  contentPostId: int("contentPostId").notNull(),
  userId: int("userId").notNull(),
  action: mysqlEnum("action", ["approved", "rejected", "edited", "scheduled", "published"]).notNull(),
  comment: text("comment"),
  previousStatus: varchar("previousStatus", { length: 32 }),
  newStatus: varchar("newStatus", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApprovalLog = typeof approvalLogs.$inferSelect;
export type InsertApprovalLog = typeof approvalLogs.$inferInsert;

/**
 * Content templates - reusable post templates.
 */
export const contentTemplates = mysqlTable("content_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  /** Template category: autokonzept, business_opportunity, produkt_highlight, lina_demo, lifestyle */
  category: varchar("category", { length: 64 }).notNull(),
  content: text("content").notNull(),
  /** Platform targets */
  platforms: json("platforms").$type<string[]>(),
  /** Usage count */
  usageCount: int("usageCount").default(0).notNull(),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContentTemplate = typeof contentTemplates.$inferSelect;
export type InsertContentTemplate = typeof contentTemplates.$inferInsert;

/**
 * Creator Spy reports - weekly viral content analysis.
 */
export const creatorSpyReports = mysqlTable("creator_spy_reports", {
  id: int("id").autoincrement().primaryKey(),
  /** Calendar week number */
  weekNumber: int("weekNumber").notNull(),
  year: int("year").notNull(),
  /** Full analysis report text */
  reportContent: text("reportContent").notNull(),
  /** Extracted top hooks as JSON array */
  topHooks: json("topHooks").$type<string[]>(),
  /** Extracted content ideas as JSON array */
  contentIdeas: json("contentIdeas").$type<string[]>(),
  /** Trend warnings */
  trendWarnings: text("trendWarnings"),
  /** Number of posts analyzed */
  postsAnalyzed: int("postsAnalyzed").default(0),
  /** Source hashtags used */
  hashtags: json("hashtags").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreatorSpyReport = typeof creatorSpyReports.$inferSelect;
export type InsertCreatorSpyReport = typeof creatorSpyReports.$inferInsert;

/**
 * Analytics snapshots - periodic performance data.
 */
export const analyticsSnapshots = mysqlTable("analytics_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  contentPostId: int("contentPostId"),
  platform: varchar("platform", { length: 32 }).notNull(),
  likes: int("likes").default(0),
  comments: int("comments").default(0),
  shares: int("shares").default(0),
  impressions: int("impressions").default(0),
  reach: int("reach").default(0),
  engagementRate: varchar("engagementRate", { length: 16 }),
  snapshotDate: timestamp("snapshotDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsSnapshot = typeof analyticsSnapshots.$inferSelect;
export type InsertAnalyticsSnapshot = typeof analyticsSnapshots.$inferInsert;
