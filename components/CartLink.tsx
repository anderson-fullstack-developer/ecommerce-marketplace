"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/carrinho"
      className="relative flex items-center gap-1.5 hover:text-primary"
      aria-label="Carrinho"
    >
      <ShoppingBag className="size-5" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
