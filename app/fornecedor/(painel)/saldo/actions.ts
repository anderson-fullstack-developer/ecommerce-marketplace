"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getVendorBalance } from "@/lib/vendor-balance";

const amountSchema = z.number().positive();

export async function requestWithdrawal(amount: number) {
  const session = await auth();
  if (session?.user?.role !== "VENDOR") {
    throw new Error("Não autorizado.");
  }
  const vendorId = session.user.id;

  const parsedAmount = amountSchema.parse(amount);
  const balance = await getVendorBalance(vendorId);

  if (parsedAmount > balance.available) {
    throw new Error("O valor pedido excede o saldo disponível.");
  }

  await prisma.withdrawalRequest.create({
    data: { vendorId, amount: parsedAmount, status: "PENDING" },
  });

  revalidatePath("/fornecedor/saldo");
  revalidatePath("/admin/fornecedores");
}
