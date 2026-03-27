CREATE TABLE `ab_test_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`variantAId` int NOT NULL,
	`variantBId` int NOT NULL,
	`winner` varchar(2),
	`winnerReason` text,
	`status` enum('running','completed','cancelled') NOT NULL DEFAULT 'running',
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `ab_test_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_library` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(64) NOT NULL,
	`pillar` varchar(128),
	`textContent` text,
	`imageUrl` text,
	`videoUrl` text,
	`platforms` json,
	`tags` json,
	`copyCount` int NOT NULL DEFAULT 0,
	`createdById` int NOT NULL,
	`sourcePostId` int,
	`personalizationHints` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `content_library_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `optimal_posting_times` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` varchar(32) NOT NULL,
	`dayOfWeek` int NOT NULL,
	`bestHour` int NOT NULL,
	`avgEngagement` varchar(16),
	`sampleSize` int DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `optimal_posting_times_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `content_posts` ADD `abTestVariant` varchar(2);--> statement-breakpoint
ALTER TABLE `content_posts` ADD `abTestGroupId` int;--> statement-breakpoint
ALTER TABLE `content_posts` ADD `sharedToLibrary` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `content_posts` ADD `personalizationNotes` text;--> statement-breakpoint
ALTER TABLE `content_posts` ADD `qualityScore` int;--> statement-breakpoint
ALTER TABLE `content_posts` ADD `feedbackScore` int;--> statement-breakpoint
ALTER TABLE `content_posts` ADD `successFactors` json;--> statement-breakpoint
ALTER TABLE `content_templates` ADD `mediaUrl` text;--> statement-breakpoint
ALTER TABLE `content_templates` ADD `videoUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `blotatoApiKey` text;--> statement-breakpoint
ALTER TABLE `users` ADD `autoPostEnabled` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `preferredPostingTimes` json;--> statement-breakpoint
ALTER TABLE `users` ADD `personalBranding` json;