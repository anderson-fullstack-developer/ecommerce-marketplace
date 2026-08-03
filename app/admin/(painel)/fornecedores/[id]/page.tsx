import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const VENDOR_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};

const PRODUCT_APPROVAL_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Paga",
  PROCESSING: "Em preparação",
  SHIPPED: "Enviada",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelada",
};

export default async function AdminVendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: { products: { include: { category: true } } },
  });

  if (!vendor) notFound();

  const orderItems = await prisma.orderItem.findMany({
    where: { vendorId: id },
    include: { order: { include: { customer: true } }, product: true },
    orderBy: { order: { createdAt: "desc" } },
  });

  const ordersMap = new Map<
    string,
    {
      orderId: string;
      createdAt: Date;
      status: string;
      customerName: string;
      items: { productName: string; quantity: number; price: number }[];
      vendorAmount: number;
    }
  >();

  for (const item of orderItems) {
    const existing = ordersMap.get(item.orderId);
    const entry = existing ?? {
      orderId: item.orderId,
      createdAt: item.order.createdAt,
      status: item.order.status,
      customerName: item.order.customer.name,
      items: [],
      vendorAmount: 0,
    };
    entry.items.push({
      productName: item.product.name,
      quantity: item.quantity,
      price: item.price,
    });
    entry.vendorAmount += item.vendorAmount ?? 0;
    ordersMap.set(item.orderId, entry);
  }

  const orders = [...ordersMap.values()];

  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const grossRevenue = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const netRevenue = orderItems.reduce((sum, item) => sum + (item.vendorAmount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/fornecedores"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ← Fornecedores
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{vendor.name}</h1>
        <p className="text-sm text-muted-foreground">
          {vendor.email} · {vendor.phone} · NIF: {vendor.nif ?? "—"} ·{" "}
          {VENDOR_STATUS_LABELS[vendor.status] ?? vendor.status}
          {vendor.documentUrl && (
            <>
              {" · "}
              <a
                href={vendor.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Ver documento
              </a>
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Encomendas</CardDescription>
            <CardTitle className="text-3xl">{orders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Unidades vendidas</CardDescription>
            <CardTitle className="text-3xl">{totalQuantity}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total vendido (bruto)</CardDescription>
            <CardTitle className="text-3xl">€{grossRevenue.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total para o fornecedor</CardDescription>
            <CardTitle className="text-3xl">€{netRevenue.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produtos ({vendor.products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendor.products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell>€{product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    {PRODUCT_APPROVAL_LABELS[product.approvalStatus] ?? product.approvalStatus}
                  </TableCell>
                </TableRow>
              ))}
              {vendor.products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Ainda não publicou produtos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Encomendas ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Encomenda</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Valor (fornecedor)</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell>#{order.orderId.slice(-8).toUpperCase()}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>
                    {order.items.map((item, index) => (
                      <div key={index} className="text-sm">
                        {item.quantity}× {item.productName}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>€{order.vendorAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </TableCell>
                  <TableCell>{order.createdAt.toLocaleDateString("pt-PT")}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/encomendas/${order.orderId}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Ver encomenda
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Ainda não há encomendas com produtos deste fornecedor.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
