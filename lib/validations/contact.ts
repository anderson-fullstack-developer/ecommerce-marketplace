import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.email("Email inválido"),
  message: z.string().min(1, "Mensagem obrigatória"),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
