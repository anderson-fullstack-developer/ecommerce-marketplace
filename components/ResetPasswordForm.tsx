"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";

export function ResetPasswordForm({
  action,
  loginHref,
}: {
  action: (data: ResetPasswordInput) => Promise<void>;
  loginHref: string;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(data: ResetPasswordInput) {
    setFormError(null);
    try {
      await action(data);
      setDone(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível repor a password.");
    }
  }

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Password alterada com sucesso!
        </p>
        <Link href={loginHref} className="text-sm text-primary hover:underline">
          Entrar →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Nova password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "A guardar..." : "Repor password"}
      </Button>
    </form>
  );
}
