"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email/send";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";

export async function requestVendorPasswordReset(input: ForgotPasswordInput) {
  const { email } = forgotPasswordSchema.parse(input);

  const vendor = await prisma.vendor.findUnique({ where: { email } });

  if (vendor) {
    const token = generateResetToken();
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { resetToken: token, resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
    });

    const siteUrl = getSiteUrl((await headers()).get("origin"));
    try {
      await sendPasswordResetEmail({
        name: vendor.name,
        email: vendor.email,
        resetUrl: `${siteUrl}/fornecedor/redefinir/${token}`,
      });
    } catch (error) {
      console.error("Falha ao enviar email de recuperação de password (fornecedor):", error);
    }
  }

  // Resposta sempre igual, exista ou não a conta, para não revelar que emails estão registados.
}
