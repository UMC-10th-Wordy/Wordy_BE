/*
  Warnings:

  - Added the required column `completed_task_count` to the `DailyPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `incomplete_tasks` to the `DailyPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_task_count` to the `DailyPerformance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `dailyperformance` ADD COLUMN `completed_task_count` INTEGER NOT NULL,
    ADD COLUMN `incomplete_tasks` JSON NOT NULL,
    ADD COLUMN `total_task_count` INTEGER NOT NULL;
