import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { value: "PENDING", label: "Pendente" },
  { value: "PAID", label: "Paga" },
  { value: "PROCESSING", label: "Em preparação" },
  { value: "SHIPPED", label: "Enviada" },
  { value: "DELIVERED", label: "Entregue" },
];

export function OrderStatusTimeline({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
        Encomenda cancelada
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((step) => step.value === status);

  return (
    <ol className="flex items-start">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === STEPS.length - 1;

        return (
          <li key={step.value} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-background text-primary",
                  !isDone && !isCurrent && "border-border bg-background text-muted-foreground"
                )}
              >
                {isDone ? <CheckIcon className="size-3.5" /> : index + 1}
              </div>
              <span
                className={cn(
                  "w-20 text-center text-xs leading-tight",
                  isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1 -translate-y-3.5",
                  isDone ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
