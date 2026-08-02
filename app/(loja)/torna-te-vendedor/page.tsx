"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  vendorApplicationSchema,
  type VendorApplicationInput,
} from "@/lib/validations/vendor";
import { applyAsVendor } from "./actions";

export default function TornaTeVendedorPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VendorApplicationInput>({
    resolver: zodResolver(vendorApplicationSchema),
  });

  async function onSubmit(data: VendorApplicationInput) {
    setFormError(null);
    try {
      await applyAsVendor(data);
      setSubmitted(true);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Não foi possível enviar a candidatura."
      );
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <h1 className="font-heading text-3xl font-semibold">Candidatura enviada</h1>
        <p className="mt-3 text-muted-foreground">
          Obrigado pelo teu interesse! A tua candidatura vai ser analisada pela nossa equipa.
          Assim que for aprovada, vais poder entrar em{" "}
          <Link href="/fornecedor/login" className="text-primary hover:underline">
            /fornecedor/login
          </Link>{" "}
          com o email e password que indicaste.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold">Torna-te vendedor</h1>
      <p className="mt-3 text-muted-foreground">
        Já imaginaste vender os teus produtos e gerar uma renda extra?

Vendes produtos genuínos de São Tomé e Príncipe — comida, artesanato, tecidos ou outra coisa qualquer das ilhas? Junta-te à Neto STP e chega a clientes em todo o país. A tua candidatura será analisada pela nossa equipa antes de teres acesso ao painel de vendedor.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome / empresa</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register("password")} />
          <p className="text-xs text-muted-foreground">
            Esta será a tua password de acesso ao painel, assim que a candidatura for aprovada.
          </p>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" {...register("phone")} />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Conta-nos sobre os teus produtos (opcional)</Label>
          <Textarea id="message" rows={4} {...register("message")} />
        </div>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "A enviar..." : "Enviar candidatura"}
        </Button>
      </form>
    </div>
  );
}
