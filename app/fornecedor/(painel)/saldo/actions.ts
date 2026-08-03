"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getVendorBalance } from "@/lib/vendor-balance";
import { withdrawalRequestSchema, type WithdrawalRequestInput } from "@/lib/validations/withdrawal";

export async function requestWithdrawal(input: WithdrawalRequestInput) {
  const session = await auth();
  if (session?.user?.role !== "VENDOR") {
    throw new Error("Não autorizado.");
  }
  const vendorId = session.user.id;

  const data = withdrawalRequestSchema.parse(input);
  const balance = await getVendorBalance(vendorId);

  if (data.amount > balance.available) {
    throw new Error("O valor pedido excede o saldo disponível.");
  }

  await prisma.withdrawalRequest.create({
    data: {
      vendorId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentDetails: data.paymentDetails,
      status: "PENDING",
    },
  });

  revalidatePath("/fornecedor/saldo");
  revalidatePath("/admin/fornecedores");
}
