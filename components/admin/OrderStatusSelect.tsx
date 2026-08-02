"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus } from "@/app/admin/(painel)/encomendas/actions";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendente" },
  { value: "PAID", label: "Paga" },
  { value: "PROCESSING", label: "Em preparação" },
  { value: "SHIPPED", label: "Enviada" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELLED", label: "Cancelada" },
];

const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option.label])
);

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(status: string | null) {
    if (!status) return;
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, status);
        toast.success("Estado da encomenda atualizado");
      } catch {
        toast.error("Não foi possível atualizar o estado.");
      }
    });
  }

  return (
    <Select value={currentStatus} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-48">
        <SelectValue>
          {(value: string | null) => (value ? (STATUS_LABELS[value] ?? value) : "")}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
