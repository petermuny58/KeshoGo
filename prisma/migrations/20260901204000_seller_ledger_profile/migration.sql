-- AlterTable
ALTER TABLE "Store" ADD COLUMN "pacraNumber" TEXT,
ADD COLUMN "tpin" TEXT,
ADD COLUMN "payoutPhone" TEXT,
ADD COLUMN "payoutMethod" "PaymentMethod";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN "sellerReply" TEXT,
ADD COLUMN "repliedAt" TIMESTAMP(3);

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('SALE', 'COMMISSION', 'PAYOUT', 'REFUND');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('ACCRUING', 'PROCESSING', 'PAID');

-- CreateTable
CREATE TABLE "SellerLedgerEntry" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "orderItemId" TEXT,
    "type" "LedgerEntryType" NOT NULL,
    "amountNgwee" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "payoutStatus" "PayoutStatus" NOT NULL DEFAULT 'ACCRUING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SellerLedgerEntry_storeId_idx" ON "SellerLedgerEntry"("storeId");

-- CreateIndex
CREATE INDEX "SellerLedgerEntry_createdAt_idx" ON "SellerLedgerEntry"("createdAt");

-- AddForeignKey
ALTER TABLE "SellerLedgerEntry" ADD CONSTRAINT "SellerLedgerEntry_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerLedgerEntry" ADD CONSTRAINT "SellerLedgerEntry_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
