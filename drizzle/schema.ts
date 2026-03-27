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
  /** LR Partnernummer - identifiziert den Partner eindeutig */
  partnerNumber: varchar("partnerNumber", { length: 32 }),
  /** Telefonnummer (WhatsApp) - für Lina-Integration */
  phoneNumber: varchar("phoneNumber", { length: 32 }),
  /** Ob der Partner freigeschaltet ist (Admin muss manuell freischalten) */
  isApproved: boolean("isApproved").default(false),
  /** Personal Blotato API key (encrypted) - each team member can have their own */
  blotatoApiKey: text("blotatoApiKey"),
  /** Whether auto-post after approval is enabled for this user */
  autoPostEnabled: boolean("autoPostEnabled").default(false),
  /** User's preferred posting times as JSON: { "instagram": "09:00", "tiktok": "18:00", ... } */
  preferredPostingTimes: json("preferredPostingTimes").$type<Record<string, string>>(),
  /** Personal brand additions (own hashtags, signature, etc.) */
  personalBranding: json("personalBranding").$type<{
    signature?: string;
    hashtags?: string[];
    ownIntro?: string;
    customCTA?: string;
  }>(),
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
  createdById: int("createdById").notNull(),
  contentType: varchar("contentType", { length: 32 }).notNull(),
  content: text("content").notNull(),
  platforms: json("platforms").$type<string[]>().notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "scheduled", "published"]).default("pending").notNull(),
  reviewedById: int("reviewedById"),
  reviewComment: text("reviewComment"),
  scheduledAt: timestamp("scheduledAt"),
  publishedAt: timestamp("publishedAt"),
  apiMetadata: json("apiMetadata").$type<Record<string, unknown>>(),
  blotatoPostIds: json("blotatoPostIds").$type<string[]>(),
  mediaUrl: text("mediaUrl"),
  videoUrl: text("videoUrl"),
  mediaType: varchar("mediaType", { length: 32 }).default("none"),
  imagePrompt: text("imagePrompt"),
  videoPrompt: text("videoPrompt"),
  topic: varchar("topic", { length: 255 }),
  pillar: varchar("pillar", { length: 128 }),
  editedContent: text("editedContent"),
  /** A/B test variant: null = normal post, "A" or "B" = test variant */
  abTestVariant: varchar("abTestVariant", { length: 2 }),
  /** A/B test group ID - links A and B variants together */
  abTestGroupId: int("abTestGroupId"),
  /** Whether this post is shared to the content library for all team members */
  sharedToLibrary: boolean("sharedToLibrary").default(false),
  /** Personalization notes from the creator */
  personalizationNotes: text("personalizationNotes"),
  /** Quality Gate score (0-100) */
  qualityScore: int("qualityScore"),
  /** Feedback score from actual performance (0-100) */
  feedbackScore: int("feedbackScore"),
  /** What made this post successful (auto-analyzed) */
  successFactors: json("successFactors").$type<string[]>(),
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
  category: varchar("category", { length: 64 }).notNull(),
  content: text("content").notNull(),
  platforms: json("platforms").$type<string[]>(),
  usageCount: int("usageCount").default(0).notNull(),
  /** Media attached to template */
  mediaUrl: text("mediaUrl"),
  videoUrl: text("videoUrl"),
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
  weekNumber: int("weekNumber").notNull(),
  year: int("year").notNull(),
  reportContent: text("reportContent").notNull(),
  topHooks: json("topHooks").$type<string[]>(),
  contentIdeas: json("contentIdeas").$type<string[]>(),
  trendWarnings: text("trendWarnings"),
  postsAnalyzed: int("postsAnalyzed").default(0),
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

/**
 * Content Library - shared media and content for all team members to copy/use.
 * This is the "Datenbank für alle" where everyone can grab content.
 */
export const contentLibrary = mysqlTable("content_library", {
  id: int("id").autoincrement().primaryKey(),
  /** Title for easy browsing */
  title: varchar("title", { length: 255 }).notNull(),
  /** Category: image, video, text, template, reel_script */
  category: varchar("category", { length: 64 }).notNull(),
  /** Content pillar */
  pillar: varchar("pillar", { length: 128 }),
  /** Text content (caption, script, etc.) */
  textContent: text("textContent"),
  /** Image URL (S3) */
  imageUrl: text("imageUrl"),
  /** Video URL (S3) */
  videoUrl: text("videoUrl"),
  /** Target platforms */
  platforms: json("platforms").$type<string[]>(),
  /** Tags for search */
  tags: json("tags").$type<string[]>(),
  /** How many times this was copied/used by team members */
  copyCount: int("copyCount").default(0).notNull(),
  /** Who uploaded/created this */
  createdById: int("createdById").notNull(),
  /** Original content post ID (if derived from an approved post) */
  sourcePostId: int("sourcePostId"),
  /** Personalization hints: what to change when using this */
  personalizationHints: text("personalizationHints"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContentLibraryItem = typeof contentLibrary.$inferSelect;
export type InsertContentLibraryItem = typeof contentLibrary.$inferInsert;

/**
 * A/B Test groups - links two content variants for comparison.
 */
export const abTestGroups = mysqlTable("ab_test_groups", {
  id: int("id").autoincrement().primaryKey(),
  /** Name/description of the test */
  name: varchar("name", { length: 255 }).notNull(),
  /** Post ID for variant A */
  variantAId: int("variantAId").notNull(),
  /** Post ID for variant B */
  variantBId: int("variantBId").notNull(),
  /** Winner: null = ongoing, "A" or "B" = decided */
  winner: varchar("winner", { length: 2 }),
  /** Why this variant won (auto-analyzed) */
  winnerReason: text("winnerReason"),
  /** Test status */
  status: mysqlEnum("status", ["running", "completed", "cancelled"]).default("running").notNull(),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type ABTestGroup = typeof abTestGroups.$inferSelect;
export type InsertABTestGroup = typeof abTestGroups.$inferInsert;

/**
 * Optimal posting times - learned from engagement data per platform.
 */
export const optimalPostingTimes = mysqlTable("optimal_posting_times", {
  id: int("id").autoincrement().primaryKey(),
  platform: varchar("platform", { length: 32 }).notNull(),
  /** Day of week: 0=Sunday, 1=Monday, ... 6=Saturday */
  dayOfWeek: int("dayOfWeek").notNull(),
  /** Best hour to post (0-23) */
  bestHour: int("bestHour").notNull(),
  /** Average engagement rate at this time */
  avgEngagement: varchar("avgEngagement", { length: 16 }),
  /** Based on how many data points */
  sampleSize: int("sampleSize").default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OptimalPostingTime = typeof optimalPostingTimes.$inferSelect;
export type InsertOptimalPostingTime = typeof optimalPostingTimes.$inferInsert;

/**
 * LR Products - imported from Botpress ProductTable (Lina's database).
 * Contains all 226+ LR products with original product images from mhware.de.
 */
export const lrProducts = mysqlTable("lr_products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 128 }).notNull(),
  price: varchar("price", { length: 32 }),
  imageUrl: text("imageUrl").notNull(),
  description: text("description"),
  descriptionWA: text("descriptionWA"),
  whatsappText: text("whatsappText"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LRProduct = typeof lrProducts.$inferSelect;
export type InsertLRProduct = typeof lrProducts.$inferInsert;

/**
 * Trend Scans - live viral trend data from TikTok, YouTube, Reddit.
 * The Trend-Scanner automatically discovers what's going viral.
 */
export const trendScans = mysqlTable("trend_scans", {
  id: int("id").autoincrement().primaryKey(),
  /** Platform: tiktok, youtube, reddit, twitter */
  platform: varchar("platform", { length: 32 }).notNull(),
  /** Search keyword used */
  keyword: varchar("keyword", { length: 255 }).notNull(),
  /** Content pillar this trend belongs to */
  pillar: varchar("pillar", { length: 128 }),
  /** Title/description of the trending content */
  title: text("title").notNull(),
  /** URL to the original content */
  sourceUrl: text("sourceUrl"),
  /** Thumbnail/preview image */
  thumbnailUrl: text("thumbnailUrl"),
  /** Author/creator name */
  authorName: varchar("authorName", { length: 255 }),
  /** View count */
  views: int("views").default(0),
  /** Like count */
  likes: int("likes").default(0),
  /** Comment count */
  comments: int("comments").default(0),
  /** Share count */
  shares: int("shares").default(0),
  /** Calculated viral score (0-100) */
  viralScore: int("viralScore").default(0),
  /** AI-generated content idea based on this trend */
  contentIdea: text("contentIdea"),
  /** AI-generated hook based on this trend */
  suggestedHook: text("suggestedHook"),
  /** Whether a content post was created from this trend */
  usedForContent: boolean("usedForContent").default(false),
  /** Related content post ID */
  contentPostId: int("contentPostId"),
  scannedAt: timestamp("scannedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrendScan = typeof trendScans.$inferSelect;
export type InsertTrendScan = typeof trendScans.$inferInsert;
