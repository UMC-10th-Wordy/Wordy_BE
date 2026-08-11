/*
  Warnings:

  - Made the column `workspace_id` on table `dailyentry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `workspace_id` on table `dailyperformance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `workspace_id` on table `dashboard` required. This step will fail if there are existing NULL values in that column.
  - Made the column `workspace_id` on table `reflectiondraft` required. This step will fail if there are existing NULL values in that column.
  - Made the column `workspace_id` on table `tag` required. This step will fail if there are existing NULL values in that column.
  - Made the column `workspace_id` on table `task` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `dailyentry` DROP FOREIGN KEY `DailyEntry_workspace_id_fkey`;

-- DropForeignKey
ALTER TABLE `dailyperformance` DROP FOREIGN KEY `DailyPerformance_workspace_id_fkey`;

-- DropForeignKey
ALTER TABLE `dashboard` DROP FOREIGN KEY `Dashboard_workspace_id_fkey`;

-- DropForeignKey
ALTER TABLE `reflectiondraft` DROP FOREIGN KEY `ReflectionDraft_workspace_id_fkey`;

-- DropForeignKey
ALTER TABLE `tag` DROP FOREIGN KEY `Tag_workspace_id_fkey`;

-- DropForeignKey
ALTER TABLE `task` DROP FOREIGN KEY `Task_workspace_id_fkey`;

-- AlterTable
ALTER TABLE `dailyentry` MODIFY `workspace_id` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `dailyperformance` MODIFY `workspace_id` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `dashboard` MODIFY `workspace_id` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `reflectiondraft` MODIFY `workspace_id` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `tag` MODIFY `workspace_id` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `task` MODIFY `workspace_id` CHAR(36) NOT NULL;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`workspace_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`workspace_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyEntry` ADD CONSTRAINT `DailyEntry_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyEntry` ADD CONSTRAINT `DailyEntry_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`workspace_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyPerformance` ADD CONSTRAINT `DailyPerformance_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`workspace_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dashboard` ADD CONSTRAINT `Dashboard_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`workspace_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReflectionDraft` ADD CONSTRAINT `ReflectionDraft_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReflectionDraft` ADD CONSTRAINT `ReflectionDraft_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`workspace_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
