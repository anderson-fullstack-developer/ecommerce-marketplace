import { z } from "zod";

export const customerRegisterSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.email("Email inválido"),
  password: z.string().min(8, "A password deve ter pelo menos 8 caracteres"),
});

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
