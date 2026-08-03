import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(8, "A password deve ter pelo menos 8 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Email inválido"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "A password deve ter pelo menos 8 caracteres"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
