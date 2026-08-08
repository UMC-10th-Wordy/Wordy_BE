-- AlterTable
ALTER TABLE `DashboardTagAnalysis` ADD COLUMN `insight` TEXT NULL;

-- AlterTable
ALTER TABLE `ReflectionSnapshot` ADD COLUMN `status` ENUM('PROCESSING', 'TEMP', 'SAVED', 'FAILED') NOT NULL DEFAULT 'TEMP';

UPDATE ReflectionSnapshot rs
INNER JOIN DailyPerformance dp
ON dp.reflection_snapshot_id = rs.reflection_snapshot_id
SET rs.status = 'SAVED';