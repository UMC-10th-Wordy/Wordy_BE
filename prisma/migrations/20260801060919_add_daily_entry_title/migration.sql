-- AlterTable
-- Existing rows are backfilled before enforcing NOT NULL.
ALTER TABLE `DailyEntry`
    ADD COLUMN `title` VARCHAR(255) NULL;

UPDATE `DailyEntry`
SET `title` = ''
WHERE `title` IS NULL;

ALTER TABLE `DailyEntry`
    MODIFY COLUMN `title` VARCHAR(255) NOT NULL DEFAULT '';