"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function WelcomeModalInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("bemvindo") === "1") {
      setOpen(true);
    }
  }, [searchParams]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      const params = new URLSearchParams(searchParams);
      params.delete("bemvindo");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bem-vindo à Neto STP! 🎉</DialogTitle>
          <DialogDescription>
            A tua conta foi criada com sucesso. Já podes explorar produtos de São Tomé e
            Príncipe — comida, artesanato, tecidos e muito mais — e acompanhar as tuas
            encomendas a qualquer momento em &quot;As minhas encomendas&quot;.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => handleOpenChange(false)}>Começar a explorar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WelcomeModal() {
  return (
    <Suspense>
      <WelcomeModalInner />
    </Suspense>
  );
}
