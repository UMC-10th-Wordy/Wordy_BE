/*
  Warnings:

  - You are about to drop the column `userId` on the `dailyperformance` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `DailyPerformance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `DailyPerformance` DROP FOREIGN KEY `DailyPerformance_userId_fkey`;

-- DropIndex
DROP INDEX `DailyPerformance_userId_idx` ON `DailyPerformance`;

-- AlterTable
ALTER TABLE `DailyPerformance` DROP COLUMN `userId`,
    ADD COLUMN `user_id` CHAR(36) NOT NULL;

-- CreateIndex
CREATE INDEX `DailyPerformance_user_id_idx` ON `DailyPerformance`(`user_id`);

-- AddForeignKey
ALTER TABLE `DailyPerformance` ADD CONSTRAINT `DailyPerformance_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
