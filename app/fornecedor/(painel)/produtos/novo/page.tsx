import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { createVendorProduct } from "../actions";

export default async function NewVendorProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Novo produto</h1>
      <p className="text-sm text-muted-foreground">
        O produto fica pendente de aprovação pela nossa equipa e só aparece na loja depois de
        ser revisto.
      </p>
      <ProductForm
        categories={categories}
        onSubmit={createVendorProduct}
        submitLabel="Criar produto"
      />
    </div>
  );
}
