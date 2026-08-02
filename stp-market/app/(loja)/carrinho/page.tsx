"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { cloudinaryResize } from "@/lib/cloudinary-url";

export default function CarrinhoPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-heading text-3xl font-semibold">Carrinho</h1>
        <p className="mt-3 text-muted-foreground">
          O teu carrinho está vazio.
        </p>
        <Button
          render={<Link href="/loja" />}
          nativeButton={false}
          className="mt-6"
        >
          Ver produtos
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold">Carrinho</h1>

      <ul className="mt-8 divide-y divide-border">
        {items.map((item) => (
          <li key={item.productId} className="flex gap-4 py-6">
            {/* eslint-disable-next-line @next/next/no-img-element -- imagens externas, sem Cloudinary ainda (Passo 7) */}
            <img
              src={cloudinaryResize(item.imageUrl, 160)}
              alt={item.name}
              loading="lazy"
              className="size-20 shrink-0 rounded-lg bg-muted object-cover"
            />

            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link
                  href={`/produto/${item.slug}`}
                  className="font-medium hover:text-primary"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  €{item.price.toFixed(2)} / unidade
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </Button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </Button>
                </div>

                <p className="w-20 text-right font-medium">
                  €{(item.price * item.quantity).toFixed(2)}
                </p>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.productId)}
                >
                  Remover
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col items-end gap-4 border-t border-border pt-6">
        <div className="flex w-full max-w-xs justify-between text-lg font-semibold sm:w-auto sm:min-w-64">
          <span>Total</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>
        <Button render={<Link href="/checkout" />} nativeButton={false} size="lg">
          Finalizar compra
        </Button>
      </div>
    </div>
  );
}
