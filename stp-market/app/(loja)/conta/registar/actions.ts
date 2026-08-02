"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { customerRegisterSchema, type CustomerRegisterInput } from "@/lib/validations/customer";

export async function registerCustomer(input: CustomerRegisterInput) {
  const data = customerRegisterSchema.parse(input);
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const existing = await prisma.customer.findUnique({ where: { email: data.email } });
  if (existing?.password) {
    throw new Error("Já existe uma conta com este email. Inicia sessão.");
  }

  if (existing) {
    // Cliente com histórico de compras como convidado — associa a password à conta existente.
    await prisma.customer.update({
      where: { id: existing.id },
      data: { name: data.name, password: hashedPassword },
    });
    return;
  }

  await prisma.customer.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
    },
  });
}
