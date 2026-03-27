CREATE TABLE `analytics_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentPostId` int,
	`platform` varchar(32) NOT NULL,
	`likes` int DEFAULT 0,
	`comments` int DEFAULT 0,
	`shares` int DEFAULT 0,
	`impressions` int DEFAULT 0,
	`reach` int DEFAULT 0,
	`engagementRate` varchar(16),
	`snapshotDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approval_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentPostId` int NOT NULL,
	`userId` int NOT NULL,
	`action` enum('approved','rejected','edited','scheduled','published') NOT NULL,
	`comment` text,
	`previousStatus` varchar(32),
	`newStatus` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `approval_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdById` int NOT NULL,
	`contentType` varchar(32) NOT NULL,
	`content` text NOT NULL,
	`platforms` json NOT NULL,
	`status` enum('pending','approved','rejected','scheduled','published') NOT NULL DEFAULT 'pending',
	`reviewedById` int,
	`reviewComment` text,
	`scheduledAt` timestamp,
	`publishedAt` timestamp,
	`apiMetadata` json,
	`blotatoPostIds` json,
	`mediaUrl` text,
	`topic` varchar(255),
	`pillar` varchar(128),
	`editedContent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `content_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(64) NOT NULL,
	`content` text NOT NULL,
	`platforms` json,
	`usageCount` int NOT NULL DEFAULT 0,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `content_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creator_spy_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weekNumber` int NOT NULL,
	`year` int NOT NULL,
	`reportContent` text NOT NULL,
	`topHooks` json,
	`contentIdeas` json,
	`trendWarnings` text,
	`postsAnalyzed` int DEFAULT 0,
	`hashtags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `creator_spy_reports_id` PRIMARY KEY(`id`)
);
