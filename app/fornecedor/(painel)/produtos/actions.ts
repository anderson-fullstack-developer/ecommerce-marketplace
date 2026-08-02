"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { uniqueProductSlug } from "@/lib/products";
import { productSchema, type ProductInput } from "@/lib/validations/product";

async function requireVendorId() {
  const session = await auth();
  if (session?.user?.role !== "VENDOR") {
    throw new Error("Não autorizado.");
  }
  return session.user.id;
}

export async function createVendorProduct(input: ProductInput) {
  const vendorId = await requireVendorId();
  const data = productSchema.parse(input);
  const slug = await uniqueProductSlug(data.name);

  await prisma.product.create({
    data: { ...data, slug, vendorId, approvalStatus: "PENDING" },
  });

  revalidatePath("/fornecedor/produtos");
  revalidatePath("/");
  revalidatePath("/loja");
  redirect("/fornecedor/produtos");
}

export async function updateVendorProduct(id: string, input: ProductInput) {
  const vendorId = await requireVendorId();
  const existing = await prisma.product.findUniqueOrThrow({ where: { id } });
  if (existing.vendorId !== vendorId) {
    throw new Error("Não autorizado.");
  }

  const data = productSchema.parse(input);
  const slug =
    slugify(data.name) === slugify(existing.name)
      ? existing.slug
      : await uniqueProductSlug(data.name, id);

  await prisma.product.update({
    where: { id },
    data: { ...data, slug, approvalStatus: "PENDING" },
  });

  revalidatePath("/fornecedor/produtos");
  revalidatePath("/");
  revalidatePath("/loja");
  revalidatePath(`/produto/${existing.slug}`);
  if (slug !== existing.slug) revalidatePath(`/produto/${slug}`);
  redirect("/fornecedor/produtos");
}

export async function deleteVendorProduct(id: string) {
  const vendorId = await requireVendorId();
  const existing = await prisma.product.findUniqueOrThrow({ where: { id } });
  if (existing.vendorId !== vendorId) {
    throw new Error("Não autorizado.");
  }

  await prisma.product.delete({ where: { id } });
  revalidatePath("/fornecedor/produtos");
  revalidatePath("/");
  revalidatePath("/loja");
  revalidatePath(`/produto/${existing.slug}`);
}
