-- CreateTable
CREATE TABLE `Notification` (
    `notification_id` CHAR(36) NOT NULL,
    `type` ENUM('MARKETING_PROMOTION', 'DASHBOARD_COMPLETED', 'DASHBOARD_INDUCE') NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `content` TEXT NOT NULL,
    `redirect_url` VARCHAR(500) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `read_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `user_id` CHAR(36) NOT NULL,

    INDEX `Notification_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`notification_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
