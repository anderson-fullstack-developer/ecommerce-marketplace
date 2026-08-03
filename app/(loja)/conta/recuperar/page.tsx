import Link from "next/link";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { requestCustomerPasswordReset } from "./actions";

export default function CustomerForgotPasswordPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-background p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Recuperar password</h1>
          <p className="text-sm text-muted-foreground">
            Insere o teu email e enviamos um link para escolheres uma nova password.
          </p>
        </div>

        <ForgotPasswordForm action={requestCustomerPasswordReset} />

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/conta/login" className="text-primary hover:underline">
            ← Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
