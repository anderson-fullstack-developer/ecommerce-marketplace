import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/admin/SignOutButton";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const [pendingProducts, newOrders, pendingApplications, pendingWithdrawals] =
    await Promise.all([
      prisma.product.count({ where: { approvalStatus: "PENDING" } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.vendor.count({ where: { status: "PENDING" } }),
      prisma.withdrawalRequest.count({ where: { status: "PENDING" } }),
    ]);

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/produtos", label: "Produtos", badge: pendingProducts },
    { href: "/admin/categorias", label: "Categorias" },
    { href: "/admin/encomendas", label: "Encomendas", badge: newOrders },
    { href: "/admin/fornecedores", label: "Fornecedores" },
    { href: "/admin/candidaturas", label: "Candidaturas", badge: pendingApplications },
    { href: "/admin/levantamentos", label: "Levantamentos", badge: pendingWithdrawals },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r bg-muted/30 p-4">
        <div className="mb-6 flex items-center gap-2">
          <Image
            src="/brand/logo.png"
            alt="Neto STP"
            width={48}
            height={32}
            className="h-8 w-12 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold">Neto STP</p>
            <p className="text-xs text-muted-foreground">Painel Admin</p>
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              <span>{item.label}</span>
              {!!item.badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
          <SignOutButton />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
