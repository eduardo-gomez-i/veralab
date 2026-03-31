-- CreateTable
CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `username` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `User_username_key`(`username`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
  `id` VARCHAR(191) NOT NULL,
  `patientName` VARCHAR(191) NOT NULL,
  `prosthesisType` VARCHAR(191) NOT NULL,
  `material` VARCHAR(191) NOT NULL,
  `specifications` TEXT NOT NULL,
  `deliveryDate` DATETIME(3) NOT NULL,
  `status` VARCHAR(191) NOT NULL,
  `notes` TEXT NULL,
  `priority` VARCHAR(191) NOT NULL,
  `attachmentUrl` VARCHAR(191) NULL,
  `totalPrice` DECIMAL(10, 2) NULL,
  `estimatedDeliveryDate` DATETIME(3) NULL,
  `dentistId` VARCHAR(191) NOT NULL,
  `dentistName` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `Order_dentistId_idx`(`dentistId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `paidAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `receiptUrl` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `Payment_orderId_idx`(`orderId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Visit` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `date` DATETIME(3) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `notes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable (implicit many-to-many)
CREATE TABLE `_DentistVisits` (
  `A` VARCHAR(191) NOT NULL,
  `B` INTEGER NOT NULL,

  UNIQUE INDEX `_DentistVisits_AB_unique`(`A`, `B`),
  INDEX `_DentistVisits_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order`
  ADD CONSTRAINT `Order_dentistId_fkey`
  FOREIGN KEY (`dentistId`) REFERENCES `User`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment`
  ADD CONSTRAINT `Payment_orderId_fkey`
  FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DentistVisits`
  ADD CONSTRAINT `_DentistVisits_A_fkey`
  FOREIGN KEY (`A`) REFERENCES `User`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DentistVisits`
  ADD CONSTRAINT `_DentistVisits_B_fkey`
  FOREIGN KEY (`B`) REFERENCES `Visit`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

