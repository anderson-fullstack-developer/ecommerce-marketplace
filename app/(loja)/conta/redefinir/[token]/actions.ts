"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";

export async function resetCustomerPassword(token: string, input: ResetPasswordInput) {
  const { password } = resetPasswordSchema.parse(input);

  const customer = await prisma.customer.findUnique({ where: { resetToken: token } });
  if (!customer || !customer.resetTokenExpiresAt || customer.resetTokenExpiresAt < new Date()) {
    throw new Error("Link inválido ou expirado.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.customer.update({
    where: { id: customer.id },
    data: { password: hashedPassword, resetToken: null, resetTokenExpiresAt: null },
  });
}
