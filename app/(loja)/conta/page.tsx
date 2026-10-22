import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/shipping";
import { Button } from "@/components/ui/button";
import { CustomerSignOutButton } from "@/components/CustomerSignOutButton";
import { ShippingDetailsForm } from "@/components/conta/ShippingDetailsForm";
import { AccountProfile } from "@/components/conta/AccountProfile";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Paga",
  PROCESSING: "Em preparação",
  SHIPPED: "Enviada",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelada",
};

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  PROCESSING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  SHIPPED: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  DELIVERED: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
};

const ACTIVE_STATUSES = ["PAID", "PROCESSING", "SHIPPED"];

function formatEuro(value: number) {
  return `€${value.toFixed(2).replace(".", ",")}`;
}

export default async function ContaPage() {
  const customer = await getCurrentCustomer({ syncEmail: true });
  if (!customer) notFound();

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: { items: { include: { product: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  const validOrders = orders.filter((order) => order.status !== "CANCELLED");
  const totalSpent = validOrders.reduce((sum, order) => sum + order.total, 0);
  const activeCount = orders.filter((order) => ACTIVE_STATUSES.includes(order.status)).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold">Definições</h1>
        <CustomerSignOutButton />
      </div>

      <div className="mt-6 flex justify-center">
        <AccountProfile
          orders={
            <section className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">As minhas encomendas</h2>
                <p className="text-sm text-muted-foreground">
                  Acompanha o estado das tuas compras.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Encomendas</p>
                  <p className="mt-1 text-xl font-semibold">{orders.length}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">A caminho</p>
                  <p className="mt-1 text-xl font-semibold">{activeCount}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Total gasto</p>
                  <p className="mt-1 text-xl font-semibold">{formatEuro(totalSpent)}</p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Ainda não fizeste nenhuma encomenda.
                  </p>
                  <Button
                    render={<Link href="/loja" />}
                    nativeButton={false}
                    size="sm"
                    className="mt-3"
                  >
                    Ir à loja
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-border rounded-lg border">
                  {orders.map((order) => {
                    const names = order.items.map((item) => item.product.name);
                    const summary =
                      names.slice(0, 2).join(", ") +
                      (names.length > 2 ? ` e mais ${names.length - 2}` : "");

                    return (
                      <li key={order.id}>
                        <Link
                          href={`/conta/encomendas/${order.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium">
                                #{order.id.slice(-8).toUpperCase()}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground"
                                }`}
                              >
                                {STATUS_LABELS[order.status] ?? order.status}
                              </span>
                            </div>
                            <p className="truncate text-sm text-muted-foreground">{summary}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.createdAt.toLocaleDateString("pt-PT")}
                            </p>
                          </div>
                          <span className="font-medium">{formatEuro(order.total)}</span>
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          }
          shipping={
            <section className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Morada e contacto</h2>
                <p className="text-sm text-muted-foreground">
                  Os teus dados de entrega. São atualizados sempre que fazes uma compra com a morada
                  indicada no pagamento.
                </p>
              </div>
              <ShippingDetailsForm
                defaultValues={{
                  phone: customer.phone,
                  address: customer.address,
                  city: customer.city,
                  postalCode: customer.postalCode,
                }}
              />
            </section>
          }
          help={
            <section className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Ajuda</h2>
                <p className="text-sm text-muted-foreground">Estamos aqui para ajudar.</p>
              </div>

              <div className="space-y-2 rounded-lg border p-4 text-sm">
                <p className="font-medium">Envios</p>
                <p className="text-muted-foreground">
                  Enviamos para todo Portugal em 3 a 5 dias úteis. Envio grátis a partir de{" "}
                  {formatEuro(FREE_SHIPPING_THRESHOLD)}; abaixo disso custa{" "}
                  {formatEuro(SHIPPING_FEE)}.
                </p>
              </div>

              <ul className="divide-y divide-border rounded-lg border text-sm">
                {[
                  {
                    href: "/contacto",
                    label: "Contactar a loja",
                    hint: "Dúvidas sobre produtos ou encomendas",
                  },
                  {
                    href: "/reclamacoes",
                    label: "Fazer uma reclamação",
                    hint: "Algum problema com uma compra",
                  },
                  {
                    href: "/torna-te-vendedor",
                    label: "Torna-te vendedor",
                    hint: "Vende os teus produtos na Neto STP",
                  },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center justify-between px-4 py-3 hover:bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{link.label}</p>
                        <p className="text-muted-foreground">{link.hint}</p>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          }
        />
      </div>
    </div>
  );
}
