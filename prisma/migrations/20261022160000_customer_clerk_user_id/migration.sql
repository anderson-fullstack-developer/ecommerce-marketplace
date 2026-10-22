-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "clerkUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_clerkUserId_key" ON "Customer"("clerkUserId");
