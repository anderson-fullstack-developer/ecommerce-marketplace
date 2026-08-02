-- AlterTable
ALTER TABLE "Order" ADD CONSTRAINT "Order_stripePaymentId_key" UNIQUE ("stripePaymentId");
