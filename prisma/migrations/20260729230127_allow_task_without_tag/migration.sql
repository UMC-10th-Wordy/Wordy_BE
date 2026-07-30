-- DropForeignKey
ALTER TABLE `Task` DROP FOREIGN KEY `Task_tag_id_fkey`;

-- AlterTable
ALTER TABLE `Task` MODIFY `tag_id` CHAR(36) NULL;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_tag_id_fkey`
FOREIGN KEY (`tag_id`) REFERENCES `Tag`(`tag_id`)
ON DELETE SET NULL ON UPDATE CASCADE;