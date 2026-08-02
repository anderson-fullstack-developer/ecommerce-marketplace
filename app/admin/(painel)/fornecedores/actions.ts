"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { sendVendorApprovedEmail, sendVendorRejectedEmail } from "@/lib/email/send";

export async function approveVendor(vendorId: string) {
  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: { status: "APPROVED" },
  });
  revalidatePath("/admin/fornecedores");

  try {
    const siteUrl = getSiteUrl((await headers()).get("origin"));
    await sendVendorApprovedEmail({ vendorName: vendor.name, vendorEmail: vendor.email, siteUrl });
  } catch (error) {
    console.error("Falha ao enviar email de aprovação de fornecedor:", error);
  }
}

export async function rejectVendor(vendorId: string) {
  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: { status: "REJECTED" },
  });
  revalidatePath("/admin/fornecedores");

  try {
    const siteUrl = getSiteUrl((await headers()).get("origin"));
    await sendVendorRejectedEmail({ vendorName: vendor.name, vendorEmail: vendor.email, siteUrl });
  } catch (error) {
    console.error("Falha ao enviar email de rejeição de fornecedor:", error);
  }
}

export async function markWithdrawalPaid(requestId: string) {
  await prisma.withdrawalRequest.update({
    where: { id: requestId },
    data: { status: "PAID", paidAt: new Date() },
  });
  revalidatePath("/admin/fornecedores");
}
