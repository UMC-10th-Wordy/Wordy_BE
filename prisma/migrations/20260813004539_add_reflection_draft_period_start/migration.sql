/*
  Warnings:
  - A unique constraint covering the columns `[user_id,workspace_id,type,period_start]` on the table `ReflectionDraft` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `period_start` to the `ReflectionDraft` table.
*/
-- DropIndex
DROP INDEX `ReflectionDraft_user_id_workspace_id_type_key` ON `ReflectionDraft`;

-- AlterTable: 1) nullable로 컬럼 추가
ALTER TABLE `ReflectionDraft` ADD COLUMN `period_start` DATE NULL;

-- 2) 기존 row backfill (WEEKLY: 그 주 일요일 / MONTHLY: 그 달 1일)
UPDATE `ReflectionDraft`
SET `period_start` = CASE
  WHEN `type` = 'MONTHLY'
    THEN DATE_FORMAT(`created_at`, '%Y-%m-01')
  ELSE DATE_SUB(DATE(`created_at`), INTERVAL DAYOFWEEK(`created_at`) - 1 DAY)
END
WHERE `period_start` IS NULL;

-- 3) NOT NULL로 변경
ALTER TABLE `ReflectionDraft` MODIFY COLUMN `period_start` DATE NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ReflectionDraft_user_id_workspace_id_type_period_start_key` ON `ReflectionDraft`(`user_id`, `workspace_id`, `type`, `period_start`);