"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const checkoutInputSchema = z
  .array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  )
  .min(1, "O carrinho está vazio");

export async function createCheckoutSession(input: unknown) {
  const session = await auth();
  if (session?.user?.role !== "CUSTOMER" || !session.user.email) {
    throw new Error("Tens de iniciar sessão para finalizar a compra.");
  }

  const items = checkoutInputSchema.parse(input);

  const products = await prisma.product.findMany({
    where: {
      id: { in: items.map((item) => item.productId) },
      active: true,
      approvalStatus: "APPROVED",
    },
  });

  const lineItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      throw new Error("Um dos produtos do carrinho já não está disponível.");
    }
    if (item.quantity > product.stock) {
      throw new Error(`Stock insuficiente para "${product.name}".`);
    }

    return {
      quantity: item.quantity,
      price_data: {
        currency: "eur",
        unit_amount: Math.round(product.price * 100),
        product_data: {
          name: product.name,
          images: [product.imageUrl],
          metadata: { productId: product.id },
        },
      },
    };
  });

  const origin = (await headers()).get("origin") ?? "http://localhost:3000";

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/carrinho`,
    customer_email: session.user.email,
    billing_address_collection: "required",
    shipping_address_collection: { allowed_countries: ["PT"] },
    phone_number_collection: { enabled: true },
  });

  if (!checkoutSession.url) {
    throw new Error("Não foi possível criar a sessão de pagamento.");
  }

  return { url: checkoutSession.url };
}
