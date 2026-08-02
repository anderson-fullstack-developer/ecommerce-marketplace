"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markWithdrawalPaid } from "@/app/admin/(painel)/fornecedores/actions";

export function WithdrawalActions({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleMarkPaid() {
    startTransition(async () => {
      try {
        await markWithdrawalPaid(requestId);
        toast.success("Levantamento marcado como pago");
      } catch {
        toast.error("Não foi possível marcar como pago.");
      }
    });
  }

  return (
    <Button size="sm" disabled={isPending} onClick={handleMarkPaid}>
      Marcar pago
    </Button>
  );
}
