"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendente" },
  { value: "PAID", label: "Pago" },
];

const STATUS_LABELS = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o.label]));

export function WithdrawalFilters({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();

  return (
    <Select
      value={defaultValue || "all"}
      onValueChange={(value) => {
        const params = new URLSearchParams();
        if (value && value !== "all") params.set("status", value);
        router.push(`/admin/levantamentos?${params.toString()}`);
      }}
    >
      <SelectTrigger className="w-48">
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
  );
}
