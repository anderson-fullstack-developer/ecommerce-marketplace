-- CreateEnum
CREATE TYPE "ProductApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "approvalStatus" "ProductApprovalStatus" NOT NULL DEFAULT 'APPROVED';

