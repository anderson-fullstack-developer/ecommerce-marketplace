"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { customerPasswordSchema, type CustomerPasswordInput } from "@/lib/validations/customer";
import { changeCustomerPassword } from "@/app/(loja)/conta/actions";

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CustomerPasswordInput>({
    resolver: zodResolver(customerPasswordSchema),
  });

  async function onSubmit(data: CustomerPasswordInput) {
    try {
      const result = await changeCustomerPassword(data);
      if (result.error) {
        setError("currentPassword", { message: result.error });
        return;
      }
      reset({ currentPassword: "", newPassword: "" });
      toast.success(hasPassword ? "Password alterada." : "Password definida.");
    } catch {
      toast.error("Não foi possível guardar a password.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!hasPassword && (
        <p className="text-sm text-muted-foreground">
          Entras com Google e ainda não tens password. Define uma para poderes entrar também com
          email e password.
        </p>
      )}

      {hasPassword && (
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Password atual</Label>
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            {...register("currentPassword")}
          />
          {errors.currentPassword && (
            <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="newPassword">{hasPassword ? "Nova password" : "Password"}</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          {...register("newPassword")}
        />
        {errors.newPassword && (
          <p className="text-sm text-destructive">{errors.newPassword.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "A guardar..." : hasPassword ? "Alterar password" : "Definir password"}
      </Button>
    </form>
  );
}
