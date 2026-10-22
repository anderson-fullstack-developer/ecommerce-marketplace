"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  customerPasswordSchema,
  customerProfileSchema,
  type CustomerPasswordInput,
  type CustomerProfileInput,
} from "@/lib/validations/customer";

async function requireCustomerId() {
  const session = await auth();
  if (session?.user?.role !== "CUSTOMER") {
    throw new Error("Não autenticado.");
  }
  return session.user.id;
}

export async function updateCustomerProfile(input: CustomerProfileInput) {
  const customerId = await requireCustomerId();
  const data = customerProfileSchema.parse(input);

  await prisma.customer.update({
    where: { id: customerId },
    data: { name: data.name, phone: data.phone },
  });

  revalidatePath("/conta");
}

export async function changeCustomerPassword(
  input: CustomerPasswordInput
): Promise<{ error?: string }> {
  const customerId = await requireCustomerId();
  const data = customerPasswordSchema.parse(input);

  const customer = await prisma.customer.findUniqueOrThrow({ where: { id: customerId } });

  // Quem já tem password tem de confirmar a atual. Contas só com Google podem definir
  // uma password pela primeira vez (já provaram a identidade ao entrar com Google).
  if (customer.password) {
    const matches = await bcrypt.compare(data.currentPassword ?? "", customer.password);
    if (!matches) {
      return { error: "A password atual está incorreta." };
    }
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      password: await bcrypt.hash(data.newPassword, 10),
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  });

  revalidatePath("/conta");
  return {};
}
