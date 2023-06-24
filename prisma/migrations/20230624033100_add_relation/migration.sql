-- AlterTable
ALTER TABLE `Course` ADD COLUMN `catgoryId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Tag` ADD COLUMN `courseId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_catgoryId_fkey` FOREIGN KEY (`catgoryId`) REFERENCES `Catgory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
