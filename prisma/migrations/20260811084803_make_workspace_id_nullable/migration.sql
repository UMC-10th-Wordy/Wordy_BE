/*
  Warnings:

  - A unique constraint covering the columns `[user_id,workspace_id,entry_date]` on the table `DailyEntry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,workspace_id,type]` on the table `ReflectionDraft` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `DailyEntry` DROP FOREIGN KEY `DailyEntry_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `ReflectionDraft` DROP FOREIGN KEY `ReflectionDraft_user_id_fkey`;

-- DropIndex
DROP INDEX `DailyEntry_user_id_entry_date_key` ON `DailyEntry`;

-- DropIndex
DROP INDEX `ReflectionDraft_user_id_type_key` ON `ReflectionDraft`;

-- AlterTable
ALTER TABLE `DailyEntry` ADD COLUMN `workspace_id` CHAR(36) NULL;

-- AlterTable
ALTER TABLE `DailyPerformance` ADD COLUMN `workspace_id` CHAR(36) NULL;

-- AlterTable
ALTER TABLE `Dashboard` ADD COLUMN `workspace_id` CHAR(36) NULL;

-- AlterTable
ALTER TABLE `ReflectionDraft` ADD COLUMN `workspace_id` CHAR(36) NULL;

-- AlterTable
ALTER TABLE `ReflectionSnapshot` ALTER COLUMN `updated_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Tag` ADD COLUMN `workspace_id` CHAR(36) NULL;

-- AlterTable
ALTER TABLE `Task` ADD COLUMN `workspace_id` CHAR(36) NULL;

-- CreateTable
CREATE TABLE `Workspace` (
    `workspace_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `user_id` CHAR(36) NOT NULL,

    INDEX `Workspace_user_id_idx`(`user_id`),
    PRIMARY KEY (`workspace_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `DailyEntry_workspace_id_entry_date_idx` ON `DailyEntry`(`workspace_id`, `entry_date`);

-- CreateIndex
CREATE UNIQUE INDEX `DailyEntry_user_id_workspace_id_entry_date_key` ON `DailyEntry`(`user_id`, `workspace_id`, `entry_date`);

-- CreateIndex
CREATE INDEX `DailyPerformance_workspace_id_idx` ON `DailyPerformance`(`workspace_id`);

-- CreateIndex
CREATE INDEX `Dashboard_workspace_id_idx` ON `Dashboard`(`workspace_id`);

-- CreateIndex
CREATE INDEX `ReflectionDraft_workspace_id_idx` ON `ReflectionDraft`(`workspace_id`);

-- CreateIndex
CREATE UNIQUE INDEX `ReflectionDraft_user_id_workspace_id_type_key` ON `ReflectionDraft`(`user_id`, `workspace_id`, `type`);

-- CreateIndex
CREATE INDEX `Tag_workspace_id_idx` ON `Tag`(`workspace_id`);

-- CreateIndex
CREATE INDEX `Task_workspace_id_task_date_idx` ON `Task`(`workspace_id`, `task_date`);

-- AddForeignKey
ALTER TABLE `Workspace` ADD CONSTRAINT `Workspace_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`workspace_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`workspace_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyEntry` ADD CONSTRAINT `DailyEntry_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`workspace_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyPerformance` ADD CONSTRAINT `DailyPerformance_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`workspace_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dashboard` ADD CONSTRAINT `Dashboard_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`workspace_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReflectionDraft` ADD CONSTRAINT `ReflectionDraft_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`workspace_id`) ON DELETE SET NULL ON UPDATE CASCADE;
