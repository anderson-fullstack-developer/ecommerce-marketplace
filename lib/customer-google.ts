import { prisma } from "@/lib/prisma";

/**
 * Resolve o `Customer` de quem entrou com Google: primeiro pelo `googleId`; senão liga
 * a um `Customer` existente com o mesmo email (mantém o histórico de encomendas de
 * contas com password e de compras antigas); senão cria um novo, sem password.
 * Só é chamado com emails que o Google marca como verificados (ver `signIn` em auth.ts).
 */
export async function findOrCreateGoogleCustomer(params: {
  googleId: string;
  email: string;
  name?: string | null;
}) {
  const byGoogleId = await prisma.customer.findUnique({ where: { googleId: params.googleId } });
  if (byGoogleId) return byGoogleId;

  // Contas antigas podem ter o email guardado com maiúsculas — comparar sem diferenciar.
  const byEmail = await prisma.customer.findFirst({
    where: { email: { equals: params.email, mode: "insensitive" } },
  });
  if (byEmail) {
    return prisma.customer.update({
      where: { id: byEmail.id },
      data: { googleId: params.googleId },
    });
  }

  return prisma.customer.create({
    data: {
      name: params.name || params.email.split("@")[0],
      email: params.email.toLowerCase(),
      googleId: params.googleId,
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
    },
  });
}
