CREATE TABLE `evergreen_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`originalPostId` int NOT NULL,
	`recycleAfterDays` int NOT NULL DEFAULT 30,
	`recycleCount` int NOT NULL DEFAULT 0,
	`maxRecycles` int NOT NULL DEFAULT 3,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastRecycledAt` timestamp,
	`nextRecycleAt` timestamp,
	`qualifyingScore` int DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evergreen_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monthly_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`planData` json,
	`summary` text,
	`postsCreated` int DEFAULT 0,
	`totalPosts` int DEFAULT 0,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `monthly_plans_id` PRIMARY KEY(`id`)
);
