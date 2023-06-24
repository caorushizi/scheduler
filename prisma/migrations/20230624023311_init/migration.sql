-- CreateTable
CREATE TABLE `Course` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cid` VARCHAR(191) NOT NULL,
    `type` ENUM('FREE', 'COMBAT', 'PLAN', 'MINI') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Course_cid_key`(`cid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
