"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email/send";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";

export async function requestCustomerPasswordReset(input: ForgotPasswordInput) {
  const { email } = forgotPasswordSchema.parse(input);

  const customer = await prisma.customer.findUnique({ where: { email } });

  if (customer?.password) {
    const token = generateResetToken();
    await prisma.customer.update({
      where: { id: customer.id },
      data: { resetToken: token, resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
    });

    const siteUrl = getSiteUrl((await headers()).get("origin"));
    try {
      await sendPasswordResetEmail({
        name: customer.name,
        email: customer.email,
        resetUrl: `${siteUrl}/conta/redefinir/${token}`,
      });
    } catch (error) {
      console.error("Falha ao enviar email de recuperação de password (cliente):", error);
    }
  }

  // Resposta sempre igual, exista ou não a conta, para não revelar que emails estão registados.
}
