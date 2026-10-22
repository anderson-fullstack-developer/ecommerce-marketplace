"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { customerShippingSchema, type CustomerShippingInput } from "@/lib/validations/customer";
import { updateShippingDetails } from "@/app/(loja)/conta/actions";

export function ShippingDetailsForm({ defaultValues }: { defaultValues: CustomerShippingInput }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CustomerShippingInput>({
    resolver: zodResolver(customerShippingSchema),
    defaultValues,
  });

  async function onSubmit(data: CustomerShippingInput) {
    try {
      await updateShippingDetails(data);
      reset(data);
      toast.success("Morada e contacto guardados.");
    } catch {
      toast.error("Não foi possível guardar.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Telemóvel</Label>
        <Input id="phone" type="tel" autoComplete="tel" placeholder="+351 912 345 678" {...register("phone")} />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Morada</Label>
        <Input
          id="address"
          autoComplete="street-address"
          placeholder="Rua, número, andar"
          {...register("address")}
        />
        {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="postalCode">Código postal</Label>
          <Input
            id="postalCode"
            autoComplete="postal-code"
            placeholder="1000-001"
            {...register("postalCode")}
          />
          {errors.postalCode && (
            <p className="text-sm text-destructive">{errors.postalCode.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Localidade</Label>
          <Input id="city" autoComplete="address-level2" placeholder="Lisboa" {...register("city")} />
          {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">País</Label>
        <Input id="country" value="Portugal" disabled readOnly />
        <p className="text-xs text-muted-foreground">De momento só enviamos para Portugal.</p>
      </div>

      <Button type="submit" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
