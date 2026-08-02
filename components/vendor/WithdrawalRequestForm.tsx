"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestWithdrawal } from "@/app/fornecedor/(painel)/saldo/actions";

export function WithdrawalRequestForm({ available }: { available: number }) {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const value = Number(amount);
    if (!value || value <= 0) {
      setError("Indica um valor válido.");
      return;
    }

    setIsSubmitting(true);
    try {
      await requestWithdrawal(value);
      toast.success("Pedido de levantamento enviado");
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o pedido.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (available <= 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ainda não tens saldo disponível para levantar.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor a levantar (€)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            max={available}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "A enviar..." : "Solicitar levantamento"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
