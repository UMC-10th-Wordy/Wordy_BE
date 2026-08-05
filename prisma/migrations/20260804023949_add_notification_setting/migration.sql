-- CreateTable
CREATE TABLE `NotificationSetting` (
    `notification_setting_id` CHAR(36) NOT NULL,
    `type` ENUM('MARKETING_PROMOTION', 'DASHBOARD_COMPLETED', 'DASHBOARD_INDUCE') NOT NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `user_id` CHAR(36) NOT NULL,

    UNIQUE INDEX `NotificationSetting_user_id_type_key`(`user_id`, `type`),
    PRIMARY KEY (`notification_setting_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NotificationSetting` ADD CONSTRAINT `NotificationSetting_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
