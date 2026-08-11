-- AddForeignKey
ALTER TABLE `DailyEntry` ADD CONSTRAINT `DailyEntry_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReflectionDraft` ADD CONSTRAINT `ReflectionDraft_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
