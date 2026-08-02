import { CategoryForm } from "@/components/admin/CategoryForm";
import { createCategory } from "../actions";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Nova categoria</h1>
      <CategoryForm onSubmit={createCategory} submitLabel="Criar categoria" />
    </div>
  );
}
