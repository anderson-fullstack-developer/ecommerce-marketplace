import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/admin/SignOutButton";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Paga",
  PROCESSING: "Em preparação",
  SHIPPED: "Enviada",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelada",
};

export default async function CustomerOrdersPage() {
  const session = await auth();
  const customerId = session!.user.id;

  const orders = await prisma.order.findMany({
    where: { customerId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold">As minhas encomendas</h1>
          <p className="mt-1 text-sm text-muted-foreground">{session!.user.email}</p>
        </div>
        <SignOutButton callbackUrl="/" />
      </div>

      {orders.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">
          Ainda não fizeste nenhuma encomenda.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-lg border">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/conta/encomendas/${order.id}`}
                className="flex items-center justify-between px-4 py-4 hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} produto(s) · {order.createdAt.toLocaleDateString("pt-PT")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">€{order.total.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    {STATUS_LABELS[order.status] ?? order.status}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
