import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateVendorProduct } from "../../actions";

export default async function EditVendorProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const vendorId = session!.user.id;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product || product.vendorId !== vendorId) notFound();

  const updateVendorProductWithId = updateVendorProduct.bind(null, product.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Editar produto</h1>
      <p className="text-sm text-muted-foreground">
        Guardar alterações envia o produto novamente para aprovação e ele fica indisponível na
        loja até ser revisto.
      </p>
      <ProductForm
        categories={categories}
        defaultValues={product}
        onSubmit={updateVendorProductWithId}
        submitLabel="Guardar alterações"
      />
    </div>
  );
}
