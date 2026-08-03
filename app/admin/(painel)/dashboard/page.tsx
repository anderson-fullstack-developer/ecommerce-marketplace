import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/lib/generated/prisma/enums";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LOW_STOCK_THRESHOLD = 5;
const COUNTED_STATUSES: OrderStatus[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function AdminDashboardPage() {
  const [productCount, orderCount, revenue, lowStockProducts, orderItems] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: COUNTED_STATUSES } },
    }),
    prisma.product.findMany({
      where: { stock: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { stock: "asc" },
      take: 5,
    }),
    prisma.orderItem.findMany({
      where: { order: { status: { in: COUNTED_STATUSES } } },
      select: { price: true, quantity: true, vendorId: true, commissionAmount: true },
    }),
  ]);

  const adminOwnRevenue = orderItems
    .filter((item) => !item.vendorId)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const vendorCommissionRevenue = orderItems
    .filter((item) => item.vendorId)
    .reduce((sum, item) => sum + (item.commissionAmount ?? 0), 0);

  const totalAdminEarnings = adminOwnRevenue + vendorCommissionRevenue;

  const stats = [
    { label: "Produtos", value: productCount },
    { label: "Encomendas", value: orderCount },
    { label: "Total vendido", value: `€${(revenue._sum.total ?? 0).toFixed(2)}` },
    { label: "Stock baixo", value: lowStockProducts.length },
  ];

  const earningsStats = [
    { label: "Vendas próprias (sem fornecedor)", value: `€${adminOwnRevenue.toFixed(2)}` },
    { label: "Comissão das vendas dos fornecedores", value: `€${vendorCommissionRevenue.toFixed(2)}` },
    { label: "Total ganho pelo admin", value: `€${totalAdminEarnings.toFixed(2)}`, highlight: true },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">O que o admin ganha</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {earningsStats.map((stat) => (
            <Card key={stat.label} className={stat.highlight ? "border-primary" : undefined}>
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produtos com stock baixo</CardTitle>
          <CardDescription>
            Stock igual ou inferior a {LOW_STOCK_THRESHOLD} unidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum produto com stock baixo.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {lowStockProducts.map((product) => (
                <li key={product.id} className="flex justify-between">
                  <span>{product.name}</span>
                  <span className="text-muted-foreground">
                    {product.stock} unidades
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
