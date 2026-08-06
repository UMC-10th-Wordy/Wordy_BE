-- AlterTable
ALTER TABLE `Dashboardtaganalysis` ADD COLUMN `color` VARCHAR(20) NULL,
    ADD COLUMN `tag_id` CHAR(36) NULL,
    ADD COLUMN `tag_name` VARCHAR(30) NULL;
