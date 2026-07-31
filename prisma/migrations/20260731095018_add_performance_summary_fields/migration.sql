-- AlterTable: 기존 데이터가 있으므로 우선 nullable 컬럼으로 추가
ALTER TABLE `DailyPerformance`
  ADD COLUMN `completed_task_count` INTEGER NULL,
  ADD COLUMN `incomplete_tasks` JSON NULL,
  ADD COLUMN `total_task_count` INTEGER NULL;

-- 기존 DailyPerformance 데이터의 새 컬럼을 기본값으로 채움
UPDATE `DailyPerformance`
SET
  `completed_task_count` = 0,
  `incomplete_tasks` = JSON_ARRAY(),
  `total_task_count` = 0
WHERE
  `completed_task_count` IS NULL
  OR `incomplete_tasks` IS NULL
  OR `total_task_count` IS NULL;

-- schema.prisma와 동일하게 필수 컬럼으로 변경
ALTER TABLE `DailyPerformance`
  MODIFY `completed_task_count` INTEGER NOT NULL,
  MODIFY `incomplete_tasks` JSON NOT NULL,
  MODIFY `total_task_count` INTEGER NOT NULL;
