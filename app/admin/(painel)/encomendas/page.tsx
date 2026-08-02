import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/lib/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderFilters } from "@/components/admin/OrderFilters";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Paga",
  PROCESSING: "Em preparação",
  SHIPPED: "Enviada",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelada",
};

const VALID_STATUSES = Object.keys(STATUS_LABELS);

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const statusFilter =
    status && VALID_STATUSES.includes(status) ? (status as OrderStatus) : undefined;

  const orders = await prisma.order.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(q ? { customer: { name: { contains: q, mode: "insensitive" } } } : {}),
    },
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Encomendas</h1>

      <OrderFilters defaultValues={{ q: q ?? "", status: status ?? "" }} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Produtos</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.customer.name}</TableCell>
              <TableCell>
                {order.items.length} produto{order.items.length === 1 ? "" : "s"}
              </TableCell>
              <TableCell>€{order.total.toFixed(2)}</TableCell>
              <TableCell>{order.createdAt.toLocaleDateString("pt-PT")}</TableCell>
              <TableCell>{STATUS_LABELS[order.status] ?? order.status}</TableCell>
              <TableCell className="text-right">
                <Button
                  render={<Link href={`/admin/encomendas/${order.id}`} />}
                  nativeButton={false}
                  variant="outline"
                  size="sm"
                >
                  Ver
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Nenhuma encomenda encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
