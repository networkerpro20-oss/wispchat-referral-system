-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'MXN',
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "promoActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "promoDescription" TEXT,
ADD COLUMN     "promoDisplayBanner" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "promoEndDate" TIMESTAMP(3),
ADD COLUMN     "promoInstallAmount" DECIMAL(10,2),
ADD COLUMN     "promoMonthlyAmount" DECIMAL(10,2),
ADD COLUMN     "promoName" TEXT,
ADD COLUMN     "promoStartDate" TIMESTAMP(3),
ADD COLUMN     "supportEmail" TEXT,
ADD COLUMN     "supportHours" TEXT,
ADD COLUMN     "telegramGroup" TEXT,
ADD COLUMN     "telegramUser" TEXT,
ADD COLUMN     "videoEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "videoThumbnail" TEXT,
ADD COLUMN     "videoTitle" TEXT,
ADD COLUMN     "videoUrl" TEXT,
ADD COLUMN     "whatsappMessage" TEXT,
ADD COLUMN     "whatsappNumber" TEXT,
ALTER COLUMN "installationAmount" SET DEFAULT 200.00;

-- CreateTable
CREATE TABLE "InternetPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "speed" TEXT NOT NULL,
    "speedDownload" INTEGER NOT NULL,
    "speedUpload" INTEGER,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "priceLabel" TEXT,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "badge" TEXT,
    "features" JSONB NOT NULL,
    "maxDevices" TEXT,
    "recommendedFor" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternetPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InternetPlan_slug_key" ON "InternetPlan"("slug");

-- CreateIndex
CREATE INDEX "InternetPlan_order_idx" ON "InternetPlan"("order");

-- CreateIndex
CREATE INDEX "InternetPlan_active_idx" ON "InternetPlan"("active");

-- CreateIndex
CREATE INDEX "InternetPlan_popular_idx" ON "InternetPlan"("popular");
