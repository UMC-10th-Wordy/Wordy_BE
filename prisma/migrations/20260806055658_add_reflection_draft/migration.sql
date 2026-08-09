-- CreateTable
CREATE TABLE `ReflectionDraft` (
    `reflection_draft_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `type` ENUM('WEEKLY', 'MONTHLY') NOT NULL,
    `work_summary` TEXT NULL,
    `resources_used` TEXT NULL,
    `learning` TEXT NULL,
    `task_plans` JSON NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `ReflectionDraft_user_id_idx`(`user_id`),
    UNIQUE INDEX `ReflectionDraft_user_id_type_key`(`user_id`, `type`),
    PRIMARY KEY (`reflection_draft_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReflectionDraft` ADD CONSTRAINT `ReflectionDraft_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
