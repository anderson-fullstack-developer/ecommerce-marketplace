"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type Filters = { q: string; status: string };

export function OrderFilters({ defaultValues }: { defaultValues: Filters }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValues.q);
  const [status, setStatus] = useState(defaultValues.status);

  function applyFilters(next: Partial<Filters>) {
    const values = { q, status, ...next };
    const params = new URLSearchParams();
    if (values.q) params.set("q", values.q);
    if (values.status) params.set("status", values.status);
    router.push(`/admin/encomendas?${params.toString()}`);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        applyFilters({});
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <Input
        placeholder="Pesquisar por cliente..."
        value={q}
        onChange={(event) => setQ(event.target.value)}
        className="sm:max-w-xs"
      />

      <Select
        value={status || "all"}
        onValueChange={(value) => {
          const next = !value || value === "all" ? "" : value;
          setStatus(next);
          applyFilters({ status: next });
        }}
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue>
            {(value: string | null) =>
              !value || value === "all" ? "Todos os estados" : (STATUS_LABELS[value] ?? value)
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os estados</SelectItem>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="submit">Pesquisar</Button>
    </form>
  );
}
