"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { sendOrderStatusUpdateEmail } from "@/lib/email/send";

const statusSchema = z.enum([
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export async function updateOrderStatus(orderId: string, status: string) {
  const parsedStatus = statusSchema.parse(status);

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: parsedStatus },
    include: { customer: true },
  });

  revalidatePath("/admin/encomendas");
  revalidatePath(`/admin/encomendas/${orderId}`);
  revalidatePath("/admin/dashboard");

  try {
    if (order.customer.email) {
      const siteUrl = getSiteUrl((await headers()).get("origin"));
      await sendOrderStatusUpdateEmail({
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        orderId: order.id,
        status: parsedStatus,
        siteUrl,
      });
    }
  } catch (error) {
    console.error("Falha ao enviar email de atualização de encomenda:", error);
  }

  return order;
}
