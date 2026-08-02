import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "../../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const updateProductWithId = updateProduct.bind(null, product.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Editar produto</h1>
      <ProductForm
        categories={categories}
        defaultValues={product}
        onSubmit={updateProductWithId}
        submitLabel="Guardar alterações"
      />
    </div>
  );
}
