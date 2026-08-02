"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactMessageSchema, type ContactMessageInput } from "@/lib/validations/contact";
import { sendContactMessage } from "./actions";

export default function ContactoPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessageInput>({
    resolver: zodResolver(contactMessageSchema),
  });

  async function onSubmit(data: ContactMessageInput) {
    setFormError(null);
    try {
      await sendContactMessage(data);
      setSubmitted(true);
    } catch {
      setFormError("Não foi possível enviar a mensagem. Tenta novamente.");
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <h1 className="font-heading text-3xl font-semibold">Mensagem enviada</h1>
        <p className="mt-3 text-muted-foreground">
          Obrigado pelo contacto! Vamos responder-te o mais rápido possível.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold">Contacto</h1>
      <p className="mt-3 text-muted-foreground">
        Tens alguma dúvida ou sugestão? Envia-nos uma mensagem.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Mensagem</Label>
          <Textarea id="message" rows={5} {...register("message")} />
          {errors.message && (
            <p className="text-sm text-destructive">{errors.message.message}</p>
          )}
        </div>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "A enviar..." : "Enviar mensagem"}
        </Button>
      </form>
    </div>
  );
}
