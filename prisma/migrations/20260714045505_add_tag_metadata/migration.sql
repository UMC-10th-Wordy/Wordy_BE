/*
  Warnings:

  - Added the required column `updated_at` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tag` ADD COLUMN `color` VARCHAR(20) NULL,
    ADD COLUMN `expected_end_date` DATE NULL,
    ADD COLUMN `expected_outcome` TEXT NULL,
    ADD COLUMN `expected_start_date` DATE NULL,
    ADD COLUMN `kpis` JSON NULL,
    ADD COLUMN `project_name` VARCHAR(100) NULL,
    ADD COLUMN `project_purpose` TEXT NULL,
    ADD COLUMN `updated_at` DATETIME(0) NOT NULL;

-- CreateIndex
CREATE INDEX `Tag_user_id_deleted_at_idx` ON `Tag`(`user_id`, `deleted_at`);

-- CreateIndex
CREATE INDEX `Tag_user_id_expected_start_date_expected_end_date_idx` ON `Tag`(`user_id`, `expected_start_date`, `expected_end_date`);
