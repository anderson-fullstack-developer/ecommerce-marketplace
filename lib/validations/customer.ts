import { z } from "zod";

export const customerRegisterSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.email("Email inválido"),
  password: z.string().min(8, "A password deve ter pelo menos 8 caracteres"),
});

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;

export const customerProfileSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(100, "Nome demasiado longo"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?[0-9 ]{9,16})?$/, "Número de telemóvel inválido"),
});

export type CustomerProfileInput = z.infer<typeof customerProfileSchema>;

export const customerPasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "A password deve ter pelo menos 8 caracteres"),
});

export type CustomerPasswordInput = z.infer<typeof customerPasswordSchema>;
