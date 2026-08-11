-- AlterTable
ALTER TABLE `Dashboard` ADD COLUMN `focused_tags` JSON NULL,
    ADD COLUMN `key_achievement` TEXT NULL;

-- AlterTable
ALTER TABLE `DashboardKPI` ADD COLUMN `related_achievement` TEXT NULL,
    ADD COLUMN `tag_id` CHAR(36) NULL;
