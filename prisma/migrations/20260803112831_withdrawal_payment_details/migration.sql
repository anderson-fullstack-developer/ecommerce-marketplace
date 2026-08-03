-- CreateEnum
CREATE TYPE "WithdrawalPaymentMethod" AS ENUM ('IBAN', 'MBWAY');

-- AlterTable
ALTER TABLE "WithdrawalRequest" ADD COLUMN     "paymentDetails" TEXT,
ADD COLUMN     "paymentMethod" "WithdrawalPaymentMethod";
