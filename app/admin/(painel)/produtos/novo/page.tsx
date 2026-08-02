import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Novo produto</h1>
      <ProductForm
        categories={categories}
        onSubmit={createProduct}
        submitLabel="Criar produto"
      />
    </div>
  );
}
