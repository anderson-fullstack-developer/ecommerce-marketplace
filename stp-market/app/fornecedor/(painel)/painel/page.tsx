import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getVendorBalance } from "@/lib/vendor-balance";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function VendorDashboardPage() {
  const session = await auth();
  const vendorId = session!.user.id;

  const [productCount, balance] = await Promise.all([
    prisma.product.count({ where: { vendorId } }),
    getVendorBalance(vendorId),
  ]);

  const stats = [
    { label: "Produtos publicados", value: productCount },
    { label: "Total vendido (bruto)", value: `€${balance.totalEarned.toFixed(2)}` },
    { label: "Saldo disponível", value: `€${balance.available.toFixed(2)}` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Painel</h1>
        <Button
          variant="outline"
          render={<Link href={`/loja?vendedor=${vendorId}`} target="_blank" />}
          nativeButton={false}
        >
          Ver a minha loja
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
