import { z } from "zod";

export const withdrawalRequestSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.enum(["IBAN", "MBWAY"]),
  paymentDetails: z.string().min(1, "Indica o IBAN ou o número de telemóvel do MB WAY"),
});

export type WithdrawalRequestInput = z.infer<typeof withdrawalRequestSchema>;
