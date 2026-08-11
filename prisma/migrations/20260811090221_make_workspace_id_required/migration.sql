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
ALTER TABLE `DailyEntry` DROP FOREIGN KEY `DailyEntry_workspace_id_fkey`;

-- DropForeignKey
ALTER TABLE `DailyPerformance` DROP FOREIGN KEY `DailyPerformance_workspace_id_fkey`;

-- DropForeignKey
ALTER TABLE `Dashboard` DROP FOREIGN KEY `Dashboard_workspace_id_fkey`;

-- DropForeignKey
ALTER TABLE `ReflectionDraft` DROP FOREIGN KEY `ReflectionDraft_workspace_id_fkey`;

-- DropForeignKey
ALTER TABLE `Tag` DROP FOREIGN KEY `Tag_workspace_id_fkey`;

-- DropForeignKey
ALTER TABLE `Task` DROP FOREIGN KEY `Task_workspace_id_fkey`;

-- AlterTable
ALTER TABLE `DailyEntry` MODIFY `workspace_id` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `DailyPerformance` MODIFY `workspace_id` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `Dashboard` MODIFY `workspace_id` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `ReflectionDraft` MODIFY `workspace_id` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `Tag` MODIFY `workspace_id` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `Task` MODIFY `workspace_id` CHAR(36) NOT NULL;

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
