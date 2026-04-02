CREATE TABLE `invite_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(128) NOT NULL,
	`partnerNumber` varchar(32),
	`name` varchar(255),
	`whatsappNumber` varchar(32),
	`used` boolean NOT NULL DEFAULT false,
	`usedByUserId` int,
	`usedAt` timestamp,
	`expiresAt` timestamp,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invite_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `invite_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `team_activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`actionType` enum('content_created','content_approved','content_rejected','content_published','content_edited','image_generated','video_generated','template_created','library_shared','trend_scanned','carousel_created','login','joined') NOT NULL,
	`description` text,
	`contentPostId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `team_activity_log_id` PRIMARY KEY(`id`)
);
