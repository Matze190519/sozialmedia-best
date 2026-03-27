ALTER TABLE `users` ADD `partnerNumber` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `phoneNumber` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `isApproved` boolean DEFAULT false;