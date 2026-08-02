import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusTimeline } from "@/components/admin/OrderStatusTimeline";

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.customerId !== session!.user.id) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link href="/conta/encomendas" className="text-sm text-muted-foreground hover:text-primary">
        ← As minhas encomendas
      </Link>

      <h1 className="mt-2 font-heading text-3xl font-semibold">
        Encomenda #{order.id.slice(-8).toUpperCase()}
      </h1>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Estado da encomenda</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderStatusTimeline status={order.status} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.quantity} × {item.product.name}
                </span>
                <span>€{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-border pt-2 font-semibold">
            <span>Total</span>
            <span>€{order.total.toFixed(2)}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
