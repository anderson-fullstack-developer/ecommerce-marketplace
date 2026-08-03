"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { cloudinary } from "@/lib/cloudinary";
import { sendVendorApplicationReceivedEmail } from "@/lib/email/send";
import {
  vendorApplicationSchema,
  type VendorApplicationInput,
} from "@/lib/validations/vendor";

const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadVendorDocument(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Ficheiro inválido.");
  }
  if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
    throw new Error("O ficheiro tem de ser uma imagem ou PDF.");
  }
  if (file.size > MAX_DOCUMENT_SIZE) {
    throw new Error("O ficheiro não pode exceder 5MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "stp-market/fornecedores-documentos",
      resource_type: "auto",
    });
    return { url: result.secure_url };
  } catch (error) {
    console.error("Falha no upload do documento:", error);
    throw new Error("Não foi possível enviar o documento. Tenta novamente.");
  }
}

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
      nif: data.nif,
      documentUrl: data.documentUrl || null,
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
