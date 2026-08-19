-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `workspace_id` CHAR(36) NULL;

-- CreateIndex
CREATE INDEX `Notification_workspace_id_created_at_idx` ON `Notification`(`workspace_id`, `created_at`);

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_workspace_id_fkey` FOREIGN KEY (`workspace_id`) REFERENCES `Workspace`(`workspace_id`) ON DELETE SET NULL ON UPDATE CASCADE;
