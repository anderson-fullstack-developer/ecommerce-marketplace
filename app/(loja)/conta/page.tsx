import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { ProfileForm } from "@/components/conta/ProfileForm";
import { PasswordForm } from "@/components/conta/PasswordForm";

export default async function ContaPage() {
  const session = await auth();

  const customer = await prisma.customer.findUniqueOrThrow({
    where: { id: session!.user.id },
    select: { name: true, email: true, phone: true, password: true, googleId: true },
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
        <CardContent>
          <ProfileForm
            email={customer.email}
            defaultValues={{ name: customer.name, phone: customer.phone }}
          />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm hasPassword={!!customer.password} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Contas ligadas</CardTitle>
          <CardDescription>Formas de entrares na tua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          {customer.googleId ? (
            <p className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 text-primary" />
              Conta Google ligada
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Liga a conta Google com o email <strong>{customer.email}</strong> para entrares
                com um clique.
              </p>
              <GoogleSignInButton
                callbackUrl="/conta"
                label="Ligar conta Google"
                loginHint={customer.email}
              />
            </div>
          )}
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
