import Link from "next/link";
import { getStripe } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { ClearCartOnMount } from "@/components/ClearCartOnMount";

export default async function SucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let email: string | null = null;
  let amountTotal: number | null = null;

  if (session_id) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      email = session.customer_details?.email ?? null;
      amountTotal = session.amount_total ? session.amount_total / 100 : null;
    } catch {
      // sessão inválida ou Stripe ainda não configurado — mostra confirmação genérica
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <ClearCartOnMount />
      <h1 className="font-heading text-3xl font-semibold">
        Obrigado pela tua compra!
      </h1>
      <p className="mt-3 text-muted-foreground">
        {email
          ? `Enviámos a confirmação para ${email}.`
          : "A tua encomenda foi recebida com sucesso."}
      </p>
      {amountTotal !== null && (
        <p className="mt-1 text-lg font-semibold text-primary">
          Total pago: €{amountTotal.toFixed(2)}
        </p>
      )}
      <Button render={<Link href="/loja" />} nativeButton={false} className="mt-8">
        Continuar a comprar
      </Button>
    </div>
  );
}
