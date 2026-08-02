import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().min(1, "Descrição obrigatória"),
  price: z.number().positive("Preço deve ser positivo"),
  imageUrl: z.url("URL de imagem inválido"),
  stock: z.number().int().min(0, "Stock não pode ser negativo"),
  active: z.boolean(),
  categoryId: z.string().min(1, "Categoria obrigatória"),
});

export type ProductInput = z.infer<typeof productSchema>;
