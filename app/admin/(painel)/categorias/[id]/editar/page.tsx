import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { updateCategory } from "../../actions";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  const updateCategoryWithId = updateCategory.bind(null, category.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Editar categoria</h1>
      <CategoryForm
        defaultValues={category}
        onSubmit={updateCategoryWithId}
        submitLabel="Guardar alterações"
      />
    </div>
  );
}
