"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveVendor, rejectVendor } from "@/app/admin/(painel)/fornecedores/actions";

export function VendorActions({ vendorId }: { vendorId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      try {
        await approveVendor(vendorId);
        toast.success("Fornecedor aprovado");
      } catch {
        toast.error("Não foi possível aprovar.");
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      try {
        await rejectVendor(vendorId);
        toast.success("Fornecedor rejeitado");
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
