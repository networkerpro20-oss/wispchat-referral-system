-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'DOCUMENTS_UPLOADED', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'INSTALLED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('INE', 'PROOF_ADDRESS', 'CONTRACT', 'OTHER');

-- CreateEnum
CREATE TYPE "InstallationStatus" AS ENUM ('PENDING', 'SCHEDULED', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('INSTALLATION', 'MONTHLY');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'EARNED', 'APPLIED', 'PAID', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "ReferralSettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tenantDomain" TEXT NOT NULL,
    "installationCommission" DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    "monthlyCommission" DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    "commissionMonths" INTEGER NOT NULL DEFAULT 6,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "requireDocuments" BOOLEAN NOT NULL DEFAULT true,
    "autoApplyToInvoice" BOOLEAN NOT NULL DEFAULT true,
    "minInstallationDays" INTEGER NOT NULL DEFAULT 30,
    "companyName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referrerName" TEXT NOT NULL,
    "referrerEmail" TEXT NOT NULL,
    "referrerPhone" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "notes" TEXT,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "shareUrl" TEXT NOT NULL,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "lastClickAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Installation" (
    "id" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3),
    "installedDate" TIMESTAMP(3),
    "installedBy" TEXT,
    "installerNotes" TEXT,
    "clientId" TEXT,
    "wispHubClientId" TEXT,
    "status" "InstallationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Installation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commission" (
    "id" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "type" "CommissionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentNumber" INTEGER,
    "paymentDate" TIMESTAMP(3),
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "appliedToInvoice" BOOLEAN NOT NULL DEFAULT false,
    "invoiceId" TEXT,
    "appliedDate" TIMESTAMP(3),
    "appliedAmount" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReferralSettings_tenantId_key" ON "ReferralSettings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralSettings_tenantDomain_key" ON "ReferralSettings"("tenantDomain");

-- CreateIndex
CREATE INDEX "ReferralSettings_tenantId_idx" ON "ReferralSettings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_shareUrl_key" ON "Referral"("shareUrl");

-- CreateIndex
CREATE INDEX "Referral_tenantId_idx" ON "Referral"("tenantId");

-- CreateIndex
CREATE INDEX "Referral_referrerId_idx" ON "Referral"("referrerId");

-- CreateIndex
CREATE INDEX "Referral_status_idx" ON "Referral"("status");

-- CreateIndex
CREATE INDEX "Referral_shareUrl_idx" ON "Referral"("shareUrl");

-- CreateIndex
CREATE INDEX "Document_referralId_idx" ON "Document"("referralId");

-- CreateIndex
CREATE UNIQUE INDEX "Installation_referralId_key" ON "Installation"("referralId");

-- CreateIndex
CREATE INDEX "Installation_referralId_idx" ON "Installation"("referralId");

-- CreateIndex
CREATE INDEX "Installation_status_idx" ON "Installation"("status");

-- CreateIndex
CREATE INDEX "Commission_referralId_idx" ON "Commission"("referralId");

-- CreateIndex
CREATE INDEX "Commission_status_idx" ON "Commission"("status");

-- CreateIndex
CREATE INDEX "Commission_type_idx" ON "Commission"("type");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "Referral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Installation" ADD CONSTRAINT "Installation_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "Referral"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "Referral"("id") ON DELETE CASCADE ON UPDATE CASCADE;
