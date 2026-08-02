"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import { uploadProductImage } from "@/app/admin/(painel)/produtos/actions";
import { cloudinaryResize } from "@/lib/cloudinary-url";

type Category = { id: string; name: string };

export function ProductForm({
  categories,
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  categories: Category[];
  defaultValues?: Partial<ProductInput>;
  onSubmit: (data: ProductInput) => Promise<void>;
  submitLabel: string;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      stock: 0,
      active: true,
      categoryId: "",
      ...defaultValues,
    },
  });

  async function submit(data: ProductInput) {
    setFormError(null);
    try {
      await onSubmit(data);
    } catch {
      setFormError("Não foi possível guardar o produto.");
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { url } = await uploadProductImage(formData);
      setValue("imageUrl", url, { shouldValidate: true });
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Não foi possível enviar a imagem."
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  const imageUrl = watch("imageUrl");

  return (
    <form onSubmit={handleSubmit(submit)} className="max-w-xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" rows={4} {...register("description")} />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Preço (€)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" {...register("stock", { valueAsNumber: true })} />
          {errors.stock && (
            <p className="text-sm text-destructive">{errors.stock.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageFile">Imagem do produto</Label>
        <div className="flex items-center gap-4">
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- pré-visualização de imagens externas/Cloudinary
            <img
              src={cloudinaryResize(imageUrl, 128)}
              alt=""
              className="size-16 shrink-0 rounded-md border border-input object-cover"
            />
          )}
          <div className="flex-1 space-y-1">
            <input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            />
            {isUploading && (
              <p className="text-xs text-muted-foreground">A enviar para o Cloudinary...</p>
            )}
            {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
          </div>
        </div>
        <Input placeholder="ou cola diretamente uma URL de imagem" {...register("imageUrl")} />
        {errors.imageUrl && (
          <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Categoria</Label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="categoryId" className="w-full">
                <SelectValue placeholder="Selecionar categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && (
          <p className="text-sm text-destructive">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="active"
          render={({ field }) => (
            <Switch id="active" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Label htmlFor="active">Produto ativo</Label>
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "A guardar..." : submitLabel}
      </Button>
    </form>
  );
}
