/*
  Warnings:

  - A unique constraint covering the columns `[user_id,workspace_id,type,period_start]` on the table `ReflectionDraft` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `period_start` to the `ReflectionDraft` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ReflectionDraft` DROP FOREIGN KEY `ReflectionDraft_user_id_fkey`;

-- DropIndex
DROP INDEX `ReflectionDraft_user_id_workspace_id_type_key` ON `ReflectionDraft`;

-- AlterTable
ALTER TABLE `ReflectionDraft` ADD COLUMN `period_start` DATE NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ReflectionDraft_user_id_workspace_id_type_period_start_key` ON `ReflectionDraft`(`user_id`, `workspace_id`, `type`, `period_start`);

-- AddForeignKey
ALTER TABLE `AIRun` ADD CONSTRAINT `AIRun_dashboard_id_fkey` FOREIGN KEY (`dashboard_id`) REFERENCES `Dashboard`(`dashboard_id`) ON DELETE SET NULL ON UPDATE CASCADE;
