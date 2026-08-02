"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";

async function uniqueSlug(name: string, ignoreId?: string) {
  const base = slugify(name);
  let slug = base;
  let counter = 1;

  while (
    await prisma.category.findFirst({
      where: { slug, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
    })
  ) {
    counter += 1;
    slug = `${base}-${counter}`;
  }

  return slug;
}

export async function createCategory(input: CategoryInput) {
  const data = categorySchema.parse(input);
  const slug = await uniqueSlug(data.name);

  await prisma.category.create({ data: { ...data, slug } });

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidatePath("/loja");
  redirect("/admin/categorias");
}

export async function updateCategory(id: string, input: CategoryInput) {
  const data = categorySchema.parse(input);
  const existing = await prisma.category.findUniqueOrThrow({ where: { id } });

  const slug =
    slugify(data.name) === slugify(existing.name)
      ? existing.slug
      : await uniqueSlug(data.name, id);

  await prisma.category.update({ where: { id }, data: { ...data, slug } });

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidatePath("/loja");
  redirect("/admin/categorias");
}
