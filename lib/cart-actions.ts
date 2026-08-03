"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ServerCartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  quantity: number;
};

export type AddItemResult = "ok" | "capped" | "maxed";

async function requireCustomerId() {
  const session = await auth();
  if (session?.user?.role !== "CUSTOMER") {
    throw new Error("Não autenticado.");
  }
  return session.user.id;
}

async function loadCart(customerId: string): Promise<ServerCartItem[]> {
  const cartItems = await prisma.cartItem.findMany({
    where: { customerId, product: { active: true, approvalStatus: "APPROVED" } },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  return cartItems.map((item) => ({
    productId: item.productId,
    slug: item.product.slug,
    name: item.product.name,
    price: item.product.price,
    imageUrl: item.product.imageUrl,
    stock: item.product.stock,
    quantity: Math.min(item.quantity, item.product.stock),
  }));
}

export async function getServerCart(): Promise<ServerCartItem[]> {
  const customerId = await requireCustomerId();
  return loadCart(customerId);
}

export async function addServerCartItem(
  productId: string,
  quantity: number
): Promise<{ items: ServerCartItem[]; result: AddItemResult }> {
  const customerId = await requireCustomerId();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.active || product.approvalStatus !== "APPROVED") {
    throw new Error("Produto indisponível.");
  }

  const existing = await prisma.cartItem.findUnique({
    where: { customerId_productId: { customerId, productId } },
  });
  const currentQuantity = existing?.quantity ?? 0;

  if (currentQuantity >= product.stock) {
    return { items: await loadCart(customerId), result: "maxed" };
  }

  const nextQuantity = Math.min(currentQuantity + quantity, product.stock);
  const result: AddItemResult = nextQuantity < currentQuantity + quantity ? "capped" : "ok";

  await prisma.cartItem.upsert({
    where: { customerId_productId: { customerId, productId } },
    create: { customerId, productId, quantity: nextQuantity },
    update: { quantity: nextQuantity },
  });

  return { items: await loadCart(customerId), result };
}

export async function updateServerCartItemQuantity(
  productId: string,
  quantity: number
): Promise<ServerCartItem[]> {
  const customerId = await requireCustomerId();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Produto indisponível.");

  const clamped = Math.max(1, Math.min(quantity, product.stock));

  await prisma.cartItem.upsert({
    where: { customerId_productId: { customerId, productId } },
    create: { customerId, productId, quantity: clamped },
    update: { quantity: clamped },
  });

  return loadCart(customerId);
}

export async function removeServerCartItem(productId: string): Promise<ServerCartItem[]> {
  const customerId = await requireCustomerId();
  await prisma.cartItem.deleteMany({ where: { customerId, productId } });
  return loadCart(customerId);
}

export async function clearServerCart(): Promise<void> {
  const customerId = await requireCustomerId();
  await prisma.cartItem.deleteMany({ where: { customerId } });
}

export async function mergeLocalCartIntoServer(
  localItems: { productId: string; quantity: number }[]
): Promise<ServerCartItem[]> {
  const customerId = await requireCustomerId();

  for (const localItem of localItems) {
    const product = await prisma.product.findUnique({ where: { id: localItem.productId } });
    if (!product || !product.active || product.approvalStatus !== "APPROVED") continue;

    const existing = await prisma.cartItem.findUnique({
      where: { customerId_productId: { customerId, productId: localItem.productId } },
    });
    const currentQuantity = existing?.quantity ?? 0;
    const nextQuantity = Math.min(currentQuantity + localItem.quantity, product.stock);

    if (nextQuantity <= 0) continue;

    await prisma.cartItem.upsert({
      where: { customerId_productId: { customerId, productId: localItem.productId } },
      create: { customerId, productId: localItem.productId, quantity: nextQuantity },
      update: { quantity: nextQuantity },
    });
  }

  return loadCart(customerId);
}
