-- AlterTable
ALTER TABLE `User` ADD COLUMN `email` VARCHAR(191) NULL,
                   ADD COLUMN `verified` BOOLEAN NOT NULL DEFAULT false;
