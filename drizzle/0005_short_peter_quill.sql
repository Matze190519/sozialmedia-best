CREATE TABLE `lr_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(128) NOT NULL,
	`price` varchar(32),
	`imageUrl` text NOT NULL,
	`description` text,
	`descriptionWA` text,
	`whatsappText` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lr_products_id` PRIMARY KEY(`id`)
);
