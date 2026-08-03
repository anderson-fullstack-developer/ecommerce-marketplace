"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendVendorHelpMessageEmail } from "@/lib/email/send";
import { vendorHelpMessageSchema, type VendorHelpMessageInput } from "@/lib/validations/vendor";

export async function sendVendorHelpMessage(input: VendorHelpMessageInput) {
  const session = await auth();
  if (session?.user?.role !== "VENDOR") {
    throw new Error("Não autorizado.");
  }

  const data = vendorHelpMessageSchema.parse(input);

  const vendor = await prisma.vendor.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  await sendVendorHelpMessageEmail({
    vendorName: vendor.name,
    vendorEmail: vendor.email,
    subject: data.subject,
    message: data.message,
  });
}
