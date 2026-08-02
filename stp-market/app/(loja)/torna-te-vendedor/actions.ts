"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { sendVendorApplicationReceivedEmail } from "@/lib/email/send";
import {
  vendorApplicationSchema,
  type VendorApplicationInput,
} from "@/lib/validations/vendor";

export async function applyAsVendor(input: VendorApplicationInput) {
  const data = vendorApplicationSchema.parse(input);

  const existing = await prisma.vendor.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error("Já existe uma candidatura com este email.");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  await prisma.vendor.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      message: data.message || null,
    },
  });

  try {
    const siteUrl = getSiteUrl((await headers()).get("origin"));
    await sendVendorApplicationReceivedEmail({
      vendorName: data.name,
      vendorEmail: data.email,
      siteUrl,
    });
  } catch (error) {
    console.error("Falha ao enviar email de candidatura recebida:", error);
  }
}
