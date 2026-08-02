import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminDashboardPage() {
  const [productCount, orderCount, revenue, lowStockProducts] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
    }),
    prisma.product.findMany({
      where: { stock: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { stock: "asc" },
      take: 5,
    }),
  ]);

  const stats = [
    { label: "Produtos", value: productCount },
    { label: "Encomendas", value: orderCount },
    { label: "Total vendido", value: `€${(revenue._sum.total ?? 0).toFixed(2)}` },
    { label: "Stock baixo", value: lowStockProducts.length },
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
