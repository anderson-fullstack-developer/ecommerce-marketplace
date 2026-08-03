import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { OrderStatusTimeline } from "@/components/admin/OrderStatusTimeline";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, items: { include: { product: true } } },
  });

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Encomenda #{order.id.slice(-8).toUpperCase()}
      </h1>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Estado da encomenda</CardTitle>
          <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
        </CardHeader>
        <CardContent>
          <OrderStatusTimeline status={order.status} />
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados para envio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Nome:</span> {order.customer.name}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span> {order.customer.email}
            </p>
            <p>
              <span className="text-muted-foreground">Telefone:</span>{" "}
              {order.customer.phone || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Morada:</span>{" "}
              {order.customer.address || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Cidade:</span> {order.customer.city || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Código postal:</span>{" "}
              {order.customer.postalCode || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">País:</span>{" "}
              {order.customer.country || "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
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
            <p className="mt-4 flex justify-between border-t border-border pt-2 text-sm text-muted-foreground">
              <span>Envio</span>
              <span>{order.shippingAmount === 0 ? "Grátis" : `€${order.shippingAmount.toFixed(2)}`}</span>
            </p>
            <p className="mt-1 flex justify-between font-semibold">
              <span>Total</span>
              <span>€{order.total.toFixed(2)}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
