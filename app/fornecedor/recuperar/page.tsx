import Link from "next/link";
import Image from "next/image";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { requestVendorPasswordReset } from "./actions";

export default function VendorForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-background p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <Image
            src="/brand/logo.png"
            alt="Neto STP"
            width={96}
            height={64}
            className="mx-auto h-16 w-24 rounded-full object-cover"
          />
          <h1 className="text-2xl font-semibold">Recuperar password</h1>
          <p className="text-sm text-muted-foreground">
            Insere o teu email e enviamos um link para escolheres uma nova password.
          </p>
        </div>

        <ForgotPasswordForm action={requestVendorPasswordReset} />

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/fornecedor/login" className="text-primary hover:underline">
            ← Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
