/*
  Warnings:

  - Added the required column `updated_at` to the `ReflectionSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ReflectionSnapshot` ADD COLUMN `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Dashboard
ALTER TABLE `Dashboard` ADD COLUMN `type` ENUM('WEEKLY','MONTHLY') NOT NULL DEFAULT 'WEEKLY';