ALTER TABLE `Order` ADD COLUMN `archivedAt` DATETIME(3) NULL;

CREATE INDEX `Order_archivedAt_idx` ON `Order`(`archivedAt`);
