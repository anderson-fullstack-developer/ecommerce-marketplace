import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export async function uniqueProductSlug(name: string, ignoreId?: string) {
  const base = slugify(name);
  let slug = base;
  let counter = 1;

  while (
    await prisma.product.findFirst({
      where: { slug, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
    })
  ) {
    counter += 1;
    slug = `${base}-${counter}`;
  }

  return slug;
}
