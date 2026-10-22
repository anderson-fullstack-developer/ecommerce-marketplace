import { z } from "zod";

export const customerShippingSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^(\+?[0-9 ]{9,16})?$/, "Número de telemóvel inválido"),
  address: z.string().trim().max(200, "Morada demasiado longa"),
  city: z.string().trim().max(100, "Localidade demasiado longa"),
  postalCode: z
    .string()
    .trim()
    .regex(/^(\d{4}-\d{3})?$/, "Código postal inválido (formato 1234-567)"),
});

export type CustomerShippingInput = z.infer<typeof customerShippingSchema>;
