"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { vendorHelpMessageSchema, type VendorHelpMessageInput } from "@/lib/validations/vendor";
import { sendVendorHelpMessage } from "./actions";

export default function AjudaFornecedorPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VendorHelpMessageInput>({
    resolver: zodResolver(vendorHelpMessageSchema),
  });

  async function onSubmit(data: VendorHelpMessageInput) {
    setFormError(null);
    try {
      await sendVendorHelpMessage(data);
      setSubmitted(true);
      reset();
    } catch {
      setFormError("Não foi possível enviar a mensagem. Tenta novamente.");
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Ajuda</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Alguma dúvida ou problema como fornecedor? Envia uma mensagem diretamente ao admin.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contactar o admin</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <p className="text-sm text-muted-foreground">
              Mensagem enviada! O admin vai responder ao teu email assim que possível.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto</Label>
                <Input id="subject" {...register("subject")} />
                {errors.subject && (
                  <p className="text-sm text-destructive">{errors.subject.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea id="message" rows={5} {...register("message")} />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message.message}</p>
                )}
              </div>

              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "A enviar..." : "Enviar mensagem"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
