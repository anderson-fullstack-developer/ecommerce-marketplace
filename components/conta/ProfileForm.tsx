"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { customerProfileSchema, type CustomerProfileInput } from "@/lib/validations/customer";
import { updateCustomerProfile } from "@/app/(loja)/conta/actions";

export function ProfileForm({
  defaultValues,
  email,
}: {
  defaultValues: CustomerProfileInput;
  email: string;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CustomerProfileInput>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues,
  });

  async function onSubmit(data: CustomerProfileInput) {
    try {
      await updateCustomerProfile(data);
      reset(data);
      toast.success("Dados atualizados.");
    } catch {
      toast.error("Não foi possível guardar os dados.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled readOnly />
        <p className="text-xs text-muted-foreground">
          O email identifica a tua conta e não pode ser alterado.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" autoComplete="name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telemóvel</Label>
        <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? "A guardar..." : "Guardar alterações"}
      </Button>
    </form>
  );
}
