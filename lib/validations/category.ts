import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
