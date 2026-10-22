"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentCustomer } from "@/lib/customer";
import { customerShippingSchema, type CustomerShippingInput } from "@/lib/validations/customer";

export async function updateShippingDetails(input: CustomerShippingInput) {
  const customer = await requireCurrentCustomer();
  const data = customerShippingSchema.parse(input);

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      phone: data.phone,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      // A loja só envia para Portugal (ver shipping_address_collection no checkout).
      country: data.address ? "PT" : customer.country,
    },
  });

  revalidatePath("/conta");
}
