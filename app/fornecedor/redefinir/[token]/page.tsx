import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import type { ResetPasswordInput } from "@/lib/validations/auth";
import { resetVendorPassword } from "./actions";

export default async function VendorResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  async function action(data: ResetPasswordInput) {
    "use server";
    await resetVendorPassword(token, data);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-background p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Escolher nova password</h1>
        </div>

        <ResetPasswordForm action={action} loginHref="/fornecedor/login" />
      </div>
    </div>
  );
}
