CREATE TABLE `generation_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('image','video') NOT NULL,
	`monthKey` varchar(7) NOT NULL,
	`costCents` int NOT NULL DEFAULT 0,
	`model` varchar(128),
	`durationSeconds` int,
	`contentPostId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generation_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `global_budget` (
	`id` int AUTO_INCREMENT NOT NULL,
	`monthKey` varchar(7) NOT NULL,
	`totalSpentCents` int NOT NULL DEFAULT 0,
	`limitCents` int NOT NULL DEFAULT 20000,
	`totalImages` int NOT NULL DEFAULT 0,
	`totalVideos` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `global_budget_id` PRIMARY KEY(`id`),
	CONSTRAINT `global_budget_monthKey_unique` UNIQUE(`monthKey`)
);
