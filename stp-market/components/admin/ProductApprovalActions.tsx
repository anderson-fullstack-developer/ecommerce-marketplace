"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveProduct, rejectProduct } from "@/app/admin/(painel)/produtos/actions";

export function ProductApprovalActions({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      try {
        await approveProduct(productId);
        toast.success("Produto aprovado");
      } catch {
        toast.error("Não foi possível aprovar.");
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      try {
        await rejectProduct(productId);
        toast.success("Produto rejeitado");
      } catch {
        toast.error("Não foi possível rejeitar.");
      }
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" disabled={isPending} onClick={handleApprove}>
        Aprovar
      </Button>
      <Button size="sm" variant="destructive" disabled={isPending} onClick={handleReject}>
        Rejeitar
      </Button>
    </div>
  );
}
