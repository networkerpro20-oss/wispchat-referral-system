/*
  Warnings:

  - You are about to drop the column `wispHubClientId` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `wispHubInvoiceId` on the `CommissionApplication` table. All the data in the column will be lost.
  - You are about to drop the column `wispHubClientId` on the `Referral` table. All the data in the column will be lost.
  - You are about to drop the column `wispHubApiKey` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `wispHubUrl` on the `Settings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[wispChatClientId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `wispChatClientId` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wispChatInvoiceId` to the `CommissionApplication` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PAID', 'PENDING');

-- AlterEnum
ALTER TYPE "CommissionStatus" ADD VALUE 'ACTIVE';

-- DropIndex
DROP INDEX "Client_wispHubClientId_idx";

-- DropIndex
DROP INDEX "Client_wispHubClientId_key";

-- DropIndex
DROP INDEX "Referral_wispHubClientId_idx";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "wispHubClientId",
ADD COLUMN     "isPaymentCurrent" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastInvoiceDate" TIMESTAMP(3),
ADD COLUMN     "lastInvoiceStatus" "InvoiceStatus",
ADD COLUMN     "totalActive" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "wispChatClientId" TEXT NOT NULL,
ADD COLUMN     "wispChatUserId" TEXT;

-- AlterTable
ALTER TABLE "Commission" ADD COLUMN     "statusReason" TEXT;

-- AlterTable
ALTER TABLE "CommissionApplication" DROP COLUMN "wispHubInvoiceId",
ADD COLUMN     "wispChatInvoiceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Referral" DROP COLUMN "wispHubClientId",
ADD COLUMN     "lastInvoiceDate" TIMESTAMP(3),
ADD COLUMN     "lastInvoiceStatus" "InvoiceStatus",
ADD COLUMN     "wispChatClientId" TEXT;

-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "wispHubApiKey",
DROP COLUMN "wispHubUrl",
ADD COLUMN     "wispChatAdminEmail" TEXT,
ADD COLUMN     "wispChatAdminPassword" TEXT,
ADD COLUMN     "wispChatTenantDomain" TEXT NOT NULL DEFAULT 'easyaccessnet.com',
ADD COLUMN     "wispChatUrl" TEXT NOT NULL DEFAULT 'https://wispchat-backend.onrender.com';

-- CreateTable
CREATE TABLE "InvoiceUpload" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileUrl" TEXT,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalInvoices" INTEGER NOT NULL DEFAULT 0,
    "paidInvoices" INTEGER NOT NULL DEFAULT 0,
    "pendingInvoices" INTEGER NOT NULL DEFAULT 0,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "commissionsGenerated" INTEGER NOT NULL DEFAULT 0,
    "commissionsActivated" INTEGER NOT NULL DEFAULT 0,
    "uploadedBy" TEXT NOT NULL,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceRecord" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "wispChatClientId" TEXT NOT NULL,
    "wispChatInvoiceId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "InvoiceStatus" NOT NULL,
    "isReferrer" BOOLEAN NOT NULL DEFAULT false,
    "isReferral" BOOLEAN NOT NULL DEFAULT false,
    "matchedReferralId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvoiceUpload_uploadDate_idx" ON "InvoiceUpload"("uploadDate");

-- CreateIndex
CREATE INDEX "InvoiceUpload_processed_idx" ON "InvoiceUpload"("processed");

-- CreateIndex
CREATE INDEX "InvoiceRecord_uploadId_idx" ON "InvoiceRecord"("uploadId");

-- CreateIndex
CREATE INDEX "InvoiceRecord_wispChatClientId_idx" ON "InvoiceRecord"("wispChatClientId");

-- CreateIndex
CREATE INDEX "InvoiceRecord_wispChatInvoiceId_idx" ON "InvoiceRecord"("wispChatInvoiceId");

-- CreateIndex
CREATE INDEX "InvoiceRecord_status_idx" ON "InvoiceRecord"("status");

-- CreateIndex
CREATE INDEX "InvoiceRecord_matchedReferralId_idx" ON "InvoiceRecord"("matchedReferralId");

-- CreateIndex
CREATE INDEX "InvoiceRecord_isReferrer_idx" ON "InvoiceRecord"("isReferrer");

-- CreateIndex
CREATE INDEX "InvoiceRecord_isReferral_idx" ON "InvoiceRecord"("isReferral");

-- CreateIndex
CREATE UNIQUE INDEX "Client_wispChatClientId_key" ON "Client"("wispChatClientId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Client_wispChatClientId_idx" ON "Client"("wispChatClientId");

-- CreateIndex
CREATE INDEX "Client_email_idx" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Client_isPaymentCurrent_idx" ON "Client"("isPaymentCurrent");

-- CreateIndex
CREATE INDEX "CommissionApplication_wispChatInvoiceId_idx" ON "CommissionApplication"("wispChatInvoiceId");

-- CreateIndex
CREATE INDEX "Referral_email_idx" ON "Referral"("email");

-- CreateIndex
CREATE INDEX "Referral_telefono_idx" ON "Referral"("telefono");

-- CreateIndex
CREATE INDEX "Referral_wispChatClientId_idx" ON "Referral"("wispChatClientId");

-- AddForeignKey
ALTER TABLE "InvoiceRecord" ADD CONSTRAINT "InvoiceRecord_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "InvoiceUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
