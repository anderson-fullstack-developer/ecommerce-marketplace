-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "password" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

