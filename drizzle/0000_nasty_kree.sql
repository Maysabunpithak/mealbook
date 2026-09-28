CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`mealId` text NOT NULL,
	`parentId` text,
	`author` text NOT NULL,
	`body` text NOT NULL,
	`createdAt` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `comments_meal_created` ON `comments` (`mealId`,`createdAt`);