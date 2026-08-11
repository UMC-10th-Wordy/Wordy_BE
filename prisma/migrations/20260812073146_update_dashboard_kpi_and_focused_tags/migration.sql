-- AlterTable
ALTER TABLE `dashboard` ADD COLUMN `focused_tags` JSON NULL,
    ADD COLUMN `key_achievement` TEXT NULL;

-- AlterTable
ALTER TABLE `dashboardkpi` ADD COLUMN `related_achievement` TEXT NULL,
    ADD COLUMN `tag_id` CHAR(36) NULL;
