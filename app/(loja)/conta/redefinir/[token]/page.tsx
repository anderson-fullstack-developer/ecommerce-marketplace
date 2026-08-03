import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import type { ResetPasswordInput } from "@/lib/validations/auth";
import { resetCustomerPassword } from "./actions";

export default async function CustomerResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  async function action(data: ResetPasswordInput) {
    "use server";
    await resetCustomerPassword(token, data);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-background p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Escolher nova password</h1>
        </div>

        <ResetPasswordForm action={action} loginHref="/conta/login" />
      </div>
    </div>
  );
}
