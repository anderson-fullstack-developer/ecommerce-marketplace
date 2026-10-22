import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Devolve o `Customer` associado ao utilizador Clerk com sessão iniciada (ou null).
 *
 * Caminho rápido: procura por `clerkUserId` (só BD, sem chamar a API do Clerk).
 * Primeira vez: lê o utilizador no Clerk e liga-o a um `Customer` existente com o
 * mesmo email (mantém o histórico de encomendas) ou cria um novo. Só liga por email
 * se o Clerk tiver esse email verificado — senão bastava alguém registar-se com o
 * email de outra pessoa para ver as encomendas dela.
 *
 * `syncEmail: true` volta a ler o email principal no Clerk e atualiza o `Customer`
 * se o cliente o tiver mudado nas definições (usado no checkout, onde o email conta).
 */
export async function getCurrentCustomer(options: { syncEmail?: boolean } = {}) {
  const { userId } = await auth();
  if (!userId) return null;

  const linked = await prisma.customer.findUnique({ where: { clerkUserId: userId } });
  if (linked && !options.syncEmail) return linked;

  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress;
  if (!user || !primaryEmail || primaryEmail.verification?.status !== "verified") {
    return linked;
  }

  const email = primaryEmail.emailAddress.toLowerCase();

  if (linked) {
    if (linked.email === email) return linked;
    const taken = await prisma.customer.findUnique({ where: { email } });
    if (taken) return linked;
    return prisma.customer.update({ where: { id: linked.id }, data: { email } });
  }

  // Contas antigas podem ter o email guardado com maiúsculas — comparar sem diferenciar.
  const existing = await prisma.customer.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (existing) {
    return prisma.customer.update({
      where: { id: existing.id },
      data: { clerkUserId: userId },
    });
  }

  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || email.split("@")[0];

  return prisma.customer.create({
    data: {
      name,
      email,
      clerkUserId: userId,
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
    },
  });
}

export async function requireCurrentCustomer(options?: { syncEmail?: boolean }) {
  const customer = await getCurrentCustomer(options);
  if (!customer) {
    throw new Error("Tens de iniciar sessão.");
  }
  return customer;
}
