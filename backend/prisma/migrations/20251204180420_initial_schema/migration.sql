/*
  Warnings:

  - The values [PENDING,PAID,EXPIRED] on the enum `CommissionStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [DOCUMENTS_UPLOADED,IN_REVIEW,APPROVED,SCHEDULED,CANCELLED] on the enum `ReferralStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `appliedAmount` on the `Commission` table. All the data in the column will be lost.
  - You are about to drop the column `appliedDate` on the `Commission` table. All the data in the column will be lost.
  - You are about to drop the column `appliedToInvoice` on the `Commission` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceId` on the `Commission` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Commission` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDate` on the `Commission` table. All the data in the column will be lost.
  - You are about to drop the column `paymentNumber` on the `Commission` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Referral` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Referral` table. All the data in the column will be lost.
  - You are about to drop the column `clickCount` on the `Referral` table. All the data in the column will be lost.
  - You are about to drop the column `lastClickAt` on the `Referral` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Referral` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Referral` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Referral` table. All the data in the column will be lost.
  - You are about to drop the column `referrerEmail` on the `Referral` table. All the data in the column will be lost.
  - You are about to drop the column `referrerId` on the `Referral` table. All the data in the column will be lost.
  - You are about to drop the column `referrerName` on the `Referral` table. All the data in the column will be lost.
  - You are about to drop the column `referrerPhone` on the `Referral` table. All the data in the column will be lost.
  - You are about to drop the column `rejectionReason` on the `Referral` table. All the data in the column will be lost.
  - You are about to drop the column `shareUrl` on the `Referral` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Referral` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `Referral` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `Referral` table. All the data in the column will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Installation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReferralSettings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `clientId` to the `Commission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `Referral` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Referral` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefono` to the `Referral` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CommissionStatus_new" AS ENUM ('EARNED', 'APPLIED', 'CANCELLED');
ALTER TABLE "Commission" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Commission" ALTER COLUMN "status" TYPE "CommissionStatus_new" USING ("status"::text::"CommissionStatus_new");
ALTER TYPE "CommissionStatus" RENAME TO "CommissionStatus_old";
ALTER TYPE "CommissionStatus_new" RENAME TO "CommissionStatus";
DROP TYPE "CommissionStatus_old";
ALTER TABLE "Commission" ALTER COLUMN "status" SET DEFAULT 'EARNED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ReferralStatus_new" AS ENUM ('PENDING', 'CONTACTED', 'INSTALLED', 'REJECTED');
ALTER TABLE "Referral" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Referral" ALTER COLUMN "status" TYPE "ReferralStatus_new" USING ("status"::text::"ReferralStatus_new");
ALTER TYPE "ReferralStatus" RENAME TO "ReferralStatus_old";
ALTER TYPE "ReferralStatus_new" RENAME TO "ReferralStatus";
DROP TYPE "ReferralStatus_old";
ALTER TABLE "Referral" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_referralId_fkey";

-- DropForeignKey
ALTER TABLE "Installation" DROP CONSTRAINT "Installation_referralId_fkey";

-- DropIndex
DROP INDEX "Referral_referrerId_idx";

-- DropIndex
DROP INDEX "Referral_shareUrl_idx";

-- DropIndex
DROP INDEX "Referral_shareUrl_key";

-- DropIndex
DROP INDEX "Referral_tenantId_idx";

-- AlterTable
ALTER TABLE "Commission" DROP COLUMN "appliedAmount",
DROP COLUMN "appliedDate",
DROP COLUMN "appliedToInvoice",
DROP COLUMN "invoiceId",
DROP COLUMN "notes",
DROP COLUMN "paymentDate",
DROP COLUMN "paymentNumber",
ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "monthDate" TIMESTAMP(3),
ADD COLUMN     "monthNumber" INTEGER,
ADD COLUMN     "notas" TEXT,
ALTER COLUMN "status" SET DEFAULT 'EARNED';

-- AlterTable
ALTER TABLE "Referral" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "clickCount",
DROP COLUMN "lastClickAt",
DROP COLUMN "name",
DROP COLUMN "notes",
DROP COLUMN "phone",
DROP COLUMN "referrerEmail",
DROP COLUMN "referrerId",
DROP COLUMN "referrerName",
DROP COLUMN "referrerPhone",
DROP COLUMN "rejectionReason",
DROP COLUMN "shareUrl",
DROP COLUMN "state",
DROP COLUMN "tenantId",
DROP COLUMN "zipCode",
ADD COLUMN     "ciudad" TEXT,
ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "codigoPostal" TEXT,
ADD COLUMN     "colonia" TEXT,
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "fechaContacto" TIMESTAMP(3),
ADD COLUMN     "fechaInstalacion" TIMESTAMP(3),
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "notas" TEXT,
ADD COLUMN     "telefono" TEXT NOT NULL,
ADD COLUMN     "tipoServicio" TEXT,
ADD COLUMN     "velocidad" TEXT,
ADD COLUMN     "wispHubClientId" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "Installation";

-- DropTable
DROP TABLE "ReferralSettings";

-- DropEnum
DROP TYPE "DocumentType";

-- DropEnum
DROP TYPE "InstallationStatus";

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "wispHubClientId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "referralCode" TEXT NOT NULL,
    "shareUrl" TEXT NOT NULL,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalApplied" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionApplication" (
    "id" TEXT NOT NULL,
    "commissionId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "wispHubInvoiceId" TEXT NOT NULL,
    "invoiceMonth" TEXT NOT NULL,
    "invoiceAmount" DECIMAL(10,2) NOT NULL,
    "appliedBy" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,

    CONSTRAINT "CommissionApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "installationAmount" DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    "monthlyAmount" DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    "monthsToEarn" INTEGER NOT NULL DEFAULT 6,
    "wispHubUrl" TEXT,
    "wispHubApiKey" TEXT,
    "notificationEmail" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_wispHubClientId_key" ON "Client"("wispHubClientId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_referralCode_key" ON "Client"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "Client_shareUrl_key" ON "Client"("shareUrl");

-- CreateIndex
CREATE INDEX "Client_wispHubClientId_idx" ON "Client"("wispHubClientId");

-- CreateIndex
CREATE INDEX "Client_referralCode_idx" ON "Client"("referralCode");

-- CreateIndex
CREATE INDEX "CommissionApplication_commissionId_idx" ON "CommissionApplication"("commissionId");

-- CreateIndex
CREATE INDEX "Commission_clientId_idx" ON "Commission"("clientId");

-- CreateIndex
CREATE INDEX "Referral_clientId_idx" ON "Referral"("clientId");

-- CreateIndex
CREATE INDEX "Referral_wispHubClientId_idx" ON "Referral"("wispHubClientId");

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionApplication" ADD CONSTRAINT "CommissionApplication_commissionId_fkey" FOREIGN KEY ("commissionId") REFERENCES "Commission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
