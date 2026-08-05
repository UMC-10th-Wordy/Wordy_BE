-- AlterTable
ALTER TABLE `Dashboardtaganalysis` ADD COLUMN `insight` TEXT NULL;

-- AlterTable
ALTER TABLE `Reflectionsnapshot` ADD COLUMN `status` ENUM('PROCESSING', 'TEMP', 'SAVED', 'FAILED') NOT NULL DEFAULT 'TEMP';
