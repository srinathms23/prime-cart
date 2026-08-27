CREATE TABLE `inventory_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brand` varchar(120) NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(96) NOT NULL,
	`price` int NOT NULL,
	`originalPrice` int NOT NULL,
	`offer` varchar(64) NOT NULL,
	`delivery` varchar(128) NOT NULL,
	`image` text NOT NULL,
	`imageSourceUrl` text,
	`tone` varchar(64) NOT NULL,
	`popularity` int NOT NULL DEFAULT 0,
	`badge` varchar(64),
	`colorsJson` text NOT NULL,
	`specificationsJson` text NOT NULL,
	`stockQuantity` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_products_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_product_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(96) NOT NULL,
	`image` text NOT NULL,
	`unitPrice` int NOT NULL,
	`quantity` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(48) NOT NULL,
	`userId` int NOT NULL,
	`stripeSessionId` varchar(255),
	`status` enum('pending','paid','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`paymentStatus` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`subtotal` int NOT NULL,
	`shipping` int NOT NULL DEFAULT 0,
	`total` int NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'INR',
	`shippingJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `order_number_unique` UNIQUE(`orderNumber`),
	CONSTRAINT `order_stripe_session_unique` UNIQUE(`stripeSessionId`)
);
--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;