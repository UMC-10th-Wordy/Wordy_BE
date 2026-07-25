/*
  Warnings:

  - Added the required column `daily_entry_id` to the `DailyPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `DailyPerformance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `dailyperformance` ADD COLUMN `daily_entry_id` CHAR(36) NOT NULL,
    ADD COLUMN `userId` CHAR(36) NOT NULL;

-- CreateIndex
CREATE INDEX `DailyPerformance_userId_idx` ON `DailyPerformance`(`userId`);

-- CreateIndex
CREATE INDEX `DailyPerformance_daily_entry_id_idx` ON `DailyPerformance`(`daily_entry_id`);

-- AddForeignKey
ALTER TABLE `DailyPerformance` ADD CONSTRAINT `DailyPerformance_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyPerformance` ADD CONSTRAINT `DailyPerformance_daily_entry_id_fkey` FOREIGN KEY (`daily_entry_id`) REFERENCES `DailyEntry`(`daily_entry_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
