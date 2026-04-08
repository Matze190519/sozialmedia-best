ALTER TABLE `content_posts` ADD `isInternal` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `content_posts` ADD `internalCategory` varchar(64);