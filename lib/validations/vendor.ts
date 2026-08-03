import { z } from "zod";

export const vendorApplicationSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.email("Email inválido"),
  password: z.string().min(8, "A password deve ter pelo menos 8 caracteres"),
  phone: z.string().min(1, "Telefone obrigatório"),
  nif: z.string().min(9, "NIF inválido — deve ter 9 dígitos"),
  documentUrl: z.url("URL de documento inválido").optional().or(z.literal("")),
  message: z.string().optional(),
});

export type VendorApplicationInput = z.infer<typeof vendorApplicationSchema>;

export const vendorHelpMessageSchema = z.object({
  subject: z.string().min(1, "Assunto obrigatório"),
  message: z.string().min(1, "Mensagem obrigatória"),
});

export type VendorHelpMessageInput = z.infer<typeof vendorHelpMessageSchema>;
