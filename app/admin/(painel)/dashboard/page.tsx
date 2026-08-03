import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/lib/generated/prisma/enums";
import {
  Package,
  ShoppingBag,
  Euro,
  TriangleAlert,
  Store,
  Percent,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

  const hasLowStock = lowStockProducts.length > 0;

  const stats = [
    { label: "Produtos", value: String(productCount), icon: Package, tone: "neutral" as const },
    { label: "Encomendas", value: String(orderCount), icon: ShoppingBag, tone: "neutral" as const },
    {
      label: "Total vendido",
      value: `€${(revenue._sum.total ?? 0).toFixed(2)}`,
      icon: Euro,
      tone: "neutral" as const,
    },
    {
      label: "Stock baixo",
      value: String(lowStockProducts.length),
      icon: TriangleAlert,
      tone: hasLowStock ? ("warning" as const) : ("neutral" as const),
    },
  ];

  const earningsStats = [
    {
      label: "Vendas próprias",
      description: "Produtos sem fornecedor associado",
      value: `€${adminOwnRevenue.toFixed(2)}`,
      icon: Store,
      highlight: false,
    },
    {
      label: "Comissão de fornecedores",
      description: "A tua parte nas vendas dos fornecedores",
      value: `€${vendorCommissionRevenue.toFixed(2)}`,
      icon: Percent,
      highlight: false,
    },
    {
      label: "Total ganho pelo admin",
      description: "Vendas próprias + comissão",
      value: `€${totalAdminEarnings.toFixed(2)}`,
      icon: Wallet,
      highlight: true,
    },
  ];

  const toneStyles = {
    neutral: "bg-muted text-muted-foreground",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visão geral da loja Neto STP.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 py-1">
              <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", toneStyles[stat.tone])}>
                <stat.icon className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold leading-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold">O que o admin ganha</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Receita separada entre as tuas vendas próprias e a comissão sobre vendas de fornecedores.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {earningsStats.map((stat) => (
            <Card
              key={stat.label}
              className={cn(stat.highlight && "border-primary bg-primary/5 ring-primary/20")}
            >
              <CardContent className="flex items-start gap-4 py-1">
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full",
                    stat.highlight ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <stat.icon className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                  <p className="mt-1 text-2xl font-semibold leading-tight">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TriangleAlert className={cn("size-4", hasLowStock ? "text-amber-600" : "text-muted-foreground")} />
            <p className="font-heading text-base font-medium">Produtos com stock baixo</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Stock igual ou inferior a {LOW_STOCK_THRESHOLD} unidades
          </p>
        </CardHeader>
        <CardContent>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum produto com stock baixo.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {lowStockProducts.map((product) => (
                <li key={product.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                  <span>{product.name}</span>
                  <span className="font-medium text-amber-700 dark:text-amber-400">
                    {product.stock} {product.stock === 1 ? "unidade" : "unidades"}
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
