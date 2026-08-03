import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/admin/SignOutButton";

export default async function ContaPage() {
  const session = await auth();

  const customer = await prisma.customer.findUniqueOrThrow({
    where: { id: session!.user.id },
    select: { name: true, email: true },
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold">Definições</h1>
        <SignOutButton callbackUrl="/" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Os teus dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Nome</p>
            <p className="font-medium">{customer.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{customer.email}</p>
          </div>
          <p className="border-t pt-3 text-xs text-muted-foreground">
            A edição dos teus dados está em manutenção — em breve vais poder atualizá-los aqui.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Encomendas</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            render={<Link href="/conta/encomendas" />}
            nativeButton={false}
            variant="outline"
            className="w-full"
          >
            Ver as minhas encomendas
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
