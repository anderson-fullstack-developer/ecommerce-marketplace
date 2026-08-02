import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/lib/generated/prisma/enums";

const EARNED_STATUSES: OrderStatus[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export async function getVendorBalance(vendorId: string) {
  const [earningsResult, reservedResult] = await Promise.all([
    prisma.orderItem.aggregate({
      where: {
        vendorId,
        order: { status: { in: EARNED_STATUSES } },
      },
      _sum: { vendorAmount: true },
    }),
    prisma.withdrawalRequest.aggregate({
      where: {
        vendorId,
        status: { in: ["PENDING", "PAID"] },
      },
      _sum: { amount: true },
    }),
  ]);

  const totalEarned = earningsResult._sum?.vendorAmount ?? 0;
  const totalReserved = reservedResult._sum?.amount ?? 0;

  return {
    totalEarned,
    totalReserved,
    available: Math.max(0, totalEarned - totalReserved),
  };
}
