-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_resetToken_key" ON "Customer"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_resetToken_key" ON "Vendor"("resetToken");

