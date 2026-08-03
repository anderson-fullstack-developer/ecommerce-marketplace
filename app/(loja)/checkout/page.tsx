"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { calculateShipping, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { createCheckoutSession } from "./actions";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  async function handleCheckout() {
    setIsSubmitting(true);
    try {
      const { url } = await createCheckoutSession(
        items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
      );
      window.location.href = url;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível iniciar o pagamento."
      );
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-heading text-3xl font-semibold">Checkout</h1>
        <p className="mt-3 text-muted-foreground">O teu carrinho está vazio.</p>
        <Button render={<Link href="/loja" />} nativeButton={false} className="mt-6">
          Ver produtos
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold">Checkout</h1>
      <p className="mt-2 text-muted-foreground">
        Revê a tua encomenda antes de avançar para o pagamento seguro.
      </p>

      <ul className="mt-8 divide-y divide-border">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.quantity} × €{item.price.toFixed(2)}
              </p>
            </div>
            <p className="font-medium">€{(item.price * item.quantity).toFixed(2)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-1 border-t border-border pt-6 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Envio</span>
          <span>{shipping === 0 ? "Grátis" : `€${shipping.toFixed(2)}`}</span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-muted-foreground">
            Envio grátis a partir de €{FREE_SHIPPING_THRESHOLD.toFixed(2)}.
          </p>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border pt-4 text-lg font-semibold">
        <span>Total</span>
        <span>€{total.toFixed(2)}</span>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Morada de envio, contacto e pagamento são recolhidos de forma segura na página seguinte.
      </p>

      <Button
        size="lg"
        className="mt-6 w-full"
        onClick={handleCheckout}
        disabled={isSubmitting}
      >
        {isSubmitting ? "A abrir pagamento..." : "Finalizar compra"}
      </Button>
    </div>
  );
}
