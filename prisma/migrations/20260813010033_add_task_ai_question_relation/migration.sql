/*
  Warnings:

  - Added the required column `task_id` to the `AIQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `AIQuestion` ADD COLUMN `task_id` CHAR(36) NULL;

-- CreateIndex
CREATE INDEX `AIQuestion_task_id_idx` ON `AIQuestion`(`task_id`);

-- AddForeignKey
ALTER TABLE `AIQuestion` ADD CONSTRAINT `AIQuestion_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `Task`(`task_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
