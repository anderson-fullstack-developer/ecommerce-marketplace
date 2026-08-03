"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";

export async function resetVendorPassword(token: string, input: ResetPasswordInput) {
  const { password } = resetPasswordSchema.parse(input);

  const vendor = await prisma.vendor.findUnique({ where: { resetToken: token } });
  if (!vendor || !vendor.resetTokenExpiresAt || vendor.resetTokenExpiresAt < new Date()) {
    throw new Error("Link inválido ou expirado.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.vendor.update({
    where: { id: vendor.id },
    data: { password: hashedPassword, resetToken: null, resetTokenExpiresAt: null },
  });
}
