"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requestWithdrawal } from "@/app/fornecedor/(painel)/saldo/actions";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  IBAN: "IBAN",
  MBWAY: "MB WAY",
};

export function WithdrawalRequestForm({ available }: { available: number }) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"IBAN" | "MBWAY">("IBAN");
  const [paymentDetails, setPaymentDetails] = useState("");
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
    if (!paymentDetails.trim()) {
      setError(
        paymentMethod === "IBAN"
          ? "Indica o IBAN."
          : "Indica o número de telemóvel do MB WAY."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await requestWithdrawal({ amount: value, paymentMethod, paymentDetails });
      toast.success("Pedido de levantamento enviado");
      setAmount("");
      setPaymentDetails("");
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
      <div className="flex flex-wrap items-end gap-3">
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

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Forma de pagamento</Label>
          <Select
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as "IBAN" | "MBWAY")}
          >
            <SelectTrigger id="paymentMethod" className="w-32">
              <SelectValue>{(value: string) => PAYMENT_METHOD_LABELS[value]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IBAN">IBAN</SelectItem>
              <SelectItem value="MBWAY">MB WAY</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentDetails">
            {paymentMethod === "IBAN" ? "IBAN" : "Nº de telemóvel (MB WAY)"}
          </Label>
          <Input
            id="paymentDetails"
            placeholder={paymentMethod === "IBAN" ? "PT50 0000 0000 0000 0000 0000 0" : "912 345 678"}
            value={paymentDetails}
            onChange={(event) => setPaymentDetails(event.target.value)}
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
