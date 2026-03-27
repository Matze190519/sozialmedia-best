ALTER TABLE `content_posts` ADD `videoUrl` text;--> statement-breakpoint
ALTER TABLE `content_posts` ADD `mediaType` varchar(32) DEFAULT 'none';--> statement-breakpoint
ALTER TABLE `content_posts` ADD `imagePrompt` text;--> statement-breakpoint
ALTER TABLE `content_posts` ADD `videoPrompt` text;