"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";

export function CategoryForm({
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  defaultValues?: Partial<CategoryInput>;
  onSubmit: (data: CategoryInput) => Promise<void>;
  submitLabel: string;
}) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      ...defaultValues,
    },
  });

  async function submit(data: CategoryInput) {
    setFormError(null);
    try {
      await onSubmit(data);
    } catch {
      setFormError("Não foi possível guardar a categoria.");
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="max-w-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "A guardar..." : submitLabel}
      </Button>
    </form>
  );
}
